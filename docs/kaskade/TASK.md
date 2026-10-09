# Kaskade — overnight build brief (night 1)

You are building the first working version of **Kaskade**, a Refold-style German learning app, on this server while the user sleeps. Work through the milestones below in order. Do not stop to ask questions — make reasonable decisions and record them in `docs/kaskade/PROGRESS.md`.

## The learner

- Finished an intensive B1.2 course, never tested. Feels they know fewer than 2,000 words. Understands *Checker Tobi* (kids' TV) without subtitles → past Refold Phase 1, working on **Phase 2A** (core 2,000 words; gate to 2B = ~80 % of sentences in adult content with subtitles + tools).
- Needs a **B1 certificate** for residence/citizenship (provider undecided, no deadline), then B2 via Refold.
- Studies **Mon–Fri 09:00–11:30** on a **laptop**. UI language is German (simple), keyboard-first.

## Design reference

`design/kaskade-mockups/*.dc.html` are the approved mockups (static HTML with a custom `<x-dc>` templating layer and inline styles — read them as the visual/UX spec, don't import them). Most relevant tonight: `Einstufung`, `Satzcheck`, `Main` (= Heute), `Karten`, `Fahrplan`. Look: ink `#14161B` on cool grey `#F3F4F6`, signal yellow `#FFD23F` for highlights, Archivo for UI, Literata for German reading text, case colours from the existing app (N blue, A red, D green, G orange) always paired with the letter N/A/D/G.

## Hard rules

1. **The GitHub repo is PUBLIC.** Never commit: content from the user's books (Kontext, Grammatik aktiv, Momo, story books), Goethe/telc/ÖSD word lists or exam material, third-party audio/video/subtitles, API keys/tokens, or user data. User data and media live in `~/kaskade-data/` (outside the repo). Add `.gitignore` entries.
2. Work only on branch **`kaskade`**. Commit after each milestone with a clear message and `git push origin kaskade`. Never push to `main`, never force-push, never rewrite history.
3. Stay inside `/home/kaskade`. Other things on this box (`cos.service`, Caddy, Tailscale serve on port 80) belong to another project — don't touch them. You have no sudo; don't try.
4. Network: bind servers to the Tailscale IP **100.64.43.3** or 127.0.0.1 — never 0.0.0.0 (the box has a public IP). Frontend on **5173**, API on **127.0.0.1:8000** (proxied by Vite under `/api`), or serve the built frontend from FastAPI on 100.64.43.3:8000 — your call, document it.
5. There is **no runtime Anthropic API key** yet. Nothing may depend on one. Anything that needs "AI" tonight (example sentences, reading texts, prompts, pseudowords) you author yourself and commit as JSON. Runtime AI features (grading writing, etc.) go behind `ANTHROPIC_API_KEY` (model `claude-opus-5-5`, official Anthropic SDK) and degrade gracefully when it's unset.
6. Quality bar: `cd app && npm run test` passes; add unit tests for scoring/scheduling logic (frontend vitest and/or pytest). **German must be correct** — the user learns from it. Re-read every German string you write.
7. After each milestone update `docs/kaskade/PROGRESS.md`: what's done, URL to open, decisions made, what's next, blockers. The user reads it on their phone in the morning — keep it short and scannable.
8. If something is blocked (e.g. a download fails), note it in PROGRESS.md, work around it, and continue with the next milestone. Don't loop on one problem for more than ~20 minutes.

## Architecture (keep it simple)

- **Frontend:** the existing Vue 3 + Vite + Tailwind 4 + Pinia app in `app/`. New routes: `/heute` (becomes `/`), `/einstufung`, `/satz-check`, `/karten`, `/fahrplan`. The old grammar pages keep working under their routes, grouped in the nav as "Nachschlagen".
- **Backend:** `server/` — Python FastAPI + SQLite at `~/kaskade-data/kaskade.db`, venv at `server/.venv` (use `uv` if available, else `python3 -m venv`). Single user, no auth (tailnet only).
- **SRS:** FSRS. Keep scheduling in one place (server preferred, Python `fsrs` package; or `ts-fsrs` in the frontend) with state in SQLite.
- **Processes:** systemd **user** services (`systemctl --user`, lingering is enabled) so the app survives reboots and SSH disconnects. Document restart commands in PROGRESS.md.

## Milestones

**M0 — Setup.** `server/` skeleton, venv, deps, `.gitignore` (data, media, `.venv`, `.env`), `docs/kaskade/PROGRESS.md`, both services running, `/api/health`. Commit + push.

**M1 — Wortschatz-Test (vocabulary size).** Yes/no test.
- Frequency source: hermitdave *FrequencyWords* `content/2018/de/de_50k.txt` (OpenSubtitles 2018, CC BY-SA 4.0) — commit the derived list with attribution + license note in `data/freq/README.md`, or download it at setup into `~/kaskade-data` if you're unsure about licensing.
- Clean it: lemmatise (spaCy `de_core_news_sm`), drop names, English, interjections, junk, duplicates of inflected forms → ordered lemma list.
- Bands 1–500, 501–1000, 1001–2000, 2001–3000, 3001–5000, 5001–8000; ~20 sampled words per band plus ~25 pseudowords you write (plausible German shape, verified not real words).
- Score per band with a false-alarm correction (e.g. hit rate − false-alarm rate), estimate vocabulary size and share of the top 2,000 known. Keyboard J/N, fast. Unit tests for scoring.

**M2 — Satz-Check** (see `Satzcheck.dc.html`).
- Input (a): upload a video/audio file + `.srt`/`.vtt`. Input (b): YouTube URL → `yt-dlp` fetches German subtitles + low-res media into `~/kaskade-data/media` (YouTube often blocks datacenter IPs — fail gracefully and point to (a)).
- Pick a ~3-minute window. Player pauses after each cue; rate *verstanden / mit Hilfe / zu schwer* (keys 1/2/3, R = replay cue).
- Result: coverage % (= verstanden + mit Hilfe), breakdown, verdict against the gates (≥ 75 % on simple content = Phase 1 done; ≥ 80 % on adult content + ~2,000 words = ready for 2B; 60–79 % = 2A), stored with date so it can be repeated monthly. Unit tests for coverage/verdict.

**M3 — Einstufung wizard** (see `Einstufung.dc.html`): Wortschatz (M1) → Lesen (two original texts at B1 and B2, 5 multiple-choice questions each, authored by you) → Satz-Check (M2) → Schreiben (one B1-style task, save the text; grade only if API key) → Sprechen (record 3 short answers with MediaRecorder, save audio; no grading tonight). Pausable, resumable. Result page: phase (2A/2B), known-word estimate, rough per-skill levels, all persisted.

**M4 — Kernwortschatz deck + Karten** (see `Karten.dc.html`).
- Top 2,000 lemmas from M1 → sentence cards. For each word write one original, natural example sentence (A2–B1, everyday adult life), an English gloss, and a short German note where useful (der/die/das + plural for nouns, Perfekt for verbs, case for prepositions).
- Write in batches of 100 to `data/core-deck/NNNN.json`, validate each batch, re-read the German. **At least the first 600 tonight**, more if time allows.
- Karten UI: Space = reveal, 1–4 = rate, **K = "kenne ich schon"** (bury permanently — fast triage of words they already know), 20 new cards/day default, FSRS reviews.

**M5 — Heute + weeks 1–4** (see `Main.dc.html`, `Fahrplan.dc.html`).
- Block for Phase 2A: 09:00 Karten 30 min · 09:30 interaktives Schauen/Lesen 55 min · 10:25 Pause 10 min · 10:35 freies Lesen 30 min · 11:05 B1-Prüfungsteil 25 min.
- `data/plan/weeks-1-4.json`: daily focus + one B1 exam micro-task per day (Mon/Wed Schreiben, Tue/Thu Sprechen, Fri none) — ~16 original prompts modelled on typical B1 task types (informal e-mail, forum opinion, formal e-mail, presenting a topic, planning something together). No copied exam material. Week 6: placeholder for the first full mock exam.
- Simple start/stop timer per block → active minutes per day/week stored (immersion hours).

**M6 — Stretch.** TTS audio for core-deck sentences with Piper (German voice; check the voice licence; audio in `~/kaskade-data`, not git). Fahrplan page with real data. Layout check at 320 px.

## Done for tonight means

- The URL in PROGRESS.md opens Heute; Einstufung runs end to end; Satz-Check works with an uploaded SRT + media file; Karten reviews the core deck with FSRS; data survives a service restart.
- PROGRESS.md starts with a **"Heute früh"** checklist: open URL → take Einstufung → first Karten session, plus known issues.
