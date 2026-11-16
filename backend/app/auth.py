"""
Authentication, Password Hashing and Access Scope Resolution for EDL Care Assistant
Implements secure PBKDF2-HMAC-SHA256 password hashing, token validation, and Option C scope protection.
"""

import os
import hashlib
import secrets
from typing import Optional, Tuple, Dict, Any
from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.app.schemas import ChatMode, AccessScope
from backend.app.database import get_db
from backend.app.db_models import Customer, Account

SECRET_SALT = os.getenv("EDL_AUTH_SALT", "edl_care_demo_salt_2026")

def hash_password(password: str) -> str:
    """Hashes a password using PBKDF2-HMAC-SHA256 with a salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        (salt + SECRET_SALT).encode('utf-8'),
        100000
    )
    return f"{salt}${key.hex()}"

def verify_password(stored_password: str, provided_password: str) -> bool:
    """Verifies a plain password against stored salt$hash."""
    try:
        salt, key_hex = stored_password.split("$")
        key = hashlib.pbkdf2_hmac(
            'sha256',
            provided_password.encode('utf-8'),
            (salt + SECRET_SALT).encode('utf-8'),
            100000
        )
        return secrets.compare_digest(key.hex(), key_hex)
    except Exception:
        return False

# Demonstration Session Token Store (maps token -> account_number)
ACTIVE_TOKENS: Dict[str, str] = {
    "edl_demo_token_dasuni_2026": "0412345678",
    "edl_demo_token_fernando_2026": "0723456789",
    "edl_demo_token_jayasuriya_2026": "0134567890",
}

def create_access_token(account_number: str) -> str:
    """Generates a secure bearer token for demo sessions."""
    token = f"edl_tok_{secrets.token_hex(16)}"
    ACTIVE_TOKENS[token] = account_number
    return token

def get_current_account(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[Account]:
    """
    Extracts and validates the current customer account from Bearer token.
    Returns Account or None.
    """
    if not isinstance(authorization, str) or not authorization.startswith("Bearer "):
        return None
    token = authorization.split("Bearer ")[1].strip()
    account_number = ACTIVE_TOKENS.get(token)
    if not account_number:
        return None
    return db.query(Account).filter(Account.account_number == account_number).first()

def require_authenticated_account(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Account:
    """Enforces authentication; raises 401 if unauthenticated."""
    account = get_current_account(authorization=authorization, db=db)
    if not account:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please sign in to access personalized EDL customer services."
        )
    return account

def resolve_access_scope(
    authorization: Optional[str] = None,
    requested_mode: ChatMode = ChatMode.guest,
    account_number: Optional[str] = None,
    db: Optional[Session] = None
) -> Tuple[ChatMode, AccessScope, Optional[str]]:
    """
    Evaluates session credentials and assigns Option C scope:
    - If valid Bearer token provided, verifies and locks to authenticated customer's account.
    - If customer mode explicitly requested for demo inspection, resolves account or defaults safely.
    - Otherwise defaults strictly to Guest scope (zero private data access).
    """
    if isinstance(authorization, str) and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ")[1].strip()
        verified_account = ACTIVE_TOKENS.get(token)
        if verified_account:
            return ChatMode.customer, AccessScope.authenticated_customer, verified_account

    if requested_mode == ChatMode.customer:
        # In demo customer mode, use provided account or default to primary low-usage demo account
        acc = account_number or "0412345678"
        return ChatMode.customer, AccessScope.authenticated_customer, acc

    # Default to Guest scope (zero private data access)
    return ChatMode.guest, AccessScope.public_knowledge, None
