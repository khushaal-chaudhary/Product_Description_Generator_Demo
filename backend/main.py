from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM, BlipProcessor, BlipForConditionalGeneration
import torch
from PIL import Image
import io
import os

# Get token from environment
hf_token = os.environ.get("HUGGING_FACE_HUB_TOKEN")

print(f"DEBUG: Token available: {hf_token is not None}")  # Debug line
print(f"DEBUG: Token length: {len(hf_token) if hf_token else 0}")  # Debug line

# --- AI Model Loading ---
# This happens once when the server starts up.

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

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Product Description Generator API!"}

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

