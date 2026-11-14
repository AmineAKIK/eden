/* ============ la partie du jour ============ */
const PLACE=['c4','c7','a3+1','a5+1','s4-1','s6-1','a4+2','s5-2'];
function buildSession(){
  const t=today();
  if(!ST.placed)return PLACE.map(f=>({mode:'place',f}));
  const total={court:6,normal:8,long:10}[opt().len]||8;
  /* échauffement : un « combien ? », plutôt un nombre pas encore sûr */
  const cnt=COUNTS.filter(id=>!isMastered(id));const c=cnt.length?pick(cnt):pick(COUNTS);
  const seq=[{mode:known(c)?'review':'new',f:c}];
  const due=ORDER.filter(id=>known(id)&&ST.f[id].due<=t).sort((x,y)=>ST.f[x].box-ST.f[y].box||ST.f[x].due-ST.f[y].due);
  const newL=ORDER.filter(id=>!known(id)).slice(0,2);
  due.slice(0,2).forEach(f=>seq.push({mode:'review',f}));
  newL.forEach(f=>seq.push({mode:'new',f}));
  due.slice(2,2+Math.max(0,total-seq.length-newL.length)).forEach(f=>seq.push({mode:'review',f}));
  /* un calcul nouveau revient un peu plus loin dans la même partie */
  newL.forEach((f,i)=>{const at=seq.findIndex(s=>s.f===f&&s.mode==='new');seq.splice(Math.min(seq.length,at+2+i),0,{mode:'again',f});});
  if(seq.length<total){const have=new Set(seq.map(s=>s.f));
    ORDER.filter(id=>known(id)&&!have.has(id)).sort((x,y)=>ST.f[x].box-ST.f[y].box||Math.random()-.5).slice(0,total-seq.length).forEach(f=>seq.push({mode:'review',f}));}
  return seq;
}
/* après le test de départ : les étapes réussies sont considérées comme commencées */
function place(results){
  const passed=[];for(const g of ['add1','sub1','add2','sub2']){const items=PLACE.filter(id=>stageOf(id)&&stageOf(id).id===g);if(items.every(id=>results[id]))passed.push(g);else break;}
  const t=today();
  STAGES.filter(g=>passed.includes(g.id)).forEach(g=>g.ids.forEach(id=>{if(!ST.f[id])ST.f[id]={box:1,due:t+1,ok:0,ko:0};}));
  ST.placed=true;save();
}

async function start(){
  RUN++;
  try{
    const seq=buildSession();const P=playScreen(seq.length);
    if(!ST.intro)await prologue(P);else await sy(P,'nm_back');
    const placing=!ST.placed;if(placing){await sy(P,'place_intro');await sy(P,'nm_go');}
    let asked=0,first=0;const results={};
    for(let i=0;i<seq.length;i++){
      const it=seq[i];P.step(i);
      const r=await runItem(P,{id:it.f,mode:it.mode});
      grade(it.f,r,it.mode);save();asked++;if(r.first)first++;results[it.f]=r.first;
      /* un calcul raté revient plus loin dans la partie */
      if(!r.first&&it.mode!=='place'&&!seq.slice(i+1).some(s=>s.f===it.f)&&seq.filter(s=>s.f===it.f).length<3){seq.splice(Math.min(seq.length,i+3),0,{mode:'again',f:it.f});P.step(i);addDot(P);}
      await sleep(350);
    }
    if(placing){place(results);await sy(P,'nm_place_end');}
    ST.gold+=P.won;ST.log.push({d:today(),n:asked,ok:first,m:mastered(),g:P.won});if(ST.log.length>120)ST.log=ST.log.slice(-120);save();
    await endScreen(P.won);
  }catch(e){if(!(e instanceof Ab))console.error(e);}
}
function addDot(P){const d=document.querySelector('.game .prog');if(d)d.append(h('i'));}

