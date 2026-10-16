"""Aerodynamic, environmental, and machine configuration for Da Vinci's Dream."""
from dataclasses import dataclass
from typing import Dict, Any, List

@dataclass
class OrnithopterConfig:
    # Mass and geometry
    mass: float = 85.0              # Total mass including pilot/structure (kg)
    wingspan: float = 10.5          # Total wingspan (m)
    wing_area: float = 16.0         # Wing surface area (m^2)
    chord: float = 1.6              # Mean aerodynamic chord (m)
    inertia_yy: float = 120.0       # Pitch moment of inertia (kg * m^2)

    # Aerodynamic static coefficients
    cl_0: float = 0.25              # Zero-angle lift coefficient
    cl_alpha: float = 4.2           # Lift curve slope (per radian)
    alpha_stall: float = 0.28       # Stall angle (~16 degrees)
    cd_0: float = 0.045             # Parasitic zero-lift drag coefficient
    cd_induced: float = 0.07        # Induced drag factor
    cd_stall: float = 0.85          # Post-stall drag penalty

    # Flapping aerodynamics
    cl_flap: float = 1.8            # Dynamic flapping lift effectiveness
    propulsive_eff: float = 0.65    # Flapping thrust efficiency factor
    max_amplitude: float = 0.65     # Max wing flap amplitude (radians, ~37 deg)
    min_amplitude: float = 0.05     # Min amplitude (gliding)
    max_frequency: float = 3.5      # Max flap frequency (Hz)
    min_frequency: float = 0.5      # Min flap frequency (Hz)

    # Pitch stability & tail elevator
    cm_0: float = 0.02              # Pitching moment at zero alpha
    cm_alpha: float = -0.65         # Pitch stiffness (per radian, negative = stable)
    cm_elevator: float = -1.1       # Tail elevator authority
    pitch_damping: float = 35.0     # Aerodynamic pitch damping (N*m*s/rad)
    max_tail_pitch: float = 0.35    # Max tail deflection (~20 deg)

    # Environmental limits
    air_density: float = 1.225      # Sea-level standard air density (kg/m^3)
    gravity: float = 9.80665        # Gravity (m/s^2)
    dt: float = 0.02                # Fixed numerical integration step (50 Hz)

    # Scenario parameters
    launch_altitude: float = 25.0   # Elevated launch platform height (m)
    launch_speed: float = 6.5       # Initial launch catapult glide speed (m/s)
    platform_length: float = 15.0   # Platform x-length (m)
    target_x: float = 200.0         # Target landing zone center (m)
    target_radius: float = 25.0     # Target landing zone tolerance (+/- m)
    max_time: float = 25.0          # Max episode duration in seconds


# Machine Registry
MACHINE_REGISTRY: List[Dict[str, Any]] = [
    {
        "id": "ornithopter_codex",
        "name": "Ornithopter (Volatilio Meccanica)",
        "category": "flight",
        "historical_period": "c. 1505",
        "source_folio": "Codex on the Flight of Birds, Folio 8v",
        "description": "Articulated mechanical flapping-wing aircraft with bat-like canvas wings, stirrup pedal linkages, and a directional tail rudder.",
        "image_url": "/assets/hero/ornithopter_blueprint.jpg",
        "cutout_url": "/assets/illustrations/ornithopter_side.jpg",
        "capabilities": {
            "drawing_display": True,
            "reconstruction_3d": True,
            "mechanism_explanation": True,
            "simulation": True,
            "rl_training": True
        },
        "specifications": {
            "Wingspan": "10.5 meters",
            "Wing Area": "16.0 m²",
            "Weight": "85 kg (structure + human pilot)",
            "Kinematics": "Reciprocal flapping with flexible trailing-edge twist",
            "Powerplant": "Reciprocal human leg stirrup and hand winch"
        }
    },
    {
        "id": "mechanical_knight",
        "name": "Automaton Knight (Cavaliere Meccanico)",
        "category": "automata",
        "historical_period": "c. 1495",
        "source_folio": "Codex Atlanticus, Folio 579r",
        "description": "Humanoid mechanical automaton encased in German-Italian armor. Internal cable-and-pulley linkages allow standing, sitting, raising its visor, and waving arms.",
        "image_url": "/assets/archive/mechanical_knight.jpg",
        "cutout_url": "/assets/archive/mechanical_knight.jpg",
        "capabilities": {
            "drawing_display": True,
            "reconstruction_3d": False,
            "mechanism_explanation": True,
            "simulation": False,
            "rl_training": False
        },
        "specifications": {
            "Structure": "Jointed wood, leather cords, steel wire",
            "Actuation": "Clockwork drum, weight-driven escapement",
            "Degrees of Freedom": "6 articulated joints",
            "Status": "Historical archive drawing only. Dynamic simulator in future release."
        }
    },
    {
        "id": "aerial_screw",
        "name": "Aerial Screw (Vite Aerea)",
        "category": "rotorcraft",
        "historical_period": "c. 1489",
        "source_folio": "Manuscript B, Folio 83v",
        "description": "Helical rotor precursor to modern helicopters. A linen spiral wrapped around a vertical mast, propelled by four operators rotating central wooden bars.",
        "image_url": "/assets/archive/aerial_screw.jpg",
        "cutout_url": "/assets/archive/aerial_screw.jpg",
        "capabilities": {
            "drawing_display": True,
            "reconstruction_3d": False,
            "mechanism_explanation": True,
            "simulation": False,
            "rl_training": False
        },
        "specifications": {
            "Rotor Diameter": "Approx. 4.8 meters",
            "Lifting Surface": "Starch-sealed linen fabric",
            "Drive": "Manual wooden capstan winch",
            "Status": "Historical archive drawing only. Aerodynamic CFD model planned."
        }
    }
]
