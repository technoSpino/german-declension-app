import json
from datetime import date, datetime, timedelta

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .. import db, plan, srs

router = APIRouter(prefix="/api")


def _today() -> date:
    return srs.now_utc().astimezone(srs.TZ).date()


def plan_start(today: date) -> date:
    s = db.get_setting("planStart")
    if not s:
        s = plan.default_start(today).isoformat()
        db.set_setting("planStart", s)
    return date.fromisoformat(s)


def _activity_rows(conn, since: str | None = None):
    q = "SELECT local_date, block, started_at, ended_at, seconds FROM activity"
    rows = conn.execute(q + (" WHERE local_date >= ?" if since else ""), (since,) if since else ()).fetchall()
    return [dict(r) for r in rows]


@router.get("/today")
def today():
    now = srs.now_utc()
    d = _today()
    info = plan.plan_day(plan_start(d), d)
    if info["day"] is None:
        # Weekend or before the start: show the next plan day as a preview.
        nxt = max(plan_start(d), d + timedelta(days=1))
        while nxt.weekday() >= 5:
            nxt += timedelta(days=1)
        info["preview"] = plan.plan_day(plan_start(d), nxt)
    days = plan.week_days(d)
    with db.tx() as conn:
        week_rows = _activity_rows(conn, days[0])
        all_rows = _activity_rows(conn)
        done = {r[0] for r in conn.execute("SELECT block FROM plan_done WHERE local_date = ?", (d.isoformat(),))}
        running = conn.execute("SELECT block, started_at FROM activity WHERE ended_at IS NULL").fetchone()
        placement = conn.execute(
            "SELECT result FROM placements WHERE status = 'done' ORDER BY id DESC LIMIT 1").fetchone()
        last_sc = conn.execute("SELECT created_at, result FROM satzcheck_runs ORDER BY id DESC LIMIT 1").fetchone()
        vocab = conn.execute("SELECT result FROM vocab_tests ORDER BY id DESC LIMIT 1").fetchone()

    per_block: dict[str, int] = {}
    for r in week_rows:
        if r["local_date"] == d.isoformat():
            secs = r["seconds"] if r["ended_at"] else 0
            per_block[r["block"]] = per_block.get(r["block"], 0) + secs
    by_day = plan.totals_by_day(week_rows, now)
    total = sum(plan.totals_by_day(all_rows, now).values())
    start_hours = db.get_setting("startHours", 150)
    p = json.loads(placement["result"]) if placement else None

    return {
        **info,
        "name": db.get_setting("name", "Matt"),
        "phase": db.get_setting("phase"),
        "planStart": plan_start(d).isoformat(),
        "block": plan.plan()["block"],
        "blockSeconds": per_block,
        "done": sorted(done),
        "running": {"block": running["block"], "startedAt": running["started_at"]} if running else None,
        "weekTotals": {"days": days, "seconds": [by_day.get(x, 0) for x in days]},
        "immersion": plan.immersion(start_hours, total),
        "placement": p,
        "satzcheck": {"createdAt": last_sc["created_at"], **json.loads(last_sc["result"])} if last_sc else None,
        "vocab": json.loads(vocab["result"]) if vocab else None,
        "cards": srs.stats(now),
    }


