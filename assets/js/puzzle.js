/**
 * puzzle.js — All puzzle logic for THE CASE FILE
 * Original HTML5 UP template scripts are untouched.
 *
 * ─────────────────────────────────────────────
 *  CONFIGURATION — edit these values only
 * ─────────────────────────────────────────────
 */

const ACCESS_CODE = "4SZXT";          // CAPTCHA / access code (case-insensitive)
const LEVEL1_ANSWER = "Physics";          // Answer to Level 1 riddle
const LEVEL2_ANSWER = "Vimal";     // Answer to Level 2 riddle

// The secret name to reveal letter-by-letter
// Each entry: { letter, unlockedAfter: 'none' | 'level1' | 'level2' | 'final' }
const SECRET_NAME = [
  { letter: "M", unlockedAfter: "level2" },
  { letter: "A", unlockedAfter: "level2" },
  { letter: "A", unlockedAfter: "final"  },
  { letter: "N", unlockedAfter: "final"  },
  { letter: "Y", unlockedAfter: "level1" },
  { letter: "A", unlockedAfter: "level1" },
];

// ─────────────────────────────────────────────
//  localStorage keys
// ─────────────────────────────────────────────
const LS = {
  LEVEL1:    "puzzle_level1_done",
  LEVEL2:    "puzzle_level2_done",
  CAPTCHA:   "puzzle_captcha_passed",
  FINAL:     "puzzle_final_revealed",
};

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

function normalize(str) {
  return str.trim().toLowerCase();
}

function isLevel1Done()  { return localStorage.getItem(LS.LEVEL1)  === "true"; }
function isLevel2Done()  { return localStorage.getItem(LS.LEVEL2)  === "true"; }
function isCaptchaDone() { return localStorage.getItem(LS.CAPTCHA) === "true"; }
function isFinalDone()   { return localStorage.getItem(LS.FINAL)   === "true"; }

function setMsg(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = "puzzle-msg " + (type || "");
}

// ─────────────────────────────────────────────
//  CAPTCHA (home / begin)
// ─────────────────────────────────────────────

function checkCaptcha() {
  const input = document.getElementById("captchaInput");
  if (!input) return;
  const val = input.value;

  if (normalize(val) === normalize(ACCESS_CODE)) {
    localStorage.setItem(LS.CAPTCHA, "true");
    setMsg("captchaMsg", "Access granted. Proceed to Level 1.", "success");
    updateNavLocks();

    // Navigate to Level 1 after a short delay
    setTimeout(function () {
      window.location.hash = "#level1";
    }, 900);
  } else {
    setMsg("captchaMsg", "Incorrect code. Look more carefully.", "error");
    input.value = "";
    input.focus();
  }
}

// Allow Enter key on captcha input
document.addEventListener("DOMContentLoaded", function () {
  var ci = document.getElementById("captchaInput");
  if (ci) ci.addEventListener("keydown", function (e) {
    if (e.key === "Enter") checkCaptcha();
  });
});

// ─────────────────────────────────────────────
//  Level 1
// ─────────────────────────────────────────────

function checkLevel1() {
  var input = document.getElementById("level1Input");
  if (!input) return;
  var val = input.value;

  if (normalize(val) === normalize(LEVEL1_ANSWER)) {
    localStorage.setItem(LS.LEVEL1, "true");
    setMsg("level1Msg", "nice. level 2 unlocked.", "success");
    showCompletedBadge("level1CompletedBadge");
    updateNameReveal();
    setTimeout(function () {
    window.location.hash = "#level2";
}, 1000);
    updateNavLocks();
  } else {
    setMsg("level1Msg", "Wrong. Think again.", "error");
    input.value = "";
    input.focus();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var li = document.getElementById("level1Input");
  if (li) li.addEventListener("keydown", function (e) {
    if (e.key === "Enter") checkLevel1();
  });
});

// ─────────────────────────────────────────────
//  Level 2
// ─────────────────────────────────────────────

