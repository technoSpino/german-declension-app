# Kaskade — Fortschritt

_Wird vom Agenten nach jedem Meilenstein aktualisiert. Auftrag: [TASK.md](TASK.md)._

## Heute früh ☕

**URL (nur im Tailnet):** http://100.64.43.3:5173/

1. [ ] **URL öffnen** → Heute. Plan-Woche 1 startet **Mo, 12. Oktober**; bis dahin siehst du eine Vorschau.
2. [ ] **Einstufung** (~55 min, pausierbar): Wortschatz → Lesen → Satz-Check → Schreiben → Sprechen. Für den Satz-Check: ein 3-Minuten-Clip aus einer Serie für Erwachsene + deutsche `.srt`/`.vtt` hochladen (oder YouTube-Link probieren). Ohne Clip: überspringen und später unter „Satz-Check“ nachholen.
3. [ ] **Erste Karten-Sitzung**: erst mit **K** alles wegsortieren, was du sofort verstehst, dann 20 neue Karten lernen. Taste **A** liest den Satz vor.
4. [ ] Oben rechts **Stil** ausprobieren (6 Designs).
5. [ ] Optional: `deploy/ci/kaskade-ci.yml` nach `.github/workflows/` verschieben und selbst pushen (mein Token darf das nicht).

**Bekannte Punkte**
- CI-Workflow liegt (noch) nicht unter `.github/workflows/` — siehe Punkt 5.
- Ohne `ANTHROPIC_API_KEY` wird Schreiben nur gespeichert, nicht bewertet. Sprechen wird nur aufgenommen.
- Hören-Stufe in der Einstufung kommt aus dem Satz-Check (mit Untertiteln → eher optimistisch).
- Alte Grammatikseiten („Nachschlagen“) bleiben in jedem Stil hell.
- Immersion zählt nur die Block-Timer; passives Hören/externe Zeit kommt mit M12.

## Stand

