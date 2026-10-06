/* BINGO — reinforcement. A 3×3 card of key terms; match each called clue to
   its term until the card is a blackout. Content: pack.terms[]. */
(function () {
  const GAME = "bingo";
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  let pack, terms, card, callOrder, callIdx, mistakes, done;

  Engine.loadPack().then(p => {
    pack = p; packName.textContent = p.title;
    terms = (p.terms || []).filter(t => t.term && t.hint);
    if (terms.length < 9) { stage.innerHTML = "<p>Need at least 9 terms for a Bingo card.</p>"; return; }
    start();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function start() {
    card = Engine.sample(terms, 9).map(t => ({ term: t.term.toUpperCase(), hint: t.hint, marked: false }));
    callOrder = Engine.shuffle(card.map((_, i) => i));
    callIdx = 0; mistakes = 0; done = false;
    render();
  }

  function renderScore() {
    scorebar.innerHTML = "<span class='pill'>MARKED <b>" + card.filter(c => c.marked).length + "/9</b></span>" +
      "<span class='pill'>MISSES <b>" + mistakes + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function winningCells() {
    const s = new Set();
    LINES.forEach(l => { if (l.every(i => card[i].marked)) l.forEach(i => s.add(i)); });
    return s;
  }

  function render() {
    renderScore();
    const wins = winningCells();
    const cells = card.map((c, i) =>
      "<button class='bingo-cell" + (c.marked ? (wins.has(i) ? " win" : " marked") : "") + "' data-i='" + i + "'>" +
      (c.marked ? c.term : "?") + "</button>").join("");
    const call = done ? "" : "<div class='bingo-call'>CALL: <b>" + card[callOrder[callIdx]].hint +
      "</b><br><span style='color:var(--text-dim);font-size:18px'>Click the term it describes</span></div>";
    stage.innerHTML = call + "<div class='bingo-card'>" + cells + "</div><div id='fb'></div>";
    stage.querySelectorAll(".bingo-cell").forEach(b => b.addEventListener("click", () => click(parseInt(b.dataset.i, 10))));
  }

  function click(i) {
    if (done || card[i].marked) return;
    const target = callOrder[callIdx];
    if (i === target) {
      card[i].marked = true; callIdx++; Engine.sfx.good();
      if (card.every(c => c.marked)) { done = true; render(); return finish(); }
      render();
    } else {
      mistakes++; Engine.sfx.bad(); Engine.shake(stage.querySelector(".bingo-card")); renderScore();
    }
  }

  function finish() {
    const score = Math.max(0, 100 - mistakes * 10);
    const isBest = Engine.recordPlay(GAME, pack.id, score, { perfect: score === 100 });
    Engine.sfx.win(); Engine.confetti(60);
    document.getElementById("fb").innerHTML =
      "<div class='gameover'><h2>★ BLACKOUT — BINGO! ★</h2><div class='big'>" + score + "</div>" +
      "<p>" + mistakes + " misses" + (isBest ? " · ★ NEW BEST!" : "") + "</p>" +
      "<div class='row'><button id='again' class='btn primary'>↺ NEW CARD</button>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
    document.getElementById("again").addEventListener("click", start);
  }
})();
