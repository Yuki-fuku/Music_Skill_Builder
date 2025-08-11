// バージョンを上げると確実に更新反映（v1 → v2 ...）
const CACHE_NAME = '{{APP_SLUG}}-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>k===CACHE_NAME?null:caches.delete(k))))
  );
  self.clients.claim();
});

// cache-first（同一オリジンはキャッシュに保存）
self.addEventListener('fetch', e=>{
  const req = e.request;
  e.respondWith(
    caches.match(req).then(cached=>{
      return cached || fetch(req).then(res=>{
        if (new URL(req.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c=>c.put(req, copy));
        }
        return res;
      }).catch(()=>caches.match('./index.html'));
    })
  );
});
