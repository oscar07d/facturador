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
    pending: { text: "Pendiente", description: "La factura ha sido emitida y enviada al cliente, pero aún no se ha recibido el pago. El plazo de vencimiento todavía no ha llegado.", action: "Monitoreo regular, envío de recordatorios amigables antes de la fecha de vencimiento." },
    paid: { text: "Pagado", description: "El cliente ha realizado el pago completo de la factura y este ha sido confirmado.", action: "Agradecimiento al cliente, actualización de registros." },
    overdue: { text: "Vencido", description: "La fecha de vencimiento de la factura ha pasado y el pago no se ha recibido.", action: "Inicio del proceso de cobranza." },
    in_process: { text: "En Proceso", description: "El cliente ha informado que ha realizado el pago, o el pago está siendo procesado por el banco o la pasarela de pagos.", action: "Seguimiento para confirmar la recepción efectiva del pago." },
    partial_payment: { text: "Pago Parcial", description: "El cliente ha realizado un abono, pero no ha cubierto el total de la factura.", action: "Contactar al cliente para aclarar la situación y acordar el pago del saldo restante." },
    disputed: { text: "Disputado", description: "El cliente ha manifestado una inconformidad con la factura o el servicio.", action: "Investigación interna de la disputa, comunicación con el cliente." },
    cancelled: { text: "Cancelado", description: "La factura ha sido anulada, ya sea por un error, por la cancelación del servicio/producto, o por un acuerdo con el cliente.", action: "Asegurarse de que el cliente esté informado y que los registros contables reflejen la anulación." },
    uncollectible: { text: "Incobrable", description: "Después de múltiples intentos de cobro, se considera que la deuda no será recuperada.", action: "Se procede según las políticas de la empresa para dar de baja la cuenta por cobrar." },
    nuevo: { text: "Nuevo", description: "Cliente recién registrado, sin historial de facturación.", action: "Crear primera factura." }, // Para estadoGeneralCliente
    activo: { text: "Activo", description: "Cliente con actividad reciente y al día.", action: "Continuar seguimiento normal." }, // Para estadoGeneralCliente
    'al día': { text: "Al Día", description: "Cliente con pagos al día.", action: "Excelente." }, // Para estadoGeneralCliente
    'con pendientes': { text: "Con Pendientes", description: "Cliente tiene facturas pendientes de pago.", action: "Revisar y enviar recordatorios." }, // Para estadoGeneralCliente
    moroso: { text: "Moroso", description: "Cliente tiene facturas vencidas.", action: "Iniciar proceso de cobranza." }, // Para estadoGeneralCliente
    inactivo: { text: "Inactivo", description: "Cliente marcado como inactivo o eliminado.", action: "Archivar o revisar." }, // Para estadoGeneralCliente
    'n/a': { text: "N/A", description: "No aplica o sin información.", action: "Verificar datos."} // Para estadoUltimaFacturaCliente
};
let currentInvoiceItems = [];
let nextItemId = 0;
let loadedClients = [];
let isEditingClient = false;

// --- Funciones Auxiliares y de UI ---
const showLoading = (show) => {
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
};

function setDefaultInvoiceDate() {
    if (invoiceDateInput) {
        const today = new Date();
        invoiceDateInput.value = today.toISOString().split('T')[0];
    }
}

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

function formatInvoiceNumber(number) {
    return String(number).padStart(3, '0');
}

async function getCurrentLastInvoiceNumericValue(userId) {
    if (!userId) {
        console.warn("ID de usuario no proporcionado para obtener el último número de factura.");
        return 0; 
    }
    const counterRef = doc(db, "user_counters", userId);
    try {
        const counterDoc = await getDoc(counterRef);
        if (counterDoc.exists() && counterDoc.data().lastInvoiceNumber !== undefined) {
            return counterDoc.data().lastInvoiceNumber;
        } else {
            return 0; 
        }
    } catch (error) {
        console.error("Error al leer el último número de factura:", error);
        return 0; 
    }
}

async function getNextInvoiceNumber(userId) {
    if (!userId) {
        throw new Error("ID de usuario no proporcionado para obtener el siguiente número de factura.");
    }
    const counterRef = doc(db, "user_counters", userId);
    try {
        const newInvoiceNumber = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            let lastNumber = 0;
            if (counterDoc.exists() && counterDoc.data().lastInvoiceNumber !== undefined) {
                lastNumber = counterDoc.data().lastInvoiceNumber;
            }
            const nextNumber = lastNumber + 1;
            transaction.set(counterRef, { lastInvoiceNumber: nextNumber }, { merge: true });
            return nextNumber;
        });
        return newInvoiceNumber;
    } catch (error) {
        console.error("Error en transacción para obtener el siguiente número de factura:", error);
        throw error;
    }
}