function checkLevel2() {
  var input = document.getElementById("level2Input");
  if (!input) return;
  var val = input.value;

  if (normalize(val) === normalize(LEVEL2_ANSWER)) {
    localStorage.setItem(LS.LEVEL2, "true");
    setMsg("level2Msg", "check the 'who is it?' page.", "success");
    showCompletedBadge("level2CompletedBadge");
    updateNameReveal();
    updateNavLocks();
    applyWhoisitGuard();
  } else {
    setMsg("level2Msg", "Wrong. Look at it differently.", "error");
    input.value = "";
    input.focus();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var l2i = document.getElementById("level2Input");
  if (l2i) l2i.addEventListener("keydown", function (e) {
    if (e.key === "Enter") checkLevel2();
  });
});

// ─────────────────────────────────────────────
//  Name reveal builder
// ─────────────────────────────────────────────

function getCurrentUnlockStage() {
  if (isFinalDone())   return "final";
  if (isLevel2Done())  return "level2";
  if (isLevel1Done())  return "level1";
  return "none";
}

const UNLOCK_ORDER = ["none", "level1", "level2", "final"];

function isLetterVisible(unlockedAfter) {
  var stage = getCurrentUnlockStage();
  var stageIdx  = UNLOCK_ORDER.indexOf(stage);
  var letterIdx = UNLOCK_ORDER.indexOf(unlockedAfter);
  // A letter is visible if its required stage index <= current stage index
  return stageIdx >= letterIdx;
}

function updateNameReveal() {
  var container = document.getElementById("nameReveal");
  if (!container) return;

  container.innerHTML = "";

  SECRET_NAME.forEach(function (item) {
    var slot = document.createElement("span");
    slot.className = "letter-slot";

    if (isLetterVisible(item.unlockedAfter)) {
      slot.textContent = item.letter;
    } else {
      slot.textContent = "_";
      slot.classList.add("hidden-slot");
    }

    container.appendChild(slot);
  });

  // Update hint text
  var hint = document.getElementById("revealHint");
  if (hint) {
    var stage = getCurrentUnlockStage();
    if (stage === "none") {
      hint.textContent = "Complete the levels to unlock letters.";
    } else if (stage === "level1") {
      hint.textContent = "Level 1 complete. Keep going.";
    } else if (stage === "level2") {
      hint.textContent = "Both levels complete. Almost there.";
    } else {
      hint.textContent = "";
    }
  }

  // If final already revealed, show full name
  if (isFinalDone()) {
    showFullName();
  }
}

// ─────────────────────────────────────────────
//  Final reveal ("Want to know?")
// ─────────────────────────────────────────────

function showFinalRevealPrompt() {
  var section = document.getElementById("wantToKnowSection");
  var prompt  = document.getElementById("finalRevealPrompt");
  if (section) section.style.display = "none";
  if (prompt)  prompt.style.display  = "block";
  var inp = document.getElementById("finalRevealInput");
  if (inp) inp.focus();
}

function checkFinalReveal() {
  var input = document.getElementById("finalRevealInput");
  if (!input) return;
  var val = input.value;

  if (normalize(val) === normalize(ACCESS_CODE)) {
    localStorage.setItem(LS.FINAL, "true");
    setMsg("finalRevealMsg", "", "");
    updateNameReveal();
    showFullName();

    var prompt = document.getElementById("finalRevealPrompt");
    if (prompt) prompt.style.display = "none";
  } else {
    setMsg("finalRevealMsg", "That's not right. You already know the code.", "error");
    input.value = "";
    input.focus();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var fri = document.getElementById("finalRevealInput");
  if (fri) fri.addEventListener("keydown", function (e) {
    if (e.key === "Enter") checkFinalReveal();
  });
});

function showFullName() {
  var area = document.getElementById("finalRevealArea");
  var name = document.getElementById("fullNameDisplay");
  var wtkSection = document.getElementById("wantToKnowSection");
  var prompt = document.getElementById("finalRevealPrompt");

  if (area) area.style.display = "block";
  if (name) {
    name.style.display = "block";
    const finalMessage = document.getElementById("finalMessage");

if (finalMessage) {
    finalMessage.style.display = "block";
}
    name.textContent = SECRET_NAME.map(function (s) { return s.letter; }).join(" ");
  }
  if (wtkSection) wtkSection.style.display = "none";
  if (prompt)     prompt.style.display     = "none";
}

// ─────────────────────────────────────────────
//  Completed badge helper
// ─────────────────────────────────────────────

function showCompletedBadge(id) {
  var el = document.getElementById(id);
  if (el) el.style.display = "block";
}

