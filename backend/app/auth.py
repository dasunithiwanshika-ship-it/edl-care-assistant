"""
Authentication, Password Hashing and Access Scope Resolution for EDL Care Assistant (MongoDB Atlas)
Implements industry-standard Bcrypt password hashing, standard signed JWT access tokens (HS256)
with standard claims (sub, exp, iat, jti), cookie/header extraction, and strict customer authorization.
"""

import os
import hashlib
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple, Dict, Any
from fastapi import Request, Header, HTTPException, Depends
from pymongo.database import Database
import bcrypt
import jwt

from backend.app.schemas import ChatMode, AccessScope
from backend.app.mongo_db import get_db, clean_doc

# JWT configuration
JWT_SECRET_KEY = os.getenv("EDL_JWT_SECRET", "edl_care_assistant_super_secure_jwt_secret_key_2026_lk")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = int(os.getenv("EDL_JWT_EXPIRATION_HOURS", "168"))  # 7 days

# Legacy salt for backward compatibility with PBKDF2 seeded accounts
SECRET_SALT = os.getenv("EDL_AUTH_SALT", "edl_care_demo_salt_2026")


def hash_password(password: str) -> str:
    """Hashes a password using standard Bcrypt with an automatically generated salt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(stored_password: str, provided_password: str) -> bool:
    """
    Verifies a plain password against stored hash.
    Supports modern Bcrypt hashes ($2b$ or $2a$) with automatic backward-compatibility
    fallback to legacy PBKDF2 ($ separated) for existing demonstration accounts.
    """
    if not stored_password or not provided_password:
        return False

    # Check for Bcrypt hash ($2b$ or $2a$)
    if stored_password.startswith("$2b$") or stored_password.startswith("$2a$"):
        try:
            return bcrypt.checkpw(provided_password.encode("utf-8"), stored_password.encode("utf-8"))
        except Exception:
            return False

    # Fallback to legacy PBKDF2 hash (format: salt$hash)
    try:
        salt, key_hex = stored_password.split("$")
        key = hashlib.pbkdf2_hmac(
            "sha256",
            provided_password.encode("utf-8"),
            (salt + SECRET_SALT).encode("utf-8"),
            100000
        )
        return secrets.compare_digest(key.hex(), key_hex)
    except Exception:
        return False


def hash_token(raw_token: str) -> str:
    """Computes SHA-256 hash of a session/JWT token for indexed revocation tracking."""
    return hashlib.sha256(raw_token.strip().encode("utf-8")).hexdigest()


def create_access_token(
    account_number: str,
    customer_id: Optional[int] = None,
    username: Optional[str] = None,
    db: Optional[Database] = None,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Generates a cryptographically signed standard JWT access token with standard claims:
    - sub: account_number
    - account_number: account_number
    - customer_id: customer_id
    - username: username
    - iat: issued-at timestamp
    - exp: expiration timestamp
    - jti: unique token identifier for fast revocation
    Also tracks the token in MongoDB session_tokens for optional immediate revocation.
    """
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta if expires_delta else timedelta(hours=JWT_EXPIRATION_HOURS))
    jti = secrets.token_hex(16)

    payload = {
        "sub": str(account_number),
        "account_number": str(account_number),
        "customer_id": customer_id,
        "username": username or "",
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "jti": jti,
    }

    signed_jwt = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

    # Record token in MongoDB session_tokens for revocation checks & auditing
    if db is not None and hasattr(db, "session_tokens"):
        token_h = hash_token(signed_jwt)
        db.session_tokens.insert_one({
            "token_hash": token_h,
            "jti": jti,
            "account_number": str(account_number),
            "customer_id": customer_id,
            "created_at": now,
            "expires_at": expire,
            "revoked": False,
            "revoked_at": None
        })

    return signed_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decodes and validates a standard signed JWT token.
    Raises HTTPException 401 on expired signature or invalid token.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Session has expired. Please sign in again."
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid authentication token: {str(e)}"
        )


def revoke_token(raw_token: str, db: Database) -> bool:
    """Revokes a session or JWT token immediately in MongoDB."""
    token_h = hash_token(raw_token)
    res = db.session_tokens.update_one(
        {"token_hash": token_h},
        {"$set": {"revoked": True, "revoked_at": datetime.now(timezone.utc)}}
    )
    return res.modified_count > 0


# Seed demo tokens support: maps raw demo token to account number for offline demo tests
DEMO_TOKENS_MAP = {
    "edl_demo_token_dasuni_2026": "0412345678",
    "edl_demo_token_fernando_2026": "0723456789",
    "edl_demo_token_jayasuriya_2026": "0134567890",
}


