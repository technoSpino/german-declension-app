"""#16: exact assignments per block, Material für heute und morgen, notices, stock, Materialcheck."""
import json
from datetime import date, datetime, timezone

import pytest

from kaskade import config, db, materials, plan, srs, stock

SUNDAY = datetime(2026, 10, 11, 17, 0, tzinfo=timezone.utc)   # Sun 19:00 Berlin, day before the start
MONDAY = datetime(2026, 10, 12, 7, 0, tzinfo=timezone.utc)    # Mon 09:00 Berlin, week 1


@pytest.fixture()
def b2(client, monkeypatch):
    """Matt's setup: phase 2B, plan starts Mon 12 Oct; offline (no news, no link checks)."""
    monkeypatch.setenv("KASKADE_OFFLINE", "1")
    db.set_setting("phase", "2B")
    db.set_setting("planStart", "2026-10-12")
    return client


def at(monkeypatch, when):
    monkeypatch.setattr(srs, "now_utc", lambda: when)


def add_clip(key, seconds=5361.0, status="ready", file=True):
    name = f"stock-{key}.mp4"
    if file:
        config.MEDIA_DIR.mkdir(parents=True, exist_ok=True)
        (config.MEDIA_DIR / name).write_bytes(b"x")
    cues = [{"start": 1.0, "end": seconds, "text": "Wo waren Sie gestern Abend?"}]
    with db.tx() as conn:
        cur = conn.execute(
            "INSERT INTO media(created_at, kind, title, media_file, cues, key, tag, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (db.now_iso(), "mediathek", key, name, json.dumps(cues), key, "krimi", status))
        return cur.lastrowid


def by_block(group):
    return {it["block"]: it for it in group["items"]}


def test_sunday_shows_monday_with_tatort_ready(b2, monkeypatch):
    at(monkeypatch, SUNDAY)
    mid = add_clip("tatort-schweigen")
    m = b2.get("/api/materials").json()
    assert m["today"]["date"] == "2026-10-11" and not m["today"]["planDay"] and m["today"]["items"] == []
    assert m["next"]["date"] == "2026-10-12" and m["next"]["kind"] == "tomorrow" and m["next"]["planDay"]
    items = by_block(m["next"])
    assert list(items) == ["karten", "input", "lesen", "pruefung"]
    tatort = items["input"]
    assert tatort["title"] == "Tatort: Schweigen" and tatort["part"] == "0:00–30:14" and tatort["minutes"] == 30
    assert tatort["status"] == "ready" and tatort["source"] == "ARD Mediathek · NDR" and tatort["origin"] == "real"
    assert tatort["start"] == {"to": f"/schauen/{mid}?von=0&bis=1814"}
    # the podcast isn't in this library yet → a real gap, said plainly
    assert items["lesen"]["status"] == "todo" and "Bibliothek" in items["lesen"]["detail"]
    # Monday's exam is a writing task: keyboard, and no AI grading without a key
    assert items["pruefung"]["detail"] == "≈ 20 min, Tastatur · nur Selbstcheck, keine KI-Bewertung"
    assert items["pruefung"]["origin"] == "ai"
    assert m["httpsUrl"] == config.HTTPS_URL


def test_monday_today_and_tuesday_with_microphone(b2, monkeypatch):
    at(monkeypatch, MONDAY)
    add_clip("tatort-schweigen")
    m = b2.get("/api/materials").json()
    assert m["today"]["date"] == "2026-10-12" and m["next"]["date"] == "2026-10-13" and m["next"]["kind"] == "tomorrow"
    tue = by_block(m["next"])
    assert tue["pruefung"]["skill"] == "sprechen" and tue["pruefung"]["check"] == "secure"
    assert tue["pruefung"]["detail"] == "Mikrofon / Headset"
    assert tue["input"]["part"] == "30:14–60:40"
    # tomorrow's news: the links appear on the morning itself
    assert tue["lesen"]["kind"] == "news" and tue["lesen"]["links"] == [] and "am Morgen" in tue["lesen"]["detail"]


def test_friday_next_plan_day_is_monday(b2, monkeypatch):
    at(monkeypatch, datetime(2026, 10, 16, 7, 0, tzinfo=timezone.utc))
    m = b2.get("/api/materials").json()
    assert m["today"]["date"] == "2026-10-16" and m["today"]["planDay"]
    assert m["next"]["date"] == "2026-10-19" and m["next"]["kind"] == "next"
    assert by_block(m["next"])["input"]["title"].startswith("Merz gegen Merz, Folge 1")


def test_next_plan_day_rules():
    data = plan.plan("2B")
    start = date(2026, 10, 12)
    assert materials.next_plan_day(start, date(2026, 10, 10), data) == (date(2026, 10, 12), "next")      # Sat before
    assert materials.next_plan_day(start, date(2026, 10, 11), data) == (date(2026, 10, 12), "tomorrow")  # Sun
    assert materials.next_plan_day(start, date(2026, 10, 14), data) == (date(2026, 10, 15), "tomorrow")
    assert materials.next_plan_day(start, date(2026, 10, 17), data) == (date(2026, 10, 19), "next")      # Sat
    assert materials.next_plan_day(start, date(2026, 10, 7), data) == (date(2026, 10, 12), "next")       # before start


def test_preview_query_for_another_day_and_phase(b2, monkeypatch):
    at(monkeypatch, MONDAY)
    m = b2.get("/api/materials", params={"today": "2026-10-16", "phase": "2A"}).json()
    assert m["next"]["date"] == "2026-10-19"
    assert by_block(m["today"])["pruefung"]["kind"] == "practice"   # Friday: practice task instead of a prompt
    assert b2.get("/api/materials", params={"phase": "9Z"}).status_code == 422


def test_clip_status_follows_the_library_and_his_position(b2, monkeypatch):
    at(monkeypatch, MONDAY)
    mid = add_clip("tatort-schweigen", status="converting")
    item = lambda: by_block(b2.get("/api/materials", params={"today": "2026-10-13"}).json()["today"])["input"]  # Tue 30:14–60:40
    assert item()["status"] == "todo" and "umgewandelt" in item()["detail"]
    with db.tx() as conn:
        conn.execute("UPDATE media SET status = 'ready' WHERE id = ?", (mid,))
    assert item()["status"] == "ready" and item()["detail"] == "in deiner Bibliothek"
    b2.put(f"/api/media/{mid}/progress", json={"position": 1200})   # behind: stopped at 20:00 on Monday
    assert item()["detail"].endswith("du bist bei 20:00: ab deiner Position bis 60:40")
    b2.put(f"/api/media/{mid}/progress", json={"position": 2400})
    assert item()["detail"].endswith("weiter ab 40:00")
    b2.put(f"/api/media/{mid}/progress", json={"position": 3700})
    assert item()["detail"].endswith("Ziel schon erreicht ✓")


def test_missing_file_is_a_gap(b2, monkeypatch):
    at(monkeypatch, MONDAY)
    add_clip("tatort-schweigen", file=False)
    it = by_block(b2.get("/api/materials").json()["today"])["input"]
    assert it["status"] == "todo"


FEED = b"""<?xml version="1.0"?><rss><channel>
<item><title>Liveblog: Alles zum Gipfel</title><link>https://www.tagesschau.de/ausland/liveblog-gipfel-100.html</link><pubDate>Mon, 12 Oct 2026 06:50:00 +0200</pubDate></item>
<item><title>Bahn erh\xc3\xb6ht Preise</title><link>https://www.tagesschau.de/wirtschaft/bahn-preise-100.html</link><pubDate>Mon, 12 Oct 2026 06:40:00 +0200</pubDate></item>
<item><title>Neue Regeln f\xc3\xbcr Mieter</title><link>https://www.tagesschau.de/inland/mieter-100.html</link><pubDate>Mon, 12 Oct 2026 06:10:00 +0200</pubDate></item>
<item><title>Video: Sturm im Norden</title><link>https://www.tagesschau.de/multimedia/video/sturm-100.html</link><pubDate>Mon, 12 Oct 2026 05:00:00 +0200</pubDate></item>
<item><title>Streik an Flugh\xc3\xa4fen</title><link>https://www.tagesschau.de/inland/streik-100.html</link><pubDate>Mon, 12 Oct 2026 05:30:00 +0200</pubDate></item>
<item><title>Herbstferien beginnen</title><link>https://www.tagesschau.de/inland/ferien-100.html</link><pubDate>Sun, 11 Oct 2026 20:00:00 +0200</pubDate></item>
</channel></rss>"""


def test_news_picks_three_articles_once_per_day(b2, monkeypatch):
    picked = materials.pick_articles(FEED)
    assert [a["title"] for a in picked] == ["Bahn erhöht Preise", "Neue Regeln für Mieter", "Streik an Flughäfen"]
    calls = []
    monkeypatch.setattr(materials, "fetch_feed", lambda url: calls.append(url) or FEED)
    day = date(2026, 10, 13)
    assert materials.news_for(date(2026, 10, 14), "inland", day) is None           # tomorrow: not yet
    first = materials.news_for(day, "inland", day)
    assert len(first) == 3 and materials.news_for(day, "inland", day) == first     # fixed for the day
    assert len(calls) == 1


def test_assignments_on_heute_open_exactly_that(b2, monkeypatch):
    at(monkeypatch, MONDAY)
    mid = add_clip("tatort-schweigen")
    t = b2.get("/api/today").json()
    assert t["assignments"]["input"]["start"]["to"] == f"/schauen/{mid}?von=0&bis=1814"
    assert t["assignments"]["pruefung"]["start"]["to"] == "/aufgabe/s01"
    assert t["assignments"]["karten"]["start"]["to"] == "/karten"
    assert t["httpsUrl"] == config.HTTPS_URL
    # weekend: the preview day's assignments
    at(monkeypatch, datetime(2026, 10, 17, 8, 0, tzinfo=timezone.utc))
    assert b2.get("/api/today").json()["assignments"]["input"]["title"].startswith("Merz gegen Merz, Folge 1")


def test_youtube_opens_in_language_reactor(b2, monkeypatch):
    at(monkeypatch, MONDAY)
    fri = by_block(b2.get("/api/materials", params={"today": "2026-10-23"}).json()["today"])   # week 2 Fri
    yt = fri["input"]
    assert yt["kind"] == "youtube" and yt["part"] == "0:00–14:30"
    assert yt["start"] == {"href": "https://www.youtube.com/watch?v=ERHUpp091Kw&t=0s", "note": "in Chrome mit Language Reactor"}


def test_netflix_opens_the_title_page(b2, monkeypatch):
    at(monkeypatch, MONDAY)
    wed = by_block(b2.get("/api/materials", params={"today": "2026-10-21"}).json()["today"])
    nf = wed["input"]
    assert nf["kind"] == "netflix" and nf["part"] == "Staffel 1, Folge 1 „It's the Economy, Stupid“, 0:00–24:00"
    assert nf["start"]["href"] == "https://www.netflix.com/de/title/81389612"


def test_notices_language_reactor_until_ticked(b2, monkeypatch):
    at(monkeypatch, SUNDAY)
    n = b2.get("/api/materials").json()["notices"]
    lr = next(x for x in n if x["id"] == "language-reactor")
    assert lr["firstDay"] == "2026-10-21" and lr["by"] == "2026-10-19"   # Netflix on Wed of week 2
    assert b2.post("/api/setup/language-reactor", json={"done": True}).status_code == 200
    assert not any(x["id"] == "language-reactor" for x in b2.get("/api/materials").json()["notices"])
    assert b2.post("/api/setup/nope", json={}).status_code == 404
    assert any(x["id"] == "language-reactor" for x in b2.get("/api/fahrplan").json()["notices"]) is False


def test_book_notice_a_week_ahead(b2, monkeypatch):
    book = {"id": "verbrechen", "author": "Ferdinand von Schirach", "title": "Verbrechen", "format": "paper",
            "isbn": "978-3-442-74222-3", "shops": [{"name": "Thalia", "url": "https://www.thalia.de/"}]}
    cat = {**stock.catalog(), "books": [book]}
    monkeypatch.setattr(stock, "catalog", lambda: cat)
    data = json.loads(json.dumps(plan.plan("2B")))
    data["weeks"][1]["days"][0]["materials"][1] = {"block": "lesen", "kind": "book", "book": "verbrechen", "part": "S. 7–40: Fähner"}
    ctx = materials.Ctx(date(2026, 10, 11))
    n = materials.notices(date(2026, 10, 12), date(2026, 10, 11), data, ctx)
    v = next(x for x in n if x["id"] == "verbrechen")
    assert v["firstDay"] == "2026-10-19" and v["by"] == "2026-10-12"            # paper: a week ahead
    assert stock.notice(date(2026, 10, 19), "ebook") == date(2026, 10, 17)        # ebook: two days
    item = materials._book(data["weeks"][1]["days"][0]["materials"][1], ctx, date(2026, 10, 19))
    assert item["status"] == "todo" and item["detail"] == "Kaufen bis 12.10."
    assert b2.post("/api/books/verbrechen/bought", json={"done": True}).json()["bought"]
    assert materials._book(data["weeks"][1]["days"][0]["materials"][1], materials.Ctx(date(2026, 10, 11)), None)["status"] == "ready"


def test_clip_tags_guessed_and_editable(b2):
    assert stock.guess_tag("Tatort: Schweigen") == "krimi"
    assert stock.guess_tag("Merz gegen Merz, Folge 1") == "comedy"
    assert stock.guess_tag("Urlaubsvideo") is None
    mid = add_clip("x-clip")
    assert b2.patch(f"/api/media/{mid}", json={"tag": "doku"}).json()["tag"] == "doku"
    assert b2.patch(f"/api/media/{mid}", json={"tag": "quatsch"}).status_code == 422
    assert {t["id"] for t in b2.get("/api/media/tags").json()} >= {"krimi", "comedy", "doku"}


def test_stock_links_existing_uploads_and_fetches_due_items(b2, monkeypatch):
    with db.tx() as conn:
        conn.execute("INSERT INTO media(created_at, kind, title, cues) VALUES (?, 'upload', ?, '[]')",
                     (db.now_iso(), "Tatort: Schweigen (NDR, ARD Mediathek)"))
    assert "tatort-schweigen" in stock.link_existing()
    fetched = []
    monkeypatch.setattr(stock, "FETCHERS", {"mediathek": lambda it: fetched.append(it["key"]),
                                            "podcast": lambda it: fetched.append(it["key"])})
    report = stock.run(date(2026, 10, 11), only={"soko-leipzig-das-auge", "egp-698", "tatort-schweigen"})
    assert sorted(fetched) == ["egp-698", "soko-leipzig-das-auge"] and not report["failed"]


def test_podcast_episode_by_number():
    xml = b"""<rss><channel><item><title>701: Aktivismus</title><enclosure url="https://cdn/701.mp3"/></item>
    <item><title>698: Wie Lara Deutsch gelernt hat</title><enclosure url="https://cdn/698.mp3"/></item></channel></rss>"""
    assert stock.podcast_episode(xml, "698")["url"] == "https://cdn/698.mp3"
    assert stock.podcast_episode(xml, "69") is None


def test_materialcheck_lists_real_gaps_only(b2, monkeypatch):
    at(monkeypatch, SUNDAY)
    add_clip("tatort-schweigen")
    result = materials.check(date(2026, 10, 11), date(2026, 10, 12), plan.plan("2B"), days=3, links=False)
    gaps = {(g["date"], g["block"]) for g in result["gaps"]}
    assert ("2026-10-12", "input") not in gaps          # Tatort is there
    assert ("2026-10-12", "lesen") in gaps              # the podcast isn't (in this test library)
    written = materials.write_check(date(2026, 10, 11))
    assert (config.DATA_DIR / "materialcheck.json").exists() and "gaps" in written


def test_bald_faellig_schirach_first_no_kaenguru(b2, monkeypatch):
    """Update 5/6: the week-2 book is Schirach (paper by Mon 12.10., ebook by Sat 17.10.); Känguru has no card."""
    at(monkeypatch, SUNDAY)
    n = b2.get("/api/materials").json()["notices"]
    assert [x["by"] for x in n] == sorted(x["by"] for x in n)
    v = next(x for x in n if x["id"] == "schirach-verbrechen")
    assert (v["by"], v["byEbook"], v["firstDay"], v["week"]) == ("2026-10-12", "2026-10-17", "2026-10-19", 2)
    assert v["book"]["isbn"] == "978-3-442-77066-3" and v["book"]["price"] == "12,00 €"
    assert not any("kaenguru" in x["id"] for x in n)
    g = next(x for x in n if x["id"] == "gut-gegen-nordwind")
    assert g["week"] == 4 and g["by"] == "2026-10-26"
    f = b2.get("/api/fahrplan").json()
    assert f["today"] == "2026-10-11" and any(x["id"] == "schirach-verbrechen" for x in f["notices"])
    # Monday of week 2: whole stories
    mon = by_block(b2.get("/api/materials", params={"today": "2026-10-19"}).json()["today"])
    assert mon["lesen"]["kind"] == "book" and mon["lesen"]["part"] == "S. 7–42: „Fähner“ und „Tanatas Teeschale“"


def test_today_shows_another_day_and_every_exam_block_has_a_target(client):
    """#20: /api/today?today=…&phase=… (drives the E2E); the Prüfungsteil always opens its task."""
    from kaskade import db
    db.set_setting("planStart", "2026-10-12")
    want = {"2026-10-12": "/aufgabe/s01", "2026-10-13": "/aufgabe/p01", "2026-10-14": "/aufgabe/s02",
            "2026-10-15": "/aufgabe/p02", "2026-10-16": "/pruefung/lesen/l1"}
    for iso, to in want.items():
        r = client.get(f"/api/today?today={iso}&phase=2B").json()
        assert r["date"] == iso and r["assignments"]["pruefung"]["start"] == {"to": to}
        assert r["assignments"]["karten"]["start"] == {"to": "/karten"}
    assert client.get("/api/today?phase=3").status_code == 422
