"""Text-to-speech with Piper (German voice 'thorsten', dataset CC0).

Audio is cached in ~/kaskade-data/tts/audio/<sha1>.ogg (Opus). Nothing here is
required: without Piper or the voice file, `available()` is False and the
frontend falls back to the browser's speech synthesis.
"""
import hashlib
import shutil
import subprocess
import tempfile
import threading
import wave
from functools import lru_cache
from pathlib import Path

from . import config

VOICE = "de_DE-thorsten-medium"
_lock = threading.Lock()


def voice_path() -> Path:
    return config.TTS_DIR / "voices" / f"{VOICE}.onnx"


def audio_dir() -> Path:
    return config.TTS_DIR / "audio"


def available() -> bool:
    try:
        import piper  # noqa: F401
    except ImportError:
        return False
    return voice_path().exists() and shutil.which("ffmpeg") is not None


CODECS = {"ogg": ["-c:a", "libopus", "-b:a", "32k"], "mp3": ["-c:a", "libmp3lame", "-b:a", "64k"]}


def cache_path(text: str, fmt: str = "ogg") -> Path:
    key = hashlib.sha1(f"{VOICE}\n{text.strip()}".encode("utf-8")).hexdigest()
    return audio_dir() / f"{key}.{fmt}"


@lru_cache(maxsize=1)
def _voice():
    from piper import PiperVoice

    return PiperVoice.load(str(voice_path()))


def _synthesize(text: str, out: Path) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "a.wav"
        with _lock, wave.open(str(wav), "wb") as wf:
            _voice().synthesize_wav(text, wf)
        out.parent.mkdir(parents=True, exist_ok=True)
        fmt = out.suffix.lstrip(".")
        part = out.with_suffix(f".part.{fmt}")
        subprocess.run(
            ["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav), *CODECS[fmt], "-ac", "1", str(part)],
            check=True,
        )
        part.replace(out)


def audio_for(text: str, synthesize=_synthesize, fmt: str = "ogg") -> Path | None:
    """Cached audio file for `text`, generating it if needed. None if TTS is unavailable."""
    path = cache_path(text, fmt)
    if path.exists():
        return path
    if synthesize is _synthesize and not available():
        return None
    synthesize(text, path)
    return path if path.exists() else None
