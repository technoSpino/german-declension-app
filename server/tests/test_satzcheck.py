import pytest

from kaskade import satzcheck

SRT = """1
00:00:01,000 --> 00:00:03,500
Hast du schon mit deinem Chef gesprochen?

2
00:00:04,000 --> 00:00:06,250
<i>Nein,</i> ich warte lieber
bis nach dem Wochenende.

3
00:03:05,000 --> 00:03:07,000
Na gut.
"""

VTT = """WEBVTT
Kind: captions
Language: de

00:00:01.000 --> 00:00:02.000 align:start position:0%
Guten<00:00:01.500><c> Morgen</c>

00:00:02.000 --> 00:00:03.000
Guten Morgen

00:00:03.000 --> 00:00:04.000
Wie geht&#39;s?

1:00:00.000 --> 1:00:01.500
Eine Stunde später.
"""


def test_parse_srt():
    cues = satzcheck.parse_subtitles(SRT)
    assert [c["text"] for c in cues] == [
        "Hast du schon mit deinem Chef gesprochen?",
        "Nein, ich warte lieber bis nach dem Wochenende.",
        "Na gut.",
    ]
    assert cues[1]["start"] == 4.0 and cues[1]["end"] == 6.25


def test_parse_vtt_strips_tags_merges_repeats_and_hours():
    cues = satzcheck.parse_subtitles(VTT)
    assert [c["text"] for c in cues] == ["Guten Morgen", "Wie geht's?", "Eine Stunde später."]
    assert cues[0]["end"] == 3.0  # merged rolling duplicate
    assert cues[2]["start"] == 3600.0


def test_parse_handles_crlf_and_bom():
    cues = satzcheck.parse_subtitles("﻿" + SRT.replace("\n", "\r\n"))
    assert len(cues) == 3


def test_parse_garbage_returns_empty():
    assert satzcheck.parse_subtitles("kein Untertitel hier") == []


def test_window_selects_three_minutes():
    cues = satzcheck.parse_subtitles(SRT)
    assert len(satzcheck.window(cues, 0)) == 2
    assert len(satzcheck.window(cues, 0, 300)) == 3
    assert satzcheck.window(cues, 10, 180) == [cues[2]]


def test_summarize_counts_and_coverage():
    s = satzcheck.summarize(["v", "v", "h", "v", "h", "s", "h", "s", "v"])
    assert (s["v"], s["h"], s["s"], s["rated"]) == (4, 3, 2, 9)
    assert s["coverage"] == 78  # 7/9


def test_summarize_empty():
    assert satzcheck.summarize([])["coverage"] == 0


@pytest.mark.parametrize("coverage, ctype, words, phase, key", [
    (75, "simple", None, "2A", "phase1-done"),
    (74, "simple", None, "1", "phase1"),
    (80, "adult", 2000, "2B", "ready-2b"),
    (95, "adult", 1500, "2A", "2a-words"),
    (80, "adult", None, "2A", "2a-words"),
    (79, "adult", 2500, "2A", "2a"),
    (60, "adult", 2500, "2A", "2a"),
    (59, "adult", 2500, "2A", "too-hard"),
])
def test_verdict_gates(coverage, ctype, words, phase, key):
    v = satzcheck.verdict(coverage, ctype, words)
    assert (v["phase"], v["key"]) == (phase, key)
    assert v["title"] and v["advice"]


def test_non_speech_cues_are_recognised():
    from kaskade.satzcheck import is_non_speech
    for cue in ["* Musik: ruhige Klaviermusik *", "* Stimmen und Lachen *", "[Klopfen]", "(dumpf)", "(schreit)",
                "♪ Oh, oh, oh ♪", "♪ La la", "  [Telefon klingelt]  "]:
        assert is_non_speech(cue), cue
    for cue in ["Na?", "(leise) Komm her.", "Ich sag's dir *jetzt*.", "Was [ist] das?"]:
        assert not is_non_speech(cue), cue
