from fastapi.testclient import TestClient
import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import unittest.mock as mock

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

def test_root_includes_model_info():
    """Test that root endpoint includes model metadata"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "model_info" in data
    assert data["model_info"]["vision_model"] == "Salesforce/blip-image-captioning-large"
    assert data["model_info"]["dvc_tracked"] == True

def test_health_endpoint():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_metadata" in data
    assert data["model_metadata"]["dvc_tracked"] == True

def test_metrics_endpoint():
    """Test that metrics endpoint returns Prometheus format"""
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "text/plain" in response.headers["content-type"]
    # Check for some expected metrics
    assert b"api_requests_total" in response.content or b"# HELP" in response.content

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
    assert response.status_code == 422

def test_generate_description_attributes_too_short():
    """Test that attributes must be at least 5 characters"""
    response = client.post(
        "/generate-description/",
        json={"attributes": "abc"}
    )
    assert response.status_code == 422

def test_generate_description_attributes_too_long():
    """Test that attributes must be less than 500 characters"""
    long_text = "a" * 501
    response = client.post(
        "/generate-description/",
        json={"attributes": long_text}
    )
    assert response.status_code == 422

def test_health_check():
    """Test that the API is responsive"""
    response = client.get("/")
    assert response.status_code == 200