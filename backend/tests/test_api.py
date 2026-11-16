"""
Comprehensive Unit & Integration Test Suite for EDL Care Assistant Backend
Tests Authentication, Option C Scoping, Customer Isolation, Complaints, Outages, Solar, and RAG.
"""

import pytest
from fastapi import HTTPException
from backend.app.database import SessionLocal
from backend.app.db_models import Account
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
from backend.mock_data.seed import seed_database

@pytest.fixture(scope="module")
def db_session():
    """Provides an isolated database session for the test run."""
    seed_database()
    db = SessionLocal()
    yield db
    db.close()

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

def test_auth_me_profile(db_session):
    """Verifies profile retrieval for authenticated customer account."""
    acc = db_session.query(Account).filter(Account.account_number == "0412345678").first()
    res = get_current_user_profile(account=acc)
    assert res.account_number == "0412345678"
    assert res.outstanding_balance == 4850.00
    assert res.connected_feeder == "Feeder F-04 Havelock"

def test_customer_bills_isolation(db_session):
    """Verifies customer receives only their own bills and full 12-month billing history."""
    acc = db_session.query(Account).filter(Account.account_number == "0412345678").first()
    bills = get_my_bills(account=acc, db=db_session)
    assert len(bills) == 12
    assert bills[0].units_consumed == 142
    assert bills[0].billing_month == "Oct 2026"
    assert bills[0].is_paid is False
    assert bills[1].is_paid is True

def test_customer_consumption_history(db_session):
    """Verifies full 12-month historical consumption data."""
    acc = db_session.query(Account).filter(Account.account_number == "0412345678").first()
    records = get_my_consumption(account=acc, db=db_session)
    assert len(records) == 12
    assert records[-1].month == "Oct"
    assert records[-1].units_kwh == 142
    assert records[0].month == "Nov"
    assert records[0].year == 2025

def test_customer_payment_simulation(db_session):
    """Verifies bill payment deduction and state update."""
    acc = db_session.query(Account).filter(Account.account_number == "0412345678").first()
    initial_balance = acc.outstanding_balance
    pay_req = PaymentRequest(account_number="0412345678", amount=1000.00, payment_method="card")
    res = pay_bill(req=pay_req, account=acc, db=db_session)
    assert res.status == "SUCCESS"
    assert res.amount_paid == 1000.00
    assert res.remaining_balance == initial_balance - 1000.00

def test_complaints_creation_tracking_and_status_update(db_session):
    """Verifies breakdown complaint submission, retrieval, and persistent lifecycle status update."""
    comp_req = ComplaintCreate(
        account_number="0412345678",
        category="Breakdown",
        nature="Service wire spark near roof",
        area="Colombo 05",
        phone="0771234567"
    )
    res = create_complaint(req=comp_req, current_acc=None, db=db_session)
    assert res.ticket_id.startswith("REF-2026-")
    assert res.status == "IN_PROGRESS"

    # Track by ticket ID
    track_res = get_complaint_by_ticket(ticket_id=res.ticket_id, db=db_session)
    assert track_res.ticket_id == res.ticket_id
    assert track_res.area == "Colombo 05"

    # Persistent status update to RESOLVED
    update_req = ComplaintUpdate(
        status="RESOLVED",
        estimated_completion="Resolved on 2026-11-16",
        description="Technician replaced damaged clevis insulator and re-tensioned service wire."
    )
    updated = update_complaint_status(ticket_id=res.ticket_id, update_data=update_req, db=db_session)
    assert updated.status == "RESOLVED"
    assert "clevis insulator" in updated.description

def test_outages_listing(db_session):
    """Verifies simulated grid outages list across Sri Lanka."""
    outages = list_outages(db=db_session)
    assert len(outages) >= 8
    assert any(o.outage_code == "OUT-2026-1089" for o in outages)

def test_solar_capacity_check(db_session):
    """Verifies solar transformer capacity lookup."""
    res = get_solar_capacity(transformer_code="TR-402", db=db_session)
    assert res.transformer_code == "TR-402"
    assert res.remaining_capacity_kw == 42.0
    assert res.is_available is True

# ==============================================================
# OPTION C CHATBOT SCENARIOS (EVALUATION MATRIX)
# ==============================================================

def test_scenario_1_guest_general_faq():
    """SCENARIO 1: Guest asks a general electricity question."""
    req = ChatRequest(
        message="What are the domestic electricity tariffs in Sri Lanka?",
        mode=ChatMode.guest,
        language=Language.en
    )
    res = handle_chat(req=req, authorization=None)
    assert res.mode == ChatMode.guest
    assert res.scope.value == "public_knowledge"
    assert len(res.reply) > 20
    assert len(res.sources) > 0

def test_scenario_2_guest_personal_bill_blocked():
    """SCENARIO 2: Guest asks for personal bill and is gated to login."""
    req = ChatRequest(
        message="What is my outstanding electricity bill?",
        mode=ChatMode.guest,
        language=Language.en
    )
    res = handle_chat(req=req, authorization=None)
    assert res.action_required == "login"
    assert "Login Required" in res.reply or "ප්‍රවිෂ්ට" in res.reply or "உள்நுழைவு" in res.reply

def test_scenario_3_customer_outstanding_balance():
    """SCENARIO 3: Customer checks outstanding balance."""
    req = ChatRequest(
        message="Check my outstanding balance",
        mode=ChatMode.customer,
        language=Language.en,
        account_number="0412345678"
    )
    res = handle_chat(req=req, authorization="Bearer edl_demo_token_dasuni_2026")
    assert res.mode == ChatMode.customer
    assert res.scope.value == "authenticated_customer"
    assert res.action_required == "pay"
    assert res.rich_card is not None
    assert res.rich_card.type == "bill"

def test_scenario_4_customer_consumption_comparison():
    """SCENARIO 4: Customer compares monthly electricity consumption."""
    req = ChatRequest(
        message="Compare my electricity consumption with last month",
        mode=ChatMode.customer,
        language=Language.en,
        account_number="0412345678"
    )
    res = handle_chat(req=req, authorization="Bearer edl_demo_token_dasuni_2026")
    assert "142" in res.reply or "160" in res.reply or "consumption" in res.reply.lower()

def test_scenario_5_customer_track_complaint():
    """SCENARIO 5: Customer tracks their complaint."""
    req = ChatRequest(
        message="Track my active breakdown complaint",
        mode=ChatMode.customer,
        language=Language.en,
        account_number="0412345678"
    )
    res = handle_chat(req=req, authorization="Bearer edl_demo_token_dasuni_2026")
    assert "REF-2026-9841" in res.reply
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
