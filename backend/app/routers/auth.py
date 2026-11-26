"""
Authentication Router for EDL Care Assistant (MongoDB Atlas)
Provides secure login, registration, user profile verification, token revocation,
Bcrypt password hashing, and standard signed JWT access tokens with secure cookies.
"""

import os
import re
import random
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, Response, Request
from pymongo.database import Database
from backend.app.mongo_db import get_db, clean_doc
from backend.app.schemas import LoginRequest, RegisterRequest, TokenResponse, CustomerProfile
from backend.app.auth import (
    hash_password, verify_password, create_access_token,
    require_authenticated_account, revoke_token, extract_token_from_request
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

EMAIL_REGEX = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
SECURE_COOKIE = os.getenv("EDL_COOKIE_SECURE", "false").lower() == "true"


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, response: Response = None, db: Database = Depends(get_db)):
    """
    Demonstration & Production Login:
    Accepts:
    - 10-digit Account Number (e.g. '0412345678')
    - Username (e.g. 'customer_low')
    - Email address (e.g. 'dasuni.demo@edl.lk')
    - Phone number (e.g. '0771234567')
    Validates with Bcrypt (with legacy PBKDF2 backward compatibility).
    Returns standard signed JWT and sets an HttpOnly cookie.
    """
    clean_identifier = req.username.strip()

    # 1. Direct lookup by account number
    account = db.accounts.find_one({"account_number": clean_identifier})
    customer = None
    if account:
        customer = db.customers.find_one({"id": account["customer_id"]})
    else:
        # 2. Lookup by username, email (case-insensitive), or phone
        escaped_id = re.escape(clean_identifier)
        customer = db.customers.find_one({
            "$or": [
                {"username": {"$regex": f"^{escaped_id}$", "$options": "i"}},
                {"email": {"$regex": f"^{escaped_id}$", "$options": "i"}},
                {"phone": clean_identifier}
            ]
        })
        if customer:
            account = db.accounts.find_one({"customer_id": customer["id"]})

    if not customer or not verify_password(customer["hashed_password"], req.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials. Please verify your username, email, or account number and password."
        )

    acc_num = account["account_number"] if account else "0412345678"
    token = create_access_token(
        account_number=acc_num,
        customer_id=customer["id"],
        username=customer["username"],
        db=db
    )

    # Set secure HttpOnly cookie for web browsers
    if response is not None:
        response.set_cookie(
            key="edl_auth_token",
            value=token,
            httponly=True,
            samesite="lax",
            secure=SECURE_COOKIE,
            max_age=7 * 24 * 3600
        )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=customer["username"],
        full_name=customer["full_name"],
        account_number=acc_num,
        mode="customer"
    )


