// Pozwala otworzyc planer bez internetu. Wersja: 20261005-001412
const WERSJA = "20261005-001412";
const SKRZYNIA = "planer-" + WERSJA;
const SZKIELET = ["./", "./index.html", "./manifest.webmanifest",
                  "./ikona-180.png", "./ikona-192.png", "./ikona-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SKRZYNIA)
    .then(c => c.addAll(SZKIELET))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== SKRZYNIA).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if(u.origin !== location.origin) return;           // GitHub i Google - bez posrednika
  if(u.pathname.endsWith("wersja.txt")) return;      // zawsze prosto z sieci
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if(r && r.ok){ const kopia = r.clone();
          caches.open(SKRZYNIA).then(c => c.put(e.request, kopia)); }
        return r;
      })
      .catch(() => caches.match(e.request)
        .then(m => m || caches.match("./index.html")))
  );
});
