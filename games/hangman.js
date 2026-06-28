/* HANGMAN — vocabulary recall over a topic's key terms.
   Survival: solve words to build a streak; lose a word to end the run.
   Content: pack.terms[] = { term, hint }. */
(function () {
  const GAME = "hangman";
  const MAX_WRONG = 6;
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  const GALLOWS = [
    " +---+\n |   |\n     |\n     |\n     |\n=====",
    " +---+\n |   |\n O   |\n     |\n     |\n=====",
    " +---+\n |   |\n O   |\n |   |\n     |\n=====",
    " +---+\n |   |\n O   |\n/|   |\n     |\n=====",
    " +---+\n |   |\n O   |\n/|\\  |\n     |\n=====",
    " +---+\n |   |\n O   |\n/|\\  |\n/    |\n=====",
    " +---+\n |   |\n O   |\n/|\\  |\n/ \\  |\n====="
  ];

  let pack, words, target, guessed, wrong, solved, over;

  Engine.loadPack().then(p => {
    pack = p;
    packName.textContent = p.title;
    words = (p.terms || [])
      .map(t => ({ word: (t.term || "").toUpperCase(), hint: t.hint || "" }))
      .filter(t => /[A-Z]/.test(t.word));
    if (!words.length) { stage.innerHTML = "<p>No terms in this pack.</p>"; return; }
    start();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function start() { solved = 0; words = Engine.shuffle(words); nextWord(); }

  function nextWord() {
    target = words[solved % words.length];
    guessed = {}; wrong = 0; over = false;
    render();
  }

  function renderScore() {
    scorebar.innerHTML =
      "<span class='pill'>SOLVED <b>" + solved + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function revealed() {
    return target.word.split("").every(ch => ch === " " || guessed[ch]);
  }

  function render() {
    renderScore();
    const slots = target.word.split("").map(ch => {
      if (ch === " ") return "<span class='hm-slot space'></span>";
      const show = guessed[ch] || over;
      return "<span class='hm-slot'>" + (show ? ch : "") + "</span>";
    }).join("");

    const hearts = "♥".repeat(MAX_WRONG - wrong) + "<span style='color:var(--text-dim)'>" + "·".repeat(wrong) + "</span>";

    const keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(ch => {
      let cls = "hm-key";
      if (guessed[ch]) cls += target.word.includes(ch) ? " right" : " wrong";
      const dis = guessed[ch] || over ? "disabled" : "";
      return "<button class='" + cls + "' data-k='" + ch + "' " + dis + ">" + ch + "</button>";
    }).join("");

    stage.innerHTML =
      "<div class='hm-wrap'>" +
        "<pre class='hm-gallows'>" + GALLOWS[wrong] + "</pre>" +
        "<div style='flex:1;min-width:240px'>" +
          "<div class='wd-hint'>HINT: " + target.hint + "</div>" +
          "<div class='hm-word'>" + slots + "</div>" +
          "<div class='hm-lives'>" + hearts + "</div>" +
        "</div>" +
      "</div>" +
      "<div class='hm-keys'>" + keys + "</div>" +
      "<div id='fb'></div>";

    stage.querySelectorAll(".hm-key").forEach(b =>
      b.addEventListener("click", () => guess(b.dataset.k)));

    if (over) {
      const fb = document.getElementById("fb");
      if (revealed()) {
        fb.className = "toast good";
        fb.innerHTML = "✓ <b>" + target.word + "</b> — got it! " +
          "<button id='cont' class='btn primary' style='margin-left:10px'>NEXT WORD ►</button>";
        document.getElementById("cont").addEventListener("click", () => { solved++; nextWord(); });
      } else {
        fb.className = "toast bad";
        fb.innerHTML = "✗ The word was <b>" + target.word + "</b>. " +
          "<button id='again' class='btn primary' style='margin-left:10px'>↺ NEW RUN</button>";
        document.getElementById("again").addEventListener("click", start);
      }
    }
  }

  function guess(ch) {
    if (over || guessed[ch]) return;
    guessed[ch] = true;
    if (target.word.includes(ch)) {
      Engine.sfx.good();
      if (revealed()) { over = true; Engine.confetti(36); }
    } else {
      wrong++;
      Engine.sfx.bad();
      if (wrong >= MAX_WRONG) { over = true; Engine.setBest(GAME, pack.id, solved); Engine.sfx.lose(); }
      else Engine.shake(stage.querySelector(".hm-gallows"));
    }
    render();
  }

  document.addEventListener("keydown", e => {
    if (target && /^[a-zA-Z]$/.test(e.key)) guess(e.key.toUpperCase());
  });
})();
