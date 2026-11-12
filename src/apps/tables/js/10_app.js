
/* ============ outils ============ */
const sleep=ms=>new Promise(r=>setTimeout(r,window.__FAST?6:ms));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const pick=a=>a[Math.floor(Math.random()*a.length)];
function h(tag,at={},...kids){const e=document.createElement(tag);for(const k in at){const v=at[k];if(v==null)continue;if(k==='class')e.className=v;else if(k==='style')e.style.cssText=v;else if(k==='html')e.innerHTML=v;else if(k.startsWith('on'))e[k]=v;else e.setAttribute(k,v);}
  kids.flat().forEach(c=>{if(c==null||c===false)return;e.append(c.nodeType?c:document.createTextNode(c));});return e;}
const IC={
 play:'<svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg>',
 home:'<svg viewBox="0 0 24 24"><path d="M12 3 2 12h3v8h5v-5h4v5h5v-8h3z"/></svg>',
 ear:'<svg viewBox="0 0 24 24"><path d="M3 10v4h4l5 4V6L7 10zm13.5 2a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',
 bulb:'<svg viewBox="0 0 24 24"><path d="M9 21h6v-1.5H9zm3-19a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>',
 del:'<svg viewBox="0 0 24 24"><path d="M22 4H8l-6 8 6 8h14zM17.7 14.3l-1.4 1.4L14 13.4l-2.3 2.3-1.4-1.4L12.6 12l-2.3-2.3 1.4-1.4L14 10.6l2.3-2.3 1.4 1.4L15.4 12z"/></svg>',
 check:'<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>',
 next:'<svg viewBox="0 0 24 24"><path d="M5 11h11.2l-4.9-4.9L12.7 4.7 20 12l-7.3 7.3-1.4-1.4 4.9-4.9H5z"/></svg>',
 grid:'<svg viewBox="0 0 24 24"><path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"/></svg>',
 rot:'<svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>',
 gear:'<svg viewBox="0 0 24 24"><path d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3h-4l-.4 2.9a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1c.5.4 1.1.7 1.7 1L11 21h4l.4-2.9c.6-.3 1.2-.6 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>'
};
const icon=n=>{const d=document.createElement('span');d.innerHTML=IC[n];return d.firstChild;};

/* ============ mémoire des calculs (répétition espacée) ============ */
const KEY='eden:tables',OLD_KEYS=['pico-tables-v2'];
let ST={voice:true,intro:false,chap:0,t:{cut:0,ten:0},pre:{},placed:false,hardIdx:0,f:{},log:[]};
try{let raw=localStorage.getItem(KEY);if(raw==null)for(const k of OLD_KEYS){raw=localStorage.getItem(k);if(raw!=null)break;}const s=JSON.parse(raw||'null');if(s)Object.assign(ST,s);}catch(e){}
ST.t=ST.t||{cut:0,ten:0};ST.pre=ST.pre||{};
/* ancienne version : les 4 chapitres avaient déjà été vus */
if(ST.chap>=4){ST.t.cut=1;ST.t.ten=1;}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(ST));}catch(e){}};
const today=()=>{const d=new Date();return Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/86400000);};
const FACTS=[];for(let a=2;a<=9;a++)for(let b=a;b<=9;b++)FACTS.push(a+'-'+b);
const cls=id=>{const [a,b]=id.split('-').map(Number);return b<=5?'ss':(a<=5?'sb':'bb');};
const HARD=[['6-6','6-7'],['6-8','6-9'],['7-7','7-8'],['7-9','8-8'],['8-9','9-9']];
const INT=[0,1,2,4,8];
const ab=id=>id.split('-').map(Number);
const known=id=>ST.f[id];
const mastered=()=>FACTS.filter(id=>known(id)&&ST.f[id].box>=3).length;

