"""Pytest fixtures using an isolated SQLite database."""

import os

import pytest
from fastapi.testclient import TestClient

# Force test DB before app imports bind the engine
os.environ["TRINITY_DATABASE_URL"] = "sqlite:///./test_trinity_care.db"

from app.database import Base, SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.seed import seed_if_empty  # noqa: E402


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
    yield


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def family_token(client: TestClient) -> str:
    r = client.post("/auth/demo-login", json={"persona": "family"})
    assert r.status_code == 200
    return r.json()["access_token"]


@pytest.fixture
def staff_token(client: TestClient) -> str:
    r = client.post("/auth/demo-login", json={"persona": "staff"})
    assert r.status_code == 200
    return r.json()["access_token"]
