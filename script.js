// =============================================================
// LEARNING PROGRAMME QUEST — game logic
// =============================================================

const STORAGE_KEY = "questGameStateV1";
const SOUND_KEY = "questGameSoundOn";
const SVG_NS = "http://www.w3.org/2000/svg";

// XP / level economy
const XP_PER_QUEST_BASE = 800;
const XP_PER_MINIMUM = 30;
const XP_PER_NOTES = 50;
const XP_PER_LEVEL = 1000;

// =============================================================
// State
// =============================================================
let template = null;
let state = loadState();
let activeStepIndex = 0;
let lastHeroPos = null;
let selectedHeroClass = "warrior";
const _bossShownThisSession = new Set();
let soundOn = localStorage.getItem(SOUND_KEY) === "1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { programmes: [], activeProgrammeId: null };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// =============================================================
// Programme model
// =============================================================
function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "p_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

function blankStepData() {
  const data = {};
  template.nodes.forEach((node) => {
    data[node.id] = {
      done: false,
      completedAt: null,
      notes: "",
      minimumChecks: node.minimum.map(() => false),
    };
  });
  return data;
}

function createProgramme(name, heroClass = "warrior") {
  const id = newId();
  const now = new Date().toISOString();
  const programme = {
    id,
    name: (name || "").trim().toUpperCase() || "UNTITLED QUEST",
    heroClass,
    createdAt: now,
    updatedAt: now,
    stepData: blankStepData(),
  };
  state.programmes.push(programme);
  state.activeProgrammeId = id;
  lastHeroPos = null;
  saveState();
  return programme;
}

function getActive() {
  return state.programmes.find((p) => p.id === state.activeProgrammeId) || null;
}

function setActive(id) {
  state.activeProgrammeId = id;
  activeStepIndex = firstIncompleteIndex(state.programmes.find((p) => p.id === id));
  lastHeroPos = null;
  saveState();
}

function deleteActive() {
  const a = getActive();
  if (!a) return;
  state.programmes = state.programmes.filter((p) => p.id !== a.id);
  state.activeProgrammeId = state.programmes[0]?.id || null;
  saveState();
}

function touchActive() {
  const a = getActive();
  if (a) {
    a.updatedAt = new Date().toISOString();
    saveState();
  }
}

function ensureStepShape(programme) {
  let changed = false;
  template.nodes.forEach((node) => {
    if (!programme.stepData[node.id]) {
      programme.stepData[node.id] = {
        done: false,
        completedAt: null,
        notes: "",
        minimumChecks: node.minimum.map(() => false),
      };
      changed = true;
    } else {
      const d = programme.stepData[node.id];
      if (!Array.isArray(d.minimumChecks) || d.minimumChecks.length !== node.minimum.length) {
        d.minimumChecks = node.minimum.map((_, i) => Boolean(d.minimumChecks?.[i]));
        changed = true;
      }
    }
  });
  if (changed) saveState();
}

function firstIncompleteIndex(p) {
  if (!p) return 0;
  for (let i = 0; i < template.nodes.length; i++) {
    if (!p.stepData[template.nodes[i].id].done) return i;
  }
  return template.nodes.length - 1;
}

// A checkpoint is locked until every checkpoint before it is complete —
// the journey has real stops, like a learning path with sign-offs.
function isLocked(p, index) {
  for (let i = 0; i < index; i++) {
    if (!p.stepData[template.nodes[i].id].done) return true;
  }
  return false;
}

function xpGainedFor(node, data) {
  let xp = XP_PER_QUEST_BASE;
  data.minimumChecks.forEach((c) => { if (c) xp += XP_PER_MINIMUM; });
  if (data.notes && data.notes.trim()) xp += XP_PER_NOTES;
  return xp;
}

// Single source of truth for whether a step may be completed.
// Returns null when completion is allowed, otherwise the blocking reason.
function completionGate(p, index) {
  const data = p.stepData[template.nodes[index].id];
  if (isLocked(p, index)) {
    const blockerIdx = firstIncompleteIndex(p);
    return {
      btnLabel: `🔒 FINISH STEP ${blockerIdx + 1} FIRST`,
      denyMsg: `🔒 THE PATH IS BLOCKED — FINISH STEP ${blockerIdx + 1} FIRST`,
    };
  }
  const checked = data.minimumChecks.filter(Boolean).length;
  const total = data.minimumChecks.length;
  if (checked < total) {
    return {
      btnLabel: `◇ PROOF ${checked}/${total} — COMPLETE`,
      denyMsg: `◇ COLLECT ALL PROOF FIRST — ${checked}/${total}`,
    };
  }
  return null;
}

function levelFor(xp) {
  return Math.min(template.nodes.length + 1, Math.floor(xp / XP_PER_LEVEL) + 1);
}

function totalDone(p) {
  return template.nodes.filter((n) => p.stepData[n.id].done).length;
}

function calculateXP(p) {
  let xp = 0;
  template.nodes.forEach((n) => {
    const d = p.stepData[n.id];
    if (d.done) xp += xpGainedFor(n, d);
  });
  return xp;
}

function daysSince(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(1, Math.floor(ms / 86400000) + 1);
}

// =============================================================
// SVG helpers
// =============================================================
function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function rect(g, x, y, w, h, fill, extras = {}) {
  const r = svgEl("rect", { x, y, width: w, height: h, fill, ...extras });
  g.appendChild(r);
  return r;
}
function poly(g, points, fill) { g.appendChild(svgEl("polygon", { points, fill })); }
function circ(g, cx, cy, r, fill) { g.appendChild(svgEl("circle", { cx, cy, r, fill })); }

// =============================================================
// World-map node positions
// =============================================================
const NODE_POSITIONS = [
  { x: 80,  y: 490 }, // 1 village
  { x: 195, y: 405 }, // 2 library
  { x: 305, y: 495 }, // 3 council
  { x: 415, y: 410 }, // 4 tavern
  { x: 510, y: 480 }, // 5 workshop
  { x: 615, y: 400 }, // 6 forge
  { x: 700, y: 290 }, // 7 watchtower
  { x: 780, y: 400 }, // 8 training
  { x: 855, y: 295 }, // 9 battle
  { x: 935, y: 165 }, // 10 throne
];

