/* SNAKES & LADDERS — the learning journey. Roll, answer a question to move;
   ladders leap you forward, snakes slide you back. Reach 64.
   Content: pack.questions[]. */
(function () {
  const GAME = "snakes";
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  const LADDERS = { 3: 20, 8: 26, 28: 47, 36: 55, 50: 62 };
  const SNAKES = { 32: 12, 44: 22, 53: 33, 60: 40, 63: 43 };
  const GOAL = 64;
  let pack, qpool, qi, pos, turns, over, lastDie, msg;

  Engine.loadPack().then(p => {
    pack = p; packName.textContent = p.title;
    if (!p.questions || !p.questions.length) { stage.innerHTML = "<p>No questions in this pack.</p>"; return; }
    start();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function nextQ() { if (!qpool || qi >= qpool.length) { qpool = Engine.shuffle(pack.questions); qi = 0; } return qpool[qi++]; }
  function start() { pos = 0; turns = 0; over = false; lastDie = "-"; msg = "Roll the die to begin your journey."; render(); }

  function num(dr, dc) { const br = 7 - dr; return br % 2 === 0 ? br * 8 + dc + 1 : br * 8 + (8 - dc); }

  function renderScore() {
    scorebar.innerHTML = "<span class='pill'>SQUARE <b>" + pos + "/64</b></span>" +
      "<span class='pill'>TURNS <b>" + turns + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function render() {
    renderScore();
    let cells = "";
    for (let dr = 0; dr < 8; dr++) for (let dc = 0; dc < 8; dc++) {
      const n = num(dr, dc);
      const cls = LADDERS[n] ? "ladder" : SNAKES[n] ? "snake" : "";
      const here = n === pos;
      cells += "<div class='sl-sq " + cls + (here ? " here" : "") + "'><span class='n'>" + n + "</span>" +
        (here ? "<span class='pawn'>🧝</span>" : LADDERS[n] ? "🪜" : SNAKES[n] ? "🐍" : "") + "</div>";
    }
    stage.innerHTML = "<div class='sl-board'>" + cells + "</div>" +
      "<div class='sl-controls'><div class='die'>🎲 " + lastDie + "</div>" +
      "<div class='status-line'>" + msg + "</div>" +
      (over ? "<div class='row'><button id='again' class='btn primary'>↺ NEW JOURNEY</button><a class='btn' href='index.html'>LIBRARY</a></div>"
            : "<button id='roll' class='btn primary'>🎲 ROLL</button>") + "</div>";
    const r = document.getElementById("roll"); if (r) r.addEventListener("click", roll);
    const a = document.getElementById("again"); if (a) a.addEventListener("click", start);
  }

  function roll() {
    if (over) return;
    const die = 1 + Math.floor(Math.random() * 6);
    lastDie = die; turns++; Engine.sfx.click();
    Engine.quizModal(nextQ(), correct => {
      if (!correct) { msg = "✗ Wrong — you hold your position. (rolled " + die + ")"; render(); return; }
      let target = Math.min(pos + die, GOAL);
      if (LADDERS[target]) { msg = "🪜 A ladder! Up you climb."; target = LADDERS[target]; Engine.confetti(20); }
      else if (SNAKES[target]) { msg = "🐍 A snake! Down you slide."; target = SNAKES[target]; }
      else msg = "Advanced " + die + " squares.";
      pos = target;
      if (pos >= GOAL) return win();
      Engine.sfx.good(); render();
    });
  }

  function win() {
    over = true;
    const score = Math.max(10, 400 - turns * 8);
    const isBest = Engine.setBest(GAME, pack.id, score);
    Engine.sfx.win(); Engine.confetti(70);
    msg = "★ You reached the end in " + turns + " turns!" + (isBest ? " ★ NEW BEST " + score + "!" : " (" + score + " pts)");
    render();
  }
})();
