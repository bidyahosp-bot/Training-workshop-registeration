// ============================================
// Service Worker - PWA Support
// ============================================

const CACHE_NAME = 'bth-cache-v2';
const urlsToCache = [
'/',
'/index.html',
'/dashboard.html',
'/workshops.html',
'/register.html',
'/reports.html',
'/assets/css/style.css',
'/assets/css/dark-mode.css',
'/assets/js/main.js',
'/assets/js/i18n.js',
'/assets/js/dashboard.js',
'/assets/img/logo.png',
'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&display=swap',
'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', event => {
event.waitUntil(
caches.open(CACHE_NAME)
.then(cache => {
console.log('Opened cache');
return cache.addAll(urlsToCache);
})
);
});

self.addEventListener('fetch', event => {
event.respondWith(
caches.match(event.request)
.then(response => {
if (response) {
return response;
}
return fetch(event.request);
})
);
});

self.addEventListener('activate', event => {
const cacheWhitelist = [CACHE_NAME];
event.waitUntil(
caches.keys().then(cacheNames => {
return Promise.all(
cacheNames.map(cacheName => {
if (cacheWhitelist.indexOf(cacheName) === -1) {
return caches.delete(cacheName);
}
})
);
})
);
});