// =============================================================
// Icons (pixel-art landmarks)
// =============================================================
const ICONS = {
  village(g) {
    rect(g, -22, -2, 12, 14, "#7a5230");
    poly(g, "-23,-2 -9,-2 -16,-13", "#a04020");
    rect(g, -16, 5, 3, 7, "#3a2818");
    rect(g, -8, -8, 14, 20, "#7a5230");
    poly(g, "-9,-8 7,-8 -1,-19", "#a04020");
    rect(g, -3, -2, 4, 4, "#ffd23f");
    rect(g, -3, 5, 4, 7, "#3a2818");
    rect(g, 8, 0, 10, 12, "#7a5230");
    poly(g, "7,0 19,0 13,-9", "#a04020");
    rect(g, 11, 4, 3, 4, "#ffd23f");
  },
  library(g) {
    rect(g, -16, -22, 32, 26, "#c4a574");
    rect(g, -16, -22, 32, 4, "#8a6e44");
    poly(g, "-19,-22 19,-22 0,-32", "#5a3e2c");
    rect(g, -12, -16, 2, 16, "#9a7a4e");
    rect(g, -5, -16, 2, 16, "#9a7a4e");
    rect(g, 3, -16, 2, 16, "#9a7a4e");
    rect(g, 10, -16, 2, 16, "#9a7a4e");
    rect(g, -4, -8, 8, 12, "#3a2818");
    rect(g, -2, -28, 4, 4, "#ffd23f");
  },
  council(g) {
    rect(g, -16, -8, 32, 18, "#d0d0d8");
    rect(g, -16, -8, 32, 4, "#a8a0b8");
    rect(g, -2, -22, 4, 6, "#a8a0c0");
    rect(g, -8, -20, 16, 12, "#d0d0d8");
    poly(g, "-9,-20 9,-20 0,-26", "#a8a0c0");
    poly(g, "-1,-30 -3,-26 3,-26", "#ffd23f");
    rect(g, 0, -28, 2, 4, "#9a92ac");
    rect(g, -14, -4, 2, 14, "#a8a0a8");
    rect(g, 12, -4, 2, 14, "#a8a0a8");
    rect(g, -4, 0, 8, 10, "#3a2818");
  },
  tavern(g) {
    rect(g, -16, -10, 32, 22, "#7a4f2a");
    rect(g, -16, -10, 32, 5, "#5a3818");
    poly(g, "-19,-10 19,-10 0,-22", "#3a2818");
    rect(g, 10, -16, 8, 6, "#c4a574");
    rect(g, 13, -10, 2, 6, "#5a3818");
    rect(g, -4, -2, 8, 14, "#3a1818");
    rect(g, -12, -4, 4, 4, "#ffd23f");
    rect(g, 4, -4, 4, 4, "#ffd23f");
  },
  workshop(g) {
    rect(g, -14, -8, 28, 20, "#a47840");
    rect(g, -14, -8, 28, 4, "#8a6438");
    poly(g, "-17,-8 17,-8 0,-22", "#7a4a20");
    rect(g, 8, -22, 4, 8, "#5a3818");
    rect(g, 6, -28, 8, 6, "#888");
    rect(g, 7, -32, 6, 4, "#aaa");
    rect(g, -4, 0, 8, 12, "#3a2818");
    rect(g, -10, -2, 4, 4, "#ffd23f");
    rect(g, 6, -2, 4, 4, "#ffd23f");
  },
  forge(g) {
    rect(g, -20, -12, 40, 22, "#8a8a8a");
    rect(g, -20, -12, 40, 4, "#5a5a5a");
    poly(g, "-22,-12 22,-12 0,-26", "#5a5a5a");
    rect(g, 11, -28, 6, 12, "#5a5a5a");
    rect(g, 9, -34, 10, 6, "#cc6611");
    rect(g, 11, -38, 6, 4, "#ff8833");
    rect(g, -12, -2, 24, 12, "#3a1818");
    rect(g, -8, 0, 4, 8, "#ff5a1f");
    rect(g, -2, 2, 4, 6, "#ffd23f");
    rect(g, 4, 0, 4, 8, "#ff5a1f");
  },
  watchtower(g) {
    rect(g, -8, -28, 16, 38, "#8a8a98");
    rect(g, -10, -32, 20, 6, "#6a6a78");
    rect(g, -12, -34, 4, 4, "#5a5a68");
    rect(g, -6, -34, 4, 4, "#5a5a68");
    rect(g, 0, -34, 4, 4, "#5a5a68");
    rect(g, 6, -34, 4, 4, "#5a5a68");
    rect(g, -3, -16, 6, 8, "#3a2818");
    rect(g, 0, -42, 1, 8, "#5a5a68");
    poly(g, "1,-42 10,-39 1,-36", "#ff5470");
  },
  training(g) {
    rect(g, -22, -2, 3, 14, "#7a4f2a");
    rect(g, -14, -2, 3, 14, "#7a4f2a");
    rect(g, -6, -2, 3, 14, "#7a4f2a");
    rect(g, -24, 0, 22, 2, "#5a3818");
    rect(g, -24, 6, 22, 2, "#5a3818");
    rect(g, 7, -16, 3, 28, "#7a4f2a");
    circ(g, 14, -10, 9, "#c4a574");
    circ(g, 14, -10, 6, "#a84030");
    circ(g, 14, -10, 3, "#ffd23f");
    rect(g, -1, -12, 4, 1, "#aaaaaa");
    rect(g, 2, -13, 1, 3, "#aaaaaa");
  },
  battle(g) {
    rect(g, -1, -30, 2, 40, "#5a3818");
    poly(g, "-1,-30 -3,-32 1,-32", "#ffd23f");
    rect(g, 1, -28, 18, 14, "#a8243a");
    rect(g, 1, -28, 18, 3, "#7a1828");
    rect(g, 8, -24, 2, 9, "#dddddd");
    rect(g, 6, -19, 6, 1.5, "#dddddd");
    rect(g, -14, -4, 2, 14, "#aaaaaa");
    rect(g, -16, -6, 6, 2, "#aaaaaa");
    rect(g, -10, -2, 2, 12, "#aaaaaa");
    rect(g, -12, -4, 6, 2, "#aaaaaa");
  },
  throne(g) {
    rect(g, -22, -8, 44, 20, "#d0a058");
    rect(g, -22, -8, 44, 4, "#8a6038");
    rect(g, -22, 8, 44, 4, "#8a6038");
    rect(g, -22, -22, 8, 14, "#d0a058");
    rect(g, 14, -22, 8, 14, "#d0a058");
    rect(g, -22, -26, 4, 4, "#d0a058");
    rect(g, -16, -26, 4, 4, "#d0a058");
    rect(g, 14, -26, 4, 4, "#d0a058");
    rect(g, 20, -26, 4, 4, "#d0a058");
    rect(g, -4, -22, 8, 12, "#d0a058");
    poly(g, "-7,-22 7,-22 0,-34", "#a8243a");
    rect(g, -1, -38, 2, 4, "#a8243a");
    poly(g, "0,-40 -4,-38 4,-38", "#ffd23f");
    rect(g, -4, 0, 8, 12, "#3a1818");
    poly(g, "-4,0 4,0 0,-4", "#3a1818");
    rect(g, -19, 4, 3, 4, "#ffd23f");
    rect(g, 16, 4, 3, 4, "#ffd23f");
  },
};

