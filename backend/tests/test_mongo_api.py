"""
Comprehensive Integration Test Suite for EDL Care Assistant (MongoDB Atlas)
Verifies:
1. MongoDB Atlas connectivity & health.
2. Authentication, SHA-256 token hashing, expiration, and revocation.
3. Customer-to-customer isolation (bills, consumption, payments).
4. Payment persistence in 'payment_transactions' collection.
5. Guest privacy protection and complaint access authorization.
6. Chatbot Option C scoping, guest protection, and multilingual responses.
"""

import os
import hashlib
import pytest
from fastapi import HTTPException
from backend.app.mongo_db import get_mongo_db
from backend.app.main import health_check
from backend.app.routers.auth import login, register, logout, get_current_user_profile
from backend.app.routers.customers import get_my_account, get_my_bills, get_my_consumption, pay_bill
from backend.app.routers.complaints import (
    create_complaint, list_complaints, get_complaint_by_ticket, update_complaint_status
)
from backend.app.routers.outages import list_outages, list_outage_areas
from backend.app.routers.solar import get_solar_capacity, list_transformers
from backend.app.routers.chat import handle_chat, get_chat_history
from backend.app.schemas import (
    LoginRequest, RegisterRequest, PaymentRequest, ComplaintCreate, ComplaintUpdate,
    ChatRequest, ChatMode, Language
)
from backend.app.auth import require_authenticated_account, resolve_access_scope

@pytest.fixture(scope="module")
def mongo_db():
    """Provides MongoDB Atlas database handle."""
    db = get_mongo_db()
    yield db

# 1. Health & Atlas Connectivity
def test_health_check_mongo(mongo_db):
    """Verifies backend is healthy and connected to MongoDB Atlas."""
    res = health_check()
    assert res["status"] == "healthy"
    assert "MongoDB Atlas" in res["database"]
    assert res["database_name"] == "edl_care"
    assert "ChromaDB" in res["rag_engine"]

# 2. Authentication & Hashed Tokens
def test_auth_login_valid_username(mongo_db):
    """Verifies customer login returns valid token."""
    req = LoginRequest(username="customer_low", password="demo123")
    res = login(req, db=mongo_db)
    assert res.access_token is not None
    assert res.account_number == "0412345678"
    assert res.full_name == "Dasuni Thiwanshika Premawardana"

    # Verify token is hashed with SHA-256 in MongoDB Atlas, NOT stored as raw token!
    token_h = hashlib.sha256(res.access_token.encode('utf-8')).hexdigest()
    stored_doc = mongo_db.session_tokens.find_one({"token_hash": token_h})
    assert stored_doc is not None
    assert stored_doc["account_number"] == "0412345678"
    assert stored_doc["revoked"] is False

    # Raw token must NOT exist as plain string in database
    raw_found = mongo_db.session_tokens.find_one({"token_hash": res.access_token})
    assert raw_found is None

def test_auth_login_invalid_password(mongo_db):
    """Verifies rejection of invalid password."""
    req = LoginRequest(username="customer_low", password="wrongpassword")
    with pytest.raises(HTTPException) as exc_info:
        login(req, db=mongo_db)
    assert exc_info.value.status_code == 401

def test_auth_token_revocation(mongo_db):
    """Verifies that logout revokes session token in MongoDB."""
    req = LoginRequest(username="customer_low", password="demo123")
    res = login(req, db=mongo_db)
    auth_header = f"Bearer {res.access_token}"

    # Verify token works before logout
    acc = require_authenticated_account(authorization=auth_header, db=mongo_db)
    assert acc["account_number"] == "0412345678"

    # Revoke token
    logout_res = logout(authorization=auth_header, db=mongo_db)
    assert logout_res["status"] == "SUCCESS"
    assert logout_res["revoked"] is True

    # Verify token is now rejected
    with pytest.raises(HTTPException) as exc_info:
        require_authenticated_account(authorization=auth_header, db=mongo_db)
    assert exc_info.value.status_code == 401

# 3. Customer Data & Isolation
def test_customer_bills_isolation(mongo_db):
    """Verifies customer receives exactly their own 12 monthly statements."""
    acc = mongo_db.accounts.find_one({"account_number": "0412345678"})
    bills = get_my_bills(account=acc, db=mongo_db)
    assert len(bills) == 12
    # Verify date fixing: dates must not have month 15!
    for b in bills:
        assert "-15-" not in b.due_date
        assert "-18-" not in b.due_date

def test_customer_consumption_history(mongo_db):
    """Verifies customer consumption history (12 months)."""
    acc = mongo_db.accounts.find_one({"account_number": "0412345678"})
    records = get_my_consumption(account=acc, db=mongo_db)
    assert len(records) == 12
    assert records[0].month == "Nov"
    assert records[-1].month == "Oct"

