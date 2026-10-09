"""Kaskade API. Run: uvicorn kaskade.main:app --host 127.0.0.1 --port 8000"""
from contextlib import asynccontextmanager

from fastapi import FastAPI

from . import config, db


@asynccontextmanager
async def lifespan(app: FastAPI):
    config.ensure_dirs()
    db.init()
    yield


app = FastAPI(title="Kaskade API", lifespan=lifespan)


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "db": str(config.DB_PATH),
        "ai": config.anthropic_key() is not None,
    }
