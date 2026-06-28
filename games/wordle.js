/* WORD RECALL — Wordle / Lingo style over a topic's key terms.
   Survival: keep solving words to build a streak; one miss ends the run.
   Content: pack.terms[] = { term, hint }. Terms 4–9 letters, A–Z only. */
(function () {
  const GAME = "wordle";
  const MAX_ROWS = 6;
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  let pack, words, target, rows, cur, solved, keyState, over;

  Engine.loadPack().then(p => {
    pack = p;
    packName.textContent = p.title;
    words = (p.terms || [])
      .map(t => (t.term || "").toUpperCase())
      .filter(w => /^[A-Z]+$/.test(w) && w.length >= 4 && w.length <= 9)
      .map(w => ({ word: w, hint: hintFor(p, w) }));
    if (!words.length) { stage.innerHTML = "<p>No suitable words in this pack.</p>"; return; }
    start();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function hintFor(p, w) { const t = p.terms.find(x => (x.term || "").toUpperCase() === w); return t ? t.hint : ""; }

  function start() { solved = 0; nextWord(true); }

  function nextWord(reshuffle) {
    if (reshuffle) words = Engine.shuffle(words);
    const used = solved % words.length;
    target = words[used];
    rows = []; cur = ""; over = false; keyState = {};
    render();
  }

  function renderScore() {
    scorebar.innerHTML =
      "<span class='pill'>SOLVED <b>" + solved + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function evaluate(guess, answer) {
    const res = Array(guess.length).fill("miss");
    const counts = {};
    for (const ch of answer) counts[ch] = (counts[ch] || 0) + 1;
    for (let i = 0; i < guess.length; i++) if (guess[i] === answer[i]) { res[i] = "hit"; counts[guess[i]]--; }
    for (let i = 0; i < guess.length; i++)
      if (res[i] !== "hit" && counts[guess[i]] > 0) { res[i] = "near"; counts[guess[i]]--; }
    return res;
  }

  function render() {
    renderScore();
    const len = target.word.length;
    let board = "<div class='wd-board'>";
    for (let r = 0; r < MAX_ROWS; r++) {
      board += "<div class='wd-row'>";
      const guess = rows[r];
      for (let c = 0; c < len; c++) {
        if (guess) {
          board += "<div class='wd-cell " + guess.res[c] + "'>" + guess.word[c] + "</div>";
        } else if (r === rows.length) {
          const ch = cur[c] || "";
          board += "<div class='wd-cell " + (ch ? "filled" : "") + "'>" + ch + "</div>";
        } else {
          board += "<div class='wd-cell'></div>";
        }
      }
      board += "</div>";
    }
    board += "</div>";

    stage.innerHTML =
      "<div class='wd-hint'>HINT: " + (target.hint || "?") + " · " + len + " letters</div>" +
      board + keyboardHtml() + "<div id='fb'></div>";

    stage.querySelectorAll(".key-btn").forEach(b =>
      b.addEventListener("click", () => handleKey(b.dataset.k)));

    if (over) {
      const fb = document.getElementById("fb");
      const won = rows.length && rows[rows.length - 1].word === target.word;
      if (won) {
        fb.className = "toast good";
        fb.innerHTML = "✓ SOLVED! <button id='cont' class='btn primary' style='margin-left:10px'>NEXT WORD ►</button>";
        document.getElementById("cont").addEventListener("click", () => { solved++; nextWord(false); });
      } else {
        fb.className = "toast bad";
        fb.innerHTML = "✗ The word was <b>" + target.word + "</b>. " +
          "<button id='again' class='btn primary' style='margin-left:10px'>↺ NEW RUN</button>";
        document.getElementById("again").addEventListener("click", start);
      }
    }
  }

  function keyboardHtml() {
    const rowsK = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
    let h = "<div class='keyboard'>";
    rowsK.forEach((rk, i) => {
      h += "<div class='krow'>";
      if (i === 2) h += "<button class='key-btn wide' data-k='ENTER'>ENTER</button>";
      for (const ch of rk) h += "<button class='key-btn " + (keyState[ch] || "") + "' data-k='" + ch + "'>" + ch + "</button>";
      if (i === 2) h += "<button class='key-btn wide' data-k='DEL'>DEL</button>";
      h += "</div>";
    });
    return h + "</div>";
  }

  function handleKey(k) {
    if (over) return;
    if (k === "ENTER") return submit();
    if (k === "DEL") { cur = cur.slice(0, -1); return render(); }
    if (/^[A-Z]$/.test(k) && cur.length < target.word.length) { cur += k; Engine.sfx.click(); render(); }
  }

  function submit() {
    if (cur.length !== target.word.length) { Engine.shake(stage.querySelector(".wd-board")); Engine.sfx.bad(); return; }
    const res = evaluate(cur, target.word);
    rows.push({ word: cur, res });
    for (let i = 0; i < cur.length; i++) {
      const ch = cur[i], rank = { miss: 0, near: 1, hit: 2 };
      if (rank[res[i]] >= rank[keyState[ch] || "miss"]) keyState[ch] = res[i];
    }
    const won = cur === target.word;
    cur = "";
    if (won) { over = true; Engine.sfx.good(); Engine.confetti(40); }
    else if (rows.length >= MAX_ROWS) { over = true; Engine.setBest(GAME, pack.id, solved); Engine.sfx.lose(); }
    render();
  }

  document.addEventListener("keydown", e => {
    if (!target) return;
    if (e.key === "Enter") handleKey("ENTER");
    else if (e.key === "Backspace") handleKey("DEL");
    else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
  });
})();
