from datetime import datetime, timezone
import os
import time
from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, field_validator
from transformers import AutoTokenizer, AutoModelForCausalLM, BlipProcessor, BlipForConditionalGeneration
import torch
from PIL import Image
import io
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST


# Prometheus metrics
REQUEST_COUNT = Counter(
    'api_requests_total', 
    'Total API requests',
    ['method', 'endpoint', 'status']
)
REQUEST_DURATION = Histogram(
    'api_request_duration_seconds',
    'Request duration in seconds',
    ['method', 'endpoint']
)
GENERATION_COUNT = Counter(
    'generation_requests_total',
    'Total generation requests',
    ['type']  # 'text' or 'image'
)
ACTIVE_REQUESTS = Gauge(
    'active_requests',
    'Number of requests currently being processed'
)

# Debug: Print ALL environment variables related to HF
print("=" * 50)
print("ENVIRONMENT VARIABLE DEBUG:")
print(f"HUGGING_FACE_HUB_TOKEN: {os.environ.get('HUGGING_FACE_HUB_TOKEN', 'NOT SET')}")
print(f"HF_TOKEN: {os.environ.get('HF_TOKEN', 'NOT SET')}")
print(f"HF_HOME: {os.environ.get('HF_HOME', 'NOT SET')}")
print(f"All env vars starting with HF:")
for key, value in os.environ.items():
    if key.startswith('HF') or 'HUGGING' in key or 'TOKEN' in key:
        print(f"  {key}: {value[:10]}... (length: {len(value)})" if value else f"  {key}: EMPTY")
print("=" * 50)

# Try multiple possible env var names
hf_token = (
    os.environ.get("HUGGING_FACE_HUB_TOKEN") or 
    os.environ.get("HF_TOKEN") or 
    os.environ.get("HUGGINGFACE_TOKEN") or
    None
)

print(f"Final token to use: {'Found' if hf_token else 'NOT FOUND'}")
print(f"Token length: {len(hf_token) if hf_token else 0}")

# --- AI Model Loading ---
# This happens once when the server starts up.

# Model metadata for tracking
MODEL_METADATA = {
    "vision_model": "Salesforce/blip-image-captioning-large",
    "language_model": "google/gemma-2b-it",
    "deployed_at": datetime.now(timezone.utc).isoformat(),
    "dvc_tracked": True,
    "deployment_method": "runtime_download"
}

# Model 1: Vision Model for Image Captioning
vision_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
vision_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large")

# Model 2: Language Model - UPGRADED to a more reliable instruction-tuned model
lang_model_name = "google/gemma-2b-it"
lang_tokenizer = AutoTokenizer.from_pretrained(lang_model_name, 
                                               token=hf_token)  # Pass the token here)
lang_model = AutoModelForCausalLM.from_pretrained(
    lang_model_name,
    torch_dtype=torch.bfloat16, # Recommended for Gemma models
    token=hf_token  # And here
)
# --- End AI Model Loading ---

class GenerateRequest(BaseModel):
    attributes: str
    keywords: str | None = None
    
    @field_validator('attributes')
    @classmethod
    def validate_attributes(cls, v):
        if len(v.strip()) < 5:
            raise ValueError('Attributes must be at least 5 characters')
        if len(v.strip()) > 500:
            raise ValueError('Attributes must be less than 500 characters')
        return v.strip()

app = FastAPI(
    title="Product Description Generator",
    description="AI-powered product description generator with MLOps pipeline",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://product-description-generator-demo.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Monitoring middleware
@app.middleware("http")
async def monitor_requests(request: Request, call_next):
    ACTIVE_REQUESTS.inc()
    start_time = time.time()
    
    try:
        response = await call_next(request)
        duration = time.time() - start_time
        
        REQUEST_DURATION.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)
        
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()
        
        return response
    finally:
        ACTIVE_REQUESTS.dec()

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Product Description Generator API!",
        "model_info": MODEL_METADATA
    }

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "models_loaded": True,
        "model_metadata": MODEL_METADATA
    }

@app.get("/metrics")
def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.post("/generate-description/")
def generate_description(request: GenerateRequest):
    # Gemma uses a specific chat template format with a more forceful prompt
    input_text = (
        f"You are an expert e-commerce copywriter. Your task is to write a compelling product description in a single paragraph.\n"
        f"The description should be between 80 and 120 words.\n"
        f"Do not use any Markdown formatting (no hashtags, asterisks, etc.).\n"
        f"Do not invent brand names.\n\n"
        f"--- DETAILS ---\n"
        f"Product Attributes: {request.attributes}\n"
        f"IMPORTANT: You MUST naturally include the following keywords in the description: {request.keywords if request.keywords else 'None'}"
    )
    chat = [{"role": "user", "content": input_text}]
    prompt = lang_tokenizer.apply_chat_template(chat, tokenize=False, add_generation_prompt=True)
    
    print(f"DEBUG (Text): Prompt sent to model:\n{prompt}")
    inputs = lang_tokenizer.encode(prompt, add_special_tokens=False, return_tensors="pt")
    # Use max_new_tokens to ensure a complete description
    outputs = lang_model.generate(input_ids=inputs, max_new_tokens=200)
    generated_text = lang_tokenizer.decode(outputs[0])
    
    # Clean Gemma's output
    cleaned_text = generated_text.split("<start_of_turn>model\n")[-1].strip()
    cleaned_text = cleaned_text.replace("<eos>", "").strip()
    return {"description": cleaned_text}

@app.post("/generate-from-image/")
async def generate_from_image(
    keywords: str = Form(""), 
    image: UploadFile = File(...)
):
    # Step 1: Get base caption from vision model
    image_data = await image.read()
    pil_image = Image.open(io.BytesIO(image_data)).convert("RGB")
    
    vision_inputs = vision_processor(pil_image, return_tensors="pt")
    vision_outputs = vision_model.generate(**vision_inputs, max_length=50)
    base_caption = vision_processor.decode(vision_outputs[0], skip_special_tokens=True)
    print(f"DEBUG (Image): Base caption from vision model: {base_caption}")

    # Step 2: Use the caption as input for our powerful language model with a better prompt.
    input_text = (
        f"You are an expert e-commerce copywriter. Your task is to write a compelling product description in a single paragraph.\n"
        f"The description should be between 80 and 120 words.\n"
        f"Do not use any Markdown formatting (no hashtags, asterisks, etc.).\n"
        f"Do not invent brand names.\n\n"
        f"--- DETAILS ---\n"
        f"Visual Analysis: A product described as '{base_caption}'.\n"
        f"IMPORTANT: You MUST naturally include the following keywords in the description: {keywords if keywords else 'None'}"
    )
    chat = [{"role": "user", "content": input_text}]
    prompt = lang_tokenizer.apply_chat_template(chat, tokenize=False, add_generation_prompt=True)

    print(f"DEBUG (Image): Prompt sent to language model:\n{prompt}")
    
    inputs = lang_tokenizer.encode(prompt, add_special_tokens=False, return_tensors="pt")
    # Use max_new_tokens to ensure a complete description
    outputs = lang_model.generate(input_ids=inputs, max_new_tokens=200)
    generated_text = lang_tokenizer.decode(outputs[0])

    # --- Final, Simplified Output Cleaning for Gemma ---
    # Gemma's structured output makes cleaning much easier and more reliable.
    cleaned_text = generated_text.split("<start_of_turn>model\n")[-1].strip()
    cleaned_text = cleaned_text.replace("<eos>", "").strip()

    return {"description": cleaned_text}

