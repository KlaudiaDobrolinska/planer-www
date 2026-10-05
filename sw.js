// Pozwala otworzyc planer bez internetu. Wersja: 20261005-103748
const WERSJA = "20261005-103748";
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
  // GitHub kaze trzymac strone 10 minut - przy dokumencie wymuszamy sprawdzenie u zrodla
  const dokument = e.request.mode === "navigate"
    || u.pathname.endsWith("/") || u.pathname.endsWith(".html");
  const zapytanie = dokument
    ? new Request(e.request.url, {cache:"no-cache", credentials:"same-origin"})
    : e.request;
  e.respondWith(
    fetch(zapytanie)
      .then(r => {
        if(r && r.ok){ const kopia = r.clone();
          caches.open(SKRZYNIA).then(c => c.put(e.request, kopia)); }
        return r;
      })
      .catch(() => caches.match(e.request)
        .then(m => m || caches.match("./index.html")))
  );
});
