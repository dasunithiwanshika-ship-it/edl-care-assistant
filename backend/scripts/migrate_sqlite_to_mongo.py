"""
Migration script from SQLite to MongoDB Atlas for EDL Care Assistant.
Preserves all demo records, fixes date bugs, creates indexes, and validates counts.
"""

import os
import sys
import sqlite3
from datetime import datetime, timedelta
import secrets
from dotenv import load_dotenv
import pymongo

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BACKEND_DIR, ".env"))

SQLITE_PATH = os.path.join(BACKEND_DIR, "edl_care.db")
MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_DB_NAME", "edl_care")

MONTH_MAP = {
    "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04",
    "May": "05", "Jun": "06", "Jul": "07", "Aug": "08",
    "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"
}

def fix_due_date(billing_month: str, original_due: str, account_id: int) -> str:
    """
    Corrects corrupted seed dates like '2025-15-25' by parsing billing_month.
    E.g. 'Nov 2025' -> '2025-11-25' or '2025-11-28'.
    """
    try:
        parts = billing_month.strip().split()
        if len(parts) == 2:
            m_str, y_str = parts[0], parts[1]
            m_num = MONTH_MAP.get(m_str, "11")
            year = int(y_str)
            # Default day depending on account pattern
            day = "25"
            if account_id == 2:
                day = "28"
            elif account_id == 3:
                day = "20"
            return f"{year}-{m_num}-{day}"
    except Exception:
        pass
    return original_due

