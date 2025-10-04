FROM python:3.11-slim

WORKDIR /app

# Accept HF_TOKEN as build argument and set as environment variable
ARG HF_TOKEN
ENV HUGGING_FACE_HUB_TOKEN=$HF_TOKEN

# Copy requirements first
COPY requirements.txt .

# Install torch (CPU version to save space)
RUN pip install torch --index-url https://download.pytorch.org/whl/cpu

# Install other dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]