/* BUILD THE PROMPT — given the output you want, pick the prompt that produces it.
   Content: pack.builds[] = { goal, options[], answer, explain }. */
(function () {
  const GAME = "build";
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  let pack, items, idx, score, locked;

  Engine.loadPack().then(p => {
    pack = p; packName.textContent = p.title;
    if (!p.builds || !p.builds.length) return notAvailable();
    start();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function notAvailable() {
    scorebar.innerHTML = "";
    stage.innerHTML = "<div class='gameover'><h2>NOT YET FOR THIS TOPIC</h2>" +
      "<p>“" + pack.title + "” has no prompt-building drills yet.</p>" +
      "<div class='row'><a class='btn primary' href='build.html?pack=ai-literacy'>PLAY THE AI LITERACY SET</a>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
  }

  function start() { items = Engine.shuffle(pack.builds); idx = 0; score = 0; render(); }

  function renderScore() {
    scorebar.innerHTML = "<span class='pill'>SCORE <b>" + score + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function render() {
    locked = false; renderScore();
    const it = items[idx];
    const keys = ["A", "B", "C", "D", "E"];
    stage.innerHTML = "<div class='q-progress'>GOAL " + (idx + 1) + " / " + items.length + "</div>" +
      "<p class='q-text'>🧩 You want this result:<br><span class='evidence' style='display:block;margin-top:10px'>" + it.goal + "</span>Which prompt builds it?</p>" +
      "<div class='q-options'>" + it.options.map((o, i) =>
        "<button class='q-opt' data-i='" + i + "'><span class='key'>" + keys[i] + "</span><span>" + o + "</span></button>").join("") +
      "</div><div id='fb'></div>";
    stage.querySelectorAll(".q-opt").forEach(b => b.addEventListener("click", () => answer(parseInt(b.dataset.i, 10))));
  }

  function answer(i) {
    if (locked) return; locked = true;
    const it = items[idx], correct = i === it.answer;
    stage.querySelectorAll(".q-opt").forEach(b => {
      b.disabled = true; const bi = +b.dataset.i;
      if (bi === it.answer) b.classList.add("correct"); else if (bi === i) b.classList.add("wrong");
    });
    if (correct) { score++; Engine.sfx.good(); } else { Engine.sfx.bad(); Engine.shake(stage); }
    renderScore();
    const fb = document.getElementById("fb");
    fb.className = "toast " + (correct ? "good" : "bad");
    fb.innerHTML = (correct ? "✓ " : "✗ ") + it.explain +
      "<div style='margin-top:12px'><button id='next' class='btn primary'>" + (idx + 1 < items.length ? "NEXT ►" : "RESULTS ►") + "</button></div>";
    document.getElementById("next").addEventListener("click", () => { idx++; idx < items.length ? render() : finish(); });
  }

  function finish() {
    const isBest = Engine.recordPlay(GAME, pack.id, score);
    const pct = Math.round(score / items.length * 100);
    if (pct >= 60) { Engine.sfx.win(); Engine.confetti(60); } else Engine.sfx.lose();
    stage.innerHTML = "<div class='gameover'><h2>" + (pct >= 60 ? "PROMPT ARCHITECT" : "RUN COMPLETE") + "</h2>" +
      "<div class='big'>" + score + "/" + items.length + "</div><p>" + pct + "%" + (isBest ? " · ★ NEW BEST!" : "") + "</p>" +
      "<div class='row'><button id='again' class='btn primary'>↺ AGAIN</button><a class='btn' href='index.html'>LIBRARY</a></div></div>";
    document.getElementById("again").addEventListener("click", start);
  }
})();
