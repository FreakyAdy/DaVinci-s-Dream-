"""Rule-based engineering baseline controller for the Leonardo Ornithopter."""
import math
from typing import Tuple
from backend.app.simulation.dynamics import AircraftState

class BaselineController:
    """
    Classical feedback controller:
    - Pitch attitude PD regulation with elevator.
    - Energy-conscious altitude-hold flapping scheduler.
    - Landing flare sequence near target.
    """
    def __init__(
        self,
        target_pitch: float = 0.06,      # ~3.5 deg pitch-up for optimal glide L/D
        kp_pitch: float = 1.4,
        kd_pitch: float = 0.35,
        target_speed: float = 7.5        # Desired forward speed (m/s)
    ):
        self.target_pitch = target_pitch
        self.kp_pitch = kp_pitch
        self.kd_pitch = kd_pitch
        self.target_speed = target_speed

    def get_action(self, state: AircraftState, wind_x: float = 0.0) -> Tuple[float, float, float]:
        """
        Returns: (amplitude, frequency, tail_pitch)
        """
        # Flare logic near ground / target zone
        desired_pitch = self.target_pitch
        if state.x > 175.0 and state.y < 8.0:
            # Flare to slow descent rate
            desired_pitch = 0.12

        # 1. Pitch PD governor (elevator control)
        pitch_error = state.theta - desired_pitch
        elevator = -self.kp_pitch * pitch_error - self.kd_pitch * state.q
        elevator = max(-0.35, min(0.35, elevator))

        # 2. Flapping rate scheduler
        # If speed or altitude is insufficient, increase flapping
        airspeed = state.u - wind_x
        speed_deficit = self.target_speed - airspeed
        sink_rate = -state.v  # positive when descending

        if sink_rate > 1.2 or speed_deficit > 0.5 or state.y < 12.0:
            # Power climb / maintain flight
            amplitude = 0.48
            frequency = 2.4
        elif sink_rate > 0.4:
            # Mild cruise flap
            amplitude = 0.32
            frequency = 1.8
        else:
            # Energy conservation glide
            amplitude = 0.10
            frequency = 0.8

        return amplitude, frequency, elevator
