const CACHE_NAME = 'abu-khamira-cache-v1';
const assetsToCache = [
  'index.html',
  'manifest.json',
  'images/logokh.png'
];

// تثبيت السيرفر وكر والملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
  self.skipWaiting();
});

// تفعيل السيرفر وكر وتطهير الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// استراتيجية جلب البيانات بسرعة فائقة (Cache First with Network Fallback)
self.addEventListener('fetch', (event) => {
  // تخطي طلبات جوجل شيت لضمان جلب الأسعار المحدثة دائماً
  if (event.request.url.includes('docs.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          if (event.request.method === 'GET' && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      }).catch(() => {
        // في حال انقطاع الإنترنت يمكن توفير بديل أو صفحة أوفلاين هنا
      });
    })
  );
});
