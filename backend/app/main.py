"""FastAPI Application Entrypoint for Da Vinci's Dream."""
import os
import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.api.routes_simulation import router as simulation_router
from backend.app.api.routes_training import router as training_router
from backend.app.api.routes_artifacts import router as artifacts_router
from backend.app.agents.policy import RLPolicyWrapper

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PUBLIC_ASSETS_DIR = os.path.join(ROOT_DIR, "public", "assets")

app = FastAPI(
    title="Da Vinci's Dream — Renaissance Invention Laboratory API",
    description="Computational physics simulation, Gymnasium reinforcement learning, and historical machine registry.",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static assets
if os.path.exists(PUBLIC_ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=PUBLIC_ASSETS_DIR), name="assets")

# Mount API routers
app.include_router(simulation_router)
app.include_router(training_router)
app.include_router(artifacts_router)

@app.get("/api/health")
def health_check():
    """System health check and GPU acceleration diagnostics."""
    cuda_available = torch.cuda.is_available()
    device_name = torch.cuda.get_device_name(0) if cuda_available else "CPU (Host)"
    policy_checker = RLPolicyWrapper()

    return {
        "status": "healthy",
        "service": "Da Vinci's Dream Backend",
        "cuda_available": cuda_available,
        "device_name": device_name,
        "policy_loaded": policy_checker.is_available(),
        "frameworks": {
            "torch": torch.__version__,
            "fastapi": "0.135.2"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
