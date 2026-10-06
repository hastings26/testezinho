/* RED TEAM — break the AI. Flag every flawed claim in its output, then submit.
   Content: pack.redteam[] = { context, claims:[{ text, flawed, note }] }. */
(function () {
  const GAME = "redteam";
  const stage = document.getElementById("stage");
  const scorebar = document.getElementById("scorebar");
  const packName = document.getElementById("packName");
  Engine.wireSoundToggle(document.getElementById("soundBtn"));

  let pack, rounds, idx, score, flagged, revealed;

  Engine.loadPack().then(p => {
    pack = p; packName.textContent = p.title;
    if (!p.redteam || !p.redteam.length) return notAvailable();
    start();
  }).catch(e => { stage.innerHTML = "<p class='toast bad'>" + e.message + "</p>"; });

  function notAvailable() {
    scorebar.innerHTML = "";
    stage.innerHTML = "<div class='gameover'><h2>NOT YET FOR THIS TOPIC</h2>" +
      "<p>“" + pack.title + "” has no red-team rounds yet.</p>" +
      "<div class='row'><a class='btn primary' href='redteam.html?pack=ai-literacy'>PLAY THE AI LITERACY SET</a>" +
      "<a class='btn' href='index.html'>LIBRARY</a></div></div>";
  }

  function start() { rounds = Engine.shuffle(pack.redteam); idx = 0; score = 0; load(); }
  function load() { flagged = new Set(); revealed = false; render(); }

  function renderScore() {
    scorebar.innerHTML = "<span class='pill'>SCORE <b>" + score + "</b></span>" +
      "<span class='pill'>ROUND <b>" + (idx + 1) + "/" + rounds.length + "</b></span>" +
      "<span class='pill'>BEST <b>" + Engine.getBest(GAME, pack.id) + "</b></span>";
  }

  function render() {
    renderScore();
    const r = rounds[idx];
    const claims = r.claims.map((c, i) => {
      let cls = "claim";
      if (revealed) {
        if (c.flawed) cls += " flag";
        else if (flagged.has(i)) cls += " missed";
        else cls += " safe";
      } else if (flagged.has(i)) cls += " flag";
      const mark = revealed ? (c.flawed ? "⚠ FLAW — " : "✓ OK — ") + c.note : (flagged.has(i) ? "🚩 flagged" : "click to flag");
      return "<button class='" + cls + "' data-i='" + i + "'>" + c.text +
        "<div style='margin-top:6px;font-size:16px;color:var(--text-dim)'>" + mark + "</div></button>";
    }).join("");
    stage.innerHTML = "<p class='q-text'>🔴 " + r.context + "<br><span style='font-size:20px;color:var(--text-muted)'>Flag every claim that's wrong, unfounded, or an overclaim.</span></p>" +
      claims +
      "<div style='margin-top:14px'>" + (revealed ?
        "<button id='next' class='btn primary'>" + (idx + 1 < rounds.length ? "NEXT ROUND ►" : "SEE RESULTS ►") + "</button>" :
        "<button id='submit' class='btn primary'>✓ SUBMIT FLAGS</button>") + "</div><div id='fb'></div>";
    stage.querySelectorAll(".claim").forEach(b => b.addEventListener("click", () => toggle(parseInt(b.dataset.i, 10))));
    const s = document.getElementById("submit"); if (s) s.addEventListener("click", submit);
    const n = document.getElementById("next"); if (n) n.addEventListener("click", () => { idx++; idx < rounds.length ? load() : finish(); });
  }

  function toggle(i) {
    if (revealed) return;
    if (flagged.has(i)) flagged.delete(i); else flagged.add(i);
    Engine.sfx.click(); render();
  }

  function submit() {
    revealed = true;
    const r = rounds[idx];
    let correct = 0;
    r.claims.forEach((c, i) => { if (c.flawed === flagged.has(i)) correct++; });
    score += correct;
    const perfect = correct === r.claims.length;
    if (perfect) { Engine.sfx.win(); Engine.confetti(40); } else Engine.sfx.bad();
    render();
    const fb = document.getElementById("fb");
    fb.className = "toast " + (perfect ? "good" : "bad");
    fb.textContent = perfect ? "✓ Every claim judged correctly!" : correct + " of " + r.claims.length + " judged correctly.";
  }

  function finish() {
    const isBest = Engine.recordPlay(GAME, pack.id, score);
    Engine.sfx.win(); Engine.confetti(60);
    stage.innerHTML = "<div class='gameover'><h2>RED TEAM REPORT</h2><div class='big'>" + score + "</div>" +
      "<p>claims judged correctly" + (isBest ? " · ★ NEW BEST!" : "") + "</p>" +
      "<div class='row'><button id='again' class='btn primary'>↺ AGAIN</button><a class='btn' href='index.html'>LIBRARY</a></div></div>";
    document.getElementById("again").addEventListener("click", start);
  }
})();
