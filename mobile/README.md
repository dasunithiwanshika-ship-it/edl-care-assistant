# EDL Care Assistant – Cross-Platform Mobile Application

> **Electricity Distribution Lanka (EDL)**  
> *React Native & Expo Prototype (TypeScript)*

---

## 📱 1. Architecture Overview

The mobile client is built on **React Native** and **Expo (SDK 58)**, sharing the same live FastAPI backend gateway (`/api`), SQLite database (`edl_care.db`), and Option C AI architecture as the web portal.

```
                    ┌───────────────────────────────┐
                    │  EDL Care Mobile Application  │
                    │      (Expo / React Native)    │
                    └───────────────┬───────────────┘
                                    │
                     REST API & JWT Bearer Auth (JSON)
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   FastAPI Gateway (0.0.0.0)   │
                    │   - Customer Profile & Bills  │
                    │   - LankaQR Simulated Payment │
                    │   - Complaint Dispatches      │
                    │   - Outages & Solar Feasibility│
                    │   - Option C AI Chat Engine   │
                    └───────┬───────────────┬───────┘
                            │               │
                            ▼               ▼
                    [Public Knowledge]   [Customer DB]
                    ChromaDB RAG Docs    SQLite edl_care.db
```

---

## 🌐 2. Dynamic Network Configuration

The application dynamically detects and resolves the correct backend host address across different runtime environments:

| Device / Environment | Resolved API Base URL | Behavior |
|---|---|---|
| **Custom Environment Variable** | `$EXPO_PUBLIC_API_URL` | User-defined URL (e.g. ngrok tunnel or specific LAN IP) |
| **Physical Phone (Expo Go, LAN mode)** | `http://<LAN_IP>:8000/api` | Auto-detected from Expo `Constants.expoConfig.hostUri` |
| **Physical Phone (Expo Go, tunnel mode)** | `http://<LAN_IP>:8000/api` | Set `EXPO_PUBLIC_API_URL`; the Expo tunnel carries the app bundle, not backend requests |
| **Android Emulator** | `http://10.0.2.2:8000/api` | Uses standard Android loopback alias to host machine |
| **iOS Simulator & Web** | `http://127.0.0.1:8000/api` | Standard local loopback |
| **Offline Mode** | Fallback records | Graceful offline mode if backend server is unreachable |

### Finding & Overriding Your LAN IP
If your mobile device is on a different Wi-Fi subnet or you wish to override the host address manually:
```bash
# 1. Check your computer's local Wi-Fi IP address (Windows PowerShell):
ipconfig
# (e.g., IPv4 Address: 10.84.172.104)

# 2. Launch Expo with the explicit backend URL (replace with your current Wi-Fi IP):
$env:EXPO_PUBLIC_API_URL="http://10.84.172.104:8000/api"
npx expo start --tunnel ngrok --clear
```

---

## 🎨 3. Visual Design System

The mobile application strictly preserves EDL's approved utility brand identity:
- **Primary Maroon**: `#7A1428`
- **Dark Maroon**: `#5C0D1D`
- **Light Maroon**: `#9E1B34`
- **Utility Gold**: `#F5C518`
- **Background**: `#F5F6F8` (Light) / `#111315` (Dark)
- **Cards**: `#FFFFFF` / `#1C1F22`

---

## 🚀 4. Screens & Connected Features

1. **Dashboard (`DashboardScreen.tsx`)**:
   - Maroon gradient account summary card with Account Number (`#0412345678`), due date (`25 Nov 2026`), and live outstanding balance (`Rs. 4,850.00`).
   - Live simulated **LankaQR Pay Now modal** with real-time balance deduction via `POST /api/customers/me/pay`.
   - Monthly electricity consumption card with -11.2% efficiency trend.
   - Nearby feeder breakdown alert banner.
   - Quick service shortcuts (Outage Map, Breakdown Complaint, Solar Capacity, AI Assistant).
2. **AI Chatbot (`ChatbotScreen.tsx`)**:
   - **Option C Policy Boundary**: **Guest Mode ⇄ Customer Mode**.
     - In **Guest Mode**, attempts to access personal bills or account balances are restricted with `action_required: "login"`.
     - In **Customer Mode**, authenticated user context is injected and structured **Rich Response Cards** (`bill`, `complaint`, `solar`) are rendered.
   - Trilingual engine: **English**, **Sinhala (සිංහල)**, and **Tamil (தமிழ்)**.
   - Multi-turn conversation tracking via `session_id`.
   - Context-aware quick-reply suggestion chips.
3. **Breakdown Reporting (`ComplaintsScreen.tsx`)**:
   - Live complaint filing with incident persistence via `POST /api/complaints`.
   - Generates and returns persistent ticket reference (e.g. `#REF-2026-3938`).
   - Real-time ticket history and reference search with status badges (`PENDING`, `IN_PROGRESS`, `RESOLVED`).
4. **Itemized Bill Details (`BillDetailsScreen.tsx`)**:
   - Comprehensive tariff statement: meter telemetry, 4-tier block energy charges, fixed charges, and total due.
   - Multi-cycle billing history selector.
   - Instant bill settlement with live receipt confirmation.
5. **Consumption History (`ConsumptionScreen.tsx`)**:
   - 12-month historical consumption bar chart and comparative statement via `GET /api/customers/me/consumption`.
6. **Outage Monitor (`OutageMapScreen.tsx`)**:
   - Interactive grid disruption monitor with status filters (`All`, `Planned`, `Breakdown`).
   - Detailed incident inspection: feeder name, affected premises count, restoration ETA, and coordinates.
7. **Solar Feeder Capacity (`SolarScreen.tsx`)**:
   - Substation transformer capacity query (`TR-402`, `TR-105`, `TR-780`) with remaining absorption threshold.
   - Real-time feasibility check via `GET /api/solar/capacity`.
8. **Customer Sign In (`LoginScreen.tsx`)**:
   - Secure authentication via `POST /api/auth/login`.
   - Secure token storage using `expo-secure-store`.
   - Quick-fill demonstration accounts for the 3 demo customer profiles (`0412345678`, `0723456789`, `0134567890`).

---

## 💻 5. Running & Testing

### Running the Backend Server
```bash
# In repository root:
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Running the Automated Mobile Integration Test Suite
```bash
# Run 15 automated integration tests against live backend:
node mobile/tests/test_mobile_integration.mjs
```

### Launching the Expo Development Server
```bash
cd mobile
# Replace this IP with the computer's current Wi-Fi IPv4 address from `ipconfig`.
$env:EXPO_PUBLIC_API_URL="http://10.84.172.104:8000/api"
npx expo start --tunnel ngrok --clear
```
- Press `w` to open in browser web view.
- Scan the new terminal QR code with **Expo Go SDK 58** on Android or iOS. Keep the phone and computer on the same Wi-Fi so the phone can reach the backend API.
