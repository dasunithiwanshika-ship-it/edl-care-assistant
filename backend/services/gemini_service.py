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
            # Construct grounded context
            grounded_prompt = (
                f"### SYSTEM INSTRUCTIONS ###\n{system_instruction}\n\n"
                f"### OFFICIAL EDL RETRIEVED KNOWLEDGE ###\n{rag_context}\n\n"
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

            # Call Gemini
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=grounded_prompt,
            )

            if response and response.text:
                return response.text.strip()
        except Exception as e:
            print(f"Gemini generation error (falling back to deterministic mock): {e}")
            return None

        return None

# Singleton instance
gemini_service = GeminiService()
