# Circular calligraphy ink stamp — manufacturing package

A parametric pipeline that turns the original scanned seal artwork into a
manufacturing-ready flexible ink stamp: TPU 95A insert plus an optional rigid
holder, exported as SVG, STEP, 3MF and STL.

## Geometry provenance

The **original black-and-white scan is the sole geometry reference.** No stage
regenerates, translates, re-typesets, corrects, modernises or beautifies the
writing. Outlines are pulled at sub-pixel accuracy directly off the scan's
greyscale ramp, so every stroke, dot, diacritic, spacing relationship and
irregularity is carried through as drawn. Preview renders produced during
development are display artefacts only and are never read back as geometry.

Two deliberate departures from the scan, both required by the brief:

1. **The outer border is replaced** with a mathematically perfect annulus. The
   scanned border was measured at **0.535 mm of runout** — genuinely out of
   round — which is exactly why the brief calls for it to be substituted.
2. **Scanning speckle is removed.** Only blobs under 30 px were dropped, a
   threshold set an order of magnitude below the smallest intentional diacritic
   in the scan (248 px). Total removed: **8 px**. No intentional mark was touched.

## Pipeline

| Stage | Module | Does |
|---|---|---|
| 1 | `trace.py` | Fits the scanned border circle, strips that band, vectorises each connected blob into a closed polygon with its interior voids |
| 2 | `repair.py` | Measures width along the medial axis and thickens **only** where a feature falls below a limit |
| 3 | `build.py` | Builds the perfect annulus, mirrors the face, extrudes the relief onto the backing |
| 4 | `exports.py` | Writes SVG, STEP (AP214 B-Rep), 3MF, STL |
| 5 | `qc.py` | Renders the impression preview, the mirrored face, and the inspection map |

Run it:

```bash
python -m stamp.run <original-scan.png> --od 30      # as briefed
python -m stamp.run <original-scan.png> --od 50      # compliant variant
```

Each run writes to `stamp/out/od<N>mm/` with its own `report.json`.

## How repair works, and what it refuses to do

The brief forbids a global stroke expansion (rule 9) and requires per-feature
inspection (rule 10). Nothing here scales or dilates the artwork as a whole.
Width is measured along each stroke's medial axis; where the local width falls
short, material is painted back as disks centred **on that stroke's own
centreline**, so the correction is local, symmetric, and leaves position and
visual identity untouched. Tapered stroke ends are detected as skeleton
endpoints and blunted to the 0.35 mm tip floor rather than being fattened along
their whole length.

Two things it deliberately will not do:

- **It never fuses originally separate strokes.** Repair material landing on
  the watershed between two distinct components is withheld, and the site is
  counted in `merges_prevented`.
- **It never "opens" a tight negative gap.** Opening a gap means eroding the
  calligraphy either side of it — the one thing the brief rules out. Gaps below
  the minimum are measured, reported and flagged instead. Increasing the stamp
  diameter is the only fix that does not cost strokes.

## Findings — the 30 mm target cannot meet the stated limits

Measured off the original scan, against the limits in the brief:

| | **30 mm (as briefed)** | **50 mm** |
|---|---|---|
| Stroke length below 0.55 mm, before repair | **57.7 %** | 18.0 % |
| Stroke length below 0.55 mm, after repair | 11.2 % | **4.4 %** |
| Ink area added to comply | **+19.5 %** | **+4.3 %** |
| Isolated dots needing thickening | 14 | 1 |
| Dots still below 0.65 mm after repair | **11** | 1 |
| Negative gaps still below 0.45 mm | **11.9 %** | 3.6 % |
| Separate features surviving as islands | 26 | 34 |

At 30 mm the *median* stroke is 0.50 mm — the typical stroke is already below
the 0.55 mm minimum before anything else is considered. Bringing the artwork
into compliance requires adding **19.5 % ink area** across roughly three-fifths
of the calligraphy, and it still leaves 11 dots and 11.9 % of gaps
non-compliant. The two constraints work against each other: thickening strokes
narrows the gaps between them, and 11.9 % of those gaps are already too tight.

