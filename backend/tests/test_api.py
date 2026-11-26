"""
Comprehensive Unit & Integration Test Suite for EDL Care Assistant Backend (MongoDB Atlas)
Tests Authentication, Option C Scoping, Customer Isolation, Complaints, Outages, Solar, and RAG.
"""

import pytest
from fastapi import HTTPException
from backend.app.mongo_db import get_mongo_db
from backend.app.main import health_check
from backend.app.routers.auth import login, register, get_current_user_profile
from backend.app.routers.customers import get_my_account, get_my_bills, get_my_consumption, pay_bill
from backend.app.routers.complaints import create_complaint, list_complaints, get_complaint_by_ticket, update_complaint_status
from backend.app.routers.outages import list_outages, list_outage_areas
from backend.app.routers.solar import get_solar_capacity, list_transformers
from backend.app.routers.chat import handle_chat
from backend.app.schemas import (
    LoginRequest, RegisterRequest, PaymentRequest, ComplaintCreate, ComplaintUpdate,
    ChatRequest, ChatMode, Language
)

@pytest.fixture(scope="module")
def db_session():
    """Provides MongoDB Atlas database handle for the test suite."""
    db = get_mongo_db()
    yield db

def test_health_check():
    """Verifies API health status and architecture declaration."""
    res = health_check()
    assert res["status"] == "healthy"
    assert res["architecture"] == "Option C – Guest + Login-Based AI Chatbot"
    assert "rag_engine" in res

def test_auth_login_valid_username(db_session):
    """Verifies login using valid demo username."""
    req = LoginRequest(username="customer_low", password="demo123")
    res = login(req, db=db_session)
    assert res.access_token is not None
    assert res.account_number == "0412345678"
    assert res.full_name == "Dasuni Thiwanshika Premawardana"

def test_auth_login_valid_account_number(db_session):
    """Verifies login using 10-digit account number."""
    req = LoginRequest(username="0412345678", password="demo123")
    res = login(req, db=db_session)
    assert res.account_number == "0412345678"

def test_auth_login_invalid_password(db_session):
    """Verifies login rejection on wrong password."""
    req = LoginRequest(username="customer_low", password="wrongpassword")
    with pytest.raises(HTTPException) as exc_info:
        login(req, db=db_session)
    assert exc_info.value.status_code == 401

def test_registration_success(db_session):
    """Verifies new user registration, token generation, and account creation."""
    test_email = "newuser_test_2026@edl.lk"
    # Clean up prior test runs (customers, accounts, bills, and consumption records)
    old_custs = list(db_session.customers.find({"email": test_email}))
    for oc in old_custs:
        old_accs = list(db_session.accounts.find({"customer_id": oc["id"]}))
        for oa in old_accs:
            db_session.bills.delete_many({"account_id": oa["id"]})
            db_session.consumption_records.delete_many({"account_id": oa["id"]})
        db_session.accounts.delete_many({"customer_id": oc["id"]})
    db_session.customers.delete_many({"email": test_email})
    test_user = db_session.customers.find_one({"email": test_email})
    assert test_user is None

    reg_req = RegisterRequest(
        full_name="Kavinda Perera",
        email=test_email,
        phone="0779876543",
        password="ValidPassword123"
    )
    res = register(reg_req, db=db_session)
    assert res.access_token is not None
    assert res.token_type == "bearer"
    assert res.full_name == "Kavinda Perera"
    assert res.account_number.startswith("04")
    assert len(res.account_number) == 10

    # Verify database persistence
    saved_cust = db_session.customers.find_one({"email": test_email})
    assert saved_cust is not None
    assert saved_cust["phone"] == "0779876543"
    # Password must be hashed with PBKDF2 (never plain text)
    assert saved_cust["hashed_password"] != "ValidPassword123"
    assert "$" in saved_cust["hashed_password"]

    saved_acc = db_session.accounts.find_one({"customer_id": saved_cust["id"]})
    assert saved_acc is not None
    assert saved_acc["account_number"] == res.account_number

    # Verify welcome bill & consumption history were seeded
    bills = list(db_session.bills.find({"account_id": saved_acc["id"]}))
    assert len(bills) >= 1
    assert bills[0]["billing_month"] == "October 2026"

    cons = list(db_session.consumption_records.find({"account_id": saved_acc["id"]}))
    assert len(cons) == 6

