/* MEMORY MATCH — pair each term with its meaning.
   Content: pack.terms[] = { term, hint }. Fewer moves = higher score. */
(function () {
  const GAME = "memory";
  const PAIRS = 6;
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  let pack, deck, flipped, matched, moves, busy, terms;

  Engine.loadPack().then(p => {
    pack = p;
    packName.textContent = p.title;
    terms = (p.terms || []).filter(t => t.term && t.hint);
    if (terms.length < 2) { stage.innerHTML = "<p>Need at least 2 terms in this pack.</p>"; return; }
    start();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function start() {
    const chosen = Engine.sample(terms, Math.min(PAIRS, terms.length));
    deck = [];
    chosen.forEach((t, i) => {
      deck.push({ id: i, type: "term", text: t.term.toUpperCase() });
      deck.push({ id: i, type: "def", text: t.hint });
    });
    deck = Engine.shuffle(deck);
    flipped = []; matched = 0; moves = 0; busy = false;
    render();
  }

  function renderScore() {
    scorebar.innerHTML =
      "<span class='pill'>MOVES <b>" + moves + "</b></span>" +
      "<span class='pill'>PAIRS <b>" + matched + "/" + (deck.length / 2) + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function render() {
    renderScore();
    const cards = deck.map((c, i) => {
      const flip = c.matched ? "done" : (flipped.includes(i) ? "up" : "");
      const faceCls = "mm-front" + (c.type === "term" ? " term" : "");
      return "<button class='mm-card " + flip + "' data-i='" + i + "'>" +
        "<div class='mm-inner'>" +
          "<div class='mm-face mm-back'><span>?</span></div>" +
          "<div class='mm-face " + faceCls + "'>" + c.text + "</div>" +
        "</div></button>";
    }).join("");
    stage.innerHTML = "<p class='wd-hint'>Match each term to its meaning</p><div class='mm-grid'>" + cards + "</div><div id='fb'></div>";
    stage.querySelectorAll(".mm-card").forEach(b =>
      b.addEventListener("click", () => flip(parseInt(b.dataset.i, 10))));
  }

  function flip(i) {
    if (busy) return;
    const card = deck[i];
    if (card.matched || flipped.includes(i)) return;
    flipped.push(i);
    Engine.sfx.click();
    if (flipped.length === 2) moves++;
    render();
    if (flipped.length === 2) {
      busy = true;
      const [a, b] = flipped;
      if (deck[a].id === deck[b].id && deck[a].type !== deck[b].type) {
        deck[a].matched = deck[b].matched = true;
        matched++;
        Engine.sfx.good();
        flipped = []; busy = false;
        render();
        if (matched === deck.length / 2) finish();
      } else {
        Engine.sfx.bad();
        setTimeout(() => { flipped = []; busy = false; render(); }, 850);
      }
    }
  }

  function finish() {
    const score = Math.round((deck.length / 2) / moves * 100); // 100 = perfect
    const isBest = Engine.recordPlay(GAME, pack.id, score, { perfect: score === 100 });
    renderScore();
    Engine.sfx.win(); Engine.confetti(60);
    const fb = document.getElementById("fb");
    fb.innerHTML =
      "<div class='gameover'><h2>ALL MATCHED!</h2>" +
      "<div class='big'>" + score + "</div>" +
      "<p>Cleared in " + moves + " moves" + (isBest ? " · ★ NEW BEST!" : "") +
      " <span style='color:var(--text-dim)'>(100 = perfect)</span></p>" +
      "<div class='row'><button id='again' class='btn primary'>↺ PLAY AGAIN</button>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
    document.getElementById("again").addEventListener("click", start);
  }
})();
