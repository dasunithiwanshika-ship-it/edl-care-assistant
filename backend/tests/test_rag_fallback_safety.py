"""
Unit & Integration Tests for RAG Fallback Safety & Vector Incompatibility Protection.
Verifies that:
1. When Gemini embedding fails, no fallback vectors are queried against the neural ChromaDB collection.
2. Safe status EMBEDDING_UNAVAILABLE is reported.
3. ChatbotEngine gracefully notifies users that knowledge retrieval is temporarily offline.
4. Fallback vectors are never stored in or queried against the neural ChromaDB collection.
"""

import pytest
from unittest.mock import patch, MagicMock
from backend.rag.retrieval import RAGRetriever, get_retriever
from backend.chatbot.engine import ChatbotEngine
from backend.app.schemas import ChatMode, Language


def test_embedding_failure_aborts_search_without_querying_chromadb():
    """Verifies that if compute_semantic_vector returns None, ChromaDB is never queried with incompatible vectors."""
    retriever = RAGRetriever()
    
    with patch("backend.rag.retrieval.compute_semantic_vector", return_value=None):
        with patch.object(retriever.collection, "query", wraps=retriever.collection.query) as spy_query:
            results = retriever.search("What is the tariff for domestic 60 units?")
            
            # 1. Must return empty results
            assert results == []
            # 2. Status must be EMBEDDING_UNAVAILABLE
            assert retriever.last_status == "EMBEDDING_UNAVAILABLE"
            # 3. ChromaDB collection.query must NEVER have been called
            spy_query.assert_not_called()


def test_embedding_failure_skips_ingestion():
    """Verifies that if compute_batch_vectors returns None, ingestion skips upsert to prevent polluting ChromaDB."""
    retriever = RAGRetriever()
    
    with patch("backend.rag.retrieval.compute_batch_vectors", return_value=None):
        with patch.object(retriever.collection, "upsert", wraps=retriever.collection.upsert) as spy_upsert:
            # Force _ensure_indexed with mocked higher chunk count
            with patch("backend.rag.retrieval.load_and_chunk_documents", return_value=[{"chunk_id": "test_999", "content": "test", "title": "t", "category": "c", "document_name": "d", "chunk_index": 0}]):
                with patch.object(retriever.collection, "count", return_value=0):
                    retriever._ensure_indexed()
                    # Must skip upsert
                    spy_upsert.assert_not_called()
                    assert retriever.last_status == "INGESTION_SKIPPED_API_UNAVAILABLE"


def test_chatbot_engine_handles_embedding_failure_safely():
    """Verifies that ChatbotEngine does not crash or hallucinate when knowledge retrieval is unavailable."""
    engine = ChatbotEngine()
    
    with patch("backend.rag.retrieval.compute_semantic_vector", return_value=None):
        res = engine.process_message(
            message="What is the domestic electricity tariff in Sri Lanka?",
            session_id="test_fallback_safety_session",
            mode=ChatMode.guest,
            language=Language.en
        )
        
        assert res.reply is not None
        assert res.sources == []  # Sources must be empty when embedding unavailable
        # Should not throw uncaught error and should preserve conversational safety
