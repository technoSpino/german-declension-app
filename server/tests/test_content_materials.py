"""#16: every block of every plan day names exactly one real thing — no choosing, no searching."""
import json
import re

import pytest

from kaskade import config, materials, practice, texts

PLANS = ["plan/weeks-1-4.json", "plan/phase-2b.json"]
STOCK = json.loads((config.CONTENT_DIR / "plan/stock.json").read_text(encoding="utf-8"))
KEYS = {i["key"]: i for i in STOCK["items"]}
BOOKS = {b["id"]: b for b in STOCK.get("books", [])}
VAGUE = re.compile(r"z\. ?B\.|\boder\b|deiner Wahl|frei wählen|\bein(en)? Podcast\b|\bein Buch\b|\beine Serie\b", re.I)


def load(name):
    return json.loads((config.CONTENT_DIR / name).read_text(encoding="utf-8"))


def days(name):
    for w in load(name)["weeks"]:
        for d in w["days"]:
            yield w["week"], d


@pytest.mark.parametrize("name", PLANS)
def test_no_vague_assignments(name):
    for week, d in days(name):
        for field in ("focus", "karten", "input", "lesen"):
            assert not VAGUE.search(d[field]), f"{name} W{week} {d['day']} {field}: {d[field]}"


@pytest.mark.parametrize("name", PLANS)
def test_one_exact_item_per_block(name):
    for week, d in days(name):
        blocks = [m["block"] for m in d["materials"]]
        assert blocks.count("input") == 1 and blocks.count("lesen") == 1, f"W{week} {d['day']}"
        # the exam block: the day's prompt, else exactly one practice task
        assert blocks.count("pruefung") == (0 if d["exam"] else 1), f"W{week} {d['day']}"


@pytest.mark.parametrize("name", PLANS)
def test_materials_point_at_real_things(name):
    for week, d in days(name):
        for m in d["materials"]:
            where = f"{name} W{week} {d['day']} {m}"
            if m["kind"] in ("clip", "satzcheck"):
                assert KEYS[m["clip"]]["kind"] in ("mediathek", "podcast", "audio"), where
                if "to" in m:
                    assert materials.seconds(m["to"]) > materials.seconds(m.get("from", 0)), where
            elif m["kind"] in ("youtube", "netflix"):
                assert KEYS[m["clip"]]["kind"] == m["kind"], where
            elif m["kind"] == "text":
                assert texts.get(m["text"]), where
            elif m["kind"] == "news":
                assert m["feed"] in materials.NEWS_FEEDS, where
            elif m["kind"] == "book":
                assert m["book"] in BOOKS and m.get("part"), where
            elif m["kind"] == "practice":
                module = "hoeren" if m["practice"].startswith("h") else "lesen"
                assert practice.get(module, m["practice"]), where
            else:
                pytest.fail(f"unknown kind: {where}")


@pytest.mark.parametrize("name", PLANS)
def test_clip_ranges_are_named_in_the_day_text(name):
    """The day text and the data say the same: a range in the materials appears in the text."""
    for week, d in days(name):
        m = next(m for m in d["materials"] if m["block"] == "input")
        if m["kind"] == "clip" and "to" in m:
            assert f"{m.get('from', '0:00')}–{m['to']}" in d["input"], f"W{week} {d['day']}"


def test_stock_is_real_and_sourced():
    for it in STOCK["items"]:
        assert it["kind"] in ("mediathek", "podcast", "audio", "youtube", "netflix"), it["key"]
        assert it["title"] and it["source"] and it["url"].startswith("https://"), it["key"]
        if it["kind"] == "mediathek":
            assert re.match(r"https://www\.(ardmediathek|zdf|arte|3sat)\.", it["url"]), it["key"]
            # still online well after the plan's four weeks (checked by hand, re-checked daily)
            assert it["availableTo"] >= "2026-12-31", it["key"]
        if it["kind"] == "audio":
            assert it["audio"].startswith("https://") and it["availableTo"] >= "2026-12-31", it["key"]
        if it["kind"] == "netflix":
            assert it["url"].startswith("https://www.netflix.com/de/title/"), it["key"]
        if it["kind"] == "podcast":
            assert it["feed"].startswith("https://") and isinstance(it["episode"], int), it["key"]
    for b in BOOKS.values():
        assert b["author"] and b["title"] and b["format"] in ("paper", "ebook", "audiobook") and b["shops"], b["id"]


def test_every_stock_item_is_used():
    used = {m.get("clip") for name in PLANS for _, d in days(name) for m in d["materials"]}
    assert set(KEYS) <= used | {None}, set(KEYS) - used


def test_plan_prompts_are_tagged_ai():
    for p in load("plan/weeks-1-4.json")["prompts"]:
        assert p["origin"] == "ai"
