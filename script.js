// Importaciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
    getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { 
    getFirestore, collection, addDoc, serverTimestamp,
    doc, getDoc, setDoc, runTransaction,
    query, where, getDocs, orderBy,
    updateDoc 
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

const navCreateInvoice = document.getElementById('navCreateInvoice');
const navViewInvoices = document.getElementById('navViewInvoices');
const navClients = document.getElementById('navClients');
const createInvoiceSection = document.getElementById('createInvoiceSection');
const viewInvoicesSection = document.getElementById('viewInvoicesSection');
const clientsSection = document.getElementById('clientsSection');
const appPageTitle = document.getElementById('appPageTitle');
let invoiceListContainer = document.getElementById('invoiceListContainer');

const invoiceForm = document.getElementById('invoiceForm');

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

const invoiceDateInput = document.getElementById('invoiceDate');
const invoiceNumberText = document.getElementById('invoiceNumberText');
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

const paymentStatusSelect = document.getElementById('paymentStatus');
const paymentStatusInfoDiv = document.getElementById('paymentStatusInfo');
const paymentStatusDescriptionP = document.getElementById('paymentStatusDescription');
const paymentStatusActionP = document.getElementById('paymentStatusAction');

const discountTypeSelect = document.getElementById('discountType');
const discountValueInput = document.getElementById('discountValue');
const subtotalAmountSpan = document.getElementById('subtotalAmount');
const discountAmountAppliedSpan = document.getElementById('discountAmountApplied');
const taxableBaseAmountSpan = document.getElementById('taxableBaseAmount');
const ivaAmountSpan = document.getElementById('ivaAmount');
const totalAmountSpan = document.getElementById('totalAmount');

const saveInvoiceBtn = document.getElementById('saveInvoiceBtn');
const generateInvoiceFileBtn = document.getElementById('generateInvoiceFileBtn');

// --- Variables Globales ---
const paymentStatusDetails = {
    pending: { text: "Pendiente", description: "La factura ha sido emitida y enviada al cliente, pero aún no se ha recibido el pago...", action: "Monitoreo regular, envío de recordatorios..." },
    paid: { text: "Pagado", description: "El cliente ha realizado el pago completo...", action: "Agradecimiento al cliente, actualización de registros." },
    overdue: { text: "Vencido", description: "La fecha de vencimiento ha pasado y el pago no se ha recibido.", action: "Inicio del proceso de cobranza..." },
    in_process: { text: "En Proceso", description: "El cliente ha informado que el pago está en trámite...", action: "Seguimiento para confirmar recepción." },
    partial_payment: { text: "Pago Parcial", description: "El cliente ha realizado un abono parcial.", action: "Contactar para acordar pago restante." },
    disputed: { text: "Disputado", description: "El cliente ha manifestado una inconformidad.", action: "Investigación interna y comunicación." },
    cancelled: { text: "Cancelado", description: "La factura ha sido anulada.", action: "Informar al cliente y actualizar registros." },
    uncollectible: { text: "Incobrable", description: "Se considera que la deuda no será recuperada.", action: "Proceder según políticas para dar de baja." }
};
let currentInvoiceItems = [];
let nextItemId = 0;
let loadedClients = [];
let isEditingClient = false;

// --- Funciones Auxiliares y de UI ---
const showLoading = (show) => { if (loadingOverlay) loadingOverlay.style.display = show ? 'flex' : 'none'; };
function setDefaultInvoiceDate() { if (invoiceDateInput) { const today = new Date(); invoiceDateInput.value = today.toISOString().split('T')[0]; } }

function updateQuantityBasedOnStreaming() {
    if (itemIsStreamingCheckbox && itemQuantityInput && streamingProfileFieldsDiv) {
        const isStreaming = itemIsStreamingCheckbox.checked;
        itemQuantityInput.disabled = isStreaming;
        if (isStreaming) {
            itemQuantityInput.value = 1;
            streamingProfileFieldsDiv.style.display = 'block';
        } else {
            streamingProfileFieldsDiv.style.display = 'none';
            if (itemProfileNameInput) itemProfileNameInput.value = '';
            if (itemProfilePinInput) itemProfilePinInput.value = '';
        }
    }
}

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
function formatInvoiceNumber(number) { return String(number).padStart(3, '0'); }

async function getCurrentLastInvoiceNumericValue(userId) {
    if (!userId) { console.warn("ID de usuario no proporcionado."); return 0; }
    const counterRef = doc(db, "user_counters", userId);
    try {
        const counterDoc = await getDoc(counterRef);
        return (counterDoc.exists() && counterDoc.data().lastInvoiceNumber !== undefined) ? counterDoc.data().lastInvoiceNumber : 0;
    } catch (error) { console.error("Error al leer último número de factura:", error); return 0; }
}

async function getNextInvoiceNumber(userId) {
    if (!userId) throw new Error("ID de usuario no proporcionado.");
    const counterRef = doc(db, "user_counters", userId);
    try {
        return await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            let lastNumber = 0;
            if (counterDoc.exists() && counterDoc.data().lastInvoiceNumber !== undefined) {
                lastNumber = counterDoc.data().lastInvoiceNumber;
            }
            const nextNumber = lastNumber + 1;
            transaction.set(counterRef, { lastInvoiceNumber: nextNumber }, { merge: true });
            return nextNumber;
        });
    } catch (error) { console.error("Error en transacción de número de factura:", error); throw error; }
}