/* réglages des parents (ajoutés en 1.2 : valeurs par défaut si absents) */
const OPT0={len:'normal',slow:9,sfx:true};
const opt=()=>Object.assign({},OPT0,ST.opt||{});
const setOpt=(k,v)=>{ST.opt=Object.assign(opt(),{[k]:v});save();};
function buildSession(){
  const t=today();
  if(!ST.placed){
    const ss=shuffle(FACTS.filter(i=>cls(i)==='ss')).slice(0,3),sb=shuffle(FACTS.filter(i=>cls(i)==='sb')).slice(0,3);
    return shuffle(ss.concat(sb)).map(f=>({mode:'place',f}));
  }
  const due=FACTS.filter(id=>known(id)&&ST.f[id].due<=t).sort((x,y)=>ST.f[x].box-ST.f[y].box||ST.f[x].due-ST.f[y].due);
  const easy=FACTS.filter(id=>!known(id)&&cls(id)!=='bb').slice(0,3);
  const hard=(HARD[ST.hardIdx]||[]).filter(id=>!known(id));
  const newL=easy.length?easy:hard;
  const total={court:8,normal:12,long:16}[opt().len]||12;
  const warm=due.slice(0,3),rest=due.slice(3);
  const seq=warm.map(f=>({mode:'review',f}));
  newL.forEach(f=>seq.push({mode:'new',f}));
  const room=total-seq.length-newL.length;
  rest.slice(0,Math.max(0,room)).forEach(f=>seq.push({mode:'review',f}));
  newL.forEach((f,i)=>{const at=seq.findIndex(s=>s.f===f&&s.mode==='new');seq.splice(Math.min(seq.length,at+3+i),0,{mode:'again',f});});
  const least=Math.min(8,total-2);
  if(seq.length<least){
    const have=new Set(seq.map(s=>s.f));
    const more=FACTS.filter(id=>known(id)&&!have.has(id)).sort((x,y)=>ST.f[x].box-ST.f[y].box||Math.random()-.5);
    more.slice(0,least-seq.length).forEach(f=>seq.push({mode:'review',f}));
  }
  return seq;
}
function grade(id,res,mode){
  const t=today();const e=ST.f[id]||(ST.f[id]={box:0,due:t,ok:0,ko:0});
  if(res.first){e.ok++;
    if(mode==='place')e.box=2;else if(mode==='new')e.box=1;else if(mode==='again')e.box=Math.max(2,Math.min(4,e.box+1));else e.box=Math.min(4,e.box+1);
  }else if(res.revealed){e.ko++;e.box=0;}
  else{e.ko++;e.box=Math.min(e.box,1)||1;}
  if(res.slow&&res.first&&e.box>2)e.box=2;
  e.due=t+INT[e.box];
}

/* ============ voix de Hector : clips intégrés à la page ============ */
const AUDIO=/*@@AUDIO@@*/{};
let AC=null;
/* sur iPhone, le son passe même quand le téléphone est en mode silencieux (iOS 17 et plus) */
try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){}
const getAC=()=>{if(AC)return AC;try{const C=window.AudioContext||window.webkitAudioContext;if(C)AC=new C();}catch(e){}return AC;};
function unlockAudio(){const ac=getAC();if(!ac)return;try{if(ac.state==='suspended')ac.resume();const s=ac.createBufferSource();s.buffer=ac.createBuffer(1,1,22050);s.connect(ac.destination);s.start(0);}catch(e){}}
const bufs={};
function getBuf(k){
  if(bufs[k])return bufs[k];const ac=getAC(),b=AUDIO[k];if(!ac||!b)return Promise.resolve(null);
  return bufs[k]=new Promise(res=>{try{const bin=atob(b),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
    const p=ac.decodeAudioData(u.buffer,x=>res(x),()=>res(null));if(p&&p.catch)p.catch(()=>res(null));}catch(e){res(null);}});
}
let vTok=0,curSrc=null,curRes=null,VMODE='-',lastKey=null,HERO=null,BUB=null,sayN=0;
function stopVoice(){vTok++;if(curSrc){try{curSrc.stop();}catch(e){}curSrc=null;}if(curRes){const r=curRes;curRes=null;r();}try{window.speechSynthesis&&speechSynthesis.cancel();}catch(e){}}
/* une phrase = un clip, ou une suite de clips (« six » + « fois » + « sept ») */
function seqOf(k){
  if(AUDIO[k])return [k];
  let m;const pf=a=>AUDIO['p'+a]?['p'+a]:['n'+a,'fois'];  /* « trois fois » dit d'un seul tenant quand l'enregistrement existe */
  if((m=k.match(/^q_(\d+)_(\d+)$/)))return [...pf(+m[1]),'n'+m[2]];
  if((m=k.match(/^r_(\d+)_(\d+)$/)))return [...pf(+m[1]),'n'+m[2],'eg','n'+(m[1]*m[2])];
  if((m=k.match(/^c_(\d+)_(\d+)$/))){const c=chainOf(+m[1],+m[2]);return seqOf(`r_${c.x}_${c.y}`);}
  if((m=k.match(/^p_(\d+)_(\d+)$/)))return ['n'+m[1],'plus','n'+m[2]];
  if((m=k.match(/^m_(\d+)_(\d+)$/)))return ['n'+m[1],'moins','n'+m[2]];
  if(k==='tech_cut'||k==='tech_ten'||k==='tech_count')return ['nouveau',k+'_r'];
  return null;
}
/* silence entre deux morceaux d'une phrase assemblée, mesuré de la fin de la parole au début de la suivante
   (chaque clip garde son attaque et sa chute naturelles : on ne coupe jamais la fin d'un mot) */
