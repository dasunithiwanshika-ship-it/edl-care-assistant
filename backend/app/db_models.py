"""
SQLAlchemy ORM Models for EDL Care Assistant Prototype
Covers Customers, Accounts, Bills, Consumption, Complaints, Outages, Solar Transformers, and Chat History.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    accounts = relationship("Account", back_populates="customer", cascade="all, delete-orphan")

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    account_number = Column(String(20), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    premises_name = Column(String(100), default="Home")
    premises_address = Column(String(255), nullable=False)
    tariff_category = Column(String(50), default="Domestic (D-1)")
    connected_feeder = Column(String(100), default="Feeder F-04 Havelock")
    substation_code = Column(String(50), default="TR-402 (Nugegoda)")
    outstanding_balance = Column(Float, default=0.0)
    due_date = Column(String(20), default="2026-11-25")
    last_payment_amount = Column(Float, default=0.0)
    last_payment_date = Column(String(20), default="2026-10-15")
    monthly_consumption_kwh = Column(Integer, default=142)
    monthly_average_kwh = Column(Integer, default=154)
    solar_capacity_kw = Column(Float, default=0.0)
    is_solar = Column(Boolean, default=False)

    customer = relationship("Customer", back_populates="accounts")
    bills = relationship("Bill", back_populates="account", cascade="all, delete-orphan")
    consumption_records = relationship("ConsumptionRecord", back_populates="account", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="account", cascade="all, delete-orphan")

class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    billing_month = Column(String(30), nullable=False)  # e.g., "October 2026"
    previous_reading = Column(Integer, default=1240)
    present_reading = Column(Integer, default=1394)
    units_consumed = Column(Integer, default=154)
    energy_charge = Column(Float, default=3850.00)
    fixed_charge = Column(Float, default=1000.00)
    fuel_adjustment = Column(Float, default=0.00)
    total_amount = Column(Float, default=4850.00)
    due_date = Column(String(20), default="2026-11-25")
    is_paid = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    account = relationship("Account", back_populates="bills")

class ConsumptionRecord(Base):
    __tablename__ = "consumption_records"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    month = Column(String(20), nullable=False)  # e.g., "May", "Jun", etc.
    year = Column(Integer, default=2026)
    units_kwh = Column(Integer, nullable=False)
    amount_lkr = Column(Float, nullable=False)

    account = relationship("Account", back_populates="consumption_records")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String(30), unique=True, index=True, nullable=False)  # e.g., "REF-2026-9841"
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    category = Column(String(50), nullable=False)  # "Breakdown", "Voltage Fluctuation", "Meter Fault"
    nature = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    area = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    status = Column(String(30), default="IN_PROGRESS")  # "PENDING", "IN_PROGRESS", "RESOLVED"
    assigned_depot = Column(String(100), default="Area Engineer Depot")
    logged_date = Column(String(30), default=lambda: datetime.utcnow().strftime("%Y-%m-%d %H:%M"))
    estimated_completion = Column(String(50), default="Within 4 hours")

    account = relationship("Account", back_populates="complaints")

class Outage(Base):
    __tablename__ = "outages"

    id = Column(Integer, primary_key=True, index=True)
    outage_code = Column(String(30), unique=True, index=True, nullable=False)  # e.g., "OUT-2026-1089"
    area = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    feeder_name = Column(String(100), nullable=False)
    outage_type = Column(String(30), nullable=False)  # "planned" or "breakdown"
    affected_customers = Column(Integer, default=450)
    start_time = Column(String(30), default="Today, 09:30 AM")
    estimated_restoration = Column(String(50), default="Today, 03:30 PM")
    status = Column(String(30), default="In Progress")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    reason = Column(String(255), default="Overhead line maintenance")

class SolarTransformer(Base):
    __tablename__ = "solar_transformers"

    id = Column(Integer, primary_key=True, index=True)
    transformer_code = Column(String(50), unique=True, index=True, nullable=False)  # e.g., "TR-402"
    area = Column(String(100), nullable=False)
    district = Column(String(100), default="Colombo")
    feeder_name = Column(String(100), default="Feeder F-04")
    total_capacity_kva = Column(Float, default=160.0)
    used_capacity_kva = Column(Float, default=88.0)
    remaining_capacity_kw = Column(Float, default=42.0)
    max_threshold_pct = Column(Float, default=80.0)
    status = Column(String(30), default="Capacity Available")

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), unique=True, index=True, nullable=False)
    account_number = Column(String(20), nullable=True)
    mode = Column(String(20), default="guest")  # "guest" or "customer"
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("ChatMessageRecord", back_populates="session", cascade="all, delete-orphan")

class ChatMessageRecord(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    sender = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    language = Column(String(10), default="en")
    timestamp = Column(String(30), nullable=False)
    action_required = Column(String(30), nullable=True)
    sources = Column(Text, nullable=True)  # JSON-encoded array or comma-separated

    session = relationship("ChatSession", back_populates="messages")
