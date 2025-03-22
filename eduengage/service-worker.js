const CACHE_NAME = 'eduengage-cache-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/lessons.html',
    '/lesson-detail.html',
    '/dashboard.html',
    '/forum.html',
    '/profile.html',
    '/assets/css/styles.css',
    '/assets/js/app.js',
    'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js'
];

// Dynamically cache lesson-detail pages
const dynamicCache = [];
for (let i = 1; i <= 100; i++) {
    dynamicCache.push(`/lesson-detail.html?id=${i}`);
}

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching files');
                return cache.addAll([...urlsToCache, ...dynamicCache]);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) return response;
                return fetch(event.request).catch(() => {
                    // Offline fallback for HTML pages
                    if (event.request.url.includes('.html')) {
                        return caches.match('/lessons.html');
                    }
                });
            })
    );
});