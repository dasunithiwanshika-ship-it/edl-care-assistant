"""
Google Gemini AI Service for EDL Care Assistant
Utilizes the current Google Gen AI SDK (`google.genai`) with multilingual prompting and controlled fallback.
"""

import os
from pathlib import Path
from typing import Optional, List, Dict, Any

try:
    from dotenv import load_dotenv
    # Load .env from backend directory or project root
    backend_env = Path(__file__).resolve().parent.parent / ".env"
    if backend_env.exists():
        load_dotenv(backend_env)
    else:
        load_dotenv()
except ImportError:
    pass

try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.client = None
        self.last_used_model = None
        if self.api_key and GENAI_AVAILABLE:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Gemini client initialization warning: {e}")
                self.client = None

    @property
    def is_active(self) -> bool:
        return self.client is not None

    def generate_chat_reply(
        self,
        message: str,
        system_instruction: str,
        rag_context: str,
        language: str = "en",
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Optional[str]:
        """
        Sends the grounded conversation to Google Gemini 2.5/1.5 model.
        Returns generated text or None if API is unavailable or fails.
        """
        if not self.client:
            return None

        try:
            # Construct grounded context with strict anti-hallucination guard
            if rag_context and rag_context.strip():
                rag_section = f"### OFFICIAL EDL RETRIEVED KNOWLEDGE ###\n{rag_context}\n\n"
            else:
                rag_section = (
                    "### OFFICIAL EDL RETRIEVED KNOWLEDGE ###\n"
                    "[No matching official documentation found for this question]\n"
                    "CRITICAL ANTI-HALLUCINATION RULE: If the user asks for specific tariffs, rates, rules, or contact numbers not present in official knowledge, do NOT invent or guess numbers. State clearly that official EDL documentation for this is not available or direct them to the demonstration helpline (1987, modeled on Sri Lankan utility emergency lines) or advise contacting national emergency services in genuine real-life emergencies.\n\n"
                )

            grounded_prompt = (
                f"### SYSTEM INSTRUCTIONS ###\n{system_instruction}\n\n"
                f"{rag_section}"
            )

            if conversation_history:
                grounded_prompt += "### RECENT CONVERSATION HISTORY ###\n"
                for turn in conversation_history[-4:]:
                    grounded_prompt += f"{turn.get('sender', 'user').upper()}: {turn.get('content', '')}\n"
                grounded_prompt += "\n"

            grounded_prompt += (
                f"### CURRENT USER MESSAGE ({language.upper()}) ###\n{message}\n\n"
                f"Respond accurately in the specified language ({language.upper()}). "
                "Base answers strictly on the authorized customer profile and official knowledge above. "
                "Do NOT fabricate non-existent numbers or policies."
            )

            # Call Gemini (try primary active models)
            preferred_model = os.getenv("GEMINI_MODEL", "models/gemini-3.6-flash")
            candidate_models = []
            for m in [preferred_model, "models/gemini-3.6-flash", "models/gemini-3.5-flash", "models/gemini-3.1-flash-lite"]:
                if m not in candidate_models:
                    candidate_models.append(m)

            for mod in candidate_models:
                try:
                    response = self.client.models.generate_content(
                        model=mod,
                        contents=grounded_prompt,
                    )
                    if response and response.text:
                        self.last_used_model = mod
                        print(f"[GeminiService] Chat generation succeeded using model: {mod}")
                        return response.text.strip()
                except Exception as model_err:
                    print(f"[GeminiService] Model {mod} attempt failed: {model_err}")
                    continue
        except Exception as e:
            print(f"Gemini generation error (falling back to deterministic mock): {e}")
            return None

        return None

# Singleton instance
gemini_service = GeminiService()
