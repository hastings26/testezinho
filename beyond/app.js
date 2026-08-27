/* =============================================================================
   BEYOND 2026 COMMAND CENTER — renderer, router and search.
   Everything is rendered from content.js. No content lives in this file.
   ========================================================================== */
(function () {
  'use strict';

  var SITE = window.SITE;
  var SECTIONS = SITE.sections;
  var byId = {};
  SECTIONS.forEach(function (s) { byId[s.id] = s; });

  /* ---------- icons ------------------------------------------------------ */
  var ICONS = {
    flag:     'M4 21V4m0 0h11l-1.5 3.5L15 11H4',
    calendar: 'M3 8h18M7 3v4m10-4v4M4 5h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z',
    story:    'M4 5a2 2 0 012-2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm11-2v5h5M8 13h8M8 17h5',
    spark:    'M12 2l2.2 6.1L20 10l-5.8 1.9L12 18l-2.2-6.1L4 10l5.8-1.9L12 2zM19 15l.9 2.4L22 18l-2.1.8L19 21l-.9-2.2L16 18l2.1-.6L19 15z',
    gear:     'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1A1.6 1.6 0 008 19.4a1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H2a2 2 0 110-4h.1A1.6 1.6 0 004.6 8a1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V2a2 2 0 114 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H22a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z',
    store:    'M3 9l1.5-5h15L21 9M3 9h18M3 9v10a1 1 0 001 1h16a1 1 0 001-1V9M9 20v-6h6v6',
    cloud:    'M18 17H7A4 4 0 017 9a5.5 5.5 0 0110.5 1.5A3.5 3.5 0 0118 17z',
    target:   'M12 21a9 9 0 100-18 9 9 0 000 18zm0-4.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm0-3a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
    book:     'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z',
    briefcase:'M3 8h18v11a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm6 0V5a1 1 0 011-1h4a1 1 0 011 1v3M3 13h18',
    help:     'M12 21a9 9 0 100-18 9 9 0 000 18zm-2.2-11.2a2.2 2.2 0 114.2 1c0 1.5-2 1.8-2 3.2M12 17.5h.01',
    shield:   'M12 22s8-3.5 8-9.5V5.5L12 2 4 5.5V12c0 6 8 10 8 10z',
    search:   'M11 19a8 8 0 100-16 8 8 0 000 16zm10 2l-4.5-4.5',
    menu:     'M4 7h16M4 12h16M4 17h16',
  };
  function icon(name, cls) {
    var d = ICONS[name] || ICONS.flag;
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
  }

  /* ---------- helpers ---------------------------------------------------- */
  function md(s) {
    return String(s == null ? '' : s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }
  function plain(s) {
    return String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\*\*/g, '')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  var NUM_COLORS = ['#1D4ED8', '#0EA5E9', '#14B8A6', '#10B981', '#22C55E', '#8B5CF6'];

  /* Review-date maths: a section is overdue when now is past reviewed + cadence. */
  var CADENCE_DAYS = { 'Monthly': 31, 'Quarterly': 92, 'Half-yearly': 183, 'Annually': 365 };
  function reviewState(sec) {
    var days = CADENCE_DAYS[sec.cadence] || 92;
    var due = new Date(sec.reviewed + 'T00:00:00Z');
    due.setUTCDate(due.getUTCDate() + days);
    var overdue = Date.now() > due.getTime();
    return { due: due.toISOString().slice(0, 10), overdue: overdue };
  }

  /* ---------- block renderers -------------------------------------------- */
  var BLOCK = {
    lead: function (b) { return '<p class="lead">' + md(b.text) + '</p>'; },
    p:    function (b) { return '<p>' + md(b.text) + '</p>'; },
    h:    function (b) { return '<h2 class="sub">' + md(b.text) + '</h2>'; },

    list: function (b) {
      return '<ul class="plain">' + b.items.map(function (i) { return '<li>' + md(i) + '</li>'; }).join('') + '</ul>';
    },

    numbered: function (b) {
      return '<div class="grid grid-3">' + b.items.map(function (it, i) {
        return '<div class="card"><div class="num" style="background:' + NUM_COLORS[i % NUM_COLORS.length] + '">' +
          (i + 1) + '</div><h3>' + md(it.title) + '</h3><p>' + md(it.text) + '</p></div>';
      }).join('') + '</div>';
    },

    cards: function (b) {
      return '<div class="grid grid-2">' + b.items.map(function (it) {
        return '<div class="card"><h3>' + md(it.title) + '</h3><p>' + md(it.text) + '</p></div>';
      }).join('') + '</div>';
    },

    steps: function (b) {
      return '<ol class="steps">' + b.items.map(function (it) {
        return '<li><h4>' + md(it.title) + '</h4><p>' + md(it.text) + '</p></li>';
      }).join('') + '</ol>';
    },

    assets: function (b) {
      return '<div class="assets">' + b.items.map(function (a) {
        var label = a.href
          ? '<a class="asset-label" href="' + esc(a.href) + '" target="_blank" rel="noopener">' + md(a.label) + ' ↗</a>'
          : '<span class="asset-label">' + md(a.label) + '</span>';
        var status = a.status || 'needed';
        var statusText = status === 'live' ? 'Live' : status === 'draft' ? 'Draft' : 'Needed';
        var note = a.note ? '<div class="asset-note">' + md(a.note) + '</div>' : '';
        if (!a.href && status !== 'needed') {
          note += '<div class="asset-note">URL not yet supplied.</div>';
        }
        var owner = a.owner ? '<div class="asset-owner">Owner <b>' + md(a.owner) + '</b></div>' : '';
        return '<div class="asset">' +
          '<span class="chip">' + esc(a.type || 'Doc') + '</span>' +
          '<div class="asset-main">' + label + note + owner + '</div>' +
          '<span class="pill ' + status + '">' + statusText + '</span>' +
          '</div>';
      }).join('') + '</div>';
    },

    faq: function (b) {
      return '<div class="faq">' + b.items.map(function (f) {
        return '<details><summary>' + md(f.q) + '</summary><div class="answer">' + md(f.a) + '</div></details>';
      }).join('') + '</div>';
    },

    callout: function (b) {
      return '<div class="callout ' + (b.tone || 'info') + '">' +
        (b.title ? '<h4>' + md(b.title) + '</h4>' : '') + '<p>' + md(b.text) + '</p></div>';
    },

    table: function (b) {
      return '<div class="tablewrap"><table><thead><tr>' +
        b.head.map(function (h) { return '<th>' + md(h) + '</th>'; }).join('') +
        '</tr></thead><tbody>' + b.rows.map(function (r) {
          return '<tr>' + r.map(function (c) { return '<td>' + md(c) + '</td>'; }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>';
    },

    stat: function (b) {
      return '<div class="stats">' + b.items.map(function (s) {
        return '<div class="stat"><div class="stat-value">' + md(s.value) + '</div>' +
          '<div class="stat-label">' + md(s.label) + '</div>' +
          (s.note ? '<div class="stat-note">' + md(s.note) + '</div>' : '') + '</div>';
      }).join('') + '</div>';
    },

    timeline: function (b) {
      return '<ul class="timeline">' + b.items.map(function (t) {
        return '<li><div class="when">' + md(t.when) + '</div><h4>' + md(t.title) + '</h4><p>' + md(t.text) + '</p></li>';
      }).join('') + '</ul>';
    },

    generated: function (b) { return b.kind === 'report' ? renderReport() : ''; },
  };

  function renderBlocks(blocks) {
    return (blocks || []).map(function (b) {
      var fn = BLOCK[b.t];
      return fn ? fn(b) : '';
    }).join('');
  }

  /* ---------- governance report (generated from the content model) -------- */
  function allAssets() {
    var out = [];
    SECTIONS.forEach(function (sec) {
      sec.pages.forEach(function (pg) {
        (pg.blocks || []).forEach(function (b) {
          if (b.t === 'assets') {
            b.items.forEach(function (a) {
              out.push({ asset: a, sec: sec, page: pg });
            });
          }
        });
      });
    });
    return out;
  }

  function renderReport() {
    var assets = allAssets();
    var counts = { live: 0, draft: 0, needed: 0 };
    assets.forEach(function (r) { counts[r.asset.status || 'needed']++; });

    var overdueSections = SECTIONS.filter(function (s) { return reviewState(s).overdue; });
    var unnamed = Object.keys(window.OWNERS).filter(function (k) { return window.OWNERS[k].name === 'TBC'; });

    var html = '<div class="report-summary">' +
      '<div class="rs blue"><div class="v">' + assets.length + '</div><div class="l">Registered assets</div></div>' +
      '<div class="rs teal"><div class="v">' + counts.live + '</div><div class="l">Live</div></div>' +
      '<div class="rs gold"><div class="v">' + counts.draft + '</div><div class="l">Draft</div></div>' +
      '<div class="rs red"><div class="v">' + counts.needed + '</div><div class="l">Not yet produced</div></div>' +
      '</div>';

    html += '<div class="callout ' + (unnamed.length ? 'warn' : 'good') + '">' +
      '<h4>Named owners</h4><p>' +
      (unnamed.length
        ? unnamed.length + ' of ' + Object.keys(window.OWNERS).length +
          ' owning teams have no named individual. The ownership model does not work on team names alone — a team cannot be chased for a review.'
        : 'Every owning team has a named individual.') +
      '</p></div>';

    html += '<div class="callout ' + (overdueSections.length ? 'warn' : 'good') + '">' +
      '<h4>Review status</h4><p>' +
      (overdueSections.length
        ? overdueSections.length + ' section(s) are past their review date: ' +
          overdueSections.map(function (s) { return s.title; }).join(', ') + '.'
        : 'All ' + SECTIONS.length + ' sections are within their review cadence.') +
      '</p></div>';

    /* Ownership table */
    html += '<h2 class="sub">Section ownership</h2><div class="tablewrap"><table><thead><tr>' +
      '<th>Section</th><th>Owning team</th><th>Named owner</th><th>Cadence</th><th>Review due</th>' +
      '</tr></thead><tbody>' +
      SECTIONS.map(function (s) {
        var r = reviewState(s);
        return '<tr><td><a href="#/' + s.id + '" style="color:inherit">' + s.title + '</a></td>' +
          '<td>' + s.owner.team + '</td>' +
          '<td>' + (s.owner.name === 'TBC' ? '<span style="color:#EAB308">TBC</span>' : s.owner.name) + '</td>' +
          '<td>' + s.cadence + '</td>' +
          '<td>' + (r.overdue ? '<span style="color:#F98080">' + r.due + ' — overdue</span>' : r.due) + '</td></tr>';
      }).join('') + '</tbody></table></div>';

    /* Outstanding assets */
    var outstanding = assets.filter(function (r) { return (r.asset.status || 'needed') !== 'live'; });
    html += '<h2 class="sub">Outstanding content (' + outstanding.length + ')</h2>';
    html += '<p>Every asset below is either not yet produced, or has no working link registered. This is the Beyond content backlog.</p>';
    html += '<div class="assets">' + outstanding.map(function (r) {
      var st = r.asset.status || 'needed';
      return '<div class="asset">' +
        '<span class="chip">' + esc(r.asset.type || 'Doc') + '</span>' +
        '<div class="asset-main"><span class="asset-label">' + md(r.asset.label) + '</span>' +
        '<div class="asset-note"><a href="#/' + r.sec.id + '/' + r.page.id + '" style="color:#808080">' +
        r.sec.title + ' › ' + r.page.title + '</a></div>' +
        (r.asset.owner ? '<div class="asset-owner">Owner <b>' + md(r.asset.owner) + '</b></div>' : '') +
        '</div><span class="pill ' + st + '">' + (st === 'draft' ? 'Draft' : 'Needed') + '</span></div>';
    }).join('') + '</div>';

    return html;
  }

  /* ---------- page rendering --------------------------------------------- */
  function ownerBar(sec) {
    var r = reviewState(sec);
    return '<dl class="ownerbar">' +
      '<div><dt>Owning team</dt><dd>' + sec.owner.team + '</dd></div>' +
      '<div><dt>Named owner</dt><dd class="' + (sec.owner.name === 'TBC' ? 'tbc' : '') + '">' + sec.owner.name + '</dd></div>' +
      '<div><dt>Last reviewed</dt><dd>' + sec.reviewed + '</dd></div>' +
      '<div><dt>Review due</dt><dd class="' + (r.overdue ? 'overdue' : 'ok') + '">' +
        r.due + (r.overdue ? ' · overdue' : '') + '</dd></div>' +
      '</dl>';
  }

  function renderHome() {
    var topics = SECTIONS.filter(function (s) { return !s.utility; });
    var html = '<div class="wrap-wide">';

    html += '<div class="hero">' +
      '<div class="hero-kicker">' + SITE.name + ' · ' + SITE.tagline + '</div>' +
      '<h1>Everything Beyond,<br>in one place.</h1>' +
      '<p>' + SITE.strapline + '</p>' +
      '<div class="hero-cta">' +
        '<a class="btn solid" href="#/start/start-here">Start here</a>' +
        '<a class="btn" href="#/recommendations/how-to-action">Work my recommendations</a>' +
      '</div></div>';

    html += '<h2 class="sub" style="margin-top:0">Browse by topic</h2>' +
      '<p>Navigation follows subject matter, not job title — so content stays findable when responsibilities change, and every team reaches the same resources.</p>';

    html += '<div class="grid grid-tiles" style="margin-bottom:46px">' + topics.map(function (s) {
      return '<a class="tile" href="#/' + s.id + '">' +
        '<div class="tile-top">' + icon(s.icon) + '<span class="tile-kicker">' + s.kicker + '</span></div>' +
        '<h3>' + s.title + '</h3><p>' + s.blurb + '</p>' +
        '<div class="tile-count">' + s.pages.length + ' pages →</div></a>';
    }).join('') + '</div>';

    html += '<h2 class="sub">How this hub works</h2>';
    html += '<div class="grid grid-2">' + SITE.principles.map(function (p, i) {
      return '<div class="card"><div class="num" style="background:' + NUM_COLORS[i % NUM_COLORS.length] + '">' +
        (i + 1) + '</div><h3>' + p.title + '</h3><p>' + p.text + '</p></div>';
    }).join('') + '</div>';

    html += '<div class="callout info" style="margin-top:34px"><h4>Ownership and content gaps</h4>' +
      '<p>Every section names an owning team and a review date. Anything overdue — and every asset still to be produced — is listed on the ' +
      '<a href="#/governance/report" style="color:#7FA5FF">content gap report</a>, generated live from the content model.</p></div>';

    return html + '</div>';
  }

  function renderSection(sec) {
    var html = '<div class="wrap">';
    html += '<div class="kicker">' + sec.kicker + '</div>';
    html += '<h1 class="page-title">' + sec.title + '</h1>';
    html += '<p class="page-lede">' + sec.blurb + '</p>';
    html += '<div class="rainbow"></div>';
    html += ownerBar(sec);
    html += '<div class="pagelist">' + sec.pages.map(function (p) {
      return '<a class="pagerow" href="#/' + sec.id + '/' + p.id + '">' +
        '<div><h3>' + p.title + '</h3><p>' + p.summary + '</p></div><span class="arrow">→</span></a>';
    }).join('') + '</div>';
    return html + '</div>';
  }

  function renderPage(sec, page) {
    var idx = sec.pages.indexOf(page);
    var prev = sec.pages[idx - 1], next = sec.pages[idx + 1];
    var html = '<div class="wrap">';
    html += '<div class="kicker">' + sec.title + '</div>';
    html += '<h1 class="page-title">' + page.title + '</h1>';
    html += '<div class="rainbow"></div>';
    html += ownerBar(sec);
    html += renderBlocks(page.blocks);

    if (prev || next) {
      html += '<div class="prevnext">';
      html += prev
        ? '<a href="#/' + sec.id + '/' + prev.id + '"><div class="dir">← Previous</div><div class="t">' + prev.title + '</div></a>'
        : '<span style="flex:1"></span>';
      html += next
        ? '<a class="next" href="#/' + sec.id + '/' + next.id + '"><div class="dir">Next →</div><div class="t">' + next.title + '</div></a>'
        : '<span style="flex:1"></span>';
      html += '</div>';
    }
    return html + '</div>';
  }

  function render404() {
    return '<div class="wrap"><div class="kicker">Not found</div>' +
      '<h1 class="page-title">That page is not here</h1><div class="rainbow"></div>' +
      '<p>The link may be out of date. Try the <a href="#/" style="color:#00D09C">home page</a>, ' +
      'or press <kbd>/</kbd> to search every page and asset.</p></div>';
  }

  /* ---------- navigation ------------------------------------------------- */
  function renderNav(secId, pageId) {
    var topics = SECTIONS.filter(function (s) { return !s.utility; });
    var utility = SECTIONS.filter(function (s) { return s.utility; });

    function item(s) {
      var active = s.id === secId;
      var out = '<a class="nav-item' + (active ? ' active' : '') + '" href="#/' + s.id + '">' +
        icon(s.icon, 'nav-icon') + '<span>' + s.title + '</span></a>';
      if (active) {
        out += '<div class="nav-sub">' + s.pages.map(function (p) {
          return '<a class="' + (p.id === pageId ? 'active' : '') + '" href="#/' + s.id + '/' + p.id + '">' + p.title + '</a>';
        }).join('') + '</div>';
      }
      return out;
    }

    return '<div class="nav-label">Topics</div>' + topics.map(item).join('') +
      '<div class="nav-label">Running the hub</div>' + utility.map(item).join('');
  }

  function crumbs(sec, page) {
    var h = '<a href="#/">' + SITE.name + '</a>';
    if (sec) h += '<span>›</span><a href="#/' + sec.id + '">' + sec.title + '</a>';
    if (page) h += '<span>›</span>' + page.title;
    return h;
  }

  /* ---------- search ----------------------------------------------------- */
  var INDEX = (function () {
    var idx = [];
    SECTIONS.forEach(function (sec) {
      idx.push({
        href: '#/' + sec.id, sec: sec.title, title: sec.title, snip: sec.blurb,
        hay: plain(sec.title + ' ' + sec.kicker + ' ' + sec.blurb).toLowerCase(), weight: 3,
      });
      sec.pages.forEach(function (pg) {
        var text = [pg.title, pg.summary];
        (pg.blocks || []).forEach(function (b) {
          if (b.text) text.push(b.text);
          if (b.title) text.push(b.title);
          (b.items || []).forEach(function (i) {
            if (typeof i === 'string') text.push(i);
            else text.push([i.title, i.text, i.q, i.a, i.label, i.note, i.when, i.label, i.value].filter(Boolean).join(' '));
          });
          (b.head || []).forEach(function (h) { text.push(h); });
          (b.rows || []).forEach(function (r) { text.push(r.join(' ')); });
        });
        idx.push({
          href: '#/' + sec.id + '/' + pg.id, sec: sec.title, title: pg.title, snip: pg.summary,
          hay: plain(text.join(' ')).toLowerCase(), weight: 2,
        });
        /* Registered assets are searchable in their own right. */
        (pg.blocks || []).forEach(function (b) {
          if (b.t !== 'assets') return;
          b.items.forEach(function (a) {
            idx.push({
              href: '#/' + sec.id + '/' + pg.id, sec: sec.title + ' › ' + pg.title,
              title: plain(a.label), snip: (a.type || 'Doc') + ' · ' +
                ((a.status || 'needed') === 'live' ? 'Live' : (a.status === 'draft' ? 'Draft' : 'Not yet produced')),
              hay: plain(a.label + ' ' + (a.type || '') + ' ' + (a.note || '') + ' ' + (a.owner || '')).toLowerCase(), weight: 1,
            });
          });
        });
      });
    });
    return idx;
  })();

  function search(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    var terms = q.split(/\s+/);
    return INDEX.map(function (e) {
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        var t = terms[i];
        if (e.hay.indexOf(t) === -1) return null;
        score += e.weight;
        if (plain(e.title).toLowerCase().indexOf(t) !== -1) score += 6;
      }
      return { e: e, score: score };
    }).filter(Boolean).sort(function (a, b) { return b.score - a.score; })
      .slice(0, 18).map(function (r) { return r.e; });
  }

  var overlay, input, results, sel = 0, current = [];

  function openSearch() {
    overlay.classList.add('open');
    input.value = ''; sel = 0;
    drawResults([]);
    input.focus();
  }
  function closeSearch() { overlay.classList.remove('open'); }

  function drawResults(list) {
    current = list;
    if (!list.length) {
      results.innerHTML = '<div class="empty">' +
        (input.value.trim() ? 'Nothing found. If it should be here, that is a content gap — log it on <em>FAQs › Ask a question</em>.'
                            : 'Search every page and every registered asset.') + '</div>';
      return;
    }
    results.innerHTML = list.map(function (e, i) {
      return '<a href="' + e.href + '" class="' + (i === sel ? 'sel' : '') + '">' +
        '<div class="r-sec">' + esc(e.sec) + '</div>' +
        '<div class="r-title">' + esc(plain(e.title)) + '</div>' +
        '<div class="r-snip">' + esc(plain(e.snip)) + '</div></a>';
    }).join('');
  }

  /* ---------- router ----------------------------------------------------- */
  function route() {
    var hash = location.hash.replace(/^#\/?/, '');
    var parts = hash.split('/').filter(Boolean);
    var sec = parts[0] ? byId[parts[0]] : null;
    var page = sec && parts[1] ? sec.pages.filter(function (p) { return p.id === parts[1]; })[0] : null;

    var body;
    if (!parts.length) body = renderHome();
    else if (!sec) body = render404();
    else if (parts[1] && !page) body = render404();
    else if (page) body = renderPage(sec, page);
    else body = renderSection(sec);

    document.getElementById('content').innerHTML = body;
    document.getElementById('nav').innerHTML = renderNav(sec && sec.id, page && page.id);
    document.getElementById('crumbs').innerHTML = crumbs(sec, page);
    document.title = (page ? page.title + ' · ' + sec.title : sec ? sec.title : SITE.tagline) + ' — ' + SITE.name + ' | Pax8';
    window.scrollTo(0, 0);
    document.getElementById('sidebar').classList.remove('open');
    var scrim = document.querySelector('.scrim');
    if (scrim) scrim.remove();
  }

  /* ---------- boot ------------------------------------------------------- */
  function boot() {
    overlay = document.getElementById('overlay');
    input = document.getElementById('searchInput');
    results = document.getElementById('results');

    document.getElementById('searchBtn').addEventListener('click', openSearch);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeSearch(); });
    input.addEventListener('input', function () { sel = 0; drawResults(search(input.value)); });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, current.length - 1); drawResults(current); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); drawResults(current); }
      else if (e.key === 'Enter' && current[sel]) { e.preventDefault(); location.hash = current[sel].href; closeSearch(); }
      else if (e.key === 'Escape') { closeSearch(); }
    });

    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (e.key === '/' && tag !== 'input' && tag !== 'textarea') { e.preventDefault(); openSearch(); }
      if (e.key === 'Escape') closeSearch();
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); openSearch(); }
    });

    results.addEventListener('click', function (e) { if (e.target.closest('a')) closeSearch(); });

    document.getElementById('menuBtn').addEventListener('click', function () {
      var sb = document.getElementById('sidebar');
      sb.classList.toggle('open');
      if (sb.classList.contains('open')) {
        var scrim = document.createElement('div');
        scrim.className = 'scrim';
        scrim.addEventListener('click', function () { sb.classList.remove('open'); scrim.remove(); });
        document.body.appendChild(scrim);
      } else {
        var s = document.querySelector('.scrim'); if (s) s.remove();
      }
    });

    window.addEventListener('hashchange', route);
    route();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