// =============================================================
// World map: tiled background, terrain, path, landmarks, hero
// =============================================================
function buildBackground(svg) {
  // Sky gradient defs
  const defs = svgEl("defs");
  defs.innerHTML = `
    <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6db95f"/>
      <stop offset="1" stop-color="#4a9046"/>
    </linearGradient>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1a2a55"/>
      <stop offset="1" stop-color="#3a4d8a"/>
    </linearGradient>
  `;
  svg.appendChild(defs);

  // Sky band (top fifth)
  const sky = svgEl("rect", { x: 0, y: 0, width: 1000, height: 120, fill: "url(#skyGrad)" });
  svg.appendChild(sky);

  // Grass base
  const grass = svgEl("rect", { x: 0, y: 120, width: 1000, height: 480, fill: "url(#grassGrad)" });
  svg.appendChild(grass);

  // Subtle grass texture (deterministic)
  const tx = svgEl("g", { opacity: "0.55" });
  const seedRows = 18, seedCols = 28;
  for (let r = 0; r < seedRows; r++) {
    for (let c = 0; c < seedCols; c++) {
      const hash = (r * 31 + c * 17) % 11;
      if (hash < 3) {
        const x = c * 36 + (r % 2) * 18;
        const y = 130 + r * 26;
        if (y > 580) continue;
        const sz = 4 + (hash % 3) * 2;
        tx.appendChild(svgEl("rect", { x, y, width: sz, height: sz, fill: "#3d7a36" }));
      }
    }
  }
  svg.appendChild(tx);

  // Lake (decorative — between forest and forge area, low-mid)
  svg.appendChild(svgEl("ellipse", { cx: 380, cy: 555, rx: 95, ry: 14, fill: "#2d68b0" }));
  svg.appendChild(svgEl("ellipse", { cx: 380, cy: 553, rx: 80, ry: 9, fill: "#4a90e2" }));
  svg.appendChild(svgEl("ellipse", { cx: 360, cy: 552, rx: 18, ry: 2, fill: "#79c2f2" }));

  // Forest cluster — lower-left
  drawForest(svg, 30, 540);
  drawForest(svg, 65, 565);
  drawForest(svg, 130, 570);
  drawForest(svg, 250, 565);
  drawForest(svg, 565, 555);
  drawForest(svg, 600, 568);

  // Mountains in upper-right (where the throne rises)
  drawMountains(svg);

  // Faint clouds
  drawCloud(svg, 130, 60);
  drawCloud(svg, 480, 40);
  drawCloud(svg, 760, 80);
}

function drawForest(svg, cx, cy) {
  const g = svgEl("g", { transform: `translate(${cx} ${cy})` });
  // trunk
  rect(g, -2, -2, 4, 6, "#5a3818");
  // canopy (3-step pyramid)
  poly(g, "-12,-2 12,-2 0,-12", "#2a5723");
  poly(g, "-10,-8 10,-8 0,-18", "#3d7a36");
  poly(g, "-7,-14 7,-14 0,-22", "#4a9d4a");
  svg.appendChild(g);
}

function drawMountains(svg) {
  // Layered peaks rising to upper-right corner
  const peaks = [
    { points: "560,400 660,200 760,380", cls: "#6b5d8a" },
    { points: "640,380 760,140 880,360", cls: "#463d5e" },
    { points: "780,360 880,80 1000,340", cls: "#6b5d8a" },
    { points: "880,260 940,30 1000,240", cls: "#463d5e" },
  ];
  peaks.forEach((p) => {
    svg.appendChild(svgEl("polygon", { points: p.points, fill: p.cls }));
  });
  // Snow caps
  const snow = ["878,90 940,30 962,90", "744,160 760,140 778,170", "656,210 660,200 678,222"];
  snow.forEach((s) => svg.appendChild(svgEl("polygon", { points: s, fill: "#ffffff" })));

  // Sun behind mountains
  svg.appendChild(svgEl("circle", { cx: 870, cy: 70, r: 22, fill: "#ffd23f", opacity: "0.85" }));
  svg.appendChild(svgEl("circle", { cx: 870, cy: 70, r: 30, fill: "#ffd23f", opacity: "0.35" }));
}

function drawCloud(svg, cx, cy) {
  const g = svgEl("g", { transform: `translate(${cx} ${cy})`, opacity: "0.85" });
  rect(g, -16, -4, 32, 8, "#e8e8f0");
  rect(g, -10, -10, 22, 8, "#e8e8f0");
  rect(g, -4, -14, 14, 6, "#f8f8ff");
  svg.appendChild(g);
}

function buildPath(svg, programme) {
  // Smooth bezier path through all node positions
  const fullD = pathD(NODE_POSITIONS);
  const base = svgEl("path", { d: fullD });
  base.setAttribute("class", "q-path");
  svg.appendChild(base);

  // Done overlay covers the travelled stretch: the contiguous run of
  // completed checkpoints from the start (saves from before gating may
  // have gaps, so don't assume totalDone is a prefix).
  let prefix = 0;
  while (
    prefix < template.nodes.length &&
    programme.stepData[template.nodes[prefix].id].done
  ) prefix++;

  if (prefix >= 2) {
    const partial = NODE_POSITIONS.slice(0, prefix);
    const done = svgEl("path", { d: pathD(partial) });
    done.setAttribute("class", "q-path-done");
    svg.appendChild(done);
  }
}

