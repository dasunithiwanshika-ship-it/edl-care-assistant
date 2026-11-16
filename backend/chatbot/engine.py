"""
Shared AI Chatbot Engine for Option C (Guest + Login-based Support)
Integrates Google Gemini SDK, ChromaDB RAG, SQLite persistence, and Rich UI Cards.
"""

import os
import uuid
from typing import Dict, Any, Tuple, Optional, List
from sqlalchemy.orm import Session
from backend.app.schemas import (
    ChatMode, Language, AccessScope, ChatResponse, RichCardData
)
from backend.app.database import SessionLocal
from backend.app.db_models import (
    Customer, Account, Bill, ConsumptionRecord, Complaint, Outage, SolarTransformer,
    ChatSession, ChatMessageRecord
)
from backend.rag.retrieval import retrieve_knowledge
from backend.services.gemini_service import gemini_service
from backend.chatbot.prompts import GUEST_SYSTEM_PROMPT, build_customer_prompt

class ChatbotEngine:
    def __init__(self):
        self.gemini = gemini_service

    def process_message(
        self,
        message: str,
        mode: ChatMode,
        language: Language,
        account_number: Optional[str] = None,
        session_id: Optional[str] = None
    ) -> ChatResponse:
        """
        Processes chat message according to Option C access control:
        - If mode == guest: accesses public RAG documents only; blocks personal account data.
        - If mode == customer: injects verified customer profile + RAG documents.
        """
        db: Session = SessionLocal()
        try:
            # 1. Manage or retrieve Chat Session
            if not session_id:
                session_id = str(uuid.uuid4())
            
            chat_session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
            if not chat_session:
                chat_session = ChatSession(
                    session_id=session_id,
                    mode=mode.value,
                    language=language.value,
                    account_number=account_number
                )
                db.add(chat_session)
                db.commit()
                db.refresh(chat_session)

            # Get recent conversation history for multi-turn context
            recent_msgs = (
                db.query(ChatMessageRecord)
                .filter(ChatMessageRecord.session_id == chat_session.id)
                .order_by(ChatMessageRecord.id.desc())
                .limit(6)
                .all()
            )
            history = [{"sender": m.sender, "content": m.content} for m in reversed(recent_msgs)]

            # 2. Retrieve RAG documentation via ChromaDB
            rag_docs = retrieve_knowledge(message, top_k=2)
            rag_context = "\n\n".join([f"[{d['title']}]: {d['content']}" for d in rag_docs])
            sources = [d["title"] for d in rag_docs]

            # 3. Customer Data & Scope Resolution
            customer_data = None
            action_required = None
            rich_card: Optional[RichCardData] = None
            lower_msg = message.lower()

            if mode == ChatMode.customer:
                acc_id = account_number or "0412345678"
                account_obj = db.query(Account).filter(Account.account_number == acc_id).first()
                if not account_obj:
                    account_obj = db.query(Account).first()
                
                if account_obj:
                    # Build customer profile dictionary
                    cust = account_obj.customer
                    recent_complaint = (
                        db.query(Complaint)
                        .filter(Complaint.account_id == account_obj.id)
                        .order_by(Complaint.id.desc())
                        .first()
                    )
                    complaints_list = []
                    if recent_complaint:
                        complaints_list.append({
                            "complaint_id": recent_complaint.ticket_id,
                            "nature": recent_complaint.nature,
                            "status": recent_complaint.status,
                            "assigned_depot": recent_complaint.assigned_depot
                        })

                    customer_data = {
                        "account_number": account_obj.account_number,
                        "customer_name": cust.full_name if cust else "Valued Customer",
                        "nickname": account_obj.premises_name,
                        "premises_address": account_obj.premises_address,
                        "tariff_category": account_obj.tariff_category,
                        "billing_month": "October 2026",
                        "outstanding_balance": account_obj.outstanding_balance,
                        "due_date": account_obj.due_date,
                        "last_payment_amount": account_obj.last_payment_amount,
                        "last_payment_date": account_obj.last_payment_date,
                        "monthly_consumption_kwh": account_obj.monthly_consumption_kwh,
                        "monthly_average_kwh": account_obj.monthly_average_kwh,
                        "connected_feeder": account_obj.connected_feeder,
                        "substation_code": account_obj.substation_code,
                        "remaining_solar_capacity_kw": account_obj.solar_capacity_kw,
                        "complaints": complaints_list
                    }

                system_prompt = build_customer_prompt(customer_data) if customer_data else GUEST_SYSTEM_PROMPT
                scope = AccessScope.authenticated_customer
            else:
                system_prompt = GUEST_SYSTEM_PROMPT
                scope = AccessScope.public_knowledge

            # 4. Check Action Requirements & Rich Card Triggers
            if mode == ChatMode.guest:
                is_personal = (
                    any(term in lower_msg for term in ["my bill", "outstanding", "balance", "මගේ බිල", "ශේෂය", "நிலுவை"]) or
                    ("bill" in lower_msg and any(w in lower_msg for w in ["my", "personal", "due", "account", "owing"])) or
                    ("account" in lower_msg and any(w in lower_msg for w in ["my", "balance", "status", "detail"]))
                )
                if is_personal:
                    action_required = "login"
            else:
                # Customer Mode Rich Card Detection
                if any(term in lower_msg for term in ["outstanding", "my bill", "balance", "pay", "බිල", "ශේෂය", "நிலுவை"]):
                    action_required = "pay"
                    rich_card = RichCardData(
                        type="bill",
                        title=f"Account #{customer_data['account_number']} – Billing Statement",
                        data={
                            "account_number": customer_data["account_number"],
                            "customer_name": customer_data["customer_name"],
                            "billing_month": customer_data["billing_month"],
                            "outstanding_balance": customer_data["outstanding_balance"],
                            "due_date": customer_data["due_date"],
                            "monthly_consumption_kwh": customer_data["monthly_consumption_kwh"],
                            "tariff_category": customer_data["tariff_category"]
                        }
                    )
                elif any(term in lower_msg for term in ["consumption", "usage", "kwh", "compare", "last month", "පරිභෝජන", "නියමිත"]):
                    # Query 6-month consumption records
                    c_records = (
                        db.query(ConsumptionRecord)
                        .filter(ConsumptionRecord.account_id == account_obj.id)
                        .order_by(ConsumptionRecord.id.asc())
                        .all()
                    )
                    records_list = [{"month": r.month, "kwh": r.units_kwh, "lkr": r.amount_lkr} for r in c_records]
                    rich_card = RichCardData(
                        type="consumption",
                        title="6-Month Electricity Consumption History",
                        data={
                            "account_number": customer_data["account_number"],
                            "current_kwh": customer_data["monthly_consumption_kwh"],
                            "average_kwh": customer_data["monthly_average_kwh"],
                            "history": records_list
                        }
                    )
                elif any(term in lower_msg for term in ["complaint", "track", "ticket", "දෝෂ", "පැමිණිලි", "புகார்"]):
                    action_required = "complaint"
                    comp = db.query(Complaint).filter(Complaint.account_id == account_obj.id).first()
                    if comp:
                        rich_card = RichCardData(
                            type="complaint",
                            title=f"Complaint Tracking #{comp.ticket_id}",
                            data={
                                "ticket_id": comp.ticket_id,
                                "category": comp.category,
                                "nature": comp.nature,
                                "status": comp.status,
                                "assigned_depot": comp.assigned_depot,
                                "estimated_completion": comp.estimated_completion,
                                "logged_date": comp.logged_date
                            }
                        )
                elif any(term in lower_msg for term in ["solar", "capacity", "transformer", "සූර්ය", "சூரிய"]):
                    tr = db.query(SolarTransformer).filter(SolarTransformer.transformer_code == "TR-402").first()
                    if tr:
                        rich_card = RichCardData(
                            type="solar",
                            title=f"Solar Feeder Capacity – {tr.transformer_code}",
                            data={
                                "transformer_code": tr.transformer_code,
                                "area": tr.area,
                                "feeder_name": tr.feeder_name,
                                "total_capacity_kva": tr.total_capacity_kva,
                                "used_capacity_kva": tr.used_capacity_kva,
                                "remaining_capacity_kw": tr.remaining_capacity_kw,
                                "status": tr.status
                            }
                        )

            # 5. Generate Response (Gemini SDK or Controlled Multilingual Fallback)
            gemini_reply = None
            if self.gemini.is_active:
                gemini_reply = self.gemini.generate_chat_reply(
                    message=message,
                    system_instruction=system_prompt,
                    rag_context=rag_context,
                    language=language.value,
                    conversation_history=history
                )

            reply = gemini_reply or self._generate_fallback(
                message=message,
                mode=mode,
                language=language,
                customer=customer_data,
                history=history
            )

            # 6. Save messages to SQLite session history
            user_rec = ChatMessageRecord(
                session_id=chat_session.id,
                sender="user",
                content=message,
                language=language.value,
                timestamp="now"
            )
            bot_rec = ChatMessageRecord(
                session_id=chat_session.id,
                sender="assistant",
                content=reply,
                language=language.value,
                timestamp="now",
                action_required=action_required,
                sources=",".join(sources)
            )
            db.add(user_rec)
            db.add(bot_rec)
            db.commit()

            return ChatResponse(
                reply=reply,
                mode=mode,
                scope=scope,
                language=language,
                is_mock=(gemini_reply is None),
                action_required=action_required,
                sources=sources,
                account_ref=customer_data.get("account_number") if customer_data else None,
                rich_card=rich_card,
                session_id=session_id
            )

        finally:
            db.close()

    def _generate_fallback(
        self,
        message: str,
        mode: ChatMode,
        language: Language,
        customer: Optional[Dict[str, Any]],
        history: List[Dict[str, str]]
    ) -> str:
        """High-fidelity multilingual fallback response generator."""
        lower = message.lower()

        # Multi-turn follow-up detection:
        if "compare" in lower or "last month" in lower or "පසුගිය මස" in lower:
            if mode == ChatMode.customer and customer:
                kwh = customer.get("monthly_consumption_kwh", 142)
                return (
                    f"Comparing October with September 2026: In October, you consumed {kwh} kWh (Rs. 4,850.00), "
                    "down from 160 kWh (Rs. 5,550.00) in September. This represents an 11.2% reduction in consumption, "
                    "saving you approximately Rs. 700.00!"
                )

        if mode == ChatMode.guest:
            if any(term in lower for term in ["my bill", "outstanding", "balance", "මගේ බිල", "ශේෂය", "நிலුவை"]):
                if language == Language.si:
                    return (
                        "🔒 පාරිභෝගික ප්‍රවිෂ්ටය අවශ්‍යයි: ඔබ දැනට අමුත්තන්ගේ මාදිලියේ (Guest Mode) සිටී. "
                        "පෞද්ගලික විදුලි බිල්පත් සහ ශේෂයන් දැකගත හැක්කේ ප්‍රවිෂ්ට වූ පාරිභෝගිකයින්ට පමණි. "
                        "කරුණාකර ඔබගේ EDL Care ගිණුමට ප්‍රවිෂ්ට වන්න."
                    )
                elif language == Language.ta:
                    return (
                        "🔒 உள்நுழைவு தேவை: நீங்கள் தற்போது விருந்தினர் பயன்முறையில் உள்ளீர்கள். "
                        "தனிப்பட்ட நிதித் தரவைப் பாதுகாக்க, பதிவுசெய்த வாடிக்கையாளர்களுக்கு மட்டுமே கட்டண விவரங்கள் காண்பிக்கப்படும். "
                        "தயவுசெய்து உங்கள் EDL Care கணக்கில் உள்நுழையவும்."
                    )
                else:
                    return (
                        "🔒 Customer Login Required: In Guest Mode, individual bill records and personal balances "
                        "are protected. Please sign in to your EDL Care account to view your outstanding balance, "
                        "payment history, and active breakdown complaints."
                    )

            if any(term in lower for term in ["tariff", "rate", "cost", "ගාස්තු", "கட்டணம்"]):
                if language == Language.si:
                    return (
                        "ශ්‍රී ලංකාවේ ගෘහස්ථ විදුලි ගාස්තු ක්‍රමය කාණ්ඩ අනුව ගණනය කෙරේ: "
                        "ඒකක 0–30: රු. 8.00 + රු. 150 ස්ථාවර ගාස්තුව. "
                        "ඒකක 31–60: රු. 15.00 + රු. 300 ස්ථාවර ගාස්තුව. "
                        "ඒකක 61–90: රු. 25.00 + රු. 400 ස්ථාවර ගාස්තුව. "
                        "ඒකක 91–120: රු. 35.00 + රු. 1,000 ස්ථාවර ගාස්තුව. "
                        "ඒකක 120 ට වැඩි: රු. 50.00 + රු. 1,500 ස්ථාවර ගාස්තුව."
                    )
                elif language == Language.ta:
                    return (
                        "இலங்கையில் உள்நாட்டு மின்கட்டண முறை தொகுதி வாரியாகக் கணக்கிடப்படுகிறது: "
                        "0–30 அலகுகள்: ரூ. 8.00 + ரூ. 150 நிலையான கட்டணம். "
                        "31–60 அலகுகள்: ரூ. 15.00 + ரூ. 300 நிலையான கட்டணம். "
                        "61–90 அலகுகள்: ரூ. 25.00 + ரூ. 400 நிலையான கட்டணம். "
                        "91–120 அலகுகள்: ரூ. 35.00 + ரூ. 1,000 நிலையான கட்டணம். "
                        "120 அலகுகளுக்கு மேல்: ரூ. 50.00 + ரூ. 1,500 நிலையான கட்டணம்."
                    )
                else:
                    return (
                        "Sri Lanka domestic electricity tariffs are structured into progressive monthly blocks: "
                        "Block 1 (0–30 units): Rs. 8.00/unit + Rs. 150 fixed fee. "
                        "Block 2 (31–60 units): Rs. 15.00/unit + Rs. 300 fixed fee. "
                        "Block 3 (61–90 units): Rs. 25.00/unit + Rs. 400 fixed fee. "
                        "Block 4 (91–120 units): Rs. 35.00/unit + Rs. 1,000 fixed fee. "
                        "Block 5 (>120 units): Rs. 50.00/unit + Rs. 1,500 fixed fee. "
                        "Maintaining consumption below 60 units qualifies for lifeline subsidies."
                    )

            if any(term in lower for term in ["safety", "hazard", "shock", "trip switch", "ආරක්ෂ", "பாதுகாப்பு"]):
                return (
                    "Essential electrical safety tips: (1) Test your Earth Leakage Circuit Breaker (ELCB/Trip Switch) monthly, "
                    "(2) Never touch wet switches or plugs, (3) Maintain at least 3 meters clearance from overhead service cables, "
                    "and (4) Immediately dial 1987 if you observe fallen wires or sparking transformers."
                )

            if any(term in lower for term in ["solar", "සූර්ය", "சூரிய"]):
                return (
                    "EDL provides three rooftop solar schemes: Net-Metering, Net-Accounting, and Net-Plus. "
                    "Each distribution transformer has an 80% solar hosting capacity limit to maintain grid voltage stability. "
                    "You can enter a substation code (e.g. TR-402) in the Solar Capacity Checker to test feeder feasibility."
                )

            return (
                "Ayubowan / Vanakkam! As EDL Care Assistant in Guest Mode, I can explain electricity tariffs, "
                "safety precautions, planned maintenance schedules, and solar interconnection guidelines. "
                "Sign in with a customer account anytime to view personal bills and report breakdown faults."
            )

        else:
            # Customer Mode
            if any(term in lower for term in ["outstanding", "my bill", "balance", "මගේ බිල", "ශේෂය", "நிலුவை"]):
                bal = customer.get("outstanding_balance", 4850.0) if customer else 4850.0
                acc = customer.get("account_number", "0412345678") if customer else "0412345678"
                due = customer.get("due_date", "2026-11-25") if customer else "2026-11-25"
                if language == Language.si:
                    return f"ඔබගේ ගිණුමේ (#{acc} – {customer.get('nickname', 'නිවස')}) ඔක්තෝබර් සඳහා ගෙවිය යුතු ශේෂය රු. {bal:,.2f} කි. ගෙවිය යුතු අවසන් දිනය {due} වේ. ඔබට 'Pay Now' බොත්තම මඟින් ක්ෂණිකව ගෙවීම් කළ හැක."
                elif language == Language.ta:
                    return f"உங்கள் கணக்கில் (#{acc} – {customer.get('nickname', 'வீடு')}) செலுத்த வேண்டிய நிலுவைத் தொகை ரூ. {bal:,.2f} ஆகும். இறுதித் தேதி {due}. நீங்கள் உடனடியாக Pay Now மூலம் செலுத்தலாம்."
                else:
                    return f"Your demo account (#{acc} – {customer.get('nickname', 'Home')}) has an outstanding balance of Rs. {bal:,.2f} for October 2026. Payment is due on {due}. You can pay directly via the Pay Now card below."

            if any(term in lower for term in ["consumption", "usage", "kwh", "පරිභෝජන", "நுகர்வு"]):
                kwh = customer.get("monthly_consumption_kwh", 142) if customer else 142
                avg = customer.get("monthly_average_kwh", 154) if customer else 154
                return f"In October 2026, your household consumed {kwh} kWh (down 11.2% from September). Your 6-month average is {avg} kWh, keeping you comfortably within the standard domestic efficiency bracket."

            if any(term in lower for term in ["complaint", "track", "ticket", "දෝෂ", "පැමිණිලි", "புகார்"]):
                return "Your Breakdown Complaint #REF-2026-9841 ('Service wire sparking near roof eaves') logged on 12 Nov 2026 is currently IN PROGRESS. Assigned Depot: Colombo South Area Engineer Office. Estimated completion: Today by 4:00 PM."

            if any(term in lower for term in ["solar", "capacity", "සූර්ය", "சூரிய"]):
                return "Your connected distribution transformer (TR-402, Nugegoda / Feeder F-04) has 42 kW of remaining rooftop solar absorption capacity. Feeder capacity is healthy and open for Net-Metering applications."

            return (
                f"Hello {customer.get('customer_name', 'Customer')}! Connected to Account #{customer.get('account_number', '0412345678')}. "
                f"How may I assist you today with your October bill (Rs. {customer.get('outstanding_balance', 4850):,.2f}), consumption trends, or fault reporting?"
            )
