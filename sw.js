// ============================================
// Service Worker - Bidiya Training Hub PWA
// ============================================

const CACHE_NAME = 'bth-cache-v3.0';
const ASSETS = [
  '/',
  './index.html',
  './dashboard.html',
  './workshops.html',
  './register.html',
  './reports.html',
  './employee.html',
  './about.html',
  '/manifest.json',
  '/sw.js',
  '/assets/css/style.css',
  '/assets/css/dark-mode.css',
  '/assets/js/main.js',
  '/assets/js/i18n.js',
  '/assets/js/dashboard.js',
  '/assets/js/workshops.js',
  '/assets/js/register.js',
  '/assets/js/reports.js',
  '/assets/js/employee.js',
  '/assets/lang/ar.json',
  '/assets/lang/en.json',
  '/assets/img/logo.png',
  '/assets/icons/icon-72x72.png',
  '/assets/icons/icon-96x96.png',
  '/assets/icons/icon-128x128.png',
  '/assets/icons/icon-144x144.png',
  '/assets/icons/icon-152x152.png',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-384x384.png',
  '/assets/icons/icon-512x512.png',
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
              return caches.match('/offline.html');
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
    icon: 'assets/icons/icon-192x192.png',
    badge: 'assets/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
