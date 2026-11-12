/* Service worker : copie locale de tout le site, pour jouer hors ligne.
   c817a49c2112 et ["./", "apps/tables/icons/tables-180.png", "apps/tables/icons/tables-192.png", "apps/tables/icons/tables-512.png", "apps/tables/icons/tables-64.png", "apps/tables/icons/tables-mask-192.png", "apps/tables/icons/tables-mask-512.png", "apps/tables/", "icons/eden-180.png", "icons/eden-192.png", "icons/eden-512.png", "icons/eden-64.png", "icons/eden-mask-192.png", "icons/eden-mask-512.png", "index.html", "manifest.webmanifest"] sont remplis par scripts/build.py. */
const CACHE='eden-c817a49c2112';
const FILES=["./", "apps/tables/icons/tables-180.png", "apps/tables/icons/tables-192.png", "apps/tables/icons/tables-512.png", "apps/tables/icons/tables-64.png", "apps/tables/icons/tables-mask-192.png", "apps/tables/icons/tables-mask-512.png", "apps/tables/", "icons/eden-180.png", "icons/eden-192.png", "icons/eden-512.png", "icons/eden-64.png", "icons/eden-mask-192.png", "icons/eden-mask-512.png", "index.html", "manifest.webmanifest"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('eden-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  /* pages : réseau d'abord (pour recevoir les mises à jour), sinon la copie locale */
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c));return res;}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./'))));return;}
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c));return res;})));
});
