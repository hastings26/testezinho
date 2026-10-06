"""Stage 2 — bring individual features up to manufacturing limits.

The brief forbids a global stroke expansion (rule 9) and requires that each
feature be inspected on its own (rule 10). So nothing here scales or dilates
the artwork as a whole. We measure width along the medial axis and add material
*only* where the local width falls short, painting the deficit symmetrically
about the stroke's own centreline so its identity and position are untouched.

Two deliberate engineering decisions, both flagged in the report:

* Originally separate strokes are never allowed to fuse. Repair material that
  would bridge two distinct components is withheld and the site is flagged.
* Negative gaps below the minimum are flagged, never "opened". Opening a gap
  means eroding the calligraphy either side of it, which would visibly alter
  the artwork — the one thing the brief rules out. Widening the stamp is the
  only fix that does not cost strokes, so we report and let the caller decide.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
from scipy import ndimage
from shapely.geometry import MultiPolygon, Polygon
from shapely.ops import unary_union
from skimage import measure
from skimage.morphology import medial_axis

from .limits import Limits


@dataclass
class Repair:
    polygons: MultiPolygon
    strokes_thickened: int = 0
    tips_blunted: int = 0
    dots_thickened: int = 0
    added_area_pct: float = 0.0
    merges_prevented: int = 0
    flags: list[str] = field(default_factory=list)
    gap_violation_pct: float = 0.0
    stroke_violation_pct: float = 0.0
    repaired_mask: np.ndarray | None = None


def _disk(radius: float) -> np.ndarray:
    k = int(np.ceil(radius))
    y, x = np.mgrid[-k : k + 1, -k : k + 1]
    return (x * x + y * y) <= radius * radius


def _paint(points: np.ndarray, radii: np.ndarray, shape) -> np.ndarray:
    """Stamp a disk of the given radius at each point (radii in pixels)."""
    out = np.zeros(shape, bool)
    h, w = shape
    for (y, x), r in zip(points, radii):
        k = int(np.ceil(r))
        y0, y1 = max(0, y - k), min(h, y + k + 1)
        x0, x1 = max(0, x - k), min(w, x + k + 1)
        yy, xx = np.mgrid[y0:y1, x0:x1]
        out[y0:y1, x0:x1] |= ((yy - y) ** 2 + (xx - x) ** 2) <= r * r
    return out


def _nearest_label_field(mask: np.ndarray) -> np.ndarray:
    """For every pixel, which original component is closest."""
    labels, _ = ndimage.label(mask, np.ones((3, 3)))
    _, (iy, ix) = ndimage.distance_transform_edt(~mask, return_indices=True)
    return labels[iy, ix]


def repair(scan, limits: Limits, grey: np.ndarray) -> Repair:
    """Apply local, per-feature corrections and report exactly what changed."""
    mask = scan.callig_mask
    ppm = scan.px_per_mm  # pixels per millimetre
    flags: list[str] = []

    skel, dist = medial_axis(mask, return_distance=True)
    width_mm = 2 * dist / ppm

    # Skeleton endpoints mark the tapered tips of calligraphic strokes, which
    # narrow to nothing by design. Those get the pointed-tip floor rather than
    # the full stroke minimum, so we blunt them instead of fattening the stroke.
    neigh = ndimage.convolve(skel.astype(np.uint8), np.ones((3, 3), np.uint8),
                             mode="constant")
    endpoints = skel & (neigh <= 2)
    tip_zone = ndimage.binary_dilation(
        endpoints, _disk(limits.tip_zone_mm * ppm)
    )

    deficient = skel & (width_mm < limits.min_stroke_mm)
    tip_pts = deficient & tip_zone
    body_pts = deficient & ~tip_zone

    stroke_violation_pct = float((width_mm[skel] < limits.min_stroke_mm).mean() * 100)

    # Required radius: the target half-width, but never shrink anything.
    pts, radii = [], []
    for sel, target_mm in (
        (body_pts, limits.min_stroke_mm),
        (tip_pts, limits.min_tip_mm),
    ):
        ys, xs = np.nonzero(sel)
        if len(ys) == 0:
            continue
        want = np.maximum(dist[ys, xs], target_mm * ppm / 2.0)
        pts.append(np.column_stack([ys, xs]))
        radii.append(want)

    repair_mask = np.zeros_like(mask)
    if pts:
        repair_mask = _paint(np.vstack(pts), np.concatenate(radii), mask.shape)

    # --- guard: never fuse strokes that were separate in the original -------
    nearest = _nearest_label_field(mask)
    # A pixel sits on a watershed between two components if its neighbourhood
    # contains more than one nearest-label. Withholding repair there keeps
    # originally distinct strokes distinct.
    lo = ndimage.minimum_filter(nearest, size=3)
    hi = ndimage.maximum_filter(nearest, size=3)
    watershed = (lo != hi) & ~mask
    contested = repair_mask & watershed
    merges_prevented = int(ndimage.label(contested, np.ones((3, 3)))[1])
    repair_mask &= ~watershed

    # --- isolated dots ------------------------------------------------------
    labels, n_before = ndimage.label(mask, np.ones((3, 3)))
    dots_fixed = 0
    dot_mask = np.zeros_like(mask)
    for i, sl in enumerate(ndimage.find_objects(labels), start=1):
        comp = labels[sl] == i
        if comp.sum() > limits.dot_max_area_px:
            continue
        thickness = 2 * ndimage.distance_transform_edt(np.pad(comp, 1)).max() / ppm
        if thickness >= limits.min_dot_mm:
            continue
        grow = (limits.min_dot_mm - thickness) * ppm / 2.0
        pad = int(np.ceil(grow)) + 2
        big = np.pad(comp, pad)
        grown = ndimage.binary_dilation(big, _disk(grow))
        y0 = max(0, sl[0].start - pad); x0 = max(0, sl[1].start - pad)
        gh, gw = grown.shape
        y1 = min(mask.shape[0], y0 + gh); x1 = min(mask.shape[1], x0 + gw)
        dot_mask[y0:y1, x0:x1] |= grown[: y1 - y0, : x1 - x0]
        dots_fixed += 1
    dot_mask &= ~watershed

    added = (repair_mask | dot_mask) & ~mask
    repaired = mask | added

    labels_after, n_after = ndimage.label(repaired, np.ones((3, 3)))
    if n_after < n_before:
        flags.append(
            f"{n_before - n_after} originally separate feature(s) still fused "
            "after the anti-merge guard — inspect before printing."
        )

    # --- negative gaps: measure and flag, never erode -----------------------
    cx, cy, r_out, r_in = scan.circle_px
    yy, xx = np.mgrid[0 : mask.shape[0], 0 : mask.shape[1]]
    inner = np.hypot(xx - cx, yy - cy) < r_in
    gskel, gdist = medial_axis(~repaired, return_distance=True)
    gsel = gskel & inner
    gap_mm = 2 * gdist[gsel] / ppm
    gap_violation_pct = float((gap_mm < limits.min_gap_mm).mean() * 100) if gap_mm.size else 0.0
    if gap_violation_pct > 0.5:
        flags.append(
            f"{gap_violation_pct:.1f}% of the negative-space skeleton is below the "
            f"{limits.min_gap_mm} mm gap minimum. Not corrected: opening these gaps "
            "requires eroding the calligraphy either side."
        )

    # --- vectorise, preserving the original antialiased edges ---------------
    # Repair pixels are forced to full ink; everywhere else the scan's own
    # greyscale ramp is kept, so untouched strokes stay sub-pixel smooth.
    grey_out = np.where(added, 0.0, grey)
    grey_out = np.where(~repaired & mask, 255.0, grey_out)

    polys = []
    lab3, _ = ndimage.label(repaired, np.ones((3, 3)))
    for i, sl in enumerate(ndimage.find_objects(lab3), start=1):
        crop = np.where(lab3[sl] == i, grey_out[sl], 255.0)
        padded = np.pad(crop, 2, constant_values=255.0)
        rings = []
        for c in measure.find_contours(padded, 127.5):
            if len(c) < 4:
                continue
            ring = Polygon(np.column_stack([c[:, 1], c[:, 0]]))
            if not ring.is_valid:
                ring = ring.buffer(0)
            if not ring.is_empty and ring.area > 0:
                rings.append(ring)
        if not rings:
            continue
        rings.sort(key=lambda p: p.area, reverse=True)
        shell = rings[0]
        poly = Polygon(
            shell.exterior.coords,
            [h.exterior.coords for h in rings[1:] if shell.contains(h)],
        )
        if not poly.is_valid:
            poly = poly.buffer(0)
        from shapely.affinity import translate

        polys.append(translate(poly, xoff=sl[1].start - 2, yoff=sl[0].start - 2))

    merged = unary_union(polys)

    # To millimetres, upright, origin at the fitted border centre.
    from shapely.affinity import affine_transform

    s = 1.0 / ppm
    merged = affine_transform(merged, [s, 0.0, 0.0, -s, -cx * s, cy * s])

    # Small fillet on fragile edges: a close then an open with a round join
    # rounds concave notches and convex spikes alike while preserving width.
    r = limits.fillet_mm
    merged = merged.buffer(r, join_style=1, quad_segs=16).buffer(
        -2 * r, join_style=1, quad_segs=16
    ).buffer(r, join_style=1, quad_segs=16)

    if isinstance(merged, Polygon):
        merged = MultiPolygon([merged])

    return Repair(
        polygons=merged,
        strokes_thickened=int(ndimage.label(repair_mask & ~mask, np.ones((3, 3)))[1]),
        tips_blunted=int(tip_pts.sum()),
        dots_thickened=dots_fixed,
        added_area_pct=float(added.sum() / mask.sum() * 100),
        merges_prevented=merges_prevented,
        flags=flags,
        gap_violation_pct=gap_violation_pct,
        stroke_violation_pct=stroke_violation_pct,
        repaired_mask=repaired,
    )
