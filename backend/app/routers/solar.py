"""
Solar Feeder Capacity Endpoints for EDL Care Assistant (MongoDB Atlas)
Allows customers to query rooftop solar absorption quotas by distribution transformer code.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from pymongo.database import Database
from backend.app.mongo_db import get_db
from backend.app.schemas import SolarCapacityResponse

router = APIRouter(prefix="/api/solar", tags=["Solar Services"])

@router.get("/capacity", response_model=SolarCapacityResponse)
def get_solar_capacity(
    transformer_code: str = Query(..., description="e.g. TR-402, TR-105, TR-780"),
    db: Database = Depends(get_db)
):
    """
    Checks rooftop solar PV hosting capacity for a distribution substation transformer.
    Returns available capacity in kW and threshold status.
    """
    code_clean = transformer_code.strip().upper()
    tr = db.solar_transformers.find_one({"transformer_code": code_clean})

    if not tr:
        # Partial match
        tr = db.solar_transformers.find_one({
            "transformer_code": {"$regex": code_clean, "$options": "i"}
        })

    if not tr:
        # Default simulated demonstration transformer response if unrecognized code
        return SolarCapacityResponse(
            transformer_code=transformer_code.upper(),
            area="Western Province Central",
            district="Colombo",
            feeder_name="Distribution Feeder",
            total_capacity_kva=160.0,
            used_capacity_kva=80.0,
            remaining_capacity_kw=40.0,
            max_threshold_pct=80.0,
            status="Capacity Available (Simulated)",
            is_available=True
        )

    remaining = float(tr.get("remaining_capacity_kw", 0.0))
    status_str = tr.get("status", "")
    is_avail = remaining > 0.0 and "Exceeded" not in status_str

    return SolarCapacityResponse(
        transformer_code=tr["transformer_code"],
        area=tr["area"],
        district=tr.get("district", "Colombo"),
        feeder_name=tr.get("feeder_name", "Feeder"),
        total_capacity_kva=float(tr.get("total_capacity_kva", 160.0)),
        used_capacity_kva=float(tr.get("used_capacity_kva", 80.0)),
        remaining_capacity_kw=remaining,
        max_threshold_pct=float(tr.get("max_threshold_pct", 80.0)),
        status=status_str,
        is_available=is_avail
    )

@router.get("/transformers", response_model=List[SolarCapacityResponse])
def list_transformers(db: Database = Depends(get_db)):
    """Lists all demo solar substation transformers."""
    transformers = list(db.solar_transformers.find({}).sort("id", 1))
    return [
        SolarCapacityResponse(
            transformer_code=tr["transformer_code"],
            area=tr["area"],
            district=tr.get("district", "Colombo"),
            feeder_name=tr.get("feeder_name", "Feeder"),
            total_capacity_kva=float(tr.get("total_capacity_kva", 160.0)),
            used_capacity_kva=float(tr.get("used_capacity_kva", 80.0)),
            remaining_capacity_kw=float(tr.get("remaining_capacity_kw", 0.0)),
            max_threshold_pct=float(tr.get("max_threshold_pct", 80.0)),
            status=tr.get("status", ""),
            is_available=(float(tr.get("remaining_capacity_kw", 0.0)) > 0.0 and "Exceeded" not in tr.get("status", ""))
        )
        for tr in transformers
    ]
