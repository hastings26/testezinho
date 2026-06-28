/* CROSSWORD — definitions. A crossword auto-built from the pack's terms and
   hints. Type answers; CHECK validates. Content: pack.terms[]. */
(function () {
  const GAME = "crossword";
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  let pack, placed, sol, bounds, checked;

  Engine.loadPack().then(p => {
    pack = p; packName.textContent = p.title;
    const words = (p.terms || [])
      .map(t => ({ w: (t.term || "").toUpperCase().replace(/[^A-Z]/g, ""), hint: t.hint || "" }))
      .filter(t => t.w.length >= 3 && t.w.length <= 9);
    if (words.length < 4) { stage.innerHTML = "<p>Not enough terms for a crossword.</p>"; return; }
    start(words);
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function start(words) {
    let best = null;
    for (let attempt = 0; attempt < 25; attempt++) {
      const g = generate(Engine.shuffle(words).slice(0, 8));
      if (!best || g.placed.length > best.placed.length) best = g;
      if (best.placed.length >= Math.min(6, words.length)) break;
    }
    placed = best.placed; sol = best.sol; computeBounds(); numberAndRender();
  }

  function key(r, c) { return r + "," + c; }

  function generate(words) {
    const map = {}; const out = [];
    const first = words[0];
    for (let i = 0; i < first.w.length; i++) map[key(0, i)] = first.w[i];
    out.push({ w: first.w, hint: first.hint, r: 0, c: 0, dir: "A" });
    for (let n = 1; n < words.length; n++) {
      const { w, hint } = words[n];
      let done = false;
      for (const P of out) {
        if (done) break;
        for (let i = 0; i < P.w.length && !done; i++) {
          const pr = P.dir === "A" ? P.r : P.r + i;
          const pc = P.dir === "A" ? P.c + i : P.c;
          for (let j = 0; j < w.length && !done; j++) {
            if (w[j] !== P.w[i]) continue;
            const dir = P.dir === "A" ? "D" : "A";
            const r0 = dir === "D" ? pr - j : pr;
            const c0 = dir === "A" ? pc - j : pc;
            if (tryPlace(map, w, r0, c0, dir)) {
              for (let k = 0; k < w.length; k++) map[key(dir === "D" ? r0 + k : r0, dir === "A" ? c0 + k : c0)] = w[k];
              out.push({ w, hint, r: r0, c: c0, dir });
              done = true;
            }
          }
        }
      }
    }
    return { placed: out, sol: map };
  }

  function tryPlace(map, w, r0, c0, dir) {
    const dr = dir === "D" ? 1 : 0, dc = dir === "A" ? 1 : 0;
    // cell before / after must be empty
    if (map[key(r0 - dr, c0 - dc)] || map[key(r0 + dr * w.length, c0 + dc * w.length)]) return false;
    let crossings = 0;
    for (let k = 0; k < w.length; k++) {
      const r = r0 + dr * k, c = c0 + dc * k, existing = map[key(r, c)];
      if (existing) { if (existing !== w[k]) return false; crossings++; continue; }
      // non-crossing cell: perpendicular neighbours must be empty
      const pr1 = r + dc, pc1 = c + dr, pr2 = r - dc, pc2 = c - dr;
      if (map[key(pr1, pc1)] || map[key(pr2, pc2)]) return false;
    }
    return crossings >= 1;
  }

  function computeBounds() {
    let minR = 1e9, minC = 1e9, maxR = -1e9, maxC = -1e9;
    Object.keys(sol).forEach(k => {
      const [r, c] = k.split(",").map(Number);
      minR = Math.min(minR, r); maxR = Math.max(maxR, r); minC = Math.min(minC, c); maxC = Math.max(maxC, c);
    });
    bounds = { minR, minC, rows: maxR - minR + 1, cols: maxC - minC + 1 };
  }

  function numberAndRender() {
    checked = false;
    // assign numbers to starts in reading order
    const numbers = {}; let n = 0;
    const starts = placed.slice().sort((a, b) =>
      (a.r - b.r) || (a.c - b.c));
    const cellNum = {};
    starts.forEach(p => {
      const kk = key(p.r, p.c);
      if (!cellNum[kk]) cellNum[kk] = ++n;
      p.num = cellNum[kk];
    });
    render();
  }

  function renderScore() {
    scorebar.innerHTML = "<span class='pill'>WORDS <b>" + placed.length + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function render() {
    renderScore();
    const cellNum = {};
    placed.forEach(p => { const kk = key(p.r, p.c); cellNum[kk] = p.num; });
    let cells = "";
    for (let r = 0; r < bounds.rows; r++) for (let c = 0; c < bounds.cols; c++) {
      const ar = bounds.minR + r, ac = bounds.minC + c, kk = key(ar, ac);
      if (sol[kk] == null) { cells += "<div class='cw-cell block'></div>"; continue; }
      const num = cellNum[kk] ? "<span class='gn'>" + cellNum[kk] + "</span>" : "";
      cells += "<div class='cw-cell'>" + num + "<input maxlength='1' data-k='" + kk + "' autocomplete='off'></div>";
    }
    const across = placed.filter(p => p.dir === "A").sort((a, b) => a.num - b.num)
      .map(p => "<li><b>" + p.num + ".</b> " + p.hint + "</li>").join("");
    const down = placed.filter(p => p.dir === "D").sort((a, b) => a.num - b.num)
      .map(p => "<li><b>" + p.num + ".</b> " + p.hint + "</li>").join("");
    stage.innerHTML = "<div class='cw-wrap'>" +
      "<div class='cw-grid' style='grid-template-columns:repeat(" + bounds.cols + ",34px)'>" + cells + "</div>" +
      "<div class='cw-clues'><h4>ACROSS</h4><ol>" + across + "</ol><h4>DOWN</h4><ol>" + down + "</ol></div></div>" +
      "<div style='text-align:center;margin-top:16px'><button id='check' class='btn primary'>✓ CHECK</button> " +
      "<button id='reveal' class='btn sm'>REVEAL</button></div><div id='fb'></div>";
    document.getElementById("check").addEventListener("click", check);
    document.getElementById("reveal").addEventListener("click", reveal);
  }

  function check() {
    let right = 0, total = 0;
    stage.querySelectorAll(".cw-cell input").forEach(inp => {
      total++;
      const want = sol[inp.dataset.k];
      if ((inp.value || "").toUpperCase() === want) { inp.classList.add("ok"); right++; }
      else inp.classList.remove("ok");
    });
    const fb = document.getElementById("fb");
    if (right === total) {
      Engine.sfx.win(); Engine.confetti(60);
      Engine.setBest(GAME, pack.id, placed.length * 10);
      fb.className = "toast good"; fb.textContent = "★ Solved! Every answer correct.";
    } else { Engine.sfx.bad(); fb.className = "toast bad"; fb.textContent = right + " / " + total + " letters correct."; }
  }

  function reveal() {
    stage.querySelectorAll(".cw-cell input").forEach(inp => { inp.value = sol[inp.dataset.k]; inp.classList.add("ok"); });
    Engine.sfx.click();
  }
})();
