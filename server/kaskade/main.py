"""Kaskade API. Run: uvicorn kaskade.main:app --host 127.0.0.1 --port 8000"""
from contextlib import asynccontextmanager

from fastapi import FastAPI

from . import config, db
from .routes import cards, media, placement, satzcheck, today, vocab


@asynccontextmanager
async def lifespan(app: FastAPI):
    config.ensure_dirs()
    db.init()
    yield


app = FastAPI(title="Kaskade API", lifespan=lifespan)
app.include_router(vocab.router)
app.include_router(media.router)
app.include_router(satzcheck.router)
app.include_router(placement.router)
app.include_router(cards.router)
app.include_router(today.router)


@app.get("/api/status")
def status():
    """Learner status for the header and Heute (phase from the last Einstufung)."""
    with db.tx() as conn:
        running = conn.execute("SELECT block, started_at FROM activity WHERE ended_at IS NULL").fetchone()
    return {
        "phase": db.get_setting("phase"),
        "name": db.get_setting("name", "Matt"),
        "running": {"block": running["block"], "startedAt": running["started_at"]} if running else None,
    }


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "db": str(config.DB_PATH),
        "ai": config.anthropic_key() is not None,
    }
