"""Manufacturing limits and stamp dimensions, all in millimetres."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Limits:
    """FDM manufacturing limits for a TPU 95A stamp face."""

    min_stroke_mm: float = 0.55
    pref_stroke_mm: float = 0.65
    min_gap_mm: float = 0.45
    pref_gap_mm: float = 0.55
    min_dot_mm: float = 0.65
    min_dot_clearance_mm: float = 0.45
    min_tip_mm: float = 0.35
    fillet_mm: float = 0.12  # brief allows 0.10-0.15

    # How far from a skeleton endpoint still counts as the tapered "tip" of a
    # stroke, and therefore gets the tip floor rather than the stroke minimum.
    tip_zone_mm: float = 0.45

    # A blob larger than this is a stroke, not an isolated dot.
    dot_max_area_px: int = 4000


@dataclass(frozen=True)
class Stamp:
    """Physical stamp geometry."""

    # 50 mm is the chosen production size. It gives the best post-repair
    # compliance of any diameter measured (4.4 % residual, all of it tapered
    # stroke terminals) for only 4.3 % added material, and it still presses
    # flat in one push on a standard ink pad. See README for the full sweep.
    border_od_mm: float = 50.0
    border_width_mm: float = 0.8
    relief_mm: float = 1.0  # raised height above the backing
    backing_mm: float = 2.2
    draft_deg: float = 3.0  # hidden sub-surface taper; contact face unaffected

    # Optional rigid holder. The recess clearance and wall are derived from the
    # insert so the holder tracks the stamp at any diameter -- at the briefed
    # 30 mm insert this gives the specified 30.3 mm recess.
    holder_clearance_mm: float = 0.3  # brief allows 30.2-30.4 on a 30 mm insert
    holder_wall_mm: float = 3.0
    holder_recess_depth_mm: float = 2.3
    holder_grip_mm: float = 34.0  # narrow end, sits on the build plate
    holder_taper_mm: float = 14.0  # grip flares out to full diameter over this
    holder_rim_mm: float = 6.0  # full-diameter section carrying the recess

    @property
    def total_mm(self) -> float:
        return self.relief_mm + self.backing_mm

    @property
    def border_id_mm(self) -> float:
        return self.border_od_mm - 2 * self.border_width_mm

    @property
    def holder_recess_mm(self) -> float:
        return self.border_od_mm + self.holder_clearance_mm

    @property
    def holder_od_mm(self) -> float:
        return self.holder_recess_mm + 2 * self.holder_wall_mm

    @property
    def holder_height_mm(self) -> float:
        return self.holder_taper_mm + self.holder_rim_mm

    @property
    def holder_floor_mm(self) -> float:
        """Solid material between the top of the recess and the taper."""
        return self.holder_rim_mm - self.holder_recess_depth_mm
