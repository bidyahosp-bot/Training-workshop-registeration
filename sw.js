// ============================================
// Service Worker - Bidiya Training Hub PWA
// ============================================

const CACHE_NAME = 'bth-cache-v3.0';
const ASSETS = [
  '/Training-workshop-registration/',
  '/Training-workshop-registration/index.html',
  '/Training-workshop-registration/dashboard.html',
  '/Training-workshop-registration/workshops.html',
  '/Training-workshop-registration/register.html',
  '/Training-workshop-registration/reports.html',
  '/Training-workshop-registration/employee.html',
  '/Training-workshop-registration/about.html',
  '/Training-workshop-registration/offline.html',
  '/Training-workshop-registration/manifest.json',
  '/Training-workshop-registration/sw.js',
  '/Training-workshop-registration/assets/css/style.css',
  '/Training-workshop-registration/assets/css/dark-mode.css',
  '/Training-workshop-registration/assets/js/main.js',
  '/Training-workshop-registration/assets/js/i18n.js',
  '/Training-workshop-registration/assets/js/dashboard.js',
  '/Training-workshop-registration/assets/js/workshops.js',
  '/Training-workshop-registration/assets/js/register.js',
  '/Training-workshop-registration/assets/js/reports.js',
  '/Training-workshop-registration/assets/js/employee.js',
  '/Training-workshop-registration/assets/lang/ar.json',
  '/Training-workshop-registration/assets/lang/en.json',
  '/Training-workshop-registration/assets/img/logo.png',
  '/Training-workshop-registration/assets/icons/icon-72x72.png',
  '/Training-workshop-registration/assets/icons/icon-96x96.png',
  '/Training-workshop-registration/assets/icons/icon-128x128.png',
  '/Training-workshop-registration/assets/icons/icon-144x144.png',
  '/Training-workshop-registration/assets/icons/icon-152x152.png',
  '/Training-workshop-registration/assets/icons/icon-192x192.png',
  '/Training-workshop-registration/assets/icons/icon-384x384.png',
  '/Training-workshop-registration/assets/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// ============================================
// تثبيت Service Worker
// ============================================
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('✅ تم فتح الكاش');
        return cache.addAll(ASSETS);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

// ============================================
// تنشيط Service Worker
// ============================================
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ============================================
// التعامل مع الطلبات
// ============================================
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(function(response) {
            // حفظ الموارد الجديدة في الكاش
            if (event.request.url.includes('assets/') || 
                event.request.url.includes('.html') ||
                event.request.url.includes('manifest.json')) {
              var responseClone = response.clone();
              caches.open(CACHE_NAME).then(function(cache) {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch(function() {
            // صفحة الخطأ عند عدم الاتصال
            if (event.request.url.includes('.html')) {
              return caches.match('/Training-workshop-registration/offline.html');
            }
          });
      })
  );
});

// ============================================
// التعامل مع Push Notifications (اختياري)
// ============================================
self.addEventListener('push', function(event) {
  var data = event.data.json();
  var options = {
    body: data.body,
    icon: '/Training-workshop-registration/assets/icons/icon-192x192.png',
    badge: '/Training-workshop-registration/assets/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/Training-workshop-registration/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/Training-workshop-registration/')
  );
});
