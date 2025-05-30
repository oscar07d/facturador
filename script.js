// Importaciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { 
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    doc,
    getDoc,
    setDoc,
    runTransaction,
    query,
    where,
    getDocs,
    orderBy,
    updateDoc,
    deleteDoc // Añadido para la eliminación permanente
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyABKvAAUxoyzvcjCXaSbwZzT0RCI32-vRQ",
    authDomain: "facturadorweb-5125f.firebaseapp.com",
    projectId: "facturadorweb-5125f",
    storageBucket: "facturadorweb-5125f.firebasestorage.app",
    messagingSenderId: "622762316446",
    appId: "1:622762316446:web:1625bc78893e674188a18f",
    measurementId: "G-ETGNS3KCVP"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

// --- Selección de Elementos del DOM ---
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const loadingOverlay = document.getElementById('loadingOverlay');
const loginContainer = document.querySelector('.login-container');
const mainContent = document.getElementById('mainContent');

// Navegación
const navCreateInvoice = document.getElementById('navCreateInvoice');
const navViewInvoices = document.getElementById('navViewInvoices');
const navClients = document.getElementById('navClients');

// Secciones
const createInvoiceSection = document.getElementById('createInvoiceSection');
const viewInvoicesSection = document.getElementById('viewInvoicesSection');
const clientsSection = document.getElementById('clientsSection');
const appPageTitle = document.getElementById('appPageTitle');

// Formulario de Factura
const invoiceForm = document.getElementById('invoiceForm');

// Cliente (Desplegable Personalizado y Campos)
const customClientSelect = document.getElementById('customClientSelect');
const customClientSelectDisplay = document.getElementById('customClientSelectDisplay');
const selectedClientNameDisplay = document.getElementById('selectedClientNameDisplay');
const customClientOptions = document.getElementById('customClientOptions');
const hiddenSelectedClientIdInput = document.getElementById('selectedClientId');
const clientNameInput = document.getElementById('clientName');
const clientPhoneInput = document.getElementById('clientPhone');
const clientEmailInput = document.getElementById('clientEmail');
const editClientBtn = document.getElementById('editClientBtn');
const deleteClientBtn = document.getElementById('deleteClientBtn');

// Detalles de Factura
const invoiceDateInput = document.getElementById('invoiceDate');
const invoiceNumberText = document.getElementById('invoiceNumberText');

// Ítems
const itemDescription = document.getElementById('itemDescription');
const itemIsStreamingCheckbox = document.getElementById('itemIsStreaming');
const streamingProfileFieldsDiv = document.getElementById('streamingProfileFields');
const itemProfileNameInput = document.getElementById('itemProfileName');
const itemProfilePinInput = document.getElementById('itemProfilePin');
const itemQuantityInput = document.getElementById('itemQuantity');
const itemPrice = document.getElementById('itemPrice');
const itemApplyIVA = document.getElementById('itemApplyIVA');
const addItemBtn = document.getElementById('addItemBtn');
const invoiceItemsContainer = document.getElementById('invoiceItemsContainer');

// Estado de Pago
const paymentStatusSelect = document.getElementById('paymentStatus');
const paymentStatusInfoDiv = document.getElementById('paymentStatusInfo');
const paymentStatusDescriptionP = document.getElementById('paymentStatusDescription');
const paymentStatusActionP = document.getElementById('paymentStatusAction');

// Descuento y Totales
const discountTypeSelect = document.getElementById('discountType');
const discountValueInput = document.getElementById('discountValue');
const subtotalAmountSpan = document.getElementById('subtotalAmount');
const discountAmountAppliedSpan = document.getElementById('discountAmountApplied');
const taxableBaseAmountSpan = document.getElementById('taxableBaseAmount');
const ivaAmountSpan = document.getElementById('ivaAmount');
const totalAmountSpan = document.getElementById('totalAmount');

// Botones de Acción del Formulario
const saveInvoiceBtn = document.getElementById('saveInvoiceBtn');
const generateInvoiceFileBtn = document.getElementById('generateInvoiceFileBtn');

// Selectores para el Modal de Detalles de Factura
const invoiceDetailModal = document.getElementById('invoiceDetailModal');
const modalInvoiceTitle = document.getElementById('modalInvoiceTitle');
const modalInvoiceDetailsContent = document.getElementById('modalInvoiceDetailsContent');
const closeInvoiceDetailModalBtn = document.getElementById('closeInvoiceDetailModalBtn');
const printInvoiceFromModalBtn = document.getElementById('printInvoiceFromModalBtn');

