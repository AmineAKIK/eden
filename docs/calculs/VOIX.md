# Plus et moins : la voix

Même voix qu'Hector dans les tables (ElevenLabs, « Victoria », abonnement Creator : usage commercial autorisé). Jamais de voix de synthèse du navigateur.

## Le principe : une phrase = un clip

Chaque phrase est enregistrée entière, nombre compris : « J'en ajoute deux. », « Il en reste trois. ». `seqOf(clé)` renvoie donc toujours un seul clip ; aucun calcul n'est un collage de mots. Seul le comptage est fait de mots séparés (`cnt_1` … `cnt_10`), enregistrés à la suite (« Un, deux, trois… »), comme quand on compte vraiment.

## Le texte à enregistrer

`python3 scripts/voice_script.py calculs` écrit le texte complet, dans l'ordre de `js/00_phrases.js`, une phrase par paragraphe.

## Découpe (leçons des tables)

- Repérer la parole avec un seuil bas (−55 dB) : sinon les fins de mots (« sept », « huit ») sont coupées.
- Temps exacts : un pas d'analyse de 220 échantillons à 44,1 kHz ne fait pas 5 ms. Toujours convertir avec la vraie fréquence, sinon les repères dérivent sur la longueur du fichier.
- Associer chaque morceau à sa phrase par reconnaissance vocale et alignement (programmation dynamique), puis vérifier chaque clip par reconnaissance vocale.
- Marges : jusqu'à 0,12 s avant, 0,35 s après (sans dépasser la moitié du silence voisin), fondu de 12 ms à l'entrée, fondu doux à la sortie.
- Même volume pour tous les clips (niveau des phrases des tables), limiteur à anticipation, mp3 mono 44,1 kHz 48 kbit/s.

## Pour un autre enfant

Seules les phrases dont la clé commence par `nm_` contiennent le prénom (bonjour, re-bonjour, c'est parti, bien joué, fin du test, fin de partie). Les réenregistrer suffit, avec `CHILD` dans `js/50_parents.js` et le titre de l'écran de fin.
