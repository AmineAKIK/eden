/* ============ outils ============ */
const sleep=ms=>new Promise(r=>setTimeout(r,window.__FAST?6:ms));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const pick=a=>a[Math.floor(Math.random()*a.length)];
function h(tag,at={},...kids){const e=document.createElement(tag);for(const k in at){const v=at[k];if(v==null)continue;if(k==='class')e.className=v;else if(k==='style')e.style.cssText=v;else if(k==='html')e.innerHTML=v;else if(k.startsWith('on'))e[k]=v;else e.setAttribute(k,v);}
  kids.flat().forEach(c=>{if(c==null||c===false)return;e.append(c.nodeType?c:document.createTextNode(c));});return e;}
const SVGNS='http://www.w3.org/2000/svg';
function sv(tag,at={},...kids){const e=document.createElementNS(SVGNS,tag);for(const k in at){const v=at[k];if(v==null)continue;if(k==='class')e.setAttribute('class',v);else if(k.startsWith('on'))e[k]=v;else e.setAttribute(k,v);}
  kids.flat().forEach(c=>{if(c==null||c===false)return;e.append(c.nodeType?c:document.createTextNode(c));});return e;}
const IC={
 play:'<svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg>',
 home:'<svg viewBox="0 0 24 24"><path d="M12 3 2 12h3v8h5v-5h4v5h5v-8h3z"/></svg>',
 ear:'<svg viewBox="0 0 24 24"><path d="M3 10v4h4l5 4V6L7 10zm13.5 2a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',
 grid:'<svg viewBox="0 0 24 24"><path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"/></svg>',
 gear:'<svg viewBox="0 0 24 24"><path d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3h-4l-.4 2.9a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1c.5.4 1.1.7 1.7 1L11 21h4l.4-2.9c.6-.3 1.2-.6 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>',
 next:'<svg viewBox="0 0 24 24"><path d="M5 11h11.2l-4.9-4.9L12.7 4.7 20 12l-7.3 7.3-1.4-1.4 4.9-4.9H5z"/></svg>'
};
const icon=n=>{const d=document.createElement('span');d.innerHTML=IC[n];return d.firstChild;};

/* ============ ce que Milo sait (répétition espacée) ============ */
/* identifiants : c7 (combien ?), a3+2 (j'en ajoute), s5-2 (j'en enlève), m7-4 (coffre mystère : 7 en tout, 4 dehors) */
const KEY='eden:calculs';
let ST={voice:true,intro:false,placed:false,t:{},f:{},log:[],gold:0};
try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x)Object.assign(ST,x);}catch(e){}
ST.t=ST.t||{};ST.f=ST.f||{};ST.log=ST.log||[];ST.gold=ST.gold||0;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(ST));}catch(e){}};
const today=()=>{const d=new Date();return Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/86400000);};
function parse(id){const k=id[0];
  if(k==='c')return {k,x:+id.slice(1),y:0,ans:+id.slice(1)};
  const m=id.slice(1).match(/^(\d+)[+-](\d+)$/),x=+m[1],y=+m[2];
  return {k,x,y,ans:k==='a'?x+y:x-y};}
/* l'ordre d'apprentissage : un de plus, un de moins, ajouter 2, enlever 2, les doubles,
   ajouter 3 à 5, enlever 3 à 5, le coffre mystère jusqu'à 5 puis jusqu'à 10 */
