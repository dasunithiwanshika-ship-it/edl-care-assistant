"""
Authentication & Permission Scoping Middleware for Option C Architecture
Separates Guest requests from Authenticated Customer requests.
"""

from typing import Optional, Tuple
from fastapi import Header, HTTPException
from backend.app.models import ChatMode, AccessScope
from backend.mock_data.customers import get_customer_account

# Fictional demo Bearer token
VALID_DEMO_TOKENS = {
    "edl_demo_token_dasuni_2026": "0412345678",
}

def resolve_access_scope(
    authorization: Optional[str] = Header(None),
    requested_mode: ChatMode = ChatMode.guest,
    account_number: Optional[str] = None
) -> Tuple[ChatMode, AccessScope, Optional[str]]:
    """
    Evaluates session credentials.
    - If valid Bearer token provided or requested_mode is customer, verifies account scope.
    - If guest or unauthenticated, defaults safely to public knowledge scope.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ")[1].strip()
        account_id = VALID_DEMO_TOKENS.get(token)
        if account_id:
            return ChatMode.customer, AccessScope.authenticated_customer, account_id

    if requested_mode == ChatMode.customer:
        # Fictional demonstration override
        acc = account_number or "0412345678"
        return ChatMode.customer, AccessScope.authenticated_customer, acc

    # Default to Guest scope
    return ChatMode.guest, AccessScope.public_knowledge, None
