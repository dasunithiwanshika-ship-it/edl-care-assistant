"""
Semantic Retrieval Engine for EDL Care Assistant RAG Pipeline
Integrates Persistent ChromaDB Vector Database, chunk ingestion, and multilingual semantic search.
Uses 3072-dimensional embeddings with strict vector compatibility guards and anti-hallucination thresholds.
"""

import os
import chromadb
from typing import List, Dict, Any, Optional
from backend.rag.ingestion import load_and_chunk_documents
from backend.rag.embeddings import compute_semantic_vector, compute_batch_vectors, EMBEDDING_DIM

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROMA_PERSIST_DIR = os.path.join(BACKEND_DIR, "chroma_db")
COLLECTION_NAME = "edl_knowledge_neural_3072"
MIN_RELEVANCE_THRESHOLD = 0.35  # Below this (distance > 0.65), queries are treated as ungrounded/irrelevant


class RAGRetriever:
    def __init__(self):
        # Initialize persistent ChromaDB client
        os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
        self.client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"description": "Electricity Distribution Lanka Official Knowledge Base (Neural 3072)"}
        )
        self.last_status: str = "INITIALIZED"
        self._ensure_indexed()

    def _ensure_indexed(self):
        """Indexes knowledge base documents into ChromaDB if empty or updated."""
        existing_count = self.collection.count()
        chunks = load_and_chunk_documents()
        if not chunks:
            return

        if existing_count < len(chunks):
            print(f"RAGRetriever: Indexing {len(chunks)} chunks into ChromaDB collection '{COLLECTION_NAME}'...")
            ids = [c["chunk_id"] for c in chunks]
            documents = [c["content"] for c in chunks]
            metadatas = [
                {
                    "title": c["title"],
                    "category": c["category"],
                    "document_name": c["document_name"],
                    "chunk_index": c["chunk_index"]
                }
                for c in chunks
            ]
            embeddings = compute_batch_vectors(documents)
            if not embeddings or len(embeddings) != len(documents):
                print("[RAGRetriever] CRITICAL: Gemini batch embedding failed. Skipping upsert to prevent corrupting ChromaDB.")
                self.last_status = "INGESTION_SKIPPED_API_UNAVAILABLE"
                return

            self.collection.upsert(
                ids=ids,
                documents=documents,
                metadatas=metadatas,
                embeddings=embeddings
            )
            print(f"RAGRetriever: Successfully indexed {len(chunks)} chunks using neural embeddings.")
            self.last_status = "INDEXED_NEURAL"

    def search(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        """
        Retrieves top-k relevant chunks for a user query.
        STRICT COMPATIBILITY GUARD: If neural embedding fails, aborts search immediately
        to ensure incompatible fallback vectors are never queried against neural ChromaDB embeddings.
        """
        if not query or len(query.strip()) < 3:
            self.last_status = "EMPTY_QUERY"
            return []

        query_vec = compute_semantic_vector(query)
        if query_vec is None:
            # Neural embedding unavailable; do NOT query with fallback vectors
            print("[RAGRetriever] Knowledge retrieval aborted: Neural embedding service unavailable. Incompatible vectors will NOT be queried.")
            self.last_status = "EMBEDDING_UNAVAILABLE"
            return []

        try:
            results = self.collection.query(
                query_embeddings=[query_vec],
                n_results=top_k,
                include=["documents", "metadatas", "distances"]
            )
        except Exception as e:
            print(f"[RAGRetriever] ChromaDB search error: {e}")
            self.last_status = "SEARCH_ERROR"
            return []

        retrieved = []
        if results and "documents" in results and results["documents"]:
            docs = results["documents"][0]
            metas = results["metadatas"][0]
            distances = results.get("distances", [[1.0] * len(docs)])[0]

            for doc, meta, dist in zip(docs, metas, distances):
                relevance = round(max(0.0, 1.0 - min(dist, 1.0)), 3)
                if relevance >= MIN_RELEVANCE_THRESHOLD:
                    retrieved.append({
                        "title": meta.get("title", "EDL Documentation"),
                        "category": meta.get("category", "general"),
                        "document_name": meta.get("document_name", ""),
                        "chunk_index": meta.get("chunk_index", 0),
                        "content": doc,
                        "distance": dist,
                        "relevance_score": relevance
                    })

        self.last_status = "SUCCESS" if retrieved else "FILTERED_BELOW_THRESHOLD"
        return retrieved


# Singleton instance for fast retrieval
_retriever_instance = None

def get_retriever() -> RAGRetriever:
    global _retriever_instance
    if _retriever_instance is None:
        _retriever_instance = RAGRetriever()
    return _retriever_instance


def retrieve_knowledge(query: str, top_k: int = 2) -> List[Dict[str, Any]]:
    """Public helper for retrieving knowledge base context."""
    retriever = get_retriever()
    return retriever.search(query, top_k=top_k)
