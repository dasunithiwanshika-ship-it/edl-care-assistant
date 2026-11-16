"""
Semantic Retrieval Engine for EDL Care Assistant RAG Pipeline
Integrates ChromaDB Vector Database, chunk ingestion, and multilingual semantic query search.
"""

import os
import chromadb
from typing import List, Dict, Any
from backend.rag.ingestion import load_and_chunk_documents
from backend.rag.embeddings import compute_semantic_vector

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROMA_PERSIST_DIR = os.path.join(BACKEND_DIR, "chroma_db")

class RAGRetriever:
    def __init__(self):
        # Initialize persistent ChromaDB client
        os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
        self.client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        self.collection = self.client.get_or_create_collection(
            name="edl_knowledge",
            metadata={"description": "Electricity Distribution Lanka Official Knowledge Base"}
        )
        self._ensure_indexed()

    def _ensure_indexed(self):
        """Indexes knowledge base documents into ChromaDB if empty or updated."""
        existing_count = self.collection.count()
        chunks = load_and_chunk_documents()
        if not chunks:
            return

        if existing_count < len(chunks):
            # Index chunks
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
            embeddings = [compute_semantic_vector(c["content"]) for c in chunks]

            self.collection.upsert(
                ids=ids,
                documents=documents,
                metadatas=metadatas,
                embeddings=embeddings
            )
            print(f"RAGRetriever: Successfully upserted {len(chunks)} chunks into ChromaDB.")

    def search(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        """
        Retrieves top-k relevant chunks for a user query.
        Works across English, Sinhala, Tamil, and code-mixed inputs.
        """
        query_vec = compute_semantic_vector(query)
        try:
            results = self.collection.query(
                query_embeddings=[query_vec],
                n_results=top_k,
                include=["documents", "metadatas", "distances"]
            )
        except Exception as e:
            print(f"ChromaDB search warning: {e}")
            return []

        retrieved = []
        if results and "documents" in results and results["documents"]:
            docs = results["documents"][0]
            metas = results["metadatas"][0]
            distances = results.get("distances", [[0.0] * len(docs)])[0]

            for doc, meta, dist in zip(docs, metas, distances):
                retrieved.append({
                    "title": meta.get("title", "EDL Documentation"),
                    "category": meta.get("category", "general"),
                    "document_name": meta.get("document_name", ""),
                    "content": doc,
                    "distance": dist,
                    "relevance_score": round(1.0 - min(dist, 1.0), 3)
                })

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
    results = retriever.search(query=query, top_k=top_k)
    return results

if __name__ == "__main__":
    retriever = get_retriever()
    test_queries = [
        "What are the domestic electricity tariffs and units in Sri Lanka?",
        "මගේ බිල වැඩි වෙන්න හේතු මොනවාද?",  # Sinhala: Why is my bill high?
        "மின் கட்டண முறை விளக்கம்",  # Tamil: Electricity tariff explanation
        "bill eka wadi ai?",  # Singlish
        "How do I report a fallen power line or breakdown?",
        "What is the rooftop solar transformer capacity threshold?",
    ]
    print("\n--- Testing Semantic ChromaDB Retrieval ---")
    for q in test_queries:
        res = retriever.search(q, top_k=1)
        if res:
            top = res[0]
            print(f"\nQuery: '{q}'\n-> Matched: [{top['category'].upper()}] {top['title']} (Score: {top['relevance_score']})")
            print(f"   Excerpt: {top['content'][:120]}...")
