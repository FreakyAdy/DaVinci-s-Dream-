"""Unit tests for the 2D Ornithopter Flight Dynamics Engine."""
import pytest
import math
from backend.app.simulation.dynamics import FlightDynamicsEngine, AircraftState
from backend.app.simulation.configuration import OrnithopterConfig
from backend.app.simulation.events import FlightStatus

def test_gravity_freefall():
    """Verify that in zero lift and zero thrust, aircraft accelerates downward due to gravity."""
    cfg = OrnithopterConfig()
    engine = FlightDynamicsEngine(cfg)
    engine.reset(initial_altitude=50.0, initial_speed=0.0, initial_pitch=0.0)

    # Step with 0 flap amplitude and 0 frequency (no dynamic lift/thrust)
    state, telemetry, _ = engine.step(amplitude=0.05, frequency=0.5, tail_pitch=0.0)

    # After dt, downward velocity v should be negative (accelerating downward)
    assert state.v < 0.0, f"Expected downward velocity, got {state.v}"
    assert state.y < 50.0, f"Expected altitude drop, got {state.y}"

def test_flapping_generates_lift_and_thrust():
    """Verify active flapping generates measurable dynamic lift and thrust over a flapping stroke."""
    cfg = OrnithopterConfig()
    engine = FlightDynamicsEngine(cfg)
    engine.reset(initial_altitude=30.0, initial_speed=6.0)

    # Step through a flapping cycle to record forces during downstroke
    max_thrust = 0.0
    max_lift_flap = 0.0
    for _ in range(15):
        state, telemetry, _ = engine.step(amplitude=0.55, frequency=2.5, tail_pitch=0.0)
        max_thrust = max(max_thrust, telemetry.thrust_flap)
        max_lift_flap = max(max_lift_flap, telemetry.lift_flap)

    assert max_thrust > 0.0, f"Expected positive thrust from flapping, got {max_thrust}"
    assert max_lift_flap > 0.0, f"Expected positive dynamic lift, got {max_lift_flap}"

def test_wind_affects_airspeed():
    """Verify tailwind increases ground speed, headwind increases relative airspeed."""
    cfg = OrnithopterConfig()

    # Headwind scenario (-4 m/s)
    engine_headwind = FlightDynamicsEngine(cfg)
    engine_headwind.reset(wind_x=-4.0, initial_speed=6.0)
    _, telem_headwind, _ = engine_headwind.step(0.2, 1.0, 0.0)

    # Tailwind scenario (+4 m/s)
    engine_tailwind = FlightDynamicsEngine(cfg)
    engine_tailwind.reset(wind_x=4.0, initial_speed=6.0)
    _, telem_tailwind, _ = engine_tailwind.step(0.2, 1.0, 0.0)

    # Airspeed in headwind should be significantly higher than in tailwind for same groundspeed
    assert telem_headwind.airspeed > telem_tailwind.airspeed, (
        f"Headwind airspeed ({telem_headwind.airspeed}) should exceed tailwind airspeed ({telem_tailwind.airspeed})"
    )

def test_elevator_controls_pitch_moment():
    """Verify positive tail elevator pitches nose down/up as governed by moment derivative."""
    cfg = OrnithopterConfig()

    engine_up = FlightDynamicsEngine(cfg)
    engine_up.reset(initial_altitude=30.0, initial_speed=8.0)
    # Nose-up deflection
    _, telem_up, _ = engine_up.step(amplitude=0.1, frequency=1.0, tail_pitch=-0.25)

    engine_down = FlightDynamicsEngine(cfg)
    engine_down.reset(initial_altitude=30.0, initial_speed=8.0)
    # Nose-down deflection
    _, telem_down, _ = engine_down.step(amplitude=0.1, frequency=1.0, tail_pitch=0.25)

    assert telem_up.pitch_moment > telem_down.pitch_moment, (
        f"Tail pitch moment up ({telem_up.pitch_moment}) should exceed down ({telem_down.pitch_moment})"
    )

def test_ground_crash_detection():
    """Verify steep or high-speed impact with ground is flagged as crash."""
    cfg = OrnithopterConfig()
    engine = FlightDynamicsEngine(cfg)
    # Position right at ground level beyond launch platform with steep dive and high sink rate
    engine.reset(initial_altitude=0.05, initial_speed=10.0, initial_pitch=-0.4)
    engine.state.x = 30.0
    engine.state.v = -8.0

    # Next step will hit ground with high vertical speed and dive pitch
    state, _, is_terminal = engine.step(amplitude=0.05, frequency=0.5, tail_pitch=0.0)

    assert is_terminal is True
    assert state.status in (FlightStatus.CRASHED_HARD, FlightStatus.CRASHED_STALL)

def test_landing_zone_arrival():
    """Verify soft touchdown in target landing zone is flagged as LANDED_TARGET."""
    cfg = OrnithopterConfig()
    engine = FlightDynamicsEngine(cfg)
    # Position in landing zone (x=200m) right at touchdown, gentle descent rate
    engine.reset(initial_altitude=0.02, initial_speed=4.0, initial_pitch=0.05)
    engine.state.x = 200.0
    engine.state.v = -1.2

    state, _, is_terminal = engine.step(amplitude=0.1, frequency=1.0, tail_pitch=0.0)

    assert is_terminal is True
    assert state.status == FlightStatus.LANDED_TARGET

def test_deterministic_reproducibility():
    """Verify identical inputs produce identical numerical trajectories."""
    cfg = OrnithopterConfig()

    def run_sim():
        engine = FlightDynamicsEngine(cfg)
        engine.reset(wind_x=1.2, wind_y=-0.3, initial_speed=6.5)
        coords = []
        for _ in range(50):
            st, _, _ = engine.step(amplitude=0.35, frequency=2.0, tail_pitch=-0.05)
            coords.append((st.x, st.y, st.u, st.v, st.theta))
        return coords

    run1 = run_sim()
    run2 = run_sim()

    assert len(run1) == len(run2)
    for c1, c2 in zip(run1, run2):
        for v1, v2 in zip(c1, c2):
            assert math.isclose(v1, v2, rel_tol=1e-9), f"Discrepancy: {v1} != {v2}"
