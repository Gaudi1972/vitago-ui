const CACHE_NAME = 'vitago-cache-v' + new Date().getTime();
const urlsToCache = ['/'];

// 📌 Instalar y cachear los archivos iniciales
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando nueva versión...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => {
        self.skipWaiting(); // 🔹 Forzar que el SW nuevo esté listo inmediatamente
      })
  );
});

// 📌 Activar y limpiar cachés viejos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activado, limpiando cachés antiguos...');
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name.startsWith('vitago-cache-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => {
      return self.clients.claim(); // 🔹 Tomar control inmediato de las pestañas
    }).then(() => {
      // 🔹 Avisar a todas las pestañas que hay nueva versión
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) =>
          client.postMessage({ type: 'NEW_VERSION_READY' })
        );
      });
    })
  );
});

// 📌 Estrategia de red con fallback a caché
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 🔹 Guardar en caché en segundo plano
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// 📌 Forzar activación cuando el cliente lo pida
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Forzando activación inmediata...');
    self.skipWaiting();
  }
});