/* ---------- le trésor : dix pièces font un sac ---------- */
function treasureView(total,fresh=0){
  const bags=Math.floor(total/10),loose=total%10;
  const box=h('div',{class:'treasure',role:'img','aria-label':`${total} pièces : ${bags} sacs de dix et ${loose} pièces`});
  const shownBags=Math.min(bags,12);
  for(let i=0;i<shownBags;i++)box.append(h('span',{class:'bag'},h('b',{},'10')));
  if(bags>shownBags)box.append(h('span',{class:'more'},`+ ${bags-shownBags} sacs`));
  const lc=h('span',{class:'loose'});for(let i=0;i<loose;i++)lc.append(h('i',{class:i>=loose-fresh?'new':''}));
  if(loose)box.append(lc);
  return box;
}
async function endScreen(won){
  const hero=makeHero(),bub=h('div',{class:'bubble'});
  const sc=h('div',{class:'screen end'},hero,h('h2',{},'Bravo Milo !'),
    h('div',{class:'won'},h('i'),h('b',{},`+ ${won}`)),treasureView(ST.gold,won),
    h('button',{class:'big',onclick:()=>{tick();showHome();}},icon('home'),'Terminer'),bub);
  mount(sc);HERO=hero;BUB=bub;mood('wow');fan();
  try{await say('nm_end1');await say('end2');}catch(e){}
}
async function showTreasure(){
  const hero=makeHero(),bub=h('div',{class:'bubble'});
  const back=h('button',{class:'ib','aria-label':'Maison',onclick:()=>{tick();showHome();}},icon('home'));
  const sc=h('div',{class:'screen tre'},h('div',{class:'bar'},back,h('div',{class:'fr ttl'},'Mon trésor'),h('span',{class:'ibsp'})),
    h('div',{class:'work'},ST.gold?treasureView(ST.gold):h('div',{class:'chestbig',html:'<svg viewBox="0 0 120 90"><rect x="10" y="34" width="100" height="52" rx="8" fill="#9A4F22" stroke="#3B1E0C" stroke-width="4"/><path d="M10 34v-8a16 16 0 0 1 16-16h68a16 16 0 0 1 16 16v8z" fill="#B4632E" stroke="#3B1E0C" stroke-width="4"/></svg>'})),
    h('div',{class:'talkrow'},hero,bub));
  mount(sc);HERO=hero;BUB=bub;const me=RUN;
  try{if(!ST.gold){await say('tr_empty');return;}await say('tr_1');if(me===RUN&&ST.gold>=10)await say('tr_2');}catch(e){}
}

/* ---------- accueil ---------- */
function showHome(){
  if(window.__updatePending){location.reload();return;}
  const doneToday=ST.log.some(l=>l.d===today());
  const hero=makeHero();
  const play=h('button',{class:'play fr','aria-label':'Jouer'},icon('play'),'Jouer');
  play.onclick=()=>{unlockAudio();tick();start();};
  const tre=h('button',{class:'pill',onclick:()=>{unlockAudio();tick();showTreasure();}},h('i',{class:'pc'}),'Mon trésor');
  const gear=h('button',{class:'gear','aria-label':'Parents'},icon('gear'));hold(gear);
  /* retour au catalogue seulement si on en vient (Milo ouvre son appli directement) */
  const fromCat=/\/apps\//.test(location.pathname)&&document.referrer&&new URL(document.referrer,location.href).pathname.replace(/index\.html$/,'')===new URL('../../',location.href).pathname;
  const cat=fromCat?h('a',{class:'ib catbtn',href:'../../','aria-label':'Les applis'},icon('grid')):null;
  const sc=h('div',{class:'screen home'},cat,hero,h('h1',{},'Plus et moins'),play,
    h('div',{class:'sub'},doneToday?'Partie du jour faite ✓':'Avec Hector'),
    h('div',{class:'row2'},tre),
    window.EdenInstall&&EdenInstall.need?h('button',{class:'instl',onclick:()=>EdenInstall.show()},'Mettre l’appli sur l’écran d’accueil'):null,gear);
  mount(sc);
}
function boot(){
  const old=document.getElementById('nojs');if(old)old.remove();
  let app=document.getElementById('app');if(!app){app=h('div',{id:'app'});document.body.append(app);}
  app.replaceChildren();ROOT=app;
  if(!document.querySelector('.turnmsg')){const t=h('div',{class:'turnmsg',role:'alert'});
    t.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 1h8a3 3 0 013 3v16a3 3 0 01-3 3H8a3 3 0 01-3-3V4a3 3 0 013-3zm0 2a1 1 0 00-1 1v16a1 1 0 001 1h8a1 1 0 001-1V4a1 1 0 00-1-1zm2 15h4v1.6h-4z"/></svg><div>Tourne le téléphone<br>pour jouer avec Hector</div>';
    document.body.append(t);}
  sizeClass();showHome();
}
