# EDL Care Assistant – AI-Powered Multilingual Customer Support System

> **Electricity Distribution Lanka (EDL), Sri Lanka**  
> *Demonstration Prototype – Version 1.0 (Web Dashboard & AI Chatbot)*

---

## ⚡ 1. Project Overview

**EDL Care Assistant** is a modern, enterprise-grade electricity utility customer portal and AI assistant demonstration prototype developed for **Electricity Distribution Lanka (EDL)**. Inspired by the visual identity and service workflows of EDL Care web and mobile applications, this system introduces intuitive customer self-service, real-time grid disruption awareness, and intelligent multilingual customer support in **English**, **Sinhala (සිංහල)**, and **Tamil (தமிழ்)**.

> ⚠️ **IMPORTANT DEMONSTRATION NOTICE**  
> This project is an independent engineering and UI/UX demonstration prototype. It operates entirely on fictional customer accounts, mock tariffs, and simulated grid telemetry. It does not connect to, query, or modify official EDL production servers, customer databases, or live utility networks.

---

## 🎨 2. Brand Identity & Visual Design

The UI reflects the authoritative utility identity of EDL:

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
| **Dark Theme** | Deep Slate | `#0C0F14` / `#161B22` | Full dark mode surface & card background |

---

## 🚀 3. Key Features in Version 1.0

### A. Multilingual Experience
- Real-time language switching across **English**, **Sinhala (සිංහල)**, and **Tamil (தமிழ்)**.
- Full localization of navigation links, billing summaries, service descriptions, outage records, and chatbot greetings.

### B. Interactive Customer Dashboard
- **Fictional Account Summary Card**:
  - Displays customer name (`K. A. Perera`), premises nickname (`Home`), account number (`0412345678`), billing month (`October 2026`), and outstanding balance (`Rs. 4,850.00`).
  - **Bill Details Modal**: Itemized breakdown showing previous vs. present meter readings (154 kWh total), 4-tier domestic tariff calculations, fixed service charges, and fuel adjustment surcharges.
  - **Pay Now Modal**: Simulated instant payment gateway with LKR payment processing, debit/credit card and LankaQR options, and real-time balance deduction.
- **Monthly Electricity Consumption Card**:
  - Interactive 6-month historical consumption area chart built with **Recharts**.
  - Styled with custom maroon-to-gold linear gradients, month-over-month percentage indicators (`+8.4%`), and detailed hover tooltips.
- **Power Outage Alert Card**:
  - Highlights nearby feeder status (e.g. *Havelock F-04 Feeder breakdown under active crew repair*).
  - One-click trigger for emergency breakdown reporting.
- **Quick Services Grid**:
  - 4 fast-track self-service cards: *View Electricity Bill*, *Check Outage*, *Report Breakdown*, and *Solar Services*.

### C. EDL Care Assistant (Option C – Guest + Login-Based AI Chatbot)
- **Official Access Architecture (Option C)**:
  - **Guest Mode (No Login)**: Unrestricted public access to general electricity FAQs, tiered tariff explanations, electrical safety advice, and general outage guidance.
  - **Customer Mode (Authenticated)**: Personalized account assistance with live access to fictional customer bills, 6-month consumption history, active breakdown complaints, and dedicated feeder solar capacity.
  - **Shared AI Backend**: Google Gemini + RAG Knowledge Base with strict scope and permission boundaries separating public requests from authenticated accounts.
- **In-App Feature Comparison Matrix**:
  | Feature | Guest | Logged In |
  | :--- | :---: | :---: |
  | General electricity FAQs | ✅ | ✅ |
  | Tariff explanations | ✅ | ✅ |
  | Electrical safety guidance | ✅ | ✅ |
  | General outage guidance | ✅ | ✅ |
  | Personal bill details | 🔒 Login required | ✅ |
  | Personal consumption history | 🔒 Login required | ✅ |
  | Personal complaint tracking | 🔒 Login required | ✅ |
  | Personalized account assistance | 🔒 Login required | ✅ |
- **Interactive UI Capabilities**:
  - One-click **Guest ⇄ Customer** mode switcher pill in chat header for instant demonstration.
  - "Compare Modes" feature matrix modal right inside the chat window.
  - Mode-adaptive quick-reply chips and greeting messages.
  - Contextual action buttons in bot replies (e.g., *[Pay Rs. 4,850.00]*, *[View Bill Details]*, *[Customer Sign In]*).
  - Trilingual conversation engine in **English**, **Sinhala (සිංහල)**, and **Tamil (தமிழ்)**.

