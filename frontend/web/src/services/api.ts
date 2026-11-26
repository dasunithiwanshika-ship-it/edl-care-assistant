/**
 * Centralized API Client for EDL Care Assistant Web Frontend
 * Communicates with the FastAPI Backend (http://127.0.0.1:8000)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("edl_auth_token");
    }
  }

  public getToken(): string | null {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem("edl_auth_token");
    }
    return this.token;
  }

  public setToken(token: string | null): void {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("edl_auth_token", token);
      } else {
        localStorage.removeItem("edl_auth_token");
      }
    }
  }

  private getHeaders(contentType: boolean = true): HeadersInit {
    const headers: Record<string, string> = {};
    if (contentType) {
      headers["Content-Type"] = "application/json";
    }
    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  // --- Health ---
  public async checkHealth(): Promise<{ status: string; gemini_active: boolean; [key: string]: any }> {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return res.json();
  }

  // --- Authentication ---
  public async login(username: string, password: string): Promise<{
    access_token: string;
    token_type: string;
    username: string;
    full_name: string;
    account_number: string;
    mode: string;
  }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Login failed" }));
      let errorMsg = err.detail;
      if (Array.isArray(err.detail)) {
        errorMsg = err.detail.map((e: any) => e.msg || e.message).join(", ");
      }
      throw new Error(errorMsg || "Invalid credentials");
    }
    const data = await res.json();
    this.setToken(data.access_token);
    return data;
  }

  public async register(payload: {
    full_name: string;
    email: string;
    phone: string;
    password: string;
    username?: string;
  }): Promise<{
    access_token: string;
    token_type: string;
    username: string;
    full_name: string;
    account_number: string;
    mode: string;
  }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Registration failed" }));
      let errorMsg = err.detail;
      if (Array.isArray(err.detail)) {
        errorMsg = err.detail.map((e: any) => e.msg || e.message).join(", ");
      }
      throw new Error(errorMsg || "Registration failed. Please check your details.");
    }
    const data = await res.json();
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  public logout(): void {
    this.setToken(null);
  }

  // --- Customer Profile & Account ---
  public async getMyProfile(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/customers/me`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch profile: ${res.status}`);
    }
    return res.json();
  }

  public async getMyBills(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/api/customers/me/bills`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch bills: ${res.status}`);
    }
    return res.json();
  }

  public async getMyConsumption(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/api/customers/me/consumption`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch consumption: ${res.status}`);
    }
    return res.json();
  }

  public async payBill(amount: number, paymentMethod: string = "card"): Promise<any> {
    const profile = await this.getMyProfile().catch(() => null);
    const accountNumber = profile?.account_number || "0412345678";
    const res = await fetch(`${API_BASE_URL}/api/customers/me/pay`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        account_number: accountNumber,
        amount,
        payment_method: paymentMethod,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Payment failed" }));
      throw new Error(err.detail || "Payment failed");
    }
    return res.json();
  }

  // --- Complaints ---
  public async createComplaint(data: {
    category: string;
    nature: string;
    description?: string;
    area: string;
    phone: string;
    account_number?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/complaints`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Submission failed" }));
      throw new Error(err.detail || "Complaint submission failed");
    }
    return res.json();
  }

  public async getComplaints(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/api/complaints`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load complaints");
    return res.json();
  }

  public async getComplaintByTicket(ticketId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/complaints/${ticketId.trim()}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Complaint #${ticketId} not found`);
    }
    return res.json();
  }

  public async updateComplaintStatus(
    ticketId: string,
    status: string,
    description?: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/complaints/${ticketId.trim()}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ status, description }),
    });
    if (!res.ok) {
      throw new Error(`Failed to update complaint #${ticketId}`);
    }
    return res.json();
  }

  // --- Outages ---
  public async getOutages(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/api/outages`);
    if (!res.ok) throw new Error("Failed to load outages");
    return res.json();
  }

  // --- Solar Capacity ---
  public async getSolarCapacity(transformerCode: string): Promise<any> {
    const res = await fetch(
      `${API_BASE_URL}/api/solar/capacity?transformer_code=${encodeURIComponent(transformerCode)}`
    );
    if (!res.ok) {
      throw new Error(`Transformer '${transformerCode}' not found`);
    }
    return res.json();
  }

  public async getSolarTransformers(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/api/solar/transformers`);
    if (!res.ok) throw new Error("Failed to load solar transformers");
    return res.json();
  }

  // --- Chatbot ---
  public async sendChat(payload: {
    message: string;
    mode: "guest" | "customer";
    language: "en" | "si" | "ta";
    account_number?: string;
    session_id?: string;
  }): Promise<{
    reply: string;
    mode: string;
    scope: string;
    language: string;
    is_mock: boolean;
    action_required?: string;
    sources?: string[];
    account_ref?: string;
    rich_card?: any;
    session_id?: string;
  }> {
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Chat request failed" }));
      throw new Error(err.detail || `Server error (${res.status})`);
    }
    return res.json();
  }
}

export const api = new ApiClient();
export default api;