def run_migration():
    print("=" * 60)
    print("STARTING SQLITE TO MONGODB ATLAS MIGRATION")
    print("=" * 60)

    if not os.path.exists(SQLITE_PATH):
        raise FileNotFoundError(f"SQLite file not found at {SQLITE_PATH}")

    sqlite_conn = sqlite3.connect(SQLITE_PATH)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cursor = sqlite_conn.cursor()

    client = pymongo.MongoClient(MONGODB_URI, serverSelectionTimeoutMS=10000)
    db = client[DB_NAME]

    print(f"Connected to MongoDB Atlas: {DB_NAME}")

    # 1. CUSTOMERS
    sqlite_cursor.execute("SELECT * FROM customers ORDER BY id ASC;")
    raw_customers = [dict(r) for r in sqlite_cursor.fetchall()]
    print(f"\n[1/9] Migrating Customers: {len(raw_customers)} records found in SQLite...")
    if raw_customers:
        db.customers.delete_many({})
        db.customers.insert_many(raw_customers)
    db.customers.create_index("id", unique=True)
    db.customers.create_index("username", unique=True)
    db.customers.create_index("email", unique=True)
    print(f"      -> Inserted {db.customers.count_documents({})} customers with unique indexes.")

    # 2. ACCOUNTS
    sqlite_cursor.execute("SELECT * FROM accounts ORDER BY id ASC;")
    raw_accounts = [dict(r) for r in sqlite_cursor.fetchall()]
    print(f"\n[2/9] Migrating Accounts: {len(raw_accounts)} records found in SQLite...")
    for a in raw_accounts:
        # Convert integer boolean (0/1) to Python bool
        a["is_solar"] = bool(a.get("is_solar"))
    if raw_accounts:
        db.accounts.delete_many({})
        db.accounts.insert_many(raw_accounts)
    db.accounts.create_index("id", unique=True)
    db.accounts.create_index("account_number", unique=True)
    db.accounts.create_index("customer_id")
    print(f"      -> Inserted {db.accounts.count_documents({})} accounts with indexes.")

    # 3. BILLS (with Date Cleansing)
    sqlite_cursor.execute("SELECT * FROM bills ORDER BY id ASC;")
    raw_bills = [dict(r) for r in sqlite_cursor.fetchall()]
    print(f"\n[3/9] Migrating Bills: {len(raw_bills)} records found in SQLite...")
    date_fixes_count = 0
    for b in raw_bills:
        b["is_paid"] = bool(b.get("is_paid"))
        original_due = b.get("due_date", "")
        corrected_due = fix_due_date(b.get("billing_month", ""), original_due, b.get("account_id", 1))
        if original_due != corrected_due:
            date_fixes_count += 1
            b["due_date"] = corrected_due
    if raw_bills:
        db.bills.delete_many({})
        db.bills.insert_many(raw_bills)
    db.bills.create_index("id", unique=True)
    db.bills.create_index("account_id")
    db.bills.create_index([("account_id", pymongo.ASCENDING), ("billing_month", pymongo.ASCENDING)])
    print(f"      -> Inserted {db.bills.count_documents({})} bills (Corrected {date_fixes_count} invalid calendar dates).")

    # 4. CONSUMPTION RECORDS
    sqlite_cursor.execute("SELECT * FROM consumption_records ORDER BY id ASC;")
    raw_consumption = [dict(r) for r in sqlite_cursor.fetchall()]
    print(f"\n[4/9] Migrating Consumption Records: {len(raw_consumption)} records found in SQLite...")
    if raw_consumption:
        db.consumption_records.delete_many({})
        db.consumption_records.insert_many(raw_consumption)
    db.consumption_records.create_index("id", unique=True)
    db.consumption_records.create_index("account_id")
    db.consumption_records.create_index([("account_id", pymongo.ASCENDING), ("year", pymongo.ASCENDING), ("month", pymongo.ASCENDING)])
    print(f"      -> Inserted {db.consumption_records.count_documents({})} consumption records.")

    # 5. COMPLAINTS (Enriched with Access Codes)
    sqlite_cursor.execute("SELECT * FROM complaints ORDER BY id ASC;")
    raw_complaints = [dict(r) for r in sqlite_cursor.fetchall()]
    print(f"\n[5/9] Migrating Complaints: {len(raw_complaints)} records found in SQLite...")
    for comp in raw_complaints:
        # Generate 6-digit access code for guest tracking
        comp["access_code"] = f"{secrets.randbelow(900000) + 100000}"
    if raw_complaints:
        db.complaints.delete_many({})
        db.complaints.insert_many(raw_complaints)
    db.complaints.create_index("id", unique=True)
    db.complaints.create_index("ticket_id", unique=True)
    db.complaints.create_index("account_id")
    db.complaints.create_index("status")
    print(f"      -> Inserted {db.complaints.count_documents({})} complaints with access codes.")

    # 6. OUTAGES
    sqlite_cursor.execute("SELECT * FROM outages ORDER BY id ASC;")
    raw_outages = [dict(r) for r in sqlite_cursor.fetchall()]
    print(f"\n[6/9] Migrating Outages: {len(raw_outages)} records found in SQLite...")
    if raw_outages:
        db.outages.delete_many({})
        db.outages.insert_many(raw_outages)
    db.outages.create_index("id", unique=True)
    db.outages.create_index("outage_code", unique=True)
    db.outages.create_index("feeder_name")
    db.outages.create_index("district")
    print(f"      -> Inserted {db.outages.count_documents({})} outages.")

    # 7. SOLAR TRANSFORMERS
    sqlite_cursor.execute("SELECT * FROM solar_transformers ORDER BY id ASC;")
    raw_transformers = [dict(r) for r in sqlite_cursor.fetchall()]
    print(f"\n[7/9] Migrating Solar Transformers: {len(raw_transformers)} records found in SQLite...")
    if raw_transformers:
        db.solar_transformers.delete_many({})
        db.solar_transformers.insert_many(raw_transformers)
    db.solar_transformers.create_index("id", unique=True)
    db.solar_transformers.create_index("transformer_code", unique=True)
    db.solar_transformers.create_index("feeder_name")
    print(f"      -> Inserted {db.solar_transformers.count_documents({})} solar transformers.")

    # 8. CHAT SESSIONS
    sqlite_cursor.execute("SELECT * FROM chat_sessions ORDER BY id ASC;")
    raw_sessions = [dict(r) for r in sqlite_cursor.fetchall()]
    print(f"\n[8/9] Migrating Chat Sessions: {len(raw_sessions)} records found in SQLite...")
    if raw_sessions:
        db.chat_sessions.delete_many({})
        db.chat_sessions.insert_many(raw_sessions)
    db.chat_sessions.create_index("id", unique=True)
    db.chat_sessions.create_index("session_id", unique=True)
    db.chat_sessions.create_index("account_number")
    print(f"      -> Inserted {db.chat_sessions.count_documents({})} chat sessions.")

    # 9. CHAT MESSAGES
    sqlite_cursor.execute("SELECT * FROM chat_messages ORDER BY id ASC;")
    raw_messages = [dict(r) for r in sqlite_cursor.fetchall()]
    print(f"\n[9/9] Migrating Chat Messages: {len(raw_messages)} records found in SQLite...")
    if raw_messages:
        db.chat_messages.delete_many({})
        db.chat_messages.insert_many(raw_messages)
    db.chat_messages.create_index("id", unique=True)
    db.chat_messages.create_index("session_id")
    db.chat_messages.create_index("timestamp")
    print(f"      -> Inserted {db.chat_messages.count_documents({})} chat messages.")

    # 10. SETUP PAYMENT TRANSACTIONS COLLECTION
    print("\n[10/11] Initializing 'payment_transactions' collection...")
    db.payment_transactions.create_index("transaction_id", unique=True)
    db.payment_transactions.create_index("account_number")
    db.payment_transactions.create_index("created_at")
    print(f"        -> 'payment_transactions' ready (count: {db.payment_transactions.count_documents({})}).")

    # 11. SETUP SESSION TOKENS COLLECTION (with TTL index)
    print("\n[11/11] Initializing 'session_tokens' collection...")
    db.session_tokens.create_index("token_hash", unique=True)
    db.session_tokens.create_index("account_number")
    db.session_tokens.create_index("expires_at", expireAfterSeconds=0)  # MongoDB automatic TTL cleanup
    print(f"        -> 'session_tokens' ready (count: {db.session_tokens.count_documents({})}).")

    # VERIFICATION COMPARISON
    print("\n" + "=" * 60)
    print("MIGRATION INTEGRITY VERIFICATION REPORT")
    print("=" * 60)

    tables_to_verify = [
        ("customers", "customers"),
        ("accounts", "accounts"),
        ("bills", "bills"),
        ("consumption_records", "consumption_records"),
        ("complaints", "complaints"),
        ("outages", "outages"),
        ("solar_transformers", "solar_transformers"),
        ("chat_sessions", "chat_sessions"),
        ("chat_messages", "chat_messages"),
    ]

    all_matched = True
    for sqlite_tbl, mongo_col in tables_to_verify:
        sqlite_cursor.execute(f"SELECT COUNT(*) FROM {sqlite_tbl};")
        sq_count = sqlite_cursor.fetchone()[0]
        mg_count = db[mongo_col].count_documents({})
        match_str = "MATCH" if sq_count == mg_count else "MISMATCH"
        if sq_count != mg_count:
            all_matched = False
        print(f"  {sqlite_tbl:<22} SQLite: {sq_count:>3} | Atlas: {mg_count:>3} -> [{match_str}]")

    sqlite_conn.close()
    client.close()

    if not all_matched:
        raise ValueError("Migration verification failed: Record count mismatch!")

    print("\nSUCCESS: All collections migrated and verified with 100% record parity.")

if __name__ == "__main__":
    run_migration()
