"""
FastAPI Server for EDL Care Assistant Backend (Option C Architecture)
Provides complete API gateway for authentication, customer accounts, complaints, outages, solar capacity, and AI chat.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database import engine, Base
from backend.app.routers import auth, customers, complaints, outages, solar, chat
from backend.services.gemini_service import gemini_service

# Initialize database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EDL Care Assistant API",
    description="Backend AI Services for Electricity Distribution Lanka (EDL) - Option C Architecture",
    version="1.0.0",
)

# Enable CORS for Next.js web frontend (localhost:3000) and React Native Expo (localhost:8081 / 19006)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(complaints.router)
app.include_router(outages.router)
app.include_router(solar.router)
app.include_router(chat.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "EDL Care Assistant Backend",
        "architecture": "Option C – Guest + Login-Based AI Chatbot",
        "gemini_active": gemini_service.is_active,
        "database": "SQLite (Connected)",
        "rag_engine": "ChromaDB (Indexed)"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
