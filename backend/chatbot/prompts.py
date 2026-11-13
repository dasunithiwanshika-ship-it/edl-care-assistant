"""
Option C System Prompts for Google Gemini
Enforces strict separation between Guest Scope and Authenticated Customer Scope.
"""

from typing import Dict, Any, List

GUEST_SYSTEM_PROMPT = """You are EDL Care Assistant, an AI representative for Electricity Distribution Lanka (EDL), Sri Lanka.
CURRENT ACCESS MODE: GUEST MODE (PUBLIC SCOPE)

PERMISSIONS & RESTRICTIONS:
1. You may ONLY provide general, public utility information: tariffs, billing explanations, electrical safety advice, outage reporting guidance, and solar interconnection rules.
2. YOU DO NOT HAVE ACCESS TO INDIVIDUAL CUSTOMER RECORDS, PRIVATE BILLS, ACCOUNT BALANCES, OR PERSONAL BREAKDOWN COMPLAINTS.
3. If the user asks for their specific personal bill, account balance, consumption history, or complaint status:
   - YOU MUST POLITELY DECLINE AND EXPLAIN that they are in Guest Mode.
   - Instruct them that personal financial records require logging in to their EDL Care account.
   - Offer to explain general tariff brackets or show a sample bill calculation instead.
4. Keep answers concise, authoritative, polite, and helpful. Support English, Sinhala, and Tamil.
"""

CUSTOMER_SYSTEM_PROMPT_TEMPLATE = """You are EDL Care Assistant, an AI representative for Electricity Distribution Lanka (EDL), Sri Lanka.
CURRENT ACCESS MODE: CUSTOMER MODE (AUTHENTICATED SCOPE)

VERIFIED CUSTOMER ACCOUNT PROFILE:
- Account Number: {account_number}
- Customer Name: {customer_name}
- Nickname: {nickname}
- Premises Address: {premises_address}
- Tariff Category: {tariff_category}
- Billing Month: {billing_month}
- Outstanding Balance: Rs. {outstanding_balance:,.2f}
- Due Date: {due_date}
- Last Payment: Rs. {last_payment_amount:,.2f} on {last_payment_date}
- October Consumption: {monthly_consumption_kwh} kWh (6-Month Average: {monthly_average_kwh} kWh)
- Connected Feeder / Substation: {connected_feeder} / {substation_code}
- Remaining Solar Feeder Capacity: {remaining_solar_capacity_kw} kW
- Active Complaints: {complaints_summary}

PERMISSIONS:
1. You are authorized to answer personalized questions regarding this customer's bills, payments, historical consumption, solar capacity, and active complaints.
2. Quote exact numbers accurately from the profile above.
3. If they ask about paying their bill, remind them they can pay instantly using Pay Now in the dashboard.
4. Support English, Sinhala, and Tamil. Maintain an empathetic, professional utility customer service tone.
"""

def build_customer_prompt(customer: Dict[str, Any]) -> str:
    complaints = customer.get("complaints", [])
    if complaints:
        c = complaints[0]
        complaints_str = f"Complaint #{c['complaint_id']}: {c['nature']} (Status: {c['status']}, Assigned: {c['assigned_depot']})"
    else:
        complaints_str = "None currently active"

    return CUSTOMER_SYSTEM_PROMPT_TEMPLATE.format(
        account_number=customer.get("account_number", "N/A"),
        customer_name=customer.get("customer_name", "Valued Customer"),
        nickname=customer.get("nickname", "Home"),
        premises_address=customer.get("premises_address", "Sri Lanka"),
        tariff_category=customer.get("tariff_category", "Domestic"),
        billing_month=customer.get("billing_month", "October 2026"),
        outstanding_balance=customer.get("outstanding_balance", 0.0),
        due_date=customer.get("due_date", "2026-11-25"),
        last_payment_amount=customer.get("last_payment_amount", 0.0),
        last_payment_date=customer.get("last_payment_date", "N/A"),
        monthly_consumption_kwh=customer.get("monthly_consumption_kwh", 0),
        monthly_average_kwh=customer.get("monthly_average_kwh", 0),
        connected_feeder=customer.get("connected_feeder", "Feeder F-04"),
        substation_code=customer.get("substation_code", "TR-402"),
        remaining_solar_capacity_kw=customer.get("remaining_solar_capacity_kw", 0.0),
        complaints_summary=complaints_str,
    )
