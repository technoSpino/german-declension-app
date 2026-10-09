"""Content validation for data/plan."""
import json

from kaskade import config

from .test_content_placement import no_empty_strings

PLAN = json.loads((config.CONTENT_DIR / "plan/weeks-1-4.json").read_text(encoding="utf-8"))


def test_no_empty_strings():
    no_empty_strings({k: v for k, v in PLAN.items() if k != "weeks"})
    for w in PLAN["weeks"]:
        for d in w["days"]:
            no_empty_strings({k: v for k, v in d.items() if k != "exam"})


def test_block_matches_phase_2a_schedule():
    assert [(b["start"], b["minutes"]) for b in PLAN["block"]] == [
        ("09:00", 30), ("09:30", 55), ("10:25", 10), ("10:35", 30), ("11:05", 25)]


def test_four_weeks_of_five_days():
    assert [w["week"] for w in PLAN["weeks"]] == [1, 2, 3, 4]
    for w in PLAN["weeks"]:
        assert [d["day"] for d in w["days"]] == ["Mo", "Di", "Mi", "Do", "Fr"]


def test_exam_rhythm_and_prompts_used_once():
    ids = {p["id"]: p for p in PLAN["prompts"]}
    used = []
    for w in PLAN["weeks"]:
        skills = [ids[d["exam"]]["skill"] if d["exam"] else None for d in w["days"]]
        assert skills == ["schreiben", "sprechen", "schreiben", "sprechen", None]
        used += [d["exam"] for d in w["days"] if d["exam"]]
    assert sorted(used) == sorted(ids) and len(used) == 16


def test_prompts_well_formed():
    for p in PLAN["prompts"]:
        assert p["skill"] in ("schreiben", "sprechen")
        assert 3 <= len(p["points"]) <= 5 and p["tips"]
        if p["skill"] == "schreiben":
            assert 30 <= p["words"] <= 120
    types = {p["type"] for p in PLAN["prompts"]}
    assert len(types) >= 5


def test_week6_placeholder():
    assert PLAN["week6"]["title"] and PLAN["week6"]["note"]