// ─────────────────────────────────────────────
//  Reset ("Forget Everything")
// ─────────────────────────────────────────────

function confirmReset() {
  var confirmed = window.confirm(
    "Forget everything?\n\nThis will erase all your progress — completed levels, unlocked letters, and your final reveal. This cannot be undone."
  );
  if (confirmed) {
    resetProgress();
  }
}

function resetProgress() {
  localStorage.removeItem(LS.LEVEL1);
  localStorage.removeItem(LS.LEVEL2);
  localStorage.removeItem(LS.CAPTCHA);
  localStorage.removeItem(LS.FINAL);
  window.location.reload();
}

// ─────────────────────────────────────────────
//  On page load — restore all state
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
//  Nav lock system
// ─────────────────────────────────────────────

function updateNavLocks() {
  var navLevel1   = document.getElementById("navLevel1");
  var navLevel2   = document.getElementById("navLevel2");
  var navWhoisit  = document.getElementById("navWhoisit");

  if (!navLevel1) return;

  if (isCaptchaDone()) {
    navLevel1.classList.remove("nav-locked");
    navLevel1.removeAttribute("aria-disabled");
  } else {
    navLevel1.classList.add("nav-locked");
    navLevel1.setAttribute("aria-disabled", "true");
  }

  if (isLevel1Done()) {
    navLevel2.classList.remove("nav-locked");
    navLevel2.removeAttribute("aria-disabled");
  } else {
    navLevel2.classList.add("nav-locked");
    navLevel2.setAttribute("aria-disabled", "true");
  }

  if (isLevel2Done()) {
    navWhoisit.classList.remove("nav-locked");
    navWhoisit.removeAttribute("aria-disabled");
  } else {
    navWhoisit.classList.add("nav-locked");
    navWhoisit.setAttribute("aria-disabled", "true");
  }
}

// ─────────────────────────────────────────────
//  Who Is It? lock guard
// ─────────────────────────────────────────────

function applyWhoisitGuard() {
  var revealContent = document.getElementById("whoisitRevealContent");
  var lockedMsg     = document.getElementById("whoisitLockedMsg");
  if (!revealContent || !lockedMsg) return;

  if (isLevel2Done()) {
    revealContent.style.display = "block";
    lockedMsg.style.display     = "none";
  } else {
    revealContent.style.display = "none";
    lockedMsg.style.display     = "block";
  }
}

// ─────────────────────────────────────────────
//  Progression guard — redirect hash-skippers
// ─────────────────────────────────────────────

function enforceProgression() {
  var hash = window.location.hash;

  if (hash === "#level1" && !isCaptchaDone()) {
    window.location.hash = "#begin";
    return;
  }
  if (hash === "#level2" && !isLevel1Done()) {
    window.location.hash = isCaptchaDone() ? "#level1" : "#begin";
    return;
  }
  if (hash === "#whoisit" && !isLevel2Done()) {
    if (isLevel1Done())      window.location.hash = "#level2";
    else if (isCaptchaDone()) window.location.hash = "#level1";
    else                      window.location.hash = "#begin";
    return;
  }
}

window.addEventListener("hashchange", enforceProgression);

// ─────────────────────────────────────────────
//  On page load — restore all state
// ─────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", function () {

  // Restore completed badges
  if (isLevel1Done()) showCompletedBadge("level1CompletedBadge");
  if (isLevel2Done()) showCompletedBadge("level2CompletedBadge");

  // Build name reveal slots
  updateNameReveal();

  // Apply nav locks
  updateNavLocks();

  // Apply who is it guard
  applyWhoisitGuard();

  // Enforce progression on load (catches manual URL entry)
  enforceProgression();

  // If final already done, show full name immediately
  if (isFinalDone()) {
    var wtkSection = document.getElementById("wantToKnowSection");
    var prompt     = document.getElementById("finalRevealPrompt");
    if (wtkSection) wtkSection.style.display = "none";
    if (prompt)     prompt.style.display     = "none";
    showFullName();
  }

  // Restore completed level messages
  if (isLevel1Done()) {
    setMsg("level1Msg", "Already solved. Well done.", "success");
  }
  if (isLevel2Done()) {
    setMsg("level2Msg", "Already solved. Well done.", "success");
  }

});
