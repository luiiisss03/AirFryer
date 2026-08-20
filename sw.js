/* ============================================================
   AirChef · Service Worker
   ------------------------------------------------------------
   Guarda los archivos de la aplicación en caché para que siga
   funcionando sin conexión una vez cargada por primera vez.
   Sube CACHE_VERSION al publicar cambios para forzar la
   actualización en los navegadores que ya la tengan instalada.
   ============================================================ */

const CACHE_VERSION = 'airchef-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './img/logo.svg',
  './js/recipes.js',
  './js/photo-credits.js',
  './js/storage.js',
  './js/supabase-config.js',
  './js/cloud.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  /* Ojo: aquí NO se llama a skipWaiting(). Si la versión nueva tomara el
     control de una página ya cargada, se mezclarían el HTML antiguo y los
     scripts nuevos. Se queda esperando y la aplicación avisa al usuario;
     cuando él acepta, manda SKIP_WAITING y recarga. */
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(ASSETS))
  );
});

/* La página pide relevo cuando el usuario acepta actualizar */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(purgarLoQueNoDebeEstar)
      .then(() => self.clients.claim())
  );
});

/* Las versiones anteriores guardaban también las respuestas de la API de
   Supabase, con los datos del usuario dentro. Se limpian al actualizar. */
async function purgarLoQueNoDebeEstar() {
  try {
    const cache = await caches.open(CACHE_VERSION);
    const guardadas = await cache.keys();
    await Promise.all(guardadas.filter(req => !sePuedeGuardar(req)).map(req => cache.delete(req)));
  } catch (e) { /* si no se puede purgar, no conviene bloquear la activación */ }
}

/* Estrategia: servir de la caché al instante y, a la vez, pedir la versión
   nueva por detrás para guardarla. Así la app abre igual de rápido, funciona
   sin conexión, y al subir cambios se actualiza sola en la siguiente apertura
   sin tener que tocar CACHE_VERSION a mano. */
/* Orígenes externos que SÍ pueden guardarse: recursos estáticos e inmutables.
   Todo lo demás (y muy especialmente la API de Supabase) va directo a la red:
   sus respuestas llevan los datos personales del usuario, no deben quedar
   guardadas en el navegador y servirlas de caché rompería la sincronización. */
const ORIGENES_CACHEABLES = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdn.jsdelivr.net'
];

function sePuedeGuardar(request) {
  let url;
  try { url = new URL(request.url); } catch (e) { return false; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;   // ni extensiones ni data:
  if (url.origin === self.location.origin) return true;
  return ORIGENES_CACHEABLES.includes(url.origin);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  /* Sin respondWith: el navegador la resuelve por su cuenta, sin pasar por caché */
  if (!sePuedeGuardar(request)) return;

  event.respondWith(
    caches.match(request).then(cached => {
      const enRed = fetch(request)
        .then(response => {
          /* Se guarda también lo de fuera (la tipografía de Google Fonts llega
             como respuesta opaca) para que la app se vea igual sin conexión. */
          if (response && (response.type === 'opaque' || response.status === 200)) {
            const copia = response.clone();
            caches.open(CACHE_VERSION).then(cache => cache.put(request, copia)).catch(() => {});
          }
          return response;
        })
        .catch(() => cached || (request.mode === 'navigate' ? caches.match('./index.html') : Response.error()));

      /* Si hay copia guardada se devuelve ya; la descarga sigue en segundo plano */
      return cached || enRed;
    })
  );
});