function pathD(points) {
  if (!points.length) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const cx = (p0.x + p1.x) / 2;
    d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

function buildLandmarks(svg, programme) {
  template.nodes.forEach((node, i) => {
    const pos = NODE_POSITIONS[i];
    const data = programme.stepData[node.id];
    const locked = !data.done && isLocked(programme, i);

    const g = svgEl("g", { transform: `translate(${pos.x} ${pos.y})` });
    g.setAttribute("class",
      "q-node" +
      (data.done ? " done" : "") +
      (i === activeStepIndex ? " current" : "") +
      (node.boss ? " boss" : "") +
      (locked ? " locked" : "")
    );
    g.addEventListener("click", () => openCard(i));

    // Boss label (above stage)
    if (node.boss) {
      const bossL = svgEl("text", { y: -66, "class": "q-boss-label" });
      bossL.textContent = "★ BOSS ★";
      g.appendChild(bossL);
    }

    // Stage label above
    const stage = svgEl("text", { y: -52, "class": "q-node-stage" });
    stage.textContent = node.stage.toUpperCase();
    g.appendChild(stage);

    // Landmark icon group
    const iconG = svgEl("g", { transform: "translate(0 -8)" });
    if (ICONS[node.icon]) ICONS[node.icon](iconG);
    g.appendChild(iconG);

    // Glow ring (animated when current)
    g.appendChild(svgEl("circle", { class: "q-glow", cx: 0, cy: -6, r: 30 }));

    // Node tile (numbered chip below the landmark)
    const tile = svgEl("rect", {
      x: -16, y: 22, width: 32, height: 16, rx: 2,
    });
    tile.setAttribute("class", "q-node-tile");
    g.appendChild(tile);

    const num = svgEl("text", { x: 0, y: 30, "class": "q-node-num" });
    num.textContent = data.done ? `${i + 1} ✓` : locked ? "🔒" : `${i + 1}`;
    g.appendChild(num);

    // Node label below
    const label = svgEl("text", { y: 54, "class": "q-node-label" });
    label.textContent = node.label.toUpperCase();
    g.appendChild(label);

    svg.appendChild(g);
  });
}

function buildHero(svg, programme) {
  const idx = firstIncompleteIndex(programme);
  const allDone = totalDone(programme) === template.nodes.length;
  const targetIdx = allDone ? template.nodes.length - 1 : idx;
  const pos = NODE_POSITIONS[targetIdx];
  const target = { x: pos.x + 22, y: pos.y - 4 };

  const klass = programme.heroClass || "warrior";
  const start = lastHeroPos || target;

  const g = svgEl("g", { id: "heroSprite" });
  g.setAttribute("class", "hero-sprite");
  g.style.transform = `translate(${start.x}px, ${start.y}px)`;
  g.style.transition = "none";

  const bob = svgEl("g", {});
  bob.setAttribute("class", "hero-sprite-bob");
  (HERO_DRAWERS[klass] || HERO_DRAWERS.warrior)(bob);
  g.appendChild(bob);

  svg.appendChild(g);

  if (start.x !== target.x || start.y !== target.y) {
    requestAnimationFrame(() => {
      g.style.transition = "transform 0.9s cubic-bezier(0.5, 0, 0.5, 1)";
      g.style.transform = `translate(${target.x}px, ${target.y}px)`;
    });
  }

  lastHeroPos = target;
}

// =============================================================
// Map render
// =============================================================
function renderMap() {
  const svg = document.getElementById("worldMap");
  svg.innerHTML = "";
  const p = getActive();
  if (!p) return;

  buildBackground(svg);
  buildPath(svg, p);
  buildLandmarks(svg, p);
  buildHero(svg, p);
}

// =============================================================
// HUD
// =============================================================
function renderHUD() {
  const p = getActive();
  if (!p) return;

  document.getElementById("hudQuestName").textContent = p.name;

  const xp = calculateXP(p);
  const lvl = levelFor(xp);
  const xpInLevel = xp % XP_PER_LEVEL;
  const xpPct = (xpInLevel / XP_PER_LEVEL) * 100;

  document.getElementById("lvlVal").textContent = lvl;
  document.getElementById("xpFill").style.width = `${xpPct}%`;
  document.getElementById("xpText").textContent = `${xp} XP · ${xpInLevel}/${XP_PER_LEVEL}`;
  document.getElementById("dayCount").textContent = daysSince(p.createdAt);

  document.getElementById("soundToggle").textContent = soundOn ? "🔊 SFX" : "🔇 SFX";
}

// =============================================================
// Quest log dialog
// =============================================================
function openCard(index) {
  const p = getActive();
  if (!p) return;
  const node = template.nodes[index];
  const data = p.stepData[node.id];

  // Boss intro: dramatic banner before first encounter this session
  if (node.boss && !data.done && !_bossShownThisSession.has(node.id)) {
    _bossShownThisSession.add(node.id);
    showBossBanner(node.title, node.stage.toUpperCase() + " · CHALLENGER APPROACHING");
    setTimeout(() => actuallyOpenCard(index), 1300);
    return;
  }
  actuallyOpenCard(index);
}

function actuallyOpenCard(index) {
  const p = getActive();
  if (!p) return;
  activeStepIndex = index;
  const node = template.nodes[index];
  const data = p.stepData[node.id];
  const locked = !data.done && isLocked(p, index);

  document.getElementById("qlStage").textContent =
    `STEP ${index + 1}/${template.nodes.length} · ${node.stage.toUpperCase()}` +
    (locked ? " · 🔒 LOCKED" : "");
  document.getElementById("qlTitle").textContent = node.title;
  document.getElementById("qlSummary").textContent = node.summary;
  document.getElementById("qlOutput").textContent = node.output;

  const qList = document.getElementById("qlQuestions");
  qList.innerHTML = "";
  node.questions.forEach((q) => {
    const li = document.createElement("li");
    li.textContent = q;
    qList.appendChild(li);
  });

  const mList = document.getElementById("qlMinimum");
  mList.innerHTML = "";
  node.minimum.forEach((item, i) => {
    const li = document.createElement("li");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = `min_${node.id}_${i}`;
    cb.checked = !!data.minimumChecks[i];
    cb.addEventListener("change", () => {
      data.minimumChecks[i] = cb.checked;
      touchActive();
      renderHUD();
      checkAchievements();
      refreshCompleteBtn(index);
      // Last proof collected: chime + pulse the complete button
      if (cb.checked && data.minimumChecks.every(Boolean) && !data.done) sfxReady();
      else sfxClick();
    });
    const label = document.createElement("label");
    label.setAttribute("for", cb.id);
    label.textContent = item;
    li.appendChild(cb);
    li.appendChild(label);
    mList.appendChild(li);
  });

  const notes = document.getElementById("qlNotes");
  notes.value = data.notes || "";
  notes.oninput = () => {
    data.notes = notes.value;
    touchActive();
    renderHUD();
    checkAchievements();
  };

  refreshCompleteBtn(index);

  renderMap(); // update current-node highlight

  const log = document.getElementById("questLog");
  log.classList.remove("hidden");
  log.setAttribute("aria-hidden", "false");
  sfxClick();
}

function refreshCompleteBtn(index) {
  const p = getActive();
  if (!p) return;
  const data = p.stepData[template.nodes[index].id];
  const btn = document.getElementById("qlComplete");
  btn.classList.remove("ready");

  if (data.done) {
    btn.textContent = "✓ COMPLETE — UNDO";
    return;
  }
  const gate = completionGate(p, index);
  if (gate) {
    btn.textContent = gate.btnLabel;
  } else {
    btn.textContent = "✓ COMPLETE QUEST";
    btn.classList.add("ready");
  }
}

function dialogDeny(msg) {
  const frame = document.querySelector("#questLog .ql-frame");
  if (frame) {
    frame.classList.remove("denied");
    void frame.offsetWidth;
    frame.classList.add("denied");
  }
  const toast = document.getElementById("qlToast");
  if (toast) {
    toast.textContent = msg;
    toast.classList.remove("hidden");
    clearTimeout(dialogDeny._t);
    dialogDeny._t = setTimeout(() => toast.classList.add("hidden"), 2400);
  }
  sfxDenied();
}

function closeCard() {
  const log = document.getElementById("questLog");
  log.classList.add("hidden");
  log.setAttribute("aria-hidden", "true");
  // Move the map's current-step glow to where the journey actually is
  const p = getActive();
  if (p) {
    const next = firstIncompleteIndex(p);
    if (next !== activeStepIndex) {
      activeStepIndex = next;
      renderMap();
    }
  }
}

function toggleComplete() {
  const p = getActive();
  if (!p) return;
  const node = template.nodes[activeStepIndex];
  const data = p.stepData[node.id];
  const wasComplete = data.done;

  // The stops: previous checkpoint must be done, and all proof collected
  if (!wasComplete) {
    const gate = completionGate(p, activeStepIndex);
    if (gate) {
      dialogDeny(gate.denyMsg);
      return;
    }
  }

  const lvlBefore = levelFor(calculateXP(p));
  data.done = !data.done;
  data.completedAt = data.done ? new Date().toISOString() : null;

  touchActive();
  refreshCompleteBtn(activeStepIndex);

  if (data.done && !wasComplete) {
    sfxComplete();
    fireParticlesAtNode(activeStepIndex);
    fireXpPopupAtNode(activeStepIndex, xpGainedFor(node, data));
    const lvlAfter = levelFor(calculateXP(p));
    if (lvlAfter > lvlBefore) {
      setTimeout(() => fireLevelUp(lvlAfter), 600);
    }
    // activeStepIndex stays on the completed step while the dialog is open,
    // so UNDO and PREV/NEXT act on the step the user is looking at; the
    // map highlight advances when the dialog closes.
    if (totalDone(p) === template.nodes.length) {
      setTimeout(showVictory, 800);
    }
  } else {
    sfxClick();
  }

  renderMap();
  renderHUD();
  renderParty();
  renderSaveSlots();
  checkAchievements();
}

function nextCard() {
  activeStepIndex = (activeStepIndex + 1) % template.nodes.length;
  openCard(activeStepIndex);
}

function prevCard() {
  activeStepIndex = (activeStepIndex - 1 + template.nodes.length) % template.nodes.length;
  openCard(activeStepIndex);
}

// =============================================================
// Particles & SFX
// =============================================================
function getNodeScreenPos(index) {
  const svg = document.getElementById("worldMap");
  const ctm = svg.getScreenCTM();
  const pos = NODE_POSITIONS[index];
  const pt = svg.createSVGPoint();
  pt.x = pos.x;
  pt.y = pos.y - 10;
  const screen = pt.matrixTransform(ctm);
  return { x: screen.x, y: screen.y };
}

function fireParticlesAtNode(index) {
  const { x, y } = getNodeScreenPos(index);
  spawnParticles(x, y, 16);
}

function fireXpPopupAtNode(index, amount) {
  const { x, y } = getNodeScreenPos(index);
  spawnXpPopup(x, y - 10, `+${amount} XP`);
  // Brief screen shake
  const root = document.body;
  root.classList.remove("screen-shake");
  void root.offsetWidth;
  root.classList.add("screen-shake");
  setTimeout(() => root.classList.remove("screen-shake"), 400);
}

function fireLevelUp(lvl) {
  const layer = document.getElementById("particles");
  const p = document.createElement("div");
  p.className = "level-popup";
  p.textContent = `★ LEVEL UP! LV ${lvl} ★`;
  layer.appendChild(p);
  setTimeout(() => p.remove(), 2200);
  spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 20);
  sfxLevelUp();
}

