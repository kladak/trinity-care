"""Trinity Care Demo API — educational portfolio project."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.routers import audit, auth, residents, updates, visits
from app.schemas import HealthOut, ReadyOut
from app.seed import seed_if_empty


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.app_name,
    description=(
        "Educational senior-care connection demo. Not a medical device. "
        "Not affiliated with Trinity Health or prior Trinity-named products. "
        "Synthetic seed data only — no real PHI."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(residents.router)
app.include_router(updates.router)
app.include_router(visits.router)
app.include_router(audit.router)


@app.get("/health", response_model=HealthOut, tags=["ops"])
def health() -> HealthOut:
    return HealthOut(status="ok", service="trinity-care-api")


@app.get("/ready", response_model=ReadyOut, tags=["ops"])
def ready() -> ReadyOut:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return ReadyOut(status="ready", database="ok")
    except Exception:
        return ReadyOut(status="not_ready", database="error")


@app.get("/", tags=["ops"])
def root() -> dict:
    return {
        "service": "Trinity Care Demo API",
        "disclaimer": "Educational demo — not a medical device; synthetic data only.",
        "docs": "/docs",
    }