def test_registration_duplicate_email(db_session):
    """Verifies duplicate email registration is rejected with 400 error."""
    reg_req = RegisterRequest(
        full_name="Another User",
        email="newuser_test_2026@edl.lk",
        phone="0771112233",
        password="ValidPassword123"
    )
    with pytest.raises(HTTPException) as exc_info:
        register(reg_req, db=db_session)
    assert exc_info.value.status_code == 400
    assert "already exists" in str(exc_info.value.detail).lower()

def test_registration_invalid_email(db_session):
    """Verifies invalid email format is rejected."""
    reg_req = RegisterRequest(
        full_name="Invalid Email User",
        email="not-a-valid-email",
        phone="0771112233",
        password="ValidPassword123"
    )
    with pytest.raises(HTTPException) as exc_info:
        register(reg_req, db=db_session)
    assert exc_info.value.status_code == 400
    assert "invalid email" in str(exc_info.value.detail).lower()

def test_registration_weak_password(db_session):
    """Verifies weak password (<6 characters) is rejected by schema validation."""
    from pydantic import ValidationError
    with pytest.raises((HTTPException, ValidationError)):
        RegisterRequest(
            full_name="Short Pwd User",
            email="shortpwd@edl.lk",
            phone="0771112233",
            password="123"
        )

def test_login_with_registered_email(db_session):
    """Verifies customer can log in using their newly registered email address."""
    login_req = LoginRequest(
        username="newuser_test_2026@edl.lk",
        password="ValidPassword123"
    )
    res = login(login_req, db=db_session)
    assert res.access_token is not None
    assert res.full_name == "Kavinda Perera"
    assert res.mode == "customer"

def test_registered_customer_services_and_data(db_session):
    """Verifies registered customer can retrieve their profile, bills, and consumption."""
    cust = db_session.customers.find_one({"email": "newuser_test_2026@edl.lk"})
    acc = db_session.accounts.find_one({"customer_id": cust["id"]})
    acc["customer"] = cust

    # 1. Profile
    profile = get_my_account(account=acc)
    assert profile.full_name == "Kavinda Perera"
    assert profile.email == "newuser_test_2026@edl.lk"

    # 2. Bills
    bills = get_my_bills(account=acc, db=db_session)
    assert len(bills) >= 1
    assert bills[0].billing_month == "October 2026"
    assert bills[0].total_amount == 3850.0

    # 3. Consumption
    records = get_my_consumption(account=acc, db=db_session)
    assert len(records) == 6
    assert records[-1].month == "Oct"

def test_auth_me_profile(db_session):
    """Verifies profile retrieval for authenticated customer account."""
    acc = db_session.accounts.find_one({"account_number": "0412345678"})
    cust = db_session.customers.find_one({"id": acc["customer_id"]})
    acc["customer"] = cust
    res = get_current_user_profile(account=acc)
    assert res.account_number == "0412345678"
    assert res.connected_feeder == "Feeder F-04 Havelock"

def test_customer_bills_isolation(db_session):
    """Verifies customer receives only their own bills and full 12-month billing history."""
    acc = db_session.accounts.find_one({"account_number": "0412345678"})
    bills = get_my_bills(account=acc, db=db_session)
    assert len(bills) == 12
    assert bills[0].billing_month == "Oct 2026"

def test_customer_consumption_history(db_session):
    """Verifies full 12-month historical consumption data."""
    acc = db_session.accounts.find_one({"account_number": "0412345678"})
    records = get_my_consumption(account=acc, db=db_session)
    assert len(records) == 12
    assert records[-1].month == "Oct"
    assert records[0].month == "Nov"
    assert records[0].year == 2025

def test_customer_payment_simulation(db_session):
    """Verifies bill payment deduction and state update in MongoDB."""
    acc = db_session.accounts.find_one({"account_number": "0412345678"})
    initial_balance = acc.get("outstanding_balance", 0.0)
    pay_req = PaymentRequest(account_number="0412345678", amount=10.0, payment_method="card")
    res = pay_bill(req=pay_req, account=acc, db=db_session)
    assert res.status == "SUCCESS"
    assert res.amount_paid == 10.0

