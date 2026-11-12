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

**Hors ligne et mises à jour.** `sw.js` met en cache tout le site. Son numéro de version est l'empreinte du contenu construit : chaque publication qui change un fichier change ce numéro.
- Le navigateur vérifie s'il y a une nouvelle version à l'ouverture, au retour sur l'appli et toutes les 30 minutes (`src/shared/update.js`, inséré dans chaque page).
- Sur iPhone, aucun site ne peut proposer « Installer » : `src/shared/install.js` (inséré dans chaque page) explique le geste (Partager, puis « Sur l'écran d'accueil »). Sur iPhone, l'icône de l'écran d'accueil a sa propre mémoire, séparée du navigateur : l'espace parents de chaque appli doit donc offrir une sauvegarde par code.
- La nouvelle version se télécharge en contournant le cache HTTP, puis remplace l'ancienne.
- La page se recharge d'elle-même. Dans les tables, jamais en pleine séance : le rechargement attend le retour à l'accueil.
- Mise en page : la hauteur réellement disponible est mesurée par le code (classes `short` sous 700 px et `tiny` sous 600 px sur `<html>`), sans compter sur les unités d'écran ni sur `:has()`, qui varient selon les versions d'iOS. La zone de jeu se réajuste d'elle-même quand sa taille ou son contenu change (`autoFit`).
- Il ne faut **jamais** effacer les données du site pour mettre à jour : cela effacerait la progression. Le test `tests/e2e.py` vérifie qu'une publication s'applique seule et que la progression reste.

**La progression.** Chaque appli garde son état dans `localStorage`, sous sa propre clé déclarée dans `app.json` (`eden:tables`). Le catalogue la lit pour afficher la progression. Au démarrage, on demande au navigateur de ne pas effacer ces données (`navigator.storage.persist`).

Règles à respecter :
- Ne jamais renommer une clé sans migration. Les tables lisent encore l'ancienne clé `pico-tables-v2` si la nouvelle est vide.
- Un champ ajouté à l'état doit avoir une valeur par défaut au chargement (exemple : `ST.t`, `ST.pre` dans `10_app.js`).
- Le jour où il faudra synchroniser plusieurs appareils, ajouter une base de données ; le format de l'état reste le point de départ.

## Qualité

- `scripts/check.py` : syntaxe de chaque script construit et du service worker, chaque phrase dite par le code a sa voix, manifeste et fichiers en cache présents.
- `tests/e2e.py` : dans Chromium, un robot ouvre le catalogue, vérifie le hors-ligne, la mise à jour et la sauvegarde, puis joue tout le parcours des tables (avec des erreurs volontaires). Il vérifie qu'il n'y a aucune erreur JavaScript et que rien ne déborde de l'écran. Il lance ensuite `tests/audit.py`.
- `tests/audit.py` : le parcours complet sur les tailles réellement visibles des téléphones (iPhone SE et iPhone 12 dans le navigateur, iPhone 12 installé, petit et grand Android), plus les écrans hors séance (accueil, aide à l'installation, espace parents, grille, techniques, téléphone tourné). Chaque écran est contrôlé : champ de réponse caché par le clavier ou la bulle, bouton recouvert ou hors de l'écran, texte de bulle coupé ou trop petit, dessin coupé ou trop petit. `--shots` garde une capture de chaque écran dans `tests/out/audit/`.
- GitHub Actions lance les trois à chaque envoi ; la mise en ligne n'a lieu que si tout passe. `scripts/publish.py` fait la même chose en local et publie sur la branche `gh-pages`.
