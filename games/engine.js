/* ============================================================
   LEARNING GAMES LIBRARY — shared engine
   Every game is content-driven: it loads a topic "pack" and
   reuses these helpers, so a new topic = a new JSON file, not
   new code. Plain classic script, exposes window.Engine.
   ============================================================ */
(function () {
  "use strict";

  const DEFAULT_PACK = "ai-literacy";

  /* ---- query params (?pack=ai-literacy) ---- */
  function param(name, fallback) {
    const v = new URLSearchParams(location.search).get(name);
    return v == null || v === "" ? fallback : v;
  }

  /* ---- load a topic pack from /content ---- */
  async function loadPack(fallback) {
    const id = param("pack", fallback || DEFAULT_PACK);
    const res = await fetch("content/" + id + ".json", { cache: "no-cache" });
    if (!res.ok) throw new Error("Could not load pack: " + id);
    const pack = await res.json();
    pack.id = pack.id || id;
    return pack;
  }

  /* ---- array helpers ---- */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function sample(arr, n) { return shuffle(arr).slice(0, n); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ---- best-score persistence (per game + pack) ---- */
  function bestKey(game, pack) { return "lgl:best:" + game + ":" + pack; }
  function getBest(game, pack) {
    const v = parseInt(localStorage.getItem(bestKey(game, pack)) || "0", 10);
    return isNaN(v) ? 0 : v;
  }
  function setBest(game, pack, score) {
    const cur = getBest(game, pack);
    if (score > cur) { localStorage.setItem(bestKey(game, pack), String(score)); return true; }
    return false;
  }

  /* ---- tiny Web Audio synth (shared retro SFX) ---- */
  let actx = null;
  let muted = localStorage.getItem("lgl:muted") === "1";
  function ctx() {
    if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (actx && actx.state === "suspended") actx.resume();
    return actx;
  }
  function tone(freq, dur, type, when, gain) {
    if (muted) return;
    const c = ctx(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || "square";
    o.frequency.value = freq;
    const t = c.currentTime + (when || 0);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }
  const sfx = {
    good() { tone(660, 0.09, "square", 0); tone(990, 0.12, "square", 0.08); },
    bad() { tone(200, 0.18, "sawtooth", 0, 0.1); tone(150, 0.22, "sawtooth", 0.06, 0.1); },
    click() { tone(420, 0.05, "square", 0, 0.06); },
    win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, "square", i * 0.1)); },
    lose() { [392, 330, 262].forEach((f, i) => tone(f, 0.22, "sawtooth", i * 0.12, 0.09)); }
  };
  function setMuted(m) { muted = m; localStorage.setItem("lgl:muted", m ? "1" : "0"); }
  function isMuted() { return muted; }

  /* ---- visual flourishes ---- */
  function shake(el) {
    if (!el) return;
    el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake");
  }
  function confetti(count) {
    const colors = ["#ffd23f", "#4af6c3", "#ff5470", "#79f7d2", "#ffb24a", "#ffffff"];
    for (let i = 0; i < (count || 40); i++) {
      const p = document.createElement("div");
      p.className = "confetti";
      p.style.left = Math.random() * 100 + "vw";
      p.style.top = "-20px";
      p.style.background = colors[i % colors.length];
      p.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      document.body.appendChild(p);
      const dx = (Math.random() - 0.5) * 240;
      const dy = window.innerHeight + 60;
      const dur = 1100 + Math.random() * 900;
      p.animate(
        [{ transform: p.style.transform, opacity: 1 },
         { transform: "translate(" + dx + "px," + dy + "px) rotate(720deg)", opacity: 0.9 }],
        { duration: dur, easing: "cubic-bezier(.2,.6,.4,1)" }
      ).onfinish = () => p.remove();
    }
  }

  /* ---- standard top crumb bar wiring (sound toggle) ---- */
  function wireSoundToggle(btn) {
    if (!btn) return;
    const render = () => { btn.textContent = isMuted() ? "🔇 SFX" : "🔊 SFX"; };
    render();
    btn.addEventListener("click", () => { setMuted(!isMuted()); render(); if (!isMuted()) sfx.click(); });
  }

  window.Engine = {
    DEFAULT_PACK, param, loadPack,
    shuffle, sample, pick,
    getBest, setBest,
    sfx, setMuted, isMuted, wireSoundToggle,
    shake, confetti
  };
})();
