"""
Backward compatibility layer: re-exports schemas from backend.app.schemas
"""

from backend.app.schemas import (
    ChatMode, Language, AccessScope, ChatRequest, ChatResponse,
    FeatureMatrixItem, LoginRequest, RegisterRequest, TokenResponse,
    CustomerProfile, BillDetail, ConsumptionHistoryItem, PaymentRequest,
    PaymentResponse, ComplaintCreate, ComplaintDetail, OutageItem,
    SolarCapacityQuery, SolarCapacityResponse, RichCardData
)

__all__ = [
    "ChatMode", "Language", "AccessScope", "ChatRequest", "ChatResponse",
    "FeatureMatrixItem", "LoginRequest", "RegisterRequest", "TokenResponse",
    "CustomerProfile", "BillDetail", "ConsumptionHistoryItem", "PaymentRequest",
    "PaymentResponse", "ComplaintCreate", "ComplaintDetail", "OutageItem",
    "SolarCapacityQuery", "SolarCapacityResponse", "RichCardData"
]
