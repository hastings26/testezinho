# bambu-p2s — corrected skill

`SKILL.md` in this folder is the corrected version of the personal `bambu-p2s`
skill. It is kept here because remote sessions run in an ephemeral container:
skills are synced down from claude.ai at session start, so editing the synced
copy in the container only lasts for that one session.

## Why it needed correcting

The previous version asserted that the printer was "a Bambu Lab P1S, referred
to casually as the P2S." That was wrong — the P2S is a real, separate Bambu Lab
product, and the file's reference data had been written for the wrong machine.

Four corrections that change actual advice:

| Topic | Old (P1S) | Corrected (P2S) |
|---|---|---|
| Heat creep | print PLA/PETG with cover + door **open** | **Adaptive Airflow**, door **closed** |
| Motion lubrication | "never grease the carbon rods" | rods are **oiled**, lead screws **greased** |
| Nozzle | stainless; upgrade for abrasives | **hardened steel** from factory, quick-swap block |
| Extruder | P1S extruder, ribbon-cable nozzle swap | **DynaSense** servo, ~8.5 kg force |

The maintenance schedule was also replaced with the published P2S/X2D intervals
(XY every ~1–3 months, Z lead screws every ~3–5 months, cutter blade every 8–12
spools / 4–10 for abrasives).

## To make the fix permanent

Upload `SKILL.md` to claude.ai → Settings → Capabilities → Skills → `bambu-p2s`,
replacing the existing file. Until that upload happens, the old version will
re-sync into every new session.

## Sources

- Bambu Lab P2S product and specification pages
- Bambu Lab Wiki, P2S section — including the P2S/X2D XYZ-axis cleaning and
  lubrication guide and the P2S periodic maintenance recommendations
- P1S vs P2S comparisons covering Adaptive Airflow, the DynaSense extruder, the
  quick-swap heater block, and AMS 2 Pro compatibility
