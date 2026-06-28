/* TRIVIA WHEEL — spin for a random question worth the segment's points.
   Content: pack.questions[]. */
(function () {
  const GAME = "wheel";
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  const SEG = [200, 400, 100, 500, 300, 600]; // points per slice
  const COLORS = ["#2d3473", "#1f2452", "#3a2d63", "#26315f", "#34276b", "#1b2a55"];
  let pack, queue, score, spinning, rot;

  Engine.loadPack().then(p => {
    pack = p; packName.textContent = p.title;
    if (!p.questions || !p.questions.length) { stage.innerHTML = "<p>No questions in this pack.</p>"; return; }
    start();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function start() { queue = Engine.shuffle(pack.questions); score = 0; rot = 0; spinning = false; render(); }

  function renderScore() {
    scorebar.innerHTML = "<span class='pill'>SCORE <b>" + score + "</b></span>" +
      "<span class='pill'>LEFT <b>" + queue.length + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function gradient() {
    let stops = [], step = 360 / SEG.length;
    for (let i = 0; i < SEG.length; i++) stops.push(COLORS[i] + " " + (i * step) + "deg " + ((i + 1) * step) + "deg");
    return "conic-gradient(" + stops.join(",") + ")";
  }

  function render() {
    renderScore();
    if (!queue.length) return finish();
    const step = 360 / SEG.length;
    const labels = SEG.map((v, i) =>
      "<div style='position:absolute;top:50%;left:50%;transform:rotate(" + (i * step + step / 2) +
      "deg) translateY(-118px);transform-origin:0 0;font-family:\"Press Start 2P\",monospace;font-size:12px;color:#ffd23f'>" + v + "</div>"
    ).join("");
    stage.innerHTML =
      "<div class='wheel-wrap'>" +
      "<div class='wheel-stage'>" +
      "<div class='wheel-pointer'>▼</div>" +
      "<div class='wheel' id='wheel' style='background:" + gradient() + ";transform:rotate(" + rot + "deg)'>" + labels + "</div>" +
      "<div class='wheel-hub'></div>" +
      "</div>" +
      "<button id='spin' class='btn primary'>🎡 SPIN</button>" +
      "</div>";
    document.getElementById("spin").addEventListener("click", spin);
  }

  function spin() {
    if (spinning) return;
    spinning = true;
    const seg = Math.floor(Math.random() * SEG.length);
    const step = 360 / SEG.length;
    // land the centre of `seg` under the top pointer
    rot += 360 * 4 + ((360 - (seg * step + step / 2)) - (rot % 360) + 360) % 360;
    const wheel = document.getElementById("wheel");
    wheel.style.transform = "rotate(" + rot + "deg)";
    document.getElementById("spin").disabled = true;
    Engine.sfx.click();
    setTimeout(() => {
      const item = queue.shift();
      Engine.quizModal(item, correct => {
        if (correct) { score += SEG[seg]; Engine.confetti(20); }
        spinning = false;
        render();
      });
    }, 3500);
  }

  function finish() {
    const isBest = Engine.setBest(GAME, pack.id, score);
    Engine.sfx.win(); Engine.confetti(60);
    stage.innerHTML = "<div class='gameover'><h2>WHEEL CLEARED</h2><div class='big'>" + score + "</div>" +
      "<p>points" + (isBest ? " · ★ NEW BEST!" : "") + "</p>" +
      "<div class='row'><button id='again' class='btn primary'>↺ PLAY AGAIN</button>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
    document.getElementById("again").addEventListener("click", start);
  }
})();
