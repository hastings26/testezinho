"""Manufacturing-ready CAD pipeline for a circular flexible ink stamp.

The original scanned artwork is the sole geometry reference throughout. No
stage regenerates, translates, re-typesets or beautifies the calligraphy.
"""

from .limits import Limits, Stamp

__all__ = ["Limits", "Stamp"]
