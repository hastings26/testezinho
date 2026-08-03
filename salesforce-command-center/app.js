/* ============================================================================
   Salesforce Command Center — prototype application
   Vanilla JS, no dependencies. Hash routing, role relevance, search,
   registry, governance views and the Slack assistant handoff.
   ========================================================================= */

/* ------------------------------------------------------------------ helpers */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function esc(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function fmtDate(iso) {
  if (!iso) return 'Not set';
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return esc(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function daysUntil(iso) {
  if (!iso) return null;
  const target = new Date(iso + 'T00:00:00Z').getTime();
  if (Number.isNaN(target)) return null;
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((target - today) / 86400000);
}

/* Review state is derived, never stored — so an unreviewed topic cannot hide. */
function reviewState(topic) {
  const g = topic.governance;
  if (!g.nextReview) return { key: 'missing', label: 'No review date', icon: '✕', tone: 'danger' };
  const d = daysUntil(g.nextReview);
  if (d < 0)  return { key: 'overdue',  label: `Review overdue by ${Math.abs(d)} days`, icon: '⏰', tone: 'danger' };
  if (d <= 30) return { key: 'due-soon', label: `Review due in ${d} days`, icon: '⏳', tone: 'warn' };
  return { key: 'current', label: `Reviewed ${fmtDate(g.lastReview)}`, icon: '✓', tone: 'ok' };
}

/* Governance completeness — the registry must make absent ownership visible. */
function governanceGaps(topic) {
  const g = topic.governance;
  const gaps = [];
  if (!g.contentOwner) gaps.push('No content owner');
  if (!g.processOwner) gaps.push('No process owner');
  if (!g.approver) gaps.push('No approver');
  if (!g.source || g.source === 'Not yet established') gaps.push('No canonical source');
  if (!g.approvalDate) gaps.push('No approval date');
  if (!g.nextReview) gaps.push('No next review date');
  else if (daysUntil(g.nextReview) < 0) gaps.push('Review overdue');
  if (!g.version) gaps.push('No version');
  return gaps;
}

function isAuthoritative(topic) {
  return topic.governance.approvalStatus === 'approved' && topic.governance.lifecycle !== 'draft';
}

/* --------------------------------------------------------------- components */

function badge(tone, icon, label, title) {
  return `<span class="badge badge--${tone}"${title ? ` title="${esc(title)}"` : ''}>
    <span aria-hidden="true">${icon}</span>${esc(label)}</span>`;
}

function shareBadge(key) {
  const s = SHAREABILITY[key] || SHAREABILITY['internal-only'];
  return badge(s.tone, s.icon, s.label, s.desc);
}

function lifecycleBadge(key) {
  const l = LIFECYCLE[key] || LIFECYCLE.draft;
  return badge(l.tone, l.icon, l.label, l.desc);
}

function approvalBadge(key) {
  const a = APPROVAL[key] || APPROVAL['not-approved'];
  const tone = key === 'approved' ? 'ok' : key === 'provisional' ? 'warn' : 'danger';
  return badge(tone, a.icon, a.label);
}

function reviewBadge(topic) {
  const r = reviewState(topic);
  return badge(r.tone, r.icon, r.label);
}

/* Placeholder link. Never a silent "#". Clicking states the token. */
function ph(tokenKey, label) {
  const token = PLACEHOLDER_TOKENS[tokenKey] || PLACEHOLDER_TOKENS.highspotAsset;
  return `<button type="button" class="ph" data-token="${esc(token)}">${esc(label)}</button>`;
}

function laneName(id) {
  const lane = LANES.find(l => l.id === id);
  return lane ? lane.name : id;
}

function roleName(id) {
  const role = ROLES.find(r => r.id === id);
  return role ? role.short : id;
}

function rolesLine(ids) {
  return ids.map(roleName).join(', ');
}

/* --------------------------------------------------------------------- state */

const STORE_ROLE = 'sfcc.role';
const STORE_GAPS = 'sfcc.gapReports';

const state = {
  role: localStorage.getItem(STORE_ROLE) || 'all',
  gapReports: JSON.parse(localStorage.getItem(STORE_GAPS) || '[]')
};

function topicsForRole(role) {
  if (role === 'all') return TOPICS;
  /* RevOps and Revenue Enablement own the system, so they see everything. */
  if (role === 'revops' || role === 'enablement') return TOPICS;
  return TOPICS.filter(t => t.definition.roles.includes(role));
}

function otherTopics(role) {
  const relevant = new Set(topicsForRole(role).map(t => t.id));
  return TOPICS.filter(t => !relevant.has(t.id));
}

/* -------------------------------------------------------------------- router */

const routes = {
  '': renderHome,
  'home': renderHome,
  'rules': renderRules,
  'good': renderGood,
  'measure': renderMeasure,
  'resources': renderResources,
  'lanes': renderLanes,
  'lane': renderLane,
  'registry': renderRegistry,
  'governance': renderGovernance,
  'assistant': renderAssistant,
  'gap': renderGap,
  'search': renderSearch,
  'topic': renderTopic,
  'about': renderAbout
};

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [pathPart, queryPart] = raw.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const params = new URLSearchParams(queryPart || '');
  return { name: segments[0] || 'home', arg: segments[1] || '', params };
}

function navigate() {
  const route = parseHash();
  const render = routes[route.name] || renderNotFound;
  const view = $('#view');
  view.innerHTML = render(route);
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  syncNav(route);
  $('#primaryNav').classList.remove('is-open');
  $('#navToggle').setAttribute('aria-expanded', 'false');
  afterRender(route);
  $('#main').focus({ preventScroll: true });
}

function syncNav(route) {
  const map = { home: '#/home', rules: '#/rules', good: '#/good', measure: '#/measure',
    resources: '#/resources', lanes: '#/lanes', lane: '#/lanes', registry: '#/registry',
    governance: '#/governance', assistant: '#/assistant', gap: '#/gap' };
  const active = map[route.name];
  $$('.primary-nav a').forEach(a => {
    if (a.getAttribute('href') === active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  const titles = { home: 'Home', rules: 'Rules of the Game', good: 'What Good Looks Like',
    measure: 'Track and Measure', resources: 'Resources and Enablement', lanes: 'Lane Workspaces',
    lane: 'Lane', registry: 'Topic Registry', governance: 'Governance', assistant: 'Ask the Assistant',
    gap: 'Report Missing Guidance', search: 'Search', topic: 'Topic', about: 'About this prototype' };
  document.title = `${titles[route.name] || 'Not found'} — Salesforce Command Center`;
}

/* ----------------------------------------------------------------- home view */

function trustList() {
  const items = [
    'Approved sources only',
    'Role-relevant guidance',
    'Named, visible ownership',
    'Current review status',
    'Partner-safe assets clearly marked',
    'Source-backed Slack answers'
  ];
  return `<ul class="trust">${items.map(i =>
    `<li><span aria-hidden="true">✓</span>${esc(i)}</li>`).join('')}</ul>`;
}

function searchBlock() {
  return `
  <form class="search" id="heroSearch" role="search">
    <label for="q">Ask a question or search an approved topic</label>
    <div class="search__row">
      <input type="search" id="q" name="q" placeholder="e.g. What are the stage exit criteria?" autocomplete="off" />
      <button type="submit" class="btn btn--primary">Search approved content</button>
      <a class="btn btn--slack" href="#/assistant" data-nav="#/assistant"><span aria-hidden="true">💬</span> Ask in Slack</a>
    </div>
    <div class="suggests" aria-label="Suggested questions">
      ${SUGGESTED_QUESTIONS.map(q => `<button type="button" data-suggest="${esc(q)}">${esc(q)}</button>`).join('')}
    </div>
  </form>`;
}

function priorityTopicCard(topic) {
  const gaps = governanceGaps(topic);
  return `
  <button type="button" class="card card--link" data-nav="#/topic/${esc(topic.id)}">
    <div class="badge-row">
      ${lifecycleBadge(topic.governance.lifecycle)}
      ${reviewBadge(topic)}
      ${gaps.length ? badge('danger', '⚑', `${gaps.length} governance gap${gaps.length > 1 ? 's' : ''}`, gaps.join('; ')) : ''}
    </div>
    <h3>${esc(topic.name)}</h3>
    <p class="small muted">${esc(topic.short)}</p>
    <div class="card__meta">
      <dl>
        <dt>Owner</dt><dd>${esc(topic.governance.contentOwner || 'Not assigned')}</dd>
        <dt>Version</dt><dd>${esc(topic.governance.version || '—')}</dd>
        <dt>Last review</dt><dd>${fmtDate(topic.governance.lastReview)}</dd>
        <dt>Next review</dt><dd>${fmtDate(topic.governance.nextReview)}</dd>
      </dl>
    </div>
  </button>`;
}

function renderHome() {
  const role = state.role;
  const relevant = topicsForRole(role).filter(t => t.priority);
  const rest = otherTopics(role).filter(t => t.priority);
  const roleLabel = role === 'all' ? 'all roles' : roleName(role);

  return `
  <section class="hero">
    <p class="eyebrow" style="color:#7fe8c6">Salesforce Command Center</p>
    <h1>Know the rule. See what good looks like. Take the right action.</h1>
    <hr class="rule-line" />
    <p class="hero__lede">
      This is the approved home for Salesforce standards, processes, performance measures, training and
      partner-safe resources across EMEA Sales. Every topic here has one canonical source, one accountable
      owner and one current version. If it is not here, it is not approved.
    </p>
    ${trustList()}
    ${searchBlock()}
  </section>

  <section class="section">
    <div class="section__head">
      <div>
        <p class="eyebrow">Start here</p>
        <h2>Three ways in</h2>
      </div>
    </div>
    <div class="grid grid--3">
      <button type="button" class="card card--link entry" data-nav="#/rules">
        <h3>Rules of the Game</h3>
        <p class="small muted">What is required of you, and what the targets are.</p>
        <ul>
          <li>Stage definitions and exit criteria</li>
          <li>Required fields and validation</li>
          <li>Forecast expectations and SLAs</li>
          <li>Policies, exceptions and approvals</li>
        </ul>
      </button>
      <button type="button" class="card card--link entry entry--good" data-nav="#/good">
        <h3>What Good Looks Like</h3>
        <p class="small muted">The same rules, expressed as observable behaviour.</p>
        <ul>
          <li>Healthy opportunities and pipeline</li>
          <li>Evidence-based forecasting</li>
          <li>Event logging worth reading</li>
          <li>Manager coaching questions</li>
        </ul>
      </button>
      <button type="button" class="card card--link entry entry--res" data-nav="#/resources">
        <h3>Resources and Enablement</h3>
        <p class="small muted">Training, guides, dashboards, contacts and partner-safe assets.</p>
        <ul>
          <li>Workday courses and short videos</li>
          <li>Process maps, playbooks, checklists</li>
          <li>Approved dashboards</li>
          <li>Named contacts and Digital Rooms</li>
        </ul>
      </button>
    </div>
  </section>

  <section class="section">
    <div class="section__head">
      <div>
        <p class="eyebrow">Priority topics</p>
        <h2>Relevant to ${esc(roleLabel)}</h2>
        <p class="small muted">${relevant.length} topic${relevant.length === 1 ? '' : 's'} shown. Change the role selector to see a different view.</p>
      </div>
      <a class="btn btn--ghost btn--sm" href="#/registry" data-nav="#/registry">Open the full Topic Registry</a>
    </div>
    <div class="grid grid--3">${relevant.map(priorityTopicCard).join('')}</div>
    ${rest.length ? `
      <details class="acc" style="margin-top:1rem">
        <summary>Show ${rest.length} topic${rest.length === 1 ? '' : 's'} that are not primary for ${esc(roleLabel)}</summary>
        <div>
          <p class="small muted">These are published and available, but they are not the primary expectation for this role.</p>
          <div class="grid grid--3">${rest.map(priorityTopicCard).join('')}</div>
        </div>
      </details>` : ''}
  </section>

  <section class="section">
    <div class="grid grid--2">
      <article class="card">
        <h3>Ask the Salesforce Assistant in Slack</h3>
        <p class="small muted">
          The existing Slack assistant answers from approved sources only. It cites the source, the version and
          the review date, and it sends you to the exact page here. When there is no approved answer, it says so.
        </p>
        <div class="btn-row">
          <a class="btn btn--slack" href="#/assistant" data-nav="#/assistant"><span aria-hidden="true">💬</span> See how it answers</a>
          ${ph('slack', 'Open Slack assistant')}
        </div>
      </article>
      <article class="card">
        <h3>Something missing or wrong?</h3>
        <p class="small muted">
          A gap that nobody reports stays a gap. Reporting takes under a minute and routes to the named owner
          for that lane.
        </p>
        <div class="btn-row">
          <a class="btn btn--primary" href="#/gap" data-nav="#/gap">Report missing or incorrect guidance</a>
        </div>
      </article>
    </div>
  </section>`;
}

/* ---------------------------------------------------------------- rules view */

function renderRules() {
  const topics = topicsForRole(state.role).filter(t => t.rules.mandatory.length);
  const roleLabel = state.role === 'all' ? 'all roles' : roleName(state.role);
  return `
  <p class="eyebrow">Rules of the Game</p>
  <h1>What is required, and what the targets are</h1>
  <hr class="rule-line" />
  <p class="muted" style="max-width:70ch">
    Everything below is drawn from a canonical source with a named owner. Requirements are separated from
    recommendations so you can tell the difference between what you must do and what tends to work well.
    Showing rules relevant to <strong>${esc(roleLabel)}</strong>.
  </p>

  <div class="notice notice--info">
    <strong>How to read this.</strong> Mandatory means you are accountable for it.
    Recommended means it is good practice, not a requirement. Exceptions are documented, and using one
    means recording it — not ignoring the rule.
  </div>

  ${topics.map(t => `
    <section class="section">
      <div class="section__head">
        <div>
          <h2>${esc(t.name)}</h2>
          <div class="badge-row">
            ${approvalBadge(t.governance.approvalStatus)}
            ${reviewBadge(t)}
            ${badge('info', '§', 'v' + (t.governance.version || '—'))}
            ${badge('neutral', '👤', t.governance.processOwner || 'No process owner')}
          </div>
        </div>
        <a class="btn btn--ghost btn--sm" href="#/topic/${esc(t.id)}" data-nav="#/topic/${esc(t.id)}">Open topic page</a>
      </div>
      <ul class="rule-list">
        ${t.rules.mandatory.map(r => `<li><span class="badge badge--danger"><span aria-hidden="true">!</span>Mandatory</span>
          <strong>${esc(r.title)}</strong><p>${esc(r.detail)}</p></li>`).join('')}
        ${t.rules.recommended.map(r => `<li class="is-recommended"><span class="badge badge--ok"><span aria-hidden="true">✓</span>Recommended</span>
          <strong>${esc(r.title)}</strong><p>${esc(r.detail)}</p></li>`).join('')}
        ${t.rules.optional.map(r => `<li class="is-optional"><span class="badge badge--neutral"><span aria-hidden="true">○</span>Optional</span>
          <strong>${esc(r.title)}</strong><p>${esc(r.detail)}</p></li>`).join('')}
        ${t.rules.exceptions.map(r => `<li class="is-exception"><span class="badge badge--warn"><span aria-hidden="true">⚑</span>Exception</span>
          <strong>${esc(r.title)}</strong><p>${esc(r.detail)}</p></li>`).join('')}
      </ul>
    </section>`).join('')}`;
}

/* ----------------------------------------------------------------- good view */

function compareCard(context, bad, good) {
  return `
  <div class="compare-wrap">
    <p class="compare-context">${esc(context)}</p>
    <div class="compare">
      <div class="compare__bad">
        <h4><span aria-hidden="true">✕</span> Not this</h4>
        <p>${esc(bad)}</p>
      </div>
      <div class="compare__good">
        <h4><span aria-hidden="true">✓</span> This</h4>
        <p>${esc(good)}</p>
      </div>
    </div>
  </div>`;
}

function renderGood() {
  const topics = topicsForRole(state.role).filter(t => t.good.length);
  const roleLabel = state.role === 'all' ? 'all roles' : roleName(state.role);
  return `
  <p class="eyebrow">What Good Looks Like</p>
  <h1>The rules, expressed as behaviour you can observe</h1>
  <hr class="rule-line" />
  <p class="muted" style="max-width:70ch">
    A rule tells you what is required. This tells you what it looks like when it is being done well, and what
    it looks like when it is not. Managers coach from these examples. Showing behaviours relevant to
    <strong>${esc(roleLabel)}</strong>.
  </p>

  ${topics.map(t => `
    <section class="section">
      <div class="section__head">
        <div>
          <h2>${esc(t.name)}</h2>
          <div class="badge-row">${reviewBadge(t)} ${badge('neutral', '👤', t.governance.contentOwner || 'No content owner')}</div>
        </div>
        <a class="btn btn--ghost btn--sm" href="#/topic/${esc(t.id)}" data-nav="#/topic/${esc(t.id)}">Open topic page</a>
      </div>
      ${t.good.map(g => compareCard(g.context, g.bad, g.good)).join('')}
      <div class="grid grid--3">
        ${t.coaching.length ? `<article class="card"><h3>Manager coaching questions</h3><ul class="small muted" style="padding-left:1.1rem;margin:0">
          ${t.coaching.map(c => `<li>${esc(c)}</li>`).join('')}</ul></article>` : ''}
        ${t.mistakes.length ? `<article class="card"><h3>Common mistakes</h3><ul class="small muted" style="padding-left:1.1rem;margin:0">
          ${t.mistakes.map(c => `<li>${esc(c)}</li>`).join('')}</ul></article>` : ''}
        ${t.warnings.length ? `<article class="card"><h3>Warning signs</h3><ul class="small muted" style="padding-left:1.1rem;margin:0">
          ${t.warnings.map(c => `<li>${esc(c)}</li>`).join('')}</ul></article>` : ''}
      </div>
    </section>`).join('')}`;
}

/* -------------------------------------------------------------- measure view */

function kpiCard(metric, topic) {
  return `
  <article class="card kpi">
    <div class="badge-row">${badge('info', '◆', topic.name)}</div>
    <p class="kpi__name">${esc(metric.name)}</p>
    <p class="kpi__threshold">${esc(metric.threshold)}</p>
    <dl>
      <dt>Measures</dt><dd>${esc(metric.what)}</dd>
      <dt>Why it matters</dt><dd>${esc(metric.why)}</dd>
      <dt>Dashboard</dt><dd>${esc(metric.dashboard)}</dd>
      <dt>Owner</dt><dd>${esc(metric.owner)}</dd>
      <dt>Reviewed</dt><dd>${esc(metric.cadence)}</dd>
      <dt>If outside range</dt><dd>${esc(metric.action)}</dd>
    </dl>
    <div class="btn-row">${ph(metric.dashboardToken || 'dashboard', 'Open ' + metric.dashboard)}</div>
  </article>`;
}

function renderMeasure() {
  const topics = topicsForRole(state.role).filter(t => t.metrics.length);
  const total = topics.reduce((n, t) => n + t.metrics.length, 0);
  return `
  <p class="eyebrow">Track and Measure</p>
  <h1>The measures that matter, and what to do about them</h1>
  <hr class="rule-line" />
  <p class="muted" style="max-width:70ch">
    Every measure states what it counts, why it matters, which approved dashboard tracks it, who owns it,
    how often it is reviewed and the action expected when performance sits outside the expected range.
    A metric without an action is just a number.
  </p>
  <div class="notice notice--info">
    <strong>${total} measures shown</strong> for ${esc(state.role === 'all' ? 'all roles' : roleName(state.role))}.
    Thresholds are placeholders and must be confirmed with RevOps and Sales Leadership before publication.
  </div>
  ${topics.map(t => `
    <section class="section">
      <div class="section__head">
        <h2>${esc(t.name)}</h2>
        <a class="btn btn--ghost btn--sm" href="#/topic/${esc(t.id)}" data-nav="#/topic/${esc(t.id)}">Open topic page</a>
      </div>
      <div class="grid grid--2">${t.metrics.map(m => kpiCard(m, t)).join('')}</div>
    </section>`).join('')}`;
}

/* ------------------------------------------------------------ resources view */

function resourceItem(r, kindLabel) {
  return `
  <div class="item">
    <p class="item__type">${esc(r.type || kindLabel)}</p>
    <h4>${esc(r.title)}</h4>
    <p>${esc(r.desc || '')}</p>
    ${r.audience ? `<p class="tiny muted">Audience: ${esc(r.audience)} · Use: ${esc(r.frequency || '—')}</p>` : ''}
    <div class="badge-row">${r.share ? shareBadge(r.share) : ''}</div>
    <div class="btn-row">${ph(r.token || 'highspotAsset', 'Open resource')}</div>
  </div>`;
}

function renderResources() {
  const topics = topicsForRole(state.role);
  const training = [], docs = [], dashboards = [], faqs = [], contacts = [], partner = [];
  topics.forEach(t => {
    t.resources.training.forEach(r => training.push({ r, t }));
    t.resources.documentation.forEach(r => docs.push({ r, t }));
    t.resources.dashboards.forEach(r => dashboards.push({ r, t }));
    t.resources.faqs.forEach(r => faqs.push({ r, t }));
    t.resources.contacts.forEach(r => contacts.push({ r, t }));
    (t.partner || []).forEach(r => partner.push({ r, t }));
  });
  const seenDash = new Set();
  const uniqueDash = dashboards.filter(({ r }) => {
    if (seenDash.has(r.title)) return false;
    seenDash.add(r.title); return true;
  });

  return `
  <p class="eyebrow">Resources and Enablement</p>
  <h1>Training, documentation, dashboards, people and partner-safe assets</h1>
  <hr class="rule-line" />
  <p class="muted" style="max-width:70ch">
    Everything here belongs to a governed topic. If a resource is not attached to a topic with an owner and a
    review date, it does not appear on this page.
  </p>

  <section class="section">
    <h2>Training</h2>
    <p class="small muted">Courses, videos and live sessions. All internal.</p>
    <div class="grid grid--3">${training.map(({ r, t }) =>
      `<div>${resourceItem(r, 'Training')}<p class="tiny muted" style="margin:.3rem 0 0">Topic: ${esc(t.name)}</p></div>`).join('') || '<p class="muted">No training attached to your topics yet.</p>'}</div>
  </section>

  <section class="section">
    <h2>Documentation</h2>
    <p class="small muted">Canonical sources, guides, process maps and checklists.</p>
    <div class="grid grid--3">${docs.map(({ r, t }) =>
      `<div>${resourceItem(r, 'Documentation')}<p class="tiny muted" style="margin:.3rem 0 0">Topic: ${esc(t.name)}</p></div>`).join('')}</div>
  </section>

  <section class="section">
    <h2>Dashboards</h2>
    <p class="small muted">Approved dashboards only. Private reports are for personal working, not for reporting upward.</p>
    <div class="grid grid--3">${uniqueDash.map(({ r }) => resourceItem(r, 'Dashboard')).join('')}</div>
  </section>

  <section class="section">
    <h2>Partner-facing resources</h2>
    <div class="notice notice--warn">
      <strong>Check the classification before you share.</strong> Only assets marked
      "External approved" may be shared without further checks. Conditional assets carry a stated condition.
    </div>
    <div class="grid grid--3">${partner.length ? partner.map(({ r, t }) =>
      `<div>${resourceItem(r, 'Partner asset')}<p class="tiny muted" style="margin:.3rem 0 0">Topic: ${esc(t.name)}</p></div>`).join('')
      : '<p class="muted">No partner-facing assets are attached to your topics.</p>'}</div>
  </section>

  <section class="section">
    <h2>Frequently asked questions</h2>
    ${faqs.map(({ r, t }) => `
      <details class="acc">
        <summary>${esc(r.q)}</summary>
        <div><p>${esc(r.a)}</p><p class="tiny muted">Topic: ${esc(t.name)} · Owner: ${esc(t.governance.contentOwner || 'Not assigned')} · Reviewed ${fmtDate(t.governance.lastReview)}</p></div>
      </details>`).join('')}
  </section>

  <section class="section">
    <h2>Named contacts</h2>
    <p class="small muted">Named people, not departments. Placeholder names below must be replaced before publication.</p>
    <div class="grid grid--3">
      ${contacts.map(({ r, t }) => `
        <article class="card">
          <p class="item__type">${esc(r.role)}</p>
          <h3>${esc(r.name)}</h3>
          <p class="small muted">${esc(r.note)}</p>
          <p class="tiny muted">Topic: ${esc(t.name)}</p>
        </article>`).join('')}
    </div>
  </section>`;
}

/* -------------------------------------------------------------- lanes views */

function renderLanes() {
  return `
  <p class="eyebrow">Lane Workspaces</p>
  <h1>One pattern, reused across every lane</h1>
  <hr class="rule-line" />
  <p class="muted" style="max-width:70ch">
    Each lane is a strategic or operational motion with its own owner. Every lane page follows the same
    structure: internal execution on the left, partner-approved material on the right, and the same governance
    metadata on every item.
  </p>
  <div class="grid grid--3">
    ${LANES.map(lane => {
      const count = TOPICS.filter(t => t.lane === lane.id).length;
      return `
      <button type="button" class="card card--link" data-nav="#/lane/${esc(lane.id)}">
        <div class="badge-row">${lifecycleBadge(lane.status)} ${badge('info', '◆', count + ' topic' + (count === 1 ? '' : 's'))}</div>
        <h3>${esc(lane.name)}</h3>
        <p class="small muted">${esc(lane.desc)}</p>
        <div class="card__meta"><dl><dt>Lane owner</dt><dd>${esc(lane.owner)}</dd></dl></div>
      </button>`;
    }).join('')}
  </div>`;
}

function laneAssetCard(a) {
  return `
  <div class="item">
    <p class="item__type">${esc(a.type)}</p>
    <h4>${esc(a.title)}</h4>
    <p>${esc(a.desc)}</p>
    ${a.condition ? `<p class="item__cond"><strong>Condition:</strong> ${esc(a.condition)}</p>` : ''}
    <div class="badge-row">${shareBadge(a.share)}</div>
    <div class="btn-row">
      ${ph(a.token || 'highspotAsset', a.digitalRoom ? 'Open Digital Room' : 'Open in Highspot')}
      ${a.share === 'external-approved' || a.share === 'conditional'
        ? `<button type="button" class="btn btn--sm" data-share="${esc(a.title)}">Add to Digital Room</button>` : ''}
    </div>
  </div>`;
}

function renderLane(route) {
  const lane = LANES.find(l => l.id === route.arg);
  if (!lane) return renderNotFound();
  const laneTopics = TOPICS.filter(t => t.lane === lane.id);
  const relevantIds = new Set(topicsForRole(state.role).map(t => t.id));
  const internal = [], partner = [];
  laneTopics.forEach(t => {
    (t.internal || []).forEach(a => internal.push({ a, t }));
    (t.partner || []).forEach(a => partner.push({ a, t }));
  });

  return `
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="#/home" data-nav="#/home">Home</a><span>/</span>
    <a href="#/lanes" data-nav="#/lanes">Lane Workspaces</a><span>/</span>${esc(lane.name)}
  </nav>

  <p class="eyebrow">Lane workspace</p>
  <h1>${esc(lane.name)}</h1>
  <hr class="rule-line" />
  <p class="muted" style="max-width:70ch">${esc(lane.desc)}</p>
  <div class="badge-row">
    ${lifecycleBadge(lane.status)}
    ${badge('neutral', '👤', 'Lane owner: ' + lane.owner)}
    ${badge('info', '◆', laneTopics.length + ' governed topic' + (laneTopics.length === 1 ? '' : 's'))}
  </div>

  ${laneTopics.length ? `
  <section class="section" style="margin-top:1.75rem">
    <h2>Topics in this lane</h2>
    <div class="grid grid--3">
      ${laneTopics.map(t => `
        <button type="button" class="card card--link" data-nav="#/topic/${esc(t.id)}">
          <div class="badge-row">
            ${lifecycleBadge(t.governance.lifecycle)}
            ${relevantIds.has(t.id) ? badge('info', '★', 'Relevant to your role') : ''}
          </div>
          <h3>${esc(t.name)}</h3>
          <p class="small muted">${esc(t.short)}</p>
        </button>`).join('')}
    </div>
  </section>` : `
  <div class="state" style="margin-top:1.5rem">
    <h3>No governed topics published in this lane yet</h3>
    <p class="muted">This lane exists in the model but has no approved topic pages. That is a visible gap, not an omission.</p>
    <div class="btn-row"><a class="btn btn--primary" href="#/gap" data-nav="#/gap">Report what you needed here</a></div>
  </div>`}

  <section class="section">
    <h2>Internal and partner-facing</h2>
    <p class="small muted" style="max-width:70ch">
      The split below is deliberate and is the same on every lane page. Left is what you use internally.
      Right is what has been approved for use with partners.
    </p>
    <div class="split">
      <section class="panel panel--internal" aria-labelledby="internalHead">
        <div class="panel__head">
          <p class="eyebrow" style="margin:0">For you</p>
          <h3 id="internalHead">Execute internally</h3>
        </div>
        <div class="panel__body">
          <p class="panel__warn panel__warn--danger">
            <span aria-hidden="true">⛔</span> Internal materials must not be shared externally unless they are
            explicitly classified as shareable.
          </p>
          ${internal.length ? internal.map(({ a, t }) =>
            `<div>${laneAssetCard(a)}<p class="tiny muted" style="margin:.3rem 0 0">Topic: ${esc(t.name)} · Owner: ${esc(t.governance.contentOwner || 'Not assigned')}</p></div>`).join('')
            : '<p class="muted small">No internal assets published in this lane yet.</p>'}
        </div>
      </section>

      <section class="panel panel--partner" aria-labelledby="partnerHead">
        <div class="panel__head">
          <p class="eyebrow" style="margin:0;color:#0f6f4c">For partners</p>
          <h3 id="partnerHead">Approved to use or share</h3>
        </div>
        <div class="panel__body">
          <p class="panel__warn panel__warn--ok">
            <span aria-hidden="true">✓</span> Everything in this column carries an explicit shareability
            classification. Read the classification before sharing — some carry conditions.
          </p>
          ${partner.length ? partner.map(({ a, t }) =>
            `<div>${laneAssetCard(a)}<p class="tiny muted" style="margin:.3rem 0 0">Topic: ${esc(t.name)} · Owner: ${esc(t.governance.contentOwner || 'Not assigned')}</p></div>`).join('')
            : `<div class="state"><h3>No partner-facing assets approved yet</h3>
                 <p class="muted small">Nothing in this lane has been approved for external use. Do not assume internal material is safe to share.</p>
                 <div class="btn-row"><a class="btn btn--sm" href="#/gap" data-nav="#/gap">Request a partner-facing asset</a></div></div>`}
        </div>
      </section>
    </div>
  </section>`;
}

/* -------------------------------------------------------------- topic view */

function renderTopic(route) {
  const t = TOPICS.find(x => x.id === route.arg);
  if (!t) return renderNotFound();
  const g = t.governance;
  const gaps = governanceGaps(t);
  const rs = reviewState(t);

  const notApproved = !isAuthoritative(t);

  return `
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="#/home" data-nav="#/home">Home</a><span>/</span>
    <a href="#/lane/${esc(t.lane)}" data-nav="#/lane/${esc(t.lane)}">${esc(laneName(t.lane))}</a><span>/</span>${esc(t.name)}
  </nav>

  ${notApproved ? `
  <div class="notice notice--danger">
    <strong>Not approved guidance.</strong> This topic is at ${esc(LIFECYCLE[g.lifecycle] ? LIFECYCLE[g.lifecycle].label.toLowerCase() : 'draft')}
    status with no recorded approval. Do not act on it, quote it or share it. It appears here so that the gap is
    visible and can be closed.
  </div>` : ''}

  ${rs.key === 'overdue' && !notApproved ? `
  <div class="notice notice--warn">
    <strong>Review overdue.</strong> This topic passed its review date on ${fmtDate(g.nextReview)}.
    The last approved version still applies, but check with ${esc(g.processOwner || 'the process owner')} before
    relying on it for a decision.
  </div>` : ''}

  <p class="eyebrow">${esc(t.ref)} · ${esc(laneName(t.lane))}</p>
  <h1>${esc(t.name)}</h1>
  <hr class="rule-line" />
  <p class="muted" style="max-width:70ch;font-size:1.02rem">${esc(t.short)}</p>

  <div class="badge-row" style="margin-bottom:1rem">
    ${approvalBadge(g.approvalStatus)}
    ${lifecycleBadge(g.lifecycle)}
    ${reviewBadge(t)}
    ${badge('info', '§', 'Version ' + (g.version || '—'))}
    ${badge('neutral', '👤', 'Content owner: ' + (g.contentOwner || 'Not assigned'))}
    ${badge('neutral', '⚙', 'Process owner: ' + (g.processOwner || 'Not assigned'))}
    ${gaps.length ? badge('danger', '⚑', gaps.length + ' governance gap' + (gaps.length > 1 ? 's' : '')) : ''}
  </div>

  <div class="btn-row" style="margin-bottom:1.5rem">
    ${ph('canonical', 'Open the canonical source')}
    ${ph('slack', 'Ask about this topic in Slack')}
    <a class="btn btn--sm" href="#/gap?topic=${esc(t.id)}" data-nav="#/gap?topic=${esc(t.id)}">Report an issue with this topic</a>
  </div>

  <!-- 1 -->
  <section class="section prose">
    <p class="eyebrow">Section 1</p>
    <h2>Definition and scope</h2>
    <div class="def-grid">
      <article class="card"><h3>What this is</h3><p class="small">${esc(t.definition.what)}</p></article>
      <article class="card"><h3>Why it matters</h3><p class="small">${esc(t.definition.why)}</p></article>
    </div>
    <div class="def-grid" style="margin-top:1rem">
      <article class="card"><h3>In scope</h3><ul class="small muted">${t.definition.inScope.map(i => `<li>${esc(i)}</li>`).join('')}</ul></article>
      <article class="card"><h3>Out of scope</h3><ul class="small muted">${t.definition.outOfScope.map(i => `<li>${esc(i)}</li>`).join('')}</ul></article>
      <article class="card">
        <h3>Relevant roles</h3>
        <p class="small muted">${esc(rolesLine(t.definition.roles))}</p>
        <h3 style="margin-top:.8rem">Related topics</h3>
        <ul class="small">${t.definition.related.map(id => {
          const rel = TOPICS.find(x => x.id === id);
          return rel ? `<li><a href="#/topic/${esc(rel.id)}" data-nav="#/topic/${esc(rel.id)}">${esc(rel.name)}</a></li>` : '';
        }).join('')}</ul>
      </article>
    </div>
  </section>

  <!-- 2 -->
  <section class="section">
    <p class="eyebrow">Section 2</p>
    <h2>Targets, standards and policies</h2>
    ${t.rules.mandatory.length || t.rules.recommended.length ? `
    <ul class="rule-list">
      ${t.rules.mandatory.map(r => `<li><span class="badge badge--danger"><span aria-hidden="true">!</span>Mandatory</span><strong>${esc(r.title)}</strong><p>${esc(r.detail)}</p></li>`).join('')}
      ${t.rules.recommended.map(r => `<li class="is-recommended"><span class="badge badge--ok"><span aria-hidden="true">✓</span>Recommended</span><strong>${esc(r.title)}</strong><p>${esc(r.detail)}</p></li>`).join('')}
      ${t.rules.optional.map(r => `<li class="is-optional"><span class="badge badge--neutral"><span aria-hidden="true">○</span>Optional</span><strong>${esc(r.title)}</strong><p>${esc(r.detail)}</p></li>`).join('')}
      ${t.rules.exceptions.map(r => `<li class="is-exception"><span class="badge badge--warn"><span aria-hidden="true">⚑</span>Exception process</span><strong>${esc(r.title)}</strong><p>${esc(r.detail)}</p></li>`).join('')}
    </ul>` : `<div class="state state--none"><h3>No approved rules published</h3>
      <p class="muted small">This topic has no approved standards. Nothing here is authoritative.</p></div>`}
  </section>

  <!-- 3 -->
  <section class="section">
    <p class="eyebrow">Section 3</p>
    <h2>What good looks like</h2>
    ${t.good.length ? t.good.map(x => compareCard(x.context, x.bad, x.good)).join('') :
      '<p class="muted small">No behavioural examples published for this topic yet.</p>'}
    <div class="grid grid--3">
      ${t.coaching.length ? `<article class="card"><h3>Manager coaching questions</h3><ul class="small muted" style="padding-left:1.1rem">${t.coaching.map(c => `<li>${esc(c)}</li>`).join('')}</ul></article>` : ''}
      ${t.mistakes.length ? `<article class="card"><h3>Common mistakes</h3><ul class="small muted" style="padding-left:1.1rem">${t.mistakes.map(c => `<li>${esc(c)}</li>`).join('')}</ul></article>` : ''}
      ${t.warnings.length ? `<article class="card"><h3>Warning signs</h3><ul class="small muted" style="padding-left:1.1rem">${t.warnings.map(c => `<li>${esc(c)}</li>`).join('')}</ul></article>` : ''}
    </div>
  </section>

  <!-- 4 -->
  <section class="section">
    <p class="eyebrow">Section 4</p>
    <h2>Track and measure</h2>
    ${t.metrics.length ? `<div class="grid grid--2">${t.metrics.map(m => kpiCard(m, t)).join('')}</div>`
      : '<p class="muted small">No measures defined for this topic yet.</p>'}
  </section>

  <!-- 5 -->
  <section class="section">
    <p class="eyebrow">Section 5</p>
    <h2>Resources and enablement</h2>
    <div class="split">
      <section class="panel panel--internal">
        <div class="panel__head"><p class="eyebrow" style="margin:0">For you</p><h3>Execute internally</h3></div>
        <div class="panel__body">
          <p class="panel__warn panel__warn--danger"><span aria-hidden="true">⛔</span> Internal materials must not be shared externally unless explicitly classified as shareable.</p>
          ${(t.internal || []).length ? t.internal.map(laneAssetCard).join('') : '<p class="muted small">No internal assets published.</p>'}
        </div>
      </section>
      <section class="panel panel--partner">
        <div class="panel__head"><p class="eyebrow" style="margin:0;color:#0f6f4c">For partners</p><h3>Approved to use or share</h3></div>
        <div class="panel__body">
          <p class="panel__warn panel__warn--ok"><span aria-hidden="true">✓</span> Read the classification on each item before sharing.</p>
          ${(t.partner || []).length ? t.partner.map(laneAssetCard).join('')
            : `<div class="state"><h3>No partner-facing assets</h3><p class="muted small">Nothing on this topic has been approved for external use.</p></div>`}
        </div>
      </section>
    </div>

    <div class="grid grid--3" style="margin-top:1.25rem">
      <article class="card">
        <h3>Training</h3>
        ${t.resources.training.length ? t.resources.training.map(r => `
          <div class="item" style="margin-bottom:.5rem">
            <p class="item__type">${esc(r.type)}</p><h4>${esc(r.title)}</h4>
            <p>${esc(r.desc)}</p><div class="btn-row">${ph(r.token, 'Open')}</div>
          </div>`).join('') : '<p class="muted small">None published.</p>'}
      </article>
      <article class="card">
        <h3>Documentation</h3>
        ${t.resources.documentation.map(r => `
          <div class="item" style="margin-bottom:.5rem">
            <p class="item__type">${esc(r.type)}</p><h4>${esc(r.title)}</h4>
            <p>${esc(r.desc)}</p><div class="btn-row">${ph(r.token, 'Open')}</div>
          </div>`).join('') || '<p class="muted small">None published.</p>'}
      </article>
      <article class="card">
        <h3>Dashboards</h3>
        ${t.resources.dashboards.map(r => `
          <div class="item" style="margin-bottom:.5rem">
            <h4>${esc(r.title)}</h4><p>${esc(r.desc)}</p>
            <p class="tiny muted">Audience: ${esc(r.audience)} · Use: ${esc(r.frequency)}</p>
            <div class="btn-row">${ph('dashboard', 'Open dashboard')}</div>
          </div>`).join('') || '<p class="muted small">None published.</p>'}
      </article>
    </div>

    ${t.resources.faqs.length ? `
    <h3 style="margin-top:1.25rem">Frequently asked questions</h3>
    ${t.resources.faqs.map(f => `<details class="acc"><summary>${esc(f.q)}</summary><div><p>${esc(f.a)}</p></div></details>`).join('')}` : ''}

    ${t.resources.contacts.length ? `
    <h3 style="margin-top:1.25rem">Named contacts</h3>
    <div class="grid grid--3">
      ${t.resources.contacts.map(c => `<article class="card"><p class="item__type">${esc(c.role)}</p><h4>${esc(c.name)}</h4><p class="small muted">${esc(c.note)}</p></article>`).join('')}
    </div>` : ''}
  </section>

  <!-- 6 -->
  <section class="section">
    <p class="eyebrow">Section 6</p>
    <h2>Governance and change history</h2>
    <p class="small muted" style="max-width:70ch">
      In Highspot this section would be visible to owners, managers, RevOps and administrators. It is shown in
      full here so the governance model can be reviewed.
    </p>

    ${gaps.length ? `<div class="notice notice--danger"><strong>Governance gaps:</strong> ${gaps.map(esc).join(' · ')}. A topic in this state must not be presented as authoritative.</div>` : ''}

    <div class="table-scroll">
      <table>
        <caption>Governance record for ${esc(t.name)} (${esc(t.ref)})</caption>
        <tbody>
          <tr><th scope="row">Canonical source</th><td>${esc(g.source)} ${g.source !== 'Not yet established' ? ph('canonical', 'Open source') : ''}</td></tr>
          <tr><th scope="row">Content owner</th><td>${esc(g.contentOwner || '— not assigned —')}</td></tr>
          <tr><th scope="row">Process owner</th><td>${esc(g.processOwner || '— not assigned —')}</td></tr>
          <tr><th scope="row">Approver</th><td>${esc(g.approver || '— not assigned —')}</td></tr>
          <tr><th scope="row">Revenue Enablement owner</th><td>${esc(g.enablementOwner || '— not assigned —')}</td></tr>
          <tr><th scope="row">Escalation contact</th><td>${esc(g.escalation || '— not assigned —')}</td></tr>
          <tr><th scope="row">Approval status</th><td>${approvalBadge(g.approvalStatus)}</td></tr>
          <tr><th scope="row">Publication status</th><td>${esc(g.publication)}</td></tr>
          <tr><th scope="row">Version</th><td>${esc(g.version || '—')}</td></tr>
          <tr><th scope="row">Approval date</th><td>${fmtDate(g.approvalDate)}</td></tr>
          <tr><th scope="row">Last review</th><td>${fmtDate(g.lastReview)}</td></tr>
          <tr><th scope="row">Next review</th><td>${fmtDate(g.nextReview)} ${reviewBadge(t)}</td></tr>
          <tr><th scope="row">Review cadence</th><td>${esc(g.cadence)}</td></tr>
          <tr><th scope="row">Lifecycle status</th><td>${lifecycleBadge(g.lifecycle)}</td></tr>
          <tr><th scope="row">Shareability</th><td>${shareBadge(g.shareability)}</td></tr>
          <tr><th scope="row">Slack assistant indexed</th><td>${g.indexed ? badge('ok', '✓', 'Indexed') : badge('danger', '✕', 'Not indexed')}</td></tr>
          <tr><th scope="row">Search keywords</th><td>${g.keywords.map(esc).join(', ')}</td></tr>
        </tbody>
      </table>
    </div>

    <h3 style="margin-top:1.5rem">Change history</h3>
    <ol class="timeline">
      ${g.changes.map(c => `
        <li>
          <p class="tl-date">${fmtDate(c.date)} · version ${esc(c.version)}</p>
          <h4>${esc(c.summary)}</h4>
          <p class="small muted">${esc(c.reason)}</p>
          <p class="tiny muted">
            Affected roles: ${esc(c.affects)} · Communication: ${esc(c.comms)} ·
            Training: ${esc(c.training)} · Assistant index: ${c.indexed ? 'updated' : 'not updated'}
          </p>
        </li>`).join('')}
    </ol>
  </section>`;
}

/* ----------------------------------------------------------- registry view */

function renderRegistry() {
  const lanesWithTopics = LANES.filter(l => TOPICS.some(t => t.lane === l.id));
  return `
  <p class="eyebrow">Topic Registry</p>
  <h1>The governance spine</h1>
  <hr class="rule-line" />
  <p class="muted" style="max-width:70ch">
    Every governed topic, with its source, owners, approval, version, review dates and classification.
    A topic missing an owner, source, approval or review date is flagged here and cannot be presented as
    authoritative anywhere else in the system.
  </p>

  <div class="filters">
    <div class="field">
      <label for="fLane">Lane</label>
      <select id="fLane"><option value="">All lanes</option>
        ${lanesWithTopics.map(l => `<option value="${esc(l.id)}">${esc(l.name)}</option>`).join('')}</select>
    </div>
    <div class="field">
      <label for="fRole">Role</label>
      <select id="fRole"><option value="">All roles</option>
        ${ROLES.filter(r => r.id !== 'all').map(r => `<option value="${esc(r.id)}"${state.role === r.id ? ' selected' : ''}>${esc(r.short)}</option>`).join('')}</select>
    </div>
    <div class="field">
      <label for="fStatus">Status</label>
      <select id="fStatus">
        <option value="">All statuses</option>
        <option value="published">Published</option>
        <option value="review-due">Review due or overdue</option>
        <option value="draft">Draft / not approved</option>
        <option value="gaps">Has governance gaps</option>
      </select>
    </div>
    <div class="field">
      <label for="fText">Find</label>
      <input type="search" id="fText" placeholder="Topic, keyword or owner" />
    </div>
    <p class="count-note" id="registryCount" aria-live="polite"></p>
  </div>

  <div class="table-scroll">
    <table id="registryTable">
      <caption>Topic Registry — all values are placeholders for prototype review.</caption>
      <thead>
        <tr>
          <th scope="col">ID</th><th scope="col">Topic</th><th scope="col">Lane</th>
          <th scope="col">Canonical source</th><th scope="col">Content owner</th><th scope="col">Process owner</th>
          <th scope="col">Approver</th><th scope="col">Roles</th><th scope="col">Approval</th>
          <th scope="col">Lifecycle</th><th scope="col">Version</th><th scope="col">Last review</th>
          <th scope="col">Next review</th><th scope="col">Cadence</th><th scope="col">Shareability</th>
          <th scope="col">Assistant</th><th scope="col">Flags</th><th scope="col">Page</th>
        </tr>
      </thead>
      <tbody id="registryBody"></tbody>
    </table>
  </div>

  <section class="section" style="margin-top:1.5rem">
    <h2>Why records are flagged</h2>
    <div class="grid grid--3">
      <article class="card"><h3>No named owner</h3><p class="small muted">Content that nobody owns cannot be maintained, and cannot be trusted. It must not be published as authoritative.</p></article>
      <article class="card"><h3>No canonical source</h3><p class="small muted">Without a single source document, the page itself becomes the source — which is how competing versions start.</p></article>
      <article class="card"><h3>Review overdue</h3><p class="small muted">The last approved version still applies, but its accuracy is unverified. Overdue records surface to the owner and to leadership reporting.</p></article>
    </div>
  </section>`;
}

function registryRows() {
  const lane = $('#fLane').value;
  const role = $('#fRole').value;
  const status = $('#fStatus').value;
  const text = $('#fText').value.trim().toLowerCase();

  const rows = TOPICS.filter(t => {
    if (lane && t.lane !== lane) return false;
    if (role && !t.definition.roles.includes(role)) return false;
    const gaps = governanceGaps(t);
    const rs = reviewState(t);
    if (status === 'published' && t.governance.lifecycle !== 'published') return false;
    if (status === 'review-due' && !(rs.key === 'overdue' || rs.key === 'due-soon')) return false;
    if (status === 'draft' && t.governance.approvalStatus === 'approved') return false;
    if (status === 'gaps' && !gaps.length) return false;
    if (text) {
      const hay = [t.name, t.ref, t.short, t.governance.contentOwner, t.governance.processOwner,
        t.governance.source, t.governance.keywords.join(' ')].join(' ').toLowerCase();
      if (!hay.includes(text)) return false;
    }
    return true;
  });

  $('#registryBody').innerHTML = rows.map(t => {
    const g = t.governance;
    const gaps = governanceGaps(t);
    return `<tr>
      <td>${esc(t.ref)}</td>
      <td><a href="#/topic/${esc(t.id)}" data-nav="#/topic/${esc(t.id)}">${esc(t.name)}</a></td>
      <td>${esc(laneName(t.lane))}</td>
      <td>${esc(g.source)}</td>
      <td>${g.contentOwner ? esc(g.contentOwner) : '<strong>— none —</strong>'}</td>
      <td>${g.processOwner ? esc(g.processOwner) : '<strong>— none —</strong>'}</td>
      <td>${g.approver ? esc(g.approver) : '<strong>— none —</strong>'}</td>
      <td>${esc(rolesLine(t.definition.roles))}</td>
      <td>${approvalBadge(g.approvalStatus)}</td>
      <td>${lifecycleBadge(g.lifecycle)}</td>
      <td>${esc(g.version || '—')}</td>
      <td>${fmtDate(g.lastReview)}</td>
      <td>${fmtDate(g.nextReview)}</td>
      <td>${esc(g.cadence)}</td>
      <td>${shareBadge(g.shareability)}</td>
      <td>${g.indexed ? badge('ok', '✓', 'Indexed') : badge('danger', '✕', 'Not indexed')}</td>
      <td>${gaps.length ? gaps.map(x => badge('danger', '⚑', x)).join(' ') : badge('ok', '✓', 'Complete')}</td>
      <td><a href="#/topic/${esc(t.id)}" data-nav="#/topic/${esc(t.id)}">Open</a></td>
    </tr>`;
  }).join('') || '<tr><td colspan="18">No topics match these filters.</td></tr>';

  const flagged = rows.filter(t => governanceGaps(t).length).length;
  $('#registryCount').textContent =
    `${rows.length} of ${TOPICS.length} topics shown · ${flagged} with governance gaps`;
}

/* --------------------------------------------------------- governance view */

function renderGovernance() {
  const owned = TOPICS.filter(t => t.governance.contentOwner).length;
  const overdue = TOPICS.filter(t => reviewState(t).key === 'overdue').length;
  const dueSoon = TOPICS.filter(t => reviewState(t).key === 'due-soon').length;
  const approved = TOPICS.filter(t => t.governance.approvalStatus === 'approved').length;
  const indexed = TOPICS.filter(t => t.governance.indexed).length;
  const pct = n => Math.round((n / TOPICS.length) * 100) + '%';

  const allChanges = TOPICS.flatMap(t => t.governance.changes.map(c => ({ c, t })))
    .sort((a, b) => (a.c.date < b.c.date ? 1 : -1));

  return `
  <p class="eyebrow">Governance and change history</p>
  <h1>How content becomes approved, and stays approved</h1>
  <hr class="rule-line" />
  <p class="muted" style="max-width:70ch">
    The Hub is a governance system first. Documentation is what the governance produces. Uploaded is not the
    same as approved — nothing reaches sellers without an owner, a source, an approval, a version and a review date.
  </p>

  <section class="section">
    <h2>Governance health</h2>
    <div class="grid grid--4">
      <article class="card"><p class="eyebrow">Ownership</p><p class="kpi__threshold">${pct(owned)}</p><p class="small muted">${owned} of ${TOPICS.length} topics have a named content owner.</p></article>
      <article class="card"><p class="eyebrow">Approval</p><p class="kpi__threshold">${pct(approved)}</p><p class="small muted">${approved} of ${TOPICS.length} topics carry a recorded approval.</p></article>
      <article class="card"><p class="eyebrow">Review status</p><p class="kpi__threshold">${overdue}</p><p class="small muted">overdue, and ${dueSoon} due within 30 days.</p></article>
      <article class="card"><p class="eyebrow">Assistant index</p><p class="kpi__threshold">${pct(indexed)}</p><p class="small muted">${indexed} of ${TOPICS.length} approved sources are indexed for Slack answers.</p></article>
    </div>
    ${overdue ? `<div class="notice notice--warn" style="margin-top:1rem"><strong>${overdue} topic${overdue > 1 ? 's are' : ' is'} past review date.</strong>
      Overdue records stay visible with a warning rather than being silently withdrawn, so sellers are not left with nothing.
      <a href="#/registry" data-nav="#/registry">See them in the registry</a>.</div>` : ''}
  </section>

  <section class="section">
    <h2>Publication workflow</h2>
    <p class="small muted">Ten stages. A topic cannot skip from draft to published.</p>
    <div class="grid grid--3">
      ${GOVERNANCE_STAGES.map(s => `
        <article class="card">
          <p class="eyebrow">Stage ${s.n}</p>
          <h3>${esc(s.name)}</h3>
          <p class="small muted">${esc(s.desc)}</p>
          <div class="card__meta"><dl><dt>Accountable</dt><dd>${esc(s.owner)}</dd></dl></div>
        </article>`).join('')}
    </div>
  </section>

  <section class="section">
    <h2>Publication checklist</h2>
    <p class="small muted">Every item must be true before a topic is published. This is the control that stops "uploaded" being mistaken for "approved".</p>
    <div class="card">
      <ul style="margin:0;padding-left:1.2rem">
        ${PUBLICATION_CHECKLIST.map(i => `<li>${esc(i)}</li>`).join('')}
      </ul>
    </div>
  </section>

  <section class="section">
    <h2>Ownership matrix</h2>
    <div class="table-scroll">
      <table>
        <caption>Who is accountable for what. Placeholder owners.</caption>
        <thead><tr><th scope="col">Responsibility</th><th scope="col">Accountable</th><th scope="col">Consulted</th><th scope="col">Cadence</th></tr></thead>
        <tbody>
          <tr><td>Canonical source content</td><td>Process owner (RevOps, Sales Leadership, Marketing, Presales)</td><td>Revenue Enablement</td><td>At change, and at review date</td></tr>
          <tr><td>Highspot topic page</td><td>Content owner (Revenue Enablement)</td><td>Process owner</td><td>At change, and at review date</td></tr>
          <tr><td>Approval decision</td><td>Named approver</td><td>Legal or Compliance where relevant</td><td>Per version</td></tr>
          <tr><td>Shareability classification</td><td>Content owner</td><td>Product Marketing, Legal</td><td>Per asset, checked at review</td></tr>
          <tr><td>Slack assistant index</td><td>Revenue Enablement</td><td>RevOps</td><td>Within one working day of publication</td></tr>
          <tr><td>Adoption and gap analysis</td><td>Revenue Enablement</td><td>Sales Leadership</td><td>Monthly</td></tr>
          <tr><td>Escalation when guidance conflicts</td><td>EMEA Sales Operations lead</td><td>Affected process owners</td><td>On demand</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="section">
    <h2>Change history across all topics</h2>
    <ol class="timeline">
      ${allChanges.map(({ c, t }) => `
        <li>
          <p class="tl-date">${fmtDate(c.date)} · ${esc(t.name)} · version ${esc(c.version)}</p>
          <h4>${esc(c.summary)}</h4>
          <p class="small muted">${esc(c.reason)}</p>
          <p class="tiny muted">Affected: ${esc(c.affects)} · Communication: ${esc(c.comms)} · Training: ${esc(c.training)} · Assistant index: ${c.indexed ? 'updated' : 'not updated'}</p>
          <p class="tiny"><a href="#/topic/${esc(t.id)}" data-nav="#/topic/${esc(t.id)}">Open ${esc(t.name)}</a></p>
        </li>`).join('')}
    </ol>
  </section>`;
}

/* ------------------------------------------------------------- search index */

function buildIndex() {
  const entries = [];
  TOPICS.forEach(t => {
    const base = {
      topic: t,
      owner: t.governance.contentOwner || 'Not assigned',
      approval: t.governance.approvalStatus,
      lastReview: t.governance.lastReview,
      roles: t.definition.roles,
      href: `#/topic/${t.id}`
    };
    entries.push(Object.assign({}, base, {
      kind: 'Topic page', title: t.name, desc: t.short,
      share: t.governance.shareability,
      text: [t.name, t.ref, t.short, t.definition.what, t.definition.why,
        t.governance.keywords.join(' '), t.governance.slackQuestions.join(' ')].join(' ')
    }));
    t.rules.mandatory.forEach(r => entries.push(Object.assign({}, base, {
      kind: 'Rule', title: r.title, desc: r.detail, share: 'internal-only',
      text: [r.title, r.detail, t.name].join(' ')
    })));
    t.resources.faqs.forEach(f => entries.push(Object.assign({}, base, {
      kind: 'FAQ', title: f.q, desc: f.a, share: 'internal-only',
      text: [f.q, f.a, t.name].join(' ')
    })));
    t.metrics.forEach(m => entries.push(Object.assign({}, base, {
      kind: 'Measure', title: m.name, desc: m.what + ' Dashboard: ' + m.dashboard,
      share: 'internal-only', text: [m.name, m.what, m.why, m.dashboard, t.name].join(' ')
    })));
    t.resources.training.forEach(r => entries.push(Object.assign({}, base, {
      kind: 'Training', title: r.title, desc: r.desc, share: r.share || 'internal-only',
      text: [r.title, r.desc, r.type, t.name].join(' ')
    })));
    (t.internal || []).forEach(a => entries.push(Object.assign({}, base, {
      kind: 'Internal asset', title: a.title, desc: a.desc, share: a.share,
      text: [a.title, a.desc, a.type, t.name].join(' ')
    })));
    (t.partner || []).forEach(a => entries.push(Object.assign({}, base, {
      kind: 'Partner asset', title: a.title, desc: a.desc, share: a.share,
      text: [a.title, a.desc, a.type, t.name, 'partner share external'].join(' ')
    })));
    t.resources.dashboards.forEach(d => entries.push(Object.assign({}, base, {
      kind: 'Dashboard', title: d.title, desc: d.desc, share: 'internal-only',
      text: [d.title, d.desc, 'dashboard report', t.name].join(' ')
    })));
  });
  return entries;
}

const SEARCH_INDEX = buildIndex();

/* Light synonym map so seller language reaches the right topic. */
const SYNONYMS = {
  opp: 'opportunity', opps: 'opportunity', pipe: 'pipeline', sfdc: 'salesforce', sf: 'salesforce',
  forcast: 'forecast', forecasting: 'forecast', comit: 'commit', kpis: 'kpi', dash: 'dashboard',
  reports: 'dashboard', report: 'dashboard', stages: 'stage', partners: 'partner',
  shareable: 'share', sharing: 'share', external: 'partner', handoff: 'handoff', 'hand-off': 'handoff',
  mgr: 'manager', training: 'course', dupes: 'duplicates', dupe: 'duplicates'
};

function tokenise(query) {
  return query.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/)
    .filter(w => w.length > 1 && !['the', 'and', 'for', 'what', 'when', 'how', 'is', 'are', 'do', 'does', 'can', 'should', 'our', 'my', 'to', 'of', 'in', 'on', 'with', 'at'].includes(w))
    .map(w => SYNONYMS[w] || w);
}

function scoreEntry(entry, terms) {
  const title = entry.title.toLowerCase();
  const text = entry.text.toLowerCase();
  let score = 0;
  terms.forEach(term => {
    if (title.includes(term)) score += 6;
    if (text.includes(term)) score += 2;
  });
  /* No term matched, so no result. Bonuses must never manufacture a hit. */
  if (score === 0) return 0;
  if (entry.kind === 'Topic page') score += 2;
  if (entry.approval === 'approved') score += 1;
  /* Role relevance nudges results, it does not hide anything. */
  if (state.role !== 'all' && entry.roles.includes(state.role)) score += 2;
  return score;
}

function searchAll(query) {
  const terms = tokenise(query);
  if (!terms.length) return [];
  return SEARCH_INDEX
    .map(e => ({ e, score: scoreEntry(e, terms) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);
}

function renderSearch(route) {
  const q = route.params.get('q') || '';
  const results = searchAll(q);

  return `
  <p class="eyebrow">Search</p>
  <h1>Results for “${esc(q)}”</h1>
  <hr class="rule-line" />

  <form class="filters" id="pageSearch" role="search" style="align-items:end">
    <div class="field" style="flex:1 1 320px">
      <label for="q2">Refine your search</label>
      <input type="search" id="q2" value="${esc(q)}" />
    </div>
    <button class="btn btn--primary" type="submit">Search</button>
    <a class="btn btn--slack" href="#/assistant?q=${encodeURIComponent(q)}" data-nav="#/assistant?q=${encodeURIComponent(q)}"><span aria-hidden="true">💬</span> Ask this in Slack</a>
    <p class="count-note">${results.length} result${results.length === 1 ? '' : 's'}${state.role !== 'all' ? ' · ranked for ' + esc(roleName(state.role)) : ''}</p>
  </form>

  ${results.length ? `
  <div class="grid grid--2">
    ${results.map(({ e }) => `
      <button type="button" class="card card--link" data-nav="${esc(e.href)}">
        <div class="badge-row">
          ${badge('info', '◆', e.kind)}
          ${approvalBadge(e.approval)}
          ${shareBadge(e.share)}
        </div>
        <h3>${esc(e.title)}</h3>
        <p class="small muted">${esc(e.desc)}</p>
        <div class="card__meta">
          <dl>
            <dt>Topic</dt><dd>${esc(e.topic.name)}</dd>
            <dt>Owner</dt><dd>${esc(e.owner)}</dd>
            <dt>Last review</dt><dd>${fmtDate(e.lastReview)}</dd>
            <dt>Relevant to</dt><dd>${esc(rolesLine(e.roles))}</dd>
          </dl>
        </div>
      </button>`).join('')}
  </div>` : `
  <div class="state state--none">
    <h3>No approved content matched that search</h3>
    <p class="muted">
      This is a zero-result search. It is recorded so that Revenue Enablement can see what people are looking
      for and cannot find. Do not assume the answer does not exist — assume it is not published here yet.
    </p>
    <div class="btn-row">
      <a class="btn btn--slack" href="#/assistant?q=${encodeURIComponent(q)}" data-nav="#/assistant?q=${encodeURIComponent(q)}"><span aria-hidden="true">💬</span> Ask the Slack assistant</a>
      <a class="btn btn--primary" href="#/gap?q=${encodeURIComponent(q)}" data-nav="#/gap?q=${encodeURIComponent(q)}">Report a content gap</a>
    </div>
  </div>`}`;
}

/* ------------------------------------------------------------ assistant view */

function matchTopicForQuestion(question) {
  const terms = tokenise(question);
  if (!terms.length) return null;
  let best = null;
  TOPICS.forEach(t => {
    if (!isAuthoritative(t)) return;
    let score = 0;
    const name = t.name.toLowerCase();
    const keys = t.governance.keywords.join(' ').toLowerCase();
    const qs = t.governance.slackQuestions.join(' ').toLowerCase();
    const faq = t.resources.faqs.map(f => f.q + ' ' + f.a).join(' ').toLowerCase();
    terms.forEach(term => {
      if (name.includes(term)) score += 5;
      if (keys.includes(term)) score += 4;
      if (qs.includes(term)) score += 3;
      if (faq.includes(term)) score += 2;
    });
    /* An exact match on a known Slack question is decisive. */
    if (t.governance.slackQuestions.some(x => x.toLowerCase() === question.trim().toLowerCase())) score += 20;
    if (!best || score > best.score) best = { topic: t, score };
  });
  return best && best.score >= 6 ? best : null;
}

function matchGapForQuestion(question) {
  const terms = tokenise(question);
  let best = null;
  CONTENT_GAPS.forEach(g => {
    let score = 0;
    const hay = (g.question + ' ' + g.keywords.join(' ')).toLowerCase();
    terms.forEach(term => { if (hay.includes(term)) score += 4; });
    if (g.question.toLowerCase() === question.trim().toLowerCase()) score += 20;
    if (!best || score > best.score) best = { gap: g, score };
  });
  return best && best.score >= 8 ? best : null;
}

function bestAnswerLine(topic, question) {
  const q = question.toLowerCase();
  const faq = topic.resources.faqs.find(f => tokenise(f.q).some(term => q.includes(term)));
  if (faq) return faq.a;
  if (topic.rules.mandatory.length) {
    const r = topic.rules.mandatory[0];
    return `${r.title}. ${r.detail}`;
  }
  return topic.definition.what;
}

function sourceBlock(topic, question) {
  const g = topic.governance;
  const wantsSharing = /(share|shareable|partner|external|send|give)/i.test(question);
  const rs = reviewState(topic);
  return `
  ${wantsSharing ? `<p class="panel__warn panel__warn--danger" style="margin-bottom:.6rem">
    <span aria-hidden="true">⛔</span> Shareability: this topic is classified
    <strong>${esc(SHAREABILITY[g.shareability].label)}</strong>. Check each asset's own classification on the
    topic page before sharing anything.</p>` : ''}
  ${rs.key === 'overdue' ? `<p class="panel__warn panel__warn--danger" style="margin-bottom:.6rem">
    <span aria-hidden="true">⏰</span> This source is past its review date (${fmtDate(g.nextReview)}).
    Confirm with ${esc(g.processOwner)} before relying on it.</p>` : ''}
  <div class="source-block">
    <dl>
      <dt>Source</dt><dd>${esc(g.source)}, version ${esc(g.version)}</dd>
      <dt>Last reviewed</dt><dd>${fmtDate(g.lastReview)}</dd>
      <dt>Owner</dt><dd>${esc(g.contentOwner || 'Not assigned')}</dd>
    </dl>
    <div class="btn-row" style="margin-top:0">
      <a class="btn btn--sm btn--primary" href="#/topic/${esc(topic.id)}" data-nav="#/topic/${esc(topic.id)}">Open ${esc(topic.name)} in Highspot</a>
      ${ph('highspotTopic', 'Highspot topic URL')}
    </div>
  </div>`;
}

function assistantAnswer(question) {
  const topicMatch = matchTopicForQuestion(question);
  const gapMatch = matchGapForQuestion(question);

  /* Approved, published answer wins. */
  if (topicMatch && (!gapMatch || topicMatch.score >= gapMatch.score)) {
    const t = topicMatch.topic;
    return `
    <div class="bubble bubble--bot">
      <h4>Approved answer</h4>
      <p>${esc(bestAnswerLine(t, question))}</p>
      ${sourceBlock(t, question)}
    </div>`;
  }

  /* Approved source exists, but it is not published in Highspot yet. */
  if (gapMatch) {
    const g = gapMatch.gap;
    return `
    <div class="bubble bubble--bot">
      <h4>Approved source found — not yet published in Highspot</h4>
      <p>${esc(g.answer)}</p>
      <div class="state state--gap" style="margin-top:.7rem">
        <p class="small" style="margin:0"><strong>Content gap.</strong> ${esc(g.note)}</p>
      </div>
      <div class="source-block">
        <dl>
          <dt>Source</dt><dd>${esc(g.source)}</dd>
          <dt>Last reviewed</dt><dd>${fmtDate(g.lastReview)}</dd>
          <dt>Owner</dt><dd>${esc(g.owner)}</dd>
        </dl>
        <div class="btn-row" style="margin-top:0">
          <a class="btn btn--sm btn--primary" href="#/gap?q=${encodeURIComponent(g.question)}" data-nav="#/gap?q=${encodeURIComponent(g.question)}">Log this gap for the ${esc(laneName(g.lane))} lane</a>
          <a class="btn btn--sm" href="#/lane/${esc(g.lane)}" data-nav="#/lane/${esc(g.lane)}">Open the ${esc(laneName(g.lane))} lane</a>
        </div>
      </div>
    </div>`;
  }

  /* Nothing approved. The assistant must say so and not invent an answer. */
  return `
  <div class="bubble bubble--bot">
    <h4>No approved guidance currently exists</h4>
    <p class="small muted">
      I could not find an approved source for that question. I will not answer from assumption. Here is what
      you can do next.
    </p>
    <div class="btn-row">
      <a class="btn btn--sm btn--primary" href="#/gap?q=${encodeURIComponent(question)}" data-nav="#/gap?q=${encodeURIComponent(question)}">Report a content gap</a>
      <a class="btn btn--sm" href="#/registry" data-nav="#/registry">Find the owner in the registry</a>
      <a class="btn btn--sm" href="#/lanes" data-nav="#/lanes">Browse lanes</a>
    </div>
    <p class="tiny muted" style="margin-top:.7rem">
      This unanswered question is recorded. Repeated unanswered questions are the primary input to the
      content roadmap.
    </p>
  </div>`;
}

function renderAssistant(route) {
  const preset = route.params.get('q') || '';
  return `
  <p class="eyebrow">Ask the Salesforce Assistant</p>
  <h1>A conversational doorway into approved content</h1>
  <hr class="rule-line" />
  <div class="notice notice--info">
    <strong>This is not a second knowledge base, and this page is not a chatbot.</strong>
    Your organisation already has a Slack assistant. This page simulates how it behaves so the handoff can be
    reviewed: it answers only from approved sources, always cites source, version, review date and owner,
    always links back here, and says plainly when no approved guidance exists.
  </div>

  <div class="split" style="margin-bottom:1.5rem">
    <article class="card">
      <h3>What the assistant will do</h3>
      <ul class="small muted" style="padding-left:1.1rem">
        <li>Search approved Highspot topics and canonical sources, in that order</li>
        <li>Give a concise answer and cite the source, version, review date and owner</li>
        <li>Warn about shareability before you send anything to a partner</li>
        <li>Link to the exact page here, not to a generic landing page</li>
        <li>Flag when an approved source exists but is not yet published in Highspot</li>
      </ul>
    </article>
    <article class="card">
      <h3>What it will not do</h3>
      <ul class="small muted" style="padding-left:1.1rem">
        <li>Answer from assumption when no approved guidance exists</li>
        <li>Hold its own copy of the content it answers from</li>
        <li>Return restricted material to someone without permission</li>
        <li>Quote a draft, an archived version or an unowned document</li>
      </ul>
      <div class="btn-row">${ph('slack', 'Open the real assistant in Slack')}</div>
    </article>
  </div>

  <form class="filters" id="askForm" style="align-items:end">
    <div class="field" style="flex:1 1 340px">
      <label for="askInput">Try a question</label>
      <input type="search" id="askInput" value="${esc(preset)}" placeholder="e.g. What can I share with a partner about MIP?" />
    </div>
    <button class="btn btn--primary" type="submit">Ask</button>
  </form>

  <div class="suggests" style="margin-bottom:1.25rem">
    ${[...SUGGESTED_QUESTIONS.slice(0, 4),
       'What can I share with a partner about MIP?',
       'What is our policy on discounting above 30%?'
      ].map(q => `<button type="button" class="btn btn--sm" data-ask="${esc(q)}">${esc(q)}</button>`).join('')}
  </div>

  <div class="chat" id="chatLog" aria-live="polite">
    ${preset ? `<div class="bubble bubble--user">${esc(preset)}</div>${assistantAnswer(preset)}`
      : `<div class="bubble bubble--bot">
           <h4>Ask a question</h4>
           <p class="small muted">Try one of the examples above. Two of them are designed to fail:
           one has an approved source that is not published in Highspot yet, and one has no approved guidance
           at all.</p>
         </div>`}
  </div>`;
}

/* ------------------------------------------------------------------ gap view */

function renderGap(route) {
  const preset = route.params.get('q') || '';
  const topicId = route.params.get('topic') || '';
  const reports = state.gapReports;

  return `
  <p class="eyebrow">Report missing or incorrect guidance</p>
  <h1>A gap nobody reports stays a gap</h1>
  <hr class="rule-line" />
  <p class="muted" style="max-width:70ch">
    Use this when you could not find an answer, when two sources disagree, when something looks out of date,
    or when a partner-facing version of an internal asset would help. Reports route to the named owner for the
    lane and appear in the monthly content review.
  </p>

  <form class="form card" id="gapForm">
    <div class="field">
      <label for="gapQuestion">What were you trying to find out?</label>
      <input type="text" id="gapQuestion" required value="${esc(preset)}" placeholder="e.g. What can I share with a partner about MIP?" />
    </div>
    <div class="field">
      <label for="gapType">What kind of problem is it?</label>
      <select id="gapType">
        <option value="missing">No guidance exists that I could find</option>
        <option value="not-published">Guidance exists elsewhere but is not in Highspot</option>
        <option value="outdated">Guidance looks out of date</option>
        <option value="conflict">Two sources disagree</option>
        <option value="unclear">Guidance exists but is unclear</option>
        <option value="partner">I need a partner-facing version of something internal</option>
      </select>
    </div>
    <div class="field">
      <label for="gapLane">Which lane does it belong to?</label>
      <select id="gapLane">${LANES.map(l => `<option value="${esc(l.id)}"${topicId && TOPICS.find(t => t.id === topicId && t.lane === l.id) ? ' selected' : ''}>${esc(l.name)}</option>`).join('')}</select>
    </div>
    <div class="field">
      <label for="gapWhere">Where did you look first?</label>
      <input type="text" id="gapWhere" placeholder="e.g. Slack assistant, this hub, a colleague, SharePoint" />
    </div>
    <div class="field">
      <label for="gapImpact">What is the impact?</label>
      <select id="gapImpact">
        <option value="blocking">Blocking a live deal or partner conversation</option>
        <option value="slowing">Slowing me down but I have a workaround</option>
        <option value="improvement">Not urgent, would improve things</option>
      </select>
    </div>
    <div class="field">
      <label for="gapDetail">Anything else the owner should know?</label>
      <textarea id="gapDetail" placeholder="Optional. Include the partner, the deal or the source you found, if relevant."></textarea>
    </div>
    <div class="btn-row" style="margin-top:0">
      <button type="submit" class="btn btn--primary">Submit report</button>
      <a class="btn" href="#/home" data-nav="#/home">Cancel</a>
    </div>
    <p class="tiny muted" style="margin:0">
      Prototype behaviour: reports are stored in this browser only, so you can see the workflow. In Highspot
      this would create a governed request against the lane owner.
    </p>
  </form>

  <div id="gapResult"></div>

  <section class="section" style="margin-top:2rem">
    <h2>Reports you have submitted in this browser</h2>
    <div id="gapList">${gapListHtml(reports)}</div>
  </section>

  <section class="section">
    <h2>What happens to a report</h2>
    <div class="grid grid--4">
      <article class="card"><p class="eyebrow">1</p><h3>Routed</h3><p class="small muted">To the named lane owner and the Revenue Enablement owner, within one working day.</p></article>
      <article class="card"><p class="eyebrow">2</p><h3>Triaged</h3><p class="small muted">Blocking reports are answered directly while the content is written.</p></article>
      <article class="card"><p class="eyebrow">3</p><h3>Published</h3><p class="small muted">The answer becomes a governed topic or an addition to one — not a Slack reply that disappears.</p></article>
      <article class="card"><p class="eyebrow">4</p><h3>Closed back</h3><p class="small muted">The person who reported it is told what changed and where it now lives.</p></article>
    </div>
  </section>`;
}

function gapListHtml(reports) {
  if (!reports.length) return '<p class="muted small">No reports submitted from this browser yet.</p>';
  return `<div class="grid grid--2">${reports.map(r => `
    <article class="card">
      <div class="badge-row">
        ${badge('info', '#', r.ref)}
        ${badge(r.impact === 'blocking' ? 'danger' : r.impact === 'slowing' ? 'warn' : 'neutral', '◆',
          r.impact === 'blocking' ? 'Blocking' : r.impact === 'slowing' ? 'Slowing' : 'Improvement')}
        ${badge('neutral', '◷', 'Submitted ' + fmtDate(r.date))}
      </div>
      <h3>${esc(r.question)}</h3>
      <p class="small muted">${esc(r.typeLabel)} · ${esc(laneName(r.lane))}</p>
      ${r.detail ? `<p class="small muted">${esc(r.detail)}</p>` : ''}
      <div class="card__meta"><dl>
        <dt>Routed to</dt><dd>${esc((LANES.find(l => l.id === r.lane) || {}).owner || 'Lane owner')}</dd>
        <dt>Status</dt><dd>Open — awaiting owner triage</dd>
      </dl></div>
    </article>`).join('')}</div>`;
}

/* ----------------------------------------------------------------- about view */

function renderAbout() {
  return `
  <p class="eyebrow">About this prototype</p>
  <h1>How to read what you are looking at</h1>
  <hr class="rule-line" />
  <div class="notice notice--warn">
    <strong>All content is placeholder.</strong> Owners, dates, versions, targets, thresholds, policies and
    change history are invented to demonstrate the governance model. Nothing here is approved Pax8 guidance,
    and no target or rule on this site should be quoted.
  </div>

  <div class="grid grid--2">
    <article class="card">
      <h3>What is real in this prototype</h3>
      <ul class="small muted" style="padding-left:1.1rem">
        <li>The information architecture and navigation model</li>
        <li>The six-section topic template</li>
        <li>The governance record and the states it can be in</li>
        <li>The internal versus partner-facing split and its classifications</li>
        <li>The role-relevance behaviour</li>
        <li>The Slack assistant handoff logic, including its failure states</li>
        <li>The registry, its flags and the content-gap workflow</li>
      </ul>
    </article>
    <article class="card">
      <h3>What is deliberately not real</h3>
      <ul class="small muted" style="padding-left:1.1rem">
        <li>Every owner name, which is shown as a placeholder to be confirmed</li>
        <li>Every date, version, target and threshold</li>
        <li>All links, which appear as visible tokens rather than silent dead links</li>
        <li>The assistant itself — the real one lives in Slack and is not rebuilt here</li>
      </ul>
      <div class="btn-row">${ph('highspotTopic', 'Example placeholder link')}</div>
    </article>
  </div>

  <section class="section">
    <h2>Deliberate demonstration states</h2>
    <div class="grid grid--3">
      <article class="card"><h3>Draft, unowned topic</h3><p class="small muted">
        <a href="#/topic/partner-ai-conversations" data-nav="#/topic/partner-ai-conversations">AI Conversations with Partners</a>
        has no owner, no source and no approval. It shows how the system refuses to present unowned content as authoritative.</p></article>
      <article class="card"><h3>Overdue reviews</h3><p class="small muted">
        Two topics are past their review date. They stay visible with a warning rather than disappearing, and they
        are flagged in the <a href="#/registry" data-nav="#/registry">registry</a>.</p></article>
      <article class="card"><h3>Assistant failure states</h3><p class="small muted">
        On the <a href="#/assistant" data-nav="#/assistant">assistant page</a>, one sample question hits an approved
        source that is not yet in Highspot, and one has no approved answer at all.</p></article>
    </div>
  </section>

  <section class="section">
    <h2>Placeholder link tokens used</h2>
    <div class="table-scroll">
      <table>
        <thead><tr><th scope="col">Token</th><th scope="col">Replaced at implementation with</th></tr></thead>
        <tbody>
          <tr><td><code>{{HIGHSPOT_TOPIC_URL}}</code></td><td>The Highspot SmartPage URL for the topic</td></tr>
          <tr><td><code>{{HIGHSPOT_ASSET_URL}}</code></td><td>The Highspot asset URL</td></tr>
          <tr><td><code>{{SLACK_ASSISTANT_URL}}</code></td><td>Deep link to the existing Slack assistant</td></tr>
          <tr><td><code>{{DASHBOARD_URL}}</code></td><td>The approved Salesforce dashboard URL</td></tr>
          <tr><td><code>{{WORKDAY_COURSE_URL}}</code></td><td>The Workday learning course URL</td></tr>
          <tr><td><code>{{DIGITAL_ROOM_URL}}</code></td><td>The Highspot Digital Room URL</td></tr>
          <tr><td><code>{{CANONICAL_SOURCE_URL}}</code></td><td>The canonical source document location</td></tr>
        </tbody>
      </table>
    </div>
  </section>`;
}

function renderNotFound() {
  return `
  <div class="state">
    <h3>That page does not exist in this prototype</h3>
    <p class="muted">Use the navigation above, or start again from the home page.</p>
    <div class="btn-row"><a class="btn btn--primary" href="#/home" data-nav="#/home">Back to Home</a></div>
  </div>`;
}

/* ------------------------------------------------------------ after render */

function afterRender(route) {
  if (route.name === 'registry') {
    ['fLane', 'fRole', 'fStatus', 'fText'].forEach(id => {
      const node = $('#' + id);
      node.addEventListener('input', registryRows);
      node.addEventListener('change', registryRows);
    });
    registryRows();
  }

  const heroSearch = $('#heroSearch');
  if (heroSearch) {
    heroSearch.addEventListener('submit', ev => {
      ev.preventDefault();
      const value = $('#q').value.trim();
      if (value) location.hash = `#/search?q=${encodeURIComponent(value)}`;
    });
    $$('[data-suggest]').forEach(btn => btn.addEventListener('click', () => {
      location.hash = `#/search?q=${encodeURIComponent(btn.dataset.suggest)}`;
    }));
  }

  const pageSearch = $('#pageSearch');
  if (pageSearch) {
    pageSearch.addEventListener('submit', ev => {
      ev.preventDefault();
      const value = $('#q2').value.trim();
      if (value) location.hash = `#/search?q=${encodeURIComponent(value)}`;
    });
  }

  const askForm = $('#askForm');
  if (askForm) {
    const ask = question => {
      if (!question) return;
      const log = $('#chatLog');
      if (log.querySelector('.bubble--user') === null) log.innerHTML = '';
      log.insertAdjacentHTML('beforeend', `<div class="bubble bubble--user">${esc(question)}</div>`);
      log.insertAdjacentHTML('beforeend', assistantAnswer(question));
      log.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    askForm.addEventListener('submit', ev => { ev.preventDefault(); ask($('#askInput').value.trim()); });
    $$('[data-ask]').forEach(btn => btn.addEventListener('click', () => {
      $('#askInput').value = btn.dataset.ask;
      ask(btn.dataset.ask);
    }));
  }

  const gapForm = $('#gapForm');
  if (gapForm) {
    gapForm.addEventListener('submit', ev => {
      ev.preventDefault();
      const typeSelect = $('#gapType');
      const report = {
        ref: 'GAP-' + String(1000 + state.gapReports.length + 1),
        date: new Date().toISOString().slice(0, 10),
        question: $('#gapQuestion').value.trim(),
        type: typeSelect.value,
        typeLabel: typeSelect.options[typeSelect.selectedIndex].text,
        lane: $('#gapLane').value,
        where: $('#gapWhere').value.trim(),
        impact: $('#gapImpact').value,
        detail: $('#gapDetail').value.trim()
      };
      if (!report.question) return;
      state.gapReports.unshift(report);
      localStorage.setItem(STORE_GAPS, JSON.stringify(state.gapReports));
      const lane = LANES.find(l => l.id === report.lane) || {};
      $('#gapResult').innerHTML = `
        <div class="notice notice--info" style="margin-top:1rem">
          <strong>Report ${esc(report.ref)} recorded.</strong>
          Routed to ${esc(lane.owner || 'the lane owner')} for ${esc(lane.name || 'the lane')} and to the
          Revenue Enablement owner. ${report.impact === 'blocking'
            ? 'Marked as blocking, so it is answered directly while the content is written.'
            : 'It will appear in the next monthly content review.'}
        </div>`;
      $('#gapList').innerHTML = gapListHtml(state.gapReports);
      gapForm.reset();
      $('#gapResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
}

/* --------------------------------------------------------------- global wiring */

function toast(message) {
  const node = $('#toast');
  node.innerHTML = message;
  node.classList.add('is-open');
  clearTimeout(node._timer);
  node._timer = setTimeout(() => node.classList.remove('is-open'), 4200);
}

function initRoles() {
  const select = $('#roleSelect');
  select.innerHTML = ROLES.map(r =>
    `<option value="${esc(r.id)}"${r.id === state.role ? ' selected' : ''}>${esc(r.short)}</option>`).join('');
  updateRoleNote();
  select.addEventListener('change', () => {
    state.role = select.value;
    localStorage.setItem(STORE_ROLE, state.role);
    updateRoleNote();
    navigate();
    toast(`Showing content for <strong>${esc(roleName(state.role))}</strong>. Everything else stays reachable.`);
  });
}

function updateRoleNote() {
  const role = ROLES.find(r => r.id === state.role) || ROLES[0];
  $('#roleNote').textContent = state.role === 'all'
    ? 'Showing every published topic. Pick a role to see what is primary for it.'
    : `${role.name}: ${role.note} In Highspot this would be driven by permissions, groups and audience targeting rather than a selector.`;
}

document.addEventListener('click', ev => {
  const navTarget = ev.target.closest('[data-nav]');
  if (navTarget) {
    ev.preventDefault();
    const target = navTarget.dataset.nav;
    if (location.hash === target) navigate(); else location.hash = target;
    return;
  }
  const phBtn = ev.target.closest('.ph');
  if (phBtn) {
    toast(`Placeholder link. At implementation this resolves to <code>${esc(phBtn.dataset.token)}</code>.`);
    return;
  }
  const shareBtn = ev.target.closest('[data-share]');
  if (shareBtn) {
    toast(`“${esc(shareBtn.dataset.share)}” added to a Digital Room. Placeholder action — resolves to <code>${esc(PLACEHOLDER_TOKENS.digitalRoom)}</code>. Revoking the room withdraws partner access immediately.`);
  }
});

$('#navToggle').addEventListener('click', () => {
  const nav = $('#primaryNav');
  const open = nav.classList.toggle('is-open');
  $('#navToggle').setAttribute('aria-expanded', String(open));
});

window.addEventListener('hashchange', navigate);

initRoles();
if (!location.hash) location.hash = '#/home';
navigate();
