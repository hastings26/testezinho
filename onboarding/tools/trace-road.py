"""Trace the yellow road of the onboarding world map into an SVG path.

Usage:  python3 tools/trace-road.py [path/to/world-map.png]

Writes path.json (pathD + checkpoint fractions) and overlay.png (a visual check
of the traced route) next to wherever you run it. Paste pathD, the anchors and
the fractions into world-data.js.

Needs numpy + pillow. Re-run this whenever the map art changes; the coin
estimates in COINS below are eyeballed from the image and then snapped to the
widest point of the road nearby.
"""
import heapq, json, math
import numpy as np
from PIL import Image, ImageDraw

import sys
SRC = sys.argv[1] if len(sys.argv) > 1 else 'assets/world-map.png'
im = Image.open(SRC).convert('RGB')
a = np.asarray(im).astype(int)
H, W = a.shape[:2]
R, G, B = a[..., 0], a[..., 1], a[..., 2]
road = (R > 110) & (R >= G - 15) & (R - B > 50) & (G - B > 40)

# --- keep only road-ish blobs in the play area (drop title text / sign borders) ---
# distance transform: distance from each road pixel to nearest non-road pixel (chamfer)
INF = 1e9
D = np.where(road, INF, 0.0)
for y in range(H):
    for x in range(W):
        if D[y, x] == 0:
            continue
        best = D[y, x]
        if y > 0:
            best = min(best, D[y - 1, x] + 1)
            if x > 0: best = min(best, D[y - 1, x - 1] + 1.41421)
            if x < W - 1: best = min(best, D[y - 1, x + 1] + 1.41421)
        if x > 0: best = min(best, D[y, x - 1] + 1)
        D[y, x] = best
for y in range(H - 1, -1, -1):
    for x in range(W - 1, -1, -1):
        if D[y, x] == 0:
            continue
        best = D[y, x]
        if y < H - 1:
            best = min(best, D[y + 1, x] + 1)
            if x > 0: best = min(best, D[y + 1, x - 1] + 1.41421)
            if x < W - 1: best = min(best, D[y + 1, x + 1] + 1.41421)
        if x < W - 1: best = min(best, D[y, x + 1] + 1)
        D[y, x] = best

# np.save('dist.npy', D)  # uncomment to cache the distance transform

COINS = {
    'start': (160, 826),
    'w1': (263, 656),
    'w2': (578, 462),
    'w3': (917, 460),
    'w4': (612, 882),
    'w5': (1012, 884),
    'w6': (1268, 487),
}


def snap(p, r=26):
    """Snap a point to the widest bit of road nearby (road centre)."""
    x0, y0 = p
    best, bp = -1, (x0, y0)
    for y in range(max(0, y0 - r), min(H, y0 + r)):
        for x in range(max(0, x0 - r), min(W, x0 + r)):
            if D[y, x] > best:
                best, bp = D[y, x], (x, y)
    return bp, best


def astar(src, dst, allow_off_road=False, maxd=None):
    """Least-cost walk from src to dst preferring the middle of the road."""
    sx, sy = src; dx, dy = dst
    dist = {(sx, sy): 0.0}
    prev = {}
    pq = [(0.0, (sx, sy))]
    seen = set()
    while pq:
        c, cur = heapq.heappop(pq)
        if cur in seen:
            continue
        seen.add(cur)
        if cur == (dx, dy):
            break
        cx, cy = cur
        for ddy in (-1, 0, 1):
            for ddx in (-1, 0, 1):
                if ddx == 0 and ddy == 0:
                    continue
                nx, ny = cx + ddx, cy + ddy
                if not (0 <= nx < W and 0 <= ny < H):
                    continue
                d = D[ny, nx]
                step = 1.41421 if (ddx and ddy) else 1.0
                # prefer the centre line of the road; crossing a gap (bridge
                # shading, a dark outline) is allowed but expensive
                cost = step * (1.0 + 8.0 / (1.0 + d)) if d > 0 else step * 40.0
                nd = dist[cur] + cost
                if nd < dist.get((nx, ny), 1e18):
                    dist[(nx, ny)] = nd
                    prev[(nx, ny)] = cur
                    h = math.hypot(dx - nx, dy - ny) * 0.9
                    heapq.heappush(pq, (nd + h, (nx, ny)))
    if (dx, dy) not in prev and (dx, dy) != (sx, sy):
        raise RuntimeError(f'no route {src} -> {dst}')
    path = [(dx, dy)]
    while path[-1] != (sx, sy):
        path.append(prev[path[-1]])
    return path[::-1]


def resample(pts, spacing=6.0):
    out = [pts[0]]
    acc = 0.0
    for i in range(1, len(pts)):
        px, py = pts[i - 1]; cx, cy = pts[i]
        seg = math.hypot(cx - px, cy - py)
        acc += seg
        if acc >= spacing:
            out.append(pts[i]); acc = 0.0
    if out[-1] != pts[-1]:
        out.append(pts[-1])
    return out


