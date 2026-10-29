// Gravewake offline cache: game files are saved on first launch so it also runs without internet.
const CACHE='gravewake-v2';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url),local=url.origin===location.origin;
  // the game page: try the network first so updates arrive, fall back to the cached copy offline
  if(local&&(req.mode==='navigate'||url.pathname.endsWith('index.html'))){
    e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(CACHE).then(k=>k.put('./index.html',c));return r}).catch(()=>caches.match('./index.html')));return}
  // everything else (three.js, fonts, icons): cache first
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque')){const c=r.clone();caches.open(CACHE).then(k=>k.put(req,c))}return r})));
});
