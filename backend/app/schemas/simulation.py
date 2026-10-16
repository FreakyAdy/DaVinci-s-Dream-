"""Pydantic V2 models for simulation requests and responses."""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SimulationResetRequest(BaseModel):
    wind_x: float = Field(0.0, description="Horizontal wind speed in m/s (positive = tailwind, negative = headwind)")
    wind_y: float = Field(0.0, description="Vertical wind speed in m/s (positive = updraft, negative = downdraft)")
    initial_altitude: Optional[float] = Field(None, description="Starting height on cliff (default 25m)")
    initial_speed: Optional[float] = Field(None, description="Initial catapult launch glide speed (default 6.5 m/s)")
    seed: Optional[int] = Field(None, description="Deterministic seed for simulation run")

class SimulationStepRequest(BaseModel):
    amplitude: float = Field(..., ge=0.05, le=0.65, description="Flapping amplitude in radians (~3 to 37 deg)")
    frequency: float = Field(..., ge=0.5, le=3.5, description="Flapping frequency in Hz")
    tail_pitch: float = Field(0.0, ge=-0.35, le=0.35, description="Tail elevator angle in radians (~ -20 to +20 deg)")

class AircraftStateSchema(BaseModel):
    x: float
    y: float
    u: float
    v: float
    theta: float
    q: float
    phi: float
    time: float
    energy_consumed: float
    status: str

class TelemetrySchema(BaseModel):
    airspeed: float
    groundspeed: float
    angle_of_attack: float
    flight_path_angle: float
    lift_total: float
    drag_total: float
    thrust_flap: float
    lift_flap: float
    pitch_moment: float
    power_instantaneous: float
    wing_stroke_angle: float

class SimulationStepResponse(BaseModel):
    state: AircraftStateSchema
    telemetry: TelemetrySchema
    is_terminal: bool

class RunSimulationRequest(BaseModel):
    controller: str = Field("baseline", description="Controller: 'manual', 'baseline', or 'rl'")
    wind_x: float = Field(0.0, description="Wind speed X (m/s)")
    wind_y: float = Field(0.0, description="Wind speed Y (m/s)")
    manual_amplitude: Optional[float] = Field(0.35, description="Fixed flap amplitude if manual")
    manual_frequency: Optional[float] = Field(2.0, description="Fixed flap frequency if manual")
    manual_tail_pitch: Optional[float] = Field(0.0, description="Fixed tail elevator angle if manual")
    max_steps: int = Field(1200, description="Max physics steps")
    seed: Optional[int] = Field(42, description="Random seed")

class TrajectoryPoint(BaseModel):
    x: float
    y: float
    u: float
    v: float
    theta: float
    wing_stroke: float
    airspeed: float
    time: float

class RunSimulationResponse(BaseModel):
    controller: str
    final_status: str
    final_x: float
    final_y: float
    flight_time: float
    energy_consumed: float
    trajectory: List[TrajectoryPoint]
    events: List[Dict[str, Any]]
