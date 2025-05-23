// Importaciones de Firebase (usando la versión 11.8.1 como en tu configuración inicial)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js"; // Opcional, si usarás Analytics

// Tu configuración de Firebase (la que me proporcionaste)
const firebaseConfig = {
    apiKey: "AIzaSyABKvAAUxoyzvcjCXaSbwZzT0RCI32-vRQ",
    authDomain: "facturadorweb-5125f.firebaseapp.com",
    projectId: "facturadorweb-5125f",
    storageBucket: "facturadorweb-5125f.firebasestorage.app",
    messagingSenderId: "622762316446",
    appId: "1:622762316446:web:1625bc78893e674188a18f",
    measurementId: "G-ETGNS3KCVP" // Opcional, pero incluido en tu config
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Obtener la instancia de Autenticación
const googleProvider = new GoogleAuthProvider(); // Proveedor de Google para el inicio de sesión

// const analytics = getAnalytics(app); // Descomenta si quieres usar Firebase Analytics

// --- Selección de Elementos del DOM ---
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton'); // Asegúrate que este ID sigue en tu HTML del header de la app
const loadingOverlay = document.getElementById('loadingOverlay');
const loginContainer = document.querySelector('.login-container');
const mainContent = document.getElementById('mainContent');

// === INICIO: NUEVO CÓDIGO - PASO 1 (Variables DOM Interfaz Facturación) ===
// Elementos de Navegación de la App
const navCreateInvoice = document.getElementById('navCreateInvoice');
const navViewInvoices = document.getElementById('navViewInvoices');
const navClients = document.getElementById('navClients');

// Secciones Principales de la App
const createInvoiceSection = document.getElementById('createInvoiceSection');
const viewInvoicesSection = document.getElementById('viewInvoicesSection');
const clientsSection = document.getElementById('clientsSection');
const appPageTitle = document.getElementById('appPageTitle'); // Título de la página de la app

// Elementos del Formulario de Crear Factura
const invoiceForm = document.getElementById('invoiceForm');
const invoiceDateInput = document.getElementById('invoiceDate');
const invoiceNumberText = document.getElementById('invoiceNumberText'); // Span para el número de factura
const itemIsStreamingCheckbox = document.getElementById('itemIsStreaming');
const itemQuantityInput = document.getElementById('itemQuantity');
const paymentStatusSelect = document.getElementById('paymentStatus');
const paymentStatusInfoDiv = document.getElementById('paymentStatusInfo');
const paymentStatusDescriptionP = document.getElementById('paymentStatusDescription');
const paymentStatusActionP = document.getElementById('paymentStatusAction');

const addItemBtn = document.getElementById('addItemBtn');
const saveInvoiceBtn = document.getElementById('saveInvoiceBtn');
const generateInvoiceFileBtn = document.getElementById('generateInvoiceFileBtn');
// === FIN: NUEVO CÓDIGO - PASO 1 ===


// === INICIO: NUEVO CÓDIGO - PASO 2 (Constante Estados de Pago) ===
const paymentStatusDetails = {
    pending: {
        description: "La factura ha sido emitida y enviada al cliente, pero aún no se ha recibido el pago. El plazo de vencimiento todavía no ha llegado.",
        action: "Monitoreo regular, envío de recordatorios amigables antes de la fecha de vencimiento."
    },
    paid: {
        description: "El cliente ha realizado el pago completo de la factura y este ha sido confirmado.",
        action: "Agradecimiento al cliente, actualización de registros."
    },
    overdue: {
        description: "La fecha de vencimiento de la factura ha pasado y el pago no se ha recibido.",
        action: "Inicio del proceso de cobranza (recordatorios más insistentes, llamadas, aplicación de posibles intereses de mora según políticas). Se puede subclasificar por antigüedad de la mora (ej. Vencido 1-30 días, Vencido 31-60 días, etc.)."
    },
    in_process: {
        description: "El cliente ha informado que ha realizado el pago, o el pago está siendo procesado por el banco o la pasarela de pagos, pero aún no se refleja como confirmado.",
        action: "Seguimiento para confirmar la recepción efectiva del pago."
    },
    partial_payment: {
        description: "El cliente ha realizado un abono, pero no ha cubierto el total de la factura.",
        action: "Contactar al cliente para aclarar la situación y acordar el pago del saldo restante. Registrar el monto pagado y el pendiente."
    },
    disputed: {
        description: "El cliente ha manifestado una inconformidad con la factura o el servicio y, por lo tanto, ha retenido el pago total o parcial.",
        action: "Investigación interna de la disputa, comunicación con el cliente para resolver el problema."
    },
    cancelled: {
        description: "La factura ha sido anulada, ya sea por un error, por la cancelación del servicio/producto, o por un acuerdo con el cliente.",
        action: "Asegurarse de que el cliente esté informado y que los registros contables reflejen la anulación."
    },
    uncollectible: {
        description: "Después de múltiples intentos de cobro, se considera que la deuda no será recuperada.",
        action: "Se procede según las políticas de la empresa para dar de baja la cuenta por cobrar, lo cual puede tener implicaciones contables y fiscales."
    }
};
// === FIN: NUEVO CÓDIGO - PASO 2 ===


// --- Función para Mostrar/Ocultar Pantalla de Carga ---
const showLoading = (show) => {
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
};

// === INICIO: NUEVO CÓDIGO - PASO 3 (Nuevas Funciones UI Facturación) ===
/**
 * Gestiona la visibilidad de las secciones de la aplicación y el estado activo de la navegación.
 * @param {string} sectionToShowId - El ID de la sección a mostrar.
 */
function handleNavigation(sectionToShowId) {
    const sections = [createInvoiceSection, viewInvoicesSection, clientsSection];
    const navLinks = [navCreateInvoice, navViewInvoices, navClients];
    let targetTitle = "Sistema de Facturación";

    sections.forEach(section => {
        if (section) {
            section.style.display = section.id === sectionToShowId ? 'block' : 'none';
            section.classList.toggle('active-section', section.id === sectionToShowId);
        }
    });

    navLinks.forEach(link => {
        if (link) {
            const targetSectionId = link.id.replace('nav', '').charAt(0).toLowerCase() + link.id.replace('nav', '').slice(1) + 'Section';
            link.classList.toggle('active-nav', targetSectionId === sectionToShowId);
        }
    });

    if (sectionToShowId === 'createInvoiceSection') {
        targetTitle = "Crear Nueva Factura";
        if (typeof setDefaultInvoiceDate === 'function') setDefaultInvoiceDate();
        if (typeof updateQuantityBasedOnStreaming === 'function') updateQuantityBasedOnStreaming();
    } else if (sectionToShowId === 'viewInvoicesSection') {
        targetTitle = "Mis Facturas";
    } else if (sectionToShowId === 'clientsSection') {
        targetTitle = "Clientes";
    }
    if (appPageTitle) appPageTitle.textContent = targetTitle;
}

/**
 * Establece la fecha actual en el campo de fecha de la factura.
 */
function setDefaultInvoiceDate() {
    if (invoiceDateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        invoiceDateInput.value = `${year}-${month}-${day}`;
    }
}

/**
 * Actualiza el campo de cantidad y su estado (habilitado/deshabilitado)
 * basado en si el checkbox "Es Plataforma de Streaming" está marcado.
 */
function updateQuantityBasedOnStreaming() {
    if (itemIsStreamingCheckbox && itemQuantityInput) {
        if (itemIsStreamingCheckbox.checked) {
            itemQuantityInput.value = 1;
            itemQuantityInput.disabled = true;
        } else {
            itemQuantityInput.disabled = false;
        }
    }
}

/**
 * Muestra la descripción y acción para el estado de pago seleccionado.
 */
function updatePaymentStatusDisplay() {
    if (paymentStatusSelect && paymentStatusInfoDiv && paymentStatusDescriptionP && paymentStatusActionP) {
        const selectedStatusKey = paymentStatusSelect.value;
        const statusDetail = paymentStatusDetails[selectedStatusKey];

        if (statusDetail) {
            paymentStatusDescriptionP.textContent = statusDetail.description;
            paymentStatusActionP.textContent = statusDetail.action;
            paymentStatusInfoDiv.style.display = 'block';
        } else {
            paymentStatusInfoDiv.style.display = 'none';
        }
    }
}
// === FIN: NUEVO CÓDIGO - PASO 3 ===


// --- Lógica de Inicio de Sesión con Google ---
if (loginButton) {
    loginButton.addEventListener('click', () => {
        showLoading(true);
        signInWithPopup(auth, googleProvider)
            .then((result) => {
                console.log("Usuario autenticado con Google:", result.user);
            })
            .catch((error) => {
                console.error("Error durante el inicio de sesión con Google:", error);
                let errorMessage = "Ocurrió un error al intentar iniciar sesión.";
                if (error.code === 'auth/popup-closed-by-user') {
                    errorMessage = "La ventana de inicio de sesión fue cerrada antes de completar.";
                } else if (error.code === 'auth/cancelled-popup-request') {
                    errorMessage = "Se canceló la solicitud de inicio de sesión.";
                }
                alert(errorMessage);
            })
            .finally(() => {
                if (!auth.currentUser) {
                    showLoading(false);
                }
            });
    });
}

// --- Lógica para Cerrar Sesión ---
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        showLoading(true);
        signOut(auth)
            .then(() => {
                console.log("Usuario cerró sesión exitosamente.");
            })
            .catch((error) => {
                console.error("Error al cerrar sesión:", error);
                alert("Ocurrió un error al cerrar la sesión.");
            });
            // .finally() no es estrictamente necesario aquí si onAuthStateChanged maneja la carga
    });
}

