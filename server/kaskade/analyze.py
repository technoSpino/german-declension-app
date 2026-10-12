"""Reader analysis: lemma, POS, case lens (N/A/D/G noun phrases + what governs them),
word states from the learner's cards and a short gloss.

spaCy de_core_news_sm (with parser) does the linguistics; glosses come from the core
deck first, then from the Wiktionary glossary in ~/kaskade-data/dict/de-en.json.
"""
import json
from functools import lru_cache

from . import config, db, srs

CASE = {"Nom": "N", "Acc": "A", "Dat": "D", "Gen": "G"}
CASE_NAME = {"N": "Nominativ", "A": "Akkusativ", "D": "Dativ", "G": "Genitiv"}
TWO_WAY = {"an", "auf", "hinter", "in", "neben", "über", "unter", "vor", "zwischen"}
CONTRACTED = {"im": "in dem", "am": "an dem", "ans": "an das", "ins": "in das", "zum": "zu dem",
              "zur": "zu der", "vom": "von dem", "beim": "bei dem", "aufs": "auf das", "fürs": "für das"}
CONTENT_POS = {"NOUN", "VERB", "ADJ", "ADV"}
ARTICLE = {"m": "der", "f": "die", "n": "das"}
# Which cases a preposition allows (contractions fix the case: im = in dem → D, ins = in das → A).
PREP_CASES = {
    **{p: {"A"} for p in ("durch", "für", "gegen", "ohne", "um", "bis", "entlang", "wider", "ins", "ans", "aufs", "fürs")},
    **{p: {"D"} for p in ("aus", "bei", "mit", "nach", "seit", "von", "zu", "gegenüber", "ab", "außer", "samt",
                          "entgegen", "im", "am", "zum", "zur", "vom", "beim")},
    **{p: {"G", "D"} for p in ("wegen", "während", "trotz", "statt", "anstatt", "laut", "dank")},
    **{p: {"G"} for p in ("außerhalb", "innerhalb", "aufgrund", "oberhalb", "unterhalb", "jenseits", "diesseits")},
    **{p: {"A", "D"} for p in TWO_WAY},
}
ROLE_CASE = {"sb": "N", "pd": "N", "oa": "A", "da": "D", "og": "G", "ag": "G"}


@lru_cache(maxsize=1)
def nlp():
    import spacy

    return spacy.load("de_core_news_sm")


@lru_cache(maxsize=1)
def dictionary() -> dict:
    path = config.DATA_DIR / "dict/de-en.json"
    if not path.exists():
        return {"entries": {}, "forms": {}}
    return json.loads(path.read_text(encoding="utf-8"))


def _norm(lemma: str) -> str:
    return lemma.split(" (")[0].replace("sich ", "").strip().lower()


def _is_noun(lemma: str) -> bool:
    return lemma.split(" (")[0].replace("sich ", "").strip()[:1].isupper()


@lru_cache(maxsize=1)
def deck_by_lemma() -> dict[str, dict]:
    out = {}
    for c in srs.deck():
        out.setdefault(_norm(c["lemma"]), c)
    return out


def card_states() -> dict[str, str]:
    """card id → neu | lernend | bekannt."""
    with db.tx() as conn:
        rows = conn.execute("SELECT id, status, fsrs FROM cards").fetchall()
    out = {}
    for r in rows:
        if r["status"] == "known":
            out[r["id"]] = "bekannt"
        elif r["status"] in ("learning", "suspended"):
            stab = (json.loads(r["fsrs"]).get("stability") or 0) if r["fsrs"] else 0
            out[r["id"]] = "bekannt" if stab >= 21 else "lernend"
    return out


DEFAULT_CORE_KNOWN = 500


def core_known_estimate() -> int:
    """How many core words the learner probably knows (last vocab test), for unseen cards."""
    with db.tx() as conn:
        row = conn.execute("SELECT result FROM vocab_tests ORDER BY id DESC LIMIT 1").fetchone()
    return json.loads(row["result"]).get("coreKnown", DEFAULT_CORE_KNOWN) if row else DEFAULT_CORE_KNOWN


def word_state(card: dict | None, states: dict[str, str], estimate: int) -> str:
    """neu | lernend | bekannt. Unseen core cards inside the measured range count as known."""
    if not card:
        return "neu"
    if card["id"] in states:
        return states[card["id"]]
    return "bekannt" if (card.get("n") or 10**9) <= estimate else "neu"


def lookup(lemma: str, text: str, pos: str) -> dict | None:
    d = dictionary()
    for word in (lemma, text, d["forms"].get(text), d["forms"].get(text.lower())):
        if not word:
            continue
        items = d["entries"].get(word) or d["entries"].get(word.capitalize() if pos == "NOUN" else word.lower())
        if items:
            match = next((i for i in items if i["pos"] == pos), items[0])
            return {"word": word, **match}
    return None


