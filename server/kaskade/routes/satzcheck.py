import json
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .. import db, satzcheck

router = APIRouter(prefix="/api/satzcheck")


class Rating(BaseModel):
    cue: int
    text: str
    rating: Literal["v", "h", "s"]


class Run(BaseModel):
    mediaId: int | None = None
    contentType: Literal["simple", "adult"]
    windowStart: float
    windowEnd: float
    ratings: list[Rating]


def known_words() -> int | None:
    with db.tx() as conn:
        row = conn.execute("SELECT result FROM vocab_tests ORDER BY id DESC LIMIT 1").fetchone()
    return json.loads(row["result"])["estimate"] if row else None


def evaluate(content_type: str, ratings: list[str]) -> dict:
    s = satzcheck.summarize(ratings)
    words = known_words()
    return {**s, "words": words, "verdict": satzcheck.verdict(s["coverage"], content_type, words)}


@router.post("")
def save_run(run: Run):
    if not run.ratings:
        raise HTTPException(422, "Noch keine Sätze bewertet.")
    result = evaluate(run.contentType, [r.rating for r in run.ratings])
    with db.tx() as conn:
        cur = conn.execute(
            "INSERT INTO satzcheck_runs(created_at, media_id, content_type, window_start, window_end, ratings, result)"
            " VALUES (?, ?, ?, ?, ?, ?, ?)",
            (db.now_iso(), run.mediaId, run.contentType, run.windowStart, run.windowEnd,
             json.dumps([r.model_dump() for r in run.ratings], ensure_ascii=False), json.dumps(result, ensure_ascii=False)),
        )
        run_id = cur.lastrowid
    return {"id": run_id, "createdAt": db.now_iso(), "contentType": run.contentType, **result}


@router.get("/history")
def history():
    with db.tx() as conn:
        rows = conn.execute(
            "SELECT r.id, r.created_at, r.content_type, r.result, m.title FROM satzcheck_runs r"
            " LEFT JOIN media m ON m.id = r.media_id ORDER BY r.id DESC"
        ).fetchall()
    return [
        {"id": r["id"], "createdAt": r["created_at"], "contentType": r["content_type"],
         "title": r["title"], **json.loads(r["result"])}
        for r in rows
    ]
