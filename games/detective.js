/* DETECTIVE MODE — read the evidence and work out what actually happened.
   Content: pack.cases[] = { evidence[], question, options[], answer, explain }. */
(function () {
  const GAME = "detective";
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  let pack, cases, idx, score, locked;

  Engine.loadPack().then(p => {
    pack = p; packName.textContent = p.title;
    if (!p.cases || !p.cases.length) return notAvailable();
    start();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function notAvailable() {
    scorebar.innerHTML = "";
    stage.innerHTML = "<div class='gameover'><h2>NOT YET FOR THIS TOPIC</h2>" +
      "<p>“" + pack.title + "” has no detective cases yet.</p>" +
      "<div class='row'><a class='btn primary' href='detective.html?pack=ai-literacy'>PLAY THE AI LITERACY SET</a>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
  }

  function start() { cases = Engine.shuffle(pack.cases); idx = 0; score = 0; render(); }

  function renderScore() {
    scorebar.innerHTML = "<span class='pill'>SOLVED <b>" + score + "</b></span>" +
      "<span class='pill'>OF <b>" + cases.length + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function render() {
    locked = false; renderScore();
    const c = cases[idx];
    const keys = ["A", "B", "C", "D"];
    const ev = c.evidence.map(e => "<div class='evidence'>🔍 " + e + "</div>").join("");
    stage.innerHTML = "<div class='q-progress'>CASE " + (idx + 1) + " / " + cases.length + "</div>" +
      "<p class='q-text'>The evidence:</p>" + ev +
      "<p class='q-text' style='margin-top:16px'>" + c.question + "</p>" +
      "<div class='q-options'>" + c.options.map((o, i) =>
        "<button class='q-opt' data-i='" + i + "'><span class='key'>" + keys[i] + "</span><span>" + o + "</span></button>").join("") +
      "</div><div id='fb'></div>";
    stage.querySelectorAll(".q-opt").forEach(b => b.addEventListener("click", () => answer(parseInt(b.dataset.i, 10))));
  }

  function answer(i) {
    if (locked) return; locked = true;
    const c = cases[idx], correct = i === c.answer;
    stage.querySelectorAll(".q-opt").forEach(b => {
      b.disabled = true; const bi = +b.dataset.i;
      if (bi === c.answer) b.classList.add("correct"); else if (bi === i) b.classList.add("wrong");
    });
    if (correct) { score++; Engine.sfx.good(); } else { Engine.sfx.bad(); Engine.shake(stage); }
    renderScore();
    const fb = document.getElementById("fb");
    fb.className = "toast " + (correct ? "good" : "bad");
    fb.innerHTML = (correct ? "✓ Case closed. " : "✗ Not quite. ") + c.explain +
      "<div style='margin-top:12px'><button id='next' class='btn primary'>" + (idx + 1 < cases.length ? "NEXT CASE ►" : "RESULTS ►") + "</button></div>";
    document.getElementById("next").addEventListener("click", () => { idx++; idx < cases.length ? render() : finish(); });
  }

  function finish() {
    const isBest = Engine.recordPlay(GAME, pack.id, score);
    const pct = Math.round(score / cases.length * 100);
    if (pct >= 60) { Engine.sfx.win(); Engine.confetti(60); } else Engine.sfx.lose();
    stage.innerHTML = "<div class='gameover'><h2>" + (pct >= 60 ? "ACE DETECTIVE" : "CASE FILES CLOSED") + "</h2>" +
      "<div class='big'>" + score + "/" + cases.length + "</div><p>" + pct + "%" + (isBest ? " · ★ NEW BEST!" : "") + "</p>" +
      "<div class='row'><button id='again' class='btn primary'>↺ AGAIN</button><a class='btn' href='index.html'>LIBRARY</a></div></div>";
    document.getElementById("again").addEventListener("click", start);
  }
})();
