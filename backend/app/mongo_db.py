"""
MongoDB Atlas Connection and Database Management for EDL Care Assistant.
Provides connection pooling, collection access, and repository helpers.
"""

import os
from typing import Optional, Dict, Any, List
import pymongo
from pymongo.database import Database
from dotenv import load_dotenv

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BACKEND_DIR, ".env"))

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_DB_NAME", "edl_care")
DB_BACKEND = os.getenv("DB_BACKEND", "mongodb").lower()

_client: Optional[pymongo.MongoClient] = None

def get_mongo_client() -> pymongo.MongoClient:
    """Returns singleton PyMongo client with connection pooling."""
    global _client
    if _client is None:
        if not MONGODB_URI:
            raise ValueError("MONGODB_URI environment variable is not configured.")
        _client = pymongo.MongoClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=10000,
            maxPoolSize=50,
            minPoolSize=5
        )
    return _client

def get_mongo_db() -> Database:
    """Returns the edl_care MongoDB database instance."""
    client = get_mongo_client()
    return client[DB_NAME]

def get_db():
    """FastAPI dependency yielding MongoDB database instance."""
    db = get_mongo_db()
    yield db

def clean_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Strips native MongoDB _id or converts to string, ensuring Pydantic compatibility."""
    if not doc:
        return None
    d = dict(doc)
    if "_id" in d:
        d["mongo_id"] = str(d.pop("_id"))
    return d

def clean_docs(docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Cleans a list of MongoDB documents."""
    return [clean_doc(d) for d in docs if d is not None]
