from datetime import date, datetime, timedelta, timezone

import pytest

from kaskade import plan

MON = date(2026, 10, 12)


@pytest.mark.parametrize("today, start", [
    (date(2026, 10, 12), MON),          # Monday
    (date(2026, 10, 14), MON),          # Wednesday → this week
    (date(2026, 10, 9), MON),           # Thursday/Friday → next Monday
    (date(2026, 10, 10), MON),          # Saturday → next Monday
    (date(2026, 10, 11), MON),          # Sunday → next Monday
])
def test_default_start(today, start):
    assert plan.default_start(today) == start


def test_first_monday_is_week_1_with_writing_task():
    d = plan.plan_day(MON, MON)
    assert d["week"] == 1 and d["weekday"] == "Mo" and not d["weekend"]
    assert d["exam"]["id"] == "s01" and d["exam"]["skill"] == "schreiben"


@pytest.mark.parametrize("offset, skill", [(0, "schreiben"), (1, "sprechen"), (2, "schreiben"), (3, "sprechen"), (4, None)])
def test_exam_rhythm(offset, skill):
    d = plan.plan_day(MON, MON + timedelta(days=offset))
    assert (d["exam"]["skill"] if d["exam"] else None) == skill


def test_all_16_prompts_once_in_four_weeks():
    seen = []
    for i in range(28):
        d = plan.plan_day(MON, MON + timedelta(days=i))
        if d["exam"]:
            seen.append(d["exam"]["id"])
    assert len(seen) == 16 and len(set(seen)) == 16


def test_weekend_and_before_start_have_no_day():
    assert plan.plan_day(MON, MON + timedelta(days=5))["weekend"] is True
    assert plan.plan_day(MON, MON + timedelta(days=5))["day"] is None
    before = plan.plan_day(MON, MON - timedelta(days=3))
    assert before["beforeStart"] is True and before["day"] is None


def test_week_6_is_mock_exam_and_week_5_repeats():
    w5 = plan.plan_day(MON, MON + timedelta(days=28))
    assert w5["week"] == 5 and w5.get("repeat") and w5["day"]
    w6 = plan.plan_day(MON, MON + timedelta(days=35))
    assert w6["week"] == 6 and w6["mockExam"]["title"] and w6["exam"] is None


def test_session_seconds_caps_forgotten_timers():
    t = datetime(2026, 10, 12, 7, tzinfo=timezone.utc)
    assert plan.session_seconds(t, t + timedelta(minutes=30), t) == 1800
    assert plan.session_seconds(t, None, t + timedelta(hours=10)) == plan.MAX_SESSION
    assert plan.session_seconds(t, t - timedelta(minutes=1), t) == 0


def test_totals_by_day_includes_running_timer():
    now = datetime(2026, 10, 12, 8, tzinfo=timezone.utc)
    rows = [
        {"local_date": "2026-10-12", "started_at": "2026-10-12T07:00:00+00:00", "ended_at": "x", "seconds": 1800},
        {"local_date": "2026-10-12", "started_at": "2026-10-12T07:50:00+00:00", "ended_at": None, "seconds": 0},
        {"local_date": "2026-10-13", "started_at": "2026-10-13T07:00:00+00:00", "ended_at": "x", "seconds": 600},
    ]
    assert plan.totals_by_day(rows, now) == {"2026-10-12": 1800 + 600, "2026-10-13": 600}


def test_week_days_start_monday():
    days = plan.week_days(date(2026, 10, 15))
    assert days[0] == "2026-10-12" and days[-1] == "2026-10-18"


def test_immersion_totals():
    i = plan.immersion(300, 3600 * 15)
    assert i["hours"] == 315 and i["target"] == 1150
    assert i["share"] == round(315 / 1150, 3)
    assert plan.immersion(2000, 0)["share"] == 1.0
