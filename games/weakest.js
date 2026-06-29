/* WEAKEST LINK — fast review. Answer in a chain; bank before a wrong answer
   breaks it. Beat the clock. Content: pack.questions[]. */
(function () {
  const GAME = "weakest";
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  const CHAIN = [50, 100, 200, 450, 700, 1000, 1500, 2000];
  const TIME = 60;
  let pack, queue, banked, chain, idx, timeLeft, timer, locked;

  Engine.loadPack().then(p => {
    pack = p; packName.textContent = p.title;
    if (!p.questions || !p.questions.length) { stage.innerHTML = "<p>No questions in this pack.</p>"; return; }
    intro();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function intro() {
    stage.innerHTML = "<div class='gameover'><h2>WEAKEST LINK</h2>" +
      "<p>Answer fast to climb the chain. <b>BANK</b> to lock in your money before a wrong answer wipes the chain. " +
      "You have " + TIME + " seconds.</p>" +
      "<div class='row'><button id='go' class='btn primary'>▶ START ROUND</button></div></div>";
    document.getElementById("go").addEventListener("click", start);
  }

  function start() {
    queue = Engine.shuffle(pack.questions); banked = 0; chain = 0; idx = 0; timeLeft = TIME; locked = false;
    clearInterval(timer);
    timer = setInterval(() => { timeLeft -= 0.1; if (timeLeft <= 0) { timeLeft = 0; endRound(); } else paintTimer(); }, 100);
    render();
  }

  function renderScore() {
    scorebar.innerHTML = "<span class='pill'>BANKED <b>" + banked + "</b></span>" +
      "<span class='pill'>CHAIN <b>" + (chain ? CHAIN[chain - 1] : 0) + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function paintTimer() {
    const el = document.getElementById("tbar");
    if (el) el.style.width = (timeLeft / TIME * 100) + "%";
    const t = document.getElementById("tnum"); if (t) t.textContent = Math.ceil(timeLeft) + "s";
  }

  function render() {
    renderScore();
    if (idx >= queue.length) queue = Engine.shuffle(pack.questions).concat(), idx = 0;
    const item = queue[idx];
    const links = CHAIN.map((v, i) => "<span class='wl-link" + (i < chain ? " on" : "") + "'>" + v + "</span>").join("");
    const keys = ["A", "B", "C", "D"];
    stage.innerHTML =
      "<div class='wl-timer'><span id='tbar' style='width:" + (timeLeft / TIME * 100) + "%'></span></div>" +
      "<div style='display:flex;justify-content:space-between;margin-bottom:8px'><span class='wl-bank'>NEXT BANK: " +
      CHAIN[Math.min(chain, CHAIN.length - 1)] + "</span><span id='tnum'>" + Math.ceil(timeLeft) + "s</span></div>" +
      "<div class='wl-chain'>" + links + "</div>" +
      "<p class='q-text'>" + item.q + "</p>" +
      "<div class='q-options'>" + item.options.map((o, i) =>
        "<button class='q-opt' data-i='" + i + "'><span class='key'>" + keys[i] + "</span><span>" + o + "</span></button>").join("") + "</div>" +
      "<div style='margin-top:14px'><button id='bank' class='btn primary'>🏦 BANK " + (chain ? CHAIN[chain - 1] : 0) + "</button></div>";
    stage.querySelectorAll(".q-opt").forEach(b => b.addEventListener("click", () => answer(parseInt(b.dataset.i, 10))));
    document.getElementById("bank").addEventListener("click", bank);
  }

  function bank() {
    if (locked || !chain) return;
    banked += CHAIN[chain - 1]; chain = 0; Engine.sfx.win(); render();
  }

  function answer(i) {
    if (locked) return;
    const item = queue[idx];
    if (i === item.answer) { chain = Math.min(chain + 1, CHAIN.length); Engine.sfx.good(); }
    else { chain = 0; Engine.sfx.bad(); Engine.shake(stage); }
    idx++;
    render();
  }

  function endRound() {
    clearInterval(timer);
    locked = true;
    const total = banked + (chain ? CHAIN[chain - 1] : 0);
    const isBest = Engine.recordPlay(GAME, pack.id, total);
    Engine.sfx.win(); Engine.confetti(50);
    stage.innerHTML = "<div class='gameover'><h2>TIME!</h2><div class='big'>" + total + "</div>" +
      "<p>banked " + banked + " + chain " + (chain ? CHAIN[chain - 1] : 0) + (isBest ? " · ★ NEW BEST!" : "") + "</p>" +
      "<div class='row'><button id='again' class='btn primary'>↺ PLAY AGAIN</button>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
    document.getElementById("again").addEventListener("click", start);
  }
})();
