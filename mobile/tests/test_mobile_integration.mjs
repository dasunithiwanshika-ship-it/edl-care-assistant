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
      `Cycles retrieved: ${data.length}`
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
      `Tx ID: ${data.transaction_id}, Remaining Balance: Rs. ${remainingBal}`
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

  console.log(`\n------------------------------------------------------`);
  console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log(`------------------------------------------------------\n`);

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
