# EDL Care Assistant – AI & Backend Services

This directory is reserved for the future **Python FastAPI** backend services powering AI and knowledge retrieval for Electricity Distribution Lanka.

## Architecture Blueprint
- **Framework**: Python 3.11+ / FastAPI / Uvicorn.
- **LLM Engine**: Google Gemini API (`gemini-1.5-pro` / `gemini-1.5-flash`).
- **Retrieval-Augmented Generation (RAG)**: LangChain / LlamaIndex with vector storage (ChromaDB / pgvector).
- **Domain Knowledge Base**:
  - Sri Lanka electricity tariff schedules and block thresholds (General Domestic, Religious, Industrial, Commercial).
  - Rooftop Solar PV Net-Metering / Net-Accounting / Net-Plus guidelines.
  - Distribution code and safety protocols.
  - Transformer capacity clearing rules.
- **Multilingual Support**: Real-time natural language comprehension for English, Sinhala (සිංහල), and Tamil (தமிழ்).
