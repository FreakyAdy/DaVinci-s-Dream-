"""Policy loader and inference wrapper for Stable-Baselines3 PPO."""
import os
import numpy as np
from typing import Optional, Tuple
from stable_baselines3 import PPO
from backend.app.simulation.configuration import OrnithopterConfig

DEFAULT_MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "..",
    "models",
    "ornithopter_ppo.zip"
)
DEFAULT_MODEL_PATH = os.path.abspath(DEFAULT_MODEL_PATH)

class RLPolicyWrapper:
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or DEFAULT_MODEL_PATH
        self.model: Optional[PPO] = None
        self.cfg = OrnithopterConfig()
        self.reload()

    def reload(self) -> bool:
        """Attempt to load or reload policy checkpoint."""
        if os.path.exists(self.model_path):
            try:
                self.model = PPO.load(self.model_path)
                return True
            except Exception as e:
                print(f"[RLPolicyWrapper] Error loading policy from {self.model_path}: {e}")
                self.model = None
                return False
        self.model = None
        return False

    def is_available(self) -> bool:
        return self.model is not None

    def get_action_from_obs(self, obs: np.ndarray, deterministic: bool = True) -> Tuple[float, float, float]:
        """
        Takes raw observation vector, executes policy forward pass,
        and unnormalizes action to physical (amplitude, frequency, tail_pitch).
        """
        if not self.is_available():
            raise RuntimeError("RL policy is not trained or loaded. Please train the agent first.")

        action_norm, _ = self.model.predict(obs, deterministic=deterministic)
        amp = self.cfg.min_amplitude + 0.5 * (action_norm[0] + 1.0) * (self.cfg.max_amplitude - self.cfg.min_amplitude)
        freq = self.cfg.min_frequency + 0.5 * (action_norm[1] + 1.0) * (self.cfg.max_frequency - self.cfg.min_frequency)
        tail = float(action_norm[2]) * self.cfg.max_tail_pitch
        return float(amp), float(freq), float(tail)
