"""Media library for Satz-Check: uploads and YouTube downloads in ~/kaskade-data/media."""
import json
import re
import shutil
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel

from .. import config, db, satzcheck

router = APIRouter(prefix="/api/media")

MEDIA_EXT = {".mp4", ".webm", ".mkv", ".m4v", ".mov", ".mp3", ".m4a", ".ogg", ".oga", ".wav", ".opus", ".aac"}
SUB_EXT = {".srt", ".vtt"}
YT_RE = re.compile(r"^https?://(www\.|m\.)?(youtube\.com|youtu\.be)/", re.I)


def _row(r, with_cues=False) -> dict:
    cues = json.loads(r["cues"])
    out = {
        "id": r["id"], "createdAt": r["created_at"], "kind": r["kind"], "title": r["title"],
        "sourceUrl": r["source_url"], "hasMedia": bool(r["media_file"]),
        "isAudio": bool(r["media_file"]) and Path(r["media_file"]).suffix in {".mp3", ".m4a", ".ogg", ".oga", ".wav", ".opus", ".aac"},
        "cueCount": len(cues), "duration": cues[-1]["end"] if cues else 0,
    }
    if with_cues:
        out["cues"] = cues
    return out


def _insert(kind, title, source_url, media_file, cues) -> int:
    with db.tx() as conn:
        cur = conn.execute(
            "INSERT INTO media(created_at, kind, title, source_url, media_file, cues) VALUES (?, ?, ?, ?, ?, ?)",
            (db.now_iso(), kind, title, source_url, media_file, json.dumps(cues, ensure_ascii=False)),
        )
        return cur.lastrowid


def _get(media_id: int):
    with db.tx() as conn:
        r = conn.execute("SELECT * FROM media WHERE id = ?", (media_id,)).fetchone()
    if not r:
        raise HTTPException(404, "Medium nicht gefunden")
    return r


@router.get("")
def list_media():
    with db.tx() as conn:
        rows = conn.execute("SELECT * FROM media ORDER BY id DESC").fetchall()
    return [_row(r) for r in rows]


@router.get("/{media_id}")
def get_media(media_id: int):
    return _row(_get(media_id), with_cues=True)


@router.get("/{media_id}/file")
def media_file(media_id: int):
    r = _get(media_id)
    if not r["media_file"]:
        raise HTTPException(404, "Keine Mediendatei")
    path = config.MEDIA_DIR / r["media_file"]
    if not path.exists():
        raise HTTPException(404, "Mediendatei fehlt auf dem Server")
    return FileResponse(path)


@router.delete("/{media_id}")
def delete_media(media_id: int):
    r = _get(media_id)
    if r["media_file"]:
        (config.MEDIA_DIR / r["media_file"]).unlink(missing_ok=True)
    with db.tx() as conn:
        conn.execute("DELETE FROM media WHERE id = ?", (media_id,))
    return {"ok": True}


@router.post("/upload")
def upload(
    subtitles: UploadFile = File(...),
    media: UploadFile | None = File(None),
    title: str = Form(""),
):
    sub_ext = Path(subtitles.filename or "").suffix.lower()
    if sub_ext not in SUB_EXT:
        raise HTTPException(422, "Untertitel bitte als .srt oder .vtt hochladen.")
    raw = subtitles.file.read()
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        text = raw.decode("latin-1")
    cues = satzcheck.parse_subtitles(text)
    if not cues:
        raise HTTPException(422, "In der Untertiteldatei wurden keine Sätze gefunden.")

    media_ext = None
    if media is not None and media.filename:
        media_ext = Path(media.filename).suffix.lower()
        if media_ext not in MEDIA_EXT:
            raise HTTPException(422, f"Dateityp {media_ext or '?'} wird nicht unterstützt (z. B. .mp4, .webm, .mp3).")

    name = title.strip() or Path(subtitles.filename or "Clip").stem
    media_id = _insert("upload", name, None, None, cues)
    if media_ext:
        config.MEDIA_DIR.mkdir(parents=True, exist_ok=True)
        filename = f"upload-{media_id}{media_ext}"
        with (config.MEDIA_DIR / filename).open("wb") as out:
            shutil.copyfileobj(media.file, out, length=1024 * 1024)
        with db.tx() as conn:
            conn.execute("UPDATE media SET media_file = ? WHERE id = ?", (filename, media_id))
    return _row(_get(media_id))


class YoutubeIn(BaseModel):
    url: str


def fetch_youtube(url: str, dest: Path, stem: str) -> dict:
    """Download low-res media + German subtitles with yt-dlp. Returns info dict."""
    import yt_dlp  # imported lazily: heavy and only needed here

    opts = {
        "format": "worst[ext=mp4][height>=240]/worst[ext=mp4]/worst",
        "outtmpl": str(dest / f"{stem}.%(ext)s"),
        "writesubtitles": True,
        "writeautomaticsub": True,
        "subtitleslangs": ["de", "de-DE", "de-orig"],
        "subtitlesformat": "vtt",
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "socket_timeout": 20,
        "retries": 1,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        return ydl.extract_info(url, download=True)


@router.post("/youtube")
def youtube(body: YoutubeIn):
    url = body.url.strip()
    if not YT_RE.match(url):
        raise HTTPException(422, "Das ist keine YouTube-Adresse.")
    config.MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    with db.tx() as conn:
        next_id = (conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM media").fetchone()[0])
    stem = f"yt-{next_id}"
    fallback = " Bitte Video und Untertitel selbst herunterladen und oben hochladen."
    try:
        info = fetch_youtube(url, config.MEDIA_DIR, stem)
    except Exception as e:  # yt-dlp raises many types; all mean "didn't work"
        for f in config.MEDIA_DIR.glob(f"{stem}.*"):
            f.unlink(missing_ok=True)
        msg = str(e)
        if "Sign in" in msg or "bot" in msg.lower() or "403" in msg:
            reason = "YouTube blockiert Downloads von diesem Server."
        else:
            reason = "Download fehlgeschlagen."
        raise HTTPException(502, reason + fallback)

    subs = sorted(config.MEDIA_DIR.glob(f"{stem}*.vtt"))
    media_files = [f for f in config.MEDIA_DIR.glob(f"{stem}.*") if f.suffix.lower() in MEDIA_EXT]
    if not subs:
        for f in media_files:
            f.unlink(missing_ok=True)
        raise HTTPException(422, "Dieses Video hat keine deutschen Untertitel." + fallback)
    cues = satzcheck.parse_subtitles(subs[0].read_text(encoding="utf-8", errors="replace"))
    for s in subs:
        s.unlink(missing_ok=True)  # cues live in the DB; keep no third-party subtitle files around
    media_id = _insert("youtube", info.get("title") or url, url, media_files[0].name if media_files else None, cues)
    return _row(_get(media_id))
