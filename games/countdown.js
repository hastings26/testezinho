/* COUNTDOWN — words and numbers. Unscramble the topic's terms, then a classic
   numbers round. Content: pack.terms[] (letters); numbers are self-generated. */
(function () {
  const GAME = "countdown";
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  let pack, rounds, ri, score;

  Engine.loadPack().then(p => {
    pack = p; packName.textContent = p.title;
    const terms = (p.terms || []).map(t => (t.term || "").toUpperCase().replace(/[^A-Z]/g, ""))
      .filter(w => w.length >= 4 && w.length <= 9);
    if (terms.length < 3) { stage.innerHTML = "<p>Not enough terms for Countdown.</p>"; return; }
    start(terms);
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function start(terms) {
    rounds = Engine.sample(terms, Math.min(4, terms.length)).map(w => ({ type: "letters", word: w }));
    rounds.push(makeNumbers());
    ri = 0; score = 0; render();
  }

  function makeNumbers() {
    const bigs = Engine.sample([25, 50, 75, 100], 1 + Math.floor(Math.random() * 2));
    const smalls = [];
    while (smalls.length < 6 - bigs.length) smalls.push(1 + Math.floor(Math.random() * 10));
    const tiles = Engine.shuffle(bigs.concat(smalls));
    const target = 101 + Math.floor(Math.random() * 899);
    return { type: "numbers", tiles, target };
  }

  function renderScore() {
    scorebar.innerHTML = "<span class='pill'>SCORE <b>" + score + "</b></span>" +
      "<span class='pill'>ROUND <b>" + (ri + 1) + "/" + rounds.length + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function render() {
    renderScore();
    if (ri >= rounds.length) return finish();
    const r = rounds[ri];
    if (r.type === "letters") renderLetters(r); else renderNumbers(r);
  }

  function renderLetters(r) {
    if (!r.scram) { do { r.scram = Engine.shuffle(r.word.split("")).join(""); } while (r.scram === r.word); }
    const tiles = r.scram.split("").map(ch => "<div class='cd-tile'>" + ch + "</div>").join("");
    stage.innerHTML = "<p class='wd-hint'>LETTERS ROUND — unscramble the term (" + r.word.length + " letters)</p>" +
      "<div class='cd-tiles'>" + tiles + "</div>" +
      "<input class='cd-input' id='ans' maxlength='" + r.word.length + "' placeholder='your word' autocomplete='off'>" +
      "<div style='text-align:center'><button id='go' class='btn primary'>✓ SUBMIT</button></div><div id='fb'></div>";
    const inp = document.getElementById("ans"); inp.focus();
    inp.addEventListener("keydown", e => { if (e.key === "Enter") submitLetters(); });
    document.getElementById("go").addEventListener("click", submitLetters);
  }

  function submitLetters() {
    const r = rounds[ri];
    const val = (document.getElementById("ans").value || "").toUpperCase().trim();
    const fb = document.getElementById("fb");
    if (val === r.word) { score += r.word.length; Engine.sfx.good(); Engine.confetti(20); fb.className = "toast good"; fb.innerHTML = "✓ +" + r.word.length + " points!"; }
    else { Engine.sfx.bad(); fb.className = "toast bad"; fb.innerHTML = "✗ The word was <b>" + r.word + "</b>."; }
    fb.innerHTML += " <button id='next' class='btn primary' style='margin-left:8px'>NEXT ►</button>";
    document.getElementById("next").addEventListener("click", () => { ri++; render(); });
  }

  function renderNumbers(r) {
    const tiles = r.tiles.map(n => "<div class='cd-tile' style='width:64px'>" + n + "</div>").join("");
    stage.innerHTML = "<p class='wd-hint'>NUMBERS ROUND — reach the target using + − × ÷ and the tiles (each once)</p>" +
      "<div class='gameover'><div class='big' style='margin:6px 0'>" + r.target + "</div></div>" +
      "<div class='cd-tiles'>" + tiles + "</div>" +
      "<input class='cd-input' id='expr' placeholder='e.g. (50+3)*7' autocomplete='off' style='text-transform:none'>" +
      "<div style='text-align:center'><button id='go' class='btn primary'>✓ CHECK</button></div><div id='fb'></div>";
    const inp = document.getElementById("expr"); inp.focus();
    inp.addEventListener("keydown", e => { if (e.key === "Enter") submitNumbers(); });
    document.getElementById("go").addEventListener("click", submitNumbers);
  }

  function submitNumbers() {
    const r = rounds[ri];
    const raw = (document.getElementById("expr").value || "").replace(/×/g, "*").replace(/÷/g, "/").replace(/[−–]/g, "-");
    const fb = document.getElementById("fb");
    fb.className = "toast bad";
    if (!/^[0-9+\-*/() ]+$/.test(raw) || !raw.trim()) { fb.textContent = "Use only numbers and + − × ÷ ( )."; Engine.sfx.bad(); return appendNext(); }
    const used = raw.match(/\d+/g).map(Number);
    const avail = r.tiles.slice();
    for (const u of used) { const k = avail.indexOf(u); if (k < 0) { fb.textContent = "You can only use the tiles shown, each once."; Engine.sfx.bad(); return appendNext(); } avail.splice(k, 1); }
    let val;
    try { val = Function('"use strict";return (' + raw + ')')(); } catch (e) { val = NaN; }
    if (typeof val !== "number" || !isFinite(val)) { fb.textContent = "That expression doesn't compute."; Engine.sfx.bad(); return appendNext(); }
    const diff = Math.abs(val - r.target);
    let pts = diff === 0 ? 50 : diff <= 5 ? 30 : diff <= 10 ? 15 : 0;
    score += pts;
    if (pts > 0) { Engine.sfx.good(); if (diff === 0) Engine.confetti(30); fb.className = "toast good"; fb.textContent = "= " + val + " · +" + pts + " points" + (diff ? " (off by " + diff + ")" : " — spot on!"); }
    else { Engine.sfx.bad(); fb.textContent = "= " + val + " · off by " + diff + ", no points."; }
    appendNext();
  }

  function appendNext() {
    const fb = document.getElementById("fb");
    if (document.getElementById("next")) return;
    fb.innerHTML += " <button id='next' class='btn primary' style='margin-left:8px'>FINISH ►</button>";
    document.getElementById("next").addEventListener("click", () => { ri++; render(); });
  }

  function finish() {
    const isBest = Engine.recordPlay(GAME, pack.id, score);
    Engine.sfx.win(); Engine.confetti(60);
    stage.innerHTML = "<div class='gameover'><h2>THAT'S COUNTDOWN</h2><div class='big'>" + score + "</div>" +
      "<p>points" + (isBest ? " · ★ NEW BEST!" : "") + "</p>" +
      "<div class='row'><button id='again' class='btn primary'>↺ PLAY AGAIN</button>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
    document.getElementById("again").addEventListener("click", () => location.reload());
  }
})();