def known_lemma(lemma: str) -> bool:
    """Whether a lemma is a headword of the core deck or the dictionary."""
    entries = dictionary()["entries"]
    return _norm(lemma) in deck_by_lemma() or any(w in entries for w in (lemma, lemma.lower(), lemma.capitalize()))


def explain(case: str, gov: dict | None) -> str:
    name = CASE_NAME[case]
    if not gov:
        return name
    if gov["kind"] == "prep":
        p = gov["word"]
        base = CONTRACTED.get(p, p).split()[0]
        txt = f"{p} ({CONTRACTED[p]}) + {name}" if p in CONTRACTED else f"{p} + {name}"
        if base in TWO_WAY:
            txt += " · Wechselpräposition: Wo? → Dativ, Wohin? → Akkusativ"
        return txt
    labels = {"sb": f"Subjekt → {name}", "oa": f"Akkusativobjekt von „{gov['word']}“",
              "da": f"Dativobjekt von „{gov['word']}“", "og": f"Genitivobjekt von „{gov['word']}“",
              "ag": "Genitivattribut (wessen?)", "pd": f"Prädikativ → {name}"}
    return labels.get(gov["role"], name)


def sure_case(ch) -> tuple[str, dict] | None:
    """The case of a noun phrase — only when the parser is sure (#19), else None (no badge).

    Sure means: every case-marked word of the phrase has the same case, and something in the
    sentence demands exactly that case — the preposition before it (mit → D, in → A or D …) or
    its role (subject → N, accusative object → A …; in "das Reich und die Herrlichkeit" the
    second phrase takes the role of the first). Morphology and syntax disagree → None.
    """
    cases = {CASE[c] for t in ch for c in t.morph.get("Case") if c in CASE}
    if len(cases) != 1:
        return None
    case = cases.pop()
    root = ch.root
    while root.dep_ in ("cj", "cd") and root.head is not root:
        root = root.head  # coordination: the first conjunct carries the role
    head = root.head
    if head.pos_ == "ADP" and root.dep_ == "nk":
        word = head.text.lower()
        if case not in PREP_CASES.get(word, ()):
            return None
        return case, {"kind": "prep", "word": word, "role": "prep", "i": head.i}
    if ROLE_CASE.get(root.dep_) == case:
        return case, {"kind": "verb" if head.pos_ in ("VERB", "AUX") else "word", "word": head.lemma_,
                      "role": root.dep_, "i": head.i}
    return None


def analyze(text: str) -> dict:
    doc = nlp()(text)
    states = card_states()
    by_lemma = deck_by_lemma()
    estimate = core_known_estimate()

    chunks = []
    for ch in doc.noun_chunks:
        sure = sure_case(ch)
        if not sure:
            continue
        case, gov = sure
        text = explain(case, gov)
        if "Yes" in ch.root.morph.get("Reflex"):
            text = f"Reflexivpronomen → {CASE_NAME[case]}"
        chunks.append({"start": ch.start, "end": ch.end, "case": case, "gov": gov, "explain": text})

    chunk_of = {}
    for n, ch in enumerate(chunks):
        for i in range(ch["start"], ch["end"]):
            chunk_of[i] = n

    tokens = []
    for t in doc:
        lemma = t.lemma_ if t.pos_ != "NOUN" else t.lemma_[:1].upper() + t.lemma_[1:]
        card = by_lemma.get(_norm(lemma)) if t.is_alpha else None
        if card and _is_noun(card["lemma"]) != (t.pos_ == "NOUN"):
            card = None  # the noun "Reich" is not the adjective card "reich"
        state = None
        if t.is_alpha and t.pos_ in CONTENT_POS:
            state = word_state(card, states, estimate)
        entry = None
        if t.is_alpha and t.pos_ not in ("PUNCT", "PROPN", "NUM"):
            entry = ({"gloss": card["gloss"], "display": card["display"], "cardId": card["id"], "lemma": card["lemma"]}
                     if card else None)
            if not entry:
                d = lookup(lemma, t.text, t.pos_)
                if d:
                    display = d["word"]
                    if d.get("g"):
                        display = f"{ARTICLE[d['g']]} {d['word']}" + (f" · die {d['pl']}" if d.get("pl") else "")
                    # the dictionary's headword beats spaCy's guess (versaust → versauen, not "versausen")
                    entry = {"gloss": "; ".join(d["gl"][:2]), "display": display, "cardId": None, "lemma": d["word"]}
        tokens.append({
            "i": t.i, "text": t.text, "ws": t.whitespace_, "lemma": lemma, "pos": t.pos_,
            "state": state, "chunk": chunk_of.get(t.i), "entry": entry, "sent": t.sent.start,
        })
    sentences = [{"start": s.start, "end": s.end, "text": s.text.strip()} for s in doc.sents]
    return {"tokens": tokens, "chunks": chunks, "sentences": sentences}
