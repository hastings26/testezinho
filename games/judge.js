/* JUDGE MODE — AI-judgment game.
   Read several AI answers to a prompt and approve the best one.
   Content: pack.scenarios[] = { prompt, answers:[{text, verdict}], best, explain }. */
(function () {
  const GAME = "judge";
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  let pack, rounds, idx, score, locked;

  Engine.loadPack().then(p => {
    pack = p;
    packName.textContent = p.title;
    if (!p.scenarios || !p.scenarios.length) return notAvailable();
    start();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function notAvailable() {
    scorebar.innerHTML = "";
    stage.innerHTML =
      "<div class='gameover'><h2>NOT YET FOR THIS TOPIC</h2>" +
      "<p>“" + pack.title + "” doesn't have judging scenarios yet.</p>" +
      "<div class='row'>" +
      "<a class='btn primary' href='judge.html?pack=ai-literacy'>PLAY THE AI LITERACY SET</a>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
  }

  function start() {
    // shuffle scenarios, and shuffle answer order within each (tracking the best)
    rounds = Engine.shuffle(pack.scenarios).map(s => {
      const order = Engine.shuffle(s.answers.map((a, i) => ({ a, i })));
      return { prompt: s.prompt, explain: s.explain, order, bestPos: order.findIndex(x => x.i === s.best) };
    });
    idx = 0; score = 0;
    renderScore();
    renderRound();
  }

  function renderScore() {
    scorebar.innerHTML =
      "<span class='pill'>SCORE <b>" + score + "</b></span>" +
      "<span class='pill'>OF <b>" + (pack.scenarios.length) + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function renderRound() {
    locked = false;
    const r = rounds[idx];
    const keys = ["A", "B", "C", "D"];
    const cards = r.order.map((o, i) =>
      "<button class='q-opt' data-pos='" + i + "' style='display:block'>" +
      "<span class='key'>" + keys[i] + "</span><span>" + o.a.text + "</span></button>"
    ).join("");
    stage.innerHTML =
      "<div class='q-progress'>CASE " + (idx + 1) + " / " + rounds.length + "</div>" +
      "<p class='q-text'>" + r.prompt + "<br><span style='color:var(--text-muted);font-size:21px'>Which answer would you approve?</span></p>" +
      "<div class='q-options'>" + cards + "</div><div id='fb'></div>";
    stage.querySelectorAll(".q-opt").forEach(b =>
      b.addEventListener("click", () => choose(parseInt(b.dataset.pos, 10))));
  }

  function choose(pos) {
    if (locked) return;
    locked = true;
    const r = rounds[idx];
    const correct = pos === r.bestPos;
    stage.querySelectorAll(".q-opt").forEach((b, i) => {
      b.disabled = true;
      const verdict = r.order[i].a.verdict;
      // annotate every card with its verdict so the learner sees the reasoning
      b.insertAdjacentHTML("beforeend",
        "<div style='margin-top:8px;font-size:17px;color:var(--text-dim)'>↳ " + verdict + "</div>");
      if (i === r.bestPos) b.classList.add("correct");
      else if (i === pos) b.classList.add("wrong");
    });
    if (correct) { score++; Engine.sfx.good(); }
    else { Engine.sfx.bad(); Engine.shake(stage); }
    renderScore();

    const fb = document.getElementById("fb");
    fb.className = "toast " + (correct ? "good" : "bad");
    fb.innerHTML = (correct ? "✓ Approved the right one. " : "✗ Not the one to approve. ") + r.explain +
      "<div style='margin-top:12px'><button id='next' class='btn primary'>" +
      (idx + 1 < rounds.length ? "NEXT CASE ►" : "SEE VERDICT ►") + "</button></div>";
    const nb = document.getElementById("next");
    nb.focus();
    nb.addEventListener("click", () => { idx++; idx < rounds.length ? renderRound() : finish(); });
  }

  function finish() {
    const isBest = Engine.recordPlay(GAME, pack.id, score, { perfect: score === rounds.length });
    const pct = Math.round((score / rounds.length) * 100);
    if (pct >= 60) { Engine.sfx.win(); Engine.confetti(60); } else Engine.sfx.lose();
    renderScore();
    stage.innerHTML =
      "<div class='gameover'><h2>" + (pct >= 60 ? "SOUND JUDGEMENT" : "COURT ADJOURNED") + "</h2>" +
      "<div class='big'>" + score + "/" + rounds.length + "</div>" +
      "<p>" + pct + "% approved correctly" + (isBest ? " · ★ NEW BEST!" : "") + "</p>" +
      "<div class='row'><button id='again' class='btn primary'>↺ PLAY AGAIN</button>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
    document.getElementById("again").addEventListener("click", start);
  }
})();
