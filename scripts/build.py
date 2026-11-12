#!/usr/bin/env python3
"""Construit le site statique dans dist/ à partir de src/.

    python3 scripts/build.py

Aucune dépendance : Python 3.9+ seulement.

Sortie :
    dist/index.html               le catalogue
    dist/manifest.webmanifest     l'installation (PWA)
    dist/sw.js                    le hors-ligne
    dist/icons/                   icônes du catalogue
    dist/apps/<id>/index.html     chaque application, en un seul fichier
    dist/apps/<id>/icons/         icônes de l'application
"""
import base64
import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
DIST = ROOT / "dist"

FONTS = [  # (famille, graisse, fichier)
    ("Fredoka", 400, "fredoka-400.woff2"),
    ("Hanken", 400, "hanken-400.woff2"),
    ("Hanken", 600, "hanken-600.woff2"),
    ("Hanken", 800, "hanken-800.woff2"),
]


def read(p: Path) -> str:
    return p.read_text(encoding="utf-8")


def b64(p: Path) -> str:
    return base64.b64encode(p.read_bytes()).decode("ascii")


def fonts_css() -> str:
    """Polices intégrées : chaque page fonctionne seule, même hors ligne."""
    d = SRC / "shared" / "fonts"
    return "\n".join(
        f"@font-face{{font-family:'{fam}';font-weight:{w};font-style:normal;font-display:swap;"
        f"src:url(data:font/woff2;base64,{b64(d / f)}) format('woff2')}}"
        for fam, w, f in FONTS
    )


def update_js(root: str) -> str:
    """Script de mise à jour automatique, avec le chemin vers la racine du site."""
    return read(SRC / "shared" / "update.js").replace("@@ROOT@@", root).strip()


def install_js() -> str:
    """Aide à l'installation sur iPhone (bouton Partager, puis « Sur l'écran d'accueil »)."""
    return read(SRC / "shared" / "install.js").strip()


def hero_svg() -> str:
    return read(SRC / "shared" / "hector.svg").strip()


def load_apps(ids):
    apps = []
    for i in ids:
        meta = json.loads(read(SRC / "apps" / i / "app.json"))
        assert meta["id"] == i, f"app.json de {i} : id incohérent"
        apps.append(meta)
    return apps


def build_app(meta, catalogue) -> Path:
    """Une application = un seul fichier HTML (code, styles, polices, voix)."""
    d = SRC / "apps" / meta["id"]
    out = DIST / "apps" / meta["id"]
    out.mkdir(parents=True, exist_ok=True)

    hero = hero_svg().replace("\\", "\\\\").replace("'", "\\'")
    js = [f"const APP_VERSION='{meta['version']}';", f"const HERO_SVG='{hero}';"]
    js += [read(d / f) for f in meta["js"]]
    js = "\n".join(js)

    audio = {}
    if meta.get("voice"):
        for f in sorted((d / meta["voice"]).glob("*.mp3")):
            audio[f.stem] = b64(f)
    marker = "/*@@AUDIO@@*/{}"
    assert marker in js, "marqueur audio absent du code"
    js = js.replace(marker, json.dumps(audio, separators=(",", ":")))
    assert "</script" not in js

    css = fonts_css() + "\n" + "\n".join(read(d / f) for f in meta["css"])
    up = "../../"
    html = f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{meta['title']}</title>
