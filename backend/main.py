from fastapi import FastAPI

# Create an instance of the FastAPI class
app = FastAPI()
    
# Define a route for the root URL ("/")
@app.get("/")
def read_root():
    return {"message": "Welcome to the Product Description Generator API!"}