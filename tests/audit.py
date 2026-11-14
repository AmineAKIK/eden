#!/usr/bin/env python3
"""Audit d'affichage : un robot joue tout le parcours sur des tailles d'écran réelles
(téléphone dans le navigateur, avec ses barres, et appli installée), capture chaque écran
et signale ce qui gêne l'enfant :
  - champ de réponse caché (par le clavier, la bulle, ou coupé par le bord) ;
  - élément à toucher hors de l'écran ou recouvert ;
  - texte de la bulle qui ne tient pas ;
  - dessin coupé ou trop petit pour être lu.

    python3 scripts/build.py && python3 tests/audit.py [--shots]
Captures dans tests/out/audit/<écran>/ ; planches-contact dans tests/out/audit/.
"""
import asyncio, functools, http.server, json, re, sys, threading
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(__file__).resolve().parent / "out" / "audit"
# (nom, largeur, hauteur) : la zone réellement visible de la page
SCREENS = [
    ("iphone-se-safari", 375, 548),     # iPhone SE, Safari avec ses barres
    ("iphone-12-chrome", 390, 664),     # iPhone 12/13/14, Chrome ou Safari
    ("iphone-12-installe", 390, 800),   # iPhone 12, icône sur l'écran d'accueil
    ("android-petit", 360, 560),        # petit Android, Chrome
    ("android", 412, 780),
]
WRONG = {2, 5, 8}

CHECK = r"""(()=>{
  const out=[],vis=e=>e&&e.offsetParent!==null&&getComputedStyle(e).visibility!=='hidden';
  const R=e=>e.getBoundingClientRect(),H=innerHeight,W=innerWidth;
  const inter=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  const keys=document.querySelector('.screen>.keys'),kr=vis(keys)?R(keys):null;
  const tr=document.querySelector('.talkrow'),trr=vis(tr)?R(tr):null;
  const work=document.querySelector('.screen>.work'),wr=work?R(work):null;
  const covered=(e,name)=>{const r=R(e);if(r.width<2)return;
    if(r.top<-1||r.bottom>H+1||r.left<-1||r.right>W+1){out.push(name+' hors écran');return;}
    if(wr&&work.contains(e)&&(r.top<wr.top-1||r.bottom>wr.bottom+1))out.push(name+' coupé par la zone de jeu');
    if(kr&&inter(r,kr)>4)out.push(name+' sous le clavier');
    if(trr&&inter(r,trr)>4)out.push(name+' sous la bulle');
    const pts=[[.5,.5],[.15,.5],[.85,.5]];for(const[x,y]of pts){const t=document.elementFromPoint(r.left+r.width*x,r.top+r.height*y);
      if(t&&!e.contains(t)&&!t.contains(e)){out.push(name+' recouvert par .'+(t.className||t.tagName));break;}}};
  document.querySelectorAll('.eq .ans').forEach(a=>{if(vis(a)&&!a.classList.contains('ok'))covered(a,'réponse');});
  document.querySelectorAll('.eq').forEach(a=>{if(vis(a))covered(a,'calcul « '+a.textContent.trim().slice(0,14)+' »');});
  document.querySelectorAll('.tapme,.bb,.big,.play,.tcard').forEach(a=>{if(vis(a))covered(a,'bouton .'+a.className.split(' ')[0]);});
  if(work){[...work.querySelectorAll('.ar,.lab,.lines,.qz,.hb,.pks,.bfield')].forEach(e=>{if(!vis(e))return;const r=R(e);
    if(r.top<wr.top-1||r.bottom>wr.bottom+1||r.left<-1||r.right>W+1)out.push('dessin coupé (.'+e.className.split(' ')[0]+')');});
    const a=work.querySelector('.ar');if(a&&vis(a)){const d=parseFloat(getComputedStyle(a).getPropertyValue('--d'));if(d<9)out.push('pièces trop petites ('+d+'px)');}}
  if(out.some(x=>/coupé/.test(x))&&work){const a=work.querySelector('.ar');out.push('[mesures : zone '+work.clientHeight+'px, contenu '+[...work.children].map(k=>k.className+':'+k.offsetHeight).join(',')+', pièces '+(a?getComputedStyle(a).getPropertyValue('--d'):'-')+']');}
  const b=document.querySelector('.bubble');if(vis(b)&&b.textContent){const rg=document.createRange();rg.selectNodeContents(b);const q=rg.getBoundingClientRect(),br=R(b);
    if(q.top<br.top-1||q.bottom>br.bottom+1)out.push('texte de bulle coupé');
    const fs=parseFloat(getComputedStyle(b).fontSize);if(fs<14)out.push('texte de bulle trop petit ('+fs+'px)');}
  return out;})()"""