def test_cross_customer_payment_forbidden(mongo_db):
    """Verifies Customer 1 cannot pay Customer 2's bill (ownership check)."""
    acc1 = mongo_db.accounts.find_one({"account_number": "0412345678"})
    pay_req = PaymentRequest(account_number="0723456789", amount=500.00, payment_method="card")
    with pytest.raises(HTTPException) as exc_info:
        pay_bill(req=pay_req, account=acc1, db=mongo_db)
    assert exc_info.value.status_code == 403

# 4. Payment Persistence in payment_transactions
def test_payment_persistence(mongo_db):
    """Verifies payment persists immutable transaction record in MongoDB."""
    acc = mongo_db.accounts.find_one({"account_number": "0412345678"})
    initial_balance = acc["outstanding_balance"]
    test_amount = 50.0

    pay_req = PaymentRequest(account_number="0412345678", amount=test_amount, payment_method="card")
    res = pay_bill(req=pay_req, account=acc, db=mongo_db)
    assert res.status == "SUCCESS"
    assert res.amount_paid == test_amount

    # Check payment_transactions collection in MongoDB Atlas!
    tx_doc = mongo_db.payment_transactions.find_one({"transaction_id": res.transaction_id})
    assert tx_doc is not None
    assert tx_doc["account_number"] == "0412345678"
    assert tx_doc["amount_paid"] == test_amount
    assert tx_doc["status"] == "SUCCESS"

# 5. Privacy Protection & Complaints Access Control
def test_guest_cannot_list_complaints(mongo_db):
    """CRITICAL: Verifies unauthenticated guests receive empty list (zero personal data leaked)."""
    comps = list_complaints(current_acc=None, db=mongo_db)
    assert len(comps) == 0

def test_customer_complaints_isolation(mongo_db):
    """Verifies Customer 1 only sees their own complaints."""
    acc1 = mongo_db.accounts.find_one({"account_number": "0412345678"})
    comps = list_complaints(current_acc=acc1, db=mongo_db)
    assert len(comps) >= 3
    for c in comps:
        assert c.account_number == "0412345678"

def test_cross_customer_complaint_ticket_forbidden(mongo_db):
    """Verifies Customer 1 cannot view Customer 2's complaint ticket."""
    acc1 = mongo_db.accounts.find_one({"account_number": "0412345678"})
    # REF-2026-7721 belongs to Customer 2
    with pytest.raises(HTTPException) as exc_info:
        get_complaint_by_ticket(ticket_id="REF-2026-7721", access_code=None, current_acc=acc1, db=mongo_db)
    assert exc_info.value.status_code == 403

def test_guest_ticket_access_code_protection(mongo_db):
    """Verifies guest ticket without access code has telephone and description masked."""
    # Create guest ticket
    req = ComplaintCreate(category="Breakdown", nature="Fallen wire", area="Galle", phone="0779998877")
    created = create_complaint(req, current_acc=None, db=mongo_db)
    assert created.ticket_id is not None

    # Access without access code -> masked!
    view = get_complaint_by_ticket(ticket_id=created.ticket_id, access_code=None, current_acc=None, db=mongo_db)
    assert "****" in view.phone
    assert "Masked for Privacy" in view.description

# 6. Chatbot Option C Scope Protection & Multilingual RAG
def test_chatbot_guest_privacy_enforced(mongo_db):
    """Verifies guest asking for personal bill is rejected with action_required='login'."""
    req = ChatRequest(
        message="What is my bill balance?",
        mode=ChatMode.guest,
        language=Language.en
    )
    res = handle_chat(req, authorization=None, db=mongo_db)
    assert res.scope == "public_knowledge"
    assert res.action_required == "login"
    assert "Sign In / Login Required" in res.reply

def test_chatbot_mode_spoofing_blocked(mongo_db):
    """CRITICAL: Verifies guest passing mode='customer' without token is downgraded to guest scope."""
    req = ChatRequest(
        message="Show my bill",
        mode=ChatMode.customer,
        account_number="0723456789",  # Attempting to target Sunil Fernando's account
        language=Language.en
    )
    # No Authorization header
    res = handle_chat(req, authorization=None, db=mongo_db)
    # Must be downgraded to guest!
    assert res.scope == "public_knowledge"
    assert res.action_required == "login"
    assert "0723456789" not in res.reply

def test_chatbot_multilingual_tariffs(mongo_db):
    """Verifies public RAG responses in English, Sinhala, and Tamil."""
    for lang in [Language.en, Language.si, Language.ta]:
        req = ChatRequest(message="What are electricity tariffs?", mode=ChatMode.guest, language=lang)
        res = handle_chat(req, authorization=None, db=mongo_db)
        assert res.reply is not None
        assert len(res.reply) > 20

# 7. Outages & Solar Services
def test_outages_and_solar(mongo_db):
    """Verifies grid outage notices and solar capacity checks."""
    outages = list_outages(db=mongo_db)
    assert len(outages) == 8

    solar = get_solar_capacity(transformer_code="TR-402", db=mongo_db)
    assert solar.transformer_code == "TR-402"
    assert solar.is_available is True
    assert solar.remaining_capacity_kw == 42.0