function spawnParticles(x, y, count = 12) {
  const layer = document.getElementById("particles");
  const glyphs = ["★", "✦", "◆", "✧", "✶"];
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.textContent = glyphs[i % glyphs.length];
    p.style.left = x + "px";
    p.style.top = y + "px";
    const angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.4;
    const distance = 80 + Math.random() * 80;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 30;
    const tr = (Math.random() - 0.5) * 720;
    p.style.setProperty("--tx", tx + "px");
    p.style.setProperty("--ty", ty + "px");
    p.style.setProperty("--tr", tr + "deg");
    layer.appendChild(p);
    setTimeout(() => p.remove(), 1300);
  }
}

function spawnXpPopup(x, y, text) {
  const layer = document.getElementById("particles");
  const p = document.createElement("div");
  p.className = "xp-popup";
  p.textContent = text;
  p.style.left = x + "px";
  p.style.top = y + "px";
  layer.appendChild(p);
  setTimeout(() => p.remove(), 1500);
}

function showToast(msg) {
  const t = document.getElementById("mapToast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.add("hidden"), 2400);
}

// ---- Audio (Web Audio synth) ----
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (_) { audioCtx = null; }
  }
}
function beep(freq, dur = 0.1, type = "square", vol = 0.06) {
  if (!soundOn) return;
  ensureAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(vol, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.start(now);
  osc.stop(now + dur);
}
function sfxClick() { beep(660, 0.04, "square", 0.04); }
function sfxComplete() {
  beep(523, 0.09);
  setTimeout(() => beep(659, 0.09), 90);
  setTimeout(() => beep(784, 0.14), 180);
  setTimeout(() => beep(1047, 0.18), 290);
}
function sfxVictory() {
  const n = [523, 659, 784, 1047, 784, 1047, 1318];
  n.forEach((f, i) => setTimeout(() => beep(f, 0.22), i * 130));
}
function sfxOpen() { beep(440, 0.05, "triangle", 0.05); }
function sfxDenied() {
  beep(160, 0.12, "sawtooth", 0.06);
  setTimeout(() => beep(120, 0.18, "sawtooth", 0.06), 110);
}
function sfxReady() {
  beep(784, 0.08, "square", 0.05);
  setTimeout(() => beep(1047, 0.12, "square", 0.05), 90);
}

// =============================================================
// Save slots & party
// =============================================================
function renderSaveSlots() {
  const wrap = document.getElementById("saveSlots");
  wrap.innerHTML = "";
  if (state.programmes.length === 0) {
    const empty = document.createElement("p");
    empty.className = "frame-help";
    empty.textContent = "No quests yet. Begin a new one below.";
    wrap.appendChild(empty);
    return;
  }
  state.programmes
    .slice()
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
    .forEach((p) => {
      ensureStepShape(p);
      const total = template.nodes.length;
      const done = totalDone(p);
      const xp = calculateXP(p);
      const lvl = levelFor(xp);

      const btn = document.createElement("button");
      btn.className = "save-slot";
      btn.innerHTML = `
        <div>
          <div class="save-slot-name">${escapeHtml(p.name)}</div>
          <div class="save-slot-meta">DAY ${daysSince(p.createdAt)} · ${done}/${total} CHECKPOINTS</div>
        </div>
        <div class="save-slot-meta">LV ${lvl}</div>
      `;
      btn.addEventListener("click", () => {
        setActive(p.id);
        showScreen("gameView");
      });
      wrap.appendChild(btn);
    });
}

function renderParty() {
  const list = document.getElementById("partyList");
  list.innerHTML = "";
  state.programmes.forEach((p) => {
    const total = template.nodes.length;
    const done = totalDone(p);
    const chip = document.createElement("button");
    chip.className = "party-chip" + (p.id === state.activeProgrammeId ? " active" : "");
    chip.innerHTML = `
      <span>${escapeHtml(truncate(p.name, 18))}</span>
      <span class="party-chip-meta">${done}/${total}</span>
    `;
    chip.addEventListener("click", () => {
      setActive(p.id);
      renderAll();
      sfxClick();
    });
    list.appendChild(chip);
  });
}

function truncate(s, n) {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// =============================================================
// Victory
// =============================================================
function showVictory() {
  const p = getActive();
  if (!p) return;
  const totalChecks = template.nodes.reduce((sum, n) => sum + n.minimum.length, 0);
  const checked = template.nodes.reduce(
    (sum, n) => sum + p.stepData[n.id].minimumChecks.filter(Boolean).length, 0
  );
  const noted = template.nodes.filter((n) => p.stepData[n.id].notes?.trim()).length;
  const days = daysSince(p.createdAt);
  const xp = calculateXP(p);

  const stats = document.getElementById("victoryStats");
  stats.innerHTML = `
    <div class="stat-chip">DAYS · ${days}</div>
    <div class="stat-chip">XP · ${xp}</div>
    <div class="stat-chip">PROOF · ${checked}/${totalChecks}</div>
    <div class="stat-chip">JOURNAL · ${noted}/${template.nodes.length}</div>
  `;
  document.getElementById("victory").classList.remove("hidden");
  // Burst of particles from center
  for (let i = 0; i < 4; i++) {
    setTimeout(() => spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 18), i * 200);
  }
  sfxVictory();
}

function hideVictory() {
  document.getElementById("victory").classList.add("hidden");
}

// =============================================================
// Markdown export
// =============================================================
function exportMarkdown() {
  const p = getActive();
  if (!p) return;
  const lines = [];
  lines.push(`# ${p.name}`);
  lines.push("");
  lines.push(`*Generated ${new Date().toLocaleDateString()} · created ${new Date(p.createdAt).toLocaleDateString()}*`);
  lines.push("");
  const total = template.nodes.length;
  const done = totalDone(p);
  const xp = calculateXP(p);
  lines.push(`**Progress:** ${done} of ${total} checkpoints · ${xp} XP · day ${daysSince(p.createdAt)}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  template.nodes.forEach((node, i) => {
    const d = p.stepData[node.id];
    lines.push(`## ${i + 1}. ${node.title}`);
    lines.push("");
    lines.push(`**Stage:** ${node.stage}`);
    const status = d.done
      ? `✓ Completed ${new Date(d.completedAt).toLocaleDateString()}`
      : "○ Not done";
    lines.push(`**Status:** ${status}`);
    lines.push("");
    lines.push(`> ${node.summary}`);
    lines.push("");
    lines.push("### Bare minimum");
    node.minimum.forEach((item, idx) => {
      lines.push(`- [${d.minimumChecks[idx] ? "x" : " "}] ${item}`);
    });
    lines.push("");
    lines.push("### Notes");
    lines.push(d.notes?.trim() ? d.notes.trim() : "_(none)_");
    lines.push("");
    lines.push(`**Output expected:** ${node.output}`);
    lines.push("");
    lines.push("---");
    lines.push("");
  });

  const md = lines.join("\n");
  const safe = p.name.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "quest";
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safe}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("QUEST LOG EXPORTED");
}

