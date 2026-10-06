"""Mirror one mesh inside an existing 3MF, leaving the rest of the file alone.

Written for a Bambu Studio *project* 3MF that already carries plate setup,
filament choice and slice configuration worth preserving. Re-exporting the
model from the pipeline would throw all of that away, so this edits the single
object entry that needs flipping and copies every other zip entry through
untouched.

    python -m stamp.unmirror_3mf in.3mf out.3mf [--object 3D/Objects/object_1.model]

Verify the result with `python -m stamp.verify_orientation out.3mf <scan.png>`.
"""

from __future__ import annotations

import argparse
import re
import zipfile
from pathlib import Path

DEFAULT_OBJECT = "3D/Objects/object_1.model"


def flip_x(xml: str) -> tuple[str, int, int]:
    """Negate every vertex X and reverse every triangle's winding.

    The sign is toggled on the literal text rather than by re-formatting the
    number. Re-serialising at lower precision silently collapses vertices that
    were merely close together -- 3MF readers dedupe by position -- which turns
    a watertight solid into a leaky one.
    """
    counts = {"v": 0, "t": 0}

    def vertex(m: re.Match) -> str:
        counts["v"] += 1
        raw = m.group(2)
        if raw.startswith("-"):
            out = raw[1:]
        elif float(raw) == 0.0:
            out = raw
        else:
            out = "-" + raw
        return f'{m.group(1)}"{out}"'

    def triangle(m: re.Match) -> str:
        counts["t"] += 1
        return f'{m.group(1)}v2="{m.group(3)}" v3="{m.group(2)}"'

    xml = re.sub(r'(<vertex\s+x=)"([-0-9.eE+]+)"', vertex, xml)
    xml = re.sub(r'(<triangle\s+v1="\d+"\s+)v2="(\d+)"\s+v3="(\d+)"', triangle, xml)
    return xml, counts["v"], counts["t"]


def unmirror(src: Path, dst: Path, target: str = DEFAULT_OBJECT) -> tuple[int, int]:
    found = False
    with zipfile.ZipFile(src) as zin, zipfile.ZipFile(
        dst, "w", zipfile.ZIP_DEFLATED
    ) as zout:
        if target not in zin.namelist():
            raise SystemExit(
                f"{target} not in the archive. Entries:\n  "
                + "\n  ".join(zin.namelist())
            )
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == target:
                text, nv, nt = flip_x(data.decode("utf-8"))
                data = text.encode("utf-8")
                found = True
            zout.writestr(item, data)
    assert found
    return nv, nt


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--object", default=DEFAULT_OBJECT)
    args = ap.parse_args()

    nv, nt = unmirror(Path(args.src), Path(args.dst), args.object)
    print(f"mirrored {nv} vertices, rewound {nt} triangles in {args.object}")
    print(f"wrote {args.dst}")


if __name__ == "__main__":
    main()
