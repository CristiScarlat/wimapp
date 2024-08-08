const CACHE_NAME = 'wimapp-cache';
self.addEventListener('install', e => {
  console.log('installing service worker!!');
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        'static/js/bundle.js'
      ])
        .then(() => self.skipWaiting());
    })
  );
});