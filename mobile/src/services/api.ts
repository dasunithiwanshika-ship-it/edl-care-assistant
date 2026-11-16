/**
 * Shared API Client for EDL Care Assistant Mobile App
 * Connects to FastAPI Backend with Dynamic Network Configuration:
 * - Expo Go LAN auto-detection for physical devices
 * - Android Emulator loopback alias (10.0.2.2)
 * - iOS Simulator & Web loopback (127.0.0.1)
 * Strict Error Handling: Does NOT mask backend failures with fictional responses.
 */

import { Platform } from "react-native";
import Constants from "expo-constants";
import { getAuthToken, removeAuthToken } from "./storage";

type SessionExpiredHandler = () => void;
let sessionExpiredHandler: SessionExpiredHandler | null = null;

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null) {
  sessionExpiredHandler = handler;
}

export function handleSessionExpired() {
  removeAuthToken();
  if (sessionExpiredHandler) {
    sessionExpiredHandler();
  }
}

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
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs / 1000}s`);
    }
    throw new Error(`Network request failed: ${err.message || "Connection refused"}`);
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
    throw new Error(`Health check returned HTTP ${res.status}`);
  } catch (err: any) {
    return {
      status: "unreachable",
      error: err.message,
      connected_url: baseUrl,
      hint: "Ensure FastAPI is running: python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000"
    };
  }
}

/**
 * Customer authentication
 */
export async function loginApi(username: string, password: string = "demo123") {
  const baseUrl = getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  }, 5000);

  if (res.ok) {
    return await res.json();
  }

  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.detail || "Invalid account number or password");
}

/**
 * Customer profile
 */
export async function getCustomerProfileApi(passedToken?: string) {
  const baseUrl = getApiBaseUrl();
  const token = passedToken || (await getAuthToken());

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetchWithTimeout(`${baseUrl}/customers/me`, { headers }, 5000);
  if (res.ok) {
    return await res.json();
  }

  if (res.status === 401 && token) {
    handleSessionExpired();
  }

  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.detail || `Failed to fetch customer profile (HTTP ${res.status})`);
}

/**
 * Billing history (12 months)
 */
export async function getBillsApi(passedToken?: string) {
  const baseUrl = getApiBaseUrl();
  const token = passedToken || (await getAuthToken());

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetchWithTimeout(`${baseUrl}/customers/me/bills`, { headers }, 5000);
  if (res.ok) {
    return await res.json();
  }

  if (res.status === 401 && token) {
    handleSessionExpired();
  }

  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.detail || `Failed to fetch billing history (HTTP ${res.status})`);
}

/**
 * 12-Month Consumption breakdown
 */
export async function getConsumptionApi(passedToken?: string) {
  const baseUrl = getApiBaseUrl();
  const token = passedToken || (await getAuthToken());

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetchWithTimeout(`${baseUrl}/customers/me/consumption`, { headers }, 5000);
  if (res.ok) {
    return await res.json();
  }

  if (res.status === 401 && token) {
    handleSessionExpired();
  }

  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.detail || `Failed to fetch consumption breakdown (HTTP ${res.status})`);
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
  }, 6000);

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

  if (res.status === 401 && token) {
    handleSessionExpired();
  }

  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.detail || `Payment processing failed (HTTP ${res.status})`);
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
  }, 6000);

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

  if (res.status === 401 && token) {
    handleSessionExpired();
  }

  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.detail || `Complaint registration failed (HTTP ${res.status})`);
}

/**
 * Retrieve complaints history
 */
export async function getComplaintsApi(passedToken?: string) {
  const baseUrl = getApiBaseUrl();
  const token = passedToken || (await getAuthToken());

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetchWithTimeout(`${baseUrl}/complaints`, { headers }, 5000);
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

  if (res.status === 401 && token) {
    handleSessionExpired();
  }

  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.detail || `Failed to retrieve complaints (HTTP ${res.status})`);
}

/**
 * Retrieve grid outages
 */
export async function getOutagesApi() {
  const baseUrl = getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/outages`, {}, 5000);
  if (res.ok) {
    return await res.json();
  }
  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.detail || `Failed to fetch outages (HTTP ${res.status})`);
}

/**
 * Retrieve solar transformer capacity
 */
export async function getSolarCapacityApi(code: string = "TR-402", accountNumber?: string) {
  const baseUrl = getApiBaseUrl();
  let url = `${baseUrl}/solar/capacity?transformer_code=${encodeURIComponent(code)}`;
  if (accountNumber) url += `&account_number=${encodeURIComponent(accountNumber)}`;

  const res = await fetchWithTimeout(url, {}, 5000);
  if (res.ok) {
    return await res.json();
  }
  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.detail || `Failed to check solar capacity (HTTP ${res.status})`);
}

/**
 * Retrieve list of solar transformers
 */
export async function getSolarTransformersApi() {
  const baseUrl = getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/solar/transformers`, {}, 5000);
  if (res.ok) {
    return await res.json();
  }
  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.detail || `Failed to load solar transformers (HTTP ${res.status})`);
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

  if (res.status === 401 && token) {
    handleSessionExpired();
  }

  const errData = await res.json().catch(() => ({}));
  throw new Error(errData.detail || `Chat service error (HTTP ${res.status})`);
}