const gapOf=(x,y)=>y==='fois'?0.04:(x==='fois'||/^p\d+$/.test(x))?0.07:0.13;
/* début et fin de la parole dans un clip (le reste est le souffle autour du mot) */
function speechOf(b){
  if(b._sp)return b._sp;const d=b.getChannelData(0),w=Math.max(1,Math.round(b.sampleRate*0.01)),r=[];
  for(let i=0;i+w<=d.length;i+=w){let q=0;for(let j=i;j<i+w;j++)q+=d[j]*d[j];r.push(Math.sqrt(q/w));}
  const th=Math.max(...r)*0.06;let a=r.findIndex(v=>v>th),z=r.length-1;while(z>0&&r[z]<=th)z--;
  return b._sp=[Math.max(0,a)*w/b.sampleRate,Math.min(b.duration,(z+1)*w/b.sampleRate)];
}
async function playKey(k){
  const tok=++vTok,ac=getAC(),seq=seqOf(k);
  if(seq&&ac){
    const bs=await Promise.all(seq.map(getBuf));if(tok!==vTok)return;
    if(bs.every(Boolean)){
      if(ac.state==='suspended'){try{await ac.resume();}catch(e){}}if(tok!==vTok)return;VMODE='voix Hector';
      return new Promise(res=>{let t=ac.currentTime+0.03;const srcs=bs.map((b,i)=>{const s=ac.createBufferSource();s.buffer=b;s.connect(ac.destination);s.start(t);if(i<bs.length-1){const n=bs[i+1];t=Math.max(t+speechOf(b)[1]+gapOf(seq[i],seq[i+1])-speechOf(n)[0],t+0.05);}return s;});
        curSrc={stop(){srcs.forEach(s=>{try{s.stop();}catch(e){}});}};curRes=res;
        let left=srcs.length;srcs.forEach(x=>x.onended=()=>{if(--left)return;if(curRes===res){curRes=null;curSrc=null;}res();});});
    }
  }
  /* jamais de voix robot : si un clip manque, on laisse juste le temps de lire */
  if(Object.keys(AUDIO).length){VMODE='voix Hector (texte seul pour cette phrase)';await new Promise(r=>{curRes=r;setTimeout(r,800+(V[k]||'').length*30);});return;}
  VMODE='voix du navigateur';
  return new Promise(res=>{let d=false;const fin=()=>{if(!d){d=true;if(curRes===fin)curRes=null;res();}};curRes=fin;
    try{const u=new SpeechSynthesisUtterance(V[k]);u.lang='fr-FR';u.rate=.92;u.onend=fin;u.onerror=fin;speechSynthesis.speak(u);}catch(e){fin();}setTimeout(fin,12000);});
}
/* bulle de hauteur fixe : le texte rétrécit s'il est long, pour que rien ne bouge à l'écran */
function setBub(t){if(!BUB)return;BUB.textContent=t||'';BUB.style.fontSize='';
  if(!BUB.isConnected||!BUB.closest('.talkrow'))return;
  BUB.style.height='';let f=parseFloat(getComputedStyle(BUB).fontSize);
  for(let i=0;i<10&&BUB.scrollHeight>BUB.clientHeight+1&&f>15;i++){f-=1;BUB.style.fontSize=f+'px';}
  /* jamais en dessous de 15 px : si la phrase est longue, la bulle grandit, et le dessin se range au-dessus */
  if(BUB.scrollHeight>BUB.clientHeight+1){BUB.style.height='auto';const w=document.querySelector('.screen>.work');if(w&&typeof fit==='function')fit(w);}}
