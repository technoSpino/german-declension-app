# #29: transcribe a clip with mlx Whisper large-v3-turbo in ~30 s chunks cut at subtitle gaps.
# Each chunk is prompted with a glossary of nouns, names and long words from its own ARD subtitles,
# so names come out right ("Tace", "Billing", "Autominuten"); full sentences in the prompt make
# Whisper skip them as already said. Output: {model, language, segments:[{start, end, text,
# no_speech_prob, avg_logprob, words:[{w, s, e, p}]}]}, times in seconds of the clip.
# usage: python transcribe.py <audio> <cues.json> <out.json> [offset] [length]
import json, re, sys, time
import numpy as np
import mlx_whisper
from mlx_whisper.audio import load_audio, SAMPLE_RATE

NOISE = re.compile(r"^\s*(?:\*[^*]*\*|\[[^\]]*\]|\([^)]*\)|[♪♫#].*)\s*$")
MAX = 28.0

WORD = re.compile(r"[A-Za-zÄÖÜäöüß][\wÄÖÜäöüß-]*")
SKIP = {"Sie", "Ihnen", "Ihr", "Ihre", "Ich", "Er", "Es", "Wir", "Das", "Die", "Der", "Den", "Dem", "Ein", "Eine", "Und", "Aber", "Ja", "Nein"}

def glossary(cs):
    """Nouns, names and long words from the chunk's subtitles, as a word list (not sentences:
    with sentences in the prompt Whisper treats them as already said and skips them)."""
    seen = []
    for c in cs:
        for w in WORD.findall(c["text"]):
            if (w[0].isupper() or len(w) >= 9) and w not in SKIP and w not in seen:
                seen.append(w)
    return ("Glossar: " + ", ".join(seen) + ".") if seen else None

def chunks(cues, total, offset=0.0):
    cues = [c for c in cues if not NOISE.match(c["text"]) and c["end"] > offset and c["start"] < offset + total]
    out, start, cur = [], offset, []
    for i, c in enumerate(cues):
        if cur and c["end"] - start > MAX:
            cut = (cur[-1]["end"] + c["start"]) / 2
            out.append((start, cut, cur)); start, cur = cut, []
        while c["start"] - start > MAX and not cur:  # long stretch without subtitles
            out.append((start, start + MAX, [])); start += MAX
        cur.append(c)
    end = offset + total
    while end - start > MAX:
        out.append((start, start + MAX, cur)); start, cur = start + MAX, []
    out.append((start, end, cur))
    return out

def main(src, cues_path, out_path, offset=0.0, length=None):
    audio = np.array(load_audio(src), dtype=np.float32)
    total = len(audio) / SAMPLE_RATE if length is None else length
    cues = json.load(open(cues_path))
    segs, t0 = [], time.time()
    for a, b, cs in chunks(cues, total, offset):
        piece = audio[int((a - offset) * SAMPLE_RATE):int((b - offset) * SAMPLE_RATE)]
        if len(piece) < SAMPLE_RATE * 0.3:
            continue
        prompt = glossary(cs)
        r = mlx_whisper.transcribe(piece, path_or_hf_repo="mlx-community/whisper-large-v3-turbo",
                                   language="de", word_timestamps=True, condition_on_previous_text=False,
                                   hallucination_silence_threshold=2.0, initial_prompt=prompt)
        for s in r["segments"]:
            segs.append({"start": round(a + s["start"], 2), "end": round(a + s["end"], 2), "text": s["text"].strip(),
                         "no_speech_prob": round(s.get("no_speech_prob", 0), 3), "avg_logprob": round(s.get("avg_logprob", 0), 3),
                         "words": [{"w": w["word"].strip(), "s": round(a + w["start"], 2), "e": round(a + w["end"], 2),
                                    "p": round(w.get("probability", 0), 3)} for w in s.get("words", [])]})
    json.dump({"model": "whisper-large-v3-turbo (mlx), chunked with ARD subtitle prompts", "language": "de",
               "segments": segs}, open(out_path, "w"), ensure_ascii=False)
    print(f"{src}: {len(segs)} segments, {total/60:.1f} min audio in {time.time()-t0:.0f}s", file=sys.stderr)

if __name__ == "__main__":
    a = sys.argv
    main(a[1], a[2], a[3], float(a[4]) if len(a) > 4 else 0.0, float(a[5]) if len(a) > 5 else None)