async function displayNextPotentialInvoiceNumber() {
    const user = auth.currentUser;
    if (user && invoiceNumberText) {
        try {
            invoiceNumberText.textContent = "..."; 
            const lastNum = await getCurrentLastInvoiceNumericValue(user.uid);
            const potentialNextNum = lastNum + 1;
            invoiceNumberText.textContent = formatInvoiceNumber(potentialNextNum);
        } catch (error) {
            console.error("No se pudo cargar el número de factura potencial:", error);
            invoiceNumberText.textContent = "Error";
        }
    } else if (invoiceNumberText) {
        invoiceNumberText.textContent = "000"; 
    }
}

function renderItems() {
    if (!invoiceItemsContainer) { return; }
    invoiceItemsContainer.innerHTML = '';
    if (currentInvoiceItems.length === 0) {
        invoiceItemsContainer.innerHTML = '<div class="invoice-item-placeholder">Aún no has agregado ítems.</div>';
    } else {
        currentInvoiceItems.forEach(item => {
            const itemSubtotal = item.quantity * item.price;
            let profileDetailsHTML = '';
            if (item.isStreaming && item.profileName) {
                profileDetailsHTML = `<p class="item-profile-details">Perfil: ${item.profileName} ${item.profilePin ? `(PIN: ${item.profilePin})` : ''}</p>`;
            }
            const itemElement = document.createElement('div');
            itemElement.classList.add('invoice-item');
            itemElement.setAttribute('data-item-id', item.id);
            itemElement.innerHTML = `
                <div class="item-details">
                    <p class="item-description-display"><strong>${item.description}</strong></p>
                    ${profileDetailsHTML}
                    <p class="item-meta">Cantidad: ${item.quantity} x Precio: ${item.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</p>
                </div>
                <div class="item-actions">
                    <p class="item-subtotal-display">${itemSubtotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</p>
                    <button type="button" class="btn btn-danger btn-sm delete-item-btn">Eliminar</button>
                </div>
            `;
            itemElement.querySelector('.delete-item-btn').addEventListener('click', () => deleteItem(item.id));
            invoiceItemsContainer.appendChild(itemElement);
        });
    }
    if (typeof recalculateTotals === 'function') {
        recalculateTotals();
    }
}

function deleteItem(itemId) {
    currentInvoiceItems = currentInvoiceItems.filter(item => item.id !== itemId);
    renderItems(); 
}

function recalculateTotals() {
    let subtotal = 0;
    let totalIVA = 0;
    currentInvoiceItems.forEach(item => {
        const itemTotal = item.quantity * item.price;
        subtotal += itemTotal;
        if (item.applyIVA) {
            totalIVA += itemTotal * 0.19;
        }
    });

    let discountAmount = 0;
    const selectedDiscountType = discountTypeSelect ? discountTypeSelect.value : 'none';
    let discountValue = discountValueInput ? parseFloat(discountValueInput.value) : 0;
    if (isNaN(discountValue)) {
        discountValue = 0;
    }

    if (selectedDiscountType === 'percentage' && discountValue > 0) {
        discountAmount = subtotal * (discountValue / 100);
    } else if (selectedDiscountType === 'fixed' && discountValue > 0) {
        discountAmount = discountValue;
    }
    
    if (discountAmount > subtotal) {
        discountAmount = subtotal;
    }
    if (discountAmount < 0) { 
        discountAmount = 0;
    }

    const taxableBaseAmount = subtotal - discountAmount;
    const grandTotal = taxableBaseAmount + totalIVA;

    const formatCOP = (value) => value.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
    if (subtotalAmountSpan) subtotalAmountSpan.textContent = formatCOP(subtotal);
    if (discountAmountAppliedSpan) discountAmountAppliedSpan.textContent = formatCOP(discountAmount);
    if (taxableBaseAmountSpan) taxableBaseAmountSpan.textContent = formatCOP(taxableBaseAmount);
    if (ivaAmountSpan) ivaAmountSpan.textContent = formatCOP(totalIVA);
    if (totalAmountSpan) totalAmountSpan.textContent = formatCOP(grandTotal);
}

