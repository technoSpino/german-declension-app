"""#29: a "gesprochen" track per clip — what is actually said, from Whisper transcripts.

ARD/ZDF subtitles are condensed for reading speed (words and whole lines missing), so a mined card
sentence may not match its own audio. Matt's Mac transcribes the clips (tools/mac-transcribe/) into
~/kaskade-data/transcripts/<media_file stem>.whisper.json; this module turns the words into
subtitle-like lines and stores them as media.spoken_cues. Rebuilding is idempotent:

    .venv/bin/python -m kaskade.transcripts

(also run by the 06:30 Materialcheck). Transcript text is user data — never in the repo.
"""
import bisect
import json
import re
import sys
from collections import Counter
from datetime import date, timedelta
from difflib import SequenceMatcher
from pathlib import Path
from statistics import mean

from . import config, db
from .satzcheck import is_non_speech

PAUSE = 0.7          # a pause this long between words ends a line
MAX_WORDS = 14       # a longer line is split …
MAX_SECONDS = 6.0    # … as is one that lasts longer
MIN_SECONDS = 0.6    # shorter lines join a neighbour, unless they are a whole sentence ("Ich?") …
JOIN_GAP = 2.0       # … but never across a longer silence (that made a 13-s line in Schweigen)
OVERLAP = 0.5        # a Whisper segment "overlaps" an ARD speech cue within this margin
MIN_P = 0.65         # mean word probability below which a segment without ARD speech is dropped
NEAR = 0.5           # ARD cue window for respelling and gap fill: [start − 0.5 s, end + 0.5 s]
SIMILAR = 0.6        # respell a misheard word when it is this close to ARD's (lowercase similarity)
BUILD = 2            # bump when the line builder changes: every track is rebuilt on the next import

# What Whisper writes into silence or music (it learnt it from subtitled videos)
HALLUCINATION = re.compile(
    r"^(?:vielen dank\W*|untertitel.*|copyright.*|.*danke fürs zuschauen.*|.*dank fürs zuschauen.*"
    r"|.*bis zum nächsten mal.*)$", re.I)
GLOSSARY = re.compile(r"^Glossar\W*$", re.I)
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
            if GLOSSARY.match(text):
                continue  # the Mac's prompt ("Glossar: …") leaking into the text
            if text and w.get("e") is not None and w.get("s") is not None:
                out.append({"w": text, "s": float(w["s"]), "e": max(float(w["e"]), float(w["s"]))})
    out.sort(key=lambda w: w["s"])
    return out


# ── Respelling from ARD ──
# v2 transcripts (whole file, no prompt) catch more speech but misspell names and rare words
# (Tace → "Tatsche", Otto → "Autos", durchwühlt → "durchwählt"). ARD's subtitles spell them right.
TOKEN = re.compile(r"[\wÄÖÜäöüß'’-]*\w[\wÄÖÜäöüß'’-]*")
CORE = re.compile(r"^(\W*)(.*?)(\W*)$", re.S)


def norm(word: str) -> str:
    return "".join(TOKEN.findall(word.lower()))


def _ard_tokens(text: str) -> list[tuple[str, bool]]:
    """ARD words (spelling as written) with "sentence-initial" flags; speaker labels "(Eve)" left out."""
    out, initial = [], True
    for raw in re.sub(r"\([^)]*\)", " ", text).split():
        core = "".join(TOKEN.findall(raw))
        if core:
            out.append((core, initial))
            initial = False
        if re.search(r"[.?!:]$", raw):
            initial = True
    return out


def respell(words: list[dict], ard: list[dict]) -> None:
    """Per ARD speech cue: align its words with Whisper's (midpoint in the cue ± 0.5 s) and, in a
    replace block of equal length, take ARD's spelling when it is close (≥ 0.6) or a name of the clip
    (capitalised, not sentence-initial, ≥ 2× in its ARD cues). Whisper's punctuation and times stay;
    no word is ever added or removed."""
    speech = _speech(ard)
    names = Counter(t for c in speech for t, _ in _ard_tokens(c["text"]) if t[:1].isupper())
    mids = [(w["s"] + w["e"]) / 2 for w in words]
    for c in speech:
        lo = bisect.bisect_left(mids, c["start"] - NEAR)
        hi = bisect.bisect_right(mids, c["end"] + NEAR)
        idx = [i for i in range(lo, hi) if norm(words[i]["w"])]
        toks = _ard_tokens(c["text"])
        if not idx or not toks:
            continue
        wn = [norm(words[i]["w"]) for i in idx]
        an = [t.lower() for t, _ in toks]
        for op, i1, i2, j1, j2 in SequenceMatcher(None, wn, an, autojunk=False).get_opcodes():
            if op != "replace" or i2 - i1 != j2 - j1:
                continue
            for k in range(i2 - i1):
                (tok, initial), w = toks[j1 + k], words[idx[i1 + k]]
                name = tok[:1].isupper() and not initial and names[tok] >= 2
                if name or SequenceMatcher(None, wn[i1 + k], an[j1 + k]).ratio() >= SIMILAR:
                    pre, core, post = CORE.match(w["w"]).groups()
                    if core[:1].isupper() and tok[:1].islower():
                        tok = tok[:1].upper() + tok[1:]  # it starts Whisper's sentence
                    w["w"] = pre + tok + post


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

    def gap(a, b):
        return lines[b][0]["s"] - lines[a][-1]["e"] if 0 <= a and b < len(lines) else float("inf")

    i = 0
    while i < len(lines):
        if _dur(lines[i]) < MIN_SECONDS and not whole(i):
            # the end of a sentence goes with the line before, a beginning with the line after
            sides = ["prev", "next"] if ends_sentence(lines[i][-1]["w"]) else ["next", "prev"]
            side = next((s for s in sides if gap(*((i - 1, i) if s == "prev" else (i, i + 1))) <= JOIN_GAP), None)
            if side == "prev":
                lines[i - 1] += lines.pop(i)
                i -= 1
                continue
            if side == "next":
                frag = lines.pop(i)
                lines[i] = frag + lines[i]
                continue
        i += 1
    return lines