// =============================================================
// Screen flow
// =============================================================
function showScreen(name) {
  ["titleScreen", "saveSelect", "newQuestScreen", "gameView"].forEach((id) => {
    document.getElementById(id).classList.toggle("hidden", id !== name);
  });
  if (name === "saveSelect") renderSaveSlots();
  if (name === "gameView") {
    renderAll();
    maybeShowStartHint();
  }
  if (name === "newQuestScreen") {
    selectedHeroClass = "warrior";
    document.querySelectorAll(".class-option").forEach((b) => {
      b.classList.toggle("active", b.dataset.class === "warrior");
    });
    const inp = document.getElementById("newQuestInput");
    if (inp) inp.value = "";
  }
}

function renderAll() {
  renderHUD();
  renderMap();
  renderParty();
}

const _hintShownThisSession = new Set();
function maybeShowStartHint() {
  const p = getActive();
  if (!p || totalDone(p) > 0 || _hintShownThisSession.has(p.id)) return;
  _hintShownThisSession.add(p.id);
  setTimeout(() => showToast("⚔ CLICK THE VILLAGE TO BEGIN YOUR QUEST"), 600);
}

// =============================================================
// Wire-up
// =============================================================
async function init() {
  const response = await fetch("template.json");
  template = await response.json();

  state.programmes.forEach(ensureStepShape);

  // Migrations
  if (!state.unlockedAchievements) state.unlockedAchievements = {};
  state.programmes.forEach((p) => {
    if (!p.heroClass) p.heroClass = "warrior";
  });
  saveState();

  // Render class-picker preview sprites
  renderClassPicker();

  // Title screen
  document.getElementById("pressStartBtn").addEventListener("click", () => {
    sfxOpen();
    if (state.programmes.length === 0) showScreen("newQuestScreen");
    else showScreen("saveSelect");
  });

  // Save select
  document.getElementById("newQuestBtn").addEventListener("click", () => {
    document.getElementById("newQuestInput").value = "";
    showScreen("newQuestScreen");
    sfxClick();
  });
  document.getElementById("backToTitle").addEventListener("click", () => {
    showScreen("titleScreen");
    sfxClick();
  });

  // New quest
  document.getElementById("confirmNewQuest").addEventListener("click", confirmNewQuest);
  document.getElementById("newQuestInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") confirmNewQuest();
  });
  document.getElementById("cancelNewQuest").addEventListener("click", () => {
    if (state.programmes.length === 0) showScreen("titleScreen");
    else showScreen("saveSelect");
    sfxClick();
  });

  function confirmNewQuest() {
    const v = document.getElementById("newQuestInput").value;
    createProgramme(v, selectedHeroClass);
    activeStepIndex = 0;
    showScreen("gameView");
    sfxComplete();
    setTimeout(checkAchievements, 200);
  }

  // HUD: menu + sound
  document.getElementById("menuBtn").addEventListener("click", () => {
    document.getElementById("menuOverlay").classList.remove("hidden");
    sfxOpen();
  });
  document.getElementById("soundToggle").addEventListener("click", () => {
    soundOn = !soundOn;
    localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0");
    if (soundOn) ensureAudio();
    renderHUD();
    sfxClick();
  });

  // Menu actions
  document.getElementById("menuClose").addEventListener("click", () => {
    document.getElementById("menuOverlay").classList.add("hidden");
    sfxClick();
  });
  document.getElementById("menuTrophy").addEventListener("click", () => {
    document.getElementById("menuOverlay").classList.add("hidden");
    renderTrophyRoom();
    document.getElementById("trophyRoom").classList.remove("hidden");
    sfxOpen();
  });
  document.getElementById("trophyClose").addEventListener("click", () => {
    document.getElementById("trophyRoom").classList.add("hidden");
    sfxClick();
  });
  document.getElementById("menuExport").addEventListener("click", () => {
    exportMarkdown();
    document.getElementById("menuOverlay").classList.add("hidden");
  });
  document.getElementById("menuRename").addEventListener("click", () => {
    const a = getActive();
    if (!a) return;
    const v = prompt("Rename quest:", a.name);
    if (v === null) return;
    a.name = v.trim().toUpperCase() || a.name;
    touchActive();
    document.getElementById("menuOverlay").classList.add("hidden");
    renderAll();
  });
  document.getElementById("menuSwitch").addEventListener("click", () => {
    document.getElementById("menuOverlay").classList.add("hidden");
    showScreen("saveSelect");
    sfxClick();
  });
  document.getElementById("menuDelete").addEventListener("click", () => {
    const a = getActive();
    if (!a) return;
    if (!confirm(`Abandon "${a.name}"? This cannot be undone.`)) return;
    deleteActive();
    document.getElementById("menuOverlay").classList.add("hidden");
    if (state.programmes.length === 0) showScreen("titleScreen");
    else showScreen("saveSelect");
  });

  // Quest log
  document.getElementById("qlClose").addEventListener("click", () => { closeCard(); sfxClick(); });
  document.getElementById("qlComplete").addEventListener("click", toggleComplete);
  document.getElementById("qlNext").addEventListener("click", nextCard);
  document.getElementById("qlPrev").addEventListener("click", prevCard);

  // Victory
  document.getElementById("victoryClose").addEventListener("click", () => { hideVictory(); sfxClick(); });
  document.getElementById("victoryExport").addEventListener("click", () => { exportMarkdown(); });

  // Keyboard
  document.addEventListener("keydown", (e) => {
    const logOpen = !document.getElementById("questLog").classList.contains("hidden");
    if (logOpen) {
      if (e.key === "Escape") { closeCard(); sfxClick(); }
      if (e.key === "ArrowRight" && document.activeElement?.tagName !== "TEXTAREA") nextCard();
      if (e.key === "ArrowLeft" && document.activeElement?.tagName !== "TEXTAREA") prevCard();
      return;
    }
    // PRESS START with Enter/Space, like a real title screen
    const titleVisible = !document.getElementById("titleScreen").classList.contains("hidden");
    if (titleVisible && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      document.getElementById("pressStartBtn").click();
    }
  });

  // Window resize re-renders map (so node positions for particles stay accurate)
  let resizeT;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      if (!document.getElementById("gameView").classList.contains("hidden")) renderMap();
    }, 150);
  });

  // Initial screen — always boot to the title, like a real game
  if (state.activeProgrammeId && getActive()) {
    activeStepIndex = firstIncompleteIndex(getActive());
  }
  showScreen("titleScreen");
}