const STAGES=[
  {id:'add1',name:'Ajouter 1',ids:[3,5,2,4,6,8,7,9,1].map(a=>`a${a}+1`)},
  {id:'sub1',name:'Enlever 1',ids:[4,6,3,5,2,8,7,10,9].map(a=>`s${a}-1`)},
  {id:'add2',name:'Ajouter 2',ids:[3,5,4,6,8,7,2].map(a=>`a${a}+2`)},
  {id:'sub2',name:'Enlever 2',ids:[5,4,6,3,7,8,10,9,2].map(a=>`s${a}-2`)},
  {id:'dbl',name:'Les doubles',ids:['a3+3','a4+4','a5+5']},
  {id:'add3',name:'Ajouter 3, 4 ou 5',ids:['a4+3','a5+3','a6+3','a7+3','a5+4','a6+4']},
  {id:'sub3',name:'Enlever 3, 4 ou 5',ids:['s5-3','s6-3','s4-3','s7-3','s8-3','s3-3','s10-3','s9-3','s6-4','s5-4','s7-4','s8-4','s4-4','s10-4','s9-4','s6-5','s7-5','s5-5','s8-5','s10-5','s9-5']},
  {id:'mys5',name:'Le coffre mystère jusqu’à 5',ids:['m3-1','m4-2','m5-3','m4-1','m5-1','m4-3','m5-4','m5-2','m3-2','m2-1']},
  {id:'mys10',name:'Le coffre mystère jusqu’à 10',ids:['m6-3','m7-5','m10-5','m8-5','m6-4','m7-4','m9-5','m10-8','m8-6','m10-7','m9-6','m10-6']}
];
const ORDER=STAGES.flatMap(g=>g.ids);
const COUNTS=[3,4,5,6,7,8,9,10].map(n=>'c'+n);
const FACTS=COUNTS.concat(ORDER);
const stageOf=id=>STAGES.find(g=>g.ids.includes(id));
const INT=[0,1,2,4,8];
const known=id=>ST.f[id];
const isMastered=id=>known(id)&&ST.f[id].box>=3;
const mastered=()=>ORDER.filter(isMastered).length;
/* réglages des parents */
const OPT0={len:'normal',slow:10,sfx:true};
const opt=()=>Object.assign({},OPT0,ST.opt||{});
const setOpt=(k,v)=>{ST.opt=Object.assign(opt(),{[k]:v});save();};
function grade(id,res,mode){
  const t=today();const e=ST.f[id]||(ST.f[id]={box:0,due:t,ok:0,ko:0});
  if(res.first){e.ok++;
    if(mode==='place')e.box=2;else if(mode==='new')e.box=1;else if(mode==='again')e.box=Math.max(2,Math.min(4,e.box+1));else e.box=Math.min(4,e.box+1);
  }else if(res.revealed){e.ko++;e.box=0;}
  else{e.ko++;e.box=Math.min(e.box,1)||1;}
  if(res.slow&&res.first&&e.box>2)e.box=2;
  e.due=t+INT[e.box];
}

/* ============ la voix d'Hector : clips intégrés à la page, jamais de voix de synthèse ============ */
const AUDIO=/*@@AUDIO@@*/{};
let AC=null;
/* sur iPhone, le son passe même en mode silencieux (iOS 17 et plus) */
try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){}
const getAC=()=>{if(AC)return AC;try{const C=window.AudioContext||window.webkitAudioContext;if(C)AC=new C();}catch(e){}return AC;};
function unlockAudio(){const ac=getAC();if(!ac)return;try{if(ac.state==='suspended')ac.resume();const b=ac.createBufferSource();b.buffer=ac.createBuffer(1,1,22050);b.connect(ac.destination);b.start(0);}catch(e){}}
const bufs={};
function getBuf(k){
  if(bufs[k])return bufs[k];const ac=getAC(),b=AUDIO[k];if(!ac||!b)return Promise.resolve(null);
  return bufs[k]=new Promise(res=>{try{const bin=atob(b),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
    const p=ac.decodeAudioData(u.buffer,x=>res(x),()=>res(null));if(p&&p.catch)p.catch(()=>res(null));}catch(e){res(null);}});
}
let vTok=0,curSrc=null,curRes=null,VMODE='-',HERO=null,BUB=null,sayN=0;
function stopVoice(){vTok++;if(curSrc){try{curSrc.stop();}catch(e){}curSrc=null;}if(curRes){const r=curRes;curRes=null;r();}}
async function playKey(k){
  const tok=++vTok,ac=getAC(),seq=seqOf(k);
  if(seq&&ac){
    const bs=await Promise.all(seq.map(getBuf));if(tok!==vTok)return;
    if(bs.every(Boolean)){
      if(ac.state==='suspended'){try{await ac.resume();}catch(e){}}if(tok!==vTok)return;VMODE='voix Hector';
      return new Promise(res=>{const b=ac.createBufferSource();b.buffer=bs[0];b.connect(ac.destination);b.start(ac.currentTime+0.03);
        curSrc=b;curRes=res;b.onended=()=>{if(curRes===res){curRes=null;curSrc=null;}res();};});
    }
  }
  /* clip absent (aperçu avant enregistrement) : on laisse le temps de lire, sans voix robot */
  VMODE='texte seul';await new Promise(r=>{curRes=r;setTimeout(r,700+(V[k]||'').length*32);});
}
/* bulle de hauteur fixe ; si la phrase est longue, la bulle grandit plutôt que d'écraser le texte */
function setBub(t){if(!BUB)return;BUB.textContent=t||'';BUB.style.fontSize='';BUB.style.height='';
  if(!BUB.isConnected)return;let f=parseFloat(getComputedStyle(BUB).fontSize);
  for(let i=0;i<8&&BUB.scrollHeight>BUB.clientHeight+1&&f>15;i++){f-=1;BUB.style.fontSize=f+'px';}
  if(BUB.scrollHeight>BUB.clientHeight+1)BUB.style.height='auto';}
