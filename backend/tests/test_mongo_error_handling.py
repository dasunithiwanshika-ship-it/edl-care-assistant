"""
Test MongoDB Atlas error handling and HTTP 503 response.
"""

import pytest
from fastapi.testclient import TestClient
import pymongo.errors

from backend.app.main import app
from backend.app.mongo_db import get_db

client = TestClient(app)


def test_mongodb_unavailable_returns_503():
    """Verifies that PyMongoError produces structured HTTP 503 Service Unavailable."""
    def broken_db_dependency():
        raise pymongo.errors.ServerSelectionTimeoutError("Atlas connection timed out")

    app.dependency_overrides[get_db] = broken_db_dependency
    try:
        response = client.get("/api/outages")
        assert response.status_code == 503
        data = response.json()
        assert "temporarily unavailable" in data["detail"].lower()
        assert data["error_type"] == "ServerSelectionTimeoutError"
    finally:
        app.dependency_overrides.pop(get_db, None)