async function displayNextPotentialInvoiceNumber() {
    const user = auth.currentUser;
    if (user && invoiceNumberText) {
        try {
            invoiceNumberText.textContent = "..."; 
            const lastNum = await getCurrentLastInvoiceNumericValue(user.uid);
            invoiceNumberText.textContent = formatInvoiceNumber(lastNum + 1);
        } catch (error) { invoiceNumberText.textContent = "Error"; }
    } else if (invoiceNumberText) {
        invoiceNumberText.textContent = "000";
    }
}

function renderItems() { /* ... (Tu función existente) ... */ }
function deleteItem(itemId) { /* ... (Tu función existente) ... */ }
function recalculateTotals() { /* ... (Tu función existente) ... */ }
function handleDiscountChange() { /* ... (Tu función existente) ... */ }

function handleClientSelection(clientId, clientNameDisplay, clientData = null) {
    if (selectedClientNameDisplay) {
        // Limpiar el display actual y luego reconstruir
        selectedClientNameDisplay.innerHTML = ''; 
        const nameSpan = document.createElement('span');
        nameSpan.classList.add('option-client-name');
        nameSpan.textContent = clientNameDisplay;
        selectedClientNameDisplay.appendChild(nameSpan);

        if (clientId && clientData) {
            const pillsContainer = document.createElement('span');
            pillsContainer.classList.add('pills-container');

            // Píldora 1: Estado General del Cliente
            let estadoGeneral = clientData.estadoGeneralCliente || "Activo";
            let claseCssEstadoGeneral = "status-client-default";
            if (estadoGeneral === "Nuevo") claseCssEstadoGeneral = "status-client-nuevo";
            else if (estadoGeneral === "Activo" || estadoGeneral === "Al día") claseCssEstadoGeneral = "status-client-al-dia";
            else if (estadoGeneral === "Con Pendientes") claseCssEstadoGeneral = "status-client-con-pendientes";
            else if (estadoGeneral === "Moroso") claseCssEstadoGeneral = "status-client-moroso";
            else if (estadoGeneral === "Inactivo") claseCssEstadoGeneral = "status-client-inactivo";
            
            const pill1 = document.createElement('span');
            pill1.classList.add('option-status-pill', claseCssEstadoGeneral);
            pill1.textContent = estadoGeneral;
            pillsContainer.appendChild(pill1);

            // Píldora 2: Estado de Última Factura (o estado relevante)
            let estadoFactura = clientData.estadoUltimaFacturaCliente || "N/A";
            let claseCssEstadoFactura = `invoice-status-${estadoFactura.toLowerCase().replace(/ /g, '_')}`;
            if (estadoFactura === "N/A") claseCssEstadoFactura = "invoice-status-na";

            let textoEstadoFactura = paymentStatusDetails[estadoFactura.toLowerCase().replace(/ /g, '_')]?.text || estadoFactura;

            const pill2 = document.createElement('span');
            pill2.classList.add('option-status-pill', claseCssEstadoFactura);
            pill2.textContent = textoEstadoFactura;
            pillsContainer.appendChild(pill2);
            
            selectedClientNameDisplay.appendChild(pillsContainer);
        }
    }

    if (hiddenSelectedClientIdInput) hiddenSelectedClientIdInput.value = clientId;
    if (customClientOptions) customClientOptions.style.display = 'none';
    if (customClientSelect) customClientSelect.classList.remove('open');
    isEditingClient = false; 

    if (editClientBtn) editClientBtn.disabled = (clientId === "");
    if (deleteClientBtn) deleteClientBtn.disabled = (clientId === "");

    if (clientNameInput && clientPhoneInput && clientEmailInput) {
        if (clientId === "") {
            clientNameInput.value = ''; clientPhoneInput.value = ''; clientEmailInput.value = '';
            clientNameInput.disabled = false; clientPhoneInput.disabled = false; clientEmailInput.disabled = false;
            if (clientNameInput) clientNameInput.focus();
        } else if (clientData) {
            clientNameInput.value = clientData.name || '';
            clientPhoneInput.value = clientData.phone || '';
            clientEmailInput.value = clientData.email || '';
            clientNameInput.disabled = true; clientPhoneInput.disabled = true; clientEmailInput.disabled = true;
        }
    }
}

