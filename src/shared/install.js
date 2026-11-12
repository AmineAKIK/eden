/* Aide à l'installation (insérée dans chaque page par scripts/build.py).
   Sur iPhone et iPad, aucun site ne peut proposer « Installer » : il faut passer par le
   bouton Partager du navigateur. Ce script explique le geste, une fois, clairement.
   window.EdenInstall.need  : vrai sur iPhone/iPad quand la page n'est pas déjà ouverte depuis l'icône
   window.EdenInstall.show() : ouvre la feuille d'explication */
(function(){
  var ua=navigator.userAgent||'';
  var ios=/iP(hone|od|ad)/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  var standalone=navigator.standalone===true||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches);
  var chrome=/CriOS/.test(ua);
  var SHARE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l4.2 4.2-1.4 1.4L13 5.8V15h-2V5.8L9.2 7.6 7.8 6.2zM5 10h3v2H6v8h12v-8h-2v-2h3a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V11a1 1 0 011-1z"/></svg>';
  var PLUS='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm0 2v14h14V5zm6 3h2v3h3v2h-3v3h-2v-3H8v-2h3z"/></svg>';
  var CSS='.ins-bg{position:fixed;inset:0;z-index:200;background:rgba(10,16,50,.55);display:flex;align-items:flex-end;justify-content:center;animation:insf .2s ease both}'+
    '.ins{width:100%;max-width:520px;background:#fff;color:#141A38;border-radius:24px 24px 0 0;padding:22px 22px calc(22px + env(safe-area-inset-bottom));font:17px/1.4 Hanken,system-ui,sans-serif;animation:insu .25s ease both;max-height:92%;overflow-y:auto}'+
    '.ins h2{font:400 26px/1.15 Fredoka,sans-serif;color:#2640C9;margin:0 0 6px}.ins p{margin:6px 0}'+
    '.ins ol{list-style:none;margin:14px 0;padding:0;display:grid;gap:10px}'+
    '.ins li{display:flex;gap:12px;align-items:center;padding:10px 12px;border-radius:16px;background:#F1F4FF}'+
    '.ins li b{flex:none;width:30px;height:30px;border-radius:50%;background:#2640C9;color:#fff;display:flex;align-items:center;justify-content:center;font:400 18px Fredoka,sans-serif}'+
    '.ins li svg{width:24px;height:24px;fill:#2640C9;vertical-align:-6px;margin:0 2px}'+
    '.ins .note{font-size:15px;color:#4A5280}'+
    '.ins button{display:block;width:100%;margin-top:14px;padding:15px;border:0;border-radius:16px;background:#2640C9;color:#fff;font:600 18px Hanken,system-ui,sans-serif}.ins button:focus:not(:focus-visible){outline:none}'+
    '@keyframes insf{from{opacity:0}}@keyframes insu{from{transform:translateY(40px)}}'+
    '@media (prefers-reduced-motion:reduce){.ins-bg,.ins{animation:none}}';
  function show(){
    if(!document.getElementById('ins-css')){var s=document.createElement('style');s.id='ins-css';s.textContent=CSS;document.head.appendChild(s);}
    var bg=document.createElement('div');bg.className='ins-bg';
    var where=chrome?'en haut à droite, dans la barre d’adresse':'dans la barre du navigateur';
    bg.innerHTML='<div class="ins" role="dialog" aria-modal="true" aria-labelledby="ins-t">'+
      '<h2 id="ins-t">Mettre Hector sur l’écran d’accueil</h2>'+
      '<p>Hector s’ouvrira en plein écran, comme une vraie appli, et marchera même sans internet.</p>'+
      '<ol><li><b>1</b><span>Touchez le bouton Partager '+SHARE+' '+where+'.</span></li>'+
      '<li><b>2</b><span>Choisissez « Sur l’écran d’accueil » '+PLUS+'. S’il n’apparaît pas, faites défiler la liste ou touchez « Plus ».</span></li>'+
      '<li><b>3</b><span>Touchez « Ajouter ». L’icône apparaît sur l’écran d’accueil.</span></li></ol>'+
      '<p class="note">Ensuite, ouvrez toujours Hector depuis cette icône : sur iPhone, l’icône garde sa propre progression, séparée de celle du navigateur. Si Eden a déjà joué ici, copiez d’abord le code de sauvegarde (Espace parents, appui long sur la roue en bas à droite) et collez-le dans l’icône.</p>'+
      '<button type="button">J’ai compris</button></div>';
    var close=function(){bg.remove();};
    bg.addEventListener('click',function(e){if(e.target===bg)close();});
    bg.querySelector('button').addEventListener('click',close);
    document.body.appendChild(bg);bg.querySelector('button').focus();
  }
  window.EdenInstall={ios:ios,standalone:standalone,need:ios&&!standalone,show:show};
})();