def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    s = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Q, directory=str(ROOT)))
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return f"http://127.0.0.1:{s.server_port}/dist/"


async def run(p, base, name, w, h, shots):
    d = OUT / name
    d.mkdir(parents=True, exist_ok=True)
    for f in d.glob("*.png"): f.unlink()
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, is_mobile=True, has_touch=True)
    pg = await ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(base + "apps/tables/")
    await pg.evaluate("__T.fast()")
    ev = pg.evaluate
    async def click(sel): await ev("s=>{const e=document.querySelector(s);e&&e.click()}", sel)
    async def typ(v):
        for ch in str(v): await click(f'.key[aria-label="{ch}"]')
        await click(".key.go")
    seen, n, mains, plays, problems = set(), 0, 0, 0, {}
    async def snap(tag):
        nonlocal n
        await pg.wait_for_timeout(450)
        pb = await ev(CHECK)
        n += 1
        if shots or pb: await pg.screenshot(path=d / f"{n:03d}.png")
        if pb: problems[f"{n:03d} {tag}"] = sorted(set(pb))
    for _ in range(5000):
        await pg.wait_for_timeout(25)
        if await ev("!!document.querySelector('.end')"):
            await snap("fin"); break
        if await ev("!!document.querySelector('.home .play')"):
            plays += 1
            await snap("accueil")
            if plays > 2: break
            await click(".play"); continue
        sig = await ev("""(()=>{const t=document.querySelector('.tag'),b=document.querySelector('.bubble'),k=document.querySelector('.screen>.keys');
          return (t?t.textContent:'')+'|'+document.querySelectorAll('.tapme').length+'|'+(k&&k.style.display!=='none')+'|'+
          document.querySelectorAll('.lab:not(:empty)').length+'|'+document.querySelectorAll('.eq').length+'|'+(b?b.textContent.slice(0,30):'')})()""")
        if sig not in seen:
            seen.add(sig); await snap(sig[:40])
        if await ev("!!document.querySelector('.tapme')"):
            await ev("document.querySelector('.tapme').click()"); continue
        if await ev("!!document.querySelector('.bb')"):
            await ev("""(()=>{const t=document.querySelector('.eq span').textContent.match(/(\\d+) × (\\d+)/);
              [...document.querySelectorAll('.bb')].find(b=>b.textContent===String(t[1]*t[2])).click()})()"""); continue
        info = await ev("""(()=>{const k=document.querySelector('.keys');if(!k||k.style.display==='none'||k.offsetParent===null)return null;
          const e=[...document.querySelectorAll('.eq')].filter(x=>x.querySelector('.ans')&&!x.querySelector('.ans.ok')&&x.offsetParent!==null).pop();
          if(!e)return null;return [e.querySelector('span').textContent,e.parentElement.classList.contains('work'),e.querySelector('.ans').textContent,
          (document.querySelector('.tag')||{}).textContent||'']})()""")
        if info:
            if info[2] != "?": continue
            m = re.match(r"\s*(\d+)\s*([×+−])\s*(\d+)", info[0]); x, o, y = int(m[1]), m[2], int(m[3])
            v = x * y if o == "×" else (x + y if o == "+" else x - y)
            if info[1] and o == "×" and "Test" not in info[3]:
                mains += 1
                if mains in WRONG and not await ev("!!document.querySelector('.hb .ar')"):
                    await typ((x + 1) * y); continue
            await typ(v); continue
        if await ev("!!document.querySelector('.big')"): await click(".big")
    ended = await ev("!!document.querySelector('.end')")
    # l'espace parents aussi
    await b.close()
    return dict(name=name, size=f"{w}×{h}", screens=n, ended=ended, errors=errs, problems=problems)


IPHONE_UA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 "
             "(KHTML, like Gecko) CriOS/126.0 Mobile/15E148 Safari/604.1")
DEMO = {"intro": True, "chap": 2, "placed": True, "t": {"cut": 1, "ten": 0}, "pre": {"add": {"ok": 1, "ko": 1, "last": 0}},
        "hardIdx": 1, "voice": True,
        "f": {**{f"{a}-{b}": {"box": 4, "due": 99999, "ok": 3, "ko": 0} for a in range(2, 6) for b in range(a, 6)},
              "6-7": {"box": 1, "due": 0, "ok": 1, "ko": 2}, "6-8": {"box": 2, "due": 0, "ok": 2, "ko": 1}, "7-8": {"box": 1, "due": 0, "ok": 0, "ko": 1}},
        "log": []}
