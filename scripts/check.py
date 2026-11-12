#!/usr/bin/env python3
"""Vérifications avant publication (lancées aussi par GitHub Actions).

    python3 scripts/build.py && python3 scripts/check.py

Demande Node.js (pour vérifier la syntaxe du JavaScript).
Échoue (code 1) au premier problème trouvé dans :
  1. la syntaxe JavaScript de chaque page construite et du service worker ;
  2. les phrases : chaque phrase dite dans le code existe, et a sa voix (aucune voix robot) ;
  3. le site construit : manifeste, icônes, service worker, liens du catalogue.
"""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC, DIST = ROOT / "src", ROOT / "dist"
errors = []


def fail(msg):
    errors.append(msg)
    print("  ✗", msg)


def ok(msg):
    print("  ✓", msg)


def node(code: str) -> str:
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(code)
    r = subprocess.run(["node", f.name], capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(r.stderr.strip()[-600:])
    return r.stdout


def check_syntax():
    """Chaque script de chaque page construite, et le service worker."""
    pages = sorted(DIST.rglob("*.html"))
    n = 0
    for page in pages:
        for i, js in enumerate(re.findall(r"<script>(.*?)</script>", page.read_text(encoding="utf-8"), re.S)):
            n += 1
            _node_check(js, f"{page.relative_to(DIST)} (script {i + 1})")
    _node_check((DIST / "sw.js").read_text(encoding="utf-8"), "sw.js")
    ok(f"syntaxe JavaScript : {n} scripts dans {len(pages)} pages, et sw.js")


def _node_check(js, where):
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(js)
    r = subprocess.run(["node", "--check", f.name], capture_output=True, text=True)
    if r.returncode:
        msg = [l for l in r.stderr.splitlines() if "Error" in l]
        fail(f"{where} : {msg[0] if msg else r.stderr.strip()[-200:]}")


def check_voice_tables():
    d = SRC / "apps" / "tables"
    phrases = (d / "js" / "00_phrases.js").read_text(encoding="utf-8")
    app = (d / "js" / "10_app.js").read_text(encoding="utf-8")
    seq = re.search(r"^function seqOf\(k\)\{.*?^\}", app, re.S | re.M)
    if not seq:
        return fail("tables : fonction seqOf introuvable")
    clips = sorted(p.stem for p in (d / "voice").glob("*.mp3"))
    code = "\n".join((d / "js" / f).read_text(encoding="utf-8") for f in
                     ["10_app.js", "20_flow.js", "30_session.js"])
    # clés littérales passées à say(...) / say0(...) / sy(S, ...)
    used = set(re.findall(r"\bsay0?\('([a-z0-9_]+)'", code)) | set(re.findall(r"\bsy\(S,'([a-z0-9_]+)'\)", code))
    used |= set(re.findall(r"\b(?:intro|cut|ten1|afterCut|afterFill|count):'([a-z0-9_]+)'", code))
    used |= set(re.findall(r"'(ok[1-6]|tech_[a-z0-9_]+|diag_[a-z]+|g_[a-z]+)'", code))
    used = {k for k in used if not k.endswith('_')}  # préfixes de clés construites (q_, c_…)
    out = node(phrases + "\nconst AUDIO=" + json.dumps({c: 1 for c in clips}) + ";\n" + seq.group(0) + """
const used=%s;const res={undef:[],nosound:[]};
for(const k of used){if(!(k in V))res.undef.push(k);}
for(const k of Object.keys(V)){const s=seqOf(k);if(!s)continue;if(s.some(a=>!AUDIO[a]))res.nosound.push(k);}
for(const k of used){if(k in V&&!seqOf(k))res.nosound.push(k);}
console.log(JSON.stringify(res));""" % json.dumps(sorted(used)))
    res = json.loads(out)
    if res["undef"]:
        fail("tables : phrases utilisées mais absentes de V : " + ", ".join(res["undef"]))
    if res["nosound"]:
        fail("tables : phrases sans voix : " + ", ".join(sorted(set(res["nosound"]))))
    if not res["undef"] and not res["nosound"]:
        ok(f"tables : {len(used)} phrases utilisées, toutes avec voix ({len(clips)} clips)")


def check_site():
    m = json.loads((DIST / "manifest.webmanifest").read_text(encoding="utf-8"))
    for ic in m["icons"] + [i for s in m.get("shortcuts", []) for i in s["icons"]]:
        if not (DIST / ic["src"]).is_file():
            fail(f"manifeste : icône manquante {ic['src']}")
    if not any(i.get("purpose") == "maskable" for i in m["icons"]):
        fail("manifeste : pas d'icône « maskable »")
    sw = (DIST / "sw.js").read_text(encoding="utf-8")
    files = json.loads(re.search(r"const FILES=(\[.*?\]);", sw).group(1))
    for f in files:
        p = DIST / (f + "index.html" if f.endswith("/") else f)
        if not p.is_file():
            fail(f"sw.js : fichier en cache introuvable {f}")
    cat = (DIST / "index.html").read_text(encoding="utf-8")
    apps = json.loads(re.search(r"const APPS=(\[.*?\]);", cat).group(1))
    for a in apps:
        for f in (a["path"] + "index.html", a["icon"]):
            if not (DIST / f).is_file():
                fail(f"catalogue : {a['id']} → fichier manquant {f}")
    if "@@" in cat or "@@" in sw:
        fail("un marqueur @@…@@ n'a pas été remplacé")
    if not errors:
        ok(f"site : manifeste, {len(files)} fichiers en cache, {len(apps)} appli(s) au catalogue")


def main():
    if not DIST.exists():
        sys.exit("dist/ absent : lancer d'abord scripts/build.py")
    check_syntax()
    check_voice_tables()
    check_site()
    if errors:
        print(f"\n{len(errors)} problème(s).")
        sys.exit(1)
    print("\nTout est bon.")


if __name__ == "__main__":
    main()