def extract_token_from_request(
    request: Optional[Request] = None,
    authorization: Optional[str] = None
) -> Optional[str]:
    """
    Extracts raw bearer token from Authorization header or 'edl_auth_token' cookie.
    """
    # 1. Authorization header (Bearer ...)
    if authorization and authorization.startswith("Bearer "):
        return authorization.split("Bearer ")[1].strip()

    # 2. Check Request headers or cookies if request is present
    if request is not None:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            return auth_header.split("Bearer ")[1].strip()
        cookie_token = request.cookies.get("edl_auth_token")
        if cookie_token:
            return cookie_token.strip()

    return None


def get_current_account(
    request: Request = None,
    authorization: Optional[str] = Header(None),
    db: Database = Depends(get_db)
) -> Optional[Dict[str, Any]]:
    """
    Validates token via:
    1. Signed JWT signature and standard expiration verification.
    2. MongoDB session_tokens revocation check.
    3. Backward-compatible fallback for legacy demo tokens.
    Returns the account document or None.
    """
    raw_token = extract_token_from_request(request=request, authorization=authorization)
    if not raw_token:
        return None

    if db is None or not hasattr(db, "session_tokens"):
        from backend.app.mongo_db import get_mongo_db
        db = get_mongo_db()

    account_number = None

    # Try validating as signed JWT
    try:
        payload = decode_access_token(raw_token)
        account_number = payload.get("account_number") or payload.get("sub")
        jti = payload.get("jti")

        # Check if token is explicitly revoked in MongoDB
        token_h = hash_token(raw_token)
        revoked_query = {"$or": [{"token_hash": token_h}, {"jti": jti}]}
        revoked_doc = db.session_tokens.find_one({**revoked_query, "revoked": True})
        if revoked_doc:
            raise HTTPException(status_code=401, detail="Token has been revoked. Please sign in again.")

    except HTTPException:
        # Re-raise standard auth exceptions (expired or invalid JWT)
        raise
    except Exception:
        # Fallback to check legacy session token database entry
        token_h = hash_token(raw_token)
        now = datetime.now(timezone.utc)
        session_doc = db.session_tokens.find_one({
            "token_hash": token_h,
            "revoked": False,
            "expires_at": {"$gt": now}
        })
        if session_doc:
            account_number = session_doc.get("account_number")
        elif raw_token in DEMO_TOKENS_MAP:
            account_number = DEMO_TOKENS_MAP[raw_token]

    if not account_number:
        return None

    account = db.accounts.find_one({"account_number": str(account_number)})
    if not account:
        return None

    # Attach customer object for profile lookups
    customer = db.customers.find_one({"id": account.get("customer_id")})
    account["customer"] = clean_doc(customer)
    return clean_doc(account)


def require_authenticated_account(
    request: Request = None,
    authorization: Optional[str] = Header(None),
    db: Database = Depends(get_db)
) -> Dict[str, Any]:
    """Enforces authentication; raises 401 if unauthenticated or token is expired/invalid."""
    account = get_current_account(request=request, authorization=authorization, db=db)
    if not account:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please sign in to access personalized EDL customer services."
        )
    return account


def resolve_access_scope(
    request: Optional[Request] = None,
    authorization: Optional[str] = None,
    requested_mode: ChatMode = ChatMode.guest,
    account_number: Optional[str] = None,
    db: Optional[Database] = None
) -> Tuple[ChatMode, AccessScope, Optional[str]]:
    """
    Evaluates session credentials and assigns Option C scope:
    - If valid signed JWT or verified token is provided, validates signature and locks to verified account.
    - If NO valid token is provided, strictly defaults to Guest scope (zero private data access),
      blocking unauthenticated customer mode spoofing.
    """
    if db is None or not hasattr(db, "session_tokens"):
        from backend.app.mongo_db import get_mongo_db
        db = get_mongo_db()

    raw_token = extract_token_from_request(request=request, authorization=authorization)
    if raw_token:
        try:
            payload = decode_access_token(raw_token)
            verified_acc = payload.get("account_number") or payload.get("sub")
            if verified_acc:
                return ChatMode.customer, AccessScope.authenticated_customer, str(verified_acc)
        except Exception:
            pass

        # Check legacy session token or demo token
        token_h = hash_token(raw_token)
        now = datetime.now(timezone.utc)
        session_doc = db.session_tokens.find_one({
            "token_hash": token_h,
            "revoked": False,
            "expires_at": {"$gt": now}
        })
        if session_doc:
            verified_acc = session_doc.get("account_number")
            return ChatMode.customer, AccessScope.authenticated_customer, str(verified_acc)
        elif raw_token in DEMO_TOKENS_MAP:
            verified_acc = DEMO_TOKENS_MAP[raw_token]
            return ChatMode.customer, AccessScope.authenticated_customer, str(verified_acc)

    # Fallback: strictly guest scope with public knowledge only
    return ChatMode.guest, AccessScope.public_knowledge, None