async function loadClientsIntoDropdown() {
    if (!customClientOptions || !customClientSelectDisplay) { console.error("Elementos del desplegable personalizado no encontrados."); return; }
    const user = auth.currentUser;
    
    customClientOptions.innerHTML = ''; 
    handleClientSelection("", "-- Nuevo Cliente --"); // Llama para resetear el display y los campos

    if (!user) return;

    try {
        const q = query(collection(db, "clientes"), where("userId", "==", user.uid), where("isDeleted", "!=", true), orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            querySnapshot.forEach((docSnap) => {
                const client = docSnap.data();
                const clientOption = document.createElement('div');
                clientOption.classList.add('custom-option');
                clientOption.setAttribute('data-value', docSnap.id);

                let estadoGeneral = client.estadoGeneralCliente || "Activo";
                let claseCssEstadoGeneral = "status-client-default";
                if (estadoGeneral === "Nuevo") claseCssEstadoGeneral = "status-client-nuevo";
                else if (estadoGeneral === "Activo" || estadoGeneral === "Al día") claseCssEstadoGeneral = "status-client-al-dia";
                else if (estadoGeneral === "Con Pendientes") claseCssEstadoGeneral = "status-client-con-pendientes";
                else if (estadoGeneral === "Moroso") claseCssEstadoGeneral = "status-client-moroso";
                else if (estadoGeneral === "Inactivo") claseCssEstadoGeneral = "status-client-inactivo";

                let estadoFactura = client.estadoUltimaFacturaCliente || "N/A";
                let claseCssEstadoFactura = `invoice-status-${estadoFactura.toLowerCase().replace(/ /g, '_')}`;
                if (estadoFactura === "N/A") claseCssEstadoFactura = "invoice-status-na";
                
                let textoEstadoFactura = paymentStatusDetails[estadoFactura.toLowerCase().replace(/ /g, '_')]?.text || estadoFactura;


                clientOption.innerHTML = `
                    <span class="option-client-name">${client.name}</span>
                    <span class="pills-container">
                        <span class="option-status-pill ${claseCssEstadoGeneral}">${estadoGeneral}</span>
                        <span class="option-status-pill ${claseCssEstadoFactura}">${textoEstadoFactura}</span>
                    </span>
                `;
                clientOption.addEventListener('click', () => handleClientSelection(docSnap.id, client.name, client));
                customClientOptions.appendChild(clientOption);
                loadedClients.push({ id: docSnap.id, ...client });
            });
        }
    } catch (error) {
        console.error("Error al cargar clientes:", error);
        customClientOptions.insertAdjacentHTML('beforeend', '<div class="custom-option-error">Error al cargar clientes</div>');
    }
}

async function softDeleteClient(clientId) { /* ... (Tu función existente) ... */ }

async function handleNavigation(sectionToShowId) { /* ... (Tu función existente con la llamada a loadClientsIntoDropdown) ... */ }
async function loadAndDisplayInvoices() { /* ... (Tu función existente) ... */ }

// --- Lógica de Autenticación y Estado ---
if (loginButton) { /* ... */ }
if (logoutButton) { /* ... */ }
onAuthStateChanged(auth, (user) => { /* ... */ });

// --- Event Listeners para la Interfaz de Facturación ---
/* ... (Tus listeners existentes para navCreateInvoice, etc.) ... */
if (itemIsStreamingCheckbox) itemIsStreamingCheckbox.addEventListener('change', updateQuantityBasedOnStreaming);
if (paymentStatusSelect) paymentStatusSelect.addEventListener('change', updatePaymentStatusDisplay);

if (customClientSelect) {
    customClientSelect.addEventListener('click', (event) => {
        event.stopPropagation();
        if (customClientOptions) {
            const isOpen = customClientOptions.style.display === 'block';
            customClientOptions.style.display = isOpen ? 'none' : 'block';
            if (customClientSelect) customClientSelect.classList.toggle('open', !isOpen);
        }
    });
}
document.addEventListener('click', (event) => {
    if (customClientSelect && !customClientSelect.contains(event.target) && customClientOptions) {
        customClientOptions.style.display = 'none';
        if (customClientSelect) customClientSelect.classList.remove('open');
    }
});

if (editClientBtn) { /* ... (Tu listener existente) ... */ }
if (deleteClientBtn) { /* ... (Tu listener existente) ... */ }
if (discountTypeSelect) discountTypeSelect.addEventListener('change', handleDiscountChange);
if (discountValueInput) discountValueInput.addEventListener('input', () => { if (typeof recalculateTotals === 'function') recalculateTotals(); });
if (addItemBtn) { /* ... (Tu listener existente con lógica de perfil) ... */ }
if (invoiceForm) { /* ... (Tu listener existente con lógica de editar cliente y guardar cliente nuevo) ... */ }
if (generateInvoiceFileBtn) { /* ... */ }