// init() is invoked at the very end of this file, after every const it
// depends on (HERO_DRAWERS, ACHIEVEMENTS) has been initialised.

// =============================================================
// HERO CLASS SPRITES
// =============================================================
function drawWarrior(g) {
  // Helm
  rect(g, -5, -18, 10, 4, "#8a3a3a");
  poly(g, "-6,-18 6,-18 0,-23", "#a04020");
  rect(g, -1, -25, 2, 3, "#ff5470"); // plume
  // Visor slit
  rect(g, -3, -16, 6, 1.5, "#3a1818");
  // Head
  rect(g, -4, -14, 8, 8, "#ffd4a3");
  // Body — red with chest plate
  rect(g, -5, -6, 10, 8, "#a04020");
  rect(g, -3, -5, 6, 1.5, "#ffd23f"); // chest stripe
  rect(g, -7, -4, 2, 8, "#7a1828"); // cape
  // Arms
  rect(g, -7, -5, 2, 6, "#ffd4a3");
  rect(g, 5, -5, 2, 6, "#ffd4a3");
  // Legs
  rect(g, -4, 2, 3, 6, "#3a2818");
  rect(g, 1, 2, 3, 6, "#3a2818");
  // Sword
  rect(g, 7, -10, 2, 12, "#dddddd");
  rect(g, 6, 1, 4, 2, "#a04020");
  rect(g, 7, 3, 2, 4, "#5a3818");
  // Shield
  rect(g, -10, -3, 4, 7, "#5a3a8a");
  rect(g, -9, -1, 2, 3, "#ffd23f");
}

function drawMage(g) {
  // Pointy hat
  poly(g, "-7,-12 7,-12 0,-26", "#3a2a5a");
  rect(g, -1, -28, 2, 2, "#ffd23f"); // star tip
  rect(g, -7, -12, 14, 2, "#5a3a8a");
  rect(g, -3, -10, 6, 1, "#ffd23f"); // hat brim
  // Head
  rect(g, -4, -10, 8, 6, "#ffd4a3");
  // Beard
  rect(g, -3, -5, 6, 3, "#dddddd");
  rect(g, -2, -2, 4, 2, "#dddddd");
  // Robe
  rect(g, -6, -2, 12, 12, "#5a3a8a");
  rect(g, -7, 0, 14, 10, "#7a4aaa");
  // Stars on robe
  rect(g, -3, 2, 1.5, 1.5, "#ffd23f");
  rect(g, 2, 4, 1.5, 1.5, "#ffd23f");
  rect(g, 0, 7, 1.5, 1.5, "#ffd23f");
  // Sleeves
  rect(g, -8, 0, 2, 6, "#3a2a5a");
  rect(g, 6, 0, 2, 6, "#3a2a5a");
  // Staff
  rect(g, 8, -16, 2, 22, "#5a3818");
  circ(g, 9, -18, 4, "#79f7d2");
  circ(g, 9, -18, 2, "#ffffff");
}

