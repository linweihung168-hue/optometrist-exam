const CACHE = 'optometrist-exam-v1';
const ASSETS = [
  '/optometrist-exam/',
  '/optometrist-exam/index.html',
  '/optometrist-exam/manifest.json',
  '/optometrist-exam/icon-192.png',
  '/optometrist-exam/icon-512.png',
];

// 安裝：快取基本檔案
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// 啟動：清除舊快取
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 攔截請求：Google Sheets CSV 永遠從網路取，其餘優先用快取
self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Google Sheets / Drive 圖片：永遠從網路
  if (url.includes('docs.google.com') || url.includes('googleusercontent.com') || url.includes('lh3.google')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
    return;
  }
  // 其他：快取優先
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