@router.get("/fahrplan")
def fahrplan():
    now = srs.now_utc()
    d = _today()
    with db.tx() as conn:
        rows = _activity_rows(conn)
        placements = conn.execute(
            "SELECT id, updated_at, result FROM placements WHERE status = 'done' ORDER BY id DESC").fetchall()
        checks = conn.execute(
            "SELECT created_at, content_type, result FROM satzcheck_runs ORDER BY id DESC LIMIT 12").fetchall()
    by_day = plan.totals_by_day(rows, now)
    total = sum(by_day.values())
    hours = plan.immersion(db.get_setting("startHours", 150), total)["hours"]
    # measured pace over the last 28 days (only once there is some data)
    since = (d - timedelta(days=28)).isoformat()
    recent = sum(s for day, s in by_day.items() if day >= since) / 3600
    measured = recent / 4 if recent >= 2 else None
    last_check = checks[0]["created_at"][:10] if checks else None
    return {
        "hours": hours,
        "target": plan.HOURS_TO_B2,
        "phase": db.get_setting("phase"),
        "hoursPhase": plan.phase_for_hours(hours),
        "phases": [{"name": n, "from": lo, "to": hi} for n, lo, hi in plan.PHASES],
        "forecast": {
            "block": plan.forecast(hours, plan.BLOCK_HOURS_PER_WEEK, d).isoformat(),
            "blockPassive": plan.forecast(hours, plan.BLOCK_HOURS_PER_WEEK + plan.PASSIVE_HOURS_PER_WEEK, d).isoformat(),
            "measured": plan.forecast(hours, measured, d).isoformat() if measured else None,
            "measuredPerWeek": round(measured, 1) if measured else None,
            "blockPerWeek": round(plan.BLOCK_HOURS_PER_WEEK, 1),
        },
        "placements": [{"id": r["id"], "date": r["updated_at"], **json.loads(r["result"])} for r in placements],
        "satzchecks": [{"date": r["created_at"], "contentType": r["content_type"], **json.loads(r["result"])} for r in checks],
        "nextCheck": (date.fromisoformat(last_check) + timedelta(days=28)).isoformat() if last_check else None,
    }


class BlockIn(BaseModel):
    block: str


def _check_block(block: str):
    if block not in {b["id"] for b in plan.plan()["block"]} | {"extra"}:
        raise HTTPException(422, "Unbekannter Block")


def _stop_running(conn, now):
    for r in conn.execute("SELECT id, started_at FROM activity WHERE ended_at IS NULL").fetchall():
        secs = plan.session_seconds(datetime.fromisoformat(r["started_at"]), now, now)
        conn.execute("UPDATE activity SET ended_at = ?, seconds = ? WHERE id = ?", (now.isoformat(), secs, r["id"]))


@router.post("/activity/start")
def start(body: BlockIn):
    _check_block(body.block)
    now = srs.now_utc()
    with db.tx() as conn:
        _stop_running(conn, now)
        conn.execute("INSERT INTO activity(local_date, block, started_at) VALUES (?, ?, ?)",
                     (srs.local_date(now), body.block, now.isoformat()))
    return {"block": body.block, "startedAt": now.isoformat()}


@router.post("/activity/stop")
def stop():
    now = srs.now_utc()
    with db.tx() as conn:
        _stop_running(conn, now)
    return {"ok": True}


class DoneIn(BaseModel):
    block: str
    done: bool = True


@router.post("/plan/done")
def mark_done(body: DoneIn):
    _check_block(body.block)
    d = _today().isoformat()
    with db.tx() as conn:
        if body.done:
            conn.execute("INSERT OR IGNORE INTO plan_done(local_date, block) VALUES (?, ?)", (d, body.block))
        else:
            conn.execute("DELETE FROM plan_done WHERE local_date = ? AND block = ?", (d, body.block))
    return {"block": body.block, "done": body.done}


@router.get("/plan")
def full_plan():
    d = _today()
    return {**plan.plan(), "planStart": plan_start(d).isoformat(), "today": plan.plan_day(plan_start(d), d)}


@router.get("/plan/prompt/{prompt_id}")
def prompt(prompt_id: str):
    p = next((p for p in plan.plan()["prompts"] if p["id"] == prompt_id), None)
    if not p:
        raise HTTPException(404, "Aufgabe nicht gefunden")
    return p


class StartIn(BaseModel):
    planStart: date


@router.put("/plan/start")
def set_start(body: StartIn):
    if body.planStart.weekday() != 0:
        raise HTTPException(422, "Der Plan beginnt immer an einem Montag.")
    db.set_setting("planStart", body.planStart.isoformat())
    return {"planStart": body.planStart.isoformat()}
