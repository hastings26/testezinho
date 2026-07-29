/* =============================================================================
   MIP COMPASS — STORAGE ADAPTER
   =============================================================================
   Every read and write in the game goes through MIPStore. Nothing else touches
   localStorage directly.

   TO MOVE TO SUPABASE LATER:
   Replace the body of each method below with a Supabase call and keep the
   signatures. The methods are already async-shaped (they return values, and
   the game awaits nothing that would break if they became promises — see
   MIPStore.isAsync). The four things that need a backend are:

     scenarios  -> table `scenarios`      (see data.js for the column contract)
     config     -> table `config`         (single row, JSON blob)
     analytics  -> table `events`         (append-only; add org/region/team here)
     progress   -> stays local. Resuming a mission is a per-device concern.

   Analytics rows are deliberately anonymous. No names, no emails, no IDs that
   survive a browser reset. Add an org/event code as a column when you need to
   segment — the event shape already leaves room for it.
   ============================================================================= */

const MIPStore = (function () {
  'use strict';

  const KEYS = {
    scenarios: 'mipCompassScenariosV1',
    config:    'mipCompassConfigV1',
    progress:  'mipCompassProgressV1',
    analytics: 'mipCompassAnalyticsV1',
    admin:     'mipCompassAdminSessionV1',
    prefs:     'mipCompassPrefsV1'
  };

  /* localStorage can throw in private mode or when full. Never let storage
     break the game — degrade to in-memory instead. */
  const memory = {};
  let storageOk = true;
  try {
    const probe = '__mipc__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
  } catch (e) {
    storageOk = false;
  }

  function readRaw(key) {
    if (!storageOk) return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null;
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  function writeRaw(key, value) {
    if (!storageOk) { memory[key] = value; return true; }
    try { window.localStorage.setItem(key, value); return true; }
    catch (e) { memory[key] = value; return false; }
  }

  function removeRaw(key) {
    if (!storageOk) { delete memory[key]; return; }
    try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  function readJSON(key, fallback) {
    const raw = readRaw(key);
    if (raw === null || raw === undefined) return fallback;
    try {
      const parsed = JSON.parse(raw);
      return (parsed === null || parsed === undefined) ? fallback : parsed;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    return writeRaw(key, JSON.stringify(value));
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  /* ---------------------------------------------------------------------
     CONFIG — defaults from data.js, overridable by the admin area.
     Admin edits are stored as a full replacement object.
     --------------------------------------------------------------------- */
  function getConfig() {
    const override = readJSON(KEYS.config, null);
    if (!override) return deepClone(window.MIP_CONFIG);
    /* Shallow-merge top-level keys so a partial override cannot delete
       sections added to data.js after the override was saved. */
    const base = deepClone(window.MIP_CONFIG);
    Object.keys(override).forEach(function (k) { base[k] = override[k]; });
    return base;
  }

  function saveConfig(config) {
    return writeJSON(KEYS.config, config);
  }

  function resetConfig() {
    removeRaw(KEYS.config);
  }

  function isConfigOverridden() {
    return readJSON(KEYS.config, null) !== null;
  }

  /* ---------------------------------------------------------------------
     SCENARIOS
     --------------------------------------------------------------------- */
  function getScenarios() {
    const override = readJSON(KEYS.scenarios, null);
    if (Array.isArray(override)) return override;
    return deepClone(window.MIP_SCENARIOS);
  }

  function getActiveScenarios() {
    return getScenarios().filter(function (s) { return !s.archived; });
  }

  function saveScenarios(scenarios) {
    return writeJSON(KEYS.scenarios, scenarios);
  }

  function saveScenario(scenario) {
    const all = getScenarios();
    const idx = all.findIndex(function (s) { return s.id === scenario.id; });
    if (idx >= 0) all[idx] = scenario; else all.push(scenario);
    return saveScenarios(all);
  }

  function deleteScenario(id) {
    const all = getScenarios().filter(function (s) { return s.id !== id; });
    return saveScenarios(all);
  }

  function resetScenarios() {
    removeRaw(KEYS.scenarios);
  }

  function areScenariosOverridden() {
    return readJSON(KEYS.scenarios, null) !== null;
  }

  /* ---------------------------------------------------------------------
     PROGRESS — resume an in-flight mission after a refresh
     --------------------------------------------------------------------- */
  function getProgress() { return readJSON(KEYS.progress, null); }
  function saveProgress(state) { return writeJSON(KEYS.progress, state); }
  function clearProgress() { removeRaw(KEYS.progress); }

  /* ---------------------------------------------------------------------
     PREFERENCES
     --------------------------------------------------------------------- */
  function getPrefs() { return readJSON(KEYS.prefs, { reduceMotion: null, sound: false }); }
  function savePrefs(prefs) { return writeJSON(KEYS.prefs, prefs); }

  /* ---------------------------------------------------------------------
     ANALYTICS — append-only, anonymous.

     Event shape:
       { t: unixMs, type: string, ...payload }

     `org`, `region`, `team` and `eventCode` are intentionally left as
     optional fields the caller may add. Nothing personal is captured.
     --------------------------------------------------------------------- */
  const ANALYTICS_CAP = 2000; /* keep localStorage bounded */

  function track(type, payload) {
    const events = readJSON(KEYS.analytics, []);
    const row = { t: Date.now(), type: type };
    if (payload && typeof payload === 'object') {
      Object.keys(payload).forEach(function (k) { row[k] = payload[k]; });
    }
    events.push(row);
    /* Drop oldest first if we exceed the cap. */
    while (events.length > ANALYTICS_CAP) events.shift();
    writeJSON(KEYS.analytics, events);
    return row;
  }

  function getEvents() { return readJSON(KEYS.analytics, []); }
  function clearEvents() { removeRaw(KEYS.analytics); }

  /* Roll raw events into the metrics the brief asks for. */
  function getAnalyticsSummary() {
    const events = getEvents();
    const started   = events.filter(function (e) { return e.type === 'mission_started'; });
    const completed = events.filter(function (e) { return e.type === 'mission_completed'; });
    const rounds    = events.filter(function (e) { return e.type === 'round_scored'; });

    const avg = function (nums) {
      if (!nums.length) return 0;
      return nums.reduce(function (a, b) { return a + b; }, 0) / nums.length;
    };

    /* Per-decision averages, as a percentage of the 50 available. */
    const decisionKeys = ['maturity', 'route', 'destination', 'conversation'];
    const byDecision = {};
    decisionKeys.forEach(function (k) {
      const scores = rounds
        .map(function (r) { return r.scores && typeof r.scores[k] === 'number' ? r.scores[k] : null; })
        .filter(function (v) { return v !== null; });
      byDecision[k] = { avgPoints: avg(scores), max: 50, samples: scores.length };
    });

    /* Scenario difficulty — lowest average total is "most frequently missed". */
    const byScenario = {};
    rounds.forEach(function (r) {
      if (!r.scenarioId) return;
      if (!byScenario[r.scenarioId]) {
        byScenario[r.scenarioId] = { scenarioId: r.scenarioId, name: r.partnerName || r.scenarioId, plays: 0, total: 0 };
      }
      byScenario[r.scenarioId].plays += 1;
      byScenario[r.scenarioId].total += (r.total || 0);
    });
    const scenarioStats = Object.keys(byScenario).map(function (k) {
      const s = byScenario[k];
      return { scenarioId: s.scenarioId, name: s.name, plays: s.plays, avgScore: s.plays ? s.total / s.plays : 0 };
    }).sort(function (a, b) { return a.avgScore - b.avgScore; });

    /* Most frequently chosen weak answers (anything scoring 10 or less). */
    const weak = {};
    rounds.forEach(function (r) {
      if (!r.picked) return;
      decisionKeys.forEach(function (k) {
        const score = r.scores ? r.scores[k] : null;
        if (score === null || score === undefined || score > 10) return;
        const label = k + ': ' + r.picked[k];
        weak[label] = (weak[label] || 0) + 1;
      });
    });
    const weakList = Object.keys(weak).map(function (k) {
      return { answer: k, count: weak[k] };
    }).sort(function (a, b) { return b.count - a.count; }).slice(0, 10);

    const durations = completed
      .map(function (e) { return typeof e.durationMs === 'number' ? e.durationMs : null; })
      .filter(function (v) { return v !== null; });

    return {
      gamesStarted: started.length,
      gamesCompleted: completed.length,
      completionRate: started.length ? completed.length / started.length : 0,
      averageScore: avg(completed.map(function (e) { return e.score || 0; })),
      averageDurationMs: avg(durations),
      byDecision: byDecision,
      scenarioStats: scenarioStats,
      weakAnswers: weakList,
      totalEvents: events.length
    };
  }

  /* ---------------------------------------------------------------------
     ADMIN SESSION
     --------------------------------------------------------------------- */
  function setAdminSession(until) { writeJSON(KEYS.admin, { until: until }); }
  function hasAdminSession() {
    const s = readJSON(KEYS.admin, null);
    return !!(s && s.until && s.until > Date.now());
  }
  function clearAdminSession() { removeRaw(KEYS.admin); }

  return {
    isPersistent: function () { return storageOk; },
    isAsync: false,

    getConfig: getConfig,
    saveConfig: saveConfig,
    resetConfig: resetConfig,
    isConfigOverridden: isConfigOverridden,

    getScenarios: getScenarios,
    getActiveScenarios: getActiveScenarios,
    saveScenarios: saveScenarios,
    saveScenario: saveScenario,
    deleteScenario: deleteScenario,
    resetScenarios: resetScenarios,
    areScenariosOverridden: areScenariosOverridden,

    getProgress: getProgress,
    saveProgress: saveProgress,
    clearProgress: clearProgress,

    getPrefs: getPrefs,
    savePrefs: savePrefs,

    track: track,
    getEvents: getEvents,
    clearEvents: clearEvents,
    getAnalyticsSummary: getAnalyticsSummary,

    setAdminSession: setAdminSession,
    hasAdminSession: hasAdminSession,
    clearAdminSession: clearAdminSession,

    _keys: KEYS
  };
})();

window.MIPStore = MIPStore;
