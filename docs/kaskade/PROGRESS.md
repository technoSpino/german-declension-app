# Kaskade — Fortschritt

_Wird vom Agenten nach jedem Meilenstein aktualisiert. Auftrag: [TASK.md](TASK.md)._

## Für Montag, 12. Oktober — Stand So 11.10. mittags (#16, #17)

**Adresse jetzt mit HTTPS:** https://cos.tail1b5741.ts.net:8443/ (nur im Tailnet; nur dort geht das Mikrofon). Die alte http://100.64.43.3:5173/ geht weiter.

**Jeder Block sagt jetzt genau, was dran ist — und „Starten“ öffnet genau das.** Kein „z. B.“, kein „oder“, kein Suchen. Echtes Material zuerst, alles schon in deiner Bibliothek:

| Woche 1 | Schauen & minen (65 min) | Frei lesen / hören (35 min) | Prüfung |
|---|---|---|---|
| Mo 12.10. | *Tatort: Schweigen* 0:00–30:14 | Easy German Podcast #698 | Schreiben *Ein Beet im Hof* |
| Di 13.10. | *Tatort: Schweigen* 30:14–60:40 | tagesschau.de · Inland: 3 Artikel des Tages | Sprechen *Ein Hoffest* (HTTPS!) |
| Mi 14.10. | *Tatort: Schweigen* 60:40–89:21 | Easy German Podcast #700 | Schreiben *Kein Licht im Fahrradkeller* |
| Do 15.10. | *SOKO Leipzig: Das Auge* 0:00–22:04 | ARD Radio Tatort *Übertherapie* 0:00–27:00 | Sprechen *Dinge mit Nachbarn teilen* |
| Fr 16.10. | *SOKO Leipzig: Das Auge* 22:04–43:31 | Radio Tatort 27:00–54:12 | Prüfungstraining Lesen *Drei Monate in Leipzig* |

Die Schnittstellen liegen in Gesprächspausen (aus den Untertiteln berechnet). Schauen hält am Ende des Tagesteils einmal an: **„Ziel für heute erreicht ✓“**; wer zurückliegt, startet ab der eigenen Position. Die drei tagesschau-Links stehen am Morgen auf Heute.

**Wochen 2–4 sind auch komplett geplant und geholt:** *Merz gegen Merz* 1–3, *Die 100*, *RESPEKT*, *Charité* 19, *Quarks: Schlaf*, *Wunderschön! Nordeifel*, *Feuer & Flamme* (ARD/ZDF, mit UT, verfügbar bis 2027–2031), sechs Easy-German-Folgen. Der neue *Tatort: Unter Freunden* (Satz-Check in Woche 4) läuft heute Abend zum ersten Mal — Kaskade holt ihn morgen früh automatisch. Netflix: *King of Stonks* S1F1 (Mi 21.10.) und YouTube: Easy German Straßeninterviews (Fr 23.10.) laufen in Chrome mit **Language Reactor**.

**Für dich zu tun — steht auf Heute unter „Bald fällig“ (ab 14 Tage vorher) und im Fahrplan:**
- **Fällig Mo 12.10.:** Ferdinand von Schirach, *Verbrechen* (btb Taschenbuch 2020, ISBN 978-3-442-77066-3, 208 S., 12,00 € laut Verlag; als E-Book reicht Sa 17.10., 10,99 €). Jeden Tag ganze Geschichten mit Seitenangabe (aus dem Inhaltsverzeichnis dieser Ausgabe): Woche 2 Mo S. 7–42 („Fähner“, „Tanatas Teeschale“), Di S. 43–74, Mi S. 75–88 („Glück“), Do S. 89–120 („Summertime“), Fr S. 121–160; Woche 3 Di S. 161–184, Mi S. 185–205 („Der Äthiopier“). Harte Fälle — eine darf man überspringen.
- **Fällig Mo 26.10.:** Daniel Glattauer, *Gut gegen Nordwind* (Hanser TB, ISBN 978-3-446-28638-2, 14 €) — Woche 4.
- ~~Language Reactor~~ ✓ (hast du schon abgehakt). *Die Känguru-Chroniken* nur noch später, optional, als Hörbuch (vom Autor gelesen) — keine Kaufkarte.

