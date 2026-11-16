# EDL Care Assistant – AI-Powered Multilingual Customer Support System

> **Electricity Distribution Lanka (EDL), Sri Lanka**  
> *Demonstration Prototype – Version 1.0 (Web Portal, Expo Mobile App & Hybrid AI Backend)*

---

## ⚡ 1. Project Overview

**EDL Care Assistant** is an enterprise-grade utility customer service and conversational AI system developed for **Electricity Distribution Lanka (EDL)**. Designed to serve electricity consumers in **English**, **Sinhala (සිංහල)**, and **Tamil (தமிழ்)**, the platform integrates both a responsive Next.js web portal and a cross-platform React Native / Expo mobile app powered by a shared FastAPI microservice with Google Gemini and ChromaDB Semantic Retrieval-Augmented Generation (RAG).

> ⚠️ **IMPORTANT DEMONSTRATION NOTICE**  
> This project is an independent engineering and UI/UX demonstration prototype. It operates entirely on fictional customer accounts, mock tariffs, and simulated grid telemetry. It does not connect to, query, or modify official EDL production servers, customer databases, or live utility networks.

---

## 🏛️ 2. System Architecture

```
                    ┌────────────────────────────┐    ┌────────────────────────────┐
                    │    EDL Care Web Portal     │    │   EDL Care Mobile App      │
                    │   (Next.js 14 / Leaflet)   │    │  (React Native / Expo TS)  │
                    └─────────────┬──────────────┘    └─────────────┬──────────────┘
                                  │                                 │
                                  └────────────────┬────────────────┘
                                                   │
                                     REST API / JSON (CORS Enabled)
                                                   │
                                                   ▼
                    ┌──────────────────────────────────────────────────────────────┐
                    │                FastAPI Application Gateway                   │
                    │        (Option C Dual Scope: Guest vs Customer Mode)         │
                    └──────────────┬───────────────────────────────┬───────────────┘
                                   │                               │
                 [Guest Scope: Public Only]          [Customer Scope: Authenticated]
                                   │                               │
                                   ▼                               ▼
                    ┌────────────────────────────┐  ┌──────────────────────────────┐
                    │      ChromaDB Vector DB    │  │       SQLite Database        │
                    │   (PDF & Text Knowledge)   │  │  (Accounts, Bills, Outages)  │
                    └──────────────┬─────────────┘  └──────────────┬───────────────┘
                                   │                               │
                                   ▼                               ▼
                    ┌──────────────────────────────────────────────────────────────┐
                    │              Google Gen AI SDK (Gemini AI)                   │
                    │      (Trilingual Prompts & Structured UI Card Generator)     │
                    └──────────────────────────────────────────────────────────────┘
```

---

## 🎨 3. Visual Design System

Reflects the authoritative utility visual identity of EDL:

| Role | Color Name | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | Primary Maroon | `#7A1428` | Main branding, primary buttons, gradients, headers |
| **Accent** | Dark Maroon | `#5C0D1D` | Deep gradient stops, active states |
| **Accent** | Light Maroon | `#9E1B34` | Highlights, hover borders |
| **Accent** | Utility Gold | `#F5C518` | Electric bolt icons, badges, indicators, accents |
| **Background** | Light Surface | `#F5F6F8` | Main application background (Light mode) |
| **Cards** | Light Card | `#FFFFFF` | Rounded cards, containers, modal bodies |
| **Text** | Primary Text | `#1A1D20` | High-contrast headings and body copy |
| **Text** | Secondary Text | `#687078` | Subheadings, timestamps, field labels |
| **Dark Theme** | Deep Slate | `#111315` / `#1C1F22` | Full dark mode surface & card background |

---

## 👥 4. Fictional Demonstration Accounts

Three distinct customer profiles are seeded in the SQLite database:

