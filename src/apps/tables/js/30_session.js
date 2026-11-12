
/* ============ séance : chaque erreur devient un moment de compréhension ============ */
function preItems(){
  const out=[];
  for(const k of ['x10','add','sub']){const p=ST.pre[k];if(!p||p.last||p.ko===0)continue;
    const n=2+Math.floor(Math.random()*8);
    if(k==='x10')out.push({mode:'pre',k,expr:`10 × ${n}`,val:10*n,key:`q_10_${n}`});
    if(k==='sub')out.push({mode:'pre',k,expr:`${10*n} − ${n}`,val:9*n,key:`m_${10*n}_${n}`});
    if(k==='add'){const f=pick(FACTS.filter(id=>chainOf(...ab(id)).kind==='five'));const c=chainOf(...ab(f));out.push({mode:'pre',k,expr:`${5*c.y} + ${c.r*c.y}`,val:c.x*c.y,key:`p_${5*c.y}_${c.r*c.y}`});}
  }
  return out.slice(0,2);
}
/* que révèle la réponse fausse ? */
function diag(v,a,b){
  if(v===a+b)return 'diag_add';
  if([(a+1)*b,(a-1)*b,a*(b+1),a*(b-1)].includes(v))return 'diag_row';
  return 'diag_gen';
}
async function session(me0){
  let seq=buildSession();
  const placing=!ST.placed;
  /* une nouvelle technique s'apprend au moment où on en a besoin */
  if(!placing){
    const kinds=new Set(seq.filter(x=>x.mode==='new').map(x=>chainOf(...ab(x.f)).kind));
    if(kinds.has('five')&&!ST.t.cut){const S=scene();await ch3(S);ST.t.cut=1;save();}
    if(kinds.has('ten')&&!ST.t.ten){const S=scene();await ch4(S);ST.t.ten=1;save();}
    const pre=preItems();if(pre.length)seq=pre.concat(seq);
    if(seq.length>=9){const pool=seq.filter(x=>x.mode==='review').map(x=>x.f);const P=pool.length>=3?pool:FACTS.filter(id=>known(id)&&ST.f[id].box>=1);
      if(P.length>=3)seq.splice(Math.min(seq.length,6),0,...shuffle([...new Set(P)]).slice(0,3).map(f=>({mode:'bubble',f})));}
  }
  let nFirst=0,asked=0,bubN=0,preN=0;const newly=[];const missed=new Set();
  const hero=makeHero(),bub=h('div',{class:'bubble'}),work=h('div',{class:'work'}),dock=h('div',{class:'dock'});DOCK=dock;
  const prog=h('div',{class:'prog'});
  const back=h('button',{class:'ib','aria-label':'Pause',onclick:()=>{tick();stopVoice();KEYS=null;showHome();}},icon('home'));
  const ear=h('button',{class:'ib','aria-label':'Réécouter',onclick:()=>{if(lastKey)say(lastKey,{sub:false});}},icon('ear'));
  const bulb=h('button',{class:'ib hintbtn','aria-label':'Astuce'},icon('bulb'));
  const K=keypad();KEYS=K;
  const tag=h('div',{class:'tag'});
  const sc=h('div',{class:'screen'},h('div',{class:'bar'},back,prog,ear,bulb),h('div',{class:'tagrow'},tag),work,h('div',{class:'talkrow'},hero,bub),dock,K.el);
  mount(sc);HERO=hero;BUB=bub;autoFit(work);const me=RUN;
  const S={me,K,work,compact:true};
  const rocket=()=>{const d=document.createElement('span');d.innerHTML='<svg class="rk" viewBox="0 0 24 32"><circle cx="12" cy="16" r="10.5" fill="#F2B01E" stroke="#141A38" stroke-width="2"/><circle cx="12" cy="16" r="6" fill="none" stroke="#C98A12" stroke-width="1.6"/><path d="M12 11l1.5 3.3 3.5.3-2.7 2.3.8 3.4-3.1-1.8-3.1 1.8.8-3.4L7 14.6l3.5-.3z" fill="#D52F3E"/></svg>';return d.firstChild;};
  const drawProg=i=>{prog.replaceChildren();seq.forEach((_,k)=>prog.append(k===i?rocket():h('i',{class:k<i?'d':''})));};
  const TAGS={place:'Test de départ',review:'Souviens-toi',new:'Nouveau calcul',again:'On le refait',bubble:'Les bulles',pre:'Petit rappel'};
  tag.textContent=placing?TAGS.place:'';
  if(placing)await say('place_intro');
  else if(!ST.log.length){await say('st_intro');chk(me);if(seq[0].mode==='review')await say('st_warm');}
  else await sleep(200);
  chk(me);
  let busy=false;
  for(let i=0;i<seq.length;i++){
    const it=seq[i];
    tag.textContent=(it.mode==='review'&&seq[0].mode==='review'&&i<3)?'Échauffement':TAGS[it.mode];
    drawProg(i);work.replaceChildren();dock.replaceChildren();K.show(true);K.val='';K.lock=false;bulb.classList.remove('glow');
    /* petit rappel d'une étape des techniques */
    if(it.mode==='pre'){
      bulb.style.visibility='hidden';
      if(preN++===0){await say('pre_intro');chk(me);}
      const q=h('div',{class:'qz'});work.append(q);
      await askNum(S,q,it.expr,it.val,it.key,{type:it.k});chk(me);
      continue;
    }
    const [a0,b0]=ab(it.f),ch=chainOf(a0,b0);
    let a,b;
    if(it.mode==='new'){a=ch.x;b=ch.y;}else{const sw=Math.random()<.5;a=sw?b0:a0;b=sw?a0:b0;}
    const ans=a*b;
    if(it.mode==='bubble'){
      K.show(false);K.lock=true;bulb.style.visibility='hidden';mood('happy');
      const cand=shuffle([ans+a,ans-a,ans+b,ans-b,ans+10,ans-10,ans+1,ans-1].filter(x=>x>0&&x!==ans));const chs=shuffle([ans,...[...new Set(cand)].slice(0,2)]);
      const field=h('div',{class:'bfield'});const ae=h('span',{class:'ans'},'?');
      work.append(h('div',{class:'eq'},h('span',{},`${a} × ${b} =`),ae),field);
      if(bubN++===0)await say('bub_intro');chk(me);
      say('q_'+a+'_'+b,{sub:false});
      await new Promise(res=>{let miss=0,done=false;const bs=chs.map(v=>{const b2=h('button',{class:'bb','aria-label':String(v)},String(v));
        b2.onclick=()=>{if(done)return;if(v===ans){done=true;b2.classList.add('pop');ae.textContent=String(ans);ae.classList.add('ok');chime();mood('wow');res();}
          else{miss++;soft();b2.classList.add('shake');setTimeout(()=>b2.classList.remove('shake'),450);if(miss>=2)bs.find(x=>x.getAttribute('aria-label')===String(ans)).classList.add('glow');}};
        field.append(b2);return b2;});});
      chk(me);await say(pick(['ok1','ok2','ok3','ok4','ok5','ok6']));chk(me);await sleep(250);
      continue;
    }
    const ansEl=h('span',{class:'ans'},'?');K.upd=()=>{ansEl.textContent=K.val||'?';};
    const eq=h('div',{class:'eq'},h('span',{},`${a} × ${b} =`),ansEl);
    const hintBox=h('div',{class:'hb'});
    work.append(hintBox,eq);
    let helped=false,tries=0,revealed=false,slow=false;
    const kindFor=()=>taught(ch.kind)?ch.kind:'skip';
    const showHint=()=>{if(helped||busy)return;helped=true;hintBox.replaceChildren(hintView(a0,b0,true,[a,b]));bulb.classList.remove('glow');mood('think');fit(work);};
    bulb.onclick=async()=>{if(K.lock||placing||busy)return;tick();showHint();await say('c_'+Math.min(a,b)+'_'+Math.max(a,b),{sub:false});};
    bulb.style.visibility=placing?'hidden':'visible';
    const guided=async(disp,remed)=>{
      busy=true;bulb.style.visibility='hidden';K.show(false);eq.style.display='none';hintBox.replaceChildren();
      await runTechnique(S,a0,b0,hintBox,remed?{kind:kindFor(),disp,cut:'tech_cut_r',ten1:'tech_ten_r',count:'tech_count_r'}:{kind:kindFor(),disp});chk(me);
      busy=false;
    };
    /* nouveau calcul : l'enfant le construit avec la technique */
    if(it.mode==='new'){
      helped=true;mood('happy');
      await guided([a,b]);
      chime();mood('wow');await say('tech_end');chk(me);
      hintBox.replaceChildren(hintView(a0,b0,false,[a,b]));fit(work);
      await say('c_'+a0+'_'+b0,{sub:false});chk(me);
      hintBox.replaceChildren();eq.style.display='';
      await say('new_try');chk(me);
    }
    for(;;){
      K.show(true);eq.style.display='';K.val='';K.lock=false;K.upd=()=>{ansEl.textContent=K.val||'?';};K.upd();KEYS=K;
      bulb.style.visibility=placing?'hidden':'visible';fit(work);
      mood('think');
      if(it.mode==='again'&&tries===0)say('again',{sub:false}).then(()=>{if(RUN===me)say('q_'+a+'_'+b,{sub:false});});
      else say('q_'+a+'_'+b,{sub:false});
      if(!helped&&!placing){clearTimeout(window.__bt);window.__bt=setTimeout(()=>{if(RUN===me&&!K.lock&&!helped)bulb.classList.add('glow');},12000);}
      const t0=Date.now();
      const v=await new Promise(res=>{K.go=v=>{if(K.lock)return;K.lock=true;res(Number(v));};});
      chk(me);
      if(v===ans){ansEl.classList.add('ok');chime();mood('wow');slow=(Date.now()-t0)>opt().slow*1000;break;}
      tries++;ansEl.classList.add('shake');soft();setTimeout(()=>ansEl.classList.remove('shake'),450);
      if(placing||tries>=2){revealed=true;break;}
      /* 1re erreur : on comprend avec les gestes, puis on réessaie */
      helped=true;mood('think');
      await say(diag(v,a,b));chk(me);
      await guided([a,b],true);
      await sleep(700);chk(me);
      hintBox.replaceChildren();ansEl.textContent='?';
      await say('new_try');chk(me);
    }
    KEYS=null;
    if(!revealed){
      setBub('');await say(pick(['ok1','ok2','ok3','ok4','ok5','ok6']));chk(me);await sleep(350);
    }else{
      mood('think');ansEl.textContent=String(ans);ansEl.classList.add('ok');
      if(!placing){hintBox.replaceChildren(hintView(a0,b0,false,[a,b]));K.show(false);fit(work);}
      await say('oops');chk(me);
      await say(`r_${a}_${b}`,{sub:false});chk(me);
      if(!placing)await nextBtn();else await sleep(500);
      chk(me);
    }
    const first=tries===0&&(!helped||it.mode==='new');
    grade(it.f,{first,revealed,slow},it.mode);
    asked++;if(first)nFirst++;
    if(it.mode==='new')newly.push(it.f);
    if(!first&&it.mode!=='place'&&it.mode!=='new'&&!missed.has(it.f)){missed.add(it.f);seq.splice(Math.min(seq.length,i+4),0,{mode:'again',f:it.f});}
    save();
  }
  KEYS=null;
  if(placing){
    ST.placed=true;const t=today();
    if(nFirst>=5)FACTS.filter(id=>cls(id)!=='bb'&&!known(id)).forEach(id=>{ST.f[id]={box:1,due:t+1,ok:0,ko:0,assumed:1};});
    save();
    await say0('place_end');
    await sleep(600);
    showHome();return;
  }
  ST.log.push({d:today(),n:asked,ok:nFirst,m:mastered()});if(ST.log.length>60)ST.log.shift();
  const cur=HARD[ST.hardIdx];if(cur&&cur.every(id=>known(id)&&ST.f[id].box>=2))ST.hardIdx++;
  save();
  await endScreen(me,asked,nFirst,newly);
}
