from fastapi.testclient import TestClient
import pytest
import sys
import os

# Add parent directory to path so we can import main
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Mock the model loading to avoid downloading 7GB during tests
import unittest.mock as mock

# Mock the transformers models
mock_processor = mock.MagicMock()
mock_model = mock.MagicMock()

with mock.patch('transformers.BlipProcessor.from_pretrained', return_value=mock_processor), \
     mock.patch('transformers.BlipForConditionalGeneration.from_pretrained', return_value=mock_model), \
     mock.patch('transformers.AutoTokenizer.from_pretrained', return_value=mock.MagicMock()), \
     mock.patch('transformers.AutoModelForCausalLM.from_pretrained', return_value=mock_model):
    from main import app

client = TestClient(app)

def test_root_endpoint():
    """Test the root endpoint returns welcome message"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert "Product Description Generator" in response.json()["message"]

def test_generate_description_with_valid_input():
    """Test text-based generation with valid input"""
    response = client.post(
        "/generate-description/",
        json={
            "attributes": "blue cotton t-shirt, size medium",
            "keywords": "comfortable casual"
        }
    )
    assert response.status_code == 200
    assert "description" in response.json()

def test_generate_description_without_keywords():
    """Test text-based generation without keywords"""
    response = client.post(
        "/generate-description/",
        json={
            "attributes": "red leather jacket"
        }
    )
    assert response.status_code == 200
    assert "description" in response.json()

def test_generate_description_missing_attributes():
    """Test that missing attributes returns 422"""
    response = client.post(
        "/generate-description/",
        json={"keywords": "only keywords"}
    )
    assert response.status_code == 422  # Validation error

def test_health_check():
    """Test that the API is responsive"""
    response = client.get("/")
    assert response.status_code == 200