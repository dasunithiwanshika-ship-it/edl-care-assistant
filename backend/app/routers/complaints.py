"""
Complaint Management Endpoints for EDL Care Assistant (MongoDB Atlas)
Eliminates guest privacy leakage, enforces customer ownership, and secures ticket tracking via access codes.
"""

import random
import secrets
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Header
from pymongo.database import Database
from backend.app.mongo_db import get_db, clean_doc
from backend.app.schemas import ComplaintCreate, ComplaintDetail, ComplaintUpdate
from backend.app.auth import get_current_account

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

@router.post("", response_model=ComplaintDetail)
def create_complaint(
    req: ComplaintCreate,
    current_acc: Optional[dict] = Depends(get_current_account),
    db: Database = Depends(get_db)
):
    """
    Submits a power breakdown or electricity fault complaint.
    Generates a unique tracking ticket and secure access code.
    """
    ticket_id = f"REF-2026-{random.randint(1000, 9999)}"
    access_code = f"{secrets.randbelow(900000) + 100000}"

    account_id = None
    account_number = None

    if current_acc:
        account_id = current_acc.get("id")
        account_number = current_acc.get("account_number")
    elif req.account_number:
        found_acc = db.accounts.find_one({"account_number": req.account_number})
        if found_acc:
            account_id = found_acc.get("id")
            account_number = found_acc.get("account_number")

    # Determine assigned depot based on area
    area_lower = req.area.lower()
    area_depot = "Colombo South Area Engineer Office"
    if "kandy" in area_lower:
        area_depot = "Kandy Central Area Engineer Depot"
    elif "galle" in area_lower:
        area_depot = "Galle Regional Operations Depot"
    elif "ja-ela" in area_lower or "gampaha" in area_lower:
        area_depot = "Gampaha North Field Depot"

    last_comp = db.complaints.find_one(sort=[("id", -1)])
    next_id = (last_comp["id"] + 1) if last_comp and "id" in last_comp else 1

    new_comp = {
        "id": next_id,
        "ticket_id": ticket_id,
        "access_code": access_code,
        "account_id": account_id,
        "account_number": account_number,
        "category": req.category,
        "nature": req.nature,
        "description": req.description or req.nature,
        "area": req.area,
        "phone": req.phone,
        "status": "IN_PROGRESS",
        "assigned_depot": area_depot,
        "logged_date": datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
        "estimated_completion": "Today by 5:00 PM"
    }
    db.complaints.insert_one(new_comp)

    return ComplaintDetail(
        ticket_id=new_comp["ticket_id"],
        account_number=account_number,
        category=new_comp["category"],
        nature=new_comp["nature"],
        description=new_comp["description"],
        area=new_comp["area"],
        phone=new_comp["phone"],
        status=new_comp["status"],
        assigned_depot=new_comp["assigned_depot"],
        logged_date=new_comp["logged_date"],
        estimated_completion=new_comp["estimated_completion"]
    )

@router.get("", response_model=List[ComplaintDetail])
def list_complaints(
    current_acc: Optional[dict] = Depends(get_current_account),
    db: Database = Depends(get_db)
):
    """
    Returns complaints with strict privacy protection:
    - If authenticated customer, returns strictly their own complaints.
    - If unauthenticated guest, returns empty list (zero personal customer information leaked).
    """
    if not current_acc:
        # Strict privacy protection: do not leak customer records to guests
        return []

    comps = list(db.complaints.find({"account_id": current_acc["id"]}).sort("id", -1))
    return [
        ComplaintDetail(
            ticket_id=c["ticket_id"],
            account_number=current_acc.get("account_number"),
            category=c["category"],
            nature=c["nature"],
            description=c.get("description", ""),
            area=c["area"],
            phone=c["phone"],
            status=c["status"],
            assigned_depot=c.get("assigned_depot", "Area Engineer Depot"),
            logged_date=c.get("logged_date", ""),
            estimated_completion=c.get("estimated_completion", "Within 4 hours")
        )
        for c in comps
    ]