WIDE = """(()=>{const out=[];const W=innerWidth;document.querySelectorAll('body *').forEach(e=>{if(e.offsetParent===null&&getComputedStyle(e).position!=='fixed')return;
  const r=e.getBoundingClientRect();if(r.width&&(r.right>W+1||r.left<-1)&&!e.closest('.arr,.ar'))out.push('déborde à droite : .'+(e.className||e.tagName));});return [...new Set(out)].slice(0,5)})()"""


async def extras(p, base, name, w, h):
    """Écrans hors séance : accueil, aide à l'installation, espace parents, grille, techniques, téléphone tourné."""
    d = OUT / name
    d.mkdir(parents=True, exist_ok=True)
    for f in d.glob("x-*.png"): f.unlink()
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, is_mobile=True, has_touch=True, user_agent=IPHONE_UA)
    pg = await ctx.new_page()
    errs, problems = [], {}
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(base + "apps/tables/")
    demo = dict(DEMO)
    await pg.evaluate("s=>{const t=Math.floor((Date.now()-new Date().getTimezoneOffset()*60000)/86400000);s.log=[{d:t-6,n:10,ok:7,m:6},{d:t-4,n:12,ok:9,m:8},{d:t-2,n:12,ok:10,m:9},{d:t,n:11,ok:10,m:10}];localStorage.setItem('eden:tables',JSON.stringify(s))}", demo)
    await pg.reload()
    await pg.wait_for_selector(".play")
    async def shot(tag):
        await pg.wait_for_timeout(400)
        overlay = tag in ("installer", "parents", "parents-progres", "parents-reglages", "parents-sauvegarde", "parents-methode", "parents-confirmer", "tourne", "roue-appui-court")  # par-dessus l'accueil : normal
        pb = ([] if overlay else await pg.evaluate(CHECK)) + (await pg.evaluate(WIDE))
        await pg.screenshot(path=d / f"x-{tag}.png", full_page=False)
        if pb: problems[tag] = sorted(set(pb))
    await shot("accueil")
    await pg.evaluate("EdenInstall.show()"); await shot("installer")
    await pg.evaluate("document.querySelector('.ins-bg').remove();openPanel()"); await shot("parents")
    rowjs = "t=>[...document.querySelectorAll('.panel .prow2')].find(r=>r.textContent.includes(t)).click()"
    for t, tag in [("Ses progrès", "parents-progres"), ("Réglages", "parents-reglages"), ("Sauvegarde", "parents-sauvegarde"), ("Comment Hector", "parents-methode")]:
        await pg.evaluate("document.querySelector('.panel .pnav').click()") if tag != "parents-progres" else None
        await pg.evaluate(rowjs, t); await shot(tag)
    await pg.evaluate("document.querySelector('.panel .pnav').click()")
    await pg.evaluate(rowjs, "Réglages"); await pg.evaluate("document.querySelector('.panel .pbody').scrollTop=9999")
    await pg.evaluate(rowjs, "Effacer"); await shot("parents-confirmer")
    await pg.evaluate("document.querySelector('.psheet .pbtn').click()")
    await pg.evaluate("document.querySelector('.panel').remove();showGrid()"); await shot("grille")
    await pg.evaluate("document.querySelectorAll('.grid button.gc')[45].click()"); await shot("grille-case")
    await pg.evaluate("showHome()"); await pg.click(".gear"); await shot("roue-appui-court")
    await pg.evaluate("showTech()"); await shot("techniques")
    await pg.set_viewport_size({"width": h, "height": w}); await shot("tourne")
    turned = await pg.evaluate("getComputedStyle(document.querySelector('.turnmsg')).display")
    if turned == "none": problems["tourne"] = ["téléphone tourné : pas de message"]
    await b.close()
    return dict(name=name + " (hors séance)", size=f"{w}×{h}", screens=7, ended=True, errors=errs, problems=problems)