### D. Outage Map & Grid Disruption Monitor
- Dedicated route `/outages` prepared for integration with **Leaflet** and **OpenStreetMap**.
- Filter outages by *All Outages*, *Planned Maintenance*, and *Active Breakdowns*.
- Interactive vector grid map featuring substation nodes and outage clusters across Sri Lankan provinces (Colombo, Kandy, Galle, Gampaha, Battaramulla).
- Comprehensive outage metadata: Feeder name, affected premises, estimated restoration time, and crew dispatch status.
- **Report Breakdown Modal**: Multi-step emergency incident reporting with ticket generation (e.g., `#TKT-2026-4821`).

---

## 🛠️ 4. Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Library**: React 18
- **Language**: TypeScript (Strict typing)
- **Styling**: Tailwind CSS & PostCSS
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Custom Gradient Area Charts)
- **Theming**: Dark and Light mode support via CSS variables and Tailwind `dark:` classes

---

## 📁 5. Project Structure

```
edl-care-assistant/
├── .gitignore
├── README.md
├── frontend/
│   └── web/                               # Next.js 14 Web Application
│       ├── public/                        # Static assets & icons
│       ├── src/
│       │   ├── app/
│       │   │   ├── globals.css            # Global CSS, brand color tokens, scrollbars
│       │   │   ├── layout.tsx             # Root layout with AppProvider & Modals
│       │   │   ├── page.tsx               # Main Dashboard page
│       │   │   └── outages/
│       │   │       └── page.tsx           # Outage Map page
│       │   ├── components/
│       │   │   ├── AppContext.tsx         # Unified state (Language, Theme, Account)
│       │   │   ├── Header.tsx             # Header with Lang, Theme & Profile menus
│       │   │   ├── Sidebar.tsx            # Responsive navigation & emergency hotline
│       │   │   ├── ClientLayoutShell.tsx  # Responsive sidebar shell wrapper
│       │   │   └── modals/
│       │   │       ├── PayNowModal.tsx          # Bill payment simulation modal
│       │   │       ├── BillDetailsModal.tsx     # Itemized tariff statement modal
│       │   │       └── ReportBreakdownModal.tsx # Emergency breakdown reporting modal
│       │   ├── features/
│       │   │   ├── chatbot/
│       │   │   │   └── ChatbotDrawer.tsx        # EDL Care AI Chatbot
│       │   │   ├── dashboard/
│       │   │   │   ├── AccountSummaryCard.tsx   # Fictional account summary
│       │   │   │   ├── MonthlyUsageCard.tsx     # Recharts consumption graph
│       │   │   │   ├── PowerOutageCard.tsx      # Outage alert card
│       │   │   │   └── QuickServicesGrid.tsx    # Self-service actions
│       │   │   └── outages/
│       │   │       └── OutageMapViewer.tsx      # Grid monitor & interactive map
│       │   ├── hooks/                     # Custom React hooks
│       │   ├── lib/
│       │   │   └── utils.ts               # Formatting (LKR currency, dates, cn helper)
│       │   ├── types/
│       │   │   └── index.ts               # TypeScript domain interfaces
│       │   └── data/
│       │       ├── mockData.ts            # Fictional demo dataset
│       │       └── translations.ts        # English, Sinhala, Tamil localization dictionary
│       ├── package.json
│       ├── tsconfig.json
│       ├── tailwind.config.ts
│       ├── postcss.config.mjs
│       └── next.config.mjs
├── mobile/                                # (Reserved for React Native & Expo app)
└── backend/                               # (Reserved for FastAPI, Google Gemini & RAG)
```

---

## 💻 6. How to Run the Web Application

### Prerequisites
- **Node.js**: Version 18.17.0 or higher (Tested on Node.js v24.13.1)
- **npm** or package manager of your choice

### Step 1: Navigate to the web frontend directory
```bash
cd frontend/web
```

### Step 2: Install dependencies (if not already installed)
```bash
npm install
```

### Step 3: Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser to view the application.

### Step 4: Build for production
```bash
npm run build
npm start
```

---

## 🗺️ 7. Architecture Roadmap

1. **Phase 1 (Completed)**:
   - Next.js Web Dashboard, Multilingual Engine (EN / SI / TA), Theme Toggle, Account & Bill Modals, Recharts Usage Graph, Outage Map, and Frontend Mock AI Assistant.
2. **Phase 2 (Mobile App)**:
   - React Native & Expo cross-platform mobile client with push notifications and camera bill scanner.
3. **Phase 3 (AI Backend & RAG)**:
   - Python FastAPI microservice integrating **Google Gemini** (`gemini-1.5-pro`) and vector search over Sri Lankan electricity tariff schedules, solar net-metering regulations, and outage incident logs.

---

*Electricity Distribution Lanka (EDL) Demonstration Prototype – Built for technical and management presentations.*