| Account Number | Customer Name | Tariff Category | Premises Address | Outstanding | Monthly kWh | Profile Details |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0412345678** | Dasuni Thiwanshika Premawardana | Domestic (D-1) | No. 42, Sri Jayawardenepura Mawatha, Colombo 05 | Rs. 4,850.00 | 142 kWh | Low-usage domestic customer; active breakdown complaint `#REF-2026-9841`. |
| **0723456789** | Sunil M. Fernando | Domestic (D-1 High) | No. 118, Peradeniya Road, Kandy | Rs. 18,200.00 | 340 kWh | High-usage tier with workshop. |
| **0134567890** | R. Jayasuriya | Domestic (Net-Metering) | No. 15, Sea Breeze Mawatha, Galle Fort | Rs. 1,200.00 | 45 kWh (net) | 5.0 kW Rooftop Solar PV Net-Metering customer. |

*Demonstration Password*: `demo123`

---

## 🤖 5. Option C Dual-Access AI Chatbot

The chatbot strictly enforces permission separation between public visitors and authenticated customers:

| Feature | Guest Mode (Public) | Customer Mode (Authenticated) |
| :--- | :---: | :---: |
| **General electricity FAQs** | ✅ | ✅ |
| **Tariff explanations** | ✅ | ✅ |
| **Electrical safety guidance** | ✅ | ✅ |
| **General outage guidance** | ✅ | ✅ |
| **Personal bill details** | 🔒 Requires login (`action_required='login'`) | ✅ Full itemized bill statement card |
| **Personal consumption history** | 🔒 Requires login | ✅ 6-month historical usage card |
| **Personal complaint tracking** | 🔒 Requires login | ✅ Live status card (`#REF-2026-9841`) |
| **Personalized account assistance** | 🔒 Requires login | ✅ Empathic multi-turn assistant |

---

## 🗺️ 6. Interactive Outage Map (Leaflet & OpenStreetMap)

- Route: `/outages` (Web) and `OutageMapScreen` (Mobile)
- Built with **Leaflet** and **OpenStreetMap** with dynamic SSR-safe rendering.
- Custom styled markers:
  - 🔴 Red pulsing markers for active breakdowns (e.g. Havelock F-04, Ekala J-08).
  - 🟡 Amber markers for planned maintenance (e.g. Kandy K-02, Galle G-01).
- Map popups show feeder name, affected premises count, restoration ETA, and field crew status.
- Layer toggles: OpenStreetMap, Satellite, and Grid Topology vector diagrams.

---

## 🚀 7. Step-by-Step Setup & Execution

### 1. Backend Setup & Startup (FastAPI + ChromaDB)

```bash
# Navigate to backend directory
cd backend

# Install Python requirements
pip install -r requirements.txt

# Seed SQLite database
python -m backend.mock_data.seed

# Run automated test suite (17 tests)
python -m pytest backend/tests/test_api.py -v

# Start FastAPI server (Port 8000)
uvicorn backend.app.main:app --reload --port 8000
```

FastAPI Swagger Documentation will be accessible at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Web Portal Setup & Startup (Next.js 14)

```bash
# Navigate to web frontend directory
cd frontend/web

# Install dependencies (if not already installed)
npm install

# Start Next.js development server (Port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Mobile App Setup & Startup (React Native Expo)

```bash
# Navigate to mobile directory
cd mobile

# Start Expo development server
npx expo start
```

Press `w` to open in web browser, or scan the QR code using Expo Go on your mobile device.

---

## 🧪 8. Automated Test Suite (17 Scenarios Passed)

Run the test suite at any time:
```bash
python -m pytest backend/tests/test_api.py -v
```

All 17 tests validate:
- API health and architecture declaration.
- Demo customer authentication and PBKDF2 password verification.
- Customer account isolation (customers can only access their own bills and records).
- Instant bill payment balance deductions.
- Emergency breakdown complaint logging and ticket status tracking.
- Grid outage listing with coordinates.
- Solar transformer capacity quota calculations.
- Option C Guest permission gating (`action_required="login"` on private queries).
- Option C Authenticated customer inquiries with rich UI card payloads.
- Multi-turn conversation context memory (e.g. "compare with last month").
- Trilingual queries in English, Sinhala, and Tamil.
