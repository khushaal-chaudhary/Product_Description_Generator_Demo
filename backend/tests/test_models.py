import pytest

def test_model_imports():
    """Test that required libraries can be imported"""
    try:
        import torch
        import transformers
        from PIL import Image
        assert True
    except ImportError as e:
        pytest.fail(f"Failed to import required library: {e}")

def test_torch_cpu_available():
    """Test that PyTorch CPU is available"""
    import torch
    assert torch.cuda.is_available() == False  # We're using CPU-only
    # Just verify torch works
    tensor = torch.tensor([1, 2, 3])
    assert tensor.sum().item() == 6