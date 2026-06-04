const CACHE = "cryptobs-static-v1";

// Only cache static assets (NO HTML pages, NO data, NO API)
const STATIC_ASSETS = [
  "/cryptobs/icon-192.png",
  "/cryptobs/icon-512.png",
  "/cryptobs/manifest.json"
];

// Install: cache only static assets
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE) {
            return caches.delete(key);
          }
        })
      );

      await self.clients.claim();
    })()
  );
});

// Fetch: NEVER cache HTML or Firebase/API data
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Always bypass cache for:
  // - HTML pages
  // - Firebase
  // - API requests
  // - navigation
  if (
    req.mode === "navigate" ||
    req.headers.get("accept")?.includes("text/html") ||
    url.hostname.includes("firebase") ||
    url.hostname.includes("googleapis") ||
    url.pathname.includes("/api") ||
    req.method !== "GET"
  ) {
    event.respondWith(fetch(req));
    return;
  }

  // Cache-first ONLY for static assets
  event.respondWith(
    caches.match(req).then((cached) => {
      return cached || fetch(req);
    })
  );
});