The visible result is the thick/thin modulation that defines this hand being
flattened, and diacritics rounding into blobs. That is a visible change to the
writing, which the brief's rule 5 prohibits — so it is flagged here rather than
shipped silently.

**At 50 mm the same limits are satisfiable with genuinely local fixes:** one dot
thickened, 4.3 % material added, and the residual stroke flags are tapered
terminals covered by the 0.35 mm pointed-tip allowance.

One further consequence of the small diameter: the mandated 0.8 mm border is
about **2.5× the weight of the original scanned ring** at 30 mm (the scan's ring
scales to ~0.31 mm there). The heavier ring is unavoidable — 0.31 mm is far
below the manufacturing minimum — but it does read differently from the original.

Both variants are built and exported. Pick per the table above.

## Stamp construction

| Dimension | Value |
|---|---|
| Border outside diameter | 30.0 mm (parametric) |
| Border width | 0.8 mm |
| Relief height above backing | 1.0 mm |
| TPU backing thickness | 2.2 mm |
| Total TPU thickness | 3.2 mm |
| Holder recess | insert OD + 0.3 mm, 2.3 mm deep |

All raised contact surfaces are exactly coplanar at z = 0, and the rear
mounting surface is flat. No decorative texture is added anywhere.

Relief walls are **vertical, not drafted**. Print orientation is face-down, so
the 1.0 mm relief presents no overhang to draft around, and vertical walls
preserve the full negative gap for the entire relief height instead of pinching
it at the root — which matters here, because gap width is the binding
constraint.

## Deliverables (per diameter)

| File | What it is |
|---|---|
| `preview-impression-on-paper.png` | Expected ink impression, normal readable orientation |
| `preview-stamp-face-mirrored.png` | The physical stamp face |
| `inspection.png` | Every feature still below a stated minimum, colour-coded |
| `stamp-face.svg` | Black-and-white corrected manufacturing geometry, mm-scaled |
| `stamp-insert.step` | AP214 B-Rep, single fused `MANIFOLD_SOLID_BREP` |
| `stamp.3mf` | Both parts, `unit=millimeter` |
| `stamp-insert-tpu.stl` | High-resolution mesh |
| `stamp-holder-pla.stl` | Optional rigid holder |
| `report.json` | Full measurement and flag record |

## Pre-export checks

Asserted automatically in `build.validate()`; recorded in `report.json`.

- All vector contours closed — `contours_closed: true`
- No self-intersections — `no_self_intersection: true`
- Mesh watertight, consistent winding, positive volume
- Contact surfaces coplanar at z = 0
- Total thickness 3.2 mm, outside diameter on target
- Stamp face mirrored; impression preview verified against the original scan

The build raises rather than exports if the solid is not watertight.

## Printing (Bambu P1S, 0.2 mm nozzle, TPU 95A)

- **Run TPU from an external spool** — flexible TPU is not AMS-supported.
- **Dry the filament first.** TPU is hygroscopic and wet TPU strings badly,
  which on a stamp face means webbing across the counters.
- **Smooth PEI plate, with a thin even glue-stick layer** as a release agent.
  Textured PEI would emboss its own pattern into the ink surface. Smooth PEI
  bonds hard to TPU, hence the glue stick.
- **Face down.** The contact surface is layer one, so it comes out flat and crisp.
- Layer height 0.1 mm; nozzle 220–240 °C; bed 35–45 °C.
- Slow — 20–30 mm/s. Retraction at or near zero.
- Infill 60 %+ so the face does not telegraph the infill pattern.
- Enclosure open (TPU, not ABS/ASA). No supports needed.
- Light 400-grit sanding of the face afterwards improves ink uptake.

Print the holder in PLA at normal settings. The insert's 2.2 mm backing seats
in the 2.3 mm recess, leaving the 1.0 mm relief proud.
