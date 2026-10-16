export interface MachineCapabilities {
  drawing_display: boolean;
  reconstruction_3d: boolean;
  mechanism_explanation: boolean;
  simulation: boolean;
  rl_training: boolean;
}

export interface Machine {
  id: string;
  name: string;
  category: string;
  historical_period: string;
  source_folio: string;
  description: string;
  image_url: string;
  cutout_url?: string;
  capabilities: MachineCapabilities;
  specifications: Record<string, string>;
}

export interface AircraftState {
  x: number;
  y: number;
  u: number;
  v: number;
  theta: number;
  q: number;
  phi: number;
  time: number;
  energy_consumed: number;
  status: string;
}

export interface FlightTelemetry {
  airspeed: number;
  groundspeed: number;
  angle_of_attack: number;
  flight_path_angle: number;
  lift_total: number;
  drag_total: number;
  thrust_flap: number;
  lift_flap: number;
  pitch_moment: number;
  power_instantaneous: number;
  wing_stroke_angle: number;
}

export interface TrajectoryPoint {
  x: number;
  y: number;
  u: number;
  v: number;
  theta: number;
  wing_stroke: number;
  airspeed: number;
  time: number;
}

export interface FlightEvent {
  timestamp: number;
  status: string;
  message: string;
  altitude: number;
  x: number;
}

export interface SimulationStepResponse {
  state: AircraftState;
  telemetry: FlightTelemetry;
  is_terminal: boolean;
}

export interface RunSimulationResponse {
  controller: string;
  final_status: string;
  final_x: number;
  final_y: number;
  flight_time: number;
  energy_consumed: number;
  trajectory: TrajectoryPoint[];
  events: FlightEvent[];
}

export interface TrainingStatus {
  is_training: boolean;
  current_timesteps: number;
  total_timesteps: number;
  progress_pct: number;
  elapsed_seconds: number;
  fps: number;
  mean_reward: number;
  policy_available: boolean;
  message: string;
}

export interface EpisodeBenchmark {
  episode: number;
  seed: number;
  wind_x: number;
  wind_y: number;
  final_x: number;
  final_y: number;
  flight_time: number;
  energy_consumed: number;
  status: string;
  reward: number;
  is_success: boolean;
  is_target_hit: boolean;
  trajectory: Array<{ x: number; y: number; airspeed: number }>;
}

export interface ControllerBenchmark {
  controller: string;
  available: boolean;
  error?: string;
  episodes_tested: number;
  success_rate_pct: number;
  target_arrival_rate_pct: number;
  target_landings: number;
  safe_landings: number;
  crashes: number;
  out_of_bounds: number;
  mean_flight_distance_m: number;
  mean_flight_time_s: number;
  mean_energy_joules: number;
  mean_reward: number;
  episodes?: EpisodeBenchmark[];
}

export interface BenchmarkData {
  benchmark_timestamp?: string;
  episodes_per_controller: number;
  baseline: ControllerBenchmark;
  rl_policy: ControllerBenchmark;
}

export interface AnnotationItem {
  x: number;
  y: number;
  label: string;
  description?: string;
}

export interface UserArtifact {
  id: string;
  title: string;
  category: string;
  notes?: string;
  filename: string;
  image_url: string;
  created_at: string;
  matched_machine_id?: string;
  is_simulation_supported: boolean;
  capability_diagnostics: {
    status: string;
    message: string;
    available_features?: string[];
    missing_capabilities?: string[];
  };
  annotations: AnnotationItem[];
}
