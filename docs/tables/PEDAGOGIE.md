# Les tables : la pédagogie

Public : Eden, CE2. Référence : programme du cycle 2 (Éduscol). Les tables de 2 à 5 sont attendues depuis le CE1 ; celles de 6 à 9 doivent être sues à la fin du CE2. Grâce à la commutativité (3 × 7 = 7 × 3), il y a 36 calculs distincts, dont seulement 10 vraiment nouveaux en CE2 (de 6 × 6 à 9 × 9).

## Principes

- **Comprendre avant de mémoriser.** Chaque calcul nouveau est construit avec une technique et des gestes (toucher, couper, compléter), puis l'enfant le retrouve seul.
- **Le dessin est relié au calcul.** Quand on demande 5 × 7, le bloc de 5 rangées s'allume et le reste s'efface ; la réponse s'écrit à côté du bloc (« 5 × 7 = 35 »).
- **Une technique arrive quand on en a besoin.** Premier jour : les coffres (le sens de « fois ») et tourner (3 × 4 = 4 × 3), puis un test de départ. « Couper » et « presque dix » sont enseignées le jour du premier calcul qui en a besoin.
- **Une erreur devient un moment de compréhension.** Hector dit ce que l'erreur montre (« une rangée de trop », « fois, ce n'est pas plus »), refait la technique avec l'enfant, puis l'enfant réessaie. Au deuxième échec, la réponse est montrée avec le dessin.
- **Pas de chronomètre, pas de points perdus.** Les sons d'erreur sont doux.

## Les techniques

| Technique | Pour quels calculs | Exemple |
| --- | --- | --- |
| Les coffres | sens de la multiplication | 3 coffres de 4 pièces = 3 × 4 = 12 |
| Tourner | tous | 7 × 6 = 6 × 7 |
| Couper | un facteur entre 6 et 8 | 7 × 8 = 5 × 8 + 2 × 8 = 40 + 16 |
| Presque dix | un facteur égal à 9 | 9 × 7 = 10 × 7 − 7 = 63 |
| Compter les rangées | les deux facteurs ≤ 5 | 3 × 4 : 4, 8, 12 |

Le choix est fait par `chainOf(a, b)` dans `js/00_phrases.js`.

## Le système (ce qui se nourrit de quoi)

- **Répétition espacée** (`grade` et `buildSession` dans `js/10_app.js`) : 5 boîtes, revues après 0, 1, 2, 4 et 8 jours. Un calcul réussi du premier coup monte d'une boîte, une erreur le fait redescendre. Un calcul raté revient plus loin dans la même séance.
- **Vitesse** : un calcul juste mais trouvé en plus de 9 secondes ne dépasse pas la boîte 2 (il est encore recalculé, pas mémorisé). Ce seuil est un choix de départ, à ajuster à l'usage.
- **Les étapes des techniques** : les petites questions (5 × 7, 35 + 7, 70 − 7…) sont suivies (`ST.pre`). Une étape ratée revient en « petit rappel » au début de la séance suivante. Un 5 × y raté fait aussi redescendre ce calcul.
- **Diagnostic des erreurs** (`diag` dans `js/30_session.js`) : réponse = a + b, ou produit voisin (une rangée de plus ou de moins).
- **Ordre des nouveaux calculs** : les plus faciles d'abord, puis les paires difficiles (`HARD`), deux par deux.

## Une séance

8 à 12 calculs, 5 à 7 minutes : échauffement (calculs connus), nouveaux calculs avec la technique, calculs à revoir, une épreuve des bulles (choisir la bonne réponse), puis l'écran de fin.

## Espace parents

Appui long (1,3 s) sur la roue dentée de l'accueil : calculs sus, calculs à retravailler, étapes des techniques à revoir, techniques vues, réglage de la voix, remise à zéro.
