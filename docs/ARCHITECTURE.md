# Architecture

Un site statique, sans serveur ni base de données, publié sur GitHub Pages. Tout se construit avec `scripts/build.py` (Python, sans dépendance).

## Les pièces

```
dist/
  index.html               catalogue
  manifest.webmanifest     ce qui rend le site installable (nom, icônes, couleurs)
  sw.js                    service worker : copie locale pour le hors-ligne
  icons/                   icônes du catalogue
  apps/<id>/index.html     une appli = un seul fichier
  apps/<id>/icons/         icônes de l'appli
```

## Choix et raisons

**Une appli = un seul fichier HTML.** Code, styles, polices et voix (mp3 en base64) sont intégrés. Une appli s'ouvre donc d'un coup, sans fichier manquant possible, même hors ligne. Coût : les tables pèsent environ 1,8 Mo, téléchargés une fois puis gardés en cache.

**Pas de framework, pas de bundler.** Le JavaScript de chaque appli est découpé en fichiers numérotés (`00_`, `10_`…) concaténés dans l'ordre déclaré par son `app.json`. Rien à installer pour construire, rien qui vieillit.

**Le catalogue est généré.** La liste des applis vient de `src/catalogue/catalogue.json` et du `app.json` de chaque appli. La ligne de progression sous chaque appli vient de `src/catalogue/progress.js`.

**Hors ligne et mises à jour.** `sw.js` met en cache tout le site. Son numéro de version est l'empreinte du contenu construit : chaque modification publiée change ce numéro, et les appareils récupèrent la nouvelle version à l'ouverture suivante. Les pages passent par le réseau d'abord (pour les mises à jour), puis par le cache si l'appareil est hors ligne.

**La progression.** Chaque appli garde son état dans `localStorage`, sous sa propre clé déclarée dans `app.json` (`eden:tables`). Le catalogue la lit pour afficher la progression. Au démarrage, on demande au navigateur de ne pas effacer ces données (`navigator.storage.persist`).

Règles à respecter :
- Ne jamais renommer une clé sans migration. Les tables lisent encore l'ancienne clé `pico-tables-v2` si la nouvelle est vide.
- Un champ ajouté à l'état doit avoir une valeur par défaut au chargement (exemple : `ST.t`, `ST.pre` dans `10_app.js`).
- Le jour où il faudra synchroniser plusieurs appareils, ajouter une base de données ; le format de l'état reste le point de départ.

## Qualité

- `scripts/check.py` : syntaxe de chaque script construit et du service worker, chaque phrase dite par le code a sa voix, manifeste et fichiers en cache présents.
- `tests/e2e.py` : dans Chromium, un robot ouvre le catalogue, vérifie le hors-ligne, puis joue tout le parcours des tables (avec des erreurs volontaires) sur deux tailles d'écran. Il vérifie qu'il n'y a aucune erreur JavaScript et que rien ne déborde de l'écran.
- GitHub Actions lance les trois à chaque envoi ; la mise en ligne n'a lieu que si tout passe.
