/* WORD SEARCH — discovery. Find the pack's key terms hidden in the grid.
   Click the first letter, then the last letter of a word. Content: pack.terms[]. */
(function () {
  const GAME = "wordsearch";
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  const DIRS = [[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]];
  let pack, N, grid, placements, found, sel;

  Engine.loadPack().then(p => {
    pack = p; packName.textContent = p.title;
    const words = (p.terms || []).map(t => (t.term || "").toUpperCase().replace(/[^A-Z]/g, ""))
      .filter(w => w.length >= 3 && w.length <= 9);
    if (words.length < 3) { stage.innerHTML = "<p>Not enough words for a search.</p>"; return; }
    start(words);
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function start(allWords) {
    const words = Engine.sample(allWords, Math.min(7, allWords.length));
    N = Math.max(11, ...words.map(w => w.length + 1));
    let ok = false, tries = 0;
    while (!ok && tries++ < 40) ok = build(words);
    found = new Set(); sel = null;
    render();
  }

  function build(words) {
    grid = Array.from({ length: N }, () => Array(N).fill(""));
    placements = {};
    for (const w of words) {
      let placed = false;
      for (let a = 0; a < 80 && !placed; a++) {
        const [dr, dc] = DIRS[Math.floor(Math.random() * DIRS.length)];
        const r0 = Math.floor(Math.random() * N), c0 = Math.floor(Math.random() * N);
        const cells = [];
        let fits = true;
        for (let i = 0; i < w.length; i++) {
          const r = r0 + dr * i, c = c0 + dc * i;
          if (r < 0 || r >= N || c < 0 || c >= N) { fits = false; break; }
          if (grid[r][c] && grid[r][c] !== w[i]) { fits = false; break; }
          cells.push([r, c]);
        }
        if (!fits) continue;
        cells.forEach(([r, c], i) => grid[r][c] = w[i]);
        placements[w] = cells.map(([r, c]) => r * N + c);
        placed = true;
      }
      if (!placed) return false;
    }
    const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!grid[r][c]) grid[r][c] = A[Math.floor(Math.random() * 26)];
    return true;
  }

  function renderScore() {
    scorebar.innerHTML = "<span class='pill'>FOUND <b>" + Object.keys(placements).filter(isFound).length +
      "/" + Object.keys(placements).length + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }
  function isFound(w) { return placements[w].every(idx => found.has(idx)); }

  function render() {
    renderScore();
    let cells = "";
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const idx = r * N + c;
      const cls = found.has(idx) ? "found" : (sel && sel === idx ? "sel" : "");
      cells += "<div class='ws-cell " + cls + "' data-i='" + idx + "'>" + grid[r][c] + "</div>";
    }
    const list = Object.keys(placements).map(w =>
      "<li class='" + (isFound(w) ? "done" : "") + "'>" + w + "</li>").join("");
    stage.innerHTML = "<div class='ws-wrap'>" +
      "<div class='ws-grid' style='grid-template-columns:repeat(" + N + ",30px)'>" + cells + "</div>" +
      "<div><p class='wd-hint' style='text-align:left'>FIND:</p><ul class='ws-words'>" + list + "</ul></div></div><div id='fb'></div>";
    stage.querySelectorAll(".ws-cell").forEach(b => b.addEventListener("click", () => clickCell(parseInt(b.dataset.i, 10))));
  }

  function clickCell(idx) {
    if (sel == null) { sel = idx; Engine.sfx.click(); render(); return; }
    if (sel === idx) { sel = null; render(); return; }
    const path = linePath(sel, idx);
    sel = null;
    if (path) {
      const key = path.join(","), rev = path.slice().reverse().join(",");
      const match = Object.keys(placements).find(w => !isFound(w) &&
        (placements[w].join(",") === key || placements[w].join(",") === rev));
      if (match) {
        placements[match].forEach(i => found.add(i));
        Engine.sfx.good();
        if (Object.keys(placements).every(isFound)) { render(); return finish(); }
        render(); return;
      }
    }
    Engine.sfx.bad(); render();
  }

  function linePath(a, b) {
    const r0 = Math.floor(a / N), c0 = a % N, r1 = Math.floor(b / N), c1 = b % N;
    const dr = Math.sign(r1 - r0), dc = Math.sign(c1 - c0);
    const len = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0));
    if (!(r0 === r1 || c0 === c1 || Math.abs(r1 - r0) === Math.abs(c1 - c0))) return null;
    const path = [];
    for (let i = 0; i <= len; i++) path.push((r0 + dr * i) * N + (c0 + dc * i));
    return path;
  }

  function finish() {
    const score = Object.keys(placements).length * 10;
    const isBest = Engine.recordPlay(GAME, pack.id, score);
    Engine.sfx.win(); Engine.confetti(60);
    document.getElementById("fb").innerHTML = "<div class='gameover'><h2>ALL FOUND!</h2><div class='big'>" + score + "</div>" +
      "<p>words discovered" + (isBest ? " · ★ NEW BEST!" : "") + "</p>" +
      "<div class='row'><button id='again' class='btn primary'>↺ NEW GRID</button>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
    document.getElementById("again").addEventListener("click", () => location.reload());
  }
})();
