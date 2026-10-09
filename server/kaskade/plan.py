"""Daily plan (weeks 1–4 for Phase 2A), block timer totals and immersion hours."""
import json
from datetime import date, datetime, timedelta
from functools import lru_cache

from . import config

WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
HOURS_TO_B2 = 1150          # Refold estimate
MAX_SESSION = 3 * 3600      # a forgotten timer counts at most 3 h


@lru_cache(maxsize=1)
def plan() -> dict:
    return json.loads((config.CONTENT_DIR / "plan/weeks-1-4.json").read_text(encoding="utf-8"))


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


def week_days(today: date) -> list[str]:
    monday = today - timedelta(days=today.weekday())
    return [(monday + timedelta(days=i)).isoformat() for i in range(7)]


def immersion(start_hours: float, logged_seconds: int) -> dict:
    hours = start_hours + logged_seconds / 3600
    return {"hours": round(hours, 1), "target": HOURS_TO_B2, "share": round(min(1.0, hours / HOURS_TO_B2), 3)}
