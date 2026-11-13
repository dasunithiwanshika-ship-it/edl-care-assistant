from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ChatMode(str, Enum):
    guest = "guest"
    customer = "customer"

class Language(str, Enum):
    en = "en"
    si = "si"
    ta = "ta"

class AccessScope(str, Enum):
    public_knowledge = "public_knowledge"
    authenticated_customer = "authenticated_customer"

class ChatRequest(BaseModel):
    message: str = Field(..., description="Customer message or query in English, Sinhala or Tamil")
    mode: ChatMode = Field(default=ChatMode.guest, description="Option C Access Mode: guest or customer")
    language: Language = Field(default=Language.en, description="Selected language: en, si, or ta")
    account_number: Optional[str] = Field(default=None, description="Optional customer account number for authenticated sessions")

class ChatResponse(BaseModel):
    reply: str
    mode: ChatMode
    scope: AccessScope
    language: Language
    is_mock: bool = True
    action_required: Optional[str] = None  # e.g. "login", "pay", "complaint"
    sources: List[str] = []
    account_ref: Optional[str] = None

class FeatureMatrixItem(BaseModel):
    feature: str
    guest: bool
    customer: bool
    guest_note: Optional[str] = None
    customer_note: Optional[str] = None