- [x] M0 Setup
- [x] M1 Wortschatz-Test → http://100.64.43.3:5173/wortschatz
- [x] M2 Satz-Check → http://100.64.43.3:5173/satz-check
- [x] M3 Einstufung → http://100.64.43.3:5173/einstufung
- [x] M4 Kernwortschatz + Karten → http://100.64.43.3:5173/karten
- [x] M5 Heute + Wochen 1–4 → http://100.64.43.3:5173/
- [x] M5b Themes + Stil-Auswahl (oben rechts im Header)
- [x] M6 Extras (Piper-Audio, Fahrplan → http://100.64.43.3:5173/fahrplan, 320 px)
- [x] M7 Kerndeck-Korrektur (vorgezogen)
- [x] M8 Lesebibliothek → http://100.64.43.3:5173/lesen
- [x] M9 Leser mit Kasus-Linse + Satz minen
- [x] M10 Audio + Wiederhören-Feed → `http://100.64.43.3:5173/api/feed.xml`
- [x] M11 B1-Übungsbank → http://100.64.43.3:5173/pruefung
- [x] M12 Immersions-Log + Fahrplan → http://100.64.43.3:5173/immersion

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

### M3 Einstufung ✅
- 5 Schritte: Wortschatz → Lesen (2 eigene Texte: B1 „Mitfahrbank“, B2 „Nachverdichtung“, je 5 Fragen, Tasten A/B/C + Enter) → Satz-Check → Schreiben (E-Mail an Jana, ~80 Wörter) → Sprechen (3 Fragen, Mikrofon-Aufnahme in `~/kaskade-data/recordings`).
- Pausierbar: jeder Klick wird gespeichert; „Pause — später weitermachen“ und beim nächsten Öffnen geht es am selben Punkt weiter.
- Satz-Check, Schreiben, Sprechen sind überspringbar (z. B. ohne Clip oder Mikrofon) — Ergebnis vermerkt das.
- Ergebnis: Phase (aus Satz-Check, sonst aus Wortschatz), Wörter + Kern-2.000, grobe Stufen (Lesen aus den Texten, Hören aus dem Satz-Check), Startstunden für die B2-Prognose. Setzt die Phase im Header.
- Schreiben wird nur mit `ANTHROPIC_API_KEY` bewertet (claude-opus-5-5, 4 Kriterien + Korrekturen); ohne Schlüssel: gespeichert, „nicht bewertet“.
- Entscheidung: Hören-Stufe ist aus dem Satz-Check abgeleitet (mit Untertiteln → eher zu optimistisch); ein echter Hörtest kommt mit M11.
- Tests: Frontend 70 ✅ · Backend 89 ✅ (Unit 47, API 34, Content 8) · E2E 4 ✅ (Einstufung komplett inkl. Pause/Fortsetzen und 3 Aufnahmen).

### M4 Kernwortschatz + Karten ✅
- **Deck komplett: 2.185 Satzkarten** (Ränge 1–2.600 der Frequenzliste; 415 Einträge aussortiert: Namen, Englisch, Füllwörter, Beugungsformen). 22 Dateien `data/core-deck/0001–0022.json`, je 100 Karten. Jede Karte: eigener Beispielsatz (A2–B1, Alltag), Zielwort markiert, englische Bedeutung + Übersetzung, kurze deutsche Notiz (Artikel + Plural, Perfekt/Präteritum, Kasus nach Präpositionen mit N/A/D/G-Badge).
- Geschrieben in 26 Rohdateien (`data/core-deck/raw/`) von 8 parallelen Autoren-Agenten, validiert mit `server/scripts/merge_deck.py`, Stichprobe von mir gegengelesen. Zweiter Korrekturdurchgang = M7.
- Karten: Leertaste aufdecken · 1–4 bewerten (mit Intervall-Vorschau) · **K = kenne ich schon** (für immer weg, zählt nicht zu den 20 neuen/Tag) · Z rückgängig · A Audio (vorerst Browser-Stimme, Piper in M6).
- FSRS (Python `fsrs` 6.3, Ziel 90 % behalten) komplett auf dem Server, Zustand in SQLite. Tag wechselt um Mitternacht Berliner Zeit. Nach 4× „Nochmal“ wird eine Karte pausiert.
- Tests: Frontend 74 ✅ · Backend 121 ✅ (Unit 60, API 38, Content 23) · E2E 5 ✅.
- Bekannt: 8 doppelte Beispielsätze und ein paar wichtige Nomen, die wegen eines (behobenen) Skriptfehlers fehlen (der Arm, die Rede, die Suche) → M7.

### M5 Heute + Wochen 1–4 ✅
- **Plan startet Montag, 12. Oktober** (Woche 1). Bis dahin zeigt Heute eine Vorschau auf Montag. Regel: Erstbesuch Mo–Mi → diese Woche, Do–So → nächster Montag. Ändern: `PUT /api/plan/start`.
- Block 09:00 Karten 30 · 09:30 Schauen/Lesen 55 · 10:25 Pause 10 · 10:35 freies Lesen 30 · 11:05 B1-Prüfungsteil 25. Zeitleiste mit „jetzt“-Marker (Berliner Zeit).
- `data/plan/weeks-1-4.json`: 4 Wochenthemen (Wohnen · Arbeit · Gesundheit/Behörden · Freizeit/Reisen/Medien), Tagesfokus, 16 eigene Aufgaben (Mo/Mi Schreiben, Di/Do Sprechen, Fr Wochenrückblick). Woche 5 wiederholt, Woche 6 = Platzhalter Probeprüfung.
- Start/Stopp-Timer pro Block (läuft im Header weiter, auch auf anderen Seiten) → Minuten pro Tag/Woche → Immersionsstunden (Start aus Einstufung + gemessene Zeit). „Fertig“ markiert Blöcke.
- Prüfungsaufgabe öffnet `/aufgabe/<id>`: Schreiben mit Wortzähler (KI-Bewertung nur mit Schlüssel), Sprechen mit Aufnahme.
- Tests: Frontend 82 ✅ · Backend 157 ✅ (Unit 74, API 49, Content 34) · E2E 6 ✅ (Server-Uhr in E2E fest auf Di 09:30). Layout bei 320 px geprüft (Screenshots), keine Konsolenfehler.

### M5b Themes ✅
- **Stil**-Auswahl oben rechts: Signal · Nacht · Papier · Bauhaus · Fokus · Magazin. Gespeichert in localStorage + Server; ohne Wahl folgt sie dem System (hell → Signal, dunkel → Nacht).
- Alles über Tokens in `app/src/styles/themes.css`; theme-eigene Struktur (Papier/Magazin: Linien statt Karten, Bauhaus: harte Schatten, Fokus: größer + Unterstreichungen) ebenfalls nur dort. Schriften lokal via `@fontsource` (Archivo, Archivo Black, Literata, Source Serif 4, Atkinson Hyperlegible, Libre Franklin).
- Kontrast-Test parst `themes.css`: 21 Paare × 6 Themes (Text, gedämpft, Primär, Akzent, Kasusfarben auf Tönung und Fläche …). Angepasst, weil zu schwach: Bauhaus-Genitiv `#C25700` → `#A84B00`.
- Entscheidung: Die alten Grammatikseiten („Nachschlagen“) bleiben in jedem Stil hell — sie sind nicht auf Tokens umgebaut.
- Tests: Frontend 258 ✅ (davon 170 Kontrast) · Backend 158 ✅ · E2E 7 ✅ (alle 6 Stile auf 5 Seiten, Reload behält Stil, Karten im Nacht-Stil).

### M6 Extras ✅
- **Audio:** Piper (`piper-tts` 1.8, GPL-3.0, nur als Werkzeug) mit der Stimme **de_DE-thorsten-medium** (Datensatz Thorsten-Voice, **CC0**; das Modell ist von Pipers englischer „lessac“-Stimme feinjustiert — für private Nutzung unbedenklich). Stimme + Audio in `~/kaskade-data/tts/`, nichts im Git. Alle 2.201 Kernsätze werden vorab erzeugt (`server/scripts/tts_deck.py`, ~12 KB/Satz als Opus); fehlende entstehen beim ersten Abspielen. Ohne Piper: Browser-Stimme als Ersatz.
- **Fahrplan** mit echten Daten: Stunden bis B2 (Start aus Einstufung + gemessene Blockzeit), Prognose „nur Block“ (11,7 h/Woche) und „+ 48 min passiv“, ab 2 h Daten auch nach deinem echten Tempo; aktuelle Phase markiert; Satz-Check-Verlauf + nächster Termin (+ 4 Wochen).
- **320 px:** alle Kaskade-Seiten in mehreren Stilen per Screenshot geprüft — kein horizontales Scrollen, keine Konsolenfehler. Behoben: Block-Liste auf Heute (Knöpfe unter dem Text), Achsenbeschriftung, fehlende Aufzählungspunkte.
- Tests: Frontend 260 ✅ · Backend 173 ✅ (Unit 83, API 56, Content 34) · E2E 9 ✅.

### M7 Kerndeck-Korrektur ✅ (vorgezogen, lief parallel zu M5)
- Zweiter Durchgang über alle 26 Rohdateien durch 8 Korrektur-Agenten: **46 Karten korrigiert** (u. a. Kasus-Badges, „ertönen · hat ertönt“, unidiomatische Sätze wie „Magie können“, „Die Mieten sind teuer“ → „hoch/Wohnungen teuer“), alle 8 doppelten Sätze ersetzt.
- **16 fehlende Wörter ergänzt:** der Arm, die Rede, der Ruf, die Suche, die Wette, der Schlag, der Brauch, der Griff, das Leck, rein (pur), meiste, der Roboter, der Teller, das Medikament, das Geräusch, heilen. Deck jetzt **2.201 Karten**.
- Karten-IDs hängen jetzt am Frequenzrang (`core:r00211`) statt an der Position → neue Karten verschieben nie den Lernstand.
- Neue Tests: keine doppelten Sätze, IDs = Rang.
- **Nachtrag (Fehler gefunden):** Meine Englisch-Filterliste beim Bau der Frequenzliste enthielt auch deutsche Wörter — **„man“** fehlte im Deck, ebenso Job, Baby, Party, Team, Show, Boss, Date, Fan. Ergänzt über `raw/supplement.json` an ihrer echten Frequenzposition („man“ = Karte 69). Deck: **2.210 Karten**, alle mit Piper-Audio.

### M8 Lesebibliothek ✅
- **20 eigene Texte** (`data/texts/t01–t20.json`, 228–278 Wörter): Wohnen, Nachbarn, Einkaufen, Arbeit, Gehalt, Sportverein, Arzt, Bürgeramt, Amtsbrief, Apotheke, Bahn, Ostsee, Kochabend, Woche ohne Handy, Omas Geburtstag. 10× A2+, 10× B1; 8 für 09:30 (mit Hilfen), 12 für 10:35 (freies Lesen).
- i+1 geprüft: jeder Text **≥ 95 % Kernwörter** (spaCy-Prüfer `server/kaskade/textcov.py`, Werte 95,8–98,3 %); jedes Wort außerhalb steht im Glossar. Stichproben von mir gegengelesen.
- `/lesen`: Bibliothek mit Filter; Leser mit markierten neuen Wörtern (antippen → Bedeutung), „Hilfen ausblenden“ fürs freie Lesen, Vorlesen (Piper), 3 Verständnisfragen, „Fertig gelesen“.
- Heute schlägt für 09:30 und 10:35 automatisch den nächsten ungelesenen Text vor; „Starten“ öffnet ihn und startet den Timer.
- Tests: Frontend 267 ✅ · Backend 227 ✅ · E2E 10 ✅. Gefixt beim Testen: Glossar wurde in der API von einer Zahl überschrieben.

### M9 Leser mit Kasus-Linse ✅
- Jeder Bibliothekstext und **eigene Texte** (`/lesen/eigener-text`, einfügen) werden mit spaCy analysiert: Lemma, Wortart, Kasus.
- **Kasus-Linse:** Nominalgruppen unterstrichen in N/A/D/G-Farbe, immer mit Buchstabe. Wort antippen → Artikel + Plural, Bedeutung, Kasus + Grund („mit + Dativ“, „über + Akkusativ · Wechselpräposition …“, „Dativobjekt von ‚geben‘“, „Subjekt → Nominativ“). Hinweis „automatisch erkannt, kann sich irren“ (kleines Modell, ~90 % richtig).
- **Wortstatus** aus deinen Karten: neu (gelb) · lernend (unterstrichen) · bekannt. Noch nicht gesehene Kernwörter innerhalb deines gemessenen Bereichs (Wortschatz-Test, sonst Top 500) gelten als bekannt — sonst wäre anfangs alles gelb.
- **Wörterbuch:** Wiktionary (kaikki.org, CC BY-SA) als kompaktes Glossar in `~/kaskade-data/dict/` (86.000 Wörter + 248.000 Formen), nicht im Git. Quellen: `docs/kaskade/SOURCES.md`.
- **Satz minen** → neue Satzkarte (mit Kasus-Badge und Quelle), kommt in Karten vor den neuen Kernwörtern.
- Tests: Frontend 271 ✅ · Backend 238 ✅ · E2E 11 ✅ (Leser mit Linse, eigener Text → minen → erscheint in Karten).

### M10 Audio + Wiederhören-Feed ✅
- Piper-Audio für alle Kernsätze (Karten, Taste A) und alle Bibliothekstexte (Leser, „Vorlesen“) — vorab erzeugt, sonst beim ersten Abspielen.
- **Privater Podcast:** `http://100.64.43.3:5173/api/feed.xml` (nur im Tailnet). Folgen: jeder in den letzten 14 Tagen gelesene Text + „Kernsätze der Woche“ (jeder in Karten wiederholte Satz, zweimal gesprochen). MP3, damit jede Podcast-App es abspielt. **Am Handy:** Tailscale an, in der Podcast-App „Feed per URL hinzufügen“.
- Heute zeigt unter dem Block „Nach dem Block · Passiv“ mit dem Feed-Link (wie im Entwurf).
- Entscheidung: nur eine Stimme (Thorsten) — für Dialoge mit zwei Stimmen (M11) gibt es keine zweite freie deutsche Stimme mit klarer Lizenz in Piper-Qualität „medium“; Dialoge werden mit Sprecherangabe vorgelesen.
- Tests: Backend 243 ✅ (Feed: Folgenauswahl, gültiges RSS, Längen/Dauer, Audio, ohne TTS leer) · Frontend 271 ✅ · E2E 11 ✅.

### M11 B1-Übungsbank ✅
- `/pruefung` (neu im Menü „Prüfung“): **Lesen** 4 eigene Aufgaben (Blog richtig/falsch, Zeitungsartikel Multiple Choice, Zuordnung Personen ↔ Anzeigen mit „0“, Sperrmüll-Info richtig/falsch) · **Hören** 4 eigene Skripte (Durchsage, Anrufbeantworter, Gespräch, Radiointerview) mit Piper — **zweite Stimme** durch Tonhöhen-Verschiebung, damit Dialoge unterscheidbar sind; Abspielen nur 1× bzw. 2× wie in der Prüfung, Transkript erst nach Abgabe · **Schreiben** die 8 Schreibaufgaben aus dem Plan mit Wortzähler + Selbstcheck (Aufgabe erfüllt? Anrede/Gruß? Konnektoren? Verbstellung?).
- **Auf Zeit** (Countdown, gibt automatisch ab) oder ohne Zeit. Ergebnis pro Aufgabe; Stand pro Modul = Schnitt der letzten 3 Versuche gegen die **60-%-Grenze**.
- Alles original, keine echten Prüfungsaufgaben; Antworten und Deutsch von mir gegengelesen.
- Tests: Backend 270 ✅ (Bewertung aller Aufgabentypen, 60 %-Grenze, Bereitschaft, Inhalte, TTS-Tauglichkeit der Skripte) · Frontend 277 ✅ · E2E 12 ✅.

### M12 Immersions-Log + Fahrplan ✅
- **Eintragen** für Zeit außerhalb des Blocks: auf Heute „+ Eintragen“ oder `/immersion` (Titel, Minuten, Datum, aktiv/passiv). Liste der letzten 60 Tage mit Löschen.
- Heute: Wochenbalken jetzt **aktiv + passiv gestapelt** (wie im Entwurf) mit Summen.
- Gesamtstunden = Start aus Einstufung + Block-Timer + eigene Einträge (aktiv und passiv zählen beide voll — Entscheidung, wie im Entwurf). Fließt in die Prognose („nach deinem Tempo“, ab 2 h Daten) und die Phase nach Stunden.
- Fahrplan: neue Grafik **Stunden pro Woche (8 Wochen)** mit 11,7-h-Ziellinie; echte Phase, Tore, Satz-Check-Verlauf waren schon da (M6).
- Tests: Backend 274 ✅ · Frontend 281 ✅ · E2E 13 ✅.
