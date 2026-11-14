/* ============ une partie : l'écran, les situations, les techniques, les erreurs ============ */

/* l'écran de jeu : la barre, la scène, Hector et sa bulle, la bande des nombres.
   Tout a une place fixe dès le départ : rien ne saute quand on passe d'une étape à l'autre. */
function playScreen(n){
  const home=h('button',{class:'ib','aria-label':'Maison',onclick:()=>{tick();showHome();}},icon('home'));
  const dots=h('div',{class:'prog','aria-hidden':'true'},Array.from({length:n},()=>h('i')));
  const gold=h('div',{class:'gold','aria-label':'Pièces gagnées'},h('i'),h('b',{},'0'));
  const work=h('div',{class:'work'}),hero=makeHero(),bub=h('div',{class:'bubble'}),strip=makeStrip();
  const sc=h('div',{class:'screen game'},h('div',{class:'bar'},home,dots,gold),work,h('div',{class:'talkrow'},hero,bub),strip.el);
  mount(sc);HERO=hero;BUB=bub;
  const P={me:RUN,work,strip,gold,won:0,scene:null,
    newScene(o){work.replaceChildren();P.scene=makeScene(o);work.append(P.scene.svg);return P.scene;},
    step(i){[...dots.children].forEach((d,j)=>{d.className=j<i?'d':j===i?'c':'';});},
    win(){P.won++;gold.querySelector('b').textContent=String(P.won);gold.classList.remove('bump');void gold.offsetWidth;gold.classList.add('bump');}};
  return P;
}
const sy=async(P,k,o)=>{chk(P.me);await say(k,o);chk(P.me);};

/* ---------- mise en place d'une situation (on montre d'abord, puis Hector parle) ---------- */
async function stage(P,it){
  const {k,x,y}=parse(it.id),S=P.newScene({chest:k!=='c'});const R={S,moved:[]};
  if(k==='c'){
    const kind=x<=6&&Math.random()<.4?'dice':(Math.random()<.35?'free':'rows');
    R.moved=await S.putOut(x,{pos:layout(x,kind)});await sy(P,'q_count');return R;
  }
  if(k==='a'||k==='s'){
    const cs=await S.putOut(x);await sy(P,'put_'+x);await S.open();await S.into(cs);await S.close();S.setPlate(x);chk(P.me);
    if(k==='a'){R.moved=await S.putOut(y);await sy(P,'add_'+y);
      if(x===y&&!ST.t.dbl){ST.t.dbl=1;save();mood('wow');await sy(P,'t_double');}
      await sy(P,'q_add');}
    else{await S.open();R.moved=await S.outOf(y);await S.close();S.setPlate('?');await sy(P,'rem_'+y);await sy(P,'q_sub');}
    return R;
  }
  /* coffre mystère : x en tout, y dehors */
  S.badge(x);S.setPlate('?');R.inside=x-y;S.inside=x-y;
  R.moved=await S.putOut(y,{total:x});await sy(P,'all_'+x);await sy(P,'see_'+y);await sy(P,'q_split');return R;
}

/* ---------- ce que l'erreur montre ---------- */
function diag(id,n){const {k,x,y,ans}=parse(id);
  if(k==='c')return Math.abs(n-ans)===1?'d_off1':'d_gen';
  if(k==='a'){if(n===x)return 'd_start_add';if(n===y)return 'd_part_add';if(n===x-y&&y)return 'd_op_add';return Math.abs(n-ans)===1?'d_off1':'d_gen';}
  if(k==='s'){if(n===x+y)return 'd_op_sub';if(n===x)return 'd_start_sub';if(n===y&&y!==ans)return 'd_part_sub';return Math.abs(n-ans)===1?'d_off1':'d_gen';}
  if(n===x)return 'd_whole';if(n===y)return 'd_seen';return Math.abs(n-ans)===1?'d_off1':'d_gen';
}
const ansKey=(k,v)=>k==='s'?'rest_'+v:k==='m'?'hid_'+v:'tot_'+v;

/* ---------- refaire avec l'enfant : il touche les pièces et compte avec Hector ---------- */
async function guided(P,it,R){
  const {k,x,y,ans}=parse(it.id),S=R.S;mood('think');
  if(k==='c'){R.moved.forEach(c=>c.label(''));await sy(P,'c_you');await tapCount(R.moved,0);chk(P.me);}
  else if(k==='a'){await sy(P,'keep_'+x);await sy(P,'t_you_add');await tapCount(R.moved,x);chk(P.me);}
  else if(k==='s'){await sy(P,'keep_'+x);await sy(P,'t_you_sub');await tapCount(R.moved,x,-1);chk(P.me);}
  else{R.moved.forEach((c,i)=>c.label(String(i+1)));const g=S.ghosts(x-y,y,x);await sy(P,'keep_'+y);await sy(P,'t_you_mys');await tapCount(g,y);chk(P.me);}
  await sy(P,ansKey(k,ans));
}
/* ---------- montrer la réponse (deuxième erreur) ---------- */
async function reveal(P,it,R){
  const {k,x,y,ans}=parse(it.id),S=R.S;await sy(P,'show');
  if(k==='c'){R.moved.forEach(c=>c.label(''));await autoCount(R.moved,0);}
  else{S.setPlate(ans);if(k!=='a'){S.setGlass(true);}
    if(k==='a'){await autoCount(R.moved,x);}else if(k==='s'){await autoCount(R.moved,x,-1);}else{R.moved.forEach((c,i)=>c.label(String(i+1)));const g=S.ghosts(x-y,y,x);await autoCount(g,y);}}
  chk(P.me);await sy(P,ansKey(k,ans));await sy(P,'later');
}
/* ---------- la bonne réponse : la scène se termine, une pièce pour le trésor ---------- */
async function success(P,it,R,first){
  const {k,ans}=parse(it.id),S=R.S;chime();mood('happy');
  if(k==='a'){await S.open();await S.into(R.moved);await S.close();S.setPlate(ans);}
  else if(k==='s'||k==='m'){S.setPlate(ans);S.setGlass(true);}
  await sy(P,'ok_'+ans);
  if(first){P.win();if(!ST.gainSeen){ST.gainSeen=1;save();await sy(P,'gain');}else if(Math.random()<.35)await sy(P,pick(['ok1','ok2','ok3','ok4','nm_ok5']));}
}

