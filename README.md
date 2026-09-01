# Sarahs Tanzstunde

Persönliche interaktive Geburtstags-Webseite für Sarah. Sieben Stationen im Tanzstudio-Stil (Bachata/Salsa-Quiz, Insider-Fragen, Feingefühl-Aufgaben), am Ende ein Countdown zum 23.09.2026. Gehostet kostenlos über GitHub Pages.

## Status

Grundgerüst und alle sieben Stationen stehen. Der eigentliche Reveal-Text nach dem Countdown ist noch ein Platzhalter (siehe TODO in `data/content.js`).

## Ordnerstruktur

```
Sarahs-geburtstag/
├── index.html              # Haupt-Seite
├── css/                     # Styles
├── js/                       # Logik (Passwortschutz, Stationen-Engine, Countdown)
├── data/                     # Inhalte als JS, leicht austauschbar (content.js)
└── assets/
    ├── photos/                # Gemeinsame Fotos von Sarah & Philipp
    ├── decor/                 # Dekorative Bilder (Tanzmotive, Stimmung)
    └── design-refs/           # Referenzbilder fürs Design (nur Inspiration)
```

## Passwort

`pickmephilipp` (nur clientseitiger Spaß-Schutz, keine echte Sicherheit).

## Countdown-Finale

Ab dem 23.09.2026 00:00 Uhr (lokale Zeit des Browsers) wird automatisch der Reveal-Text statt des Countdowns angezeigt – kein weiterer Eingriff nötig, Sarah kann jederzeit wieder vorbeischauen.

## Nächste Schritte

- Echten Reveal-Text in `data/content.js` unter `countdown.afterText` eintragen, sobald klar ist, was genau verraten werden soll
- Fotos/Bilder in die `assets/`-Unterordner legen
- GitHub-Repo anlegen und Seite pushen (siehe Chat-Verlauf mit Philipp für die Schritte)
