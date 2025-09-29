from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# --- AI Model Loading ---
# We are upgrading to a much more powerful and creative model.
# Note: This model is larger and will require a more significant download the first time.
model_name = "microsoft/phi-2"
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    model_name, 
    torch_dtype="auto", 
    trust_remote_code=True
)
# --- End AI Model Loading ---

# Define the data model for the request body
class GenerateRequest(BaseModel):
    attributes: str
    keywords: str | None = None # Keywords are optional

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173", # Corrected the IP address
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

# Updated endpoint that now uses the AI model
@app.post("/generate-description/")
def generate_description(request: GenerateRequest):
    # --- PROMPT ENGINEERING for Phi-2 ---
    # This model uses a specific "Instruct/Output" format.
    prompt = f"""Instruct: Create a compelling e-commerce product description.
- Product Attributes: {request.attributes}
- SEO Keywords to include: {request.keywords if request.keywords else 'None'}
Output:
"""

    print("---")
    print(f"DEBUG: Prompt sent to model:\n{prompt}")
    print("---")

    # Generate the description using the new model
    # Note: We now pass the attention_mask and have removed the unused early_stopping flag.
    inputs = tokenizer(prompt, return_tensors="pt") # No longer need return_attention_mask=False
    outputs = model.generate(**inputs, max_length=128, no_repeat_ngram_size=2) # Removed early_stopping
    generated_text = tokenizer.batch_decode(outputs)[0]

    # Clean the output to only get the generated description
    # The model will output our prompt as well, so we need to remove it.
    cleaned_text = generated_text.split("Output:")[1].strip()
    
    return {"description": cleaned_text}

