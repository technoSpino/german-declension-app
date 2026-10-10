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


# ── Phase 2B plan ──────────────────────────────────────────────────────────
PLAN_2B = json.loads((config.CONTENT_DIR / "plan/phase-2b.json").read_text(encoding="utf-8"))


def test_2b_block_is_contiguous_with_less_core_deck_time():
    blocks = PLAN_2B["block"]
    assert [(b["start"], b["minutes"]) for b in blocks] == [
        ("09:00", 15), ("09:15", 65), ("10:20", 10), ("10:30", 35), ("11:05", 25)]
    # same ids/kinds as 2A, so timers, "Fertig" and week totals carry over
    assert [(b["id"], b["kind"]) for b in blocks] == [(b["id"], b["kind"]) for b in PLAN["block"]]
    t = 9 * 60
    for b in blocks:
        h, m = map(int, b["start"].split(":"))
        assert h * 60 + m == t
        t += b["minutes"]
    assert t == 11 * 60 + 30
    assert sum(b["minutes"] for b in blocks if b["kind"] != "pause") == 140


def test_every_block_has_label_and_short_label():
    for b in PLAN["block"] + PLAN_2B["block"]:
        assert b["label"].strip() and b["short"].strip() and len(b["short"]) <= 8


def test_2b_weeks_and_unchanged_exam_tasks():
    no_empty_strings({k: v for k, v in PLAN_2B.items() if k != "weeks"})
    assert [w["week"] for w in PLAN_2B["weeks"]] == [1, 2, 3, 4]
    for w2a, w2b in zip(PLAN["weeks"], PLAN_2B["weeks"]):
        assert [d["day"] for d in w2b["days"]] == ["Mo", "Di", "Mi", "Do", "Fr"]
        assert [d["exam"] for d in w2b["days"]] == [d["exam"] for d in w2a["days"]]
        for d in w2b["days"]:
            no_empty_strings({k: v for k, v in d.items() if k != "exam"})


def test_content_is_for_adults():
    """Follow-up #7: no teen/youth/children's media anywhere in plans, texts or practice items."""
    import re
    banned = [r"\bDRUCK\b", r"\bfunk\b", r"Kinderserie", r"Kinderbuch", r"Kindersendung", r"Jugendbuch",
              r"Jugendserie", r"Nachrichten für Kinder", r"\bComic"]
    for folder in ("plan", "texts", "practice"):
        for f in sorted((config.CONTENT_DIR / folder).glob("*.json")):
            text = f.read_text(encoding="utf-8")
            hits = [p for p in banned if re.search(p, text)]
            assert not hits, f"{f.name}: {hits}"
