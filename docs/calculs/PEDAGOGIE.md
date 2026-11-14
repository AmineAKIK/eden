# Plus et moins : la pédagogie

Public : Milo, grande section (5-6 ans). Il ne lit pas encore : **tout est dit par Hector**, rien ne dépend de la lecture. La bulle écrite sert aux parents.

Référence : programme de l'école maternelle (cycle 1, version consolidée, Éduscol), colonne « À partir de 5 ans » :

- **Découvrir les nombres** : collections jusqu'à dix ; un de plus, un de moins ; dénombrer en passant une seule fois par chaque élément ; composer et décomposer les nombres jusqu'à dix ; mémoriser les doubles ; **pour ajouter, surcompter à partir du plus grand ; surcompter et décompter** ; écrire les nombres de un à dix ; bande numérique jusqu'à dix.
- **Utiliser les nombres pour résoudre des problèmes** : ajout et retrait, parties-tout (« déterminer le tout ou une partie »).
- **Les signes +, − et = ne figurent pas dans ces objectifs** : l'enfant ne les voit jamais. On dit « j'en ajoute », « j'en enlève », « il en reste », « en tout ». Les parents, eux, lisent « 3 + 2 » dans leur espace.

## L'idée centrale : passer du comptage au calcul

Le coffre d'Hector reprend la situation de la « boîte » bien connue en maternelle : des pièces entrent dans un coffre **fermé**. On ne peut plus les compter une par une : il faut **garder le nombre dans sa tête** et continuer à compter. C'est exactement le passage du comptage au calcul que vise la grande section.

Le nombre de pièces du coffre est écrit sur sa plaque (écriture chiffrée en situation de communication) : c'est la mémoire de l'enfant, comme le doigt qu'on garde levé.

## Les situations

| Situation | Ce que voit l'enfant | Ce qu'il fait |
| --- | --- | --- |
| Combien de pièces ? | 3 à 10 pièces, en rangées de cinq, en constellation de dé ou en vrac | dénombre ou reconnaît |
| J'en ajoute | coffre fermé (plaque : 3), 2 pièces qui arrivent | surcompte : « trois… quatre, cinq » |
| J'en enlève | coffre fermé (plaque : 5), 2 pièces qui sortent | décompte : « cinq… quatre, trois » |
| Le coffre mystère | « en tout : 7 », 4 pièces dehors, le coffre fermé | parties-tout : compte de 4 jusqu'à 7 |

On ajoute ou on enlève **une à cinq** pièces, sans dépasser dix (calcul par ajout ou retrait d'unités). Pour ajouter, le coffre contient toujours **le plus grand** des deux nombres : l'enfant surcompte à partir du plus grand, comme le demande le programme.

## Les techniques, montrées le jour où on en a besoin

| Technique | Quand | Ce qu'Hector montre |
| --- | --- | --- |
| Compter une par une | premier jour | toucher chaque pièce une seule fois ; le dernier nombre dit combien il y en a |
| Garder dans sa tête | premier « j'en ajoute » | « Je garde trois dans ma tête », puis l'enfant touche les pièces ajoutées en comptant |
| Compter à l'envers | premier « j'en enlève » | l'enfant touche les pièces enlevées en reculant : « quatre, trois » |
| Les doubles | premier double (2 et 2) | « quand j'ajoute le même nombre, c'est un double : on l'apprend par cœur » |
| Le coffre mystère | après les ajouts et retraits | compter à partir des pièces qu'on voit jusqu'au nombre en tout |

## Une erreur devient un moment de compréhension

`diag` dans `js/40_session.js` reconnaît l'erreur, Hector dit ce qu'elle montre, puis refait le calcul **avec** l'enfant (le coffre devient transparent, l'enfant touche les pièces et compte avec Hector), et l'enfant répond à nouveau. Au deuxième échec, Hector montre et dit la réponse, et le calcul revient plus tard.

| Réponse | Ce que ça montre | Ce que dit Hector |
| --- | --- | --- |
| à un près | erreur de comptage (souvent : recompter le nombre de départ) | « Presque ! On compte ensemble. » |
| a + b alors qu'on enlève (ou a − b alors qu'on ajoute) | sens de l'action | « J'en enlève : il en reste moins qu'avant. » |
| le nombre de départ | l'action est oubliée | « C'est ce qu'il y avait au début. Mais j'en ai enlevé. » |
| le nombre ajouté ou enlevé | une partie seulement | « Ça, ce sont les pièces que j'ai enlevées. Combien en reste-t-il ? » |
| le nombre en tout (coffre mystère) | confusion tout / partie | « Ça, c'est le nombre en tout. Combien sont cachées ? » |

Jamais de buzzer, jamais de points perdus, pas de chronomètre visible.

## Le système

- **Répétition espacée** (`grade`, `buildSession`) : comme les tables. Cinq boîtes, revues après 0, 1, 2, 4 et 8 jours. Un calcul réussi du premier coup monte, une erreur le fait redescendre.
- **Vitesse** : un calcul juste mais trouvé en plus de 10 secondes (15 si les parents laissent plus de temps) ne dépasse pas la boîte 2. Le but en grande section n'est pas la vitesse, mais un enfant qui recompte tout depuis un n'a pas encore le calcul.
- **Ordre d'apprentissage** (`ORDER`) : un de plus, un de moins, ajouter 2, enlever 2, les doubles, ajouter 3 à 5, enlever 3 à 5, le coffre mystère jusqu'à 5 puis jusqu'à 10. Deux nouveaux calculs par séance.
- **Test de départ** (premier jour, après l'histoire) : deux « combien ? », puis un de plus, un de moins, ajouter 2, enlever 2. Il place l'enfant dans l'ordre d'apprentissage.
- **Le trésor** : chaque bonne réponse du premier coup ajoute une pièce au trésor d'Hector. Dix pièces font un sac : on revoit dix, sans le dire.

## Une séance

6 à 10 situations, environ 5 minutes (réglable par les parents) : un « combien ? » pour s'échauffer, les calculs à revoir, deux nouveaux avec leur technique si besoin, les calculs ratés qui reviennent, puis le trésor.

## La voix

Chaque phrase est enregistrée entière, avec son nombre dedans (« J'en ajoute deux. »), pour qu'aucun calcul ne soit un collage de mots. Seul le comptage (« un, deux, trois… ») est fait de mots séparés, comme quand on compte vraiment. Les phrases avec le prénom sont celles dont la clé commence par `nm_` : ce sont les seules à réenregistrer pour un autre enfant.
