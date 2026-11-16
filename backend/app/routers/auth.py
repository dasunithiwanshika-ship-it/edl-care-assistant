"""
Authentication Router for EDL Care Assistant Prototype
Provides demo login, registration, and user profile verification.
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.db_models import Customer, Account
from backend.app.schemas import LoginRequest, RegisterRequest, TokenResponse, CustomerProfile
from backend.app.auth import (
    hash_password, verify_password, create_access_token,
    require_authenticated_account, ACTIVE_TOKENS
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Demonstration Login:
    Accepts username (e.g. 'customer_low', 'customer_high', 'customer_solar')
    OR 10-digit Account Number (e.g. '0412345678', '0723456789', '0134567890').
    Demo password: 'demo123'.
    """
    # 1. Lookup customer by username or account number
    account = db.query(Account).filter(Account.account_number == req.username).first()
    customer = None
    if account:
        customer = account.customer
    else:
        customer = db.query(Customer).filter(Customer.username == req.username).first()
        if customer and customer.accounts:
            account = customer.accounts[0]

    if not customer or not verify_password(customer.hashed_password, req.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials. For demo accounts use username or account number with password 'demo123'."
        )

    acc_num = account.account_number if account else "0412345678"
    token = create_access_token(acc_num)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=customer.username,
        full_name=customer.full_name,
        account_number=acc_num,
        mode="customer"
    )

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Creates a new demo customer account in SQLite."""
    existing = db.query(Customer).filter(
        (Customer.username == req.username) | (Customer.email == req.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists.")

    new_cust = Customer(
        username=req.username,
        email=req.email,
        hashed_password=hash_password(req.password),
        full_name=req.full_name,
        phone=req.phone
    )
    db.add(new_cust)
    db.flush()

    # Generate a fictional 10-digit account number if not provided
    import random
    acc_num = req.account_number or f"04{random.randint(10000000, 99999999)}"
    new_acc = Account(
        account_number=acc_num,
        customer_id=new_cust.id,
        premises_name="Home",
        premises_address=req.premises_address or "Colombo, Sri Lanka",
        tariff_category="Domestic (D-1)",
        connected_feeder="Feeder F-04 Havelock",
        substation_code="TR-402 (Nugegoda)",
        outstanding_balance=0.0
    )
    db.add(new_acc)
    db.commit()

    token = create_access_token(acc_num)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=new_cust.username,
        full_name=new_cust.full_name,
        account_number=acc_num,
        mode="customer"
    )

@router.get("/me", response_model=CustomerProfile)
def get_current_user_profile(
    account: Account = Depends(require_authenticated_account)
):
    """Returns the authenticated customer profile and primary account details."""
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
