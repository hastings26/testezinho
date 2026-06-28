/* QUIZ QUEST — progressive multiple-choice (Millionaire style).
   Content: pack.questions[] = { q, options[], answer, explain }. */
(function () {
  const GAME = "quiz";
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  let pack, questions, idx, score, streak, fiftyUsed, locked;

  Engine.loadPack().then(p => {
    pack = p;
    packName.textContent = p.title;
    if (!p.questions || !p.questions.length) {
      stage.innerHTML = "<p>This pack has no questions.</p>";
      return;
    }
    start();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function start() {
    questions = Engine.shuffle(pack.questions);
    idx = 0; score = 0; streak = 0; fiftyUsed = false; locked = false;
    renderScore();
    renderQuestion();
  }

  function renderScore() {
    const best = Engine.getBest(GAME, pack.id);
    scorebar.innerHTML =
      "<span class='pill'>SCORE <b>" + score + "</b></span>" +
      "<span class='pill'>STREAK <b>" + streak + "</b></span>" +
      "<span class='pill'>BEST <b>" + best + "</b></span>";
  }

  function renderQuestion() {
    locked = false;
    const item = questions[idx];
    const keys = ["A", "B", "C", "D", "E", "F"];
    const opts = item.options.map((o, i) =>
      "<button class='q-opt' data-i='" + i + "'><span class='key'>" + keys[i] + "</span><span>" + o + "</span></button>"
    ).join("");
    stage.innerHTML =
      "<div class='q-progress'>QUESTION " + (idx + 1) + " / " + questions.length +
      "<button id='fifty' class='btn sm' style='float:right' " + (fiftyUsed ? "disabled" : "") + ">50:50</button></div>" +
      "<p class='q-text'>" + item.q + "</p>" +
      "<div class='q-options'>" + opts + "</div>" +
      "<div id='fb'></div>";

    stage.querySelectorAll(".q-opt").forEach(b =>
      b.addEventListener("click", () => answer(parseInt(b.dataset.i, 10))));
    const f = document.getElementById("fifty");
    if (f) f.addEventListener("click", fifty);
  }

  function fifty() {
    if (fiftyUsed || locked) return;
    fiftyUsed = true;
    Engine.sfx.click();
    const item = questions[idx];
    const wrong = item.options.map((_, i) => i).filter(i => i !== item.answer);
    Engine.shuffle(wrong).slice(0, 2).forEach(i => {
      const b = stage.querySelector(".q-opt[data-i='" + i + "']");
      if (b) { b.disabled = true; b.style.visibility = "hidden"; }
    });
    document.getElementById("fifty").disabled = true;
  }

  function answer(i) {
    if (locked) return;
    locked = true;
    const item = questions[idx];
    const correct = i === item.answer;
    stage.querySelectorAll(".q-opt").forEach(b => {
      b.disabled = true;
      const bi = parseInt(b.dataset.i, 10);
      if (bi === item.answer) b.classList.add("correct");
      else if (bi === i) b.classList.add("wrong");
    });
    if (correct) { score++; streak++; Engine.sfx.good(); }
    else { streak = 0; Engine.sfx.bad(); Engine.shake(stage); }
    renderScore();

    const fb = document.getElementById("fb");
    fb.className = "toast " + (correct ? "good" : "bad");
    fb.innerHTML = (correct ? "✓ CORRECT — " : "✗ NOT QUITE — ") + (item.explain || "") +
      "<div style='margin-top:12px'><button id='next' class='btn primary'>" +
      (idx + 1 < questions.length ? "NEXT ►" : "SEE RESULTS ►") + "</button></div>";
    const nb = document.getElementById("next");
    nb.focus();
    nb.addEventListener("click", () => {
      idx++;
      if (idx < questions.length) renderQuestion();
      else finish();
    });
  }

  function finish() {
    const isBest = Engine.setBest(GAME, pack.id, score);
    const pct = Math.round((score / questions.length) * 100);
    if (pct >= 60) { Engine.sfx.win(); Engine.confetti(60); } else Engine.sfx.lose();
    renderScore();
    stage.innerHTML =
      "<div class='gameover'>" +
      "<h2>" + (pct >= 60 ? "WELL PLAYED" : "RUN COMPLETE") + "</h2>" +
      "<div class='big'>" + score + "/" + questions.length + "</div>" +
      "<p>" + pct + "% correct" + (isBest ? " · ★ NEW BEST!" : "") + "</p>" +
      "<div class='row'>" +
      "<button id='again' class='btn primary'>↺ PLAY AGAIN</button>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
    document.getElementById("again").addEventListener("click", start);
  }
})();
