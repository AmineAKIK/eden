/* ===== mots, nombres, phrases de Hector (partagés par l'appli et le générateur de voix) ===== */
const U16=['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize'];
function nw(n){
  if(n<=16)return U16[n];
  if(n<20)return 'dix-'+U16[n-10];
  if(n<70){const t=['','','vingt','trente','quarante','cinquante','soixante'][Math.floor(n/10)],u=n%10;return u===0?t:(u===1?t+' et un':t+'-'+U16[u]);}
  if(n<80)return n===71?'soixante et onze':'soixante-'+nw(n-60);
  if(n<100){const u=n-80;return u===0?'quatre-vingts':'quatre-vingt-'+nw(u);}
  return n===100?'cent':String(n);
}
/* astuce unique par calcul (a <= b) : lignes affichées + texte lu */
function chainOf(a,b){
  if(a>b){const t=a;a=b;b=t;}
  const p=a*b;
  if(b===9){
    const n=(a===9)?9:a;
    return {kind:'ten',n,rows:9,x:9,y:n,
      lines:[`10 × ${n} = ${10*n}`,`${10*n} − ${n} = ${p}`],
      say:`${nw(9)} fois ${nw(n)}. Presque dix : dix fois ${nw(n)}, ${nw(10*n)}, moins ${nw(n)}, ${nw(p)}.`};
  }
  if(b>=6){
    const x=(a>=6)?a:b,y=(a>=6)?b:a,r=x-5;
    const L=[`5 × ${y} = ${5*y}`,r===1?`1 × ${y} = ${y}`:`${r} × ${y} = ${r*y}`,`${5*y} + ${r*y} = ${p}`];
    const s=r===1?`${nw(x)} fois ${nw(y)}. Je coupe : cinq fois ${nw(y)}, ${nw(5*y)}, plus une fois ${nw(y)}, ${nw(y)}, ${nw(p)}.`:`${nw(x)} fois ${nw(y)}. Je coupe : cinq fois ${nw(y)}, ${nw(5*y)}, plus ${nw(r)} fois ${nw(y)}, ${nw(r*y)}, ${nw(p)}.`;
    return {kind:'five',x,y,r,lines:L,say:s};
  }
  const seq=[];for(let i=1;i<=a;i++)seq.push(i*b);
  return {kind:'skip',x:a,y:b,lines:[seq.join(', ')],say:`${nw(a)} fois ${nw(b)} : ${seq.map(nw).join(', ')}.`};
}
const V={
 g_intro:'Voici ta grille, Eden. Chaque case est un calcul : le nombre de la ligne, fois le nombre de la colonne.',
 g_colors:'Les cases vert foncé, tu les sais. Vert clair, tu les as presque. Jaunes, tu les apprends. Grises, tu les découvriras bientôt.',
 g_same:'Trois fois sept et sept fois trois, c’est le même calcul. Les deux cases s’allument ensemble.',
 g_tap:'Touche une case pour l’entendre.',
 g_learn:'Celui-là, tu es en train de l’apprendre.',
 g_almost:'Celui-là, tu l’as presque.',
 g_new:'Celui-là, on le découvrira bientôt.',
 hello:'Salut Eden ! Moi, c’est Hector, le petit guerrier. On s’entraîne avec les tables ?',
 place_end:'Merci Eden ! Maintenant, Hector sait par où commencer. Le prochain entraînement commence quand tu appuies sur Jouer.',
 place_intro:'Avant de commencer, Hector veut savoir ce que tu connais déjà. Écris le résultat de chaque calcul. Pas de souci si tu hésites.',
 bub_intro:'Attrape la bonne bulle !',
 new_try:'À toi : écris le résultat.',
 again:'Eden, tu te souviens de celui-ci ?',
 oops:'Pas grave. Regarde.',
 end1:'C’est fini pour aujourd’hui. Bravo Eden, quel entraînement !',
 end2:'À demain, Eden, pour retrouver tes calculs !',
 ok1:'Bravo Eden !',ok2:'Oui, bien joué !',ok3:'Exact !',ok4:'Bien joué !',ok5:'Super Eden !',ok6:'Victoire !'
};
for(let a=2;a<=9;a++)for(let b=2;b<=9;b++){
  V[`q_${a}_${b}`]=`${nw(a)} fois ${nw(b)}`;
  V[`r_${a}_${b}`]=`${nw(a)} fois ${nw(b)}, égale ${nw(a*b)}.`;
  if(a<=b)V[`c_${a}_${b}`]=chainOf(a,b).say;
}

