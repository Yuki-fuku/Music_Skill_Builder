// キャッシュ名はバージョン管理すると更新が楽
const CACHE_NAME = 'iiv-v7-trainer-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
  // もし外部音源/画像/CSS/JSが別ファイルならここに追加
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => (k === CACHE_NAME) ? null : caches.delete(k))
    ))
  );
  self.clients.claim();
});

// 基本は cache-first。index.html は network-first にしたい場合は分岐を追加してもOK
self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then(cached => {
      return cached || fetch(req).then(res => {
        // 同一オリジンだけキャッシュ更新（任意）
        if (new URL(req.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html')); // オフラインフォールバック
    })
  );
});
