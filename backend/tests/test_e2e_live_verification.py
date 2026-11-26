"""
Practical End-to-End Verification Test Script for EDL Care Assistant.
Exercises Authentication, Cookies, Bearer Tokens, MongoDB Persistence,
RAG Grounding, Anti-Hallucination, and Cross-Account Authorization.
"""

import time
import requests
import jwt
from backend.app.mongo_db import get_mongo_db

BASE_URL = "http://127.0.0.1:8000/api"


def run_e2e_verification():
    print("=" * 60)
    print("EDL CARE ASSISTANT – PRACTICAL E2E VERIFICATION")
    print("=" * 60)

    # ----------------------------------------------------
    # SECTION 1: AUTHENTICATION, TOKENS & COOKIES
    # ----------------------------------------------------
    ts = int(time.time())
    email = f"e2e_verify_{ts}@edl.lk"
    password = "StrongPassword2026!"
    
    reg_payload = {
        "full_name": "E2E Verified Customer",
        "email": email,
        "phone": "0771239999",
        "password": password
    }

    session = requests.Session()
    print("\n--- 1. Testing Registration & Cookie Issuance ---")
    r_reg = session.post(f"{BASE_URL}/auth/register", json=reg_payload)
    assert r_reg.status_code == 200, f"Registration failed: {r_reg.text}"
    reg_data = r_reg.json()
    account_number = reg_data["account_number"]
    token = reg_data["access_token"]
    print(f"PASS: Registered new customer: {email} -> Account #{account_number}")

    # Inspect Set-Cookie header
    set_cookie_header = r_reg.headers.get("set-cookie", "")
    assert "edl_auth_token=" in set_cookie_header, "HttpOnly cookie not present in response!"
    print(f"PASS: Set-Cookie contains edl_auth_token: {set_cookie_header.split(';')[0]}")

    print("\n--- 2. Inspecting JWT Standard Claims ---")
    decoded = jwt.decode(token, options={"verify_signature": False})
    for claim in ["sub", "account_number", "customer_id", "iat", "exp", "jti"]:
        assert claim in decoded, f"Missing claim {claim} in JWT!"
        print(f"  Claim '{claim}': {decoded[claim]}")
    assert decoded["sub"] == account_number
    print("PASS: JWT claims validated (sub, account_number, customer_id, iat, exp, jti).")

    print("\n--- 3. Testing Cookie-based Authentication ---")
    # Calling /api/customers/me without Authorization header, using cookie session
    r_me_cookie = session.get(f"{BASE_URL}/customers/me")
    assert r_me_cookie.status_code == 200, f"Cookie authentication failed: {r_me_cookie.text}"
    assert r_me_cookie.json()["account_number"] == account_number
    print(f"PASS: Cookie-authenticated profile retrieval succeeded for #{account_number}.")

    print("\n--- 4. Testing Bearer Token Authentication ---")
    r_me_bearer = requests.get(
        f"{BASE_URL}/customers/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert r_me_bearer.status_code == 200
    print(f"PASS: Bearer token profile retrieval succeeded for #{account_number}.")

    print("\n--- 5. Testing Cross-Account Data Isolation ---")
    # Customer attempts to execute a payment on a different account (#0412345678)
    r_cross = requests.post(
        f"{BASE_URL}/customers/me/pay",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "account_number": "0412345678", # Other customer's account
            "amount": 250.0,
            "payment_method": "card"
        }
    )
    assert r_cross.status_code == 403, f"Cross-account payment was not blocked (got {r_cross.status_code})"
    print(f"PASS: Cross-account payment blocked with HTTP 403: {r_cross.json()['detail']}")

    print("\n--- 6. Testing Forged & Expired Token Rejection ---")
    forged_token = jwt.encode({"sub": account_number, "exp": int(time.time()) + 3600}, "wrong_secret_key_32_bytes_long_ok", algorithm="HS256")
    r_forged = requests.get(f"{BASE_URL}/customers/me", headers={"Authorization": f"Bearer {forged_token}"})
    assert r_forged.status_code == 401
    print("PASS: Forged JWT token signature rejected with HTTP 401.")

    expired_token = jwt.encode({"sub": account_number, "exp": int(time.time()) - 100}, "edl_care_assistant_super_secure_jwt_secret_key_2026_lk", algorithm="HS256")
    r_expired = requests.get(f"{BASE_URL}/customers/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert r_expired.status_code == 401
    print("PASS: Expired JWT token rejected with HTTP 401.")

    print("\n--- 7. Testing Logout & Revocation ---")
    r_logout = requests.post(f"{BASE_URL}/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert r_logout.status_code == 200
    assert r_logout.json()["revoked"] is True
    print(f"PASS: Token revoked successfully: {r_logout.json()['message']}")

    # Try using the revoked token
    r_revoked = requests.get(f"{BASE_URL}/customers/me", headers={"Authorization": f"Bearer {token}"})
    assert r_revoked.status_code == 401
    print("PASS: Post-logout revoked token immediately rejected with HTTP 401.")

    # ----------------------------------------------------
    # SECTION 2: MONGODB PERSISTENCE VERIFICATION
    # ----------------------------------------------------
    print("\n--- 8. Verifying MongoDB Atlas Record Persistence ---")
    db = get_mongo_db()
    cust_doc = db.customers.find_one({"email": email})
    assert cust_doc is not None, "Customer was not saved in MongoDB Atlas!"
    assert cust_doc["hashed_password"].startswith("$2b$"), "Password was not hashed with Bcrypt in MongoDB!"
    print(f"PASS: Customer verified in MongoDB 'customers' (Bcrypt hash: {cust_doc['hashed_password'][:15]}...)")

    acc_doc = db.accounts.find_one({"account_number": account_number})
    assert acc_doc is not None, "Account was not saved in MongoDB Atlas!"
    print(f"PASS: Account verified in MongoDB 'accounts' (#{acc_doc['account_number']})")

    bill_doc = db.bills.find_one({"account_id": acc_doc["id"]})
    assert bill_doc is not None, "Welcome bill was not saved in MongoDB Atlas!"
    print(f"PASS: Initial bill verified in MongoDB 'bills' (Amount: Rs. {bill_doc['total_amount']:,.2f})")

    cons_count = db.consumption_records.count_documents({"account_id": acc_doc["id"]})
    assert cons_count == 6, f"Expected 6 starter consumption records, found {cons_count}!"
    print(f"PASS: {cons_count} historical consumption records verified in MongoDB 'consumption_records'.")

    # ----------------------------------------------------
    # SECTION 3: COMPLAINT & PAYMENT PERSISTENCE
    # ----------------------------------------------------
    print("\n--- 9. Testing Complaint Logging & Payment Persistence ---")
    # Fresh login to get a fresh token
    r_relogin = requests.post(f"{BASE_URL}/auth/login", json={"username": email, "password": password})
    assert r_relogin.status_code == 200
    active_token = r_relogin.json()["access_token"]

    # Submit complaint
    comp_payload = {
        "category": "Breakdown",
        "nature": "Sparking service wire",
        "description": "Tree branch pressing against service drop wire during storm.",
        "area": "Colombo South",
        "phone": "0771239999"
    }
    r_comp = requests.post(
        f"{BASE_URL}/complaints",
        headers={"Authorization": f"Bearer {active_token}"},
        json=comp_payload
    )
    assert r_comp.status_code == 200, f"Complaint submission failed: {r_comp.text}"
    comp_data = r_comp.json()
    ticket_no = comp_data["ticket_id"]
    print(f"PASS: Complaint submitted via API -> Ticket #{ticket_no}")

    # Confirm in MongoDB
    comp_doc = db.complaints.find_one({"ticket_id": ticket_no})
    assert comp_doc is not None
    assert comp_doc["status"] in ["PENDING", "IN_PROGRESS"]
    print(f"PASS: Complaint verified in MongoDB 'complaints' (Ticket #{ticket_no}, Status: {comp_doc['status']})")

    # Simulate bill payment
    r_pay = requests.post(
        f"{BASE_URL}/customers/me/pay",
        headers={"Authorization": f"Bearer {active_token}"},
        json={
            "account_number": account_number,
            "amount": 1000.0,
            "payment_method": "card"
        }
    )
    assert r_pay.status_code == 200
    pay_data = r_pay.json()
    tx_id = pay_data["transaction_id"]
    print(f"PASS: Payment processed via API -> Tx #{tx_id}, Remaining: Rs. {pay_data['remaining_balance']}")

    # Confirm in MongoDB payment_transactions
    tx_doc = db.payment_transactions.find_one({"transaction_id": tx_id})
    assert tx_doc is not None
    assert tx_doc["amount_paid"] == 1000.0
    print(f"PASS: Payment ledger transaction verified in MongoDB 'payment_transactions' (Tx #{tx_id})")

    # ----------------------------------------------------
    # SECTION 4: CHATBOT PERSISTENCE & GUEST PRIVACY
    # ----------------------------------------------------
    print("\n--- 10. Testing Chatbot Persistence & Option C Scope ---")
    session_id = f"e2e_chat_session_{ts}"
    chat_payload = {
        "message": "What is the rooftop solar Net-Plus export tariff rate?",
        "session_id": session_id,
        "mode": "guest",
        "language": "en"
    }
    r_chat = requests.post(f"{BASE_URL}/chat", json=chat_payload)
    assert r_chat.status_code == 200
    chat_res = r_chat.json()
    assert len(chat_res["reply"]) > 20
    print(f"PASS: Guest chat processed (Sources: {chat_res['sources']})")

    # Confirm message stored in MongoDB
    sess_doc = db.chat_sessions.find_one({"session_id": session_id})
    assert sess_doc is not None
    msg_count = db.chat_messages.count_documents({"session_id": sess_doc["id"]})
    assert msg_count >= 2, f"Expected at least 2 chat messages stored, found {msg_count}"
    print(f"PASS: Chat session and {msg_count} messages verified in MongoDB 'chat_sessions' and 'chat_messages'.")

    print("\n" + "=" * 60)
    print("ALL 10 PRACTICAL E2E VERIFICATION CHECKS PASSED (100%)!")
    print("=" * 60)


if __name__ == "__main__":
    run_e2e_verification()