Object.assign(V,{
 st_intro:'Eden, voici l’entraînement du jour.',
 st_warm:'D’abord, l’échauffement. Tu connais ces calculs.',
 c1_a:'Eden, Hector range ses pièces d’or dans des coffres. Voici trois coffres. Dans chaque coffre, il y a quatre pièces.',
 c1_b:'Touche chaque coffre pour compter les pièces.',
 c1_c:'Quatre, huit, douze. Trois coffres de quatre pièces, ça fait douze pièces.',
 c1_d:'On l’écrit : trois fois quatre égale douze. Fois, ça veut dire : plusieurs coffres, avec autant de pièces dans chaque coffre.',
 c2_a:'Hector pose les coffres l’un sous l’autre. Ça fait un rectangle : trois rangées de quatre pièces. Une rangée, c’est un coffre.',
 c2_b:'Touche le bouton pour tourner le rectangle.',
 c2_c:'Maintenant, quatre rangées de trois pièces. Il y a toujours douze pièces ! Trois fois quatre, c’est pareil que quatre fois trois.',
 c3_a:'Voici un grand rectangle : six rangées de sept pièces. Combien de pièces en tout ? C’est trop gros pour compter d’un coup.',
 c3_b:'Hector connaît bien les rangées de cinq. Il va couper le rectangle ici. Touche la ligne pour couper.',
 c3_c:'En haut, cinq rangées de sept. En bas, une seule rangée de sept. Réponds aux petites questions.',
 c3_e:'Donc six fois sept égale quarante-deux. Hector a coupé le rectangle en deux morceaux : c’est la technique du découpage.',
 c4_a:'Pour les rangées de neuf, Hector a une autre technique. Voici neuf rangées de sept pièces.',
 c4_b:'Dix rangées, ce serait facile. Touche la rangée qui manque.',
 c4_c:'Voilà dix rangées de sept pièces. Réponds à la petite question.',
 c4_e:'Donc neuf fois sept égale soixante-trois. C’est la technique du presque dix.',
 c5:'Bravo Eden ! Tu connais deux secrets d’Hector : les coffres, et tourner le rectangle. Les autres techniques, Hector te les montrera quand tu en auras besoin.',
 q_try2:'Presque ! Réessaie.',
 tech_cut:'Nouveau calcul ! On utilise la technique du découpage. Touche la ligne pour couper le rectangle.',
 tech_ten:'Nouveau calcul ! On utilise la technique du presque dix. Touche la rangée qui manque.',
 tech_ten2:'Mais Hector en a ajouté une de trop. Touche cette rangée pour l’enlever.',
 tech_count:'Nouveau calcul ! Touche chaque rangée pour la compter.',
 tech_end:'Bien joué ! La technique a marché.'
});
for(let y=2;y<=9;y++){V[`q_1_${y}`]=`une fois ${nw(y)}`;V[`q_10_${y}`]=`dix fois ${nw(y)}`;}
for(let a=2;a<=9;a++)for(let b=a;b<=9;b++){
  const ch=chainOf(a,b);
  if(ch.kind==='five'){const y=ch.y,r=ch.r;V[`p_${5*y}_${r*y}`]=`${nw(5*y)} plus ${nw(r*y)}`;}
  if(ch.kind==='ten'){const n=ch.y;V[`m_${10*n}_${n}`]=`${nw(10*n)} moins ${nw(n)}`;}
}

Object.assign(V,{
 tech_rot:'D’abord, touche Tourner. C’est le même calcul, avec les rangées dans l’autre sens.',
 diag_add:'Attention : fois, ce n’est pas plus. On le trouve ensemble avec les rangées.',
 diag_row:'Presque ! Il y a une rangée de trop, ou une rangée en moins. On le trouve ensemble.',
 diag_gen:'Pas grave, Eden. On le trouve ensemble avec les rangées.',
 h_rows:'Regarde : j’écris le compte au bout de chaque rangée.',
 h_add:'Pars du plus grand nombre, et avance.',
 h_sub:'Pars du grand nombre, et recule.',
 q_show:'Voici la réponse. Regarde bien le dessin.',
 pre_intro:'Petit rappel, pour que les techniques marchent bien.',
});

Object.assign(V,{
 tech_cut_r:'On utilise la technique du découpage. Touche la ligne pour couper le rectangle.',
 tech_ten_r:'On utilise la technique du presque dix. Touche la rangée qui manque.',
 tech_count_r:'On compte avec les rangées. Touche chaque rangée.'
});
