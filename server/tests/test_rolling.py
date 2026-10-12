"""#21: clip ranges roll from Matt's real position; later days and clips shift; nothing is skipped."""
from datetime import date, timedelta

import pytest

from kaskade import plan, rolling

MON = date(2026, 10, 12)
TATORT_END = 5361  # 89:21, the plan's last Tatort cut (before the credits)


def plan_slots():
    return rolling.slots(MON, plan.plan("2B"), "input")


def clips_for(block_slots, cues=None, durations=None):
    out = {}
    for s in block_slots:
        if rolling.rolls(s["m"]):
            out.setdefault(s["m"]["clip"], {"planned": [], "cues": cues or [], "end": None})["planned"].append(s)
    for key, c in out.items():
        c["end"] = rolling.clip_end(c["planned"], (durations or {}).get(key, 2400))
    return out


def test_day_range_splits_the_rest_evenly():
    assert rolling.day_range(430, TATORT_END, 1500, []) == (430, 430 + round((TATORT_END - 430) / 3), False)
    assert rolling.day_range(0, 1800, 1500, []) == (0, 1800, True)          # 1.2 days' worth → one day
    assert rolling.day_range(0, 2220, 1500, []) == (0, 1110, False)          # 1.48 → two even days, not 25 + 12
    assert rolling.day_range(3, 900, 1500, []) == (0, 900, True)             # a few seconds in = from the start
    assert rolling.day_range(100, None, 1500, []) == (100, None, True)       # unknown length: the rest


def test_cuts_land_in_a_pause_between_lines():
    cues = [{"start": t, "end": t + 3.9, "text": "…"} for t in range(0, 3000, 4)]   # 0.1 s gaps
    cues.append({"start": 3000, "end": 3002, "text": "…"})
    cues = sorted(cues, key=lambda c: c["start"])
    cues.insert(0, {"start": -10, "end": -9, "text": ""})
    # a real pause: nothing from 1495.9 to 1504
    cues = [c for c in cues if not 1496 <= c["start"] < 1504]
    assert rolling.cut_near(cues, 1500) == 1502.0          # in the pause, 2 s before the next line
    assert rolling.cut_near([], 1500) == 1500


def test_tatort_rolls_from_7_10_and_soko_moves_back():
    s = plan_slots()
    clips = clips_for(s)
    out = rolling.schedule(s, clips, {"tatort-schweigen": 430}, 1500, MON + timedelta(days=1))
    tue, wed, thu, fri = (out[MON + timedelta(days=d)] for d in (1, 2, 3, 4))
    assert tue["clip"] == "tatort-schweigen" and tue["from"] == 430 and not tue["final"]
    assert wed["from"] == tue["to"] and thu["from"] == wed["to"] and thu["to"] == TATORT_END and thu["final"]
    assert fri["clip"] == "soko-leipzig-das-auge" and fri["from"] == 0   # SOKO a day later, from its start
    assert out[MON + timedelta(days=7)]["clip"] == "soko-leipzig-das-auge"  # … its second half on Monday
    assert out[MON + timedelta(days=8)]["clip"] == "merz-gegen-merz-1"     # and everything after one slot later
    # the day text names the computed range; "(Ende)" only on the clip's last day
    assert f"7:10–{rolling.clock(tue['to'])}" in tue["text"] and "0:00–30:14" not in tue["text"]
    assert wed["text"].startswith("Tatort: Schweigen, 34:") and "(Ende)" not in wed["text"]
    assert f"–89:21 (Ende)" in thu["text"]
    assert fri["text"].startswith("Neuer Krimi: SOKO")           # SOKO's first day keeps its intro …
    assert out[MON + timedelta(days=7)]["text"].startswith("SOKO Leipzig „Das Auge“, 21:")  # … the second half its own


def test_on_track_follows_the_plan_order_and_ahead_moves_up():
    s = plan_slots()
    clips = clips_for(s)
    done = {"tatort-schweigen": TATORT_END}
    out = rolling.schedule(s, clips, done, 1500, MON + timedelta(days=2))   # Tatort finished by Wednesday
    assert out[MON + timedelta(days=2)]["clip"] == "soko-leipzig-das-auge"  # SOKO moves up a day


def test_today_is_fixed_and_a_ticked_off_block_doesnt_count_as_reached():
    s = plan_slots()
    clips = clips_for(s)
    frozen = {"clip": "tatort-schweigen", "from": 0, "to": 1814}
    out = rolling.schedule(s, clips, {"tatort-schweigen": 430}, 1500, MON, frozen=frozen, today_done=True)
    assert (out[MON]["from"], out[MON]["to"]) == (0, 1814)
    assert out[MON + timedelta(days=1)]["from"] == 430           # tomorrow from where he really is
    out = rolling.schedule(s, clips, {"tatort-schweigen": 430}, 1500, MON, frozen=frozen)
    assert out[MON + timedelta(days=1)]["from"] == 1814          # not ticked off yet: assume he gets there
    # ticked off before anything was fixed (the day this shipped): today shows what was planned
    out = rolling.schedule(s, clips, {"tatort-schweigen": 430}, 1500, MON, today_done=True)
    assert (out[MON]["clip"], out[MON]["from"], out[MON]["to"]) == ("tatort-schweigen", 0, 1814)
    assert out[MON + timedelta(days=1)]["from"] == 430


def test_a_short_clip_never_started_is_not_finished():
    s = plan_slots()
    clips = clips_for(s, durations={"tatort-schweigen": 9})
    clips["tatort-schweigen"]["end"] = 9
    out = rolling.schedule(s, clips, {}, 1500, MON)
    assert out[MON]["clip"] == "tatort-schweigen" and (out[MON]["from"], out[MON]["to"]) == (0, 9)


def test_film_budget_default_then_his_pace(client):
    from kaskade import db
    assert rolling.film_budget("input", 65) == 25 * 60
    with db.tx() as conn:
        for i, (start, reached, secs) in enumerate([(0, 1200, 3600), (1200, 2400, 3600), (2400, 3700, 3900)]):
            d = f"2026-10-{12 + i}"
            conn.execute("INSERT INTO watch_ranges(local_date, block, clip, start, end, clean, reached) VALUES (?, 'input', 'x', ?, ?, 1, ?)",
                         (d, start, start + 1500, reached))
            conn.execute("INSERT INTO activity(local_date, block, started_at, ended_at, seconds) VALUES (?, 'input', ?, ?, ?)",
                         (d, d, d, secs))
    assert rolling.film_budget("input", 65) == pytest.approx(1200 / 3600 * 65 * 60)   # median pace × 65 min
