/* ============ la scène : le coffre d'Hector et ses pièces ============
   Un seul dessin SVG (viewBox 320 × 320) qui se met à l'échelle de la place disponible :
   rien ne peut déborder, quelle que soit la taille de l'écran.
   Dehors, les pièces sont rangées par rangées de cinq (comme les doigts d'une main). */
const VB=320,CR=24;                                   /* rayon d'une pièce */
const ROWY=[62,122],COLX=[44,102,160,218,276];         /* emplacements dehors : 2 rangées de 5 */
const CH={x:95,y:206,w:130,h:84};                      /* le coffre (corps) */
/* place de la pièce i parmi n posées dehors : centrées au-dessus du coffre, par rangées de cinq */
const slot=(i,n=10)=>{const r=Math.floor(i/5),inRow=n<=5?n:(r===0?5:n-5),y=n<=5?ROWY[1]:ROWY[r];return {x:160+((i%5)-(inRow-1)/2)*58,y};};
const inSlot=i=>({x:CH.x+20+(i%5)*22.5,y:CH.y+26+Math.floor(i/5)*26}); /* pièce vue dans le coffre transparent */
const MOUTH={x:CH.x+CH.w/2,y:CH.y-6};
/* dispositions pour « combien ? » : rangées de cinq, constellations de dé, ou en vrac */
const DICE={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};
function layout(n,kind){
  if(kind==='dice'&&n<=6)return DICE[n].map(([a,b])=>({x:160+a*58,y:150+b*58}));
  if(kind==='free'){const P=[];let guard=0;
    while(P.length<n&&guard++<4000){const p={x:34+Math.random()*252,y:34+Math.random()*250};if(P.every(q=>Math.hypot(q.x-p.x,q.y-p.y)>2*CR+10))P.push(p);}
    if(P.length===n)return P;}
  const y0=n>5?120:160;return Array.from({length:n},(_,i)=>({x:COLX[i%5],y:y0+Math.floor(i/5)*64}));
}
/* petite animation sans dépendance : en mode test, tout est instantané */
function tween(ms,fn){return new Promise(res=>{if(window.__FAST||!ms){fn(1);return res();}
  const t0=performance.now(),ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const step=now=>{const t=Math.min(1,(now-t0)/ms);fn(ease(t));if(t<1)requestAnimationFrame(step);else res();};requestAnimationFrame(step);});}

