"""
Solar Feeder Capacity Endpoints for EDL Care Assistant Prototype
Allows customers to query rooftop solar absorption quotas by distribution transformer code.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.db_models import SolarTransformer
from backend.app.schemas import SolarCapacityResponse

router = APIRouter(prefix="/api/solar", tags=["Solar Services"])

@router.get("/capacity", response_model=SolarCapacityResponse)
def get_solar_capacity(
    transformer_code: str = Query(..., description="e.g. TR-402, TR-105, TR-780"),
    db: Session = Depends(get_db)
):
    """
    Checks rooftop solar PV hosting capacity for a distribution substation transformer.
    Returns available capacity in kW and threshold status.
    """
    code_clean = transformer_code.strip().upper()
    tr = db.query(SolarTransformer).filter(SolarTransformer.transformer_code == code_clean).first()
    
    if not tr:
        # Check partial code match
        tr = db.query(SolarTransformer).filter(SolarTransformer.transformer_code.like(f"%{code_clean}%")).first()

    if not tr:
        # Default demonstration transformer response if unrecognized code
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

    is_avail = tr.remaining_capacity_kw > 0.0 and "Exceeded" not in tr.status
    return SolarCapacityResponse(
        transformer_code=tr.transformer_code,
        area=tr.area,
        district=tr.district,
        feeder_name=tr.feeder_name,
        total_capacity_kva=tr.total_capacity_kva,
        used_capacity_kva=tr.used_capacity_kva,
        remaining_capacity_kw=tr.remaining_capacity_kw,
        max_threshold_pct=tr.max_threshold_pct,
        status=tr.status,
        is_available=is_avail
    )

@router.get("/transformers", response_model=List[SolarCapacityResponse])
def list_transformers(db: Session = Depends(get_db)):
    """Lists all demo solar substation transformers."""
    transformers = db.query(SolarTransformer).all()
    return [
        SolarCapacityResponse(
            transformer_code=tr.transformer_code,
            area=tr.area,
            district=tr.district,
            feeder_name=tr.feeder_name,
            total_capacity_kva=tr.total_capacity_kva,
            used_capacity_kva=tr.used_capacity_kva,
            remaining_capacity_kw=tr.remaining_capacity_kw,
            max_threshold_pct=tr.max_threshold_pct,
            status=tr.status,
            is_available=(tr.remaining_capacity_kw > 0.0 and "Exceeded" not in tr.status)
        )
        for tr in transformers
    ]
