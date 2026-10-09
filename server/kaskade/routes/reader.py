from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .. import analyze, db, srs, texts

router = APIRouter(prefix="/api")


class AnalyzeIn(BaseModel):
    text: str = Field(max_length=20000)


@router.post("/analyze")
def analyze_text(body: AnalyzeIn):
    if not body.text.strip():
        raise HTTPException(422, "Kein Text")
    try:
        return analyze.analyze(body.text)
    except OSError:
        raise HTTPException(503, "Sprachanalyse nicht verfügbar (spaCy-Modell fehlt)")


@router.get("/texts/{text_id}/analysis")
def text_analysis(text_id: str):
    t = texts.get(text_id)
    if not t:
        raise HTTPException(404, "Text nicht gefunden")
    return analyze_text(AnalyzeIn(text=t["text"]))


class MineIn(BaseModel):
    sentence: str = Field(min_length=3, max_length=400)
    target: str = Field(min_length=1)
    lemma: str = Field(min_length=1)
    display: str | None = None
    gloss: str = ""
    en: str | None = None
    note: str | None = None
    case: Literal["N", "A", "D", "G"] | None = None
    source: str | None = None


@router.post("/mined")
def mine(body: MineIn):
    if body.target not in body.sentence:
        raise HTTPException(422, "Das Wort steht nicht im Satz.")
    with db.tx() as conn:
        dup = conn.execute("SELECT id FROM mined WHERE sentence = ? AND target = ?", (body.sentence, body.target)).fetchone()
        if dup:
            return {"id": f"mine:{dup[0]}", "duplicate": True}
        cur = conn.execute(
            "INSERT INTO mined(created_at, sentence, target, lemma, display, gloss, en, note, kasus, source)"
            " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (db.now_iso(), body.sentence.strip(), body.target, body.lemma, body.display or body.lemma,
             body.gloss or "—", body.en, body.note, body.case, body.source),
        )
        mid = cur.lastrowid
    return {"id": f"mine:{mid}", "duplicate": False}


@router.get("/mined")
def list_mined():
    return list(reversed(srs.mined_cards()))