function mood(m){if(!HERO)return;HERO.classList.remove('m-happy','m-think','m-wow','m-oops');HERO.classList.add('m-'+m);if(m==='wow'||m==='happy'){HERO.classList.remove('hop');void HERO.offsetWidth;HERO.classList.add('hop');}}
let RUN=0;class Ab extends Error{}
async function say(k,{sub=true}={}){
  lastKey=k;if(sub)setBub(V[k]);const my=++sayN;if(HERO)HERO.classList.add('talk');stopVoice();
  if(window.__FAST)await sleep(5);else if(ST.voice)await playKey(k);else await sleep(700+V[k].length*28);
  if(my===sayN&&HERO)HERO.classList.remove('talk');
}
/* sons doux (jamais de buzzer) */
function tone(f,t0,d,type='sine',g=.15,f2){const ac=getAC();if(!ac||window.__FAST||!opt().sfx)return;try{const o=ac.createOscillator(),n=ac.createGain(),t=ac.currentTime+t0;o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);n.gain.setValueAtTime(.0001,t);n.gain.linearRampToValueAtTime(g,t+.02);n.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(n);n.connect(ac.destination);o.start(t);o.stop(t+d+.05);}catch(e){}}
const tick=()=>tone(700,0,.08,'triangle',.1);
const chime=()=>[660,880,1175].forEach((f,i)=>tone(f,i*.08,.35,'sine',.14));
const soft=()=>tone(300,0,.25,'sine',.1,240);
const fan=()=>[523,659,784,1047].forEach((f,i)=>tone(f,i*.12,.5,'triangle',.15));

/* ============ vues ============ */
let ROOT=null;
function mount(sc){stopVoice();HERO=null;BUB=null;RUN++;ROOT.querySelectorAll('.screen,.panel').forEach(e=>e.remove());ROOT.append(sc);}
const makeHero=()=>h('div',{class:'hero m-happy','aria-hidden':'true',html:HERO_SVG});
function arrayView(rows,cols,{split=0,ghost=false,anim=false}={}){
  const W=Math.min(innerWidth,540)-80,H=innerHeight<700?120:170;
  const d=Math.max(10,Math.min(26,Math.floor(Math.min(W/cols,H/(rows+(ghost?1:0)))-4)));
  const g=h('div',{class:'arr',style:`grid-template-columns:repeat(${cols},${d}px)`,role:'img','aria-label':`${rows} rangées de ${cols} points`});
  let n=0;
  for(let r=0;r<rows+(ghost?1:0);r++)for(let c=0;c<cols;c++){
    const dt=h('span',{class:'dt '+(ghost&&r===rows?'g':'y'+(split&&r>=split?' b':'')),style:`width:${d}px;height:${d}px`});
    if(anim){dt.classList.add('pop');dt.style.animationDelay=(n++*12)+'ms';}g.append(dt);
  }
  return g;
}
function linesView(ch){
  const w=h('div',{class:'lines'});
  ch.lines.forEach(l=>w.append(h('div',{html:l.replace(/(= )(\d+)$/,'$1<b>$2</b>')})));
  return w;
}
function hintView(a0,b0,anim,disp){
  const ch=chainOf(a0,b0);const box=h('div',{class:'hb'});
  if(disp&&disp[0]!==ch.x&&ch.kind!=='skip')box.append(h('div',{class:'lines'},`${disp[0]} × ${disp[1]} = ${ch.x} × ${ch.y}`));
  if(ch.kind==='ten'){const A=mkBlocks(ch.y,[10]),gr=A.blocks[0].rows[9];gr.classList.add('gh','out');gr.append(h('span',{class:'rl minus'},`− ${ch.y}`));A.blocks[0].lab.textContent=`10 × ${ch.y} = ${10*ch.y}`;box.append(A.el);}
  else if(ch.kind==='five'){const A=mkBlocks(ch.y,[5,ch.r]);A.blocks[1].rows.forEach(r=>r.classList.add('low'));A.el.insertBefore(h('div',{class:'cutl done'},h('i')),A.blocks[1].rowsEl);
    A.blocks[0].lab.textContent=`5 × ${ch.y} = ${5*ch.y}`;A.blocks[1].lab.textContent=`${ch.r} × ${ch.y} = ${ch.r*ch.y}`;box.append(A.el);}
  else{const A=mkBlocks(ch.y,[ch.x]);rowCounts(A.blocks[0].rows,ch.y);box.append(A.el);}
  if(ch.kind!=='skip')box.append(h('div',{class:'lines'},h('div',{html:ch.lines[ch.lines.length-1].replace(/(= )(\d+)$/,'$1<b>$2</b>')})));
  return box;
}

