from datetime import datetime, timedelta, timezone

from kaskade import srs

FIXED = datetime(2026, 10, 13, 7, 30, tzinfo=timezone.utc)  # Tuesday 09:30 Berlin


def at(monkeypatch, when):
    monkeypatch.setattr(srs, "now_utc", lambda: when)


def test_today_sets_plan_start_and_returns_day(client, monkeypatch):
    at(monkeypatch, FIXED)
    t = client.get("/api/today").json()
    assert t["planStart"] == "2026-10-12"
    assert t["week"] == 1 and t["weekday"] == "Di" and t["exam"]["id"] == "p01"
    assert [b["id"] for b in t["block"]] == ["karten", "input", "pause", "lesen", "pruefung"]
    assert t["running"] is None and t["immersion"]["hours"] == 150
    assert t["cards"]["new"] == 20


def test_weekend_shows_preview_of_monday(client, monkeypatch):
    at(monkeypatch, datetime(2026, 10, 10, 8, 0, tzinfo=timezone.utc))  # Saturday
    t = client.get("/api/today").json()
    assert t["weekend"] and t["day"] is None
    assert t["planStart"] == "2026-10-12"
    assert t["preview"]["date"] == "2026-10-12" and t["preview"]["exam"]["id"] == "s01"


def test_status_reports_running_timer(client, monkeypatch):
    at(monkeypatch, FIXED)
    client.post("/api/activity/start", json={"block": "lesen"})
    assert client.get("/api/status").json()["running"]["block"] == "lesen"
    client.post("/api/activity/stop")
    assert client.get("/api/status").json()["running"] is None


def test_timer_start_stop_counts_minutes(client, monkeypatch):
    at(monkeypatch, FIXED)
    assert client.post("/api/activity/start", json={"block": "input"}).status_code == 200
    assert client.get("/api/today").json()["running"]["block"] == "input"
    at(monkeypatch, FIXED + timedelta(minutes=25))
    client.post("/api/activity/stop")
    t = client.get("/api/today").json()
    assert t["blockSeconds"]["input"] == 1500
    assert t["weekTotals"]["seconds"][1] == 1500  # Tuesday
    assert t["immersion"]["hours"] == round(150 + 1500 / 3600, 1)


def test_starting_a_block_stops_the_running_one(client, monkeypatch):
    at(monkeypatch, FIXED)
    client.post("/api/activity/start", json={"block": "karten"})
    at(monkeypatch, FIXED + timedelta(minutes=10))
    client.post("/api/activity/start", json={"block": "input"})
    t = client.get("/api/today").json()
    assert t["blockSeconds"]["karten"] == 600 and t["running"]["block"] == "input"


def test_unknown_block_rejected(client):
    assert client.post("/api/activity/start", json={"block": "schlafen"}).status_code == 422
    assert client.post("/api/plan/done", json={"block": "schlafen"}).status_code == 422


def test_mark_done_and_undo(client, monkeypatch):
    at(monkeypatch, FIXED)
    client.post("/api/plan/done", json={"block": "karten"})
    assert client.get("/api/today").json()["done"] == ["karten"]
    client.post("/api/plan/done", json={"block": "karten", "done": False})
    assert client.get("/api/today").json()["done"] == []


def test_plan_and_prompt(client):
    p = client.get("/api/plan").json()
    assert len(p["weeks"]) == 4 and len(p["prompts"]) == 16
    assert client.get("/api/plan/prompt/s01").json()["skill"] == "schreiben"
    assert client.get("/api/plan/prompt/zz").status_code == 404


def test_set_plan_start_must_be_monday(client):
    assert client.put("/api/plan/start", json={"planStart": "2026-10-19"}).json()["planStart"] == "2026-10-19"
    assert client.put("/api/plan/start", json={"planStart": "2026-10-20"}).status_code == 422


def test_plan_prompt_writing_can_be_saved(client):
    r = client.post("/api/writing", json={"context": "plan:2026-10-12", "promptId": "s01", "text": "Liebe Lea, …"})
    assert r.status_code == 200 and r.json()["grade"] is None