def spoken_cues(transcript: dict, ard: list[dict]) -> list[dict]:
    """The "gesprochen" track: spoken lines (respelled from ARD), ARD's line where Whisper heard nothing,
    and ARD's sound cues (♪ …, * Glockenläuten *), by time."""
    words = words_of(transcript, ard)
    respell(words, ard)
    out = [{"start": round(ln[0]["s"], 2), "end": round(ln[-1]["e"], 2), "text": " ".join(w["w"] for w in ln)}
           for ln in build_lines(words)]
    # gap fill: an ARD speech cue with no Whisper word in it (± 0.5 s) goes in as it is, marked
    mids = [(w["s"] + w["e"]) / 2 for w in words]
    out += [{"start": c["start"], "end": c["end"], "text": c["text"], "src": "ard"} for c in _speech(ard)
            if bisect.bisect_right(mids, c["end"] + NEAR) == bisect.bisect_left(mids, c["start"] - NEAR)]
    out.sort(key=lambda c: (c["start"], c["end"]))
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


def stamp(p: Path) -> str:
    """What the stored track was built from: file mtime + size, and the builder version."""
    st = p.stat()
    return f"{st.st_mtime_ns}:{st.st_size}:{BUILD}"


def import_all(media_id: int | None = None, force: bool = False) -> dict:
    """(Re)build media.spoken_cues where a transcript file is new or changed (mtime/size) or the builder
    is newer; a clip whose file is gone loses its track. A file still being copied (bad JSON) keeps the
    last good track and is tried again next time."""
    changed, have, errors = [], [], []
    with db.tx() as conn:
        q = "SELECT id, media_file, cues, spoken_cues, spoken_stamp FROM media WHERE media_file IS NOT NULL"
        rows = conn.execute(q + (" AND id = ?" if media_id is not None else ""),
                            (media_id,) if media_id is not None else ()).fetchall()
    for r in rows:
        p = path_for(r["media_file"])
        new = mark = None
        if p.exists():
            have.append(r["id"])
            mark = stamp(p)
            if mark == r["spoken_stamp"] and not force:
                continue
            try:
                new = json.dumps(spoken_cues(json.loads(p.read_text(encoding="utf-8")), json.loads(r["cues"])),
                                 ensure_ascii=False)
            except (ValueError, KeyError, TypeError) as e:
                errors.append({"mediaId": r["id"], "file": p.name, "error": str(e)})
                continue
        if new != r["spoken_cues"] or mark != r["spoken_stamp"]:
            with db.tx() as conn:
                conn.execute("UPDATE media SET spoken_cues = ?, spoken_stamp = ? WHERE id = ?", (new, mark, r["id"]))
            if new != r["spoken_cues"]:
                changed.append(r["id"])
    return {"withTranscript": have, "changed": changed, "errors": errors}


def missing(today: date, start: date, data: dict, days: int = 14) -> list[dict]:
    """Planned clips (with picture and subtitles) of the next `days` days without a spoken track — for
    the operator (PROGRESS.md), never a to-do for Matt. The file they need: Whisper large-v3 JSON
    ("version": 2 format) in transcripts/; the next import or opening the clip picks it up."""
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
                    with db.tx() as conn:
                        f = conn.execute("SELECT media_file FROM media WHERE id = ?", (mid,)).fetchone()["media_file"]
                    out.append({"date": day.isoformat(), "mediaId": mid, "title": it["title"],
                                "hint": f"transcripts/{Path(f).stem}.whisper.json fehlt (Whisper large-v3, Format version 2)"})
    return out


def load(media_id: int) -> list[dict] | None:
    with db.tx() as conn:
        r = conn.execute("SELECT spoken_cues FROM media WHERE id = ?", (media_id,)).fetchone()
    return json.loads(r["spoken_cues"]) if r and r["spoken_cues"] else None


if __name__ == "__main__":
    db.init()
    print(json.dumps(import_all(force="--force" in sys.argv), indent=2))
