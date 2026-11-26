"""
FastAPI Server for EDL Care Assistant Backend (Option C Architecture - MongoDB Atlas)
Provides complete API gateway for authentication, customer accounts, complaints, outages, solar capacity, and AI chat.
Features global PyMongo exception handling, health checks, and strict Option C access control.
"""

import os
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pymongo.errors

from backend.app.routers import auth, customers, complaints, outages, solar, chat
from backend.services.gemini_service import gemini_service
from backend.app.mongo_db import get_mongo_db

app = FastAPI(
    title="EDL Care Assistant API",
    description="Backend AI Services for Electricity Distribution Lanka (EDL) - Option C Architecture (MongoDB Atlas)",
    version="2.0.0",
)

# Enable CORS for Next.js web frontend and React Native Expo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global PyMongo database error handler (Returns HTTP 503 Service Unavailable)
@app.exception_handler(pymongo.errors.PyMongoError)
async def pymongo_exception_handler(request: Request, exc: pymongo.errors.PyMongoError):
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "detail": "MongoDB database service is temporarily unavailable. Please retry in a moment.",
            "error_type": exc.__class__.__name__
        }
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
    # Verify MongoDB Atlas connection
    mongo_status = "Connected"
    try:
        db = get_mongo_db()
        db.command("ping")
    except Exception as e:
        mongo_status = f"Disconnected: {e}"

    return {
        "status": "healthy",
        "service": "EDL Care Assistant Backend",
        "architecture": "Option C – Guest + Login-Based AI Chatbot",
        "gemini_active": gemini_service.is_active,
        "database": f"MongoDB Atlas ({mongo_status})",
        "database_name": "edl_care",
        "rag_engine": "ChromaDB (Neural 3072 Indexed)"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
