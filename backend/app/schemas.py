"""
Pydantic Request and Response Schemas for EDL Care Assistant API
"""

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

# --- Authentication Schemas ---
class LoginRequest(BaseModel):
    username: str = Field(..., description="Username or 10-digit Account Number (e.g. 0412345678)")
    password: str = Field(..., description="Password (demo accounts: demo123)")

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    phone: Optional[str] = "0771234567"
    account_number: Optional[str] = None
    premises_address: Optional[str] = "Colombo, Sri Lanka"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    full_name: str
    account_number: str
    mode: str = "customer"

class CustomerProfile(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    phone: Optional[str] = None
    account_number: str
    premises_address: str
    tariff_category: str
    connected_feeder: str
    substation_code: str
    outstanding_balance: float
    due_date: str
    monthly_consumption_kwh: int
    monthly_average_kwh: int
    is_solar: bool
    solar_capacity_kw: float

# --- Billing & Consumption Schemas ---
class BillDetail(BaseModel):
    id: int
    billing_month: str
    previous_reading: int
    present_reading: int
    units_consumed: int
    energy_charge: float
    fixed_charge: float
    fuel_adjustment: float
    total_amount: float
    due_date: str
    is_paid: bool

class ConsumptionHistoryItem(BaseModel):
    month: str
    year: int
    units_kwh: int
    amount_lkr: float

class PaymentRequest(BaseModel):
    account_number: str
    amount: float
    payment_method: str = "card"  # "card" or "lanka_qr"

class PaymentResponse(BaseModel):
    status: str
    transaction_id: str
    amount_paid: float
    remaining_balance: float
    message: str

# --- Complaint Schemas ---
class ComplaintCreate(BaseModel):
    account_number: Optional[str] = None
    category: str = Field(..., description="e.g. Breakdown, Voltage, Meter")
    nature: str = Field(..., description="Brief nature of incident")
    description: Optional[str] = None
    area: str = Field(..., description="Affected location/district")
    phone: str = Field(..., description="Contact telephone number")

class ComplaintDetail(BaseModel):
    ticket_id: str
    account_number: Optional[str] = None
    category: str
    nature: str
    description: Optional[str] = None
    area: str
    phone: str
    status: str
    assigned_depot: str
    logged_date: str
    estimated_completion: str

class ComplaintUpdate(BaseModel):
    status: Optional[str] = Field(None, description="Updated status: PENDING, IN_PROGRESS, or RESOLVED")
    estimated_completion: Optional[str] = Field(None, description="Updated estimated completion time")
    description: Optional[str] = Field(None, description="Additional technician or resolution notes")

# --- Outage Schemas ---
class OutageItem(BaseModel):
    id: int
    outage_code: str
    area: str
    district: str
    feeder_name: str
    outage_type: str
    affected_customers: int
    start_time: str
    estimated_restoration: str
    status: str
    latitude: float
    longitude: float
    reason: str

# --- Solar Capacity Schemas ---
class SolarCapacityQuery(BaseModel):
    transformer_code: str

class SolarCapacityResponse(BaseModel):
    transformer_code: str
    area: str
    district: str
    feeder_name: str
    total_capacity_kva: float
    used_capacity_kva: float
    remaining_capacity_kw: float
    max_threshold_pct: float
    status: str
    is_available: bool

# --- Chat Schemas ---
class RichCardData(BaseModel):
    type: str  # "bill", "consumption", "complaint", "outage", "solar"
    title: str
    data: Dict[str, Any]

class ChatRequest(BaseModel):
    message: str = Field(..., description="Customer message or query in English, Sinhala or Tamil")
    mode: ChatMode = Field(default=ChatMode.guest, description="Option C Access Mode: guest or customer")
    language: Language = Field(default=Language.en, description="Selected language: en, si, or ta")
    account_number: Optional[str] = Field(default=None, description="Optional customer account number for authenticated sessions")
    session_id: Optional[str] = Field(default=None, description="Optional multi-turn session ID")

class ChatResponse(BaseModel):
    reply: str
    mode: ChatMode
    scope: AccessScope
    language: Language
    is_mock: bool = True
    action_required: Optional[str] = None  # e.g. "login", "pay", "complaint"
    sources: List[str] = []
    account_ref: Optional[str] = None
    rich_card: Optional[RichCardData] = None
    session_id: Optional[str] = None

class FeatureMatrixItem(BaseModel):
    feature: str
    guest: bool
    customer: bool
    guest_note: Optional[str] = None
    customer_note: Optional[str] = None
