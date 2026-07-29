/* =============================================================================
   MIP COMPASS — ADMIN
   =============================================================================
   Scenario authoring, framework wording, themed missions, analytics and
   import/export.

   The password gate is client-side only — see the note in data.js. Treat this
   as "keep reps out by accident", not as access control.
   ============================================================================= */

(function () {
  'use strict';

  const $ = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function h(tag, attrs, html) {
    const n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    if (html !== undefined) n.innerHTML = html;
    return n;
  }

  function fnv(s) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
      hash ^= s.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash >>> 0;
  }

  function toast(msg, kind) {
    const t = h('div', { class: 'toast toast--' + (kind || 'ok'), role: 'status' , text: msg });
    document.body.appendChild(t);
    window.setTimeout(function () { t.classList.add('is-out'); }, 2200);
    window.setTimeout(function () { t.remove(); }, 2700);
  }

  let config = MIPStore.getConfig();

  /* ====================================================================== */
  /* GATE                                                                    */
  /* ====================================================================== */
  function renderGate() {
    const app = $('#adminApp');
    app.innerHTML = '';

    const card = h('div', { class: 'gate-card' });
    card.appendChild(h('h1', { class: 'gate-title', text: 'Content admin' }));
    card.appendChild(h('p', { class: 'gate-copy', text: 'Edit scenarios, framework wording and themed missions.' }));

    const form = h('form', { class: 'gate-form' });
    const label = h('label', { class: 'field' });
    label.appendChild(h('span', { class: 'field-label', text: 'Password' }));
    const input = h('input', { type: 'password', class: 'input', autocomplete: 'current-password', required: 'required' });
    label.appendChild(input);
    form.appendChild(label);
    form.appendChild(h('button', { class: 'btn btn--primary', type: 'submit', text: 'Unlock' }));
    const err = h('p', { class: 'gate-error', role: 'alert', hidden: 'hidden' });
    form.appendChild(err);
    card.appendChild(form);

    card.appendChild(h('p', { class: 'gate-warn' },
      '<strong>This gate is client-side only.</strong> It stops accidental access, not deliberate access. '
      + 'Move authentication server-side before anything confidential lives here.'));

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (fnv(input.value) === config.adminPasswordHash) {
        MIPStore.setAdminSession(Date.now() + (config.adminSessionMinutes || 60) * 60000);
        renderAdmin();
      } else {
        err.hidden = false;
        err.textContent = 'That password did not match. The default is set in data.js.';
        input.select();
      }
    });

    app.appendChild(card);
    input.focus();
  }

  /* ====================================================================== */
  /* SHELL                                                                   */
  /* ====================================================================== */
  let activeTab = 'scenarios';

  function renderAdmin() {
    config = MIPStore.getConfig();
    const app = $('#adminApp');
    app.innerHTML = '';

    const bar = h('div', { class: 'admin-bar' });
    const tabs = h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Admin sections' });
    [
      ['scenarios', 'Scenarios'],
      ['framework', 'Framework wording'],
      ['missions', 'Themed missions'],
      ['analytics', 'Analytics'],
      ['data', 'Import / export']
    ].forEach(function (t) {
      const b = h('button', {
        class: 'tab' + (activeTab === t[0] ? ' is-active' : ''),
        type: 'button', role: 'tab',
        'aria-selected': activeTab === t[0] ? 'true' : 'false',
        text: t[1]
      });
      b.addEventListener('click', function () { activeTab = t[0]; renderAdmin(); });
      tabs.appendChild(b);
    });
    bar.appendChild(tabs);

    const lock = h('button', { class: 'btn btn--ghost btn--tiny', type: 'button', text: 'Lock' });
    lock.addEventListener('click', function () { MIPStore.clearAdminSession(); renderGate(); });
    bar.appendChild(lock);
    app.appendChild(bar);

    const panel = h('div', { class: 'admin-panel', role: 'tabpanel' });
    app.appendChild(panel);

    if (activeTab === 'scenarios') renderScenarios(panel);
    if (activeTab === 'framework') renderFramework(panel);
    if (activeTab === 'missions')  renderMissions(panel);
    if (activeTab === 'analytics') renderAnalytics(panel);
    if (activeTab === 'data')      renderData(panel);
  }

  /* ====================================================================== */
  /* SCENARIOS                                                               */
  /* ====================================================================== */
  function renderScenarios(panel) {
    const scenarios = MIPStore.getScenarios();

    const head = h('div', { class: 'panel-head' });
    const ht = h('div', {});
    ht.appendChild(h('h2', { class: 'panel-title', text: 'Scenarios' }));
    ht.appendChild(h('p', { class: 'panel-sub', text: scenarios.filter(function (s) { return !s.archived; }).length + ' active · ' + scenarios.filter(function (s) { return s.archived; }).length + ' archived. Each mission draws ' + config.mission.scenariosPerMission + ' at random.' }));
    head.appendChild(ht);
    const add = h('button', { class: 'btn btn--primary btn--tiny', type: 'button', text: '+ New scenario' });
    add.addEventListener('click', function () { openEditor(blankScenario()); });
    head.appendChild(add);
    panel.appendChild(head);

    if (scenarios.length < config.mission.scenariosPerMission) {
      panel.appendChild(h('p', { class: 'warn-strip' },
        'There are fewer active scenarios than a mission needs. Missions will be shorter than '
        + config.mission.scenariosPerMission + ' partners until you add more.'));
    }

    const list = h('div', { class: 'scenario-list' });
    scenarios.forEach(function (sc) {
      const row = h('div', { class: 'scenario-row' + (sc.archived ? ' is-archived' : '') });

      const info = h('div', { class: 'sr-info' });
      info.appendChild(h('strong', { class: 'sr-name', text: sc.partnerName || '(untitled)' }));
      const meta = h('p', { class: 'sr-meta' });
      meta.textContent = [
        stageLabel(sc.idealMaturityStage),
        routeLabel(sc.idealRoute),
        territoryLabel(sc.idealDestination)
      ].join(' · ');
      info.appendChild(meta);
      if (sc.tags && sc.tags.length) {
        const tags = h('div', { class: 'sr-tags' });
        sc.tags.forEach(function (t) { tags.appendChild(h('span', { class: 'tag', text: t })); });
        info.appendChild(tags);
      }
      row.appendChild(info);

      const issues = validateScenario(sc);
      if (issues.length) {
        row.appendChild(h('span', { class: 'sr-flag', title: issues.join('\n'), text: issues.length + ' issue' + (issues.length > 1 ? 's' : '') }));
      }

      const acts = h('div', { class: 'sr-actions' });
      const edit = h('button', { class: 'btn btn--ghost btn--tiny', type: 'button', text: 'Edit' });
      edit.addEventListener('click', function () { openEditor(JSON.parse(JSON.stringify(sc))); });
      acts.appendChild(edit);

      const arch = h('button', { class: 'btn btn--ghost btn--tiny', type: 'button', text: sc.archived ? 'Restore' : 'Archive' });
      arch.addEventListener('click', function () {
        sc.archived = !sc.archived;
        MIPStore.saveScenario(sc);
        toast(sc.archived ? 'Archived' : 'Restored');
        renderAdmin();
      });
      acts.appendChild(arch);

      const dup = h('button', { class: 'btn btn--ghost btn--tiny', type: 'button', text: 'Duplicate' });
      dup.addEventListener('click', function () {
        const copy = JSON.parse(JSON.stringify(sc));
        copy.id = 'scenario-' + Date.now();
        copy.partnerName = sc.partnerName + ' (copy)';
        copy.archived = true;
        MIPStore.saveScenario(copy);
        toast('Duplicated as an archived draft');
        renderAdmin();
      });
      acts.appendChild(dup);

      row.appendChild(acts);
      list.appendChild(row);
    });
    panel.appendChild(list);
  }

  function stageLabel(id) { const s = config.stages.filter(function (x) { return x.id === id; })[0]; return s ? s.label : '?'; }
  function routeLabel(id) { const s = config.routes.filter(function (x) { return x.id === id; })[0]; return s ? s.label : '?'; }
  function territoryLabel(id) { const s = config.territories.filter(function (x) { return x.id === id; })[0]; return s ? s.label : '?'; }

  function blankScenario() {
    const s = {
      id: 'scenario-' + Date.now(),
      archived: true,
      partnerName: '',
      companySize: '',
      customerProfile: '',
      currentServices: [],
      aiActivity: '',
      ambition: '',
      constraints: [],
      partnerQuote: '',
      clues: [],
      tags: [],
      idealMaturityStage: config.stages[0].id,
      idealRoute: config.routes[0].id,
      idealDestination: config.territories[0].id,
      maturityExplanation: '',
      routeExplanation: '',
      destinationExplanation: '',
      conversationExplanation: '',
      talkTrack: '',
      routeCredit: {},
      destinationCredit: {},
      conversationOptions: []
    };
    config.routes.forEach(function (r) { s.routeCredit[r.id] = 0; });
    config.territories.forEach(function (t) { s.destinationCredit[t.id] = 0; });
    s.routeCredit[s.idealRoute] = 50;
    s.destinationCredit[s.idealDestination] = 50;
    s.conversationOptions = [
      { id: 'a', text: '', points: 50, note: '' },
      { id: 'b', text: '', points: 0, note: '' },
      { id: 'c', text: '', points: 0, note: '' },
      { id: 'd', text: '', points: 0, note: '' }
    ];
    return s;
  }

  /* Catches the mistakes that quietly break a round. */
  function validateScenario(sc) {
    const out = [];
    const max = config.scoring.maxPerDecision;
    if (!sc.partnerName) out.push('No partner name.');
    if (!sc.partnerQuote) out.push('No partner quote.');
    if (!config.stages.some(function (s) { return s.id === sc.idealMaturityStage; })) out.push('Ideal maturity stage does not match any configured stage.');
    if (!config.routes.some(function (r) { return r.id === sc.idealRoute; })) out.push('Ideal route does not match any configured route.');
    if (!config.territories.some(function (t) { return t.id === sc.idealDestination; })) out.push('Ideal destination does not match any configured territory.');

    const rc = sc.routeCredit || {};
    if (rc[sc.idealRoute] !== max) out.push('The ideal route should be worth the full ' + max + ' points.');
    const dc = sc.destinationCredit || {};
    if (dc[sc.idealDestination] !== max) out.push('The ideal destination should be worth the full ' + max + ' points.');

    const opts = sc.conversationOptions || [];
    if (opts.length < 2) out.push('Needs at least two conversation options.');
    const full = opts.filter(function (o) { return (o.points || 0) >= max; });
    if (full.length === 0) out.push('No conversation option is worth full points.');
    if (full.length > 1) out.push('More than one conversation option is worth full points.');
    if (opts.some(function (o) { return !o.text; })) out.push('A conversation option has no text.');

    if (sc.maturityCredit) {
      if (sc.maturityCredit[sc.idealMaturityStage] !== max) out.push('Maturity credit override does not give the ideal stage full points.');
    }
    return out;
  }

  /* ---- editor ---------------------------------------------------------- */
  function openEditor(sc) {
    const app = $('#adminApp');
    app.innerHTML = '';

    const bar = h('div', { class: 'admin-bar' });
    const back = h('button', { class: 'btn btn--ghost btn--tiny', type: 'button', text: '← Back to scenarios' });
    back.addEventListener('click', renderAdmin);
    bar.appendChild(back);
    app.appendChild(bar);

    const form = h('form', { class: 'editor' });

    /* --- identity --- */
    form.appendChild(section('Partner profile', [
      field('Partner name', input('text', sc.partnerName, function (v) { sc.partnerName = v; })),
      field('Company size', input('text', sc.companySize, function (v) { sc.companySize = v; }), 'e.g. 14 employees'),
      field('Customer profile', input('text', sc.customerProfile, function (v) { sc.customerProfile = v; }), 'e.g. 220 SMB customers'),
      field('Current services', listInput(sc.currentServices, function (v) { sc.currentServices = v; }), 'One per line'),
      field('AI activity today', textarea(sc.aiActivity, function (v) { sc.aiActivity = v; })),
      field('Commercial ambition', textarea(sc.ambition, function (v) { sc.ambition = v; })),
      field('Constraints', listInput(sc.constraints, function (v) { sc.constraints = v; }), 'One per line'),
      field('Partner quote', textarea(sc.partnerQuote, function (v) { sc.partnerQuote = v; }), 'Written in the partner’s own voice — no quotation marks needed'),
      field('Clues', listInput(sc.clues, function (v) { sc.clues = v; }), 'One or two signals that reward close reading'),
      field('Theme tags', listInput(sc.tags || [], function (v) { sc.tags = v; }), 'One per line. Used by themed mission links.')
    ]));

    /* --- decision 1 --- */
    const stageSel = select(config.stages.map(function (s) { return [s.id, s.label]; }), sc.idealMaturityStage, function (v) {
      sc.idealMaturityStage = v;
    });
    const matCreditWrap = h('div', {});
    const useMatOverride = h('label', { class: 'check' });
    const matToggle = h('input', { type: 'checkbox' });
    matToggle.checked = !!sc.maturityCredit;
    useMatOverride.appendChild(matToggle);
    useMatOverride.appendChild(h('span', { text: 'Override the automatic distance-based scoring' }));

    function drawMatCredit() {
      matCreditWrap.innerHTML = '';
      if (!sc.maturityCredit) return;
      const grid = h('div', { class: 'credit-grid' });
      config.stages.forEach(function (s) {
        grid.appendChild(creditCell(s.label, sc.maturityCredit[s.id] || 0, function (v) { sc.maturityCredit[s.id] = v; }));
      });
      matCreditWrap.appendChild(grid);
    }
    matToggle.addEventListener('change', function () {
      if (matToggle.checked) {
        sc.maturityCredit = {};
        config.stages.forEach(function (s) { sc.maturityCredit[s.id] = 0; });
        sc.maturityCredit[sc.idealMaturityStage] = config.scoring.maxPerDecision;
      } else {
        delete sc.maturityCredit;
      }
      drawMatCredit();
    });
    drawMatCredit();

    form.appendChild(section('Decision 1 — maturity', [
      field('Ideal stage', stageSel),
      field('', useMatOverride),
      matCreditWrap,
      field('Explanation shown on reveal', textarea(sc.maturityExplanation, function (v) { sc.maturityExplanation = v; }))
    ], 'Without an override, scoring is automatic: exact ' + (config.scoring.maturityByDistance || [])[0] + ', one stage out ' + (config.scoring.maturityByDistance || [])[1] + ', two out ' + (config.scoring.maturityByDistance || [])[2] + '.'));

    /* --- decision 2 --- */
    const routeGrid = h('div', { class: 'credit-grid' });
    config.routes.forEach(function (r) {
      sc.routeCredit = sc.routeCredit || {};
      routeGrid.appendChild(creditCell(r.label, sc.routeCredit[r.id] || 0, function (v) { sc.routeCredit[r.id] = v; }));
    });
    form.appendChild(section('Decision 2 — route', [
      field('Ideal route', select(config.routes.map(function (r) { return [r.id, r.label]; }), sc.idealRoute, function (v) { sc.idealRoute = v; })),
      field('Points for each route', routeGrid),
      field('Explanation shown on reveal', textarea(sc.routeExplanation, function (v) { sc.routeExplanation = v; }))
    ]));

    /* --- decision 3 --- */
    const destGrid = h('div', { class: 'credit-grid' });
    const noteWrap = h('div', { class: 'note-stack' });
    config.territories.forEach(function (t) {
      sc.destinationCredit = sc.destinationCredit || {};
      sc.destinationNotes = sc.destinationNotes || {};
      destGrid.appendChild(creditCell(t.label, sc.destinationCredit[t.id] || 0, function (v) { sc.destinationCredit[t.id] = v; }));
      noteWrap.appendChild(field('Why “' + t.label + '” earns its points',
        input('text', sc.destinationNotes[t.id] || '', function (v) {
          if (v) sc.destinationNotes[t.id] = v; else delete sc.destinationNotes[t.id];
        }), 'Optional. Shown when the player picks this one.'));
    });
    form.appendChild(section('Decision 3 — next play', [
      field('Ideal destination', select(config.territories.map(function (t) { return [t.id, t.label]; }), sc.idealDestination, function (v) { sc.idealDestination = v; })),
      field('Points for each territory', destGrid),
      field('Explanation shown on reveal', textarea(sc.destinationExplanation, function (v) { sc.destinationExplanation = v; })),
      noteWrap
    ]));

    /* --- decision 4 --- */
    const optWrap = h('div', { class: 'opt-stack' });
    function drawOpts() {
      optWrap.innerHTML = '';
      (sc.conversationOptions || []).forEach(function (o, i) {
        const card = h('div', { class: 'opt-card' });
        const head = h('div', { class: 'opt-head' });
        head.appendChild(h('span', { class: 'opt-key', text: String.fromCharCode(65 + i) }));
        const del = h('button', { class: 'btn btn--ghost btn--tiny', type: 'button', text: 'Remove' });
        del.addEventListener('click', function () {
          sc.conversationOptions.splice(i, 1);
          sc.conversationOptions.forEach(function (x, k) { x.id = String.fromCharCode(97 + k); });
          drawOpts();
        });
        head.appendChild(del);
        card.appendChild(head);
        card.appendChild(field('Question or action', textarea(o.text, function (v) { o.text = v; })));
        card.appendChild(field('Points', numberInput(o.points || 0, function (v) { o.points = v; })));
        card.appendChild(field('Why it scores that', textarea(o.note, function (v) { o.note = v; })));
        optWrap.appendChild(card);
      });
      const add = h('button', { class: 'btn btn--ghost btn--tiny', type: 'button', text: '+ Add option' });
      add.addEventListener('click', function () {
        sc.conversationOptions = sc.conversationOptions || [];
        sc.conversationOptions.push({ id: String.fromCharCode(97 + sc.conversationOptions.length), text: '', points: 0, note: '' });
        drawOpts();
      });
      optWrap.appendChild(add);
    }
    drawOpts();

    form.appendChild(section('Decision 4 — the conversation', [
      optWrap,
      field('Explanation shown on reveal', textarea(sc.conversationExplanation, function (v) { sc.conversationExplanation = v; }))
    ], 'Exactly one option should be worth the full ' + config.scoring.maxPerDecision + '. One or two others should earn partial credit.'));

    /* --- closing --- */
    form.appendChild(section('Talk track', [
      field('A sentence the CAM could actually say', textarea(sc.talkTrack, function (v) { sc.talkTrack = v; })),
      field('Ambiguity note (optional)', textarea(sc.ambiguityNote || '', function (v) {
        if (v) sc.ambiguityNote = v; else delete sc.ambiguityNote;
      }), 'Use when a scenario deliberately has more than one defensible answer.'),
      field('', (function () {
        const l = h('label', { class: 'check' });
        const cb = h('input', { type: 'checkbox' });
        cb.checked = !sc.archived;
        cb.addEventListener('change', function () { sc.archived = !cb.checked; });
        l.appendChild(cb);
        l.appendChild(h('span', { text: 'Active — include this scenario in missions' }));
        return l;
      })())
    ]));

    /* --- save --- */
    const actions = h('div', { class: 'editor-actions' });
    const issuesBox = h('div', { class: 'issues', hidden: 'hidden', role: 'alert' });
    actions.appendChild(issuesBox);

    const save = h('button', { class: 'btn btn--primary', type: 'submit', text: 'Save scenario' });
    actions.appendChild(save);
    form.appendChild(actions);

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const issues = validateScenario(sc);
      if (issues.length) {
        issuesBox.hidden = false;
        issuesBox.innerHTML = '<strong>Saved, but check these:</strong><ul>'
          + issues.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>';
      }
      MIPStore.saveScenario(sc);
      toast('Scenario saved');
      if (!issues.length) renderAdmin();
    });

    app.appendChild(form);
    const first = form.querySelector('input, textarea, select');
    if (first) first.focus();
  }

  /* ---- form primitives -------------------------------------------------- */
  function section(title, children, hint) {
    const s = h('fieldset', { class: 'section' });
    s.appendChild(h('legend', { class: 'section-legend', text: title }));
    if (hint) s.appendChild(h('p', { class: 'section-hint', text: hint }));
    children.forEach(function (c) { if (c) s.appendChild(c); });
    return s;
  }

  function field(label, control, hint) {
    const w = h('label', { class: 'field' });
    if (label) w.appendChild(h('span', { class: 'field-label', text: label }));
    w.appendChild(control);
    if (hint) w.appendChild(h('span', { class: 'field-hint', text: hint }));
    return w;
  }

  function input(type, value, onChange) {
    const i = h('input', { type: type, class: 'input' });
    i.value = value || '';
    i.addEventListener('input', function () { onChange(i.value); });
    return i;
  }

  function numberInput(value, onChange) {
    const i = h('input', { type: 'number', class: 'input input--num', min: '0', max: '100', step: '5' });
    i.value = value;
    i.addEventListener('input', function () { onChange(parseInt(i.value, 10) || 0); });
    return i;
  }

  function textarea(value, onChange) {
    const t = h('textarea', { class: 'input', rows: '3' });
    t.value = value || '';
    t.addEventListener('input', function () { onChange(t.value); });
    return t;
  }

  function listInput(arr, onChange) {
    const t = h('textarea', { class: 'input', rows: '3' });
    t.value = (arr || []).join('\n');
    t.addEventListener('input', function () {
      onChange(t.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean));
    });
    return t;
  }

  function select(options, value, onChange) {
    const s = h('select', { class: 'input' });
    options.forEach(function (o) {
      const opt = h('option', { value: o[0], text: o[1] });
      if (o[0] === value) opt.selected = true;
      s.appendChild(opt);
    });
    s.addEventListener('change', function () { onChange(s.value); });
    return s;
  }

  function creditCell(label, value, onChange) {
    const c = h('div', { class: 'credit-cell' });
    c.appendChild(h('span', { class: 'credit-label', text: label }));
    c.appendChild(numberInput(value, onChange));
    return c;
  }

  /* ====================================================================== */
  /* FRAMEWORK WORDING                                                       */
  /* ====================================================================== */
  function renderFramework(panel) {
    const draft = JSON.parse(JSON.stringify(config));

    panel.appendChild(h('div', { class: 'panel-head' },
      '<div><h2 class="panel-title">Framework wording</h2>'
      + '<p class="panel-sub">Change what things are called. IDs stay fixed, so no scenario needs re-editing.</p></div>'));

    panel.appendChild(h('p', { class: 'warn-strip' },
      'The five maturity stages below are placeholders and are not from an approved MIP document. '
      + 'Replace them with the official wording before this goes in front of partners or reps.'));

    const form = h('form', { class: 'editor' });

    /* stages */
    const stageChildren = [];
    draft.stages.forEach(function (s, i) {
      const box = h('div', { class: 'wording-row' });
      box.appendChild(h('span', { class: 'wording-index', text: String(i + 1) }));
      const inner = h('div', { class: 'wording-fields' });
      inner.appendChild(field('Label', input('text', s.label, function (v) { s.label = v; })));
      inner.appendChild(field('Description', textarea(s.description, function (v) { s.description = v; })));
      inner.appendChild(h('p', { class: 'wording-id', text: 'id: ' + s.id }));
      box.appendChild(inner);
      stageChildren.push(box);
    });
    form.appendChild(section('Maturity stages', stageChildren));

    /* territories */
    const terrChildren = [];
    draft.territories.forEach(function (t, i) {
      const box = h('div', { class: 'wording-row' });
      box.appendChild(h('span', { class: 'wording-index', style: 'background:' + t.color + ';color:#06101F', text: String(i + 1) }));
      const inner = h('div', { class: 'wording-fields' });
      inner.appendChild(field('Play name', input('text', t.label, function (v) { t.label = v; })));
      inner.appendChild(field('Map place name', input('text', t.placeName, function (v) { t.placeName = v; })));
      inner.appendChild(field('Blurb', input('text', t.blurb, function (v) { t.blurb = v; })));
      inner.appendChild(field('Capabilities', listInput(t.capabilities, function (v) { t.capabilities = v; }), 'One per line'));
      inner.appendChild(field('Colour', input('text', t.color, function (v) { t.color = v; }), 'Any CSS colour. Keep the six visually distinct.'));
      inner.appendChild(h('p', { class: 'wording-id', text: 'id: ' + t.id + ' · icon: ' + t.icon }));
      box.appendChild(inner);
      terrChildren.push(box);
    });
    form.appendChild(section('Territories — the six plays', terrChildren,
      'Confirmed six-play framework. Renaming is safe; the map art follows the colour and place name.'));

    /* routes */
    const routeChildren = [];
    draft.routes.forEach(function (r) {
      const box = h('div', { class: 'wording-row' });
      const inner = h('div', { class: 'wording-fields' });
      inner.appendChild(field('Label', input('text', r.label, function (v) { r.label = v; })));
      inner.appendChild(field('Short line', input('text', r.short, function (v) { r.short = v; })));
      inner.appendChild(field('Description', textarea(r.description, function (v) { r.description = v; })));
      inner.appendChild(h('p', { class: 'wording-id', text: 'id: ' + r.id }));
      box.appendChild(inner);
      routeChildren.push(box);
    });
    form.appendChild(section('Commercial routes', routeChildren));

    /* brand + scoring */
    form.appendChild(section('Product wording', [
      field('Product name', input('text', draft.brand.productName, function (v) { draft.brand.productName = v; })),
      field('Tagline', input('text', draft.brand.tagline, function (v) { draft.brand.tagline = v; })),
      field('Intro paragraph', textarea(draft.brand.intro, function (v) { draft.brand.intro = v; })),
      field('Estimated minutes', numberInput(draft.brand.estimatedMinutes, function (v) { draft.brand.estimatedMinutes = v; })),
      field('Learning hub link', input('text', draft.brand.hubUrl, function (v) { draft.brand.hubUrl = v; })),
      field('Learning hub link text', input('text', draft.brand.hubLabel, function (v) { draft.brand.hubLabel = v; }))
    ]));

    form.appendChild(section('Scoring', [
      field('Scenarios per mission', numberInput(draft.mission.scenariosPerMission, function (v) {
        draft.mission.scenariosPerMission = v;
        draft.mission.maxScore = v * draft.mission.pointsPerScenario;
      })),
      field('Points per decision', numberInput(draft.scoring.maxPerDecision, function (v) {
        draft.scoring.maxPerDecision = v;
        draft.mission.pointsPerScenario = v * draft.decisions.length;
        draft.mission.maxScore = draft.mission.pointsPerScenario * draft.mission.scenariosPerMission;
      })),
      field('Confetti threshold', numberInput(draft.scoring.confettiThreshold, function (v) { draft.scoring.confettiThreshold = v; }))
    ], 'Changing points per decision recalculates the per-scenario and mission totals on save.'));

    const actions = h('div', { class: 'editor-actions' });
    const save = h('button', { class: 'btn btn--primary', type: 'submit', text: 'Save wording' });
    actions.appendChild(save);
    const reset = h('button', { class: 'btn btn--ghost', type: 'button', text: 'Reset to data.js defaults' });
    reset.addEventListener('click', function () {
      if (!window.confirm('Discard all wording changes and return to the defaults in data.js?')) return;
      MIPStore.resetConfig();
      toast('Wording reset');
      renderAdmin();
    });
    actions.appendChild(reset);
    form.appendChild(actions);

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      MIPStore.saveConfig(draft);
      config = MIPStore.getConfig();
      toast('Wording saved');
      renderAdmin();
    });

    panel.appendChild(form);
  }

  /* ====================================================================== */
  /* THEMED MISSIONS                                                         */
  /* ====================================================================== */
  function renderMissions(panel) {
    panel.appendChild(h('div', { class: 'panel-head' },
      '<div><h2 class="panel-title">Themed missions</h2>'
      + '<p class="panel-sub">Tag scenarios in the editor, then share a link that draws only from that tag.</p></div>'));

    const scenarios = MIPStore.getActiveScenarios();
    const tagMap = {};
    scenarios.forEach(function (s) {
      (s.tags || []).forEach(function (t) {
        const k = String(t).toLowerCase();
        tagMap[k] = tagMap[k] || [];
        tagMap[k].push(s.partnerName);
      });
    });

    const tags = Object.keys(tagMap).sort();
    if (!tags.length) {
      panel.appendChild(h('p', { class: 'empty-note' },
        'No themes yet. Open any scenario, add one or more <strong>theme tags</strong>, and it will appear here. '
        + 'Useful themes: <code>governance</code>, <code>build</code>, <code>adoption</code>, <code>early-stage</code>.'));
      return;
    }

    /* Works whether we are the separate admin page or the bundled single file. */
    const base = window.location.href
      .split('#')[0].split('?')[0]
      .replace(/mip-compass-admin\.html$/, 'mip-compass.html');
    const list = h('div', { class: 'scenario-list' });
    tags.forEach(function (t) {
      const row = h('div', { class: 'scenario-row' });
      const info = h('div', { class: 'sr-info' });
      info.appendChild(h('strong', { class: 'sr-name', text: t }));
      info.appendChild(h('p', { class: 'sr-meta', text: tagMap[t].length + ' scenario' + (tagMap[t].length > 1 ? 's' : '') + ': ' + tagMap[t].join(', ') }));
      const url = base + '?theme=' + encodeURIComponent(t);
      info.appendChild(h('code', { class: 'theme-url', text: url }));
      row.appendChild(info);

      const acts = h('div', { class: 'sr-actions' });
      const copy = h('button', { class: 'btn btn--ghost btn--tiny', type: 'button', text: 'Copy link' });
      copy.addEventListener('click', function () {
        if (navigator.clipboard) navigator.clipboard.writeText(url);
        toast('Link copied');
      });
      acts.appendChild(copy);
      const open = h('a', { class: 'btn btn--ghost btn--tiny', href: url, target: '_blank', rel: 'noopener', text: 'Play' });
      acts.appendChild(open);
      row.appendChild(acts);

      if (tagMap[t].length < config.mission.scenariosPerMission) {
        row.appendChild(h('span', { class: 'sr-flag', text: 'short mission' }));
      }
      list.appendChild(row);
    });
    panel.appendChild(list);
  }

  /* ====================================================================== */
  /* ANALYTICS                                                               */
  /* ====================================================================== */
  function renderAnalytics(panel) {
    const a = MIPStore.getAnalyticsSummary();

    panel.appendChild(h('div', { class: 'panel-head' },
      '<div><h2 class="panel-title">Analytics</h2>'
      + '<p class="panel-sub">Anonymous, and local to this browser only. Nothing is sent anywhere.</p></div>'));

    panel.appendChild(h('p', { class: 'warn-strip warn-strip--info' },
      'These numbers come from this device alone. For pooled results across a team or an event, '
      + 'point MIPStore.track() at a backend — the event shape already leaves room for org, region, team and event code.'));

    const stats = h('div', { class: 'stat-grid' });
    function stat(label, value, sub) {
      const c = h('div', { class: 'stat-card' });
      c.appendChild(h('p', { class: 'stat-label', text: label }));
      c.appendChild(h('p', { class: 'stat-value', text: value }));
      if (sub) c.appendChild(h('p', { class: 'stat-sub', text: sub }));
      stats.appendChild(c);
    }
    stat('Games started', String(a.gamesStarted));
    stat('Games completed', String(a.gamesCompleted));
    stat('Completion rate', Math.round(a.completionRate * 100) + '%');
    stat('Average score', a.gamesCompleted ? Math.round(a.averageScore) + ' / ' + config.mission.maxScore : '—');
    stat('Average time', a.averageDurationMs ? formatDuration(a.averageDurationMs) : '—');
    stat('Events recorded', String(a.totalEvents));
    panel.appendChild(stats);

    /* per-decision */
    panel.appendChild(h('h3', { class: 'sub-title', text: 'Average score by decision' }));
    const bars = h('div', { class: 'bar-list' });
    config.decisions.forEach(function (d) {
      const s = a.byDecision[d.id] || { avgPoints: 0, max: 50, samples: 0 };
      const pct = s.max ? (s.avgPoints / s.max) * 100 : 0;
      const row = h('div', { class: 'bar-row' });
      row.appendChild(h('span', { class: 'bar-label', text: d.label }));
      const track = h('div', { class: 'bar-track' });
      track.appendChild(h('span', { class: 'bar-fill', style: 'width:' + pct + '%' }));
      row.appendChild(track);
      row.appendChild(h('span', { class: 'bar-value', text: s.samples ? s.avgPoints.toFixed(1) + ' / ' + s.max : 'no data' }));
      bars.appendChild(row);
    });
    panel.appendChild(bars);

    /* hardest scenarios */
    panel.appendChild(h('h3', { class: 'sub-title', text: 'Most frequently missed scenarios' }));
    if (!a.scenarioStats.length) {
      panel.appendChild(h('p', { class: 'empty-note', text: 'No rounds played on this device yet.' }));
    } else {
      const list = h('div', { class: 'mini-table' });
      a.scenarioStats.slice(0, 8).forEach(function (s) {
        const r = h('div', { class: 'mt-row' });
        r.appendChild(h('span', { class: 'mt-name', text: s.name }));
        r.appendChild(h('span', { class: 'mt-plays', text: s.plays + ' play' + (s.plays > 1 ? 's' : '') }));
        r.appendChild(h('span', { class: 'mt-score', text: s.avgScore.toFixed(0) + ' / ' + config.mission.pointsPerScenario }));
        list.appendChild(r);
      });
      panel.appendChild(list);
    }

    /* weak answers */
    panel.appendChild(h('h3', { class: 'sub-title', text: 'Most frequently chosen weak answers' }));
    if (!a.weakAnswers.length) {
      panel.appendChild(h('p', { class: 'empty-note', text: 'Nothing recorded yet.' }));
    } else {
      const list = h('div', { class: 'mini-table' });
      a.weakAnswers.forEach(function (w) {
        const r = h('div', { class: 'mt-row' });
        r.appendChild(h('span', { class: 'mt-name', text: w.answer }));
        r.appendChild(h('span', { class: 'mt-score', text: w.count + '×' }));
        list.appendChild(r);
      });
      panel.appendChild(list);
    }

    const clear = h('button', { class: 'btn btn--ghost btn--tiny', type: 'button', text: 'Clear analytics on this device' });
    clear.addEventListener('click', function () {
      if (!window.confirm('Delete all recorded events on this device?')) return;
      MIPStore.clearEvents();
      toast('Analytics cleared');
      renderAdmin();
    });
    panel.appendChild(h('div', { class: 'editor-actions' })).appendChild(clear);
  }

  function formatDuration(ms) {
    const total = Math.round(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return m + 'm ' + (s < 10 ? '0' : '') + s + 's';
  }

  /* ====================================================================== */
  /* IMPORT / EXPORT                                                         */
  /* ====================================================================== */
  function renderData(panel) {
    panel.appendChild(h('div', { class: 'panel-head' },
      '<div><h2 class="panel-title">Import and export</h2>'
      + '<p class="panel-sub">Move content between browsers, or back it into data.js so it ships with the game.</p></div>'));

    const scenarios = MIPStore.getScenarios();

    panel.appendChild(h('p', { class: 'warn-strip warn-strip--info' },
      MIPStore.areScenariosOverridden()
        ? 'This browser is using edited scenarios stored locally. They override data.js until you reset.'
        : 'This browser is using the scenarios shipped in data.js. Any edit you save creates a local override.'));

    /* export */
    const exportBox = h('div', { class: 'section' });
    exportBox.appendChild(h('h3', { class: 'sub-title', text: 'Export' }));
    exportBox.appendChild(h('p', { class: 'field-hint', text: 'Copy this and paste it over the MIP_SCENARIOS array in mip-compass/data.js to make it permanent for everyone.' }));
    const ta = h('textarea', { class: 'input code-area', rows: '12', readonly: 'readonly' });
    ta.value = JSON.stringify(scenarios, null, 2);
    exportBox.appendChild(ta);
    const row = h('div', { class: 'editor-actions' });
    const copyBtn = h('button', { class: 'btn btn--ghost btn--tiny', type: 'button', text: 'Copy scenarios JSON' });
    copyBtn.addEventListener('click', function () {
      ta.select();
      if (navigator.clipboard) navigator.clipboard.writeText(ta.value);
      toast('Copied');
    });
    row.appendChild(copyBtn);

    const dl = h('button', { class: 'btn btn--ghost btn--tiny', type: 'button', text: 'Download JSON file' });
    dl.addEventListener('click', function () {
      const blob = new Blob([JSON.stringify({ config: MIPStore.getConfig(), scenarios: scenarios }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mip-compass-content.json';
      a.click();
      URL.revokeObjectURL(url);
    });
    row.appendChild(dl);
    exportBox.appendChild(row);
    panel.appendChild(exportBox);

    /* import */
    const importBox = h('div', { class: 'section' });
    importBox.appendChild(h('h3', { class: 'sub-title', text: 'Import' }));
    importBox.appendChild(h('p', { class: 'field-hint', text: 'Paste either a scenarios array, or a full export containing both config and scenarios.' }));
    const inTa = h('textarea', { class: 'input code-area', rows: '8', placeholder: '[ { "id": "scenario-001", ... } ]' });
    importBox.appendChild(inTa);
    const importActions = h('div', { class: 'editor-actions' });
    const importBtn = h('button', { class: 'btn btn--primary btn--tiny', type: 'button', text: 'Import and replace' });
    importBtn.addEventListener('click', function () {
      let parsed;
      try { parsed = JSON.parse(inTa.value); }
      catch (e) { toast('That is not valid JSON', 'bad'); return; }

      let sc = null, cf = null;
      if (Array.isArray(parsed)) sc = parsed;
      else if (parsed && Array.isArray(parsed.scenarios)) { sc = parsed.scenarios; cf = parsed.config || null; }

      if (!sc) { toast('No scenarios array found', 'bad'); return; }
      if (!window.confirm('Replace all scenarios in this browser with the ' + sc.length + ' imported?')) return;

      MIPStore.saveScenarios(sc);
      if (cf) MIPStore.saveConfig(cf);
      toast('Imported ' + sc.length + ' scenarios');
      renderAdmin();
    });
    importActions.appendChild(importBtn);

    const resetBtn = h('button', { class: 'btn btn--ghost btn--tiny', type: 'button', text: 'Reset everything to data.js' });
    resetBtn.addEventListener('click', function () {
      if (!window.confirm('Discard all local scenario and wording edits in this browser?')) return;
      MIPStore.resetScenarios();
      MIPStore.resetConfig();
      toast('Reset to shipped content');
      renderAdmin();
    });
    importActions.appendChild(resetBtn);
    importBox.appendChild(importActions);
    panel.appendChild(importBox);
  }

  /* ====================================================================== */
  function boot() {
    if (MIPStore.hasAdminSession()) renderAdmin();
    else renderGate();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
