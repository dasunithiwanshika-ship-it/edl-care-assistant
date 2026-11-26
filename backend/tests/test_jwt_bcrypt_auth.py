"""
Unit and integration tests for Bcrypt hashing, Signed JWTs, Token Expiration, and Account Isolation.
"""

import os
import time
import hashlib
from datetime import timedelta
import pytest
import jwt
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.auth import (
    hash_password, verify_password, create_access_token, decode_access_token,
    JWT_SECRET_KEY, JWT_ALGORITHM, SECRET_SALT
)
from backend.app.mongo_db import get_mongo_db

client = TestClient(app)


def test_bcrypt_password_hashing():
    """Verify Bcrypt hash creation and verification."""
    password = "SuperSecretPassword123!"
    hashed = hash_password(password)

    # Must start with $2b$
    assert hashed.startswith("$2b$")
    assert hashed != password

    # Verification must succeed for correct password
    assert verify_password(hashed, password) is True

    # Verification must fail for incorrect password
    assert verify_password(hashed, "WrongPassword") is False
    assert verify_password(hashed, "") is False


def test_legacy_pbkdf2_backward_compatibility():
    """Verify that existing seeded PBKDF2 hashes still verify cleanly."""
    salt = "testsalt123"
    key = hashlib.pbkdf2_hmac(
        "sha256",
        "demo123".encode("utf-8"),
        (salt + SECRET_SALT).encode("utf-8"),
        100000
    )
    legacy_hash = f"{salt}${key.hex()}"

    assert verify_password(legacy_hash, "demo123") is True
    assert verify_password(legacy_hash, "wrongpass") is False


def test_jwt_claims_and_decoding():
    """Verify JWT contains sub, iat, exp, jti and decodes accurately."""
    token = create_access_token(
        account_number="0412345678",
        customer_id=1,
        username="testuser",
        expires_delta=timedelta(hours=2)
    )
    assert isinstance(token, str)

    payload = decode_access_token(token)
    assert payload["sub"] == "0412345678"
    assert payload["account_number"] == "0412345678"
    assert payload["customer_id"] == 1
    assert payload["username"] == "testuser"
    assert "iat" in payload
    assert "exp" in payload
    assert "jti" in payload
    assert payload["exp"] > payload["iat"]


def test_jwt_expired_token_rejection():
    """Verify that an expired JWT raises 401."""
    expired_token = create_access_token(
        account_number="0412345678",
        customer_id=1,
        username="testuser",
        expires_delta=timedelta(seconds=-10)
    )

    with pytest.raises(Exception) as excinfo:
        decode_access_token(expired_token)
    assert "expired" in str(excinfo.value).lower()


def test_jwt_invalid_signature_rejection():
    """Verify that a forged JWT signature is rejected."""
    forged_token = jwt.encode(
        {"sub": "0412345678", "exp": int(time.time()) + 3600},
        "wrong_secret_key_that_is_long_enough_for_sha256_32bytes",
        algorithm="HS256"
    )

    with pytest.raises(Exception) as excinfo:
        decode_access_token(forged_token)
    assert "invalid" in str(excinfo.value).lower()


def test_protected_endpoint_without_token():
    """Accessing /api/customers/me without token must return 401."""
    response = client.get("/api/customers/me")
    assert response.status_code == 401


def test_protected_endpoint_with_valid_jwt():
    """Accessing /api/customers/me with valid JWT must return customer profile."""
    token = create_access_token(
        account_number="0412345678",
        customer_id=1,
        username="customer_low"
    )

    response = client.get(
        "/api/customers/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["account_number"] == "0412345678"


def test_cross_customer_isolation():
    """Customer A (0412345678) attempting to pay for Customer B (0723456789) must be rejected with 403."""
    token_a = create_access_token(
        account_number="0412345678",
        customer_id=1,
        username="customer_low"
    )

    # Customer A attempts to execute a payment on Customer B's account
    response = client.post(
        "/api/customers/me/pay",
        headers={"Authorization": f"Bearer {token_a}"},
        json={
            "account_number": "0723456789",  # Foreign account
            "amount": 500.0,
            "payment_method": "card"
        }
    )
    assert response.status_code == 403
    assert "forbidden" in response.json()["detail"].lower()
