/* AI ESCAPE ROOM — each room is a business challenge; use AI correctly to open
   the lock and move on. Content: pack.rooms[] = { name, scenario, q, options, answer, explain }. */
(function () {
  const GAME = "escape";
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  let pack, rooms, idx, attempts, locked;

  Engine.loadPack().then(p => {
    pack = p; packName.textContent = p.title;
    if (!p.rooms || !p.rooms.length) return notAvailable();
    start();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function notAvailable() {
    scorebar.innerHTML = "";
    stage.innerHTML = "<div class='gameover'><h2>NOT YET FOR THIS TOPIC</h2>" +
      "<p>“" + pack.title + "” has no escape rooms yet.</p>" +
      "<div class='row'><a class='btn primary' href='escape.html?pack=ai-literacy'>PLAY THE AI LITERACY SET</a>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
  }

  function start() { rooms = pack.rooms.slice(); idx = 0; attempts = 0; render(); }

  function renderScore() {
    scorebar.innerHTML = "<span class='pill'>ROOM <b>" + Math.min(idx + 1, rooms.length) + "/" + rooms.length + "</b></span>" +
      "<span class='pill'>TRIES <b>" + attempts + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function render() {
    locked = false; renderScore();
    const r = rooms[idx];
    const keys = ["A", "B", "C", "D"];
    const pips = rooms.map((_, i) =>
      "<div class='room-pip " + (i < idx ? "done" : i === idx ? "now" : "") + "'></div>").join("");
    stage.innerHTML = "<div class='room-steps'>" + pips + "</div>" +
      "<div class='room-lock'>🔒</div>" +
      "<h3 style='text-align:center;color:var(--gold);margin:0 0 6px'>" + r.name + "</h3>" +
      "<p class='q-text' style='text-align:center'>" + r.scenario + "</p>" +
      "<p class='q-text'>" + r.q + "</p>" +
      "<div class='q-options'>" + r.options.map((o, i) =>
        "<button class='q-opt' data-i='" + i + "'><span class='key'>" + keys[i] + "</span><span>" + o + "</span></button>").join("") +
      "</div><div id='fb'></div>";
    stage.querySelectorAll(".q-opt").forEach(b => b.addEventListener("click", () => answer(parseInt(b.dataset.i, 10))));
  }

  function answer(i) {
    if (locked) return;
    const r = rooms[idx];
    if (i !== r.answer) {
      attempts++; renderScore(); Engine.sfx.bad(); Engine.shake(stage.querySelector(".room-lock"));
      const fb = document.getElementById("fb");
      fb.className = "toast bad"; fb.textContent = "✗ The lock holds. Think again.";
      return;
    }
    locked = true; attempts++; Engine.sfx.good(); Engine.confetti(24);
    document.querySelector(".room-lock").textContent = "🔓";
    const fb = document.getElementById("fb");
    fb.className = "toast good";
    fb.innerHTML = "✓ " + r.explain +
      "<div style='margin-top:12px'><button id='next' class='btn primary'>" + (idx + 1 < rooms.length ? "ENTER NEXT ROOM ►" : "ESCAPE! ►") + "</button></div>";
    document.getElementById("next").addEventListener("click", () => { idx++; idx < rooms.length ? render() : finish(); });
  }

  function finish() {
    const score = Math.max(10, rooms.length * 100 - (attempts - rooms.length) * 20);
    const isBest = Engine.setBest(GAME, pack.id, score);
    Engine.sfx.win(); Engine.confetti(80);
    stage.innerHTML = "<div class='gameover'><h2>★ YOU ESCAPED! ★</h2><div class='big'>" + score + "</div>" +
      "<p>" + rooms.length + " rooms in " + attempts + " tries" + (isBest ? " · ★ NEW BEST!" : "") + "</p>" +
      "<div class='row'><button id='again' class='btn primary'>↺ PLAY AGAIN</button>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
    document.getElementById("again").addEventListener("click", start);
  }
})();