/* ---------- accueil ---------- */
function showHome(){
  /* une mise à jour attendait un moment calme : on l'applique en revenant à l'accueil */
  if(window.__updatePending){location.reload();return;}
  const doneToday=ST.log.some(l=>l.d===today());
  const m=mastered();
  const hero=makeHero();
  const play=h('button',{class:'play fr','aria-label':'Jouer'},icon('play'),'Jouer');
  play.onclick=()=>{unlockAudio();tick();start();};
  const grid=h('button',{class:'pill',onclick:()=>{tick();showGrid();}},'Ma grille'),tech=h('button',{class:'pill',onclick:()=>{tick();showTech();}},'Les techniques');
  const gear=h('button',{class:'gear','aria-label':'Parents'},icon('gear'));hold(gear);
  const cat=/\/apps\//.test(location.pathname)?h('a',{class:'ib catbtn',href:'../../','aria-label':'Mes applis'},icon('grid')):null;
  const sc=h('div',{class:'screen home'},cat,hero,h('h1',{},'Les tables',h('br'),'d’Eden'),play,
    h('div',{class:'sub'},doneToday?'Bien joué Eden, séance du jour faite ✓':(m?`Prêt, Eden ? ${m} calculs sus sur 36`:'Prêt, Eden ? Avec Hector')),
    h('div',{class:'row2'},tech,grid),
    window.EdenInstall&&EdenInstall.need?h('button',{class:'instl',onclick:()=>EdenInstall.show()},'Mettre Hector sur l’écran d’accueil'):null,gear);
  mount(sc);
}
/* espace parents : réservé aux adultes, sans code à retenir. Un appui court affiche le geste,
   un appui de 1,5 s remplit l'anneau autour de la roue et ouvre l'espace. */
function hold(btn){
  let t=null,tip=null,opened=0;const stop=()=>{clearTimeout(t);btn.classList.remove('holding');};
  btn.addEventListener('contextmenu',e=>e.preventDefault());
  btn.addEventListener('pointerdown',e=>{e.preventDefault();stop();btn.classList.add('holding');t=setTimeout(()=>{stop();if(tip)tip.remove();opened=Date.now();openPanel();},1500);});
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>btn.addEventListener(ev,stop));
  btn.addEventListener('click',()=>{if(Date.now()-opened<800||(tip&&tip.isConnected))return;tip=h('div',{class:'geartip',role:'status'},'Espace parents : gardez le doigt appuyé sur la roue.');
    btn.parentElement.append(tip);setTimeout(()=>tip&&tip.remove(),3200);});
}

