"""#29: a "gesprochen" track per clip — what is actually said, from Whisper transcripts.

ARD/ZDF subtitles are condensed for reading speed (words and whole lines missing), so a mined card
sentence may not match its own audio. Matt's Mac transcribes the clips (tools/mac-transcribe/) into
~/kaskade-data/transcripts/<media_file stem>.whisper.json; this module turns the words into
subtitle-like lines and stores them as media.spoken_cues. Rebuilding is idempotent:

    .venv/bin/python -m kaskade.transcripts

(also run by the 06:30 Materialcheck). Transcript text is user data — never in the repo.
"""
import json
import re
from datetime import date, timedelta
from pathlib import Path
from statistics import mean

from . import config, db
from .satzcheck import is_non_speech

PAUSE = 0.7          # a pause this long between words ends a line
MAX_WORDS = 14       # a longer line is split …
MAX_SECONDS = 6.0    # … as is one that lasts longer
MIN_SECONDS = 0.6    # shorter lines join a neighbour, unless they are a whole sentence ("Ich?")
OVERLAP = 0.5        # a Whisper segment "overlaps" an ARD speech cue within this margin
MIN_P = 0.65         # mean word probability below which a segment without ARD speech is dropped

# What Whisper writes into silence or music (it learnt it from subtitled videos)
HALLUCINATION = re.compile(
    r"^(?:vielen dank\W*|untertitel.*|copyright.*|.*danke fürs zuschauen.*|.*dank fürs zuschauen.*"
    r"|.*bis zum nächsten mal.*)$", re.I)
END = re.compile(r"[.?!…][\"“”'»«)]*$")
NO_END = re.compile(r"^(?:\d+\.|[A-ZÄÖÜ]\.|Dr\.|Prof\.|Nr\.|St\.|Hr\.|Fr\.|bzw\.|ca\.|vgl\.|evtl\.|ggf\.|z\.B\.|u\.a\.)$")


def transcripts_dir() -> Path:
    return config.DATA_DIR / "transcripts"


def path_for(media_file: str) -> Path:
    return transcripts_dir() / f"{Path(media_file).stem}.whisper.json"


def _speech(cues: list[dict]) -> list[dict]:
    return [c for c in cues if not is_non_speech(c.get("text", ""))]


def keep_segment(seg: dict, speech: list[dict]) -> bool:
    """Drop hallucinations: no ARD speech cue around it and (unsure words or a known phrase)."""
    over = any(c["start"] - OVERLAP < seg["end"] and c["end"] + OVERLAP > seg["start"] for c in speech)
    if over:
        return True
    words = seg.get("words") or []
    p = mean(w.get("p", 0) for w in words) if words else 0.0
    return not (p < MIN_P or HALLUCINATION.match(seg.get("text", "").strip()))


def words_of(transcript: dict, ard: list[dict]) -> list[dict]:
    speech = _speech(ard)
    out = []
    for seg in transcript.get("segments", []):
        if not keep_segment(seg, speech):
            continue
        for w in seg.get("words") or []:
            text = (w.get("w") or "").strip()
            if text and w.get("e") is not None and w.get("s") is not None:
                out.append({"w": text, "s": float(w["s"]), "e": max(float(w["e"]), float(w["s"]))})
    out.sort(key=lambda w: w["s"])
    return out


def ends_sentence(word: str) -> bool:
    return bool(END.search(word)) and not NO_END.match(word)


def _dur(ws: list[dict]) -> float:
    return ws[-1]["e"] - ws[0]["s"]


def _too_long(ws: list[dict]) -> bool:
    return len(ws) > MAX_WORDS or _dur(ws) > MAX_SECONDS


def _split_long(ws: list[dict]) -> list[list[dict]]:
    """At the last comma, else at the longest pause — never leaving a piece under MIN_SECONDS."""
    if not _too_long(ws) or len(ws) < 2:
        return [ws]
    ok = [k for k in range(1, len(ws)) if _dur(ws[:k]) >= MIN_SECONDS and _dur(ws[k:]) >= MIN_SECONDS]
    commas = [k for k in ok if ws[k - 1]["w"].endswith((",", ";", ":", "–", "-"))]
    if commas:
        k = commas[-1]
    elif ok:
        k = max(ok, key=lambda k: (ws[k]["s"] - ws[k - 1]["e"], k))
    else:
        return [ws]
    return _split_long(ws[:k]) + _split_long(ws[k:])


