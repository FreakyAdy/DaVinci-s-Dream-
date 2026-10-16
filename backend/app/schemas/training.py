"""Pydantic schemas for PPO training and evaluation benchmarks."""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TrainingStartRequest(BaseModel):
    timesteps: int = Field(50000, ge=1000, le=500000, description="Training timesteps for PPO")
    learning_rate: float = Field(3e-4, ge=1e-5, le=1e-2, description="Learning rate")
    seed: int = Field(42, description="Random seed")

class TrainingStatusResponse(BaseModel):
    is_training: bool
    current_timesteps: int
    total_timesteps: int
    progress_pct: float
    elapsed_seconds: float
    fps: int
    mean_reward: float
    policy_available: bool
    message: str

class BenchmarkRequest(BaseModel):
    episodes: int = Field(20, ge=2, le=100, description="Episodes to evaluate per controller")

class BenchmarkResponse(BaseModel):
    episodes_per_controller: int
    baseline: Dict[str, Any]
    rl_policy: Dict[str, Any]