/* ---------- grille (table de Pythagore de ce que l'enfant sait) ---------- */
/* ---------- ma grille : Hector l'explique, chaque case se touche ---------- */
const lvl=id=>{const e=known(id);return !e?0:e.box>=3?3:e.box>=2?2:1;};
function showGrid(){
  const g=h('div',{class:'grid',role:'grid','aria-label':'Ma grille de multiplication'}),cells={},heads={r:{},c:{}};
  g.append(h('div',{class:'gc h x'},'×'));for(let b=2;b<=9;b++)g.append(heads.c[b]=h('div',{class:'gc h'},b));
  const hero=makeHero(),bub=h('div',{class:'bubble'}),me=RUN+1;
  let busy=0;
  const pick=async(a,b)=>{
    tick();const id=Math.min(a,b)+'-'+Math.max(a,b),L=lvl(id),my=++busy;
    g.querySelectorAll('.on,.tw,.sel').forEach(e=>e.classList.remove('on','tw','sel'));
    heads.r[a].classList.add('on');heads.c[b].classList.add('on');cells[a+'-'+b].classList.add('sel');if(a!==b)cells[b+'-'+a].classList.add('tw');
    if(L===3){mood('happy');setBub(`${a} × ${b} = ${a*b}`);await say(`r_${a}_${b}`,{sub:false});return;}
    setBub(`${a} × ${b}`);mood('think');
    await say(`q_${a}_${b}`,{sub:false});if(my!==busy||me!==RUN)return;
    await say(L===2?'g_almost':L===1?'g_learn':'g_new');
  };
  for(let a=2;a<=9;a++){g.append(heads.r[a]=h('div',{class:'gc h'},a));
    for(let b=2;b<=9;b++){const L=lvl(Math.min(a,b)+'-'+Math.max(a,b));
      g.append(cells[a+'-'+b]=h('button',{class:'gc'+(L?' l'+L:''),'aria-label':`${a} fois ${b}`,onclick:()=>pick(a,b)},L===3?String(a*b):''));}}
  const explain=async()=>{const my=++busy;try{for(const k of ['g_intro','g_colors','g_same','g_tap']){
      if(k==='g_same'){g.querySelectorAll('.on,.tw,.sel').forEach(e=>e.classList.remove('on','tw','sel'));cells['3-7'].classList.add('sel');cells['7-3'].classList.add('tw');}
      await say(k);if(my!==busy||me!==RUN)return;}
    g.querySelectorAll('.tw,.sel').forEach(e=>e.classList.remove('tw','sel'));ST.gridSeen=1;save();}catch(e){}};
  const back=h('button',{class:'ib','aria-label':'Maison',onclick:()=>{tick();showHome();}},icon('home'));
  const ear=h('button',{class:'ib','aria-label':'Réexpliquer la grille',onclick:()=>{tick();explain();}},icon('ear'));
  const sw=(c,t)=>h('span',{},h('i',{class:'gc '+c}),t);
  const sc=h('div',{class:'screen gridscr'},h('div',{class:'bar'},back,h('div',{class:'fr',style:'font-size:28px;color:var(--bic);flex:1;text-align:center'},'Ma grille'),ear),
    h('div',{class:'work'},g,
      h('div',{class:'legend'},sw('l3','je le sais'),sw('l2','presque'),sw('l1','j’apprends'),sw('','à découvrir')),
      h('div',{class:'sub',style:'text-align:center'},h('b',{},String(mastered())),' calculs sus sur 36')),
    h('div',{class:'talkrow'},hero,bub));
  mount(sc);HERO=hero;BUB=bub;
  if(!ST.gridSeen)explain();else{setBub(V.g_tap);}
}

/* ---------- clavier ---------- */
let KEYS=null;
function keypad(onGo){
  const st={val:'',go:onGo,lock:false};
  const wrap=h('div',{class:'keys'});
  const press=d=>{if(st.lock)return;if(st.val.length>=2)return;st.val+=d;tick();st.upd();};
  [7,8,9,4,5,6,1,2,3].forEach(d=>wrap.append(h('button',{class:'key','aria-label':String(d),onclick:()=>press(String(d))},String(d))));
  wrap.append(h('button',{class:'key del','aria-label':'Effacer',onclick:()=>{if(st.lock)return;st.val=st.val.slice(0,-1);st.upd();}},icon('del')));
  wrap.append(h('button',{class:'key','aria-label':'0',onclick:()=>press('0')},'0'));
  const go=h('button',{class:'key go','aria-label':'Valider',onclick:()=>{if(!st.lock&&st.val)st.go(st.val);}},icon('check'));wrap.append(go);
  st.el=wrap;st.goBtn=go;st.upd=()=>{};
  /* le clavier se montre ou se cache ; l'écran le sait (la bulle se fait plus basse) */
  st.show=on=>{wrap.style.display=on?'':'none';const sc=wrap.parentElement;if(sc&&sc.classList.contains('kb')!==!!on){sc.classList.toggle('kb',!!on);if(BUB&&BUB.textContent)setBub(BUB.textContent);}};
  return st;
}
document.addEventListener('keydown',e=>{if(!KEYS||KEYS.lock)return;if(/^[0-9]$/.test(e.key)){if(KEYS.val.length<2){KEYS.val+=e.key;KEYS.upd();}}else if(e.key==='Backspace'){KEYS.val=KEYS.val.slice(0,-1);KEYS.upd();}else if(e.key==='Enter'&&KEYS.val)KEYS.go(KEYS.val);});

