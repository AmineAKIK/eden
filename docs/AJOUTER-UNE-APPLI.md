# Ajouter une appli

Exemple pour une appli `lecture`.

1. **Créer le dossier** `src/apps/lecture/` avec :
   - `app.json` (copier celui de Plus et moins et l'adapter ; `ownManifest` si l'appli doit s'installer seule, avec sa propre icône) : `id`, `name` (court, sous l'icône), `title`, `description`, `version`, `storageKey` (`eden:lecture`), `themeColor`, la liste `js` et `css`, et `voice` si l'appli parle.
   - `js/` : le code. Il doit créer l'interface dans `#app` (ou dans `document.body`) et retirer l'élément `#nojs` au démarrage. Les constantes `APP_VERSION` et `HERO_SVG` (Hector) sont fournies par la construction.
   - `style.css`.
   - `icons/lecture.svg` et `icons/lecture-mask.svg` (même dessin réduit à 80 %, sur fond plein).
2. **Générer les icônes** : `python3 scripts/icons.py`.
3. **L'ajouter au catalogue** : ajouter `"lecture"` dans la liste `apps` de `src/catalogue/catalogue.json`, et une fonction `lecture(state)` dans `src/catalogue/progress.js` qui renvoie la petite ligne de progression.
4. **Un bouton retour vers le catalogue** sur l'écran d'accueil de l'appli : un lien vers `../../` (voir `.catbtn` dans les tables).
5. **Vérifier** : `python3 scripts/build.py && python3 scripts/check.py && python3 tests/e2e.py`. Ajouter un test de parcours pour la nouvelle appli dans `tests/e2e.py`.
6. **Noter la version** dans `CHANGELOG.md`, puis envoyer sur `main`.
