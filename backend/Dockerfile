# Step 1: Use an official Python runtime as a parent image
FROM python:3.11-slim

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy the requirements file into the container
COPY requirements.txt .

# Step 4: Install CPU-only torch first to save space
RUN pip install torch --index-url https://download.pytorch.org/whl/cpu

# Step 5: Install the rest of the packages
RUN pip install --no-cache-dir -r requirements.txt

# Step 6: Copy the rest of the application's code into the container
COPY . .

# Step 7: Expose the port the app runs on
EXPOSE 8000

# Step 8: Define the command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