/* ---------- séance ---------- */
const nextBtn=(label='Suivant')=>new Promise(res=>{const b=h('button',{class:'big','aria-label':label},label,icon('next'));b.onclick=()=>{tick();b.remove();res();};DOCK.append(b);});
let DOCK=null;
async function start(){
  RUN++;const me=RUN;
  try{
    if(!ST.intro){if(!ST.chap)await say0('hello');await prologue();}
    const placing=!ST.placed;
    await session(me);
  }catch(e){if(!(e instanceof Ab))console.error(e);}
}
async function say0(k){
  /* petit écran de parole sans pause : Hector dit une phrase */
  const hero=makeHero(),bub=h('div',{class:'bubble'});HERO=hero;BUB=bub;
  mount(h('div',{class:'screen home'},hero,bub));HERO=hero;BUB=bub;
  await say(k);
}
function chk(me){if(me!==RUN)throw new Ab();}
async function start2(me){RUN++;try{await session(RUN);}catch(e){if(!(e instanceof Ab))console.error(e);}}
async function endScreen(me,asked,ok,newly){
  const hero=makeHero();hero.classList.add('m-wow');
  const chips=newly.length?h('div',{class:'chips'},newly.map(id=>{const [a,b]=ab(id);return h('span',{class:'chip n'},`${a} × ${b}`);})):null;
  const bub=h('div',{class:'bubble',style:'max-width:90%'});
  const sc=h('div',{class:'screen end'},hero,h('h2',{},'Bravo Eden !'),
    h('div',{class:'sub'},`${ok} calculs trouvés du premier coup sur ${asked}`),
    newly.length?h('div',{class:'sub'},'Nouveaux calculs :'):null,chips,
    h('div',{class:'row2'},h('button',{class:'big',onclick:()=>{tick();showHome();}},icon('home'),'Terminer'),h('button',{class:'pill',onclick:()=>{tick();showGrid();}},'Ma grille')),bub);
  mount(sc);HERO=hero;BUB=bub;fan();
  await say('end1');await say('end2');
}

function boot(){
  const old=document.getElementById('nojs');if(old)old.remove();
  let app=document.getElementById('app');if(!app){app=h('div',{id:'app'});document.body.append(app);}
  app.replaceChildren();ROOT=app;
  if(!document.querySelector('.turnmsg')){const t=h('div',{class:'turnmsg',role:'alert'});
    t.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 1h8a3 3 0 013 3v16a3 3 0 01-3 3H8a3 3 0 01-3-3V4a3 3 0 013-3zm0 2a1 1 0 00-1 1v16a1 1 0 001 1h8a1 1 0 001-1V4a1 1 0 00-1-1zm2 15h4v1.6h-4z"/></svg><div>Tourne ton téléphone<br>pour jouer avec Hector</div>';
    document.body.append(t);}
  sizeClass();showHome();
}
/* la mise en page suit la hauteur réellement disponible (barres du navigateur comprises) :
   mesurée sur l'appli elle-même, pas sur les unités de l'écran, qui varient selon les navigateurs */
function sizeClass(){
  if(!ROOT)return;const H=ROOT.clientHeight||innerHeight,W=ROOT.clientWidth||innerWidth,de=document.documentElement;
  const was=de.classList.contains('short');de.classList.toggle('short',H<700);
  de.classList.toggle('tiny',H<600);
  de.classList.toggle('turn',W>H&&H<500);
  if(was!==de.classList.contains('short')){const b=BUB&&BUB.textContent;if(b)setBub(b);}
  const w=document.querySelector('.screen>.work');if(w&&typeof fit==='function')fit(w);
}
addEventListener('resize',sizeClass);addEventListener('orientationchange',()=>setTimeout(sizeClass,250));
if(window.visualViewport)visualViewport.addEventListener('resize',sizeClass);

/* mise à jour : on ne recharge pas en pleine séance, seulement depuis l'accueil */
window.__safeToReload=()=>!!document.querySelector('.screen.home .play');
