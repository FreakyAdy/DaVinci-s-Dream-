"""2D Flight Dynamics Engine for Leonardo da Vinci's Flapping-Wing Ornithopter."""
import math
from dataclasses import dataclass, field
from typing import Tuple, List, Optional
from backend.app.simulation.configuration import OrnithopterConfig
from backend.app.simulation.events import FlightStatus, FlightEvent

@dataclass
class AircraftState:
    x: float = 0.0                  # Horizontal position (m)
    y: float = 25.0                 # Altitude above valley ground (m)
    u: float = 6.5                  # Horizontal forward velocity (m/s)
    v: float = 0.0                  # Vertical velocity (m/s)
    theta: float = 0.05             # Pitch angle (rad, ~3 deg nose-up)
    q: float = 0.0                  # Pitch angular rate (rad/s)
    phi: float = 0.0                # Wingbeat cycle phase (rad, [0, 2pi))
    time: float = 0.0               # Elapsed flight time (s)
    energy_consumed: float = 0.0    # Accumulated mechanical energy (Joules)
    status: FlightStatus = FlightStatus.ON_PLATFORM

@dataclass
class FlightTelemetry:
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

class FlightDynamicsEngine:
    def __init__(self, config: Optional[OrnithopterConfig] = None):
        self.cfg = config or OrnithopterConfig()
        self.state = AircraftState(y=self.cfg.launch_altitude, u=self.cfg.launch_speed)
        self.wind_x: float = 0.0
        self.wind_y: float = 0.0
        self.events: List[FlightEvent] = []
        self._record_event(FlightStatus.ON_PLATFORM, "Aircraft positioned on elevated cliff platform ready for launch.")

    def reset(
        self,
        wind_x: float = 0.0,
        wind_y: float = 0.0,
        initial_speed: Optional[float] = None,
        initial_altitude: Optional[float] = None,
        initial_pitch: float = 0.05
    ) -> AircraftState:
        """Reset the simulation to starting state."""
        self.wind_x = float(wind_x)
        self.wind_y = float(wind_y)
        u_init = initial_speed if initial_speed is not None else self.cfg.launch_speed
        y_init = initial_altitude if initial_altitude is not None else self.cfg.launch_altitude

        self.state = AircraftState(
            x=0.0,
            y=y_init,
            u=u_init,
            v=0.0,
            theta=initial_pitch,
            q=0.0,
            phi=0.0,
            time=0.0,
            energy_consumed=0.0,
            status=FlightStatus.ON_PLATFORM
        )
        self.events = []
        self._record_event(FlightStatus.ON_PLATFORM, f"Aircraft reset. Wind: ({self.wind_x:.1f}, {self.wind_y:.1f}) m/s.")
        return self.state

    def step(self, amplitude: float, frequency: float, tail_pitch: float) -> Tuple[AircraftState, FlightTelemetry, bool]:
        """
        Advance the simulation by fixed dt (0.02s).
        Returns: (state, telemetry, is_terminal)
        """
        if self._is_terminal(self.state.status):
            telemetry = self._compute_telemetry(0.0, 0.0, 0.0)
            return self.state, telemetry, True

        cfg = self.cfg
        dt = cfg.dt

        # Clamp control inputs to physical capabilities
        amp = max(cfg.min_amplitude, min(cfg.max_amplitude, float(amplitude)))
        freq = max(cfg.min_frequency, min(cfg.max_frequency, float(frequency)))
        tail = max(-cfg.max_tail_pitch, min(cfg.max_tail_pitch, float(tail_pitch)))

        # Update flight status from platform to in_flight once clearing edge
        if self.state.x > cfg.platform_length and self.state.status == FlightStatus.ON_PLATFORM:
            self.state.status = FlightStatus.IN_FLIGHT
            self._record_event(FlightStatus.IN_FLIGHT, "Cleared launch platform edge into open airspace.")

        # Air-relative velocity vector
        u_rel = self.state.u - self.wind_x
        v_rel = self.state.v - self.wind_y
        v_inf = math.hypot(u_rel, v_rel)
        v_inf = max(0.5, v_inf)  # Prevent zero singularity

        # Aerodynamic angles
        gamma = math.atan2(v_rel, u_rel)        # Flight path angle rel to air
        alpha = self.state.theta - gamma        # Angle of attack

        # Static wing Lift and Drag
        # Smooth stall transition model
        stall_factor = math.exp(-min(10.0, (alpha / cfg.alpha_stall) ** 4))
        c_l = cfg.cl_0 + cfg.cl_alpha * math.sin(2.0 * alpha) * stall_factor
        c_d = cfg.cd_0 + cfg.cd_induced * (math.sin(alpha) ** 2) + cfg.cd_stall * (1.0 - math.cos(alpha))

        q_dyn = 0.5 * cfg.air_density * (v_inf ** 2) * cfg.wing_area
        lift_aero = q_dyn * c_l
        drag_aero = q_dyn * c_d

        # Flapping kinematics & dynamic forces
        # Wing stroke: beta = amp * cos(phi) -> top of stroke at phi=0
        # Wing velocity: beta_dot = -amp * omega * sin(phi) -> negative during downstroke (phi in (0, pi))
        omega = 2.0 * math.pi * freq
        wing_stroke = amp * math.cos(self.state.phi)
        wing_ang_vel = -amp * omega * math.sin(self.state.phi)

        # Downstroke occurs when wing moves downward (wing_ang_vel < 0)
        # Downstroke produces strong upward lift and forward propulsive thrust
        downstroke_vel = max(0.0, -wing_ang_vel)
        # Quasi-steady dynamic lift from moving wing
        lift_flap = 0.5 * cfg.air_density * cfg.wing_area * cfg.cl_flap * (downstroke_vel ** 2) * (cfg.wingspan * 0.15)
        # Forward thrust from pitch-angled downstroke and spanwise aeroelastic twist
        thrust_flap = cfg.propulsive_eff * lift_flap * max(0.1, math.cos(self.state.theta)) + 0.1 * cfg.air_density * cfg.wing_area * (downstroke_vel ** 2)

        # Force resolution in inertial frame
        # L acts perpendicular to relative wind, D acts parallel opposite
        f_x_aero = -drag_aero * math.cos(gamma) - lift_aero * math.sin(gamma)
        f_y_aero = lift_aero * math.cos(gamma) - drag_aero * math.sin(gamma)

        f_x = thrust_flap + f_x_aero
        f_y = lift_flap + f_y_aero - (cfg.mass * cfg.gravity)

        # Pitching moment & tail elevator dynamics
        # cm = cm0 + cm_alpha * alpha + cm_elevator * tail
        c_m = cfg.cm_0 + cfg.cm_alpha * alpha + cfg.cm_elevator * tail
        m_aero = q_dyn * cfg.chord * c_m
        m_damping = -cfg.pitch_damping * self.state.q
        m_total = m_aero + m_damping
        q_dot = m_total / cfg.inertia_yy

        # Numerical integration (Semi-implicit Euler)
        u_next = self.state.u + (f_x / cfg.mass) * dt
        v_next = self.state.v + (f_y / cfg.mass) * dt
        x_next = self.state.x + u_next * dt
        y_next = self.state.y + v_next * dt

        q_next = self.state.q + q_dot * dt
        theta_next = self.state.theta + q_next * dt
        phi_next = (self.state.phi + omega * dt) % (2.0 * math.pi)

        # Instantaneous power expenditure:
        # Inertial wing acceleration power + aerodynamic propulsive work
        power_aero = max(0.0, thrust_flap * v_inf) + 0.15 * cfg.mass * (amp * omega) ** 2
        energy_step = power_aero * dt

        # Update state
        self.state.u = u_next
        self.state.v = v_next
        self.state.x = x_next
        self.state.y = y_next
        self.state.q = q_next
        self.state.theta = theta_next
        self.state.phi = phi_next
        self.state.time += dt
        self.state.energy_consumed += energy_step

        # Boundary constraints & collision evaluation
        self._check_boundaries_and_collisions(alpha, v_inf)

        # Telemetry
        telemetry = FlightTelemetry(
            airspeed=v_inf,
            groundspeed=math.hypot(u_next, v_next),
            angle_of_attack=alpha,
            flight_path_angle=gamma,
            lift_total=lift_aero + lift_flap,
            drag_total=drag_aero,
            thrust_flap=thrust_flap,
            lift_flap=lift_flap,
            pitch_moment=m_total,
            power_instantaneous=power_aero,
            wing_stroke_angle=wing_stroke
        )

        is_terminal = self._is_terminal(self.state.status)
        return self.state, telemetry, is_terminal

    def _check_boundaries_and_collisions(self, alpha: float, v_inf: float) -> None:
        cfg = self.cfg

        # Launch platform constraint (x <= 15m)
        if self.state.x <= cfg.platform_length:
            if self.state.y < cfg.launch_altitude:
                self.state.y = cfg.launch_altitude
                self.state.v = max(0.0, self.state.v)
            return

        # Check stall warning
        if abs(alpha) > cfg.alpha_stall and self.state.status == FlightStatus.IN_FLIGHT:
            self._record_event(FlightStatus.STALL_WARNING, f"Aerodynamic stall warning: AoA={math.degrees(alpha):.1f}° exceeds stall limit.")

        # Ground collision (valley floor y <= 0.0)
        if self.state.y <= 0.0:
            self.state.y = 0.0
            impact_speed = abs(self.state.v)
            pitch_deg = abs(math.degrees(self.state.theta))
            forward_speed = self.state.u

            # Check if within target landing zone [target_x - radius, target_x + radius]
            is_in_target = abs(self.state.x - cfg.target_x) <= cfg.target_radius

            if impact_speed <= 2.8 and pitch_deg <= 22.0 and forward_speed >= 1.0:
                if is_in_target:
                    self.state.status = FlightStatus.LANDED_TARGET
                    self._record_event(FlightStatus.LANDED_TARGET, f"Splendid arrival in target landing zone at x={self.state.x:.1f}m!")
                else:
                    self.state.status = FlightStatus.LANDED_SAFE
                    self._record_event(FlightStatus.LANDED_SAFE, f"Safe soft touchdown on valley field at x={self.state.x:.1f}m.")
            else:
                if abs(alpha) > cfg.alpha_stall:
                    self.state.status = FlightStatus.CRASHED_STALL
                    self._record_event(FlightStatus.CRASHED_STALL, f"Crashed into terrain following aerodynamic stall. Impact v_y={impact_speed:.1f} m/s.")
                else:
                    self.state.status = FlightStatus.CRASHED_HARD
                    self._record_event(FlightStatus.CRASHED_HARD, f"Hard impact crash at x={self.state.x:.1f}m. Impact v_y={impact_speed:.1f} m/s, pitch={pitch_deg:.1f}°.")
            return

        # Out of bounds or timeout
        if self.state.x < -10.0 or self.state.y > 100.0 or self.state.x > 350.0:
            self.state.status = FlightStatus.OUT_OF_BOUNDS
            self._record_event(FlightStatus.OUT_OF_BOUNDS, f"Flight departed valley boundaries at ({self.state.x:.1f}, {self.state.y:.1f})m.")
            return

        if self.state.time >= cfg.max_time:
            self.state.status = FlightStatus.TIME_EXPIRED
            self._record_event(FlightStatus.TIME_EXPIRED, f"Episode time limit reached ({cfg.max_time:.1f}s).")

    def _is_terminal(self, status: FlightStatus) -> bool:
        return status in (
            FlightStatus.LANDED_TARGET,
            FlightStatus.LANDED_SAFE,
            FlightStatus.CRASHED_HARD,
            FlightStatus.CRASHED_STALL,
            FlightStatus.OUT_OF_BOUNDS,
            FlightStatus.TIME_EXPIRED
        )

    def _record_event(self, status: FlightStatus, message: str) -> None:
        evt = FlightEvent(
            timestamp=self.state.time,
            status=status,
            message=message,
            altitude=self.state.y,
            x_pos=self.state.x,
            airspeed=math.hypot(self.state.u, self.state.v)
        )
        self.events.append(evt)

    def _compute_telemetry(self, amp: float, freq: float, tail: float) -> FlightTelemetry:
        v_inf = max(0.5, math.hypot(self.state.u - self.wind_x, self.state.v - self.wind_y))
        gamma = math.atan2(self.state.v - self.wind_y, self.state.u - self.wind_x)
        alpha = self.state.theta - gamma
        return FlightTelemetry(
            airspeed=v_inf,
            groundspeed=math.hypot(self.state.u, self.state.v),
            angle_of_attack=alpha,
            flight_path_angle=gamma,
            lift_total=0.0,
            drag_total=0.0,
            thrust_flap=0.0,
            lift_flap=0.0,
            pitch_moment=0.0,
            power_instantaneous=0.0,
            wing_stroke_angle=0.0
        )
