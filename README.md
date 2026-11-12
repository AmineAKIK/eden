# Les applis d'Eden

Les applications d'apprentissage d'Eden, réunies dans une seule application web installable (PWA) sur téléphone et tablette. Elle marche hors ligne une fois installée, et la progression d'Eden reste sur l'appareil.

**Adresse :** https://amineakik.github.io/eden/

| Appli | Pour qui | Ce qu'elle fait |
| --- | --- | --- |
| [Les tables](https://amineakik.github.io/eden/apps/tables/) | CE2 | Tables de multiplication avec Hector : une séance de 5 à 7 minutes par jour, techniques montrées avec des gestes, répétition espacée. |

## Installer sur un appareil

- **Android (Chrome)** : ouvrir l'adresse, puis toucher « Installer sur cet appareil » (ou menu ⋮ → « Installer l'application »).
- **iPhone / iPad (Safari)** : ouvrir l'adresse, bouton Partager → « Sur l'écran d'accueil ». Sur iPhone et iPad, la progression n'est protégée que si l'appli est installée de cette façon.

La progression est enregistrée dans le navigateur de l'appareil (une tablette et un téléphone ont chacun la leur). Elle ne se perd pas avec les mises à jour.

## Travailler sur le projet

Prérequis : Python 3.9+ et Node.js 18+ (Node sert seulement aux vérifications).

```sh
python3 scripts/build.py     # construit le site dans dist/
python3 scripts/check.py     # vérifie : syntaxe, voix de chaque phrase, manifeste, cache hors ligne
python3 tests/e2e.py         # un robot joue tout le parcours dans un vrai navigateur
python3 -m http.server       # puis ouvrir http://localhost:8000/dist/
```

Les tests de bout en bout demandent Playwright : `pip install -r tests/requirements.txt && python3 -m playwright install chromium`.

Publication, deux voies équivalentes (construire, vérifier, tester, puis mettre en ligne ; si une étape échoue, rien n'est publié) :

- **GitHub Actions** (`.github/workflows/deploy.yml`) : à chaque envoi sur `main`. Réglage du dépôt : Settings → Pages → Source « GitHub Actions ».
- **Branche `gh-pages`** : `python3 scripts/publish.py`, quand Actions n'est pas disponible. Réglage : Settings → Pages → Source « Deploy from a branch », branche `gh-pages`, dossier `/ (root)`.

## Organisation

```
src/
  catalogue/        page d'accueil, liste des applis, service worker, icônes
  shared/           ce qui sert à toutes les applis : polices, Hector (SVG)
  apps/tables/      Les tables : code (js/), styles, voix (voice/), icônes, app.json
scripts/            build.py, check.py, icons.py
tests/              e2e.py (Playwright)
docs/               architecture, ajouter une appli, pédagogie et voix des tables
```

## Documentation

- [Architecture et choix techniques](docs/ARCHITECTURE.md)
- [Ajouter une appli](docs/AJOUTER-UNE-APPLI.md)
- [Les tables : la pédagogie](docs/tables/PEDAGOGIE.md)
- [Les tables : la voix](docs/tables/VOIX.md)
- [Historique des versions](CHANGELOG.md)

## Crédits

- Polices Fredoka et Hanken Grotesk : SIL Open Font License.
- Voix d'Hector : générée avec ElevenLabs (voix « Victoria »).
