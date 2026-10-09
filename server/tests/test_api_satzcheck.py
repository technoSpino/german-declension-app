import json

from kaskade import config
from kaskade.routes import media as media_routes

from .test_satzcheck import SRT


def upload(client, with_media=True, sub_name="clip.srt", sub_text=SRT):
    files = {"subtitles": (sub_name, sub_text.encode(), "application/x-subrip")}
    if with_media:
        files["media"] = ("clip.mp4", b"\x00\x00\x00\x18ftypmp42fake", "video/mp4")
    return client.post("/api/media/upload", files=files, data={"title": "Testclip"})


def test_upload_with_media_and_stream_file(client):
    r = upload(client)
    assert r.status_code == 200, r.text
    m = r.json()
    assert m["title"] == "Testclip" and m["hasMedia"] and m["cueCount"] == 3
    detail = client.get(f"/api/media/{m['id']}").json()
    assert detail["cues"][0]["text"].startswith("Hast du")
    f = client.get(f"/api/media/{m['id']}/file")
    assert f.status_code == 200 and f.content.startswith(b"\x00\x00\x00\x18ftyp")
    assert client.get("/api/media").json()[0]["id"] == m["id"]


def test_upload_subtitles_only(client):
    m = upload(client, with_media=False).json()
    assert m["hasMedia"] is False
    assert client.get(f"/api/media/{m['id']}/file").status_code == 404


def test_upload_rejects_bad_subtitle_type(client):
    assert upload(client, sub_name="clip.txt").status_code == 422


def test_upload_rejects_empty_subtitles(client):
    assert upload(client, sub_text="nichts").status_code == 422


def test_delete_media_removes_file(client):
    m = upload(client).json()
    assert client.delete(f"/api/media/{m['id']}").json() == {"ok": True}
    assert client.get(f"/api/media/{m['id']}").status_code == 404
    assert not list(config.MEDIA_DIR.glob("upload-*"))


def test_missing_media_is_404(client):
    assert client.get("/api/media/999").status_code == 404


def test_youtube_rejects_non_youtube_url(client):
    assert client.post("/api/media/youtube", json={"url": "https://example.com/x"}).status_code == 422


def test_youtube_blocked_fails_gracefully(client, monkeypatch):
    def boom(url, dest, stem):
        raise RuntimeError("Sign in to confirm you're not a bot")
    monkeypatch.setattr(media_routes, "fetch_youtube", boom)
    r = client.post("/api/media/youtube", json={"url": "https://www.youtube.com/watch?v=abc"})
    assert r.status_code == 502
    assert "hochladen" in r.json()["detail"]


def test_youtube_success_stores_cues_and_drops_subtitle_file(client, monkeypatch):
    def fake(url, dest, stem):
        (dest / f"{stem}.de.vtt").write_text("WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nHallo zusammen!\n")
        (dest / f"{stem}.mp4").write_bytes(b"fake")
        return {"title": "Ein Video"}
    monkeypatch.setattr(media_routes, "fetch_youtube", fake)
    r = client.post("/api/media/youtube", json={"url": "https://youtu.be/abc"})
    assert r.status_code == 200, r.text
    assert r.json()["title"] == "Ein Video" and r.json()["hasMedia"]
    assert not list(config.MEDIA_DIR.glob("*.vtt"))


def test_save_run_and_history(client):
    m = upload(client).json()
    ratings = [{"cue": i, "text": f"Satz {i}", "rating": r} for i, r in enumerate("vvvvhhhhvs")]
    r = client.post("/api/satzcheck", json={
        "mediaId": m["id"], "contentType": "adult", "windowStart": 0, "windowEnd": 180, "ratings": ratings,
    })
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["coverage"] == 90
    assert body["verdict"]["key"] == "2a-words"  # no vocab test yet
    hist = client.get("/api/satzcheck/history").json()
    assert hist[0]["id"] == body["id"] and hist[0]["title"] == "Testclip"


def test_run_uses_latest_vocab_estimate(client):
    from kaskade import db
    with db.tx() as conn:
        conn.execute("INSERT INTO vocab_tests(created_at, answers, result) VALUES ('x', '[]', ?)",
                     (json.dumps({"estimate": 2400}),))
    ratings = [{"cue": i, "text": "x", "rating": "v"} for i in range(10)]
    body = client.post("/api/satzcheck", json={
        "contentType": "adult", "windowStart": 0, "windowEnd": 180, "ratings": ratings,
    }).json()
    assert body["verdict"]["phase"] == "2B"


def test_run_rejects_empty_and_bad_rating(client):
    base = {"contentType": "adult", "windowStart": 0, "windowEnd": 180}
    assert client.post("/api/satzcheck", json={**base, "ratings": []}).status_code == 422
    bad = [{"cue": 0, "text": "x", "rating": "q"}]
    assert client.post("/api/satzcheck", json={**base, "ratings": bad}).status_code == 422
