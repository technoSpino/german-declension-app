from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from .. import db, srs, tts

router = APIRouter(prefix="/api/cards")


class ReviewIn(BaseModel):
    rating: int = Field(ge=1, le=4)


class SettingsIn(BaseModel):
    newPerDay: int = Field(ge=0, le=200)


@router.get("/next")
def next_card():
    return srs.next_card()


@router.post("/{card_id}/review")
def review(card_id: str, body: ReviewIn):
    try:
        return srs.review(card_id, body.rating)
    except KeyError:
        raise HTTPException(404, "Karte nicht gefunden")
    except ValueError as e:
        raise HTTPException(409, str(e))


@router.post("/{card_id}/known")
def known(card_id: str):
    try:
        return srs.mark_known(card_id)
    except KeyError:
        raise HTTPException(404, "Karte nicht gefunden")


@router.post("/undo")
def undo():
    r = srs.undo()
    if r is None:
        raise HTTPException(409, "Nichts zum Rückgängigmachen")
    return r


@router.get("/{card_id}/audio")
def audio(card_id: str):
    card = srs.deck_index().get(card_id)
    if card is None:
        raise HTTPException(404, "Karte nicht gefunden")
    path = tts.audio_for(card["sentence"])
    if path is None:
        raise HTTPException(404, "Keine Sprachausgabe auf dem Server (Piper fehlt)")
    return FileResponse(path, media_type="audio/ogg", headers={"Cache-Control": "max-age=31536000"})


@router.get("/stats")
def stats():
    return {**srs.stats(), "newPerDay": srs.new_per_day()}


@router.put("/settings")
def settings(body: SettingsIn):
    db.set_setting("newPerDay", body.newPerDay)
    return {"newPerDay": body.newPerDay}
