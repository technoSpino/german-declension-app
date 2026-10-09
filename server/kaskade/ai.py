"""Optional AI features. Everything here returns None when ANTHROPIC_API_KEY is unset."""
import json
import logging
import re

from . import config

log = logging.getLogger(__name__)

GRADE_PROMPT = """Du bewertest einen kurzen deutschen Text eines erwachsenen Deutschlerners (Ziel: Zertifikat B1).

Aufgabe ({type}): {situation}
Inhaltspunkte:
{points}
Richtwert: etwa {words} Wörter.

Text des Lerners:
<text>
{text}
</text>

Bewerte nach vier Kriterien (je 0–5 Punkte): Erfüllung (alle Inhaltspunkte, Textsorte, Anrede/Gruß), Kohärenz (Konnektoren, Aufbau), Wortschatz (Spektrum, Richtigkeit), Strukturen (Grammatik, Satzbau).
Antworte NUR mit JSON in genau diesem Format, Texte auf einfachem Deutsch (A2–B1):
{{"level": "A2" | "A2+" | "B1" | "B1+" | "B2", "scores": {{"erfuellung": 0, "kohaerenz": 0, "wortschatz": 0, "strukturen": 0}}, "summary": "zwei Sätze Rückmeldung", "corrections": [{{"original": "…", "korrektur": "…", "erklaerung": "…"}}]}}
Höchstens 5 Korrekturen, die wichtigsten zuerst."""


def available() -> bool:
    return config.anthropic_key() is not None


def _client():
    import anthropic  # lazy: only needed with a key

    return anthropic.Anthropic(api_key=config.anthropic_key())


def parse_json(text: str) -> dict | None:
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        return None
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError:
        return None


def grade_writing(task: dict, text: str) -> dict | None:
    """Grade a B1-style writing task. None if no key or the call fails."""
    if not available() or not text.strip():
        return None
    prompt = GRADE_PROMPT.format(
        type=task.get("type", ""), situation=task.get("situation", ""),
        points="\n".join(f"- {p}" for p in task.get("points", [])),
        words=task.get("words", 80), text=text.strip(),
    )
    try:
        msg = _client().messages.create(
            model=config.ANTHROPIC_MODEL,
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}],
        )
        out = "".join(getattr(b, "text", "") for b in msg.content)
        grade = parse_json(out)
        if grade and "level" in grade:
            return grade
        log.warning("AI grade: unparseable answer")
    except Exception:  # network, auth, quota … — never break the app
        log.exception("AI grade failed")
    return None