// --- Variables Globales ---
const paymentStatusDetails = {
    pending: { text: "Pendiente", cssClass:"invoice-status-pending", description: "La factura ha sido emitida y enviada al cliente, pero aún no se ha recibido el pago...", action: "Monitoreo regular..." },
    paid: { text: "Pagado", cssClass:"invoice-status-paid", description: "El cliente ha realizado el pago completo...", action: "Agradecimiento al cliente..." },
    overdue: { text: "Vencido", cssClass:"invoice-status-overdue", description: "La fecha de vencimiento ha pasado...", action: "Inicio del proceso de cobranza..." },
    in_process: { text: "En Proceso", cssClass:"invoice-status-in_process", description: "El cliente ha informado que el pago está en trámite...", action: "Seguimiento..." },
    partial_payment: { text: "Pago Parcial", cssClass:"invoice-status-partial_payment", description: "El cliente ha realizado un abono parcial.", action: "Contactar para acordar pago restante." },
    disputed: { text: "Disputado", cssClass:"invoice-status-disputed", description: "El cliente ha manifestado una inconformidad.", action: "Investigación interna..." },
    cancelled: { text: "Cancelado", cssClass:"invoice-status-cancelled", description: "La factura ha sido anulada.", action: "Informar al cliente..." },
    uncollectible: { text: "Incobrable", cssClass:"invoice-status-uncollectible", description: "Se considera que la deuda no será recuperada.", action: "Proceder según políticas..." },
    nuevo: { text: "Nuevo", cssClass: "status-client-nuevo", description: "Cliente recién registrado.", action: "Crear primera factura." },
    activo: { text: "Activo", cssClass: "status-client-activo", description: "Cliente con actividad.", action: "Seguimiento normal." },
    'al día': { text: "Al Día", cssClass: "status-client-al-dia", description: "Cliente con pagos al día.", action: "Excelente." },
    'con pendientes': { text: "Con Pend.", cssClass: "status-client-con-pendientes", description: "Cliente tiene facturas pendientes.", action: "Revisar y recordar." },
    moroso: { text: "Moroso", cssClass: "status-client-moroso", description: "Cliente tiene facturas vencidas.", action: "Iniciar cobranza." },
    inactivo: { text: "Inactivo", cssClass: "status-client-inactivo", description: "Cliente marcado como inactivo.", action: "Archivar o revisar." },
    'n/a': { text: "N/A", cssClass: "invoice-status-na", description: "No aplica o sin información.", action: "Verificar datos."}
};
let currentInvoiceItems = [];
let nextItemId = 0;
let loadedClients = [];
let isEditingClient = false;

// --- Funciones Auxiliares y de UI ---
const showLoading = (show) => { if (loadingOverlay) loadingOverlay.style.display = show ? 'flex' : 'none'; };
function setDefaultInvoiceDate() { if (invoiceDateInput) { const today = new Date(); invoiceDateInput.value = today.toISOString().split('T')[0]; } }
function updateQuantityBasedOnStreaming() { /* ... (código completo que ya tienes) ... */ }
function updatePaymentStatusDisplay() { /* ... (código completo que ya tienes) ... */ }
function formatInvoiceNumber(number) { /* ... (código completo que ya tienes) ... */ }
async function getCurrentLastInvoiceNumericValue(userId) { /* ... (código completo que ya tienes) ... */ }
async function getNextInvoiceNumber(userId) { /* ... (código completo que ya tienes) ... */ }
async function displayNextPotentialInvoiceNumber() { /* ... (código completo que ya tienes) ... */ }
function renderItems() { /* ... (código completo que ya tienes) ... */ }
function deleteItem(itemId) { /* ... (código completo que ya tienes) ... */ }
function recalculateTotals() { /* ... (código completo que ya tienes) ... */ }
function handleDiscountChange() { /* ... (código completo que ya tienes) ... */ }
function handleClientSelection(clientId, clientNameText, clientData = null) { /* ... (código completo que ya tienes para 2 píldoras) ... */ }
async function loadClientsIntoDropdown() { /* ... (código completo que ya tienes para 2 píldoras) ... */ }
async function softDeleteClient(clientId) { /* ... (código completo que ya tienes) ... */ }
async function recoverClient(clientId) { /* ... (código completo que ya tienes) ... */ }
async function displayActiveClients() { /* ... (código completo que ya tienes) ... */ }
async function displayDeletedClients() { /* ... (código completo que ya tienes) ... */ }
async function permanentlyDeleteClient(clientId) { /* ... (código completo que ya tienes) ... */ }