**KI-geschrieben ist jetzt markiert:** Karten, die 20 Bibliothekstexte, Einstufung, Prüfungsaufgaben und Hörskripte tragen das Etikett „KI-geschrieben“; echtes Material zeigt seine Quelle. Vorlesen heißt „Computerstimme“, Bewertungen heißen „KI-Bewertung“.

**Materialcheck:** täglich 06:30 (Berlin) holt Kaskade fällige Folgen, wählt die Nachrichten des Tages und prüft die nächsten 7 Tage — „→ zu tun“ erscheint nur bei echten Lücken. Stand jetzt: keine Lücke.

Tests: **Backend 394 · Frontend 382 · E2E 27 + 31 (alt)**, alle grün; Dienste laufen mit dem neuen Stand.

## Für Montag, 12. Oktober — Stand Sa 10.10. abends

**Alle Follow-ups aus der ersten Nutzung sind erledigt** (#10, #13, #5, #11, #12, #14, #1, #3, #2, #8, #9, #4, #6; #7 mit #5; #15 gilt ab jetzt: Signal ist die Referenz). Tests: **Backend 323 · Frontend 354 · E2E 21 + 31 (alt)**, alle grün; Dienste laufen mit dem neuen Stand.

**Montag 09:00 einmal komplett durchgespielt** — auf einer Kopie deiner echten Daten, Uhr auf Mo 12.10. 09:00 (Berlin) gestellt, in Firefox und Chromium: Heute zeigt Woche 1 · Phase 2B mit dem 2B-Block, alle vier „Starten“ aktiv, „Karten“ ist der aktuelle Block. Karten → bewerten, K, Rückgängig ✓ · „Fertig“ stoppt den Timer, Minuten werden gezählt ✓ · Schauen & minen öffnet *Tatort: Schweigen*, Zeilen ←/→, Wort antippen, Satz minen mit Original-Ton ✓, Position wird gemerkt ✓ · Frei lesen → Text, „Fertig gelesen“ ✓ · Prüfungsteil → *Ein Beet im Hof* schreiben und abgeben ✓ · am Ende 4 von 4 erledigt, Montag im Wochendiagramm, keine Konsolenfehler. Dabei behoben: laufender Timer bekommt eine eigene schmale Zeile (die Navigation brach sonst um), und falls ein Browser ein Video nicht abspielen kann, steht dort jetzt eine deutsche Erklärung statt der englischen Browser-Meldung.

**Einziger offener Punkt:** Das Video selbst konnte ich nicht abspielen lassen — die Test-Browser hier haben keinen H.264-Decoder (Firefox auf dem Mac hat ihn). Die Clips sind geprüft H.264/AAC mit faststart und werden korrekt ausgeliefert (Range-Anfragen über den Proxy funktionieren). Bitte am Montag kurz bestätigen, dass *Tatort: Schweigen* in Schauen & minen abspielt.

## Guten Morgen, Matt — Zusammenfassung der Nacht

**Alles aus TASK.md ist fertig: M0–M6, M5b und der ganze Backlog M7–M13.** 15 Commits auf `kaskade`, alle Tests grün:
**Frontend 287 · Backend 278 (Unit, API, Content) · E2E 14 (Kaskade) + 31 (alte Grammatik-App).**

- **Heute** mit Lernblock, Timern, Textvorschlägen, Prüfungsaufgabe des Tages, Immersion · **Einstufung** (5 Teile, pausierbar) · **Satz-Check** (Upload oder YouTube) · **Karten** mit 2.210 eigenen Satzkarten, FSRS, „K = kenne ich“, Piper-Audio · **Lesen**: 20 eigene i+1-Texte + eigene Texte, Kasus-Linse, Satz minen · **Prüfung**: B1-Übungen Lesen/Hören/Schreiben gegen 60 % · **Fahrplan** mit B2-Prognose · **Wiederhören-Podcast** · **6 Stile**.
- Inhalte (Deck, Texte, Aufgaben) von parallelen Autoren-Agenten geschrieben, von Korrektur-Agenten und mir gegengelesen, automatisch validiert. Alles original; Quellen/Lizenzen: [SOURCES.md](SOURCES.md). Betrieb: [RUNBOOK.md](RUNBOOK.md).

## Heute früh ☕

**URL (nur im Tailnet):** http://100.64.43.3:5173/

1. [ ] **URL öffnen** → Heute. Plan-Woche 1 startet **Mo, 12. Oktober**; bis dahin siehst du eine Vorschau.
2. [ ] **Einstufung** (~55 min, pausierbar): Wortschatz → Lesen → Satz-Check → Schreiben → Sprechen. Für den Satz-Check: ein 3-Minuten-Clip aus einer Serie für Erwachsene + deutsche `.srt`/`.vtt` hochladen (oder YouTube-Link probieren). Ohne Clip: überspringen und später unter „Satz-Check“ nachholen.
3. [ ] **Erste Karten-Sitzung**: erst mit **K** alles wegsortieren, was du sofort verstehst, dann 20 neue Karten lernen. Taste **A** liest den Satz vor.
4. [ ] Einen Text unter **Lesen** öffnen (Kasus-Linse, Wort antippen, „Satz minen“).
5. [ ] Oben rechts **Stil** ausprobieren (6 Designs).
6. [ ] Am Handy (Tailscale an) den Podcast `http://100.64.43.3:5173/api/feed.xml` in der Podcast-App abonnieren — füllt sich, sobald du liest und Karten lernst.
7. [ ] **Für dich zu tun:** `git mv deploy/ci/kaskade-ci.yml .github/workflows/` und selbst pushen (mein Token hat keinen `workflow`-Scope). Optional `ANTHROPIC_API_KEY=…` in `~/kaskade-data/.env` → Schreiben wird bewertet.

**Bekannte Punkte**
- CI-Workflow liegt (noch) nicht unter `.github/workflows/` — siehe Punkt 7.
- Ohne `ANTHROPIC_API_KEY` wird Schreiben nur gespeichert, nicht bewertet. Sprechen wird nur aufgenommen.
- Hören-Stufe in der Einstufung kommt aus dem Satz-Check (mit Untertiteln → eher optimistisch).
- Kasus-Linse nutzt ein kleines spaCy-Modell — meist richtig, aber nicht immer (steht auch so in der App).
- Die Frequenzliste stammt aus Film-Untertiteln: einige Alltagswörter (Bahnhof, Dorf, Miete) sind dort selten und daher nicht im Kern-2.000-Deck; die Lesetexte erklären sie im Glossar.
- Alte Grammatikseiten („Nachschlagen“) bleiben in jedem Stil hell.
- Server-Zeit ist UTC; alles Tägliche (Kartentag, Plan, Timer) rechnet bewusst in Berliner Zeit. Backup läuft 12:00 UTC.

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
- [x] M13 Härtung (Fehlerzustände, Backups, Runbook, 320 px)

### Follow-ups aus der ersten Nutzung (ab Sa 10.10.)

- [x] #10 Vorschau-Tage (Wochenende, vor Planstart): alle „Starten“-Knöpfe sichtbar, aber `aria-disabled` mit Hinweis bei Hover/Fokus („Wochenende — der Lernblock läuft Mo–Fr …“ / „Dein Plan startet am Mo, 12. Oktober …“); Klick tut nichts. Tests: Backend 279 · Frontend 290 · E2E 16/16.
- [x] #13 Zeitleiste neu (alle 6 Stile): eigene Tokens `--timeline-*` (offen = Tönung + Rand, aktuell = Akzentfarbe, erledigt = gedämpft + ✓, Pause = schraffiert), Beschriftung in den Segmenten, keine Opacity-Tricks; nur der aktuelle Block hat einen gefüllten „Starten“-Knopf; Datum aus dem Server; Fahrplan-Balken in Akzentfarbe; `kaskade.css` jetzt in `@layer components` (Tailwind-Abstände wirkten nicht). Review-Set: `docs/kaskade/screenshots/<stil>-<seite>.png` (6 Seiten × 6 Stile + Zeitleiste), neu erzeugen mit `npm run screenshots:kaskade`. Tests: Backend 279 · Frontend 320 (inkl. Kontrast Zeitleiste) · E2E 16/16 · Alt-E2E 31/31.
- [x] #5 Phase-2B-Plan: Bei Phase 2B zeigt Heute den 2B-Block (`data/plan/phase-2b.json`): 09:00 Karten nur Lücken 15 min · 09:15 Schauen & minen 65 min · 10:20 Pause · 10:30 frei lesen/hören 35 min · 11:05 B1-Prüfungsteil (Aufgaben unverändert). 4 Wochen mit Serien für Erwachsene (Tatort, SOKO, Der Pass, Stromberg, Tatortreiniger, Charité, Bergdoktor, 37 Grad, Terra X, Easy German, Tagesschau). Satz-Check-Zeilen „mit Hilfe“/„zu schwer“ lassen sich als Karten minen (Satz-Check → „Sätze zum Minen“, Link auf Heute); Geräusch-/Musik-Zeilen werden dabei übersprungen. Nebenbei #7: Kinder-/Jugendinhalte aus dem 2A-Plan und den Satz-Check-Texten entfernt, Content-Test verbietet sie. Tests: Backend 287 · Frontend 321 · E2E 16/16.
- [x] #11 Schauen & minen → http://100.64.43.3:5173/schauen: Clip aus der Bibliothek mit der aktuellen Untertitelzeile unter dem Video, Pause nach jeder Zeile (abschaltbar), ←/→ Zeile, R wiederholen, Leertaste Play/Pause, Tempo 0,85×; Wort antippen → Wort-Panel; „Satz minen“ macht die ganze Zeile zur Karte, mit Original-Ton (ffmpeg-Schnipsel in `~/kaskade-data/snippets`, wird gesichert), Karten spielt ihn ab. Position pro Clip wird gespeichert; Heute → „Starten“ beim Schauen-Block öffnet den zuletzt geschauten Clip an der Stelle (sonst einen Bibliothekstext). Geräusch-/Musik-Zeilen werden übersprungen (Tatort: 961 von 1.069 Zeilen sind Sprache). Tests: Backend 293 · Frontend 328 · E2E 17/17.
- [x] #12 Woche 5 (Mo 9. – So 15. Nov.): Heute zeigt die Karte „KI-Schlüssel einrichten“ mit Anleitung (console.anthropic.com → Schlüssel → `~/kaskade-data/.env` → `systemctl --user restart kaskade-api`; pro Nutzung bezahlt, getrennt vom Max-Abo). Abhaken möglich; verschwindet von selbst, sobald `/api/health` `"ai": true` meldet. Fahrplan → „Nächste Schritte“: Woche 5 KI-Schlüssel, Woche 6 erste Probeprüfung. Daten in `weeks-1-4.json` (`week5.todos`). Tests: Backend 296 · Frontend 328 · E2E 18/18.
- [x] #14.1 Leser: Wörter mit ihren Satzzeichen und Kasus-Buchstaben werden nicht mehr getrennt („Nicht bleibt zusammen, „Kaya.ᴺ“ bricht nicht um) — Tokens ohne Leerzeichen dazwischen stehen in einer `nowrap`-Gruppe. Tests: Frontend 330 · E2E 19/19 (prüft 360/600/1280 px).
- [x] #14.2–14.7 Leser ruhiger: neue Wörter als zarte Tönung + dünne Unterstreichung (`--word-new-tint`/`--word-new-underline` in allen Stilen), Kasus-Buchstaben kleiner; Umschalter **Neue Wörter / Kasus / Beides** (wird gemerkt; Standard in Phase 2B: nur neue Wörter). Fokus: Ziffern aus Archivo (kein durchgestrichenes 0 mehr). Leere Stunden-Diagramme → eine Zeile „Noch keine Zeit erfasst …“. Deutscher Dateiwähler („Datei wählen“ / „keine Datei“). Prüfung → Sprechen: „Im Lernblock am Di/Do …“. Zweites Review-Set mit gefülltem Profil (`scripts/seed_demo.py`, nur Wegwerf-Daten) in `docs/kaskade/screenshots/filled/`; dabei behoben: Kopfzeile bricht in Papier nicht mehr um, Wochenbalken in Magazin/Fokus in Akzentfarbe statt Schwarz. Tests: Backend 296 · Frontend 346 · E2E 19/19 · Alt-E2E 31/31.
- [x] #1 Satz-Check zählt nur noch Sprache: Zeilen ganz in `*…*`, `[…]`, `(…)` oder mit ♪ werden beim Ausschnitt übersprungen (Server + App). Alte Läufe werden beim Anzeigen nur über Sprachzeilen neu gezählt; Lauf #1: **80 %** (mit Geräusch-Zeilen 83 %, 4 Zeilen) — weiter Phase 2B. Satz-Check-Verlauf, Heute und Fahrplan zeigen beide Zahlen. Tests: Backend 299 · Frontend 348 · E2E 19/19.
- [x] #3 Jeder hochgeladene/geholte Clip wird im Hintergrund zu H.264/AAC-MP4 mit `+faststart` (Safari/Firefox/Chrome): schon H.264/AAC → nur umpacken (Sekunden), sonst x264 veryfast ≤ 720p (2 CPUs: dauert bei Spielfilmlänge einige Minuten), Audio → AAC. Status in den Clip-Listen („wird umgewandelt …“); schlägt es fehl, bleibt das Original. Die beiden vorhandenen Clips sind schon H.264/AAC mit faststart. Tests: Backend 307 · Frontend 349 · E2E 19/19.
- [x] #2 Satz-Check „Deine Clips“: echte Auswahl (Radio-Kreis + „Auswählen“ / „✓ Ausgewählt“, Typ Video/Audio als Text statt ▶). Nach der Auswahl springt die Seite zu Schritt 2 (Fokus auf „Satz-Check starten“), dort ein kleiner Vorschau-Player, der dem Startpunkt folgt. Nebenbei: „Startpunkt 0:00 – 3:00“ steht wieder in einer Zeile. Tests: Frontend 349 · E2E 19/19.
- [x] #8 Satz-Check → „Aus der Mediathek holen“: ARD-/ZDF-Link einfügen → yt-dlp im Hintergrund (540p H.264 bevorzugt, deutsche Untertitel → SRT), Fortschrittsbalken mit MB und MB/s, danach ist der Clip in der Bibliothek ausgewählt und wird für alle Browser vorbereitet (#3). Echt getestet (in Wegwerf-Ordner): tagesschau 15 min → 145 MB in 23 s, 266 Untertitel. Fehler (Geo-Sperre, keine UT) werden auf Deutsch gemeldet; Untertiteldateien werden nicht aufbewahrt. Tests: Backend 313 · Frontend 350 · E2E 20/20.
- [x] #9 Große Uploads: Ursache war nicht die Größe (400 MB lokal durch den Proxy in 1 s), sondern die Zeit — der Webserver (vite preview/Node) bricht Anfragen nach 5 min ab, und 400 MB vom Mac dauern länger. Jetzt geht das Video in 8-MB-Stücken hoch (jedes Stück mit Wiederholung, nichts doppelt), mit Fortschrittsbalken „Video: 120 von 400 MB hochgeladen“; danach wird der Clip wie bisher angelegt und umgewandelt (#3). Tests: Backend 317 · Frontend 353 · E2E 20/20.
- [x] #4 YouTube: klare Meldung bei der Bot-Sperre statt „Download fehlgeschlagen“; zwei Wege direkt im Satz-Check: (1) `cookies.txt` hochladen (nur auf dem Server, chmod 600, jederzeit entfernbar) → yt-dlp nutzt sie, (2) Mac-Befehl zum Kopieren (`yt-dlp … --sub-langs "de.*" --convert-subs srt …`), danach Video + .srt hochladen. Tests: Backend 320 · Frontend 353 · E2E 21/21.
- [x] #6 „Zu schwer“-Zeilen, die kurz sind und nur Kernwörter enthalten (Namen und Verkürzungen wie *'ner*, *nee* zählen nicht), heißen jetzt **„Hören bei normalem Tempo“** — im Satz-Check-Ergebnis und im Verlauf, mit Link „in Schleife üben →“ zur Stelle in Schauen & minen (neu: Schleife, Taste L). Lauf #1: alle vier „zu schwer“-Zeilen sind Tempo-Zeilen (*Na?*, *seit 'ner Stunde*, *Glaubst du mir nicht …*). Tests: Backend 322 · Frontend 354 · E2E 21/21.
- [x] #16 Genaue Aufgaben für jeden Block, echtes Material zuerst: alle Tage in `phase-2b.json` und `weeks-1-4.json` neu geschrieben (Content-Test verbietet „z. B.“/„oder“/„deiner Wahl“ …), `materials` pro Tag, Katalog `data/plan/stock.json` (nur Links), alles vorab in die Bibliothek geholt (`scripts/stock.py`, Timer `kaskade-stock` täglich 04:30 UTC + Materialcheck), Heute zeigt Titel · Teil · Minuten · Quelle und „Starten“ öffnet genau das (Clip mit Zeitbereich und „Ziel erreicht“, Text im Modus „frei“, Netflix/YouTube in neuem Tab mit Language Reactor), Abschnitt „Material für heute und morgen“, „Kaufen bis …“ für Bücher (7 Tage vorher, E-Book 2), Genre pro Clip in „Deine Clips“, alles KI-Geschriebene markiert. Backup sichert holbare Medien (`stock-*`, `mt-*`) nicht mehr. Tests: Backend 394 · Frontend 382 · E2E 27/27.
- [x] #16 Update 5/6: erstes Buch ist Schirach, *Verbrechen* (ganze Geschichten mit Seiten aus dem Inhaltsverzeichnis, höchstens 40 Seiten pro Tag, Woche 2 Mo–Fr + Woche 3 Di–Mi; danach DLF-Kriminalhörspiel *Paradise City* über das Gesundheitssystem), Känguru nur als späteres Hörbuch ohne Kaufkarte. Käufe und andere Termine stehen nicht mehr im Material-Abschnitt, sondern in **„Bald fällig“** darunter: Fälligkeit zuerst („Fällig Mo 12.10. · morgen“), wofür („ab 19.10. im Plan, Woche 2“), Shop-Links, „✓ gekauft“, sortiert, überfällig markiert, ab 14 Tage vorher. Tests: Backend 396 · Frontend 386 · E2E 27/27.
- [x] #17 HTTPS-Adresse https://cos.tail1b5741.ts.net:8443 in Heute (Feed-Link), Sprechen (Hinweis + Link über http), Material-Check (Mikrofon) und Doku; http bleibt.
- [x] #18 Schauen zeigt beim Auto-Pause wieder die gerade gehörte Zeile: eine Zeile bleibt bis zu ihrem Ende stehen, der Vorlauf (0,15 s) gilt nur in einer echten Lücke, und nach dem Auto-Pause bleibt die Zeile, bis er weiterspielt oder springt — Wort-Panel, „Satz minen“, R/←/→/L wirken auf sie. Auch bei Zeilen ohne Lücke hält das Video jetzt an, und Springen landet nie in der Vorzeile. Live am Mo 12.10. vormittags. Tests: Frontend 390 · E2E 28/28.
- [x] #19 Geminte Karten mit richtigen Wortdaten: Kasus-Badge nur, wenn der Parser sicher ist (alle Kasus-Wörter der Phrase stimmen überein *und* Präposition oder Rolle verlangt genau diesen Fall; bei „und“ zählt die Rolle der ersten Phrase) — sonst keins statt eines falschen (*Herrlichkeit*: kein A mehr). Lemma = Stichwort aus dem Wörterbuch (*versaust* → *versauen*), Nomen treffen keine Adjektiv-Kernkarten mehr (*Reich* ≠ *reich*). Fehlt die Bedeutung oder kennt das Wörterbuch das Lemma nicht, fragt Kaskade beim Minen Claude nach Grundform, Bedeutung, Artikel/Plural und Kasus mit Grund — diese Felder tragen „KI“. Gleicher Satz nochmal: „Satz schon gemint“ + „Wort zur Karte dazunehmen“. In Karten: geminte Karte bearbeiten (Grundform, Anzeige, Bedeutung, Kasus, Notiz) oder löschen — auf der Karte und in „Deine geminten Sätze“. Live seit Mo 12.10. 11:31; Matts 5 Karten mit `scripts/fix_mined.py` nachgeprüft (*Herrlichkeit* ohne Kasus, *versausen* → *versauen*, *überhetzen* mit KI-Bedeutung). Tests: Backend 408 · Frontend 395 · E2E 29/29 · Legacy 31/31.
- [x] #20 „Starten“ beim B1-Prüfungsteil öffnet die Aufgabe. Ursache laut Log: Matts Heute-Tab war von 08:01, der Neubau um 08:18 hatte die alten Lazy-Chunks gelöscht — Starten startete den Timer, dann scheiterte das Laden der Aufgabe-Seite (die Exam-Zuweisung hatte `start.to` schon). Jetzt lädt der Router die Zielseite frisch, wenn ein Chunk fehlt; der Prüfungsblock fällt nie mehr vorzeitig zurück; `deploy/web-deploy.sh` lässt alte Chunks liegen, damit offene Tabs weiter funktionieren. E2E klickt jedes „Starten“ Mo–Fr der Woche 1 (Phase 2B) und prüft die genaue Adresse, ein zweiter Test simuliert den gelöschten Chunk (schlägt ohne Fix fehl). Live seit 11:31 (mit #19). Tests: Backend 409 · Frontend 395 · E2E 31/31 · Legacy 31/31.
- [x] #21 Clip- und Hörspiel-Bereiche rollen ab Matts gespeicherter Position (`server/kaskade/rolling.py`): ein Tag = von seiner Position bis Position + Tagesbudget (≈ 25 min Film im 65-min-Input-Block, ≈ 28 min Audio im Lesen-Block; ab 3 gemessenen Tagen sein eigenes Tempo), der Rest des Clips gleichmäßig auf die nötigen Tage verteilt, Schnitt in einer Pause zwischen zwei Zeilen. Braucht ein Clip länger, rücken die folgenden einen Tag nach (nichts wird übersprungen); ist er früher fertig, rücken sie vor. Der Bereich des Tages wird beim ersten Abruf festgehalten (06:30-Materialcheck oder erster Heute-Besuch) und wandert nicht mit, während er schaut; Vorschauen halten nichts fest; ein schon abgehakter Block behält seinen Plan. Heute zeigt den berechneten Bereich in der Zeile und im Tagestext („Tatort: Schweigen, 7:10–34:06 …“), „Starten“ öffnet genau ihn. Live seit Mo 12.10. 11:41; für Di 13.10.: Tatort 7:10–34:06, Mi 34:06–62:26, Do 62:26–89:21 (Ende), SOKO Fr + Mo. Tests: Backend 418 · Frontend 395 · E2E 32/32 · Legacy 31/31.

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

### M13 Härtung ✅
- **Server weg:** gelbes Banner „Server nicht erreichbar … Deine Daten sind sicher“ mit „Erneut versuchen“, statt kaputter Seiten; API-Fehler (auch HTML-Fehlerseiten des Proxys) werden verständlich angezeigt.
- **Leeres Deck / fehlende Inhalte:** Karten sagt „Kein Kerndeck gefunden“; Bibliothek/Übungen laufen ohne Dateien weiter (Test fand dabei einen echten Absturz: Übungsübersicht ohne Plan-Datei → behoben).
- **Fehlgeschlagene Downloads:** YouTube, Piper, Wörterbuch, spaCy — überall gibt es einen Ersatzweg (hochladen, Browser-Stimme, Leser ohne Glossar/Linse).
- **Backups:** täglich 12:00 UTC (`kaskade-backup.timer`) nach `~/kaskade-backups/` (DB-Schnappschuss + Clips + Aufnahmen, die neuesten 14). Erstes Backup ist schon da.
- **320 px:** alle 15 Seiten in mehreren Stilen geprüft — kein horizontales Scrollen, keine Konsolenfehler.
- **`docs/kaskade/RUNBOOK.md`:** Dienste neu starten, Backup/Restore, Neu-Erzeugen von Audio/Wörterbuch, Abhängigkeiten aktualisieren, Fehlersuche.
- Tests: Backend 278 ✅ · Frontend 287 ✅ · E2E 14 ✅ (Theme-Wechsel jetzt auf 11 Seiten, Server-down-Banner).
