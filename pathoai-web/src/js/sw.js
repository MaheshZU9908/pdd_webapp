self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
});

self.addEventListener('fetch', (event) => {
    // Basic network-first strategy, fallback to cache not implemented for simplicity
    event.respondWith(fetch(event.request));
});
