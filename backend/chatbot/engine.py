"""
Shared AI Chatbot Engine for Option C (Guest + Login-based Support) - MongoDB Atlas
Integrates Google Gemini SDK, ChromaDB RAG, MongoDB Atlas persistence, and Rich UI Cards.
"""

import os
import uuid
from datetime import datetime
from typing import Dict, Any, Tuple, Optional, List
from backend.app.schemas import (
    ChatMode, Language, AccessScope, ChatResponse, RichCardData
)
from backend.app.mongo_db import get_mongo_db
from backend.rag.retrieval import retrieve_knowledge, get_retriever
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
        Processes chat message according to Option C access control (MongoDB Atlas):
        - If mode == guest: accesses public RAG documents only; blocks personal account data.
        - If mode == customer: injects verified customer profile + RAG documents.
        """
        db = get_mongo_db()
        try:
            # 1. Manage or retrieve Chat Session in MongoDB
            if not session_id:
                session_id = str(uuid.uuid4())

            chat_session = db.chat_sessions.find_one({"session_id": session_id})
            if not chat_session:
                last_sess = db.chat_sessions.find_one(sort=[("id", -1)])
                next_sess_id = (last_sess["id"] + 1) if last_sess and "id" in last_sess else 1
                chat_session = {
                    "id": next_sess_id,
                    "session_id": session_id,
                    "mode": mode.value,
                    "language": language.value,
                    "account_number": account_number,
                    "created_at": datetime.utcnow()
                }
                db.chat_sessions.insert_one(chat_session)

            # Get recent conversation history for multi-turn context
            recent_msgs = list(
                db.chat_messages.find({"session_id": chat_session.get("id")})
                .sort("id", -1)
                .limit(6)
            )
            history = [{"sender": m["sender"], "content": m["content"]} for m in reversed(recent_msgs)]

            # 2. Retrieve RAG documentation via ChromaDB
            retriever = get_retriever()
            rag_docs = retriever.search(message, top_k=2)
            if retriever.last_status == "EMBEDDING_UNAVAILABLE":
                rag_context = "[Notice: Knowledge retrieval embedding service is temporarily unavailable. Advise customer that official knowledge retrieval is momentarily offline and direct to demonstration helpline 1987.]"
                sources = []
            else:
                rag_context = "\n\n".join([f"[{d['title']}]: {d['content']}" for d in rag_docs])
                sources = [d["title"] for d in rag_docs]

            # 3. Customer Data & Scope Resolution
            customer_data = None
            action_required = None
            rich_card: Optional[RichCardData] = None
            lower_msg = message.lower()
            account_obj = None

            if mode == ChatMode.customer:
                acc_id = account_number or "0412345678"
                account_obj = db.accounts.find_one({"account_number": acc_id})
                if not account_obj:
                    account_obj = db.accounts.find_one({})

                if account_obj:
                    # Build customer profile dictionary
                    cust = db.customers.find_one({"id": account_obj.get("customer_id")})
                    recent_complaint = db.complaints.find_one(
                        {"account_id": account_obj.get("id")},
                        sort=[("id", -1)]
                    )
                    complaints_list = []
                    if recent_complaint:
                        complaints_list.append({
                            "complaint_id": recent_complaint["ticket_id"],
                            "nature": recent_complaint["nature"],
                            "status": recent_complaint["status"],
                            "assigned_depot": recent_complaint.get("assigned_depot", "Area Engineer Depot")
                        })

                    customer_data = {
                        "account_number": account_obj["account_number"],
                        "customer_name": cust["full_name"] if cust else "Valued Customer",
                        "nickname": account_obj.get("premises_name", "Home"),
                        "premises_address": account_obj.get("premises_address", "Colombo, Sri Lanka"),
                        "tariff_category": account_obj.get("tariff_category", "Domestic (D-1)"),
                        "billing_month": "October 2026",
                        "outstanding_balance": float(account_obj.get("outstanding_balance", 0.0)),
                        "due_date": str(account_obj.get("due_date", "2026-11-25")),
                        "last_payment_amount": float(account_obj.get("last_payment_amount", 0.0)),
                        "last_payment_date": str(account_obj.get("last_payment_date", "None")),
                        "monthly_consumption_kwh": int(account_obj.get("monthly_consumption_kwh", 142)),
                        "monthly_average_kwh": int(account_obj.get("monthly_average_kwh", 150)),
                        "connected_feeder": str(account_obj.get("connected_feeder", "")),
                        "substation_code": str(account_obj.get("substation_code", "")),
                        "remaining_solar_capacity_kw": float(account_obj.get("solar_capacity_kw", 0.0)),
                        "complaints": complaints_list
                    }

                system_prompt = build_customer_prompt(customer_data) if customer_data else GUEST_SYSTEM_PROMPT
                scope = AccessScope.authenticated_customer
            else:
                system_prompt = GUEST_SYSTEM_PROMPT
                scope = AccessScope.public_knowledge

            # 4. Check Action Requirements & Rich Card Triggers
            if mode == ChatMode.guest:
                personal_terms = [
                    # Bills & Balances
                    "my bill", "outstanding", "balance", "how much do i owe", "amount due", "due amount",
                    "bill balance", "pay my bill", "pay bill", "what is my bill",
                    "මගේ බිල", "බිල්පත් ශේෂය", "ශේෂය", "මම ගෙවිය යුතු මුදල", "බිල කීයද",
                    "எனது கட்டணம்", "நிலுவை", "என் பில்", "செலுத்த வேண்டிய தொகை",
                    # Consumption History
                    "my consumption", "my usage", "my kwh", "my electricity", "my units",
                    "how much did i consume", "how much electricity did i use", "compare my usage", "last month usage",
                    "මගේ පරිභෝජනය", "පාවිච්චි කළ ඒකක", "මගේ යුනිට්",
                    "எனது நுகர்வு", "என் மின் நுகர்வு", "என் பயன்பாடு",
                    # Payments
                    "my payment", "payment history", "payment record", "my receipt", "last payment",
                    "මගේ ගෙවීම්", "අවසන් ගෙවීම", "ගෙවීම් වාර්තා",
                    "எனது கொடுப்பනவு", "கட்டண வரலாறு", "கடைசி கட்டணம்",
                    # Complaints & Tickets
                    "my complaint", "track my complaint", "status of my complaint", "my ticket",
                    "my breakdown", "complaint status", "ticket status",
                    "මගේ පැමිණිල්ල", "පැමිණිල්ලේ තත්ත්වය", "මගේ ටිකට්", "දෝෂ වාර්තාව",
                    "எனது புகார்", "புகார் நிலை", "என் புகார்",
                    # Account Details
                    "my account", "account details", "meter number", "registered name",
                    "මගේ ගිණුම", "ගිණුමේ විස්තර",
                    "எனது கணக்கு", "கணக்கு விவரம்"
                ]

                is_advice_or_saving = any(w in lower_msg for w in ["save", "saving", "reduce", "lower", "cut", "tips", "conserve", "ඉතිරි", "අඩු කර", "சேமிப்பு"]) and not any(p in lower_msg for p in ["balance", "outstanding", "due", "pay", "ශේෂය", "நிலுவை", "how much", "what is my bill", "check my bill"])

                is_personal = not is_advice_or_saving and (
                    any(term in lower_msg for term in personal_terms) or
                    ("bill" in lower_msg and any(w in lower_msg for w in ["my", "personal", "due", "owing", "pay"])) or
                    ("account" in lower_msg and any(w in lower_msg for w in ["my", "balance", "status", "detail", "info"])) or
                    ("complaint" in lower_msg and any(w in lower_msg for w in ["my", "track", "ticket", "status"])) or
                    ("consumption" in lower_msg and any(w in lower_msg for w in ["my", "last month", "history"]))
                )
                if is_personal:
                    action_required = "login"
            else:
                # Customer Mode Rich Card Detection
                if any(term in lower_msg for term in ["outstanding", "my bill", "balance", "pay", "බිල", "ශේෂය", "நிலුவை"]):
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
                    c_records = list(
                        db.consumption_records.find({"account_id": account_obj.get("id")})
                        .sort("id", 1)
                    )
                    records_list = [{"month": r["month"], "kwh": r["units_kwh"], "lkr": r["amount_lkr"]} for r in c_records]
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
                    comp = db.complaints.find_one({"account_id": account_obj.get("id")})
                    if comp:
                        rich_card = RichCardData(
                            type="complaint",
                            title=f"Complaint Tracking #{comp['ticket_id']}",
                            data={
                                "ticket_id": comp["ticket_id"],
                                "category": comp["category"],
                                "nature": comp["nature"],
                                "status": comp["status"],
                                "assigned_depot": comp.get("assigned_depot", "Area Engineer Depot"),
                                "estimated_completion": comp.get("estimated_completion", "Today by 5:00 PM"),
                                "logged_date": comp.get("logged_date", "")
                            }
                        )
                elif any(term in lower_msg for term in ["solar", "capacity", "transformer", "සූර්ය", "சூரிய"]):
                    tr = db.solar_transformers.find_one({"transformer_code": "TR-402"})
                    if tr:
                        rich_card = RichCardData(
                            type="solar",
                            title=f"Solar Feeder Capacity – {tr['transformer_code']}",
                            data={
                                "transformer_code": tr["transformer_code"],
                                "area": tr["area"],
                                "feeder_name": tr.get("feeder_name", "Feeder"),
                                "total_capacity_kva": float(tr.get("total_capacity_kva", 160.0)),
                                "used_capacity_kva": float(tr.get("used_capacity_kva", 80.0)),
                                "remaining_capacity_kw": float(tr.get("remaining_capacity_kw", 0.0)),
                                "status": tr.get("status", "")
                            }
                        )

            # 5. Generate Response (Gemini SDK or Controlled Multilingual Fallback)
            gemini_reply = None
            if self.gemini.is_active and action_required != "login":
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

            # 6. Save messages to MongoDB session history
            last_msg = db.chat_messages.find_one(sort=[("id", -1)])
            next_msg_id = (last_msg["id"] + 1) if last_msg and "id" in last_msg else 1

            user_rec = {
                "id": next_msg_id,
                "session_id": chat_session.get("id"),
                "sender": "user",
                "content": message,
                "language": language.value,
                "timestamp": "now"
            }
            bot_rec = {
                "id": next_msg_id + 1,
                "session_id": chat_session.get("id"),
                "sender": "assistant",
                "content": reply,
                "language": language.value,
                "timestamp": "now",
                "action_required": action_required,
                "sources": ",".join(sources)
            }
            db.chat_messages.insert_one(user_rec)
            db.chat_messages.insert_one(bot_rec)

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

        except Exception as e:
            print(f"Error in ChatbotEngine: {e}")
            return ChatResponse(
                reply="Ayubowan! I am your EDL Care Assistant. How may I assist you today with electricity tariffs or service queries?",
                mode=mode,
                scope=AccessScope.public_knowledge,
                language=language,
                is_mock=True,
                session_id=session_id or str(uuid.uuid4())
            )

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
            # Check for personal information inquiry
            personal_inquiry_terms = [
                "my bill", "outstanding", "balance", "how much do i owe", "due amount", "amount due",
                "pay my bill", "pay bill", "what is my bill", "my consumption", "my usage", "my kwh",
                "my payment", "payment history", "my receipt", "my complaint", "track my complaint",
                "my ticket", "my account", "මගේ බිල", "ශේෂය", "මගේ පරිභෝජනය", "මගේ පැමිණිල්ල", "මගේ ගිණුම",
                "நிலுவை", "என் பில்", "எனது கட்டணம்", "எனது நுகர்வு", "எனது புகார்", "எனது கணக்கு"
            ]
            is_advice = any(w in lower for w in ["save", "saving", "reduce", "lower", "cut", "tips", "conserve", "ඉතිරි", "අඩු කර", "சேமிப்பு"]) and not any(p in lower for p in ["balance", "outstanding", "due", "pay", "ශේෂය", "நிலுவை", "how much", "what is my bill", "check my bill"])

            is_personal_inquiry = not is_advice and (
                any(term in lower for term in personal_inquiry_terms) or
                ("bill" in lower and any(w in lower for w in ["my", "personal", "due", "owing", "pay"])) or
                ("consumption" in lower and "my" in lower) or
                ("complaint" in lower and any(w in lower for w in ["my", "track", "ticket", "status"])) or
                ("account" in lower and any(w in lower for w in ["my", "detail", "balance", "status"]))
            )

            if is_personal_inquiry:
                if language == Language.si:
                    return (
                        "🔒 පාරිභෝගික ප්‍රවිෂ්ටය අවශ්‍යයි: ඔබගේ පෞද්ගලිකත්වය සහ ගිණුම් ආරක්ෂාව තහවුරු කිරීම සඳහා, "
                        "පෞද්ගලික විදුලි බිල්පත්, පරිභෝජන ඉතිහාසය, ගෙවීම් වාර්තා සහ පැමිණිලි විස්තර බැලීමට "
                        "කරුණාකර ඔබගේ EDL Care ගිණුමට ප්‍රවිෂ්ට වන්න."
                    )
                elif language == Language.ta:
                    return (
                        "🔒 உள்நுழைவு தேவை: உங்கள் தனிப்பட்ட கணக்குத் தரவின் பாதுகாப்பைப் பேண, "
                        "மின்கட்டணங்கள், நுகர்வு வரலாறு, கொடுப்பனவுப் பதிவுகள் மற்றும் புகார்களின் விபரங்களைப் பார்வையிட "
                        "தயவுசெய்து உங்கள் EDL Care கணக்கில் உள்நுழையவும்."
                    )
                else:
                    return (
                        "🔒 Sign In / Login Required: To protect your privacy and personal account security, "
                        "individual electricity bills, consumption history, payment records, and active complaints "
                        "require an authenticated account. Please sign in to securely access your personal details."
                    )

            # 1. Electricity Tariffs & Billing Calculations
            if any(term in lower for term in ["tariff", "rate", "cost", "calculation", "ගාස්තු", "கட்டணம்"]):
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

            # 2. Electricity-Saving Recommendations
            if any(term in lower for term in ["saving", "save electricity", "conserve", "energy saving", "reduce bill", "tips", "ඉතිරි", "අඩු කර", "சேமிப்பு", "மின்சார சேமிப்பு"]):
                if language == Language.si:
                    return (
                        "විදුලිය ඉතිරි කර ගැනීමේ ප්‍රධාන උපදෙස්: "
                        "(1) සාමාන්‍ය බල්බ වෙනුවට බලශක්ති කාර්යක්ෂම LED බල්බ භාවිත කරන්න, "
                        "(2) වායුසමීකරණ යන්ත්‍ර (AC) 26°C උෂ්ණත්වයේ පවත්වා ගන්න, "
                        "(3) භාවිතයේ නැති උපකරණ ස්විචයෙන්ම ක්‍රියා විරහිත කරන්න (Standby power වැළැක්වීමට), "
                        "(4) ඉහළ විදුලි ධාරිතාවක් අවශ්‍ය රෙදි මැදීම හා වතුර මෝටර් ක්‍රියාත්මක කිරීම රාත්‍රී 6:30 ත් 10:30 ත් අතර උපරිම පැයවලින් බැහැරව සිදු කරන්න."
                    )
                elif language == Language.ta:
                    return (
                        "மின்சாரத்தை சேமிப்பதற்கான முக்கிய குறிப்புகள்: "
                        "(1) குறைந்த மின் நுகர்வு கொண்ட LED பல்புகளைப் பயன்படுத்துங்கள், "
                        "(2) ஏர் கண்டிஷனரை 26°C இல் சீராக வையுங்கள், "
                        "(3) பயன்படுத்தாத சாதனங்களின் சுவிட்சுகளை அணைத்து வையுங்கள், "
                        "(4) அதிக மின்சாரம் தேவைப்படும் வேலைகளை இரவு 6:30 முதல் 10:30 வரையிலான உச்ச நேரங்களைத் தவிர்த்துச் செய்யுங்கள்."
                    )
                else:
                    return (
                        "Energy-Saving Recommendations to Lower Your Bill: "
                        "(1) Switch to high-efficiency LED lighting to save up to 80% on lighting energy, "
                        "(2) Set air conditioner thermostats to 26°C with clean filters, "
                        "(3) Turn off appliances completely at the plug socket to eliminate phantom standby power, "
                        "(4) Shift high-wattage chores (ironing, pumping water, heavy laundry) outside peak hours (6:30 PM - 10:30 PM), "
                        "and (5) Keep refrigerator coils clean and door seals tight."
                    )

            # 3. Solar Installation and Net-Metering
            if any(term in lower for term in ["solar", "rooftop", "net-metering", "net metering", "net accounting", "net plus", "transformer capacity", "සූර්ය", "சூரிய"]):
                if language == Language.si:
                    return (
                        "EDL වහල මත සූර්ය පැනල පද්ධති සඳහා ප්‍රධාන ක්‍රම 3ක් සපයයි: "
                        "(1) Net-Metering (ඒකක හුවමාරුව), (2) Net-Accounting (අතිරික්ත ඒකක මිලදී ගැනීම), සහ (3) Net-Plus (උත්පාදනය කරන මුළු විදුලියම විකිණීම). "
                        "ජාලයේ වෝල්ටීයතා ස්ථායිතාව සුරැකීමට එක් බෙදාහැරීමේ ට්‍රාන්ස්ෆෝමරයකට 80% ක සූර්ය බලශක්ති සීමාවක් පවතී. "
                        "ඔබගේ ප්‍රදේශයේ උපපොළ කේතය (උදා: TR-402) මඟින් ධාරිතාව පරික්ෂා කළ හැක."
                    )
                elif language == Language.ta:
                    return (
                        "EDL கூரை சூரிய சக்தி அமைப்புகளுக்கு 3 முக்கிய திட்டங்களை வழங்குகிறது: "
                        "(1) Net-Metering (அலகு பரிமாற்றம்), (2) Net-Accounting (மிகை அலகுகளுக்கு பணம்), (3) Net-Plus (மொத்த உற்பத்திக்கும் கட்டணம்). "
                        "ஒவ்வொரு விநியோக மின்மாற்றியிலும் 80% சூரிய கொள்ளளவு வரம்பு உள்ளது. "
                        "Solar Feeder திரையில் மின்மாற்றி குறியீட்டை (எ.கா. TR-402) உள்ளிட்டு இணைக்கும் வசதியை நீங்கள் சரிபார்க்கலாம்."
                    )
                else:
                    return (
                        "EDL Rooftop Solar & Net-Metering Schemes: "
                        "We offer three interconnected schemes: (1) Net-Metering (unit credit rollover), "
                        "(2) Net-Accounting (export credits paid in LKR), and (3) Net-Plus (entire solar generation purchased at approved feed-in tariffs). "
                        "Each local distribution transformer has an 80% solar absorption cap to maintain grid voltage stability. "
                        "Use the Solar screen with your transformer code (e.g. TR-402) to check available capacity."
                    )

            # 4. General Power Outage Information
            if any(term in lower for term in ["outage", "power cut", "blackout", "breakdown", "interruption", "විදුලි කප්පාදුව", "විසන්ධි", "மின்தடை", "மின் வெட்டு"]):
                if language == Language.si:
                    return (
                        "විදුලි විසන්ධිවීම් පිළිබඳ තොරතුරු: "
                        "(1) සැලසුම්ගත නඩත්තු කිරීම් සහ හදිසි බිඳවැටීම් පිළිබඳ තොරතුරු මෙම යෙදුමේ Outages සිතියමෙන් බලාගත හැක. "
                        "(2) හදිසි බිඳවැටීමක් වාර්තා කිරීමට හෝ අනතුරුදායක විදුලි රැහැන් පිළිබඳ දැනුම් දීමට ආදර්ශන හදිසි ඇමතුම් අංකය 1987 (ශ්‍රී ලංකා උපයෝගිතා මාර්ගෝපදේශ මත පදනම්ව) අමතන්න; සැබෑ හදිසි අවස්ථාවකදී නිල ජාතික සේවාවන් අමතන්න. "
                        "(3) පෞද්ගලික විදුලි දෝෂයක් ලියාපදිංචි කිරීමට කරුණාකර ඔබගේ පාරිභෝගික ගිණුමට ප්‍රවිෂ්ට වන්න."
                    )
                elif language == Language.ta:
                    return (
                        "மின் தடை தகவல்: "
                        "(1) திட்டமிடப்பட்ட பராமரிப்பு மற்றும் அவசர மின் தடைகள் குறித்த விபரங்களை Outages வரைபடத்தில் காணலாம். "
                        "(2) திடீர் மின் தடை அல்லது அறுந்து விழுந்த கம்பிகளை அறிவிக்க மாதிரி அவசர உதவி எண் 1987 ஐ (இலங்கை பயன்பாட்டு வழிகாட்டல்களின் அடிப்படையில்) அழைக்கவும்; உண்மையான அவசரநிலைக்கு உத்தியோகபூர்வ தேசிய சேவைகளைத் தொடர்பு கொள்ளவும். "
                        "(3) தனிப்பட்ட மின் தடை புகாரை பதிவு செய்ய உங்கள் வாடிக்கையாளர் கணக்கில் உள்நுழையவும்."
                    )
                else:
                    return (
                        "General Power Outage Information: "
                        "(1) Check scheduled maintenance and emergency power interruptions via the Outages monitor in this app. "
                        "(2) To report sudden neighborhood blackouts or fallen wire hazards, contact demonstration helpline 1987 (modeled on Sri Lankan utility emergency lines; for real emergencies contact national emergency services). "
                        "(3) For individual breakdown tickets at your premises, please sign in to lodge a complaint."
                    )

            # 5. Electrical Safety Guidelines
            if any(term in lower for term in ["safety", "hazard", "shock", "trip switch", "elcb", "spark", "wire", "ආරක්ෂ", "பாதுகாப்பு"]):
                if language == Language.si:
                    return (
                        "මූලික විදුලි ආරක්ෂණ උපදෙස්: "
                        "(1) ඔබගේ නිවසේ ට්‍රිප් ස්විචය (ELCB) මසකට වරක් 'Test' බොත්තම ඔබා පරීක්ෂා කරන්න, "
                        "(2) තෙතමනය සහිත දෑතින් කිසිවිටෙක විදුලි ස්විච හෝ ප්ලග් ස්පර්ශ නොකරන්න, "
                        "(3) උඩින් දිවෙන විදුලි රැහැන් අසලින් අවම වශයෙන් මීටර් 3ක පරතරයක් පවත්වා ගන්න, "
                        "(4) බිම වැටී ඇති විදුලි රැහැන් හෝ පුපුරු ගසන ට්‍රාන්ස්ෆෝමර් දුටු සැනින් ආදර්ශන හදිසි අංක 1987 වෙත දැනුම් දෙන්න (මෘදුකාංග ඇගයීම සඳහා වූ ආදර්ශනයකි)."
                    )
                elif language == Language.ta:
                    return (
                        "முக்கிய மின் பாதுகாப்பு வழிகாட்டல்கள்: "
                        "(1) உங்கள் வீட்டின் ELCB ட்ரிப் சுவிட்சை மாதத்திற்கு ஒரு முறை சோதனை பொத்தானை அழுத்தி சரிபார்க்கவும், "
                        "(2) ஈரமான கைகளால் மின் சுவிட்சுகளை ஒருபோதும் தொடாதீர்கள், "
                        "(3) தலைக்கு மேலான மின் கம்பிகளிலிருந்து குறைந்தது 3 மீட்டர் இடைவெளியை பராமரிக்கவும், "
                        "(4) அறுந்து விழுந்த கம்பிகள் அல்லது தீப்பொறி பறக்கும் மின்மாற்றிகளைக் கண்டால் மாதிரி அவசர எண் 1987 ஐ அழைக்கவும் (மென்பொருள் மதிப்பீட்டுக்கான மாதிரி)."
                    )
                else:
                    return (
                        "Essential Electrical Safety Guidelines: "
                        "(1) Test your Earth Leakage Circuit Breaker (ELCB / Trip Switch) monthly using the test push-button, "
                        "(2) Never touch electric switches, plugs, or appliances with wet hands or bare feet on damp floors, "
                        "(3) Maintain at least 3 meters clearance from overhead service cables when pruning trees or doing roof work, "
                        "and (4) Immediately notify demonstration helpline 1987 if you observe fallen power wires or sparking distribution equipment (modeled on Sri Lankan utility emergency lines)."
                    )

            # 6. General EDL Service Information & Charter
            if any(term in lower for term in ["service", "customer center", "depot", "contact", "office", "charter", "hours", "සේවා", "කාර්යාල", "சேவை"]):
                if language == Language.si:
                    return (
                        "EDL පාරිභෝගික සේවා තොරතුරු: "
                        "ප්‍රාදේශීය ඉංජිනේරු පාරිභෝගික සේවා මධ්‍යස්ථාන සතියේ දිනවල පෙ.ව. 8:30 සිට ප.ව. 4:15 දක්වා විවෘතව පවතී. "
                        "ආදර්ශන හදිසි උපකාරක ඇමතුම් මධ්‍යස්ථානය (1987 - මෘදුකාංග ඇගයීම සඳහා වූ ආදර්ශනයකි) පැය 24 පුරා ක්‍රියාත්මක වේ. "
                        "විදුලි බිල්පත් ගෙවීම් LankaQR, අන්තර්ජාල බැංකු, තැපැල් කාර්යාල හෝ EDL වෙබ් අඩවිය හරහා පහසුවෙන් සිදු කළ හැක."
                    )
                elif language == Language.ta:
                    return (
                        "EDL வாடிக்கையாளர் சேவைத் தகவல்: "
                        "பிராந்திய பொறியாளர் அலுவலகங்கள் வார நாட்களில் காலை 8:30 முதல் மாலை 4:15 வரை செயல்படும். "
                        "மாதிரி அவசர உதவி எண் (1987 - மென்பொருள் மதிப்பீட்டுக்கான மாதிரி) 24 மணி நேரமும் செயல்படுகிறது. "
                        "LankaQR, இணைய வங்கி அல்லது தபால் நிலையங்கள் மூலம் நீங்கள் எளிதாக மின்கட்டணங்களைச் செலுத்தலாம்."
                    )
                else:
                    return (
                        "EDL Customer Service Information: "
                        "Regional Area Engineer Consumer Service Centers operate on weekdays from 8:30 AM to 4:15 PM. "
                        "Demonstration helpline (1987, modeled on Sri Lankan utility helplines for software evaluation) operates 24 hours a day, 7 days a week. "
                        "Bills can be paid through LankaQR, commercial banks, post offices, and the EDL customer portal."
                    )

            # Default Inviting Public Assistant Message
            if language == Language.si:
                return (
                    "ආයුබෝවන්! මම ඔබගේ EDL Care සහයකයා වෙමි. "
                    "විදුලි ගාස්තු, විදුලිය ඉතිරි කිරීමේ ක්‍රම, සූර්ය බලශක්ති නීති, විදුලි විසන්ධිවීම් සහ ආරක්ෂණ උපදෙස් පිළිබඳව මගෙන් ඕනෑම දෙයක් විමසිය හැක. "
                    "පෞද්ගලික විදුලි බිල්පත් හෝ පැමිණිලි බැලීමට කරුණාකර ඔබගේ පාරිභෝගික ගිණුමට ප්‍රවිෂ්ට වන්න."
                )
            elif language == Language.ta:
                return (
                    "வணக்கம்! நான் உங்கள் EDL Care உதவியாளர். "
                    "மின் கட்டணங்கள், மின் சேமிப்பு ஆலோசனைகள், சூரிய சக்தி திட்டங்கள், மின் தடை தகவல்கள் மற்றும் பாதுகாப்பு வழிகாட்டல்கள் குறித்து நீங்கள் கேட்கலாம். "
                    "தனிப்பட்ட மின்கட்டண விபரங்களுக்கு உங்கள் வாடிக்கையாளர் கணக்கில் உள்நுழையவும்."
                )
            else:
                return (
                    "Ayubowan / Vanakkam! I am your EDL Care Assistant. "
                    "You can ask me about electricity tariffs, energy-saving tips, rooftop solar net-metering, "
                    "power outages, or electrical safety guidelines. "
                    "If you would like to view personal bills or track complaints, simply sign in with your customer account."
                )

        else:
            # Customer Mode
            if any(term in lower for term in ["outstanding", "my bill", "balance", "මගේ බිල", "ශේෂය", "நிலுவை"]):
                bal = customer.get("outstanding_balance", 4850.0) if customer else 4850.0
                acc = customer.get("account_number", "0412345678") if customer else "0412345678"
                due = customer.get("due_date", "2026-11-25") if customer else "2026-11-25"
                if language == Language.si:
                    return f"ඔබගේ ආදර්ශන ගිණුමේ (#{acc} – {customer.get('nickname', 'නිවස')}) ඔක්තෝබර් සඳහා ගෙවිය යුතු ශේෂය රු. {bal:,.2f} කි. ගෙවිය යුතු අවසන් දිනය {due} වේ. *(මෙය මෘදුකාංග ඇගයීම සඳහා වූ ආදර්ශන දත්තයකි; සැබෑ බිල්පතක් නොවේ).* ඔබට 'Pay Now' බොත්තම මඟින් ආදර්ශන ගෙවීම් පරීක්ෂා කළ හැක."
                elif language == Language.ta:
                    return f"உங்கள் மாதிரி கணக்கில் (#{acc} – {customer.get('nickname', 'வீடு')}) செலுத்த வேண்டிய நிலுவைத் தொகை ரூ. {bal:,.2f} ஆகும். இறுதித் தேதி {due}. *(இது மென்பொருள் மதிப்பீட்டுக்கான மாதிரி தரவாகும்; சட்டபூர்வ ரசீது அல்ல).* நீங்கள் Pay Now மூலம் மாதிரி கட்டணத்தை செலுத்தலாம்."
                else:
                    return f"Your demonstration account (#{acc} – {customer.get('nickname', 'Home')}) has a simulated outstanding balance of Rs. {bal:,.2f} for October 2026. Payment is due on {due}. *(Demonstration figure modeled on Sri Lankan utility guidelines for software evaluation; not a legally binding utility invoice.)* You can test simulated payment via the Pay Now card below."

            if any(term in lower for term in ["consumption", "usage", "kwh", "පරිභෝජන", "நுகர்வு"]):
                kwh = customer.get("monthly_consumption_kwh", 142) if customer else 142
                avg = customer.get("monthly_average_kwh", 154) if customer else 154
                return f"In October 2026, your household consumed {kwh} kWh (down 11.2% from September). Your 6-month average is {avg} kWh. *(Simulated demonstration consumption record for software evaluation.)*"

            if any(term in lower for term in ["complaint", "track", "ticket", "දෝෂ", "පැමිණිලි", "புகார்"]):
                return "Your demonstration Breakdown Complaint #REF-2026-9841 ('Service wire sparking near roof eaves') logged on 12 Nov 2026 is currently IN PROGRESS. Assigned Depot: Colombo South Area Engineer Office. Estimated completion: Today by 4:00 PM. *(Demonstration ticket data for software evaluation.)*"

            if any(term in lower for term in ["solar", "capacity", "සූර්ය", "சூரிய"]):
                return "Your connected distribution transformer (TR-402, Nugegoda / Feeder F-04) has 42 kW of remaining rooftop solar absorption capacity. Feeder capacity is healthy and open for Net-Metering applications. *(Demonstration grid data modeled for software evaluation.)*"

            return (
                f"Hello {customer.get('customer_name', 'Customer')}! Connected to Demonstration Account #{customer.get('account_number', '0412345678')}. "
                f"*(Demonstration profile for software evaluation)* How may I assist you today with your simulated October bill (Rs. {customer.get('outstanding_balance', 4850):,.2f}), consumption trends, or fault reporting?"
            )
