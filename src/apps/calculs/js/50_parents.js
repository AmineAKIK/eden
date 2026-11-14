/* ============ espace parents ============
   Appui long sur la roue de l'accueil. Une page d'accueil courte, puis : ses progrès,
   réglages, sauvegarde, la méthode. Écrit pour un adulte pressé, sans terme technique.
   Les parents lisent « 3 + 2 » ; l'enfant, lui, ne voit jamais ces signes. */

/* ---------- sauvegarde : une copie de la progression dans un fichier ---------- */
const SAVE_TAG='PLUSMOINS1:';
const exportCode=()=>SAVE_TAG+btoa(unescape(encodeURIComponent(JSON.stringify(ST))));
function importCode(txt){
  const m=String(txt||'').replace(/\s+/g,'').match(/PLUSMOINS1:([A-Za-z0-9+/=]+)/);if(!m)return null;
  try{const x=JSON.parse(decodeURIComponent(escape(atob(m[1]))));
    if(!x||typeof x!=='object'||typeof x.f!=='object'||!Array.isArray(x.log))return null;return x;}catch(e){return null;}
}
const masteredIn=x=>ORDER.filter(id=>x.f[id]&&x.f[id].box>=3).length;
const plural=(n,w)=>`${n} ${w}${n>1?'s':''}`;
const MONTHS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const dayName=d=>{const x=new Date(d*86400000);return `le ${x.getUTCDate()===1?'1er':x.getUTCDate()} ${MONTHS[x.getUTCMonth()]}`;};
const dayWord=d=>{const t=today();return d===t?'aujourd’hui':d===t-1?'hier':dayName(d);};
const CHILD='Milo';
async function saveCopy(){
  const t=today(),x=new Date(t*86400000);
  const name=`Plus et moins - progression de ${CHILD} - ${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]} ${x.getUTCFullYear()}.txt`;
  const body=exportCode()+'\n';
  const file=typeof File==='function'?new File([body],name,{type:'text/plain'}):null;
  if(file&&navigator.canShare&&navigator.canShare({files:[file]})){
    try{await navigator.share({files:[file],title:`Progression de ${CHILD}`});return 'ok';}
    catch(e){if(e&&e.name==='AbortError')return 'cancel';}
  }
  const url=URL.createObjectURL(new Blob([body],{type:'text/plain'}));
  const a=h('a',{href:url,download:name,style:'display:none'});document.body.append(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},4000);return 'ok';
}
const pickFile=()=>new Promise(res=>{
  const inp=h('input',{type:'file',accept:'.txt,text/plain',style:'display:none'});
  inp.onchange=()=>{const f=inp.files&&inp.files[0];inp.remove();if(!f)return res(null);const r=new FileReader();r.onload=()=>res(String(r.result||''));r.onerror=()=>res('');r.readAsText(f);};
  document.body.append(inp);inp.click();
});
/* « 3 + 2 », « 5 − 2 », « 7 en tout, 4 dehors » : pour les parents */
function factText(id){const {k,x,y}=parse(id);return k==='a'?`${x} + ${y}`:k==='s'?`${x} − ${y}`:k==='m'?`${x} = ${y} + ?`:`compter ${x}`;}

