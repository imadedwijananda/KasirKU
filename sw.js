/* Service worker: simpan semua berkas agar aplikasi jalan tanpa internet. */
var CACHE = 'kasir-umkm-v12';
var SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/dist/umd/supabase.js';
var BERKAS = ['./', './index.html', './style.css', './app.js', './config.js', './manifest.webmanifest', './ikon.svg', './qris.svg', './tema.css', './tema.js', './logo.svg', './produk-contoh.svg', './favicon.ico', './icons/icon.svg', './icons/favicon-16.png', './icons/favicon-32.png', './icons/apple-touch-icon-180.png', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-192.png', './icons/icon-maskable-512.png', SUPABASE_JS];

self.addEventListener('install', function (e) {
  // Satu berkas gagal tidak membatalkan seluruh instalasi.
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(BERKAS.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  // Jangan pernah cache panggilan API Supabase (auth, database) atau login Google.
  if (/(^|\.)supabase\.(co|in)$/.test(url.hostname) || /(^|\.)google(apis)?\.com$/.test(url.hostname) && url.hostname !== 'fonts.googleapis.com' || url.pathname.indexOf('/auth/') === 0 || url.pathname.indexOf('/rest/') === 0) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (r) {
    return r || fetch(e.request).then(function (res) {
      if (res && (res.ok || res.type === 'opaque')) {
        var salin = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, salin); });
      }
      return res;
    });
  }).catch(function () { return caches.match('./index.html'); }));
});
