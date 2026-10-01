/* MILENE | CONTRACT MISSION — app (vanilla JS, hash routing, progresso em localStorage). */
(function () {
  "use strict";

  const { SKILLS, LEVELS, CONCEPTS, STATIONS, FLIPS, EPISODES, CAST, CASES, PEOPLE, TIC, INTERVIEW, AVATARS, AVATAR_FOR, VIDEOS, ytUrl, EXAMS, EXAM_PASS, LETTER } = window.MM;
  const $app = document.getElementById("app");
  const STORE_KEY = "milene-contract-mission-v1";

  const FORMATS = {
    map:  { label: "Mapa",       icon: "🗺️" },
    flip: { label: "Vire",       icon: "🔄" },
    pod:  { label: "Podcast",    icon: "🎧" },
    case: { label: "Caso",       icon: "💬" },
    tic:  { label: "TIC",        icon: "🧩" },
    card: { label: "Flashcard",  icon: "🃏" },
    iv:   { label: "Entrevista", icon: "🎤" },
    read: { label: "Leitura",    icon: "📖" },
    game: { label: "Jogo",       icon: "🎲" }
  };

  const MODULES = [
    { id: "missao", route: "#/missao", icon: "🗺️", name: "Minha Missão",        desc: "O que o cargo faz, estação por estação." },
    { id: "leitura", route: "#/leitura", icon: "📖", name: "Para ler",          desc: "Textos curtos e vídeos de apoio, no seu ritmo." },
    { id: "gossip", route: "#/gossip", icon: "🎧", name: "Podcast Contrato Gossip", desc: "6 episódios para ouvir no trajeto, com treino depois." },
    { id: "jogos",  route: "#/jogos",  icon: "🎲", name: "Joguinhos",           desc: "Teste rápido, sem compromisso. Jogue quando quiser." },
    { id: "flip",   route: "#/flip",   icon: "🔄", name: "Vire o Contrato",     desc: "Do lado de quem presta para o lado de quem contrata." },
    { id: "casos",  route: "#/casos",  icon: "💬", name: "Contract Cases",      desc: "Decisões reais, consequências reais." },
    { id: "tic",    route: "#/tic",    icon: "🧩", name: "TIC sem o Geek",      desc: "Só a tecnologia que o contrato precisa." },
    { id: "arena",  route: "#/arena",  icon: "🎤", name: "Interview Arena",     desc: "Técnica, cenário e competência." },
    { id: "fracos", route: "#/fracos", icon: "🎯", name: "Meus Pontos Fracos",  desc: "Onde revisar — e em qual formato." },
    { id: "prova",  route: "#/prova",  icon: "🏁", name: "Simulado final",      desc: "20 questões, 5 versões, com correção comentada." }
  ];

  /* ---------------- utilidades ---------------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const today = () => new Date().toISOString().slice(0, 10);
  const addDays = (d, n) => { const x = new Date(d + "T12:00:00"); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------------- sons (Web Audio, sem arquivos) ---------------- */
  const Sfx = {
    ctx: null,
    on() { return S.sound !== false; },
    tone(freq, start, dur, type, vol) {
      const c = this.ctx, o = c.createOscillator(), g = c.createGain();
      o.type = type || "sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, c.currentTime + start);
      g.gain.exponentialRampToValueAtTime(vol || 0.12, c.currentTime + start + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
      o.connect(g).connect(c.destination); o.start(c.currentTime + start); o.stop(c.currentTime + start + dur + 0.05);
    },
    play(kind) {
      if (!this.on()) return;
      try {
        this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
        if (this.ctx.state === "suspended") this.ctx.resume();
        const t = (f, s, d, ty, v) => this.tone(f, s, d, ty, v);
        if (kind === "ok") { t(660, 0, 0.12, "sine"); t(990, 0.09, 0.22, "sine"); }
        else if (kind === "no") { t(330, 0, 0.18, "triangle", 0.09); t(262, 0.12, 0.26, "triangle", 0.08); }
        else if (kind === "tap") { t(880, 0, 0.06, "sine", 0.05); }
        else if (kind === "win") { [523, 659, 784, 1047].forEach((f, i) => t(f, i * 0.1, 0.3, "sine", 0.11)); }
        else if (kind === "level") { [392, 523, 659, 784, 1047, 1319].forEach((f, i) => t(f, i * 0.08, 0.35, "triangle", 0.1)); }
      } catch (e) { /* áudio indisponível */ }
    }
  };

  /* ---------------- estado ---------------- */
  const blank = () => ({
    xp: 0,
    skills: Object.fromEntries(Object.keys(SKILLS).map((k) => [k, 0])),
    done: {},
    concepts: {},
    cards: {},
    stories: {},
    streak: { last: null, count: 0 },
    rate: 1,
    last: null,
    audioPos: {},
    games: {},
    exams: { runs: {}, history: [], best: null },
    sound: true,
    examDate: null
  });
  let S = blank();
  try { const raw = localStorage.getItem(STORE_KEY); if (raw) S = Object.assign(blank(), JSON.parse(raw)); } catch (e) { /* armazenamento indisponível */ }
  if (!S.exams || !S.exams.runs) S.exams = { runs: {}, history: [], best: null };
  S.games = S.games || {}; S.audioPos = S.audioPos || {};
  if (!S.examDate && window.MM.EXAM_DATE) S.examDate = window.MM.EXAM_DATE;
  const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* ignora */ } };

  function touchStreak() {
    const t = today();
    if (S.streak.last === t) return;
    S.streak.count = S.streak.last === addDays(t, -1) ? S.streak.count + 1 : 1;
    S.streak.last = t;
    save();
  }

  const C = (id) => (S.concepts[id] = S.concepts[id] || { seen: {}, right: 0, wrong: 0 });
  function seen(ids, fmt) { (ids || []).forEach((id) => { if (CONCEPTS[id]) C(id).seen[fmt] = (C(id).seen[fmt] || 0) + 1; }); save(); }
  function result(ids, ok) { (ids || []).forEach((id) => { if (CONCEPTS[id]) C(id)[ok ? "right" : "wrong"]++; }); save(); }

  function award(xp, ids, why) {
    if (xp <= 0) return;
    touchStreak();
    const before = level().i;
    S.xp += xp;
    const skills = [...new Set((ids || []).map((id) => CONCEPTS[id] && CONCEPTS[id].skill).filter(Boolean))];
    const share = skills.length ? Math.round(xp / skills.length) : 0;
    skills.forEach((k) => (S.skills[k] += share));
    save();
    toast(`+${xp} XP${skills.length ? " · " + skills.map((k) => SKILLS[k].icon + " " + SKILLS[k].name).join(" ") : ""}${why ? " — " + why : ""}`);
    if (level().i > before) setTimeout(() => { Sfx.play("level"); toast(`🏆 Novo nível: ${level().title}`, "level"); }, 700);
    renderNav();
  }

  function level() {
    let i = 0;
    LEVELS.forEach((l, k) => { if (S.xp >= l.xp) i = k; });
    const cur = LEVELS[i], next = LEVELS[i + 1];
    const pct = next ? Math.round(((S.xp - cur.xp) / (next.xp - cur.xp)) * 100) : 100;
    return { i, title: cur.title, next, pct };
  }

  function mastery(id) {
    const c = S.concepts[id];
    if (!c) return 0;
    const fmts = Object.keys(c.seen).length;
    const boxes = CONCEPTS[id].cards.map((_, i) => (S.cards[id + ":" + i] || {}).box || 0);
    const boxAvg = boxes.reduce((a, b) => a + b, 0) / boxes.length;
    return clamp(Math.round(c.right * 14 + fmts * 7 + boxAvg * 9 - c.wrong * 9), 0, 100);
  }
  const touched = (id) => !!S.concepts[id];

  /* Índice: onde cada conceito aparece, por formato (base da estratégia de memória). */
  const WHERE = {};
  const addWhere = (ids, fmt, title, route) => (ids || []).forEach((id) => { (WHERE[id] = WHERE[id] || []).push({ fmt, title, route }); });
  STATIONS.forEach((s) => addWhere(s.concepts, "map", "Estação " + s.name, "#/missao/" + s.id));
  FLIPS.forEach((f) => addWhere(f.concepts, "flip", "Vire: " + f.title, "#/flip"));
  EPISODES.forEach((e) => addWhere(e.concepts, "pod", "Podcast: " + e.title, "#/gossip/" + e.id));
  CASES.forEach((c) => addWhere(c.concepts, "case", "Caso: " + c.title, "#/casos/" + c.id));
  TIC.forEach((t) => addWhere(t.concepts, "tic", "TIC: " + t.title, "#/tic"));
  Object.keys(CONCEPTS).forEach((id) => addWhere([id], "card", "Flashcards", "#/revisao/" + id));
  ["tecnica", "cenario", "competencia"].forEach((tr) => INTERVIEW[tr].forEach((q, i) => addWhere(q.concepts, "iv", "Entrevista", "#/arena/" + tr + "/" + i)));

  /* ---------------- UI helpers ---------------- */
  function toast(msg, kind) {
    const el = document.createElement("div");
    el.className = "toast " + (kind || "");
    el.textContent = msg;
    const box = document.getElementById("toasts");
    box.appendChild(el);
    while (box.children.length > 2) box.firstChild.remove();
    setTimeout(() => el.classList.add("out"), 2600);
    setTimeout(() => el.remove(), 3100);
  }

  const $modal = document.getElementById("modal");
  function openModal(html) {
    $modal.innerHTML = `<div class="modal-card"><button class="icon-btn modal-close" data-close aria-label="Fechar">✕</button>${html}</div>`;
    $modal.classList.remove("hidden");
    document.body.classList.add("no-scroll");
  }
  function closeModal() { Speech.stop(); $modal.classList.add("hidden"); $modal.innerHTML = ""; document.body.classList.remove("no-scroll"); }
  $modal.addEventListener("click", (e) => { if (e.target === $modal || e.target.closest("[data-close]")) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$modal.classList.contains("hidden")) closeModal(); });

  const chip = (id) => CONCEPTS[id] ? `<button class="chip" data-concept="${id}" style="--c:${SKILLS[CONCEPTS[id].skill].color}">${SKILLS[CONCEPTS[id].skill].icon} ${esc(CONCEPTS[id].name)}</button>` : "";
  const avatar = (key, cls) => { const a = AVATARS[AVATAR_FOR[key] || key]; return a ? `<img class="av ${cls || ""}" src="${a.src}" alt="${esc(a.alt)}" loading="lazy" decoding="async" />` : ""; };
  const videoLinks = (id) => (VIDEOS[id] || []).map((q) => `<a class="yt" href="${ytUrl(q)}" target="_blank" rel="noopener">▶ ${esc(q)}</a>`).join("");
  const skillTag = (k) => `<span class="skill-tag" style="--c:${SKILLS[k].color}">${SKILLS[k].icon} ${SKILLS[k].name}</span>`;

  function conceptModal(id, fmt) {
    const c = CONCEPTS[id];
    if (fmt) seen([id], fmt);
    const cov = Object.keys(FORMATS).map((f) => `<span class="dot ${S.concepts[id] && S.concepts[id].seen[f] ? "on" : ""}" title="${FORMATS[f].label}">${FORMATS[f].icon}</span>`).join("");
    const where = (WHERE[id] || []).filter((w) => w.fmt !== "card").slice(0, 6).map((w) => `<a href="${w.route}" data-close class="where">${FORMATS[w.fmt].icon} ${esc(w.title)}</a>`).join("");
    openModal(`
      <div class="concept-head">${skillTag(c.skill)}<h2>${esc(c.name)}</h2><p class="lead">${esc(c.short)}</p></div>
      <ul class="points">${c.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
      <div class="bridge"><strong>🔄 Você já faz isso:</strong> ${esc(c.bridge)}</div>
      <div class="row gap">
        ${Speech.ok ? `<button class="btn ghost" data-say="${id}">🔊 Ouvir resumo</button>` : ""}
        <a class="btn ghost" href="#/revisao/${id}" data-close>🃏 Flashcards</a>
      </div>
      ${VIDEOS[id] ? `<h4 class="mini-h">Vídeos para assistir (YouTube)</h4><div class="yts">${videoLinks(id)}</div>` : ""}
      <h4 class="mini-h">Formatos em que você já viu este conceito</h4>
      <div class="coverage">${cov}</div>
      <h4 class="mini-h">Onde ele aparece</h4>
      <div class="wheres">${where}</div>`);
  }

  document.addEventListener("click", (e) => {
    const snd = e.target.closest("[data-sound]");
    if (snd) { S.sound = S.sound === false; save(); renderNav(); const hb = document.getElementById("homeSound"); if (hb) hb.textContent = S.sound ? "🔊" : "🔇"; if (S.sound) Sfx.play("ok"); toast(S.sound ? "Sons ligados" : "Sons desligados"); return; }
    const c = e.target.closest("[data-concept]");
    if (c) { e.preventDefault(); conceptModal(c.dataset.concept, c.dataset.fmt || null); return; }
    const say = e.target.closest("[data-say]");
    if (say) {
      const k = CONCEPTS[say.dataset.say];
      Speech.speakText(`${k.name}. ${k.short} ${k.points.join(" ")} Ponte com o que você já faz: ${k.bridge}`);
    }
  });

  /* Pergunta de múltipla escolha com feedback em 3 partes. */
  function quizHTML(check, key) {
    const answered = S.done[key];
    return `<div class="quiz" data-quiz="${key}">
      <p class="quiz-q">${esc(check.q)}</p>
      <div class="options">${check.options.map((o, i) => `<button class="option" data-opt="${i}" ${answered ? "disabled" : ""}>${esc(o[0])}</button>`).join("")}</div>
      <div class="quiz-fb"></div>
    </div>`;
  }
  function feedbackHTML(fb, ok, extra) {
    Sfx.play(ok ? "ok" : "no");
    if (ok) return `<div class="fb good">${avatar("acerto", "fb-av")}<div><strong>✅ Boa!</strong> ${esc(fb.melhor)}${extra || ""}</div></div>`;
    return `<div class="fb bad">${avatar("erro", "fb-av")}<div>
      <strong>Quase. Bora entender o raciocínio?</strong>
      ${fb.faltou ? `<p><span class="fb-k">🔎 Que informação faltou</span>${esc(fb.faltou)}</p>` : ""}
      ${fb.risco ? `<p><span class="fb-k">⚠️ Que risco passou batido</span>${esc(fb.risco)}</p>` : ""}
      <p><span class="fb-k">🧠 Raciocínio melhor</span>${esc(fb.melhor)}</p>${extra || ""}
    </div></div>`;
  }
  function bindQuiz(root, check, key, concepts, fmt, xpOk, onDone) {
    const box = root.querySelector(`[data-quiz="${key}"]`);
    if (!box) return;
    box.addEventListener("click", (e) => {
      const b = e.target.closest("[data-opt]");
      if (!b || b.disabled) return;
      const i = +b.dataset.opt, ok = check.options[i][1];
      box.querySelectorAll(".option").forEach((o, k) => { o.disabled = true; if (check.options[k][1]) o.classList.add("right"); });
      if (!ok) b.classList.add("wrong");
      box.querySelector(".quiz-fb").innerHTML = feedbackHTML(check.fb, ok);
      const first = !S.done[key];
      S.done[key] = ok ? 2 : 1;
      seen(concepts, fmt);
      result(concepts, ok);
      if (first) award(ok ? xpOk : 5, concepts);
      if (onDone) onDone(ok);
    });
  }

  /* ---------------- áudio (Web Speech API) ---------------- */
  const Speech = {
    ok: "speechSynthesis" in window && "SpeechSynthesisUtterance" in window,
    voices: [],
    token: 0,
    load() {
      if (!this.ok) return;
      const pick = () => { this.voices = speechSynthesis.getVoices().filter((v) => /^pt(-|_)?BR/i.test(v.lang) || /^pt/i.test(v.lang)); };
      pick();
      speechSynthesis.onvoiceschanged = pick;
    },
    voiceFor(i) { return this.voices.length ? this.voices[i % this.voices.length] : null; },
    utter(text, opts) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "pt-BR";
      const v = this.voiceFor(opts.voice || 0);
      if (v) u.voice = v;
      u.pitch = opts.pitch || 1;
      u.rate = (opts.rate || 1) * S.rate;
      return u;
    },
    speakText(text) {
      if (!this.ok) return;
      this.stop();
      speechSynthesis.speak(this.utter(text, {}));
    },
    /* Lê uma sequência de falas, uma por vez, avisando a linha atual. */
    play(lines, from, onLine, onEnd) {
      if (!this.ok) return;
      this.stop();
      const tok = ++this.token;
      const castKeys = Object.keys(CAST);
      const step = (i) => {
        if (tok !== this.token) return;
        if (i >= lines.length) { onEnd && onEnd(); return; }
        const [who, text] = lines[i];
        const p = CAST[who];
        onLine && onLine(i);
        const u = this.utter(text, { voice: castKeys.indexOf(who), pitch: p.pitch, rate: p.rate });
        u.onend = () => step(i + 1);
        u.onerror = () => { if (tok === this.token) step(i + 1); };
        speechSynthesis.speak(u);
      };
      step(from || 0);
    },
    stop() { if (!this.ok) return; this.token++; speechSynthesis.cancel(); }
  };
  Speech.load();

  /* ---------------- navegação ---------------- */
  function renderNav() {
    const r = route;
    const items = [{ route: "#/", icon: "🏠", name: "Início" }].concat(MODULES).concat([{ route: "#/revisao", icon: "🃏", name: "Revisão rápida" }]);
    document.getElementById("sideNav").innerHTML = items.map((m) =>
      `<a href="${m.route}" class="${(m.route === "#/" ? r === "#/" || r === "" : r.startsWith(m.route)) ? "active" : ""}"><span>${m.icon}</span>${esc(m.name)}</a>`).join("") +
      `<button class="sound-toggle" data-sound type="button">${S.sound !== false ? "🔊 Sons ligados" : "🔇 Sons desligados"}</button>` +
      `<div class="side-xp"><div class="lvl">${esc(level().title)}</div><div class="bar"><i style="width:${level().pct}%"></i></div><small>${S.xp} XP · 🔥 ${S.streak.count} dia(s)</small></div>`;
    const tabs = [["#/", "🏠", "Início"], ["#/missao", "🗺️", "Missão"], ["#/leitura", "📖", "Ler"], ["#/gossip", "🎧", "Podcast"], ["#/jogos", "🎲", "Jogar"], ["#/fracos", "🎯", "Foco"]];
    document.getElementById("tabBar").innerHTML = tabs.map(([h, i, n]) =>
      `<a href="${h}" class="${(h === "#/" ? r === "#/" || r === "" : r.startsWith(h)) ? "active" : ""}"><span>${i}</span><small>${n}</small></a>`).join("");
  }

  const routes = [
    [/^#?\/?$/, home],
    [/^#\/missao\/([\w-]+)$/, (m) => station(m[1])],
    [/^#\/missao$/, missao],
    [/^#\/flip$/, flips],
    [/^#\/gossip\/([\w-]+)\/treino$/, (m) => episodeTraining(m[1])],
    [/^#\/gossip\/([\w-]+)$/, (m) => episode(m[1])],
    [/^#\/jogos\/pares\/([\w-]+)$/, (m) => gamePairs(m[1])],
    [/^#\/gossip$/, gossip],
    [/^#\/casos\/([\w-]+)$/, (m) => caseView(m[1])],
    [/^#\/casos$/, cases],
    [/^#\/tic$/, tic],
    [/^#\/arena\/(\w+)\/(\d+)$/, (m) => arena(m[1], +m[2])],
    [/^#\/arena\/(\w+)$/, (m) => arena(m[1])],
    [/^#\/arena$/, () => arena("tecnica")],
    [/^#\/fracos$/, weak],
    [/^#\/leitura\/([\w-]+)$/, (m) => reading(m[1])],
    [/^#\/leitura$/, readingList],
    [/^#\/jogos\/relampago$/, gameFlash],
    [/^#\/jogos\/pares$/, gamePairs],
    [/^#\/jogos\/ordem$/, gameOrder],
    [/^#\/jogos$/, games],
    [/^#\/prova\/(v\d)\/resultado$/, (m) => examResult(m[1])],
    [/^#\/prova\/(v\d)$/, (m) => exam(m[1])],
    [/^#\/prova$/, exams],
    [/^#\/certificado$/, certificate],
    [/^#\/revisao\/([\w-]+)$/, (m) => review(m[1])],
    [/^#\/revisao$/, () => review()]
  ];
  let currentAudio = null;
  const audioFailed = {};
  function router() {
    Speech.stop();
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
    clearInterval(arenaTimer);
    const h = route;
    let matched = false;
    for (const [re, fn] of routes) { const m = h.match(re); if (m) { fn(m); matched = true; break; } }
    if (!matched) home();
    if (h !== "#/" && h !== "" && matched) {
      const t = $app.querySelector(".page-head h1");
      let title = "";
      if (t) { const c = t.cloneNode(true); c.querySelectorAll(".h-icon").forEach((x) => x.remove()); title = c.textContent.trim(); }
      S.last = { route: h, title, at: Date.now() };
      save();
    }
    renderNav();
    window.scrollTo(0, 0);
    parallax();
    $app.focus({ preventScroll: true });
  }
  /* Navegação interna: funciona também dentro de páginas incorporadas, onde o hash da URL pode não mudar. */
  let route = location.hash || "#/";
  let arenaTimer = null;
  function go(r) {
    route = r;
    try { if (location.hash !== r) history.pushState(null, "", r); } catch (e) { /* frame sem histórico */ }
    router();
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#/"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    go(a.getAttribute("href"));
  });
  const syncFromUrl = () => { const h = location.hash || "#/"; if (h !== route) { route = h; router(); } };
  window.addEventListener("hashchange", syncFromUrl);
  window.addEventListener("popstate", syncFromUrl);

  const header = (icon, title, sub, back) => {
    const key = (route.split("/")[1] || "home");
    return `<header class="page-head has-av"><div class="ph-text"><a href="${back ? back[0] : "#/"}" class="back">← ${back ? back[1] : "Início"}</a><h1><span class="h-icon">${icon}</span>${esc(title)}</h1>${sub ? `<p class="lead">${sub}</p>` : ""}</div>${avatar(key, "ph-av")}</header>`;
  };

  /* ---------------- recomendações ---------------- */
  function recommendations(n) {
    const ids = Object.keys(CONCEPTS);
    const ranked = ids.map((id) => ({ id, m: mastery(id), t: touched(id), wrong: (S.concepts[id] || {}).wrong || 0 }))
      .sort((a, b) => (b.wrong - a.wrong) || (a.t === b.t ? a.m - b.m : a.t ? -1 : 1));
    const out = [];
    for (const r of ranked) {
      const c = S.concepts[r.id] || { seen: {} };
      const w = (WHERE[r.id] || []).find((x) => !c.seen[x.fmt]) || (WHERE[r.id] || [])[0];
      if (w && !out.some((o) => o.route === w.route)) out.push({ id: r.id, m: r.m, ...w });
      if (out.length >= n) break;
    }
    return out;
  }

  function dueCards(onlyId, includeNew) {
    const t = today();
    const list = [];
    Object.keys(CONCEPTS).forEach((id) => {
      if (onlyId && id !== onlyId) return;
      CONCEPTS[id].cards.forEach((c, i) => {
        const st = S.cards[id + ":" + i];
        if (onlyId || (st ? st.due <= t : includeNew || touched(id))) list.push({ id, i, q: c[0], a: c[1], box: st ? st.box : 0 });
      });
    });
    return list;
  }

  /* ---------------- HOME ---------------- */
  function progressOf(mod) {
    const count = (pref, arr) => arr.filter((x) => S.done[pref + x.id]).length / arr.length;
    switch (mod) {
      case "missao": return count("st:", STATIONS);
      case "flip": return count("flip:", FLIPS);
      case "gossip": return count("ep:", EPISODES);
      case "casos": return count("case:", CASES);
      case "tic": return count("tic:", TIC);
      case "arena": { const all = [].concat(...["tecnica", "cenario", "competencia"].map((t) => INTERVIEW[t].map((_, i) => t + i))); return all.filter((k) => S.done["iv:" + k]).length / all.length; }
      case "leitura": return count("read:", STATIONS);
      case "jogos": return ["relampago", "pares", "ordem"].filter((k) => S.games[k] != null).length / 3;
      case "prova": return EXAMS.filter((e) => (S.exams.runs[e.id] || {}).best >= EXAM_PASS).length / EXAMS.length;
      case "fracos": { const ids = Object.keys(CONCEPTS); return ids.filter((id) => mastery(id) >= 60).length / ids.length; }
    }
    return 0;
  }

  const daysTo = (d) => { if (!d) return null; const a = new Date(today() + "T12:00:00"), b = new Date(d + "T12:00:00"); return Math.round((b - a) / 86400000); };
  function countdownHTML() {
    const n = daysTo(S.examDate);
    if (n == null) return `<div class="countdown set"><span class="cd-ic">📅</span><div><strong>Quando é a sua entrevista?</strong><small>Coloque a data e eu conto os dias com você.</small></div><input type="date" id="examDate" aria-label="Data da entrevista" /></div>`;
    const date = new Date(S.examDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
    const msg = n > 1 ? `faltam <b>${n}</b> dias` : n === 1 ? "é <b>amanhã</b>!" : n === 0 ? "é <b>hoje</b>! Você está pronta. 🌻" : "já passou. Que orgulho de você!";
    const daily = n > 0 ? Math.max(1, Math.ceil(Math.max(0, STATIONS.length - Object.keys(S.done).filter((k) => k.startsWith("st:")).length) / n)) : 0;
    return `<div class="countdown"><div class="cd-num">${n > 0 ? n : n === 0 ? "🎯" : "🎓"}<small>${n > 1 ? "dias" : n === 1 ? "dia" : ""}</small></div><div><strong>Entrevista em ${esc(date)}: ${msg}</strong><small>${n > 0 ? `Ritmo sugerido: ${daily} etapa(s) da jornada por dia + 1 episódio do podcast.` : ""} <button class="link-btn" id="changeDate" type="button">Mudar data</button></small></div></div>`;
  }
  function home() {
    const L = level();
    const nextStation = STATIONS.find((st) => !S.done["st:" + st.id]) || STATIONS[STATIONS.length - 1];
    const recs = recommendations(2);
    const due = dueCards().length;
    const h = new Date().getHours();
    const hello = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
    const last = S.last && S.last.route && S.last.route !== "#/" ? S.last : null;
    $app.innerHTML = `
      <section class="hero">
        <div class="hero-bg" aria-hidden="true">
          <span class="petal p1" data-depth="0.18"></span><span class="petal p2" data-depth="0.32"></span><span class="petal p3" data-depth="0.1"></span><span class="ring r1" data-depth="0.24"></span>
        </div>
        <div class="hero-copy">
          <p class="eyebrow">${hello}, Milene 🌻</p>
          <h1>Rumo a Analista de Contratos de TIC</h1>
          <p class="hero-sub">Você já domina o contrato do lado de quem presta o serviço. Aqui você aprende o lado de quem contrata, no seu ritmo e na ordem que quiser.</p>
          <div class="hero-cta">
            ${last ? `<a class="btn big" href="${last.route}">▶ Continuar: ${esc(last.title || "de onde parou")}</a>` : `<a class="btn big" href="#/missao/${nextStation.id}">▶ Começar pela jornada</a>`}
            <a class="btn ghost big" href="#/prova">🏁 Simulado final</a>
          </div>
          <div class="level">
            <div class="level-top"><strong>Nível ${L.i + 1} · ${esc(L.title)}</strong><span>${S.xp} XP${L.next ? ` · faltam ${L.next.xp - S.xp}` : ""}</span></div>
            <div class="bar big"><i style="width:${L.pct}%"></i></div>
          </div>
        </div>
        <div class="hero-art" data-depth="-0.08">${avatar("home", "hero-av")}</div>
      </section>

      <section class="home-top-row">${countdownHTML()}<button class="sound-big" data-sound type="button" aria-label="Ligar ou desligar sons"><span id="homeSound">${S.sound !== false ? "🔊" : "🔇"}</span><small>Sons</small></button></section>

      <section class="card podcast-strip">
        <div class="section-h"><h2>🎧 Podcast Contrato Gossip</h2><a href="#/gossip" class="link">Todos os episódios →</a></div>
        <p class="muted">Conversas de 16 a 27 minutos para ouvir no trajeto. Depois de cada uma, um treino rápido.</p>
        <div class="pod-row">${EPISODES.map((e, i) => `<a class="pod-tile ${S.done["ep:" + e.id] ? "is-done" : ""}" href="#/gossip/${e.id}"><span class="pod-n">EP ${i + 1}</span><strong>${esc(e.title)}</strong><small>${S.done["ep:" + e.id] ? "✓ ouvido" : S.audioPos[e.id] ? "▶ continuar" : "▶ ouvir"}${S.games["ep:" + e.id] != null ? " · treino " + S.games["ep:" + e.id] + "/6" : ""}</small></a>`).join("")}</div>
      </section>

      <section class="stats-row">
        <div class="stat"><strong>🔥 ${S.streak.count}</strong><small>dia(s) seguidos</small></div>
        <div class="stat"><strong>${Object.keys(S.done).filter((k) => k.startsWith("st:")).length}/${STATIONS.length}</strong><small>etapas da jornada</small></div>
        <a class="stat" href="#/revisao"><strong>${due}</strong><small>flashcards para hoje</small></a>
        <a class="stat" href="#/prova"><strong>${S.exams.best != null ? S.exams.best + "%" : "—"}</strong><small>melhor simulado</small></a>
      </section>

      ${certReady() ? `<a class="card cert-banner" href="#/certificado">${avatar("vitoria", "cb-av")}<div><p class="eyebrow">Missão cumprida</p><h2>Seu certificado está pronto 🎓</h2><p>Você passou nas 5 versões do simulado final. Toque para ver.</p></div></a>` : ""}
      <button class="card letter-card" id="openLetter" type="button">
        <span class="envelope" aria-hidden="true">💌</span>
        <span><strong>${esc(LETTER.title)}</strong><small>Do ${esc(LETTER.from)}, com carinho. Toque para abrir.</small></span>
      </button>

      <section class="card journey-card">
        <div class="section-h"><h2>Sua jornada</h2><a href="#/missao" class="link">Ver o mapa completo →</a></div>
        <div class="journey-strip">${STATIONS.map((st, i) => `
          <a href="#/missao/${st.id}" class="j-node ${S.done["st:" + st.id] ? "done" : st.id === nextStation.id ? "next" : ""}" title="${esc(st.name)}">
            <span class="j-ico">${S.done["st:" + st.id] ? "✓" : st.icon}</span><small>${esc(st.name)}</small>
          </a>${i < STATIONS.length - 1 ? '<span class="j-line"></span>' : ""}`).join("")}
        </div>
      </section>

      <section class="grid-2">
        <div class="card today">
          <h2>Se você tiver 10 minutos hoje</h2>
          <ol class="todo">
            <li><a href="#/missao/${nextStation.id}"><span>${nextStation.icon}</span><div><strong>Etapa: ${esc(nextStation.name)}</strong><small>Próximo passo da jornada</small></div></a></li>
            ${recs.map((r) => `<li><a href="${r.route}"><span>${FORMATS[r.fmt].icon}</span><div><strong>${esc(CONCEPTS[r.id].name)}</strong><small>${esc(r.title)}</small></div></a></li>`).join("")}
            ${due ? `<li><a href="#/revisao"><span>🃏</span><div><strong>${due} flashcards</strong><small>Revisão espaçada, 5 minutos</small></div></a></li>` : `<li><a href="#/jogos/relampago"><span>⚡</span><div><strong>Quiz relâmpago</strong><small>60 segundos para aquecer</small></div></a></li>`}
          </ol>
        </div>
        <div class="card cheer">
          ${avatar("fim", "cheer-av")}
          <div>
            <h2>Sem ordem obrigatória</h2>
            <p>Pule para o que você sente que precisa. Tudo fica salvo neste aparelho: você fecha e, quando voltar, continua de onde parou.</p>
          </div>
        </div>
      </section>

      <section>
        <div class="section-h"><h2>Escolha seu caminho</h2></div>
        <div class="modules">${MODULES.map((m) => { const pr = Math.round(progressOf(m.id) * 100); return `
          <a class="module" href="${m.route}">
            <span class="m-icon">${m.icon}</span>
            <strong>${esc(m.name)}</strong>
            <small>${esc(m.desc)}</small>
            <div class="bar"><i style="width:${pr}%"></i></div><em>${pr}%</em>
          </a>`; }).join("")}
        </div>
      </section>

      <section class="card skills-card">
        <h2>Suas habilidades</h2>
        <div class="skills-row">${Object.keys(SKILLS).map((k) => `<div class="skill-pill" style="--c:${SKILLS[k].color}"><span>${SKILLS[k].icon}</span><div><small>${SKILLS[k].name}</small><strong>${S.skills[k]} XP</strong></div></div>`).join("")}</div>
      </section>

      <p class="disclaimer">IA é só para a preparação: o PSI 1126/2026 proíbe o uso de IA ou ferramentas externas de resposta durante as entrevistas avaliativas. As referências legais servem para estudo; confirme sempre no edital e no regulamento interno de licitações e contratos dos Correios.
      <button class="link-btn" id="resetBtn">Zerar progresso</button></p>`;
    document.getElementById("openLetter").onclick = openLetter;
    const dIn = document.getElementById("examDate");
    if (dIn) dIn.onchange = () => { if (dIn.value) { S.examDate = dIn.value; save(); Sfx.play("ok"); home(); } };
    const ch = document.getElementById("changeDate");
    if (ch) ch.onclick = () => { S.examDate = null; save(); home(); };
    if (!S.letterSeen) setTimeout(() => { if (route === "#/" || route === "") { S.letterSeen = true; save(); openLetter(); } }, 900);
    document.getElementById("resetBtn").onclick = () => {
      const b = document.getElementById("resetBtn");
      if (b.dataset.armed) { S = blank(); save(); router(); toast("Progresso zerado."); return; }
      b.dataset.armed = "1";
      b.textContent = "Toque de novo para apagar tudo";
      setTimeout(() => { if (b.isConnected) { delete b.dataset.armed; b.textContent = "Zerar progresso"; } }, 4000);
    };
  }

  /* ---------------- MINHA MISSÃO ---------------- */
  function missao() {
    $app.innerHTML = header("🗺️", "Minha Missão", "O ciclo de vida de uma contratação de TIC, do problema ao encerramento. Toque numa estação.") + `
      <section class="grid-2">
        <div class="card role"><h2>📝 Bloco 1 · Instrução de contratações de TIC</h2><p>Viabilidade, ETP, Termo de Referência, especificações técnicas, estimativa de custo, planejamento, critérios de medição, níveis mínimos de serviço, análise de riscos, apoio à licitação ou contratação direta, articulação com áreas técnica, jurídica, orçamentária e financeira.</p></div>
        <div class="card role"><h2>📋 Bloco 2 · Gestão operacional de contratos de TIC</h2><p>Vigência, prazos, prorrogações, aditivos, alterações de valor e escopo, execução orçamentária (empenho, liquidação, pagamento), rastreabilidade documental, conformidade, apoio aos fiscais e gestão de fornecedores. Temas do edital: WMS, TMS, Cloud, APIs, projetos NDB e iniciativas ADM.</p></div>
      </section>
      <section class="card flipline">
        <div class="persp"><small>Hoje</small><strong>ÓRGÃO PÚBLICO</strong><span>↓ contrata</span><strong class="hl">CORREIOS prestam o serviço</strong></div>
        <div class="persp-arrow">⇄</div>
        <div class="persp target"><small>Cargo-alvo</small><strong class="hl">CORREIOS</strong><span>↓ contratam</span><strong>FORNECEDOR DE TECNOLOGIA presta o serviço</strong></div>
      </section>
      <section class="path">${STATIONS.map((s, i) => `
        <a href="#/missao/${s.id}" class="p-node ${i % 2 ? "right" : "left"} ${S.done["st:" + s.id] ? "done" : ""}">
          <span class="p-ico">${S.done["st:" + s.id] ? "✓" : s.icon}</span>
          <span class="p-txt"><small>${String(i + 1).padStart(2, "0")}</small><strong>${esc(s.name)}</strong><em>${esc(s.doc)}</em></span>
        </a>`).join("")}
      </section>`;
  }

  function station(id) {
    const i = STATIONS.findIndex((s) => s.id === id);
    if (i < 0) return missao();
    const s = STATIONS[i], prev = STATIONS[i - 1], next = STATIONS[i + 1];
    seen(s.concepts, "map");
    $app.innerHTML = `
      ${header(s.icon, s.name, `Etapa ${i + 1} de ${STATIONS.length} · documento-chave: ${esc(s.doc)}`, ["#/missao", "Jornada"])}
      <div class="station-grid">
        <div class="card s-block"><h3>O que acontece</h3><p>${esc(s.what)}</p></div>
        <div class="card s-block accent"><h3>O que a analista faz</h3><p>${esc(s.analyst)}</p></div>
        <div class="card s-block bridge-card"><h3>🔄 Você já faz isso</h3><p>${esc(s.youAlready)}</p></div>
        <div class="card s-block risk"><h3>⚠️ Onde costuma dar errado</h3><p>${esc(s.risk)}</p></div>
      </div>
      <div class="card"><h3>📄 Documento-chave</h3><p>${esc(s.doc)} · <a class="link" href="#/leitura/${s.id}">Ler o texto completo desta etapa →</a></p>
        <h3>Conceitos desta estação</h3><div class="chips">${s.concepts.map(chip).join("")}</div></div>
      <div class="card"><h3>Checagem rápida</h3>${quizHTML(s.check, "st:" + s.id)}</div>
      <div class="pager">${prev ? `<a class="btn ghost" href="#/missao/${prev.id}">← ${esc(prev.name)}</a>` : "<span></span>"}${next ? `<a class="btn" href="#/missao/${next.id}">${esc(next.name)} →</a>` : `<a class="btn" href="#/flip">Próximo módulo: Vire o Contrato →</a>`}</div>`;
    bindQuiz($app, s.check, "st:" + s.id, s.concepts, "map", 20);
  }

  /* ---------------- VIRE O CONTRATO ---------------- */
  function flips() {
    $app.innerHTML = header("🔄", "Vire o Contrato", "O que você já sabe → vire a chave → como funciona quando os Correios são a parte contratante.") +
      `<div class="flips">${FLIPS.map((f) => `
        <article class="card flip ${S.done["flip:" + f.id] ? "is-done" : ""}" id="${f.id}">
          <div class="flip-h"><h3>${esc(f.title)}</h3>${S.done["flip:" + f.id] ? '<span class="badge">✓</span>' : ""}</div>
          <div class="flip-steps">
            <div class="fs know"><small>O que você já sabe</small><p>${esc(f.know)}</p></div>
            <div class="fs turn"><small>Vire a chave</small><p>${esc(f.flip)}</p></div>
            <div class="fs target hidden-until"><small>Quando os Correios contratam</small><p>${esc(f.correios)}</p></div>
          </div>
          <button class="btn reveal">Virar ↻</button>
          <div class="after hidden">${quizHTML(f.check, "flip:" + f.id)}<div class="chips">${f.concepts.map(chip).join("")}</div></div>
        </article>`).join("")}</div>`;
    FLIPS.forEach((f) => {
      const el = document.getElementById(f.id);
      el.querySelector(".reveal").onclick = (e) => {
        el.classList.add("flipped");
        e.target.remove();
        el.querySelector(".after").classList.remove("hidden");
        seen(f.concepts, "flip");
      };
      bindQuiz(el, f.check, "flip:" + f.id, f.concepts, "flip", 20);
    });
  }

  /* ---------------- CONTRACT GOSSIP ---------------- */
  function gossip() {
    $app.innerHTML = header("🎧", "Podcast Contrato Gossip", "Rádio Corredor: cada episódio tem uma conversa em áudio para ouvir no trajeto e um roteiro curto para ler. Depois, um treino rápido para fixar.") +
      `<div class="episodes">${EPISODES.map((e, i) => `
        <a class="card episode ${S.done["ep:" + e.id] ? "is-done" : ""}" href="#/gossip/${e.id}">
          <div class="ep-art">EP ${i + 1}</div>
          <div><h3>${esc(e.title)}</h3><p class="muted">${esc(e.teaser)}</p>
          ${S.games["ep:" + e.id] != null ? `<small class="train-best">🎲 Treino: ${S.games["ep:" + e.id]}/6</small>` : ""}
          <small>${(window.MM.AUDIO || {})[e.id] ? `🎙️ áudio de ${window.MM.AUDIO[e.id].minutes} min + roteiro de ~${e.minutes} min` : `⏱ ~${e.minutes} min`} · ${e.concepts.map((c) => esc(CONCEPTS[c].name)).join(" · ")}</small></div>
          ${S.done["ep:" + e.id] ? '<span class="badge">✓</span>' : ""}
        </a>`).join("")}</div>
      <p class="note">${Speech.ok ? "O áudio usa a voz em português do seu navegador/celular. Se soar robótico, instale a voz pt-BR do sistema — ou leia como chat." : "Seu navegador não tem síntese de voz: os episódios ficam em modo leitura."}</p>`;
  }

  function episode(id) {
    const ep = EPISODES.find((e) => e.id === id);
    if (!ep) return gossip();
    $app.innerHTML = `
      ${header("🎧", ep.title, esc(ep.teaser), ["#/gossip", "Podcast"])}
      <div class="player-bar card">
        <button class="btn" id="playBtn" ${Speech.ok || (window.MM.AUDIO || {})[ep.id] ? "" : "disabled"}>▶ Ouvir</button>
        <label class="rate">Velocidade <select id="rate">${[0.85, 1, 1.15, 1.3].map((r) => `<option value="${r}" ${S.rate === r ? "selected" : ""}>${r}×</option>`).join("")}</select></label>
        <div class="cast">${[...new Set(ep.lines.map((l) => l[0]))].map((k) => `<span class="who" style="--c:${CAST[k].color}"><b>${CAST[k].name}</b> ${esc(CAST[k].role)}</span>`).join("")}</div>
      </div>
      <div class="transcript">${ep.lines.map(([who, text], i) => `<div class="line ${who}" data-line="${i}" style="--c:${CAST[who].color}"><b>${CAST[who].name}</b><p>${esc(text)}</p></div>`).join("")}</div>
      <div class="card"><button class="btn ghost" id="finishBtn">Terminei de ouvir/ler</button>
        <div id="epChecks" class="${S.done["ep:" + ep.id] ? "" : "hidden"}"><h3>O que ficou?</h3>${ep.checks.map((c, i) => quizHTML(c, `epq:${ep.id}:${i}`)).join("")}
        <div class="chips">${ep.concepts.map(chip).join("")}</div></div></div>
      ${trainCard(ep)}`;
    $app.querySelector(".player-bar").insertAdjacentHTML("afterend", `<a class="train-hint" href="#/gossip/${ep.id}/treino">🎲 Depois de ouvir: treino com 6 perguntas sobre este episódio →</a>`);
    const btn = document.getElementById("playBtn");
    const hl = (i) => { $app.querySelectorAll(".line").forEach((l) => l.classList.toggle("now", +l.dataset.line === i)); const cur = $app.querySelector(`[data-line="${i}"]`); if (cur) cur.scrollIntoView({ block: "center", behavior: "smooth" }); };
    const finish = () => {
      document.getElementById("epChecks").classList.remove("hidden");
      if (!S.done["ep:" + ep.id]) { S.done["ep:" + ep.id] = 1; seen(ep.concepts, "pod"); award(30, ep.concepts, "episódio"); }
    };
    const rawRec = audioFailed[ep.id] ? null : (window.MM.AUDIO || {})[ep.id];
    if (rawRec && rawRec.sync === false) {
      /* Áudio livre (conversa gerada a partir do roteiro): player próprio, sem sincronizar falas. */
      const box = document.createElement("section");
      box.className = "card audio-free";
      box.innerHTML = `<div class="af-h"><span class="af-ic">🎙️</span><div><strong>Versão em áudio${rawRec.title ? ": " + esc(rawRec.title) : ""}</strong><small>Conversa gerada por IA a partir do roteiro e revisada. Leia as correções antes; se algo divergir, vale o texto do app.</small></div></div><audio controls preload="metadata" src="${rawRec.src}"></audio>${(window.MM.ERRATA || {})[ep.id] ? `<details class="errata"><summary>📝 Antes de ouvir: correções da professora (${window.MM.ERRATA[ep.id].length})</summary><ul>${window.MM.ERRATA[ep.id].map((x) => `<li>${esc(x)}</li>`).join("")}</ul></details>` : ""}`;
      $app.querySelector(".player-bar").before(box);
      const au = box.querySelector("audio");
      currentAudio = au;
      au.playbackRate = S.rate;
      au.addEventListener("loadedmetadata", () => { const pos = S.audioPos[ep.id]; if (pos && pos < au.duration - 5) au.currentTime = pos; });
      let ls = 0;
      au.addEventListener("timeupdate", () => { if (Math.abs(au.currentTime - ls) > 4) { ls = au.currentTime; S.audioPos[ep.id] = au.currentTime; save(); } });
      au.addEventListener("ended", () => { delete S.audioPos[ep.id]; save(); finish(); });
      au.addEventListener("error", () => box.remove());
      document.getElementById("rate").addEventListener("change", () => { au.playbackRate = S.rate; });
      const pb = $app.querySelector(".player-bar .btn"); if (pb) pb.textContent = "▶ Ouvir o roteiro";
    }
    const rec = rawRec && rawRec.sync !== false ? rawRec : null;
    if (rec) {
      /* Áudio gravado (Gemini TTS): um MP3 por episódio + início de cada fala. */
      const audio = (currentAudio = new Audio(rec.src));
      audio.preload = "metadata";
      audio.playbackRate = S.rate;
      btn.disabled = false;
      let lastLine = -1, lastSaved = 0;
      /* Sem marcações por fala (áudio gerado fora do script): estima pelo tamanho de cada fala. */
      if (!rec.starts) audio.addEventListener("loadedmetadata", () => {
        const lens = ep.lines.map((l) => l[1].length + 20), tot = lens.reduce((a, b) => a + b, 0);
        let acc = 0; rec.starts = lens.map((n) => { const st = (acc / tot) * audio.duration; acc += n; return st; });
        rec.duration = audio.duration;
        const tag = $app.querySelector(".rec-tag"); if (tag) tag.textContent = "🎙️ " + Math.floor(audio.duration / 60) + ":" + String(Math.round(audio.duration % 60)).padStart(2, "0");
      });
      audio.addEventListener("loadedmetadata", () => { const pos = S.audioPos[ep.id]; if (pos && pos < audio.duration - 5) { audio.currentTime = pos; btn.textContent = "▶ Continuar de onde parou"; } });
      const lineAt = (t) => { let i = 0; while (i + 1 < rec.starts.length && rec.starts[i + 1] <= t + 0.05) i++; return i; };
      audio.ontimeupdate = () => {
        if (rec.starts) { const i = lineAt(audio.currentTime); if (i !== lastLine) { lastLine = i; hl(i); } }
        if (Math.abs(audio.currentTime - lastSaved) > 4) { lastSaved = audio.currentTime; S.audioPos[ep.id] = audio.currentTime; save(); }
      };
      audio.onplay = () => { btn.textContent = "⏸ Pausar"; };
      audio.onpause = () => { if (!audio.ended) btn.textContent = "▶ Continuar"; };
      audio.onended = () => { btn.textContent = "▶ Ouvir de novo"; lastLine = -1; hl(-1); delete S.audioPos[ep.id]; save(); finish(); };
      audio.onerror = () => { audioFailed[ep.id] = true; if (currentAudio === audio) episode(ep.id); };
      btn.onclick = () => { audio.paused ? audio.play() : audio.pause(); };
      $app.querySelectorAll(".line").forEach((l) => l.onclick = () => { if (!rec.starts) return; audio.currentTime = rec.starts[+l.dataset.line] || 0; audio.play(); });
      document.getElementById("rate").addEventListener("change", () => { audio.playbackRate = S.rate; });
      btn.insertAdjacentHTML("afterend", `<span class="rec-tag">🎙️ ${rec.duration ? Math.floor(rec.duration / 60) + ":" + String(Math.round(rec.duration % 60)).padStart(2, "0") : "áudio gravado"}</span>`);
    } else {
      /* Sem gravação: voz do navegador, fala por fala. */
      let playing = false, at = S.audioPos["line:" + ep.id] || 0;
      if (at) btn.textContent = "▶ Continuar de onde parou";
      const go = () => { if (currentAudio && currentAudio.pause) currentAudio.pause(); playing = true; btn.textContent = "⏸ Pausar"; Speech.play(ep.lines, at, (i) => { at = i; hl(i); S.audioPos["line:" + ep.id] = i; save(); }, () => { playing = false; at = 0; delete S.audioPos["line:" + ep.id]; save(); btn.textContent = "▶ Ouvir de novo"; hl(-1); finish(); }); };
      btn.onclick = () => { if (playing) { Speech.stop(); playing = false; btn.textContent = "▶ Continuar"; return; } go(); };
      $app.querySelectorAll(".line").forEach((l) => l.onclick = () => { if (!Speech.ok) return; at = +l.dataset.line; go(); });
    }
    document.getElementById("rate").onchange = (e) => { S.rate = +e.target.value; save(); };
    document.getElementById("finishBtn").onclick = finish;
    ep.checks.forEach((c, i) => bindQuiz($app, c, `epq:${ep.id}:${i}`, ep.concepts, "pod", 15));
  }

  /* ---------------- CONTRACT CASES ---------------- */
  function cases() {
    $app.innerHTML = header("💬", "Contract Cases", "Simulações de decisão. Não existe “incorreto” seco: cada escolha mostra o que faltou, o risco e o raciocínio melhor.") +
      `<div class="cases">${CASES.map((c) => { const d = S.done["case:" + c.id]; return `
        <a class="card case-card" href="#/casos/${c.id}">
          <small class="channel">${esc(c.channel)}</small><h3>${esc(c.title)}</h3><p class="muted">${esc(c.summary)}</p>
          <div class="chips static">${c.concepts.slice(0, 4).map((id) => `<span class="chip" style="--c:${SKILLS[CONCEPTS[id].skill].color}">${esc(CONCEPTS[id].name)}</span>`).join("")}</div>
          ${d ? `<span class="score">Melhor resultado: ${d}/${c.steps.length * 2}</span>` : '<span class="score new">Novo</span>'}
        </a>`; }).join("")}</div>`;
  }

  function caseView(id) {
    const c = CASES.find((x) => x.id === id);
    if (!c) return cases();
    let step = 0, score = 0;
    $app.innerHTML = `
      ${header("💬", c.title, esc(c.channel), ["#/casos", "Casos"])}
      <div class="chat card"><div class="chat-body" id="chat"></div></div>
      <div id="decision"></div>`;
    const chat = document.getElementById("chat"), dec = document.getElementById("decision");
    const bubble = (who, text) => {
      const p = PEOPLE[who];
      const el = document.createElement("div");
      el.className = "msg";
      el.innerHTML = `<span class="av" style="background:${p.color}">${p.avatar}</span><div class="bub"><b style="color:${p.color}">${esc(p.name)}</b><p>${esc(text)}</p></div>`;
      chat.appendChild(el);
    };
    const mine = (text) => { const el = document.createElement("div"); el.className = "msg me"; el.innerHTML = `<div class="bub"><b>Você</b><p>${esc(text)}</p></div>`; chat.appendChild(el); };
    const typing = () => { const el = document.createElement("div"); el.className = "msg typing"; el.innerHTML = '<div class="bub"><i></i><i></i><i></i></div>'; chat.appendChild(el); return el; };

    function runStep() {
      const st = c.steps[step];
      dec.innerHTML = "";
      let k = 0;
      const nextMsg = () => {
        if (k >= st.msgs.length) return showDecision();
        const t = typing();
        setTimeout(() => { t.remove(); bubble(st.msgs[k][0], st.msgs[k][1]); k++; nextMsg(); }, 650);
      };
      nextMsg();
    }
    function showDecision() {
      const st = c.steps[step];
      const opts = shuffle(st.options.map((o, i) => ({ ...o, i })));
      dec.innerHTML = `<div class="card decision"><p class="quiz-q">🤔 ${esc(st.prompt)}</p><div class="options">${opts.map((o) => `<button class="option" data-i="${o.i}">${esc(o.t)}</button>`).join("")}</div><div class="quiz-fb"></div></div>`;
      dec.querySelector(".options").onclick = (e) => {
        const b = e.target.closest("[data-i]");
        if (!b) return;
        const o = st.options[+b.dataset.i];
        dec.querySelectorAll(".option").forEach((x) => { x.disabled = true; if (st.options[+x.dataset.i].s === 2) x.classList.add("right"); });
        if (o.s < 2) b.classList.add(o.s === 1 ? "partial" : "wrong");
        score += o.s;
        mine(o.t);
        result(c.concepts, o.s === 2);
        const fb = o.s === 2 ? feedbackHTML({ melhor: o.melhor }, true) : feedbackHTML(o, false, o.s === 1 ? '<p class="partial-note">Meio caminho: a direção é boa, mas deixou algo importante de fora.</p>' : "");
        const last = step === c.steps.length - 1;
        dec.querySelector(".quiz-fb").innerHTML = fb + `<button class="btn" id="nextStep">${last ? "Ver resultado" : "Continuar a conversa →"}</button>`;
        document.getElementById("nextStep").onclick = () => { step++; last ? finish() : runStep(); };
        chat.scrollTop = chat.scrollHeight;
      };
    }
    function finish() {
      const max = c.steps.length * 2;
      const prev = S.done["case:" + c.id] || 0;
      seen(c.concepts, "case");
      if (score > prev) {
        S.done["case:" + c.id] = score;
        award(Math.round(((score - prev) / max) * 75) + (prev ? 0 : 10), c.concepts, "caso");
      }
      const msg = score === max ? "Decisão de analista sênior. 👏" : score >= max * 0.6 ? "Bom raciocínio — revise os pontos em que o feedback apontou risco." : "Vale refazer: leia os feedbacks e tente de novo amanhã. Repetir é parte do método.";
      dec.innerHTML = `<div class="card result">${avatar(score >= max * 0.6 ? "vitoria" : "erro", "result-av")}<h2>${score}/${max}</h2><p>${msg}</p><div class="chips">${c.concepts.map(chip).join("")}</div>
        <div class="row gap"><button class="btn ghost" id="redo">Refazer</button><a class="btn" href="#/casos">Outros casos</a></div></div>`;
      document.getElementById("redo").onclick = () => caseView(c.id);
    }
    runStep();
  }

  /* ---------------- TIC SEM O GEEK ---------------- */
  function tic() {
    $app.innerHTML = header("🧩", "TIC sem o Geek", "Você não precisa programar. Precisa entender o suficiente para perguntar, medir e cobrar.") +
      `<div class="tic-grid">${TIC.map((t) => `
        <article class="card tic ${S.done["tic:" + t.id] ? "is-done" : ""}" id="${t.id}">
          <button class="tic-h"><span class="t-ico">${t.icon}</span><div><h3>${esc(t.title)}</h3><p>${esc(t.plain)}</p></div><span class="chev">▾</span></button>
          <div class="tic-body hidden">
            <div class="analogy">💡 ${esc(t.analogy)}</div>
            <h4>O que isso muda no contrato</h4><ul>${t.contract.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
            <h4>Perguntas para fazer ao fornecedor</h4><ul class="asks">${t.ask.map((x) => `<li>“${esc(x)}”</li>`).join("")}</ul>
            <div class="redflag">🚩 ${esc(t.redflag)}</div>
            ${t.calc ? `<div class="calc"><label>Disponibilidade contratada <input type="number" id="slaIn" value="99.5" min="90" max="100" step="0.01" />%</label><p id="slaOut"></p></div>` : ""}
            <div class="chips">${t.concepts.map(chip).join("")}</div>
          </div>
        </article>`).join("")}</div>`;
    TIC.forEach((t) => {
      const el = document.getElementById(t.id);
      el.querySelector(".tic-h").onclick = () => {
        const body = el.querySelector(".tic-body");
        body.classList.toggle("hidden");
        el.classList.toggle("open");
        if (!S.done["tic:" + t.id]) { S.done["tic:" + t.id] = 1; seen(t.concepts, "tic"); award(10, t.concepts); }
      };
    });
    const inp = document.getElementById("slaIn");
    if (inp) {
      const fmt = (min) => min >= 60 ? `${Math.floor(min / 60)}h ${Math.round(min % 60)}min` : `${Math.round(min)} min`;
      const calc = () => { const p = clamp(+inp.value || 0, 0, 100); const month = (1 - p / 100) * 30 * 24 * 60; document.getElementById("slaOut").innerHTML = `Tempo máximo fora do ar: <strong>${fmt(month)}</strong> por mês (30 dias) · <strong>${fmt(month / 30)}</strong> por dia · <strong>${fmt(month * 12.1667)}</strong> por ano.`; };
      inp.oninput = calc; calc();
    }
  }

  /* ---------------- INTERVIEW ARENA ---------------- */
  const TRACKS = { tecnica: "Técnica", cenario: "Cenário", competencia: "Competência", simulado: "Simulado" };
  let simQueue = null;
  function arena(track, idx) {
    if (!TRACKS[track]) track = "tecnica";
    let q, key, trk = track, i = idx;
    if (track === "simulado") {
      if (!simQueue || !simQueue.length) simQueue = shuffle([].concat(...["tecnica", "cenario", "competencia"].map((t) => INTERVIEW[t].map((_, k) => [t, k])))).slice(0, 5);
      [trk, i] = simQueue[0];
    } else if (i == null) {
      const list = INTERVIEW[track];
      const pending = list.map((_, k) => k).filter((k) => !S.done["iv:" + track + k]);
      i = pending.length ? pending[0] : Math.floor(Math.random() * list.length);
    }
    q = INTERVIEW[trk][i];
    key = trk + i;
    const story = S.stories[key] || {};
    $app.innerHTML = header("🎤", "Interview Arena", "Responda em voz alta, como na entrevista. Depois confira os pontos — sem resposta-modelo para decorar.") + `
      <div class="ai-banner">🚫🤖 Treino com apoio digital. Na entrevista real do PSI 1126/2026, <strong>nada de IA ou ferramentas externas de resposta</strong>. O objetivo aqui é você responder sozinha, com seu raciocínio e seus exemplos.</div>
      <div class="tabs">${Object.keys(TRACKS).map((t) => `<a href="#/arena/${t}" class="${t === track ? "active" : ""}">${TRACKS[t]}</a>`).join("")}</div>
      ${track === "simulado" ? `<p class="muted">Simulado: pergunta ${6 - simQueue.length} de 5 · categoria ${TRACKS[trk]}</p>` : ""}
      <div class="card question">
        <p class="eyebrow">${TRACKS[trk]} · ${i + 1}/${INTERVIEW[trk].length}</p>
        <h2>${esc(q.q)}</h2>
        ${q.bridge ? `<div class="bridge">🔄 ${esc(q.bridge)}</div>` : ""}
        <div class="row gap"><button class="btn ghost" id="timerBtn">⏱ Cronômetro 2:00</button><span id="timer" class="timer"></span></div>
        ${trk === "competencia" ? `
          <div class="star">
            ${[["s", "Situação"], ["t", "Tarefa"], ["a", "Ação"], ["r", "Resultado"]].map(([k, l]) => `<label><span>${l}</span><textarea data-star="${k}" rows="2" placeholder="${l} — palavras-chave, não roteiro">${esc(story[k] || "")}</textarea></label>`).join("")}
            <small class="muted">Guarde palavras-chave da sua história (fica só neste navegador). Na entrevista, conte com suas palavras.</small>
          </div>` : `<textarea class="notes" rows="3" placeholder="Opcional: anote palavras-chave do que você respondeu"></textarea>`}
        <button class="btn" id="revealBtn">Revelar pontos-chave</button>
        <div id="points" class="hidden">
          <h4>Uma boa resposta cobre… (marque o que você cobriu)</h4>
          <div class="checks">${q.points.map((p, k) => `<label class="check"><input type="checkbox" data-pt="${k}" /> ${esc(p)}</label>`).join("")}</div>
          <div class="chips">${q.concepts.map(chip).join("")}</div>
          <button class="btn" id="rateBtn">Salvar minha avaliação</button>
          <div id="ivFb"></div>
        </div>
      </div>
      <div class="pager"><span></span><a class="btn ghost" href="#/arena/${track}${track === "simulado" ? "" : "/" + ((i + 1) % INTERVIEW[track].length)}" id="nextQ">Próxima pergunta →</a></div>`;

    $app.querySelectorAll("[data-star]").forEach((ta) => ta.oninput = () => { S.stories[key] = S.stories[key] || {}; S.stories[key][ta.dataset.star] = ta.value; save(); });
    document.getElementById("timerBtn").onclick = () => {
      clearInterval(arenaTimer);
      let s = 120; const out = document.getElementById("timer");
      const tick = () => { out.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; out.classList.toggle("low", s <= 20); if (s-- <= 0) { clearInterval(arenaTimer); out.textContent = "Tempo!"; } };
      tick(); arenaTimer = setInterval(tick, 1000);
    };
    document.getElementById("revealBtn").onclick = (e) => { e.target.remove(); document.getElementById("points").classList.remove("hidden"); seen(q.concepts, "iv"); };
    let rated = false;
    document.getElementById("rateBtn").onclick = (e) => {
      rated = true;
      const got = [...$app.querySelectorAll("[data-pt]")].filter((x) => x.checked).length;
      const ratio = got / q.points.length;
      const miss = [...$app.querySelectorAll("[data-pt]")].filter((x) => !x.checked).map((x) => q.points[+x.dataset.pt]);
      const prev = S.done["iv:" + key] || 0;
      S.done["iv:" + key] = Math.max(prev, Math.round(ratio * 100));
      result(q.concepts, ratio >= 0.6);
      award(Math.max(5, got * 5), q.concepts, "entrevista");
      e.target.disabled = true;
      document.getElementById("ivFb").innerHTML = ratio >= 0.8
        ? `<div class="fb good"><strong>Resposta completa.</strong> Repita em outro dia com outras palavras — é assim que vira raciocínio, não decoreba.</div>`
        : `<div class="fb bad"><strong>Você cobriu ${got} de ${q.points.length}.</strong><p><span class="fb-k">🔎 O que ficou de fora</span>${miss.map(esc).join(" · ")}</p><p><span class="fb-k">🧠 Próximo passo</span>Abra os conceitos acima, revise e responda de novo em voz alta. Esses conceitos entraram na sua lista de pontos fracos.</p></div>`;
      if (track === "simulado") { simQueue.shift(); if (!simQueue.length) { simQueue = null; document.getElementById("nextQ").textContent = "Novo simulado →"; } }
    };
    if (track === "simulado") document.getElementById("nextQ").onclick = (ev) => {
      ev.preventDefault();
      if (!rated && simQueue) { simQueue.shift(); if (!simQueue.length) simQueue = null; }
      arena("simulado");
      window.scrollTo(0, 0);
    };
  }

  /* ---------------- MEUS PONTOS FRACOS ---------------- */
  function radar() {
    const keys = Object.keys(SKILLS), n = keys.length, R = 90, cx = 120, cy = 115;
    const max = Math.max(100, ...keys.map((k) => S.skills[k]));
    const pt = (i, r) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    const rings = [0.25, 0.5, 0.75, 1].map((f) => `<polygon points="${keys.map((_, i) => pt(i, R * f).join(",")).join(" ")}" class="ring"/>`).join("");
    const shape = keys.map((k, i) => pt(i, R * Math.max(0.04, S.skills[k] / max)).join(",")).join(" ");
    const labels = keys.map((k, i) => { const [x, y] = pt(i, R + 18); return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${SKILLS[k].icon} ${SKILLS[k].name}</text>`; }).join("");
    return `<svg viewBox="0 0 240 235" class="radar" role="img" aria-label="Radar de habilidades">${rings}${keys.map((_, i) => `<line x1="${cx}" y1="${cy}" x2="${pt(i, R)[0]}" y2="${pt(i, R)[1]}" class="axis"/>`).join("")}<polygon points="${shape}" class="shape"/>${labels}</svg>`;
  }

  function weak() {
    const ids = Object.keys(CONCEPTS).sort((a, b) => (touched(b) - touched(a)) || mastery(a) - mastery(b));
    const weakList = ids.filter((id) => touched(id) && S.concepts[id].wrong > 0 && (mastery(id) < 50 || S.concepts[id].wrong >= S.concepts[id].right));
    const recs = recommendations(4);
    $app.innerHTML = header("🎯", "Meus Pontos Fracos", "Cada conceito importante aparece em vários formatos. Quanto mais formatos você usou — e mais acertou — maior o domínio.") + `
      <section class="grid-2">
        <div class="card"><h2>Radar de habilidades</h2>${radar()}</div>
        <div class="card"><h2>Revisar agora</h2>
          ${weakList.length ? `<p class="muted">${weakList.length} conceito(s) pedindo atenção.</p>` : `<p class="muted">Nenhum ponto fraco claro ainda. Jogue casos e perguntas para o radar aprender com você.</p>`}
          <ol class="todo">${recs.map((r) => `<li><a href="${r.route}"><span>${FORMATS[r.fmt].icon}</span><div><strong>${esc(CONCEPTS[r.id].name)} · ${r.m}%</strong><small>${esc(r.title)}</small></div></a></li>`).join("")}</ol>
          <a class="btn" href="#/revisao">🃏 Revisão rápida (${dueCards().length} cards)</a>
        </div>
      </section>
      <section class="card">
        <h2>Domínio por conceito</h2>
        <div class="legend">${Object.keys(FORMATS).map((f) => `<span>${FORMATS[f].icon} ${FORMATS[f].label}</span>`).join("")}</div>
        <div class="mastery">${ids.map((id) => { const m = mastery(id), c = S.concepts[id]; const isWeak = weakList.includes(id); return `
          <button class="m-row ${isWeak ? "weak" : ""}" data-concept="${id}">
            <span class="m-name">${SKILLS[CONCEPTS[id].skill].icon} ${esc(CONCEPTS[id].name)}${isWeak ? ' <em class="flag">revisar</em>' : ""}</span>
            <span class="m-dots">${Object.keys(FORMATS).map((f) => `<i class="${c && c.seen[f] ? "on" : ""}" title="${FORMATS[f].label}">${FORMATS[f].icon}</i>`).join("")}</span>
            <span class="m-bar"><i style="width:${m}%;background:${m >= 70 ? "var(--good)" : m >= 40 ? "var(--warn)" : "var(--bad)"}"></i></span>
            <span class="m-pct">${touched(id) ? m + "%" : "—"}</span>
          </button>`; }).join("")}</div>
      </section>`;
  }

  /* ---------------- REVISÃO (flashcards, Leitner) ---------------- */
  const INTERVALS = [0, 1, 2, 4, 8, 16];
  function review(onlyId) {
    let deck = dueCards(onlyId);
    if (!deck.length && !onlyId) deck = dueCards(null, true).filter((x) => !S.cards[x.id + ":" + x.i]);
    if (!onlyId) {
      const w = (x) => (touched(x.id) ? mastery(x.id) : 60) + x.box * 10 + Math.random() * 15;
      deck = deck.sort((a, b) => w(a) - w(b)).slice(0, 10);
    }
    deck = shuffle(deck);
    const total = deck.length;
    let k = 0, good = 0;
    const title = onlyId ? "Flashcards: " + CONCEPTS[onlyId].name : "Revisão rápida";
    if (!total) {
      $app.innerHTML = header("🃏", title) + `<div class="card center"><h2>Tudo em dia ✨</h2><p class="muted">Nenhum card vencido hoje. Os cards voltam em intervalos crescentes (1, 2, 4, 8, 16 dias) conforme você acerta.</p><a class="btn" href="#/casos">Jogar um caso</a></div>`;
      return;
    }
    const draw = () => {
      if (k >= total) {
        award(good * 5, [...new Set(deck.map((d) => d.id))], "revisão");
        $app.innerHTML = header("🃏", title) + `<div class="card center">${avatar(good >= total * 0.6 ? "vitoria" : "fim", "result-av")}<h2>${good}/${total} de primeira</h2><p class="muted">Os que você errou voltam amanhã. Os que acertou, mais tarde. Esse espaçamento é o que faz a memória fixar.</p><div class="row gap center"><a class="btn ghost" href="#/fracos">Ver pontos fracos</a><a class="btn" href="#/">Início</a></div></div>`;
        renderNav();
        return;
      }
      const c = deck[k];
      $app.innerHTML = header("🃏", title) + `
        <p class="muted center">Card ${k + 1} de ${total} · caixa ${c.box || 0}/5</p>
        <div class="flashcard" id="fc"><div class="fc-inner">
          <div class="fc-face front">${skillTag(CONCEPTS[c.id].skill)}<small>${esc(CONCEPTS[c.id].name)}</small><p>${esc(c.q)}</p><span class="hint">Pense na resposta — depois toque para virar</span></div>
          <div class="fc-face back"><small>${esc(CONCEPTS[c.id].name)}</small><p>${esc(c.a)}</p></div>
        </div></div>
        <div class="grade hidden" id="grade"><button class="btn bad" data-g="0">Errei</button><button class="btn warn" data-g="1">Quase</button><button class="btn good" data-g="2">Acertei</button></div>`;
      const fc = document.getElementById("fc");
      fc.onclick = () => { fc.classList.add("flipped"); document.getElementById("grade").classList.remove("hidden"); };
      document.getElementById("grade").onclick = (e) => {
        const b = e.target.closest("[data-g]"); if (!b) return;
        const g = +b.dataset.g, id = c.id + ":" + c.i;
        const st = S.cards[id] || { box: 0 };
        st.box = g === 2 ? Math.min(5, st.box + 1) : g === 1 ? Math.max(1, st.box) : 1;
        st.due = addDays(today(), g === 0 ? 1 : INTERVALS[st.box]);
        S.cards[id] = st;
        seen([c.id], "card");
        result([c.id], g === 2);
        if (g === 2) good++;
        Sfx.play(g === 2 ? "ok" : g === 1 ? "tap" : "no");
        k++; draw();
      };
    };
    draw();
  }


  /* ---------------- PARA LER ---------------- */
  const readMinutes = (st) => Math.max(2, Math.round((st.what + st.analyst + st.youAlready + st.risk + st.concepts.map((c) => CONCEPTS[c].points.join(" ") + CONCEPTS[c].bridge).join(" ")).split(/\s+/).length / 180));
  function readingList() {
    $app.innerHTML = header("📖", "Para ler", "Textos curtos, um por etapa do contrato. Leia na ordem ou pule direto para o que precisa. Cada conceito tem vídeos de apoio no YouTube.") + `
      <div class="read-list">${STATIONS.map((st, i) => `
        <a class="read-item ${S.done["read:" + st.id] ? "is-done" : ""}" href="#/leitura/${st.id}">
          <span class="ri-n">${String(i + 1).padStart(2, "0")}</span>
          <span class="ri-t"><strong>${esc(st.name)}</strong><small>${st.concepts.map((c) => esc(CONCEPTS[c].name)).join(" · ")}</small></span>
          <span class="ri-m">${S.done["read:" + st.id] ? "✓ lido" : readMinutes(st) + " min"}</span>
        </a>`).join("")}</div>
      <section class="card"><h2>Glossário rápido</h2><p class="muted">Toque num termo para ver a explicação, a ponte com o que você já faz e os vídeos.</p>
        <div class="chips">${Object.keys(CONCEPTS).sort((a, b) => CONCEPTS[a].name.localeCompare(CONCEPTS[b].name, "pt")).map(chip).join("")}</div></section>`;
  }
  function reading(id) {
    const i = STATIONS.findIndex((x) => x.id === id);
    if (i < 0) return readingList();
    const st = STATIONS[i], prev = STATIONS[i - 1], next = STATIONS[i + 1];
    $app.innerHTML = header(st.icon, st.name, `Leitura ${i + 1} de ${STATIONS.length} · cerca de ${readMinutes(st)} minutos`, ["#/leitura", "Leituras"]) + `
      <article class="article card">
        <p class="article-lead">${esc(st.what)}</p>
        <h3>O que a analista de contratos faz aqui</h3><p>${esc(st.analyst)}</p>
        <div class="bridge"><strong>🔄 Você já faz isso:</strong> ${esc(st.youAlready)}</div>
        <h3>Onde costuma dar errado</h3><p>${esc(st.risk)}</p>
        <p class="doc-line">📄 Documento-chave: <strong>${esc(st.doc)}</strong></p>
        ${st.concepts.map((c) => { const k = CONCEPTS[c]; return `
          <section class="concept-sec">
            <h2>${esc(k.name)}</h2>
            <p class="lead">${esc(k.short)}</p>
            <ul class="points">${k.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
            <p class="bridge-inline"><strong>Ponte:</strong> ${esc(k.bridge)}</p>
            ${VIDEOS[c] ? `<div class="yts"><span class="yts-l">Vídeos no YouTube</span>${videoLinks(c)}</div>` : ""}
          </section>`; }).join("")}
        <div class="row gap article-actions">
          ${Speech.ok ? `<button class="btn ghost" id="sayAll">🔊 Ouvir este texto</button>` : ""}
          <button class="btn" id="markRead">${S.done["read:" + st.id] ? "✓ Lido. Ler de novo conta como revisão" : "Marcar como lido"}</button>
        </div>
      </article>
      <div class="pager">${prev ? `<a class="btn ghost" href="#/leitura/${prev.id}">← ${esc(prev.name)}</a>` : "<span></span>"}${next ? `<a class="btn" href="#/leitura/${next.id}">${esc(next.name)} →</a>` : `<a class="btn" href="#/prova">Fazer o simulado final →</a>`}</div>`;
    document.getElementById("markRead").onclick = (e) => {
      seen(st.concepts, "read");
      if (!S.done["read:" + st.id]) { S.done["read:" + st.id] = 1; award(15, st.concepts, "leitura"); }
      e.target.textContent = "✓ Lido";
    };
    const say = document.getElementById("sayAll");
    if (say) say.onclick = () => Speech.speakText([st.name, st.what, "O que a analista faz: " + st.analyst, "Você já faz isso: " + st.youAlready, "Atenção: " + st.risk].concat(st.concepts.map((c) => CONCEPTS[c].name + ". " + CONCEPTS[c].short + " " + CONCEPTS[c].points.join(" "))).join(" "));
  }


  /* ---------------- treino pós-podcast ---------------- */
  function trainCard(ep) {
    const best = S.games["ep:" + ep.id];
    return `<section class="card train-card">
      ${avatar("jogos", "train-av")}
      <div>
        <p class="eyebrow">Treino pós-podcast</p>
        <h2>Agora é jogar para fixar</h2>
        <p class="muted">Ouviu ou leu? Fixe com perguntas sobre os temas do episódio. Cada erro vem com a explicação.${best != null ? ` Seu melhor: <strong>${best}/6</strong>.` : ""}</p>
        <div class="row gap"><a class="btn" href="#/gossip/${ep.id}/treino">🎲 Treino do episódio (6 perguntas)</a><a class="btn ghost" href="#/jogos/pares/${ep.id}">🧩 Ligue os pares</a><a class="btn ghost" href="#/revisao/${ep.concepts[0]}">🃏 Flashcards</a></div>
      </div>
    </section>`;
  }
  function episodePool(ep) {
    const has = (cs) => cs.some((c) => ep.concepts.includes(c));
    const fromChecks = (c, cs) => ({ q: c.q, opts: c.options.map((o) => ({ t: o[0], ok: o[1] })), why: c.fb.melhor, concepts: cs });
    const pool = [];
    ep.checks.forEach((c) => pool.push(fromChecks(c, ep.concepts)));
    STATIONS.forEach((st) => { if (has(st.concepts)) pool.push(fromChecks(st.check, st.concepts.filter((c) => ep.concepts.includes(c)))); });
    FLIPS.forEach((f) => { if (has(f.concepts)) pool.push(fromChecks(f.check, f.concepts)); });
    EXAMS.forEach((E) => E.questions.forEach((q) => { if (ep.concepts.includes(q[0])) pool.push({ q: q[1], opts: q[2].map((t, k) => ({ t, ok: k === 0 })), why: q[3], concepts: [q[0]] }); }));
    const seenQ = new Set();
    return shuffle(pool).filter((x) => (seenQ.has(x.q) ? false : seenQ.add(x.q)));
  }
  function episodeTraining(id) {
    const ep = EPISODES.find((e) => e.id === id);
    if (!ep) return gossip();
    const qs = episodePool(ep).slice(0, 6);
    const idx = EPISODES.indexOf(ep), next = EPISODES[idx + 1];
    let i = 0, ok = 0;
    const wrong = [];
    $app.innerHTML = header("🎲", "Treino: " + ep.title, "6 perguntas sobre os temas deste episódio. Sem pressa: leia a explicação de cada uma.", ["#/gossip/" + ep.id, "Episódio"]) + `<section class="card" id="tr"></section>`;
    const box = document.getElementById("tr");
    const draw = () => {
      const q = qs[i];
      const opts = shuffle(q.opts);
      box.innerHTML = `<div class="exam-top"><div class="bar big"><i style="width:${(i / qs.length) * 100}%"></i></div><span>${i + 1}/${qs.length}</span></div>
        <p class="quiz-q">${esc(q.q)}</p><div class="options">${opts.map((o, k) => `<button class="option" data-k="${k}">${esc(o.t)}</button>`).join("")}</div><div class="quiz-fb"></div>`;
      box.querySelectorAll("[data-k]").forEach((b) => b.onclick = () => {
        const good = opts[+b.dataset.k].ok;
        box.querySelectorAll("[data-k]").forEach((x) => { x.disabled = true; if (opts[+x.dataset.k].ok) x.classList.add("right"); });
        if (!good) { b.classList.add("wrong"); wrong.push(q); } else ok++;
        result(q.concepts, good);
        const last = i === qs.length - 1;
        box.querySelector(".quiz-fb").innerHTML = feedbackHTML({ melhor: q.why, faltou: good ? "" : "", risco: "" }, good) + `<button class="btn" id="trNext">${last ? "Ver resultado" : "Próxima →"}</button>`;
        document.getElementById("trNext").onclick = () => { i++; last ? end() : draw(); };
      });
    };
    const end = () => {
      const prev = S.games["ep:" + ep.id];
      S.games["ep:" + ep.id] = Math.max(prev || 0, ok); save();
      seen(ep.concepts, "game");
      award(ok * 5 + (prev == null ? 10 : 0), ep.concepts, "treino do podcast");
      const weak = [...new Set(wrong.flatMap((q) => q.concepts))];
      box.innerHTML = `<div class="center">${avatar(ok >= 5 ? "vitoria" : "pensando", "result-av")}<h2>${ok} de ${qs.length}</h2>
        <p>${ok === qs.length ? "Perfeito! Esse episódio ficou. 🌻" : ok >= 4 ? "Muito bem! Revise rapidinho o que escapou." : "Bom começo. Releia o episódio e tente de novo: repetir é o que fixa."}</p>
        ${weak.length ? `<p class="muted">Vale revisar:</p><div class="chips" style="justify-content:center">${weak.map(chip).join("")}</div>` : ""}
        <div class="row gap center" style="margin-top:16px"><button class="btn" id="trAgain">Jogar de novo</button><a class="btn ghost" href="#/jogos/pares/${ep.id}">🧩 Ligue os pares</a>${next ? `<a class="btn ghost" href="#/gossip/${next.id}">Próximo episódio →</a>` : `<a class="btn ghost" href="#/prova">🏁 Simulado final</a>`}</div></div>`;
      document.getElementById("trAgain").onclick = () => episodeTraining(id);
    };
    draw();
  }

  /* ---------------- JOGUINHOS ---------------- */
  const allChecks = () => [].concat(
    STATIONS.map((x) => ({ ...x.check, concepts: x.concepts })),
    FLIPS.map((x) => ({ ...x.check, concepts: x.concepts })),
    ...EPISODES.map((e) => e.checks.map((c) => ({ ...c, concepts: e.concepts }))));
  function games() {
    const g = S.games;
    const tile = (r, ic, t, d, best) => `<a class="game-tile" href="${r}"><span class="gt-ic">${ic}</span><strong>${t}</strong><small>${d}</small>${best != null ? `<em>Recorde: ${best}</em>` : `<em>Ainda não jogado</em>`}</a>`;
    $app.innerHTML = header("🎲", "Joguinhos", "Todos opcionais. Use para testar o que já sabe, aquecer antes de estudar ou descontrair.") + `
      <div class="game-grid">
        ${tile("#/jogos/relampago", "⚡", "Quiz relâmpago", "60 segundos. Quantas você acerta?", g.relampago)}
        ${tile("#/jogos/pares", "🧩", "Ligue os pares", "Ligue cada termo à sua definição.", g.pares != null ? g.pares + " erro(s)" : null)}
        ${tile("#/jogos/ordem", "🧭", "Ordem da jornada", "Coloque as etapas do contrato na ordem certa.", g.ordem != null ? g.ordem + " erro(s)" : null)}
        ${tile("#/prova", "🏁", "Simulado final", "20 questões, 5 versões, com correção comentada.", S.exams && S.exams.best != null ? S.exams.best + "%" : null)}
      </div>`;
  }
  function gameFlash() {
    const pool = shuffle(allChecks());
    let i = 0, ok = 0, total = 0, left = 60, locked = false;
    const touchedC = new Set();
    $app.innerHTML = header("⚡", "Quiz relâmpago", "Responda o máximo que conseguir em 60 segundos.", ["#/jogos", "Joguinhos"]) + `
      <div class="card flash"><div class="flash-top"><span class="timer" id="ft">60</span><span class="flash-score" id="fs">0 acertos</span></div><div id="fq"></div></div>`;
    const draw = () => {
      const q = pool[i % pool.length];
      const opts = shuffle(q.options.map((o, k) => ({ t: o[0], ok: o[1], k })));
      document.getElementById("fq").innerHTML = `<p class="quiz-q">${esc(q.q)}</p><div class="options">${opts.map((o) => `<button class="option" data-ok="${o.ok ? 1 : 0}">${esc(o.t)}</button>`).join("")}</div><p class="flash-why" id="fw"></p>`;
      locked = false;
      document.querySelectorAll("#fq .option").forEach((b) => b.onclick = () => {
        if (locked) return; locked = true; total++;
        const good = b.dataset.ok === "1";
        q.concepts.forEach((c) => touchedC.add(c));
        result(q.concepts, good);
        Sfx.play(good ? "ok" : "no");
        if (good) { ok++; b.classList.add("right"); } else { b.classList.add("wrong"); document.querySelector('#fq [data-ok="1"]').classList.add("right"); document.getElementById("fw").textContent = q.fb.melhor; }
        document.getElementById("fs").textContent = ok + " acerto" + (ok === 1 ? "" : "s");
        setTimeout(() => { if (left > 0) { i++; draw(); } }, good ? 450 : 1800);
      });
    };
    const end = () => {
      clearInterval(arenaTimer);
      const best = Math.max(S.games.relampago || 0, ok);
      const rec = ok > (S.games.relampago || 0);
      S.games.relampago = best; save();
      seen([...touchedC], "game");
      award(ok * 4, [...touchedC], "quiz relâmpago");
      $app.querySelector(".flash").innerHTML = `<div class="center">${avatar(ok >= 6 ? "vitoria" : "pensando", "result-av")}<h2>${ok} de ${total}</h2><p>${rec ? "Novo recorde! 🌻" : "Recorde atual: " + best}</p><div class="row gap center"><button class="btn" id="again">Jogar de novo</button><a class="btn ghost" href="#/jogos">Outros jogos</a></div></div>`;
      document.getElementById("again").onclick = gameFlash;
    };
    draw();
    clearInterval(arenaTimer);
    arenaTimer = setInterval(() => { left--; const t = document.getElementById("ft"); if (t) { t.textContent = left; t.classList.toggle("low", left <= 10); } if (left <= 0) end(); }, 1000);
  }
  function gamePairs(epId) {
    const ep = typeof epId === "string" ? EPISODES.find((e) => e.id === epId) : null;
    const base = ep ? shuffle(ep.concepts) : [];
    const ids = base.concat(shuffle(Object.keys(CONCEPTS).filter((c) => !base.includes(c)))).slice(0, 5);
    let pick = null, miss = 0, done = 0;
    $app.innerHTML = header("🧩", "Ligue os pares", "Toque num termo e depois na definição dele.", ["#/jogos", "Joguinhos"]) + `
      <div class="card pairs"><div class="pair-cols">
        <div class="pair-col">${shuffle(ids).map((id) => `<button class="pair term" data-id="${id}">${esc(CONCEPTS[id].name)}</button>`).join("")}</div>
        <div class="pair-col">${shuffle(ids).map((id) => `<button class="pair def" data-id="${id}">${esc(CONCEPTS[id].short)}</button>`).join("")}</div>
      </div><p class="muted center" id="pmsg">Erros: 0</p></div>`;
    $app.querySelectorAll(".pair.term").forEach((b) => b.onclick = () => { if (b.disabled) return; $app.querySelectorAll(".pair.term").forEach((x) => x.classList.remove("sel")); b.classList.add("sel"); pick = b; });
    $app.querySelectorAll(".pair.def").forEach((b) => b.onclick = () => {
      if (!pick || b.disabled) return;
      if (b.dataset.id === pick.dataset.id) {
        [b, pick].forEach((x) => { x.disabled = true; x.classList.remove("sel"); x.classList.add("matched"); });
        result([b.dataset.id], true); pick = null; done++; Sfx.play(done === ids.length ? "win" : "ok");
        if (done === ids.length) {
          const prev = S.games.pares; S.games.pares = prev == null ? miss : Math.min(prev, miss); save();
          seen(ids, "game"); award(Math.max(10, 30 - miss * 5), ids, "ligue os pares");
          document.getElementById("pmsg").innerHTML = `<strong>Pronto! ${miss} erro(s).</strong> <button class="link-btn" id="again">Jogar de novo</button>`;
          document.getElementById("again").onclick = () => gamePairs(epId);
        }
      } else {
        miss++; result([pick.dataset.id], false); Sfx.play("no");
        b.classList.add("shake"); setTimeout(() => b.classList.remove("shake"), 400);
        document.getElementById("pmsg").textContent = "Erros: " + miss;
      }
    });
  }
  function gameOrder() {
    const start = Math.floor(Math.random() * (STATIONS.length - 5));
    const seq = STATIONS.slice(start, start + 6);
    let pos = 0, miss = 0;
    $app.innerHTML = header("🧭", "Ordem da jornada", "Toque nas etapas na ordem em que acontecem num contrato de TIC.", ["#/jogos", "Joguinhos"]) + `
      <div class="card order"><ol class="order-done" id="od"></ol><div class="order-pool">${shuffle(seq).map((x) => `<button class="pair" data-id="${x.id}">${x.icon} ${esc(x.name)}</button>`).join("")}</div><p class="muted center" id="omsg"></p></div>`;
    $app.querySelectorAll(".order-pool .pair").forEach((b) => b.onclick = () => {
      const want = seq[pos];
      if (b.dataset.id === want.id) {
        b.remove(); pos++; Sfx.play(pos === seq.length ? "win" : "ok");
        document.getElementById("od").insertAdjacentHTML("beforeend", `<li>${want.icon} ${esc(want.name)} <small>${esc(want.doc)}</small></li>`);
        document.getElementById("omsg").textContent = "";
        if (pos === seq.length) {
          const prev = S.games.ordem; S.games.ordem = prev == null ? miss : Math.min(prev, miss); save();
          const cs = [...new Set(seq.flatMap((x) => x.concepts))];
          seen(cs, "game"); award(Math.max(10, 30 - miss * 5), cs, "ordem da jornada");
          document.getElementById("omsg").innerHTML = `<strong>Jornada completa com ${miss} erro(s).</strong> <button class="link-btn" id="again">Jogar de novo</button>`;
          document.getElementById("again").onclick = gameOrder;
        }
      } else {
        miss++; Sfx.play("no");
        b.classList.add("shake"); setTimeout(() => b.classList.remove("shake"), 400);
        const tried = seq.find((x) => x.id === b.dataset.id);
        document.getElementById("omsg").textContent = `Ainda não. Antes de “${tried.name}” vem outra etapa. Dica: o que precisa existir antes?`;
      }
    });
  }



  /* ---------------- recado & certificado ---------------- */
  const letterHTML = () => `<div class="letter">${LETTER.paragraphs.map((p, i) => `<p class="${i === 0 ? "salute" : ""}">${esc(p)}</p>`).join("")}<p class="sign">${esc(LETTER.sign)}<br /><span class="signature">${esc(LETTER.from)}</span></p></div>`;
  function openLetter() { openModal(`<div class="letter-wrap">${avatar("fim", "letter-av")}${letterHTML()}</div>`); }
  const passedCount = () => EXAMS.filter((e) => (S.exams.runs[e.id] || {}).best >= EXAM_PASS).length;
  const certReady = () => passedCount() === EXAMS.length;
  function certificate() {
    const n = passedCount();
    if (!certReady()) {
      $app.innerHTML = header("🎓", "Certificado", "O certificado é liberado quando você passar nas 5 versões do simulado final.", ["#/prova", "Simulado"]) + `
        <section class="card center">${avatar("pensando", "result-av")}<h2>${n} de ${EXAMS.length} versões aprovadas</h2>
          <div class="bar big cert-progress"><i style="width:${(n / EXAMS.length) * 100}%"></i></div>
          <p class="muted">Falta pouco. Cada versão aprovada é um passo a mais.</p><a class="btn" href="#/prova">Ir para o simulado</a></section>`;
      return;
    }
    const avg = Math.round(EXAMS.reduce((a, e) => a + S.exams.runs[e.id].best, 0) / EXAMS.length);
    if (!S.certAt) { S.certAt = Date.now(); save(); }
    const date = new Date(S.certAt).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
    $app.innerHTML = header("🎓", "Certificado", "Você chegou lá. Este é o seu.", ["#/prova", "Simulado"]) + `
      <section class="certificate" id="cert">
        <div class="cert-inner">
          <p class="cert-eyebrow">Certificado de conclusão</p>
          <p class="cert-small">Certificamos que</p>
          <h2 class="cert-name">Milene Santos de Lucena</h2>
          <p class="cert-text">concluiu a preparação <strong>Contract Mission</strong> para Analista de Contratos de TIC (PSI 1126/2026), aprovada nas 5 versões do simulado final com média de <strong>${avg}%</strong>, cobrindo todo o ciclo de vida das contratações de TIC: da necessidade ao encerramento.</p>
          <div class="cert-skills">${Object.keys(SKILLS).map((k) => `<span>${SKILLS[k].icon} ${SKILLS[k].name}</span>`).join("")}</div>
          <div class="cert-foot">
            <div><span class="signature">${esc(LETTER.from)}</span><small>com muito orgulho</small></div>
            <div class="cert-seal" aria-hidden="true">🌻</div>
            <div><strong>${esc(date)}</strong><small>data de conclusão</small></div>
          </div>
        </div>
      </section>
      <div class="row gap center cert-actions"><button class="btn" id="printCert">Imprimir ou salvar em PDF</button><button class="btn ghost" id="openLetter2">💌 Ler o recado</button></div>
      <section class="card">${letterHTML()}</section>`;
    document.getElementById("printCert").onclick = () => { try { window.print(); } catch (e) { toast("Use o menu do navegador para imprimir."); } };
    document.getElementById("openLetter2").onclick = openLetter;
    if (!S.certCelebrated) { S.certCelebrated = true; save(); Sfx.play("level"); toast("🎓 Parabéns, Milene! Certificado liberado.", "level"); }
  }

  /* ---------------- SIMULADO FINAL ---------------- */
  const stationOf = (cid) => STATIONS.find((st) => st.concepts.includes(cid));
  function exams() {
    const hist = S.exams.history.slice(-5).reverse();
    $app.innerHTML = header("🏁", "Simulado final", `5 versões com 20 questões cada. Para passar: ${EXAM_PASS}% ou mais. Você pode parar no meio e continuar depois; as respostas ficam salvas.`) + `
      <a class="card cert-line" href="#/certificado"><span>🎓</span><div><strong>Certificado: ${passedCount()} de ${EXAMS.length} versões aprovadas</strong><small>${certReady() ? "Liberado! Toque para ver." : "Passe nas 5 versões para liberar o certificado."}</small></div></a>
      <div class="exam-grid">${EXAMS.map((e, i) => { const r = S.exams.runs[e.id] || {}; const inProg = r.current && !r.current.done;
        const ans = inProg ? Object.keys(r.current.answers).length : 0;
        return `<a class="exam-tile ${r.best >= EXAM_PASS ? "passed" : ""}" href="#/prova/${e.id}">
          <span class="et-n">${i + 1}</span>
          <strong>${esc(e.title)}</strong>
          <small>${inProg ? `Em andamento: ${ans}/20 respondidas` : r.best != null ? `Melhor nota: ${r.best}% · ${r.tries} tentativa(s)` : "Ainda não feita"}</small>
          <em>${r.best >= EXAM_PASS ? "✓ Aprovada" : inProg ? "Continuar →" : r.best != null ? "Refazer →" : "Começar →"}</em>
        </a>`; }).join("")}</div>
      ${hist.length ? `<section class="card"><h2>Últimas tentativas</h2><ul class="hist">${hist.map((h) => `<li><span>${esc(EXAMS.find((e) => e.id === h.v).title)}</span><strong class="${h.pct >= EXAM_PASS ? "ok" : "no"}">${h.pct}%</strong><small>${new Date(h.at).toLocaleDateString("pt-BR")}</small></li>`).join("")}</ul></section>` : ""}
      <p class="note">Dica: faça uma versão, leia a correção com calma, revise os conceitos indicados e só depois tente a próxima. Errar aqui é o que faz acertar lá.</p>`;
  }
  function exam(v) {
    const E = EXAMS.find((e) => e.id === v);
    if (!E) return exams();
    const R = (S.exams.runs[v] = S.exams.runs[v] || { tries: 0, best: null });
    if (!R.current || R.current.done) {
      R.current = { idx: 0, answers: {}, order: E.questions.map(() => shuffle([0, 1, 2, 3])), started: Date.now() };
      save();
    }
    const cur = R.current;
    const draw = () => {
      const q = E.questions[cur.idx], ord = cur.order[cur.idx], picked = cur.answers[cur.idx];
      const answered = Object.keys(cur.answers).length;
      $app.innerHTML = header("🏁", E.title, "", ["#/prova", "Simulado"]) + `
        <div class="exam-top"><div class="bar big"><i style="width:${(answered / 20) * 100}%"></i></div><span>${answered}/20 respondidas</span></div>
        <div class="exam-dots">${E.questions.map((_, i) => `<button class="ed ${cur.answers[i] != null ? "on" : ""} ${i === cur.idx ? "cur" : ""}" data-go="${i}" aria-label="Questão ${i + 1}">${i + 1}</button>`).join("")}</div>
        <section class="card exam-q">
          <p class="eyebrow">Questão ${cur.idx + 1} de 20</p>
          <h2>${esc(q[1])}</h2>
          <div class="options">${ord.map((k) => `<button class="option ${picked === k ? "picked" : ""}" data-k="${k}">${esc(q[2][k])}</button>`).join("")}</div>
          <div class="row gap exam-nav">
            <button class="btn ghost" id="prevQ" ${cur.idx === 0 ? "disabled" : ""}>← Anterior</button>
            ${cur.idx < 19 ? `<button class="btn" id="nextQ">Próxima →</button>` : ""}
            <button class="btn ${answered === 20 ? "" : "ghost"}" id="submitX">Entregar simulado</button>
          </div>
          <p class="muted small" id="xmsg">A correção comentada aparece quando você entregar.</p>
        </section>`;
      $app.querySelectorAll("[data-k]").forEach((b) => b.onclick = () => {
        cur.answers[cur.idx] = +b.dataset.k; save(); Sfx.play("tap");
        $app.querySelectorAll("[data-k]").forEach((x) => x.classList.toggle("picked", x === b));
        setTimeout(() => { if (cur.idx < 19) { cur.idx++; save(); draw(); } else draw(); }, 260);
      });
      $app.querySelectorAll("[data-go]").forEach((b) => b.onclick = () => { cur.idx = +b.dataset.go; save(); draw(); });
      document.getElementById("prevQ").onclick = () => { cur.idx--; save(); draw(); };
      const nx = document.getElementById("nextQ"); if (nx) nx.onclick = () => { cur.idx++; save(); draw(); };
      document.getElementById("submitX").onclick = (e) => {
        const missing = 20 - Object.keys(cur.answers).length;
        if (missing && !e.target.dataset.armed) { e.target.dataset.armed = "1"; e.target.textContent = `Faltam ${missing}. Toque de novo para entregar assim mesmo`; return; }
        grade(v);
      };
    };
    draw();
  }
  function grade(v) {
    const E = EXAMS.find((e) => e.id === v), R = S.exams.runs[v], cur = R.current;
    let right = 0;
    const wrong = [];
    E.questions.forEach((q, i) => {
      const ok = cur.answers[i] === 0;
      if (ok) right++; else wrong.push(i);
      result([q[0]], ok);
      seen([q[0]], "iv");
    });
    const pct = Math.round((right / E.questions.length) * 100);
    cur.done = true; cur.pct = pct; cur.wrong = wrong; cur.finished = Date.now();
    R.tries = (R.tries || 0) + 1;
    const first = R.best == null || pct > R.best;
    R.best = Math.max(R.best || 0, pct);
    R.last = { answers: cur.answers, pct, wrong, at: cur.finished };
    S.exams.best = Math.max(S.exams.best || 0, pct);
    S.exams.history.push({ v, pct, at: cur.finished });
    save();
    award(right * 5 + (pct >= EXAM_PASS && first ? 100 : 0), [...new Set(E.questions.map((q) => q[0]))], "simulado");
    examResult.played = false;
    go(`#/prova/${v}/resultado`);
  }
  function examResult(v) {
    const E = EXAMS.find((e) => e.id === v), R = (S.exams.runs[v] || {});
    if (!E || !R.last) return exams();
    const L = R.last, passed = L.pct >= EXAM_PASS;
    if (route.endsWith("/resultado") && !examResult.played) { examResult.played = true; setTimeout(() => Sfx.play(passed ? "win" : "tap"), 200); }
    const byConcept = {};
    L.wrong.forEach((i) => { const c = E.questions[i][0]; byConcept[c] = (byConcept[c] || 0) + 1; });
    const study = Object.entries(byConcept).sort((a, b) => b[1] - a[1]);
    const nextExam = EXAMS[(EXAMS.findIndex((e) => e.id === v) + 1) % EXAMS.length];
    $app.innerHTML = header("🏁", "Resultado · " + E.title, "", ["#/prova", "Simulado"]) + `
      <section class="card result-hero ${passed ? "pass" : "fail"}">
        ${avatar(passed ? "vitoria" : "fim", "result-av big")}
        <div>
          <p class="eyebrow">${passed ? "Aprovada nesta versão" : "Ainda não. E tudo bem: é treino"}</p>
          <h2 class="score-big">${L.pct}%</h2>
          <p>${20 - L.wrong.length} de 20 corretas · mínimo para passar: ${EXAM_PASS}%</p>
          ${certReady() ? `<p><a class="btn" href="#/certificado">🎓 Ver meu certificado</a></p>` : `<p class="muted">Certificado: ${passedCount()} de ${EXAMS.length} versões aprovadas.</p>`}
          <div class="row gap"><a class="btn ${certReady() ? "ghost" : ""}" href="#/prova/${v}">Refazer esta versão</a><a class="btn ghost" href="#/prova/${nextExam.id}">${esc(nextExam.title)} →</a></div>
        </div>
      </section>
      ${study.length ? `<section class="card"><h2>O que estudar antes da próxima</h2><p class="muted">Ordenado pelos conceitos em que você mais errou. Cada um tem leitura, flashcards e vídeos.</p>
        <div class="study-list">${study.map(([c, n]) => { const st = stationOf(c); return `
          <div class="study-item">
            <div><strong>${esc(CONCEPTS[c].name)}</strong><small>${n} erro(s) · ${esc(CONCEPTS[c].short)}</small></div>
            <div class="study-actions">
              ${st ? `<a class="pill" href="#/leitura/${st.id}">📖 Ler</a>` : ""}
              <a class="pill" href="#/revisao/${c}">🃏 Flashcards</a>
              <button class="pill" data-concept="${c}">💡 Resumo</button>
              ${VIDEOS[c] ? `<a class="pill" href="${ytUrl(VIDEOS[c][0])}" target="_blank" rel="noopener">▶ Vídeo</a>` : ""}
            </div>
          </div>`; }).join("")}</div></section>` : `<section class="card center"><h2>Nenhum erro. 🌻</h2><p class="muted">Agora tente outra versão para confirmar que o raciocínio está firme.</p></section>`}
      <section class="card"><h2>Correção comentada</h2>
        <div class="review-list">${E.questions.map((q, i) => { const a = L.answers[i]; const ok = a === 0; return `
          <details class="rv ${ok ? "ok" : "no"}" ${ok ? "" : "open"}>
            <summary><span class="rv-n">${i + 1}</span><span class="rv-q">${esc(q[1])}</span><span class="rv-s">${ok ? "✓" : "✗"}</span></summary>
            ${ok ? "" : `<p class="rv-yours"><span>Sua resposta</span>${a == null ? "Não respondida" : esc(q[2][a])}</p>`}
            <p class="rv-right"><span>Resposta certa</span>${esc(q[2][0])}</p>
            <p class="rv-why"><span>Por quê</span>${esc(q[3])}</p>
            ${ok ? "" : `<button class="link-btn" data-concept="${q[0]}">Revisar: ${esc(CONCEPTS[q[0]].name)} →</button>`}
          </details>`; }).join("")}</div>
      </section>`;
  }


  /* ---------------- parallax ---------------- */
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let parTick = false;
  function parallax() {
    parTick = false;
    const y = window.scrollY || 0;
    document.querySelectorAll("[data-depth]").forEach((el) => { el.style.transform = `translate3d(0, ${(y * parseFloat(el.dataset.depth)).toFixed(1)}px, 0)`; });
  }
  if (!reduceMotion) window.addEventListener("scroll", () => { if (!parTick) { parTick = true; requestAnimationFrame(parallax); } }, { passive: true });

  /* ---------------- start ---------------- */
  router();
})();
