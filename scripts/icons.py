#!/usr/bin/env python3
"""Génère les icônes PNG à partir des SVG (à relancer quand un SVG change).

    pip install -r tests/requirements.txt && python3 -m playwright install chromium
    python3 scripts/icons.py

Pour chaque dossier d'icônes (src/catalogue/icons, src/apps/<id>/icons) contenant <nom>.svg
et <nom>-mask.svg (même dessin réduit à 80 % sur fond plein, pour Android) :
    <nom>-64.png, -180.png (iPhone), -192.png, -512.png, -mask-192.png, -mask-512.png
Les PNG sont versionnés : la publication n'a pas besoin de navigateur.
"""
import asyncio
import base64
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
SIZES = [("", 64), ("", 180), ("", 192), ("", 512), ("-mask", 192), ("-mask", 512)]


async def main():
    dirs = [ROOT / "src" / "catalogue" / "icons"] + sorted((ROOT / "src" / "apps").glob("*/icons"))
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for d in dirs:
            for svg in sorted(d.glob("*.svg")):
                if svg.stem.endswith("-mask"):
                    continue
                for variant, size in SIZES:
                    src = d / f"{svg.stem}{variant}.svg"
                    data = base64.b64encode(src.read_bytes()).decode()
                    pg = await b.new_page(viewport={"width": size, "height": size})
                    await pg.set_content(f'<body style="margin:0"><img src="data:image/svg+xml;base64,{data}" '
                                         f'style="width:{size}px;height:{size}px;display:block"></body>')
                    await pg.wait_for_timeout(60)
                    out = d / f"{svg.stem}{'-mask' if variant else ''}-{size}.png"
                    await pg.screenshot(path=out)
                    await pg.close()
                    print(" ", out.relative_to(ROOT))
        await b.close()


if __name__ == "__main__":
    asyncio.run(main())
