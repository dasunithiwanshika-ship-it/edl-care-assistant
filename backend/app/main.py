"""
FastAPI Server for EDL Care Assistant Backend (Option C Architecture)
Provides unified chat endpoint with Guest vs Authenticated Customer separation.
"""

from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from backend.app.models import ChatRequest, ChatResponse, ChatMode, FeatureMatrixItem
from backend.app.auth import resolve_access_scope
from backend.chatbot.engine import ChatbotEngine

app = FastAPI(
    title="EDL Care Assistant API",
    description="Backend AI Services for Electricity Distribution Lanka (EDL) - Option C Architecture",
    version="1.0.0",
)

# Enable CORS for Next.js frontend and React Native Expo app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = ChatbotEngine()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "EDL Care Assistant Backend",
        "architecture": "Option C – Guest + Login-Based AI Chatbot",
        "gemini_active": engine.model is not None,
    }

@app.post("/api/chat", response_model=ChatResponse)
def handle_chat(
    req: ChatRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Unified chat endpoint implementing Option C access separation:
    - Guest Mode: Queries public RAG knowledge; rejects personal account lookups.
    - Customer Mode: Verifies authentication and injects personalized account records.
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
        account_number=verified_account
    )
    return response

@app.get("/api/features", response_model=List[FeatureMatrixItem])
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
