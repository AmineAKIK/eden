
/* ============ fil pédagogique : chapitres, techniques, gestes ============ */
const chk2=S=>{if(S.me!==RUN)throw new Ab();};
async function sy(S,k){await say(k);chk2(S);}
const taught=kind=>kind==='five'?!!ST.t.cut:kind==='ten'?!!ST.t.ten:true;
function scene(tagText=''){
  const hero=makeHero(),bub=h('div',{class:'bubble'}),work=h('div',{class:'work'}),dock=h('div',{class:'dock'});DOCK=dock;
  const tag=h('div',{class:'tag'},tagText);
  const back=h('button',{class:'ib','aria-label':'Maison',onclick:()=>{tick();stopVoice();KEYS=null;showHome();}},icon('home'));
  const ear=h('button',{class:'ib','aria-label':'Réécouter',onclick:()=>{if(lastKey)say(lastKey,{sub:false});}},icon('ear'));
  const K=keypad();K.el.style.display='none';
  mount(h('div',{class:'screen'},h('div',{class:'bar'},back,tag,ear),work,h('div',{class:'talkrow'},hero,bub),dock,K.el));
  HERO=hero;BUB=bub;
  return {work,dock,K,tag,me:RUN,hero};
}
const tapOn=(el,S)=>new Promise(res=>{el.classList.add('tapme');el.addEventListener('click',()=>{el.classList.remove('tapme');tick();res();},{once:true});}).then(()=>{chk2(S);fit(S.work);});

/* --- la mise en page s'adapte à la hauteur réelle de l'écran --- */
function fit(box){
  if(!box||!box.isConnected)return;
  const need=()=>{const cs=getComputedStyle(box),g=parseFloat(cs.rowGap)||0;const kids=[...box.children].filter(k=>k.offsetParent!==null);
    return kids.reduce((s,k)=>s+k.offsetHeight,0)+g*Math.max(0,kids.length-1)+parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom);};
  const arrs=[...box.querySelectorAll('.ar')];
  arrs.forEach(a=>{const m=parseFloat(a.dataset.dmax);if(m)a.style.setProperty('--d',m+'px');});
  for(let i=0;i<40&&need()>box.clientHeight;i++){
    let ch=false;arrs.forEach(a=>{const d=parseFloat(a.style.getPropertyValue('--d'));if(d>7){a.style.setProperty('--d',(d-1)+'px');ch=true;}});
    if(!ch)break;
  }
}
addEventListener('resize',()=>{const w=document.querySelector('.screen>.work');if(w)fit(w);});

/* rectangle de pièces découpé en blocs ; chaque bloc a son étiquette à droite */
function mkBlocks(cols,parts){
  const W=Math.min(innerWidth,540)-60-120;
  const d=Math.max(8,Math.min(28,Math.floor(W/cols)-4));
  const el=h('div',{class:'ar',role:'img','aria-label':`${parts.reduce((s,x)=>s+x,0)} rangées de ${cols} pièces`});
  el.style.setProperty('--d',d+'px');el.dataset.dmax=d;
  const blocks=parts.map(n=>{
    const rowsEl=h('div',{class:'rows'}),rows=[];
    for(let r=0;r<n;r++){const row=h('div',{class:'rw'});for(let c=0;c<cols;c++)row.append(h('span',{class:'dt y'}));rows.push(row);rowsEl.append(row);}
    const lab=h('div',{class:'lab'});el.append(rowsEl,lab);return {rowsEl,rows,lab};
  });
  return {el,blocks,d};
}
const rowCounts=(rows,cols)=>rows.forEach((r,i)=>{let l=r.querySelector('.rl');if(!l){l=h('span',{class:'rl'});r.append(l);}l.textContent=String((i+1)*cols);});
const focusBlk=(A,i)=>A.blocks.forEach((b,k)=>{const on=i===-1||k===i;b.rowsEl.classList.toggle('dim',!on);b.lab.classList.toggle('dim',!on);});
const hideK=S=>{S.K.el.style.display='none';KEYS=null;};