/* ---------- une situation complète ---------- */
async function runItem(P,it){
  const {k,ans}=parse(it.id);window.__CUR=it.id;
  await teachIfNeeded(P,it);
  const R=await stage(P,it);
  const t0=Date.now();let n=await P.strip.ask();chk(P.me);
  const slow=(Date.now()-t0)>opt().slow*1000;
  if(n===ans){P.strip.mark(n,true);await success(P,it,R,true);return {first:true,slow};}
  P.strip.mark(n,false);mood('oops');await sy(P,diag(it.id,n));
  await guided(P,it,R);await sy(P,'again');
  n=await P.strip.ask();chk(P.me);
  if(n===ans){P.strip.mark(n,true);await success(P,it,R,false);return {first:false};}
  P.strip.mark(n,false);await reveal(P,it,R);return {first:false,revealed:true};
}

/* ============ les techniques, montrées le jour où on en a besoin ============ */
async function teachIfNeeded(P,it){
  const {k,x,y}=parse(it.id);
  if(k==='a'&&!ST.t.keep){await sy(P,'new');await teachKeep(P,(x===3&&y===2)?[4,1]:[3,2]);ST.t.keep=1;save();}
  if(k==='s'&&!ST.t.back){await sy(P,'new');await teachBack(P,(x===5&&y===2)?[4,1]:[5,2]);ST.t.back=1;save();}
  if(k==='m'&&!ST.t.mys){await sy(P,'new');await teachMys(P,(x===5&&y===3)?[4,1]:[5,3]);ST.t.mys=1;save();}
}
async function teachKeep(P,[x,y]){
  const S=P.newScene({chest:true});const cs=await S.putOut(x);await sy(P,'put_'+x);await S.open();await S.into(cs);await S.close();S.setPlate(x);
  await sy(P,'t_keep1');const add=await S.putOut(y);await sy(P,'add_'+y);await sy(P,'t_keep2');mood('think');
  await sy(P,'keep_'+x);await autoCount(add,x);chk(P.me);await sy(P,'tot_'+(x+y));await S.open();await S.into(add);await S.close();S.setPlate(x+y);mood('happy');await sleep(500);
}
async function teachBack(P,[x,y]){
  const S=P.newScene({chest:true});const cs=await S.putOut(x);await sy(P,'put_'+x);await S.open();await S.into(cs);await S.close();S.setPlate(x);
  await S.open();const out=await S.outOf(y);await S.close();S.setPlate('?');await sy(P,'rem_'+y);await sy(P,'t_back1');mood('think');
  await sy(P,'keep_'+x);await autoCount(out,x,-1);chk(P.me);await sy(P,'rest_'+(x-y));S.setPlate(x-y);S.setGlass(true);mood('happy');await sleep(700);
}
async function teachMys(P,[x,y]){
  const S=P.newScene({chest:true});S.badge(x);S.setPlate('?');S.inside=x-y;const out=await S.putOut(y,{total:x});
  await sy(P,'t_mys1');await sy(P,'all_'+x);await sy(P,'see_'+y);await sy(P,'t_mys2');mood('think');
  out.forEach((c,i)=>c.label(String(i+1)));const g=S.ghosts(x-y,y,x);await sy(P,'keep_'+y);await autoCount(g,y);chk(P.me);await sy(P,'hid_'+(x-y));S.setPlate(x-y);S.setGlass(true);mood('happy');await sleep(700);
}

/* ============ le premier jour : le coffre, compter, répondre ============ */
async function prologue(P){
  let S=P.newScene({chest:true});await sy(P,'nm_hello');await sy(P,'coffre');
  S=P.newScene({chest:false});const cs=await S.putOut(5,{pos:layout(5,'rows')});
  await sy(P,'c_how');await sy(P,'c_you');await tapCount(cs,0);chk(P.me);await sy(P,'c_last');await sy(P,'tot_5');
  P.strip.el.classList.add('hint');window.__CUR='c5';await sy(P,'strip');
  const n=await P.strip.ask();chk(P.me);P.strip.el.classList.remove('hint');
  if(n===5){P.strip.mark(5,true);chime();await sy(P,'ok_5');}else{P.strip.mark(n,false);await sy(P,'tot_5');}
  ST.intro=true;save();
}
