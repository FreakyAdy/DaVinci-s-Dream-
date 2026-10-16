"""Machine Registry and Sketch Intake API Router."""
import os
import json
import shutil
import time
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel

from backend.app.simulation.configuration import MACHINE_REGISTRY

router = APIRouter(prefix="/api", tags=["Artifacts & Registry"])

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
UPLOAD_DIR = os.path.join(ROOT_DIR, "public", "assets", "uploads")
ARTIFACTS_META_PATH = os.path.join(ROOT_DIR, "results", "user_artifacts.json")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.dirname(ARTIFACTS_META_PATH), exist_ok=True)

class AnnotationItem(BaseModel):
    x: float
    y: float
    label: str
    description: Optional[str] = None

class ArtifactMetadata(BaseModel):
    id: str
    title: str
    category: str
    notes: Optional[str] = ""
    filename: str
    image_url: str
    created_at: str
    matched_machine_id: Optional[str] = None
    is_simulation_supported: bool
    capability_diagnostics: Dict[str, Any]
    annotations: List[AnnotationItem] = []

def _load_artifacts() -> List[Dict[str, Any]]:
    if os.path.exists(ARTIFACTS_META_PATH):
        try:
            with open(ARTIFACTS_META_PATH, "r") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def _save_artifacts(artifacts: List[Dict[str, Any]]):
    with open(ARTIFACTS_META_PATH, "w") as f:
        json.dump(artifacts, f, indent=2)

@router.get("/machines", response_model=List[Dict[str, Any]])
def get_machines():
    """Retrieve full machine registry and capability matrices."""
    return MACHINE_REGISTRY

@router.get("/machines/{machine_id}")
def get_machine_by_id(machine_id: str):
    """Retrieve specific machine details."""
    for m in MACHINE_REGISTRY:
        if m["id"] == machine_id:
            return m
    raise HTTPException(status_code=404, detail="Machine not found in registry.")

@router.get("/artifacts", response_model=List[Dict[str, Any]])
def list_artifacts():
    """List uploaded drawings and sketches."""
    return _load_artifacts()

@router.post("/artifacts/upload")
async def upload_sketch(
    file: UploadFile = File(...),
    title: str = Form("Untitled Renaissance Drawing"),
    category: str = Form("flight"),
    notes: str = Form("")
):
    """
    Upload a historical invention drawing or sketch.
    Analyzes compatibility and maps to capability registry.
    """
    # Sanitize file extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".svg"]:
        ext = ".jpg"

    artifact_id = f"sketch_{int(time.time())}"
    saved_filename = f"{artifact_id}{ext}"
    saved_path = os.path.join(UPLOAD_DIR, saved_filename)

    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Capability matching
    matched_id = None
    is_supported = False
    diagnostics = {}

    cat_lower = category.lower()
    title_lower = title.lower()

    if "flight" in cat_lower or "ornithopter" in title_lower or "wing" in title_lower or "bird" in title_lower:
        matched_id = "ornithopter_codex"
        is_supported = True
        diagnostics = {
            "status": "fully_supported",
            "message": "Matched to Leonardo Flapping Ornithopter model. 2D aerodynamic simulation and 3D reconstruction active.",
            "available_features": ["2D Flight Simulation", "3D Interactive Viewport", "RL Agent Training", "Telemetry Analytics"]
        }
    elif "knight" in title_lower or "automaton" in cat_lower or "robot" in cat_lower:
        matched_id = "mechanical_knight"
        is_supported = False
        diagnostics = {
            "status": "concept_only",
            "message": "Matched to Automaton Knight in historical archive. Kinematic linkage solver planned for Phase 2 milestone.",
            "missing_capabilities": ["Dynamic Linkage Simulation", "Actuator Joint Controller", "Inverse Kinematics"]
        }
    elif "screw" in title_lower or "rotor" in cat_lower or "hydraulic" in cat_lower:
        matched_id = "aerial_screw"
        is_supported = False
        diagnostics = {
            "status": "concept_only",
            "message": "Matched to Aerial Screw helicopter codex. Helical CFD aerodynamics planned for future milestone.",
            "missing_capabilities": ["Rotary Airflow Model", "Helical Mesh Reconstruction"]
        }
    else:
        is_supported = False
        diagnostics = {
            "status": "unsupported_drawing",
            "message": "This drawing does not match currently active physics simulators. You can inspect and annotate it freely.",
            "missing_capabilities": ["Aeroelastic Kinematics", "Continuous RL Environment"]
        }

    artifact_record = {
        "id": artifact_id,
        "title": title,
        "category": category,
        "notes": notes,
        "filename": saved_filename,
        "image_url": f"/assets/uploads/{saved_filename}",
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "matched_machine_id": matched_id,
        "is_simulation_supported": is_supported,
        "capability_diagnostics": diagnostics,
        "annotations": []
    }

    artifacts = _load_artifacts()
    artifacts.insert(0, artifact_record)
    _save_artifacts(artifacts)

    return artifact_record
