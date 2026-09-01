(function () {
  "use strict";

  const C = window.MGR_CONTENT;
  const TOTAL = C.puzzles.length;

  const LS_SOLVED = "sgb_solved";
  const LS_SCREEN = "sgb_screen";
  const LS_UNLOCKED = "sgb_unlocked";

  // ---------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------
  function normalize(str) {
    return String(str)
      .trim()
      .toUpperCase()
      .replace(/Ä/g, "AE")
      .replace(/Ö/g, "OE")
      .replace(/Ü/g, "UE")
      .replace(/ß/g, "SS")
      .replace(/\s+/g, " ")
      .replace(/ /g, "");
  }

  async function sha256Hex(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getSolved() {
    try {
      return new Set(JSON.parse(localStorage.getItem(LS_SOLVED) || "[]"));
    } catch (e) {
      return new Set();
    }
  }

  function markSolved(id) {
    const s = getSolved();
    s.add(id);
    localStorage.setItem(LS_SOLVED, JSON.stringify([...s]));
    updateProgressUI();
  }

  function updateProgressUI() {
    const solved = getSolved().size;
    const pct = Math.round((solved / TOTAL) * 100);
    document.getElementById("progress-bar-inner").style.width = pct + "%";
    document.getElementById("progress-label").textContent = C.progressLabel(solved, TOTAL);
  }

  function setAnnouncer(text, mood) {
    const box = document.getElementById("announcer");
    document.getElementById("announcer-text").textContent = text;
    box.classList.remove("reaction-correct", "reaction-wrong");
    if (mood === "correct") box.classList.add("reaction-correct");
    if (mood === "wrong") box.classList.add("reaction-wrong");
  }

  function reactionFor(puzzleId, mood) {
    const puzzle = C.puzzles.find((x) => x.id === puzzleId);
    const specific = mood === "correct" ? puzzle && puzzle.reactionsCorrect : puzzle && puzzle.reactionsWrong;
    const pool = specific && specific.length ? specific : C.announcer[mood];
    return randomFrom(pool);
  }

  function navigateTo(screenId) {
    localStorage.setItem(LS_SCREEN, screenId);
    render();
  }

  function currentScreen() {
    return localStorage.getItem(LS_SCREEN) || "welcome";
  }

  // ---------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------
  let countdownTimer = null;

  function render() {
    const screen = currentScreen();
    document.querySelectorAll(".screen").forEach((el) => el.classList.add("hidden"));
    const target = document.getElementById("screen-" + screen);
    if (target) target.classList.remove("hidden");
    updateProgressUI();
    setAnnouncer(randomFrom(C.announcer.idle), "idle");

    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    if (screen === "countdown") {
      renderCountdown();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------------------------------------------------------------
  // Password gate
  // ---------------------------------------------------------------
  function initPasswordGate() {
    const form = document.getElementById("password-form");
    const input = document.getElementById("password-input");
    const error = document.getElementById("password-error");

    if (localStorage.getItem(LS_UNLOCKED) === "1") {
      unlockApp();
      return;
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      try {
        const value = input.value.trim().toLowerCase();
        const hash = await sha256Hex(value);
        if (hash === C.passwordHash) {
          localStorage.setItem(LS_UNLOCKED, "1");
          unlockApp();
        } else {
          error.textContent = "Nicht ganz. Versuch's nochmal.";
          input.value = "";
          input.focus();
        }
      } catch (err) {
        error.textContent = "Da ist technisch was schiefgelaufen. Seite neu laden und nochmal versuchen.";
      }
    });
  }

  function unlockApp() {
    document.getElementById("password-screen").classList.add("hidden");
    document.getElementById("app-shell").classList.remove("hidden");
    render();
  }

  // ---------------------------------------------------------------
  // Static text population
  // ---------------------------------------------------------------
  function populateStaticText() {
    document.getElementById("welcome-title").textContent = C.welcome.title;
    const linesWrap = document.getElementById("welcome-lines");
    linesWrap.innerHTML = "";
    C.welcome.lines.forEach((line) => {
      const p = document.createElement("p");
      p.textContent = line;
      linesWrap.appendChild(p);
    });
    document.getElementById("welcome-button").textContent = C.welcome.button;

    C.puzzles.forEach((p) => {
      const titleEl = document.getElementById("p" + p.id + "-title");
      const introEl = document.getElementById("p" + p.id + "-intro");
      if (titleEl) titleEl.textContent = p.title;
      if (introEl) introEl.textContent = p.intro;
    });

    document.getElementById("countdown-heading").textContent = C.countdown.heading;
    document.getElementById("countdown-before-text").textContent = C.countdown.beforeText;
    document.getElementById("countdown-reopen-note").textContent = C.countdown.reopenNote;
    document.getElementById("countdown-after-heading").textContent = C.countdown.afterHeading;
    document.getElementById("countdown-after-text").textContent = C.countdown.afterText;
  }

  // ---------------------------------------------------------------
  // Welcome
  // ---------------------------------------------------------------
  function initWelcome() {
    document.getElementById("welcome-button").addEventListener("click", function () {
      navigateTo("p1");
    });
  }

  function nextScreenAfter(puzzleId) {
    const idx = C.puzzles.findIndex((p) => p.id === puzzleId);
    if (idx === C.puzzles.length - 1) return "countdown";
    return "p" + C.puzzles[idx + 1].id;
  }

  function showSolvedButton(puzzleId, containerId) {
    const container = document.getElementById(containerId);
    if (document.getElementById("next-btn-" + puzzleId)) return;
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.id = "next-btn-" + puzzleId;
    btn.textContent = "Weiter";
    btn.style.marginTop = "10px";
    btn.addEventListener("click", () => navigateTo(nextScreenAfter(puzzleId)));
    container.appendChild(btn);
  }

  // ---------------------------------------------------------------
  // Multiple-Choice-Stationen (Quiz + Insider-Wissen): 1, 2, 5, 6
  // ---------------------------------------------------------------
  function initChoicePuzzle(id) {
    const p = C.puzzles.find((x) => x.id === id);
    if (!p) return;
    const optionGrid = document.getElementById("p" + id + "-options");
    optionGrid.innerHTML = "";
    const feedback = document.getElementById("p" + id + "-feedback");
    p.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        optionGrid.querySelectorAll(".option-btn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        if (opt === p.answer) {
          btn.classList.add("correct");
          feedback.textContent = "Richtig!";
          feedback.className = "feedback-row correct";
          setAnnouncer(reactionFor(id, "correct"), "correct");
          markSolved(id);
          showSolvedButton(id, "screen-p" + id + "-card");
        } else {
          btn.classList.add("incorrect");
          feedback.textContent = "Noch nicht.";
          feedback.className = "feedback-row wrong";
          setAnnouncer(reactionFor(id, "wrong"), "wrong");
        }
      });
      optionGrid.appendChild(btn);
    });
  }

  // ---------------------------------------------------------------
  // Station 3: Feingefühl-Slider
  // ---------------------------------------------------------------
  function initFeelPuzzle() {
    const p = C.puzzles.find((x) => x.id === 3);
    const slider = document.getElementById("p3-slider");
    const valueEl = document.getElementById("p3-value");
    slider.min = p.min;
    slider.max = p.max;
    slider.value = Math.round((p.min + p.max) / 2);
    valueEl.textContent = slider.value;
    slider.addEventListener("input", () => {
      valueEl.textContent = slider.value;
    });

    const feedback = document.getElementById("p3-feedback");
    document.getElementById("p3-submit").addEventListener("click", () => {
      const value = Number(slider.value);
      if (Math.abs(value - p.target) <= p.tolerance) {
        feedback.textContent = "Richtig!";
        feedback.className = "feedback-row correct";
        setAnnouncer(reactionFor(3, "correct"), "correct");
        markSolved(3);
        showSolvedButton(3, "screen-p3-card");
      } else {
        feedback.textContent = "Noch nicht.";
        feedback.className = "feedback-row wrong";
        setAnnouncer(reactionFor(3, "wrong"), "wrong");
      }
    });
  }

  // ---------------------------------------------------------------
  // Station 4: Wortspiel
  // ---------------------------------------------------------------
  function initWordplayPuzzle() {
    const p = C.puzzles.find((x) => x.id === 4);
    document.getElementById("p4-scrambled").textContent = p.scrambled;
    const input = document.getElementById("p4-input");
    const feedback = document.getElementById("p4-feedback");
    document.getElementById("p4-submit").addEventListener("click", () => {
      if (normalize(input.value) === normalize(p.answer)) {
        feedback.textContent = "Richtig!";
        feedback.className = "feedback-row correct";
        setAnnouncer(reactionFor(4, "correct"), "correct");
        markSolved(4);
        showSolvedButton(4, "screen-p4-card");
      } else {
        feedback.textContent = "Noch nicht.";
        feedback.className = "feedback-row wrong";
        setAnnouncer(reactionFor(4, "wrong"), "wrong");
      }
    });
  }

  // ---------------------------------------------------------------
  // Station 7: Matching-Finale
  // ---------------------------------------------------------------
  function initMatchingPuzzle() {
    const p = C.puzzles.find((x) => x.id === 7);
    const board = document.getElementById("p7-board");
    board.innerHTML = "";
    const feedback = document.getElementById("p7-feedback");

    const iconCards = p.pairs.map((pair, i) => ({ kind: "icon", value: pair.icon, pairIndex: i }));
    const labelCards = p.pairs.map((pair, i) => ({ kind: "label", value: pair.label, pairIndex: i }));
    const allCards = shuffle([...iconCards, ...labelCards]);

    let selected = null;
    let matchedCount = 0;

    allCards.forEach((cardData) => {
      const el = document.createElement("div");
      el.className = "match-card";
      if (cardData.kind === "icon") {
        el.innerHTML = '<span class="icon">' + cardData.value + "</span>";
      } else {
        el.textContent = cardData.value;
      }

      el.addEventListener("click", () => {
        if (el.classList.contains("matched") || el === (selected && selected.el)) return;

        if (!selected) {
          selected = { el, data: cardData };
          el.classList.add("selected");
          return;
        }

        if (selected.data.kind === cardData.kind) {
          selected.el.classList.remove("selected");
          selected = { el, data: cardData };
          el.classList.add("selected");
          return;
        }

        if (selected.data.pairIndex === cardData.pairIndex) {
          selected.el.classList.add("matched");
          el.classList.add("matched");
          selected.el.classList.remove("selected");
          matchedCount++;
          setAnnouncer(reactionFor(7, "correct"), "correct");
          selected = null;
          if (matchedCount === p.pairs.length) {
            feedback.textContent = "Alle Paare gefunden!";
            feedback.className = "feedback-row correct";
            markSolved(7);
            showSolvedButton(7, "screen-p7-card");
          }
        } else {
          setAnnouncer(reactionFor(7, "wrong"), "wrong");
          const wrongEl = el;
          const wrongSelected = selected.el;
          wrongEl.classList.add("selected");
          setTimeout(() => {
            wrongEl.classList.remove("selected");
            wrongSelected.classList.remove("selected");
          }, 500);
          selected = null;
        }
      });

      board.appendChild(el);
    });
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---------------------------------------------------------------
  // Countdown-Finale
  // ---------------------------------------------------------------
  function renderCountdown() {
    const target = new Date(C.countdown.targetDate).getTime();
    const beforeText = document.getElementById("countdown-before-text");
    const reopenNote = document.getElementById("countdown-reopen-note");
    const wrap = document.getElementById("countdown-wrap");
    const after = document.getElementById("countdown-after");

    function tick() {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        wrap.classList.add("hidden");
        beforeText.classList.add("hidden");
        reopenNote.classList.add("hidden");
        after.classList.remove("hidden");
        if (countdownTimer) {
          clearInterval(countdownTimer);
          countdownTimer = null;
        }
        return;
      }
      wrap.classList.remove("hidden");
      beforeText.classList.remove("hidden");
      reopenNote.classList.remove("hidden");
      after.classList.add("hidden");

      const seconds = Math.floor(diff / 1000);
      document.getElementById("cd-days").textContent = Math.floor(seconds / 86400);
      document.getElementById("cd-hours").textContent = Math.floor((seconds % 86400) / 3600);
      document.getElementById("cd-minutes").textContent = Math.floor((seconds % 3600) / 60);
      document.getElementById("cd-seconds").textContent = seconds % 60;
    }

    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  // ---------------------------------------------------------------
  // Reset
  // ---------------------------------------------------------------
  function initReset() {
    document.getElementById("reset-link").addEventListener("click", function (e) {
      e.preventDefault();
      if (confirm("Wirklich von vorne beginnen? Der gesamte Fortschritt wird gelöscht.")) {
        localStorage.removeItem(LS_SOLVED);
        localStorage.removeItem(LS_SCREEN);
        location.reload();
      }
    });
  }

  // ---------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", function () {
    populateStaticText();
    initWelcome();
    initReset();
    initChoicePuzzle(1);
    initChoicePuzzle(2);
    initFeelPuzzle();
    initWordplayPuzzle();
    initChoicePuzzle(5);
    initChoicePuzzle(6);
    initMatchingPuzzle();
    initPasswordGate();
  });
})();
