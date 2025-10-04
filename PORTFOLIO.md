# Portfolio Project: Product Description Generator MLOps Pipeline

## Quick Stats
- **Lines of Code**: ~200 (application) + ~100 (tests) + ~150 (CI/CD)
- **Test Coverage**: 12+ test cases
- **Technologies**: 10+ (FastAPI, PyTorch, DVC, Docker, GitHub Actions, etc.)
- **Deployment**: Automated CI/CD to production
- **Development Time**: 1 Week

## Key Talking Points for Interviews

### 1. MLOps Architecture Decision
**Question**: "Why did you choose runtime model downloads instead of bundling models?"

**Answer**: "I evaluated the trade-offs between storage costs and cold start time. For a portfolio project on the free tier, runtime downloads (~5-10 min first start) were more cost-effective than paying for 7GB of persistent storage. In production, I'd recommend evaluating based on SLA requirements and cost constraints. This demonstrates understanding of architectural trade-offs."

### 2. Testing Strategy
**Question**: "How did you approach testing for ML models?"

**Answer**: "I implemented a two-layer testing strategy:
- Unit tests for API endpoints with mocked models to avoid downloading 7GB during CI
- Integration tests could be added for model accuracy
- Security scanning with Bandit and Safety for vulnerabilities
This keeps CI fast (~2-3 minutes) while ensuring code quality."

### 3. Model Versioning
**Question**: "How do you track model versions?"

**Answer**: "I use DVC (Data Version Control) with Google Drive as remote storage. The models.dvc file in git tracks the exact hash of the models, enabling:
- Reproducibility: Anyone can pull the exact model version
- Collaboration: Team members stay in sync
- Rollback: Git history allows reverting to previous model versions
- Cost efficiency: Models stored separately from code repository"

### 4. CI/CD Pipeline
**Question**: "Walk me through your deployment process"

**Answer**: "Three-stage pipeline:
1. Security scan (Safety + Bandit) catches vulnerabilities early
2. Automated tests (pytest) - deployment only proceeds if tests pass
3. Production deployment to Hugging Face Spaces with model metadata injection

The pipeline extracts the DVC hash and includes it in deployment metadata for traceability. Only main branch pushes trigger deployment, PRs only run tests."

### 5. Monitoring Strategy
**Question**: "How would you monitor this in production?"

**Answer**: "I implemented Prometheus metrics tracking:
- Request counts by endpoint and status code
- Request duration histograms for latency monitoring
- Active request gauge for load tracking
- Generation type counters (text vs image)

These metrics are exposed at /metrics in Prometheus format, ready to integrate with Grafana or any monitoring system. The /health endpoint provides readiness checks for orchestrators like Kubernetes."

### 6. Challenges Overcome
**Question**: "What was the biggest challenge?"

**Answer**: "Initially, the HF Space Docker registry rejected pushes with 405 errors. The issue was the Space needed initialization via git push before Docker registry would work. This taught me to:
- Read error messages carefully (405 = method not allowed)
- Check platform documentation for deployment requirements
- Use multiple deployment methods (git vs Docker registry)
- Always have a fallback plan"

### 7. Future Improvements
**Question**: "How would you improve this system?"

**Answer**: "Several enhancements I'd prioritize:
- Staging environment for pre-production validation
- Model A/B testing framework for comparing model versions
- Response caching with Redis for frequently requested descriptions
- Rate limiting to prevent abuse
- Batch processing endpoint for high-volume scenarios
- Model performance benchmarks and drift detection"

## Technical Deep Dives (Be Ready For)

### DVC Internals
- How DVC tracks files using MD5 hashes
- Remote storage architecture (Google Drive in this case)
- .dvc file structure and metadata

### Docker Multi-stage Builds
- Could optimize Dockerfile with multi-stage builds
- Separate build and runtime dependencies
- Reduce final image size

### Prometheus Metrics
- Counter vs Gauge vs Histogram differences
- Label cardinality concerns
- Time series data structure

### FastAPI Features
- Async/await for image processing
- Pydantic validation with custom validators
- Automatic OpenAPI documentation

## Metrics to Highlight

- **Deployment Speed**: ~3-5 minutes from commit to production
- **Test Execution**: ~5 seconds locally, ~2 minutes in CI
- **Model Loading**: ~5-10 minutes cold start (one-time cost)
- **API Response Time**: <2 seconds for text, <5 seconds for images (after warmup)

## GitHub Repository
https://github.com/khushaal-chaudhary/Product_Description_Generator_Demo

## Live Demo
https://huggingface.co/spaces/Khushaal/product-description-generator