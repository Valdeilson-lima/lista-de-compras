// Service Worker para PWA - Cache offline
const CACHE_NAME = "lista-compras-v3";
const urlsToCache = [
  "/",
  "/home.html",
  "/index.html",
  "/pages/categorias.html",
  "/pages/itens.html",
  "/pages/estatisticas.html",
  "/pages/configuracoes.html",
  "/css/global.css",
  "/css/navbar.css",
  "/css/components.css",
  "/css/pages/home.css",
  "/css/pages/login.css",
  "/js/utils.js",
  "/js/auth.js",
  "/js/pages/home.js",
  "/js/pages/login.js",
  "/firebase-config.js",
  "/polyfills.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js",
];

// Install - cachear todos os recursos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache aberto");
      return cache.addAll(urlsToCache).catch((error) => {
        console.error("Erro ao cachear recursos:", error);
      });
    }),
  );
  self.skipWaiting();
});

// Activate - limpar caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Removendo cache antigo:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  return self.clients.claim();
});

// Fetch - estratégia Network First com fallback para cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a resposta é válida, clonar e cachear
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Se falhar (offline), buscar do cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // Se não houver no cache, retornar página offline personalizada
          if (event.request.destination === "document") {
            return caches.match("/home.html");
          }
        });
      }),
  );
});
