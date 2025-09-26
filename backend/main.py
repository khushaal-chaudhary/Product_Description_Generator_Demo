from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create an instance of the FastAPI class
app = FastAPI()

# Define the origins that are allowed to make requests
# In a production environment, you would restrict this to your actual frontend domain
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Add the CORS middleware to your application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (GET, POST, etc.)
    allow_headers=["*"], # Allow all headers
)

# Define a route for the root URL ("/")
@app.get("/")
def read_root():
    return {"message": "Welcome to the Product Description Generator API!"}