"""PPO Training Pipeline for the Leonardo Ornithopter Gymnasium Environment."""
import os
import json
import time
import argparse
import torch
import numpy as np
from typing import Optional, Callable
from stable_baselines3 import PPO
from stable_baselines3.common.callbacks import BaseCallback

from backend.app.simulation.ornithopter_env import OrnithopterEnv

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DEFAULT_MODEL_DIR = os.path.join(ROOT_DIR, "models")
DEFAULT_RESULTS_DIR = os.path.join(ROOT_DIR, "results")
DEFAULT_MODEL_PATH = os.path.join(DEFAULT_MODEL_DIR, "ornithopter_ppo.zip")
DEFAULT_LOG_PATH = os.path.join(DEFAULT_RESULTS_DIR, "training_history.json")

class TrainingProgressCallback(BaseCallback):
    """Callback for tracking training metrics and writing to json for live telemetry."""
    def __init__(
        self,
        total_timesteps: int,
        log_path: str = DEFAULT_LOG_PATH,
        log_freq: int = 1000,
        progress_hook: Optional[Callable[[dict], None]] = None
    ):
        super().__init__()
        self.total_timesteps = total_timesteps
        self.log_path = log_path
        self.log_freq = log_freq
        self.progress_hook = progress_hook
        self.start_time = time.time()
        self.episode_rewards = []
        self.episode_lengths = []
        self.history = []

    def _on_step(self) -> bool:
        # Check for episode termination in the environment info
        for info in self.locals.get("infos", []):
            if "episode" in info:
                self.episode_rewards.append(info["episode"]["r"])
                self.episode_lengths.append(info["episode"]["l"])

        if self.n_calls % self.log_freq == 0:
            elapsed = time.time() - self.start_time
            progress = min(1.0, self.num_timesteps / max(1, self.total_timesteps))
            fps = int(self.num_timesteps / max(0.001, elapsed))
            mean_reward = float(np.mean(self.episode_rewards[-20:])) if self.episode_rewards else 0.0

            entry = {
                "timesteps": int(self.num_timesteps),
                "total_timesteps": int(self.total_timesteps),
                "progress": round(progress, 4),
                "elapsed_seconds": round(elapsed, 2),
                "fps": fps,
                "mean_reward": round(mean_reward, 2)
            }
            self.history.append(entry)

            os.makedirs(os.path.dirname(self.log_path), exist_ok=True)
            with open(self.log_path, "w") as f:
                json.dump({
                    "status": "training",
                    "current": entry,
                    "history": self.history
                }, f, indent=2)

            if self.progress_hook:
                self.progress_hook(entry)

        return True

def train_ornithopter_ppo(
    timesteps: int = 60000,
    save_path: str = DEFAULT_MODEL_PATH,
    log_path: str = DEFAULT_LOG_PATH,
    learning_rate: float = 3e-4,
    seed: int = 42,
    device: str = "cpu",
    progress_hook: Optional[Callable[[dict], None]] = None
) -> PPO:
    """Train PPO policy and save model checkpoint."""
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    os.makedirs(os.path.dirname(log_path), exist_ok=True)

    # Set deterministic seeds
    torch.manual_seed(seed)
    np.random.seed(seed)

    print(f"[TrainPPO] Starting training on device: {device} | Target timesteps: {timesteps}")

    env = OrnithopterEnv()
    env.reset(seed=seed)

    policy_kwargs = dict(
        net_arch=dict(pi=[128, 128], vf=[128, 128]),
        activation_fn=torch.nn.Tanh
    )

    model = PPO(
        "MlpPolicy",
        env,
        learning_rate=learning_rate,
        n_steps=2048,
        batch_size=64,
        n_epochs=10,
        gamma=0.99,
        gae_lambda=0.95,
        clip_range=0.2,
        ent_coef=0.01,
        policy_kwargs=policy_kwargs,
        verbose=1,
        seed=seed,
        device=device
    )

    callback = TrainingProgressCallback(
        total_timesteps=timesteps,
        log_path=log_path,
        log_freq=1000,
        progress_hook=progress_hook
    )

    model.learn(total_timesteps=timesteps, callback=callback)

    # Save trained checkpoint
    model.save(save_path)
    print(f"[TrainPPO] Model saved successfully to: {save_path}")

    # Mark training complete in log
    final_entry = {
        "status": "completed",
        "save_path": save_path,
        "completed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "total_timesteps": timesteps,
        "final_mean_reward": float(np.mean(callback.episode_rewards[-20:])) if callback.episode_rewards else 0.0,
        "history": callback.history
    }
    with open(log_path, "w") as f:
        json.dump(final_entry, f, indent=2)

    return model

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train PPO policy for Da Vinci Ornithopter")
    parser.add_argument("--timesteps", type=int, default=50000, help="Total training timesteps")
    parser.add_argument("--save-path", type=str, default=DEFAULT_MODEL_PATH, help="Path to save checkpoint")
    parser.add_argument("--log-path", type=str, default=DEFAULT_LOG_PATH, help="Path for JSON metrics log")
    parser.add_argument("--lr", type=float, default=3e-4, help="Learning rate")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    args = parser.parse_args()

    train_ornithopter_ppo(
        timesteps=args.timesteps,
        save_path=args.save_path,
        log_path=args.log_path,
        learning_rate=args.lr,
        seed=args.seed
    )