def build_lines(words: list[dict]) -> list[list[dict]]:
    """Words → lines: after . ? !, at a pause ≥ 0.7 s; long lines split; short fragments joined."""
    lines, cur = [], []
    for w in words:
        if cur and w["s"] - cur[-1]["e"] >= PAUSE:
            lines.append(cur)
            cur = []
        cur.append(w)
        if ends_sentence(w["w"]):
            lines.append(cur)
            cur = []
    if cur:
        lines.append(cur)
    lines = [piece for ln in lines for piece in _split_long(ln)]

    def whole(i):  # a sentence on its own: it ends one, and the line before ended one too
        return ends_sentence(lines[i][-1]["w"]) and (i == 0 or ends_sentence(lines[i - 1][-1]["w"]))

    i = 0
    while i < len(lines):
        if len(lines) > 1 and _dur(lines[i]) < MIN_SECONDS and not whole(i):
            # the end of a sentence goes with the line before, a beginning with the line after
            if i > 0 and (ends_sentence(lines[i][-1]["w"]) or i == len(lines) - 1):
                lines[i - 1] += lines.pop(i)
                i -= 1
            else:
                lines[i + 1] = lines[i] + lines[i + 1]
                lines.pop(i)
            continue
        i += 1
    return lines


def spoken_cues(transcript: dict, ard: list[dict]) -> list[dict]:
    """The "gesprochen" track: spoken lines plus ARD's sound cues (♪ …, * Glockenläuten *) by time."""
    out = [{"start": round(ln[0]["s"], 2), "end": round(ln[-1]["e"], 2), "text": " ".join(w["w"] for w in ln)}
           for ln in build_lines(words_of(transcript, ard))]
    # never overlapping (Whisper's words can, across segments): a line ends where the next begins,
    # so Schauen never switches the text before the pause (#18)
    for a, b in zip(out, out[1:]):
        if a["end"] > b["start"]:
            a["end"] = max(b["start"], round(a["start"] + 0.05, 2))
            b["start"] = max(b["start"], a["end"])
    out += [{"start": c["start"], "end": c["end"], "text": c["text"]} for c in ard
            if c.get("text", "").strip() and is_non_speech(c["text"])]
    out.sort(key=lambda c: (c["start"], c["end"]))
    return out


def import_all() -> dict:
    """(Re)build media.spoken_cues from every transcript file; a clip whose file is gone loses its track."""
    changed, have, errors = [], [], []
    with db.tx() as conn:
        rows = conn.execute("SELECT id, media_file, cues, spoken_cues FROM media WHERE media_file IS NOT NULL").fetchall()
    for r in rows:
        p = path_for(r["media_file"])
        new = None
        if p.exists():
            try:
                new = json.dumps(spoken_cues(json.loads(p.read_text(encoding="utf-8")), json.loads(r["cues"])),
                                 ensure_ascii=False)
                have.append(r["id"])
            except (ValueError, KeyError, TypeError) as e:
                errors.append({"mediaId": r["id"], "file": p.name, "error": str(e)})
                continue
        if new != r["spoken_cues"]:
            with db.tx() as conn:
                conn.execute("UPDATE media SET spoken_cues = ? WHERE id = ?", (new, r["id"]))
            changed.append(r["id"])
    return {"withTranscript": have, "changed": changed, "errors": errors}


def missing(today: date, start: date, data: dict, days: int = 14) -> list[dict]:
    """Planned clips (with picture and subtitles) of the next `days` days without a spoken track — for
    the operator (PROGRESS.md), never a to-do for Matt: the Mac transcribes them."""
    from . import materials, plan
    ctx = materials.Ctx(today)
    out, seen = [], set()
    for i in range(days):
        day = today + timedelta(days=i)
        for it in materials.flat(materials.day_items(plan.plan_day(start, day, data), ctx, data, start)):
            mid = it.get("mediaId")
            if it["kind"] in ("clip", "satzcheck") and mid and not it.get("audio") and mid not in seen:
                seen.add(mid)
                if load(mid) is None:
                    out.append({"date": day.isoformat(), "mediaId": mid, "title": it["title"],
                                "hint": f"auf dem Mac tools/mac-transcribe/run.sh {mid}"})
    return out


def load(media_id: int) -> list[dict] | None:
    with db.tx() as conn:
        r = conn.execute("SELECT spoken_cues FROM media WHERE id = ?", (media_id,)).fetchone()
    return json.loads(r["spoken_cues"]) if r and r["spoken_cues"] else None


if __name__ == "__main__":
    db.init()
    print(json.dumps(import_all(), indent=2))