function handleDiscountChange() {
    if (discountTypeSelect && discountValueInput) {
        discountValueInput.disabled = (discountTypeSelect.value === 'none');
        if (discountTypeSelect.value === 'none') {
            discountValueInput.value = '';
        }
    }
    if (typeof recalculateTotals === 'function') {
        recalculateTotals();
    }
}

function handleClientSelection(clientId, clientNameText, clientData = null) {
    if (selectedClientNameDisplay) {
        selectedClientNameDisplay.innerHTML = ''; 
        const nameSpan = document.createElement('span');
        nameSpan.classList.add('option-client-name');
        nameSpan.textContent = clientNameText;
        selectedClientNameDisplay.appendChild(nameSpan);

        if (clientId && clientData) { 
            const pillsContainer = document.createElement('span');
            pillsContainer.classList.add('pills-container');
            
            // Píldora de Estado de Última Factura (usa los mismos estados/textos que en "Mis Facturas")
            let estadoFactura = clientData.estadoUltimaFacturaCliente || "N/A"; // Viene del documento del cliente
            let claseCssEstadoFactura = `invoice-status-${estadoFactura.toLowerCase().replace(/ /g, '_')}`;
            if (estadoFactura === "N/A") claseCssEstadoFactura = "invoice-status-na"; // Clase CSS específica para N/A
            
            // Obtener el texto corto del estado de la factura desde paymentStatusDetails
            let textoPildoraFactura = paymentStatusDetails[estadoFactura.toLowerCase().replace(/ /g, '_')]?.text || estadoFactura;
            if (estadoFactura === "N/A" && !paymentStatusDetails[estadoFactura.toLowerCase().replace(/ /g, '_')]) {
                textoPildoraFactura = "N/A";
            }

            const pillFactura = document.createElement('span');
            pillFactura.classList.add('option-status-pill', claseCssEstadoFactura);
            pillFactura.textContent = textoPildoraFactura;
            pillsContainer.appendChild(pillFactura);
            
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
    if (!customClientOptions || !customClientSelectDisplay) { 
        console.error("Elementos del desplegable personalizado no encontrados en loadClientsIntoDropdown."); 
        return; 
    }
    const user = auth.currentUser;
    
    customClientOptions.innerHTML = ''; 
    handleClientSelection("", "-- Nuevo Cliente --"); 

    if (!user) {
        console.log("loadClientsIntoDropdown: No hay usuario.");
        return;
    }

    try {
        const q = query(
            collection(db, "clientes"), 
            where("userId", "==", user.uid), 
            where("isDeleted", "!=", true), 
            orderBy("name", "asc")
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            querySnapshot.forEach((docSnap) => {
                const client = docSnap.data();
                const clientOption = document.createElement('div');
                clientOption.classList.add('custom-option');
                clientOption.setAttribute('data-value', docSnap.id);

                let clientDisplayName = client.name;
                // No se añade email/teléfono al display de la opción para no hacerlo muy largo con la píldora.

                // Píldora de Estado de Última Factura (o estado relevante del cliente)
                let estadoFacturaCliente = client.estadoUltimaFacturaCliente || "N/A"; // Este campo debe existir en tus documentos de cliente
                let claseCssEstadoFactura = `invoice-status-${estadoFacturaCliente.toLowerCase().replace(/ /g, '_')}`;
                if (estadoFacturaCliente === "N/A") claseCssEstadoFactura = "invoice-status-na";

                // Usar el texto corto definido en paymentStatusDetails para la píldora
                let textoPildora = paymentStatusDetails[estadoFacturaCliente.toLowerCase().replace(/ /g, '_')]?.text || estadoFacturaCliente;
                if (estadoFacturaCliente === "N/A" && !paymentStatusDetails[estadoFacturaCliente.toLowerCase().replace(/ /g, '_')]) {
                    textoPildora = "N/A";
                }
                
                clientOption.innerHTML = `
                    <span class="option-client-name">${clientDisplayName}</span>
                    <span class="pills-container"> {/* Contenedor para UNA píldora */}
                        <span class="option-status-pill ${claseCssEstadoFactura}">${textoPildora}</span>
                    </span>
                `;
                clientOption.addEventListener('click', () => handleClientSelection(docSnap.id, client.name, client));
                customClientOptions.appendChild(clientOption);
                loadedClients.push({ id: docSnap.id, ...client });
            });
        }
    } catch (error) {
        console.error("Error al cargar clientes para el desplegable:", error);
        customClientOptions.insertAdjacentHTML('beforeend', '<div class="custom-option-error">Error al cargar clientes</div>');
    }
}

async function softDeleteClient(clientId) {
    const user = auth.currentUser;
    if (!user || !clientId) { 
        alert("Acción no permitida."); 
        return false; 
    }
    const clientRef = doc(db, "clientes", clientId);
    try {
        await updateDoc(clientRef, { 
            isDeleted: true, 
            deletedAt: serverTimestamp(),
            // Opcional: Cambiar estado general al eliminar
            // estadoGeneralCliente: "Inactivo" 
        });
        alert("Cliente marcado como inactivo.");
        return true;
    } catch (error) { 
        console.error("Error al eliminar cliente:", error); 
        alert("Error al eliminar."); 
        return false; 
    }
}

async function handleNavigation(sectionToShowId) {
    // ... (Código de handleNavigation existente, asegurándose de que llame a loadClientsIntoDropdown) ...
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
        if (clientsSection && clientsSection.innerHTML.trim() === '') {
            clientsSection.innerHTML = `<h2>Clientes</h2><p>Funcionalidad en desarrollo.</p><div id="clientListContainer"></div>`;
        }
    }
    if (appPageTitle) appPageTitle.textContent = targetTitle;
}

async function loadAndDisplayInvoices() {
    // ... (Código de loadAndDisplayInvoices existente) ...
    const currentInvoiceListContainer = document.getElementById('invoiceListContainer');
    if (!currentInvoiceListContainer) {
        if(viewInvoicesSection) viewInvoicesSection.innerHTML = `<h2>Mis Facturas</h2><p>Error: Contenedor no encontrado.</p>`;
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
                let statusClassName = invoice.paymentStatus || 'pending';
                let statusText = paymentStatusDetails[statusClassName]?.text || statusClassName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                itemElement.innerHTML = `
                    <div class="invoice-list-header">
                        <span class="invoice-list-number">${invoice.invoiceNumberFormatted || 'N/A'}</span>
                        <span class="status-badge status-${statusClassName.toLowerCase()}">${statusText}</span>
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
                itemElement.querySelector('.view-details-btn').addEventListener('click', () => {
                    alert(`"Ver Detalles" para factura ${invoice.invoiceNumberFormatted} (ID: ${invoiceId}) pendiente.`);
                });
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
        showLoading(true);
        signInWithPopup(auth, googleProvider)
            .then((result) => { /* onAuthStateChanged lo maneja */ })
            .catch((error) => {
                console.error("Error en login:", error);
                let msg = "Error al iniciar sesión.";
                if (error.code === 'auth/popup-closed-by-user') msg = "Ventana de login cerrada.";
                alert(msg);
            })
            .finally(() => { 
                if (!auth.currentUser && loadingOverlay.style.display !== 'none') {
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
    showLoading(false); 
    if (user) {
        if (loginContainer) loginContainer.style.display = 'none';
        if (mainContent) mainContent.style.display = 'flex'; 
        handleNavigation('createInvoiceSection');
    } else {
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

            // Si es un cliente nuevo, guardarlo y asignarle estados por defecto
            if (hiddenSelectedClientIdInput && hiddenSelectedClientIdInput.value === "") {
                const newClientData = { 
                    userId: user.uid, name: clientName, phone: clientPhone, email: clientEmail, 
                    createdAt: serverTimestamp(), 
                    isDeleted: false, 
                    estadoGeneralCliente: "Nuevo", 
                    estadoUltimaFacturaCliente: invoiceToSave.paymentStatus // Usar el estado de esta primera factura
                };
                try {
                    await addDoc(collection(db, "clientes"), newClientData);
                } catch (clientError) { console.error("Error al guardar nuevo cliente:", clientError); }
            } else if (selectedClientId) { 
                // Si es un cliente existente, ACTUALIZAR su estadoUltimaFacturaCliente
                const clientRef = doc(db, "clientes", selectedClientId);
                try {
                    await updateDoc(clientRef, {
                        estadoUltimaFacturaCliente: invoiceToSave.paymentStatus,
                        // Aquí también podríamos actualizar 'estadoGeneralCliente' basado en una lógica más compleja
                        // Por ahora, solo actualizamos el de la última factura.
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
            console.log("Proceso de guardado finalizado, pantalla de carga oculta.");
        }
    });
}

if (generateInvoiceFileBtn) { 
    generateInvoiceFileBtn.addEventListener('click', () => {
        alert("Funcionalidad 'Generar Factura (Archivo)' pendiente.");
    });
}
