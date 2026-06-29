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

  /* ---- shared question modal (used by board games to gate a move) ---- */
  function quizModal(item, cb) {
    const keys = ["A", "B", "C", "D", "E", "F"];
    const ov = document.createElement("div");
    ov.className = "qmodal";
    ov.innerHTML =
      "<div class='qmodal-card'>" +
      "<p class='qmodal-q'>" + item.q + "</p>" +
      "<div class='qmodal-opts'>" +
      item.options.map((o, i) => "<button class='q-opt' data-i='" + i + "'><span class='key'>" +
        keys[i] + "</span><span>" + o + "</span></button>").join("") +
      "</div><div class='qmodal-fb' id='qmFb'></div></div>";
    document.body.appendChild(ov);
    let done = false;
    ov.querySelectorAll(".q-opt").forEach(b => b.addEventListener("click", () => {
      if (done) return; done = true;
      const i = parseInt(b.dataset.i, 10);
      const correct = i === item.answer;
      ov.querySelectorAll(".q-opt").forEach(x => {
        x.disabled = true;
        const xi = parseInt(x.dataset.i, 10);
        if (xi === item.answer) x.classList.add("correct");
        else if (xi === i) x.classList.add("wrong");
      });
      const fb = ov.querySelector("#qmFb");
      fb.className = "qmodal-fb " + (correct ? "good" : "bad");
      fb.textContent = correct ? "✓ Correct" : "✗ " + (item.explain || "Not quite.");
      if (correct) sfx.good(); else sfx.bad();
      setTimeout(() => { ov.remove(); cb(correct); }, correct ? 650 : 1500);
    }));
  }

  /* ============================================================
     PROGRESSION — XP, levels, streaks, badges, daily quests.
     Every game calls recordPlay() at the end of a run; this is the
     spine that turns 24 games into one platform.
     ============================================================ */
  const XP_PER_LEVEL = 250;

  const BADGES = [
    { id: "first", icon: "👣", name: "First Steps", desc: "Finish your first game", test: p => p.plays >= 1 },
    { id: "five", icon: "🎲", name: "Getting Around", desc: "Play 5 different games", test: p => distinctGames(p) >= 5 },
    { id: "ten", icon: "🎯", name: "Dabbler", desc: "Play 10 different games", test: p => distinctGames(p) >= 10 },
    { id: "allgames", icon: "👑", name: "Master of Games", desc: "Play all 24 games", test: p => distinctGames(p) >= 24 },
    { id: "topics2", icon: "🧭", name: "Wanderer", desc: "Play 2 different topics", test: p => distinctTopics(p) >= 2 },
    { id: "topics4", icon: "🌍", name: "Globetrotter", desc: "Play 4 different topics", test: p => distinctTopics(p) >= 4 },
    { id: "streak3", icon: "🔥", name: "On a Roll", desc: "Keep a 3-day streak", test: p => (p.streak && p.streak.count) >= 3 },
    { id: "streak7", icon: "⚡", name: "Unstoppable", desc: "Keep a 7-day streak", test: p => (p.streak && p.streak.count) >= 7 },
    { id: "lvl5", icon: "🛡️", name: "Veteran", desc: "Reach level 5", test: p => levelFromXp(p.xp) >= 5 },
    { id: "lvl10", icon: "🏆", name: "Legend", desc: "Reach level 10", test: p => levelFromXp(p.xp) >= 10 },
    { id: "plays25", icon: "💪", name: "Committed", desc: "Finish 25 games", test: p => p.plays >= 25 },
    { id: "plays100", icon: "💯", name: "Centurion", desc: "Finish 100 games", test: p => p.plays >= 100 },
    { id: "bests10", icon: "📈", name: "Record Breaker", desc: "Set a best in 10 games", test: p => Object.keys(p.bests || {}).length >= 10 },
    { id: "perfect5", icon: "✨", name: "Flawless", desc: "Score 5 perfect runs", test: p => (p.perfects || 0) >= 5 },
    { id: "xp2500", icon: "💎", name: "XP Hoarder", desc: "Earn 2,500 total XP", test: p => p.xp >= 2500 }
  ];

  const QUEST_POOL = [
    { id: "play3", desc: "Play 3 games today", goal: 3, reward: 50, prog: d => d.plays },
    { id: "earn150", desc: "Earn 150 XP today", goal: 150, reward: 60, prog: d => d.xp },
    { id: "newgame", desc: "Try a game you've never played", goal: 1, reward: 40, prog: d => d.newGames },
    { id: "topics2", desc: "Play 2 different topics today", goal: 2, reward: 50, prog: d => Object.keys(d.topics || {}).length },
    { id: "play5", desc: "Play 5 games today", goal: 5, reward: 80, prog: d => d.plays }
  ];

  function distinctGames(p) { return Object.keys(p.games || {}).length; }
  function distinctTopics(p) { return Object.keys(p.topics || {}).length; }
  function levelFromXp(xp) { return 1 + Math.floor((xp || 0) / XP_PER_LEVEL); }
  function levelProgress(xp) {
    const lvl = levelFromXp(xp), into = (xp || 0) - (lvl - 1) * XP_PER_LEVEL;
    return { level: lvl, into, need: XP_PER_LEVEL, pct: Math.round(into / XP_PER_LEVEL * 100) };
  }

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function dayDiff(a, b) {
    if (!a || !b) return 99;
    return Math.round((new Date(b) - new Date(a)) / 86400000);
  }
  function dayIndex() { return Math.floor(new Date().setHours(0,0,0,0) / 86400000); }

  function blankProfile() {
    return { xp: 0, plays: 0, games: {}, topics: {}, bests: {}, perfects: 0,
      streak: { count: 0, last: null }, badges: {}, daily: null };
  }
  function getProfile() {
    try { return Object.assign(blankProfile(), JSON.parse(localStorage.getItem("lgl:profile") || "{}")); }
    catch (e) { return blankProfile(); }
  }
  function saveProfile(p) { localStorage.setItem("lgl:profile", JSON.stringify(p)); }

  function dailyQuests(p) {
    const today = todayStr();
    if (!p.daily || p.daily.date !== today) {
      const idx = dayIndex();
      const picks = [QUEST_POOL[idx % QUEST_POOL.length], QUEST_POOL[(idx + 2) % QUEST_POOL.length], QUEST_POOL[(idx + 4) % QUEST_POOL.length]];
      const seen = {}, quests = [];
      picks.forEach(q => { if (!seen[q.id]) { seen[q.id] = 1; quests.push(q.id); } });
      p.daily = { date: today, plays: 0, xp: 0, topics: {}, newGames: 0, quests, claimed: {} };
    }
    return p.daily.quests.map(id => {
      const def = QUEST_POOL.find(q => q.id === id);
      const progress = Math.min(def.prog(p.daily), def.goal);
      return { id, desc: def.desc, goal: def.goal, reward: def.reward, progress, done: progress >= def.goal, claimed: !!p.daily.claimed[id] };
    });
  }

  // returns { isBest, xpGain, leveledTo (or null), newBadges:[], questsDone:[] }
  function recordPlay(game, packId, score, opts) {
    opts = opts || {};
    const p = getProfile();
    const before = levelFromXp(p.xp);
    const isBest = setBest(game, packId, score);
    const isNewGame = !p.games[game];

    p.plays++;
    p.games[game] = (p.games[game] || 0) + 1;
    p.topics[packId] = true;
    if (isBest && score > 0) p.bests[game + ":" + packId] = true;
    if (opts.perfect) p.perfects = (p.perfects || 0) + 1;

    const xpGain = 15 + Math.min(Math.max(0, Math.round(score)), 100) + (isBest ? 25 : 0) + (opts.perfect ? 30 : 0);
    p.xp += xpGain;

    // streak
    const today = todayStr();
    if (p.streak.last !== today) {
      p.streak.count = dayDiff(p.streak.last, today) === 1 ? (p.streak.count || 0) + 1 : 1;
      p.streak.last = today;
    }

    // daily counters
    dailyQuests(p); // ensures p.daily exists for today
    p.daily.plays++; p.daily.xp += xpGain; p.daily.topics[packId] = true;
    if (isNewGame) p.daily.newGames++;

    // claim finished quests (award reward once)
    const questsDone = [];
    dailyQuests(p).forEach(q => {
      if (q.done && !p.daily.claimed[q.id]) { p.daily.claimed[q.id] = true; p.xp += q.reward; questsDone.push(q); }
    });

    // badges
    const newBadges = [];
    BADGES.forEach(b => { if (!p.badges[b.id] && b.test(p)) { p.badges[b.id] = true; newBadges.push(b); } });

    const after = levelFromXp(p.xp);
    saveProfile(p);

    // surface it
    showXp(xpGain);
    questsDone.forEach(q => banner("✓ DAILY QUEST", q.desc + "  +" + q.reward + " XP", "#4af6c3"));
    if (after > before) banner("★ LEVEL UP ★", "You reached level " + after, "#ffd23f");
    newBadges.forEach(b => banner("🏅 BADGE UNLOCKED", b.icon + " " + b.name, "#79f7d2"));

    return { isBest, xpGain, leveledTo: after > before ? after : null, newBadges, questsDone };
  }

  /* ---- progression UI: XP toast + banners ---- */
  function progLayer() {
    let el = document.getElementById("lglProg");
    if (!el) { el = document.createElement("div"); el.id = "lglProg"; el.className = "lgl-prog"; document.body.appendChild(el); }
    return el;
  }
  function showXp(n) {
    const t = document.createElement("div");
    t.className = "lgl-xp"; t.textContent = "+" + n + " XP";
    progLayer().appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }
  function banner(title, sub, color) {
    const b = document.createElement("div");
    b.className = "lgl-banner"; b.style.borderColor = color;
    b.innerHTML = "<div class='lgl-banner-t' style='color:" + color + "'>" + title + "</div><div class='lgl-banner-s'>" + sub + "</div>";
    progLayer().appendChild(b);
    if (!isMuted()) sfx.win();
    setTimeout(() => { b.style.opacity = "0"; setTimeout(() => b.remove(), 400); }, 2600);
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
    shake, confetti, quizModal,
    // progression
    recordPlay, getProfile, saveProfile, dailyQuests,
    levelFromXp, levelProgress, BADGES
  };
})();
