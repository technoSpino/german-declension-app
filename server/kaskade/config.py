"""Paths and settings. Everything user-specific lives outside the repo."""
import os
from pathlib import Path

REPO_DIR = Path(__file__).resolve().parents[2]
CONTENT_DIR = REPO_DIR / "data"

DATA_DIR = Path(os.environ.get("KASKADE_DATA_DIR", Path.home() / "kaskade-data"))
DB_PATH = Path(os.environ.get("KASKADE_DB", DATA_DIR / "kaskade.db"))
MEDIA_DIR = DATA_DIR / "media"
RECORDINGS_DIR = DATA_DIR / "recordings"
TTS_DIR = DATA_DIR / "tts"
SNIPPETS_DIR = DATA_DIR / "snippets"      # audio of mined subtitle lines

ANTHROPIC_MODEL = "claude-opus-5-5"


def anthropic_key() -> str | None:
    return os.environ.get("ANTHROPIC_API_KEY") or None


def ensure_dirs() -> None:
    for d in (DATA_DIR, MEDIA_DIR, RECORDINGS_DIR, TTS_DIR, SNIPPETS_DIR):
        d.mkdir(parents=True, exist_ok=True)
