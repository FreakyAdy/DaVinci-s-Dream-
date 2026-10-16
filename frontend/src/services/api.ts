import type {
  Machine,
  SimulationStepResponse,
  RunSimulationResponse,
  TrainingStatus,
  BenchmarkData,
  UserArtifact
} from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000';

export async function checkBackendHealth(): Promise<{ status: string; cuda_available: boolean; device_name: string; policy_loaded: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch {
    return {
      status: 'offline',
      cuda_available: false,
      device_name: 'Unavailable (Offline)',
      policy_loaded: false
    };
  }
}

export async function fetchMachines(): Promise<Machine[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/machines`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Could not fetch machines from backend, using default registry:', err);
    return [
      {
        id: 'ornithopter_codex',
        name: 'Ornithopter (Volatilio Meccanica)',
        category: 'flight',
        historical_period: 'c. 1505',
        source_folio: 'Codex on the Flight of Birds, Folio 8v',
        description: 'Articulated mechanical flapping-wing aircraft with bat-like canvas wings, stirrup pedal linkages, and a directional tail rudder.',
        image_url: '/assets/hero/ornithopter_blueprint.jpg',
        cutout_url: '/assets/illustrations/ornithopter_side.jpg',
        capabilities: {
          drawing_display: true,
          reconstruction_3d: true,
          mechanism_explanation: true,
          simulation: true,
          rl_training: true
        },
        specifications: {
          Wingspan: '10.5 meters',
          'Wing Area': '16.0 m²',
          Weight: '85 kg (structure + human pilot)',
          Kinematics: 'Reciprocal flapping with flexible trailing-edge twist',
          Powerplant: 'Reciprocal human leg stirrup and hand winch'
        }
      },
      {
        id: 'mechanical_knight',
        name: 'Automaton Knight (Cavaliere Meccanico)',
        category: 'automata',
        historical_period: 'c. 1495',
        source_folio: 'Codex Atlanticus, Folio 579r',
        description: 'Humanoid mechanical automaton encased in armor. Internal cable-and-pulley linkages allow standing, sitting, and waving arms.',
        image_url: '/assets/archive/mechanical_knight.jpg',
        capabilities: {
          drawing_display: true,
          reconstruction_3d: false,
          mechanism_explanation: true,
          simulation: false,
          rl_training: false
        },
        specifications: {
          Structure: 'Jointed wood, leather cords, steel wire',
          Actuation: 'Clockwork drum, weight-driven escapement',
          Status: 'Historical archive drawing only. Dynamic simulator in future release.'
        }
      },
      {
        id: 'aerial_screw',
        name: 'Aerial Screw (Vite Aerea)',
        category: 'rotorcraft',
        historical_period: 'c. 1489',
        source_folio: 'Manuscript B, Folio 83v',
        description: 'Helical rotor precursor to modern helicopters. A linen spiral wrapped around a vertical mast, propelled by four operators.',
        image_url: '/assets/archive/aerial_screw.jpg',
        capabilities: {
          drawing_display: true,
          reconstruction_3d: false,
          mechanism_explanation: true,
          simulation: false,
          rl_training: false
        },
        specifications: {
          'Rotor Diameter': 'Approx. 4.8 meters',
          'Lifting Surface': 'Starch-sealed linen fabric',
          Status: 'Historical archive drawing only. Aerodynamic CFD model planned.'
        }
      }
    ];
  }
}

export async function resetSimulation(params: {
  wind_x?: number;
  wind_y?: number;
  initial_altitude?: number;
  initial_speed?: number;
}): Promise<SimulationStepResponse> {
  const res = await fetch(`${API_BASE_URL}/api/simulation/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error(`Reset error: ${res.statusText}`);
  return await res.json();
}

export async function stepSimulation(params: {
  amplitude: number;
  frequency: number;
  tail_pitch: number;
}): Promise<SimulationStepResponse> {
  const res = await fetch(`${API_BASE_URL}/api/simulation/step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error(`Step error: ${res.statusText}`);
  return await res.json();
}

export async function runSimulation(params: {
  controller: 'manual' | 'baseline' | 'rl';
  wind_x: number;
  wind_y: number;
  manual_amplitude?: number;
  manual_frequency?: number;
  manual_tail_pitch?: number;
  max_steps?: number;
}): Promise<RunSimulationResponse> {
  const res = await fetch(`${API_BASE_URL}/api/simulation/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || `Run error: ${res.statusText}`);
  }
  return await res.json();
}

export async function startTraining(timesteps = 50000, lr = 0.0003): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE_URL}/api/training/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timesteps, learning_rate: lr, seed: 42 })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || `Training start error: ${res.statusText}`);
  }
  return await res.json();
}

export async function fetchTrainingStatus(): Promise<TrainingStatus> {
  const res = await fetch(`${API_BASE_URL}/api/training/status`);
  if (!res.ok) throw new Error(`Status error: ${res.statusText}`);
  return await res.json();
}

export async function runEvaluation(episodes = 20): Promise<BenchmarkData> {
  const res = await fetch(`${API_BASE_URL}/api/evaluation/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ episodes })
  });
  if (!res.ok) throw new Error(`Evaluation error: ${res.statusText}`);
  return await res.json();
}

export async function fetchLatestEvaluation(): Promise<BenchmarkData> {
  const res = await fetch(`${API_BASE_URL}/api/evaluation/latest`);
  if (!res.ok) throw new Error(`Fetch benchmark error: ${res.statusText}`);
  return await res.json();
}

export async function uploadSketch(formData: FormData): Promise<UserArtifact> {
  const res = await fetch(`${API_BASE_URL}/api/artifacts/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error(`Upload error: ${res.statusText}`);
  return await res.json();
}

export async function fetchArtifacts(): Promise<UserArtifact[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/artifacts`);
    if (!res.ok) throw new Error(`Artifact fetch error: ${res.statusText}`);
    return await res.json();
  } catch {
    return [];
  }
}
