"""Gymnasium continuous environment for the Leonardo Da Vinci Ornithopter."""
import math
import numpy as np
import gymnasium as gym
from gymnasium import spaces
from typing import Optional, Tuple, Dict, Any

from backend.app.simulation.configuration import OrnithopterConfig
from backend.app.simulation.dynamics import FlightDynamicsEngine, AircraftState
from backend.app.simulation.events import FlightStatus

class OrnithopterEnv(gym.Env):
    """
    Continuous flight control environment for the Ornithopter.
    Action Space:
      [0] Amplitude normalized in [-1, 1] -> [0.05, 0.65] rad
      [1] Frequency normalized in [-1, 1] -> [0.5, 3.5] Hz
      [2] Tail elevator pitch normalized in [-1, 1] -> [-0.35, 0.35] rad
    Observation Space:
      [0] Normalized altitude: (y - 12.5) / 15.0
      [1] Normalized forward velocity: (u - 8.0) / 8.0
      [2] Normalized vertical velocity: v / 5.0
      [3] Normalized pitch: theta / (pi / 4)
      [4] Normalized pitch rate: q / 2.0
      [5] sin(phi)
      [6] cos(phi)
      [7] Normalized target distance: (target_x - x) / target_x
      [8] Wind X normalized: wind_x / 5.0
      [9] Wind Y normalized: wind_y / 5.0
    """
    metadata = {"render_modes": ["rgb_array"], "render_fps": 50}

    def __init__(self, config: Optional[OrnithopterConfig] = None):
        super().__init__()
        self.cfg = config or OrnithopterConfig()
        self.engine = FlightDynamicsEngine(self.cfg)

        # Action: [amplitude, frequency, tail_elevator]
        self.action_space = spaces.Box(
            low=-1.0,
            high=1.0,
            shape=(3,),
            dtype=np.float32
        )

        # Observation: 10 continuous variables
        self.observation_space = spaces.Box(
            low=-np.inf,
            high=np.inf,
            shape=(10,),
            dtype=np.float32
        )

        self.target_x = self.cfg.target_x
        self.step_count = 0
        self.max_steps = int(self.cfg.max_time / self.cfg.dt)
        self.wind_variance = 1.5

    def reset(
        self,
        *,
        seed: Optional[int] = None,
        options: Optional[Dict[str, Any]] = None
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        super().reset(seed=seed)
        options = options or {}

        # Allow deterministic or randomized wind
        if "wind_x" in options and "wind_y" in options:
            wx = float(options["wind_x"])
            wy = float(options["wind_y"])
        elif seed is not None:
            rng = np.random.default_rng(seed)
            wx = float(rng.uniform(-self.wind_variance, self.wind_variance))
            wy = float(rng.uniform(-0.5, 0.5))
        else:
            wx = float(self.np_random.uniform(-self.wind_variance, self.wind_variance))
            wy = float(self.np_random.uniform(-0.5, 0.5))

        init_speed = options.get("initial_speed", self.cfg.launch_speed)
        state = self.engine.reset(wind_x=wx, wind_y=wy, initial_speed=init_speed)
        self.step_count = 0

        obs = self._get_obs(state)
        info = {
            "x": state.x,
            "y": state.y,
            "u": state.u,
            "v": state.v,
            "wind_x": wx,
            "wind_y": wy,
            "status": state.status.value
        }
        return obs, info

    def step(self, action: np.ndarray) -> Tuple[np.ndarray, float, bool, bool, Dict[str, Any]]:
        self.step_count += 1
        action = np.clip(action, self.action_space.low, self.action_space.high)

        # Map [-1, 1] to physical ranges
        amp = self.cfg.min_amplitude + 0.5 * (action[0] + 1.0) * (self.cfg.max_amplitude - self.cfg.min_amplitude)
        freq = self.cfg.min_frequency + 0.5 * (action[1] + 1.0) * (self.cfg.max_frequency - self.cfg.min_frequency)
        tail = float(action[2]) * self.cfg.max_tail_pitch

        prev_x = self.engine.state.x
        state, telemetry, is_terminal = self.engine.step(amp, freq, tail)

        # Reward computation
        reward = self._calculate_reward(state, telemetry, prev_x, amp, freq, tail)

        terminated = is_terminal
        truncated = self.step_count >= self.max_steps

        obs = self._get_obs(state)
        info = {
            "x": state.x,
            "y": state.y,
            "u": state.u,
            "v": state.v,
            "theta": state.theta,
            "q": state.q,
            "status": state.status.value,
            "airspeed": telemetry.airspeed,
            "energy_consumed": state.energy_consumed,
            "lift": telemetry.lift_total,
            "drag": telemetry.drag_total,
            "power": telemetry.power_instantaneous
        }

        return obs, reward, terminated, truncated, info

    def _get_obs(self, state: AircraftState) -> np.ndarray:
        obs = np.array([
            (state.y - 12.5) / 15.0,
            (state.u - 8.0) / 8.0,
            state.v / 5.0,
            state.theta / (math.pi / 4.0),
            state.q / 2.0,
            math.sin(state.phi),
            math.cos(state.phi),
            (self.target_x - state.x) / self.target_x,
            self.engine.wind_x / 5.0,
            self.engine.wind_y / 5.0,
        ], dtype=np.float32)
        return np.clip(obs, -5.0, 5.0)

    def _calculate_reward(
        self,
        state: AircraftState,
        telemetry: Any,
        prev_x: float,
        amp: float,
        freq: float,
        tail: float
    ) -> float:
        # 1. Forward distance progress
        dx = state.x - prev_x
        reward = dx * 1.2

        # 2. Forward speed incentive
        reward += 0.15 * max(0.0, state.u)

        # 3. Target proximity bonus
        dist_to_target = abs(self.target_x - state.x)
        reward += 0.05 * max(0.0, 1.0 - (dist_to_target / self.target_x))

        # 4. Attitude stability penalty (keep pitch reasonable, penalize extreme angles)
        pitch_penalty = 0.5 * (state.theta ** 2) + 0.1 * (state.q ** 2)
        reward -= pitch_penalty

        # 5. Energy expenditure penalty
        power_penalty = 0.04 * ((amp / self.cfg.max_amplitude) * (freq / self.cfg.max_frequency)) ** 2
        reward -= power_penalty

        # 6. Terminal status bonuses / penalties
        if state.status == FlightStatus.LANDED_TARGET:
            reward += 100.0
            # Extra bonus for soft descent rate
            if abs(state.v) < 1.5:
                reward += 20.0
        elif state.status == FlightStatus.LANDED_SAFE:
            reward += 35.0
        elif state.status in (FlightStatus.CRASHED_HARD, FlightStatus.CRASHED_STALL):
            reward -= 45.0
        elif state.status == FlightStatus.OUT_OF_BOUNDS:
            reward -= 30.0

        return float(reward)
