/* DompetKu service worker — offline shell minimal.
 *
 * Strategi sengaja konservatif untuk aplikasi keuangan:
 *  - HANYA aset statis (ikon, logo, manifest) yang di-cache.
 *  - Halaman dan API SELALU dari jaringan, karena saldo & transaksi tidak
 *    boleh basi. Menyajikan data keuangan lama dari cache lebih berbahaya
 *    daripada menampilkan status offline.
 *  - Offline fallback berupa halaman ringan, bukan data palsu.
 */
const VERSION = 'dompetku-v1';
const STATIC_CACHE = `${VERSION}-static`;

const PRECACHE = ['/logo.svg', '/icon-192x192.png', '/icon-512x512.png', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Jangan pernah cache API atau halaman HTML.
  if (url.pathname.startsWith('/api/')) return;

  const isStatic =
    url.pathname.startsWith('/_next/static/') ||
    /\.(?:png|jpg|jpeg|svg|webp|ico|woff2?)$/i.test(url.pathname) ||
    url.pathname === '/manifest.webmanifest';

  if (!isStatic) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached || Response.error());
    }),
  );
});
