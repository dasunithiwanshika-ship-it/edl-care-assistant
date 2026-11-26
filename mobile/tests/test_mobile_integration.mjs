/**
 * Automated Verification Test Suite for EDL Care Assistant Mobile Integration
 * Tests all 12 live API capabilities against the live FastAPI Backend.
 */

const BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000/api";

console.log(`\n======================================================`);
console.log(`⚡ EDL CARE ASSISTANT – MOBILE INTEGRATION TEST SUITE`);
console.log(`Connecting to: ${BASE_URL}`);
console.log(`======================================================\n`);

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName} ${details ? `(${details})` : ""}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ""}`);
  }
}

async function runTests() {
  let authToken = null;
  let testComplaintRef = null;

  // 1. Health Check
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    assert(res.ok && data.status === "healthy", "1. Backend Health Check", `Status: ${data.status}, Service: ${data.service}`);
  } catch (err) {
    assert(false, "1. Backend Health Check", err.message);
  }

  // 2. Customer Login (Valid Credentials)
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "0412345678", password: "demo123" })
    });
    const data = await res.json();
    authToken = data.access_token;
    assert(res.ok && authToken && data.account_number === "0412345678", "2. Customer Login (Valid Credentials)", `Token: ${authToken ? authToken.substring(0, 20) + "..." : "none"}`);
  } catch (err) {
    assert(false, "2. Customer Login (Valid Credentials)", err.message);
  }

  // 3. Invalid Login (Security Check)
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "0412345678", password: "wrongpassword123" })
    });
    assert(res.status === 401, "3. Invalid Login Rejection", `HTTP Status: ${res.status} (Expected 401)`);
  } catch (err) {
    assert(false, "3. Invalid Login Rejection", err.message);
  }

  // 4. Authenticated Profile Retrieval
  try {
    const res = await fetch(`${BASE_URL}/customers/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const data = await res.json();
    assert(
      res.ok && data.account_number === "0412345678" && data.tariff_category,
      "4. Customer Profile Retrieval",
      `Customer: ${data.full_name}, Tariff: ${data.tariff_category}`
    );
  } catch (err) {
    assert(false, "4. Customer Profile Retrieval", err.message);
  }

  // 5. Chatbot Option C Guest Mode Restriction
  try {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "What is my current electricity bill amount?",
        mode: "guest",
        language: "en"
      })
    });
    const data = await res.json();
    assert(
      res.ok && data.action_required === "login",
      "5. Chatbot Guest Mode Privacy Restriction (Option C)",
      `action_required: ${data.action_required}`
    );
  } catch (err) {
    assert(false, "5. Chatbot Guest Mode Privacy Restriction (Option C)", err.message);
  }

  // 6. Chatbot Customer Mode (English Personal Inquiry)
  try {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        message: "What is my current electricity bill amount?",
        mode: "customer",
        language: "en",
        account_number: "0412345678"
      })
    });
    const data = await res.json();
    assert(
      res.ok && data.mode === "customer" && (data.reply.includes("4,850") || data.reply.includes("bill") || data.rich_card),
      "6. Chatbot Customer Mode (Personalized Response)",
      `Rich Card: ${data.rich_card ? data.rich_card.type : "none"}`
    );
  } catch (err) {
    assert(false, "6. Chatbot Customer Mode (Personalized Response)", err.message);
  }

  // 7. Chatbot Multilingual (Sinhala & Tamil)
  try {
    const resSi = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "ගෘහස්ථ විදුලි ගාස්තු ගණනය කරන්නේ කෙසේද?",
        mode: "guest",
        language: "si"
      })
    });
    const dataSi = await resSi.json();

    const resTa = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "மின்னழுத்த பிரச்சனை எவ்வாறு புகாரளிப்பது?",
        mode: "guest",
        language: "ta"
      })
    });
    const dataTa = await resTa.json();

    assert(
      resSi.ok && resTa.ok && dataSi.reply.length > 10 && dataTa.reply.length > 10,
      "7. Chatbot Multilingual Support (Sinhala & Tamil)",
      `SI response len: ${dataSi.reply.length}, TA response len: ${dataTa.reply.length}`
    );
  } catch (err) {
    assert(false, "7. Chatbot Multilingual Support (Sinhala & Tamil)", err.message);
  }

  // 8. Billing History Retrieval
  try {
    const res = await fetch(`${BASE_URL}/customers/me/bills`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const data = await res.json();
    assert(
      res.ok && Array.isArray(data) && data.length > 0,
      "8. Billing History Retrieval",
      res.ok ? `Cycles retrieved: ${data.length}` : `HTTP ${res.status}: ${JSON.stringify(data)}`
    );
  } catch (err) {
    assert(false, "8. Billing History Retrieval", err.message);
  }

  // 9. 12-Month Consumption Retrieval
  try {
    const res = await fetch(`${BASE_URL}/customers/me/consumption`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const data = await res.json();
    assert(
      res.ok && Array.isArray(data) && data.length > 0,
      "9. Consumption Breakdown Retrieval",
      `Months retrieved: ${data.length}`
    );
  } catch (err) {
    assert(false, "9. Consumption Breakdown Retrieval", err.message);
  }

  // 10. Mock Payment Simulation
  try {
    const res = await fetch(`${BASE_URL}/customers/me/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        account_number: "0412345678",
        amount: 500.0,
        payment_method: "lanka_qr"
      })
    });
    const data = await res.json();
    const remainingBal = data.remaining_balance ?? data.new_balance;
    assert(
      res.ok && data.transaction_id && typeof remainingBal === "number",
      "10. Bill Payment Processing",
      res.ok ? `Tx ID: ${data.transaction_id}, Remaining Balance: Rs. ${remainingBal}` : `HTTP ${res.status}: ${JSON.stringify(data)}`
    );
  } catch (err) {
    assert(false, "10. Bill Payment Processing", err.message);
  }

  // 11. Complaint Submission
  try {
    const res = await fetch(`${BASE_URL}/complaints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        account_number: "0412345678",
        category: "BREAKDOWN",
        nature: "Mobile live integration test breakdown incident",
        description: "Mobile live integration test breakdown incident",
        area: "Colombo 05",
        phone: "0771234567"
      })
    });
    const data = await res.json();
    testComplaintRef = data.ticket_id || data.reference_number;
    assert(
      res.ok && testComplaintRef && (data.status === "PENDING" || data.status === "IN_PROGRESS"),
      "11. Complaint Submission & Ticket Generation",
      `Ref: ${testComplaintRef}, Status: ${data.status}`
    );
  } catch (err) {
    assert(false, "11. Complaint Submission & Ticket Generation", err.message);
  }

  // 12. Complaint Tracking & History
  try {
    const res = await fetch(`${BASE_URL}/complaints`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const data = await res.json();
    const found = Array.isArray(data) && data.some((c) => c.ticket_id === testComplaintRef || c.reference_number === testComplaintRef);
    assert(
      res.ok && found,
      "12. Complaint Tracking in Customer History",
      `Found ticket ${testComplaintRef} in list of ${data.length} complaints`
    );
  } catch (err) {
    assert(false, "12. Complaint Tracking in Customer History", err.message);
  }

  // 13. Grid Outages Retrieval
  try {
    const res = await fetch(`${BASE_URL}/outages`);
    const data = await res.json();
    assert(
      res.ok && Array.isArray(data) && data.length > 0 && typeof data[0].latitude === "number",
      "13. Grid Outages Retrieval with Coordinates",
      `Outages count: ${data.length}, First: ${data[0].area} (${data[0].latitude}, ${data[0].longitude})`
    );
  } catch (err) {
    assert(false, "13. Grid Outages Retrieval with Coordinates", err.message);
  }

  // 14. Solar Rooftop Capacity Check
  try {
    const res = await fetch(`${BASE_URL}/solar/capacity?transformer_code=TR-402`);
    const data = await res.json();
    assert(
      res.ok && data.transformer_code === "TR-402" && typeof data.remaining_capacity_kw === "number",
      "14. Solar Rooftop Transformer Capacity Lookup",
      `Transformer: ${data.transformer_code}, Remaining: ${data.remaining_capacity_kw} kW`
    );
  } catch (err) {
    assert(false, "14. Solar Rooftop Transformer Capacity Lookup", err.message);
  }

  // 15. Solar Transformers Catalog
  try {
    const res = await fetch(`${BASE_URL}/solar/transformers`);
    const data = await res.json();
    assert(
      res.ok && Array.isArray(data) && data.length > 0,
      "15. Solar Distribution Transformers Catalog",
      `Transformers count: ${data.length}`
    );
  } catch (err) {
    assert(false, "15. Solar Distribution Transformers Catalog", err.message);
  }

  // 16. Chatbot Guest Public Inquiry (Energy Saving & Solar)
  try {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "How can I save electricity to lower my monthly bills?",
        mode: "guest",
        language: "en"
      })
    });
    const data = await res.json();
    assert(
      res.ok && data.mode === "guest" && !data.action_required && data.reply.length > 20,
      "16. Chatbot Guest Public Inquiry (Energy Saving)",
      `Action: ${data.action_required || "none (direct answer)"}, Sources: ${data.sources ? data.sources.length : 0}`
    );
  } catch (err) {
    assert(false, "16. Chatbot Guest Public Inquiry (Energy Saving)", err.message);
  }

  // 17. Chatbot Guest Personal Consumption Query Gated to Login
  try {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "What is my consumption history for the past 6 months?",
        mode: "guest",
        language: "en"
      })
    });
    const data = await res.json();
    assert(
      res.ok && data.action_required === "login",
      "17. Chatbot Guest Personal Consumption History Gate",
      `action_required: ${data.action_required}`
    );
  } catch (err) {
    assert(false, "17. Chatbot Guest Personal Consumption History Gate", err.message);
  }

  // 18. Chatbot Unauthenticated Mode Forgery Protection
  try {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Check my outstanding balance",
        mode: "customer",
        language: "en"
      })
    });
    const data = await res.json();
    assert(
      res.ok && data.mode === "guest" && data.action_required === "login" && !data.rich_card,
      "18. Chatbot Unauthenticated Mode Forgery Protection",
      `Resolved mode: ${data.mode}, action_required: ${data.action_required}`
    );
  } catch (err) {
    assert(false, "18. Chatbot Unauthenticated Mode Forgery Protection", err.message);
  }

  // ====================================================
  // MOBILE AUTHENTICATION & REGISTRATION TEST SUITE
  // ====================================================
  const mobileTestEmail = `mobile_user_${Date.now()}@edl.lk`;
  let registeredMobileToken = null;
  let registeredMobileAccount = null;

  // 19. New Mobile Account Registration
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: "Sanduni Jayawardena",
        email: mobileTestEmail,
        phone: "0773456789",
        password: "MobileSecurePass123"
      })
    });
    const data = await res.json();
    registeredMobileToken = data.access_token;
    registeredMobileAccount = data.account_number;
    assert(
      res.ok && data.access_token && data.account_number && data.account_number.startsWith("04"),
      "19. New Mobile Account Registration",
      `Account: #${data.account_number}, Name: ${data.full_name}`
    );
  } catch (err) {
    assert(false, "19. New Mobile Account Registration", err.message);
  }

  // 20. Mobile Registration Duplicate Email Handling
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: "Sanduni Duplicate",
        email: mobileTestEmail,
        phone: "0770000000",
        password: "AnotherPassword123"
      })
    });
    const data = await res.json();
    assert(
      res.status === 400 && String(data.detail).toLowerCase().includes("already exists"),
      "20. Duplicate Email Registration Rejection",
      `HTTP Status: ${res.status}, Detail: "${data.detail}"`
    );
  } catch (err) {
    assert(false, "20. Duplicate Email Registration Rejection", err.message);
  }

  // 21. Mobile Login with Newly Registered Email
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: mobileTestEmail,
        password: "MobileSecurePass123"
      })
    });
    const data = await res.json();
    assert(
      res.ok && data.access_token && data.full_name === "Sanduni Jayawardena",
      "21. Login with Newly Registered Account (Email & Password)",
      `Logged in as: ${data.full_name}, Account: #${data.account_number}`
    );
  } catch (err) {
    assert(false, "21. Login with Newly Registered Account (Email & Password)", err.message);
  }

  // 22. Mobile Login with Invalid Credentials
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: mobileTestEmail,
        password: "WrongPassword999"
      })
    });
    assert(
      res.status === 401,
      "22. Mobile Login Invalid Credentials Rejection",
      `HTTP Status: ${res.status} (Expected 401 Unauthorized)`
    );
  } catch (err) {
    assert(false, "22. Mobile Login Invalid Credentials Rejection", err.message);
  }

  // 23. Registered Customer Protected Data Access
  try {
    const res = await fetch(`${BASE_URL}/customers/me`, {
      headers: { Authorization: `Bearer ${registeredMobileToken}` }
    });
    const data = await res.json();
    assert(
      res.ok && data.account_number === registeredMobileAccount && data.email === mobileTestEmail,
      "23. Registered Customer Protected Profile Access",
      `Premises: ${data.premises_address}, Tariff: ${data.tariff_category}`
    );
  } catch (err) {
    assert(false, "23. Registered Customer Protected Profile Access", err.message);
  }

  // 24. Registered Customer Starter Bills & Usage Access
  try {
    const billsRes = await fetch(`${BASE_URL}/customers/me/bills`, {
      headers: { Authorization: `Bearer ${registeredMobileToken}` }
    });
    const billsData = await billsRes.json();
    const consRes = await fetch(`${BASE_URL}/customers/me/consumption`, {
      headers: { Authorization: `Bearer ${registeredMobileToken}` }
    });
    const consData = await consRes.json();
    assert(
      billsRes.ok && Array.isArray(billsData) && billsData.length >= 1 &&
      consRes.ok && Array.isArray(consData) && consData.length === 6,
      "24. Customer Personalized Billing & Consumption Data Isolation",
      `Bills: ${billsData.length}, Consumption Records: ${consData.length}`
    );
  } catch (err) {
    assert(false, "24. Customer Personalized Billing & Consumption Data Isolation", err.message);
  }

  // 25. Session Logout & Token Revocation
  try {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${registeredMobileToken}` }
    });
    const data = await res.json();
    assert(
      res.ok && data.status === "SUCCESS",
      "25. Session Logout & Token Revocation",
      `Revoked: ${data.revoked}, Message: "${data.message}"`
    );
  } catch (err) {
    assert(false, "25. Session Logout & Token Revocation", err.message);
  }

  console.log(`\n------------------------------------------------------`);
  console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log(`------------------------------------------------------\n`);

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
