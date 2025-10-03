# Step 1: Use an official Python runtime as a parent image
FROM python:3.11-slim

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Set up build arguments and environment variables
# This allows us to securely pass the HF_TOKEN from the Space's secrets
ARG HF_TOKEN
ENV HUGGING_FACE_HUB_TOKEN=$HF_TOKEN

# Create a non-root user to run the application
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user
ENV PATH=$HOME/.local/bin:$PATH

# Step 4: Install huggingface_hub and log in using the secret token
# This authorizes the download of gated models.
RUN pip install huggingface_hub && huggingface-cli login --token $HF_TOKEN

# Step 5: Copy and install requirements
COPY --chown=user:user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Step 6: Copy the rest of the application's code
COPY --chown=user:user . .

# Step 7: Expose the port the app runs on
EXPOSE 8000

# Step 8: Define the command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

