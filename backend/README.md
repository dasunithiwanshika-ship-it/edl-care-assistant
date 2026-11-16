# EDL Care Assistant – Backend & AI Services

> **Electricity Distribution Lanka (EDL)**  
> *FastAPI Gateway, SQLite Persistence, ChromaDB Semantic RAG, and Google Gemini Service*

---

## ⚡ 1. Architecture Overview (Option C)

The system implements the **Option C – Guest + Login-Based AI Chatbot** specification, maintaining strict access boundaries between public knowledge and private customer data:

```
                      ┌────────────────────────────────────────┐
                      │          EDL Care Assistant UI         │
                      │       (Next.js Web / Expo Mobile)      │
                      └──────────────────┬─────────────────────┘
                                         │
                         [Access Mode: Guest / Customer]
                                         │
                                         ▼
                      ┌────────────────────────────────────────┐
                      │          FastAPI Gateway               │
                      │  (Scope Resolver & Auth Verification)   │
                      └──────────┬───────────────────┬─────────┘
                                 │                   │
         [Guest Scope: Public Only]        [Customer Scope: Authenticated]
                                 │                   │
                                 ▼                   ▼
                      ┌──────────────────┐┌────────────────────────┐
                      │  ChromaDB RAG    ││ SQLite Database        │
                      │  Knowledge Base  ││ (Accounts, Bills,      │
                      │  (Tariffs,       ││  Usage, Complaints,    │
                      │   Safety, Solar) ││  Transformers, Outages)│
                      └──────────┬───────┘└──────────┬─────────────┘
                                 │                   │
                                 ▼                   ▼
                      ┌────────────────────────────────────────┐
                      │      Google Gemini Generator           │
                      │    (Strict Mode-Scoped Prompts)        │
                      └──────────────────┬─────────────────────┘
                                         │
                                         ▼
                      ┌────────────────────────────────────────┐
                      │ Rich Structured UI Cards / Responses   │
                      │ (Bill, Consumption, Complaint, Solar)  │
                      └────────────────────────────────────────┘
```

---

## 🔐 2. Fictional Customer Accounts

Three distinct demonstration accounts are seeded in SQLite:

| Account # | Customer Name | Category | Premises | Balance | Monthly kWh | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0412345678** | Dasuni Thiwanshika | Domestic (D-1) | Home, Colombo 05 | Rs. 4,850.00 | 142 kWh | Low-usage lifeline domestic customer; active breakdown complaint `#REF-2026-9841`. |
| **0723456789** | Sunil M. Fernando | Domestic (D-1 High) | Residence, Kandy | Rs. 18,200.00 | 340 kWh | High-usage tier with workshop. |
| **0134567890** | R. Jayasuriya | Domestic (Net-Metering) | Eco Villa, Galle | Rs. 1,200.00 | 45 kWh (net) | 5.0 kW Rooftop Solar PV Net-Metering customer. |

*Demo Account Password*: `demo123`

---

## 📚 3. Semantic RAG Knowledge Base

The RAG pipeline (`backend/rag/`) indexes authentic Sri Lankan electricity utility documents from `knowledge_base/`:
- `domestic_tariffs_2026.txt`: PUCSL approved 5-tier cumulative block domestic tariff structure.
- `understanding_electricity_bill.txt`: Energy charge, fixed service charges, FAS levies, and meter telemetry.
- `electrical_safety_standards.txt`: 30mA ELCB monthly testing, 3m wire clearance, 10m perimeter, and 1987 hotline.
- `power_breakdown_procedures.txt`: Reporting channels, Area Engineer Depot dispatch, and ticket lifecycles.
- `rooftop_solar_guidelines.txt`: Net-Metering, Net-Accounting, Net-Plus, and 80% transformer threshold.
- `edl_customer_charter_2026.pdf`: Official service timelines, connection standards, and meter accuracy rules.

Documents are extracted with `pypdf`, chunked with semantic overlap, embedded into 128-dimensional multilingual concept vectors, and indexed in persistent **ChromaDB** (`backend/chroma_db/`).

---

## 🛠️ 4. API Endpoints

### Authentication
- `POST /api/auth/login`: Accepts username/account number and password; returns Bearer token.
- `POST /api/auth/register`: Demo customer registration.
- `GET /api/auth/me`: Authenticated profile verification.

### AI Chatbot
- `POST /api/chat`: Unified chat endpoint with Guest vs Customer scoping and rich UI card generation.
- `GET /api/chat/history`: Multi-turn session message history.
- `GET /api/features`: Official Option C Feature Comparison Matrix.

### Customer Services
- `GET /api/customers/me`: Authenticated account summary.
- `GET /api/customers/me/bills`: Itemized billing statements (full 12-month billing history).
- `GET /api/customers/me/consumption`: 12-month historical consumption data.
- `POST /api/customers/me/pay`: Simulated instant bill payment gateway.

### Complaints
- `POST /api/complaints`: Logs breakdown incident; generates tracking reference `#REF-2026-XXXX`.
- `GET /api/complaints`: Lists customer/recent complaints (Pending, In Progress, Resolved).
- `GET /api/complaints/{ticket_id}`: Tracks complaint status and assigned depot.
- `PATCH /api/complaints/{ticket_id}`: Updates complaint lifecycle status and adds technician resolution notes.

### Grid Telemetry & Solar
- `GET /api/outages`: Simulated grid disruptions with geographic coordinates (8 areas across Sri Lanka).
- `GET /api/outages/areas`: Affected districts.
- `GET /api/solar/capacity`: Checks transformer absorption capacity.
- `GET /api/solar/transformers`: Lists demo distribution transformers (6 transformers with diverse threshold states).

---

## 🚀 5. How to Run & Test

```bash
# Navigate to backend directory
cd backend

# Seed SQLite database
python -m backend.mock_data.seed

# Run automated test suite (17 tests)
python -m pytest backend/tests/test_api.py -v

# Start FastAPI server
uvicorn backend.app.main:app --reload --port 8000
```
