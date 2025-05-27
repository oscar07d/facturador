// Importaciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
    getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { 
    getFirestore, collection, addDoc, serverTimestamp,
    doc, getDoc, setDoc, runTransaction,
    query, where, getDocs, orderBy,
    updateDoc // Asegúrate que esta importación esté presente
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
const selectClient = document.getElementById('selectClient');
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
const paymentStatusDetails = { /* ... (Objeto paymentStatusDetails completo que ya tienes) ... */ 
    pending: { description: "La factura ha sido emitida y enviada al cliente, pero aún no se ha recibido el pago...", action: "Monitoreo regular, envío de recordatorios..." },
    paid: { description: "El cliente ha realizado el pago completo...", action: "Agradecimiento al cliente, actualización de registros." },
    overdue: { description: "La fecha de vencimiento ha pasado y el pago no se ha recibido.", action: "Inicio del proceso de cobranza..." },
    in_process: { description: "El cliente ha informado que el pago está en trámite...", action: "Seguimiento para confirmar recepción." },
    partial_payment: { description: "El cliente ha realizado un abono parcial.", action: "Contactar para acordar pago restante." },
    disputed: { description: "El cliente ha manifestado una inconformidad.", action: "Investigación interna y comunicación." },
    cancelled: { description: "La factura ha sido anulada.", action: "Informar al cliente y actualizar registros." },
    uncollectible: { description: "Se considera que la deuda no será recuperada.", action: "Proceder según políticas para dar de baja." }
};
let currentInvoiceItems = [];
let nextItemId = 0;
let loadedClients = [];
let isEditingClient = false; // Flag para saber si estamos editando un cliente seleccionado

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

function updatePaymentStatusDisplay() { /* ... (Tu función existente sin cambios) ... */ 
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

async function getCurrentLastInvoiceNumericValue(userId) { /* ... (Tu función existente sin cambios) ... */ 
    if (!userId) { console.warn("ID de usuario no proporcionado para obtener último número."); return 0; }
    const counterRef = doc(db, "user_counters", userId);
    try {
        const counterDoc = await getDoc(counterRef);
        return (counterDoc.exists() && counterDoc.data().lastInvoiceNumber !== undefined) ? counterDoc.data().lastInvoiceNumber : 0;
    } catch (error) { console.error("Error al leer último número de factura:", error); return 0; }
}

async function getNextInvoiceNumber(userId) { /* ... (Tu función existente sin cambios) ... */
    if (!userId) throw new Error("ID de usuario no proporcionado para obtener siguiente número.");
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

async function displayNextPotentialInvoiceNumber() { /* ... (Tu función existente sin cambios) ... */ 
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

function renderItems() { /* ... (Tu función existente con la llamada a recalculateTotals al final) ... */ 
    if (!invoiceItemsContainer) return;
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
    if (typeof recalculateTotals === 'function') recalculateTotals();
}

function deleteItem(itemId) { currentInvoiceItems = currentInvoiceItems.filter(item => item.id !== itemId); renderItems(); }

function recalculateTotals() { /* ... (Tu función existente sin cambios) ... */ 
    let subtotal = 0;
    let totalIVA = 0;
    currentInvoiceItems.forEach(item => {
        const itemTotal = item.quantity * item.price;
        subtotal += itemTotal;
        if (item.applyIVA) totalIVA += itemTotal * 0.19;
    });

    let discountAmount = 0;
    const selectedDiscountType = discountTypeSelect ? discountTypeSelect.value : 'none';
    let discountValue = discountValueInput ? parseFloat(discountValueInput.value) : 0;
    if (isNaN(discountValue)) discountValue = 0;

    if (selectedDiscountType === 'percentage' && discountValue > 0) discountAmount = subtotal * (discountValue / 100);
    else if (selectedDiscountType === 'fixed' && discountValue > 0) discountAmount = discountValue;
    if (discountAmount > subtotal) discountAmount = subtotal;
    if (discountAmount < 0) discountAmount = 0;

    const taxableBaseAmount = subtotal - discountAmount;
    const grandTotal = taxableBaseAmount + totalIVA;

    const formatCOP = (value) => value.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
    if (subtotalAmountSpan) subtotalAmountSpan.textContent = formatCOP(subtotal);
    if (discountAmountAppliedSpan) discountAmountAppliedSpan.textContent = formatCOP(discountAmount);
    if (taxableBaseAmountSpan) taxableBaseAmountSpan.textContent = formatCOP(taxableBaseAmount);
    if (ivaAmountSpan) ivaAmountSpan.textContent = formatCOP(totalIVA);
    if (totalAmountSpan) totalAmountSpan.textContent = formatCOP(grandTotal);
}

function handleDiscountChange() { /* ... (Tu función existente sin cambios) ... */ 
    if (discountTypeSelect && discountValueInput) {
        discountValueInput.disabled = (discountTypeSelect.value === 'none');
        if (discountTypeSelect.value === 'none') discountValueInput.value = '';
    }
    if (typeof recalculateTotals === 'function') recalculateTotals();
}

async function loadClientsIntoDropdown() { /* ... (Tu función existente con el filtro isDeleted != true) ... */ 
    if (!selectClient) return;
    const user = auth.currentUser;
    if (!user) {
        selectClient.innerHTML = '<option value="">-- Nuevo Cliente --</option>';
        loadedClients = [];
        return;
    }
    try {
        const q = query(collection(db, "clientes"), where("userId", "==", user.uid), where("isDeleted", "!=", true), orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);
        selectClient.innerHTML = '<option value="">-- Nuevo Cliente --</option>';
        loadedClients = [];
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const client = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = client.name;
                selectClient.appendChild(option);
                loadedClients.push({ id: doc.id, ...client });
            });
        }
    } catch (error) {
        console.error("Error al cargar clientes:", error);
        selectClient.innerHTML = '<option value="">-- Nuevo Cliente --</option><option value="" disabled>Error al cargar</option>';
        loadedClients = [];
    }
}

async function softDeleteClient(clientId) { // NUEVA FUNCIÓN
    const user = auth.currentUser;
    if (!user || !clientId) {
        alert("Acción no permitida o cliente no seleccionado.");
        return false;
    }
    const clientRef = doc(db, "clientes", clientId);
    try {
        await updateDoc(clientRef, { isDeleted: true, deletedAt: serverTimestamp() });
        alert("Cliente marcado como inactivo.");
        return true;
    } catch (error) {
        console.error("Error al marcar cliente como eliminado:", error);
        alert("Error al eliminar el cliente.");
        return false;
    }
}

async function handleNavigation(sectionToShowId) { /* ... (Tu función existente, pero asegúrate de llamar a loadClientsIntoDropdown en createInvoiceSection) ... */ 
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
        if (typeof loadClientsIntoDropdown === 'function') await loadClientsIntoDropdown(); // Asegúrate que esta llamada esté aquí
    } else if (sectionToShowId === 'viewInvoicesSection') {
        targetTitle = "Mis Facturas";
        const currentInvoiceListContainer = document.getElementById('invoiceListContainer');
        if (viewInvoicesSection && !currentInvoiceListContainer) {
            viewInvoicesSection.innerHTML = `<h2>Mis Facturas</h2><div id="invoiceListContainer"></div>`;
        }
        if (typeof loadAndDisplayInvoices === 'function') {
            await loadAndDisplayInvoices();
        }
    } else if (sectionToShowId === 'clientsSection') {
        targetTitle = "Clientes";
        if (clientsSection && clientsSection.innerHTML.trim() === '') {
            clientsSection.innerHTML = `<h2>Clientes</h2><p>Funcionalidad en desarrollo.</p><div id="clientListContainer"></div>`;
        }
    }
    if (appPageTitle) appPageTitle.textContent = targetTitle;
}

