"""Schauen & minen: resume positions, last clip, mining a subtitle line with an audio snippet."""
import shutil
import subprocess

import pytest

from kaskade import config, snippet

SRT = b"""1
00:00:00,500 --> 00:00:02,000
Wo waren Sie gestern Abend?

2
00:00:02,500 --> 00:00:04,000
[Telefon klingelt]

3
00:00:04,500 --> 00:00:06,000
Das glaube ich Ihnen nicht.
"""

needs_ffmpeg = pytest.mark.skipif(shutil.which("ffmpeg") is None, reason="ffmpeg not installed")


def make_clip(tmp_path):
    out = tmp_path / "clip.webm"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=7",
                    "-c:a", "libopus", str(out)], check=True)
    return out


def upload(client, media=None, title="Krimi"):
    files = {"subtitles": ("t.srt", SRT, "application/x-subrip")}
    if media:
        files["media"] = (media.name, media.read_bytes(), "video/webm")
    r = client.post("/api/media/upload", files=files, data={"title": title})
    assert r.status_code == 200, r.text
    return r.json()


def test_snippet_window_pads_and_caps():
    assert snippet.window(10.0, 12.0) == (9.75, 12.35)
    assert snippet.window(0.1, 1.0)[0] == 0.0
    a, b = snippet.window(5.0, 60.0)
    assert b - a == snippet.MAX_SECONDS


def test_progress_and_last_clip(client):
    assert client.get("/api/media/last").json() is None
    first = upload(client, title="Ohne Video")
    assert client.get("/api/media/last").json() is None  # needs a media file
    assert client.put(f"/api/media/{first['id']}/progress", json={"position": 3.2}).json()["position"] == 3.2
    assert client.get(f"/api/media/{first['id']}").json()["position"] == 3.2
    assert client.put("/api/media/999/progress", json={"position": 1}).status_code == 404
    assert client.put(f"/api/media/{first['id']}/progress", json={"position": -1}).status_code == 422


@needs_ffmpeg
def test_last_clip_prefers_the_one_watched_most_recently(client, tmp_path):
    clip = make_clip(tmp_path)
    a = upload(client, clip, "A")
    b = upload(client, clip, "B")
    assert client.get("/api/media/last").json()["id"] == b["id"]  # newest
    client.put(f"/api/media/{a['id']}/progress", json={"position": 4.5})
    last = client.get("/api/media/last").json()
    assert last["id"] == a["id"] and last["position"] == 4.5
    assert client.get("/api/today").json()["watch"]["id"] == a["id"]


@needs_ffmpeg
def test_mine_a_line_with_audio_snippet(client, tmp_path):
    m = upload(client, make_clip(tmp_path))
    r = client.post("/api/mined", json={
        "sentence": "Das glaube ich Ihnen nicht.", "target": "glaube", "lemma": "glauben", "gloss": "believe",
        "source": "Schauen · Krimi", "mediaId": m["id"], "start": 4.5, "end": 6.0}).json()
    assert r["audio"] is True and r["duplicate"] is False
    assert (config.SNIPPETS_DIR / "mine-1.m4a").stat().st_size > 0
    audio = client.get(f"/api/cards/{r['id']}/audio")
    assert audio.status_code == 200 and audio.headers["content-type"] == "audio/mp4"
    card = next(c for c in client.get("/api/mined").json() if c["id"] == r["id"])
    assert card["mediaId"] == m["id"] and card["clipStart"] == 4.5
    # it is a new card in Karten, mined cards first
    assert client.get("/api/cards/next").json()["card"]["id"] == r["id"]


def test_mine_rejects_a_bad_time_range(client):
    m = upload(client)
    r = client.post("/api/mined", json={"sentence": "Wo waren Sie?", "target": "waren", "lemma": "sein",
                                        "mediaId": m["id"], "start": 5, "end": 4})
    assert r.status_code == 422


def test_mine_without_media_file_still_creates_the_card(client):
    m = upload(client)
    r = client.post("/api/mined", json={"sentence": "Wo waren Sie gestern Abend?", "target": "Abend", "lemma": "Abend",
                                        "mediaId": m["id"], "start": 0.5, "end": 2.0}).json()
    assert r["audio"] is False and r["id"].startswith("mine:")