/* petite question au clavier, liée au dessin.
   1re erreur : une aide visuelle ciblée ; 2e erreur : la réponse s'affiche, avec le dessin. */
async function askNum(S,host,expr,expected,qkey,o={}){
  const {K}=S;const ans=h('span',{class:'ans'},'?');
  const eq=h('div',{class:'eq sm'},h('span',{},expr+' ='),ans);host.append(eq);
  K.el.style.display='';K.val='';K.lock=false;KEYS=K;K.upd=()=>{ans.textContent=K.val||'?';};
  fit(S.work);
  setBub('Combien font '+expr+' ?');mood('think');
  if(qkey)say(qkey,{sub:false});
  let tries=0;
  await new Promise(res=>{K.go=async v=>{
    if(K.lock)return;
    if(Number(v)===expected){K.lock=true;ans.classList.add('ok');chime();mood('wow');res();return;}
    tries++;ans.classList.add('shake');soft();setTimeout(()=>ans.classList.remove('shake'),450);K.val='';K.upd();
    if(tries>=2){K.lock=true;ans.textContent=String(expected);ans.classList.add('ok');say('q_show');res();return;}
    K.lock=true;
    if(o.rows){rowCounts(o.rows,o.cols);fit(S.work);await say('h_rows');}
    else if(o.type==='add')await say('h_add');
    else if(o.type==='sub')await say('h_sub');
    else await say('q_try2');
    if(S.me!==RUN)return;
    setBub('Combien font '+expr+' ?');K.lock=false;
  };});
  chk2(S);
  /* ce que l'enfant fait ici renseigne le système */
  if(o.type)preNote(o.type,tries===0);
  if(o.fact)factNote(o.fact,tries===0);
  await sleep(tries>=2?1600:600);chk2(S);eq.remove();
  return tries===0;
}
function preNote(k,ok){const p=ST.pre[k]||(ST.pre[k]={ok:0,ko:0,last:1});if(ok)p.ok++;else p.ko++;p.last=ok?1:0;save();}
function factNote(id,ok){const e=ST.f[id];if(!e||ok)return;e.ko++;e.box=Math.min(e.box,1);e.due=today();save();}
const fid=(a,b)=>Math.min(a,b)+'-'+Math.max(a,b);

/* applique une technique sur a0 × b0 avec de vrais gestes.
   disp=[a,b] : le calcul tel qu'il est affiché (on tourne d'abord s'il est dans l'autre sens).
   kind : 'five' (couper), 'ten' (presque dix), 'skip' (compter les rangées). */
