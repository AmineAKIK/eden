#!/usr/bin/env python3
"""Tests de bout en bout, dans un vrai navigateur (Chromium via Playwright).

    pip install -r tests/requirements.txt && python3 -m playwright install chromium
    python3 scripts/build.py && python3 tests/e2e.py

Ce qui est vérifié :
  - catalogue : affichage, service worker, ouverture d'une appli, retour, hors ligne ;
  - Les tables : un robot joue tout le parcours (prologue, test de départ, séance avec
    erreurs volontaires) sur deux tailles d'écran ; aucune erreur JavaScript, et rien
    ne déborde de l'écran.
Captures d'écran dans tests/out/ (ignoré par git).
"""
import asyncio
import functools
import http.server
import re
import sys
import threading
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(__file__).resolve().parent / "out"
SCREENS = [("android", 412, 780), ("petit", 360, 600)]
WRONG = {3, 6, 9}  # numéros des calculs où le robot se trompe exprès (une fois)


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    handler = functools.partial(Quiet, directory=str(ROOT))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f"http://127.0.0.1:{srv.server_port}/dist/"


async def catalogue(p, base):
    b = await p.chromium.launch()
    ctx = await b.new_context(**p.devices["Pixel 7"])
    pg = await ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(base)
    await pg.wait_for_function("navigator.serviceWorker.controller!==null||document.readyState==='complete'")
    await pg.wait_for_timeout(1200)
    await pg.screenshot(path=OUT / "catalogue.png")
    assert await pg.locator(".app").count() >= 1, "aucune appli au catalogue"
    await pg.locator(".app").first.click()
    await pg.wait_for_selector(".play")
    await pg.locator(".catbtn").click()
    await pg.wait_for_selector(".app")
    await pg.wait_for_timeout(800)
    await ctx.set_offline(True)
    await pg.reload()
    assert await pg.locator(".app").count() >= 1, "catalogue indisponible hors ligne"
    await pg.goto(base + "apps/tables/")
    assert await pg.locator(".play").count() == 1, "appli indisponible hors ligne"
    await b.close()
    assert not errs, errs
    print("  ✓ catalogue : affichage, navigation, hors ligne")


async def play_tables(p, base, name, w, h):
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={"width": w, "height": h}, is_mobile=True, has_touch=True)
    pg = await ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    await pg.goto(base + "apps/tables/")
    await pg.evaluate("__T.fast()")
    ev = pg.evaluate

    async def click(sel):
        await ev("s=>{const e=document.querySelector(s);e&&e.click()}", sel)

    async def typ(v):
        for ch in str(v):
            await click(f'.key[aria-label="{ch}"]')
        await click(".key.go")

    seen, shots, mains, plays, overflow = set(), 0, 0, 0, []
    for _ in range(4000):
        await pg.wait_for_timeout(25)
        if await ev("!!document.querySelector('.end')"):
            break
        if await ev("!!document.querySelector('.home .play')"):
            plays += 1
            if plays > 2:
                break
            await click(".play")
            continue
        sig = await ev("""(()=>{const t=document.querySelector('.tag'),b=document.querySelector('.bubble');
          return (t?t.textContent:'')+'|'+document.querySelectorAll('.tapme').length+'|'+
          document.querySelectorAll('.lab:not(:empty)').length+'|'+document.querySelectorAll('.eq').length+'|'+(b?b.textContent.slice(0,20):'')})()""")
        if sig not in seen:
            seen.add(sig)
            shots += 1
            await pg.screenshot(path=OUT / f"tables-{name}-{shots:03d}.png")
            bad = await ev("""(()=>{const w=document.querySelector('.screen>.work');if(!w)return 0;const r=w.getBoundingClientRect();
              let n=0;w.querySelectorAll('.eq,.ar,.lab,.lines,.big').forEach(e=>{if(e.offsetParent===null)return;const q=e.getBoundingClientRect();
              if(q.top<r.top-1||q.bottom>r.bottom+1||q.left<-1||q.right>innerWidth+1)n++;});return n})()""")
            if bad:
                overflow.append(sig)
        if await ev("!!document.querySelector('.tapme')"):
            await ev("document.querySelector('.tapme').click()")
            continue
        if await ev("!!document.querySelector('.bb')"):
            await ev("""(()=>{const t=document.querySelector('.eq span').textContent.match(/(\\d+) × (\\d+)/);
              [...document.querySelectorAll('.bb')].find(b=>b.textContent===String(t[1]*t[2])).click()})()""")
            continue
        info = await ev("""(()=>{const k=document.querySelector('.keys');if(!k||k.style.display==='none'||k.offsetParent===null)return null;
          const e=[...document.querySelectorAll('.eq')].filter(x=>x.querySelector('.ans')&&!x.querySelector('.ans.ok')&&x.offsetParent!==null).pop();
          if(!e)return null;return [e.querySelector('span').textContent,e.parentElement.classList.contains('work'),e.querySelector('.ans').textContent,
          (document.querySelector('.tag')||{}).textContent||'']})()""")
        if info:
            if info[2] != "?":
                continue
            m = re.match(r"\s*(\d+)\s*([×+−])\s*(\d+)", info[0])
            x, o, y = int(m[1]), m[2], int(m[3])
            v = x * y if o == "×" else (x + y if o == "+" else x - y)
            if info[1] and o == "×" and "Test" not in info[3]:
                mains += 1
                if mains in WRONG and not await ev("!!document.querySelector('.hb .ar')"):
                    await typ((x + 1) * y)
                    continue
            await typ(v)
            continue
        if await ev("!!document.querySelector('.big')"):
            await click(".big")
    ended = await ev("!!document.querySelector('.end')")
    st = await ev("JSON.stringify({placed:__T.ST.placed,log:__T.ST.log.length,t:__T.ST.t})")
    await b.close()
    assert ended, f"{name} : la séance n'est pas allée jusqu'au bout ({st})"
    assert not errs, f"{name} : erreurs JavaScript {errs[:3]}"
    assert not overflow, f"{name} : contenu hors de l'écran {overflow[:3]}"
    print(f"  ✓ tables ({name} {w}×{h}) : parcours complet, {mains} calculs, {shots} écrans, rien ne déborde")


async def main():
    OUT.mkdir(exist_ok=True)
    base = serve()
    async with async_playwright() as p:
        await catalogue(p, base)
        for name, w, h in SCREENS:
            await play_tables(p, base, name, w, h)
    print("\nTous les tests passent.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except AssertionError as e:
        print("  ✗", e)
        sys.exit(1)
