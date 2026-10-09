import pytest

pytest.importorskip("spacy")
from kaskade import analyze  # noqa: E402


def chunks(text):
    r = analyze.analyze(text)
    return [(" ".join(t["text"] for t in r["tokens"][c["start"]:c["end"]]), c["case"], c["explain"]) for c in r["chunks"]]


def test_prepositions_govern_case(client):
    c = chunks("Ich spreche mit meinem Vermieter über die Heizung.")
    assert ("meinem Vermieter", "D", "mit + Dativ") in c
    assert any(t == "die Heizung" and k == "A" and "Wechselpräposition" in e for t, k, e in c)


def test_objects_and_subject(client):
    c = chunks("Ich gebe dem Kind einen Apfel.")
    assert ("Ich", "N", "Subjekt → Nominativ") in c
    assert ("dem Kind", "D", "Dativobjekt von „geben“") in c
    assert ("einen Apfel", "A", "Akkusativobjekt von „geben“") in c


def test_genitive_and_contraction(client):
    c = chunks("Wegen des Streiks bleibe ich im Haus.")
    assert ("des Streiks", "G", "wegen + Genitiv") in c
    assert any(e.startswith("im (in dem) + Dativ") for _, _, e in c)


def test_explain_labels():
    assert analyze.explain("D", {"kind": "prep", "word": "zum", "role": "prep"}) == "zum (zu dem) + Dativ"
    assert analyze.explain("A", None) == "Akkusativ"
    assert analyze.explain("G", {"kind": "word", "word": "Haus", "role": "ag"}) == "Genitivattribut (wessen?)"


def test_word_state_rules():
    states = {"core:r1": "lernend"}
    assert analyze.word_state(None, states, 500) == "neu"
    assert analyze.word_state({"id": "core:r1", "n": 1}, states, 500) == "lernend"
    assert analyze.word_state({"id": "core:r2", "n": 300}, states, 500) == "bekannt"
    assert analyze.word_state({"id": "core:r3", "n": 800}, states, 500) == "neu"
    assert analyze.word_state({"id": "mine:1", "n": None}, {}, 500) == "neu"


def test_word_states_follow_cards(client, monkeypatch):
    from kaskade import srs
    monkeypatch.setattr(analyze, "core_known_estimate", lambda: 0)
    card = next(c for c in srs.deck() if c["lemma"] == "Problem")
    r = analyze.analyze("Das Problem ist groß.")
    tok = next(t for t in r["tokens"] if t["text"] == "Problem")
    assert tok["state"] == "neu" and tok["entry"]["cardId"] == card["id"]
    srs.review(card["id"], 3)
    tok = next(t for t in analyze.analyze("Das Problem ist groß.")["tokens"] if t["text"] == "Problem")
    assert tok["state"] == "lernend"
    srs.mark_known(next(c for c in srs.deck() if c["lemma"] == "groß")["id"])
    tok = next(t for t in analyze.analyze("Das Problem ist groß.")["tokens"] if t["text"] == "groß")
    assert tok["state"] == "bekannt"


def test_function_words_have_no_state(client):
    r = analyze.analyze("Ich bin mit dir.")
    assert all(t["state"] is None for t in r["tokens"] if t["pos"] in ("PRON", "AUX", "ADP"))
