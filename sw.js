/* Service worker : copie locale de tout le site, pour jouer hors ligne.
   e73c7e16cc4d et ["./", "apps/calculs/icons/calculs-180.png", "apps/calculs/icons/calculs-192.png", "apps/calculs/icons/calculs-512.png", "apps/calculs/icons/calculs-64.png", "apps/calculs/icons/calculs-mask-192.png", "apps/calculs/icons/calculs-mask-512.png", "apps/calculs/", "apps/calculs/manifest.webmanifest", "apps/tables/icons/tables-180.png", "apps/tables/icons/tables-192.png", "apps/tables/icons/tables-512.png", "apps/tables/icons/tables-64.png", "apps/tables/icons/tables-mask-192.png", "apps/tables/icons/tables-mask-512.png", "apps/tables/", "icons/eden-180.png", "icons/eden-192.png", "icons/eden-512.png", "icons/eden-64.png", "icons/eden-mask-192.png", "icons/eden-mask-512.png", "index.html", "manifest.webmanifest", "mentions-legales.html"] sont remplis par scripts/build.py.

   Mises à jour : la version (e73c7e16cc4d) est l'empreinte du site construit. Dès qu'une
   publication change un fichier, ce script change, le navigateur installe la nouvelle
   version, puis la page se recharge (voir src/shared/update.js).
   La progression (localStorage) n'est jamais touchée : seul le cache des fichiers change. */
const CACHE='eden-e73c7e16cc4d';
const FILES=["./", "apps/calculs/icons/calculs-180.png", "apps/calculs/icons/calculs-192.png", "apps/calculs/icons/calculs-512.png", "apps/calculs/icons/calculs-64.png", "apps/calculs/icons/calculs-mask-192.png", "apps/calculs/icons/calculs-mask-512.png", "apps/calculs/", "apps/calculs/manifest.webmanifest", "apps/tables/icons/tables-180.png", "apps/tables/icons/tables-192.png", "apps/tables/icons/tables-512.png", "apps/tables/icons/tables-64.png", "apps/tables/icons/tables-mask-192.png", "apps/tables/icons/tables-mask-512.png", "apps/tables/", "icons/eden-180.png", "icons/eden-192.png", "icons/eden-512.png", "icons/eden-64.png", "icons/eden-mask-192.png", "icons/eden-mask-512.png", "index.html", "manifest.webmanifest", "mentions-legales.html"];

/* installation : on télécharge tout en contournant le cache HTTP du navigateur,
   sinon on risquerait de remettre en cache d'anciens fichiers */
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE)
    .then(c=>c.addAll(FILES.map(u=>new Request(u,{cache:'reload'}))))
    .then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys()
    .then(ks=>Promise.all(ks.filter(k=>k.startsWith('eden-')&&k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  /* pages : réseau d'abord, en revalidant auprès du serveur ; hors ligne, la copie locale */
  if(r.mode==='navigate'){
    e.respondWith(fetch(r.url,{cache:'no-cache',credentials:'same-origin'})
      .then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(r.url,c));}return res;})
      .catch(()=>caches.match(r.url,{ignoreSearch:true}).then(m=>m||caches.match('./'))));
    return;
  }
  /* autres fichiers (icônes, manifeste) : la copie de la version installée */
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c));return res;})));
});
