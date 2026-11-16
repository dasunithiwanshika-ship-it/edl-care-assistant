# EDL Care Assistant – Cross-Platform Mobile Application

> **Electricity Distribution Lanka (EDL)**  
> *React Native & Expo Prototype (TypeScript)*

---

## 📱 1. Architecture Overview

The mobile client is built on **React Native** and **Expo**, designed to share the same FastAPI backend (`http://localhost:8000/api`) and Option C AI architecture as the web portal.

```
                    ┌───────────────────────────────┐
                    │  EDL Care Mobile Application  │
                    │      (Expo / React Native)    │
                    └───────────────┬───────────────┘
                                    │
                         REST API Requests (JSON)
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │    Shared FastAPI Gateway     │
                    │    (Auth, Scope Enforcement)  │
                    └───────┬───────────────┬───────┘
                            │               │
                            ▼               ▼
                   [Public Knowledge]   [Customer DB]
                   ChromaDB RAG Docs    SQLite Seed DB
```

---

## 🎨 2. Visual Design System

The mobile application strictly reflects EDL's brand identity:
- **Primary Maroon**: `#7A1428`
- **Dark Maroon**: `#5C0D1D`
- **Light Maroon**: `#9E1B34`
- **Utility Gold**: `#F5C518`
- **Background**: `#F5F6F8` (Light) / `#111315` (Dark)
- **Cards**: `#FFFFFF` / `#1C1F22`

---

## 🚀 3. Features & Screens

1. **Dashboard (`DashboardScreen.tsx`)**:
   - Maroon gradient account summary card with Account Number (`#0412345678`), due date (`25 Nov 2026`), and outstanding balance (`Rs. 4,850.00`).
   - Simulated LankaQR Pay Now modal.
   - Monthly electricity consumption card with -11.2% efficiency trend.
   - Nearby feeder outage alert.
   - Quick service shortcuts (Outage Map, Breakdown Complaint, Solar Capacity, AI Assistant).
2. **AI Chatbot (`ChatbotScreen.tsx`)**:
   - Option C access boundary toggle: **Guest Mode ⇄ Customer Mode**.
   - Trilingual engine: **English**, **Sinhala (සිංහල)**, and **Tamil (தமிழ்)**.
   - Multi-turn conversation history.
   - Rich response cards: Bill Summary, Consumption Trends, Complaint Status, and Solar Feasibility.
   - Mode-scoped quick-reply suggestion chips.
3. **Outage Monitor (`OutageMapScreen.tsx`)**:
   - Interactive grid disruption monitor with status filters (`All`, `Planned`, `Breakdown`).
   - Detailed incident inspection: feeder name, affected premises count, restoration ETA, and field crew dispatch.
4. **Itemized Bill Details (`BillDetailsScreen.tsx`)**:
   - Comprehensive tariff statement: meter telemetry, 4-tier block energy charges, fixed charges, and total due.
5. **Consumption History (`ConsumptionScreen.tsx`)**:
   - 6-month historical consumption bar chart and comparative statement.
6. **Breakdown Reporting (`ComplaintsScreen.tsx`)**:
   - Emergency incident submission with ticket generation (`#REF-2026-XXXX`).
7. **Solar Feeder Capacity (`SolarScreen.tsx`)**:
   - Substation transformer capacity query (`TR-402`, `TR-105`, `TR-780`) with remaining absorption threshold.
8. **Customer Sign In (`LoginScreen.tsx`)**:
   - Quick-fill demonstration accounts for the 3 demo customer profiles.

---

## 💻 4. Running the Mobile Application

### Prerequisites
- Node.js v18+
- Expo CLI (`npx expo`)
- Expo Go on iOS or Android (optional for live device preview)

### Execution
```bash
# Navigate to mobile directory
cd mobile

# Start Expo development server
npx expo start
```

Press `w` to run in web browser, or scan the QR code with Expo Go.
