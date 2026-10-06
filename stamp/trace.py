"""Stage 1 — vectorise the ORIGINAL scan.

The supplied black-and-white scan is the sole authoritative reference for the
calligraphy. Nothing here redraws, substitutes or re-typesets a letterform:
outlines are pulled at sub-pixel accuracy straight off the greyscale ramp, so
every stroke, dot, diacritic and irregularity survives as drawn.

The one thing we *do* replace is the scanned outer border, which is measurably
out of round; the builder substitutes a mathematically perfect annulus for it.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from PIL import Image
from scipy import ndimage, optimize
from shapely.affinity import affine_transform
from shapely.geometry import MultiPolygon, Polygon
from shapely.ops import unary_union
from skimage import measure

# Mid-ramp on the antialiased edge — this is what buys sub-pixel outlines.
INK_LEVEL = 127.5

# Connected blobs smaller than this are scanning speckle, not artwork. Chosen
# well below the smallest intentional diacritic in this scan (248 px).
SPECKLE_PX = 30

# Simplification tolerance, in source pixels, applied before scaling.
SIMPLIFY_PX = 0.20


@dataclass
class Scan:
    """Everything downstream needs about the original artwork."""

    calligraphy: MultiPolygon  # mm, upright, origin-centred, NOT yet mirrored
    border_od_mm: float
    border_width_mm: float
    px_per_mm: float
    speckles_removed: int
    border_runout_mm: float  # how far out of round the scanned border was
    ink_mask: np.ndarray
    callig_mask: np.ndarray
    circle_px: tuple[float, float, float, float]  # cx, cy, r_out, r_in


def _fit_border(ink: np.ndarray) -> tuple[float, float, float, float, float]:
    """Least-squares fit the scanned border circle.

    The outermost ink in each angular bin traces the border's outer edge; a
    circle fitted through those points gives us the centre, the radius, and an
    honest figure for how far out of round the scan actually is.
    """
    ys, xs = np.nonzero(ink)
    cx0, cy0 = xs.mean(), ys.mean()

    dx, dy = xs - cx0, ys - cy0
    r = np.hypot(dx, dy)
    theta = np.arctan2(dy, dx)
    bins = ((theta + np.pi) / (2 * np.pi) * 720).astype(int).clip(0, 719)

    idx = np.full(720, -1)
    for k in np.argsort(r):  # ascending, so the last write per bin is the max
        idx[bins[k]] = k
    idx = idx[idx >= 0]
    px, py = xs[idx], ys[idx]

    def residual(p):
        return np.hypot(px - p[0], py - p[1]) - p[2]

    sol = optimize.least_squares(residual, [cx0, cy0, r.mean()])
    cx, cy, r_out = sol.x
    runout = float(np.abs(residual(sol.x)).max())

    # Border stroke thickness from the radial ink profile just inside r_out.
    h, w = ink.shape
    yy, xx = np.mgrid[0:h, 0:w]
    rr = np.hypot(xx - cx, yy - cy)
    thickness = sum(
        1 for rad in range(int(r_out) - 40, int(r_out) + 1)
        if ink[(rr >= rad) & (rr < rad + 1)].mean() > 0.55
    )
    return float(cx), float(cy), float(r_out), float(r_out - thickness), runout


def _polygonise(grey_crop: np.ndarray) -> Polygon | None:
    """Vectorise one connected blob into a polygon with its interior voids.

    Working per connected component gives hole nesting for free: inside a
    single blob the largest contour is the outline and the rest are voids (the
    counter of a loop, say). Anything sitting inside such a void is a separate
    blob with its own polygon.
    """
    padded = np.pad(grey_crop, 2, constant_values=255.0)
    rings = []
    for c in measure.find_contours(padded, INK_LEVEL):
        if len(c) < 4:
            continue
        ring = Polygon(np.column_stack([c[:, 1], c[:, 0]]))
        if not ring.is_valid:
            ring = ring.buffer(0)
        if not ring.is_empty and ring.area > 0:
            rings.append(ring)
    if not rings:
        return None

    rings.sort(key=lambda p: p.area, reverse=True)
    shell = rings[0]
    poly = Polygon(
        shell.exterior.coords,
        [h.exterior.coords for h in rings[1:] if shell.contains(h)],
    )
    if not poly.is_valid:
        poly = poly.buffer(0)
    return poly


def load(image_path: str, border_od_mm: float, border_width_mm: float) -> Scan:
    """Read the original scan and return the calligraphy in millimetres."""
    grey = np.asarray(Image.open(image_path).convert("L"), dtype=float)
    ink = grey < INK_LEVEL
    h, w = ink.shape

    cx, cy, r_out, r_in, runout_px = _fit_border(ink)
    yy, xx = np.mgrid[0:h, 0:w]
    rr = np.hypot(xx - cx, yy - cy)

    # Strip the scanned border band, keeping strokes that merely cross it
    # (the descender does). Only the component that dominates the band goes.
    band = (rr >= r_in - 3) & (rr <= r_out + 3)
    labels, n = ndimage.label(ink, np.ones((3, 3)))
    in_band = ndimage.sum(band & ink, labels, range(1, n + 1))
    border_id = int(np.argmax(in_band)) + 1
    callig = ink & ~((labels == border_id) & band)
    callig = ndimage.binary_opening(callig, np.ones((2, 2)))

    # Rule 7: drop scanning speckle only. Rule 8: keep every real diacritic.
    labels2, n2 = ndimage.label(callig, np.ones((3, 3)))
    sizes = ndimage.sum(callig, labels2, range(1, n2 + 1))
    keep_ids = [i + 1 for i, s in enumerate(sizes) if s >= SPECKLE_PX]
    kept = np.isin(labels2, keep_ids)
    speckles = int((callig & ~kept).sum())
    callig = kept

    px_per_mm = (2 * r_out) / border_od_mm

    labels3, _ = ndimage.label(callig, np.ones((3, 3)))
    polys = []
    for i, sl in enumerate(ndimage.find_objects(labels3), start=1):
        crop = np.where(labels3[sl] == i, grey[sl], 255.0)
        poly = _polygonise(crop)
        if poly is None:
            continue
        from shapely.affinity import translate

        polys.append(translate(poly, xoff=sl[1].start - 2, yoff=sl[0].start - 2))

    merged = unary_union(polys).simplify(SIMPLIFY_PX, preserve_topology=True)

    # To millimetres, origin at the fitted border centre, Y flipped upright.
    s = 1.0 / px_per_mm
    merged = affine_transform(merged, [s, 0.0, 0.0, -s, -cx * s, cy * s])
    if isinstance(merged, Polygon):
        merged = MultiPolygon([merged])

    return Scan(
        calligraphy=merged,
        border_od_mm=border_od_mm,
        border_width_mm=border_width_mm,
        px_per_mm=px_per_mm,
        speckles_removed=speckles,
        border_runout_mm=runout_px / px_per_mm,
        ink_mask=ink,
        callig_mask=callig,
        circle_px=(cx, cy, r_out, r_in),
    )
