#!/usr/bin/env python3
"""Écrit le texte à enregistrer pour une appli, dans l'ordre de ses phrases (js/00_phrases.js).

    python3 scripts/voice_script.py calculs > texte.txt

Une phrase par paragraphe. Le comptage (« Un, deux, trois… ») est écrit sur une seule ligne :
c'est la façon naturelle de le dire, et chaque nombre est découpé ensuite.
Demande Node.js.
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
app = sys.argv[1] if len(sys.argv) > 1 else "calculs"
src = (ROOT / "src" / "apps" / app / "js" / "00_phrases.js").read_text(encoding="utf-8")
out = subprocess.run(["node", "-e", src + "\nconst AUDIO={};console.log(JSON.stringify(Object.entries(V)))"],
                     capture_output=True, text=True, check=True).stdout
items = json.loads(out)
lines, count_done = [], False
for k, t in items:
    if k.startswith("cnt_"):
        if not count_done:
            words = [v for kk, v in items if kk.startswith("cnt_")]
            lines.append(", ".join([words[0]] + [w.lower() for w in words[1:]]) + ".")
            count_done = True
        continue
    lines.append(t)
print("\n\n".join(lines))
