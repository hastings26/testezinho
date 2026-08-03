# Circular calligraphy ink stamp — manufacturing package

A parametric pipeline that turns the original scanned seal artwork into a
manufacturing-ready flexible ink stamp: a **50 mm TPU 95A insert** plus an
optional rigid holder, exported as SVG, STEP, 3MF and STL.

## Geometry provenance

The **original black-and-white scan is the sole geometry reference.** No stage
regenerates, translates, re-typesets, corrects, modernises or beautifies the
writing. Outlines are pulled at sub-pixel accuracy directly off the scan's
greyscale ramp, so every stroke, dot, diacritic, spacing relationship and
irregularity is carried through as drawn. Preview renders produced during
development are display artefacts only and are never read back as geometry.

Two deliberate departures from the scan, both required by the brief:

1. **The outer border is replaced** with a mathematically perfect annulus. The
   scanned border was measured at **0.89 mm of runout** — about 1.8 % of the
   diameter, genuinely out of round — which is exactly why the brief calls for
   it to be substituted.
2. **Scanning speckle is removed.** Only blobs under 30 px were dropped, a
   threshold set an order of magnitude below the smallest intentional diacritic
   in the scan (248 px). Total removed: **8 px**. No intentional mark was touched.

## Why 50 mm

The size was chosen by measurement, not preference. Every candidate diameter was
built and scored against the brief's own limits:

| OD | Stroke below min, before repair | after | Ink area added to comply | Dots still under min | Gaps still under min |
|---|---|---|---|---|---|
| 30 mm | 57.7 % | 11.2 % | **+19.5 %** | 11 | 11.9 % |
| 40 mm | 27.7 % | 6.8 % | +7.9 % | 3 | 6.3 % |
| 45 mm | 22.1 % | 5.3 % | +5.8 % | 2 | 4.2 % |
| **50 mm** | **18.0 %** | **4.3 %** | **+4.2 %** | **1** | **3.6 %** |
| 55 mm | 12.6 % | 5.3 % | +2.9 % | 1 | 2.4 % |

50 mm gives the **best post-repair compliance of any size measured**, and the
4.3 % residual is entirely tapered stroke terminals — which taper to a point by
design and are covered by the 0.35 mm pointed-tip allowance, so they do not
shrink further with scale. Only one isolated dot needed thickening.

Past 50 mm the fidelity gain is marginal while the practical cost is not: a
55–60 mm face needs an oversized pad and deliberate rocking pressure to ink
evenly, which loses more real-world clarity than the extra millimetres buy.
50 mm is also a standard seal size, fits any normal ink pad, and presses flat in
a single push.

**30 mm was ruled out on measurement.** At that size the *median* stroke is
0.50 mm — the typical stroke is already below the 0.55 mm minimum before
anything else is considered. Compliance would need +19.5 % ink area across
roughly three-fifths of the calligraphy and would still leave 11 dots and 11.9 %
of gaps non-compliant, because the constraints work against each other:
thickening strokes narrows the gaps between them, and 11.9 % of those gaps were
already too tight. The visible result is the thick/thin modulation that defines
this hand being flattened and diacritics rounding into blobs — a visible change
to the writing, which the brief prohibits.

Rebuild at any diameter with `--od`; the sweep above is reproducible.

## Pipeline

| Stage | Module | Does |
|---|---|---|
| 1 | `trace.py` | Fits the scanned border circle, strips that band, vectorises each connected blob into a closed polygon with its interior voids |
| 2 | `repair.py` | Measures width along the medial axis and thickens **only** where a feature falls below a limit |
| 3 | `build.py` | Builds the perfect annulus, mirrors the face, extrudes the relief onto the backing |
| 4 | `exports.py` | Writes SVG, STEP (AP214 B-Rep), 3MF, STL |
| 5 | `qc.py` | Renders the impression preview, the mirrored face, and the inspection map |

```bash
python -m stamp.run <original-scan.png>              # 50 mm production build
python -m stamp.run <original-scan.png> --od 40      # any other diameter
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
  the minimum are measured, reported and flagged instead.

One flag remains on the production build: **3.6 % of the negative-space
skeleton is below the 0.45 mm gap minimum.** These are the tightest counters
inside the densest ligatures. On TPU they may ink up slightly at high pressure;
press lightly and they stay open. Correcting them geometrically would mean
eroding the strokes either side, so they are reported rather than silently fixed.

## Stamp construction

| Dimension | Value |
|---|---|
| Border outside diameter | **50.0 mm** |
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
it at the root — which matters here, because gap width is the binding constraint.

The 0.8 mm border is about 1.5× the weight of the original scanned ring, which
scales to ~0.53 mm at this diameter. Dropping `border_width_mm` to 0.65 would
match the original's proportions more closely and still sit inside the preferred
stroke band; 0.8 mm is kept because the brief specifies it.

## Deliverables — `stamp/out/od50mm/`

| File | What it is |
|---|---|
| `preview-impression-on-paper.png` | Expected ink impression, normal readable orientation |
| `preview-stamp-face-mirrored.png` | The physical stamp face |
| `inspection.png` | Every feature still below a stated minimum, colour-coded |
| `stamp-face.svg` | Black-and-white corrected manufacturing geometry, mm-scaled |
| `stamp-insert.step` | AP214 B-Rep, single fused `MANIFOLD_SOLID_BREP` |
| `stamp.3mf` | Both parts, `unit=millimeter` |
| `stamp-insert-tpu.stl` | High-resolution mesh, 292 984 triangles |
| `stamp-holder-pla.stl` | Optional rigid holder |
| `report.json` | Full measurement and flag record |

## Pre-export checks

Asserted automatically in `build.validate()`; recorded in `report.json`. The
build raises rather than exports if the solid is not watertight.

- All vector contours closed — `contours_closed: true`
- No self-intersections, no duplicate paths — `no_self_intersection: true`
- Mesh watertight, consistent winding, positive volume — reconfirmed on reload
- Contact surfaces coplanar at z = 0
- Total thickness 3.2 mm, outside diameter 50.0 mm
- STEP reloads as one fused `MANIFOLD_SOLID_BREP`, schema AP214
- 3MF carries `unit=millimeter`
- Stamp face mirrored; impression preview verified against the original scan

## Printing (Bambu P1S, 0.2 mm nozzle, TPU 95A)

- **Run TPU from an external spool** — flexible TPU is not AMS-supported.
- **Dry the filament first.** TPU is hygroscopic, and wet TPU strings badly —
  on a stamp face that means webbing across the counters.
- **Smooth PEI plate with a thin, even glue-stick layer** as a release agent.
  Textured PEI would emboss its own pattern into the ink surface; smooth PEI
  bonds hard to TPU, hence the glue stick.
- **Face down.** The contact surface is layer one, so it comes out flat and crisp.
- Layer height 0.1 mm; nozzle 220–240 °C; bed 35–45 °C.
- Slow — 20–30 mm/s. Retraction at or near zero.
- Infill 60 %+ so the face does not telegraph the infill pattern.
- Enclosure open (TPU, not ABS/ASA). No supports needed.
- Light 400-grit sanding of the face afterwards improves ink uptake.

Print the holder in PLA at normal settings. The insert's 2.2 mm backing seats
in the 2.3 mm recess, leaving the 1.0 mm relief proud.
