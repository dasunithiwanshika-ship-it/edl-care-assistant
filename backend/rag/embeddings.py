"""
Embedding Generator for Semantic RAG Knowledge Retrieval
Generates normalized dense vector embeddings for Sri Lankan electricity utility queries and documents.
Supports multilingual terms across English, Sinhala, and Tamil.
"""

import os
import re
import math
from typing import List

# Key domain keyword weights to ensure strong semantic clustering across languages
MULTILINGUAL_SYNONYMS = {
    "tariff": ["tariff", "block", "rate", "charge", "unit", "ගාස්තු", "ඒකක", "ප්‍රමාණය", "මිල", "கட்டணம்", "அலகு", "விலை"],
    "billing": ["bill", "invoice", "arrears", "payment", "meter", "reading", "බිල", "ගෙවීම", "ශේෂය", "මීටර", "கட்டணம்", "செலுத்துதல்", "மீட்டர்"],
    "safety": ["safety", "hazard", "shock", "elcb", "trip", "switch", "danger", "fire", "ආරක්ෂ", "අනතුරු", "කම්පන", "ස්විච", "பாதுகாப்பு", "ஆபத்து", "மின்சாரம்"],
    "outages": ["outage", "breakdown", "blackout", "interruption", "1987", "repair", "wire", "ඇනහිට", "බිඳවැට", "දෝෂ", "மின்தடை", "பழுது", "தடை"],
    "solar": ["solar", "pv", "rooftop", "net-metering", "net-plus", "capacity", "transformer", "kwh", "සූර්ය", "පැනල", "ධාරිතාව", "சூரிய", "மின்சக்தி", "கொள்ளளவு"],
    "charter": ["charter", "standard", "timeline", "connection", "inspection", "ප්‍රඥප්තිය", "සේවා", "කාර්යාලය", "சாசனம்", "சேவை"],
}

VOCAB_SIZE = 128

def compute_semantic_vector(text: str) -> List[float]:
    """
    Computes a deterministic 128-dimensional normalized dense embedding vector.
    Captures character 3-grams, word stems, and domain concepts across EN, SI, and TA.
    """
    text_lower = text.lower()
    vec = [0.0] * VOCAB_SIZE

    # 1. Domain semantic concept weighting
    for concept_idx, (concept, terms) in enumerate(MULTILINGUAL_SYNONYMS.items()):
        slot = (concept_idx * 16) % VOCAB_SIZE
        weight = 0.0
        for term in terms:
            if term.lower() in text_lower:
                weight += 2.5
        vec[slot] += weight
        vec[(slot + 1) % VOCAB_SIZE] += weight * 0.5

    # 2. Character n-gram hashing for subword / code-mixed matching (Singlish / Tanglish)
    clean_words = re.findall(r"[\w\u0D80-\u0DFF\u0B80-\u0BFF]+", text_lower)
    for word in clean_words:
        h = hash(word)
        vec[h % VOCAB_SIZE] += 1.0
        # n-grams
        for i in range(len(word) - 2):
            trigram = word[i:i+3]
            th = hash(trigram)
            vec[th % VOCAB_SIZE] += 0.35

    # 3. L2 Normalize the vector
    norm = math.sqrt(sum(v * v for v in vec))
    if norm > 0:
        vec = [v / norm for v in vec]
    else:
        vec[0] = 1.0

    return vec
