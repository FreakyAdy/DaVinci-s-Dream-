"""Simulation REST API Endpoints."""
import numpy as np
from fastapi import APIRouter, HTTPException
from backend.app.schemas.simulation import (
    SimulationResetRequest,
    SimulationStepRequest,
    SimulationStepResponse,
    AircraftStateSchema,
    TelemetrySchema,
    RunSimulationRequest,
    RunSimulationResponse,
    TrajectoryPoint
)
from backend.app.simulation.dynamics import FlightDynamicsEngine
from backend.app.agents.baseline_controller import BaselineController
from backend.app.agents.policy import RLPolicyWrapper

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

# Active singleton engine for interactive step-by-step control
active_engine = FlightDynamicsEngine()
baseline_controller = BaselineController()
rl_policy = RLPolicyWrapper()

@router.post("/reset", response_model=SimulationStepResponse)
def reset_simulation(req: SimulationResetRequest):
    """Reset the interactive flight dynamics engine."""
    state = active_engine.reset(
        wind_x=req.wind_x,
        wind_y=req.wind_y,
        initial_altitude=req.initial_altitude,
        initial_speed=req.initial_speed
    )
    telemetry = active_engine._compute_telemetry(0.0, 0.0, 0.0)

    return SimulationStepResponse(
        state=AircraftStateSchema(
            x=state.x,
            y=state.y,
            u=state.u,
            v=state.v,
            theta=state.theta,
            q=state.q,
            phi=state.phi,
            time=state.time,
            energy_consumed=state.energy_consumed,
            status=state.status.value
        ),
        telemetry=TelemetrySchema(
            airspeed=telemetry.airspeed,
            groundspeed=telemetry.groundspeed,
            angle_of_attack=telemetry.angle_of_attack,
            flight_path_angle=telemetry.flight_path_angle,
            lift_total=telemetry.lift_total,
            drag_total=telemetry.drag_total,
            thrust_flap=telemetry.thrust_flap,
            lift_flap=telemetry.lift_flap,
            pitch_moment=telemetry.pitch_moment,
            power_instantaneous=telemetry.power_instantaneous,
            wing_stroke_angle=telemetry.wing_stroke_angle
        ),
        is_terminal=False
    )

@router.post("/step", response_model=SimulationStepResponse)
def step_simulation(req: SimulationStepRequest):
    """Advance the interactive flight dynamics engine by one fixed timestep (0.02s)."""
    state, telemetry, is_terminal = active_engine.step(
        amplitude=req.amplitude,
        frequency=req.frequency,
        tail_pitch=req.tail_pitch
    )

    return SimulationStepResponse(
        state=AircraftStateSchema(
            x=state.x,
            y=state.y,
            u=state.u,
            v=state.v,
            theta=state.theta,
            q=state.q,
            phi=state.phi,
            time=state.time,
            energy_consumed=state.energy_consumed,
            status=state.status.value
        ),
        telemetry=TelemetrySchema(
            airspeed=telemetry.airspeed,
            groundspeed=telemetry.groundspeed,
            angle_of_attack=telemetry.angle_of_attack,
            flight_path_angle=telemetry.flight_path_angle,
            lift_total=telemetry.lift_total,
            drag_total=telemetry.drag_total,
            thrust_flap=telemetry.thrust_flap,
            lift_flap=telemetry.lift_flap,
            pitch_moment=telemetry.pitch_moment,
            power_instantaneous=telemetry.power_instantaneous,
            wing_stroke_angle=telemetry.wing_stroke_angle
        ),
        is_terminal=is_terminal
    )

@router.post("/run", response_model=RunSimulationResponse)
def run_full_simulation(req: RunSimulationRequest):
    """
    Run an entire flight episode deterministically from launch to landing/crash.
    Returns full trajectory points and events.
    """
    engine = FlightDynamicsEngine()
    engine.reset(wind_x=req.wind_x, wind_y=req.wind_y)

    controller = req.controller.lower()
    if controller == "rl":
        rl_policy.reload()
        if not rl_policy.is_available():
            raise HTTPException(
                status_code=400,
                detail="PPO neural network policy is not yet trained or checkpoint not found. Please train PPO first or use Baseline controller."
            )

    trajectory = []
    is_terminal = False
    step_idx = 0

    while not is_terminal and step_idx < req.max_steps:
        # Determine control inputs
        if controller == "baseline":
            amp, freq, tail = baseline_controller.get_action(engine.state, wind_x=req.wind_x)
        elif controller == "rl":
            obs = np.array([
                (engine.state.y - 12.5) / 15.0,
                (engine.state.u - 8.0) / 8.0,
                engine.state.v / 5.0,
                engine.state.theta / (np.pi / 4.0),
                engine.state.q / 2.0,
                np.sin(engine.state.phi),
                np.cos(engine.state.phi),
                (engine.cfg.target_x - engine.state.x) / engine.cfg.target_x,
                engine.wind_x / 5.0,
                engine.wind_y / 5.0,
            ], dtype=np.float32)
            amp, freq, tail = rl_policy.get_action_from_obs(obs, deterministic=True)
        else:  # manual
            amp = req.manual_amplitude or 0.35
            freq = req.manual_frequency or 2.0
            tail = req.manual_tail_pitch or 0.0

        state, telemetry, is_terminal = engine.step(amp, freq, tail)

        # Record trajectory sample every 2 steps (~25 Hz for frontend smooth playback)
        if step_idx % 2 == 0 or is_terminal:
            trajectory.append(TrajectoryPoint(
                x=round(state.x, 2),
                y=round(state.y, 2),
                u=round(state.u, 2),
                v=round(state.v, 2),
                theta=round(state.theta, 3),
                wing_stroke=round(telemetry.wing_stroke_angle, 3),
                airspeed=round(telemetry.airspeed, 2),
                time=round(state.time, 2)
            ))

        step_idx += 1

    events_data = [
        {
            "timestamp": round(e.timestamp, 2),
            "status": e.status.value,
            "message": e.message,
            "altitude": round(e.altitude, 2),
            "x": round(e.x_pos, 2)
        }
        for e in engine.events
    ]

    return RunSimulationResponse(
        controller=controller,
        final_status=engine.state.status.value,
        final_x=round(engine.state.x, 2),
        final_y=round(engine.state.y, 2),
        flight_time=round(engine.state.time, 2),
        energy_consumed=round(engine.state.energy_consumed, 1),
        trajectory=trajectory,
        events=events_data
    )
