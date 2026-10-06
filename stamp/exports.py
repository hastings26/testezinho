"""Stage 4 — write the manufacturing deliverables: SVG, STEP, 3MF, STL."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import trimesh
from shapely.geometry import MultiPolygon

from .limits import Stamp


# --------------------------------------------------------------------------
# SVG — black-and-white corrected manufacturing geometry
# --------------------------------------------------------------------------
def write_svg(face: MultiPolygon, path: Path, stamp: Stamp, margin: float = 1.0) -> None:
    r = stamp.border_od_mm / 2.0 + margin
    size = 2 * r

    def path_d(poly) -> str:
        parts = []
        for ring in [poly.exterior, *poly.interiors]:
            pts = list(ring.coords)
            # SVG's Y axis points down; flip so the file matches the model.
            d = f"M {pts[0][0]:.4f} {-pts[0][1]:.4f} " + " ".join(
                f"L {x:.4f} {-y:.4f}" for x, y in pts[1:]
            )
            parts.append(d + " Z")
        return " ".join(parts)

    body = "\n".join(
        f'    <path d="{path_d(g)}" />' for g in face.geoms
    )
    svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1"
     width="{size}mm" height="{size}mm"
     viewBox="{-r:.4f} {-r:.4f} {size:.4f} {size:.4f}">
  <rect x="{-r:.4f}" y="{-r:.4f}" width="{size:.4f}" height="{size:.4f}" fill="#ffffff"/>
  <g fill="#000000" fill-rule="evenodd" stroke="none">
{body}
  </g>
</svg>
"""
    path.write_text(svg)


# --------------------------------------------------------------------------
# STEP — editable B-Rep solid
# --------------------------------------------------------------------------
def write_step(face: MultiPolygon, path: Path, stamp: Stamp,
               tolerance_mm: float = 0.02) -> str:
    """Build a real B-Rep solid and export STEP AP214.

    The mesh exports carry full resolution; STEP is for downstream CAD editing,
    so contours are simplified to `tolerance_mm` first. Without that, tens of
    thousands of polyline segments make the kernel's fuse impractically slow.
    """
    import cadquery as cq
    from cadquery import Face, Solid, Vector, Wire

    simplified = face.simplify(tolerance_mm, preserve_topology=True)
    if simplified.geom_type == "Polygon":
        simplified = MultiPolygon([simplified])

    def to_wire(coords) -> Wire:
        pts = [Vector(float(x), float(y), 0.0) for x, y in list(coords)[:-1]]
        return Wire.makePolygon(pts, close=True)

    solids = []
    for poly in simplified.geoms:
        if poly.is_empty or poly.area <= 0:
            continue
        f = Face.makeFromWires(
            to_wire(poly.exterior.coords),
            [to_wire(i.coords) for i in poly.interiors],
        )
        solids.append(Solid.extrudeLinear(f, Vector(0, 0, stamp.relief_mm)))

    backing = Solid.makeCylinder(
        stamp.border_od_mm / 2.0, stamp.backing_mm, Vector(0, 0, stamp.relief_mm)
    )

    result = backing
    for s in solids:
        result = result.fuse(s)
    result = result.clean()

    cq.exporters.export(cq.Workplane(obj=result), str(path), exportType="STEP")
    return f"{len(solids)} relief solids fused, simplified to {tolerance_mm} mm"


# --------------------------------------------------------------------------
# Meshes
# --------------------------------------------------------------------------
def write_stl(mesh: trimesh.Trimesh, path: Path) -> None:
    mesh.export(str(path), file_type="stl")


def write_3mf(meshes: dict[str, trimesh.Trimesh], path: Path,
              gap_mm: float = 8.0) -> None:
    """3MF carries millimetres natively, so slicers open it at true scale.

    Parts are laid out side by side along X. Exporting them all at the origin
    would have them interpenetrating when the file is opened in a slicer.
    """
    widths = [m.extents[0] for m in meshes.values()]
    total = sum(widths) + gap_mm * (len(widths) - 1)

    scene = trimesh.Scene()
    cursor = -total / 2.0
    for (name, m), w in zip(meshes.items(), widths):
        placed = m.copy()
        centre_x = (m.bounds[0][0] + m.bounds[1][0]) / 2.0
        placed.apply_translation([cursor + w / 2.0 - centre_x, 0, 0])
        scene.add_geometry(placed, geom_name=name, node_name=name)
        cursor += w + gap_mm
    scene.export(str(path), file_type="3mf")
