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

`seqOf(clé)` dans `js/10_app.js` transforme une clé en suite de morceaux, joués bout à bout :

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
2. Générer la phrase avec la même voix et l'enregistrer en mp3 (mono, 44,1 kHz, environ 48 kbit/s) sous `voice/<clé>.mp3`. Couper les silences au début et à la fin.
3. `python3 scripts/build.py && python3 scripts/check.py`.

Amélioration possible : générer « trois fois », « quatre fois »… d'un seul tenant (une phrase par ligne, avec des points), pour un rythme plus naturel que le collage « trois » + « fois ».