// --- Observador del Estado de Autenticación ---
onAuthStateChanged(auth, (user) => {
    showLoading(false);
    if (user) {
        console.log("Usuario está conectado:", user.uid, user.displayName);
        if (loginContainer) loginContainer.style.display = 'none';
        if (mainContent) mainContent.style.display = 'flex'; // O 'block' o como lo tengas para .main-content

        // === INICIO: MODIFICACIÓN - PASO 4 (Llamar a handleNavigation) ===
        handleNavigation('createInvoiceSection');
        // === FIN: MODIFICACIÓN - PASO 4 ===

    } else {
        console.log("No hay usuario conectado. Intentando ocultar mainContent y mostrar loginContainer."); // Mensaje actualizado
        if (loginContainer) loginContainer.style.display = 'flex';
        if (mainContent) mainContent.style.display = 'none';
            console.log('Estilo de display de mainContent después de intentar ocultar:', mainContent.style.display); // <-- ESTE LOG
        } else {
            console.error("Error: El elemento #mainContent no fue encontrado en el DOM."); // <-- NUEVO LOG DE ERROR
        }
    }
});

// === INICIO: NUEVO CÓDIGO - PASO 5 (Nuevos Event Listeners UI Facturación) ===
// Navegación Principal de la App
if (navCreateInvoice) {
    navCreateInvoice.addEventListener('click', (e) => {
        e.preventDefault();
        handleNavigation('createInvoiceSection');
    });
}
if (navViewInvoices) {
    navViewInvoices.addEventListener('click', (e) => {
        e.preventDefault();
        handleNavigation('viewInvoicesSection');
    });
}
if (navClients) {
    navClients.addEventListener('click', (e) => {
        e.preventDefault();
        handleNavigation('clientsSection');
    });
}

