"""
Database Seeding Script for EDL Care Assistant Prototype
Initializes SQLite database with 3 fictional demonstration accounts:
1. Domestic Low-Usage: #0412345678 (Dasuni Thiwanshika / K. A. Perera)
2. Domestic High-Usage: #0723456789 (Sunil M. Fernando)
3. Solar PV Customer: #0134567890 (R. Jayasuriya)
Features a full 12-month consumption & billing history, multi-status complaints (Pending, In Progress, Resolved),
simulated grid outage markers with coordinates, and solar transformer capacity records.
ALL DATA IS STRICTLY FICTIONAL DEMONSTRATION DATA (MOCK DATA).
"""

from backend.app.database import engine, Base, SessionLocal
from backend.app.db_models import (
    Customer, Account, Bill, ConsumptionRecord,
    Complaint, Outage, SolarTransformer, ChatSession, ChatMessageRecord
)
from backend.app.auth import hash_password

def seed_database():
    """Initializes tables and populates comprehensive 12-month demo records."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Customer).first():
            print("Database already contains records. Refreshing seed data...")
            # Clean up old records for a fresh demo state
            db.query(ChatMessageRecord).delete()
            db.query(ChatSession).delete()
            db.query(ConsumptionRecord).delete()
            db.query(Bill).delete()
            db.query(Complaint).delete()
            db.query(Account).delete()
            db.query(Customer).delete()
            db.query(Outage).delete()
            db.query(SolarTransformer).delete()
            db.commit()

        # ==========================================
        # 1. CUSTOMER 1: Domestic Low-Usage
        # ==========================================
        c1 = Customer(
            username="customer_low",
            email="dasuni.demo@edl.lk",
            hashed_password=hash_password("demo123"),
            full_name="Dasuni Thiwanshika Premawardana",
            phone="0771234567"
        )
        db.add(c1)
        db.flush()

        a1 = Account(
            account_number="0412345678",
            customer_id=c1.id,
            premises_name="Home",
            premises_address="No. 42, Sri Jayawardenepura Mawatha, Colombo 05 [MOCK DATA]",
            tariff_category="Domestic (D-1)",
            connected_feeder="Feeder F-04 Havelock",
            substation_code="TR-402 (Nugegoda)",
            outstanding_balance=4850.00,
            due_date="2026-11-25",
            last_payment_amount=5200.00,
            last_payment_date="2026-10-15",
            monthly_consumption_kwh=142,
            monthly_average_kwh=150,
            solar_capacity_kw=0.0,
            is_solar=False
        )
        db.add(a1)
        db.flush()

        # 12-Month Consumption & Billing History for Customer 1 (Nov 2025 - Oct 2026)
        c1_months = [
            ("Nov", 2025, 135, 4550.00, True, 1000, 1135),
            ("Dec", 2025, 152, 5210.00, True, 1135, 1287),
            ("Jan", 2026, 140, 4780.00, True, 1287, 1427),
            ("Feb", 2026, 138, 4700.00, True, 1427, 1565),
            ("Mar", 2026, 145, 4950.00, True, 1565, 1710),
            ("Apr", 2026, 165, 5720.00, True, 1710, 1875),
            ("May", 2026, 158, 5420.00, True, 1875, 2033),
            ("Jun", 2026, 162, 5610.00, True, 2033, 2195),
            ("Jul", 2026, 148, 5100.00, True, 2195, 2343),
            ("Aug", 2026, 155, 5340.00, True, 2343, 2498),
            ("Sep", 2026, 160, 5550.00, True, 2498, 2658),
            ("Oct", 2026, 142, 4850.00, False, 2658, 2800),
        ]
        for m, y, u, amt, is_paid, prev_r, pres_r in c1_months:
            db.add(ConsumptionRecord(account_id=a1.id, month=m, year=y, units_kwh=u, amount_lkr=amt))
            db.add(Bill(
                account_id=a1.id,
                billing_month=f"{m} {y}",
                previous_reading=prev_r,
                present_reading=pres_r,
                units_consumed=u,
                energy_charge=round(amt - 1000.00, 2),
                fixed_charge=1000.00,
                fuel_adjustment=0.00,
                total_amount=amt,
                due_date=f"{y}-{11 if m == 'Oct' else '15'}-25",
                is_paid=is_paid
            ))

        # Complaints for Customer 1 (IN_PROGRESS, PENDING, RESOLVED)
        db.add(Complaint(
            ticket_id="REF-2026-9841",
            account_id=a1.id,
            category="Breakdown",
            nature="Service wire sparking near roof eaves",
            description="Sparks observed during light rain near incoming service drop cable. [MOCK DATA]",
            area="Colombo 05",
            phone="0771234567",
            status="IN_PROGRESS",
            assigned_depot="Colombo South Area Engineer Office",
            logged_date="2026-11-12 18:40",
            estimated_completion="Today by 4:00 PM"
        ))
        db.add(Complaint(
            ticket_id="REF-2026-3104",
            account_id=a1.id,
            category="Voltage",
            nature="Low voltage fluctuation during peak hours",
            description="Voltage drops to 195V between 7:00 PM and 9:30 PM affecting appliances. [MOCK DATA]",
            area="Colombo 05",
            phone="0771234567",
            status="PENDING",
            assigned_depot="Colombo South Area Engineer Office",
            logged_date="2026-11-15 20:15",
            estimated_completion="Awaiting Technical Inspection"
        ))
        db.add(Complaint(
            ticket_id="REF-2026-1182",
            account_id=a1.id,
            category="Meter",
            nature="Meter reading verification request",
            description="Customer requested meter verification; inspected and calibrated by test engineer. [MOCK DATA]",
            area="Colombo 05",
            phone="0771234567",
            status="RESOLVED",
            assigned_depot="Colombo South Area Engineer Office",
            logged_date="2026-09-18 10:30",
            estimated_completion="Resolved on 2026-09-20"
        ))

        # ==========================================
        # 2. CUSTOMER 2: Domestic High-Usage
        # ==========================================
        c2 = Customer(
            username="customer_high",
            email="fernando.demo@edl.lk",
            hashed_password=hash_password("demo123"),
            full_name="Sunil M. Fernando",
            phone="0719876543"
        )
        db.add(c2)
        db.flush()

        a2 = Account(
            account_number="0723456789",
            customer_id=c2.id,
            premises_name="Residence & Workshop",
            premises_address="No. 118, Peradeniya Road, Kandy [MOCK DATA]",
            tariff_category="Domestic (D-1 High)",
            connected_feeder="Feeder K-02 Peradeniya",
            substation_code="TR-105 (Kandy Central)",
            outstanding_balance=18200.00,
            due_date="2026-11-28",
            last_payment_amount=17500.00,
            last_payment_date="2026-10-18",
            monthly_consumption_kwh=340,
            monthly_average_kwh=326,
            solar_capacity_kw=0.0,
            is_solar=False
        )
        db.add(a2)
        db.flush()

        # 12-Month Consumption & Billing History for Customer 2
        c2_months = [
            ("Nov", 2025, 295, 15900.00, True, 3000, 3295),
            ("Dec", 2025, 310, 16800.00, True, 3295, 3605),
            ("Jan", 2026, 300, 16200.00, True, 3605, 3905),
            ("Feb", 2026, 315, 17000.00, True, 3905, 4220),
            ("Mar", 2026, 330, 17800.00, True, 4220, 4550),
            ("Apr", 2026, 360, 19500.00, True, 4550, 4910),
            ("May", 2026, 310, 16800.00, True, 4910, 5220),
            ("Jun", 2026, 325, 17450.00, True, 5220, 5545),
            ("Jul", 2026, 330, 17800.00, True, 5545, 5875),
            ("Aug", 2026, 315, 17000.00, True, 5875, 6190),
            ("Sep", 2026, 332, 17900.00, True, 6190, 6522),
            ("Oct", 2026, 340, 18200.00, False, 6522, 6862),
        ]
        for m, y, u, amt, is_paid, prev_r, pres_r in c2_months:
            db.add(ConsumptionRecord(account_id=a2.id, month=m, year=y, units_kwh=u, amount_lkr=amt))
            db.add(Bill(
                account_id=a2.id,
                billing_month=f"{m} {y}",
                previous_reading=prev_r,
                present_reading=pres_r,
                units_consumed=u,
                energy_charge=round(amt - 1500.00, 2),
                fixed_charge=1500.00,
                fuel_adjustment=0.00,
                total_amount=amt,
                due_date=f"{y}-{11 if m == 'Oct' else '18'}-28",
                is_paid=is_paid
            ))

        # Complaints for Customer 2 (IN_PROGRESS, RESOLVED)
        db.add(Complaint(
            ticket_id="REF-2026-7721",
            account_id=a2.id,
            category="Technical",
            nature="Phase imbalance on three-phase workshop supply",
            description="Phase 2 voltage dipping under workshop load. Inspection scheduled. [MOCK DATA]",
            area="Peradeniya, Kandy",
            phone="0719876543",
            status="IN_PROGRESS",
            assigned_depot="Kandy Central Area Engineer Depot",
            logged_date="2026-11-14 11:20",
            estimated_completion="Tomorrow by 2:00 PM"
        ))
        db.add(Complaint(
            ticket_id="REF-2026-5540",
            account_id=a2.id,
            category="Safety",
            nature="Overhead service line sag adjustment",
            description="Low service wire tension adjusted and clevis bracket secured. [MOCK DATA]",
            area="Peradeniya, Kandy",
            phone="0719876543",
            status="RESOLVED",
            assigned_depot="Kandy Central Area Engineer Depot",
            logged_date="2026-08-20 14:10",
            estimated_completion="Resolved on 2026-08-22"
        ))

        # ==========================================
        # 3. CUSTOMER 3: Solar PV Net-Metering Customer
        # ==========================================
        c3 = Customer(
            username="customer_solar",
            email="jayasuriya.demo@edl.lk",
            hashed_password=hash_password("demo123"),
            full_name="R. Jayasuriya",
            phone="0755554321"
        )
        db.add(c3)
        db.flush()

        a3 = Account(
            account_number="0134567890",
            customer_id=c3.id,
            premises_name="Eco Villa",
            premises_address="No. 15, Sea Breeze Mawatha, Galle Fort [MOCK DATA]",
            tariff_category="Domestic (D-1 Net-Metering)",
            connected_feeder="Feeder G-01 Galle Fort",
            substation_code="TR-780 (Galle Central)",
            outstanding_balance=1200.00,
            due_date="2026-11-20",
            last_payment_amount=1200.00,
            last_payment_date="2026-10-12",
            monthly_consumption_kwh=45,
            monthly_average_kwh=47,
            solar_capacity_kw=5.0,
            is_solar=True
        )
        db.add(a3)
        db.flush()

        # 12-Month Consumption & Billing History for Customer 3
        c3_months = [
            ("Nov", 2025, 42, 1150.00, True, 2600, 2642),
            ("Dec", 2025, 40, 1100.00, True, 2642, 2682),
            ("Jan", 2026, 38, 1050.00, True, 2682, 2720),
            ("Feb", 2026, 45, 1200.00, True, 2720, 2765),
            ("Mar", 2026, 48, 1250.00, True, 2765, 2813),
            ("Apr", 2026, 55, 1380.00, True, 2813, 2868),
            ("May", 2026, 40, 1100.00, True, 2868, 2908),
            ("Jun", 2026, 55, 1350.00, True, 2908, 2963),
            ("Jul", 2026, 48, 1220.00, True, 2963, 3011),
            ("Aug", 2026, 52, 1280.00, True, 3011, 3063),
            ("Sep", 2026, 58, 1400.00, True, 3063, 3121),
            ("Oct", 2026, 45, 1200.00, False, 3121, 3166),
        ]
        for m, y, u, amt, is_paid, prev_r, pres_r in c3_months:
            db.add(ConsumptionRecord(account_id=a3.id, month=m, year=y, units_kwh=u, amount_lkr=amt))
            db.add(Bill(
                account_id=a3.id,
                billing_month=f"{m} {y}",
                previous_reading=prev_r,
                present_reading=pres_r,
                units_consumed=u,
                energy_charge=round(amt - 300.00, 2),
                fixed_charge=300.00,
                fuel_adjustment=0.00,
                total_amount=amt,
                due_date=f"{y}-{11 if m == 'Oct' else '12'}-20",
                is_paid=is_paid
            ))

        # Complaints for Customer 3 (PENDING, RESOLVED)
        db.add(Complaint(
            ticket_id="REF-2026-8809",
            account_id=a3.id,
            category="Billing",
            nature="Net-metering solar export credit reconciliation",
            description="Query regarding solar energy export credit calculation for September billing cycle. [MOCK DATA]",
            area="Galle Fort",
            phone="0755554321",
            status="PENDING",
            assigned_depot="Galle Regional Operations Depot",
            logged_date="2026-11-15 09:40",
            estimated_completion="Under Review by Billing Unit"
        ))
        db.add(Complaint(
            ticket_id="REF-2026-2241",
            account_id=a3.id,
            category="Solar",
            nature="Solar bi-directional safety switch inspection",
            description="Routine net-metering rooftop isolation disconnect inspection passed. [MOCK DATA]",
            area="Galle Fort",
            phone="0755554321",
            status="RESOLVED",
            assigned_depot="Galle Regional Operations Depot",
            logged_date="2026-07-12 11:00",
            estimated_completion="Resolved on 2026-07-14"
        ))

        # ==========================================
        # 4. SIMULATED GRID OUTAGES (SRI LANKA)
        # ==========================================
        outages_data = [
            Outage(
                outage_code="OUT-2026-1089",
                area="Havelock Town, Colombo 05",
                district="Colombo",
                feeder_name="Feeder F-04 Havelock",
                outage_type="breakdown",
                affected_customers=480,
                start_time="Today, 10:15 AM",
                estimated_restoration="Today, 04:30 PM",
                status="In Progress",
                latitude=6.8770,
                longitude=79.8710,
                reason="Fallen tree branch on 11kV distribution conductor near Havelock Road [MOCK DATA]"
            ),
            Outage(
                outage_code="OUT-2026-1090",
                area="Peradeniya Road, Kandy",
                district="Kandy",
                feeder_name="Feeder K-02 Peradeniya",
                outage_type="planned",
                affected_customers=850,
                start_time="Today, 09:00 AM",
                estimated_restoration="Today, 02:00 PM",
                status="Scheduled",
                latitude=7.2710,
                longitude=80.6010,
                reason="Routine feeder reconductoring and insulator replacement [MOCK DATA]"
            ),
            Outage(
                outage_code="OUT-2026-1091",
                area="Galle Fort Historic Precinct",
                district="Galle",
                feeder_name="Feeder G-01 Galle Fort",
                outage_type="planned",
                affected_customers=210,
                start_time="Tomorrow, 08:30 AM",
                estimated_restoration="Tomorrow, 01:00 PM",
                status="Scheduled",
                latitude=6.0320,
                longitude=80.2170,
                reason="Substation TR-780 transformer preventive oil maintenance [MOCK DATA]"
            ),
            Outage(
                outage_code="OUT-2026-1092",
                area="Ja-Ela Industrial Zone",
                district="Gampaha",
                feeder_name="Feeder J-08 Ekala",
                outage_type="breakdown",
                affected_customers=1200,
                start_time="Today, 11:45 AM",
                estimated_restoration="Today, 05:00 PM",
                status="In Progress",
                latitude=7.0750,
                longitude=79.8920,
                reason="Substation cable joint insulation failure under crew inspection [MOCK DATA]"
            ),
            Outage(
                outage_code="OUT-2026-1093",
                area="Battaramulla Government Complex",
                district="Colombo",
                feeder_name="Feeder B-03 Battaramulla",
                outage_type="breakdown",
                affected_customers=640,
                start_time="Today, 12:30 PM",
                estimated_restoration="Today, 04:00 PM",
                status="In Progress",
                latitude=6.8980,
                longitude=79.9180,
                reason="Overhead service line lightning surge arrester trip [MOCK DATA]"
            ),
            Outage(
                outage_code="OUT-2026-1094",
                area="Kurunegala Town Commercial Center",
                district="Kurunegala",
                feeder_name="Feeder KU-01 Central",
                outage_type="planned",
                affected_customers=410,
                start_time="Tomorrow, 09:30 AM",
                estimated_restoration="Tomorrow, 02:30 PM",
                status="Scheduled",
                latitude=7.4863,
                longitude=80.3623,
                reason="Low-voltage distribution box upgrades and pole realignment [MOCK DATA]"
            ),
            Outage(
                outage_code="OUT-2026-1095",
                area="Jaffna Main Street Sector",
                district="Jaffna",
                feeder_name="Feeder JF-03 Bazaar",
                outage_type="breakdown",
                affected_customers=530,
                start_time="Today, 01:15 PM",
                estimated_restoration="Today, 05:30 PM",
                status="In Progress",
                latitude=9.6615,
                longitude=80.0255,
                reason="Underground distribution cable fault being traced with surge locator [MOCK DATA]"
            ),
            Outage(
                outage_code="OUT-2026-1096",
                area="Matara Beach Road Promenade",
                district="Matara",
                feeder_name="Feeder MT-05 Coastal",
                outage_type="planned",
                affected_customers=180,
                start_time="Wednesday, 08:00 AM",
                estimated_restoration="Wednesday, 12:00 PM",
                status="Scheduled",
                latitude=5.9485,
                longitude=80.5353,
                reason="Saline corrosion mitigation and coastal transformer washing [MOCK DATA]"
            ),
        ]
        for o in outages_data:
            db.add(o)

        # ==========================================
        # 5. SOLAR TRANSFORMER RECORDS
        # ==========================================
        transformers_data = [
            SolarTransformer(
                transformer_code="TR-402",
                area="Nugegoda / Havelock",
                district="Colombo",
                feeder_name="Feeder F-04 Havelock",
                total_capacity_kva=160.0,
                used_capacity_kva=88.0,
                remaining_capacity_kw=42.0,
                max_threshold_pct=80.0,
                status="Capacity Available [MOCK DATA]"
            ),
            SolarTransformer(
                transformer_code="TR-105",
                area="Peradeniya",
                district="Kandy",
                feeder_name="Feeder K-02 Peradeniya",
                total_capacity_kva=200.0,
                used_capacity_kva=155.0,
                remaining_capacity_kw=5.0,
                max_threshold_pct=80.0,
                status="Near Threshold [MOCK DATA]"
            ),
            SolarTransformer(
                transformer_code="TR-780",
                area="Galle Fort",
                district="Galle",
                feeder_name="Feeder G-01 Galle Fort",
                total_capacity_kva=100.0,
                used_capacity_kva=80.0,
                remaining_capacity_kw=0.0,
                max_threshold_pct=80.0,
                status="Quota Exceeded (Waitlist) [MOCK DATA]"
            ),
            SolarTransformer(
                transformer_code="TR-312",
                area="Battaramulla",
                district="Colombo",
                feeder_name="Feeder B-03 Battaramulla",
                total_capacity_kva=250.0,
                used_capacity_kva=110.0,
                remaining_capacity_kw=90.0,
                max_threshold_pct=80.0,
                status="High Capacity Available [MOCK DATA]"
            ),
            SolarTransformer(
                transformer_code="TR-550",
                area="Kurunegala Town",
                district="Kurunegala",
                feeder_name="Feeder KU-01 Central",
                total_capacity_kva=180.0,
                used_capacity_kva=95.0,
                remaining_capacity_kw=65.0,
                max_threshold_pct=80.0,
                status="Capacity Available [MOCK DATA]"
            ),
            SolarTransformer(
                transformer_code="TR-820",
                area="Jaffna Central",
                district="Jaffna",
                feeder_name="Feeder JF-03 Bazaar",
                total_capacity_kva=150.0,
                used_capacity_kva=102.0,
                remaining_capacity_kw=38.0,
                max_threshold_pct=80.0,
                status="Capacity Available [MOCK DATA]"
            ),
        ]
        for tr in transformers_data:
            db.add(tr)

        db.commit()
        print("Successfully seeded SQLite database with 3 fictional customer profiles (12-month histories), multi-status complaints, 8 outages, and 6 solar transformers.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
