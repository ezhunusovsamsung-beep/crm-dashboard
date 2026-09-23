// Минимальный service worker: кэширует страницу,
// чтобы приложение открывалось (с последними загруженными данными)
// даже без сети. Иконки — data:URI внутри HTML/manifest, отдельно кэшировать не нужно.
var CACHE = "crm-audit-v2";
var ASSETS = ["./index.html", "./manifest.json"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(cache){ return cache.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(e){
  e.respondWith(
    caches.match(e.request).then(function(cached){
      var fetchPromise = fetch(e.request).then(function(resp){
        if(resp && resp.status===200 && e.request.method==="GET"){
          var copy = resp.clone();
          caches.open(CACHE).then(function(cache){ cache.put(e.request, copy); });
        }
        return resp;
      }).catch(function(){ return cached; });
      return cached || fetchPromise;
    })
  );
});
