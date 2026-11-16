/**
 * Shared API Client for EDL Care Assistant Mobile App
 * Connects to FastAPI Backend with Dynamic Network Configuration,
 * Expo Go LAN auto-detection, Android Emulator support, and offline fallback.
 */

import { Platform } from "react-native";
import Constants from "expo-constants";
import { getAuthToken } from "./storage";

/**
 * Resolves the backend API Base URL based on runtime environment:
 * 1. EXPO_PUBLIC_API_URL environment variable (highest priority)
 * 2. Expo Go / dev client hostUri (auto-resolves host machine LAN IP e.g. 10.84.172.104)
 * 3. Android Emulator loopback alias (10.0.2.2:8000)
 * 4. Localhost (127.0.0.1:8000 for iOS Simulator & Web)
 */
export function getResolvedApiBaseUrl(): string {
  // 1. Explicit environment variable
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.endsWith("/api") ? envUrl : `${envUrl.replace(/\/$/, "")}/api`;
  }

  // 2. Auto-detect host IP from Expo Constants (works automatically on physical devices with Expo Go)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any)?.experienceUrl;

  if (hostUri && typeof hostUri === "string") {
    const hostIp = hostUri.split(":")[0];
    if (hostIp && hostIp !== "localhost" && hostIp !== "127.0.0.1") {
      return `http://${hostIp}:8000/api`;
    }
  }

  // 3. Android Emulator loopback alias
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000/api";
  }

  // 4. Default iOS simulator / web
  return "http://127.0.0.1:8000/api";
}

let customBaseUrl: string | null = null;

export function setCustomBaseUrl(url: string | null) {
  customBaseUrl = url;
}

export function getApiBaseUrl(): string {
  if (customBaseUrl) return customBaseUrl;
  return getResolvedApiBaseUrl();
}

/**
 * Common fetch helper with auto token injection and timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Health check
 */
export async function checkBackendHealth() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetchWithTimeout(`${baseUrl}/health`, {}, 3000);
    if (res.ok) {
      const data = await res.json();
      return { ...data, connected_url: baseUrl };
    }
  } catch (err) {
    // Offline / unreachable
  }
  return {
    status: "offline",
    service: "EDL Care Assistant Mobile (Fallback Mode)",
    connected_url: baseUrl,
    hint: "Ensure FastAPI is running: python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000"
  };
}

/**
 * Customer authentication
 */
export async function loginApi(username: string, password: string = "demo123") {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetchWithTimeout(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }, 5000);

    if (res.ok) {
      return await res.json();
    }

    if (res.status === 401 || res.status === 400) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Invalid account number or password");
    }
  } catch (err: any) {
    if (err.message && (err.message.includes("Invalid") || err.message.includes("password"))) {
      throw err;
    }
    // Network offline fallback for demonstration
    console.warn(`[EDL Mobile] Backend at ${baseUrl} unreachable. Using offline fallback.`);
  }

  // Fallback demo account when backend is completely offline
  if (password !== "demo123" && password !== "demo") {
    throw new Error("Invalid account number or password (demo password is 'demo123')");
  }

  return {
    access_token: "edl_demo_token_dasuni_2026",
    account_number: username.startsWith("0") ? username : "0412345678",
    full_name: username === "0723456789"
      ? "Kandy Royal Commercial Arcade"
      : username === "0134567890"
      ? "Lanka Eco Fabric Mills"
      : "Dasuni Thiwanshika Premawardana",
    mode: "customer"
  };
}

/**
 * Customer profile
 */