# ---------------- Plus et moins (grande section) ----------------
CHECK_PM = r"""(()=>{
  const out=[],vis=e=>e&&e.offsetParent!==null&&getComputedStyle(e).visibility!=='hidden';
  const R=e=>e.getBoundingClientRect(),H=innerHeight,W=innerWidth;
  const inter=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  const strip=document.querySelector('.strip'),tr=document.querySelector('.talkrow'),work=document.querySelector('.screen>.work');
  const sr=strip?R(strip):null,trr=tr?R(tr):null,wr=work?R(work):null;
  document.querySelectorAll('.nb').forEach(b=>{const r=R(b);if(r.top<-1||r.bottom>H+1||r.left<-1||r.right>W+1)out.push('nombre '+b.textContent+' hors écran');
    if(r.height<40||r.width<40)out.push('nombre '+b.textContent+' trop petit à toucher ('+Math.round(r.width)+'×'+Math.round(r.height)+')');});
  if(sr&&trr&&inter(sr,trr)>4)out.push('bulle sur la bande des nombres');
  const sc=document.querySelector('.scene');
  if(sc&&wr){const r=R(sc);if(r.top<wr.top-1||r.bottom>wr.bottom+1)out.push('scène coupée');if(sr&&inter(r,sr)>4)out.push('scène sous la bande des nombres');}
  document.querySelectorAll('.scene .coin').forEach(g=>{const r=R(g);if(!r.width)return;
    if(r.top<0||r.bottom>H||r.left<0||r.right>W)out.push('pièce hors écran');
    if(g.classList.contains('tap')){if(r.width<38)out.push('pièce à toucher trop petite ('+Math.round(r.width)+' px)');
      const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);if(t&&!g.contains(t))out.push('pièce à toucher recouverte par .'+(t.getAttribute('class')||t.tagName));}});
  const b=document.querySelector('.bubble');if(vis(b)&&b.textContent){const rg=document.createRange();rg.selectNodeContents(b);const q=rg.getBoundingClientRect(),br=R(b);
    if(q.top<br.top-1||q.bottom>br.bottom+1)out.push('texte de bulle coupé');if(parseFloat(getComputedStyle(b).fontSize)<14)out.push('texte de bulle trop petit');}
  return out;})()"""


async def run_pm(p, base, name, w, h, shots):
    """Plus et moins : trois parties complètes (test de départ puis deux parties), avec des erreurs volontaires."""
    d = OUT / ("pm-" + name)
    d.mkdir(parents=True, exist_ok=True)
    for f in d.glob("*.png"): f.unlink()
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, is_mobile=True, has_touch=True)
    pg = await ctx.new_page()
    errs, problems = [], {}
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    await pg.goto(base + "apps/calculs/")
    await pg.evaluate("__T.fast()")
    ev = pg.evaluate
    seen, n, ends, wrong, k = set(), 0, 0, 0, 0
    async def snap(tag):
        nonlocal n
        await pg.wait_for_timeout(350)
        pb = await ev(CHECK_PM)
        n += 1
        if shots or pb: await pg.screenshot(path=d / f"{n:03d}.png")
        if pb: problems[f"{n:03d} {tag}"] = sorted(set(pb))
    for _ in range(6000):
        await pg.wait_for_timeout(20)
        if await ev("!!document.querySelector('.end')"):
            ends += 1
            await snap("fin")
            if ends >= 3: break
            await ev("document.querySelector('.end .big').click()"); continue
        if await ev("!!document.querySelector('.home .play')"):
            await ev("document.querySelector('.home .play').click()"); continue
        sig = await ev("""(document.querySelector('.bubble')||{}).textContent+'|'+document.querySelectorAll('.coin.tap').length+'|'+!!document.querySelector('.strip.on')+'|'+document.querySelectorAll('.scene .coin').length""")
        if sig not in seen:
            seen.add(sig); await snap(sig[:40])
        if await ev("!!document.querySelector('.coin.tap')"):
            await ev("document.querySelector('.coin.tap').dispatchEvent(new MouseEvent('click',{bubbles:true}))"); continue
        if await ev("!!document.querySelector('.strip.on')"):
            a = (await ev("__T.parse(window.__CUR)"))["ans"]
            k += 1
            if k % 4 == 2 and wrong < 8:
                wrong += 1; a = a + 1 if a < 10 else a - 1
            await ev(f"document.querySelectorAll('.nb')[{a}].click()"); continue
    st = await ev("JSON.stringify({placed:__T.ST.placed,log:__T.ST.log.length,gold:__T.ST.gold,t:__T.ST.t})")
    await b.close()
    return dict(name="plus et moins " + name, size=f"{w}×{h}", screens=n, ended=ends >= 3, errors=errs, problems=problems, state=st)


