"""Stage 5 — quality-control renders.

Three images: the impression a user will see on paper, the physical face of the
stamp, and an inspection map flagging every feature still under the limits.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage
from shapely.geometry import MultiPolygon
from skimage.morphology import medial_axis

from .limits import Limits, Stamp


def _font(size: int):
    try:
        return ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size
        )
    except OSError:
        return ImageFont.load_default()


def render_face(face: MultiPolygon, stamp: Stamp, px: int = 1600,
                ink=(20, 20, 20), paper=(255, 255, 255)) -> Image.Image:
    """Rasterise the 2-D face geometry at `px` across the outside diameter."""
    r = stamp.border_od_mm / 2.0 * 1.06
    scale = px / (2 * r)
    img = Image.new("RGB", (px, px), paper)
    draw = ImageDraw.Draw(img)

    def to_px(coords):
        return [((x + r) * scale, (r - y) * scale) for x, y in coords]

    for g in face.geoms:
        draw.polygon(to_px(g.exterior.coords), fill=ink)
        for hole in g.interiors:
            draw.polygon(to_px(hole.coords), fill=paper)
    return img


def impression_preview(face_mirrored: MultiPolygon, stamp: Stamp,
                       px: int = 1600) -> Image.Image:
    """What lands on the paper — the mirrored face, mirrored once more."""
    from shapely.affinity import scale as sscale

    unmirrored = sscale(face_mirrored, xfact=-1.0, yfact=1.0, origin=(0, 0))
    if unmirrored.geom_type == "Polygon":
        unmirrored = MultiPolygon([unmirrored])
    return render_face(unmirrored, stamp, px=px, ink=(28, 32, 48),
                       paper=(252, 250, 244))


def inspection_map(repaired_mask: np.ndarray, scan, limits: Limits,
                   stamp: Stamp, px: int = 1400) -> tuple[Image.Image, dict]:
    """Flag every feature still below a stated minimum, colour-coded.

    Width is measured on the medial axis and painted back as a disk of the
    local radius, so a flag covers the offending stroke rather than tracing a
    hairline down its middle.
    """
    mask = repaired_mask
    ppm = scan.px_per_mm
    h, w = mask.shape
    cx, cy, r_out, r_in = scan.circle_px
    yy, xx = np.mgrid[0:h, 0:w]
    rr = np.hypot(xx - cx, yy - cy)

    skel, dist = medial_axis(mask, return_distance=True)
    gskel, gdist = medial_axis(~mask, return_distance=True)
    width_mm = 2 * dist / ppm
    gap_mm = 2 * gdist / ppm
    inner = rr < r_in

    def paint(sel, d):
        out = np.zeros(mask.shape, bool)
        ys, xs = np.nonzero(sel)
        for y, x, rad in zip(ys, xs, d[ys, xs]):
            k = int(max(rad, 1.5)) + 1
            y0, y1 = max(0, y - k), min(h, y + k + 1)
            x0, x1 = max(0, x - k), min(w, x + k + 1)
            gy, gx = np.mgrid[y0:y1, x0:x1]
            out[y0:y1, x0:x1] |= ((gy - y) ** 2 + (gx - x) ** 2) <= (rad + 0.7) ** 2
        return out

    thin = paint(skel & (width_mm < limits.min_stroke_mm)
                 & (width_mm >= limits.min_tip_mm), dist) & mask
    tip = paint(skel & (width_mm < limits.min_tip_mm), dist) & mask
    narrow = paint(gskel & inner & (gap_mm < limits.min_gap_mm), gdist) & ~mask & inner

    labels, n = ndimage.label(mask, np.ones((3, 3)))
    dots = np.zeros_like(mask)
    n_dot = 0
    for i, sl in enumerate(ndimage.find_objects(labels), start=1):
        comp = labels[sl] == i
        if comp.sum() > limits.dot_max_area_px:
            continue
        t = 2 * ndimage.distance_transform_edt(np.pad(comp, 1)).max() / ppm
        if t < limits.min_dot_mm:
            dots[sl] |= comp
            n_dot += 1

    rgb = np.full((h, w, 3), 255, np.uint8)
    rgb[(rr <= r_out) & (rr >= r_in)] = (168, 168, 168)
    rgb[mask] = (25, 25, 25)
    rgb[narrow] = (255, 180, 40)
    rgb[thin] = (235, 45, 45)
    rgb[tip] = (155, 35, 190)
    rgb[dots] = (45, 105, 255)

    stats = {
        "stroke_below_min_pct": float((width_mm[skel] < limits.min_stroke_mm).mean() * 100),
        "gap_below_min_pct": float((gap_mm[gskel & inner] < limits.min_gap_mm).mean() * 100),
        "dots_below_min": n_dot,
    }

    img = Image.fromarray(rgb).resize((px, px), Image.LANCZOS)
    canvas = Image.new("RGB", (px, px + 190), "white")
    canvas.paste(img, (0, 120))
    d = ImageDraw.Draw(canvas)
    d.text((16, 16), f"INSPECTION — border OD {stamp.border_od_mm:g} mm",
           fill=(0, 0, 0), font=_font(34))
    d.text((16, 60), f"{stats['stroke_below_min_pct']:.0f}% of stroke length below "
                     f"{limits.min_stroke_mm} mm   ·   {n_dot} dots below "
                     f"{limits.min_dot_mm} mm", fill=(190, 0, 0), font=_font(22))
    legend = [("stroke < min", (235, 45, 45)), ("below tip floor", (155, 35, 190)),
              ("gap < min", (255, 180, 40)), ("dot < min", (45, 105, 255))]
    for j, (t, c) in enumerate(legend):
        x0 = 16 + (j % 2) * 360
        y0 = px + 128 + (j // 2) * 30
        d.rectangle([x0, y0, x0 + 22, y0 + 18], fill=c, outline=(120, 120, 120))
        d.text((x0 + 30, y0 - 2), t, fill=(40, 40, 40), font=_font(20))
    return canvas, stats
