/* CONNECT FOUR — planning ahead. Answer a question to drop your disc; a wrong
   answer lets the AI drop for free. First to four in a row wins.
   Content: pack.questions[]. */
(function () {
  const GAME = "connect4";
  const COLS = 7, ROWS = 6;
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  let pack, qpool, qi, grid, over, wins;

  Engine.loadPack().then(p => {
    pack = p; packName.textContent = p.title; wins = 0;
    if (!p.questions || !p.questions.length) { stage.innerHTML = "<p>No questions in this pack.</p>"; return; }
    start();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function nextQ() { if (!qpool || qi >= qpool.length) { qpool = Engine.shuffle(pack.questions); qi = 0; } return qpool[qi++]; }
  function idx(r, c) { return r * COLS + c; }
  function start() { grid = Array(COLS * ROWS).fill(0); over = false; render("Pick a column to drop your disc."); }

  function renderScore() {
    scorebar.innerHTML = "<span class='pill'>WINS <b>" + wins + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function render(status) {
    renderScore();
    const drops = Array.from({ length: COLS }, (_, c) =>
      "<button class='c4-drop' data-c='" + c + "' " + (colFull(c) || over ? "disabled" : "") + ">▼</button>").join("");
    let cells = "";
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const v = grid[idx(r, c)];
      cells += "<div class='c4-cell " + (v === 1 ? "p1" : v === 2 ? "p2" : "") + "'></div>";
    }
    stage.innerHTML = "<div class='status-line'>" + status + "</div>" +
      "<div class='c4-cols'>" + drops + "</div><div class='c4-board'>" + cells + "</div>" +
      (over ? "<div class='gameover' style='padding-top:18px'><div class='row'>" +
        "<button id='again' class='btn primary'>↺ PLAY AGAIN</button><a class='btn' href='index.html'>LIBRARY</a></div></div>" : "");
    stage.querySelectorAll(".c4-drop").forEach(b => b.addEventListener("click", () => human(parseInt(b.dataset.c, 10))));
    const a = document.getElementById("again"); if (a) a.addEventListener("click", start);
  }

  function colFull(c) { return grid[idx(0, c)] !== 0; }
  function drop(c, player) {
    for (let r = ROWS - 1; r >= 0; r--) if (grid[idx(r, c)] === 0) { grid[idx(r, c)] = player; return r; }
    return -1;
  }

  function human(c) {
    if (over || colFull(c)) return;
    Engine.quizModal(nextQ(), correct => {
      if (correct) { drop(c, 1); if (!check()) setTimeout(ai, 450); }
      else { render("✗ Wrong — the AI drops for free."); setTimeout(ai, 700); }
    });
  }

  function wins4(player) {
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (grid[idx(r, c)] !== player) continue;
      for (const [dr, dc] of dirs) {
        let k = 1;
        while (k < 4) { const nr = r + dr * k, nc = c + dc * k; if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || grid[idx(nr, nc)] !== player) break; k++; }
        if (k === 4) return true;
      }
    }
    return false;
  }

  function ai() {
    if (over) return;
    const avail = [];
    for (let c = 0; c < COLS; c++) if (!colFull(c)) avail.push(c);
    if (!avail.length) return check();
    let pick = avail.find(c => { const r = drop(c, 2); const w = wins4(2); grid[idx(r, c)] = 0; return w; });
    if (pick == null) pick = avail.find(c => { const r = drop(c, 1); const w = wins4(1); grid[idx(r, c)] = 0; return w; });
    if (pick == null) pick = avail[Math.floor(Math.random() * avail.length)];
    drop(pick, 2);
    check("Pick a column to drop your disc.");
  }

  function check(okStatus) {
    if (wins4(1)) { over = true; wins++; Engine.recordPlay(GAME, pack.id, wins); Engine.sfx.win(); Engine.confetti(50); render("★ FOUR IN A ROW — YOU WIN! ★"); return true; }
    if (wins4(2)) { over = true; Engine.sfx.lose(); render("The AI connects four. Try again."); return true; }
    if (grid.every(Boolean)) { over = true; render("Board full — a draw."); return true; }
    if (okStatus) render(okStatus);
    return false;
  }
})();
