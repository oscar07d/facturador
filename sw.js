// 1. Definición de la caché y activos
// *** CAMBIA A V1.0.4 O SUPERIOR para forzar la actualización en el navegador ***
const CACHE_NAME = 'grid-facturador-v1.0.4'; 

const CACHE_ASSETS = [
    // Archivos de la raíz (CRÍTICOS)
    '/', 
    'index.html', 
    'manifest.json',
    'script.js',
    'style.css', 
    'modal_fix.css',
    
    // Archivos de la carpeta 'sounds'
    'sounds/notification.mp3',

    // Archivos de la carpeta 'img' (Iconos, Logos, etc.)
    'img/Add_User_icon.svg',
    'img/Basura_icon.svg',
    'img/Client_icon.svg',
    'img/Editar_icon.svg',
    'img/Email_icon.svg',
    'img/Guardar_Cambios_icon.svg',
    'img/Home_icon.svg',
    'img/Img_icon.svg',
    'img/Isologo.svg',
    'img/Isologo_img.png',
    'img/Logo_OSCAR_07D_Studios.svg',
    'img/Logo_Archivos.png',
    'img/My_Invoice_icon.svg',
    'img/New_Invoice_icon.svg',
    'img/Paid_icon.svg',
    'img/Pdf_icon.svg',
    'img/Search_icon.svg',
    'img/Settings_icon.svg',
    'img/Share_icon.svg',
    'img/Sign_Out_icon.svg',
    'img/WhatsApp_icon.svg',
    'img/bell-icon.svg',
    'img/dark-theme-icon.svg',
    'img/default-logo.png',
    'img/default-qr.png',
    'img/globe-icon.svg',
    'img/globe-icon_1.svg',
    'img/help-icon.svg',
    'img/isologo_icon_page.svg',
    'img/my_account_icon.svg',
    'img/my_account_icon_1.svg',
    'img/phone-icon.svg',
    'img/shield-icon.svg',
    'img/shopping_cart_icon.svg',
    'img/support-icon.svg',
    'img/system-theme-icon.svg',
    'img/theme-icon.svg',
    'img/updates-icon.svg',
    'img/user_icon.svg',

    // Archivos de la carpeta 'img/banks'
    'img/banks/av-villas.svg',
    'img/banks/bancolombia.svg',
    'img/banks/bbva.svg',
    'img/banks/bogota.svg',
    'img/banks/caja-social.svg',
    'img/banks/daviplata.svg',
    'img/banks/davivienda.svg',
    'img/banks/falabella.svg',
    'img/banks/finandina.svg',
    'img/banks/itau.svg',
    'img/banks/lulo.svg',
    'img/banks/movii.svg',
    'img/banks/nequi.svg',
    'img/banks/nu.svg',
    'img/banks/pibank.svg',
    'img/banks/powwi.svg',
    'img/banks/uala.svg',

    // Archivos de la carpeta 'img/logos'
    'img/logos/HBO_Max.png',
    'img/logos/alimento_carnes.png',
    'img/logos/alimento_frutas.png',
    'img/logos/alimento_lacteos.png',
    'img/logos/alimento_panaderia.png',
    'img/logos/alimento_verduras.png',
    'img/logos/apple_tv.png',
    'img/logos/aseo_hogar.png',
    'img/logos/aseo_personal.png',
    'img/logos/bebes.png',
    'img/logos/bebidas.png',
    'img/logos/bebidas_alcoholicas.png',
    'img/logos/cocina.png',
    'img/logos/disney.png',
    'img/logos/electrodomesticos.png',
    'img/logos/jardin.png',
    'img/logos/mascotas.png',
    'img/logos/max.png',
    'img/logos/medicamentos.png',
    'img/logos/mueble_comedor.png',
    'img/logos/mueble_dormitorio.png',
    'img/logos/mueble_sala.png',
    'img/logos/netflix.png',
    'img/logos/oficina.png',
    'img/logos/prime_video.png',
    'img/logos/snacks.png',
    'img/logos/spotify.png',
    'img/logos/tecnologia.png',
    'img/logos/textiles_costura.png',
    'img/logos/viajes_transporte.png'
    
    // NOTA: Los archivos de GitHub (ej. .github/workflows/...) no se precachean,
    // ya que son archivos de configuración de despliegue, no assets de la app.
];

// 2. Evento 'install': Pre-caching de todos los assets
self.addEventListener("install", e => {
    console.log("Service worker instalado. Iniciando Full Pre-caching.");
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cacheando todos los assets:', CACHE_ASSETS.length, 'archivos');
                return cache.addAll(CACHE_ASSETS);
            })
            .catch(err => console.error('Fallo el precaching:', err))
    );
    self.skipWaiting();
});

// 3. Evento 'activate': Limpieza de cachés antiguas
self.addEventListener("activate", e => {
    console.log("Service worker activado, limpiando cachés antiguas.");
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Eliminando caché antigua:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// 4. Evento 'fetch': Estrategia Cache-First (Offline support)
self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request)
            .then(response => {
                // Si está en caché, lo devuelve (Caché-First)
                if (response) {
                    return response;
                }
                // Si no está, va a la red (Network-Fallback)
                return fetch(e.request);
            })
    );
});
