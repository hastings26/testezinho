"""Build the stamp end to end and write every deliverable.

    python -m stamp.run <original-scan.png> [--od 30] [--outdir stamp/out]

Everything is driven off the original scan. Run it at more than one diameter to
compare; each run writes into its own subdirectory.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image

from . import build, exports, qc, repair as repair_mod, trace
from .limits import Limits, Stamp


def run(scan_path: str, outdir: Path, stamp: Stamp, limits: Limits) -> dict:
    outdir.mkdir(parents=True, exist_ok=True)
    grey = np.asarray(Image.open(scan_path).convert("L"), dtype=float)

    scan = trace.load(scan_path, stamp.border_od_mm, stamp.border_width_mm)
    rep = repair_mod.repair(scan, limits, grey)

    solid, face = build.insert(rep.polygons, stamp)
    checks = build.validate(solid, face, stamp)
    hold = build.holder(stamp)

    exports.write_svg(face, outdir / "stamp-face.svg", stamp)
    exports.write_stl(solid, outdir / "stamp-insert-tpu.stl")
    exports.write_stl(hold, outdir / "stamp-holder-pla.stl")
    exports.write_3mf({"stamp_insert_tpu": solid, "stamp_holder_pla": hold},
                      outdir / "stamp.3mf")
    try:
        step_note = exports.write_step(face, outdir / "stamp-insert.step", stamp)
    except Exception as exc:  # noqa: BLE001 - report, don't abort the run
        step_note = f"FAILED: {exc}"

    qc.physical_face_preview(face, stamp).save(
        outdir / "preview-stamp-face-mirrored.png")
    qc.impression_preview(face, stamp).save(outdir / "preview-impression-on-paper.png")
    insp, stats = qc.inspection_map(rep.repaired_mask, scan, limits, stamp)
    insp.save(outdir / "inspection.png")

    report = {
        "source_scan": str(scan_path),
        "border_od_mm": stamp.border_od_mm,
        "border_width_mm": stamp.border_width_mm,
        "relief_mm": stamp.relief_mm,
        "backing_mm": stamp.backing_mm,
        "total_thickness_mm": stamp.total_mm,
        "scan": {
            "px_per_mm": round(scan.px_per_mm, 3),
            "speckles_removed_px": scan.speckles_removed,
            "scanned_border_runout_mm": round(scan.border_runout_mm, 3),
        },
        "repair": {
            "stroke_below_min_before_pct": round(rep.stroke_violation_pct, 1),
            "stroke_below_min_after_pct": round(stats["stroke_below_min_pct"], 1),
            "added_material_pct_of_ink": round(rep.added_area_pct, 2),
            "isolated_dots_thickened": rep.dots_thickened,
            "merges_prevented": rep.merges_prevented,
            "gap_below_min_after_pct": round(stats["gap_below_min_pct"], 1),
            "dots_below_min_after": stats["dots_below_min"],
        },
        "checks": checks,
        "step": step_note,
        "flags": rep.flags,
    }
    (outdir / "report.json").write_text(json.dumps(report, indent=2))
    return report


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("scan")
    ap.add_argument("--od", type=float, default=Stamp.border_od_mm)
    ap.add_argument("--outdir", default="stamp/out")
    args = ap.parse_args()

    stamp = Stamp(border_od_mm=args.od)
    outdir = Path(args.outdir) / f"od{args.od:g}mm"
    report = run(args.scan, outdir, stamp, Limits())
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
