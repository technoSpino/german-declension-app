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


def test_a_short_fragment_never_joins_across_a_long_silence():
    """Schweigen 13:22: 'War ein Unfall?' 7 s after a line ending in a comma stayed a line of its own."""
    ws = words("Ruß in der Lunge, aber wie,", 0.0) + words("War ein Unfall?", 9.0, step=0.18)
    assert texts(tr.build_lines(ws)) == ["Ruß in der Lunge, aber wie,", "War ein Unfall?"]


def test_an_ard_line_where_whisper_heard_nothing_stands_in():
    ard = [{"start": 1.0, "end": 2.5, "text": "Wo ist sie hin?"}, {"start": 5.0, "end": 6.5, "text": "Weiß ich nicht."}]
    t = {"segments": [seg("Wo ist sie denn hin?", 1.1)]}
    assert tr.spoken_cues(t, ard) == [
        {"start": 1.1, "end": 2.55, "text": "Wo ist sie denn hin?"},
        {"start": 5.0, "end": 6.5, "text": "Weiß ich nicht.", "src": "ard"}]


def test_the_prompt_word_glossar_never_shows():
    t = {"segments": [seg("Glossar, aber es wird Ihnen nichts nützen.", 3.0)]}
    assert [c["text"] for c in tr.spoken_cues(t, [{"start": 3.0, "end": 5.0, "text": "Es wird nichts nützen."}])] == [
        "aber es wird Ihnen nichts nützen."]


# ── v2: respelling from ARD, gap fill, re-import on change ──

def line_texts(t, ard):
    return [c["text"] for c in tr.spoken_cues(t, ard)]


def test_a_misheard_name_takes_the_ard_spelling():
    """'Autos' is nothing like 'Otto' (similarity < 0.6), but Otto is a name of this clip (2×, not initial)."""
    ard = [{"start": 1.0, "end": 3.0, "text": "Kennen Sie Pfarrer Otto?"},
           {"start": 9.0, "end": 11.0, "text": "Ja, ich kenne Otto."}]
    t = {"segments": [seg("Kennen Sie Pfarrer Autos?", 1.1), seg("Ja, ich kenne ihn, Autos.", 9.1)]}
    assert line_texts(t, ard) == ["Kennen Sie Pfarrer Otto?", "Ja, ich kenne ihn, Autos."]
    # second line: ARD has one word less there — an unequal block is left alone


def test_a_near_miss_word_is_respelled_keeping_punctuation_and_times():
    ard = [{"start": 2.0, "end": 4.0, "text": "Jemand hat alles durchwühlt."}]
    t = {"segments": [seg("Jemand hat alles durchwählt.", 2.1)]}
    track = tr.spoken_cues(t, ard)
    assert track == [{"start": 2.1, "end": 3.25, "text": "Jemand hat alles durchwühlt."}]


def test_below_the_threshold_nothing_is_respelled():
    ard = [{"start": 2.0, "end": 4.0, "text": "Da steht eine Katze."},
           {"start": 6.0, "end": 8.0, "text": "Sie heißt Mila."}]
    t = {"segments": [seg("Da steht ein Hund.", 2.1), seg("Sie heißt Mira.", 6.1)]}
    # 'ein'→'eine' is close (0.86): respelled; 'Hund'/'Katze' not; 'Mira'/'Mila' close (0.75)
    assert line_texts(t, ard) == ["Da steht eine Hund.", "Sie heißt Mila."]


def test_an_unequal_replace_block_is_left_alone():
    ard = [{"start": 1.0, "end": 3.5, "text": "Er nimmt das Auto mit."}]
    t = {"segments": [seg("Er nimmt den alten Wagen mit.", 1.1)]}
    assert line_texts(t, ard) == ["Er nimmt den alten Wagen mit."]


def test_a_sentence_start_stays_capitalised():
    ard = [{"start": 1.0, "end": 3.0, "text": "Und dann kamen sie."}]
    t = {"segments": [seg("Dan kamen sie.", 1.1)]}  # 'Dan' ↔ 'und dann': unequal, untouched
    assert line_texts(t, ard) == ["Dan kamen sie."]
    ard = [{"start": 1.0, "end": 3.0, "text": "Alles durchwühlt."}]
    t = {"segments": [seg("Alles. Durchwählt.", 1.1)]}
    assert line_texts(t, ard) == ["Alles.", "Durchwühlt."]


def test_gap_fill_only_where_no_whisper_word_is_near():
    ard = [{"start": 1.0, "end": 2.0, "text": "Komm her."},
           {"start": 2.3, "end": 3.2, "text": "Sofort!"},  # Whisper's "her." ends at 2.55: near, no fill
           {"start": 8.0, "end": 9.5, "text": "Generalvikar Billing wird kooperieren."}]
    t = {"segments": [seg("Komm her.", 1.95)]}
    track = tr.spoken_cues(t, ard)
    assert [(c["text"], c.get("src")) for c in track] == [
        ("Komm her.", None), ("Generalvikar Billing wird kooperieren.", "ard")]


def test_reimport_when_the_file_changes(client):
    import os
    cues = [{"start": 1.0, "end": 3.0, "text": "Wo ist der Schlüssel?"}]
    with db.tx() as conn:
        mid = conn.execute("INSERT INTO media(created_at, kind, title, media_file, cues) VALUES (?, ?, ?, ?, ?)",
                           (db.now_iso(), "upload", "Probe", "upload-9.mp4", json.dumps(cues))).lastrowid
    tr.transcripts_dir().mkdir(parents=True, exist_ok=True)
    f = tr.path_for("upload-9.mp4")
    f.write_text(json.dumps({"segments": [seg("Wo ist der Schlüssel denn?", 1.1)]}), encoding="utf-8")
    os.utime(f, ns=(1_000_000_000, 1_000_000_000))
    assert tr.import_all()["changed"] == [mid]
    assert tr.import_all()["changed"] == []  # same file: not even read again
    f.write_text(json.dumps({"version": 2, "segments": [seg("Wo ist nur der Schlüssel?", 1.1)]}), encoding="utf-8")
    os.utime(f, ns=(2_000_000_000, 2_000_000_000))
    # opening the clip picks the new file up
    assert client.get(f"/api/media/{mid}").json()["spokenCues"][0]["text"] == "Wo ist nur der Schlüssel?"
    assert tr.import_all()["changed"] == []
    assert tr.import_all(force=True)["changed"] == []  # rebuilt, same result
