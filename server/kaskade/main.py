"""Kaskade API. Run: uvicorn kaskade.main:app --host 127.0.0.1 --port 8000"""
from contextlib import asynccontextmanager

from fastapi import FastAPI

from . import config, db
from .routes import vocab


@asynccontextmanager
async def lifespan(app: FastAPI):
    config.ensure_dirs()
    db.init()
    yield


app = FastAPI(title="Kaskade API", lifespan=lifespan)
app.include_router(vocab.router)


@app.get("/api/status")
def status():
    """Learner status for the header and Heute (phase from the last Einstufung)."""
    return {"phase": db.get_setting("phase"), "name": db.get_setting("name", "Matt")}


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "db": str(config.DB_PATH),
        "ai": config.anthropic_key() is not None,
    }
