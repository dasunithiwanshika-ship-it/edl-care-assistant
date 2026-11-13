"""
Shared AI Chatbot Engine for Option C (Guest + Login-based Support)
Integrates Google Gemini, RAG Knowledge Retrieval, and Mock Customer Services.
"""

import os
from typing import Dict, Any, Tuple, Optional
from backend.app.models import ChatMode, Language, AccessScope, ChatResponse
from backend.mock_data.customers import get_customer_account
from backend.rag.knowledge_base import retrieve_knowledge
from backend.chatbot.prompts import GUEST_SYSTEM_PROMPT, build_customer_prompt

# Try importing Google Gemini SDK
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

class ChatbotEngine:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        if self.api_key and GEMINI_AVAILABLE:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-1.5-flash")
        else:
            self.model = None

    def process_message(
        self,
        message: str,
        mode: ChatMode,
        language: Language,
        account_number: Optional[str] = None
    ) -> ChatResponse:
        """
        Processes chat message according to Option C access control:
        - If mode == guest: accesses only public RAG documents; rejects personal queries.
        - If mode == customer: injects verified customer profile + RAG documents.
        """
        # 1. Retrieve RAG documentation
        rag_docs = retrieve_knowledge(message, top_k=2)
        rag_context = "\n\n".join([f"[{d['title']}]: {d['content']}" for d in rag_docs])
        sources = [d["title"] for d in rag_docs]

        # 2. Determine Scope & System Prompt
        customer_data = None
        action_required = None

        if mode == ChatMode.customer:
            # Authenticated Customer Scope
            account_id = account_number or "0412345678"
            customer_data = get_customer_account(account_id)
            if not customer_data:
                customer_data = get_customer_account("0412345678")
            
            system_prompt = build_customer_prompt(customer_data)
            scope = AccessScope.authenticated_customer
        else:
            # Guest Scope
            system_prompt = GUEST_SYSTEM_PROMPT
            scope = AccessScope.public_knowledge

        # 3. Check for specific action requirements (Login gate or payment)
        lower_msg = message.lower()
        if mode == ChatMode.guest:
            if any(term in lower_msg for term in ["my bill", "outstanding", "balance", "මගේ බිල", "ශේෂය", "நிலுவை"]):
                action_required = "login"
        elif mode == ChatMode.customer:
            if any(term in lower_msg for term in ["outstanding", "my bill", "balance", "pay"]):
                action_required = "pay"
            elif "complaint" in lower_msg or "පැමිණිලි" in lower_msg or "புகார்" in lower_msg:
                action_required = "complaint"

        # 4. Generate AI response (using Gemini if configured, or deterministic smart mock)
        reply = self._generate_response(message, system_prompt, rag_context, mode, language, customer_data)

        return ChatResponse(
            reply=reply,
            mode=mode,
            scope=scope,
            language=language,
            is_mock=(self.model is None),
            action_required=action_required,
            sources=sources,
            account_ref=customer_data.get("account_number") if customer_data else None,
        )

    def _generate_response(
        self,
        message: str,
        system_prompt: str,
        rag_context: str,
        mode: ChatMode,
        language: Language,
        customer: Optional[Dict[str, Any]]
    ) -> str:
        # If Gemini is live and configured
        if self.model and self.api_key:
            try:
                full_prompt = (
                    f"{system_prompt}\n\n"
                    f"RELEVANT PUBLIC KNOWLEDGE BASE:\n{rag_context}\n\n"
                    f"USER MESSAGE ({language.value.upper()}): {message}\n\n"
                    f"ASSISTANT REPLY ({language.value.upper()}):"
                )
                response = self.model.generate_content(full_prompt)
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                pass  # Fall back to high-fidelity mock below

        # High-Fidelity Mock Response generator reflecting Option C
        lower = message.lower()

        if mode == ChatMode.guest:
            if any(term in lower for term in ["my bill", "outstanding", "balance", "මගේ බිල", "ශේෂය", "நிலுவை"]):
                if language == Language.si:
                    return (
                        "🔒 ප්‍රවිෂ්ට වීම අවශ්‍යයි: ඔබ දැනට අමුත්තන්ගේ මාදිලියේ (Guest Mode) සිටී. "
                        "පෞද්ගලික මූල්‍ය දත්ත ආරක්ෂා කිරීම සඳහා බිල්පත් ශේෂයන් දැකගත හැක්කේ ප්‍රවිෂ්ට වූ පාරිභෝගිකයින්ට පමණි. "
                        "කරුණාකර ඔබගේ EDL Care ගිණුමට ප්‍රවිෂ්ට වන්න."
                    )
                elif language == Language.ta:
                    return (
                        "🔒 உள்நுழைவு தேவை: நீங்கள் தற்போது விருந்தினர் பயன்முறையில் (Guest Mode) உள்ளீர்கள். "
                        "தனிப்பட்ட நிதித் தரவைப் பாதுகாக்க, பதிவுசெய்த வாடிக்கையாளர்களுக்கு மட்டுமே கட்டண விவரங்கள் காண்பிக்கப்படும். "
                        "கணக்கு #0412345678 ஐப் பார்க்க தயவுசெய்து உள்நுழையவும்."
                    )
                else:
                    return (
                        "🔒 Customer Login Required: In Guest Mode, individual bill records and personal balances "
                        "are protected. Please sign in to your EDL Care account to view your outstanding balance, "
                        "payment history, and active breakdown complaints."
                    )

            if any(term in lower for term in ["understand", "bill", "බිල", "கட்டணம்"]):
                if language == Language.si:
                    return (
                        "විදුලි බිල්පත් ගණනය කිරීම, ඒකක භාවිතය සහ අදාළ ගාස්තු ක්‍රම තේරුම් ගැනීමට මට උදව් කළ හැක. "
                        "ශ්‍රී ලංකාවේ ගෘහස්ථ බිල්පත (1) ඒකක අනුව බලශක්ති ගාස්තුව, (2) ස්ථාවර සේවා ගාස්තුව සහ (3) ඉන්ධන ගැලපුම් ගාස්තුවෙන් සමන්විත වේ. "
                        "ආදර්ශන බිල්පතක් පරීක්ෂා කිරීමට කැමතිද?"
                    )
                elif language == Language.ta:
                    return (
                        "மின் கட்டணக் கணக்கீடு, நுகர்வு அலகுகள் மற்றும் பொருந்தக்கூடிய கட்டண முறைகளைப் புரிந்துகொள்ள உதவ முடியும். "
                        "இலங்கையில் உள்நாட்டு கட்டணங்கள் (1) அலகுக்கான மின் கட்டணம், (2) நிலையான சேவைக் கட்டணம் மற்றும் (3) எரிபொருள் சரிசெய்தல் கட்டணம் ஆகியவற்றைக் கொண்டுள்ளது. "
                        "மாதிரி கட்டணத்தைப் பார்க்க விரும்புகிறீர்களா?"
                    )
                else:
                    return (
                        "I can help you understand electricity billing, consumption units and applicable tariff structures. "
                        "In Sri Lanka, domestic bills consist of (1) Block-based energy charges per kWh, (2) Fixed service charges, "
                        "and (3) Applicable fuel adjustment levy. Would you like to explore a sample bill breakdown?"
                    )

            if any(term in lower for term in ["safety", "ආරක්ෂ", "பாதுகாப்பு"]):
                return (
                    "Essential electrical safety tips: (1) Test your Earth Leakage Circuit Breaker (ELCB/Trip Switch) monthly, "
                    "(2) Never touch wet switches or sockets, (3) Maintain 3 meters clearance from overhead lines, "
                    "and (4) Immediately dial 1987 if you observe fallen wires or sparking transformers."
                )

            # Default guest response
            return (
                "Ayubowan / Vanakkam! As EDL Care Assistant in Guest Mode, I can provide information on domestic tariffs, "
                "safety precautions, planned maintenance schedules, and solar interconnection procedures. Sign in anytime to check personal bills."
            )

        else:
            # Customer mode responses
            if any(term in lower for term in ["outstanding", "my bill", "balance", "මගේ බිල", "ශේෂය", "நிலுவை"]):
                bal = customer.get("outstanding_balance", 4850.0) if customer else 4850.0
                acc = customer.get("account_number", "0412345678") if customer else "0412345678"
                if language == Language.si:
                    return f"ඔබගේ ආදර්ශන ගිණුමේ (#{acc} – නිවස) ඔක්තෝබර් 2026 සඳහා ගෙවිය යුතු ශේෂය රු. {bal:,.2f} කි. ගෙවිය යුතු අවසන් දිනය 2026 නොවැම්බර් 25 වේ."
                elif language == Language.ta:
                    return f"உங்கள் டெமோ கணக்கில் (#{acc} – வீடு) அக்டோபர் 2026க்கான நிலுவைத் தொகை ரூ. {bal:,.2f} ஆகும். செலுத்த வேண்டிய இறுதி தேதி 25 நவம்பர் 2026."
                else:
                    return f"Your demo account (#{acc} – Home) has an outstanding balance of Rs. {bal:,.2f} for October 2026. Payment is due on 25 Nov 2026."

            if any(term in lower for term in ["consumption", "usage", "kwh", "පරිභෝජන", "நுகர்வு"]):
                kwh = customer.get("monthly_consumption_kwh", 142) if customer else 142
                avg = customer.get("monthly_average_kwh", 154) if customer else 154
                return f"In October 2026, your household consumed {kwh} kWh (Down 11.2% from September). Your 6-month average is {avg} kWh, keeping you within the standard domestic efficiency bracket."

            if any(term in lower for term in ["complaint", "track", "දෝෂ", "புகார்"]):
                return "Complaint #REF-2026-9841 ('Service wire sparking near roof eaves') logged on 12 Nov 2026 is currently IN PROGRESS. Assigned Depot: Colombo South Area Engineer Office. Estimated completion: Today by 4:00 PM."

            if any(term in lower for term in ["solar", "capacity", "සූර්ය", "சூரிய"]):
                return "Your connected distribution transformer (TR-402, Nugegoda / Feeder F-04) has 42 kW of remaining rooftop solar absorption capacity. You can proceed with a Net-Metering or Net-Plus grid application."

            return (
                f"Hello {customer.get('customer_name', 'Dasuni')}! Connected to Account #{customer.get('account_number', '0412345678')}. "
                f"I am ready to help with your October electricity bill (Rs. 4,850.00), your consumption trends, or breakdown tracking."
            )
