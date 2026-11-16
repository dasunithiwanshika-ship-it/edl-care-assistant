"""
Outage Services Endpoints for EDL Care Assistant Prototype
Provides simulated power breakdown and planned maintenance grid data with geographic coordinates.
"""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.db_models import Outage
from backend.app.schemas import OutageItem

router = APIRouter(prefix="/api/outages", tags=["Outages"])

@router.get("", response_model=List[OutageItem])
def list_outages(db: Session = Depends(get_db)):
    """Returns all simulated planned and breakdown power disruptions."""
    outages = db.query(Outage).all()
    return [
        OutageItem(
            id=o.id,
            outage_code=o.outage_code,
            area=o.area,
            district=o.district,
            feeder_name=o.feeder_name,
            outage_type=o.outage_type,
            affected_customers=o.affected_customers,
            start_time=o.start_time,
            estimated_restoration=o.estimated_restoration,
            status=o.status,
            latitude=o.latitude,
            longitude=o.longitude,
            reason=o.reason
        )
        for o in outages
    ]

@router.get("/areas")
def list_outage_areas(db: Session = Depends(get_db)):
    """Returns distinct districts and areas affected by power interruptions."""
    districts = db.query(Outage.district).distinct().all()
    return {"districts": [d[0] for d in districts]}