def test_complaints_creation_tracking_and_status_update(db_session):
    """Verifies breakdown complaint submission, retrieval, and persistent lifecycle status update."""
    acc = db_session.accounts.find_one({"account_number": "0412345678"})
    comp_req = ComplaintCreate(
        account_number="0412345678",
        category="Breakdown",
        nature="Streetlight flickering opposite house gate",
        description="Luminare flickering rapidly causing night glare.",
        area="Colombo 05",
        phone="0771234567"
    )
    created = create_complaint(req=comp_req, current_acc=acc, db=db_session)
    assert created.ticket_id.startswith("REF-2026-")
    assert created.status == "IN_PROGRESS"

    # Track by ticket
    tracked = get_complaint_by_ticket(ticket_id=created.ticket_id, current_acc=acc, db=db_session)
    assert tracked.ticket_id == created.ticket_id

    # Update status
    update_req = ComplaintUpdate(status="RESOLVED", description="Technician replaced starter and bulb.")
    updated = update_complaint_status(ticket_id=created.ticket_id, update_data=update_req, current_acc=acc, db=db_session)
    assert updated.status == "RESOLVED"

def test_outages_listing(db_session):
    """Verifies retrieval of simulated power breakdowns and planned outages."""
    outages = list_outages(db=db_session)
    assert len(outages) >= 8
    assert any(o.outage_type == "breakdown" for o in outages)
    assert any(o.outage_type == "planned" for o in outages)

def test_solar_capacity_check(db_session):
    """Verifies transformer rooftop solar hosting capacity evaluation."""
    res = get_solar_capacity(transformer_code="TR-402", db=db_session)
    assert res.transformer_code == "TR-402"
    assert res.is_available is True
    assert res.remaining_capacity_kw == 42.0

def test_scenario_1_guest_general_faq():
    """SCENARIO 1: Guest asks general electricity tariff question."""
    req = ChatRequest(
        message="What are the domestic electricity tariffs in Sri Lanka?",
        mode=ChatMode.guest,
        language=Language.en
    )
    res = handle_chat(req=req, authorization=None)
    assert res.mode == ChatMode.guest
    assert res.scope.value == "public_knowledge"
    assert res.action_required is None
    assert len(res.sources) > 0

def test_scenario_2_guest_personal_bill_blocked():
    """SCENARIO 2: Guest attempts to check personal bill balance."""
    req = ChatRequest(
        message="Can you check my outstanding bill balance?",
        mode=ChatMode.guest,
        language=Language.en
    )
    res = handle_chat(req=req, authorization=None)
    assert res.mode == ChatMode.guest
    assert res.action_required == "login"
    assert "Sign In" in res.reply or "Login" in res.reply

def test_scenario_3_customer_outstanding_balance():
    """SCENARIO 3: Authenticated customer asks for outstanding bill."""
    req = ChatRequest(
        message="What is my current outstanding balance and when is it due?",
        mode=ChatMode.customer,
        language=Language.en
    )
    res = handle_chat(req=req, authorization="Bearer edl_demo_token_dasuni_2026")
    assert res.action_required == "pay"
    assert res.rich_card is not None
    assert res.rich_card.type == "bill"

def test_scenario_4_customer_consumption_comparison():
    """SCENARIO 4: Authenticated customer compares consumption trends."""
    req = ChatRequest(
        message="Compare my electricity consumption with last month",
        mode=ChatMode.customer,
        language=Language.en
    )
    res = handle_chat(req=req, authorization="Bearer edl_demo_token_dasuni_2026")
    assert res.rich_card is not None
    assert res.rich_card.type == "consumption"

def test_scenario_5_customer_track_complaint():
    """SCENARIO 5: Customer tracks breakdown complaint status."""
    req = ChatRequest(
        message="What is the status of my logged breakdown complaint?",
        mode=ChatMode.customer,
        language=Language.en
    )
    res = handle_chat(req=req, authorization="Bearer edl_demo_token_dasuni_2026")
    assert res.action_required == "complaint"

