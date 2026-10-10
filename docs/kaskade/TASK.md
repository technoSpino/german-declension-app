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
9. **Theme-ready from the start:** every colour, font, radius, border width and shadow comes from CSS custom properties (Tailwind 4 `@theme` mapped to `var(--…)`), defined per theme in one file (e.g. `app/src/styles/themes.css`). No hex values or font names inside components. Themes are switched with `data-theme` on `<html>` (see M5b).
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

## Backlog — continue here after M6 (in this order)

Same hard rules apply. Commit + push after each item, update PROGRESS.md.

**M7 — Core deck complete + quality pass.** Finish all 2,000 core cards if not done. Then a second pass over every batch: grammar, natural word order, articles/plurals, Perfekt forms, case after prepositions. Fix, don't rewrite for style. Log the number of fixes.

**M8 — Graded reading library.** Write ~20 original short texts (150–350 words, A2+/B1, everyday adult themes: Wohnen, Arbeit, Behörden, Arzt, Einkaufen, Freizeit, Reisen, Nachbarn …) built mostly from core-deck words (i+1: ≤ 5 % words outside the top 2,000). Store in `data/texts/`. These feed the 09:30 and 10:35 slots.

**M9 — Reader with case lens** (see `Lesen.dc.html`). Open any library text or pasted text. spaCy (`de_core_news_sm` or `_md`) gives lemma, POS and `Case=` morphology → colour noun phrases N/A/D/G (always with the letter). Word states: neu / lernend / bekannt from the user's cards. Click a word → lemma, article/plural, case + the preposition or verb that governs it. Dictionary: a German–English glossary derived from Wiktionary (kaikki.org dumps, CC BY-SA — keep the file in `~/kaskade-data`, not git; attribution in docs). "Satz minen" → creates a sentence card in the deck.

**M10 — Audio.** If not done in M6: Piper TTS (German voice with a permissive licence) for core-deck sentences and library texts, cached in `~/kaskade-data/audio`. Reader + Karten play it. Then the **Wiederhören feed**: a private podcast RSS (served on 100.64.43.3 only) with the audio of texts read this week, so a podcast app on the phone (on the tailnet) can play it.

**M11 — B1 practice bank (original items only).** Lesen: 4 original texts with B1-style tasks (richtig/falsch, multiple choice, matching). Hören: 4 original dialogues/announcements rendered with TTS (two voices if available) with questions. Schreiben: the ~16 prompts from M5 with a self-check list (Aufgabe erfüllt? Anrede/Gruß? Konnektoren? Verb an Position 2 / am Ende?). Timed mode. Score per module vs the 60 % pass mark → feeds the "Prüfung" readiness later.

**M12 — Immersion log + Fahrplan.** Manual entry for outside immersion (e.g. "Checker Tobi 25 min, passiv/aktiv"), plus block timer data → hours per day/week, total vs Refold's ~1,150 h; Fahrplan page with real phase, gates and Satz-Check history.

**M13 — Hardening.** Tests for every scoring function, error states (server down, empty deck, failed download), 320 px layout, a short `docs/kaskade/RUNBOOK.md` (restart services, back up `~/kaskade-data`, update deps).

**When everything is done:** do a final QA walk-through of every page, fix what you find, write the morning summary at the top of PROGRESS.md, and stop. Don't invent large new features beyond this list.

## M5b — Themes + "Stil" dropdown (do this right after M5, before M6)

A `<select>` labelled **Stil** in the top nav switches between six themes (table below + **Magazin**). Every page must stay fully functional in every theme. The choice is saved in `localStorage` (wrap access in try/catch) and in server settings; with no choice, follow `prefers-color-scheme` (Signal for light, Nacht for dark). Self-host fonts with `@fontsource/*` packages so nothing depends on external CDNs.

Tokens each theme defines: `--bg --surface --surface-2 --border --border-width --text --text-2 --muted --primary --primary-text --accent --accent-text --word-new-bg --word-learning --focus --radius-sm --radius-lg --shadow --font-ui --font-heading --font-read --font-size-base --case-n --case-a --case-d --case-g --case-n-bg --case-a-bg --case-d-bg --case-g-bg --chart-active --chart-passive`.

