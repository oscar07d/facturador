self.addEventListener("install", e => {
    console.log("Service worker instalado");
    self.skipWaiting();
});

self.addEventListener("activate", e => {
    console.log("Service worker activado");
});

self.addEventListener("fetch", () => {});