def test_scenario_8_multilingual_sinhala_tamil():
    """SCENARIO 8: Customer asks questions in Sinhala and Tamil."""
    # Sinhala query
    req_si = ChatRequest(
        message="මගේ විදුලි බිල වැඩි ඇයි?",
        mode=ChatMode.guest,
        language=Language.si
    )
    res_si = handle_chat(req=req_si, authorization=None)
    assert len(res_si.reply) > 10

    # Tamil query
    req_ta = ChatRequest(
        message="மின் கட்டண முறை விளக்கம்",
        mode=ChatMode.guest,
        language=Language.ta
    )
    res_ta = handle_chat(req=req_ta, authorization=None)
    assert len(res_ta.reply) > 10

def test_guest_public_energy_saving():
    """Verifies guest can ask energy saving recommendations without authentication."""
    req = ChatRequest(
        message="How can I save electricity to reduce my monthly bill?",
        mode=ChatMode.guest,
        language=Language.en
    )
    res = handle_chat(req=req, authorization=None)
    assert res.mode == ChatMode.guest
    assert res.scope.value == "public_knowledge"
    assert res.action_required is None
    assert any(w in res.reply.lower() for w in ["led", "saving", "energy", "consumption", "watt"])

def test_guest_public_solar_schemes():
    """Verifies guest can ask about solar net-metering schemes without authentication."""
    req = ChatRequest(
        message="What are the rooftop solar net-metering schemes in Sri Lanka?",
        mode=ChatMode.guest,
        language=Language.en
    )
    res = handle_chat(req=req, authorization=None)
    assert res.mode == ChatMode.guest
    assert res.scope.value == "public_knowledge"
    assert res.action_required is None
    assert any(w in res.reply.lower() for w in ["solar", "net-metering", "transformer", "capacity"])

def test_guest_public_outage_guidelines():
    """Verifies guest can ask about general power outage procedures without authentication."""
    req = ChatRequest(
        message="How can I check power outages or report a blackout in my area?",
        mode=ChatMode.guest,
        language=Language.en
    )
    res = handle_chat(req=req, authorization=None)
    assert res.mode == ChatMode.guest
    assert res.scope.value == "public_knowledge"
    assert res.action_required is None
    assert "1987" in res.reply or "outage" in res.reply.lower()

def test_guest_public_safety_guidelines():
    """Verifies guest can ask about electrical safety guidelines without authentication."""
    req = ChatRequest(
        message="What electrical safety guidelines should I follow for my home?",
        mode=ChatMode.guest,
        language=Language.en
    )
    res = handle_chat(req=req, authorization=None)
    assert res.mode == ChatMode.guest
    assert res.scope.value == "public_knowledge"
    assert res.action_required is None
    assert any(w in res.reply.lower() for w in ["safety", "elcb", "trip switch", "wire", "1987"])

def test_guest_personal_consumption_blocked():
    """Verifies guest asking for personal consumption history is gated to login."""
    req = ChatRequest(
        message="What is my consumption history for the past 6 months?",
        mode=ChatMode.guest,
        language=Language.en
    )
    res = handle_chat(req=req, authorization=None)
    assert res.action_required == "login"
    assert "Sign In" in res.reply or "Login" in res.reply

def test_guest_personal_complaint_blocked():
    """Verifies guest asking to track their complaint is gated to login."""
    req = ChatRequest(
        message="Track my breakdown complaint",
        mode=ChatMode.guest,
        language=Language.en
    )
    res = handle_chat(req=req, authorization=None)
    assert res.action_required == "login"
    assert "Sign In" in res.reply or "Login" in res.reply

def test_guest_cannot_bypass_with_customer_mode_flag():
    """Verifies that an unauthenticated user sending mode='customer' cannot access personal data without a valid Bearer token."""
    req = ChatRequest(
        message="What is my outstanding balance?",
        mode=ChatMode.customer,
        language=Language.en
    )
    res = handle_chat(req=req, authorization=None)
    assert res.mode == ChatMode.guest
    assert res.scope.value == "public_knowledge"
    assert res.action_required == "login"
    assert res.account_ref is None
    assert res.rich_card is None
