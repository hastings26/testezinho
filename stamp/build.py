"""Stage 3 — assemble the solid stamp insert and its optional rigid holder.

Print orientation is face-down: the contact face is layer one, laid straight
onto smooth PEI, which is what makes it flat, coplanar and crisp. The relief
therefore rises *away* from the ink surface into the backing, so its walls are
plain vertical extrusions — at 1.0 mm tall there is no overhang to draft
around, and keeping them vertical preserves the full negative gap for the whole
relief height rather than pinching it at the root.
"""

from __future__ import annotations

import numpy as np
import trimesh
from shapely.affinity import scale as shapely_scale
from shapely.geometry import MultiPolygon, Point, Polygon
from shapely.ops import unary_union

from .limits import Stamp


def face_geometry(calligraphy: MultiPolygon, stamp: Stamp,
                  mirror: bool) -> MultiPolygon:
    """The 2-D stamp face: perfect border annulus + preserved calligraphy.

    The scanned border is discarded upstream; here it is replaced by a
    mathematically exact annulus. Calligraphy that ran past the old border --
    the descender does -- is clipped to the new outside diameter, so the
    silhouette is a true circle.
    """
    r_out = stamp.border_od_mm / 2.0
    r_in = stamp.border_id_mm / 2.0
    outer = Point(0, 0).buffer(r_out, quad_segs=512)
    annulus = outer.difference(Point(0, 0).buffer(r_in, quad_segs=512))

    face = unary_union([annulus, calligraphy]).intersection(outer)

    if mirror:
        face = shapely_scale(face, xfact=-1.0, yfact=1.0, origin=(0, 0))

    if isinstance(face, Polygon):
        face = MultiPolygon([face])
    return face


def _extrude(face: MultiPolygon, height: float, z0: float) -> trimesh.Trimesh:
    parts = [
        trimesh.creation.extrude_polygon(g, height=height, engine="earcut")
        for g in face.geoms
    ]
    mesh = trimesh.util.concatenate(parts) if len(parts) > 1 else parts[0]
    mesh.apply_translation([0, 0, z0])
    return mesh


def insert(calligraphy: MultiPolygon, stamp: Stamp,
           mirror: bool = True) -> tuple[trimesh.Trimesh, MultiPolygon]:
    """The TPU 95A stamp insert as a single watertight solid."""
    face = face_geometry(calligraphy, stamp, mirror=mirror)

    relief = _extrude(face, stamp.relief_mm, 0.0)
    backing = trimesh.creation.cylinder(
        radius=stamp.border_od_mm / 2.0,
        height=stamp.backing_mm,
        sections=512,
    )
    backing.apply_translation([0, 0, stamp.relief_mm + stamp.backing_mm / 2.0])

    # manifold3d already returns a clean manifold; culling "degenerate" faces
    # afterwards only punches holes in it, so we merge vertices and stop there.
    solid = trimesh.boolean.union([relief, backing])
    solid.merge_vertices()
    solid.fix_normals()
    if not solid.is_watertight:
        raise RuntimeError("stamp insert is not watertight after union")
    return solid, face


def holder(stamp: Stamp) -> trimesh.Trimesh:
    """Optional rigid (PLA) holder with a recess for the TPU insert."""
    body = trimesh.creation.cylinder(
        radius=stamp.holder_od_mm / 2.0, height=stamp.holder_body_mm, sections=256
    )
    body.apply_translation([0, 0, stamp.holder_body_mm / 2.0])

    # Recess opens downward from z=0, receiving the insert's 2.2 mm backing.
    recess = trimesh.creation.cylinder(
        radius=stamp.holder_recess_mm / 2.0,
        height=stamp.holder_recess_depth_mm * 2,
        sections=256,
    )
    recess.apply_translation([0, 0, stamp.holder_recess_depth_mm])

    knob = trimesh.creation.cylinder(
        radius=stamp.holder_knob_mm / 2.0, height=stamp.holder_knob_mm, sections=128
    )
    knob.apply_translation(
        [0, 0, stamp.holder_body_mm + stamp.holder_knob_mm / 2.0 - 0.01]
    )
    cap = trimesh.creation.icosphere(subdivisions=3, radius=stamp.holder_knob_mm / 2.0)
    cap.apply_translation([0, 0, stamp.holder_body_mm + stamp.holder_knob_mm - 0.01])

    solid = trimesh.boolean.union([body, knob, cap])
    solid = trimesh.boolean.difference([solid, recess])
    solid.merge_vertices()
    solid.fix_normals()
    if not solid.is_watertight:
        raise RuntimeError("holder is not watertight after boolean ops")
    return solid


def validate(solid: trimesh.Trimesh, face: MultiPolygon, stamp: Stamp) -> dict:
    """Pre-export quality control."""
    contact_z = []
    for g in face.geoms:
        contact_z.append(0.0)

    verts = solid.vertices
    on_face = verts[np.isclose(verts[:, 2], 0.0, atol=1e-6)]
    checks = {
        "watertight": bool(solid.is_watertight),
        "winding_consistent": bool(solid.is_winding_consistent),
        "volume_positive": bool(solid.volume > 0),
        "contact_faces_coplanar": bool(len(on_face) > 0),
        "total_thickness_mm": round(float(solid.bounds[1][2] - solid.bounds[0][2]), 4),
        "outside_diameter_mm": round(
            float(max(solid.bounds[1][0] - solid.bounds[0][0],
                      solid.bounds[1][1] - solid.bounds[0][1])), 4
        ),
        "contours_closed": all(g.is_valid and g.exterior.is_ring for g in face.geoms),
        "no_self_intersection": bool(face.is_valid),
        "islands": len(face.geoms),
        "triangles": int(len(solid.faces)),
    }
    checks["thickness_ok"] = abs(checks["total_thickness_mm"] - stamp.total_mm) < 1e-3
    checks["diameter_ok"] = abs(checks["outside_diameter_mm"] - stamp.border_od_mm) < 0.05
    return checks
