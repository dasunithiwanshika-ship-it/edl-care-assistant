"""
Unit & Integration Tests for RAG Knowledge Ingestion, Semantic Retrieval, and Anti-Hallucination Guard.
"""

import pytest
from backend.rag.retrieval import retrieve_knowledge
from backend.rag.ingestion import load_and_chunk_documents
from backend.chatbot.engine import ChatbotEngine
from backend.app.schemas import ChatMode, Language
from backend.app.mongo_db import get_mongo_db


def test_knowledge_base_ingestion():
    """Verifies that official documents (.txt and .pdf) are ingested and chunked."""
    chunks = load_and_chunk_documents()
    assert len(chunks) >= 5
    # Verify metadata fields are preserved
    for c in chunks:
        assert "chunk_id" in c
        assert "document_name" in c
        assert "title" in c
        assert "category" in c
        assert len(c["content"]) > 20


def test_relevant_query_retrieval_english():
    """Verifies that tariff inquiry accurately retrieves official tariff document."""
    results = retrieve_knowledge("What is the electricity tariff for domestic blocks under 60 units?", top_k=2)
    assert len(results) > 0
    top_doc = results[0]
    assert "tariff" in top_doc["document_name"].lower() or "tariff" in top_doc["title"].lower()
    assert top_doc["relevance_score"] >= 0.50
    assert "content" in top_doc


def test_safety_inquiry_retrieval():
    """Verifies that electrical hazard inquiry retrieves safety standards document."""
    results = retrieve_knowledge("A wire has broken and fallen on the road, what is the emergency procedure?", top_k=2)
    assert len(results) > 0
    # Must retrieve safety or breakdown documentation
    doc_names = [d["document_name"].lower() for d in results]
    assert any("safety" in d or "breakdown" in d for d in doc_names)


def test_sinhala_multilingual_retrieval():
    """Verifies that Sinhala query accurately retrieves domestic tariff document."""
    results = retrieve_knowledge("ගෘහස්ථ විදුලි ගාස්තු ක්‍රමය සහ ඒකක මිල කොපමණද?", top_k=2)
    assert len(results) > 0
    assert any("tariff" in d["document_name"].lower() for d in results)


def test_tamil_multilingual_retrieval():
    """Verifies that Tamil query accurately retrieves domestic tariff document."""
    results = retrieve_knowledge("வீட்டு மின்சார கட்டணம் மற்றும் அலகு விகிதம் என்ன?", top_k=2)
    assert len(results) > 0
    assert any("tariff" in d["document_name"].lower() for d in results)


def test_irrelevant_query_filtered_out():
    """Verifies that questions with no supporting documents are filtered below threshold."""
    results = retrieve_knowledge("How do I bake a chocolate chip cookie at home?", top_k=2)
    # Irrelevant queries must return empty or zero results
    assert len(results) == 0


def test_chatbot_irrelevant_query_handling():
    """Verifies that asking an irrelevant question does not hallucinate false electricity tariffs."""
    engine = ChatbotEngine()
    res = engine.process_message(
        message="What is the recipe for chicken biryani?",
        session_id="test_rag_irrelevant_session",
        mode=ChatMode.guest,
        language=Language.en
    )
    assert res.reply is not None
    # Must not contain official electricity tariffs
    assert "Rs. 2850" not in res.reply
    assert "Feeder F-04" not in res.reply