DEMO_PM = {"intro": True, "placed": True, "voice": True, "gold": 37, "t": {"keep": 1, "back": 1, "dbl": 1},
           "f": {**{f"a{a}+1": {"box": 4, "due": 99999, "ok": 3, "ko": 0} for a in range(1, 10)},
                 "s5-1": {"box": 3, "due": 99999, "ok": 3, "ko": 0}, "s4-1": {"box": 2, "due": 0, "ok": 2, "ko": 1},
                 "a3+2": {"box": 1, "due": 0, "ok": 1, "ko": 2}, "s6-2": {"box": 1, "due": 0, "ok": 0, "ko": 1}},
           "log": []}


async def extras_pm(p, base, name, w, h):
    """Plus et moins hors partie : accueil, trésor, espace parents, fin, téléphone tourné."""
    d = OUT / ("pm-" + name)
    d.mkdir(parents=True, exist_ok=True)
    b = await p.chromium.launch()
    ctx = await b.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, is_mobile=True, has_touch=True, user_agent=IPHONE_UA)
    pg = await ctx.new_page()
    errs, problems = [], {}
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(base + "apps/calculs/")
    await pg.evaluate("s=>{const t=Math.floor((Date.now()-new Date().getTimezoneOffset()*60000)/86400000);s.log=[{d:t-5,n:8,ok:5,m:4,g:5},{d:t-3,n:8,ok:6,m:7,g:6},{d:t,n:8,ok:7,m:10,g:7}];localStorage.setItem('eden:calculs',JSON.stringify(s))}", DEMO_PM)
    await pg.reload()
    await pg.wait_for_selector(".play")
    await pg.evaluate("__T.fast()")
    async def shot(tag, check=True):
        await pg.wait_for_timeout(450)
        pb = ((await pg.evaluate(CHECK_PM)) if check else []) + (await pg.evaluate(WIDE))
        await pg.screenshot(path=d / f"x-{tag}.png")
        if pb: problems[tag] = sorted(set(pb))
    await shot("accueil")
    await pg.click(".pill"); await shot("tresor")
    await pg.evaluate("showHome()"); await pg.evaluate("openPanel()"); await shot("parents", False)
    rowjs = "t=>[...document.querySelectorAll('.panel .prow2')].find(r=>r.textContent.includes(t)).click()"
    for t, tag in [("Ses progrès", "parents-progres"), ("Réglages", "parents-reglages"), ("Sauvegarde", "parents-sauvegarde"), ("Comment Hector", "parents-methode")]:
        if tag != "parents-progres": await pg.evaluate("document.querySelector('.panel .pnav').click()")
        await pg.evaluate(rowjs, t); await shot(tag, False)
    await pg.evaluate("showHome()"); await pg.evaluate("endScreen(4)"); await shot("fin")
    await pg.set_viewport_size({"width": h, "height": w}); await shot("tourne", False)
    if await pg.evaluate("getComputedStyle(document.querySelector('.turnmsg')).display") == "none":
        problems["tourne"] = ["téléphone tourné : pas de message"]
    await b.close()
    return dict(name="plus et moins " + name + " (hors partie)", size=f"{w}×{h}", screens=9, ended=True, errors=errs, problems=problems)


async def main():
    shots = "--shots" in sys.argv
    base = serve()
    async with async_playwright() as p:
        only = next((a.split("=")[1] for a in sys.argv if a.startswith("--app=")), None)
        jobs = []
        if only in (None, "tables"):
            jobs += [run(p, base, *s, shots) for s in SCREENS] + [extras(p, base, *s) for s in SCREENS if s[0].startswith("iphone")]
        if only in (None, "calculs"):
            jobs += [run_pm(p, base, *s, shots) for s in SCREENS] + [extras_pm(p, base, *s) for s in SCREENS if s[0].startswith("iphone")]
        res = await asyncio.gather(*jobs)
    bad = 0
    for r in res:
        k = len(r["problems"]) + len(r["errors"]) + (0 if r["ended"] else 1)
        bad += k
        print(f"{'✓' if not k else '✗'} {r['name']} ({r['size']}) : {r['screens']} écrans, {len(r['problems'])} avec problème" + ("" if r["ended"] else ", PARCOURS INCOMPLET"))
        for s, pb in list(r["problems"].items())[:40]: print("     ", s, "→", "; ".join(pb))
        for e in r["errors"][:3]: print("      erreur JS :", e)
    (OUT / "rapport.json").write_text(json.dumps(res, ensure_ascii=False, indent=1))
    sys.exit(1 if bad else 0)

if __name__ == "__main__":
    asyncio.run(main())
