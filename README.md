# Product Description Generator - MLOps Pipeline

[![CI/CD Pipeline](https://github.com/khushaal-chaudhary/product_generator/actions/workflows/main.yml/badge.svg)](https://github.com/khushaal-chaudhary/product_generator/actions/workflows/main.yml)


An end-to-end MLOps project demonstrating CI/CD, model versioning, automated testing, and monitoring for an AI-powered product description generator.

## Architecture

```
┌─────────────────┐
│   Developer     │
│   Commits Code  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         GitHub Actions CI/CD            │
│  ┌───────────┐      ┌────────────────┐  │
│  │   Tests   │ ───► │   Deployment   │  │
│  │  (pytest) │      │  (HF Spaces)   │  │
│  └───────────┘      └────────────────┘  │
│         │                    │          │
│         ▼                    ▼          │
│  ┌──────────────┐   ┌─────────────────┐ │
│  │ DVC Version  │   │  Model Metadata │ │
│  │   Tracking   │   │    Injection    │ │
│  └──────────────┘   └─────────────────┘ │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│      Hugging Face Space (Production)    │
│  ┌────────────┐       ┌──────────────┐  │
│  │  FastAPI   │◄─────►│   AI Models  │  │
│  │  Backend   │       │  (7GB total) │  │
│  └──────┬─────┘       └──────────────┘  │
│         │                               │
│         ▼                               │
│  ┌──────────────────────────────────┐   │
│  │  Prometheus Metrics (/metrics)   │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Features

### Application Features
- **Text-based generation**: Generate descriptions from product attributes
- **Image-based generation**: Generate descriptions from product images
- **RESTful API**: Built with FastAPI
- **Input validation**: Pydantic models with custom validators

### MLOps Features
- **Automated Testing**: pytest suite with 12+ test cases
- **CI/CD Pipeline**: GitHub Actions workflow
- **Model Versioning**: DVC integration with Google Drive
- **Monitoring**: Prometheus metrics for observability
- **Health Checks**: `/health` endpoint for service monitoring
- **Documentation**: Auto-generated OpenAPI docs at `/docs`

## Models

| Model | Purpose | Size | Source |
|-------|---------|------|--------|
| BLIP Image Captioning | Converts images to text descriptions | ~2GB | Salesforce/blip-image-captioning-large |
| Gemma 2B Instruct | Generates product descriptions | ~5GB | google/gemma-2b-it (gated) |

Models are version-controlled with DVC and downloaded at runtime from HuggingFace Hub.

## Tech Stack

**Backend**: FastAPI, Uvicorn, Python 3.11+  
**ML/AI**: PyTorch (CPU), Transformers, Pillow  
**MLOps**: DVC, pytest, Prometheus  
**CI/CD**: GitHub Actions  
**Deployment**: Hugging Face Spaces (Docker)  
**Version Control**: Git, DVC

## Project Structure

```
product_generator/
├── .github/
│   └── workflows/
│       └── main.yml              # CI/CD pipeline
├── backend/
│   ├── tests/
│   │   ├── test_api.py          # API tests
│   │   └── test_models.py       # Model tests
│   ├── main.py                  # FastAPI application
│   ├── Dockerfile               # Container definition
│   ├── requirements.txt         # Python dependencies
│   ├── models.dvc               # DVC model tracking
│   └── MODEL_VERSIONS.md        # Model documentation
├── .dvcignore
├── .gitignore
└── README.md                    # This file
```

## CI/CD Pipeline

### Workflow Stages

1. **Test Stage**
   - Install dependencies
   - Run pytest suite
   - Log DVC model versions
   - Only proceeds if all tests pass

2. **Deploy Stage** (main branch only)
   - Extract DVC hash for version tracking
   - Clone HF Space repository
   - Copy application files
   - Inject model metadata
   - Push to production

### Triggers
- Push to `main` branch → Full test + deploy
- Pull requests → Test only
- Manual dispatch → Available

### Security Scanning
The pipeline includes automated security checks:
- **Safety**: Scans for known vulnerabilities in dependencies
- **Bandit**: Static analysis for security issues in Python code
- Runs before tests to catch security issues early

## Monitoring

### Available Metrics (via `/metrics`)

```
# Request metrics
api_requests_total{method, endpoint, status}
api_request_duration_seconds{method, endpoint}
active_requests

# Generation metrics
generation_requests_total{type}  # type: text or image
```

### Endpoints

- `GET /` - API information and model metadata
- `GET /health` - Health check with model status
- `GET /metrics` - Prometheus metrics
- `GET /docs` - Interactive API documentation
- `POST /generate-description/` - Generate from text
- `POST /generate-from-image/` - Generate from image

## Testing

```bash
# Run all tests
cd backend
pytest tests/ -v

# Run specific test file
pytest tests/test_api.py -v

# Run with coverage
pytest tests/ --cov=main --cov-report=html
```

## Local Development

### Prerequisites
- Python 3.11+
- Git
- DVC (optional, for model versioning)

### Setup

```bash
# Clone repository
git clone https://github.com/khushaal-chaudhary/Product_Description_Generator_Demo.git
cd product_generator

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Set environment variable (for Gemma model)
export HF_TOKEN=your_huggingface_token

# Run application
uvicorn main:app --reload
```

Visit http://localhost:8000/docs for interactive API documentation.

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `HF_TOKEN` | HuggingFace API token for Gemma model access | Yes |
| `HF_HOME` | Cache directory for models | No (default: /app/.cache) |

## Model Versioning with DVC

```bash
# Pull models from remote storage
dvc pull

# Update models
dvc add backend/models

# Push to remote
dvc push

# Commit DVC metadata
git add backend/models.dvc
git commit -m "Update models"
```

## Design Decisions

### Why Runtime Model Downloads?
- **Cost-effective**: Free tier deployment without storage limits
- **Flexibility**: Easy model updates via DVC
- **Trade-off**: Slower cold starts (~5-10 min) vs. persistent storage costs

### Why DVC for Version Control?
- Reproducibility: Track exact model versions
- Collaboration: Team members can sync models
- Rollback: Git history enables model version rollback

### Why Prometheus Metrics?
- Industry standard monitoring format
- Integration with Grafana/other tools
- Request tracking and performance monitoring

## Future Enhancements

- [ ] Add staging environment
- [ ] Implement model A/B testing
- [ ] Add response caching
- [ ] Create Grafana dashboard for metrics
- [ ] Add batch processing endpoint
- [ ] Implement rate limiting
- [ ] Add model performance benchmarks

## License

MIT License - see LICENSE file for details

## Author

Khushaal Chaudhary - [GitHub](https://github.com/khushaal-chaudhary) | [LinkedIn](https://linkedin.com/in/khushaal-chaudhary) | [About Me](khushaalchaudhary.com)

---

**Live Demo**: [https://huggingface.co/spaces/Khushaal/product-description-generator](https://huggingface.co/spaces/Khushaal/product-description-generator)