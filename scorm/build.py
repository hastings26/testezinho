#!/usr/bin/env python3
"""Build SCORM 1.2 and SCORM 2004 packages from copilot-cowork.html.

The app source is never modified: we copy it to index.html and inject a single
<script> tag for the adapter just before </body>. Run from anywhere:

    python3 scorm/build.py
"""
import io, os, re, sys, zipfile

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(ROOT)
SRC = os.path.join(ROOT, "src")
APP = os.path.join(REPO, "copilot-cowork.html")
TAG = '<script src="scorm-wrapper.js"></script>'

def build(version, manifest_name, out_name):
    html = io.open(APP, encoding="utf-8").read()
    if TAG in html:
        sys.exit("app already contains the adapter tag; expected a clean source file")
    if "</body>" not in html:
        sys.exit("no </body> in app source")
    # Inject after the app's own script so the adapter can see its globals.
    html = html.replace("</body>", TAG + "\n</body>", 1)

    manifest = io.open(os.path.join(SRC, manifest_name), encoding="utf-8").read()
    wrapper = io.open(os.path.join(SRC, "scorm-wrapper.js"), encoding="utf-8").read()

    out = os.path.join(ROOT, out_name)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("imsmanifest.xml", manifest)   # must be at the zip root
        z.writestr("index.html", html)
        z.writestr("scorm-wrapper.js", wrapper)
    size = os.path.getsize(out)
    print("%-44s %7.1f KB  (SCORM %s)" % (out_name, size / 1024.0, version))
    return out

if __name__ == "__main__":
    if not os.path.exists(APP):
        sys.exit("missing %s" % APP)
    build("1.2", "imsmanifest-12.xml", "copilot-cowork-scorm12.zip")
    build("2004 4th Ed", "imsmanifest-2004.xml", "copilot-cowork-scorm2004.zip")
