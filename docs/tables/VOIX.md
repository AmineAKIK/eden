# Les tables : la voix

Hector parle avec une voix enregistrée (ElevenLabs, voix « Victoria »). Il n'y a jamais de voix de synthèse du navigateur : si un morceau manquait, la phrase s'afficherait seulement à l'écran (et `scripts/check.py` bloquerait la publication).

## Comment c'est rangé

Un fichier mp3 par morceau dans `src/apps/tables/voice/`, nommé par sa clé :

- **Phrases entières** : même nom que la clé de la phrase dans `js/00_phrases.js` (`hello`, `c3_b`, `diag_row`…). Le texte affiché dans la bulle est celui de `V`.
- **Morceaux de calcul** :
  - `p1` « une fois », `p2` « deux fois » ;
  - `fois`, `eg` (« égale »), `plus`, `moins`, `nouveau` (« Nouveau calcul ! ») ;
  - `n2` … `n90` : les nombres dits seuls, avec une voix qui conclut.

## Comment les calculs sont dits

`seqOf(clé)` dans `js/10_app.js` transforme une clé en suite de morceaux. Chaque morceau garde un peu de silence et la chute naturelle du mot (le « t » de huit, la fin de « sept ») : `playKey` repère dans chaque clip où la parole commence et finit (`speechOf`) et place le morceau suivant à partir de la fin de la parole du précédent, avec un petit écart (`gapOf` : 0,04 s avant « fois », 0,07 s après, 0,13 s ailleurs). Les chutes peuvent se chevaucher, les mots ne sont jamais coupés.

| Clé | Morceaux | Entendu |
| --- | --- | --- |
| `q_6_7` | `n6` `fois` `n7` | six fois sept |
| `r_6_7` | `n6` `fois` `n7` `eg` `n42` | six fois sept, égale quarante-deux |
| `q_2_9` | `p2` `n9` | deux fois neuf |
| `p_35_7` | `n35` `plus` `n7` | trente-cinq plus sept |
| `m_70_7` | `n70` `moins` `n7` | soixante-dix moins sept |
| `tech_cut` | `nouveau` `tech_cut_r` | Nouveau calcul ! On utilise la technique du découpage… |

## Changer ou ajouter une phrase

1. Modifier le texte dans `js/00_phrases.js`.
2. Générer la phrase avec la même voix et l'enregistrer en mp3 (mono, 44,1 kHz, environ 48 kbit/s) sous `voice/<clé>.mp3`.
   Découpe : repérer la parole avec un seuil bas (−55 dB, sinon les consonnes finales disparaissent), puis garder une marge : jusqu'à 0,12 s avant et 0,35 s après (sans dépasser la moitié du silence voisin), fondu de 12 ms à l'entrée et fondu doux à la sortie. Ne jamais rogner au ras du mot. Les morceaux de calcul sont mis au même volume que les phrases.
3. `python3 scripts/build.py && python3 scripts/check.py`.

Amélioration possible : générer « trois fois », « quatre fois »… d'un seul tenant (une phrase par ligne, avec des points), pour un rythme plus naturel que le collage « trois » + « fois ».
