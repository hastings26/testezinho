/* TIC TAC TOE — strategy. You are X vs a simple AI. To claim a square you must
   answer a question correctly; a wrong answer hands the turn to the AI.
   Content: pack.questions[]. */
(function () {
  const GAME = "tictactoe";
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  let pack, qpool, qi, board, over, wins;

  Engine.loadPack().then(p => {
    pack = p; packName.textContent = p.title; wins = 0;
    if (!p.questions || !p.questions.length) { stage.innerHTML = "<p>No questions in this pack.</p>"; return; }
    start();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function nextQ() { if (!qpool || qi >= qpool.length) { qpool = Engine.shuffle(pack.questions); qi = 0; } return qpool[qi++]; }

  function start() { board = Array(9).fill(""); over = false; render("Your move — pick a square."); }

  function renderScore() {
    scorebar.innerHTML = "<span class='pill'>WINS <b>" + wins + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function render(status, winLine) {
    renderScore();
    const cells = board.map((v, i) =>
      "<button class='ttt-cell " + (v ? v.toLowerCase() : "") + (winLine && winLine.includes(i) ? " win" : "") + "' data-i='" + i + "'>" + v + "</button>").join("");
    stage.innerHTML = "<div class='status-line'>" + status + "</div><div class='ttt-board'>" + cells + "</div>" +
      (over ? "<div class='gameover' style='padding-top:18px'><div class='row'>" +
        "<button id='again' class='btn primary'>↺ PLAY AGAIN</button><a class='btn' href='index.html'>LIBRARY</a></div></div>" : "");
    stage.querySelectorAll(".ttt-cell").forEach(b => b.addEventListener("click", () => human(parseInt(b.dataset.i, 10))));
    const a = document.getElementById("again"); if (a) a.addEventListener("click", start);
  }

  function winnerLine(b, p) { return LINES.find(l => l.every(i => b[i] === p)); }

  function human(i) {
    if (over || board[i]) return;
    Engine.quizModal(nextQ(), correct => {
      if (correct) {
        board[i] = "X";
        if (!check()) aiMove();
      } else {
        render("✗ Wrong — the AI takes a turn.");
        setTimeout(aiMove, 700);
      }
    });
  }

  function aiMove() {
    if (over) return;
    const empty = board.map((v, i) => v ? -1 : i).filter(i => i >= 0);
    if (!empty.length) return;
    let move = empty.find(i => { board[i] = "O"; const w = winnerLine(board, "O"); board[i] = ""; return w; });
    if (move == null) move = empty.find(i => { board[i] = "X"; const w = winnerLine(board, "X"); board[i] = ""; return w; });
    if (move == null && !board[4]) move = 4;
    if (move == null) move = empty[Math.floor(Math.random() * empty.length)];
    board[move] = "O";
    check("Your move — pick a square.");
  }

  function check(okStatus) {
    const xw = winnerLine(board, "X"), ow = winnerLine(board, "O");
    if (xw) { over = true; wins++; Engine.setBest(GAME, pack.id, wins); Engine.sfx.win(); Engine.confetti(50); render("★ YOU WIN! ★", xw); return true; }
    if (ow) { over = true; Engine.sfx.lose(); render("The AI wins this round.", ow); return true; }
    if (board.every(Boolean)) { over = true; Engine.sfx.click(); render("Draw — well matched."); return true; }
    if (okStatus) render(okStatus);
    return false;
  }
})();
