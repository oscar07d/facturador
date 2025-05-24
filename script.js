// Importaciones de Firebase (usando la versión 11.8.1 como en tu configuración inicial)
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

// === INICIO: NUEVO CÓDIGO - Importaciones de Firestore ===
import { 
    getFirestore, 
    collection, 
    addDoc,
    serverTimestamp // Para guardar la fecha de creación en el servidor
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
// === FIN: NUEVO CÓDIGO ===

// Tu configuración de Firebase (la que me proporcionaste)
const firebaseConfig = {
    // ... (tu config) ...
};

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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Obtener la instancia de Autenticación
const googleProvider = new GoogleAuthProvider(); // Proveedor de Google para el inicio de sesión

// === INICIO: NUEVO CÓDIGO - Instancia de Firestore ===
const db = getFirestore(app); // Obtener la instancia de Firestore
// === FIN: NUEVO CÓDIGO ===

const analytics = getAnalytics(app); // Descomenta si quieres usar Firebase Analytics

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

// === INICIO: NUEVO CÓDIGO - Selectores para Totales y Descuento ===
const discountTypeSelect = document.getElementById('discountType');
const discountValueInput = document.getElementById('discountValue');

const subtotalAmountSpan = document.getElementById('subtotalAmount');
const discountAmountAppliedSpan = document.getElementById('discountAmountApplied');
const taxableBaseAmountSpan = document.getElementById('taxableBaseAmount'); // Base Imponible
const ivaAmountSpan = document.getElementById('ivaAmount');
const totalAmountSpan = document.getElementById('totalAmount');
// === FIN: NUEVO CÓDIGO ===

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

// === ARRAY PARA LOS ÍTEMS DE LA FACTURA ACTUAL ===
let currentInvoiceItems = [];
let nextItemId = 0; // Un contador simple para IDs únicos de ítems


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
    let targetTitle = "Sistema de Facturación"; // Título por defecto

    sections.forEach(section => {
        if (section) { // Verificar que el elemento exista
            section.style.display = section.id === sectionToShowId ? 'block' : 'none';
            section.classList.toggle('active-section', section.id === sectionToShowId);
        }
    });

    // Bloque actualizado para manejar títulos y llamadas a funciones específicas de la sección
    if (sectionToShowId === 'createInvoiceSection') {
        targetTitle = "Crear Nueva Factura";
        if (typeof setDefaultInvoiceDate === 'function') setDefaultInvoiceDate();
        if (typeof updateQuantityBasedOnStreaming === 'function') updateQuantityBasedOnStreaming();
        if (typeof handleDiscountChange === 'function') handleDiscountChange();
        if (typeof renderItems === 'function') renderItems(); // Llamada para mostrar ítems (o placeholder)
    } else if (sectionToShowId === 'viewInvoicesSection') {
        targetTitle = "Mis Facturas";
        // Aquí, en el futuro, llamaríamos a una función como loadAndDisplayInvoices();
        // Por ahora, nos aseguramos que la sección correcta esté visible.
        // El HTML de la sección ya tiene un placeholder: <p>Próximamente: Aquí podrás buscar y ver tus facturas creadas.</p>
        if (viewInvoicesSection && viewInvoicesSection.innerHTML.trim() === '') { // Solo si está vacía para no reescribir si ya tiene algo más complejo
            viewInvoicesSection.innerHTML = `<h2>Mis Facturas</h2><p>Listado de facturas aparecerá aquí. Funcionalidad en desarrollo.</p><div id="invoiceListContainer"></div>`;
        }
    } else if (sectionToShowId === 'clientsSection') {
        targetTitle = "Clientes";
        // Aquí, en el futuro, llamaríamos a una función como loadAndDisplayClients();
        // El HTML de la sección ya tiene un placeholder: <p>Próximamente: Aquí podrás buscar y gestionar tus clientes.</p>
        if (clientsSection && clientsSection.innerHTML.trim() === '') { // Solo si está vacía
            clientsSection.innerHTML = `<h2>Clientes</h2><p>Listado de clientes aparecerá aquí. Funcionalidad en desarrollo.</p><div id="clientListContainer"></div>`;
        }
    }
    if (appPageTitle) appPageTitle.textContent = targetTitle;

    navLinks.forEach(link => {
        if (link) { // Verificar que el elemento exista
            const targetSectionId = link.id.replace('nav', '').charAt(0).toLowerCase() + link.id.replace('nav', '').slice(1) + 'Section';
            link.classList.toggle('active-nav', targetSectionId === sectionToShowId);
        }
    });
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

/**
 * Muestra los ítems de la factura actual en el contenedor correspondiente.
 */
function renderItems() {
    if (!invoiceItemsContainer) return; // Salir si el contenedor no existe

    invoiceItemsContainer.innerHTML = ''; // Limpiar ítems anteriores

    if (currentInvoiceItems.length === 0) {
        invoiceItemsContainer.innerHTML = '<div class="invoice-item-placeholder">Aún no has agregado ítems.</div>';
    } else {
        currentInvoiceItems.forEach(item => {
            const itemSubtotal = item.quantity * item.price;
            // Aquí podrías añadir lógica de IVA por ítem si es necesario antes de mostrarlo

            const itemElement = document.createElement('div');
            itemElement.classList.add('invoice-item');
            itemElement.setAttribute('data-item-id', item.id);
            itemElement.innerHTML = `
                <div class="item-details">
                    <p class="item-description-display"><strong>${item.description}</strong></p>
                    <p class="item-meta">Cantidad: ${item.quantity} x Precio: ${item.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</p>
                </div>
                <div class="item-actions">
                    <p class="item-subtotal-display">${itemSubtotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</p>
                    <button type="button" class="btn btn-danger btn-sm delete-item-btn">Eliminar</button>
                </div>
            `;
            // Event listener para el botón de eliminar de este ítem
            itemElement.querySelector('.delete-item-btn').addEventListener('click', () => {
                deleteItem(item.id);
            });

            invoiceItemsContainer.appendChild(itemElement);
        });
    }
    // === INICIO: MODIFICACIÓN - Llamar a recalcular totales ===
    if (typeof recalculateTotals === 'function') recalculateTotals();
    // === FIN: MODIFICACIÓN ===
}

/**
 * Elimina un ítem de la lista currentInvoiceItems por su ID y vuelve a renderizar.
 * @param {number} itemId - El ID del ítem a eliminar.
 */
function deleteItem(itemId) {
    currentInvoiceItems = currentInvoiceItems.filter(item => item.id !== itemId);
    renderItems(); // Volver a mostrar los ítems actualizados
}
// (Después de la función deleteItem(itemId) ...)

// === INICIO: NUEVO CÓDIGO - PASO B (Función para Recalcular Totales) ===
/**
 * Calcula y actualiza todos los totales de la factura en el DOM.
 */
function recalculateTotals() {
    let subtotal = 0;
    let totalIVA = 0;

    currentInvoiceItems.forEach(item => {
        const itemTotal = item.quantity * item.price;
        subtotal += itemTotal;
        if (item.applyIVA) {
            totalIVA += itemTotal * 0.19; // 19% IVA sobre el total del ítem
        }
    });

    let discountAmount = 0;
    const selectedDiscountType = discountTypeSelect ? discountTypeSelect.value : 'none';
    const discountValue = discountValueInput ? parseFloat(discountValueInput.value) : 0;

    if (selectedDiscountType === 'percentage' && !isNaN(discountValue) && discountValue > 0) {
        discountAmount = subtotal * (discountValue / 100);
    } else if (selectedDiscountType === 'fixed' && !isNaN(discountValue) && discountValue > 0) {
        discountAmount = discountValue;
    }
    
    // Asegurarse que el descuento no sea mayor que el subtotal
    if (discountAmount > subtotal) {
        discountAmount = subtotal;
    }

    const taxableBaseAmount = subtotal - discountAmount;
    // El totalIVA ya se calculó sobre los precios de los ítems antes del descuento general de factura.
    // Si el IVA se calculara sobre la base imponible DESPUÉS del descuento general, la lógica sería:
    // totalIVA = taxableBaseAmount * 0.19; (Solo si todos los ítems llevan IVA o se define una política global)
    // Pero según tu solicitud, el IVA es por ítem, así que el cálculo anterior de totalIVA es correcto.

    const grandTotal = taxableBaseAmount + totalIVA;

    // Actualizar el DOM
    if (subtotalAmountSpan) subtotalAmountSpan.textContent = subtotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
    if (discountAmountAppliedSpan) discountAmountAppliedSpan.textContent = discountAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
    if (taxableBaseAmountSpan) taxableBaseAmountSpan.textContent = taxableBaseAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
    if (ivaAmountSpan) ivaAmountSpan.textContent = totalIVA.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
    if (totalAmountSpan) totalAmountSpan.textContent = grandTotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
}
// === FIN: NUEVO CÓDIGO - PASO B ===

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

onAuthStateChanged(auth, (user) => {
    showLoading(false);
    if (user) {
        // El usuario está autenticado (ha iniciado sesión)
        console.log("Usuario está conectado:", user.uid, user.displayName);

        if (loginContainer) { // Verificar si loginContainer fue encontrado
            loginContainer.style.display = 'none'; // <-- ESTA LÍNEA DEBE OCULTAR EL LOGIN
            console.log('Intentando ocultar loginContainer. Estilo display:', loginContainer.style.display); // Para depuración
        } else {
            console.error("Error: El elemento .login-container no fue encontrado en el DOM.");
        }

        if (mainContent) {
            mainContent.style.display = 'flex'; // O 'block', según tu CSS para .main-content
            console.log('Intentando mostrar mainContent. Estilo display:', mainContent.style.display); // Para depuración
        } else {
            console.error("Error: El elemento #mainContent no fue encontrado en el DOM.");
        }

        handleNavigation('createInvoiceSection');

    } else {
        // El usuario no está autenticado (ha cerrado sesión o nunca inició)
        console.log("No hay usuario conectado. Intentando ocultar mainContent y mostrar loginContainer.");
        if (loginContainer) {
            loginContainer.style.display = 'flex'; // O 'block'
            console.log('Intentando mostrar loginContainer. Estilo display:', loginContainer.style.display); // Para depuración
        } else {
            console.error("Error: El elemento .login-container no fue encontrado en el DOM.");
        }

        if (mainContent) {
            mainContent.style.display = 'none';
            console.log('Intentando ocultar mainContent. Estilo display:', mainContent.style.display); // Para depuración
        } else {
            console.error("Error: El elemento #mainContent no fue encontrado en el DOM.");
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

// (Al final de script.js, dentro de la sección de Event Listeners para la UI de facturación)

// === INICIO: NUEVO CÓDIGO - PASO D (Lógica y Listeners para Descuento) ===
/**
 * Gestiona la habilitación del campo de valor de descuento y recalcula totales.
 */
function handleDiscountChange() {
    if (discountTypeSelect && discountValueInput) {
        if (discountTypeSelect.value === 'none') {
            discountValueInput.value = ''; // Limpiar valor
            discountValueInput.disabled = true;
        } else {
            discountValueInput.disabled = false;
        }
    }
    if (typeof recalculateTotals === 'function') recalculateTotals();
}

if (discountTypeSelect) {
    discountTypeSelect.addEventListener('change', handleDiscountChange);
}

if (discountValueInput) {
    discountValueInput.addEventListener('input', () => { // 'input' para que actualice mientras escribes
        if (typeof recalculateTotals === 'function') recalculateTotals();
    });
}

// Llamar a handleDiscountChange una vez al inicio para establecer el estado correcto del campo de valor de descuento
// Esto es importante si la página se recarga y el select de descuento no está en "none".
if (typeof handleDiscountChange === 'function' && createInvoiceSection.style.display !== 'none') {
    // Solo llamar si la sección de crear factura está visible para evitar errores si los elementos no existen aún
    // O mejor aún, llamar dentro de handleNavigation cuando se muestra createInvoiceSection
}
// === FIN: NUEVO CÓDIGO - PASO D ===

// Botones (placeholders)
if (addItemBtn) {
    addItemBtn.addEventListener('click', () => {
        // Leer valores de los campos del ítem
        const description = itemDescription.value.trim();
        const isStreaming = itemIsStreamingCheckbox.checked;
        let quantity = parseInt(itemQuantityInput.value);
        const price = parseFloat(itemPrice.value);
        const applyIVA = itemApplyIVA.checked;

        // Validación básica
        if (!description) {
            alert("Por favor, ingresa una descripción para el ítem.");
            itemDescription.focus();
            return;
        }
        if (isNaN(quantity) || quantity <= 0) {
            alert("Por favor, ingresa una cantidad válida.");
            itemQuantityInput.focus();
            return;
        }
        if (isNaN(price) || price < 0) { // Permitimos precio 0 si es necesario
            alert("Por favor, ingresa un precio válido.");
            itemPrice.focus();
            return;
        }

        if (isStreaming) { // Si es streaming, la cantidad es 1
            quantity = 1;
        }

        // Crear el objeto ítem
        const newItem = {
            id: nextItemId++, // Asignar ID único e incrementar
            description: description,
            isStreaming: isStreaming,
            quantity: quantity,
            price: price,
            applyIVA: applyIVA
        };

        // Añadir al array de ítems
        currentInvoiceItems.push(newItem);

        // Actualizar la lista visual de ítems
        renderItems();

        // Limpiar los campos del formulario de ítem
        itemDescription.value = '';
        itemIsStreamingCheckbox.checked = false;
        itemQuantityInput.value = 1;
        itemQuantityInput.disabled = false; // Asegurar que esté habilitado
        itemPrice.value = '';
        itemApplyIVA.checked = false;
        itemDescription.focus(); // Poner foco de nuevo en la descripción
    });
}

if (invoiceForm) {
    invoiceForm.addEventListener('submit', async (e) => { // Convertida a función async
        e.preventDefault();
        console.log("Intentando guardar factura...");

        // 1. Verificar si hay un usuario autenticado
        const user = auth.currentUser;
        if (!user) {
            alert("Debes iniciar sesión para guardar una factura.");
            return;
        }

        // 2. Recopilar datos del formulario
        // (Asegúrate de tener variables para todos estos elementos del DOM seleccionadas)
        const emitterData = {
            name: document.getElementById('emitterName') ? document.getElementById('emitterName').value.trim() : '',
            id: document.getElementById('emitterId') ? document.getElementById('emitterId').value.trim() : '',
            address: document.getElementById('emitterAddress') ? document.getElementById('emitterAddress').value.trim() : '',
            phone: document.getElementById('emitterPhone') ? document.getElementById('emitterPhone').value.trim() : '',
            email: document.getElementById('emitterEmail') ? document.getElementById('emitterEmail').value.trim() : ''
        };

        const clientData = {
            // Por ahora, tomamos los datos ingresados. Más adelante integraremos la selección/creación.
            name: document.getElementById('clientName') ? document.getElementById('clientName').value.trim() : '',
            phone: document.getElementById('clientPhone') ? document.getElementById('clientPhone').value.trim() : '',
            email: document.getElementById('clientEmail') ? document.getElementById('clientEmail').value.trim() : ''
        };
        // Validación básica de datos del cliente (puedes expandirla)
        if (!clientData.name || !clientData.phone || !clientData.email) {
            alert("Por favor, completa todos los campos obligatorios del cliente (Nombres, Celular, Correo).");
            return;
        }

        if (currentInvoiceItems.length === 0) {
            alert("Debes agregar al menos un ítem a la factura.");
            return;
        }
        
        // Forzar recálculo final antes de guardar (por si acaso)
        if (typeof recalculateTotals === 'function') recalculateTotals();

        const invoiceToSave = {
            userId: user.uid, // Guardar el ID del usuario que creó la factura
            invoiceNumberDisplay: `FCT-${invoiceNumberText.textContent}`, // El número como se muestra
            invoiceDate: invoiceDateInput.value,
            serviceStartDate: document.getElementById('serviceStartDate') ? document.getElementById('serviceStartDate').value : null,
            emitter: emitterData,
            client: clientData,
            items: currentInvoiceItems, // El array de ítems que ya manejamos
            discount: {
                type: discountTypeSelect.value,
                value: parseFloat(discountValueInput.value) || 0
            },
            totals: { // Guardar los totales calculados
                subtotal: parseFloat(subtotalAmountSpan.textContent.replace(/[^\d,-]/g, '').replace(',', '.')) || 0,
                discountApplied: parseFloat(discountAmountAppliedSpan.textContent.replace(/[^\d,-]/g, '').replace(',', '.')) || 0,
                taxableBase: parseFloat(taxableBaseAmountSpan.textContent.replace(/[^\d,-]/g, '').replace(',', '.')) || 0,
                iva: parseFloat(ivaAmountSpan.textContent.replace(/[^\d,-]/g, '').replace(',', '.')) || 0,
                grandTotal: parseFloat(totalAmountSpan.textContent.replace(/[^\d,-]/g, '').replace(',', '.')) || 0
            },
            paymentStatus: paymentStatusSelect.value,
            createdAt: serverTimestamp() // Fecha y hora de creación en el servidor
        };

        // 3. Guardar en Firestore
        if (saveInvoiceBtn) saveInvoiceBtn.disabled = true; // Deshabilitar botón para evitar doble envío
        if (generateInvoiceFileBtn) generateInvoiceFileBtn.disabled = true;
        showLoading(true);

        try {
            const docRef = await addDoc(collection(db, "facturas"), invoiceToSave);
            console.log("Factura guardada con ID: ", docRef.id);
            alert("¡Factura guardada exitosamente!");

            // 4. Limpiar formulario y reiniciar para una nueva factura
            invoiceForm.reset(); // Resetea la mayoría de los campos del formulario
            currentInvoiceItems = []; // Vaciar array de ítems
            nextItemId = 0; // Resetear contador de ID de ítems
            if (typeof renderItems === 'function') renderItems(); // Limpiar la lista visual de ítems y recalcular totales (que serán 0)
            if (typeof setDefaultInvoiceDate === 'function') setDefaultInvoiceDate(); // Poner fecha actual
            if (typeof updateQuantityBasedOnStreaming === 'function') updateQuantityBasedOnStreaming(); // Resetear checkbox de streaming
            if (typeof handleDiscountChange === 'function') handleDiscountChange(); // Resetear campo de descuento
            // Aquí podríamos implementar la lógica para el siguiente número de factura. Por ahora, se queda como estaba.
            
        } catch (error) {
            console.error("Error al guardar la factura: ", error);
            alert("Error al guardar la factura. Por favor, inténtalo de nuevo.\nDetalle: " + error.message);
        } finally {
            if (saveInvoiceBtn) saveInvoiceBtn.disabled = false; // Rehabilitar botón
            if (generateInvoiceFileBtn) generateInvoiceFileBtn.disabled = false;
            showLoading(false);
        }
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
