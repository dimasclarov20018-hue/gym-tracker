// Gym Tracker v1.6: offline app shell; user data lives in the browser database.
const CACHE = 'gym-tracker-shell-v2-5';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon.svg', './firebase-config.js'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const key of await caches.keys()) if (key.startsWith('gym-tracker-') && key !== CACHE) await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      if (response.ok && SHELL.some(path => new URL(path, self.registration.scope).href === event.request.url)) {
        const cache = await caches.open(CACHE); await cache.put(event.request, response.clone());
      }
      return response;
    } catch (error) {
      return await caches.match(event.request) || (event.request.mode === 'navigate' ? await caches.match('./index.html') : Response.error());
    }
  })());
});
