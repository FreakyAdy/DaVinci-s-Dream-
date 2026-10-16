"""Reinforcement Learning Training and Benchmarking API Router."""
import os
import json
import threading
from fastapi import APIRouter, HTTPException, BackgroundTasks
from backend.app.schemas.training import (
    TrainingStartRequest,
    TrainingStatusResponse,
    BenchmarkRequest,
    BenchmarkResponse
)
from backend.app.agents.train_ppo import train_ornithopter_ppo, DEFAULT_MODEL_PATH, DEFAULT_LOG_PATH
from backend.app.agents.evaluation import run_comparative_benchmark, DEFAULT_RESULTS_PATH
from backend.app.agents.policy import RLPolicyWrapper

router = APIRouter(prefix="/api", tags=["Training & Evaluation"])

# Global state tracker
training_lock = threading.Lock()
is_training_active = False
current_training_info = {
    "timesteps": 0,
    "total_timesteps": 0,
    "progress": 0.0,
    "elapsed_seconds": 0.0,
    "fps": 0,
    "mean_reward": 0.0,
    "message": "Idle"
}

def _bg_train_worker(timesteps: int, lr: float, seed: int):
    global is_training_active, current_training_info
    try:
        def on_progress(info: dict):
            global current_training_info
            current_training_info = {
                "timesteps": info["timesteps"],
                "total_timesteps": info["total_timesteps"],
                "progress": info["progress"],
                "elapsed_seconds": info["elapsed_seconds"],
                "fps": info["fps"],
                "mean_reward": info["mean_reward"],
                "message": f"Training PPO: {info['timesteps']}/{info['total_timesteps']} steps ({info['progress']*100:.1f}%)"
            }

        train_ornithopter_ppo(
            timesteps=timesteps,
            learning_rate=lr,
            seed=seed,
            progress_hook=on_progress
        )

        current_training_info["message"] = f"Training completed successfully! Policy saved to {DEFAULT_MODEL_PATH}."
    except Exception as e:
        current_training_info["message"] = f"Training error: {str(e)}"
    finally:
        with training_lock:
            is_training_active = False

@router.post("/training/start")
def start_training(req: TrainingStartRequest, background_tasks: BackgroundTasks):
    """Start background PPO policy training. Prevents concurrent duplicate training."""
    global is_training_active, current_training_info
    with training_lock:
        if is_training_active:
            raise HTTPException(status_code=409, detail="A training job is already actively running.")
        is_training_active = True

    current_training_info = {
        "timesteps": 0,
        "total_timesteps": req.timesteps,
        "progress": 0.0,
        "elapsed_seconds": 0.0,
        "fps": 0,
        "mean_reward": 0.0,
        "message": f"Initializing PPO training ({req.timesteps} timesteps)..."
    }

    t = threading.Thread(target=_bg_train_worker, args=(req.timesteps, req.learning_rate, req.seed), daemon=True)
    t.start()

    return {"status": "started", "timesteps": req.timesteps}

@router.get("/training/status", response_model=TrainingStatusResponse)
def get_training_status():
    """Retrieve real-time training progress and policy availability."""
    global is_training_active, current_training_info

    policy_checker = RLPolicyWrapper()
    has_policy = policy_checker.is_available()

    # Read from file if idle to provide last completed summary
    if not is_training_active and os.path.exists(DEFAULT_LOG_PATH):
        try:
            with open(DEFAULT_LOG_PATH, "r") as f:
                data = json.load(f)
                if data.get("status") == "completed":
                    return TrainingStatusResponse(
                        is_training=False,
                        current_timesteps=data.get("total_timesteps", 0),
                        total_timesteps=data.get("total_timesteps", 0),
                        progress_pct=100.0,
                        elapsed_seconds=0.0,
                        fps=0,
                        mean_reward=data.get("final_mean_reward", 0.0),
                        policy_available=has_policy,
                        message="Training completed and verified."
                    )
        except Exception:
            pass

    return TrainingStatusResponse(
        is_training=is_training_active,
        current_timesteps=current_training_info["timesteps"],
        total_timesteps=current_training_info["total_timesteps"],
        progress_pct=round(current_training_info["progress"] * 100.0, 1),
        elapsed_seconds=current_training_info["elapsed_seconds"],
        fps=current_training_info["fps"],
        mean_reward=current_training_info["mean_reward"],
        policy_available=has_policy,
        message=current_training_info["message"]
    )

@router.post("/evaluation/run", response_model=BenchmarkResponse)
def run_evaluation(req: BenchmarkRequest):
    """Run head-to-head scientific benchmark between Baseline and PPO."""
    results = run_comparative_benchmark(episodes=req.episodes)
    return BenchmarkResponse(
        episodes_per_controller=req.episodes,
        baseline=results["baseline"],
        rl_policy=results["rl_policy"]
    )

@router.get("/evaluation/latest")
def get_latest_evaluation():
    """Get latest stored benchmark results if available."""
    if os.path.exists(DEFAULT_RESULTS_PATH):
        try:
            with open(DEFAULT_RESULTS_PATH, "r") as f:
                return json.load(f)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error reading benchmark results: {str(e)}")
    # If not yet run, generate a lightweight initial benchmark
    return run_comparative_benchmark(episodes=10)