function mood(m){if(!HERO)return;HERO.classList.remove('m-happy','m-think','m-wow','m-oops');HERO.classList.add('m-'+m);if(m==='wow'||m==='happy'){HERO.classList.remove('hop');void HERO.offsetWidth;HERO.classList.add('hop');}}
let RUN=0;class Ab extends Error{}
function chk(me){if(me!==RUN)throw new Ab();}
async function say(k,{sub=true}={}){
  if(!(k in V))throw new Error('phrase inconnue : '+k);
  if(sub)setBub(V[k]);const my=++sayN;if(HERO)HERO.classList.add('talk');stopVoice();
  if(window.__FAST)await sleep(5);else if(ST.voice)await playKey(k);else await sleep(700+V[k].length*28);
  if(my===sayN&&HERO)HERO.classList.remove('talk');
}
/* sons doux (jamais de buzzer) */
function tone(f,t0,d,type='sine',g=.15,f2){const ac=getAC();if(!ac||window.__FAST||!opt().sfx)return;try{const o=ac.createOscillator(),n=ac.createGain(),t=ac.currentTime+t0;o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);n.gain.setValueAtTime(.0001,t);n.gain.linearRampToValueAtTime(g,t+.02);n.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(n);n.connect(ac.destination);o.start(t);o.stop(t+d+.05);}catch(e){}}
const tick=()=>tone(700,0,.08,'triangle',.1);
const chime=()=>[660,880,1175].forEach((f,i)=>tone(f,i*.08,.35,'sine',.14));
const clink=()=>[1568,2093].forEach((f,i)=>tone(f,i*.06,.18,'triangle',.08));
const fan=()=>[523,659,784,1047].forEach((f,i)=>tone(f,i*.12,.5,'triangle',.15));

/* ============ écrans ============ */
let ROOT=null;
function mount(sc){stopVoice();HERO=null;BUB=null;RUN++;ROOT.querySelectorAll('.screen,.panel').forEach(e=>e.remove());ROOT.append(sc);}
const makeHero=()=>h('div',{class:'hero m-happy','aria-hidden':'true',html:HERO_SVG});
/* la mise en page suit la hauteur réellement disponible (barres du navigateur comprises),
   mesurée sur l'appli elle-même : ni unités d'écran, ni :has(), qui varient selon les versions d'iOS */
function sizeClass(){
  if(!ROOT)return;const H=ROOT.clientHeight||innerHeight,W=ROOT.clientWidth||innerWidth,de=document.documentElement;
  const was=de.className;de.classList.toggle('short',H<700);de.classList.toggle('tiny',H<600);de.classList.toggle('turn',W>H&&H<500);
  if(was!==de.className&&BUB&&BUB.textContent)setBub(BUB.textContent);
}
addEventListener('resize',sizeClass);addEventListener('orientationchange',()=>setTimeout(sizeClass,250));
if(window.visualViewport)visualViewport.addEventListener('resize',sizeClass);
/* espace parents : un appui court explique le geste, un appui de 1,5 s remplit l'anneau et ouvre */
function hold(btn){
  let t=null,tip=null,opened=0;const stop=()=>{clearTimeout(t);btn.classList.remove('holding');};
  btn.addEventListener('contextmenu',e=>e.preventDefault());
  btn.addEventListener('pointerdown',e=>{e.preventDefault();stop();btn.classList.add('holding');t=setTimeout(()=>{stop();if(tip)tip.remove();opened=Date.now();openPanel();},1500);});
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>btn.addEventListener(ev,stop));
  btn.addEventListener('click',()=>{if(Date.now()-opened<800||(tip&&tip.isConnected))return;tip=h('div',{class:'geartip',role:'status'},'Espace parents : gardez le doigt appuyé sur la roue.');
    btn.parentElement.append(tip);setTimeout(()=>tip&&tip.remove(),3200);});
}
/* mise à jour : on ne recharge jamais en pleine partie, seulement depuis l'accueil */
window.__safeToReload=()=>!!document.querySelector('.screen.home .play');