function makeScene({chest=true}={}){
  const svg=sv('svg',{viewBox:`0 0 ${VB} ${VB}`,class:'scene',role:'img','aria-label':'Le coffre d’Hector et ses pièces'});
  svg.append(sv('defs',{},
    sv('radialGradient',{id:'cgold',cx:'.35',cy:'.3',r:'.8'},sv('stop',{offset:'0','stop-color':'#FFF0A8'}),sv('stop',{offset:'.55','stop-color':'#F5BE2E'}),sv('stop',{offset:'1','stop-color':'#C98A12'})),
    sv('linearGradient',{id:'cwood',x1:'0',y1:'0',x2:'0',y2:'1'},sv('stop',{offset:'0','stop-color':'#B4632E'}),sv('stop',{offset:'1','stop-color':'#7E3F1A'}))));
  const back=sv('g'),coinsL=sv('g'),front=sv('g'),top=sv('g');svg.append(back,coinsL,front,top);
  const S={svg,coins:[],inside:0,plate:null,glass:false};
  if(chest){
    const body=sv('g',{class:'chest'});
    const box=sv('rect',{class:'cbox',x:CH.x,y:CH.y,width:CH.w,height:CH.h,rx:10,fill:'url(#cwood)',stroke:'#3B1E0C','stroke-width':4});
    const bands=[CH.x+22,CH.x+CH.w-22].map(x=>sv('rect',{class:'band',x:x-6,y:CH.y,width:12,height:CH.h,fill:'#E2A93B',stroke:'#3B1E0C','stroke-width':2.5}));
    const pl=sv('g',{class:'plate'},sv('rect',{x:CH.x+CH.w/2-28,y:CH.y+18,width:56,height:48,rx:10,fill:'#FFF8E6',stroke:'#3B1E0C','stroke-width':3}),
      sv('text',{x:CH.x+CH.w/2,y:CH.y+55,'text-anchor':'middle',class:'pnum'},''));
    body.append(box,...bands,pl);
    const inner=sv('g',{class:'inner'});            /* pièces vues à travers le coffre transparent */
    const lid=sv('g',{class:'lid'},sv('path',{d:`M${CH.x} ${CH.y}v-14a24 24 0 0 1 24-24h${CH.w-48}a24 24 0 0 1 24 24v14z`,fill:'url(#cwood)',stroke:'#3B1E0C','stroke-width':4}),
      sv('rect',{x:CH.x+CH.w/2-10,y:CH.y-10,width:20,height:18,rx:4,fill:'#E2A93B',stroke:'#3B1E0C','stroke-width':2.5}));
    back.append(body);front.append(inner,lid);
    S.box=box;S.inner=inner;S.lid=lid;S.plateT=pl.querySelector('text');S.plateG=pl;
  }
  /* --- pièces --- */
  const mkCoin=(x,y)=>{const g=sv('g',{class:'coin',transform:`translate(${x} ${y})`});
    g.append(sv('circle',{class:'halo',r:CR+7}),sv('circle',{r:CR,fill:'url(#cgold)',stroke:'#7A5208','stroke-width':3}),sv('circle',{r:CR-8,fill:'none',stroke:'#C98A12','stroke-width':2}),
      sv('text',{class:'cn','text-anchor':'middle',y:9},''));
    const c={g,x,y,move(nx,ny,ms=420){const ox=c.x,oy=c.y;c.x=nx;c.y=ny;return tween(ms,t=>g.setAttribute('transform',`translate(${ox+(nx-ox)*t} ${oy+(ny-oy)*t})`));},
      label(t){g.querySelector('.cn').textContent=t;g.classList.toggle('done',t!=='');},fade(on){g.classList.toggle('gone',on);}};
    coinsL.append(g);return c;};
  S.coin=mkCoin;
  /* pièces posées dehors (n en partant de l'emplacement k) */
  S.putOut=async(n,{from=0,total=0,pop=true,pos=null}={})=>{const out=[];for(let i=0;i<n;i++){const p=pos?pos[i]:slot(from+i,total||n);const c=mkCoin(p.x,p.y);if(pop&&!window.__FAST){c.g.classList.add('pop');c.g.style.animationDelay=(i*70)+'ms';}out.push(c);}
    S.coins.push(...out);if(pop)await sleep(260+n*70);return out;};
  S.setPlate=v=>{if(S.plateT)S.plateT.textContent=v==null?'':String(v);if(S.plateG)S.plateG.classList.toggle('q',v==='?');};
  S.lidTo=deg=>{if(!S.lid)return Promise.resolve();const from=S.lidA||0;S.lidA=deg;
    return tween(380,t=>S.lid.setAttribute('transform',`rotate(${from+(deg-from)*t} ${CH.x+CH.w} ${CH.y})`));};
  S.open=()=>S.lidTo(100);S.close=()=>S.lidTo(0);
  /* les pièces entrent dans le coffre, une par une */
  S.into=async(cs)=>{for(const c of cs){clink();await c.move(MOUTH.x,MOUTH.y+20,320);c.g.remove();S.inside++;S.coins=S.coins.filter(x=>x!==c);S.drawInner();await sleep(60);}};
  /* des pièces sortent du coffre et se posent dehors */
  S.outOf=async(n)=>{const out=[];for(let i=0;i<n;i++){const p=slot(i,n);const c=mkCoin(MOUTH.x,MOUTH.y+20);S.inside--;S.drawInner();clink();await c.move(p.x,p.y,360);out.push(c);S.coins.push(c);}return out;};
  /* coffre transparent : on voit les pièces dedans, rangées par cinq */
  S.drawInner=()=>{if(!S.inner)return;S.inner.replaceChildren();if(!S.glass)return;
    for(let i=0;i<S.inside;i++){const p=inSlot(i);S.inner.append(sv('circle',{cx:p.x,cy:p.y,r:9.5,fill:'url(#cgold)',stroke:'#7A5208','stroke-width':2}));}};
  S.setGlass=on=>{S.glass=on;svg.classList.toggle('glass',on);S.drawInner();};
  /* emplacements vides (pointillés) : les pièces cachées du coffre mystère */
  S.ghosts=(n,from,total)=>Array.from({length:n},(_,i)=>{const p=slot(from+i,total);const g=sv('g',{class:'coin ghost',transform:`translate(${p.x} ${p.y})`},
    sv('circle',{class:'halo',r:CR+7}),sv('circle',{r:CR,fill:'#FFF8E6',stroke:'#C98A12','stroke-width':3,'stroke-dasharray':'6 5'}),sv('text',{class:'cn','text-anchor':'middle',y:9},''));
    coinsL.append(g);return {g,label(t){g.querySelector('.cn').textContent=t;g.classList.toggle('done',t!=='');}};});
  /* le nombre en tout (coffre mystère) : un écusson au-dessus du coffre */
  S.badge=v=>{top.querySelectorAll('.badge').forEach(e=>e.remove());if(v==null)return;
    top.append(sv('g',{class:'badge'},sv('circle',{cx:262,cy:178,r:30,fill:'#2640C9',stroke:'#141A38','stroke-width':3}),sv('text',{x:262,y:192,'text-anchor':'middle',class:'bnum'},String(v))));};
  S.clearOut=()=>{S.coins.forEach(c=>c.g.remove());S.coins=[];coinsL.querySelectorAll('.ghost').forEach(g=>g.remove());};
  return S;
}

