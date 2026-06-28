/* AI VS HUMAN — read a message and guess who wrote it, then see why.
   Content: pack.aivshuman[] = { text, source: "AI"|"Human", explain }. */
(function () {
  const GAME = "aihuman";
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  let pack, items, idx, score, locked;

  Engine.loadPack().then(p => {
    pack = p; packName.textContent = p.title;
    if (!p.aivshuman || !p.aivshuman.length) return notAvailable();
    start();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function notAvailable() {
    scorebar.innerHTML = "";
    stage.innerHTML = "<div class='gameover'><h2>NOT YET FOR THIS TOPIC</h2>" +
      "<p>“" + pack.title + "” has no AI-vs-human samples yet.</p>" +
      "<div class='row'><a class='btn primary' href='aihuman.html?pack=ai-literacy'>PLAY THE AI LITERACY SET</a>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
  }

  function start() { items = Engine.shuffle(pack.aivshuman); idx = 0; score = 0; render(); }

  function renderScore() {
    scorebar.innerHTML = "<span class='pill'>SCORE <b>" + score + "</b></span>" +
      "<span class='pill'>OF <b>" + items.length + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function render() {
    locked = false; renderScore();
    const it = items[idx];
    stage.innerHTML = "<div class='q-progress'>SAMPLE " + (idx + 1) + " / " + items.length + "</div>" +
      "<p class='q-text'>Who wrote this?</p><div class='evidence'>" + it.text + "</div>" +
      "<div class='q-options'>" +
      "<button class='q-opt' data-s='AI'><span class='key'>🤖</span><span>AI wrote it</span></button>" +
      "<button class='q-opt' data-s='Human'><span class='key'>🧠</span><span>A human wrote it</span></button>" +
      "</div><div id='fb'></div>";
    stage.querySelectorAll(".q-opt").forEach(b => b.addEventListener("click", () => answer(b.dataset.s)));
  }

  function answer(s) {
    if (locked) return; locked = true;
    const it = items[idx], correct = s === it.source;
    stage.querySelectorAll(".q-opt").forEach(b => {
      b.disabled = true;
      if (b.dataset.s === it.source) b.classList.add("correct"); else if (b.dataset.s === s) b.classList.add("wrong");
    });
    if (correct) { score++; Engine.sfx.good(); } else { Engine.sfx.bad(); Engine.shake(stage); }
    renderScore();
    const fb = document.getElementById("fb");
    fb.className = "toast " + (correct ? "good" : "bad");
    fb.innerHTML = (correct ? "✓ It was " : "✗ Actually it was ") + "<b>" + it.source + "</b>. " + it.explain +
      "<div style='margin-top:12px'><button id='next' class='btn primary'>" + (idx + 1 < items.length ? "NEXT ►" : "RESULTS ►") + "</button></div>";
    document.getElementById("next").addEventListener("click", () => { idx++; idx < items.length ? render() : finish(); });
  }

  function finish() {
    const isBest = Engine.setBest(GAME, pack.id, score);
    const pct = Math.round(score / items.length * 100);
    if (pct >= 60) { Engine.sfx.win(); Engine.confetti(60); } else Engine.sfx.lose();
    stage.innerHTML = "<div class='gameover'><h2>" + (pct >= 60 ? "SHARP EYE" : "RUN COMPLETE") + "</h2>" +
      "<div class='big'>" + score + "/" + items.length + "</div><p>" + pct + "%" + (isBest ? " · ★ NEW BEST!" : "") + "</p>" +
      "<div class='row'><button id='again' class='btn primary'>↺ AGAIN</button><a class='btn' href='index.html'>LIBRARY</a></div></div>";
    document.getElementById("again").addEventListener("click", start);
  }
})();
