self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("inspecto-v1").then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./App.jsx",
        "./main.jsx"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