@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, response: Response = None, db: Database = Depends(get_db)):
    """
    Creates a new customer account in MongoDB Atlas with Bcrypt hashing,
    signed JWT token generation, secure cookie setting, and starter records.
    """
    # 1. Validation checks
    if not req.full_name or len(req.full_name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Full name must be at least 2 characters long.")

    norm_email = req.email.strip().lower()
    if not re.match(EMAIL_REGEX, norm_email):
        raise HTTPException(status_code=400, detail="Invalid email address format.")

    if not req.password or len(req.password.strip()) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    # 2. Duplicate checks
    existing_email = db.customers.find_one({
        "email": {"$regex": f"^{re.escape(norm_email)}$", "$options": "i"}
    })
    if existing_email:
        raise HTTPException(status_code=400, detail="An account with this email address already exists. Please sign in or use another email.")

    username = req.username.strip() if req.username else norm_email
    existing_user = db.customers.find_one({
        "username": {"$regex": f"^{re.escape(username)}$", "$options": "i"}
    })
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists. Please choose another username.")

    # 3. Determine next numeric customer ID
    last_cust = db.customers.find_one(sort=[("id", -1)])
    next_cust_id = (last_cust["id"] + 1) if last_cust and "id" in last_cust else 1

    new_cust = {
        "id": next_cust_id,
        "username": username,
        "email": norm_email,
        "hashed_password": hash_password(req.password),  # Bcrypt hash
        "full_name": req.full_name.strip(),
        "phone": req.phone.strip() if req.phone else "0771234567"
    }
    db.customers.insert_one(new_cust)

    # 4. Generate a unique fictional 10-digit account number (starting with 04)
    acc_num = req.account_number
    if not acc_num:
        while True:
            candidate = f"04{random.randint(10000000, 99999999)}"
            if not db.accounts.find_one({"account_number": candidate}):
                acc_num = candidate
                break

    last_acc = db.accounts.find_one(sort=[("id", -1)])
    next_acc_id = (last_acc["id"] + 1) if last_acc and "id" in last_acc else 1

    new_acc = {
        "id": next_acc_id,
        "account_number": acc_num,
        "customer_id": next_cust_id,
        "premises_name": "Home",
        "premises_address": req.premises_address or "Colombo, Sri Lanka",
        "tariff_category": "Domestic (D-1)",
        "connected_feeder": "Feeder F-04 Havelock",
        "substation_code": "TR-402 (Nugegoda)",
        "outstanding_balance": 3850.00,
        "due_date": "2026-11-25",
        "last_payment_amount": 0.0,
        "last_payment_date": "None",
        "monthly_consumption_kwh": 125,
        "monthly_average_kwh": 130,
        "solar_capacity_kw": 0.0,
        "is_solar": False
    }
    db.accounts.insert_one(new_acc)

    # 5. Seed initial welcome billing statement
    last_bill = db.bills.find_one(sort=[("id", -1)])
    next_bill_id = (last_bill["id"] + 1) if last_bill and "id" in last_bill else 1
    db.bills.insert_one({
        "id": next_bill_id,
        "account_id": next_acc_id,
        "billing_month": "October 2026",
        "previous_reading": 1000,
        "present_reading": 1125,
        "units_consumed": 125,
        "energy_charge": 2850.00,
        "fixed_charge": 1000.00,
        "fuel_adjustment": 0.00,
        "total_amount": 3850.00,
        "due_date": "2026-11-25",
        "is_paid": False
    })

    # 6. Seed starter 6-month historical consumption records
    recent_months = [
        ("May", 2026, 120, 3600.00),
        ("Jun", 2026, 135, 4100.00),
        ("Jul", 2026, 128, 3900.00),
        ("Aug", 2026, 140, 4250.00),
        ("Sep", 2026, 130, 4000.00),
        ("Oct", 2026, 125, 3850.00),
    ]
    last_cons = db.consumption_records.find_one(sort=[("id", -1)])
    next_cons_id = (last_cons["id"] + 1) if last_cons and "id" in last_cons else 1
    cons_docs = []
    for idx, (m, y, u, amt) in enumerate(recent_months):
        cons_docs.append({
            "id": next_cons_id + idx,
            "account_id": next_acc_id,
            "month": m,
            "year": y,
            "units_kwh": u,
            "amount_lkr": amt
        })
    if cons_docs:
        db.consumption_records.insert_many(cons_docs)

    # 7. Create signed JWT access token and set cookie
    token = create_access_token(
        account_number=acc_num,
        customer_id=next_cust_id,
        username=new_cust["username"],
        db=db
    )

    if response is not None:
        response.set_cookie(
            key="edl_auth_token",
            value=token,
            httponly=True,
            samesite="lax",
            secure=SECURE_COOKIE,
            max_age=7 * 24 * 3600
        )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        username=new_cust["username"],
        full_name=new_cust["full_name"],
        account_number=acc_num,
        mode="customer"
    )


@router.post("/logout")
def logout(
    request: Request = None,
    response: Response = None,
    authorization: Optional[str] = Header(None),
    db: Database = Depends(get_db)
):
    """Revokes the current session / JWT token and clears the secure auth cookie."""
    token = extract_token_from_request(request=request, authorization=authorization)
    revoked = False
    if token:
        revoked = revoke_token(token, db)

    # Clear cookie if response object present
    if response is not None:
        response.delete_cookie(key="edl_auth_token")

    return {
        "status": "SUCCESS",
        "message": "Session token revoked and cleared successfully.",
        "revoked": revoked
    }


@router.get("/me", response_model=CustomerProfile)
def get_current_user_profile(
    account: dict = Depends(require_authenticated_account)
):
    """Returns the authenticated customer profile and primary account details."""
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
