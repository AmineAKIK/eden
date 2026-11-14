# Historique des versions

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Chaque appli a son propre numéro de version (dans son `app.json`).

## 2026-11-14

### Ajouté
- Nouvelle appli **Plus et moins** (1.0.0), pour Milo, en grande section : ajouter et enlever jusqu'à 10 avec le coffre d'Hector, d'après le programme de maternelle (surcompter, décompter, doubles, parties-tout). Tout est dit à voix haute, réponses sur une bande de 0 à 10, techniques montrées le jour où on en a besoin, diagnostic des erreurs, répétition espacée, test de départ, trésor (dix pièces font un sac), espace parents. Elle a son propre manifeste : installée, son icône ouvre directement l'appli.
- Voix de Plus et moins : 147 phrases découpées dans l'enregistrement, chacune vérifiée par reconnaissance vocale, au même volume que la voix des tables.
- `scripts/voice_script.py` : le texte à enregistrer d'une appli, dans l'ordre de ses phrases.
- Tests : `tests/audit.py` joue aussi Plus et moins sur cinq tailles d'écran (`--app=calculs` pour elle seule) ; `tests/e2e.py` vérifie sa sauvegarde.

## 2026-11-12 (f)

### Ajouté
- Page « Mentions légales et confidentialité » (`mentions-legales.html`) : éditeur, hébergeur, données personnelles (rien n'est collecté, tout reste sur l'appareil), propriété intellectuelle et crédits. Accessible depuis le bas du catalogue et depuis l'espace parents (Les tables 1.2.1), disponible hors ligne.

## 2026-11-12 (e)

### Ajouté
- Les tables 1.2.0 : Hector explique « Ma grille » à la première visite (une case = la ligne fois la colonne, les couleurs, 3 × 7 = 7 × 3). Chaque case se touche : la ligne et la colonne s'allument, la case jumelle aussi, et Hector dit le calcul. Le bouton haut-parleur réexplique.
- Espace parents entièrement refait, en pages courtes : l'essentiel en un coup d'œil (calculs sus, séances de la semaine), puis Ses progrès (la grille et ses couleurs, ce qui bloque, une idée pour la maison), Réglages, Sauvegarde, Comment Hector enseigne.
- Réglages en langage simple : durée d'une séance (≈ 4, 6 ou 9 minutes), « laisser plus de temps pour répondre », voix, petits sons, revoir l'histoire du début, effacer la progression. Chaque action importante demande confirmation dans la page.
- Sauvegarde par fichier au lieu d'un code à copier : « Enregistrer une copie » (Fichiers, message…) et « Reprendre une copie », avec la marche à suivre pour passer du navigateur à l'icône sur iPhone. Les codes des versions 1.1 restent acceptés.
- « Trois fois », « quatre fois »… dits d'un seul tenant.

### Corrigé
- La roue de l'accueil ne semblait rien faire : un appui court explique maintenant le geste, et un anneau se remplit pendant l'appui long.
- Grille : « je le sais » a une seule couleur (deux verts différents prêtaient à confusion).

## 2026-11-12 (d)

### Ajouté
- Les tables 1.1.0 : espace parents refait (appui long sur la roue de l'accueil). Calculs sus et en cours, progrès depuis la première séance, séances des 7 derniers jours, calculs à travailler avec une idée concrète pour la maison, techniques vues.
- Sauvegarde de la progression par un code à copier, et restauration. Utile sur iPhone, où l'icône de l'écran d'accueil et le navigateur ont chacun leur mémoire.
- Aide à l'installation sur iPhone et iPad (catalogue, accueil de l'appli, espace parents) : le geste Partager, puis « Sur l'écran d'accueil », expliqué en trois étapes.
- Téléphone tourné : un message invite à le remettre droit.
- Sur iPhone (iOS 17 et plus), la voix d'Hector s'entend même en mode silencieux.

### Corrigé
- Affichage sur iPhone : la mise en page ne dépend plus de fonctions CSS absentes de certaines versions d'iOS (`:has()`, `safe center`) ni des unités d'écran. La zone de jeu se réajuste d'elle-même quand la bulle ou le clavier changent : le champ de réponse n'est plus caché.
- Le texte de la bulle ne descend plus sous 15 px : une phrase longue agrandit la bulle au lieu d'être écrasée.
- Très petit écran (iPhone SE dans Safari) : le clavier passe sur deux rangées pour laisser la place au dessin ; les pièces ne rapetissent plus quand le clavier apparaît.
- Écran de fin : les boutons ne s'écrasent plus sur les petits écrans.
- Nouvel audit d'affichage (`tests/audit.py`) : le parcours complet sur cinq tailles de téléphone réelles, chaque écran contrôlé et capturé.

## 2026-11-12 (c)

### Corrigé
- Les tables 1.0.5 : la voix n'est plus « amputée ». Les 95 morceaux ont été redécoupés dans l'enregistrement d'origine, avec les fins de mots complètes (le « t » de huit, de sept…) et le souffle naturel autour. Les calculs assemblés (« six fois sept égale quarante-deux ») s'enchaînent sur la parole elle-même et non plus sur la longueur des fichiers, et tous les morceaux ont le même volume. Deux phrases mal attribuées sont corrigées (« Pas grave. Regarde. » entier, « Eden, » au début de « voici l'entraînement du jour »).

## 2026-11-12 (b)

### Corrigé
- Les tables 1.0.4 : plus de « vibration » quand un élément devient à toucher. L'invitation est un halo qui apparaît en douceur, sans agrandir l'élément ; la coupe est animée en douceur. La bulle d'Hector garde une hauteur fixe (le texte s'adapte), et l'arrivée ou le départ du clavier fait glisser la scène au lieu de la faire sauter.
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