// --- Funciones para Modal de Detalle de Factura ---
function openInvoiceDetailModal(invoiceData, invoiceId) {
    if (!invoiceDetailModal || !modalInvoiceTitle || !modalInvoiceDetailsContent) {
        console.error("Elementos del modal no encontrados al intentar abrir.");
        return;
    }
    console.log("Abriendo modal para factura ID:", invoiceId);

    modalInvoiceTitle.textContent = `Detalle de Factura: ${invoiceData.invoiceNumberFormatted || 'N/A'}`;
    
    let detailsHTML = '';
    if (invoiceData.emitter && (invoiceData.emitter.name || invoiceData.emitter.id)) {
        detailsHTML += `<h3>Datos del Emisor</h3><div class="modal-section-grid">`;
        if (invoiceData.emitter.name) detailsHTML += `<p><strong>Comercio:</strong> ${invoiceData.emitter.name}</p>`;
        if (invoiceData.emitter.id) detailsHTML += `<p><strong>NIT/ID:</strong> ${invoiceData.emitter.id}</p>`;
        if (invoiceData.emitter.address) detailsHTML += `<p><strong>Dirección:</strong> ${invoiceData.emitter.address}</p>`;
        if (invoiceData.emitter.phone) detailsHTML += `<p><strong>Teléfono:</strong> ${invoiceData.emitter.phone}</p>`;
        if (invoiceData.emitter.email) detailsHTML += `<p><strong>Email:</strong> ${invoiceData.emitter.email}</p>`;
        detailsHTML += `</div>`;
    }
    detailsHTML += `<h3>Facturar A:</h3><div class="modal-section-grid">`;
    detailsHTML += `<p><strong>Nombre:</strong> ${invoiceData.client?.name || 'N/A'}</p>`;
    detailsHTML += `<p><strong>Celular:</strong> ${invoiceData.client?.phone || 'N/A'}</p>`;
    if (invoiceData.client?.email) detailsHTML += `<p><strong>Correo:</strong> ${invoiceData.client.email}</p>`;
    detailsHTML += `</div>`;
    detailsHTML += `<h3>Detalles de la Factura</h3>`;
    detailsHTML += `<p><strong>Número:</strong> ${invoiceData.invoiceNumberFormatted || 'N/A'}</p>`;
    detailsHTML += `<p><strong>Fecha:</strong> ${invoiceData.invoiceDate || 'N/A'}</p>`;
    if (invoiceData.serviceStartDate) {
        detailsHTML += `<p><strong>Inicio Servicio:</strong> ${invoiceData.serviceStartDate}</p>`;
    }
    const statusKeyModal = invoiceData.paymentStatus || 'pending';
    const statusInfoModal = paymentStatusDetails[statusKeyModal] || { text: statusKeyModal, cssClass: `status-${statusKeyModal.toLowerCase()}` };
    detailsHTML += `<p><strong>Estado:</strong> <span class="status-badge ${statusInfoModal.cssClass}">${statusInfoModal.text}</span></p>`;
    detailsHTML += `<h3>Ítems:</h3>`;
    if (invoiceData.items && invoiceData.items.length > 0) {
        detailsHTML += `<table class="modal-items-table"><thead><tr><th>Descripción</th><th>Cant.</th><th>P.U.</th><th>Total</th></tr></thead><tbody>`;
        invoiceData.items.forEach(item => {
            let profileInfo = '';
            if (item.isStreaming && item.profileName) {
                profileInfo = `<br><small class="item-profile-details">Perfil: ${item.profileName} ${item.profilePin ? `(PIN: ${item.profilePin})` : ''}</small>`;
            }
            detailsHTML += `<tr>
                               <td>${item.description}${profileInfo}</td>
                               <td class="text-right">${item.quantity}</td>
                               <td class="text-right">${(item.price || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                               <td class="text-right">${((item.quantity * item.price) || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                           </tr>`;
        });
        detailsHTML += `</tbody></table>`;
    } else {
        detailsHTML += `<p>No hay ítems en esta factura.</p>`;
    }
    detailsHTML += `<div class="modal-totals-summary">`;
    if (invoiceData.totals) {
        detailsHTML += `<p><span>Subtotal:</span> <span>${(invoiceData.totals.subtotal || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span></p>`;
        if (invoiceData.totals.discountApplied > 0) {
             detailsHTML += `<p><span>Descuento:</span> <span>-${(invoiceData.totals.discountApplied || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span></p>`;
        }
        const calculatedTaxableBaseModal = (invoiceData.totals.subtotal || 0) - (invoiceData.totals.discountApplied || 0);
        if (invoiceData.totals.taxableBase !== undefined && (invoiceData.totals.discountApplied > 0 || invoiceData.totals.taxableBase !== invoiceData.totals.subtotal)) {
            detailsHTML += `<p><span>Base Imponible:</span> <span>${(invoiceData.totals.taxableBase || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span></p>`;
        } else if (invoiceData.totals.taxableBase === undefined && invoiceData.totals.discountApplied > 0) {
             detailsHTML += `<p><span>Base Imponible:</span> <span>${(calculatedTaxableBaseModal).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span></p>`;
        }
        if (invoiceData.totals.iva > 0) {
            detailsHTML += `<p><span>IVA (19%):</span> <span>${(invoiceData.totals.iva || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span></p>`;
        }
        detailsHTML += `<p class="modal-grand-total"><span>TOTAL:</span> <span>${(invoiceData.totals.grandTotal || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span></p>`;
    }
    detailsHTML += `</div>`;

    modalInvoiceDetailsContent.innerHTML = detailsHTML;
    if (invoiceDetailModal) invoiceDetailModal.classList.add('active');
}

