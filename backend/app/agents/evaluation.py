"""Deterministic Evaluation and Benchmarking Suite comparing Baseline vs PPO."""
import os
import json
import argparse
import numpy as np
from typing import Dict, Any, List, Optional

from backend.app.simulation.ornithopter_env import OrnithopterEnv
from backend.app.agents.baseline_controller import BaselineController
from backend.app.agents.policy import RLPolicyWrapper, DEFAULT_MODEL_PATH
from backend.app.simulation.events import FlightStatus

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DEFAULT_RESULTS_PATH = os.path.join(ROOT_DIR, "results", "evaluation_benchmark.json")

def evaluate_controller(
    controller_type: str,
    episodes: int = 20,
    policy_path: Optional[str] = None,
    base_seed: int = 100
) -> Dict[str, Any]:
    """
    Evaluates either 'baseline' or 'rl' across standard seeds.
    Returns comprehensive evaluation statistics.
    """
    env = OrnithopterEnv()
    baseline = BaselineController() if controller_type == "baseline" else None
    rl_policy = None

    if controller_type == "rl":
        rl_policy = RLPolicyWrapper(model_path=policy_path or DEFAULT_MODEL_PATH)
        if not rl_policy.is_available():
            return {
                "controller": "rl",
                "available": False,
                "error": "RL Policy model not found or untrained."
            }

    episode_records: List[Dict[str, Any]] = []

    for ep in range(episodes):
        seed = base_seed + ep
        # Generate varied wind conditions for test robustness
        rng = np.random.default_rng(seed)
        wind_x = float(rng.uniform(-2.5, 2.5))  # -2.5 m/s headwind to +2.5 m/s tailwind
        wind_y = float(rng.uniform(-0.5, 0.5))

        obs, info = env.reset(seed=seed, options={"wind_x": wind_x, "wind_y": wind_y})
        done = False
        total_reward = 0.0
        steps = 0
        trajectory = []

        while not done:
            if controller_type == "baseline":
                amp, freq, tail = baseline.get_action(env.engine.state, wind_x=wind_x)
                # Map to normalized action space for env.step
                a0 = 2.0 * (amp - env.cfg.min_amplitude) / (env.cfg.max_amplitude - env.cfg.min_amplitude) - 1.0
                a1 = 2.0 * (freq - env.cfg.min_frequency) / (env.cfg.max_frequency - env.cfg.min_frequency) - 1.0
                a2 = tail / env.cfg.max_tail_pitch
                action = np.array([a0, a1, a2], dtype=np.float32)
            else:
                amp, freq, tail = rl_policy.get_action_from_obs(obs, deterministic=True)
                a0 = 2.0 * (amp - env.cfg.min_amplitude) / (env.cfg.max_amplitude - env.cfg.min_amplitude) - 1.0
                a1 = 2.0 * (freq - env.cfg.min_frequency) / (env.cfg.max_frequency - env.cfg.min_frequency) - 1.0
                a2 = tail / env.cfg.max_tail_pitch
                action = np.array([a0, a1, a2], dtype=np.float32)

            obs, reward, terminated, truncated, info = env.step(action)
            total_reward += reward
            steps += 1

            if steps % 10 == 0 or terminated or truncated:
                trajectory.append({
                    "x": round(float(env.engine.state.x), 2),
                    "y": round(float(env.engine.state.y), 2),
                    "airspeed": round(float(info["airspeed"]), 2)
                })

            done = terminated or truncated

        final_state = env.engine.state
        status = final_state.status.value

        episode_records.append({
            "episode": ep + 1,
            "seed": seed,
            "wind_x": round(wind_x, 2),
            "wind_y": round(wind_y, 2),
            "final_x": round(float(final_state.x), 2),
            "final_y": round(float(final_state.y), 2),
            "flight_time": round(float(final_state.time), 2),
            "energy_consumed": round(float(final_state.energy_consumed), 1),
            "status": status,
            "reward": round(float(total_reward), 2),
            "is_success": status in (FlightStatus.LANDED_TARGET.value, FlightStatus.LANDED_SAFE.value),
            "is_target_hit": status == FlightStatus.LANDED_TARGET.value,
            "trajectory": trajectory
        })

    # Aggregate statistics
    total = len(episode_records)
    target_hits = sum(1 for r in episode_records if r["is_target_hit"])
    safe_landings = sum(1 for r in episode_records if r["is_success"])
    crashes = sum(1 for r in episode_records if "crashed" in r["status"])
    out_of_bounds = sum(1 for r in episode_records if r["status"] == "out_of_bounds")
    success_rate = (safe_landings / total) * 100.0 if total > 0 else 0.0
    target_rate = (target_hits / total) * 100.0 if total > 0 else 0.0

    mean_dist = float(np.mean([r["final_x"] for r in episode_records]))
    mean_time = float(np.mean([r["flight_time"] for r in episode_records]))
    mean_energy = float(np.mean([r["energy_consumed"] for r in episode_records]))
    mean_reward = float(np.mean([r["reward"] for r in episode_records]))

    return {
        "controller": controller_type,
        "available": True,
        "episodes_tested": total,
        "success_rate_pct": round(success_rate, 1),
        "target_arrival_rate_pct": round(target_rate, 1),
        "target_landings": target_hits,
        "safe_landings": safe_landings,
        "crashes": crashes,
        "out_of_bounds": out_of_bounds,
        "mean_flight_distance_m": round(mean_dist, 2),
        "mean_flight_time_s": round(mean_time, 2),
        "mean_energy_joules": round(mean_energy, 1),
        "mean_reward": round(mean_reward, 2),
        "episodes": episode_records
    }

def run_comparative_benchmark(
    episodes: int = 20,
    policy_path: Optional[str] = None,
    output_path: str = DEFAULT_RESULTS_PATH
) -> Dict[str, Any]:
    """Run head-to-head comparison between baseline and RL policy under identical conditions."""
    print(f"[Benchmark] Evaluating Rule-Based Baseline across {episodes} episodes...")
    baseline_results = evaluate_controller("baseline", episodes=episodes, base_seed=200)

    print(f"[Benchmark] Evaluating PPO Policy across {episodes} episodes...")
    rl_results = evaluate_controller("rl", episodes=episodes, policy_path=policy_path, base_seed=200)

    benchmark = {
        "benchmark_timestamp": np.datetime64("now").astype(str),
        "episodes_per_controller": episodes,
        "baseline": baseline_results,
        "rl_policy": rl_results
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(benchmark, f, indent=2)

    print(f"[Benchmark] Results saved to: {output_path}")
    return benchmark

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate flight controllers")
    parser.add_argument("--episodes", type=int, default=20, help="Episodes per evaluation run")
    parser.add_argument("--policy-path", type=str, default=DEFAULT_MODEL_PATH, help="PPO checkpoint path")
    parser.add_argument("--output", type=str, default=DEFAULT_RESULTS_PATH, help="Benchmark output json")
    args = parser.parse_args()

    run_comparative_benchmark(episodes=args.episodes, policy_path=args.policy_path, output_path=args.output)