<meta name="description" content="{meta['description']}">
<meta name="theme-color" content="{meta['themeColor']}">
<link rel="manifest" href="{up}manifest.webmanifest">
<link rel="icon" href="icons/{meta['id']}-64.png">
<link rel="apple-touch-icon" href="{up}icons/eden-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="{catalogue['shortName']}">
<style>{css}</style>
</head>
<body>
<div id="nojs" style="padding:28px 20px;font:20px/1.4 system-ui,sans-serif;text-align:center">Chargement…</div>
<script>
{install_js()}
</script>
<script>
{js}
</script>
<script>
try{{navigator.storage&&navigator.storage.persist&&navigator.storage.persist();}}catch(e){{}}
{update_js(up)}
</script>
</body>
</html>
"""
    (out / "index.html").write_text(html, encoding="utf-8")
    shutil.copytree(d / "icons", out / "icons", dirs_exist_ok=True,
                    ignore=shutil.ignore_patterns("*.svg"))
    return out


def build_catalogue(cat, apps):
    d = SRC / "catalogue"
    entries = [{
        "id": a["id"], "name": a["name"], "path": f"apps/{a['id']}/",
        "icon": f"apps/{a['id']}/icons/{a['id']}-192.png", "storageKey": a["storageKey"],
    } for a in apps]
    html = read(d / "index.html")
    for k, v in {
        "@@NAME@@": cat["name"], "@@DESCRIPTION@@": cat["description"], "@@THEME@@": cat["themeColor"],
        "@@FONTS@@": fonts_css(), "@@HERO@@": hero_svg(),
        "@@APPS@@": json.dumps(entries, ensure_ascii=False),
        "@@PROGRESS@@": read(d / "progress.js"),
        "@@UPDATE@@": update_js("./"),
        "@@INSTALL@@": install_js(),
    }.items():
        assert k in html, f"{k} absent du gabarit du catalogue"
        html = html.replace(k, v)
    (DIST / "index.html").write_text(html, encoding="utf-8")
    shutil.copytree(d / "icons", DIST / "icons", dirs_exist_ok=True,
                    ignore=shutil.ignore_patterns("*.svg"))

    manifest = {
        "id": "./", "name": cat["name"], "short_name": cat["shortName"], "description": cat["description"],
        "lang": "fr", "dir": "ltr", "start_url": "./", "scope": "./", "display": "standalone",
        "orientation": "portrait", "background_color": cat["backgroundColor"], "theme_color": cat["themeColor"],
        "icons": [
            {"src": "icons/eden-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": "icons/eden-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
            {"src": "icons/eden-mask-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable"},
            {"src": "icons/eden-mask-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
        "shortcuts": [{"name": a["title"], "short_name": a["name"], "url": f"apps/{a['id']}/",
                       "icons": [{"src": f"apps/{a['id']}/icons/{a['id']}-192.png", "sizes": "192x192",
                                  "type": "image/png"}]} for a in apps],
    }
    (DIST / "manifest.webmanifest").write_text(json.dumps(manifest, ensure_ascii=False, indent=2),
                                               encoding="utf-8")


def build_sw():
    """Liste de tout le site + version = empreinte du contenu : chaque changement met à jour les appareils."""
    files = sorted(p.relative_to(DIST).as_posix() for p in DIST.rglob("*")
                   if p.is_file() and p.name not in ("sw.js", ".nojekyll"))
    urls = ["./"] + [f"{f[:-len('index.html')]}" if f.endswith("index.html") and f != "index.html" else f
                     for f in files]
    h = hashlib.sha256()
    for f in files:
        h.update(f.encode())
        h.update((DIST / f).read_bytes())
    sw = read(SRC / "catalogue" / "sw.js")
    sw = sw.replace("@@VER@@", h.hexdigest()[:12]).replace("@@FILES@@", json.dumps(urls))
    (DIST / "sw.js").write_text(sw, encoding="utf-8")
    return h.hexdigest()[:12], len(urls)


def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    cat = json.loads(read(SRC / "catalogue" / "catalogue.json"))
    apps = load_apps(cat["apps"])
    for a in apps:
        out = build_app(a, cat)
        size = (out / "index.html").stat().st_size // 1024
        print(f"  apps/{a['id']}/  v{a['version']}  {size} Ko")
    build_catalogue(cat, apps)
    (DIST / ".nojekyll").write_text("")
    ver, n = build_sw()
    print(f"  catalogue + sw.js  (version {ver}, {n} fichiers en cache)")


if __name__ == "__main__":
    main()