| Theme | Character | Key values |
|---|---|---|
| **Signal** (default light) | The approved mockups: clean, flat, ink on cool grey | bg `#F3F4F6`, surface `#FFF`, border `#DCDFE5`, text `#14161B`, muted `#5B6270`, primary `#14161B`/`#FFF`, accent `#FFD23F`, word-new `#FFE27A`, learning/focus `#5B3FD6`, radius 10/14 px, Archivo (UI) + Literata (reading). Cases N `#1565C0` A `#C62828` D `#2E7D32` G `#B45309`, tints `#E3F2FD #FFEBEE #E8F5E9 #FFF3E0`. Chart `#5B3FD6` / `#B57A00`. |
| **Nacht** (dark) | Same layout, dark for evening sessions | bg `#0F1115`, surface `#171A20`, surface-2 `#1E222A`, border `#2C313B`, text `#ECEEF2`, muted `#9AA1AE`, primary `#FFD23F`/`#14161B`, accent `#FFD23F`, word-new bg `#4A3B00`, learning/focus `#A996FF`. Cases N `#64B5F6` A `#EF8A8A` D `#7BC67E` G `#F2A65A`, tints `#10263D #3A1616 #132D17 #3A2410`. Chart `#A996FF` / `#E0A33A`. |
| **Papier** (editorial) | Like reading a well-set book: warm paper, serif everything, hairline rules instead of boxes, almost square corners | bg `#F6F1E7`, surface `#FFFDF8`, border `#DDD3C1` (1 px rules, cards become ruled sections), text `#231F1A`, muted `#6B6152`, primary deep teal `#1E4D4D`/`#FFFDF8`, accent soft gold `#F2D88A`, word-new `#F5DF94`, learning/focus `#1E4D4D`, radius 2/4 px, Source Serif 4 (UI + headings, small-caps labels) + Literata (reading). Cases slightly muted: N `#1F5A96` A `#A8322A` D `#2F6B35` G `#9A5212`. |
| **Bauhaus** (bold) | Loud and geometric: black 2 px borders, square corners, hard offset shadows, heavy uppercase headings, yellow blocks | bg/surface `#FFF`, surface-2 `#F2F2F2`, border `#000` 2 px, text `#000`, muted `#4D4D4D`, primary `#000`/`#FFF`, accent `#FFD000`, word-new `#FFD000`, focus `#000` 3 px, radius 0, shadow `4px 4px 0 #000`, Archivo Black (headings, uppercase, letter-spacing .04em) + Archivo (UI) + Literata (reading). Cases N `#0047AB` A `#D10000` D `#007A33` G `#C25700`. Don't use red/blue as decoration — they mean cases. |
| **Fokus** (high legibility) | Calm and large for long reading: bigger text, more space, no shadows, minimal colour, highlights as thick underlines | bg `#FAFAF7`, surface `#FFF`, border `#D9D9D4`, text `#1A1A1A`, muted `#555`, primary `#1A1A1A`/`#FFF`, accent `#C99700` used as 3 px underline, word-new bg `#FFF6D6` + underline, base font 18 px, line-height 1.7, touch targets ≥ 52 px, Atkinson Hyperlegible (UI + reading). Cases as Signal. Respect `prefers-reduced-motion`. |

Rules for all themes: case colours are always paired with the letter N/A/D/G; text contrast ≥ 4.5:1 (≥ 3:1 for ≥ 24 px and UI marks). Add a **vitest that parses `themes.css` and checks WCAG contrast** for text/bg, muted/bg, primary-text/primary, accent-text/accent and each case colour on its tint and on surface — the test fails if any pair is below the threshold, then adjust the value, not the threshold.

**Sixth theme — Magazin** (inspired by German news magazines such as *Der Spiegel*; use no logos, names or brand assets): white page, black headlines, a thin rule under the nav, square corners, dense grid, small uppercase **kicker** labels above headings in accent red-orange, hairline grey separators instead of cards. bg/surface `#FFF`, surface-2 `#F4F4F2`, border `#D6D6D2`, text `#111`, muted `#5A5A5A`, primary `#111`/`#FFF`, accent text/kickers `#C93A12`, accent bars/rules `#E64415` (marks only, not text), word-new `#FFE7A3`, focus `#111`, radius 0/2 px; fonts: Source Serif 4 bold for headlines, Libre Franklin for UI, Literata for reading. **Cases:** Akkusativ becomes crimson `#9F1239` (tint `#FDE8EE`) so it can't be confused with the red-orange accent; N `#1F5FAF`, D `#2E7D32`, G `#9A5212`. Never use the accent to highlight words.