async function runTechnique(S,a0,b0,host,kp={}){
  const ch=chainOf(a0,b0);
  const kind=kp.kind||ch.kind;
  const disp=kp.disp||[ch.x,ch.y];
  const q=h('div',{class:'qz'});
  if(kind==='skip'){
    const [x,y]=disp;
    const A=mkBlocks(y,[x]);host.append(A.el,q);A.blocks[0].rows.forEach(r=>r.classList.add('gh'));fit(S.work);
    say(kp.count||'tech_count');
    for(let i=0;i<x;i++){const r=A.blocks[0].rows[i];await tapOn(r,S);r.classList.remove('gh');rowCounts(A.blocks[0].rows.slice(0,i+1),y);}
    A.blocks[0].lab.textContent=`${x} × ${y} = ${x*y}`;chime();fit(S.work);await sleep(500);chk2(S);
    hideK(S);return;
  }
  /* tourner d'abord, si le calcul est écrit dans l'autre sens */
  if(disp[0]!==ch.x){
    const box=h('div',{class:'rotbox'}),R=mkBlocks(disp[1],[disp[0]]);box.append(R.el);
    const lbl=h('div',{class:'eq sm'},`${disp[0]} × ${disp[1]}`),btn=h('button',{class:'big alt','aria-label':'Tourner'},icon('rot'),'Tourner');
    host.append(box,lbl,btn);fit(S.work);
    say('tech_rot');await tapOn(btn,S);btn.remove();
    box.style.transform='rotate(90deg)';await sleep(700);chk2(S);
    lbl.textContent=`${disp[0]} × ${disp[1]} = ${ch.x} × ${ch.y}`;box.remove();chime();await sleep(300);chk2(S);
    lbl.className='lines';
  }
  if(kind==='five'){
    const y=ch.y,r=ch.r;
    const A=mkBlocks(y,[5,r]);
    const cut=h('button',{class:'cutl','aria-label':'Couper ici'},h('i'));A.el.insertBefore(cut,A.blocks[1].rowsEl);
    host.append(A.el,q);fit(S.work);
    if(kp.intro)await sy(S,kp.intro);
    say(kp.cut||'tech_cut');await tapOn(cut,S);
    cut.classList.add('done');A.blocks[1].rows.forEach(rw=>rw.classList.add('low'));chime();fit(S.work);await sleep(500);chk2(S);
    if(kp.afterCut)await sy(S,kp.afterCut);
    focusBlk(A,0);
    await askNum(S,q,`5 × ${y}`,5*y,`q_5_${y}`,{rows:A.blocks[0].rows,cols:y,fact:y>=2?fid(5,y):null});
    A.blocks[0].lab.textContent=`5 × ${y} = ${5*y}`;
    focusBlk(A,1);
    await askNum(S,q,`${r} × ${y}`,r*y,`q_${r}_${y}`,{rows:A.blocks[1].rows,cols:y,fact:r>=2?fid(r,y):null});
    A.blocks[1].lab.textContent=`${r} × ${y} = ${r*y}`;
    focusBlk(A,-1);
    await askNum(S,q,`${5*y} + ${r*y}`,ch.x*y,`p_${5*y}_${r*y}`,{type:'add'});
    q.append(h('div',{class:'eq sm res'},`${ch.x} × ${y} = ${ch.x*y}`));fit(S.work);
  }else{
    const n=ch.y,A=mkBlocks(n,[10]),gr=A.blocks[0].rows[9];gr.classList.add('gh');
    host.append(A.el,q);fit(S.work);
    if(kp.intro)await sy(S,kp.intro);
    say(kp.ten1||'tech_ten');await tapOn(gr,S);
    gr.classList.remove('gh');gr.classList.add('low');chime();await sleep(400);chk2(S);
    if(kp.afterFill)await sy(S,kp.afterFill);
    await askNum(S,q,`10 × ${n}`,10*n,`q_10_${n}`,{rows:A.blocks[0].rows,cols:n,type:'x10'});
    A.blocks[0].lab.textContent=`10 × ${n} = ${10*n}`;
    hideK(S);fit(S.work);setBub('');say('tech_ten2');await tapOn(gr,S);
    gr.classList.remove('low');gr.classList.add('gh','out');gr.append(h('span',{class:'rl minus'},`− ${n}`));soft();await sleep(400);chk2(S);
    await askNum(S,q,`${10*n} − ${n}`,9*n,`m_${10*n}_${n}`,{type:'sub'});
    q.append(h('div',{class:'eq sm res'},`9 × ${n} = ${9*n}`));fit(S.work);
  }
  hideK(S);fit(S.work);
}

