"""Simulation events, flags, and termination statuses."""
from enum import Enum
from dataclasses import dataclass
from typing import List

class FlightStatus(str, Enum):
    ON_PLATFORM = "on_platform"
    IN_FLIGHT = "in_flight"
    STALL_WARNING = "stall_warning"
    LANDED_TARGET = "landed_target"
    LANDED_SAFE = "landed_safe"
    CRASHED_HARD = "crashed_hard"
    CRASHED_STALL = "crashed_stall"
    OUT_OF_BOUNDS = "out_of_bounds"
    TIME_EXPIRED = "time_expired"

@dataclass
class FlightEvent:
    timestamp: float
    status: FlightStatus
    message: str
    altitude: float
    x_pos: float
    airspeed: float
