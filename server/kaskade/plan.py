"""Daily plan (weeks 1–4 for Phase 2A), block timer totals and immersion hours."""
import json
from datetime import date, datetime, timedelta
from functools import lru_cache

from . import config

WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
HOURS_TO_B2 = 1150          # Refold estimate
MAX_SESSION = 3 * 3600      # a forgotten timer counts at most 3 h


# Phase-specific plans; anything else (1, 2A, unknown) uses weeks 1–4.
PHASE_FILES = {"2B": "plan/phase-2b.json"}


def _load(name: str) -> dict:
    return json.loads((config.CONTENT_DIR / name).read_text(encoding="utf-8"))


@lru_cache(maxsize=4)
def plan(phase: str | None = None) -> dict:
    """The plan for `phase`. Exam prompts and week 6 are shared, so a phase file only
    brings its own block and weeks."""
    base = _load("plan/weeks-1-4.json")
    name = PHASE_FILES.get(phase or "")
    if not name:
        return base
    return {"prompts": base["prompts"], "week6": base["week6"], **_load(name)}


def block_ids() -> set[str]:
    return {b["id"] for p in (None, *PHASE_FILES) for b in plan(p)["block"]}


def default_start(today: date) -> date:
    """Monday of this week if it's Mon–Wed, otherwise next Monday (don't start a plan on a Friday)."""
    monday = today - timedelta(days=today.weekday())
    return monday if today.weekday() <= 2 else monday + timedelta(days=7)


def plan_day(start: date, today: date, data: dict | None = None) -> dict:
    """Which plan week/day `today` is, relative to the Monday `start`."""
    data = data or plan()
    offset = (today - start).days
    week = offset // 7 + 1 if offset >= 0 else 0
    weekday = today.weekday()
    out = {"date": today.isoformat(), "weekday": WEEKDAYS[weekday], "week": week,
           "weekend": weekday >= 5, "beforeStart": offset < 0, "day": None, "theme": None,
           "goal": None, "exam": None, "mockExam": None}
    if offset < 0 or weekday >= 5:
        return out
    weeks = data["weeks"]
    w = weeks[(week - 1) % len(weeks)]  # after week 4 the cycle repeats
    day = w["days"][weekday]
    out.update(day=day, theme=w["theme"], goal=w["goal"])
    if week == 6:
        out["mockExam"] = data["week6"]
    elif day.get("exam"):
        out["exam"] = next(p for p in data["prompts"] if p["id"] == day["exam"])
    if week > len(weeks):
        out["repeat"] = True
    return out


def session_seconds(started: datetime, ended: datetime | None, now: datetime) -> int:
    end = ended or now
    return int(max(0, min(MAX_SESSION, (end - started).total_seconds())))


def totals_by_day(rows: list[dict], now: datetime) -> dict[str, int]:
    """rows: [{local_date, started_at, ended_at, seconds}] → seconds per local date."""
    out: dict[str, int] = {}
    for r in rows:
        secs = r["seconds"] if r.get("ended_at") else session_seconds(
            datetime.fromisoformat(r["started_at"]), None, now)
        out[r["local_date"]] = out.get(r["local_date"], 0) + secs
    return out


def combine(block_by_day: dict[str, int], manual: list[dict]) -> dict[str, dict[str, int]]:
    """Block-timer seconds (always active) + manual log entries → {date: {aktiv, passiv}} in seconds."""
    out: dict[str, dict[str, int]] = {}
    for day, secs in block_by_day.items():
        out.setdefault(day, {"aktiv": 0, "passiv": 0})["aktiv"] += secs
    for m in manual:
        out.setdefault(m["local_date"], {"aktiv": 0, "passiv": 0})[m["kind"]] += m["minutes"] * 60
    return out


def weekly_hours(by_day: dict[str, dict[str, int]], today: date, weeks: int = 8) -> list[dict]:
    """Active/passive hours per ISO week for the last `weeks` weeks (oldest first)."""
    monday = today - timedelta(days=today.weekday())
    out = []
    for w in range(weeks - 1, -1, -1):
        start = monday - timedelta(weeks=w)
        days = [(start + timedelta(days=i)).isoformat() for i in range(7)]
        a = sum(by_day.get(d, {}).get("aktiv", 0) for d in days) / 3600
        p = sum(by_day.get(d, {}).get("passiv", 0) for d in days) / 3600
        out.append({"week": start.isoformat(), "aktiv": round(a, 2), "passiv": round(p, 2)})
    return out


def week_days(today: date) -> list[str]:
    monday = today - timedelta(days=today.weekday())
    return [(monday + timedelta(days=i)).isoformat() for i in range(7)]


BLOCK_HOURS_PER_WEEK = 5 * 140 / 60          # 2 h 20 min active, Mo–Fr = 11.7 h
PASSIVE_HOURS_PER_WEEK = 5 * 48 / 60         # + 48 min passive listening, Mo–Fr
PHASES = [("1", 0, 75), ("2", 75, 450), ("3", 450, 750), ("4", 750, 900), ("5", 900, HOURS_TO_B2)]


def forecast(hours: float, per_week: float, today: date) -> date | None:
    """Date when `hours` reaches the B2 estimate at `per_week` hours per week."""
    if per_week <= 0:
        return None
    left = max(0.0, HOURS_TO_B2 - hours)
    return today + timedelta(weeks=left / per_week)


def phase_for_hours(hours: float) -> str:
    for name, lo, hi in PHASES:
        if lo <= hours < hi:
            return name
    return "5"


def immersion(start_hours: float, logged_seconds: int) -> dict:
    hours = start_hours + logged_seconds / 3600
    return {"hours": round(hours, 1), "target": HOURS_TO_B2, "share": round(min(1.0, hours / HOURS_TO_B2), 3)}
