/* =============================================================================
   MIP COMPASS — THE MIP LANDSCAPE
   =============================================================================
   An original SVG world. Territory names, colours and order all come from
   MIP_CONFIG, so renaming a play never requires touching this file.

   Usage:
     const map = MIPMap.create(containerEl, { interactive: true, onSelect: fn });
     map.setSelected('discover');
     map.setMarkers([{ territory:'discover', kind:'player' }, ...]);
     map.highlightRoute('broker');

   Accessibility: every territory is a real focusable button with an aria-label
   and aria-pressed state. Arrow keys move between territories, Enter/Space
   selects. Nothing here requires dragging or a pointer.
   ============================================================================= */

const MIPMap = (function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  /* Hand-placed positions. The landscape art is tuned for these six points —
     if you add a seventh play, place it here and extend ROADS below. */
  const LAYOUT = {
    discover:  { x: 168, y: 432, label: 'below' },
    sell:      { x: 336, y: 236, label: 'above' },
    buy:       { x: 524, y: 470, label: 'below' },
    build:     { x: 566, y: 158, label: 'above' },
    implement: { x: 762, y: 412, label: 'below' },
    manage:    { x: 872, y: 190, label: 'above' }
  };

  /* Roads: [from, to, whichRoutesUseIt] */
  const ROADS = [
    ['discover',  'sell',      ['broker', 'builder']],
    ['sell',      'buy',       ['broker']],
    ['sell',      'build',     ['builder']],
    ['buy',       'implement', ['broker']],
    ['build',     'implement', ['builder']],
    ['implement', 'manage',    ['broker', 'builder']]
  ];

  let uidCounter = 0;

  function el(name, attrs, parent) {
    const node = document.createElementNS(SVG_NS, name);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        node.setAttribute(k, attrs[k]);
      });
    }
    if (parent) parent.appendChild(node);
    return node;
  }

  /* Curved road between two points — a gentle arc rather than a straight line
     so the world reads as a landscape, not a flowchart. */
  function roadPath(a, b) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    /* Bow the curve perpendicular to the line, scaled by distance. */
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const bow = Math.min(60, len * 0.16);
    const nx = -dy / len;
    const ny = dx / len;
    return 'M ' + a.x + ' ' + a.y + ' Q ' + (mx + nx * bow) + ' ' + (my + ny * bow) + ' ' + b.x + ' ' + b.y;
  }

  /* ------------------------------------------------------------------
     TERRITORY SILHOUETTES
     Each returns a <g> drawn with its origin at the centre of the plot.
     ------------------------------------------------------------------ */
  const ICONS = {
    /* Discover Harbour — lighthouse, jetty, a bobbing boat */
    anchor: function (g, c, uid) {
      /* water inside the plot */
      el('ellipse', { cx: 18, cy: 6, rx: 74, ry: 30, fill: 'rgba(120,200,255,.55)' }, g);
      el('path', { d: 'M -46 4 q 22 -7 44 0 t 44 0', stroke: 'rgba(255,255,255,.55)', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round', class: 'mipc-ripple' }, g);
      el('path', { d: 'M -40 16 q 20 -6 40 0 t 40 0', stroke: 'rgba(255,255,255,.35)', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round', class: 'mipc-ripple mipc-ripple-2' }, g);
      /* jetty */
      el('rect', { x: -74, y: -6, width: 40, height: 7, rx: 3, fill: '#8a6a4e' }, g);
      el('rect', { x: -66, y: 1, width: 5, height: 12, fill: '#6d5340' }, g);
      el('rect', { x: -44, y: 1, width: 5, height: 12, fill: '#6d5340' }, g);
      /* lighthouse */
      const lh = el('g', { transform: 'translate(-58,-56)' }, g);
      el('path', { d: 'M -11 44 L -7 -2 L 7 -2 L 11 44 Z', fill: '#fdfdfd' }, lh);
      el('path', { d: 'M -9.4 28 L 9.4 28 L 10.4 40 L -10.4 40 Z', fill: c }, lh);
      el('path', { d: 'M -8.2 12 L 8.2 12 L 9 22 L -9 22 Z', fill: c, opacity: '.65' }, lh);
      el('rect', { x: -8, y: -10, width: 16, height: 9, rx: 2, fill: '#33455e' }, lh);
      el('circle', { cx: 0, cy: -5.5, r: 3.4, fill: '#ffe9a8', class: 'mipc-beacon' }, lh);
      el('path', { d: 'M -12 -10 L 12 -10 L 8 -15 L -8 -15 Z', fill: '#33455e' }, lh);
      /* boat */
      const boat = el('g', { transform: 'translate(34,0)', class: 'mipc-bob' }, g);
      el('path', { d: 'M -20 6 L 20 6 L 14 17 L -14 17 Z', fill: '#f7f4ee' }, boat);
      el('rect', { x: -1.5, y: -22, width: 3, height: 28, fill: '#7d6142' }, boat);
      el('path', { d: 'M 2 -21 L 19 2 L 2 2 Z', fill: c }, boat);
      el('path', { d: 'M -3 -18 L -15 2 L -3 2 Z', fill: '#ffffff', opacity: '.9' }, boat);
    },

    /* Sell Square — plaza, signpost, banners */
    signpost: function (g, c, uid) {
      el('ellipse', { cx: 6, cy: 10, rx: 66, ry: 26, fill: 'rgba(255,255,255,.28)' }, g);
      /* paving */
      el('path', { d: 'M -40 10 L 4 -6 L 48 10 L 4 26 Z', fill: 'rgba(255,255,255,.42)' }, g);
      el('path', { d: 'M -18 10 L 4 2 L 26 10 L 4 18 Z', fill: 'rgba(255,255,255,.5)' }, g);
      /* market awning stall left */
      const st = el('g', { transform: 'translate(-52,-26)' }, g);
      el('rect', { x: -16, y: 0, width: 32, height: 26, rx: 3, fill: '#fbf7ef' }, st);
      el('path', { d: 'M -20 0 L 20 0 L 16 -11 L -16 -11 Z', fill: c }, st);
      el('rect', { x: -6, y: 10, width: 12, height: 16, fill: 'rgba(60,70,90,.28)' }, st);
      /* signpost */
      const sp = el('g', { transform: 'translate(30,-52)' }, g);
      el('rect', { x: -2.6, y: 0, width: 5.2, height: 62, rx: 2, fill: '#8a6a4e' }, sp);
      el('path', { d: 'M 2 6 L 40 6 L 47 14 L 40 22 L 2 22 Z', fill: c, class: 'mipc-sway' }, sp);
      el('path', { d: 'M -2 28 L -40 28 L -47 36 L -40 44 L -2 44 Z', fill: c, opacity: '.7' }, sp);
      /* bunting */
      el('path', { d: 'M -70 -30 q 46 26 96 -4', stroke: 'rgba(255,255,255,.7)', 'stroke-width': 2, fill: 'none' }, g);
      [-52, -30, -8, 14, 36].forEach(function (bx, i) {
        el('path', { d: 'M ' + bx + ' -22 l 7 0 l -3.5 9 Z', fill: i % 2 ? '#ffffff' : c, opacity: '.9' }, g);
      });
    },

    /* Buy Market — a row of striped stalls and crates */
    stall: function (g, c, uid) {
      el('ellipse', { cx: 4, cy: 12, rx: 70, ry: 27, fill: 'rgba(255,255,255,.24)' }, g);
      [[-44, -14, 1], [2, -30, 1.12], [46, -12, .95]].forEach(function (s, i) {
        const st = el('g', { transform: 'translate(' + s[0] + ',' + s[1] + ') scale(' + s[2] + ')' }, g);
        el('rect', { x: -20, y: 0, width: 40, height: 30, rx: 3, fill: '#fbf7ef' }, st);
        /* striped awning */
        const clipId = 'mipc-awn-' + uid + '-' + i;
        const cp = el('clipPath', { id: clipId }, st);
        el('path', { d: 'M -25 0 L 25 0 L 20 -13 L -20 -13 Z' }, cp);
        const aw = el('g', { 'clip-path': 'url(#' + clipId + ')' }, st);
        el('rect', { x: -25, y: -14, width: 50, height: 15, fill: '#ffffff' }, aw);
        for (let k = -25; k < 25; k += 10) {
          el('rect', { x: k, y: -14, width: 5, height: 15, fill: c }, aw);
        }
        el('path', { d: 'M -25 0 L 25 0 L 20 -13 L -20 -13 Z', fill: 'none', stroke: 'rgba(0,0,0,.08)', 'stroke-width': 1 }, st);
        el('rect', { x: -14, y: 12, width: 28, height: 18, rx: 2, fill: 'rgba(60,70,90,.2)' }, st);
        el('circle', { cx: -7, cy: 8, r: 3.2, fill: c, opacity: '.85' }, st);
        el('circle', { cx: 1, cy: 8, r: 3.2, fill: c, opacity: '.6' }, st);
        el('circle', { cx: 9, cy: 8, r: 3.2, fill: c, opacity: '.85' }, st);
      });
      /* crates */
      el('rect', { x: -70, y: 4, width: 18, height: 16, rx: 2, fill: '#c8a179' }, g);
      el('rect', { x: -66, y: -10, width: 14, height: 14, rx: 2, fill: '#d9b48c' }, g);
    },

    /* Build Labs — dome, towers, a slowly turning crane */
    lab: function (g, c, uid) {
      el('ellipse', { cx: 4, cy: 12, rx: 68, ry: 26, fill: 'rgba(255,255,255,.24)' }, g);
      /* main lab block */
      el('rect', { x: -40, y: -40, width: 54, height: 52, rx: 5, fill: '#fbfaf6' }, g);
      el('rect', { x: -40, y: -40, width: 54, height: 12, rx: 5, fill: c, opacity: '.75' }, g);
      [-31, -18, -5].forEach(function (wx) {
        el('rect', { x: wx, y: -20, width: 9, height: 9, rx: 1.5, fill: c, opacity: '.55' }, g);
        el('rect', { x: wx, y: -6, width: 9, height: 9, rx: 1.5, fill: c, opacity: '.3' }, g);
      });
      /* dome */
      el('path', { d: 'M -42 -40 a 29 26 0 0 1 58 0 Z', fill: c }, g);
      el('circle', { cx: -13, cy: -47, r: 5, fill: '#ffffff', opacity: '.85', class: 'mipc-pulse' }, g);
      /* flask tower */
      el('rect', { x: 22, y: -30, width: 20, height: 42, rx: 4, fill: '#fbfaf6' }, g);
      el('rect', { x: 26, y: -22, width: 12, height: 20, rx: 3, fill: c, opacity: '.4' }, g);
      el('rect', { x: 29, y: -40, width: 6, height: 12, rx: 2, fill: '#93a3b8' }, g);
      /* crane */
      const cr = el('g', { transform: 'translate(30,-46)' }, g);
      el('rect', { x: -1.6, y: 0, width: 3.2, height: 20, fill: '#93a3b8' }, cr);
      const arm = el('g', { class: 'mipc-crane' }, cr);
      el('rect', { x: -22, y: -3, width: 44, height: 3.4, rx: 1.7, fill: '#93a3b8' }, arm);
      el('line', { x1: 16, y1: 0, x2: 16, y2: 11, stroke: '#93a3b8', 'stroke-width': 1.2 }, arm);
      el('rect', { x: 12.5, y: 11, width: 7, height: 6, rx: 1.5, fill: c }, arm);
    },

    /* Implementation Valley — hills, a winding road, trees */
    valley: function (g, c, uid) {
      el('ellipse', { cx: 4, cy: 12, rx: 72, ry: 27, fill: 'rgba(255,255,255,.2)' }, g);
      /* back hills */
      el('path', { d: 'M -66 12 q 26 -50 52 -6 q 20 -38 44 -2 q 12 12 18 8 L 48 12 Z', fill: c, opacity: '.42' }, g);
      el('path', { d: 'M -60 12 q 22 -34 44 -4 q 18 -26 38 2 L 22 12 Z', fill: c, opacity: '.7' }, g);
      /* winding road */
      el('path', { d: 'M -46 14 q 18 -12 30 -2 q 14 12 30 -4 q 12 -12 26 -2', stroke: '#fbf7ef', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, g);
      el('path', { d: 'M -46 14 q 18 -12 30 -2 q 14 12 30 -4 q 12 -12 26 -2', stroke: 'rgba(90,80,70,.35)', 'stroke-width': 1.4, fill: 'none', 'stroke-dasharray': '5 6', 'stroke-linecap': 'round' }, g);
      /* trees */
      [[-34, -6, 1], [-20, 2, .82], [30, -12, .95], [44, 0, .8]].forEach(function (t) {
        const tr = el('g', { transform: 'translate(' + t[0] + ',' + t[1] + ') scale(' + t[2] + ')' }, g);
        el('rect', { x: -1.8, y: 0, width: 3.6, height: 10, fill: '#7d6142' }, tr);
        el('path', { d: 'M 0 -20 L 11 2 L -11 2 Z', fill: '#3f9d6d' }, tr);
        el('path', { d: 'M 0 -12 L 8 4 L -8 4 Z', fill: '#4fb37f' }, tr);
      });
      /* small house = deployment landed */
      const h = el('g', { transform: 'translate(8,-4)' }, g);
      el('rect', { x: -9, y: -8, width: 18, height: 14, rx: 1.5, fill: '#fdfbf6' }, h);
      el('path', { d: 'M -12 -8 L 0 -18 L 12 -8 Z', fill: c }, h);
      el('rect', { x: -3, y: -2, width: 6, height: 8, fill: c, opacity: '.5' }, h);
    },

    /* Manage City — skyline with blinking windows */
    city: function (g, c, uid) {
      el('ellipse', { cx: 4, cy: 12, rx: 68, ry: 26, fill: 'rgba(255,255,255,.24)' }, g);
      const towers = [
        { x: -46, w: 24, h: 44 },
        { x: -18, w: 28, h: 66 },
        { x: 14,  w: 22, h: 52 },
        { x: 40,  w: 26, h: 38 }
      ];
      towers.forEach(function (t, ti) {
        el('rect', { x: t.x, y: 12 - t.h, width: t.w, height: t.h, rx: 3, fill: ti % 2 ? '#fbfaf6' : '#f2f0ea' }, g);
        el('rect', { x: t.x, y: 12 - t.h, width: t.w, height: 6, rx: 3, fill: c, opacity: '.8' }, g);
        /* windows */
        let wi = 0;
        for (let wy = 12 - t.h + 12; wy < 4; wy += 11) {
          for (let wx = t.x + 5; wx < t.x + t.w - 6; wx += 9) {
            wi += 1;
            el('rect', {
              x: wx, y: wy, width: 5, height: 6, rx: 1,
              fill: c, opacity: (wi % 3 === 0 ? '.85' : '.35'),
              class: wi % 4 === 0 ? 'mipc-window' : '',
              style: 'animation-delay:' + ((wi % 7) * 0.4) + 's'
            }, g);
          }
        }
      });
      /* antenna + shield motif for governance */
      el('rect', { x: -5.4, y: -66, width: 2.8, height: 12, fill: '#93a3b8' }, g);
      el('circle', { cx: -4, cy: -68, r: 3, fill: '#ffe9a8', class: 'mipc-beacon' }, g);
      const sh = el('g', { transform: 'translate(40,-32)' }, g);
      el('path', { d: 'M 0 -9 L 9 -5 L 9 3 Q 9 10 0 13 Q -9 10 -9 3 L -9 -5 Z', fill: '#ffffff', opacity: '.9' }, sh);
      el('path', { d: 'M -4 1 L -1 4.5 L 4.5 -3', stroke: c, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sh);
    }
  };

  /* ------------------------------------------------------------------
     MAP INSTANCE
     ------------------------------------------------------------------ */
  function create(container, options) {
    options = options || {};
    const config = (window.MIPStore ? window.MIPStore.getConfig() : window.MIP_CONFIG);
    const territories = config.territories;
    const interactive = options.interactive !== false;
    const compact = !!options.compact;
    const uid = ++uidCounter;

    container.innerHTML = '';

    const svg = el('svg', {
      viewBox: '0 0 1000 620',
      preserveAspectRatio: 'xMidYMid meet',
      class: 'mipc-map' + (compact ? ' mipc-map--compact' : ''),
      role: interactive ? 'group' : 'img',
      'aria-label': interactive
        ? 'The MIP Landscape. Six territories you can select.'
        : 'Map of the MIP Landscape showing where you placed the partner and the recommended destination.'
    }, container);

    /* ---- defs: gradients ---- */
    const defs = el('defs', {}, svg);

    const sky = el('linearGradient', { id: 'mipc-sky-' + uid, x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
    el('stop', { offset: '0%', 'stop-color': '#1b2748' }, sky);
    el('stop', { offset: '55%', 'stop-color': '#2b3a63' }, sky);
    el('stop', { offset: '100%', 'stop-color': '#3a4d76' }, sky);

    const ground = el('linearGradient', { id: 'mipc-ground-' + uid, x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
    el('stop', { offset: '0%', 'stop-color': '#4d7a5e' }, ground);
    el('stop', { offset: '100%', 'stop-color': '#2f5a48' }, ground);

    const sea = el('linearGradient', { id: 'mipc-sea-' + uid, x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
    el('stop', { offset: '0%', 'stop-color': '#2f6f9e' }, sea);
    el('stop', { offset: '100%', 'stop-color': '#1d4f78' }, sea);

    const glow = el('filter', { id: 'mipc-glow-' + uid, x: '-60%', y: '-60%', width: '220%', height: '220%' }, defs);
    el('feGaussianBlur', { stdDeviation: '9', result: 'b' }, glow);
    const gm = el('feMerge', {}, glow);
    el('feMergeNode', { in: 'b' }, gm);
    el('feMergeNode', { in: 'SourceGraphic' }, gm);

    /* ---- backdrop ---- */
    el('rect', { x: 0, y: 0, width: 1000, height: 620, fill: 'url(#mipc-sky-' + uid + ')' }, svg);

    /* stars / distant haze */
    for (let i = 0; i < 26; i++) {
      const sx = (i * 137) % 990 + 5;
      const sy = (i * 53) % 150 + 8;
      el('circle', { cx: sx, cy: sy, r: (i % 3 === 0 ? 1.6 : 1), fill: '#ffffff', opacity: (i % 4 === 0 ? '.5' : '.25') }, svg);
    }

    /* distant hills */
    el('path', { d: 'M 0 250 q 120 -70 240 -12 q 130 -78 250 -6 q 140 -66 260 -10 q 130 -40 250 4 L 1000 620 L 0 620 Z', fill: '#2b4a5e', opacity: '.55' }, svg);
    el('path', { d: 'M 0 300 q 150 -60 300 -8 q 160 -56 300 -4 q 170 -46 400 6 L 1000 620 L 0 620 Z', fill: '#2f5566', opacity: '.7' }, svg);

    /* landmass */
    el('path', {
      d: 'M 60 330 q 90 -70 220 -52 q 110 -78 250 -40 q 130 -60 280 -6 q 120 42 128 130 q 10 108 -120 156 q -160 58 -360 44 q -210 -14 -330 -70 q -110 -52 -68 -162 Z',
      fill: 'url(#mipc-ground-' + uid + ')'
    }, svg);

    /* bay for the harbour */
    el('path', { d: 'M 60 380 q 70 -46 156 -18 q 60 20 42 74 q -20 58 -104 60 q -92 2 -122 -46 q -26 -42 28 -70 Z', fill: 'url(#mipc-sea-' + uid + ')' }, svg);

    /* river connecting bay to the valley — one ecosystem, not six boxes */
    el('path', { d: 'M 214 452 q 130 42 268 22 q 150 -22 258 6', stroke: '#2f6f9e', 'stroke-width': 13, fill: 'none', opacity: '.5', 'stroke-linecap': 'round' }, svg);
    el('path', { d: 'M 214 452 q 130 42 268 22 q 150 -22 258 6', stroke: '#5aa7d4', 'stroke-width': 5, fill: 'none', opacity: '.5', 'stroke-linecap': 'round' }, svg);

    /* ---- roads ---- */
    const roadLayer = el('g', { class: 'mipc-roads' }, svg);
    const routeLayer = el('g', { class: 'mipc-routes' }, svg);
    const roadNodes = [];

    ROADS.forEach(function (r) {
      const a = LAYOUT[r[0]];
      const b = LAYOUT[r[1]];
      if (!a || !b) return;
      const d = roadPath(a, b);
      el('path', { d: d, class: 'mipc-road-base', fill: 'none' }, roadLayer);
      el('path', { d: d, class: 'mipc-road-dash', fill: 'none' }, roadLayer);
      const overlay = el('path', {
        d: d, fill: 'none', class: 'mipc-route-line',
        'data-routes': r[2].join(' ')
      }, routeLayer);
      roadNodes.push(overlay);
    });

    /* bridge detail where the road crosses the river */
    el('rect', { x: 468, y: 462, width: 44, height: 9, rx: 3, fill: '#8a6a4e', transform: 'rotate(-6 490 466)' }, svg);

    /* ---- territories ---- */
    const plotLayer = el('g', { class: 'mipc-plots' }, svg);
    const nodes = {};

    territories.forEach(function (t, index) {
      const pos = LAYOUT[t.id];
      if (!pos) return;

      const g = el('g', {
        class: 'mipc-territory',
        transform: 'translate(' + pos.x + ',' + pos.y + ')',
        'data-territory': t.id
      }, plotLayer);

      /* hit area sits underneath everything so clicks are forgiving */
      const hit = el('ellipse', { cx: 0, cy: 0, rx: 104, ry: 62, class: 'mipc-hit' }, g);

      /* plot depth */
      el('ellipse', { cx: 0, cy: 16, rx: 96, ry: 40, fill: 'rgba(0,0,0,.28)' }, g);
      el('ellipse', { cx: 0, cy: 10, rx: 96, ry: 40, fill: t.color, opacity: '.28' }, g);
      el('ellipse', { cx: 0, cy: 4, rx: 92, ry: 37, fill: t.color, opacity: '.55', class: 'mipc-plot-top' }, g);
      el('ellipse', { cx: 0, cy: 4, rx: 92, ry: 37, fill: 'none', stroke: t.color, 'stroke-width': 2.5, opacity: '.9' }, g);

      /* selection ring — drawn but hidden until selected */
      el('ellipse', {
        cx: 0, cy: 4, rx: 100, ry: 44, fill: 'none',
        stroke: t.color, 'stroke-width': 4, class: 'mipc-ring',
        filter: 'url(#mipc-glow-' + uid + ')'
      }, g);

      /* the little world */
      const art = el('g', { class: 'mipc-art' }, g);
      const draw = ICONS[t.icon] || ICONS.signpost;
      draw(art, t.color, uid + '-' + index);

      /* Label chip.
         The SVG scales to its container, so a fixed viewBox font-size becomes
         unreadable on a phone (17 units across a 1000-unit box is ~6px on a
         390px screen). Scale the type up and drop to the short play name when
         the map is small, then size the chip from the type rather than the
         other way round. */
      const labelY = pos.label === 'above' ? -96 : 74;
      const chip = el('g', { class: 'mipc-label', transform: 'translate(0,' + labelY + ')' }, g);

      const narrow = (window.innerWidth || 1200) < 760;
      const labelFont = compact ? 21 : (narrow ? 28 : 17);
      const nameText = (compact || narrow) ? t.label : t.placeName;

      const chipH = Math.round(labelFont * 2);
      const dotR = labelFont * 0.33;
      const padX = labelFont * 1.5;
      const chipW = Math.max(chipH * 2.6, nameText.length * labelFont * 0.60 + padX * 2);

      el('rect', {
        x: -chipW / 2, y: -chipH / 2, width: chipW, height: chipH, rx: chipH / 2,
        fill: 'rgba(9,14,28,.88)', stroke: t.color, 'stroke-width': 2
      }, chip);
      el('circle', { cx: -chipW / 2 + padX, cy: 0, r: dotR, fill: t.color }, chip);
      const txt = el('text', {
        x: padX * 0.5, y: labelFont * 0.35, 'text-anchor': 'middle',
        class: 'mipc-label-text', fill: '#ffffff',
        style: 'font-size:' + labelFont + 'px'
      }, chip);
      txt.textContent = nameText;

      /* marker slot (player / ideal pins land here) */
      const markerSlot = el('g', { class: 'mipc-markers', transform: 'translate(0,-4)' }, g);

      nodes[t.id] = { group: g, hit: hit, markerSlot: markerSlot, territory: t };

      if (interactive) {
        g.setAttribute('role', 'button');
        g.setAttribute('tabindex', '0');
        g.setAttribute('aria-pressed', 'false');
        g.setAttribute('aria-label', t.placeName + '. ' + t.label + '. ' + t.blurb);
        g.classList.add('mipc-territory--interactive');
      } else {
        g.setAttribute('aria-hidden', 'true');
      }
    });

    /* ---- compass rose ---- */
    if (!compact) {
      const rose = el('g', { transform: 'translate(932,556)', class: 'mipc-rose', 'aria-hidden': 'true' }, svg);
      el('circle', { cx: 0, cy: 0, r: 30, fill: 'rgba(9,14,28,.6)', stroke: 'rgba(255,255,255,.28)', 'stroke-width': 1.5 }, rose);
      el('path', { d: 'M 0 -22 L 6 0 L 0 22 L -6 0 Z', fill: '#ffffff', opacity: '.85' }, rose);
      el('path', { d: 'M 0 -22 L 6 0 L -6 0 Z', fill: '#00C9A7' }, rose);
      el('path', { d: 'M -22 0 L 0 -5 L 22 0 L 0 5 Z', fill: '#ffffff', opacity: '.4' }, rose);
      const n = el('text', { x: 0, y: -34, 'text-anchor': 'middle', class: 'mipc-rose-text' }, rose);
      n.textContent = 'N';
    }

    /* ------------------------------------------------------------------
       INTERACTION
       ------------------------------------------------------------------ */
    let selected = null;
    let enabled = interactive;

    function setSelected(id, silent) {
      selected = id;
      Object.keys(nodes).forEach(function (k) {
        const n = nodes[k];
        const isSel = k === id;
        n.group.classList.toggle('is-selected', isSel);
        if (interactive) n.group.setAttribute('aria-pressed', isSel ? 'true' : 'false');
      });
      if (!silent && options.onSelect && id) options.onSelect(id);
    }

    function choose(id) {
      if (!enabled) return;
      setSelected(id);
    }

    if (interactive) {
      const order = territories.map(function (t) { return t.id; }).filter(function (id) { return nodes[id]; });

      order.forEach(function (id, i) {
        const n = nodes[id];
        n.group.addEventListener('click', function () { choose(id); });
        n.group.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
            ev.preventDefault();
            choose(id);
            return;
          }
          let next = null;
          if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') next = order[(i + 1) % order.length];
          if (ev.key === 'ArrowLeft'  || ev.key === 'ArrowUp')   next = order[(i - 1 + order.length) % order.length];
          if (next) {
            ev.preventDefault();
            nodes[next].group.focus();
          }
        });
      });
    }

    /* ------------------------------------------------------------------
       MARKERS
       kind: 'player' (hollow pin) | 'ideal' (filled pin with tick)
       ------------------------------------------------------------------ */
    function clearMarkers() {
      Object.keys(nodes).forEach(function (k) {
        nodes[k].markerSlot.innerHTML = '';
        nodes[k].group.classList.remove('has-marker');
      });
    }

    function setMarkers(list) {
      clearMarkers();
      (list || []).forEach(function (m) {
        const n = nodes[m.territory];
        if (!n) return;
        const both = (list.filter(function (x) { return x.territory === m.territory; }).length > 1);
        const offset = both ? (m.kind === 'player' ? -26 : 26) : 0;
        /* Sit the pin high enough that its label clears the tallest artwork. */
        const pin = el('g', {
          class: 'mipc-pin mipc-pin--' + m.kind,
          transform: 'translate(' + offset + ',-62)'
        }, n.markerSlot);

        const color = m.kind === 'ideal' ? '#ffffff' : '#0B1020';
        const fill  = m.kind === 'ideal' ? n.territory.color : 'rgba(255,255,255,.95)';

        el('ellipse', { cx: 0, cy: 30, rx: 12, ry: 4.5, fill: 'rgba(0,0,0,.35)' }, pin);
        el('path', {
          d: 'M 0 28 C -16 10 -18 -2 -18 -8 A 18 18 0 1 1 18 -8 C 18 -2 16 10 0 28 Z',
          fill: fill, stroke: m.kind === 'ideal' ? 'rgba(255,255,255,.9)' : '#0B1020', 'stroke-width': 2.5
        }, pin);

        if (m.kind === 'ideal') {
          /* tick — a shape, not just a colour */
          el('path', { d: 'M -7 -8 L -2 -2.5 L 8 -13', stroke: color, 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, pin);
        } else {
          /* person/flag glyph for the player's own placement */
          el('circle', { cx: 0, cy: -12, r: 4.2, fill: '#0B1020' }, pin);
          el('path', { d: 'M -7 -2 q 7 -7 14 0 Z', fill: '#0B1020' }, pin);
        }

        const lbl = el('text', { x: 0, y: 46, 'text-anchor': 'middle', class: 'mipc-pin-label' }, pin);
        lbl.textContent = m.kind === 'ideal' ? 'Recommended' : 'You';

        n.group.classList.add('has-marker');
      });
    }

    /* ------------------------------------------------------------------
       ROUTES
       ------------------------------------------------------------------ */
    function highlightRoute(routeId) {
      routeLayer.classList.toggle('is-active', !!routeId);
      roadNodes.forEach(function (p) {
        const routes = (p.getAttribute('data-routes') || '').split(' ');
        const on = routeId && routes.indexOf(routeId) >= 0;
        p.classList.toggle('is-lit', !!on);
        /* 'blended' lights both */
        if (routeId === 'blended') p.classList.add('is-lit');
        if (!routeId) p.classList.remove('is-lit');
      });
    }

    function setEnabled(v) {
      enabled = v;
      Object.keys(nodes).forEach(function (k) {
        const g = nodes[k].group;
        g.classList.toggle('is-disabled', !v);
        if (interactive) g.setAttribute('tabindex', v ? '0' : '-1');
      });
    }

    function focusFirst() {
      const first = territories.map(function (t) { return nodes[t.id]; }).filter(Boolean)[0];
      if (first) first.group.focus();
    }

    return {
      svg: svg,
      setSelected: setSelected,
      getSelected: function () { return selected; },
      setMarkers: setMarkers,
      clearMarkers: clearMarkers,
      highlightRoute: highlightRoute,
      setEnabled: setEnabled,
      focusFirst: focusFirst
    };
  }

  return { create: create, LAYOUT: LAYOUT, ROADS: ROADS };
})();

window.MIPMap = MIPMap;
