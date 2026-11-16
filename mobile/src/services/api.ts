/**
 * Shared API Client for EDL Care Assistant Mobile App
 * Connects to FastAPI Backend with Automatic Offline Fallback.
 */

// Use local machine IP or 10.0.2.2 for Android emulator; defaults to localhost
export const API_BASE_URL = "http://localhost:8000/api";

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (res.ok) return await res.json();
  } catch {
    // Offline
  }
  return { status: "offline", service: "EDL Care Assistant Mobile (Fallback Mode)" };
}

export async function loginApi(username: string, password: string = "demo123") {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback demo account
  }
  return {
    access_token: "edl_demo_token_dasuni_2026",
    account_number: username.startsWith("0") ? username : "0412345678",
    full_name: "Dasuni Thiwanshika Premawardana",
    mode: "customer"
  };
}

export async function getCustomerProfileApi(token?: string) {
  try {
    const headers: any = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/customers/me`, { headers });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return {
    account_number: "0412345678",
    full_name: "Dasuni Thiwanshika Premawardana",
    premises_address: "No. 42, Sri Jayawardenepura Mawatha, Colombo 05",
    tariff_category: "Domestic (D-1)",
    connected_feeder: "Feeder F-04 Havelock",
    substation_code: "TR-402 (Nugegoda)",
    outstanding_balance: 4850.00,
    due_date: "2026-11-25",
    monthly_consumption_kwh: 142,
    monthly_average_kwh: 154,
    is_solar: false,
    solar_capacity_kw: 0.0
  };
}

export async function getBillsApi(token?: string) {
  try {
    const headers: any = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/customers/me/bills`, { headers });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return [
    {
      id: 1,
      billing_month: "October 2026",
      previous_reading: 1240,
      present_reading: 1382,
      units_consumed: 142,
      energy_charge: 3850.00,
      fixed_charge: 1000.00,
      fuel_adjustment: 0.00,
      total_amount: 4850.00,
      due_date: "2026-11-25",
      is_paid: false
    }
  ];
}

export async function getConsumptionApi(token?: string) {
  try {
    const headers: any = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/customers/me/consumption`, { headers });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return [
    { month: "May", year: 2026, units_kwh: 158, amount_lkr: 5420.00 },
    { month: "Jun", year: 2026, units_kwh: 162, amount_lkr: 5610.00 },
    { month: "Jul", year: 2026, units_kwh: 148, amount_lkr: 5100.00 },
    { month: "Aug", year: 2026, units_kwh: 155, amount_lkr: 5340.00 },
    { month: "Sep", year: 2026, units_kwh: 160, amount_lkr: 5550.00 },
    { month: "Oct", year: 2026, units_kwh: 142, amount_lkr: 4850.00 },
  ];
}

export async function getOutagesApi() {
  try {
    const res = await fetch(`${API_BASE_URL}/outages`);
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return [
    {
      id: 1,
      outage_code: "OUT-2026-1089",
      area: "Havelock Town, Colombo 05",
      district: "Colombo",
      feeder_name: "Feeder F-04 Havelock",
      outage_type: "breakdown",
      affected_customers: 480,
      start_time: "Today, 10:15 AM",
      estimated_restoration: "Today, 04:30 PM",
      status: "In Progress",
      latitude: 6.8770,
      longitude: 79.8710,
      reason: "Fallen tree branch on 11kV conductor near Havelock Road"
    },
    {
      id: 2,
      outage_code: "OUT-2026-1090",
      area: "Peradeniya Road, Kandy",
      district: "Kandy",
      feeder_name: "Feeder K-02 Peradeniya",
      outage_type: "planned",
      affected_customers: 850,
      start_time: "Today, 09:00 AM",
      estimated_restoration: "Today, 02:00 PM",
      status: "Scheduled",
      latitude: 7.2710,
      longitude: 80.6010,
      reason: "Routine feeder reconductoring and insulator replacement"
    }
  ];
}

export async function getSolarCapacityApi(code: string = "TR-402") {
  try {
    const res = await fetch(`${API_BASE_URL}/solar/capacity?transformer_code=${code}`);
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return {
    transformer_code: code.toUpperCase(),
    area: "Nugegoda / Havelock",
    district: "Colombo",
    feeder_name: "Feeder F-04 Havelock",
    total_capacity_kva: 160.0,
    used_capacity_kva: 88.0,
    remaining_capacity_kw: 42.0,
    max_threshold_pct: 80.0,
    status: "Capacity Available",
    is_available: true
  };
}

export async function sendChatMessageApi(
  message: string,
  mode: "guest" | "customer" = "guest",
  language: "en" | "si" | "ta" = "en",
  accountNumber?: string,
  sessionId?: string
) {
  try {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        mode,
        language,
        account_number: accountNumber || "0412345678",
        session_id: sessionId
      })
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }

  // Graceful mobile offline fallback
  const lower = message.toLowerCase();
  if (mode === "guest" && (lower.includes("bill") || lower.includes("balance") || lower.includes("බිල"))) {
    return {
      reply: "🔒 Customer Login Required: In Guest Mode, individual bill records and balances are protected. Please sign in to your EDL Care account.",
      mode: "guest",
      scope: "public_knowledge",
      language,
      action_required: "login",
      sources: ["EDL Customer Charter"]
    };
  }

  return {
    reply: mode === "customer"
      ? `Your demo account (#${accountNumber || "0412345678"}) has an outstanding balance of Rs. 4,850.00 for October 2026. Payment is due on 25 Nov 2026.`
      : "Ayubowan! As EDL Care Assistant in Guest Mode, I can answer queries on tariffs, safety rules, and outage reporting.",
    mode,
    scope: mode === "customer" ? "authenticated_customer" : "public_knowledge",
    language,
    action_required: mode === "customer" ? "pay" : null,
    sources: ["Domestic Tariff Schedule 2026"]
  };
}
