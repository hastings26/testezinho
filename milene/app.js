/* MILENE | CONTRACT MISSION — app (vanilla JS, hash routing, progresso em localStorage). */
(function () {
  "use strict";

  const { SKILLS, LEVELS, CONCEPTS, STATIONS, FLIPS, EPISODES, CAST, CASES, PEOPLE, TIC, INTERVIEW } = window.MM;
  const $app = document.getElementById("app");
  const STORE_KEY = "milene-contract-mission-v1";

  const FORMATS = {
    map:  { label: "Mapa",       icon: "🗺️" },
    flip: { label: "Vire",       icon: "🔄" },
    pod:  { label: "Podcast",    icon: "🎧" },
    case: { label: "Caso",       icon: "💬" },
    tic:  { label: "TIC",        icon: "🧩" },
    card: { label: "Flashcard",  icon: "🃏" },
    iv:   { label: "Entrevista", icon: "🎤" }
  };

  const MODULES = [
    { id: "missao", route: "#/missao", icon: "🗺️", name: "Minha Missão",        desc: "O que o cargo faz, estação por estação." },
    { id: "flip",   route: "#/flip",   icon: "🔄", name: "Vire o Contrato",     desc: "Do lado de quem presta para o lado de quem contrata." },
    { id: "gossip", route: "#/gossip", icon: "🎧", name: "Contract Gossip",     desc: "Rádio Corredor: fofoca de firma que ensina." },
    { id: "casos",  route: "#/casos",  icon: "💬", name: "Contract Cases",      desc: "Decisões reais, consequências reais." },
    { id: "tic",    route: "#/tic",    icon: "🧩", name: "TIC sem o Geek",      desc: "Só a tecnologia que o contrato precisa." },
    { id: "arena",  route: "#/arena",  icon: "🎤", name: "Interview Arena",     desc: "Técnica, cenário e competência." },
    { id: "fracos", route: "#/fracos", icon: "🎯", name: "Meus Pontos Fracos",  desc: "Onde revisar — e em qual formato." }
  ];

  /* ---------------- utilidades ---------------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const today = () => new Date().toISOString().slice(0, 10);
  const addDays = (d, n) => { const x = new Date(d + "T12:00:00"); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------------- estado ---------------- */
  const blank = () => ({
    xp: 0,
    skills: Object.fromEntries(Object.keys(SKILLS).map((k) => [k, 0])),
    done: {},
    concepts: {},
    cards: {},
    stories: {},
    streak: { last: null, count: 0 },
    rate: 1
  });
  let S = blank();
  try { const raw = localStorage.getItem(STORE_KEY); if (raw) S = Object.assign(blank(), JSON.parse(raw)); } catch (e) { /* armazenamento indisponível */ }
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
    if (level().i > before) setTimeout(() => toast(`🏆 Novo nível: ${level().title}`, "level"), 700);
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
      <h4 class="mini-h">Formatos em que você já viu este conceito</h4>
      <div class="coverage">${cov}</div>
      <h4 class="mini-h">Onde ele aparece</h4>
      <div class="wheres">${where}</div>`);
  }

  document.addEventListener("click", (e) => {
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
    if (ok) return `<div class="fb good"><strong>✅ Boa.</strong> ${esc(fb.melhor)}${extra || ""}</div>`;
    return `<div class="fb bad">
      <strong>Quase — vamos ver o raciocínio.</strong>
      ${fb.faltou ? `<p><span class="fb-k">🔎 Que informação faltou</span>${esc(fb.faltou)}</p>` : ""}
      ${fb.risco ? `<p><span class="fb-k">⚠️ Que risco passou batido</span>${esc(fb.risco)}</p>` : ""}
      <p><span class="fb-k">🧠 Raciocínio melhor</span>${esc(fb.melhor)}</p>${extra || ""}
    </div>`;
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
      `<div class="side-xp"><div class="lvl">${esc(level().title)}</div><div class="bar"><i style="width:${level().pct}%"></i></div><small>${S.xp} XP · 🔥 ${S.streak.count} dia(s)</small></div>`;
    const tabs = [["#/", "🏠", "Início"], ["#/missao", "🗺️", "Missão"], ["#/casos", "💬", "Casos"], ["#/gossip", "🎧", "Podcast"], ["#/arena", "🎤", "Arena"], ["#/fracos", "🎯", "Foco"]];
    document.getElementById("tabBar").innerHTML = tabs.map(([h, i, n]) =>
      `<a href="${h}" class="${(h === "#/" ? r === "#/" || r === "" : r.startsWith(h)) ? "active" : ""}"><span>${i}</span><small>${n}</small></a>`).join("");
  }

  const routes = [
    [/^#?\/?$/, home],
    [/^#\/missao\/([\w-]+)$/, (m) => station(m[1])],
    [/^#\/missao$/, missao],
    [/^#\/flip$/, flips],
    [/^#\/gossip\/([\w-]+)$/, (m) => episode(m[1])],
    [/^#\/gossip$/, gossip],
    [/^#\/casos\/([\w-]+)$/, (m) => caseView(m[1])],
    [/^#\/casos$/, cases],
    [/^#\/tic$/, tic],
    [/^#\/arena\/(\w+)\/(\d+)$/, (m) => arena(m[1], +m[2])],
    [/^#\/arena\/(\w+)$/, (m) => arena(m[1])],
    [/^#\/arena$/, () => arena("tecnica")],
    [/^#\/fracos$/, weak],
    [/^#\/revisao\/([\w-]+)$/, (m) => review(m[1])],
    [/^#\/revisao$/, () => review()]
  ];
  let currentAudio = null;
  function router() {
    Speech.stop();
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
    clearInterval(arenaTimer);
    const h = route;
    for (const [re, fn] of routes) { const m = h.match(re); if (m) { fn(m); break; } }
    renderNav();
    window.scrollTo(0, 0);
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

  const header = (icon, title, sub) => `<header class="page-head"><a href="#/" class="back">← Início</a><h1><span class="h-icon">${icon}</span>${esc(title)}</h1>${sub ? `<p class="lead">${sub}</p>` : ""}</header>`;

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
      case "fracos": { const ids = Object.keys(CONCEPTS); return ids.filter((id) => mastery(id) >= 60).length / ids.length; }
    }
    return 0;
  }

  function home() {
    const L = level();
    const nextStation = STATIONS.find((s) => !S.done["st:" + s.id]) || STATIONS[STATIONS.length - 1];
    const recs = recommendations(3);
    const due = dueCards().length;
    $app.innerHTML = `
      <section class="hero">
        <div class="player">
          <div class="avatar">M</div>
          <div class="player-info">
            <p class="eyebrow">Jogadora</p>
            <h1>MILENE – ANALISTA DE CONTRATOS</h1>
            <p class="muted">Nível ${L.i + 1} · <strong>${esc(L.title)}</strong>${L.next ? ` · faltam ${L.next.xp - S.xp} XP para “${esc(L.next.title)}”` : " · nível máximo"}</p>
            <div class="bar big"><i style="width:${L.pct}%"></i></div>
          </div>
          <div class="player-stats">
            <div><strong>${S.xp}</strong><small>XP</small></div>
            <div><strong>🔥 ${S.streak.count}</strong><small>dias</small></div>
            <div><strong>${due}</strong><small>cards p/ hoje</small></div>
          </div>
        </div>
        <div class="skills-row">${Object.keys(SKILLS).map((k) => `<div class="skill-pill" style="--c:${SKILLS[k].color}"><span>${SKILLS[k].icon}</span><div><small>${SKILLS[k].name}</small><strong>${S.skills[k]} XP</strong></div></div>`).join("")}</div>
      </section>

      <section class="card">
        <div class="section-h"><h2>Minha Missão</h2><a href="#/missao" class="link">Ver jornada completa →</a></div>
        <p class="muted">Você já domina a gestão do contrato do lado de quem presta. A missão é dominar o ciclo inteiro do lado de quem contrata.</p>
        <div class="journey-strip">${STATIONS.map((s, i) => `
          <a href="#/missao/${s.id}" class="j-node ${S.done["st:" + s.id] ? "done" : s.id === nextStation.id ? "next" : ""}" title="${esc(s.name)}">
            <span class="j-ico">${S.done["st:" + s.id] ? "✓" : s.icon}</span><small>${esc(s.name)}</small>
          </a>${i < STATIONS.length - 1 ? '<span class="j-line"></span>' : ""}`).join("")}
        </div>
      </section>

      <section class="grid-2">
        <div class="card today">
          <h2>Missão de hoje</h2>
          <ol class="todo">
            <li><a href="#/missao/${nextStation.id}"><span>${nextStation.icon}</span><div><strong>Estação: ${esc(nextStation.name)}</strong><small>Próximo passo da jornada</small></div></a></li>
            ${recs.map((r) => `<li><a href="${r.route}"><span>${FORMATS[r.fmt].icon}</span><div><strong>${esc(CONCEPTS[r.id].name)}</strong><small>${esc(r.title)} · novo formato para fixar</small></div></a></li>`).join("")}
            ${due ? `<li><a href="#/revisao"><span>🃏</span><div><strong>${due} flashcards pendentes</strong><small>5 minutos de revisão espaçada</small></div></a></li>` : ""}
          </ol>
        </div>
        <div class="card role">
          <h2>O cargo em 2 blocos</h2>
          <div class="pillar"><h3>📝 Instrução de contratações de TIC</h3><p>Viabilidade, ETP, Termo de Referência, especificações, estimativa de custo, critérios de medição, níveis mínimos de serviço, riscos, apoio à licitação ou contratação direta, articulação com técnica, Jurídico, orçamento e Financeiro.</p></div>
          <div class="pillar"><h3>📋 Gestão operacional de contratos de TIC</h3><p>Vigência, prazos, prorrogações, aditivos, alterações de valor e escopo, execução orçamentária (empenho, liquidação, pagamento), rastreabilidade, conformidade, apoio aos fiscais e gestão de fornecedores.</p></div>
          <p class="note">Temas citados no edital: WMS, TMS, Cloud, APIs, projetos NDB e iniciativas ADM.</p>
        </div>
      </section>

      <section>
        <div class="section-h"><h2>Módulos</h2></div>
        <div class="modules">${MODULES.map((m) => { const p = Math.round(progressOf(m.id) * 100); return `
          <a class="module" href="${m.route}">
            <span class="m-icon">${m.icon}</span>
            <strong>${esc(m.name)}</strong>
            <small>${esc(m.desc)}</small>
            <div class="bar"><i style="width:${p}%"></i></div><em>${p}%</em>
          </a>`; }).join("")}
        </div>
      </section>

      <p class="disclaimer">⚠️ IA é só para a preparação. O PSI 1126/2026 proíbe o uso de IA ou ferramentas externas de resposta durante as entrevistas síncronas avaliativas. Referências legais aqui são de estudo: confirme sempre no edital e no regulamento interno de licitações e contratos dos Correios.
      <button class="link-btn" id="resetBtn">Zerar progresso</button></p>`;
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
      <header class="page-head"><a href="#/missao" class="back">← Jornada</a>
        <p class="eyebrow">Estação ${i + 1} de ${STATIONS.length}</p>
        <h1><span class="h-icon">${s.icon}</span>${esc(s.name)}</h1></header>
      <div class="station-grid">
        <div class="card s-block"><h3>O que acontece</h3><p>${esc(s.what)}</p></div>
        <div class="card s-block accent"><h3>O que a analista faz</h3><p>${esc(s.analyst)}</p></div>
        <div class="card s-block bridge-card"><h3>🔄 Você já faz isso</h3><p>${esc(s.youAlready)}</p></div>
        <div class="card s-block risk"><h3>⚠️ Onde costuma dar errado</h3><p>${esc(s.risk)}</p></div>
      </div>
      <div class="card"><h3>📄 Documento-chave</h3><p>${esc(s.doc)}</p>
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
    $app.innerHTML = header("🎧", "Contract Gossip", "Rádio Corredor: episódios de 4–5 minutos. Personagens fictícios, conteúdo técnico de verdade. Ouça no trajeto ou leia como conversa.") +
      `<div class="episodes">${EPISODES.map((e, i) => `
        <a class="card episode ${S.done["ep:" + e.id] ? "is-done" : ""}" href="#/gossip/${e.id}">
          <div class="ep-art">EP ${i + 1}</div>
          <div><h3>${esc(e.title)}</h3><p class="muted">${esc(e.teaser)}</p>
          <small>${(window.MM.AUDIO || {})[e.id] ? "🎙️ " : ""}⏱ ~${e.minutes} min · ${e.concepts.map((c) => esc(CONCEPTS[c].name)).join(" · ")}</small></div>
          ${S.done["ep:" + e.id] ? '<span class="badge">✓</span>' : ""}
        </a>`).join("")}</div>
      <p class="note">${Object.keys(window.MM.AUDIO || {}).length ? "Episódios com 🎙️ têm áudio gravado com vozes do Gemini. Toque numa fala para pular até ela." : Speech.ok ? "O áudio usa a voz em português do seu navegador/celular. Se soar robótico, instale a voz pt-BR do sistema — ou leia como chat." : "Seu navegador não tem síntese de voz: os episódios ficam em modo leitura."}</p>`;
  }

  function episode(id) {
    const ep = EPISODES.find((e) => e.id === id);
    if (!ep) return gossip();
    $app.innerHTML = `
      <header class="page-head"><a href="#/gossip" class="back">← Episódios</a><p class="eyebrow">Rádio Corredor</p><h1><span class="h-icon">🎧</span>${esc(ep.title)}</h1><p class="lead">${esc(ep.teaser)}</p></header>
      <div class="player-bar card">
        <button class="btn" id="playBtn" ${Speech.ok || (window.MM.AUDIO || {})[ep.id] ? "" : "disabled"}>▶ Ouvir</button>
        <label class="rate">Velocidade <select id="rate">${[0.85, 1, 1.15, 1.3].map((r) => `<option value="${r}" ${S.rate === r ? "selected" : ""}>${r}×</option>`).join("")}</select></label>
        <div class="cast">${[...new Set(ep.lines.map((l) => l[0]))].map((k) => `<span class="who" style="--c:${CAST[k].color}"><b>${CAST[k].name}</b> ${esc(CAST[k].role)}</span>`).join("")}</div>
      </div>
      <div class="transcript">${ep.lines.map(([who, text], i) => `<div class="line ${who}" data-line="${i}" style="--c:${CAST[who].color}"><b>${CAST[who].name}</b><p>${esc(text)}</p></div>`).join("")}</div>
      <div class="card"><button class="btn ghost" id="finishBtn">Terminei de ouvir/ler</button>
        <div id="epChecks" class="${S.done["ep:" + ep.id] ? "" : "hidden"}"><h3>O que ficou?</h3>${ep.checks.map((c, i) => quizHTML(c, `epq:${ep.id}:${i}`)).join("")}
        <div class="chips">${ep.concepts.map(chip).join("")}</div></div></div>`;
    const btn = document.getElementById("playBtn");
    const hl = (i) => { $app.querySelectorAll(".line").forEach((l) => l.classList.toggle("now", +l.dataset.line === i)); const cur = $app.querySelector(`[data-line="${i}"]`); if (cur) cur.scrollIntoView({ block: "center", behavior: "smooth" }); };
    const finish = () => {
      document.getElementById("epChecks").classList.remove("hidden");
      if (!S.done["ep:" + ep.id]) { S.done["ep:" + ep.id] = 1; seen(ep.concepts, "pod"); award(30, ep.concepts, "episódio"); }
    };
    const rec = (window.MM.AUDIO || {})[ep.id];
    if (rec) {
      /* Áudio gravado (Gemini TTS): um MP3 por episódio + início de cada fala. */
      const audio = (currentAudio = new Audio(rec.src));
      audio.preload = "metadata";
      audio.playbackRate = S.rate;
      btn.disabled = false;
      let lastLine = -1;
      const lineAt = (t) => { let i = 0; while (i + 1 < rec.starts.length && rec.starts[i + 1] <= t + 0.05) i++; return i; };
      audio.ontimeupdate = () => { const i = lineAt(audio.currentTime); if (i !== lastLine) { lastLine = i; hl(i); } };
      audio.onplay = () => { btn.textContent = "⏸ Pausar"; };
      audio.onpause = () => { if (!audio.ended) btn.textContent = "▶ Continuar"; };
      audio.onended = () => { btn.textContent = "▶ Ouvir de novo"; lastLine = -1; hl(-1); finish(); };
      audio.onerror = () => { btn.textContent = "Áudio indisponível"; btn.disabled = true; };
      btn.onclick = () => { audio.paused ? audio.play() : audio.pause(); };
      $app.querySelectorAll(".line").forEach((l) => l.onclick = () => { audio.currentTime = rec.starts[+l.dataset.line] || 0; audio.play(); });
      document.getElementById("rate").addEventListener("change", () => { audio.playbackRate = S.rate; });
      btn.insertAdjacentHTML("afterend", `<span class="rec-tag">🎙️ ${Math.floor(rec.duration / 60)}:${String(Math.round(rec.duration % 60)).padStart(2, "0")}</span>`);
    } else {
      /* Sem gravação: voz do navegador, fala por fala. */
      let playing = false, at = 0;
      const go = () => { playing = true; btn.textContent = "⏸ Pausar"; Speech.play(ep.lines, at, (i) => { at = i; hl(i); }, () => { playing = false; at = 0; btn.textContent = "▶ Ouvir de novo"; hl(-1); finish(); }); };
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
      <header class="page-head"><a href="#/casos" class="back">← Casos</a><p class="eyebrow">${esc(c.channel)}</p><h1><span class="h-icon">💬</span>${esc(c.title)}</h1></header>
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
      dec.innerHTML = `<div class="card result"><h2>${score}/${max}</h2><p>${msg}</p><div class="chips">${c.concepts.map(chip).join("")}</div>
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
        $app.innerHTML = header("🃏", title) + `<div class="card center"><h2>${good}/${total} de primeira</h2><p class="muted">Os que você errou voltam amanhã. Os que acertou, mais tarde. Esse espaçamento é o que faz a memória fixar.</p><div class="row gap center"><a class="btn ghost" href="#/fracos">Ver pontos fracos</a><a class="btn" href="#/">Início</a></div></div>`;
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
        k++; draw();
      };
    };
    draw();
  }

  /* ---------------- start ---------------- */
  router();
})();
