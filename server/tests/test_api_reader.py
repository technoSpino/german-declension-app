import pytest

from kaskade import srs


def test_mine_creates_a_card_that_comes_first(client):
    r = client.post("/api/mined", json={
        "sentence": "Ich habe mich mit meinem Vermieter gestritten.", "target": "Vermieter",
        "lemma": "Vermieter", "display": "der Vermieter · die Vermieter", "gloss": "landlord",
        "note": "mit + Dativ", "case": "D", "source": "Lesen · t01",
    })
    assert r.status_code == 200 and r.json()["duplicate"] is False
    mid = r.json()["id"]
    nxt = client.get("/api/cards/next").json()
    assert nxt["card"]["id"] == mid and nxt["card"]["sentence"].startswith("Ich habe mich")
    assert client.post(f"/api/cards/{mid}/review", json={"rating": 3}).status_code == 200
    # the next new card is the first core card again
    assert client.get("/api/cards/next").json()["card"]["id"] == srs.deck()[0]["id"]
    assert client.get("/api/mined").json()[0]["id"] == mid
    assert client.get("/api/cards/stats").json()["mined"] == 1


def test_mine_duplicate_and_validation(client):
    body = {"sentence": "Das Wetter ist schön.", "target": "Wetter", "lemma": "Wetter"}
    first = client.post("/api/mined", json=body).json()
    again = client.post("/api/mined", json=body).json()
    assert again == {"id": first["id"], "duplicate": True}
    assert client.post("/api/mined", json={**body, "target": "Regen"}).status_code == 422
    assert client.post("/api/mined", json={**body, "case": "X"}).status_code == 422


def test_unknown_mined_card_is_404(client):
    assert client.post("/api/cards/mine:999/review", json={"rating": 3}).status_code == 404


def test_analyze_endpoints(client):
    pytest.importorskip("spacy")
    r = client.post("/api/analyze", json={"text": "Ich gehe mit dem Hund."})
    assert r.status_code == 200
    body = r.json()
    assert body["tokens"][0]["text"] == "Ich" and body["sentences"]
    assert any(c["case"] == "D" for c in body["chunks"])
    assert client.post("/api/analyze", json={"text": "  "}).status_code == 422
    assert client.get("/api/texts/t01/analysis").json()["tokens"]
    assert client.get("/api/texts/t99/analysis").status_code == 404
