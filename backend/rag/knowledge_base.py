"""
RAG Electricity Knowledge Base for Electricity Distribution Lanka (EDL)
Domain knowledge covers tariffs, safety, outages, billing, and solar connections.
"""

from typing import List, Dict, Any

KNOWLEDGE_DOCUMENTS = [
    {
        "id": "tariff-domestic-2026",
        "category": "tariffs",
        "title": "Domestic Electricity Tariff Schedule (Block Structure)",
        "content": (
            "Sri Lanka domestic electricity tariffs are structured into cumulative monthly blocks: "
            "Block 1 (0–30 units): Rs. 8.00 per unit + Rs. 150 fixed charge. "
            "Block 2 (31–60 units): Rs. 15.00 per unit + Rs. 300 fixed charge. "
            "Block 3 (61–90 units): Rs. 25.00 per unit + Rs. 400 fixed charge. "
            "Block 4 (91–120 units): Rs. 35.00 per unit + Rs. 1,000 fixed charge. "
            "Block 5 (>120 units): Rs. 50.00 per unit + Rs. 1,500 fixed charge. "
            "Maintaining consumption under 60 units grants government lifeline subsidies."
        ),
        "keywords": ["tariff", "units", "rate", "cost", "bill calculation", "domestic", "blocks", "ගාස්තු", "கட்டணம்"]
    },
    {
        "id": "billing-structure",
        "category": "billing",
        "title": "Understanding Your Electricity Bill Breakdown",
        "content": (
            "An EDL electricity bill consists of three core components: "
            "(1) Energy Charge: Calculated by multiplying consumed units (kWh) by the applicable tariff tier. "
            "(2) Fixed Charge: Monthly utility grid connection fee based on total consumption tier. "
            "(3) Fuel Adjustment Surcharge (FAS): Periodic fuel cost recovery adjustment determined by statutory authorities. "
            "Previous unpaid arrears are added to determine the final Outstanding Balance."
        ),
        "keywords": ["understand", "breakdown", "charges", "energy charge", "fixed charge", "arrears", "තේරුම්", "விளக்கம்"]
    },
    {
        "id": "safety-guidelines",
        "category": "safety",
        "title": "Essential Domestic Electrical Safety Standards",
        "content": (
            "Key electrical safety protocols: "
            "(1) Test your Earth Leakage Circuit Breaker (ELCB / Trip Switch) monthly by pressing the 'T' test button. "
            "(2) Never touch switches, plugs, or cords with wet hands. "
            "(3) Maintain at least 3 meters clearance from overhead service wires and report encroaching tree branches. "
            "(4) Never approach broken or fallen power cables on the ground; keep a minimum 10-meter perimeter and call 1987 immediately."
        ),
        "keywords": ["safety", "precaution", "hazard", "shock", "trip switch", "elcb", "emergency", "ආරක්ෂ", "பாதுகாப்பு"]
    },
    {
        "id": "outage-procedures",
        "category": "outages",
        "title": "Planned Outages and Emergency Breakdown Procedures",
        "content": (
            "EDL schedules planned power interruptions for overhead line maintenance, pole replacement, and vegetation pruning. "
            "Notices are published 48 hours prior to interruption. "
            "For unscheduled breakdowns (such as lightning, tree falls, or transformer faults), technical dispatch crews operate 24/7. "
            "Customers can report faults through the mobile app, web dashboard, or toll-free hotline 1987."
        ),
        "keywords": ["outage", "interruption", "breakdown", "power cut", "planned", "repair", "1987", "ඇනහිට", "மின்தடை"]
    },
    {
        "id": "solar-net-metering",
        "category": "solar",
        "title": "Rooftop Solar PV Grid Interconnection and Capacity",
        "content": (
            "EDL offers three solar rooftop integration schemes: Net-Metering, Net-Accounting, and Net-Plus. "
            "Before applying, the local distribution transformer must have available hosting capacity (typically up to 80% of rated kVA). "
            "Customers can check real-time transformer availability using the Instant Grid Scan or Solar Feasibility tool."
        ),
        "keywords": ["solar", "rooftop", "capacity", "transformer", "net-metering", "net-plus", "photovoltaic", "සූර්ය", "சூரிய"]
    }
]

def retrieve_knowledge(query: str, top_k: int = 2) -> List[Dict[str, Any]]:
    """Simple keyword-ranked RAG vector/document retrieval"""
    query_lower = query.lower()
    scored = []
    for doc in KNOWLEDGE_DOCUMENTS:
        score = 0
        for kw in doc["keywords"]:
            if kw.lower() in query_lower:
                score += 2
        for word in doc["title"].lower().split():
            if word in query_lower:
                score += 1
        if score > 0:
            scored.append((score, doc))
    
    scored.sort(key=lambda x: x[0], reverse=True)
    results = [item[1] for item in scored[:top_k]]
    if not results:
        results = [KNOWLEDGE_DOCUMENTS[0]]  # Default general tariff info
    return results
