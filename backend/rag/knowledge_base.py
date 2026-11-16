"""
RAG Electricity Knowledge Base Interface for Electricity Distribution Lanka (EDL)
Connects to ChromaDB semantic retrieval engine and provides grounded documents.
"""

from typing import List, Dict, Any
from backend.rag.retrieval import retrieve_knowledge

__all__ = ["retrieve_knowledge"]
