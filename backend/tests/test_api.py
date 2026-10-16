"""Unit tests for FastAPI endpoints."""
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    """Verify health endpoint returns healthy status and cuda diagnostics."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "cuda_available" in data
    assert "device_name" in data

def test_machines_endpoint():
    """Verify machine registry returns historical machines with capabilities."""
    response = client.get("/api/machines")
    assert response.status_code == 200
    machines = response.json()
    assert len(machines) >= 3
    ornithopter = next((m for m in machines if m["id"] == "ornithopter_codex"), None)
    assert ornithopter is not None
    assert ornithopter["capabilities"]["simulation"] is True
    assert ornithopter["capabilities"]["rl_training"] is True

def test_simulation_reset_and_step():
    """Verify simulation reset and step endpoints."""
    reset_resp = client.post("/api/simulation/reset", json={"wind_x": 1.0, "wind_y": 0.0})
    assert reset_resp.status_code == 200
    reset_data = reset_resp.json()
    assert reset_data["state"]["x"] == 0.0
    assert reset_data["state"]["y"] == 25.0

    step_resp = client.post("/api/simulation/step", json={
        "amplitude": 0.4,
        "frequency": 2.0,
        "tail_pitch": -0.05
    })
    assert step_resp.status_code == 200
    step_data = step_resp.json()
    assert step_data["state"]["x"] > 0.0
    assert "telemetry" in step_data

def test_run_baseline_simulation():
    """Verify full baseline simulation run produces full trajectory."""
    run_resp = client.post("/api/simulation/run", json={
        "controller": "baseline",
        "wind_x": 0.5,
        "wind_y": 0.0,
        "max_steps": 200
    })
    assert run_resp.status_code == 200
    run_data = run_resp.json()
    assert run_data["controller"] == "baseline"
    assert len(run_data["trajectory"]) > 0
    assert run_data["final_x"] > 0.0

def test_training_status_endpoint():
    """Verify training status endpoint."""
    resp = client.get("/api/training/status")
    assert resp.status_code == 200
    data = resp.json()
    assert "is_training" in data
    assert "policy_available" in data