/* ---------- les chapitres ---------- */
async function ch1(S){
  S.tag.textContent='Les coffres';
  const pks=h('div',{class:'pks'}),cnt=h('div',{class:'cnt'},''),note=h('div',{class:'lines'},'');
  const chests=[0,1,2].map(()=>{const c=h('button',{class:'pk chest','aria-label':'Coffre'},[...Array(4)].map(()=>h('span',{class:'dt y',style:'width:24px;height:24px;display:block'})));c.style.gridTemplateColumns='repeat(2,24px)';pks.append(c);return c;});
  S.work.append(pks,cnt,note);
  await sy(S,'c1_a');
  chests.forEach(c=>c.classList.add('tapme'));say('c1_b');
  let n=0;
  await new Promise(res=>chests.forEach(c=>c.onclick=()=>{if(c.classList.contains('on'))return;c.classList.remove('tapme');c.classList.add('on');n++;tick();cnt.textContent=String(n*4);if(n===3)res();}));
  chk2(S);chime();mood('wow');note.textContent='3 coffres de 4 pièces';
  await sy(S,'c1_c');
  S.work.append(h('div',{class:'eq'},'3 × 4 = 12'));
  await sy(S,'c1_d');
  await nextBtn('Suite');chk2(S);
}
async function ch2(S){
  S.tag.textContent='Tourner';
  const box=h('div',{class:'rotbox'}),A=mkBlocks(4,[3]);A.blocks[0].lab.textContent='3 × 4';box.append(A.el);
  const eq=h('div',{class:'eq'},'3 × 4 = 12'),note=h('div',{class:'lines'},'3 rangées de 4');
  S.work.append(box,note,eq);fit(S.work);
  await sy(S,'c2_a');
  const btn=h('button',{class:'big','aria-label':'Tourner'},icon('rot'),'Tourner');S.dock.append(btn);
  say('c2_b');await tapOn(btn,S);btn.remove();
  A.blocks[0].lab.textContent='';box.style.transform='rotate(90deg)';await sleep(700);chk2(S);
  box.style.transition='none';box.style.transform='none';const B=mkBlocks(3,[4]);B.blocks[0].lab.textContent='4 × 3';box.replaceChildren(B.el);
  eq.textContent='4 × 3 = 12';note.textContent='4 rangées de 3';chime();mood('wow');fit(S.work);
  await sy(S,'c2_c');
  note.textContent='3 × 4 = 4 × 3';
  await nextBtn('Suite');chk2(S);
}
async function ch3(S){
  S.tag.textContent='Nouvelle technique : couper';
  await runTechnique(S,6,7,S.work,{intro:'c3_a',cut:'c3_b',afterCut:'c3_c'});
  await sy(S,'c3_e');
  await nextBtn('Suite');chk2(S);
}
async function ch4(S){
  S.tag.textContent='Nouvelle technique : presque dix';
  await runTechnique(S,7,9,S.work,{intro:'c4_a',ten1:'c4_b',afterFill:'c4_c'});
  await sy(S,'c4_e');
  await nextBtn('Suite');chk2(S);
}
const CHS=[ch1,ch2,ch3,ch4];
async function prologue(){
  for(let i=ST.chap||0;i<2;i++){const S=scene();await CHS[i](S);ST.chap=i+1;save();}
  const S=scene('Tu es prêt !');
  S.work.append(h('div',{class:'chips'},['Les coffres','Tourner'].map(t=>h('span',{class:'chip n'},t))));
  await sy(S,'c5');
  await nextBtn('Je commence');chk2(S);
  ST.intro=true;save();
}
/* ---------- menu « Les techniques d'Hector » ---------- */
function showTech(){
  const names=['Les coffres','Tourner','Couper','Presque dix'],sub=['3 × 4 = 12','3 × 4 = 4 × 3','6 × 7 = 5 × 7 + 1 × 7','9 × 7 = 10 × 7 − 7'];
  const open=[ST.intro||ST.chap>=1,ST.intro||ST.chap>=2,!!ST.t.cut,!!ST.t.ten];
  const back=h('button',{class:'ib','aria-label':'Maison',onclick:()=>{tick();showHome();}},icon('home'));
  const grid=h('div',{class:'tcards'},names.map((n,i)=>h('button',{class:'tcard'+(open[i]?'':' lock'),onclick:async()=>{
    if(!open[i]){soft();return;}
    unlockAudio();tick();const S=scene();
    try{await CHS[i](S);}catch(e){if(!(e instanceof Ab))console.error(e);return;}
    showTech();}},h('b',{},n),h('span',{},open[i]?sub[i]:'Bientôt'))));
  mount(h('div',{class:'screen'},h('div',{class:'bar'},back,h('div',{class:'fr',style:'font-size:24px;color:var(--bic);flex:1;text-align:center'},'Les techniques d’Hector'),h('div',{style:'width:52px'})),
    h('div',{class:'work',style:'justify-content:flex-start;padding-top:18px'},h('div',{class:'sub',style:'text-align:center;margin-bottom:6px'},'Touche une technique pour la revoir.'),grid)));
}
