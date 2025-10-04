FROM python:3.11-slim

WORKDIR /app

# Accept HF_TOKEN as build argument
ARG HF_TOKEN
ENV HUGGING_FACE_HUB_TOKEN=$HF_TOKEN

# Set cache directories to writable locations
ENV HF_HOME=/app/.cache
ENV TRANSFORMERS_CACHE=/app/.cache/transformers
ENV HF_HUB_CACHE=/app/.cache/huggingface

# Create cache directories with proper permissions
RUN mkdir -p /app/.cache/transformers /app/.cache/huggingface && \
    chmod -R 777 /app/.cache

# Copy requirements
COPY requirements.txt .

# Install torch (CPU version)
RUN pip install torch --index-url https://download.pytorch.org/whl/cpu

# Install other dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]