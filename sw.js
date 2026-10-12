/* 방방곡곡 감정Log — 오프라인 캐시 */
var VERSION = "v22";
var BOX = "mindlog-" + VERSION;
var FILES = ["./", "./index.html", "./manifest.webmanifest",
             "./icon-192.png", "./icon-512.png", "./icon-512-maskable.png", "./icon-180.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(BOX).then(function(c){ return c.addAll(FILES); })
    .then(function(){ return self.skipWaiting(); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== BOX; })
                         .map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

/* 캐시 먼저 — 인터넷이 없어도 바로 뜬다. 없으면 받아서 넣어 둔다. */
self.addEventListener("fetch", function(e){
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, {ignoreSearch:true}).then(function(hit){
    if (hit) return hit;
    return fetch(e.request).then(function(res){
      if (res && res.ok && res.type === "basic") {
        var copy = res.clone();
        caches.open(BOX).then(function(c){ c.put(e.request, copy); });
      }
      return res;
    }).catch(function(){ return caches.match("./index.html"); });
  }));
});