## Testing — applies to every milestone (non-negotiable)

- **Never commit red.** Before every commit: `cd app && npm run test` and `cd server && .venv/bin/pytest -q` must pass. If a test fails, fix the code (or the test if the test is wrong — say so in the commit message).
- **Every milestone ships its tests:**
  - Pure logic (vitest or pytest): vocab scoring + false-alarm correction, Satz-Check coverage + verdict, FSRS wrapper (intervals monotonic, "kenne ich" burial), daily-plan/block generation, immersion-hour totals, theme contrast (see M5b).
  - API (pytest + FastAPI `TestClient`, temp SQLite per test): every endpoint, happy path + one error case.
  - **Content validation** (pytest, runs on all JSON in `data/`): schema/required fields, no duplicate lemmas, the example sentence contains the target word or an inflected form, nouns have article + plural, texts in `data/texts/` have ≤ 5 % tokens outside the top 2,000, no empty strings.
  - **E2E smoke (Playwright, Chromium headless)** in `app/e2e/kaskade.spec.ts` against the running services: Heute loads; vocab test can be answered and shows a result; Satz-Check accepts an SRT and records ratings; Karten reveal + rate + "kenne ich"; theme dropdown switches all six themes without console errors. Chromium is already installed for this user (`~/.cache/ms-playwright`, Playwright 1.56.1). This OS isn't officially supported by Playwright — if you need to (re)install browsers, prefix with `PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64`. Run E2E before each milestone commit from M2 on.
- **CI:** add `.github/workflows/kaskade-ci.yml` (triggers: push + PR on branch `kaskade`) running `npm ci && npm run test` in `app/`, `pip install -r requirements.txt && pytest -q` in `server/`, and the content validation. Leave the existing main/Pages workflow untouched.
- Report test counts (unit / API / content / E2E, passed/failed) in PROGRESS.md after each milestone.

## Follow-ups from first use (2026-10-10) — do these first in the next run

Placement result: vocab ≈ 3,550 (85 % of core 2,000), Lesen B1, Satz-Check 83 % on DRUCK (adult) → **Phase 2B**. Issues found while Matt used it:

1. **Satz-Check counts non-speech cues.** Lines like `* Musik: … *`, `* Stimmen und Lachen *`, `[Klopfen]`, `♪ … ♪` were rated and inflated coverage (83 % → 80 % on speech only). Filter them out when parsing/choosing the window (lines fully wrapped in `*…*`, `[…]`, `(…)`, or starting with ♪); add tests. Recompute the stored run #1 with the filter and show both numbers if they differ.
2. **"▶" next to a clip in "Deine Clips" only selects it** — Matt clicked it repeatedly expecting playback. Use a clear select control (radio/"Auswählen"), and after selecting scroll/focus step 2 (Startpunkt + "Satz-Check starten"). Consider a small preview player in step 2.
3. **Transcode every upload to H.264/AAC MP4 with `+faststart`** (ffmpeg is installed) so it plays in Safari/Firefox/Chrome; keep the original only if transcoding fails. The first clip arrived as AV1/Opus from yt-dlp.
4. **YouTube import can't work from this server** (YouTube answers "Sign in to confirm you're not a bot" for datacenter IPs). Options to implement: accept a cookies.txt upload for yt-dlp, and document a Mac-side one-liner (`yt-dlp … --write-subs --sub-langs de… --convert-subs srt` + upload). Show a clear message instead of a generic failure.
5. **Plan for Phase 2B.** Heute should switch to a 2B block when phase = 2B: less core-deck time (only remaining unknown core words, ~10–15 min), more interactive watching with sentence mining from series (DRUCK etc.), free reading/listening, B1 exam task unchanged. Mined sentences from Satz-Check "mit Hilfe"/"zu schwer" lines can be offered as cards.
6. The "zu schwer" lines were short, fast colloquial lines (*Na?*, *seit 'ner Stunde*, *Glaubst du mir nicht?*) — words known, speech too fast → surface this in the result as "Hören bei normalem Tempo" and suggest the Hören-Lab/loop for those lines.
