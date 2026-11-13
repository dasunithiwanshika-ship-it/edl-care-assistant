# EDL Care Assistant – AI & Backend Services

This directory contains the **Python FastAPI** backend services powering the **Option C – Guest + Login-Based AI Chatbot** architecture for Electricity Distribution Lanka (EDL).

---

## ⚡ 1. Architecture Overview (Option C)

The system enforces strict permission separation between **Guest** inquiries and **Authenticated Customer** sessions through a shared AI backend:

```
                      ┌────────────────────────────────────────┐
                      │          EDL Care Assistant UI         │
                      │        (Web Next.js / Mobile)          │
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
                      │  RAG Knowledge   ││ Fictional Customer DB  │
                      │  (Tariffs,       ││ (#0412345678, Bills,   │
                      │   Safety, Solar) ││  Usage, Complaints)    │
                      └──────────┬───────┘└──────────┬─────────────┘
                                 │                   │
                                 ▼                   ▼
                      ┌────────────────────────────────────────┐
                      │      Google Gemini LLM Generator       │
                      │    (Strict Mode-Scoped Prompts)        │
                      └────────────────────────────────────────┘
```

---

## 📊 2. Feature Comparison Matrix

| Feature | Guest Mode (No Login) | Customer Mode (Logged In) |
| :--- | :---: | :---: |
| **General electricity FAQs** | ✅ | ✅ |
| **Tariff explanations** | ✅ | ✅ |
| **Electrical safety guidance** | ✅ | ✅ |
| **General outage guidance** | ✅ | ✅ |
| **Personal bill details** | 🔒 Login required | ✅ |
| **Personal consumption history** | 🔒 Login required | ✅ |
| **Personal complaint tracking** | 🔒 Login required | ✅ |
| **Personalized account assistance** | 🔒 Login required | ✅ |

---

## 💬 3. Example Conversations

### A. Guest Conversation
> **User**: *How can I understand my electricity bill?*  
> **Assistant**: *I can help you understand electricity billing, consumption units and applicable tariff structures. In Sri Lanka, domestic bills consist of (1) Block-based energy charges per kWh, (2) Fixed service charges, and (3) Applicable fuel adjustment levy. Would you like to explore a sample bill?*

> **User**: *What is my outstanding bill?*  
> **Assistant**: *🔒 Customer Login Required: In Guest Mode, individual bill records and personal balances are protected. Please sign in to your EDL Care account to view your outstanding balance, payment history, and active breakdown complaints.*

### B. Logged-in Customer Conversation
> **User**: *What is my outstanding bill?*  
> **Assistant**: *Your demo account (#0412345678 – Home) has an outstanding balance of Rs. 4,850.00 for October 2026. Payment is due on 25 Nov 2026. Would you like to proceed with an instant online payment?*

---

## 🚀 4. Running the Backend Service

### Prerequisites
- Python 3.10+
- (Optional) `GEMINI_API_KEY` in `.env` for live Google Gemini processing (the system automatically falls back to high-fidelity mock responses when no key is present).

### Setup & Run
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # Linux / macOS

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

API documentation will be accessible at:
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`
- Chat API: `POST http://localhost:8000/api/chat`
- Feature Matrix: `GET http://localhost:8000/api/features`
