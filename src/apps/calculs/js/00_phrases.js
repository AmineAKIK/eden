/* ============ ce que dit Hector ============
   Chaque phrase est enregistrée entière, nombre compris (« J'en ajoute deux. ») : aucun calcul
   n'est un collage de mots. Seul le comptage (« un », « deux »…) est fait de mots séparés,
   comme quand on compte vraiment. Les clés « nm_ » contiennent le prénom de l'enfant.
   L'ordre de ce fichier est l'ordre du texte à enregistrer (scripts/voice_script.py). */
const NUM=['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix'];
const NUMF=n=>n===1?'une':NUM[n];               /* une pièce */
const Cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const V={
 nm_hello:'Bonjour Milo ! Je suis Hector, le petit guerrier. Aujourd’hui, on va jouer avec mes pièces d’or.',
 nm_back:'Re-bonjour Milo ! On joue avec mes pièces d’or ?',
 coffre:'Voici mon coffre. Je range mes pièces dedans.',
 c_how:'Pour compter, on touche chaque pièce une seule fois, et on dit un nombre à chaque pièce.',
 c_you:'À toi ! Touche chaque pièce, et compte avec moi.',
 c_last:'Le dernier nombre qu’on dit, c’est le nombre de pièces.',
 strip:'Pour répondre, touche le bon nombre, en bas de l’écran.',
 q_count:'Combien de pièces ?',
 q_add:'Combien de pièces dans le coffre, maintenant ?',
 q_sub:'Combien de pièces reste-t-il dans le coffre ?',
 q_split:'Combien de pièces sont cachées dans le coffre ?',
 t_keep1:'Mes pièces sont dans le coffre fermé : je ne peux plus les voir.',
 t_keep2:'Alors je garde leur nombre dans ma tête, et je compte celles que j’ajoute.',
 t_you_add:'À toi ! Touche les pièces que j’ajoute, et compte avec moi.',
 t_back1:'Quand j’enlève des pièces, je compte à l’envers.',
 t_you_sub:'À toi ! Touche les pièces que j’enlève, et compte à l’envers avec moi.',
 t_double:'J’ajoute le même nombre : c’est un double ! Les doubles, on les apprend par cœur.',
 t_mys1:'Voici le coffre mystère ! Je te dis combien j’ai de pièces en tout, et tu trouves combien sont cachées dans le coffre.',
 t_mys2:'Je garde dans ma tête les pièces que je vois, et je compte jusqu’au nombre en tout.',
 t_you_mys:'À toi ! Touche les pièces cachées, et compte avec moi.',
 d_off1:'Presque ! On compte ensemble.',
 d_op_add:'Attention, j’en ajoute : il y en a plus qu’avant.',
 d_op_sub:'Attention, j’en enlève : il en reste moins qu’avant.',
 d_start_add:'Ça, c’est ce qu’il y avait au début. Mais j’en ai ajouté.',
 d_start_sub:'Ça, c’est ce qu’il y avait au début. Mais j’en ai enlevé.',
 d_part_add:'Ça, ce sont seulement les pièces que j’ajoute. Il faut compter toutes celles du coffre.',
 d_part_sub:'Ça, ce sont les pièces que j’ai enlevées. Combien en reste-t-il dans le coffre ?',
 d_whole:'Ça, c’est le nombre en tout. Combien sont cachées dans le coffre ?',
 d_seen:'Ça, ce sont les pièces qu’on voit. Combien sont cachées ?',
 d_gen:'Regardons ensemble.',
 look:'Je rends mon coffre transparent : regarde !',
 again:'À toi, essaie encore.',
 show:'Regarde bien.',
 later:'On le refera bientôt.',
 ok1:'Bravo !',ok2:'Super !',ok3:'Exactement !',ok4:'Tu as trouvé !',nm_ok5:'Bien joué, Milo !',
 gain:'Une pièce pour mon trésor !',
 place_intro:'Je vais regarder ce que tu sais déjà. Réponds comme tu peux : ce n’est pas grave si tu ne sais pas.',
 nm_place_end:'Merci Milo ! Maintenant, je sais par où commencer.',
 nm_go:'C’est parti, Milo !',
 new:'Un nouveau calcul !',
 nm_end1:'Bravo Milo ! Regarde toutes les pièces que tu as gagnées pour mon trésor.',
 end2:'À demain pour une nouvelle partie !',
 tr_1:'Voici mon trésor ! Chaque bonne réponse y ajoute une pièce.',
 tr_2:'Quand j’ai dix pièces, je les range dans un sac.',
 tr_empty:'Mon trésor est vide. Joue avec moi pour le remplir !'
};
/* phrases avec leur nombre */
for(let n=1;n<=10;n++)V['put_'+n]=`Je mets ${NUMF(n)} pièce${n>1?'s':''} dans mon coffre.`;
for(let n=1;n<=5;n++)V['add_'+n]=`J’en ajoute ${NUMF(n)}.`;
for(let n=1;n<=5;n++)V['rem_'+n]=`J’en enlève ${NUMF(n)}.`;
for(let n=2;n<=10;n++)V['all_'+n]=`En tout, j’ai ${NUM[n]} pièces.`;
for(let n=1;n<=9;n++)V['see_'+n]=`J’en vois ${NUMF(n)} dehors.`;
for(let n=1;n<=10;n++)V['keep_'+n]=`Je garde ${NUM[n]} dans ma tête.`;
for(let n=1;n<=10;n++)V['tot_'+n]=`Il y en a ${NUMF(n)}.`;
for(let n=0;n<=9;n++)V['rest_'+n]=n?`Il en reste ${NUMF(n)}.`:'Il n’en reste plus.';
for(let n=1;n<=9;n++)V['hid_'+n]=`Il y en a ${NUMF(n)} cachée${n>1?'s':''}.`;
for(let n=0;n<=10;n++)V['ok_'+n]=`Oui ! ${Cap(NUMF(n))} pièce${n>1?'s':''}.`;
/* le comptage : dix mots, enregistrés à la suite (« Un, deux, trois… ») */
for(let n=1;n<=10;n++)V['cnt_'+n]=Cap(NUM[n]);

/* une clé = un clip (pas de collage) */
function seqOf(k){return AUDIO[k]?[k]:null;}
