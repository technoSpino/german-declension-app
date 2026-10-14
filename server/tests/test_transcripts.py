"""#29: the "gesprochen" track from Whisper words. All sentences here are invented for the tests."""
import json

from kaskade import db, transcripts as tr


def words(text, at, step=0.3, gap=0.05, p=0.9):
    """Whisper-like words: each `step - gap` long, starting `step` apart from `at`."""
    out = []
    for i, w in enumerate(text.split()):
        s = round(at + i * step, 2)
        out.append({"w": w, "s": s, "e": round(s + step - gap, 2), "p": p})
    return out


def seg(text, at, **kw):
    ws = words(text, at, **kw)
    return {"start": ws[0]["s"], "end": ws[-1]["e"], "text": text, "no_speech_prob": 0.01, "avg_logprob": -0.2,
            "words": ws}


def texts(lines):
    return [" ".join(w["w"] for w in ln) for ln in lines]


# ── line builder ──

def test_lines_end_after_a_sentence_and_at_a_pause():
    ws = words("Wo warst du gestern? Ich war im Kino", 0.0) + words("mit meiner Schwester.", 3.2)
    assert texts(tr.build_lines(ws)) == ["Wo warst du gestern?", "Ich war im Kino", "mit meiner Schwester."]


def test_a_dot_after_a_number_or_title_ends_nothing():
    ws = words("Am 3. Oktober kommt Dr. Albers wieder.", 0.0)
    assert texts(tr.build_lines(ws)) == ["Am 3. Oktober kommt Dr. Albers wieder."]


def test_a_long_line_splits_at_its_last_comma():
    ws = words("Wenn du morgen kommst, bring bitte das Buch mit, sonst muss ich es dir am Freitag mit der Post schicken.", 0.0)
    lines = texts(tr.build_lines(ws))
    assert lines == ["Wenn du morgen kommst, bring bitte das Buch mit,", "sonst muss ich es dir am Freitag mit der Post schicken."]


def test_a_long_line_without_comma_splits_at_its_longest_pause():
    ws = words("Wir fahren heute mit dem alten Zug", 0.0, step=0.4) + words("nach Hamburg und dann weiter an die Ostsee zu meiner Tante.", 3.0, step=0.4)
    # 21 words, the gap at 2.8 → 3.0 is 0.25 s (no 0.7-s pause): the longest one
    assert texts(tr.build_lines(ws)) == ["Wir fahren heute mit dem alten Zug", "nach Hamburg und dann weiter an die Ostsee zu meiner Tante."]


def test_no_line_shorter_than_0_6_s_unless_a_whole_sentence():
    ws = words("Und dann", 0.0, step=0.2) + words("ging sie einfach nach Hause.", 1.5) + words("Ich?", 4.0, step=0.3) + words("Ja, du.", 5.0)
    lines = texts(tr.build_lines(ws))
    assert lines[0] == "Und dann ging sie einfach nach Hause."  # 0.35-s fragment joined to what follows
    assert "Ich?" in lines  # 0.25 s, but a sentence on its own


# ── hallucinations ──

def test_vielen_dank_over_music_is_dropped_but_the_same_words_over_speech_stay():
    ard = [{"start": 10.0, "end": 14.0, "text": "♪ Leise Klaviermusik ♪"},
           {"start": 20.0, "end": 22.0, "text": "Vielen Dank."}]
    t = {"segments": [seg("Vielen Dank.", 11.0, p=0.6), seg("Vielen Dank.", 20.2, p=0.6),
                      seg("Das ist schön hier.", 30.0, p=0.5), seg("Untertitel im Auftrag des Senders", 40.0, p=0.9)]}
    track = tr.spoken_cues(t, ard)
    spoken = [c["text"] for c in track if not c["text"].startswith("♪")]
    assert spoken == ["Vielen Dank."] and next(c for c in track if c["text"] == "Vielen Dank.")["start"] == 20.2
    # no ARD speech near 30 s and unsure (p 0.5): dropped; a known phrase goes even when Whisper is sure


def test_sure_speech_without_an_ard_line_stays():
    """ARD leaves whole lines out — that is the point of the track."""
    t = {"segments": [seg("Ich hab das nachgeprüft.", 5.0, p=0.92)]}
    assert [c["text"] for c in tr.spoken_cues(t, [])] == ["Ich hab das nachgeprüft."]


def test_sound_cues_stay_interleaved_by_time():
    ard = [{"start": 0.5, "end": 2.0, "text": "Kommst du mit?"}, {"start": 2.5, "end": 4.0, "text": "* Glockenläuten *"},
           {"start": 4.5, "end": 6.0, "text": "Gleich."}]
    t = {"segments": [seg("Kommst du heute mit?", 0.6), seg("Ja, gleich.", 4.6)]}
    track = tr.spoken_cues(t, ard)
    assert [c["text"] for c in track] == ["Kommst du heute mit?", "* Glockenläuten *", "Ja, gleich."]
    assert track[0] == {"start": 0.6, "end": 1.75, "text": "Kommst du heute mit?"}  # word times, not ARD's


# ── import ──

def test_import_builds_the_track_once_and_follows_the_file(client):
    from kaskade import config
    cues = [{"start": 1.0, "end": 3.0, "text": "Wo ist der Schlüssel?"}]
    with db.tx() as conn:
        mid = conn.execute("INSERT INTO media(created_at, kind, title, media_file, cues) VALUES (?, ?, ?, ?, ?)",
                           (db.now_iso(), "upload", "Probe", "upload-7.mp4", json.dumps(cues))).lastrowid
        conn.execute("INSERT INTO media(created_at, kind, title, media_file, cues) VALUES (?, ?, ?, ?, ?)",
                     (db.now_iso(), "upload", "Ohne", "upload-8.mp4", "[]"))
    tr.transcripts_dir().mkdir(parents=True, exist_ok=True)
    f = config.DATA_DIR / "transcripts" / "upload-7.whisper.json"
    f.write_text(json.dumps({"model": "test", "segments": [seg("Wo ist denn der Schlüssel?", 1.1)]}), encoding="utf-8")
    assert tr.import_all() == {"withTranscript": [mid], "changed": [mid], "errors": []}
    assert tr.import_all()["changed"] == []  # idempotent
    assert tr.load(mid)[0]["text"] == "Wo ist denn der Schlüssel?"
    m = client.get(f"/api/media/{mid}").json()
    assert m["spokenCues"][0]["text"] == "Wo ist denn der Schlüssel?" and m["cues"][0]["text"] == "Wo ist der Schlüssel?"
    assert [x["hasSpoken"] for x in client.get("/api/media").json() if x["id"] == mid] == [True]
    f.write_text("{kaputt", encoding="utf-8")
    r = tr.import_all()
    assert r["errors"][0]["mediaId"] == mid and tr.load(mid)  # a broken file keeps the last good track
    f.unlink()
    assert tr.import_all()["changed"] == [mid] and tr.load(mid) is None
    assert client.get(f"/api/media/{mid}").json()["spokenCues"] is None


def test_lines_never_overlap():
    """Words of two segments overlap by 0.2 s: the first line ends where the second begins (#18)."""
    t = {"segments": [seg("Komm sofort her!", 1.0), seg("Ich komme ja schon.", 1.65)]}
    a, b = tr.spoken_cues(t, [])
    assert a["end"] == b["start"] == 1.65 and a["text"] == "Komm sofort her!"
