"""Compose legacy (left) vs Angular (right) screenshots into report/side-by-side/*.png and print pixel diffs."""
import json
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont

ROOT = Path(__file__).parent / "report"
LEGACY, ANGULAR, OUT = ROOT / "screens" / "legacy", ROOT / "screens" / "angular", ROOT / "side-by-side"
OUT.mkdir(parents=True, exist_ok=True)
HEADER, GAP = 44, 24

try:
    font = ImageFont.truetype("DejaVuSans-Bold.ttf", 22)
except OSError:
    font = ImageFont.load_default()

rows = []
for left_path in sorted(LEGACY.glob("*.png")):
    right_path = ANGULAR / left_path.name
    if not right_path.exists():
        rows.append({"page": left_path.stem, "diff": None})
        continue
    left, right = Image.open(left_path).convert("RGB"), Image.open(right_path).convert("RGB")
    w, h = max(left.width, right.width), max(left.height, right.height)
    canvas = Image.new("RGB", (w * 2 + GAP, h + HEADER), "white")
    canvas.paste(left, (0, HEADER))
    canvas.paste(right, (w + GAP, HEADER))
    draw = ImageDraw.Draw(canvas)
    draw.rectangle([w, 0, w + GAP, h + HEADER], fill="#5cb85c")
    draw.text((12, 10), f"Legacy AngularJS 1.5  ·  {left_path.stem}", fill="black", font=font)
    draw.text((w + GAP + 12, 10), f"Angular 21  ·  {left_path.stem}", fill="black", font=font)
    canvas.save(OUT / left_path.name)

    a, b = Image.new("RGB", (w, h), "white"), Image.new("RGB", (w, h), "white")
    a.paste(left), b.paste(right)
    diff = ImageChops.difference(a, b).convert("L").point(lambda p: 255 if p > 32 else 0)
    changed = sum(diff.histogram()[255:]) / (w * h) * 100
    rows.append({"page": left_path.stem, "diff": round(changed, 2), "size": [left.size, right.size]})

json.dump(rows, open(ROOT / "pixel-diff.json", "w"), indent=1)
for r in rows:
    print(f"{r['page']:<32} {'missing' if r['diff'] is None else str(r['diff']) + '%'}")
sys.exit(0)
