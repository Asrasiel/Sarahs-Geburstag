/*
 * Alle Texte und Aufgaben-Inhalte an einem Ort.
 * Hier kannst du Texte, Antworten und Optionen anpassen, ohne den Rest des Codes anzufassen.
 * Suche nach "TODO" für Stellen, die noch personalisiert werden sollten.
 */

window.MGR_CONTENT = {
  // SHA-256 Hash des Passworts "pickmephilipp" (klein geschrieben).
  // Das ist NUR ein Spaß-Schutz vor zufälligen Besuchern, keine echte Sicherheit
  // (der Quelltext ist öffentlich einsehbar, das Passwort steckt nur nicht im Klartext drin).
  passwordHash: "036d666d3496a0687dce773b869559c47aea2b0270b544914fa6b50093f8bbd6",

  studioName: "Studio Sarah & Philipp",

  welcome: {
    title: "Willkommen im Studio 💃🕺",
    lines: [
      "Herzlich willkommen zu deiner ganz persönlichen Tanzstunde, Sarah.",
      "Heute geht es nicht um perfekte Schrittfolgen, sondern um Bachata, Salsa, ein bisschen Gefühl und ziemlich viele Erinnerungen an uns beide.",
      "Neun Stationen warten auf dich – Quizfragen, Insider-Wissen und ein paar echte kleine Tanzspiele zum Mitmachen. Am Ende wartet keine Geschenk-Enthüllung, sondern ein Countdown. Warum, verrate ich dir dort.",
      "Bereit für deine Tanzstunde?"
    ],
    button: "Los geht's"
  },

  progressLabel: (solved, total) => `${solved} von ${total} Tanzstunden absolviert`,

  announcer: {
    idle: [
      "Bühne frei für die nächste Station.",
      "Nimm dir Zeit, das hier ist kein Wettbewerb.",
      "Ein bisschen Konzentration, ein bisschen Herz."
    ],
    correct: [
      "Perfekt getroffen.",
      "Da stimmt der Rhythmus.",
      "Genau richtig.",
      "Weiter geht's im Takt."
    ],
    wrong: [
      "Noch nicht ganz im Takt.",
      "Fast – aber noch nicht getroffen.",
      "Nochmal versuchen.",
      "Kleiner Fehltritt, kein Problem."
    ]
  },

  // ---------------------------------------------------------------
  // Countdown-Finale: Der Spoiler wird erst am 23.09.2026 sichtbar
  // ---------------------------------------------------------------
  countdown: {
    targetDate: "2026-09-23T00:00:00",
    heading: "Noch nicht ganz...",
    beforeText:
      "Alle Stationen geschafft – stark! Es gibt aber noch etwas, das ich dir zeigen will. Nur eben noch nicht heute. Komm am 23.09. wieder hierher zurück, dann öffnet sich der letzte Vorhang.",
    afterHeading: "Der Vorhang öffnet sich",
    // TODO: Hier den tatsächlichen Urlaubs-Teaser/-Reveal eintragen, sobald feststeht,
    // wie viel schon vorher verraten werden soll (Ziel, Datum, Bild, etc.).
    afterText:
      "Der Tag ist da. Also: wir fahren zusammen weg. Wohin genau, verrate ich dir jetzt persönlich – dieser Text hier ist nur der Rahmen dafür.",
    reopenNote: "Schau nach dem 23.09. einfach nochmal auf dieser Seite vorbei."
  },

  // Foto-Galerie, erscheint nach dem Countdown
  // TODO: Bildunterschriften gerne durch genauere Erinnerungen (Ort, Datum, Anlass) ersetzen.
  gallery: {
    heading: "ein paar Erinnerungen",
    photos: [
      { src: "assets/photos/photo-big3-festival.jpg", caption: "BIG3 Festival – aufgetakelt und gut gelaunt." },
      { src: "assets/photos/photo-concert.jpg", caption: "Ein Abend, viele Lichter." },
      { src: "assets/photos/photo-northern-lights.jpg", caption: "Nordlichter und ein Kuss." },
      { src: "assets/photos/photo-cozy.jpg", caption: "Gemütlich, wie es sein soll." },
      { src: "assets/photos/photo-throwback-party.jpg", caption: "2000s Throwback Night." },
      { src: "assets/photos/photo-dinopark.jpg", caption: "Abenteuer im Dinopark." },
      { src: "assets/photos/photo-festival-arena.jpg", caption: "Festival-Stimmung pur." },
      { src: "assets/photos/photo-photobooth.jpg", caption: "Photobooth-Quatsch, Dschungel-Edition." },
      { src: "assets/photos/photo-arena-selfie.jpg", caption: "Nach der Show, noch ganz benommen." },
      { src: "assets/photos/photo-party-friends.jpg", caption: "Mit Freunden im rosa Licht." }
    ]
  },

  // ---------------------------------------------------------------
  // Die neun Stationen
  // ---------------------------------------------------------------
  puzzles: [
    {
      id: 1,
      type: "quiz",
      title: "Station 1 · Warm-up",
      intro: "Bevor wir loslegen, ein bisschen Theorie. In welchem Land ist die Bachata ursprünglich entstanden?",
      inputType: "choice",
      options: ["Kuba", "Dominikanische Republik", "Kolumbien", "Spanien"],
      answer: "Dominikanische Republik",
      reactionsCorrect: ["Richtig. Nächste Frage."],
      reactionsWrong: ["Nicht ganz. Denk an die Karibik."]
    },
    {
      id: 2,
      type: "personal",
      title: "Station 2 · Insider-Wissen",
      intro: "So, Sarah, kleiner Gedächtnistest: Weißt du eigentlich noch, wo wir uns kennengelernt haben? Ich frag ja nur.",
      inputType: "choice",
      options: ["Tinder", "Jodel", "Im Tanzkurs", "Auf einer Hochzeit"],
      answer: "Jodel",
      reactionsCorrect: ["Na also, geht doch. Manchmal reicht eine anonyme App und der richtige Moment."],
      reactionsWrong: ["Falsch geraten, Sarah. Tipp: eine ziemlich anonyme App."]
    },
    {
      id: 3,
      type: "rhythm-tap",
      title: "Station 3 · Im Takt bleiben",
      intro:
        "Tipp den Salsa-Grundtakt: 1-2-3 schnell, kurze Pause (nicht tippen!), dann 4-5-6 wieder schnell. Also 6-mal tippen, mit einer spürbaren Lücke zwischen dem 3. und 4. Tipp.",
      tapsNeeded: 6,
      slowIndexes: [2],
      maxBaseVariation: 0.3,
      slowMinRatio: 1.35,
      slowMaxRatio: 3.0,
      tapButtonLabel: "Tipp",
      reactionsCorrect: ["Sauber im Salsa-Takt.", "Da stimmt die Pause zwischen 3 und 4."],
      reactionsWrong: ["Noch nicht ganz – 1,2,3 schnell, kurze Pause, dann 4,5,6 wieder schnell. Nochmal."]
    },
    {
      id: 4,
      type: "step-sequence",
      title: "Station 4 · Schritt-Folge merken",
      intro: "Schau dir die Schrittfolge genau an, dann tippe sie in der gleichen Reihenfolge nach.",
      icons: { left: "⬅️", right: "➡️", forward: "⬆️", back: "⬇️" },
      sequence: ["left", "right", "left", "forward", "back"],
      showDurationMs: 700,
      reactionsCorrect: ["Genau diese Reihenfolge. Gut gemerkt."],
      reactionsWrong: ["Nicht ganz die richtige Reihenfolge. Nochmal von vorn."]
    },
    {
      id: 5,
      type: "wordplay",
      title: "Station 5 · Buchstabensalat",
      intro: "Bring die Buchstaben in Ordnung – das Wort taucht in praktisch jedem zweiten Bachata-Song auf.",
      scrambled: "C O R A Z O N",
      inputType: "text",
      answer: "CORAZON",
      reactionsCorrect: ["Richtig. Das Herz lügt nicht."],
      reactionsWrong: ["Noch nicht. Es ist spanisch für 'Herz'."]
    },
    {
      id: 6,
      type: "reaction-zone",
      title: "Station 6 · Triff den Beat",
      intro: "Der Marker läuft hin und her. Klick auf 'Stopp', wenn er genau in der markierten Zone ist.",
      zoneStart: 58,
      zoneEnd: 78,
      cycleMs: 1500,
      reactionsCorrect: ["Genau im Beat getroffen.", "Perfektes Timing."],
      reactionsWrong: ["Knapp daneben. Nochmal versuchen."]
    },
    {
      id: 7,
      type: "personal",
      title: "Station 7 · Insider-Wissen",
      intro: "Nächste Runde, Sarah: Weißt du noch, was mein allererstes Geschenk an dich war? Ich hab's jedenfalls nicht vergessen.",
      inputType: "choice",
      options: ["Blumen", "Ein Cider", "Ein Ring", "Schokolade"],
      answer: "Ein Cider",
      reactionsCorrect: ["Ganz genau. Ein Klassiker eben."],
      reactionsWrong: ["Nein, Sarah. Aber eine schöne Idee wäre es auch gewesen."]
    },
    {
      id: 8,
      type: "personal",
      title: "Station 8 · Insider-Wissen",
      intro: "Ganz ehrlich, Sarah: Was war eigentlich schon besonders, bevor wir überhaupt zusammengekommen sind?",
      inputType: "choice",
      options: ["Gemeinsames Kochen", "Lange Umarmungen", "Tägliche Anrufe", "Tanzstunden"],
      answer: "Lange Umarmungen",
      reactionsCorrect: ["Richtig. Manche Dinge kündigen sich einfach an."],
      reactionsWrong: ["Nein, Sarah. Aber warm hast du trotzdem gedacht."]
    },
    {
      id: 9,
      type: "matching",
      title: "Station 9 · Die Abschlussprüfung",
      intro: "Letzte Übung. Ordne jeden Begriff dem passenden Symbol zu, um die Tanzstunde abzuschließen.",
      pairs: [
        { icon: "💃", label: "Bachata" },
        { icon: "🕺", label: "Salsa" },
        { icon: "🍎", label: "Cider" },
        { icon: "🤗", label: "Lange Umarmungen" },
        { icon: "📱", label: "Jodel" }
      ],
      reactionsCorrect: ["Alle Paare richtig. Die Tanzstunde ist geschafft."],
      reactionsWrong: ["Das passt noch nicht zusammen."]
    }
  ]
};
