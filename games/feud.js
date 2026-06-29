/* FAMILY FEUD — we surveyed the topic; name the top answers. Pick from the
   pool; decoys and repeats cost a strike. Content: pack.surveys[] =
   { question, answers:[{text, points}], decoys[] }. */
(function () {
  const GAME = "feud";
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  let pack, surveys, si, found, strikes, score, pool, over;

  Engine.loadPack().then(p => {
    pack = p; packName.textContent = p.title;
    if (!p.surveys || !p.surveys.length) return notAvailable();
    start();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function notAvailable() {
    scorebar.innerHTML = "";
    stage.innerHTML = "<div class='gameover'><h2>NOT YET FOR THIS TOPIC</h2>" +
      "<p>“" + pack.title + "” has no surveys yet.</p>" +
      "<div class='row'><a class='btn primary' href='feud.html?pack=ai-literacy'>PLAY THE AI LITERACY SET</a>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
  }

  function start() { surveys = Engine.shuffle(pack.surveys); si = 0; score = 0; loadSurvey(); }

  function loadSurvey() {
    const s = surveys[si];
    found = new Set(); strikes = 0; over = false;
    const decoys = (s.decoys || []).map(d => ({ text: d, points: 0, decoy: true }));
    pool = Engine.shuffle(s.answers.map((a, i) => ({ text: a.text, points: a.points, rank: i })).concat(decoys));
    render();
  }

  function renderScore() {
    scorebar.innerHTML = "<span class='pill'>SCORE <b>" + score + "</b></span>" +
      "<span class='pill'>SURVEY <b>" + (si + 1) + "/" + surveys.length + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function render() {
    renderScore();
    const s = surveys[si];
    const board = s.answers.map((a, i) =>
      "<div class='ff-slot " + (found.has(i) ? "revealed" : "") + "'>" +
      (found.has(i) ? "<span>" + a.text + "</span><span class='pts'>" + a.points + "</span>"
                    : "<span class='hidden-rank'>" + (i + 1) + "</span><span class='pts'>— ? —</span>") +
      "</div>").join("");
    const strikeRow = "<div class='ff-strikes'>" + "✗".repeat(strikes) + "</div>";
    const poolBtns = over ? "" : "<div class='ff-pool'>" + pool.map((o, i) =>
      "<button class='btn" + (o.used ? " ghost" : "") + "' data-i='" + i + "' " + (o.used ? "disabled" : "") + ">" + o.text + "</button>").join("") + "</div>";
    stage.innerHTML = "<p class='q-text' style='text-align:center'>“" + s.question + "”</p>" +
      "<div class='ff-board'>" + board + "</div>" + strikeRow + poolBtns + "<div id='fb'></div>";
    stage.querySelectorAll(".ff-pool .btn").forEach(b => b.addEventListener("click", () => pickAnswer(parseInt(b.dataset.i, 10))));
    if (over) {
      const fb = document.getElementById("fb");
      fb.innerHTML = "<div style='text-align:center;margin-top:8px'><button id='next' class='btn primary'>" +
        (si + 1 < surveys.length ? "NEXT SURVEY ►" : "SEE RESULTS ►") + "</button></div>";
      document.getElementById("next").addEventListener("click", () => { si++; si < surveys.length ? loadSurvey() : finish(); });
    }
  }

  function pickAnswer(i) {
    if (over || pool[i].used) return;
    const opt = pool[i]; opt.used = true;
    if (!opt.decoy && !found.has(opt.rank)) {
      found.add(opt.rank); score += opt.points; Engine.sfx.good(); Engine.confetti(14);
      if (found.size === surveys[si].answers.length) endSurvey(true);
      else render();
    } else {
      strikes++; Engine.sfx.bad(); Engine.shake(stage.querySelector(".ff-board"));
      if (strikes >= 3) endSurvey(false); else render();
    }
  }

  function endSurvey(cleared) {
    over = true;
    // reveal all remaining answers
    surveys[si].answers.forEach((_, i) => found.add(i));
    if (cleared) Engine.sfx.win();
    render();
  }

  function finish() {
    const isBest = Engine.recordPlay(GAME, pack.id, score);
    Engine.sfx.win(); Engine.confetti(60);
    stage.innerHTML = "<div class='gameover'><h2>SURVEY SAYS…</h2><div class='big'>" + score + "</div>" +
      "<p>points" + (isBest ? " · ★ NEW BEST!" : "") + "</p>" +
      "<div class='row'><button id='again' class='btn primary'>↺ PLAY AGAIN</button>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
    document.getElementById("again").addEventListener("click", start);
  }
})();
