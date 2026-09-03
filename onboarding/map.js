/*
 * Onboarding World Map — movement engine.
 *
 * Architecture (per the executive summary's recommendation):
 *   static PNG background  +  invisible SVG <path> traced along the road
 *   +  an absolutely positioned sprite moved with path.getPointAtLength().
 *
 * No dependencies, no build step, no backend. Progress lives in localStorage.
 */
(function () {
  'use strict';

  var DATA = window.ONBOARDING_MAP;
  var CP = DATA.checkpoints;
  var KEY = DATA.meta.storageKey;

  var SPEED = 260;          // path units per second
  var MIN_TRAVEL = 600;     // ms
  var MAX_TRAVEL = 4200;    // ms

  var el = {
    map: document.getElementById('map'),
    scroll: document.getElementById('mapScroll'),
    art: document.getElementById('mapArt'),
    path: document.getElementById('road'),
    markers: document.getElementById('markers'),
    hero: document.getElementById('hero'),
    hint: document.getElementById('stageHint'),
    continue: document.getElementById('continueBtn'),
    sound: document.getElementById('soundBtn'),
    reset: document.getElementById('resetBtn'),
    progressBar: document.getElementById('progressBar'),
    progressFill: document.getElementById('progressFill'),
    progressLabel: document.getElementById('progressLabel'),
    overlay: document.getElementById('overlay'),
    panel: document.getElementById('panel'),
    panelBadge: document.getElementById('panelBadge'),
    panelKicker: document.getElementById('panelKicker'),
    panelTitle: document.getElementById('panelTitle'),
    panelSummary: document.getElementById('panelSummary'),
    panelKeyPoints: document.getElementById('panelKeyPoints'),
    keyPointsSection: document.getElementById('keyPointsSection'),
    panelObjectives: document.getElementById('panelObjectives'),
    objectivesSection: document.getElementById('objectivesSection'),
    quizSection: document.getElementById('quizSection'),
    panelQuiz: document.getElementById('panelQuiz'),
    quizResult: document.getElementById('quizResult'),
    panelReward: document.getElementById('panelReward'),
    panelComplete: document.getElementById('panelComplete'),
    panelLater: document.getElementById('panelLater'),
    panelClose: document.getElementById('panelClose'),
    victory: document.getElementById('victory'),
    victoryText: document.getElementById('victoryText'),
    victoryExport: document.getElementById('victoryExport'),
    victoryClose: document.getElementById('victoryClose'),
    toast: document.getElementById('toast')
  };

  // ---------------------------------------------------------------- state --

  var defaults = {
    version: 1,
    at: CP[0].id,          // where the hero is standing
    completed: {},         // id -> ISO timestamp
    objectives: {},        // id -> [bool]
    quizBest: 0,
    sound: true,
    startedAt: new Date().toISOString()
  };

  var state = load();
  var openId = null;
  var moving = false;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return clone(defaults);
      var saved = JSON.parse(raw);
      if (!saved || saved.version !== defaults.version) return clone(defaults);
      var merged = clone(defaults);
      Object.keys(defaults).forEach(function (k) {
        if (saved[k] !== undefined) merged[k] = saved[k];
      });
      return merged;
    } catch (err) {
      return clone(defaults);
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      /* private mode, quota — progress simply will not persist */
    }
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function indexOf(id) {
    for (var i = 0; i < CP.length; i++) if (CP[i].id === id) return i;
    return 0;
  }

  function isComplete(cp) { return !!state.completed[cp.id]; }

  /** A checkpoint is reachable once everything before it is complete. */
  function isUnlocked(i) {
    for (var j = 0; j < i; j++) if (!isComplete(CP[j])) return false;
    return true;
  }

  function nextIndex() {
    for (var i = 0; i < CP.length; i++) if (!isComplete(CP[i])) return i;
    return CP.length - 1;
  }

  function completedCount() {
    return CP.filter(function (cp) { return cp.id !== 'start' && isComplete(cp); }).length;
  }

  function objectivesOf(cp) {
    var saved = state.objectives[cp.id];
    var out = (cp.objectives || []).map(function (_, i) {
      return !!(saved && saved[i]);
    });
    return out;
  }

  // ---------------------------------------------------------------- sound --

  var audio = null;

  function beep(freq, ms, type, gain) {
    if (!state.sound) return;
    try {
      if (!audio) {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audio = new Ctx();
      }
      if (audio.state === 'suspended') audio.resume();
      var osc = audio.createOscillator();
      var vol = audio.createGain();
      osc.type = type || 'square';
      osc.frequency.value = freq;
      vol.gain.value = gain === undefined ? 0.05 : gain;
      vol.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + ms / 1000);
      osc.connect(vol).connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + ms / 1000);
    } catch (err) { /* audio is a nicety, never a blocker */ }
  }

  function chime(notes) {
    notes.forEach(function (n, i) {
      setTimeout(function () { beep(n, 160, 'square', 0.06); }, i * 110);
    });
  }

  // ------------------------------------------------------------- geometry --

  var pathEl = el.path;
  var totalLen = 0;

  function setupPath() {
    pathEl.setAttribute('d', DATA.map.pathD);
    totalLen = pathEl.getTotalLength();
  }

  function pointAt(fraction) {
    var p = pathEl.getPointAtLength(Math.max(0, Math.min(1, fraction)) * totalLen);
    return { x: p.x, y: p.y };
  }

  function place(pt, facing) {
    el.hero.style.left = (pt.x / DATA.map.width * 100) + '%';
    el.hero.style.top = (pt.y / DATA.map.height * 100) + '%';
    el.hero.style.transform = 'translate(-50%, -92%)' + (facing < 0 ? ' scaleX(-1)' : '');
  }

  var facing = 1;

  /** Keep the hero in view when the map is wider than the viewport. */
  function follow(pt) {
    var box = el.scroll;
    if (box.scrollWidth <= box.clientWidth + 4) return;
    var target = (pt.x / DATA.map.width) * box.scrollWidth - box.clientWidth / 2;
    box.scrollLeft = Math.max(0, Math.min(box.scrollWidth - box.clientWidth, target));
  }

  // ------------------------------------------------------------ rendering --

  function renderMarkers() {
    el.markers.innerHTML = '';
    CP.forEach(function (cp, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'marker';
      btn.style.left = (cp.x / DATA.map.width * 100) + '%';
      btn.style.top = (cp.y / DATA.map.height * 100) + '%';
      btn.dataset.id = cp.id;

      var face = document.createElement('span');
      face.className = 'marker-face';
      btn.appendChild(face);
      el.markers.appendChild(btn);

      btn.addEventListener('click', function () { onMarkerClick(i); });
    });
    refreshMarkers();
  }

  function refreshMarkers() {
    var next = nextIndex();
    Array.prototype.forEach.call(el.markers.children, function (btn, i) {
      var cp = CP[i];
      var done = isComplete(cp);
      var unlocked = isUnlocked(i);
      btn.classList.toggle('is-done', done);
      btn.classList.toggle('is-locked', !unlocked);
      btn.classList.toggle('is-current', !done && i === next);
      btn.querySelector('.marker-face').textContent = done ? '✓' : (unlocked ? cp.badge : '🔒');
      btn.setAttribute('aria-label',
        cp.label + ': ' + cp.title + ' — ' +
        (done ? 'complete' : unlocked ? 'available' : 'locked'));
    });
  }

  function refreshHud() {
    var done = completedCount();
    var total = CP.length - 1;
    el.progressFill.style.width = (done / total * 100) + '%';
    el.progressLabel.textContent = done + ' / ' + total + ' worlds complete';
    el.progressBar.setAttribute('aria-valuenow', String(done));
    el.progressBar.setAttribute('aria-valuemax', String(total));

    el.continue.disabled = moving;
    if (done === total) {
      el.continue.textContent = '★ Quest complete';
      return;
    }
    var next = nextIndex();
    el.continue.textContent = state.at === CP[next].id
      ? '▣ Open ' + CP[next].label
      : '▶ Travel to ' + CP[next].label;
  }

  function toast(msg, ms) {
    el.toast.textContent = msg;
    el.toast.classList.remove('hidden');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () {
      el.toast.classList.add('hidden');
    }, ms || 2600);
  }

  // -------------------------------------------------------------- movement --

  function travelTo(targetIndex, then) {
    var from = CP[indexOf(state.at)].pos;
    var to = CP[targetIndex].pos;
    if (moving) return;

    if (reduceMotion || Math.abs(to - from) < 0.0005) {
      state.at = CP[targetIndex].id;
      var landing = pointAt(to);
      facing = landing.x >= pointAt(from).x ? 1 : -1;
      place(landing, facing);
      follow(landing);
      save();
      refreshHud();
      chime([523, 659, 784]);
      if (then) then(); else openPanel(targetIndex);
      return;
    }

    moving = true;
    el.hero.classList.add('walking');
    el.hero.classList.remove('cheering');
    refreshHud();

    var dist = Math.abs(to - from) * totalLen;
    var duration = Math.max(MIN_TRAVEL, Math.min(MAX_TRAVEL, dist / SPEED * 1000));
    var startTime = null;
    var prev = pointAt(from);
    var lastStep = 0;

    function frame(now) {
      if (startTime === null) startTime = now;
      var t = Math.min((now - startTime) / duration, 1);
      var eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;   // ease-in-out
      var pt = pointAt(from + (to - from) * eased);

      if (Math.abs(pt.x - prev.x) > 0.6) facing = pt.x > prev.x ? 1 : -1;
      place(pt, facing);
      follow(pt);
      prev = pt;

      if (now - lastStep > 260) { lastStep = now; beep(160, 40, 'square', 0.025); }

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        moving = false;
        el.hero.classList.remove('walking');
        state.at = CP[targetIndex].id;
        save();
        refreshHud();
        arrive(targetIndex, then);
      }
    }
    requestAnimationFrame(frame);
  }

  function arrive(i, then) {
    el.hero.classList.add('cheering');
    chime([523, 659, 784]);
    setTimeout(function () { el.hero.classList.remove('cheering'); }, 900);
    setTimeout(function () { if (then) then(); else openPanel(i); }, 420);
  }

  function onMarkerClick(i) {
    if (moving) return;
    if (!isUnlocked(i)) {
      var blocker = CP[nextIndex()];
      el.markers.children[i].classList.add('shake');
      setTimeout(function () { el.markers.children[i].classList.remove('shake'); }, 340);
      beep(120, 180, 'sawtooth', 0.04);
      toast('Locked — finish ' + blocker.label + ' first.');
      return;
    }
    if (state.at === CP[i].id) openPanel(i);
    else travelTo(i);
  }

  function onContinue() {
    if (moving) return;
    if (CP.every(isComplete)) { showVictory(); return; }
    var next = nextIndex();
    if (state.at === CP[next].id) openPanel(next);
    else travelTo(next);
  }

  // ----------------------------------------------------------------- panel --

  var lastFocus = null;

  function openPanel(i) {
    var cp = CP[i];
    openId = cp.id;
    lastFocus = document.activeElement;

    el.panelBadge.textContent = cp.badge;
    el.panelKicker.textContent = cp.label;
    el.panelTitle.textContent = cp.title;
    el.panelSummary.textContent = cp.summary;
    el.panelReward.textContent = cp.reward || '';

    el.panelKeyPoints.innerHTML = '';
    (cp.keyPoints || []).forEach(function (text) {
      var li = document.createElement('li');
      li.textContent = text;
      el.panelKeyPoints.appendChild(li);
    });
    el.keyPointsSection.classList.toggle('hidden', !(cp.keyPoints || []).length);

    renderObjectives(cp);
    renderQuiz(cp);

    el.overlay.classList.remove('hidden');
    el.panelClose.focus();
    updateCompleteButton(cp);
  }

  function renderObjectives(cp) {
    var ticks = objectivesOf(cp);
    el.panelObjectives.innerHTML = '';
    (cp.objectives || []).forEach(function (text, idx) {
      var li = document.createElement('li');
      var label = document.createElement('label');
      var input = document.createElement('input');
      var span = document.createElement('span');
      input.type = 'checkbox';
      input.checked = ticks[idx];
      // The quiz gates the final challenge, so its objective is read-only.
      input.disabled = !!cp.quiz;
      span.textContent = text;
      input.addEventListener('change', function () {
        var arr = objectivesOf(cp);
        arr[idx] = input.checked;
        state.objectives[cp.id] = arr;
        save();
        updateCompleteButton(cp);
        beep(input.checked ? 660 : 330, 70, 'square', 0.04);
      });
      label.appendChild(input);
      label.appendChild(span);
      li.appendChild(label);
      el.panelObjectives.appendChild(li);
    });
    el.objectivesSection.classList.toggle('hidden', !(cp.objectives || []).length);
  }

  function renderQuiz(cp) {
    el.quizResult.textContent = '';
    el.panelQuiz.innerHTML = '';
    el.quizSection.classList.toggle('hidden', !cp.quiz);
    if (!cp.quiz) return;

    cp.quiz.forEach(function (q, qi) {
      var li = document.createElement('li');
      var head = document.createElement('p');
      head.className = 'quiz-q';
      head.textContent = q.q;
      li.appendChild(head);

      var group = document.createElement('div');
      group.className = 'quiz-options';
      q.options.forEach(function (opt, oi) {
        var label = document.createElement('label');
        var input = document.createElement('input');
        var span = document.createElement('span');
        input.type = 'radio';
        input.name = 'quiz-' + qi;
        input.value = String(oi);
        span.textContent = opt;
        input.addEventListener('change', function () {
          li.classList.remove('right', 'wrong');
          el.quizResult.textContent = '';
          updateCompleteButton(cp);
        });
        label.appendChild(input);
        label.appendChild(span);
        group.appendChild(label);
      });
      li.appendChild(group);
      el.panelQuiz.appendChild(li);
    });
  }

  function quizAnswers(cp) {
    return cp.quiz.map(function (q, qi) {
      var picked = el.panelQuiz.querySelector('input[name="quiz-' + qi + '"]:checked');
      return picked ? Number(picked.value) : -1;
    });
  }

  function updateCompleteButton(cp) {
    if (isComplete(cp)) {
      el.panelComplete.textContent = '✓ Completed';
      el.panelComplete.disabled = true;
      return;
    }
    if (cp.quiz) {
      var answered = quizAnswers(cp).every(function (a) { return a >= 0; });
      el.panelComplete.textContent = '⚔ Submit answers';
      el.panelComplete.disabled = !answered;
      return;
    }
    var ticks = objectivesOf(cp);
    var all = ticks.length === 0 || ticks.every(Boolean);
    el.panelComplete.textContent = all ? '✓ Mark complete' : '✓ Tick every objective';
    el.panelComplete.disabled = !all;
  }

  function closePanel() {
    el.overlay.classList.add('hidden');
    openId = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onComplete() {
    var i = indexOf(openId);
    var cp = CP[i];

    if (cp.quiz) {
      var answers = quizAnswers(cp);
      var score = 0;
      answers.forEach(function (a, qi) {
        var li = el.panelQuiz.children[qi];
        var right = a === cp.quiz[qi].answer;
        if (right) score++;
        li.classList.toggle('right', right);
        li.classList.toggle('wrong', !right);
      });
      state.quizBest = Math.max(state.quizBest || 0, score);
      save();

      var pass = score >= (cp.passMark || cp.quiz.length);
      el.quizResult.textContent = score + ' / ' + cp.quiz.length +
        (pass ? ' — the gate opens.' : ' — not yet. Review the marked answers and try again.');
      if (!pass) {
        beep(120, 260, 'sawtooth', 0.05);
        return;
      }
      state.objectives[cp.id] = (cp.objectives || []).map(function () { return true; });
    }

    state.completed[cp.id] = new Date().toISOString();
    save();
    refreshMarkers();
    refreshHud();
    updateCompleteButton(cp);
    chime([659, 784, 988, 1319]);

    var everything = CP.every(function (c) { return isComplete(c); });
    setTimeout(function () {
      closePanel();
      if (everything) showVictory();
      else toast(cp.label + ' complete — ' + CP[nextIndex()].label + ' unlocked.');
    }, 650);
  }

  // --------------------------------------------------------------- victory --

  function showVictory() {
    var started = new Date(state.startedAt);
    var days = Math.max(1, Math.round((Date.now() - started.getTime()) / 86400000));
    el.victoryText.textContent =
      'Six worlds, ' + (CP.length - 1) + ' checkpoints, ' + days + ' day' + (days === 1 ? '' : 's') +
      ' on the road. Final challenge best score: ' + (state.quizBest || 0) + ' / 5.';
    el.victory.classList.remove('hidden');
    chime([523, 659, 784, 1047, 1319]);
  }

  /**
   * Hand the summary to the viewer. Inside a claude.ai artifact the frame
   * cannot download directly, so ask the host; anywhere else (GitHub Pages,
   * local file) fall back to a blob link.
   */
  function exportSummary() {
    var name = 'onboarding-summary.md';
    var text = buildSummary();
    var claude = window.claude;
    if (claude && typeof claude.use === 'function') {
      claude.use('downloads').then(function (downloads) {
        if (!downloads) return saveViaLink(name, text);
        downloads.save({ filename: name, data: text }).catch(function (err) {
          if (err && err.code === 'declined') return;
          toast('Could not save the summary here.');
        });
      }).catch(function () { saveViaLink(name, text); });
      return;
    }
    saveViaLink(name, text);
  }

  function saveViaLink(name, text) {
    var blob = new Blob([text], { type: 'text/markdown' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 0);
  }

  function buildSummary() {
    var lines = ['# Onboarding World Map — completion summary', ''];
    lines.push('Started: ' + new Date(state.startedAt).toLocaleDateString());
    lines.push('Final challenge best score: ' + (state.quizBest || 0) + ' / 5');
    lines.push('');
    CP.forEach(function (cp) {
      var done = state.completed[cp.id];
      lines.push('## ' + cp.label + ' — ' + cp.title);
      lines.push(done ? 'Completed ' + new Date(done).toLocaleDateString() : 'Not completed');
      (cp.objectives || []).forEach(function (text, i) {
        var ticked = objectivesOf(cp)[i];
        lines.push('- [' + (ticked ? 'x' : ' ') + '] ' + text);
      });
      lines.push('');
    });
    return lines.join('\n');
  }

  // ----------------------------------------------------------------- wiring --

  el.continue.addEventListener('click', onContinue);
  el.panelComplete.addEventListener('click', onComplete);
  el.panelLater.addEventListener('click', closePanel);
  el.panelClose.addEventListener('click', closePanel);
  el.overlay.addEventListener('mousedown', function (e) {
    if (e.target === el.overlay) closePanel();
  });
  el.victoryClose.addEventListener('click', function () { el.victory.classList.add('hidden'); });
  el.victoryExport.addEventListener('click', exportSummary);

  el.sound.addEventListener('click', function () {
    state.sound = !state.sound;
    el.sound.setAttribute('aria-pressed', String(state.sound));
    el.sound.textContent = state.sound ? '♪' : '✕';
    save();
    if (state.sound) beep(880, 90);
  });

  el.reset.addEventListener('click', function () {
    if (!window.confirm('Reset all progress on this map?')) return;
    state = clone(defaults);
    save();
    facing = 1;
    place(pointAt(0), facing);
    refreshMarkers();
    refreshHud();
    toast('Progress reset. Back to the start.');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!el.victory.classList.contains('hidden')) el.victory.classList.add('hidden');
      else if (!el.overlay.classList.contains('hidden')) closePanel();
    }
    // debug: show the traced route
    if ((e.key === 'd' || e.key === 'D') && !e.metaKey && !e.ctrlKey &&
        el.overlay.classList.contains('hidden')) {
      el.map.classList.toggle('debug');
    }
  });

  window.addEventListener('resize', function () {
    follow(pointAt(CP[indexOf(state.at)].pos));
  });

  // ------------------------------------------------------------------ boot --

  function boot() {
    setupPath();
    renderMarkers();
    if (location.search.indexOf('debug') > -1) el.map.classList.add('debug');

    el.sound.setAttribute('aria-pressed', String(state.sound));
    el.sound.textContent = state.sound ? '♪' : '✕';

    var pt = pointAt(CP[indexOf(state.at)].pos);
    place(pt, facing);
    follow(pt);
    refreshHud();

    if (completedCount() > 0) {
      el.hint.innerHTML = 'Welcome back — you are at <strong>' +
        CP[indexOf(state.at)].label + '</strong>. Progress is saved in this browser.';
    }
  }

  if (el.art.complete) boot();
  else el.art.addEventListener('load', boot, { once: true });
  el.art.addEventListener('error', boot, { once: true });
})();