function closeInvoiceDetailModal() {
    if (!invoiceDetailModal) return;
    invoiceDetailModal.classList.remove('active');
    if (modalInvoiceDetailsContent) {
       setTimeout(() => { if(modalInvoiceDetailsContent) modalInvoiceDetailsContent.innerHTML = ''; }, 300); 
    }
    if (modalInvoiceTitle) modalInvoiceTitle.textContent = 'Detalle de Factura';
}

// --- Función de Navegación Principal ---
async function handleNavigation(sectionToShowId) {
    const sections = [createInvoiceSection, viewInvoicesSection, clientsSection];
    const navLinks = [navCreateInvoice, navViewInvoices, navClients];
    let targetTitle = "Sistema de Facturación";

    sections.forEach(section => { if (section) section.style.display = 'none'; });
    navLinks.forEach(link => { if (link) link.classList.remove('active-nav'); });

    const currentSection = sections.find(s => s && s.id === sectionToShowId);
    if (currentSection) currentSection.style.display = 'block';
    
    const currentLink = navLinks.find(l => l && (l.id.replace('nav', '').charAt(0).toLowerCase() + l.id.replace('nav', '').slice(1) + 'Section') === sectionToShowId);
    if (currentLink) currentLink.classList.add('active-nav');

    if (sectionToShowId === 'createInvoiceSection') {
        targetTitle = "Crear Nueva Factura";
        if (typeof setDefaultInvoiceDate === 'function') setDefaultInvoiceDate();
        if (typeof updateQuantityBasedOnStreaming === 'function') updateQuantityBasedOnStreaming();
        if (typeof handleDiscountChange === 'function') handleDiscountChange();
        if (typeof renderItems === 'function') renderItems();
        if (typeof displayNextPotentialInvoiceNumber === 'function') await displayNextPotentialInvoiceNumber();
        if (typeof loadClientsIntoDropdown === 'function') await loadClientsIntoDropdown();
    } else if (sectionToShowId === 'viewInvoicesSection') {
        targetTitle = "Mis Facturas";
        const currentInvoiceListContainer = document.getElementById('invoiceListContainer');
        if (viewInvoicesSection && !currentInvoiceListContainer) {
            viewInvoicesSection.innerHTML = `<h2>Mis Facturas</h2><div id="invoiceListContainer"><p>Cargando facturas...</p></div>`;
        } else if (currentInvoiceListContainer) {
            currentInvoiceListContainer.innerHTML = `<p>Cargando facturas...</p>`;
        }
        if (typeof loadAndDisplayInvoices === 'function') await loadAndDisplayInvoices();
    } else if (sectionToShowId === 'clientsSection') {
        targetTitle = "Clientes";
        if (clientsSection) {
            const isPlaceholder = clientsSection.innerHTML.includes("Funcionalidad en desarrollo");
            if (clientsSection.innerHTML.trim() === '' || isPlaceholder || !document.getElementById('activeClientsListContainer')) {
                 clientsSection.innerHTML = `
                    <h2>Clientes</h2>
                    <div class="client-list-subsection">
                        <h3>Clientes Activos</h3>
                        <div id="activeClientsListContainer" class="client-list"><p>Cargando...</p></div>
                    </div>
                    <div class="client-list-subsection">
                        <h3>Clientes Inactivos</h3>
                        <div id="deletedClientsListContainer" class="client-list"><p>Cargando...</p></div>
                    </div>`;
            }
        }
        if (navClients) navClients.classList.add('active-nav');
        if (typeof displayActiveClients === 'function') await displayActiveClients();
        if (typeof displayDeletedClients === 'function') await displayDeletedClients();
    }
    if (appPageTitle) appPageTitle.textContent = targetTitle;
}