/* l'enfant touche des pièces une par une ; chaque toucher dit le nombre suivant */
function tapCount(items,startAt,dir=1){
  return new Promise(res=>{let n=startAt,left=items.length;
    items.forEach(c=>{c.g.classList.add('tap');c.g.onclick=async()=>{if(!c.g.classList.contains('tap'))return;c.g.classList.remove('tap');c.g.onclick=null;
      n+=dir;c.label(String(n));tick();say('cnt_'+n,{sub:false});if(--left===0){await sleep(500);res(n);}};});
  });
}
/* Hector compte lui-même (démonstration) */
async function autoCount(items,startAt,dir=1){let n=startAt;for(const c of items){n+=dir;c.label(String(n));tick();await say('cnt_'+n,{sub:false});await sleep(120);}return n;}

/* ============ la bande des nombres (0 à 10) : toujours présente, pour que rien ne bouge ============ */
function makeStrip(){
  const el=h('div',{class:'strip',role:'group','aria-label':'Les nombres de zéro à dix'});
  const btns=[];for(let n=0;n<=10;n++){const b=h('button',{class:'nb','aria-label':NUM[n],disabled:'disabled'},String(n));btns.push(b);el.append(b);}
  const st={el,btns,on:false,
    ask(){return new Promise(res=>{st.on=true;el.classList.add('on');btns.forEach((b,n)=>{b.disabled=false;b.classList.remove('picked','good');b.onclick=()=>{if(!st.on)return;tick();st.off();b.classList.add('picked');res(n);};});});},
    off(){st.on=false;el.classList.remove('on');btns.forEach(b=>{b.disabled=true;b.onclick=null;});},
    mark(n,good){btns[n].classList.remove('picked');btns[n].classList.add(good?'good':'bad');setTimeout(()=>btns[n].classList.remove('good','bad'),900);}};
  return st;
}
