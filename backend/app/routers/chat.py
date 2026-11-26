"""
Unified Chatbot Router for Option C Architecture (MongoDB Atlas)
Enforces Guest vs Authenticated Customer Scope with Gemini and ChromaDB RAG.
Secures chat history retrieval with customer ownership verification.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pymongo.database import Database
from backend.app.mongo_db import get_db, clean_doc
from backend.app.schemas import ChatRequest, ChatResponse, FeatureMatrixItem
from backend.app.auth import resolve_access_scope, get_current_account
from backend.chatbot.engine import ChatbotEngine

router = APIRouter(prefix="/api", tags=["Chatbot"])
engine = ChatbotEngine()

@router.post("/chat", response_model=ChatResponse)
def handle_chat(
    req: ChatRequest,
    authorization: Optional[str] = Header(None),
    db: Database = Depends(get_db)
):
    """
    Unified chat endpoint implementing Option C access separation:
    - Guest Mode: Queries public RAG knowledge; rejects personal account lookups with action_required='login'.
    - Customer Mode: Verifies authentication against MongoDB session_tokens and injects personalized account records + rich UI cards.
    """
    mode, scope, verified_account = resolve_access_scope(
        authorization=authorization,
        requested_mode=req.mode,
        account_number=req.account_number,
        db=db
    )

    response = engine.process_message(
        message=req.message,
        mode=mode,
        language=req.language,
        account_number=verified_account,
        session_id=req.session_id
    )
    return response

@router.get("/chat/history")
def get_chat_history(
    session_id: str,
    current_acc: Optional[dict] = Depends(get_current_account),
    db: Database = Depends(get_db)
):
    """
    Returns stored conversation turns for a given session.
    Enforces ownership: if the chat session is associated with an account,
    only the authenticated owner of that account can view its conversation history.
    """
    session = db.chat_sessions.find_one({"session_id": session_id})
    if not session:
        return {"session_id": session_id, "messages": []}

    # Ownership verification for customer sessions
    session_acc = session.get("account_number")
    if session_acc:
        if not current_acc or current_acc.get("account_number") != session_acc:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: You are not authorized to view this customer's chat history."
            )

    msgs = list(db.chat_messages.find({"session_id": session.get("id")}).sort("id", 1))
    return {
        "session_id": session_id,
        "mode": session.get("mode", "guest"),
        "language": session.get("language", "en"),
        "messages": [
            {
                "id": m.get("id", 0),
                "sender": m["sender"],
                "content": m["content"],
                "language": m.get("language", "en"),
                "timestamp": m.get("timestamp", "now"),
                "action_required": m.get("action_required"),
                "sources": m.get("sources", "").split(",") if m.get("sources") else []
            }
            for m in msgs
        ]
    }

@router.get("/features", response_model=List[FeatureMatrixItem])
def get_feature_matrix():
    """Official Feature Comparison Matrix (Option C Specification)."""
    return [
        FeatureMatrixItem(feature="General electricity FAQs", guest=True, customer=True),
        FeatureMatrixItem(feature="Tariff explanations", guest=True, customer=True),
        FeatureMatrixItem(feature="Electrical safety guidance", guest=True, customer=True),
        FeatureMatrixItem(feature="General outage guidance", guest=True, customer=True),
        FeatureMatrixItem(feature="Personal bill details", guest=False, customer=True, guest_note="Requires login", customer_note="Full access"),
        FeatureMatrixItem(feature="Personal consumption", guest=False, customer=True, guest_note="Requires login", customer_note="Full access"),
        FeatureMatrixItem(feature="Personal complaint tracking", guest=False, customer=True, guest_note="Requires login", customer_note="Full access"),
        FeatureMatrixItem(feature="Personalized account assistance", guest=False, customer=True, guest_note="Requires login", customer_note="Full access"),
    ]
