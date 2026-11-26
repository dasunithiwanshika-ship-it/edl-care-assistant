"""
Outage Services Endpoints for EDL Care Assistant (MongoDB Atlas)
Provides simulated power breakdown and planned maintenance grid data with geographic coordinates.
"""

from typing import List
from fastapi import APIRouter, Depends
from pymongo.database import Database
from backend.app.mongo_db import get_db, clean_docs
from backend.app.schemas import OutageItem

router = APIRouter(prefix="/api/outages", tags=["Outages"])

@router.get("", response_model=List[OutageItem])
def list_outages(db: Database = Depends(get_db)):
    """Returns all simulated planned and breakdown power disruptions."""
    outages = list(db.outages.find({}).sort("id", 1))
    return [
        OutageItem(
            id=o.get("id", 0),
            outage_code=o["outage_code"],
            area=o["area"],
            district=o["district"],
            feeder_name=o["feeder_name"],
            outage_type=o["outage_type"],
            affected_customers=o.get("affected_customers", 450),
            start_time=o.get("start_time", "Today, 09:30 AM"),
            estimated_restoration=o.get("estimated_restoration", "Today, 03:30 PM"),
            status=o.get("status", "In Progress"),
            latitude=float(o["latitude"]),
            longitude=float(o["longitude"]),
            reason=o.get("reason", "Overhead line maintenance")
        )
        for o in outages
    ]

@router.get("/areas")
def list_outage_areas(db: Database = Depends(get_db)):
    """Returns distinct districts and areas affected by power interruptions."""
    districts = db.outages.distinct("district")
    return {"districts": [d for d in districts if d]}
