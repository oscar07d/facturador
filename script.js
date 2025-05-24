// Importaciones de Firebase (usando la versión 11.8.1 como en tu configuración inicial)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js"; // Opcional

// Importaciones de Firestore
import { 
    getFirestore, 
    collection, 
    addDoc,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Tu configuración de Firebase
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
const db = getFirestore(app); // Instancia de Firestore
// const analytics = getAnalytics(app); // Descomenta si quieres usar Firebase Analytics

// --- Selección de Elementos del DOM (Login y UI Principal) ---
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const loadingOverlay = document.getElementById('loadingOverlay');
const loginContainer = document.querySelector('.login-container');
const mainContent = document.getElementById('mainContent');

// --- Selección de Elementos del DOM (Interfaz de Facturación) ---
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
const invoiceDateInput = document.getElementById('invoiceDate');
const invoiceNumberText = document.getElementById('invoiceNumberText');
const itemIsStreamingCheckbox = document.getElementById('itemIsStreaming');
const itemQuantityInput = document.getElementById('itemQuantity');
const itemDescription = document.getElementById('itemDescription'); // Asegúrate que este ID existe
const itemPrice = document.getElementById('itemPrice');             // Asegúrate que este ID existe
const itemApplyIVA = document.getElementById('itemApplyIVA');       // Asegúrate que este ID existe
const paymentStatusSelect = document.getElementById('paymentStatus');
const paymentStatusInfoDiv = document.getElementById('paymentStatusInfo');
const paymentStatusDescriptionP = document.getElementById('paymentStatusDescription');
const paymentStatusActionP = document.getElementById('paymentStatusAction');
const addItemBtn = document.getElementById('addItemBtn');
const saveInvoiceBtn = document.getElementById('saveInvoiceBtn'); // Este es el botón submit del form
const generateInvoiceFileBtn = document.getElementById('generateInvoiceFileBtn');
const invoiceItemsContainer = document.getElementById('invoiceItemsContainer');

// Campos de Descuento y Totales
const discountTypeSelect = document.getElementById('discountType');
const discountValueInput = document.getElementById('discountValue');
const subtotalAmountSpan = document.getElementById('subtotalAmount');
const discountAmountAppliedSpan = document.getElementById('discountAmountApplied');
const taxableBaseAmountSpan = document.getElementById('taxableBaseAmount');
const ivaAmountSpan = document.getElementById('ivaAmount');
const totalAmountSpan = document.getElementById('totalAmount');

// --- Variables Globales para la Lógica de Facturación ---
const paymentStatusDetails = {
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

// --- Funciones Auxiliares y de UI ---
const showLoading = (show) => {
    if (loadingOverlay) loadingOverlay.style.display = show ? 'flex' : 'none';
};

function setDefaultInvoiceDate() {
    if (invoiceDateInput) {
        const today = new Date();
        invoiceDateInput.value = today.toISOString().split('T')[0];
    }
}

function updateQuantityBasedOnStreaming() {
    if (itemIsStreamingCheckbox && itemQuantityInput) {
        itemQuantityInput.disabled = itemIsStreamingCheckbox.checked;
        if (itemIsStreamingCheckbox.checked) itemQuantityInput.value = 1;
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

function renderItems() {
    if (!invoiceItemsContainer) return;
    invoiceItemsContainer.innerHTML = '';
    if (currentInvoiceItems.length === 0) {
        invoiceItemsContainer.innerHTML = '<div class="invoice-item-placeholder">Aún no has agregado ítems.</div>';
    } else {
        currentInvoiceItems.forEach(item => {
            const itemSubtotal = item.quantity * item.price;
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
            itemElement.querySelector('.delete-item-btn').addEventListener('click', () => deleteItem(item.id));
            invoiceItemsContainer.appendChild(itemElement);
        });
    }
    if (typeof recalculateTotals === 'function') recalculateTotals();
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
        if (item.applyIVA) totalIVA += itemTotal * 0.19;
    });

    let discountAmount = 0;
    const selectedDiscountType = discountTypeSelect ? discountTypeSelect.value : 'none';
    const discountValue = discountValueInput ? parseFloat(discountValueInput.value) : 0;

    if (selectedDiscountType === 'percentage' && !isNaN(discountValue) && discountValue > 0) {
        discountAmount = subtotal * (discountValue / 100);
    } else if (selectedDiscountType === 'fixed' && !isNaN(discountValue) && discountValue > 0) {
        discountAmount = discountValue;
    }
    if (discountAmount > subtotal) discountAmount = subtotal;

    const taxableBaseAmount = subtotal - discountAmount;
    const grandTotal = taxableBaseAmount + totalIVA;

    if (subtotalAmountSpan) subtotalAmountSpan.textContent = subtotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
    if (discountAmountAppliedSpan) discountAmountAppliedSpan.textContent = discountAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
    if (taxableBaseAmountSpan) taxableBaseAmountSpan.textContent = taxableBaseAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
    if (ivaAmountSpan) ivaAmountSpan.textContent = totalIVA.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
    if (totalAmountSpan) totalAmountSpan.textContent = grandTotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
}

function handleDiscountChange() {
    if (discountTypeSelect && discountValueInput) {
        discountValueInput.disabled = (discountTypeSelect.value === 'none');
        if (discountTypeSelect.value === 'none') discountValueInput.value = '';
    }
    if (typeof recalculateTotals === 'function') recalculateTotals();
}

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

    if (sectionToShowId === 'createInvoiceSection') {
        targetTitle = "Crear Nueva Factura";
        if (typeof setDefaultInvoiceDate === 'function') setDefaultInvoiceDate();
        if (typeof updateQuantityBasedOnStreaming === 'function') updateQuantityBasedOnStreaming();
        if (typeof handleDiscountChange === 'function') handleDiscountChange();
        if (typeof renderItems === 'function') renderItems();
    } else if (sectionToShowId === 'viewInvoicesSection') {
        targetTitle = "Mis Facturas";
        if (viewInvoicesSection && viewInvoicesSection.innerHTML.trim() === '') {
            viewInvoicesSection.innerHTML = `<h2>Mis Facturas</h2><p>Listado de facturas aparecerá aquí. Funcionalidad en desarrollo.</p><div id="invoiceListContainer"></div>`;
        }
    } else if (sectionToShowId === 'clientsSection') {
        targetTitle = "Clientes";
        if (clientsSection && clientsSection.innerHTML.trim() === '') {
            clientsSection.innerHTML = `<h2>Clientes</h2><p>Listado de clientes aparecerá aquí. Funcionalidad en desarrollo.</p><div id="clientListContainer"></div>`;
        }
    }
    if (appPageTitle) appPageTitle.textContent = targetTitle;

    navLinks.forEach(link => {
        if (link) {
            const targetSectionId = link.id.replace('nav', '').charAt(0).toLowerCase() + link.id.replace('nav', '').slice(1) + 'Section';
            link.classList.toggle('active-nav', targetSectionId === sectionToShowId);
        }
    });
}

// --- Lógica de Autenticación y Estado ---
if (loginButton) {
    loginButton.addEventListener('click', () => {
        showLoading(true);
        signInWithPopup(auth, googleProvider)
            .then((result) => console.log("Usuario autenticado con Google:", result.user))
            .catch((error) => {
                console.error("Error durante el inicio de sesión con Google:", error);
                let errorMessage = "Ocurrió un error al intentar iniciar sesión.";
                if (error.code === 'auth/popup-closed-by-user') errorMessage = "Ventana de inicio de sesión cerrada.";
                else if (error.code === 'auth/cancelled-popup-request') errorMessage = "Solicitud de inicio de sesión cancelada.";
                alert(errorMessage);
            })
            .finally(() => {
                if (!auth.currentUser) showLoading(false);
            });
    });
}

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        showLoading(true);
        signOut(auth)
            .then(() => console.log("Usuario cerró sesión exitosamente."))
            .catch((error) => {
                console.error("Error al cerrar sesión:", error);
                alert("Ocurrió un error al cerrar la sesión.");
            });
    });
}

