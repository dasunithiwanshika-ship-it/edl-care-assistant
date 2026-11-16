"""
Fictional Customer Data Store for EDL Care Assistant Demonstration Prototype
Contains 3 distinct fictional demonstration profiles:
1. Low-Usage Domestic: 0412345678 (Dasuni Thiwanshika Premawardana)
2. High-Usage Domestic: 0723456789 (Sunil M. Fernando)
3. Solar Net-Metering: 0134567890 (R. Jayasuriya)
ALL RECORDS ARE MOCK DATA FOR DEMONSTRATION PURPOSES ONLY.
"""

from typing import Dict, Any, Optional

FICTIONAL_CUSTOMERS: Dict[str, Dict[str, Any]] = {
    "0412345678": {
        "account_number": "0412345678",
        "customer_name": "Dasuni Thiwanshika Premawardana",
        "nickname": "Home",
        "premises_address": "No. 42, Sri Jayawardenepura Mawatha, Colombo 05 [MOCK DATA]",
        "tariff_category": "Domestic (D-1)",
        "billing_month": "October 2026",
        "outstanding_balance": 4850.00,
        "due_date": "2026-11-25",
        "last_payment_date": "2026-10-15",
        "last_payment_amount": 5200.00,
        "monthly_consumption_kwh": 142,
        "monthly_average_kwh": 150,
        "connected_feeder": "Feeder F-04 Havelock",
        "substation_code": "TR-402 (Nugegoda)",
        "remaining_solar_capacity_kw": 42.0,
        "is_solar": False,
        "complaints": [
            {
                "complaint_id": "REF-2026-9841",
                "category": "Breakdown",
                "nature": "Service wire sparking near roof eaves",
                "logged_date": "2026-11-12 18:40",
                "status": "IN_PROGRESS",
                "assigned_depot": "Colombo South Area Engineer Office",
                "estimated_completion": "Today by 4:00 PM",
            },
            {
                "complaint_id": "REF-2026-3104",
                "category": "Voltage",
                "nature": "Low voltage fluctuation during peak hours",
                "logged_date": "2026-11-15 20:15",
                "status": "PENDING",
                "assigned_depot": "Colombo South Area Engineer Office",
                "estimated_completion": "Awaiting Technical Inspection",
            },
            {
                "complaint_id": "REF-2026-1182",
                "category": "Meter",
                "nature": "Meter reading verification request",
                "logged_date": "2026-09-18 10:30",
                "status": "RESOLVED",
                "assigned_depot": "Colombo South Area Engineer Office",
                "estimated_completion": "Resolved on 2026-09-20",
            }
        ],
    },
    "0723456789": {
        "account_number": "0723456789",
        "customer_name": "Sunil M. Fernando",
        "nickname": "Residence & Workshop",
        "premises_address": "No. 118, Peradeniya Road, Kandy [MOCK DATA]",
        "tariff_category": "Domestic (D-1 High)",
        "billing_month": "October 2026",
        "outstanding_balance": 18200.00,
        "due_date": "2026-11-28",
        "last_payment_date": "2026-10-18",
        "last_payment_amount": 17500.00,
        "monthly_consumption_kwh": 340,
        "monthly_average_kwh": 326,
        "connected_feeder": "Feeder K-02 Peradeniya",
        "substation_code": "TR-105 (Kandy Central)",
        "remaining_solar_capacity_kw": 5.0,
        "is_solar": False,
        "complaints": [
            {
                "complaint_id": "REF-2026-7721",
                "category": "Technical",
                "nature": "Phase imbalance on three-phase workshop supply",
                "logged_date": "2026-11-14 11:20",
                "status": "IN_PROGRESS",
                "assigned_depot": "Kandy Central Area Engineer Depot",
                "estimated_completion": "Tomorrow by 2:00 PM",
            },
            {
                "complaint_id": "REF-2026-5540",
                "category": "Safety",
                "nature": "Overhead service line sag adjustment",
                "logged_date": "2026-08-20 14:10",
                "status": "RESOLVED",
                "assigned_depot": "Kandy Central Area Engineer Depot",
                "estimated_completion": "Resolved on 2026-08-22",
            }
        ],
    },
    "0134567890": {
        "account_number": "0134567890",
        "customer_name": "R. Jayasuriya",
        "nickname": "Eco Villa",
        "premises_address": "No. 15, Sea Breeze Mawatha, Galle Fort [MOCK DATA]",
        "tariff_category": "Domestic (D-1 Net-Metering)",
        "billing_month": "October 2026",
        "outstanding_balance": 1200.00,
        "due_date": "2026-11-20",
        "last_payment_date": "2026-10-12",
        "last_payment_amount": 1200.00,
        "monthly_consumption_kwh": 45,
        "monthly_average_kwh": 47,
        "connected_feeder": "Feeder G-01 Galle Fort",
        "substation_code": "TR-780 (Galle Central)",
        "remaining_solar_capacity_kw": 0.0,
        "is_solar": True,
        "complaints": [
            {
                "complaint_id": "REF-2026-8809",
                "category": "Billing",
                "nature": "Net-metering solar export credit reconciliation",
                "logged_date": "2026-11-15 09:40",
                "status": "PENDING",
                "assigned_depot": "Galle Regional Operations Depot",
                "estimated_completion": "Under Review by Billing Unit",
            },
            {
                "complaint_id": "REF-2026-2241",
                "category": "Solar",
                "nature": "Solar bi-directional safety switch inspection",
                "logged_date": "2026-07-12 11:00",
                "status": "RESOLVED",
                "assigned_depot": "Galle Regional Operations Depot",
                "estimated_completion": "Resolved on 2026-07-14",
            }
        ],
    }
}

def get_customer_account(account_number: str) -> Optional[Dict[str, Any]]:
    return FICTIONAL_CUSTOMERS.get(account_number)