export async function getCustomerProfileApi(passedToken?: string) {
  const baseUrl = getApiBaseUrl();
  const token = passedToken || (await getAuthToken());

  try {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchWithTimeout(`${baseUrl}/customers/me`, { headers }, 4000);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Offline
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

/**
 * Billing history (12 months)
 */
export async function getBillsApi(passedToken?: string) {
  const baseUrl = getApiBaseUrl();
  const token = passedToken || (await getAuthToken());

  try {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchWithTimeout(`${baseUrl}/customers/me/bills`, { headers }, 4000);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Offline
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
    },
    {
      id: 2,
      billing_month: "September 2026",
      previous_reading: 1080,
      present_reading: 1240,
      units_consumed: 160,
      energy_charge: 4550.00,
      fixed_charge: 1000.00,
      fuel_adjustment: 0.00,
      total_amount: 5550.00,
      due_date: "2026-10-25",
      is_paid: true
    }
  ];
}

/**
 * 12-Month Consumption breakdown
 */
export async function getConsumptionApi(passedToken?: string) {
  const baseUrl = getApiBaseUrl();
  const token = passedToken || (await getAuthToken());

  try {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchWithTimeout(`${baseUrl}/customers/me/consumption`, { headers }, 4000);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Offline
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

/**
 * Simulated bill payment
 */
export async function payBillApi(
  amount: number,
  passedToken?: string,
  paymentMethod: string = "lanka_qr",
  accountNumber?: string
) {
  const baseUrl = getApiBaseUrl();
  const token = passedToken || (await getAuthToken());

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchWithTimeout(`${baseUrl}/customers/me/pay`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        account_number: accountNumber || "0412345678",
        amount,
        payment_method: paymentMethod.toLowerCase().includes("qr") ? "lanka_qr" : "card"
      })
    }, 5000);

    if (res.ok) {
      const data = await res.json();
      return {
        transaction_id: data.transaction_id,
        amount_paid: data.amount_paid,
        new_balance: data.remaining_balance ?? data.new_balance ?? 0.0,
        status: data.status,
        message: data.message
      };
    }
  } catch (err) {
    // Offline
  }

  const txId = `TXN-LQR-${Math.floor(100000 + Math.random() * 900000)}`;
  return {
    message: "Payment processed successfully (Offline Simulation)",
    transaction_id: txId,
    amount_paid: amount,
    new_balance: 0.0,
    status: "CONFIRMED"
  };
}

/**
 * Register a new complaint
 */
