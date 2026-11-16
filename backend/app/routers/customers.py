"""
Customer Services & Billing Endpoints for EDL Care Assistant
Enforces account isolation: customers can only view their own bills, records, and balances.
"""

from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.db_models import Account, Bill, ConsumptionRecord
from backend.app.schemas import (
    CustomerProfile, BillDetail, ConsumptionHistoryItem, PaymentRequest, PaymentResponse
)
from backend.app.auth import require_authenticated_account

router = APIRouter(prefix="/api/customers", tags=["Customer Services"])

@router.get("/me", response_model=CustomerProfile)
def get_my_account(account: Account = Depends(require_authenticated_account)):
    """Returns the authenticated customer's account summary."""
    cust = account.customer
    return CustomerProfile(
        id=cust.id,
        username=cust.username,
        email=cust.email,
        full_name=cust.full_name,
        phone=cust.phone,
        account_number=account.account_number,
        premises_address=account.premises_address,
        tariff_category=account.tariff_category,
        connected_feeder=account.connected_feeder,
        substation_code=account.substation_code,
        outstanding_balance=account.outstanding_balance,
        due_date=account.due_date,
        monthly_consumption_kwh=account.monthly_consumption_kwh,
        monthly_average_kwh=account.monthly_average_kwh,
        is_solar=account.is_solar,
        solar_capacity_kw=account.solar_capacity_kw
    )

@router.get("/me/bills", response_model=List[BillDetail])
def get_my_bills(
    account: Account = Depends(require_authenticated_account),
    db: Session = Depends(get_db)
):
    """Returns all billing statements belonging to the authenticated customer."""
    bills = db.query(Bill).filter(Bill.account_id == account.id).order_by(Bill.id.desc()).all()
    return [
        BillDetail(
            id=b.id,
            billing_month=b.billing_month,
            previous_reading=b.previous_reading,
            present_reading=b.present_reading,
            units_consumed=b.units_consumed,
            energy_charge=b.energy_charge,
            fixed_charge=b.fixed_charge,
            fuel_adjustment=b.fuel_adjustment,
            total_amount=b.total_amount,
            due_date=b.due_date,
            is_paid=b.is_paid
        )
        for b in bills
    ]

@router.get("/me/consumption", response_model=List[ConsumptionHistoryItem])
def get_my_consumption(
    account: Account = Depends(require_authenticated_account),
    db: Session = Depends(get_db)
):
    """Returns 12-month historical electricity consumption records."""
    records = (
        db.query(ConsumptionRecord)
        .filter(ConsumptionRecord.account_id == account.id)
        .order_by(ConsumptionRecord.id.asc())
        .all()
    )
    return [
        ConsumptionHistoryItem(
            month=r.month,
            year=r.year,
            units_kwh=r.units_kwh,
            amount_lkr=r.amount_lkr
        )
        for r in records
    ]

@router.post("/me/pay", response_model=PaymentResponse)
def pay_bill(
    req: PaymentRequest,
    account: Account = Depends(require_authenticated_account),
    db: Session = Depends(get_db)
):
    """
    Demonstration Instant Payment:
    Deducts balance in SQLite and marks the active bill as paid.
    """
    # Enforce account ownership
    if req.account_number != account.account_number:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You cannot pay a bill for another customer's account."
        )

    # Process deduction
    amount_paid = min(req.amount, account.outstanding_balance)
    account.outstanding_balance = max(0.0, account.outstanding_balance - req.amount)
    account.last_payment_amount = req.amount
    account.last_payment_date = "Today"

    # Mark bill as paid if balance cleared
    if account.outstanding_balance == 0.0:
        latest_bill = db.query(Bill).filter(Bill.account_id == account.id).order_by(Bill.id.desc()).first()
        if latest_bill:
            latest_bill.is_paid = True

    db.commit()

    tx_id = f"PAY-EDL-{uuid.uuid4().hex[:8].upper()}"
    return PaymentResponse(
        status="SUCCESS",
        transaction_id=tx_id,
        amount_paid=amount_paid,
        remaining_balance=account.outstanding_balance,
        message=f"Payment of Rs. {amount_paid:,.2f} processed successfully via {req.payment_method.upper()}."
    )
