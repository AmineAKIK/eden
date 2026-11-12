/* Mises à jour automatiques (inséré dans chaque page par scripts/build.py).
   - Vérifie s'il existe une nouvelle version à l'ouverture, au retour sur l'appli,
     et toutes les 30 minutes.
   - Quand la nouvelle version est prête, la page se recharge d'elle-même.
     Une appli peut demander d'attendre un moment calme : si elle définit
     window.__safeToReload() et que la fonction renvoie false (en pleine séance),
     le rechargement est remis au prochain retour à l'accueil (window.__updatePending).
   - La progression (localStorage) n'est jamais effacée. */
(function(){
  if(!('serviceWorker' in navigator))return;
  var ROOT='@@ROOT@@';
  var hadController=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.register(ROOT+'sw.js',{scope:ROOT,updateViaCache:'none'}).then(function(reg){
    var check=function(){reg.update().catch(function(){});};
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')check();});
    setInterval(check,30*60*1000);
  }).catch(function(){});
  navigator.serviceWorker.addEventListener('controllerchange',function(){
    if(!hadController){hadController=true;return;}   /* toute première installation : rien à recharger */
    if(window.__safeToReload&&!window.__safeToReload()){window.__updatePending=true;return;}
    location.reload();
  });
})();
