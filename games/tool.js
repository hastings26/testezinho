/* CHOOSE THE RIGHT TOOL — AI-judgment game.
   For each task, pick which tool fits best. Teaches judgement, not recall.
   Content: pack.tools[] = { id, label, icon }, pack.tooltasks[] = { task, answer, explain }. */
(function () {
  const GAME = "tool";
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  let pack, tools, tasks, idx, score, locked;

  Engine.loadPack().then(p => {
    pack = p;
    packName.textContent = p.title;
    tools = p.tools || [];
    if (!p.tooltasks || !p.tooltasks.length || !tools.length) return notAvailable();
    start();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function notAvailable() {
    scorebar.innerHTML = "";
    stage.innerHTML =
      "<div class='gameover'><h2>NOT YET FOR THIS TOPIC</h2>" +
      "<p>“" + pack.title + "” doesn't have tool-choice scenarios yet.</p>" +
      "<div class='row'>" +
      "<a class='btn primary' href='tool.html?pack=ai-literacy'>PLAY THE AI LITERACY SET</a>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
  }

  function start() {
    tasks = Engine.shuffle(pack.tooltasks);
    idx = 0; score = 0;
    renderScore();
    renderTask();
  }

  function renderScore() {
    scorebar.innerHTML =
      "<span class='pill'>SCORE <b>" + score + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function toolById(id) { return tools.find(t => t.id === id) || { label: id, icon: "•" }; }

  function renderTask() {
    locked = false;
    const item = tasks[idx];
    const opts = tools.map(t =>
      "<button class='q-opt' data-id='" + t.id + "'>" +
      "<span class='key'>" + (t.icon || "•") + "</span><span>" + t.label + "</span></button>"
    ).join("");
    stage.innerHTML =
      "<div class='q-progress'>TASK " + (idx + 1) + " / " + tasks.length + "</div>" +
      "<p class='q-text'>Which tool fits best?<br><span style='color:var(--text-muted)'>" + item.task + "</span></p>" +
      "<div class='q-options'>" + opts + "</div><div id='fb'></div>";
    stage.querySelectorAll(".q-opt").forEach(b =>
      b.addEventListener("click", () => answer(b.dataset.id)));
  }

  function answer(id) {
    if (locked) return;
    locked = true;
    const item = tasks[idx];
    const correct = id === item.answer;
    stage.querySelectorAll(".q-opt").forEach(b => {
      b.disabled = true;
      if (b.dataset.id === item.answer) b.classList.add("correct");
      else if (b.dataset.id === id) b.classList.add("wrong");
    });
    if (correct) { score++; Engine.sfx.good(); }
    else { Engine.sfx.bad(); Engine.shake(stage); }
    renderScore();

    const best = toolById(item.answer);
    const fb = document.getElementById("fb");
    fb.className = "toast " + (correct ? "good" : "bad");
    fb.innerHTML = (correct ? "✓ " : "✗ Best fit: <b>" + best.icon + " " + best.label + "</b> — ") + item.explain +
      "<div style='margin-top:12px'><button id='next' class='btn primary'>" +
      (idx + 1 < tasks.length ? "NEXT ►" : "SEE RESULTS ►") + "</button></div>";
    const nb = document.getElementById("next");
    nb.focus();
    nb.addEventListener("click", () => { idx++; idx < tasks.length ? renderTask() : finish(); });
  }

  function finish() {
    const isBest = Engine.setBest(GAME, pack.id, score);
    const pct = Math.round((score / tasks.length) * 100);
    if (pct >= 60) { Engine.sfx.win(); Engine.confetti(60); } else Engine.sfx.lose();
    renderScore();
    stage.innerHTML =
      "<div class='gameover'><h2>" + (pct >= 60 ? "SHARP JUDGEMENT" : "RUN COMPLETE") + "</h2>" +
      "<div class='big'>" + score + "/" + tasks.length + "</div>" +
      "<p>" + pct + "% right" + (isBest ? " · ★ NEW BEST!" : "") + "</p>" +
      "<div class='row'><button id='again' class='btn primary'>↺ PLAY AGAIN</button>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
    document.getElementById("again").addEventListener("click", start);
  }
})();
