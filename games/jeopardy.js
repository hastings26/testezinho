/* JEOPARDY — knowledge review board. Categories (rows) × point values.
   Built from pack.questions[] in chunks of 5. */
(function () {
  const GAME = "jeopardy";
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  const VALUES = [100, 200, 300, 400, 500];
  let pack, cats, score, remaining;

  Engine.loadPack().then(p => {
    pack = p; packName.textContent = p.title;
    if (!p.questions || p.questions.length < 5) { stage.innerHTML = "<p>Need at least 5 questions for a Jeopardy board.</p>"; return; }
    start();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function start() {
    const qs = Engine.shuffle(pack.questions);
    cats = [];
    for (let c = 0; c * 5 < qs.length && c < 4; c++) {
      const slice = qs.slice(c * 5, c * 5 + 5);
      if (slice.length < 5) break;
      cats.push({ title: "ROUND " + (c + 1), tiles: slice.map((q, i) => ({ q, value: VALUES[i], used: false })) });
    }
    if (!cats.length) cats = [{ title: "ROUND 1", tiles: qs.slice(0, 5).map((q, i) => ({ q, value: VALUES[i], used: false })) }];
    score = 0; remaining = cats.reduce((n, c) => n + c.tiles.length, 0);
    render();
  }

  function renderScore() {
    scorebar.innerHTML = "<span class='pill'>SCORE <b>" + score + "</b></span>" +
      "<span class='pill'>TILES <b>" + remaining + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function render() {
    renderScore();
    const rows = cats.map((c, ci) =>
      "<div class='jp-row' style='grid-template-columns:1.4fr repeat(5,1fr)'>" +
      "<div class='jp-cat'>" + c.title + "</div>" +
      c.tiles.map((t, ti) => "<button class='jp-tile' data-c='" + ci + "' data-t='" + ti + "' " +
        (t.used ? "disabled" : "") + ">" + (t.used ? "✓" : t.value) + "</button>").join("") +
      "</div>").join("");
    stage.innerHTML = "<div class='jp-board'>" + rows + "</div>";
    stage.querySelectorAll(".jp-tile").forEach(b => b.addEventListener("click", () =>
      pick(parseInt(b.dataset.c, 10), parseInt(b.dataset.t, 10))));
  }

  function pick(ci, ti) {
    const tile = cats[ci].tiles[ti];
    if (tile.used) return;
    tile.used = true; remaining--;
    Engine.quizModal(tile.q, correct => {
      if (correct) { score += tile.value; Engine.confetti(20); }
      else { score = Math.max(0, score - tile.value); }
      if (remaining <= 0) finish(); else render();
    });
  }

  function finish() {
    const isBest = Engine.setBest(GAME, pack.id, score);
    Engine.sfx.win(); Engine.confetti(60);
    stage.innerHTML = "<div class='gameover'><h2>BOARD CLEARED</h2><div class='big'>" + score + "</div>" +
      "<p>points" + (isBest ? " · ★ NEW BEST!" : "") + "</p>" +
      "<div class='row'><button id='again' class='btn primary'>↺ NEW BOARD</button>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
    document.getElementById("again").addEventListener("click", start);
  }
})();
