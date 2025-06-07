const CACHE_NAME = 'casas-ayampe-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/main.js',
    '/images/logo.webp',
    '/images/hero-bg.webp',
    '/images/casa1.webp',
    '/images/casa2.webp',
    '/images/mapa-aereo-sandpiper.webp',
    'https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;500;600;700&family=Roboto+Slab:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.6.0/remixicon.min.css',
    'https://unpkg.com/swiper@8/swiper-bundle.min.css',
    'https://unpkg.com/swiper@8/swiper-bundle.min.js'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache abierto');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eliminando cache antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Estrategia Cache First, luego Network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        // No cacheamos peticiones POST ni a otros dominios
                        if (!response || response.status !== 200 || response.type !== 'basic' || event.request.method !== 'GET') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Si falla la red y es una imagen, devolvemos una imagen de fallback
                        if (event.request.destination === 'image') {
                            return caches.match('/images/fallback.webp');
                        }
                        // Si es una página, devolvemos la página offline
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }
                    });
            })
    );
}); 