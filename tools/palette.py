"""Extract each strip's own watercolor palette for the page-change wash.

Run from anywhere: `python3 tools/palette.py` (inside site/), or let build.js
call it. It writes tools/palettes.json, mapping image path -> three hex colors,
which build.js injects as CSS custom properties on that strip's page.

Colors are sampled from the finished artwork and nudged toward a more saturated,
lighter wash so they read as paint rather than mud; the hue stays true to the art.
"""

import colorsys
import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "comics.js"
OUT = ROOT / "tools" / "palettes.json"

# Fallbacks from DESIGN.md, used when an image is missing or has no colorful pixels.
DEFAULTS = ["#C8863A", "#4A6B4A", "#5B8FB8"]


def image_paths():
    text = MANIFEST.read_text(encoding="utf-8")
    return list(dict.fromkeys(re.findall(r'image:\s*["\']([^"\']+)["\']', text)))


def extract(path):
    with Image.open(path) as source:
        im = source.convert("RGB")
        im.thumbnail((160, 160))
        quantized = im.quantize(colors=18, method=Image.Quantize.MEDIANCUT)
        palette = quantized.getpalette() or []
        counts = quantized.getcolors() or []

    candidates = []
    for count, index in counts:
        r, g, b = palette[index * 3:index * 3 + 3]
        h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        # Skip paper, ink, and near-neutral pixels — we want the actual paint.
        if s < 0.24 or v < 0.22 or v > 0.95:
            continue
        candidates.append((count * (0.35 + s), h * 360, s, v))

    candidates.sort(reverse=True)
    # Top three by population × saturation. Forcing varied hues would pull in
    # rare outlier pixels and abandon the strip's actual warm palette.
    picks = [(_h, s, v) for _score, _h, s, v in candidates[:3]]

    colors = []
    for i, (h, s, v) in enumerate(picks):
        # Keep the art's hue; lift saturation and stagger lightness so three
        # related tones read as layered wash rather than flat color.
        lifted_s = min(1.0, max(s, 0.4))
        lifted_v = min(0.92, max(v, (0.8, 0.64, 0.5)[i]))
        r, g, b = colorsys.hsv_to_rgb(h / 360, lifted_s, lifted_v)
        colors.append(f"#{round(r * 255):02X}{round(g * 255):02X}{round(b * 255):02X}")

    while len(colors) < 3:
        colors.append(DEFAULTS[len(colors)])
    return colors


def main():
    result = {}
    for rel in image_paths():
        path = ROOT / rel
        if not path.exists():
            print(f"skip {rel} (missing image)")
            continue
        result[rel] = extract(path)
        print(f"{rel}: {', '.join(result[rel])}")
    OUT.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
