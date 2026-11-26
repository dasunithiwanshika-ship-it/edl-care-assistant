"""
Customer Services & Billing Endpoints for EDL Care Assistant (MongoDB Atlas)
Enforces strict account isolation, customer ownership, and immutable payment ledger persistence.
"""

from typing import List, Dict, Any
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pymongo.database import Database
from backend.app.mongo_db import get_db, clean_doc, clean_docs
from backend.app.schemas import (
    CustomerProfile, BillDetail, ConsumptionHistoryItem, PaymentRequest, PaymentResponse
)
from backend.app.auth import require_authenticated_account

router = APIRouter(prefix="/api/customers", tags=["Customer Services"])

@router.get("/me", response_model=CustomerProfile)
def get_my_account(account: dict = Depends(require_authenticated_account)):
    """Returns the authenticated customer's account summary."""
    cust = account.get("customer") or {}
    return CustomerProfile(
        id=cust.get("id", account.get("customer_id", 0)),
        username=cust.get("username", "customer"),
        email=cust.get("email", ""),
        full_name=cust.get("full_name", "Valued Customer"),
        phone=cust.get("phone", ""),
        account_number=account["account_number"],
        premises_address=account["premises_address"],
        tariff_category=account.get("tariff_category", "Domestic (D-1)"),
        connected_feeder=account.get("connected_feeder", "Feeder F-04 Havelock"),
        substation_code=account.get("substation_code", "TR-402 (Nugegoda)"),
        outstanding_balance=account.get("outstanding_balance", 0.0),
        due_date=account.get("due_date", "2026-11-25"),
        monthly_consumption_kwh=account.get("monthly_consumption_kwh", 0),
        monthly_average_kwh=account.get("monthly_average_kwh", 0),
        is_solar=bool(account.get("is_solar", False)),
        solar_capacity_kw=account.get("solar_capacity_kw", 0.0)
    )

@router.get("/me/bills", response_model=List[BillDetail])
def get_my_bills(
    account: dict = Depends(require_authenticated_account),
    db: Database = Depends(get_db)
):
    """Returns all billing statements belonging strictly to the authenticated customer."""
    bills = list(db.bills.find({"account_id": account["id"]}).sort("id", -1))
    return [
        BillDetail(
            id=b.get("id", 0),
            billing_month=b["billing_month"],
            previous_reading=b.get("previous_reading", 0),
            present_reading=b.get("present_reading", 0),
            units_consumed=b.get("units_consumed", 0),
            energy_charge=b.get("energy_charge", 0.0),
            fixed_charge=b.get("fixed_charge", 0.0),
            fuel_adjustment=b.get("fuel_adjustment", 0.0),
            total_amount=b.get("total_amount", 0.0),
            due_date=b.get("due_date", ""),
            is_paid=bool(b.get("is_paid", False))
        )
        for b in bills
    ]

@router.get("/me/consumption", response_model=List[ConsumptionHistoryItem])
def get_my_consumption(
    account: dict = Depends(require_authenticated_account),
    db: Database = Depends(get_db)
):
    """Returns 12-month historical electricity consumption records."""
    records = list(db.consumption_records.find({"account_id": account["id"]}).sort("id", 1))
    return [
        ConsumptionHistoryItem(
            month=r["month"],
            year=r.get("year", 2026),
            units_kwh=r.get("units_kwh", 0),
            amount_lkr=r.get("amount_lkr", 0.0)
        )
        for r in records
    ]

@router.post("/me/pay", response_model=PaymentResponse)
def pay_bill(
    req: PaymentRequest,
    account: dict = Depends(require_authenticated_account),
    db: Database = Depends(get_db)
):
    """
    Demonstration Instant Payment:
    Deducts balance in MongoDB, marks active bill as paid,
    and saves an immutable transaction record to payment_transactions collection.
    """
    # Enforce account ownership
    if req.account_number != account["account_number"]:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You cannot pay a bill for another customer's account."
        )

    # Calculate deduction
    current_balance = account.get("outstanding_balance", 0.0)
    amount_paid = min(req.amount, current_balance)
    new_balance = max(0.0, current_balance - req.amount)

    # Update account in MongoDB
    db.accounts.update_one(
        {"account_number": account["account_number"]},
        {"$set": {
            "outstanding_balance": new_balance,
            "last_payment_amount": req.amount,
            "last_payment_date": "Today"
        }}
    )

    # Mark latest bill as paid if balance cleared
    if new_balance == 0.0:
        latest_bill = db.bills.find_one({"account_id": account["id"]}, sort=[("id", -1)])
        if latest_bill:
            db.bills.update_one({"_id": latest_bill["_id"]}, {"$set": {"is_paid": True}})

    # Generate immutable transaction ledger record
    tx_id = f"PAY-EDL-{uuid.uuid4().hex[:8].upper()}"
    tx_doc = {
        "transaction_id": tx_id,
        "account_number": account["account_number"],
        "account_id": account["id"],
        "customer_id": account.get("customer_id"),
        "amount_requested": req.amount,
        "amount_paid": amount_paid,
        "remaining_balance": new_balance,
        "payment_method": req.payment_method.lower(),
        "status": "SUCCESS",
        "created_at": datetime.utcnow()
    }
    db.payment_transactions.insert_one(tx_doc)

    return PaymentResponse(
        status="SUCCESS",
        transaction_id=tx_id,
        amount_paid=amount_paid,
        remaining_balance=new_balance,
        message=f"Payment of Rs. {amount_paid:,.2f} processed successfully via {req.payment_method.upper()}."
    )