def smooth(pts, passes=6, window=3):
    pts = [list(p) for p in pts]
    for _ in range(passes):
        new = [pts[0]]
        for i in range(1, len(pts) - 1):
            lo, hi = max(0, i - window), min(len(pts), i + window + 1)
            seg = pts[lo:hi]
            new.append([sum(p[0] for p in seg) / len(seg), sum(p[1] for p in seg) / len(seg)])
        new.append(pts[-1])
        pts = new
    return [(round(p[0], 1), round(p[1], 1)) for p in pts]


def rdp(pts, eps=1.6):
    if len(pts) < 3:
        return pts
    x0, y0 = pts[0]; x1, y1 = pts[-1]
    dx, dy = x1 - x0, y1 - y0
    n = math.hypot(dx, dy) or 1
    worst, idx = 0, 0
    for i in range(1, len(pts) - 1):
        px, py = pts[i]
        d = abs(dy * px - dx * py + x1 * y0 - y1 * x0) / n
        if d > worst:
            worst, idx = d, i
    if worst <= eps:
        return [pts[0], pts[-1]]
    return rdp(pts[:idx + 1], eps)[:-1] + rdp(pts[idx:], eps)


# ---- checkpoint anchors, snapped to the road centre --------------------------
anchors = {}
for k, p in COINS.items():
    sp, d = snap(p)
    anchors[k] = sp
    print(k, 'estimate', p, '-> snapped', sp, 'half-width', round(d, 1))

# ---- on-road segments --------------------------------------------------------
ROAD_SEGMENTS = [('start', 'w1'), ('w1', 'w2'), ('w2', 'w3'), ('w4', 'w5'), ('w5', 'w6')]
segs = {}
for s, e in ROAD_SEGMENTS:
    raw = astar(anchors[s], anchors[e])
    segs[(s, e)] = smooth(resample(raw, 7.0))
    print(f'{s}->{e}: {len(raw)}px -> {len(segs[(s,e)])} pts')

# ---- the one off-road leg: World 3 back west, then south to the Marketplace ---
# Hand-authored, follows the drawn road west then cuts down the open grass on the
# Marketplace island (there is no drawn road between World 3 and World 4).
back_west = astar(anchors['w3'], (628, 470))
overland = [(628, 470), (610, 512), (585, 556), (548, 600), (512, 650),
            (487, 706), (478, 764), (498, 818), (540, 858), (578, 878)]
segs[('w3', 'w4')] = smooth(resample(back_west, 7.0)) + overland + [anchors['w4']]

ORDER = [('start', 'w1'), ('w1', 'w2'), ('w2', 'w3'), ('w3', 'w4'), ('w4', 'w5'), ('w5', 'w6')]
full = []
marks = {'start': 0}
for s, e in ORDER:
    pts = segs[(s, e)]
    if full:
        pts = pts[1:]
    full.extend(pts)
    marks[e] = len(full) - 1

full = [(round(x, 1), round(y, 1)) for x, y in full]
simple = rdp(full, 1.2)
print('full pts', len(full), 'simplified', len(simple))

# arc-length fraction of each checkpoint on the *simplified* polyline
def cumlen(pts):
    out = [0.0]
    for i in range(1, len(pts)):
        out.append(out[-1] + math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
    return out

# keep checkpoint vertices in the simplified path
keep = {full[i] for i in marks.values()}
simple = [p for p in simple]
for k, i in marks.items():
    if full[i] not in simple:
        # insert the anchor at its nearest position
        best, bi = 1e18, 1
        for j in range(1, len(simple)):
            d = math.hypot(simple[j][0] - full[i][0], simple[j][1] - full[i][1])
            if d < best:
                best, bi = d, j
        simple.insert(bi, full[i])

cl = cumlen(simple)
total = cl[-1]
frac = {}
for k, i in marks.items():
    p = full[i]
    j = simple.index(p)
    frac[k] = round(cl[j] / total, 5)
print('total length', round(total, 1))
print('fractions', frac)


def to_path(pts):
    """Catmull-Rom -> cubic bezier, for a smooth d string."""
    d = [f'M {pts[0][0]:.1f} {pts[0][1]:.1f}']
    n = len(pts)
    for i in range(n - 1):
        p0 = pts[i - 1] if i > 0 else pts[i]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < n else pts[i + 1]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d.append(f'C {c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}')
    return ' '.join(d)


dstr = to_path(simple)
json.dump({'width': W, 'height': H, 'pathD': dstr, 'anchors': anchors,
           'fractions': frac, 'points': simple}, open('path.json', 'w'), indent=1)
print('d length', len(dstr))

# ---- debug overlay -----------------------------------------------------------
vis = im.copy()
dr = ImageDraw.Draw(vis)
dr.line([tuple(p) for p in simple], fill=(255, 0, 255), width=5)
for k, (x, y) in anchors.items():
    dr.ellipse([x - 16, y - 16, x + 16, y + 16], outline=(255, 255, 255), width=4)
    dr.text((x + 18, y - 8), k, fill=(255, 255, 255))
vis.save('overlay.png')
print('wrote overlay.png')
