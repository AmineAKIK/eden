# Historique des versions

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Chaque appli a son propre numéro de version (dans son `app.json`).

## 2026-11-12 (b)

### Corrigé
- Les tables 1.0.4 : plus de « vibration » quand un élément devient à toucher. L'invitation est un halo qui apparaît en douceur, sans agrandir l'élément ; les changements de taille du rectangle et la coupe sont animés en douceur. La bulle d'Hector garde une hauteur fixe (le texte s'adapte), et l'arrivée ou le départ du clavier fait glisser la scène au lieu de la faire sauter.
- Mises à jour : une nouvelle publication s'applique d'elle-même (vérification à l'ouverture et au retour sur l'appli, téléchargement sans cache HTTP, rechargement automatique hors séance). Plus besoin d'effacer les données du site.
- Les tables 1.0.3 : dans les chapitres « couper » et « presque dix », le rectangle s'affiche avant qu'Hector en parle (il apparaissait après sa phrase).
- Les tables 1.0.2 : la bulle de l'écran d'accueil d'Hector occupait tout l'écran.
- Les tables 1.0.1 : l'espace parents affichait le mot « null » ; la bulle de l'écran de fin occupait tout l'espace libre.

## 2026-11-12

### Ajouté
- Catalogue « Les applis d'Eden » : PWA installable, hors ligne, icônes adaptées à Android et iOS.
- Les tables 1.0.0 : première version publiée.
  - Prologue : les coffres (sens de « fois ») et tourner (3 × 4 = 4 × 3), puis un test de départ.
  - Techniques « couper » (5 rangées + le reste) et « presque dix » (pour le 9), enseignées le jour où un calcul en a besoin.
  - Dessin relié au calcul : chaque bloc du rectangle porte son étiquette (« 5 × 7 = 35 »).
  - Après une erreur : diagnostic (rangée de trop, + au lieu de ×), technique refaite avec les gestes, nouvel essai.
  - Répétition espacée, vitesse prise en compte, petits rappels des étapes ratées, espace parents.
  - Voix enregistrée (ElevenLabs), calculs assemblés à partir de morceaux.
- Construction, vérifications, tests dans un navigateur et mise en ligne automatiques (GitHub Actions).
