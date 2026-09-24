/* ==========================================================================
   Copilot Cowork Challenge — SCORM adapter
   --------------------------------------------------------------------------
   Speaks SCORM 1.2 (API) and SCORM 2004 (API_1484_11), auto-detecting which
   the host LMS provides. Loads AFTER the app script and attaches to it from
   the outside: it wraps the three results functions and reads the app's state
   object. The app source is not modified, so the same page works unchanged
   outside an LMS (GitHub Pages, local file) where it simply no-ops.

   Debug: append ?scormdebug=1 to see every LMS call in the browser console.
   ========================================================================== */
(function () {
  "use strict";

  /* ---- THE ONE KNOB YOU MIGHT WANT TO CHANGE ---------------------------
     What has to happen for the LMS to mark this module complete?

       "gauntlet"  (default) The Gauntlet is the scored assessment, so
                   completion = finishing it, pass/fail = its 80% mark.
                   Myth Buster and The Showdown are recorded but optional.
       "all_three" Learner must clear all three paths (Triple Threat).
                   Strictest. Reported score is still the Gauntlet's.
       "any"       Finishing any one path completes the module. Loosest;
                   use for optional/self-directed enrolment.
     -------------------------------------------------------------------- */
  var COMPLETION = "gauntlet";

  var DEBUG = /[?&]scormdebug=1/.test(location.search);
  function log() {
    if (!DEBUG) return;
    try { console.log.apply(console, ["[scorm]"].concat([].slice.call(arguments))); } catch (e) {}
  }

  /* ---------- find the LMS API ---------- */
  function scan(win) {
    var n = 0;
    while (win && n < 500) {
      try {
        if (win.API_1484_11) return { api: win.API_1484_11, v: "2004" };
        if (win.API) return { api: win.API, v: "1.2" };
      } catch (e) { /* cross-origin frame, keep walking */ }
      if (!win.parent || win.parent === win) break;
      win = win.parent; n++;
    }
    return null;
  }
  function findAPI() {
    var f = scan(window);
    if (!f && window.opener) f = scan(window.opener);
    return f;
  }

  var found = findAPI();
  if (!found) { log("no LMS API found — running standalone, SCORM disabled"); return; }

  var API = found.api, V = found.v, is12 = V === "1.2";
  log("found SCORM", V, "API");

  /* ---------- call shims ---------- */
  var M = is12
    ? { init: "LMSInitialize", get: "LMSGetValue", set: "LMSSetValue",
        commit: "LMSCommit", fin: "LMSFinish", err: "LMSGetLastError" }
    : { init: "Initialize", get: "GetValue", set: "SetValue",
        commit: "Commit", fin: "Terminate", err: "GetLastError" };

  function call(name, a, b) {
    try {
      var r = arguments.length > 2 ? API[name](a, b) : API[name](a);
      var e = API[M.err]();
      if (e && e !== "0") log("!", name, a, b, "-> error", e);
      else log(name, a, b === undefined ? "" : "=" + b, "->", r);
      return r;
    } catch (ex) { log("!! threw in", name, ex && ex.message); return ""; }
  }
  var get = function (k) { return call(M.get, k); };
  var set = function (k, v) { return call(M.set, k, String(v)); };

  /* ---------- element names that differ between versions ---------- */
  var EL = is12
    ? { name: "cmi.core.student_name", raw: "cmi.core.score.raw",
        min: "cmi.core.score.min", max: "cmi.core.score.max",
        exit: "cmi.core.exit", time: "cmi.core.session_time",
        entry: "cmi.core.entry", mode: "cmi.core.lesson_mode",
        credit: "cmi.core.credit", suspend: "cmi.suspend_data" }
    : { name: "cmi.learner_name", raw: "cmi.score.raw",
        min: "cmi.score.min", max: "cmi.score.max",
        exit: "cmi.exit", time: "cmi.session_time",
        entry: "cmi.entry", mode: "cmi.mode",
        credit: "cmi.credit", suspend: "cmi.suspend_data" };

  var SUSPEND_LIMIT = is12 ? 4096 : 64000;

  /* ---------- initialise ---------- */
  if (call(M.init, "") !== "true") {
    // Some LMSs return "true"/true inconsistently; only bail on a hard error.
    var e0 = API[M.err]();
    if (e0 && e0 !== "0") { log("initialise failed, error", e0, "— SCORM disabled"); return; }
  }

  var mode = get(EL.mode) || "normal";
  var credit = get(EL.credit) || "credit";
  var readOnly = mode === "review" || mode === "browse" || credit === "no-credit";
  if (readOnly) log("mode=" + mode + " credit=" + credit + " — will not write results");

  var started = Date.now();
  var terminated = false;
  var bestStatus = null; // never downgrade a pass once earned

  /* ---------- time formatting (the two specs disagree) ---------- */
  function sessionTime() {
    var t = Math.max(0, (Date.now() - started) / 1000);
    if (is12) {
      var h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
      var p2 = function (n) { return (n < 10 ? "0" : "") + n; };
      return p2(h) + ":" + p2(m) + ":" + (s < 10 ? "0" : "") + s.toFixed(2);
    }
    return "PT" + Math.floor(t / 3600) + "H" + Math.floor((t % 3600) / 60) + "M" + (t % 60).toFixed(2) + "S";
  }

  /* ---------- status ---------- */
  var RANK = { "not attempted": 0, incomplete: 1, browsed: 1, completed: 2, failed: 2, passed: 3 };
  function writeStatus(status) {
    if (RANK[status] === undefined) return;
    if (bestStatus && RANK[status] < RANK[bestStatus]) { log("keeping", bestStatus, "over", status); return; }
    bestStatus = status;
    if (is12) {
      set("cmi.core.lesson_status", status);
    } else {
      set("cmi.completion_status", status === "incomplete" ? "incomplete" : "completed");
      if (status === "passed" || status === "failed") set("cmi.success_status", status);
    }
  }

  /* Read what the LMS already has BEFORE writing anything, so relaunching a
     module you already passed cannot overwrite that pass with "incomplete". */
  function readPriorStatus() {
    var prior = get(is12 ? "cmi.core.lesson_status" : "cmi.completion_status");
    if (!is12) {
      var success = get("cmi.success_status");
      if (success === "passed" || success === "failed") { bestStatus = success; return; }
    }
    if (RANK[prior] !== undefined && prior !== "not attempted") bestStatus = prior;
    log("prior status from LMS:", prior, "-> floor", bestStatus);
  }

  /* ---------- app state bridge -------------------------------------------
     S, CONFIG and QUESTIONS are script-scoped consts in the app's classic
     script: reachable by bare reference from this sibling script, but not as
     window properties. The probe that confirmed this is in scorm/README.md.
     ---------------------------------------------------------------------- */
  function app() { try { return S; } catch (e) { return null; } }

  function gauntletPct() {
    var s = app();
    if (!s || !s.gauntlet || !s.gauntlet.short) return null;
    var n = parseInt(String(s.gauntlet.short).replace(/[^0-9]/g, ""), 10);
    return isNaN(n) ? null : n;
  }

  function evaluate() {
    var s = app();
    if (!s) return;
    var g = s.gauntlet, played = [s.gauntlet, s.myth, s.showdown].filter(Boolean).length;
    var allCleared = !!(s.gauntlet && s.gauntlet.cleared && s.myth && s.myth.cleared && s.showdown && s.showdown.cleared);

    var pct = gauntletPct();
    if (pct !== null && !readOnly) {
      set(EL.raw, pct); set(EL.min, 0); set(EL.max, 100);
      if (!is12) set("cmi.score.scaled", (pct / 100).toFixed(4));
    }

    var status = "incomplete";
    if (COMPLETION === "all_three") {
      status = allCleared ? "passed" : (g ? (g.cleared ? "incomplete" : "failed") : "incomplete");
      if (!allCleared && g && g.cleared) status = "incomplete";
    } else if (COMPLETION === "any") {
      status = played > 0 ? ((g && !g.cleared) ? "failed" : "passed") : "incomplete";
      if (played > 0 && !g) status = "completed";
    } else { // "gauntlet"
      status = g ? (g.cleared ? "passed" : "failed") : "incomplete";
    }
    if (!readOnly) writeStatus(status);
    saveSuspend();
    if (!readOnly) call(M.commit, "");
    log("evaluated:", { rule: COMPLETION, pct: pct, status: status, allCleared: allCleared });
  }

  /* ---------- suspend data (resume across sessions) ---------- */
  function saveSuspend() {
    var s = app(); if (!s || readOnly) return;
    var pack = function (r) {
      return r ? { c: r.cleared ? 1 : 0, s: r.short, l: r.line, b: r.best } : null;
    };
    var payload = { v: 1, n: s.name || "", g: pack(s.gauntlet), m: pack(s.myth), d: pack(s.showdown) };
    var str = JSON.stringify(payload);
    if (str.length > SUSPEND_LIMIT) { // drop the long human-readable lines first
      ["g", "m", "d"].forEach(function (k) { if (payload[k]) delete payload[k].l; });
      str = JSON.stringify(payload);
    }
    if (str.length > SUSPEND_LIMIT) { log("suspend_data too large, skipping"); return; }
    set(EL.suspend, str);
  }

  function restore() {
    var s = app(); if (!s) return;
    var raw = get(EL.suspend);
    var changed = false;

    // Prefill the scorecard name from the LMS. SCORM gives "Last, First".
    var who = get(EL.name);
    if (who && !s.name) {
      var parts = String(who).split(",");
      s.name = (parts.length > 1 ? parts[1].trim() + " " + parts[0].trim() : who).trim();
      changed = true;
    }

    var d = null;
    if (raw) {
      try { d = JSON.parse(raw); } catch (e) { log("bad suspend_data, ignoring"); }
      if (d && d.v !== 1) d = null;
    }
    if (d) {
      var unpack = function (r) {
        return r ? { cleared: !!r.c, short: r.s, line: r.l || "", best: r.b } : null;
      };
      if (d.n && !s.name) s.name = d.n;
      if (d.g) s.gauntlet = unpack(d.g);
      if (d.m) s.myth = unpack(d.m);
      if (d.d) s.showdown = unpack(d.d);
      // Don't replay the Triple Threat confetti on every relaunch.
      if (s.gauntlet && s.gauntlet.cleared && s.myth && s.myth.cleared && s.showdown && s.showdown.cleared) {
        s.tripleShown = true;
      }
      changed = true;
      log("restored", d);
    }

    // Repaint so the name field, path badges and scorecard show what we loaded.
    // This has to run for a name-only prefill too, not just a suspend restore.
    if (changed) {
      try { show(renderHome, { hero: true, noFocus: true }); }
      catch (e) { log("re-render failed", e && e.message); }
    }
  }

  /* ---------- hook the app's three results screens ---------- */
  ["gResults", "mythResults", "sdResults"].forEach(function (fn) {
    var orig = window[fn];
    if (typeof orig !== "function") { log("missing app function", fn); return; }
    window[fn] = function () {
      var r = orig.apply(this, arguments);
      try { evaluate(); } catch (e) { log("evaluate threw", e && e.message); }
      return r;
    };
  });

  /* ---------- teardown ---------- */
  function finish() {
    if (terminated) return; terminated = true;
    try {
      if (!readOnly) {
        set(EL.exit, is12 ? "suspend" : "suspend");
        set(EL.time, sessionTime());
        saveSuspend();
        call(M.commit, "");
      }
      call(M.fin, "");
    } catch (e) { log("teardown threw", e && e.message); }
  }
  window.addEventListener("pagehide", finish);
  window.addEventListener("beforeunload", finish);
  window.addEventListener("unload", finish);

  /* Periodic commit so a browser crash or a closed tab still banks progress. */
  setInterval(function () { if (!terminated && !readOnly) { set(EL.time, sessionTime()); call(M.commit, ""); } }, 60000);

  /* ---------- go ---------- */
  readPriorStatus();
  if (!readOnly) writeStatus("incomplete");
  restore();
  call(M.commit, "");
  window.__scorm = { version: V, mode: mode, completionRule: COMPLETION, evaluate: evaluate, finish: finish };
})();