export async function createComplaintApi(
  data: {
    category: string;
    description: string;
    contact_phone?: string;
    area?: string;
    priority?: string;
    account_number?: string;
  },
  passedToken?: string
) {
  const baseUrl = getApiBaseUrl();
  const token = passedToken || (await getAuthToken());

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchWithTimeout(`${baseUrl}/complaints`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        account_number: data.account_number || "0412345678",
        category: data.category,
        nature: data.description,
        description: data.description,
        area: data.area || "Colombo 05",
        phone: data.contact_phone || "0771234567"
      })
    }, 5000);

    if (res.ok) {
      const respData = await res.json();
      return {
        id: respData.ticket_id,
        reference_number: respData.ticket_id || respData.reference_number,
        account_number: respData.account_number,
        category: respData.category,
        description: respData.nature || respData.description,
        status: respData.status,
        created_at: respData.logged_date,
        estimated_restoration: respData.estimated_completion,
        assigned_depot: respData.assigned_depot
      };
    }
  } catch (err) {
    // Offline
  }

  const ref = `CMP-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
  return {
    id: ref,
    reference_number: ref,
    account_number: data.contact_phone || "0412345678",
    category: data.category.toUpperCase(),
    description: data.description,
    status: "PENDING",
    priority: data.priority || "HIGH",
    created_at: new Date().toISOString(),
    is_guest: !token
  };
}

/**
 * Retrieve complaints history
 */
export async function getComplaintsApi(passedToken?: string) {
  const baseUrl = getApiBaseUrl();
  const token = passedToken || (await getAuthToken());

  try {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchWithTimeout(`${baseUrl}/complaints`, { headers }, 4000);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((item) => ({
          id: item.ticket_id || item.id,
          reference_number: item.ticket_id || item.reference_number,
          account_number: item.account_number,
          category: item.category,
          description: item.nature || item.description,
          status: item.status,
          created_at: item.logged_date || item.created_at,
          assigned_depot: item.assigned_depot,
          estimated_completion: item.estimated_completion
        }));
      }
      return data;
    }
  } catch (err) {
    // Offline
  }

  return [
    {
      id: 1,
      reference_number: "CMP-041-001",
      account_number: "0412345678",
      category: "BREAKDOWN",
      description: "Low voltage and light flickering noticed after evening rain shower",
      status: "IN_PROGRESS",
      priority: "HIGH",
      created_at: "2026-11-14T10:30:00"
    },
    {
      id: 2,
      reference_number: "CMP-041-002",
      account_number: "0412345678",
      category: "METER",
      description: "Smart meter display backlight dimming",
      status: "RESOLVED",
      priority: "LOW",
      created_at: "2026-10-18T14:15:00"
    }
  ];
}

/**
 * Retrieve grid outages
 */
export async function getOutagesApi() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetchWithTimeout(`${baseUrl}/outages`, {}, 4000);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Offline
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

/**
 * Retrieve solar transformer capacity
 */
export async function getSolarCapacityApi(code: string = "TR-402", accountNumber?: string) {
  const baseUrl = getApiBaseUrl();
  try {
    let url = `${baseUrl}/solar/capacity?transformer_code=${encodeURIComponent(code)}`;
    if (accountNumber) url += `&account_number=${encodeURIComponent(accountNumber)}`;

    const res = await fetchWithTimeout(url, {}, 4000);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Offline
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

/**
 * Retrieve list of solar transformers
 */
export async function getSolarTransformersApi() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetchWithTimeout(`${baseUrl}/solar/transformers`, {}, 4000);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Offline
  }

  return [
    { code: "TR-402", area: "Colombo 05", capacity_kva: 160.0, remaining_kw: 42.0, status: "Capacity Available" },
    { code: "TR-105", area: "Kandy City", capacity_kva: 200.0, remaining_kw: 68.0, status: "Capacity Available" },
    { code: "TR-780", area: "Galle Fort", capacity_kva: 100.0, remaining_kw: 5.0, status: "Threshold Reached" }
  ];
}

/**
 * Send Chatbot message with Option C policy and rich cards
 */
export async function sendChatMessageApi(
  message: string,
  mode: "guest" | "customer" = "guest",
  language: "en" | "si" | "ta" = "en",
  accountNumber?: string,
  sessionId?: string,
  passedToken?: string
) {
  const baseUrl = getApiBaseUrl();
  const token = passedToken || (await getAuthToken());

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetchWithTimeout(`${baseUrl}/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message,
        mode,
        language,
        account_number: accountNumber || "0412345678",
        session_id: sessionId
      })
    }, 12000);

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Offline
  }

  // Graceful mobile offline fallback
  const lower = message.toLowerCase();
  if (mode === "guest" && (lower.includes("bill") || lower.includes("balance") || lower.includes("බිල") || lower.includes("கட்டணம்"))) {
    return {
      reply: "🔒 Customer Login Required: In Guest Mode, individual bill records and balances are protected under EDL Privacy Policies. Please sign in to access your personal account.",
      mode: "guest",
      scope: "public_knowledge",
      language,
      action_required: "login",
      sources: ["EDL Customer Charter (Option C Policy)"]
    };
  }

  return {
    reply: mode === "customer"
      ? `Ayubowan! Connected to verified account #${accountNumber || "0412345678"}. Your October bill is Rs. 4,850.00 for 142 kWh, due on 25 Nov 2026.`
      : "Ayubowan! As EDL Care Assistant in Guest Mode, I can answer queries on tariffs, safety guidelines, and planned maintenance.",
    mode,
    scope: mode === "customer" ? "authenticated_customer" : "public_knowledge",
    language,
    action_required: mode === "customer" ? "pay" : null,
    sources: ["Domestic Tariff Schedule 2026", "EDL Safety Manual"]
  };
}
