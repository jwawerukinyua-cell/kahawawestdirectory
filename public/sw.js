const CACHE_NAME = 'kwest-cache-v4';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon-maskable-192x192.png',
  '/icon-maskable-512x512.png',
  '/kwest-logo.png',
  '/kwest-logo.webp',
  '/kwest-icon.png',
  '/kwest-icon.webp',
  '/hero.webp',
  '/hero.jpg',
  '/hero-opt.jpg',
  '/kahawa-pride.jpg',
  '/kahawa-pride-fc.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache warning for some assets:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // For API or dynamic backend calls, bypass service worker
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached asset immediately if available
      if (cachedResponse) {
        // Refresh cache in background for local origin requests
        if (url.origin === self.location.origin) {
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, networkResponse.clone());
                });
              }
            })
            .catch(() => {});
        }
        return cachedResponse;
      }

      // If not in cache, fetch over network
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // Cache valid local assets
          if (url.origin === self.location.origin) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return networkResponse;
        })
        .catch(() => {
          // If offline and requesting an HTML page/navigation, serve offline.html fallback
          if (
            event.request.mode === 'navigate' ||
            (event.request.headers.get('accept') &&
              event.request.headers.get('accept').includes('text/html'))
          ) {
            return caches.match('/offline.html').then((offlineFallback) => {
              return offlineFallback || caches.match('/index.html');
            });
          }
          // Return empty response rather than undefined to prevent browser fetch exceptions
          return new Response('', { status: 408, statusText: 'Network Timeout' });
        });
    })
  );
});

// Service Worker Notification Handling for KWEST PWA
self.addEventListener('push', (event) => {
  let data = {
    title: 'Kahawa West Community Notice',
    body: 'New update posted on KWEST Directory.',
    icon: '/kwest-icon.png',
    badge: '/kwest-icon.png',
    data: { url: '/' },
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/kwest-icon.png',
    badge: data.badge || '/kwest-icon.png',
    vibrate: [200, 100, 200],
    data: data.data || { url: '/' },
    actions: [
      { action: 'open', title: 'View Update' },
      { action: 'close', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle Notification Click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it
      for (let client of windowClients) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Listen for messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, {
      icon: '/kwest-icon.png',
      badge: '/kwest-icon.png',
      vibrate: [150, 50, 150],
      ...options,
    });
  }
});