// Interacciones del Formulario de Crear Factura
if (itemIsStreamingCheckbox) {
    itemIsStreamingCheckbox.addEventListener('change', updateQuantityBasedOnStreaming);
}

if (paymentStatusSelect) {
    paymentStatusSelect.addEventListener('change', updatePaymentStatusDisplay);
    // updatePaymentStatusDisplay(); // Opcional: Llamar al inicio para el primer estado
}

// Botones (placeholders)
if (addItemBtn) {
    addItemBtn.addEventListener('click', () => {
        console.log("Botón 'Agregar Ítem' presionado.");
        alert("Funcionalidad 'Agregar Ítem' pendiente de implementación.");
    });
}

if (invoiceForm) { // Asegurarse que el formulario exista antes de añadir listener a su botón de submit
    invoiceForm.addEventListener('submit', (e) => { // Cambiado a 'submit' en el form
        e.preventDefault(); 
        console.log("Botón 'Guardar Venta' (submit del form) presionado.");
        alert("Funcionalidad 'Guardar Venta' pendiente de implementación.");
    });
}
// Si saveInvoiceBtn es un botón type="button" y no type="submit" del form, entonces:
// if (saveInvoiceBtn) {
//     saveInvoiceBtn.addEventListener('click', (e) => {
//         // e.preventDefault(); // No necesario si es type="button"
//         console.log("Botón 'Guardar Venta' presionado.");
//         alert("Funcionalidad 'Guardar Venta' pendiente de implementación.");
//     });
// }


if (generateInvoiceFileBtn) {
    generateInvoiceFileBtn.addEventListener('click', () => {
        console.log("Botón 'Generar Factura (Archivo)' presionado.");
        alert("Funcionalidad 'Generar Factura (Archivo)' pendiente de implementación.");
    });
}
// === FIN: NUEVO CÓDIGO - PASO 5 ===

// // --- Inicialización de la UI al cargar la página --- (Esto ya lo maneja onAuthStateChanged)
// // if (auth.currentUser) {
// //     handleNavigation('createInvoiceSection');
// // }
