"""
Complaint Management Endpoints for EDL Care Assistant Prototype
Allows customers and guests to log breakdown incidents, retrieve complaint history, and track ticket status.
"""

import random
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.db_models import Complaint, Account
from backend.app.schemas import ComplaintCreate, ComplaintDetail, ComplaintUpdate
from backend.app.auth import get_current_account

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

@router.post("", response_model=ComplaintDetail)
def create_complaint(
    req: ComplaintCreate,
    current_acc: Optional[Account] = Depends(get_current_account),
    db: Session = Depends(get_db)
):
    """
    Submits a power breakdown or electricity fault complaint.
    Generates a unique tracking ticket (e.g. REF-2026-4821) and stores in SQLite.
    """
    ticket_id = f"REF-2026-{random.randint(1000, 9999)}"
    
    # Associate account if logged in or provided
    account_id = None
    if current_acc:
        account_id = current_acc.id
    elif req.account_number:
        found_acc = db.query(Account).filter(Account.account_number == req.account_number).first()
        if found_acc:
            account_id = found_acc.id

    # Determine assigned depot based on area
    area_depot = "Colombo South Area Engineer Office"
    if "kandy" in req.area.lower():
        area_depot = "Kandy Central Area Engineer Depot"
    elif "galle" in req.area.lower():
        area_depot = "Galle Regional Operations Depot"
    elif "ja-ela" in req.area.lower() or "gampaha" in req.area.lower():
        area_depot = "Gampaha North Field Depot"

    new_comp = Complaint(
        ticket_id=ticket_id,
        account_id=account_id,
        category=req.category,
        nature=req.nature,
        description=req.description or req.nature,
        area=req.area,
        phone=req.phone,
        status="IN_PROGRESS",
        assigned_depot=area_depot,
        logged_date=datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
        estimated_completion="Today by 5:00 PM"
    )
    db.add(new_comp)
    db.commit()
    db.refresh(new_comp)

    return ComplaintDetail(
        ticket_id=new_comp.ticket_id,
        account_number=req.account_number or (current_acc.account_number if current_acc else None),
        category=new_comp.category,
        nature=new_comp.nature,
        description=new_comp.description,
        area=new_comp.area,
        phone=new_comp.phone,
        status=new_comp.status,
        assigned_depot=new_comp.assigned_depot,
        logged_date=new_comp.logged_date,
        estimated_completion=new_comp.estimated_completion
    )

@router.get("", response_model=List[ComplaintDetail])
def list_complaints(
    current_acc: Optional[Account] = Depends(get_current_account),
    db: Session = Depends(get_db)
):
    """
    Returns complaints.
    If authenticated customer, returns their complaints; otherwise returns recent demonstration complaints.
    """
    if current_acc:
        comps = db.query(Complaint).filter(Complaint.account_id == current_acc.id).all()
    else:
        comps = db.query(Complaint).order_by(Complaint.id.desc()).limit(10).all()

    return [
        ComplaintDetail(
            ticket_id=c.ticket_id,
            account_number=c.account.account_number if c.account else None,
            category=c.category,
            nature=c.nature,
            description=c.description,
            area=c.area,
            phone=c.phone,
            status=c.status,
            assigned_depot=c.assigned_depot,
            logged_date=c.logged_date,
            estimated_completion=c.estimated_completion
        )
        for c in comps
    ]

@router.get("/{ticket_id}", response_model=ComplaintDetail)
def get_complaint_by_ticket(ticket_id: str, db: Session = Depends(get_db)):
    """Tracks a breakdown complaint by its unique reference number."""
    comp = db.query(Complaint).filter(Complaint.ticket_id == ticket_id.upper()).first()
    if not comp:
        raise HTTPException(
            status_code=404,
            detail=f"Complaint with ticket reference '{ticket_id}' was not found."
        )

    return ComplaintDetail(
        ticket_id=comp.ticket_id,
        account_number=comp.account.account_number if comp.account else None,
        category=comp.category,
        nature=comp.nature,
        description=comp.description,
        area=comp.area,
        phone=comp.phone,
        status=comp.status,
        assigned_depot=comp.assigned_depot,
        logged_date=comp.logged_date,
        estimated_completion=comp.estimated_completion
    )

@router.patch("/{ticket_id}", response_model=ComplaintDetail)
def update_complaint_status(
    ticket_id: str,
    update_data: ComplaintUpdate,
    db: Session = Depends(get_db)
):
    """
    Updates a complaint's status (PENDING, IN_PROGRESS, RESOLVED) and notes persistently in SQLite.
    Demonstrates lifecycle management for customer service tickets.
    """
    comp = db.query(Complaint).filter(Complaint.ticket_id == ticket_id.upper()).first()
    if not comp:
        raise HTTPException(
            status_code=404,
            detail=f"Complaint with ticket reference '{ticket_id}' was not found."
        )

    if update_data.status:
        comp.status = update_data.status.upper()
    if update_data.estimated_completion:
        comp.estimated_completion = update_data.estimated_completion
    if update_data.description:
        comp.description = f"{comp.description} | Update: {update_data.description}"

    db.commit()
    db.refresh(comp)

    return ComplaintDetail(
        ticket_id=comp.ticket_id,
        account_number=comp.account.account_number if comp.account else None,
        category=comp.category,
        nature=comp.nature,
        description=comp.description,
        area=comp.area,
        phone=comp.phone,
        status=comp.status,
        assigned_depot=comp.assigned_depot,
        logged_date=comp.logged_date,
        estimated_completion=comp.estimated_completion
    )