function drawScout(g) {
  // Hood
  poly(g, "-7,-12 7,-12 0,-22", "#2a5723");
  rect(g, -6, -14, 12, 4, "#3d7a36");
  // Head
  rect(g, -4, -12, 8, 8, "#ffd4a3");
  // Mask band
  rect(g, -4, -10, 8, 2, "#2a5723");
  // Body — leather/green
  rect(g, -5, -4, 10, 8, "#5a8a3a");
  rect(g, -5, -1, 10, 2, "#3d7a36");
  rect(g, -1, -1, 2, 2, "#ffd23f"); // buckle
  // Cloak edges
  rect(g, -6, -3, 1.5, 9, "#3d7a36");
  rect(g, 4.5, -3, 1.5, 9, "#3d7a36");
  // Arms
  rect(g, -7, -3, 2, 6, "#ffd4a3");
  rect(g, 5, -3, 2, 6, "#ffd4a3");
  // Legs
  rect(g, -4, 4, 3, 6, "#3a2818");
  rect(g, 1, 4, 3, 6, "#3a2818");
  // Bow
  poly(g, "8,-10 8,4 11,-3", "#5a3818");
  rect(g, 11, -8, 1, 10, "#dddddd");
  // Quiver
  rect(g, -10, -8, 3, 8, "#5a3818");
  rect(g, -10, -11, 1, 4, "#dddddd");
  rect(g, -8, -11, 1, 4, "#dddddd");
}

const HERO_DRAWERS = {
  warrior: drawWarrior,
  mage: drawMage,
  scout: drawScout,
};

function renderClassPicker() {
  const slots = { warrior: "csW", mage: "csM", scout: "csS" };
  Object.entries(slots).forEach(([cls, id]) => {
    const g = document.getElementById(id);
    if (g) {
      g.innerHTML = "";
      HERO_DRAWERS[cls](g);
    }
  });
  document.querySelectorAll(".class-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".class-option").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedHeroClass = btn.dataset.class;
      sfxClick();
    });
  });
}

// =============================================================
// BOSS BANNER
// =============================================================
function showBossBanner(title, sub) {
  const banner = document.getElementById("bossBanner");
  document.getElementById("bossName").textContent = (title || "").toUpperCase();
  document.getElementById("bossSub").textContent = sub || "PREPARE TO ENGAGE";
  banner.classList.remove("hidden");
  void banner.offsetWidth; // restart animation
  sfxBoss();
  setTimeout(() => banner.classList.add("hidden"), 1700);
}

function sfxBoss() {
  beep(220, 0.18, "sawtooth", 0.07);
  setTimeout(() => beep(196, 0.22, "sawtooth", 0.07), 180);
  setTimeout(() => beep(165, 0.30, "sawtooth", 0.07), 380);
}

function sfxLevelUp() {
  const n = [659, 784, 988, 1319];
  n.forEach((f, i) => setTimeout(() => beep(f, 0.14, "square", 0.06), i * 90));
}

// =============================================================
// ACHIEVEMENTS
// =============================================================
const ACHIEVEMENTS = [
  {
    id: "first_steps", icon: "🏁", name: "FIRST STEPS",
    desc: "Complete your first checkpoint.",
    check: (s, t) => s.programmes.some((p) => t.nodes.some((n) => p.stepData[n.id].done)),
  },
  {
    id: "halfway", icon: "⚔", name: "HALFWAY",
    desc: "Complete five checkpoints in one quest.",
    check: (s, t) => s.programmes.some((p) => t.nodes.filter((n) => p.stepData[n.id].done).length >= 5),
  },
  {
    id: "quest_master", icon: "👑", name: "QUEST MASTER",
    desc: "Complete every checkpoint in one quest.",
    check: (s, t) => s.programmes.some((p) => t.nodes.every((n) => p.stepData[n.id].done)),
  },
  {
    id: "speedrunner", icon: "⚡", name: "SPEEDRUNNER",
    desc: "Finish a full quest within 14 days of starting.",
    check: (s, t) => s.programmes.some((p) => {
      if (!t.nodes.every((n) => p.stepData[n.id].done)) return false;
      return (Date.now() - new Date(p.createdAt).getTime()) / 86400000 <= 14;
    }),
  },
  {
    id: "scribe", icon: "📜", name: "SCRIBE",
    desc: "Write notes on every checkpoint of one quest.",
    check: (s, t) => s.programmes.some((p) => t.nodes.every((n) => (p.stepData[n.id].notes || "").trim().length > 0)),
  },
  {
    id: "perfectionist", icon: "✓", name: "PERFECTIONIST",
    desc: "Tick every PROOF box across one full quest.",
    check: (s, t) => s.programmes.some((p) =>
      t.nodes.every((n) => p.stepData[n.id].minimumChecks.every(Boolean))
    ),
  },
  {
    id: "three_heroes", icon: "🎭", name: "THREE HEROES",
    desc: "Have three active quests at once.",
    check: (s) => s.programmes.length >= 3,
  },
  {
    id: "boss_slayer", icon: "🛡", name: "BOSS SLAYER",
    desc: "Defeat both bosses (Triage + Risk) in one quest.",
    check: (s) => s.programmes.some((p) => p.stepData["triage"]?.done && p.stepData["risk"]?.done),
  },
];

function checkAchievements() {
  if (!template || !state.unlockedAchievements) return;
  const newly = [];
  ACHIEVEMENTS.forEach((a) => {
    if (state.unlockedAchievements[a.id]) return;
    try {
      if (a.check(state, template)) {
        state.unlockedAchievements[a.id] = { unlockedAt: new Date().toISOString() };
        newly.push(a);
      }
    } catch (_) {}
  });
  if (newly.length > 0) saveState();
  newly.forEach((a, i) => setTimeout(() => fireAchievementToast(a), i * 700));
}

function fireAchievementToast(a) {
  const wrap = document.getElementById("achievementToasts");
  if (!wrap) return;
  const toast = document.createElement("div");
  toast.className = "achievement-toast";
  toast.innerHTML = `
    <span class="ach-icon">${a.icon}</span>
    <div class="ach-text">
      <span class="ach-label">★ ACHIEVEMENT UNLOCKED</span>
      <span class="ach-name">${escapeHtml(a.name)}</span>
      <span class="ach-desc">${escapeHtml(a.desc)}</span>
    </div>
  `;
  wrap.appendChild(toast);
  sfxLevelUp();
  setTimeout(() => toast.remove(), 5200);
}

// =============================================================
// TROPHY ROOM
// =============================================================
function renderTrophyRoom() {
  const grid = document.getElementById("trophyGrid");
  if (!grid) return;
  grid.innerHTML = "";
  ACHIEVEMENTS.forEach((a) => {
    const unlocked = !!state.unlockedAchievements[a.id];
    const card = document.createElement("div");
    card.className = "trophy-card" + (unlocked ? "" : " locked");
    card.innerHTML = `
      <span class="ach-icon">${a.icon}</span>
      <div class="ach-text">
        <span class="ach-name">${escapeHtml(a.name)}</span>
        <span class="ach-desc">${escapeHtml(unlocked ? a.desc : "??? · keep playing")}</span>
      </div>
    `;
    grid.appendChild(card);
  });
  const got = ACHIEVEMENTS.filter((a) => state.unlockedAchievements[a.id]).length;
  const totalAch = ACHIEVEMENTS.length;
  document.getElementById("trophyProgress").textContent = `${got} / ${totalAch} UNLOCKED`;
}

init();
