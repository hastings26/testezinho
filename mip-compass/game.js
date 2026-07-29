/* =============================================================================
   MIP COMPASS — GAME ENGINE
   =============================================================================
   Screens: welcome -> round (4 decisions) -> reveal -> ... -> results -> review
   All content comes from MIPStore (which reads data.js plus any admin edits).
   ============================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------------- utils */
  const $ = function (sel, root) { return (root || document).querySelector(sel); };

  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function h(tag, attrs, html) {
    const node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor((rng ? rng() : Math.random()) * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function prefersReducedMotion() {
    const prefs = MIPStore.getPrefs();
    if (prefs.reduceMotion === true) return true;
    if (prefs.reduceMotion === false) return false;
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function announce(msg) {
    const live = $('#mipcLive');
    if (!live) return;
    live.textContent = '';
    /* Force a change so screen readers re-announce identical strings. */
    window.setTimeout(function () { live.textContent = msg; }, 40);
  }

  /* ------------------------------------------------------------- app state */
  let config = MIPStore.getConfig();
  let state = null;
  let currentMap = null;

  const DECISION_ORDER = ['maturity', 'route', 'destination', 'conversation'];

  function reloadConfig() { config = MIPStore.getConfig(); }

  function stageById(id) {
    return config.stages.filter(function (s) { return s.id === id; })[0] || null;
  }
  function territoryById(id) {
    return config.territories.filter(function (t) { return t.id === id; })[0] || null;
  }
  function routeById(id) {
    return config.routes.filter(function (r) { return r.id === id; })[0] || null;
  }
  function scenarioById(id) {
    return MIPStore.getScenarios().filter(function (s) { return s.id === id; })[0] || null;
  }

  /* ---------------------------------------------------------------- scoring */

  /* Distance wording is more useful than generic credit wording here — being
     "one stage out" is a specific, coachable mistake. Used for both the
     automatic table and per-scenario overrides. */
  function maturityDistanceNote(dist, ahead) {
    if (dist === 0) return 'Exact read.';
    if (dist === 1) {
      return ahead
        ? 'One stage ahead. Close, but reading a partner as further along is how they end up with recommendations they cannot resource.'
        : 'One stage behind — close enough to still have a useful conversation, though this partner has more going on than you credited.';
    }
    if (dist === 2) {
      return ahead
        ? 'Two stages ahead. This is the gap that leads to recommending build or scale work before the basics exist.'
        : 'Two stages behind. Underreading a partner this far tends to produce advice they have already outgrown.';
    }
    return 'A long way from where this partner actually is.';
  }

  function scoreMaturity(scenario, picked) {
    const max = config.scoring.maxPerDecision;
    if (!picked) return { points: 0, note: 'No answer recorded.' };

    const ids = config.stages.map(function (s) { return s.id; });
    const a = ids.indexOf(picked);
    const b = ids.indexOf(scenario.idealMaturityStage);
    if (a < 0 || b < 0) return { points: 0, note: 'No answer recorded.' };

    const dist = Math.abs(a - b);
    const ahead = a > b;

    if (scenario.maturityCredit && typeof scenario.maturityCredit[picked] === 'number') {
      return { points: scenario.maturityCredit[picked], note: maturityDistanceNote(dist, ahead) };
    }

    const table = config.scoring.maturityByDistance || [50, 30, 10, 0, 0];
    const pts = dist < table.length ? table[dist] : 0;
    return { points: pts, note: maturityDistanceNote(dist, ahead) };
  }

  function scoreRoute(scenario, picked) {
    if (!picked) return { points: 0, note: 'No answer recorded.' };
    const credit = scenario.routeCredit || {};
    const pts = typeof credit[picked] === 'number' ? credit[picked] : 0;
    return { points: pts, note: creditNote(pts, config.scoring.maxPerDecision) };
  }

  function scoreDestination(scenario, picked) {
    if (!picked) return { points: 0, note: 'No answer recorded.' };
    const credit = scenario.destinationCredit || {};
    const pts = typeof credit[picked] === 'number' ? credit[picked] : 0;
    const notes = scenario.destinationNotes || {};
    return { points: pts, note: notes[picked] || creditNote(pts, config.scoring.maxPerDecision) };
  }

  function scoreConversation(scenario, picked) {
    if (!picked) return { points: 0, note: 'No answer recorded.' };
    const opt = (scenario.conversationOptions || []).filter(function (o) { return o.id === picked; })[0];
    if (!opt) return { points: 0, note: 'No answer recorded.' };
    return { points: opt.points || 0, note: opt.note || creditNote(opt.points || 0, config.scoring.maxPerDecision) };
  }

  function creditNote(pts, max) {
    if (pts >= max) return 'The strongest available answer.';
    if (pts >= max * 0.7) return 'Very close — defensible, with a slightly stronger option available.';
    if (pts >= max * 0.4) return 'Reasonable, but it moves ahead of what this partner has established.';
    if (pts > 0) return 'Understandable instinct. It is unlikely to move this partner forward.';
    return 'This one would cost the partner time or credibility.';
  }

  function scoreRound(scenario, answers) {
    const s = {
      maturity: scoreMaturity(scenario, answers.maturity),
      route: scoreRoute(scenario, answers.route),
      destination: scoreDestination(scenario, answers.destination),
      conversation: scoreConversation(scenario, answers.conversation)
    };
    const total = DECISION_ORDER.reduce(function (sum, k) { return sum + s[k].points; }, 0);
    const band = (config.toneBands || []).filter(function (b) { return total >= b.min; })[0]
      || { headline: 'Round complete', mood: 'fair' };
    return { parts: s, total: total, band: band };
  }

  /* ------------------------------------------------------------ mission I/O */

  /* Themed missions: mip-compass.html?theme=governance restricts the pool to
     scenarios tagged with that theme. Falls back to the full pool if the tag
     matches nothing, so a stale link never produces an empty mission. */
  function missionTheme() {
    try {
      const p = new URLSearchParams(window.location.search).get('theme');
      return p ? p.trim().toLowerCase() : null;
    } catch (e) { return null; }
  }

  function newMission() {
    const all = MIPStore.getActiveScenarios();
    const theme = missionTheme();
    let pool = all;
    if (theme) {
      const tagged = all.filter(function (s) {
        return (s.tags || []).some(function (t) { return String(t).toLowerCase() === theme; });
      });
      if (tagged.length) pool = tagged;
    }
    const count = Math.min(config.mission.scenariosPerMission, pool.length);
    const picked = shuffle(pool).slice(0, count);
    state = {
      missionId: 'm' + Date.now(),
      theme: theme || null,
      startedAt: Date.now(),
      scenarioIds: picked.map(function (s) { return s.id; }),
      index: 0,
      step: 0,
      answers: picked.map(function (s) {
        return { scenarioId: s.id, maturity: null, route: null, destination: null, conversation: null };
      }),
      results: [],
      revealed: false,
      finished: false
    };
    MIPStore.saveProgress(state);
    MIPStore.track('mission_started', {
      missionId: state.missionId,
      scenarioCount: count,
      theme: theme || null
    });
    return state;
  }

  function saveState() { if (state) MIPStore.saveProgress(state); }

  function currentScenario() {
    if (!state) return null;
    return scenarioById(state.scenarioIds[state.index]);
  }

  function currentAnswers() { return state.answers[state.index]; }

  /* ---------------------------------------------------------------- screens */

  const root = function () { return $('#mipcApp'); };

  function show(node) {
    const app = root();
    app.innerHTML = '';
    app.appendChild(node);
    /* Move focus to the new screen heading for screen-reader users. */
    const heading = app.querySelector('h1, h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  /* ---- WELCOME ---------------------------------------------------------- */
  function renderWelcome() {
    reloadConfig();
    const b = config.brand;
    const resume = MIPStore.getProgress();
    const canResume = resume && !resume.finished && resume.scenarioIds && resume.scenarioIds.length;

    const wrap = h('section', { class: 'screen screen--welcome' });

    wrap.appendChild(h('div', { class: 'welcome-art', 'aria-hidden': 'true' }, ''
      + '<div class="orb orb-1"></div><div class="orb orb-2"></div><div class="orb orb-3"></div>'));

    const inner = h('div', { class: 'welcome-inner' });
    inner.appendChild(h('p', { class: 'eyebrow', text: 'Partner readiness · MIP framework' }));
    inner.appendChild(h('h1', { class: 'welcome-title', text: b.productName }));
    inner.appendChild(h('p', { class: 'welcome-tagline', text: b.tagline }));
    inner.appendChild(h('p', { class: 'welcome-copy', text: b.intro }));

    const meta = h('div', { class: 'welcome-meta' });
    meta.appendChild(h('span', { class: 'pill' }, '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7v5l3 2" /><circle cx="12" cy="12" r="9" /></svg> About ' + esc(b.estimatedMinutes) + ' minutes'));
    meta.appendChild(h('span', { class: 'pill' }, '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18h4V9H4zM10 18h4V4h-4zM16 18h4v-6h-4z" /></svg> ' + esc(config.mission.scenariosPerMission) + ' partners · ' + esc(config.mission.maxScore) + ' points'));
    inner.appendChild(meta);

    const actions = h('div', { class: 'welcome-actions' });

    if (canResume) {
      const resumeBtn = h('button', { class: 'btn btn--primary', type: 'button' },
        'Resume mission <span class="btn-sub">Partner ' + (resume.index + 1) + ' of ' + resume.scenarioIds.length + '</span>');
      resumeBtn.addEventListener('click', function () {
        state = resume;
        renderRound();
      });
      actions.appendChild(resumeBtn);

      const fresh = h('button', { class: 'btn btn--ghost', type: 'button', text: 'Start a new mission' });
      fresh.addEventListener('click', function () { newMission(); renderRound(); });
      actions.appendChild(fresh);
    } else {
      const start = h('button', { class: 'btn btn--primary', type: 'button', text: 'Start today’s mission' });
      start.addEventListener('click', function () { newMission(); renderRound(); });
      actions.appendChild(start);
    }

    const how = h('button', { class: 'btn btn--ghost', type: 'button', text: 'How to play' });
    how.addEventListener('click', showHowTo);
    actions.appendChild(how);

    inner.appendChild(actions);

    /* territory preview strip */
    const strip = h('div', { class: 'territory-strip' });
    strip.appendChild(h('p', { class: 'strip-label', text: 'The six plays of the MIP Landscape' }));
    const chips = h('ul', { class: 'chip-row' });
    config.territories.forEach(function (t) {
      const li = h('li', { class: 'chip', style: '--chip:' + t.color },
        '<span class="chip-dot"></span><strong>' + esc(t.label) + '</strong><span class="chip-sub">' + esc(t.placeName) + '</span>');
      chips.appendChild(li);
    });
    strip.appendChild(chips);
    inner.appendChild(strip);

    wrap.appendChild(inner);
    show(wrap);
  }

  /* ---- HOW TO PLAY ------------------------------------------------------ */
  function showHowTo() {
    const body = ''
      + '<ol class="howto-list">'
      + '<li><strong>Read the partner.</strong> Each profile has a quote and one or two clues that matter more than the rest.</li>'
      + '<li><strong>Place them on the journey.</strong> Where is this partner today, honestly?</li>'
      + '<li><strong>Choose a route.</strong> Broker, Builder, blended — or admit you do not know enough yet.</li>'
      + '<li><strong>Pick the next play.</strong> Tap a territory on the MIP Landscape.</li>'
      + '<li><strong>Choose the conversation.</strong> What would you actually say next?</li>'
      + '</ol>'
      + '<p class="howto-note">Answers are rarely simply right or wrong. Reasonable-but-early answers earn partial credit, and you will always see why.</p>';
    openModal('How to play', body);
  }

  /* ---- MODAL ------------------------------------------------------------ */
  let lastFocused = null;
  function openModal(title, html) {
    lastFocused = document.activeElement;
    const back = h('div', { class: 'modal-backdrop' });
    const modal = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': title });
    modal.appendChild(h('h2', { class: 'modal-title', text: title }));
    modal.appendChild(h('div', { class: 'modal-body' }, html));
    const close = h('button', { class: 'btn btn--primary modal-close', type: 'button', text: 'Got it' });
    modal.appendChild(close);
    back.appendChild(modal);
    document.body.appendChild(back);

    function dismiss() {
      back.remove();
      if (lastFocused && lastFocused.focus) lastFocused.focus();
      document.removeEventListener('keydown', onKey);
    }
    function onKey(ev) {
      if (ev.key === 'Escape') dismiss();
      if (ev.key === 'Tab') {
        /* simple focus trap */
        const f = modal.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
        else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
      }
    }
    close.addEventListener('click', dismiss);
    back.addEventListener('click', function (ev) { if (ev.target === back) dismiss(); });
    document.addEventListener('keydown', onKey);
    close.focus();
  }

  /* ---- SHARED CHROME ---------------------------------------------------- */
  function renderProgress() {
    const bar = h('div', { class: 'mission-progress' });

    const dots = h('ol', { class: 'progress-dots', 'aria-label': 'Mission progress' });
    state.scenarioIds.forEach(function (id, i) {
      const done = i < state.results.length;
      const active = i === state.index;
      const li = h('li', {
        class: 'dot' + (done ? ' is-done' : '') + (active ? ' is-active' : ''),
        'aria-current': active ? 'step' : 'false'
      });
      li.appendChild(h('span', { class: 'dot-num', text: String(i + 1) }));
      if (done) {
        const r = state.results[i];
        li.appendChild(h('span', { class: 'dot-score', text: r.total + '' }));
        li.setAttribute('title', 'Partner ' + (i + 1) + ': ' + r.total + ' of ' + config.mission.pointsPerScenario);
      }
      dots.appendChild(li);
    });
    bar.appendChild(dots);

    const runningTotal = state.results.reduce(function (a, r) { return a + r.total; }, 0);
    bar.appendChild(h('div', { class: 'progress-score' },
      '<span class="score-label">Score</span><span class="score-value">' + runningTotal + '</span><span class="score-max">/ ' + config.mission.maxScore + '</span>'));

    return bar;
  }

  function renderScenarioCard(sc, collapsedOnMobile) {
    const card = h('article', { class: 'partner-card' + (collapsedOnMobile ? ' is-collapsible' : '') });

    const head = h('header', { class: 'partner-head' });
    const avatar = h('div', { class: 'partner-avatar', 'aria-hidden': 'true', text: initials(sc.partnerName) });
    head.appendChild(avatar);
    const ht = h('div', { class: 'partner-head-text' });
    ht.appendChild(h('h3', { class: 'partner-name', text: sc.partnerName }));
    ht.appendChild(h('p', { class: 'partner-sub', text: sc.companySize + ' · ' + sc.customerProfile }));
    head.appendChild(ht);
    card.appendChild(head);

    const toggle = h('button', { class: 'partner-toggle', type: 'button', 'aria-expanded': 'true', text: 'Hide partner details' });
    const bodyWrap = h('div', { class: 'partner-body', id: 'partnerBody' });

    const facts = h('dl', { class: 'partner-facts' });
    function fact(label, value, icon) {
      facts.appendChild(h('div', { class: 'fact' },
        '<dt><span class="fact-icon" aria-hidden="true">' + icon + '</span>' + esc(label) + '</dt><dd>' + value + '</dd>'));
    }
    fact('Current services', '<ul class="tag-list">' + (sc.currentServices || []).map(function (s) {
      return '<li>' + esc(s) + '</li>';
    }).join('') + '</ul>', '&#9679;');
    fact('AI activity today', esc(sc.aiActivity), '&#9678;');
    fact('Commercial ambition', esc(sc.ambition), '&#9650;');
    fact('Constraints', '<ul class="tag-list tag-list--warn">' + (sc.constraints || []).map(function (s) {
      return '<li>' + esc(s) + '</li>';
    }).join('') + '</ul>', '&#9888;');
    bodyWrap.appendChild(facts);

    bodyWrap.appendChild(h('blockquote', { class: 'partner-quote' },
      '<p>' + esc(sc.partnerQuote) + '</p><cite>' + esc(sc.partnerName) + '</cite>'));

    if (sc.clues && sc.clues.length) {
      const clues = h('div', { class: 'partner-clues' });
      clues.appendChild(h('p', { class: 'clues-label' }, '<span aria-hidden="true">&#9758;</span> Worth noticing'));
      const ul = h('ul');
      sc.clues.forEach(function (c) { ul.appendChild(h('li', { text: c })); });
      clues.appendChild(ul);
      bodyWrap.appendChild(clues);
    }

    card.appendChild(toggle);
    card.appendChild(bodyWrap);

    toggle.addEventListener('click', function () {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      toggle.textContent = open ? 'Show partner details' : 'Hide partner details';
      card.classList.toggle('is-collapsed', open);
    });

    return card;
  }

  function initials(name) {
    return String(name || '?').split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
  }

  /* ---- ROUND ------------------------------------------------------------ */
  function renderRound() {
    reloadConfig();
    const sc = currentScenario();
    if (!sc) { renderResults(); return; }

    state.revealed = false;
    saveState();

    const wrap = h('section', { class: 'screen screen--round' });
    wrap.appendChild(renderProgress());

    const layout = h('div', { class: 'round-layout' });
    layout.appendChild(renderScenarioCard(sc, true));

    const panel = h('div', { class: 'decision-panel' });
    panel.id = 'decisionPanel';
    layout.appendChild(panel);

    wrap.appendChild(layout);
    show(wrap);

    renderStep();
  }

  function renderStep() {
    const panel = $('#decisionPanel');
    if (!panel) return;
    const sc = currentScenario();
    const ans = currentAnswers();
    const stepIndex = state.step || 0;
    const decision = config.decisions[stepIndex];

    panel.innerHTML = '';

    /* step header */
    const head = h('div', { class: 'step-head' });
    head.appendChild(h('p', { class: 'step-count', text: 'Decision ' + (stepIndex + 1) + ' of ' + config.decisions.length }));
    head.appendChild(h('h2', { class: 'step-question', text: decision.question }));
    panel.appendChild(head);

    const bodyEl = h('div', { class: 'step-body' });
    panel.appendChild(bodyEl);

    if (decision.id === 'maturity')      renderMaturityStep(bodyEl, sc, ans);
    if (decision.id === 'route')         renderRouteStep(bodyEl, sc, ans);
    if (decision.id === 'destination')   renderDestinationStep(bodyEl, sc, ans);
    if (decision.id === 'conversation')  renderConversationStep(bodyEl, sc, ans);

    /* nav */
    const nav = h('div', { class: 'step-nav' });
    if (stepIndex > 0) {
      const back = h('button', { class: 'btn btn--ghost', type: 'button', text: 'Back' });
      back.addEventListener('click', function () { state.step = stepIndex - 1; saveState(); renderStep(); });
      nav.appendChild(back);
    } else {
      nav.appendChild(h('span', {}));
    }

    const isLast = stepIndex === config.decisions.length - 1;
    const next = h('button', {
      class: 'btn btn--primary', type: 'button',
      text: isLast ? 'Submit round' : 'Next'
    });
    next.disabled = !ans[decision.id];
    next.addEventListener('click', function () {
      if (!ans[decision.id]) return;
      if (isLast) { submitRound(); }
      else { state.step = stepIndex + 1; saveState(); renderStep(); }
    });
    nav.appendChild(next);
    panel.appendChild(nav);

    panel.dataset.decision = decision.id;
    panel._next = next;
  }

  function enableNext() {
    const panel = $('#decisionPanel');
    if (panel && panel._next) panel._next.disabled = false;
  }

  /* ---- STEP 1: MATURITY ------------------------------------------------- */
  function renderMaturityStep(container, sc, ans) {
    container.appendChild(h('p', { class: 'step-hint', text: 'Be honest rather than generous. A partner placed too far ahead gets recommendations they cannot resource.' }));

    const group = h('div', { class: 'stage-track', role: 'radiogroup', 'aria-label': 'Maturity stage' });

    const line = h('div', { class: 'stage-line', 'aria-hidden': 'true' });
    group.appendChild(line);

    config.stages.forEach(function (stage, i) {
      const btn = h('button', {
        class: 'stage', type: 'button', role: 'radio',
        'aria-checked': ans.maturity === stage.id ? 'true' : 'false',
        'data-stage': stage.id,
        style: '--i:' + i
      });
      btn.appendChild(h('span', { class: 'stage-node', 'aria-hidden': 'true' },
        '<span class="stage-num">' + (i + 1) + '</span>'));
      btn.appendChild(h('span', { class: 'stage-label', text: stage.label }));
      btn.appendChild(h('span', { class: 'stage-desc', text: stage.description }));

      btn.addEventListener('click', function () { pickStage(stage.id); });
      btn.addEventListener('keydown', function (ev) {
        let target = null;
        if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') target = config.stages[(i + 1) % config.stages.length];
        if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') target = config.stages[(i - 1 + config.stages.length) % config.stages.length];
        if (target) {
          ev.preventDefault();
          pickStage(target.id);
          group.querySelector('[data-stage="' + target.id + '"]').focus();
        }
      });
      group.appendChild(btn);
    });

    function pickStage(id) {
      ans.maturity = id;
      saveState();
      Array.prototype.forEach.call(group.querySelectorAll('.stage'), function (b) {
        const on = b.getAttribute('data-stage') === id;
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.classList.toggle('is-selected', on);
        b.tabIndex = on ? 0 : -1;
      });
      enableNext();
      announce('Selected ' + stageById(id).label);
    }

    container.appendChild(group);

    /* set roving tabindex */
    const initial = ans.maturity || null;
    Array.prototype.forEach.call(group.querySelectorAll('.stage'), function (b, i) {
      const on = b.getAttribute('data-stage') === initial;
      b.classList.toggle('is-selected', on);
      b.tabIndex = initial ? (on ? 0 : -1) : (i === 0 ? 0 : -1);
    });
  }

  /* ---- STEP 2: ROUTE ---------------------------------------------------- */
  function renderRouteStep(container, sc, ans) {
    container.appendChild(h('p', { class: 'step-hint', text: 'Neither route is better. The question is which one this partner can credibly run right now.' }));

    const group = h('div', { class: 'route-grid', role: 'radiogroup', 'aria-label': 'Commercial route' });

    config.routes.forEach(function (route, i) {
      const btn = h('button', {
        class: 'route-card', type: 'button', role: 'radio',
        'aria-checked': ans.route === route.id ? 'true' : 'false',
        'data-route': route.id
      });
      btn.appendChild(h('span', { class: 'route-icon', 'aria-hidden': 'true' }, routeIcon(route.id)));
      btn.appendChild(h('span', { class: 'route-label', text: route.label }));
      btn.appendChild(h('span', { class: 'route-short', text: route.short }));
      btn.appendChild(h('span', { class: 'route-desc', text: route.description }));

      btn.addEventListener('click', function () { pick(route.id); });
      btn.addEventListener('mouseenter', function () { if (currentMap) currentMap.highlightRoute(route.id); });
      btn.addEventListener('focus', function () { if (currentMap) currentMap.highlightRoute(route.id); });
      btn.addEventListener('keydown', function (ev) {
        let t = null;
        if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') t = config.routes[(i + 1) % config.routes.length];
        if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') t = config.routes[(i - 1 + config.routes.length) % config.routes.length];
        if (t) { ev.preventDefault(); pick(t.id); group.querySelector('[data-route="' + t.id + '"]').focus(); }
      });
      group.appendChild(btn);
    });

    function pick(id) {
      ans.route = id;
      saveState();
      Array.prototype.forEach.call(group.querySelectorAll('.route-card'), function (b) {
        const on = b.getAttribute('data-route') === id;
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.classList.toggle('is-selected', on);
        b.tabIndex = on ? 0 : -1;
      });
      enableNext();
      announce('Selected ' + routeById(id).label);
    }

    container.appendChild(group);

    Array.prototype.forEach.call(group.querySelectorAll('.route-card'), function (b, i) {
      const on = b.getAttribute('data-route') === ans.route;
      b.classList.toggle('is-selected', on);
      b.tabIndex = ans.route ? (on ? 0 : -1) : (i === 0 ? 0 : -1);
    });
  }

  function routeIcon(id) {
    if (id === 'broker') return '<svg viewBox="0 0 24 24"><path d="M3 17h4l3-9 3 12 3-8h5"/></svg>';
    if (id === 'builder') return '<svg viewBox="0 0 24 24"><path d="M4 20h16M6 20V9l6-5 6 5v11M10 20v-5h4v5"/></svg>';
    if (id === 'blended') return '<svg viewBox="0 0 24 24"><path d="M4 8h6a6 6 0 0 1 6 6v2M4 16h6a6 6 0 0 0 6-6V8"/><circle cx="19" cy="8" r="2"/><circle cx="19" cy="16" r="2"/></svg>';
    return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 1 1 3.4 2.5c-.6.2-.9.7-.9 1.3v.4"/><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/></svg>';
  }

  /* ---- STEP 3: DESTINATION ---------------------------------------------- */
  function renderDestinationStep(container, sc, ans) {
    container.appendChild(h('p', { class: 'step-hint', text: 'Tap a territory on the map, or use the list below it. Both work with a keyboard.' }));

    const mapWrap = h('div', { class: 'map-wrap' });
    container.appendChild(mapWrap);

    currentMap = MIPMap.create(mapWrap, {
      interactive: true,
      onSelect: function (id) {
        ans.destination = id;
        saveState();
        syncList(id);
        enableNext();
        const t = territoryById(id);
        announce('Selected ' + t.placeName);
      }
    });

    if (ans.route) currentMap.highlightRoute(ans.route);
    if (ans.destination) currentMap.setSelected(ans.destination, true);

    /* Text list — a full alternative to the map, never a second-class one. */
    const list = h('div', { class: 'territory-list', role: 'radiogroup', 'aria-label': 'Next MIP play' });
    config.territories.forEach(function (t) {
      const btn = h('button', {
        class: 'territory-option', type: 'button', role: 'radio',
        'aria-checked': ans.destination === t.id ? 'true' : 'false',
        'data-territory': t.id, style: '--chip:' + t.color
      });
      btn.appendChild(h('span', { class: 'to-dot', 'aria-hidden': 'true' }));
      const tx = h('span', { class: 'to-text' });
      tx.appendChild(h('strong', { text: t.label }));
      tx.appendChild(h('span', { class: 'to-place', text: t.placeName }));
      tx.appendChild(h('span', { class: 'to-blurb', text: t.blurb }));
      btn.appendChild(tx);
      btn.addEventListener('click', function () {
        currentMap.setSelected(t.id);
      });
      list.appendChild(btn);
    });
    container.appendChild(list);

    function syncList(id) {
      Array.prototype.forEach.call(list.querySelectorAll('.territory-option'), function (b) {
        const on = b.getAttribute('data-territory') === id;
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.classList.toggle('is-selected', on);
      });
    }
    if (ans.destination) syncList(ans.destination);
  }

  /* ---- STEP 4: CONVERSATION --------------------------------------------- */
  function renderConversationStep(container, sc, ans) {
    container.appendChild(h('p', { class: 'step-hint', text: 'One option is strongest. One or two others are defensible and will earn partial credit.' }));

    const group = h('div', { class: 'convo-list', role: 'radiogroup', 'aria-label': 'Next question or action' });
    const opts = sc.conversationOptions || [];

    opts.forEach(function (o, i) {
      const btn = h('button', {
        class: 'convo-option', type: 'button', role: 'radio',
        'aria-checked': ans.conversation === o.id ? 'true' : 'false',
        'data-option': o.id
      });
      btn.appendChild(h('span', { class: 'convo-key', 'aria-hidden': 'true', text: String.fromCharCode(65 + i) }));
      btn.appendChild(h('span', { class: 'convo-text', text: '“' + o.text + '”' }));
      btn.addEventListener('click', function () { pick(o.id); });
      btn.addEventListener('keydown', function (ev) {
        let t = null;
        if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') t = opts[(i + 1) % opts.length];
        if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') t = opts[(i - 1 + opts.length) % opts.length];
        if (t) { ev.preventDefault(); pick(t.id); group.querySelector('[data-option="' + t.id + '"]').focus(); }
      });
      group.appendChild(btn);
    });

    function pick(id) {
      ans.conversation = id;
      saveState();
      Array.prototype.forEach.call(group.querySelectorAll('.convo-option'), function (b) {
        const on = b.getAttribute('data-option') === id;
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.classList.toggle('is-selected', on);
        b.tabIndex = on ? 0 : -1;
      });
      enableNext();
      announce('Option selected');
    }

    container.appendChild(group);

    Array.prototype.forEach.call(group.querySelectorAll('.convo-option'), function (b, i) {
      const on = b.getAttribute('data-option') === ans.conversation;
      b.classList.toggle('is-selected', on);
      b.tabIndex = ans.conversation ? (on ? 0 : -1) : (i === 0 ? 0 : -1);
    });
  }

  /* ---- SUBMIT + REVEAL -------------------------------------------------- */
  function submitRound() {
    const sc = currentScenario();
    const ans = currentAnswers();
    const scored = scoreRound(sc, ans);

    state.results[state.index] = {
      scenarioId: sc.id,
      partnerName: sc.partnerName,
      answers: JSON.parse(JSON.stringify(ans)),
      parts: scored.parts,
      total: scored.total,
      band: scored.band
    };
    state.revealed = true;
    saveState();

    MIPStore.track('round_scored', {
      missionId: state.missionId,
      scenarioId: sc.id,
      partnerName: sc.partnerName,
      total: scored.total,
      scores: {
        maturity: scored.parts.maturity.points,
        route: scored.parts.route.points,
        destination: scored.parts.destination.points,
        conversation: scored.parts.conversation.points
      },
      picked: {
        maturity: ans.maturity,
        route: ans.route,
        destination: ans.destination,
        conversation: ans.conversation
      }
    });

    renderReveal();
  }

  function renderReveal() {
    const sc = currentScenario();
    const result = state.results[state.index];
    const ans = result.answers;

    const wrap = h('section', { class: 'screen screen--reveal' });
    wrap.appendChild(renderProgress());

    /* headline */
    const head = h('div', { class: 'reveal-head mood-' + result.band.mood });
    head.appendChild(h('div', { class: 'reveal-badge', 'aria-hidden': 'true' }, moodIcon(result.band.mood)));
    const ht = h('div', {});
    ht.appendChild(h('h2', { class: 'reveal-headline', text: result.band.headline }));
    ht.appendChild(h('p', { class: 'reveal-partner', text: sc.partnerName }));
    head.appendChild(ht);
    const scoreBox = h('div', { class: 'reveal-score' });
    scoreBox.appendChild(h('span', { class: 'rs-value', text: String(result.total) }));
    scoreBox.appendChild(h('span', { class: 'rs-max', text: 'of ' + config.mission.pointsPerScenario }));
    head.appendChild(scoreBox);
    wrap.appendChild(head);

    /* four decision rows */
    const rows = h('div', { class: 'reveal-rows' });

    rows.appendChild(revealRow({
      label: 'Where they are today',
      yours: ans.maturity ? stageById(ans.maturity).label : '—',
      ideal: stageById(sc.idealMaturityStage).label,
      match: ans.maturity === sc.idealMaturityStage,
      points: result.parts.maturity.points,
      note: result.parts.maturity.note,
      explanation: sc.maturityExplanation
    }));

    rows.appendChild(revealRow({
      label: 'Commercial route',
      yours: ans.route ? routeById(ans.route).label : '—',
      ideal: routeById(sc.idealRoute).label,
      match: ans.route === sc.idealRoute,
      points: result.parts.route.points,
      note: result.parts.route.note,
      explanation: sc.routeExplanation
    }));

    rows.appendChild(revealRow({
      label: 'Next play',
      yours: ans.destination ? territoryById(ans.destination).label : '—',
      ideal: territoryById(sc.idealDestination).label,
      match: ans.destination === sc.idealDestination,
      points: result.parts.destination.points,
      note: result.parts.destination.note,
      explanation: sc.destinationExplanation
    }));

    const yourOpt = (sc.conversationOptions || []).filter(function (o) { return o.id === ans.conversation; })[0];
    const bestOpt = (sc.conversationOptions || []).slice().sort(function (a, b) { return (b.points || 0) - (a.points || 0); })[0];
    rows.appendChild(revealRow({
      label: 'The conversation',
      yours: yourOpt ? '“' + yourOpt.text + '”' : '—',
      ideal: bestOpt ? '“' + bestOpt.text + '”' : '—',
      match: yourOpt && bestOpt && yourOpt.id === bestOpt.id,
      points: result.parts.conversation.points,
      note: result.parts.conversation.note,
      explanation: sc.conversationExplanation,
      long: true
    }));

    wrap.appendChild(rows);

    /* mini map */
    const mapCard = h('div', { class: 'mini-map-card' });
    mapCard.appendChild(h('h3', { class: 'mini-map-title', text: 'Where you sent them' }));
    const mm = h('div', { class: 'mini-map' });
    mapCard.appendChild(mm);
    const legend = h('div', { class: 'mini-legend' });
    legend.appendChild(h('span', { class: 'legend-item' }, '<span class="legend-pin legend-pin--player" aria-hidden="true"></span> Your choice'));
    legend.appendChild(h('span', { class: 'legend-item' }, '<span class="legend-pin legend-pin--ideal" aria-hidden="true"></span> Recommended'));
    mapCard.appendChild(legend);
    wrap.appendChild(mapCard);

    /* talk track */
    if (sc.talkTrack) {
      const tt = h('div', { class: 'talk-track' });
      tt.appendChild(h('p', { class: 'tt-label' }, '<span aria-hidden="true">&#128172;</span> Try saying'));
      tt.appendChild(h('blockquote', {}, '<p>' + esc(sc.talkTrack) + '</p>'));
      const copy = h('button', { class: 'btn btn--tiny', type: 'button', text: 'Copy this line' });
      copy.addEventListener('click', function () {
        copyText(sc.talkTrack, copy, 'Copy this line');
      });
      tt.appendChild(copy);
      wrap.appendChild(tt);
    }

    if (sc.ambiguityNote) {
      wrap.appendChild(h('p', { class: 'ambiguity-note' }, '<span aria-hidden="true">&#9432;</span> ' + esc(sc.ambiguityNote)));
    }

    /* nav */
    const nav = h('div', { class: 'reveal-nav' });
    const isLast = state.index >= state.scenarioIds.length - 1;
    const next = h('button', { class: 'btn btn--primary', type: 'button', text: isLast ? 'See your results' : 'Next partner' });
    next.addEventListener('click', function () {
      if (isLast) { finishMission(); }
      else {
        state.index += 1;
        state.step = 0;
        state.revealed = false;
        saveState();
        renderRound();
      }
    });
    nav.appendChild(next);
    wrap.appendChild(nav);

    show(wrap);

    /* draw the mini map after it is in the DOM so it can size itself */
    const mini = MIPMap.create(mm, { interactive: false, compact: true });
    const markers = [];
    if (ans.destination) markers.push({ territory: ans.destination, kind: 'player' });
    markers.push({ territory: sc.idealDestination, kind: 'ideal' });
    mini.setMarkers(markers);
    mini.highlightRoute(sc.idealRoute);

    announce(result.band.headline + '. ' + result.total + ' of ' + config.mission.pointsPerScenario + ' points.');
  }

  function revealRow(opts) {
    const max = config.scoring.maxPerDecision;
    const pct = Math.round((opts.points / max) * 100);
    const grade = opts.points >= max ? 'full' : (opts.points >= max * 0.6 ? 'high' : (opts.points > 0 ? 'part' : 'none'));

    const row = h('div', { class: 'reveal-row grade-' + grade + (opts.long ? ' is-long' : '') });

    const top = h('div', { class: 'rr-top' });
    top.appendChild(h('h3', { class: 'rr-label', text: opts.label }));
    const pts = h('span', { class: 'rr-points' });
    pts.appendChild(h('span', { class: 'rr-pts-icon', 'aria-hidden': 'true' }, gradeIcon(grade)));
    pts.appendChild(h('span', { text: opts.points + ' / ' + max }));
    top.appendChild(pts);
    row.appendChild(top);

    const bar = h('div', { class: 'rr-bar', role: 'img', 'aria-label': opts.points + ' of ' + max + ' points' });
    bar.appendChild(h('span', { class: 'rr-bar-fill', style: 'width:' + pct + '%' }));
    row.appendChild(bar);

    const cmp = h('div', { class: 'rr-compare' });
    const yours = h('div', { class: 'rr-cell rr-cell--yours' });
    yours.appendChild(h('span', { class: 'rr-cell-label', text: 'You said' }));
    yours.appendChild(h('span', { class: 'rr-cell-value', text: opts.yours }));
    cmp.appendChild(yours);

    if (!opts.match) {
      const ideal = h('div', { class: 'rr-cell rr-cell--ideal' });
      ideal.appendChild(h('span', { class: 'rr-cell-label', text: 'Strongest answer' }));
      ideal.appendChild(h('span', { class: 'rr-cell-value', text: opts.ideal }));
      cmp.appendChild(ideal);
    } else {
      const ideal = h('div', { class: 'rr-cell rr-cell--ideal is-match' });
      ideal.appendChild(h('span', { class: 'rr-cell-label', text: 'Strongest answer' }));
      ideal.appendChild(h('span', { class: 'rr-cell-value', text: 'This was it' }));
      cmp.appendChild(ideal);
    }
    row.appendChild(cmp);

    if (opts.note) row.appendChild(h('p', { class: 'rr-note', text: opts.note }));
    if (opts.explanation) row.appendChild(h('p', { class: 'rr-explain', text: opts.explanation }));

    return row;
  }

  function moodIcon(mood) {
    if (mood === 'excellent') return '<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.4l6.1-.8z"/></svg>';
    if (mood === 'good') return '<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5 11-11"/></svg>';
    if (mood === 'fair') return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6"/><circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none"/></svg>';
    if (mood === 'early') return '<svg viewBox="0 0 24 24"><path d="M12 3v18M5 10l7-7 7 7"/></svg>';
    return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg>';
  }

  function gradeIcon(grade) {
    if (grade === 'full') return '<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5 11-11"/></svg>';
    if (grade === 'high') return '<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5 11-11"/></svg>';
    if (grade === 'part') return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 12l5-3"/></svg>';
    return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg>';
  }

  /* ---- RESULTS ---------------------------------------------------------- */
  function finishMission() {
    state.finished = true;
    state.finishedAt = Date.now();
    saveState();

    const total = state.results.reduce(function (a, r) { return a + r.total; }, 0);
    MIPStore.track('mission_completed', {
      missionId: state.missionId,
      score: total,
      durationMs: state.finishedAt - state.startedAt,
      scenarioIds: state.scenarioIds
    });
    renderResults();
  }

  function decisionAverages() {
    const out = {};
    DECISION_ORDER.forEach(function (k) {
      const vals = state.results.map(function (r) { return r.parts[k].points; });
      out[k] = vals.length ? vals.reduce(function (a, b) { return a + b; }, 0) / vals.length : 0;
    });
    return out;
  }

  function renderResults() {
    reloadConfig();
    const total = state.results.reduce(function (a, r) { return a + r.total; }, 0);
    const title = (config.titles || []).filter(function (t) { return total >= t.min; })[0]
      || { title: 'Commercial Explorer', note: '' };

    const avgs = decisionAverages();
    const ranked = DECISION_ORDER.slice().sort(function (a, b) { return avgs[b] - avgs[a]; });
    const strongest = config.decisions.filter(function (d) { return d.id === ranked[0]; })[0];
    const weakest = config.decisions.filter(function (d) { return d.id === ranked[ranked.length - 1]; })[0];

    const wrap = h('section', { class: 'screen screen--results' });

    /* hero */
    const hero = h('div', { class: 'results-hero' });
    hero.appendChild(h('p', { class: 'eyebrow', text: 'Mission complete' }));

    const ring = h('div', { class: 'score-ring', role: 'img', 'aria-label': 'You scored ' + total + ' out of ' + config.mission.maxScore });
    const pct = Math.round((total / config.mission.maxScore) * 100);
    ring.innerHTML = ''
      + '<svg viewBox="0 0 140 140" aria-hidden="true">'
      + '<circle cx="70" cy="70" r="60" class="ring-track"/>'
      + '<circle cx="70" cy="70" r="60" class="ring-fill" style="stroke-dasharray:' + (pct * 3.7699) + ' 377"/>'
      + '</svg>'
      + '<div class="ring-inner"><span class="ring-score">' + total + '</span><span class="ring-max">of ' + config.mission.maxScore + '</span></div>';
    hero.appendChild(ring);

    hero.appendChild(h('h1', { class: 'results-title', text: title.title }));
    if (title.note) hero.appendChild(h('p', { class: 'results-note', text: title.note }));
    wrap.appendChild(hero);

    /* insight */
    const insight = h('div', { class: 'insight-grid' });
    insight.appendChild(insightCard('Strongest capability', strongest.label,
      'Averaging ' + avgs[ranked[0]].toFixed(0) + ' of ' + config.scoring.maxPerDecision + ' on this decision.', 'up'));
    insight.appendChild(insightCard('Development area', weakest.label,
      'Averaging ' + avgs[ranked[ranked.length - 1]].toFixed(0) + ' of ' + config.scoring.maxPerDecision + '. ' + developmentAdvice(weakest.id), 'focus'));
    wrap.appendChild(insight);

    /* practical action */
    const action = h('div', { class: 'action-card' });
    action.appendChild(h('h2', { class: 'action-title' }, '<span aria-hidden="true">&#9654;</span> One thing to use in your next partner conversation'));
    action.appendChild(h('p', { class: 'action-body', text: practicalAction(weakest.id) }));
    wrap.appendChild(action);

    /* scenario breakdown */
    const bd = h('div', { class: 'breakdown' });
    bd.appendChild(h('h2', { class: 'section-title', text: 'Scenario by scenario' }));
    const table = h('div', { class: 'breakdown-rows' });
    state.results.forEach(function (r, i) {
      const row = h('div', { class: 'bd-row' });
      row.appendChild(h('span', { class: 'bd-index', text: String(i + 1) }));
      const nameCol = h('div', { class: 'bd-name' });
      nameCol.appendChild(h('strong', { text: r.partnerName }));
      nameCol.appendChild(h('span', { class: 'bd-band', text: r.band.headline }));
      row.appendChild(nameCol);

      const chips = h('div', { class: 'bd-chips' });
      DECISION_ORDER.forEach(function (k) {
        const p = r.parts[k].points;
        const max = config.scoring.maxPerDecision;
        const g = p >= max ? 'full' : (p >= max * 0.6 ? 'high' : (p > 0 ? 'part' : 'none'));
        const d = config.decisions.filter(function (x) { return x.id === k; })[0];
        chips.appendChild(h('span', {
          class: 'bd-chip grade-' + g,
          title: d.label + ': ' + p + ' of ' + max
        }, '<span class="bd-chip-label">' + esc(d.label.split(' ')[0]) + '</span><span class="bd-chip-val">' + p + '</span>'));
      });
      row.appendChild(chips);
      row.appendChild(h('span', { class: 'bd-total', text: r.total + '' }));
      table.appendChild(row);
    });
    bd.appendChild(table);
    wrap.appendChild(bd);

    /* actions */
    const nav = h('div', { class: 'results-nav' });

    const review = h('button', { class: 'btn btn--ghost', type: 'button', text: 'Review answers' });
    review.addEventListener('click', renderReview);
    nav.appendChild(review);

    const again = h('button', { class: 'btn btn--primary', type: 'button', text: 'Play another mission' });
    again.addEventListener('click', function () { newMission(); renderRound(); });
    nav.appendChild(again);

    const share = h('button', { class: 'btn btn--ghost', type: 'button', text: 'Share result' });
    share.addEventListener('click', function () { shareResult(total, title.title); });
    nav.appendChild(share);

    const hub = h('a', { class: 'btn btn--ghost', href: config.brand.hubUrl, text: config.brand.hubLabel });
    nav.appendChild(hub);

    wrap.appendChild(nav);
    show(wrap);

    if (total >= (config.scoring.confettiThreshold || 800) && !prefersReducedMotion()) confetti();
    announce('Mission complete. ' + total + ' points. ' + title.title + '.');
  }

  function insightCard(label, value, detail, kind) {
    const c = h('div', { class: 'insight-card insight-card--' + kind });
    c.appendChild(h('p', { class: 'ic-label', text: label }));
    c.appendChild(h('p', { class: 'ic-value', text: value }));
    c.appendChild(h('p', { class: 'ic-detail', text: detail }));
    return c;
  }

  function developmentAdvice(id) {
    const map = {
      maturity: 'Partners often present as further along than they are — check for repeatability before you believe the stage.',
      route: 'Match the route to what the partner can resource today, not to the ambition in the room.',
      destination: 'Confirm demand before recommending build or implementation work.',
      conversation: 'The strongest questions surface a commercial consequence rather than a technical detail.'
    };
    return map[id] || '';
  }

  function practicalAction(weakestId) {
    const map = {
      maturity: 'Before you recommend anything, ask: “Have you sold this same thing to a second customer yet?” The answer tells you the stage more reliably than anything on their website.',
      route: 'Ask: “If this doubled next year, who in your team would deliver it?” Capacity, not ambition, is what decides Broker or Builder.',
      destination: 'Ask: “How many of your customers have this exact problem?” If the partner cannot answer, the next move is Discover, whatever else is on the table.',
      conversation: 'Replace your next product question with a cost question: “What is this problem costing them today?” It changes who is selling to whom.'
    };
    return map[weakestId] || 'Ask one more question about the customer before you recommend anything about the technology.';
  }

  /* ---- REVIEW ----------------------------------------------------------- */
  function renderReview() {
    const wrap = h('section', { class: 'screen screen--review' });
    wrap.appendChild(h('h1', { class: 'section-title', text: 'Review your answers' }));

    state.results.forEach(function (r, i) {
      const sc = scenarioById(r.scenarioId);
      if (!sc) return;
      const card = h('article', { class: 'review-card' });
      const head = h('div', { class: 'review-head' });
      head.appendChild(h('h2', { class: 'review-name', text: (i + 1) + '. ' + sc.partnerName }));
      head.appendChild(h('span', { class: 'review-total', text: r.total + ' / ' + config.mission.pointsPerScenario }));
      card.appendChild(head);

      card.appendChild(h('p', { class: 'review-quote', text: '“' + sc.partnerQuote + '”' }));

      const list = h('dl', { class: 'review-list' });
      function line(label, yours, ideal, pts) {
        const match = yours === ideal;
        list.appendChild(h('div', { class: 'review-line' + (match ? ' is-match' : '') },
          '<dt>' + esc(label) + '</dt>'
          + '<dd><span class="rl-yours">' + esc(yours) + '</span>'
          + (match ? '<span class="rl-flag">matched</span>' : '<span class="rl-ideal">strongest: ' + esc(ideal) + '</span>')
          + '<span class="rl-pts">' + pts + '/' + config.scoring.maxPerDecision + '</span></dd>'));
      }
      line('Maturity',
        r.answers.maturity ? stageById(r.answers.maturity).label : '—',
        stageById(sc.idealMaturityStage).label, r.parts.maturity.points);
      line('Route',
        r.answers.route ? routeById(r.answers.route).label : '—',
        routeById(sc.idealRoute).label, r.parts.route.points);
      line('Next play',
        r.answers.destination ? territoryById(r.answers.destination).label : '—',
        territoryById(sc.idealDestination).label, r.parts.destination.points);
      const yo = (sc.conversationOptions || []).filter(function (o) { return o.id === r.answers.conversation; })[0];
      const bo = (sc.conversationOptions || []).slice().sort(function (a, b) { return (b.points || 0) - (a.points || 0); })[0];
      line('Conversation',
        yo ? shorten(yo.text) : '—',
        bo ? shorten(bo.text) : '—', r.parts.conversation.points);
      card.appendChild(list);

      if (sc.talkTrack) {
        card.appendChild(h('p', { class: 'review-talk' }, '<strong>Try saying:</strong> ' + esc(sc.talkTrack)));
      }
      wrap.appendChild(card);
    });

    const nav = h('div', { class: 'results-nav' });
    const back = h('button', { class: 'btn btn--primary', type: 'button', text: 'Back to results' });
    back.addEventListener('click', renderResults);
    nav.appendChild(back);
    wrap.appendChild(nav);

    show(wrap);
  }

  function shorten(s, n) {
    n = n || 64;
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }

  /* ---- SHARE ------------------------------------------------------------ */
  function shareResult(total, title) {
    const avgs = decisionAverages();
    const ranked = DECISION_ORDER.slice().sort(function (a, b) { return avgs[b] - avgs[a]; });
    const strongest = config.decisions.filter(function (d) { return d.id === ranked[0]; })[0];

    /* No partner names, no answers — the card must be safe to post anywhere. */
    const lines = [
      config.brand.productName + ' — ' + total + '/' + config.mission.maxScore,
      'Rank: ' + title,
      'Strongest: ' + strongest.label,
      state.results.map(function (r) {
        const q = Math.min(4, Math.max(0, Math.round(r.total / (config.mission.pointsPerScenario / 4))));
        return '▮'.repeat(q) + '▯'.repeat(4 - q);
      }).join(' '),
      'Can you find the right route for each partner?'
    ];
    const text = lines.join('\n');

    const body = '<pre class="share-card">' + esc(text) + '</pre>'
      + '<p class="howto-note">No partner names or answers are included, so this is safe to post in a channel.</p>';
    openModal('Share your result', body);

    const modal = document.querySelector('.modal');
    if (modal) {
      const btn = h('button', { class: 'btn btn--ghost', type: 'button', text: 'Copy to clipboard' });
      btn.addEventListener('click', function () { copyText(text, btn, 'Copy to clipboard'); });
      modal.insertBefore(btn, modal.querySelector('.modal-close'));
    }
    MIPStore.track('result_shared', { score: total });
  }

  function copyText(text, btn, originalLabel) {
    const done = function () {
      btn.textContent = 'Copied';
      window.setTimeout(function () { btn.textContent = originalLabel; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
    ta.remove();
  }

  /* ---- CONFETTI (restrained, and never for reduced motion) -------------- */
  function confetti() {
    const layer = h('div', { class: 'confetti', 'aria-hidden': 'true' });
    const colors = config.territories.map(function (t) { return t.color; });
    for (let i = 0; i < 44; i++) {
      const p = h('span', { class: 'confetti-piece' });
      p.style.left = (Math.random() * 100) + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.5) + 's';
      p.style.animationDuration = (2.2 + Math.random() * 1.4) + 's';
      p.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    window.setTimeout(function () { layer.remove(); }, 4200);
  }

  /* ---------------------------------------------------------------- boot */
  function boot() {
    reloadConfig();

    /* header actions */
    const restart = $('#mipcRestart');
    if (restart) restart.addEventListener('click', function () {
      MIPStore.clearProgress();
      state = null;
      renderWelcome();
    });

    const motionBtn = $('#mipcMotion');
    if (motionBtn) {
      const sync = function () {
        const on = prefersReducedMotion();
        document.documentElement.classList.toggle('reduce-motion', on);
        motionBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
        motionBtn.title = on ? 'Animations reduced' : 'Animations on';
      };
      motionBtn.addEventListener('click', function () {
        const prefs = MIPStore.getPrefs();
        prefs.reduceMotion = !prefersReducedMotion();
        MIPStore.savePrefs(prefs);
        sync();
      });
      sync();
    }

    if (!MIPStore.isPersistent()) {
      const warn = $('#mipcStorageWarn');
      if (warn) warn.hidden = false;
    }

    renderWelcome();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* expose a little for the admin page and for smoke tests */
  window.MIPGame = {
    scoreRound: scoreRound,
    newMission: newMission,
    renderWelcome: renderWelcome,
    getState: function () { return state; }
  };
})();