async function loadAndDisplayInvoices() { /* ... (Tu función existente con la corrección para currentInvoiceListContainer) ... */ 
    const currentInvoiceListContainer = document.getElementById('invoiceListContainer'); 
    if (!currentInvoiceListContainer) {
        console.error("Contenedor #invoiceListContainer no existe al llamar a loadAndDisplayInvoices.");
        if (viewInvoicesSection) viewInvoicesSection.innerHTML = `<h2>Mis Facturas</h2><p>Error: Contenedor de lista no encontrado.</p>`;
        return; 
    }
    
    const user = auth.currentUser;
    if (!user) {
        currentInvoiceListContainer.innerHTML = '<p>Debes iniciar sesión para ver tus facturas.</p>';
        return;
    }

    currentInvoiceListContainer.innerHTML = '<p>Cargando facturas...</p>';

    try {
        const q = query(collection(db, "facturas"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        currentInvoiceListContainer.innerHTML = '';

        if (querySnapshot.empty) {
            currentInvoiceListContainer.innerHTML = '<p>No tienes facturas guardadas todavía.</p>';
        } else {
            querySnapshot.forEach((doc) => {
                const invoice = doc.data();
                const invoiceId = doc.id;
                const itemElement = document.createElement('div');
                itemElement.classList.add('invoice-list-item');
                itemElement.setAttribute('data-invoice-id', invoiceId);
                let statusClassName = invoice.paymentStatus || 'pending';
                let statusText = paymentStatusDetails[statusClassName] ? paymentStatusDetails[statusClassName].description.split('.')[0] : statusClassName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                itemElement.innerHTML = `
                    <div class="invoice-list-header">
                        <span class="invoice-list-number">${invoice.invoiceNumberFormatted || 'N/A'}</span>
                        <span class="status-badge status-${statusClassName.toLowerCase()}">${statusText}</span>
                    </div>
                    <div class="invoice-list-client">${invoice.client?.name || 'Cliente no especificado'}</div>
                    <div class="invoice-list-details">
                        <span class="invoice-list-date">Fecha: ${invoice.invoiceDate || 'N/A'}</span>
                        <span class="invoice-list-total">${(invoice.totals?.grandTotal || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                    </div>
                    <div class="invoice-list-actions">
                        <button type="button" class="btn btn-sm btn-info view-details-btn">Ver Detalles</button>
                    </div>
                `;
                itemElement.querySelector('.view-details-btn').addEventListener('click', () => {
                    alert(`Funcionalidad "Ver Detalles" para factura ${invoice.invoiceNumberFormatted} (ID: ${invoiceId}) pendiente.`);
                });
                currentInvoiceListContainer.appendChild(itemElement);
            });
        }
    } catch (error) {
        console.error("Error al cargar las facturas: ", error);
        currentInvoiceListContainer.innerHTML = '<p>Error al cargar las facturas. Intenta de nuevo.</p>';
    }
}


// --- Lógica de Autenticación y Estado ---
if (loginButton) { /* ... (Tu listener de loginButton existente) ... */ 
    loginButton.addEventListener('click', () => {
        showLoading(true);
        signInWithPopup(auth, googleProvider)
            .then((result) => console.log("Usuario autenticado:", result.user.displayName))
            .catch((error) => {
                console.error("Error en login:", error);
                let msg = "Error al iniciar sesión.";
                if (error.code === 'auth/popup-closed-by-user') msg = "Ventana de login cerrada.";
                else if (error.code === 'auth/cancelled-popup-request') msg = "Solicitud de inicio de sesión cancelada.";
                alert(msg);
            })
            .finally(() => { if (!auth.currentUser) showLoading(false); });
    });
}
if (logoutButton) { /* ... (Tu listener de logoutButton existente) ... */ 
    logoutButton.addEventListener('click', () => {
        showLoading(true);
        signOut(auth).catch((error) => console.error("Error al cerrar sesión:", error));
    });
}
onAuthStateChanged(auth, (user) => { /* ... (Tu onAuthStateChanged existente y corregido) ... */ 
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

if (selectClient) {
    selectClient.addEventListener('change', () => {
        const selectedClientId = selectClient.value;
        isEditingClient = false; // Resetear flag de edición al cambiar de cliente

        if (editClientBtn) editClientBtn.disabled = (selectedClientId === "");
        if (deleteClientBtn) deleteClientBtn.disabled = (selectedClientId === "");

        if (clientNameInput && clientPhoneInput && clientEmailInput) {
            if (selectedClientId === "") {
                clientNameInput.value = ''; clientPhoneInput.value = ''; clientEmailInput.value = '';
                clientNameInput.disabled = false; clientPhoneInput.disabled = false; clientEmailInput.disabled = false;
                clientNameInput.focus();
            } else {
                const selectedClient = loadedClients.find(client => client.id === selectedClientId);
                if (selectedClient) {
                    clientNameInput.value = selectedClient.name || '';
                    clientPhoneInput.value = selectedClient.phone || '';
                    clientEmailInput.value = selectedClient.email || '';
                    clientNameInput.disabled = true; clientPhoneInput.disabled = true; clientEmailInput.disabled = true;
                }
            }
        }
    });
}

if (editClientBtn) { // Listener para Editar Cliente
    editClientBtn.addEventListener('click', () => {
        if (selectClient.value === "") return;
        clientNameInput.disabled = false; clientPhoneInput.disabled = false; clientEmailInput.disabled = false;
        clientNameInput.focus();
        isEditingClient = true; // Activar flag de edición
        alert("Ahora puedes editar los datos del cliente. Los cambios se guardarán al guardar la factura.");
    });
}

if (deleteClientBtn) { // Listener para Eliminar Cliente
    deleteClientBtn.addEventListener('click', async () => {
        const selectedClientId = selectClient.value;
        if (selectedClientId === "") { alert("Selecciona un cliente para eliminar."); return; }

        const clientToDelete = loadedClients.find(c => c.id === selectedClientId);
        if (confirm(`¿Seguro que deseas marcar como inactivo a "${clientToDelete?.name || 'este cliente'}"?`)) {
            showLoading(true);
            const success = await softDeleteClient(selectedClientId);
            showLoading(false);
            if (success) {
                clientNameInput.value = ''; clientPhoneInput.value = ''; clientEmailInput.value = '';
                clientNameInput.disabled = false; clientPhoneInput.disabled = false; clientEmailInput.disabled = false;
                await loadClientsIntoDropdown();
                if (selectClient) selectClient.value = "";
                if (editClientBtn) editClientBtn.disabled = true;
                if (deleteClientBtn) deleteClientBtn.disabled = true;
            }
        }
    });
}

if (discountTypeSelect) discountTypeSelect.addEventListener('change', handleDiscountChange);
if (discountValueInput) discountValueInput.addEventListener('input', () => { if (typeof recalculateTotals === 'function') recalculateTotals(); });

if (addItemBtn) { /* ... (Tu listener de addItemBtn existente, con la lógica de profileName/Pin) ... */
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
            if (!profileName) { alert("Ingresa el Nombre del Perfil."); if (itemProfileNameInput) itemProfileNameInput.focus(); return; }
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
        
        const selectedClientId = selectClient.value;
        if (selectedClientId && isEditingClient) { // Si se seleccionó un cliente y se estaba editando
            const clientRef = doc(db, "clientes", selectedClientId);
            const clientUpdates = { name: clientName, phone: clientPhone, email: clientEmail, updatedAt: serverTimestamp() };
            try {
                await updateDoc(clientRef, clientUpdates);
                console.log("Cliente actualizado:", selectedClientId);
                // Actualizar en loadedClients para reflejar en el UI si se vuelve a seleccionar
                const clientIndex = loadedClients.findIndex(c => c.id === selectedClientId);
                if (clientIndex > -1) {
                    loadedClients[clientIndex] = { ...loadedClients[clientIndex], ...clientUpdates, name: clientName, phone: clientPhone, email: clientEmail }; // Asegurar que los datos se actualicen en el array local
                }
                isEditingClient = false; // Resetear flag
                if (clientNameInput) clientNameInput.disabled = true; // Volver a deshabilitar después de guardar
                if (clientPhoneInput) clientPhoneInput.disabled = true;
                if (clientEmailInput) clientEmailInput.disabled = true;
            } catch (error) {
                console.error("Error al actualizar cliente:", error);
                alert("Hubo un error al actualizar los datos del cliente. La factura se guardará con los datos del cliente que estaban antes de la edición.");
                // Recargar los datos originales del cliente en los campos
                const originalClient = loadedClients.find(client => client.id === selectedClientId);
                if (originalClient) {
                    clientNameInput.value = originalClient.name; clientPhoneInput.value = originalClient.phone; clientEmailInput.value = originalClient.email;
                    clientName = originalClient.name; clientPhone = originalClient.phone; clientEmail = originalClient.email; // Reasignar para el objeto invoiceToSave
                }
            }
        }
        
        if (typeof recalculateTotals === 'function') recalculateTotals();

        let actualNumericInvoiceNumber;
        let formattedInvoiceNumberStr;
        try {
            if (saveInvoiceBtn) saveInvoiceBtn.disabled = true;
            if (generateInvoiceFileBtn) generateInvoiceFileBtn.disabled = true;
            showLoading(true);
            actualNumericInvoiceNumber = await getNextInvoiceNumber(user.uid);
            formattedInvoiceNumberStr = formatInvoiceNumber(actualNumericInvoiceNumber);
        } catch (error) { /* ... (manejo de error) ... */ return; }

        const invoiceToSave = { /* ... (Objeto invoiceToSave como lo tenías, asegurándote de que use clientName, clientPhone, clientEmail actualizados) ... */ 
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
            client: { name: clientName, phone: clientPhone, email: clientEmail }, // Usar las variables actualizadas
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
            alert(`¡Factura FCT-${formattedInvoiceNumberStr} guardada exitosamente! ID: ${docRef.id}`);

            if (selectClient && selectClient.value === "") { // Si era un "Nuevo Cliente" que ahora se guardó
                try {
                    const newClientData = { userId: user.uid, name: clientName, phone: clientPhone, email: clientEmail, createdAt: serverTimestamp() };
                    const clientDocRef = await addDoc(collection(db, "clientes"), newClientData);
                    console.log("Nuevo cliente guardado con ID:", clientDocRef.id);
                } catch (clientError) { console.error("Error al guardar nuevo cliente (después de guardar factura):", clientError); }
            }
            
            // Resetear formulario completo
            invoiceForm.reset();
            currentInvoiceItems = []; nextItemId = 0;
            if (clientNameInput) { clientNameInput.value = ''; clientNameInput.disabled = false; }
            if (clientPhoneInput) { clientPhoneInput.value = ''; clientPhoneInput.disabled = false; }
            if (clientEmailInput) { clientEmailInput.value = ''; clientEmailInput.disabled = false; }
            if (selectClient) selectClient.value = ""; // Resetear desplegable
            if (editClientBtn) editClientBtn.disabled = true;
            if (deleteClientBtn) deleteClientBtn.disabled = true;
            
            renderItems(); setDefaultInvoiceDate(); updateQuantityBasedOnStreaming(); handleDiscountChange();
            await loadClientsIntoDropdown(); // Recargar clientes para que el nuevo o editado se refleje
            await displayNextPotentialInvoiceNumber();
            
        } catch (error) { /* ... (manejo de error) ... */ } 
        finally { /* ... (rehabilitar botones, showLoading(false)) ... */ }
    });
}

if (generateInvoiceFileBtn) { /* ... (Tu listener de generateInvoiceFileBtn existente) ... */ 
    generateInvoiceFileBtn.addEventListener('click', () => {
        alert("Funcionalidad 'Generar Factura (Archivo)' pendiente.");
    });
}
