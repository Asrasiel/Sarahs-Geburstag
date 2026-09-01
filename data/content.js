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
      "Sieben Stationen warten auf dich – Quizfragen, Rätsel und ein paar kleine Feingefühl-Aufgaben. Am Ende wartet keine Geschenk-Enthüllung, sondern ein Countdown. Warum, verrate ich dir dort.",
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
      "Alle sieben Stationen geschafft – stark! Es gibt aber noch etwas, das ich dir zeigen will. Nur eben noch nicht heute. Komm am 23.09. wieder hierher zurück, dann öffnet sich der letzte Vorhang.",
    afterHeading: "Der Vorhang öffnet sich",
    // TODO: Hier den tatsächlichen Urlaubs-Teaser/-Reveal eintragen, sobald feststeht,
    // wie viel schon vorher verraten werden soll (Ziel, Datum, Bild, etc.).
    afterText:
      "Der Tag ist da. Also: wir fahren zusammen weg. Wohin genau, verrate ich dir jetzt persönlich – dieser Text hier ist nur der Rahmen dafür.",
    reopenNote: "Schau nach dem 23.09. einfach nochmal auf dieser Seite vorbei."
  },

  // ---------------------------------------------------------------
  // Die sieben Stationen
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
      intro: "Persönliche Frage: Wo haben Philipp und Sarah sich eigentlich kennengelernt?",
      inputType: "choice",
      options: ["Tinder", "Jodel", "Im Tanzkurs", "Auf einer Hochzeit"],
      answer: "Jodel",
      reactionsCorrect: ["Genau. Manchmal reicht eine App und der richtige Moment."],
      reactionsWrong: ["Nein. Denk an eine ziemlich anonyme App."]
    },
    {
      id: 3,
      type: "feel",
      title: "Station 3 · Feingefühl",
      intro:
        "Ein typischer Bachata-Song läuft meist irgendwo zwischen 90 und 130 BPM. Stell den Regler so genau wie möglich auf 110 BPM.",
      inputType: "range",
      min: 60,
      max: 160,
      target: 110,
      tolerance: 4,
      reactionsCorrect: ["Guter Instinkt für den Rhythmus.", "Da stimmt das Tempo."],
      reactionsWrong: ["Noch daneben. Konzentrier dich auf den Takt."]
    },
    {
      id: 4,
      type: "wordplay",
      title: "Station 4 · Buchstabensalat",
      intro: "Bring die Buchstaben in Ordnung – das Wort taucht in praktisch jedem zweiten Bachata-Song auf.",
      scrambled: "C O R A Z O N",
      inputType: "text",
      answer: "CORAZON",
      reactionsCorrect: ["Richtig. Das Herz lügt nicht."],
      reactionsWrong: ["Noch nicht. Es ist spanisch für 'Herz'."]
    },
    {
      id: 5,
      type: "personal",
      title: "Station 5 · Insider-Wissen",
      intro: "Was war Philipps allererstes Geschenk an Sarah?",
      inputType: "choice",
      options: ["Blumen", "Ein Cider", "Ein Ring", "Schokolade"],
      answer: "Ein Cider",
      reactionsCorrect: ["Genau richtig. Ein Klassiker."],
      reactionsWrong: ["Nein, aber eine schöne Idee wäre es gewesen."]
    },
    {
      id: 6,
      type: "personal",
      title: "Station 6 · Insider-Wissen",
      intro: "Was war schon etwas Besonderes, bevor die beiden überhaupt zusammengekommen sind?",
      inputType: "choice",
      options: ["Gemeinsames Kochen", "Lange Umarmungen", "Tägliche Anrufe", "Tanzstunden"],
      answer: "Lange Umarmungen",
      reactionsCorrect: ["Richtig. Manche Dinge kündigen sich einfach an."],
      reactionsWrong: ["Nein, aber warm hast du trotzdem gedacht."]
    },
    {
      id: 7,
      type: "matching",
      title: "Station 7 · Die Abschlussprüfung",
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