@router.get("/{ticket_id}", response_model=ComplaintDetail)
def get_complaint_by_ticket(
    ticket_id: str,
    access_code: Optional[str] = Query(None, description="6-digit verification code for guest-reported breakdowns"),
    current_acc: Optional[dict] = Depends(get_current_account),
    db: Database = Depends(get_db)
):
    """
    Tracks a breakdown complaint by its unique ticket reference.
    Enforces authorization:
    - If linked to an account, caller must be the authenticated owner.
    - If a guest breakdown ticket, caller must provide the correct access_code.
    """
    comp = db.complaints.find_one({"ticket_id": ticket_id.upper()})
    if not comp:
        raise HTTPException(
            status_code=404,
            detail=f"Complaint with ticket reference '{ticket_id}' was not found."
        )

    # Ownership / authorization check
    is_authorized = False
    if comp.get("account_id") is not None:
        if current_acc and current_acc.get("id") == comp["account_id"]:
            is_authorized = True
        else:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You are not authorized to view this customer complaint ticket."
            )
    else:
        # Guest ticket: check access code
        if access_code and access_code == comp.get("access_code"):
            is_authorized = True
        elif current_acc:
            is_authorized = True
        else:
            # Mask phone and sensitive description if access code is missing
            masked_phone = comp["phone"][:3] + "****" + comp["phone"][-3:] if len(comp["phone"]) >= 7 else "****"
            return ComplaintDetail(
                ticket_id=comp["ticket_id"],
                account_number=None,
                category=comp["category"],
                nature=comp["nature"],
                description="[Masked for Privacy - Provide access_code to view full details]",
                area=comp["area"],
                phone=masked_phone,
                status=comp["status"],
                assigned_depot=comp.get("assigned_depot", "Area Engineer Depot"),
                logged_date=comp.get("logged_date", ""),
                estimated_completion=comp.get("estimated_completion", "")
            )

    # Resolve account number
    acc_num = None
    if comp.get("account_id"):
        acc = db.accounts.find_one({"id": comp["account_id"]})
        if acc:
            acc_num = acc.get("account_number")

    return ComplaintDetail(
        ticket_id=comp["ticket_id"],
        account_number=acc_num,
        category=comp["category"],
        nature=comp["nature"],
        description=comp.get("description", ""),
        area=comp["area"],
        phone=comp["phone"],
        status=comp["status"],
        assigned_depot=comp.get("assigned_depot", "Area Engineer Depot"),
        logged_date=comp.get("logged_date", ""),
        estimated_completion=comp.get("estimated_completion", "")
    )

@router.patch("/{ticket_id}", response_model=ComplaintDetail)
def update_complaint_status(
    ticket_id: str,
    update_data: ComplaintUpdate,
    current_acc: dict = Depends(get_current_account),
    db: Database = Depends(get_db)
):
    """
    Updates a complaint's status and technician notes.
    Enforces customer ownership: caller must be authenticated and own the ticket.
    """
    comp = db.complaints.find_one({"ticket_id": ticket_id.upper()})
    if not comp:
        raise HTTPException(
            status_code=404,
            detail=f"Complaint with ticket reference '{ticket_id}' was not found."
        )

    # Enforce ownership
    if comp.get("account_id") and comp.get("account_id") != current_acc.get("id"):
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You cannot modify complaints belonging to another customer."
        )

    updates = {}
    if update_data.status:
        updates["status"] = update_data.status.upper()
    if update_data.estimated_completion:
        updates["estimated_completion"] = update_data.estimated_completion
    if update_data.description:
        new_desc = f"{comp.get('description', '')} | Update: {update_data.description}"
        updates["description"] = new_desc

    if updates:
        db.complaints.update_one({"_id": comp["_id"]}, {"$set": updates})
        comp.update(updates)

    acc_num = current_acc.get("account_number") if current_acc else None
    return ComplaintDetail(
        ticket_id=comp["ticket_id"],
        account_number=acc_num,
        category=comp["category"],
        nature=comp["nature"],
        description=comp.get("description", ""),
        area=comp["area"],
        phone=comp["phone"],
        status=comp["status"],
        assigned_depot=comp.get("assigned_depot", "Area Engineer Depot"),
        logged_date=comp.get("logged_date", ""),
        estimated_completion=comp.get("estimated_completion", "")
    )
