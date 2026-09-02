(function () {
  "use strict";

  const C = window.MGR_CONTENT;
  const TOTAL = C.puzzles.length;

  const LS_SOLVED = "sgb_solved";
  const LS_SCREEN = "sgb_screen";
  const LS_UNLOCKED = "sgb_unlocked";

  // Spiele mit laufenden Timern (Flash-Tap, Balance) starten erst, wenn ihre
  // Station wirklich angezeigt wird - nicht schon beim Laden der Seite im Hintergrund.
  const screenStarters = {};

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

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    if (screenStarters[screen]) {
      screenStarters[screen]();
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
    document.getElementById("countdown-peek-btn").textContent = C.countdown.peekButtonLabel;

    document.getElementById("gallery-heading").textContent = C.gallery.heading;
    const galleryWrap = document.getElementById("photo-gallery");
    galleryWrap.innerHTML = "";
    C.gallery.photos.forEach((photo) => {
      const fig = document.createElement("figure");
      const img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.caption;
      const cap = document.createElement("figcaption");
      cap.textContent = photo.caption;
      fig.appendChild(img);
      fig.appendChild(cap);
      galleryWrap.appendChild(fig);
    });
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
  // Multiple-Choice-Stationen (Quiz + Insider-Wissen): 1, 2, 7, 8
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
  // Station 3: Im-Takt-tippen (Rhythmusgefühl, keine Zahl wird verraten)
  // ---------------------------------------------------------------
  function initRhythmTap() {
    const p = C.puzzles.find((x) => x.id === 3);
    const btn = document.getElementById("p3-tap-btn");
    const counter = document.getElementById("p3-counter");
    const feedback = document.getElementById("p3-feedback");
    btn.textContent = p.tapButtonLabel;

    let taps = [];

    function reset() {
      taps = [];
      counter.textContent = "0 / " + p.tapsNeeded;
    }
    reset();

    btn.addEventListener("click", () => {
      taps.push(performance.now());
      counter.textContent = taps.length + " / " + p.tapsNeeded;
      if (taps.length >= p.tapsNeeded) {
        const intervals = [];
        for (let i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1]);

        const baseIntervals = intervals.filter((_, i) => !p.slowIndexes.includes(i));
        const slowIntervals = intervals.filter((_, i) => p.slowIndexes.includes(i));

        const baseMean = baseIntervals.reduce((a, b) => a + b, 0) / baseIntervals.length;
        const baseVariance = baseIntervals.reduce((a, b) => a + Math.pow(b - baseMean, 2), 0) / baseIntervals.length;
        const baseCv = Math.sqrt(baseVariance) / baseMean;

        const slowRatiosOk = slowIntervals.every((v) => {
          const ratio = v / baseMean;
          return ratio >= p.slowMinRatio && ratio <= p.slowMaxRatio;
        });

        if (baseCv <= p.maxBaseVariation && slowRatiosOk) {
          feedback.textContent = "Richtig!";
          feedback.className = "feedback-row correct";
          setAnnouncer(reactionFor(3, "correct"), "correct");
          markSolved(3);
          showSolvedButton(3, "screen-p3-card");
        } else {
          feedback.textContent = "Noch nicht.";
          feedback.className = "feedback-row wrong";
          setAnnouncer(reactionFor(3, "wrong"), "wrong");
          reset();
        }
      }
    });
  }

  // ---------------------------------------------------------------
  // Station 4: Schritt-Folge merken (Simon-Says)
  // ---------------------------------------------------------------
  function initStepSequence() {
    const p = C.puzzles.find((x) => x.id === 4);
    const display = document.getElementById("p4-sequence-display");
    const userInputDisplay = document.getElementById("p4-user-input");
    const buttonsWrap = document.getElementById("p4-buttons");
    const feedback = document.getElementById("p4-feedback");
    const showBtn = document.getElementById("p4-show-btn");
    const clearBtn = document.getElementById("p4-clear-btn");
    const keys = Object.keys(p.icons);

    let userProgress = 0;
    let showing = false;
    let userSlots = [];

    function buildUserSlots() {
      userInputDisplay.innerHTML = "";
      userSlots = p.sequence.map(() => {
        const span = document.createElement("span");
        span.className = "seq-icon";
        span.textContent = "•";
        userInputDisplay.appendChild(span);
        return span;
      });
    }
    buildUserSlots();

    function clearUserInput() {
      userProgress = 0;
      userSlots.forEach((slot) => {
        slot.textContent = "•";
        slot.classList.remove("lit");
      });
      feedback.textContent = "";
    }

    buttonsWrap.innerHTML = "";
    keys.forEach((key) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.textContent = p.icons[key];
      btn.addEventListener("click", () => {
        if (showing) return;
        if (p.sequence[userProgress] === key) {
          userSlots[userProgress].textContent = p.icons[key];
          userSlots[userProgress].classList.add("lit");
          userProgress++;
          if (userProgress === p.sequence.length) {
            feedback.textContent = "Richtig!";
            feedback.className = "feedback-row correct";
            setAnnouncer(reactionFor(4, "correct"), "correct");
            markSolved(4);
            showSolvedButton(4, "screen-p4-card");
          }
        } else {
          feedback.textContent = "Noch nicht.";
          feedback.className = "feedback-row wrong";
          setAnnouncer(reactionFor(4, "wrong"), "wrong");
          clearUserInput();
        }
      });
      buttonsWrap.appendChild(btn);
    });

    clearBtn.addEventListener("click", clearUserInput);

    function playSequence() {
      showing = true;
      clearUserInput();
      display.innerHTML = "";
      const slots = p.sequence.map(() => {
        const span = document.createElement("span");
        span.className = "seq-icon";
        span.textContent = "•";
        display.appendChild(span);
        return span;
      });

      let i = 0;
      function showNext() {
        if (i > 0) {
          slots[i - 1].textContent = "•";
          slots[i - 1].classList.remove("lit");
        }
        if (i < slots.length) {
          slots[i].textContent = p.icons[p.sequence[i]];
          slots[i].classList.add("lit");
          i++;
          setTimeout(showNext, p.showDurationMs);
        } else {
          showing = false;
        }
      }
      showNext();
    }

    showBtn.addEventListener("click", playSequence);
    playSequence();
  }

  // ---------------------------------------------------------------
  // Station 5: Wortspiel
  // ---------------------------------------------------------------
  function initWordplayPuzzle() {
    const p = C.puzzles.find((x) => x.id === 5);
    document.getElementById("p5-scrambled").textContent = p.scrambled;
    const input = document.getElementById("p5-input");
    const feedback = document.getElementById("p5-feedback");
    document.getElementById("p5-submit").addEventListener("click", () => {
      if (normalize(input.value) === normalize(p.answer)) {
        feedback.textContent = "Richtig!";
        feedback.className = "feedback-row correct";
        setAnnouncer(reactionFor(5, "correct"), "correct");
        markSolved(5);
        showSolvedButton(5, "screen-p5-card");
      } else {
        feedback.textContent = "Noch nicht.";
        feedback.className = "feedback-row wrong";
        setAnnouncer(reactionFor(5, "wrong"), "wrong");
      }
    });
  }

  // ---------------------------------------------------------------
  // Station 6: Triff den Beat (Reaktionsspiel)
  // ---------------------------------------------------------------
  function initReactionZone() {
    const p = C.puzzles.find((x) => x.id === 6);
    const zoneEl = document.getElementById("p6-zone");
    const markerEl = document.getElementById("p6-marker");
    const feedback = document.getElementById("p6-feedback");
    const stopBtn = document.getElementById("p6-stop-btn");

    zoneEl.style.left = p.zoneStart + "%";
    zoneEl.style.width = p.zoneEnd - p.zoneStart + "%";

    let startTime = null;
    let running = true;
    let currentPct = 0;

    function frame(ts) {
      if (!startTime) startTime = ts;
      const elapsed = (ts - startTime) % p.cycleMs;
      const half = p.cycleMs / 2;
      currentPct = elapsed < half ? (elapsed / half) * 100 : 100 - ((elapsed - half) / half) * 100;
      markerEl.style.left = currentPct + "%";
      if (running) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    stopBtn.addEventListener("click", () => {
      if (!running) return;
      if (currentPct >= p.zoneStart && currentPct <= p.zoneEnd) {
        running = false;
        feedback.textContent = "Richtig!";
        feedback.className = "feedback-row correct";
        setAnnouncer(reactionFor(6, "correct"), "correct");
        markSolved(6);
        showSolvedButton(6, "screen-p6-card");
        markerEl.style.background = "var(--green)";
      } else {
        feedback.textContent = "Noch nicht.";
        feedback.className = "feedback-row wrong";
        setAnnouncer(reactionFor(6, "wrong"), "wrong");
      }
    });
  }

  // ---------------------------------------------------------------
  // Station 9: Matching-Finale
  // ---------------------------------------------------------------
  function initMatchingPuzzle(id) {
    const p = C.puzzles.find((x) => x.id === id);
    if (!p) return;
    const board = document.getElementById("p" + id + "-board");
    board.innerHTML = "";
    const feedback = document.getElementById("p" + id + "-feedback");

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
          setAnnouncer(reactionFor(id, "correct"), "correct");
          selected = null;
          if (matchedCount === p.pairs.length) {
            feedback.textContent = "Alle Paare gefunden!";
            feedback.className = "feedback-row correct";
            markSolved(id);
            showSolvedButton(id, "screen-p" + id + "-card");
          }
        } else {
          setAnnouncer(reactionFor(id, "wrong"), "wrong");
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
  // Chaos- und Jubel-Effekte (Tanzunfall / Erfolg)
  // ---------------------------------------------------------------
  function triggerChaos(el) {
    el.classList.add("chaos");
    setTimeout(() => el.classList.remove("chaos"), 500);
  }

  function triggerFlashBurst(emojis) {
    if (prefersReducedMotion()) return;
    const layer = document.createElement("div");
    layer.className = "flash-burst";
    document.body.appendChild(layer);
    const count = 40;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.className = "flash-burst-emoji";
      piece.textContent = randomFrom(emojis);
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.setProperty("--rot", Math.round(Math.random() * 500 - 250) + "deg");
      const duration = 1.6 + Math.random() * 1.4;
      piece.style.animationDuration = duration + "s";
      piece.style.animationDelay = Math.random() * 0.3 + "s";
      layer.appendChild(piece);
    }
    setTimeout(() => layer.remove(), 3200);
  }

  // ---------------------------------------------------------------
  // Flash-Tap-Spiele (Stationen 10-12): Symbole antippen, bevor sie verschwinden
  // ---------------------------------------------------------------
  function initFlashTap(id) {
    const p = C.puzzles.find((x) => x.id === id);
    if (!p) return;
    const container = document.getElementById("p" + id + "-floor");
    const progressEl = document.getElementById("p" + id + "-progress");
    const feedback = document.getElementById("p" + id + "-feedback");
    const cardId = "screen-p" + id + "-card";
    const isSlotted = p.mode === "slots" || p.mode === "goodbad";

    let spawned = 0;
    let hits = 0;
    let score = 0;
    let active = false;
    let spawnTimer = null;
    let retryTimeout = null;
    let slots = [];

    function updateProgress() {
      progressEl.textContent = p.mode === "goodbad" ? "Punkte: " + score : hits + " / " + p.rounds;
    }

    function setup() {
      container.innerHTML = "";
      slots = [];
      if (isSlotted) {
        for (let i = 0; i < (p.slotCount || 6); i++) {
          const slot = document.createElement("div");
          slot.className = "flash-slot";
          container.appendChild(slot);
          slots.push(slot);
        }
      }
    }

    function reset() {
      spawned = 0;
      hits = 0;
      score = 0;
      feedback.textContent = "";
      setup();
      updateProgress();
    }

    function spawnOne() {
      if (!active || spawned >= p.rounds) return;
      let isGood = true;
      let symbol;
      if (p.mode === "goodbad") {
        isGood = Math.random() > 0.4;
        symbol = isGood ? p.goodSymbol : p.badSymbol;
      } else {
        symbol = randomFrom(p.symbols);
      }

      let target;
      let removeFn;

      if (p.mode === "floating") {
        target = document.createElement("button");
        target.className = "flash-target";
        target.textContent = symbol;
        const maxX = Math.max(0, container.clientWidth - 44);
        const maxY = Math.max(0, container.clientHeight - 44);
        target.style.left = Math.random() * maxX + "px";
        target.style.top = Math.random() * maxY + "px";
        container.appendChild(target);
        removeFn = () => target.remove();
      } else {
        const freeSlots = slots.filter((s) => !s.dataset.occupied);
        if (freeSlots.length === 0) return;
        const slot = randomFrom(freeSlots);
        slot.dataset.occupied = "1";
        target = document.createElement("button");
        target.className = "flash-target";
        target.style.position = "static";
        target.textContent = symbol;
        slot.appendChild(target);
        removeFn = () => {
          target.remove();
          delete slot.dataset.occupied;
        };
      }

      spawned++;
      let handled = false;
      const timeoutId = setTimeout(() => {
        if (handled) return;
        handled = true;
        removeFn();
        checkEnd();
      }, p.showDurationMs);

      target.addEventListener("click", () => {
        if (handled) return;
        handled = true;
        clearTimeout(timeoutId);
        removeFn();
        if (p.mode === "goodbad") {
          score += isGood ? 1 : -1;
        } else {
          hits++;
        }
        updateProgress();
        checkEnd();
      });
    }

    function checkEnd() {
      updateProgress();
      if (spawned >= p.rounds) {
        active = false;
        clearInterval(spawnTimer);
        evaluate();
      }
    }

    function evaluate() {
      const passed = p.mode === "goodbad" ? score >= p.neededScore : hits >= p.neededHits;
      if (passed) {
        feedback.textContent = "Geschafft!";
        feedback.className = "feedback-row correct";
        setAnnouncer(reactionFor(id, "correct"), "correct");
        triggerFlashBurst(["🎉", "✨", "💃", "🕺", "🪩"]);
        markSolved(id);
        showSolvedButton(id, cardId);
      } else {
        feedback.textContent = "Tanzunfall! Nochmal von vorn.";
        feedback.className = "feedback-row wrong";
        setAnnouncer(reactionFor(id, "wrong"), "wrong");
        triggerChaos(container);
        active = false;
        clearInterval(spawnTimer);
        retryTimeout = setTimeout(startSpawning, 900);
      }
    }

    function startSpawning() {
      clearInterval(spawnTimer);
      clearTimeout(retryTimeout);
      reset();
      active = true;
      spawnTimer = setInterval(spawnOne, p.spawnIntervalMs);
    }

    screenStarters["p" + id] = startSpawning;
  }

  // ---------------------------------------------------------------
  // Balance-Spiel (Station 14): per Klick oder Leertaste ausgleichen
  // ---------------------------------------------------------------
  function initBalanceGame(id) {
    const p = C.puzzles.find((x) => x.id === id);
    if (!p) return;
    const marker = document.getElementById("p" + id + "-marker");
    const zoneLeft = document.getElementById("p" + id + "-zone-left");
    const zoneRight = document.getElementById("p" + id + "-zone-right");
    const feedback = document.getElementById("p" + id + "-feedback");
    const correctBtn = document.getElementById("p" + id + "-correct-btn");
    correctBtn.textContent = p.correctionButtonLabel;

    zoneLeft.style.width = p.dangerZone + "%";
    zoneRight.style.width = p.dangerZone + "%";

    let position = 50;
    let direction = Math.random() > 0.5 ? 1 : -1;
    let tickTimer = null;
    let startTime = null;
    let running = false;

    function inDanger() {
      return position <= p.dangerZone || position >= 100 - p.dangerZone;
    }

    function renderMarker() {
      marker.style.left = position + "%";
    }

    function correct() {
      if (!running || !inDanger()) return;
      position += position < 50 ? p.correctionAmount : -p.correctionAmount;
      position = Math.max(4, Math.min(96, position));
      direction = position < 50 ? 1 : -1;
      renderMarker();
    }

    function fall() {
      running = false;
      clearInterval(tickTimer);
      marker.classList.add("falling");
      feedback.textContent = "Umgekippt!";
      feedback.className = "feedback-row wrong";
      setAnnouncer(reactionFor(id, "wrong"), "wrong");
      setTimeout(() => {
        marker.classList.remove("falling");
        startGame();
      }, 1200);
    }

    function succeed() {
      running = false;
      clearInterval(tickTimer);
      feedback.textContent = "Geschafft!";
      feedback.className = "feedback-row correct";
      setAnnouncer(reactionFor(id, "correct"), "correct");
      triggerFlashBurst(["🎉", "✨", "💃", "🕺"]);
      markSolved(id);
      showSolvedButton(id, "screen-p" + id + "-card");
    }

    function tick() {
      if (!running) return;
      position += direction * p.driftStep;
      if (Math.random() < p.flipChance) direction *= -1;
      if (position <= 0 || position >= 100) {
        position = Math.max(0, Math.min(100, position));
        renderMarker();
        fall();
        return;
      }
      renderMarker();
      if (Date.now() - startTime >= p.durationMs) {
        succeed();
        return;
      }
    }

    function startGame() {
      position = 50;
      direction = Math.random() > 0.5 ? 1 : -1;
      running = true;
      startTime = Date.now();
      feedback.textContent = "";
      renderMarker();
      clearInterval(tickTimer);
      tickTimer = setInterval(tick, p.tickMs);
    }

    correctBtn.addEventListener("click", correct);
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" && currentScreen() === "p" + id) {
        e.preventDefault();
        correct();
      }
    });

    screenStarters["p" + id] = function () {
      clearInterval(tickTimer);
      startGame();
    };
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
    const peekWrap = document.getElementById("countdown-peek-wrap");

    function tick() {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        wrap.classList.add("hidden");
        beforeText.classList.add("hidden");
        reopenNote.classList.add("hidden");
        peekWrap.classList.add("hidden");
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
      peekWrap.classList.remove("hidden");
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
  function initCountdownPeek() {
    document.getElementById("countdown-peek-btn").addEventListener("click", () => {
      document.getElementById("countdown-peek-feedback").textContent = C.countdown.peekMessage;
    });
  }

  // ---------------------------------------------------------------
  // Hintergrundmusik (YouTube, unsichtbar, startet stumm)
  // Der eigentliche Player wird in index.html initialisiert (muss vor dem
  // YouTube-API-Skript-Tag stehen), hier nur Button-Anzeige und -Klick.
  // ---------------------------------------------------------------
  function updateMusicToggleLabel() {
    const btn = document.getElementById("music-toggle");
    const p = window.__ytPlayer;
    if (!btn || !p || typeof p.isMuted !== "function") return;
    btn.textContent = p.isMuted() ? "🔇 Musik an" : "🔊 Musik aus";
  }
  window.__updateMusicToggleLabel = updateMusicToggleLabel;

  function initMusicToggle() {
    document.getElementById("music-toggle").addEventListener("click", () => {
      const p = window.__ytPlayer;
      if (!p) return;
      window.__ytMusicUnlocked = true;
      if (p.isMuted()) {
        p.unMute();
        p.setVolume(40);
      } else {
        p.mute();
      }
      // isMuted() spiegelt den neuen Zustand erst nach kurzer Verzögerung wider
      setTimeout(updateMusicToggleLabel, 400);
    });
  }

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
    initCountdownPeek();
    initMusicToggle();
    initChoicePuzzle(1);
    initChoicePuzzle(2);
    initRhythmTap();
    initStepSequence();
    initWordplayPuzzle();
    initReactionZone();
    initChoicePuzzle(7);
    initChoicePuzzle(8);
    initMatchingPuzzle(9);
    initFlashTap(10);
    initFlashTap(11);
    initFlashTap(12);
    initMatchingPuzzle(13);
    initBalanceGame(14);
    initPasswordGate();
  });
})();