// --- Cargar y Mostrar Facturas ---
async function loadAndDisplayInvoices() {
    // Re-obtener la referencia al contenedor por si se creó dinámicamente
    const currentInvoiceListContainer = document.getElementById('invoiceListContainer'); 
    if (!currentInvoiceListContainer) {
        const viewInvoicesSect = document.getElementById('viewInvoicesSection');
        if (viewInvoicesSect) {
             viewInvoicesSect.innerHTML = `<h2>Mis Facturas</h2><p>Error: Contenedor de lista no encontrado.</p>`;
        } else {
            console.error("Contenedor #invoiceListContainer Y sección #viewInvoicesSection no encontrados.");
        }
        return; 
    }
    const user = auth.currentUser;
    if (!user) { currentInvoiceListContainer.innerHTML = '<p>Debes iniciar sesión.</p>'; return; }
    currentInvoiceListContainer.innerHTML = '<p>Cargando facturas...</p>';
    try {
        const q = query(collection(db, "facturas"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        currentInvoiceListContainer.innerHTML = '';
        if (querySnapshot.empty) {
            currentInvoiceListContainer.innerHTML = '<p>No tienes facturas guardadas.</p>';
        } else {
            querySnapshot.forEach((docSnap) => {
                const invoice = docSnap.data();
                const invoiceId = docSnap.id;
                const itemElement = document.createElement('div');
                itemElement.classList.add('invoice-list-item');
                itemElement.setAttribute('data-invoice-id', invoiceId);
                let statusKey = invoice.paymentStatus || 'pending'; 
                let statusInfo = paymentStatusDetails[statusKey] || { text: statusKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), cssClass: `invoice-status-${statusKey.toLowerCase()}` };

                itemElement.innerHTML = `
                    <div class="invoice-list-header">
                        <span class="invoice-list-number">${invoice.invoiceNumberFormatted || 'N/A'}</span>
                        <span class="status-badge ${statusInfo.cssClass}">${statusInfo.text}</span>
                    </div>
                    <div class="invoice-list-client">${invoice.client?.name || 'N/A'}</div>
                    <div class="invoice-list-details">
                        <span class="invoice-list-date">Fecha: ${invoice.invoiceDate || 'N/A'}</span>
                        <span class="invoice-list-total">${(invoice.totals?.grandTotal || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                    </div>
                    <div class="invoice-list-actions">
                        <button type="button" class="btn btn-sm btn-info view-details-btn">Ver Detalles</button>
                    </div>
                `;
                const viewDetailsBtn = itemElement.querySelector('.view-details-btn');
                if (viewDetailsBtn) {
                    viewDetailsBtn.addEventListener('click', () => {
                        openInvoiceDetailModal(invoice, invoiceId); // LLAMAR A LA FUNCIÓN DEL MODAL
                    });
                }
                currentInvoiceListContainer.appendChild(itemElement);
            });
        }
    } catch (error) {
        console.error("Error al cargar facturas: ", error);
        if (currentInvoiceListContainer) currentInvoiceListContainer.innerHTML = '<p>Error al cargar facturas.</p>';
    }
}

// --- Lógica de Autenticación y Estado ---
if (loginButton) { 
    loginButton.addEventListener('click', () => {
        console.log("Paso 1: Clic en loginButton detectado.");
        showLoading(true);
        signInWithPopup(auth, googleProvider)
            .then((result) => { 
                console.log("Paso 2: signInWithPopup completado exitosamente (then). Usuario:", result.user.displayName);
            })
            .catch((error) => {
                console.error("Paso 2E: Error en signInWithPopup (catch):", error);
                let msg = "Error al iniciar sesión.";
                if (error.code === 'auth/popup-closed-by-user') msg = "Ventana de login cerrada.";
                else if (error.code === 'auth/cancelled-popup-request') msg = "Solicitud de inicio de sesión cancelada.";
                alert(msg);
            })
            .finally(() => { 
                console.log("Paso 3: Bloque finally de signInWithPopup.");
                if (!auth.currentUser && loadingOverlay.style.display !== 'none') {
                    console.log("Paso 4: Usuario no autenticado en finally, ocultando carga."); 
                    showLoading(false);
                }
            });
    });
}

if (logoutButton) { 
    logoutButton.addEventListener('click', () => {
        showLoading(true); 
        signOut(auth).catch((error) => {
            console.error("Error al cerrar sesión:", error);
            showLoading(false); 
        });
    });
}

onAuthStateChanged(auth, (user) => { 
    console.log("Paso 5: onAuthStateChanged se disparó. Usuario:", user ? user.uid : "ninguno");
    showLoading(false); 
    if (user) {
        console.log("Paso 6: Usuario autenticado en onAuthStateChanged.");
        if (loginContainer) loginContainer.style.display = 'none';
        if (mainContent) mainContent.style.display = 'flex'; 
        handleNavigation('createInvoiceSection');
    } else {
        console.log("Paso 6B: Usuario NO autenticado en onAuthStateChanged.");
        if (loginContainer) loginContainer.style.display = 'flex';
        if (mainContent) mainContent.style.display = 'none';
    }
});

// --- Event Listeners para la Interfaz de Facturación ---
if (navCreateInvoice) navCreateInvoice.addEventListener('click', (e) => { e.preventDefault(); handleNavigation('createInvoiceSection'); });
if (navViewInvoices) navViewInvoices.addEventListener('click', (e) => { e.preventDefault(); handleNavigation('viewInvoicesSection'); });
if (navClients) navClients.addEventListener('click', (e) => { e.preventDefault(); handleNavigation('clientsSection'); });

if (itemIsStreamingCheckbox) itemIsStreamingCheckbox.addEventListener('change', updateQuantityBasedOnStreaming);
if (paymentStatusSelect) paymentStatusSelect.addEventListener('change', updatePaymentStatusDisplay);

if (customClientSelect) {
    customClientSelect.addEventListener('click', (event) => {
        event.stopPropagation();
        if (customClientOptions) {
            const isOpen = customClientOptions.style.display === 'block';
            customClientOptions.style.display = isOpen ? 'none' : 'block';
            customClientSelect.classList.toggle('open', !isOpen);
        }
    });
}
document.addEventListener('click', (event) => {
    if (customClientSelect && !customClientSelect.contains(event.target) && customClientOptions) {
        if (customClientOptions.style.display === 'block') {
            customClientOptions.style.display = 'none';
            customClientSelect.classList.remove('open');
        }
    }
});

if (editClientBtn) {
    editClientBtn.addEventListener('click', () => {
        if (!hiddenSelectedClientIdInput || hiddenSelectedClientIdInput.value === "") return;
        if (clientNameInput) clientNameInput.disabled = false; 
        if (clientPhoneInput) clientPhoneInput.disabled = false; 
        if (clientEmailInput) clientEmailInput.disabled = false;
        if (clientNameInput) clientNameInput.focus();
        isEditingClient = true; 
        alert("Ahora puedes editar los datos del cliente. Los cambios se guardarán al guardar la factura.");
    });
}

if (deleteClientBtn) {
    deleteClientBtn.addEventListener('click', async () => {
        if (!hiddenSelectedClientIdInput || hiddenSelectedClientIdInput.value === "") { alert("Selecciona un cliente para eliminar."); return; }
        const selectedClientId = hiddenSelectedClientIdInput.value;
        const clientToDelete = loadedClients.find(c => c.id === selectedClientId);
        if (confirm(`¿Seguro que deseas marcar como inactivo a "${clientToDelete?.name || 'este cliente'}"?`)) {
            showLoading(true);
            const success = await softDeleteClient(selectedClientId);
            showLoading(false);
            if (success) {
                handleClientSelection("", "-- Nuevo Cliente --"); 
                await loadClientsIntoDropdown(); 
            }
        }
    });
}

if (discountTypeSelect) discountTypeSelect.addEventListener('change', handleDiscountChange);
if (discountValueInput) discountValueInput.addEventListener('input', () => { if (typeof recalculateTotals === 'function') recalculateTotals(); });

if (addItemBtn) {
    addItemBtn.addEventListener('click', () => {
        const description = itemDescription.value.trim();
        const isStreaming = itemIsStreamingCheckbox.checked;
        let quantity = parseInt(itemQuantityInput.value);
        const price = parseFloat(itemPrice.value);
        const applyIVA = itemApplyIVA.checked;
        let profileName = '';
        let profilePin = '';

        if (isStreaming) {
            quantity = 1;
            profileName = itemProfileNameInput ? itemProfileNameInput.value.trim() : '';
            profilePin = itemProfilePinInput ? itemProfilePinInput.value.trim() : '';
            if (!profileName && itemProfileNameInput && itemProfileNameInput.offsetParent !== null) { 
                 alert("Ingresa el Nombre del Perfil."); itemProfileNameInput.focus(); return; 
            }
        }

        if (!description) { alert("Ingresa una descripción."); itemDescription.focus(); return; }
        if (isNaN(quantity) || quantity <= 0) { alert("Ingresa una cantidad válida."); itemQuantityInput.focus(); return; }
        if (isNaN(price) || price < 0) { alert("Ingresa un precio válido."); itemPrice.focus(); return; }

        currentInvoiceItems.push({ id: nextItemId++, description, isStreaming, quantity, price, applyIVA, profileName: isStreaming ? profileName : null, profilePin: isStreaming ? profilePin : null });
        renderItems();

        itemDescription.value = '';
        itemIsStreamingCheckbox.checked = false; 
        itemPrice.value = '';
        itemApplyIVA.checked = false;
        if(itemProfileNameInput) itemProfileNameInput.value = ''; 
        if(itemProfilePinInput) itemProfilePinInput.value = '';  
        updateQuantityBasedOnStreaming(); 
        itemDescription.focus();
    });
}

if (invoiceForm) {
    invoiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) { alert("Debes iniciar sesión."); return; }
        if (currentInvoiceItems.length === 0) { alert("Agrega al menos un ítem."); return; }

        let clientName = clientNameInput?.value.trim();
        let clientPhone = clientPhoneInput?.value.trim();
        let clientEmail = clientEmailInput?.value.trim();
        if (!clientName || !clientPhone || !clientEmail) { alert("Completa los datos del cliente."); return; }
        
        const selectedClientId = hiddenSelectedClientIdInput.value;
        if (selectedClientId && isEditingClient) {
            const clientRef = doc(db, "clientes", selectedClientId);
            const clientUpdates = { name: clientName, phone: clientPhone, email: clientEmail, updatedAt: serverTimestamp() };
            try {
                await updateDoc(clientRef, clientUpdates);
                const clientIndex = loadedClients.findIndex(c => c.id === selectedClientId);
                if (clientIndex > -1) {
                    loadedClients[clientIndex] = { ...loadedClients[clientIndex], name, phone, email, updatedAt: new Date() }; 
                }
                if (selectedClientNameDisplay && hiddenSelectedClientIdInput.value === selectedClientId) {
                     handleClientSelection(selectedClientId, clientName, loadedClients[clientIndex]); 
                }
            } catch (error) {
                console.error("Error al actualizar cliente:", error);
                alert("Error al actualizar datos del cliente. Se guardará la factura con los datos anteriores.");
                const originalClient = loadedClients.find(client => client.id === selectedClientId);
                if (originalClient) {
                    clientName = originalClient.name; clientPhone = originalClient.phone; clientEmail = originalClient.email;
                }
            }
            isEditingClient = false; 
            if (clientNameInput) clientNameInput.disabled = true; 
            if (clientPhoneInput) clientPhoneInput.disabled = true;
            if (clientEmailInput) clientEmailInput.disabled = true;
        }
        
        if (typeof recalculateTotals === 'function') recalculateTotals();

        let actualNumericInvoiceNumber;
        let formattedInvoiceNumberStr;
        
        if (saveInvoiceBtn) saveInvoiceBtn.disabled = true;
        if (generateInvoiceFileBtn) generateInvoiceFileBtn.disabled = true;
        showLoading(true);
        
        try {
            actualNumericInvoiceNumber = await getNextInvoiceNumber(user.uid);
            formattedInvoiceNumberStr = formatInvoiceNumber(actualNumericInvoiceNumber);
        } catch (error) { 
            alert("Error crítico al generar número de factura. No se guardó la factura.");
            showLoading(false); 
            if (saveInvoiceBtn) saveInvoiceBtn.disabled = false;
            if (generateInvoiceFileBtn) generateInvoiceFileBtn.disabled = false;
            return; 
        }

        const invoiceToSave = {
            userId: user.uid,
            invoiceNumberFormatted: `FCT-${formattedInvoiceNumberStr}`,
            invoiceNumberNumeric: actualNumericInvoiceNumber,
            invoiceDate: invoiceDateInput.value,
            serviceStartDate: document.getElementById('serviceStartDate')?.value || null,
            emitter: {
                name: document.getElementById('emitterName')?.value.trim() || '',
                id: document.getElementById('emitterId')?.value.trim() || '',
                address: document.getElementById('emitterAddress')?.value.trim() || '',
                phone: document.getElementById('emitterPhone')?.value.trim() || '',
                email: document.getElementById('emitterEmail')?.value.trim() || ''
            },
            client: { name: clientName, phone: clientPhone, email: clientEmail }, 
            items: currentInvoiceItems,
            discount: { type: discountTypeSelect.value, value: (parseFloat(discountValueInput.value) || 0) },
            totals: {
                subtotal: parseFloat(subtotalAmountSpan.textContent.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
                discountApplied: parseFloat(discountAmountAppliedSpan.textContent.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
                taxableBase: parseFloat(taxableBaseAmountSpan.textContent.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
                iva: parseFloat(ivaAmountSpan.textContent.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
                grandTotal: parseFloat(totalAmountSpan.textContent.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0
            },
            paymentStatus: paymentStatusSelect.value,
            createdAt: serverTimestamp()
        };

        try {
            const docRef = await addDoc(collection(db, "facturas"), invoiceToSave);
            alert(`¡Factura FCT-${formattedInvoiceNumberStr} guardada! ID: ${docRef.id}`);

            if (hiddenSelectedClientIdInput && hiddenSelectedClientIdInput.value === "") {
                const newClientData = { 
                    userId: user.uid, name: clientName, phone: clientPhone, email: clientEmail, 
                    createdAt: serverTimestamp(), 
                    isDeleted: false, 
                    estadoGeneralCliente: "Nuevo", 
                    estadoUltimaFacturaCliente: invoiceToSave.paymentStatus 
                };
                try {
                    await addDoc(collection(db, "clientes"), newClientData);
                } catch (clientError) { console.error("Error al guardar nuevo cliente:", clientError); }
            } else if (selectedClientId) { 
                const clientRef = doc(db, "clientes", selectedClientId);
                try {
                    await updateDoc(clientRef, {
                        estadoUltimaFacturaCliente: invoiceToSave.paymentStatus,
                        updatedAt: serverTimestamp() 
                    });
                } catch (clientUpdateError) {
                    console.error("Error al actualizar estado del cliente existente:", clientUpdateError);
                }
            }
            
            invoiceForm.reset();
            currentInvoiceItems = []; nextItemId = 0;
            handleClientSelection("", "-- Nuevo Cliente --"); 
            
            renderItems(); 
            setDefaultInvoiceDate(); 
            updateQuantityBasedOnStreaming(); 
            handleDiscountChange();
            await loadClientsIntoDropdown(); 
            await displayNextPotentialInvoiceNumber();
            
        } catch (error) { 
            console.error("Error al guardar factura en Firestore o al procesar post-guardado:", error);
            alert(`Error durante el guardado: ${error.message}`);
        } finally { 
            if (saveInvoiceBtn) saveInvoiceBtn.disabled = false;
            if (generateInvoiceFileBtn) generateInvoiceFileBtn.disabled = false;
            showLoading(false);
        }
    });
}

// Listeners para cerrar el modal de detalle de factura
if (closeInvoiceDetailModalBtn) {
    closeInvoiceDetailModalBtn.addEventListener('click', closeInvoiceDetailModal);
}
if (invoiceDetailModal) {
    invoiceDetailModal.addEventListener('click', (event) => {
        if (event.target === invoiceDetailModal) { 
            closeInvoiceDetailModal();
        }
    });
}
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && invoiceDetailModal && invoiceDetailModal.classList.contains('active')) {
        closeInvoiceDetailModal();
    }
});
if (printInvoiceFromModalBtn) {
    printInvoiceFromModalBtn.addEventListener('click', () => {
        alert("Funcionalidad de Imprimir/Descargar PDF desde el modal está pendiente.");
    });
}

if (generateInvoiceFileBtn) { 
    generateInvoiceFileBtn.addEventListener('click', () => {
        alert("Funcionalidad 'Generar Factura (Archivo)' pendiente.");
    });
}
// --- FIN DEL ARCHIVO SCRIPT.JS ---
