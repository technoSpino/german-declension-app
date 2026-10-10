from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .. import analyze, config, db, snippet, srs, texts

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
    # Mined from a clip: the line's time range → an audio snippet for the card.
    mediaId: int | None = None
    start: float | None = Field(default=None, ge=0)
    end: float | None = Field(default=None, ge=0)


def _snippet(mid: int, media_id: int, start: float, end: float) -> str | None:
    """Cut the line's audio from the clip; returns the snippet file name or None."""
    with db.tx() as conn:
        row = conn.execute("SELECT media_file FROM media WHERE id = ?", (media_id,)).fetchone()
    if not row or not row["media_file"]:
        return None
    source = config.MEDIA_DIR / row["media_file"]
    name = f"mine-{mid}.m4a"
    return name if source.exists() and snippet.cut(source, start, end, config.SNIPPETS_DIR / name) else None


@router.post("/mined")
def mine(body: MineIn):
    if body.target not in body.sentence:
        raise HTTPException(422, "Das Wort steht nicht im Satz.")
    clip = body.mediaId is not None and body.start is not None and body.end is not None
    if clip and body.end <= body.start:
        raise HTTPException(422, "Ungültiger Zeitbereich.")
    with db.tx() as conn:
        dup = conn.execute("SELECT id FROM mined WHERE sentence = ? AND target = ?", (body.sentence, body.target)).fetchone()
        if dup:
            return {"id": f"mine:{dup[0]}", "duplicate": True}
        cur = conn.execute(
            "INSERT INTO mined(created_at, sentence, target, lemma, display, gloss, en, note, kasus, source,"
            " media_id, clip_start, clip_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (db.now_iso(), body.sentence.strip(), body.target, body.lemma, body.display or body.lemma,
             body.gloss or "—", body.en, body.note, body.case, body.source,
             body.mediaId if clip else None, body.start if clip else None, body.end if clip else None),
        )
        mid = cur.lastrowid
    audio = _snippet(mid, body.mediaId, body.start, body.end) if clip else None
    if audio:
        with db.tx() as conn:
            conn.execute("UPDATE mined SET audio = ? WHERE id = ?", (audio, mid))
    return {"id": f"mine:{mid}", "duplicate": False, "audio": bool(audio)}


@router.get("/mined")
def list_mined():
    return list(reversed(srs.mined_cards()))