onAuthStateChanged(auth, (user) => {
    showLoading(false);
    if (user) {
        console.log("Usuario conectado:", user.uid, user.displayName);
        if (loginContainer) loginContainer.style.display = 'none';
        if (mainContent) mainContent.style.display = 'flex';
        handleNavigation('createInvoiceSection');
    } else {
        console.log("No hay usuario conectado.");
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

if (discountTypeSelect) discountTypeSelect.addEventListener('change', handleDiscountChange);
if (discountValueInput) discountValueInput.addEventListener('input', () => { if (typeof recalculateTotals === 'function') recalculateTotals(); });

if (addItemBtn) {
    addItemBtn.addEventListener('click', () => {
        const description = itemDescription.value.trim();
        const isStreaming = itemIsStreamingCheckbox.checked;
        let quantity = parseInt(itemQuantityInput.value);
        const price = parseFloat(itemPrice.value);
        const applyIVA = itemApplyIVA.checked;

        if (!description) { alert("Por favor, ingresa una descripción para el ítem."); itemDescription.focus(); return; }
        if (isNaN(quantity) || quantity <= 0) { alert("Por favor, ingresa una cantidad válida."); itemQuantityInput.focus(); return; }
        if (isNaN(price) || price < 0) { alert("Por favor, ingresa un precio válido."); itemPrice.focus(); return; }
        if (isStreaming) quantity = 1;

        currentInvoiceItems.push({ id: nextItemId++, description, isStreaming, quantity, price, applyIVA });
        renderItems();

        itemDescription.value = '';
        itemIsStreamingCheckbox.checked = false;
        itemQuantityInput.value = 1;
        itemQuantityInput.disabled = false;
        itemPrice.value = '';
        itemApplyIVA.checked = false;
        itemDescription.focus();
    });
}

if (invoiceForm) {
    invoiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) { alert("Debes iniciar sesión para guardar una factura."); return; }
        if (currentInvoiceItems.length === 0) { alert("Debes agregar al menos un ítem."); return; }

        const clientName = document.getElementById('clientName') ? document.getElementById('clientName').value.trim() : '';
        const clientPhone = document.getElementById('clientPhone') ? document.getElementById('clientPhone').value.trim() : '';
        const clientEmail = document.getElementById('clientEmail') ? document.getElementById('clientEmail').value.trim() : '';

        if (!clientName || !clientPhone || !clientEmail) {
            alert("Completa los campos obligatorios del cliente (Nombres, Celular, Correo).");
            return;
        }
        
        if (typeof recalculateTotals === 'function') recalculateTotals(); // Asegurar totales actualizados

        const invoiceToSave = {
            userId: user.uid,
            invoiceNumberDisplay: `FCT-${invoiceNumberText.textContent}`,
            invoiceDate: invoiceDateInput.value,
            serviceStartDate: document.getElementById('serviceStartDate') ? document.getElementById('serviceStartDate').value : null,
            emitter: {
                name: document.getElementById('emitterName') ? document.getElementById('emitterName').value.trim() : '',
                id: document.getElementById('emitterId') ? document.getElementById('emitterId').value.trim() : '',
                address: document.getElementById('emitterAddress') ? document.getElementById('emitterAddress').value.trim() : '',
                phone: document.getElementById('emitterPhone') ? document.getElementById('emitterPhone').value.trim() : '',
                email: document.getElementById('emitterEmail') ? document.getElementById('emitterEmail').value.trim() : ''
            },
            client: { name: clientName, phone: clientPhone, email: clientEmail },
            items: currentInvoiceItems,
            discount: { type: discountTypeSelect.value, value: parseFloat(discountValueInput.value) || 0 },
            totals: {
                subtotal: parseFloat(subtotalAmountSpan.textContent.replace(/[^\d,-]/g, '').replace(',', '.')) || 0,
                discountApplied: parseFloat(discountAmountAppliedSpan.textContent.replace(/[^\d,-]/g, '').replace(',', '.')) || 0,
                taxableBase: parseFloat(taxableBaseAmountSpan.textContent.replace(/[^\d,-]/g, '').replace(',', '.')) || 0,
                iva: parseFloat(ivaAmountSpan.textContent.replace(/[^\d,-]/g, '').replace(',', '.')) || 0,
                grandTotal: parseFloat(totalAmountSpan.textContent.replace(/[^\d,-]/g, '').replace(',', '.')) || 0
            },
            paymentStatus: paymentStatusSelect.value,
            createdAt: serverTimestamp()
        };

        if (saveInvoiceBtn) saveInvoiceBtn.disabled = true;
        if (generateInvoiceFileBtn) generateInvoiceFileBtn.disabled = true;
        showLoading(true);

        try {
            const docRef = await addDoc(collection(db, "facturas"), invoiceToSave);
            console.log("Factura guardada con ID: ", docRef.id);
            alert("¡Factura guardada exitosamente!");

            invoiceForm.reset();
            currentInvoiceItems = [];
            nextItemId = 0;
            if (typeof renderItems === 'function') renderItems();
            if (typeof setDefaultInvoiceDate === 'function') setDefaultInvoiceDate();
            if (typeof updateQuantityBasedOnStreaming === 'function') updateQuantityBasedOnStreaming();
            if (typeof handleDiscountChange === 'function') handleDiscountChange();
            
        } catch (error) {
            console.error("Error al guardar la factura: ", error);
            alert("Error al guardar la factura. Por favor, inténtalo de nuevo.\nDetalle: " + error.message);
        } finally {
            if (saveInvoiceBtn) saveInvoiceBtn.disabled = false;
            if (generateInvoiceFileBtn) generateInvoiceFileBtn.disabled = false;
            showLoading(false);
        }
    });
}

if (generateInvoiceFileBtn) {
    generateInvoiceFileBtn.addEventListener('click', () => {
        console.log("Botón 'Generar Factura (Archivo)' presionado.");
        alert("Funcionalidad 'Generar Factura (Archivo)' pendiente de implementación.");
    });
}
