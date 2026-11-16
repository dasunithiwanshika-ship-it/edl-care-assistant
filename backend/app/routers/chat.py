"""
Unified Chatbot Router for Option C Architecture
Enforces Guest vs Authenticated Customer Scope with Gemini and ChromaDB RAG.
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import ChatRequest, ChatResponse, FeatureMatrixItem
from backend.app.auth import resolve_access_scope
from backend.chatbot.engine import ChatbotEngine
from backend.app.db_models import ChatSession, ChatMessageRecord

router = APIRouter(prefix="/api", tags=["Chatbot"])
engine = ChatbotEngine()

@router.post("/chat", response_model=ChatResponse)
def handle_chat(
    req: ChatRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Unified chat endpoint implementing Option C access separation:
    - Guest Mode: Queries public RAG knowledge; rejects personal account lookups with action_required='login'.
    - Customer Mode: Verifies authentication and injects personalized account records + rich UI cards.
    """
    mode, scope, verified_account = resolve_access_scope(
        authorization=authorization,
        requested_mode=req.mode,
        account_number=req.account_number
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
def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    """Returns stored conversation turns for a given session."""
    session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if not session:
        return {"session_id": session_id, "messages": []}
    
    msgs = db.query(ChatMessageRecord).filter(ChatMessageRecord.session_id == session.id).order_by(ChatMessageRecord.id.asc()).all()
    return {
        "session_id": session_id,
        "mode": session.mode,
        "language": session.language,
        "messages": [
            {
                "id": m.id,
                "sender": m.sender,
                "content": m.content,
                "language": m.language,
                "timestamp": m.timestamp,
                "action_required": m.action_required,
                "sources": m.sources.split(",") if m.sources else []
            }
            for m in msgs
        ]
    }

@router.get("/features", response_model=List[FeatureMatrixItem])
def get_feature_matrix():
    """
    Official Feature Comparison Matrix (Option C Specification)
    """
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
