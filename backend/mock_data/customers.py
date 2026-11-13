"""
Fictional Customer Data Store for EDL Care Assistant Demonstration
"""

from typing import Dict, Any, Optional

FICTIONAL_CUSTOMERS: Dict[str, Dict[str, Any]] = {
    "0412345678": {
        "account_number": "0412345678",
        "customer_name": "Dasuni Thiwanshika Premawardana",
        "nickname": "Home",
        "premises_address": "No. 42, Sri Jayawardenepura Mawatha, Colombo 05",
        "tariff_category": "Domestic (D-1)",
        "billing_month": "October 2026",
        "outstanding_balance": 4850.00,
        "due_date": "2026-11-25",
        "last_payment_date": "2026-10-15",
        "last_payment_amount": 5200.00,
        "monthly_consumption_kwh": 142,
        "monthly_average_kwh": 154,
        "connected_feeder": "Feeder F-04 Havelock",
        "substation_code": "TR-402 (Nugegoda)",
        "remaining_solar_capacity_kw": 42.0,
        "complaints": [
            {
                "complaint_id": "REF-2026-9841",
                "category": "Breakdown",
                "nature": "Service wire sparking near roof eaves",
                "logged_date": "2026-11-12 18:40",
                "status": "IN_PROGRESS",
                "assigned_depot": "Colombo South Area Engineer Office",
                "estimated_completion": "2026-11-13 16:00",
            }
        ],
    }
}

def get_customer_account(account_number: str) -> Optional[Dict[str, Any]]:
    return FICTIONAL_CUSTOMERS.get(account_number)
