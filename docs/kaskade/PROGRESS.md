# Kaskade — Fortschritt

_Wird vom Agenten nach jedem Meilenstein aktualisiert. Auftrag: [TASK.md](TASK.md)._

**URL (nur im Tailnet):** http://100.64.43.3:5173/

- [x] M0 Setup
- [x] M1 Wortschatz-Test → http://100.64.43.3:5173/wortschatz
- [x] M2 Satz-Check → http://100.64.43.3:5173/satz-check
- [ ] M3 Einstufung
- [ ] M4 Kernwortschatz + Karten
- [ ] M5 Heute + Wochen 1–4
- [ ] M6 Extras

## Betrieb

| Dienst | Was | Adresse |
|---|---|---|
| `kaskade-api` | FastAPI + SQLite | 127.0.0.1:8000 (nur lokal) |
| `kaskade-web` | gebaute Vue-App via `vite preview`, leitet `/api` weiter | 100.64.43.3:5173 |

```bash
systemctl --user status kaskade-api kaskade-web
systemctl --user restart kaskade-api            # nach Backend-Änderung
cd ~/kaskade/app && npm run build && systemctl --user restart kaskade-web   # nach Frontend-Änderung
journalctl --user -u kaskade-api -f             # Logs
cd ~/kaskade/server && .venv/bin/python -m pytest -q   # Backend-Tests
cd ~/kaskade/app && npm run test                # Frontend-Tests
cd ~/kaskade/app && npm run build && npm run test:e2e:kaskade   # E2E (eigene Test-Instanz, echte Daten unberührt)
```
(E2E auf diesem OS mit `PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-x64` davor.)

- Daten: `~/kaskade-data/` (DB `kaskade.db`, `media/`, `recordings/`, `tts/`, `freq/`). Nichts davon im Git.
- Unit-Dateien im Repo: `deploy/systemd/` → kopiert nach `~/.config/systemd/user/`.
- KI optional: `ANTHROPIC_API_KEY=…` in `~/kaskade-data/.env`, dann `systemctl --user restart kaskade-api`.

## Log

### M0 Setup ✅
- `server/` (FastAPI, venv mit `python3 -m venv` — `uv` ist nicht installiert), `/api/health` läuft.
- Entscheidung: gebaute App per `vite preview` statt Dev-Server → stabiler als Dienst; Backend bleibt auf 127.0.0.1.
- `.gitignore`: DB, Medien, Audio, Untertitel, `.env`, `.venv`.

### M1 Wortschatz-Test ✅
- Frequenzliste: `data/freq/lemmas.tsv` (spaCy-lemmatisiert, CC BY-SA 4.0, Quelle in `data/freq/README.md`). Automatisch → noch etwas Rauschen; die kuratierte Liste ist das Kerndeck (M4).
- Test: 6 Bänder bis Rang 8.000, je 20 aus ~45 handverlesenen Wörtern + 30 selbst erfundene Pseudowörter (geprüft: nicht in der Liste). ~150 Wörter, Tasten J/N, ⌫ zurück.
- Wertung: pro Band (Treffer − Fehlalarm) / (1 − Fehlalarm) × echte Lemmata im Band; Warnung, wenn > 20 % Pseudowörter mit Ja.
- Entscheidung: Bandgrößen = Rohränge minus geschätzter Müll (~15 %); wird nach dem Kerndeck nachjustiert.
- Theme-Regel 9 von Anfang an: alle Farben/Fonts als Tokens in `app/src/styles/themes.css`; ein Test verbietet Hex/Fontnamen in `components/kaskade` + `views/kaskade`. Schriften lokal via `@fontsource`.
- Tests: Unit Frontend 50 ✅ (9 neu) · Backend 26 ✅ (Unit 11, API 9, Content 6) · E2E 2 ✅.
- ⚠️ **Blocker CI:** Der Git-Zugang darf keine Dateien unter `.github/workflows/` pushen (Token ohne `workflow`-Scope). Workflow liegt daher in `deploy/ci/kaskade-ci.yml`. **Matt:** einmal `git mv deploy/ci/kaskade-ci.yml .github/workflows/` und selbst pushen.
- E2E startet eigene API (8001) + Preview (5174) mit Wegwerf-Daten — echte DB bleibt sauber.

### M2 Satz-Check ✅
- Quelle (a): Video/Audio + `.srt`/`.vtt` hochladen (Medien optional — nur Untertitel geht auch, dann wird nach Text bewertet). Quelle (b): YouTube-Link → yt-dlp holt deutsche Untertitel + Video in niedriger Qualität nach `~/kaskade-data/media`. Gestern Abend war YouTube von hier erreichbar; wenn es blockt, kommt eine klare Meldung „bitte hochladen“.
- 3-Minuten-Fenster per Schieberegler. Clip pausiert nach jedem Satz; Tasten 1/2/3, R = nochmal, Leertaste = Pause, ↑/↓ = Satz wechseln.
- Ergebnis: Abdeckung (verstanden + mit Hilfe), Balken mit Tor-Linie, Urteil nach Refolds Toren (einfach ≥ 75 % → Phase 1 geschafft; Erwachsene ≥ 80 % + ≈ 2.000 Wörter → 2B; 60–79 % → 2A), mit Datum gespeichert, Verlauf auf der Seite.
- Entscheidung: „≈ 2.000 Wörter“ = Schätzung aus dem letzten Wortschatz-Test ≥ 1.900. Untertiteldateien von YouTube werden nach dem Einlesen gelöscht (nur Sätze in der DB).
- Tests: Frontend 65 ✅ · Backend 53 ✅ (Unit 26, API 21, Content 6) · E2E 3 ✅ (echter Chromium spielt Clip und pausiert am Satzende).