/* ---------- petites pièces d'interface ---------- */
const PI={
  back:'<svg viewBox="0 0 24 24"><path d="M15.4 5.4 14 4l-8 8 8 8 1.4-1.4L8.8 12z"/></svg>',
  close:'<svg viewBox="0 0 24 24"><path d="M18.3 7.1 16.9 5.7 12 10.6 7.1 5.7 5.7 7.1l4.9 4.9-4.9 4.9 1.4 1.4 4.9-4.9 4.9 4.9 1.4-1.4-4.9-4.9z"/></svg>',
  chev:'<svg viewBox="0 0 24 24"><path d="M8.6 5.4 10 4l8 8-8 8-1.4-1.4 6.6-6.6z"/></svg>',
  chart:'<svg viewBox="0 0 24 24"><path d="M4 20V10h3v10zm6.5 0V4h3v16zM17 20v-7h3v7z"/></svg>',
  tune:'<svg viewBox="0 0 24 24"><path d="M3 6h9.2a3 3 0 0 1 5.6 0H21v2h-3.2a3 3 0 0 1-5.6 0H3zm12 1a1 1 0 1 0 0 .01zM3 16h3.2a3 3 0 0 1 5.6 0H21v2h-9.2a3 3 0 0 1-5.6 0H3zm6 1a1 1 0 1 0 0 .01z"/></svg>',
  save:'<svg viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 1 5.8 4.6A4.5 4.5 0 0 1 17.5 16.5H15v-2h2.5a2.5 2.5 0 0 0 .2-5l-1.6-.1-.3-1.5A4 4 0 0 0 8 8.6l-.2 1.3-1.3.1A3 3 0 0 0 6.5 16H9v2H6.5A5 5 0 0 1 6 8.1 6 6 0 0 1 12 3zm1 8v6.2l1.8-1.8 1.4 1.4-4.2 4.2-4.2-4.2 1.4-1.4 1.8 1.8V11z"/></svg>',
  book:'<svg viewBox="0 0 24 24"><path d="M5 3h10a4 4 0 0 1 4 4v14H7a3 3 0 0 1-3-3V4a1 1 0 0 1 1-1zm1 2v10.2A3 3 0 0 1 7 15h10V7a2 2 0 0 0-2-2zm1 12a1 1 0 0 0 0 2h10v-2z"/></svg>',
  phone:'<svg viewBox="0 0 24 24"><path d="M8 1h8a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3zm0 2a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm3 1h2v1.5h-2zm-.5 13h3v1.5h-3z"/></svg>',
  replay:'<svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>',
  trash:'<svg viewBox="0 0 24 24"><path d="M9 3h6l1 2h4v2H4V5h4zm-3 6h12l-1 12H7zm4 2v8h1.5v-8zm3.5 0v8H15v-8z"/></svg>',
  up:'<svg viewBox="0 0 24 24"><path d="M12 3l5 5-1.4 1.4L13 6.8V16h-2V6.8L8.4 9.4 7 8zM5 14h2v5h10v-5h2v7H5z"/></svg>',
  down:'<svg viewBox="0 0 24 24"><path d="M12 16l-5-5 1.4-1.4 2.6 2.6V3h2v9.2l2.6-2.6L17 11zM5 14h2v5h10v-5h2v7H5z"/></svg>',
  info:'<svg viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5zm0 2.1L6 6.4V11c0 3.9 2.5 7.4 6 8.9 3.5-1.5 6-5 6-8.9V6.4zM11 8h2v2h-2zm0 3h2v6h-2z"/></svg>',
  ok:'<svg viewBox="0 0 24 24"><path d="M9.5 16.2 5.3 12l-1.4 1.4 5.6 5.6L20.1 8.4 18.7 7z"/></svg>'
};
const pi=(k,cls='')=>h('span',{class:'pi '+cls,'aria-hidden':'true',html:PI[k]});
function toggle(on,set,label){
  const b=h('button',{class:'tg'+(on?' on':''),role:'switch','aria-checked':String(on),'aria-label':label});
  b.onclick=()=>{tick();on=!on;b.classList.toggle('on',on);b.setAttribute('aria-checked',String(on));set(on);};
  return b;
}
function choice(opts,cur,set,label){
  const g=h('div',{class:'pch',role:'radiogroup','aria-label':label});
  opts.forEach(([v,t,sub])=>{const b=h('button',{class:'pcb'+(v===cur?' on':''),role:'radio','aria-checked':String(v===cur)},h('b',{},t),sub?h('small',{},sub):null);
    b.onclick=()=>{tick();g.querySelectorAll('.pcb').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-checked',String(x===b));});set(v);};g.append(b);});
  return g;
}
/* feuille de confirmation, dans la page (jamais de boîte du navigateur) */
function confirmSheet(host,{title,text,ok,danger=false}){
  return new Promise(res=>{
    const bg=h('div',{class:'psheet-bg'});
    const done=v=>{bg.classList.add('out');setTimeout(()=>bg.remove(),180);res(v);};
    const sh=h('div',{class:'psheet',role:'alertdialog','aria-modal':'true'},h('h3',{},title),h('p',{},text),
      h('div',{class:'psheet-b'},h('button',{class:'pbtn',onclick:()=>done(false)},'Annuler'),h('button',{class:'pbtn '+(danger?'danger':'primary'),onclick:()=>done(true)},ok)));
    bg.onclick=e=>{if(e.target===bg)done(false);};bg.append(sh);host.append(bg);sh.querySelector('.primary,.danger').focus();
  });
}
function toast(host,text){
  host.querySelectorAll('.ptoast').forEach(t=>t.remove());
  const t=h('div',{class:'ptoast',role:'status'},pi('ok'),h('span',{},text));host.append(t);setTimeout(()=>t.classList.add('out'),2600);setTimeout(()=>t.remove(),3000);
}


/* ---------- le panneau ---------- */
const FRESH=()=>({voice:ST.voice,opt:ST.opt,intro:false,placed:false,t:{},f:{},log:[],gold:0});
function openPanel(){
  const p=h('div',{class:'panel',role:'dialog','aria-label':'Espace parents'});
  const head=h('div',{class:'phead'}),body=h('div',{class:'pbody'});p.append(head,body);
  let page='home';
  const go=(to,dir=1)=>{page=to;tick();render(dir);};
  const close=()=>{tick();p.classList.add('out');setTimeout(showHome,180);};
  const row=(icon,color,title,sub,on,extra)=>h('button',{class:'prow2',onclick:on},h('span',{class:'ptile',style:`background:${color}`},pi(icon)),
    h('span',{class:'ptx'},h('b',{},title),sub?h('small',{},sub):null),extra||pi('chev','chev'));
  const group=(...kids)=>h('div',{class:'pgroup'},...kids);
  const sect=t=>h('h3',{class:'psect'},t);
  const TOT=ORDER.length;

  const P={
    home(){
      const m=mastered(),t=today(),learning=ORDER.filter(id=>known(id)&&ST.f[id].box<3).length;
      const days=[];for(let i=6;i>=0;i--){const d=t-i;days.push({on:ST.log.some(l=>l.d===d),lab:['Di','Lu','Ma','Me','Je','Ve','Sa'][new Date(d*86400000).getUTCDay()],now:d===t});}
      const week=days.filter(x=>x.on).length,last=ST.log.length?ST.log[ST.log.length-1].d:null;
      const R=34,C=2*Math.PI*R,frac=m/TOT;
      const ring=h('div',{class:'pring',html:`<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="${R}" class="bg"/><circle cx="40" cy="40" r="${R}" class="fg" style="stroke-dasharray:${C};stroke-dashoffset:${C*(1-frac)}"/></svg>`},
        h('span',{},h('b',{},String(m)),h('small',{},`sur ${TOT}`)));
      const status=!ST.log.length?`${CHILD} n’a pas encore joué.`:last===t?'Partie du jour faite.':last===t-1?'Dernière partie hier.':`Dernière partie ${dayWord(last)}.`;
      return [
        h('div',{class:'phero'},ring,h('div',{class:'pheroT'},h('b',{},m?`${plural(m,'calcul')} su${m>1?'s':''}`:'C’est le début'),
          h('span',{},learning?`et ${learning} en cours d’apprentissage`:'Les calculs appris s’afficheront ici.'),
          h('span',{class:'pst'},status))),
        h('div',{class:'pweek2','aria-label':`${week} parties sur les 7 derniers jours`},days.map(x=>h('span',{class:(x.on?'on':'')+(x.now?' now':'')},h('i',{},x.on?h('span',{html:PI.ok}):''),x.lab))),
        group(
          row('chart','#0E9E69','Ses progrès','Étape par étape, ce qui bloque, une idée pour la maison',()=>go('prog')),
          row('tune','#2640C9','Réglages','Durée des parties, temps de réponse, voix',()=>go('opts')),
          row('save','#7A4DD8','Sauvegarde',ST.backup?`Dernière copie ${dayWord(ST.backup)}`:'Garder une copie de la progression',()=>go('save')),
          row('book','#E07A00','Comment Hector enseigne','La méthode en 2 minutes',()=>go('how'))),
        window.EdenInstall&&EdenInstall.need?group(row('phone','#4A5280','Mettre l’appli sur l’écran d’accueil','En plein écran, même sans internet',()=>EdenInstall.show())):null,
        group(row('info','#8A93B8','Mentions légales et confidentialité','Aucune donnée collectée : tout reste sur l’appareil',()=>{tick();location.href='../../mentions-legales.html';})),
        h('p',{class:'pver'},'Plus et moins · version '+APP_VERSION)];
    },
    prog(){
      const m=mastered(),first=ST.log.find(l=>typeof l.m==='number');
      const weak=ORDER.filter(id=>known(id)&&ST.f[id].box<=1&&ST.f[id].ko>0).sort((x,y)=>ST.f[y].ko-ST.f[x].ko);
      const cur=STAGES.find(g=>g.ids.some(id=>!known(id)));
      const bar=g=>{const n=g.ids.length,s=g.ids.filter(isMastered).length,l=g.ids.filter(id=>known(id)&&!isMastered(id)).length;
        return h('div',{class:'pst2'+(g===cur?' cur':'')},h('div',{class:'pst2t'},h('b',{},g.name),h('span',{},`${s} sur ${n}`)),
          h('div',{class:'pbar2'},h('i',{class:'s',style:`width:${s/n*100}%`}),h('i',{class:'l',style:`width:${l/n*100}%`})));};
      const cnt=COUNTS.filter(isMastered).length;
      const tip=!weak.length?null:(()=>{const {k,x,y}=parse(weak[0]);
        return k==='a'?`mettez ${x} pâtes dans une boîte sous ses yeux, fermez-la, ajoutez-en ${y} devant lui et demandez combien il y en a dans la boîte. Laissez-le dire « ${NUM[x]}… » et continuer.`
          :k==='s'?`mettez ${x} pâtes dans une boîte, fermez-la, sortez-en ${y} devant lui et demandez combien il en reste dans la boîte. Laissez-le compter à l’envers.`
          :`montrez ${x} pâtes, cachez-en quelques-unes sous votre main en laissant voir les ${y} autres, et demandez combien sont cachées.`;})();
      return [
        h('div',{class:'pcard2'},h('p',{class:'pnote',style:'margin:0 0 10px'},'Vert : sus. Jaune : en cours. L’étape en cours est entourée.'),
          STAGES.map(bar),
          h('p',{class:'pnote'},`Compter jusqu’à dix : ${cnt} nombres sur ${COUNTS.length} reconnus sans hésiter.`),
          first&&ST.log.length>1&&m!==first.m?h('p',{class:'pgood'},`Depuis sa première partie : ${first.m} → ${m} calculs sus.`):null),
        sect('À travailler'),
        h('div',{class:'pcard2'},
          weak.length?[h('div',{class:'chips pchips'},weak.slice(0,6).map(id=>h('span',{class:'chip'},factText(id)))),
            h('p',{},h('b',{},'Une idée pour la maison : '),tip)]
            :h('p',{},'Rien ne bloque en ce moment. Les erreurs sont reprises d’elles-mêmes au fil des parties.'),
          h('p',{class:'pnote'},`${CHILD} ne voit jamais les signes + et − : en grande section, on dit « j’en ajoute », « j’en enlève », « il en reste ».`)),
        sect('Techniques vues'),
        h('div',{class:'pcard2'},h('div',{class:'ptech'},[['Compter une par une',ST.intro],['Garder dans sa tête',ST.t.keep],['Compter à l’envers',ST.t.back],['Les doubles',ST.t.dbl],['Le coffre mystère',ST.t.mys]].map(([n,on])=>h('span',{class:on?'on':''},on?pi('ok'):null,n))),
          h('p',{class:'pnote'},'Une technique est montrée le jour où un calcul en a besoin.'))];
    },
    opts(){
      const o=opt();
      return [
        sect('Parties'),
        h('div',{class:'pcard2'},h('div',{class:'plab'},'Durée d’une partie'),
          choice([['court','Courte','≈ 3 min'],['normal','Normale','≈ 5 min'],['long','Longue','≈ 7 min']],o.len,v=>setOpt('len',v),'Durée d’une partie'),
          h('p',{class:'pnote'},'À cet âge, une partie courte chaque jour vaut mieux qu’une longue de temps en temps.')),
        h('div',{class:'pcard2 pline'},h('div',{class:'ptx'},h('b',{},'Laisser plus de temps pour répondre'),
          h('small',{},'Hector compte un calcul comme su s’il est trouvé en moins de 15 secondes, au lieu de 10.')),
          toggle(o.slow>10,v=>setOpt('slow',v?15:10),'Laisser plus de temps pour répondre')),
        sect('Son'),
        group(
          h('div',{class:'prow2 static'},h('span',{class:'ptx'},h('b',{},'Voix d’Hector'),h('small',{},`${CHILD} ne lit pas encore : à laisser activée.`)),toggle(!!ST.voice,v=>{ST.voice=v;save();},'Voix d’Hector')),
          h('div',{class:'prow2 static'},h('span',{class:'ptx'},h('b',{},'Petits sons'),h('small',{},'Le carillon d’une bonne réponse, le tintement des pièces.')),toggle(o.sfx,v=>setOpt('sfx',v),'Petits sons'))),
        sect('Recommencer'),
        group(
          row('replay','#4A5280','Revoir le début','Hector présente à nouveau son coffre et le comptage. La progression est gardée.',async()=>{
            if(await confirmSheet(p,{title:'Revoir le début ?',text:`À la prochaine partie, Hector présentera à nouveau son coffre et montrera comment compter. La progression de ${CHILD} ne change pas.`,ok:'Oui, le revoir'})){
              ST.intro=false;save();toast(p,'C’est noté : ce sera à la prochaine partie.');}}),
          row('trash','#D52F3E','Effacer la progression','Tout reprend au premier jour',async()=>{
            if(await confirmSheet(p,{title:'Effacer toute la progression ?',text:`Les ${plural(mastered(),'calcul')} su${mastered()>1?'s':''}, le trésor et toutes les parties seront effacés. Pour pouvoir revenir en arrière, enregistrez d’abord une copie (Sauvegarde).`,ok:'Tout effacer',danger:true})){
              ST=FRESH();save();go('home',-1);toast(p,'La progression a été effacée.');}},h('span',{})))];
    },
    save(){
      return [
        h('div',{class:'pintro'},h('p',{},`La progression de ${CHILD} est gardée sur cet appareil, et nulle part ailleurs : rien n’est envoyé sur internet.`),
          h('p',{},'Une copie permet de la retrouver si vous changez de téléphone, si les données du navigateur sont effacées, ou pour passer du navigateur à l’icône de l’écran d’accueil.')),
        group(
          row('up','#7A4DD8','Enregistrer une copie',ST.backup?`Dernière copie ${dayWord(ST.backup)}`:'Un petit fichier, à garder dans Fichiers ou à s’envoyer par message',async()=>{
            const r=await saveCopy();if(r==='ok'){ST.backup=today();save();render(0);toast(p,'Copie enregistrée.');}},h('span',{})),
          row('down','#7A4DD8','Reprendre une copie','Choisir le fichier enregistré plus tôt',async()=>{
            const txt=await pickFile();if(txt===null)return;const x=importCode(txt);
            if(!x){await confirmSheet(p,{title:'Ce fichier n’est pas une copie de Plus et moins',text:`Choisissez le fichier dont le nom commence par « Plus et moins - progression de ${CHILD} ».`,ok:'Compris'});return;}
            const now=mastered(),then=masteredIn(x),lastS=x.log.length?x.log[x.log.length-1].d:null;
            const ok=await confirmSheet(p,{title:'Reprendre cette copie ?',text:`La copie contient ${plural(then,'calcul')} su${then>1?'s':''}`+(lastS!==null?` (dernière partie ${dayWord(lastS)})`:'')+`. Elle remplacera la progression de cet appareil (${plural(now,'calcul')} su${now>1?'s':''}).`,ok:'Reprendre la copie'});
            if(!ok)return;
            const keep={voice:ST.voice,opt:ST.opt};ST=Object.assign(FRESH(),x,keep);ST.t=ST.t||{};save();
            render(0);toast(p,`Copie reprise : ${plural(then,'calcul')} su${then>1?'s':''}.`);},h('span',{}))),
        h('div',{class:'pcard2 phow'},h('b',{},'Passer du navigateur à l’icône (iPhone)'),
          h('ol',{},h('li',{},'Dans le navigateur : Enregistrer une copie, puis « Enregistrer dans Fichiers ».'),
            h('li',{},'Ouvrez l’appli depuis l’icône de l’écran d’accueil, puis l’espace parents.'),
            h('li',{},'Reprendre une copie, puis choisissez le fichier.')))];
    },
    how(){
      const it=(t,d)=>h('div',{class:'pstep'},h('b',{},t),h('p',{},d));
      return [h('div',{class:'pcard2'},
        it('Une courte partie par jour','5 minutes suffisent. Hector choisit lui-même les calculs du jour : ceux à revoir, et un ou deux nouveaux.'),
        it('Tout est dit à voix haute',`${CHILD} ne lit pas encore : Hector dit tout. Les nombres se touchent sur une bande de 0 à 10, comme la bande numérique de la classe.`),
        it('Du comptage au calcul','Les pièces entrent dans un coffre fermé : on ne peut plus les compter une par une. Il faut garder le nombre dans sa tête et continuer à compter (« trois… quatre, cinq »). C’est le passage du comptage au calcul visé en grande section.'),
        it('L’erreur sert à comprendre','Hector dit ce que l’erreur montre (une de trop, « j’en enlève » compris comme « j’en ajoute »), refait le calcul avec l’enfant qui touche les pièces, puis l’enfant réessaie.'),
        it('Revenir au bon moment','Un calcul réussi revient de plus en plus tard, un calcul raté revient dans la partie et le lendemain. Une réponse juste mais très lente n’est pas encore comptée comme sue.'),
        it('Le programme','Programme de grande section : ajouter et enlever jusqu’à 10 en surcomptant et en décomptant, mémoriser les doubles, trouver une partie quand on connaît le tout. Les signes + et − viendront au CP.'))];
    }
  };
  const TITLES={home:'Espace parents',prog:'Ses progrès',opts:'Réglages',save:'Sauvegarde',how:'Comment Hector enseigne'};
  function render(dir){
    head.replaceChildren(
      page==='home'?h('span',{class:'phsp'}):h('button',{class:'pnav','aria-label':'Retour',onclick:()=>go('home',-1)},pi('back')),
      h('h2',{},TITLES[page]),
      h('button',{class:'pnav','aria-label':'Fermer',onclick:close},pi('close')));
    const inner=h('div',{class:'ppage'+(dir>0?' in-r':dir<0?' in-l':'')},...P[page]().flat().filter(Boolean));
    body.replaceChildren(inner);body.scrollTop=0;
  }
  render(0);ROOT.append(p);
}
