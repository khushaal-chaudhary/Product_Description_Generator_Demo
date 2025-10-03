# Step 1: Use an official Python runtime as a parent image
FROM python:3.11-slim

# Step 2: Set the working directory in the container
WORKDIR /app

# Create a non-root user to run the application
RUN useradd -m -u 1000 user
USER user

# Create a cache directory and set it as the HF cache
ENV HOME=/home/user
ENV HUGGING_FACE_HUB_CACHE=$HOME/.cache
RUN mkdir -p $HUGGING_FACE_HUB_CACHE

# --- NEW LINE TO FIX THE ERROR ---
# Add the user's local bin directory to the system's PATH
ENV PATH=$HOME/.local/bin:$PATH

# Step 3: Copy the requirements file into the container
COPY --chown=user:user requirements.txt .

# Step 4: Install the packages
RUN pip install --no-cache-dir -r requirements.txt

# Step 5: Copy the rest of the application's code into the container
COPY --chown=user:user . .

# Step 6: Expose the port the app runs on
EXPOSE 8000

# Step 7: Define the command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]