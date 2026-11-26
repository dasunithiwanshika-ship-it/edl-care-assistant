"""
Embedding Generator for Semantic RAG Knowledge Retrieval
Generates 3072-dimensional dense neural embeddings for Sri Lankan electricity utility documents and queries.
Primary: Google Gemini Neural Embedding (models/gemini-embedding-001).
Strict Vector Separation: If neural embedding generation fails, returns None.
Fallback vectors are NEVER returned as neural vectors, preventing incompatible vector queries.
"""

import os
import re
import math
from typing import List, Optional
from pathlib import Path

# Load environment
try:
    from dotenv import load_dotenv
    backend_env = Path(__file__).resolve().parent.parent / ".env"
    if backend_env.exists():
        load_dotenv(backend_env)
    else:
        load_dotenv()
except ImportError:
    pass

try:
    from google import genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

EMBEDDING_DIM = 3072
NEURAL_MODEL = "models/gemini-embedding-001"

MULTILINGUAL_SYNONYMS = {
    "tariff": ["tariff", "block", "rate", "charge", "unit", "ගාස්තු", "ඒකක", "ප්‍රමාණය", "මිල", "கட்டணம்", "அலகு", "விலை"],
    "billing": ["bill", "invoice", "arrears", "payment", "meter", "reading", "බිල", "ගෙවීම", "ශේෂය", "මීටර", "கட்டணம்", "செலுத்துதல்", "மீட்டர்"],
    "safety": ["safety", "hazard", "shock", "elcb", "trip", "switch", "danger", "fire", "ආරක්ෂ", "අනතුරු", "කම්පන", "ස්විච", "பாதுகாப்பு", "ஆபத்து", "மின்சாரம்"],
    "outages": ["outage", "breakdown", "blackout", "interruption", "1987", "repair", "wire", "ඇනහිට", "බිඳවැට", "දෝෂ", "மின்தடை", "பழுது", "தடை"],
    "solar": ["solar", "pv", "rooftop", "net-metering", "net-plus", "capacity", "transformer", "kwh", "සූර්ය", "පැනල", "ධාරිතාව", "சூரிய", "மின்சக்தி", "கொள்ளளவு"],
    "charter": ["charter", "standard", "timeline", "connection", "inspection", "ප්‍රඥප්තිය", "සේවා", "කාර්යාලය", "சாசனம்", "சேவை"],
}


def _compute_fallback_vector(text: str) -> List[float]:
    """
    Computes a deterministic 3072-dimensional normalized hashing vector.
    ISOLATED UTILITY ONLY: Kept strictly separate from ChromaDB collection operations.
    """
    text_lower = text.lower()
    vec = [0.0] * EMBEDDING_DIM

    # 1. Concept keyword weights
    for concept_idx, (concept, terms) in enumerate(MULTILINGUAL_SYNONYMS.items()):
        slot = (concept_idx * 256) % EMBEDDING_DIM
        weight = 0.0
        for term in terms:
            if term.lower() in text_lower:
                weight += 4.0
        vec[slot] += weight
        vec[(slot + 1) % EMBEDDING_DIM] += weight * 0.75
        vec[(slot + 2) % EMBEDDING_DIM] += weight * 0.5

    # 2. Subword 3-gram hashing
    clean_words = re.findall(r"[\w\u0D80-\u0DFF\u0B80-\u0BFF]+", text_lower)
    for word in clean_words:
        h = abs(hash(word))
        vec[h % EMBEDDING_DIM] += 1.0
        for i in range(len(word) - 2):
            trigram = word[i:i+3]
            th = abs(hash(trigram))
            vec[th % EMBEDDING_DIM] += 0.35

    # 3. L2 Normalize
    norm = math.sqrt(sum(v * v for v in vec))
    if norm > 0:
        vec = [v / norm for v in vec]
    else:
        vec[0] = 1.0

    return vec


_genai_client = None

def _get_genai_client():
    global _genai_client
    if _genai_client is None and GENAI_AVAILABLE:
        api_key = os.getenv("GEMINI_API_KEY", "")
        if api_key:
            try:
                _genai_client = genai.Client(api_key=api_key)
            except Exception:
                _genai_client = None
    return _genai_client


def compute_semantic_vector(text: str) -> Optional[List[float]]:
    """
    Computes a 3072-dimensional dense neural embedding vector using Google Gemini.
    CRITICAL SAFETY RULE: If Gemini API fails, returns None.
    NEVER substitutes fallback hash vectors into neural collections.
    """
    client = _get_genai_client()
    if client is not None:
        try:
            res = client.models.embed_content(
                model=NEURAL_MODEL,
                contents=text
            )
            if res and res.embeddings and len(res.embeddings) > 0:
                values = list(res.embeddings[0].values)
                if len(values) == EMBEDDING_DIM:
                    return values
        except Exception as e:
            print(f"[Embeddings] Gemini embedding generation failed: {e}")
            return None

    return None


def compute_batch_vectors(texts: List[str]) -> Optional[List[List[float]]]:
    """
    Computes 3072-dimensional embeddings for a batch of texts via Gemini API.
    Returns None if embedding API is unreachable to prevent corrupting ChromaDB collections.
    """
    client = _get_genai_client()
    if client is not None:
        try:
            res = client.models.embed_content(
                model=NEURAL_MODEL,
                contents=texts
            )
            if res and res.embeddings and len(res.embeddings) == len(texts):
                vectors = []
                for e in res.embeddings:
                    vals = list(e.values)
                    if len(vals) == EMBEDDING_DIM:
                        vectors.append(vals)
                    else:
                        break
                if len(vectors) == len(texts):
                    return vectors
        except Exception as e:
            print(f"[Embeddings] Gemini batch embedding failed: {e}")
            return None

    return None
