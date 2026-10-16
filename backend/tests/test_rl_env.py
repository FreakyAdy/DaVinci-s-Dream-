"""Unit tests for the Gymnasium Ornithopter Environment."""
import numpy as np
import pytest
from backend.app.simulation.ornithopter_env import OrnithopterEnv

def test_gym_env_reset():
    """Verify reset returns correct observation shape and info dictionary."""
    env = OrnithopterEnv()
    obs, info = env.reset(seed=42)

    assert obs.shape == (10,), f"Expected observation shape (10,), got {obs.shape}"
    assert isinstance(obs, np.ndarray)
    assert np.all(np.isfinite(obs))
    assert "x" in info and "y" in info and "status" in info

def test_gym_env_step_bounds():
    """Verify step responds to continuous action vectors within [-1, 1]."""
    env = OrnithopterEnv()
    obs, _ = env.reset(seed=123)

    action = np.array([0.5, -0.2, 0.1], dtype=np.float32)
    next_obs, reward, terminated, truncated, info = env.step(action)

    assert next_obs.shape == (10,)
    assert isinstance(reward, float)
    assert isinstance(terminated, bool)
    assert isinstance(truncated, bool)
    assert "energy_consumed" in info
    assert info["energy_consumed"] >= 0.0

def test_action_space_clipping():
    """Verify out-of-range actions are clipped safely."""
    env = OrnithopterEnv()
    env.reset(seed=99)

    extreme_action = np.array([10.0, -50.0, 99.0], dtype=np.float32)
    obs, reward, _, _, _ = env.step(extreme_action)

    assert np.all(np.isfinite(obs))
    assert isinstance(reward, float)
