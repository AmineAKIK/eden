# Les applis d'Eden : consignes pour travailler sur ce dépôt

- Projet pour un enfant (Eden, CE2). Toute l'interface, les textes et la documentation sont en français.
- Lire `docs/ARCHITECTURE.md` avant de modifier la structure, `docs/tables/PEDAGOGIE.md` avant de toucher au parcours des tables.
- Avant tout envoi : `python3 scripts/build.py && python3 scripts/check.py && python3 tests/e2e.py`. Ne pas envoyer si quelque chose échoue.
- Jamais de voix de synthèse : chaque phrase dite doit avoir son mp3 dans `voice/` (check.py le vérifie).
- Les mises à jour s'appliquent seules (`src/shared/update.js`, `src/catalogue/sw.js`) : ne jamais demander d'effacer les données du site.
- Ne jamais changer une clé de `localStorage` ni retirer un champ de l'état sans migration : la progression d'Eden est sur ses appareils.
- Une appli = un seul fichier construit ; pas de framework, pas de dépendance externe chargée depuis un CDN (l'appli doit marcher hors ligne).
- Mettre à jour `version` dans `app.json` et `CHANGELOG.md` à chaque changement visible.
- `dist/` n'est pas versionné. Publication : GitHub Actions à chaque envoi sur `main`, ou `python3 scripts/publish.py` (branche `gh-pages`).
