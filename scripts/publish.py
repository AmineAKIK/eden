#!/usr/bin/env python3
"""Publie le site sur la branche gh-pages (GitHub Pages « Deploy from a branch »).

    python3 scripts/publish.py            # construit, vérifie, teste, publie
    python3 scripts/publish.py --no-tests # sans les tests navigateur

À utiliser quand GitHub Actions n'est pas disponible. Sinon, un envoi sur main suffit :
le workflow .github/workflows/deploy.yml fait la même chose.
La branche gh-pages ne contient que le site construit (dist/), avec un commit par publication.
"""
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BRANCH = "gh-pages"


def run(*cmd, cwd=ROOT, check=True):
    print("  $", " ".join(cmd))
    return subprocess.run(cmd, cwd=cwd, check=check, text=True, capture_output=False)


def out(*cmd, cwd=ROOT):
    return subprocess.run(cmd, cwd=cwd, check=True, text=True, capture_output=True).stdout.strip()


def main():
    if out("git", "status", "--porcelain"):
        sys.exit("Des modifications ne sont pas enregistrées (commit) : publication annulée.")
    run(sys.executable, "scripts/build.py")
    run(sys.executable, "scripts/check.py")
    if "--no-tests" not in sys.argv:
        run(sys.executable, "tests/e2e.py")

    source = out("git", "rev-parse", "--short", "HEAD")
    remote = out("git", "remote", "get-url", "origin")
    with tempfile.TemporaryDirectory() as tmp:
        site = Path(tmp) / "site"
        has_branch = subprocess.run(["git", "ls-remote", "--exit-code", "--heads", "origin", BRANCH],
                                    cwd=ROOT, capture_output=True).returncode == 0
        if has_branch:
            run("git", "clone", "--depth", "1", "--branch", BRANCH, remote, str(site), cwd=tmp)
        else:
            site.mkdir()
            run("git", "init", "-q", "-b", BRANCH, cwd=site)
            run("git", "remote", "add", "origin", remote, cwd=site)
        for p in site.iterdir():
            if p.name != ".git":
                shutil.rmtree(p) if p.is_dir() else p.unlink()
        shutil.copytree(ROOT / "dist", site, dirs_exist_ok=True)
        run("git", "add", "-A", cwd=site)
        if not out("git", "status", "--porcelain", cwd=site):
            print("\nRien de nouveau à publier.")
            return
        name = out("git", "config", "user.name") or "Eden"
        email = out("git", "config", "user.email") or "noreply@github.com"
        run("git", "-c", f"user.name={name}", "-c", f"user.email={email}",
            "commit", "-q", "-m", f"Publication depuis main@{source}", cwd=site)
        run("git", "push", "origin", BRANCH, cwd=site)
    print(f"\nPublié sur la branche {BRANCH} (depuis main@{source}).")


if __name__ == "__main__":
    main()
