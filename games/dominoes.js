/* PROCESS CHAINS (Dominoes) — put the steps of a process in the right order,
   like laying a domino chain. Content: pack.chains[] = { title, steps[] }. */
(function () {
  const GAME = "dominoes";
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  let pack, chains, ci, order, score, checked;

  Engine.loadPack().then(p => {
    pack = p; packName.textContent = p.title;
    if (!p.chains || !p.chains.length) return notAvailable();
    start();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function notAvailable() {
    scorebar.innerHTML = "";
    stage.innerHTML = "<div class='gameover'><h2>NOT YET FOR THIS TOPIC</h2>" +
      "<p>“" + pack.title + "” has no process chains yet.</p>" +
      "<div class='row'><a class='btn primary' href='dominoes.html?pack=ai-literacy'>PLAY THE AI LITERACY SET</a>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
  }

  function start() { chains = Engine.shuffle(pack.chains); ci = 0; score = 0; loadChain(); }

  function loadChain() {
    const chain = chains[ci];
    // shuffle steps, guaranteeing it isn't already correct
    do { order = Engine.shuffle(chain.steps.map((s, i) => ({ s, i }))); }
    while (chain.steps.length > 1 && order.every((o, i) => o.i === i));
    checked = false;
    render();
  }

  function renderScore() {
    scorebar.innerHTML = "<span class='pill'>SCORE <b>" + score + "</b></span>" +
      "<span class='pill'>CHAIN <b>" + (ci + 1) + "/" + chains.length + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function render() {
    renderScore();
    const chain = chains[ci];
    const items = order.map((o, i) => {
      let cls = "seq-item";
      if (checked) cls += o.i === i ? " correct" : " wrong";
      return "<div class='" + cls + "'><span class='num'>" + (i + 1) + "</span><span>" + o.s + "</span>" +
        (checked ? "" : "<span class='seq-move'><button data-up='" + i + "' " + (i === 0 ? "disabled" : "") + ">▲</button>" +
          "<button data-dn='" + i + "' " + (i === order.length - 1 ? "disabled" : "") + ">▼</button></span>") + "</div>";
    }).join("");
    stage.innerHTML = "<p class='wd-hint'>Put the steps in order: <b style='color:var(--gold)'>" + chain.title + "</b></p>" +
      "<div class='seq-list'>" + items + "</div>" +
      "<div style='text-align:center;margin-top:16px'>" +
      (checked ? "<button id='cont' class='btn primary'>" + (ci + 1 < chains.length ? "NEXT CHAIN ►" : "SEE RESULTS ►") + "</button>"
               : "<button id='check' class='btn primary'>✓ CHECK ORDER</button>") + "</div><div id='fb'></div>";
    stage.querySelectorAll("[data-up]").forEach(b => b.addEventListener("click", () => move(+b.dataset.up, -1)));
    stage.querySelectorAll("[data-dn]").forEach(b => b.addEventListener("click", () => move(+b.dataset.dn, 1)));
    const ch = document.getElementById("check"); if (ch) ch.addEventListener("click", check);
    const co = document.getElementById("cont"); if (co) co.addEventListener("click", next);
  }

  function move(i, d) { const j = i + d; [order[i], order[j]] = [order[j], order[i]]; Engine.sfx.click(); render(); }

  function check() {
    checked = true;
    const right = order.filter((o, i) => o.i === i).length;
    score += right;
    if (right === order.length) { Engine.sfx.win(); Engine.confetti(40); } else Engine.sfx.bad();
    render();
    const fb = document.getElementById("fb");
    fb.className = "toast " + (right === order.length ? "good" : "bad");
    fb.textContent = right === order.length ? "✓ Perfect chain!" : right + " of " + order.length + " in the right place.";
  }

  function next() { ci++; ci < chains.length ? loadChain() : finish(); }

  function finish() {
    const isBest = Engine.recordPlay(GAME, pack.id, score);
    Engine.sfx.win();
    stage.innerHTML = "<div class='gameover'><h2>CHAINS COMPLETE</h2><div class='big'>" + score + "</div>" +
      "<p>steps placed correctly" + (isBest ? " · ★ NEW BEST!" : "") + "</p>" +
      "<div class='row'><button id='again' class='btn primary'>↺ PLAY AGAIN</button>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
    document.getElementById("again").addEventListener("click", start);
  }
})();
