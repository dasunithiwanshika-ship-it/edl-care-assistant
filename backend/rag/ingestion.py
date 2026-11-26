"""
Document Ingestion and Text Extraction Pipeline for EDL Knowledge Base
Handles extraction from both plaintext (.txt) and PDF (.pdf) official utility documents.
"""

import os
from typing import List, Dict, Any
from pypdf import PdfReader

KNOWLEDGE_BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "knowledge_base")
)

def extract_text_from_file(file_path: str) -> str:
    """Extracts text content from a given .txt or .pdf file."""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    elif ext == ".pdf":
        reader = PdfReader(file_path)
        pages_text = [
            "[CURATED DEMONSTRATION DOCUMENT – NOT AN OFFICIAL UTILITY PUBLICATION]\n"
            "PROVENANCE NOTICE: Modeled on Sri Lankan utility customer charter guidelines for software demonstration purposes only. Not independently verified against current official publications."
        ]
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text)
        return "\n".join(pages_text)
    return ""

def clean_text(text: str) -> str:
    """Cleans extracted document text."""
    lines = text.split("\n")
    cleaned_lines = [line.strip() for line in lines if line.strip()]
    return "\n".join(cleaned_lines)

def chunk_text(
    text: str, 
    chunk_size: int = 500, 
    overlap: int = 80
) -> List[str]:
    """
    Splits text into overlapping semantic chunks based on word count.
    """
    words = text.split()
    if len(words) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += (chunk_size - overlap)
    return chunks

def load_and_chunk_documents() -> List[Dict[str, Any]]:
    """
    Scans knowledge_base directory, ingests all .txt and .pdf files,
    and returns chunk records with metadata.
    """
    all_chunks = []
    if not os.path.exists(KNOWLEDGE_BASE_DIR):
        return all_chunks

    for filename in os.listdir(KNOWLEDGE_BASE_DIR):
        file_path = os.path.join(KNOWLEDGE_BASE_DIR, filename)
        if not os.path.isfile(file_path):
            continue

        ext = os.path.splitext(filename)[1].lower()
        if ext not in [".txt", ".pdf"]:
            continue

        raw_text = extract_text_from_file(file_path)
        if not raw_text:
            continue

        cleaned = clean_text(raw_text)
        doc_chunks = chunk_text(cleaned, chunk_size=350, overlap=50)

        # Infer category and title
        title = filename.replace("_", " ").replace(".txt", "").replace(".pdf", "").title()
        category = "general"
        if "tariff" in filename.lower():
            category = "tariffs"
        elif "bill" in filename.lower():
            category = "billing"
        elif "safety" in filename.lower():
            category = "safety"
        elif "breakdown" in filename.lower() or "outage" in filename.lower():
            category = "outages"
        elif "solar" in filename.lower():
            category = "solar"
        elif "charter" in filename.lower():
            category = "customer_charter"

        for idx, chunk_content in enumerate(doc_chunks):
            chunk_id = f"{filename}_{idx}"
            all_chunks.append({
                "chunk_id": chunk_id,
                "document_name": filename,
                "title": title,
                "category": category,
                "chunk_index": idx,
                "content": chunk_content
            })

    return all_chunks

if __name__ == "__main__":
    chunks = load_and_chunk_documents()
    print(f"Ingested {len(chunks)} chunks across knowledge base files:")
    for c in chunks:
        print(f" - [{c['category'].upper()}] {c['title']} (Chunk {c['chunk_index']}): {len(c['content'])} chars")
