
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
    deleteDoc
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
const bodyElement = document.body;
const invoiceDetailModal = document.getElementById('invoiceDetailModal');
const modalInvoiceTitle = document.getElementById('modalInvoiceTitle');
const modalInvoiceDetailsContent = document.getElementById('modalInvoiceDetailsContent');
const closeInvoiceDetailModalBtn = document.getElementById('closeInvoiceDetailModalBtn');

console.log("Elemento del Modal Principal:", invoiceDetailModal);
console.log("Botón de Cierre del Modal:", closeInvoiceDetailModalBtn);

const printInvoiceFromModalBtn = document.getElementById('printInvoiceFromModalBtn');

console.log("DOM Modal - invoiceDetailModal:", invoiceDetailModal);
console.log("DOM Modal - modalInvoiceTitle:", modalInvoiceTitle);
console.log("DOM Modal - modalInvoiceDetailsContent:", modalInvoiceDetailsContent);
console.log("DOM Modal - closeInvoiceDetailModalBtn:", closeInvoiceDetailModalBtn);
console.log("Modal Overlay Element:", invoiceDetailModal);
console.log("Modal Close Button Element:", closeInvoiceDetailModalBtn);

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

function collectInvoiceDataFromForm() {
    // Validaciones básicas (puedes expandirlas)
    if (!clientNameInput.value || !clientPhoneInput.value || !clientEmailInput.value) {
        alert("Por favor, completa todos los datos del cliente.");
        return null;
    }
    if (currentInvoiceItems.length === 0) {
        alert("Por favor, agrega al menos un ítem a la factura.");
        return null;
    }
    if (!invoiceDateInput.value) {
        alert("Por favor, selecciona una fecha para la factura.");
        return null;
    }

    // Simular recálculo para asegurar que los totales estén actualizados en el DOM
    if (typeof recalculateTotals === 'function') {
        recalculateTotals();
    }

    const invoiceData = {
        invoiceNumberFormatted: `FCT-${invoiceNumberText.textContent || 'PENDIENTE'}`,
        invoiceNumberNumeric: parseInt(invoiceNumberText.textContent) || 0,
        invoiceDate: invoiceDateInput.value,
        serviceStartDate: document.getElementById('serviceStartDate')?.value || null,
        emitter: {
            name: document.getElementById('emitterName')?.value.trim() || '',
            id: document.getElementById('emitterId')?.value.trim() || '',
            address: document.getElementById('emitterAddress')?.value.trim() || '',
            phone: document.getElementById('emitterPhone')?.value.trim() || '',
            email: document.getElementById('emitterEmail')?.value.trim() || ''
        },
        client: {
            name: clientNameInput.value.trim(),
            phone: clientPhoneInput.value.trim(),
            email: clientEmailInput.value.trim(),
            id: hiddenSelectedClientIdInput.value || null
        },
        items: currentInvoiceItems.map(item => ({ ...item })),
        discount: {
            type: discountTypeSelect.value,
            value: parseFloat(discountValueInput.value) || 0
        },
        totals: {
            subtotal: parseFloat(subtotalAmountSpan.textContent.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
            discountApplied: parseFloat(discountAmountAppliedSpan.textContent.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
            taxableBase: parseFloat(taxableBaseAmountSpan.textContent.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
            iva: parseFloat(ivaAmountSpan.textContent.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0,
            grandTotal: parseFloat(totalAmountSpan.textContent.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0
        },
        paymentStatus: paymentStatusSelect.value,
        generatedAt: new Date().toISOString()
    };
    return invoiceData;
}

// --- Funciones para Modal de Detalle de Factura ---
function openInvoiceDetailModal(invoiceData, invoiceId) {
    console.log("openInvoiceDetailModal llamada con ID:", invoiceId, "y datos:", invoiceData);
    if (!invoiceDetailModal || !modalInvoiceTitle || !modalInvoiceDetailsContent) {
        console.error("Elementos del modal no encontrados al intentar abrir.");
        return;
    }
    console.log("Abriendo modal para factura ID:", invoiceId);

    modalInvoiceTitle.textContent = `Detalle de Factura: ${invoiceData.invoiceNumberFormatted || 'N/A'}`;
    
    let detailsHTML = '';

    // Datos del Emisor
    if (invoiceData.emitter && (invoiceData.emitter.name || invoiceData.emitter.id || invoiceData.emitter.address || invoiceData.emitter.phone || invoiceData.emitter.email)) {
        detailsHTML += `<h3>Datos del Emisor</h3><div class="modal-section-grid">`;
        if (invoiceData.emitter.name) detailsHTML += `<p><strong>Comercio:</strong> ${invoiceData.emitter.name}</p>`;
        if (invoiceData.emitter.id) detailsHTML += `<p><strong>NIT/ID:</strong> ${invoiceData.emitter.id}</p>`;
        if (invoiceData.emitter.address) detailsHTML += `<p><strong>Dirección:</strong> ${invoiceData.emitter.address}</p>`;
        if (invoiceData.emitter.phone) detailsHTML += `<p><strong>Teléfono:</strong> ${invoiceData.emitter.phone}</p>`;
        if (invoiceData.emitter.email) detailsHTML += `<p><strong>Email:</strong> ${invoiceData.emitter.email}</p>`;
        detailsHTML += `</div>`;
    }

    // Datos del Cliente
    detailsHTML += `<h3>Facturar A:</h3><div class="modal-section-grid">`;
    detailsHTML += `<p><strong>Nombre:</strong> ${invoiceData.client?.name || 'N/A'}</p>`;
    detailsHTML += `<p><strong>Celular:</strong> ${invoiceData.client?.phone || 'N/A'}</p>`;
    if (invoiceData.client?.email) { // El correo del cliente parece estar funcionando bien en tu captura.
        detailsHTML += `<p><strong>Correo:</strong> ${invoiceData.client.email}</p>`;
    }
    detailsHTML += `</div>`;

    // Detalles de la Factura
    detailsHTML += `<h3>Detalles de la Factura</h3>`;
    detailsHTML += `<p><strong>Número:</strong> ${invoiceData.invoiceNumberFormatted || 'N/A'}</p>`;
    detailsHTML += `<p><strong>Fecha:</strong> ${invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate + 'T00:00:00').toLocaleDateString('es-CO', {day: '2-digit', month: '2-digit', year: 'numeric'}) : 'N/A'}</p>`;
    if (invoiceData.serviceStartDate) {
        detailsHTML += `<p><strong>Inicio Servicio:</strong> ${new Date(invoiceData.serviceStartDate + 'T00:00:00').toLocaleDateString('es-CO', {day: '2-digit', month: '2-digit', year: 'numeric'})}</p>`;
    }

    const statusKeyModal = invoiceData.paymentStatus || 'pending';
    const statusInfoModal = paymentStatusDetails[statusKeyModal] || { text: statusKeyModal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) };
    // CORRECCIÓN AQUÍ: Usar la clase CSS correcta y el texto de statusInfoModal
    const statusBadgeClass = `status-${statusKeyModal.toLowerCase()}`;
    detailsHTML += `<p><strong>Estado:</strong> <span class="status-badge ${statusBadgeClass}">${statusInfoModal.text}</span></p>`;
    
    // Ítems
    detailsHTML += `<h3>Ítems:</h3>`;
    if (invoiceData.items && invoiceData.items.length > 0) {
        detailsHTML += `<table class="modal-items-table">
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th class="text-right">Cant.</th>
                                    <th class="text-right">P.U.</th>
                                    <th class="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>`;
        invoiceData.items.forEach(item => {
            let profileInfo = '';
            if (item.isStreaming && item.profileName) {
                profileInfo = `<small class="item-profile-details">Perfil: ${item.profileName}${item.profilePin ? ` (PIN: ${item.profilePin})` : ''}</small>`;
            }
            // CORRECCIONES AQUÍ:
            detailsHTML += `<tr>
                                <td>${item.description || 'N/A'}${profileInfo ? '<br>' + profileInfo : ''}</td>
                                <td class="text-right">${item.quantity || 0}</td>
                                <td class="text-right">${(item.price || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                                <td class="text-right">${((item.quantity || 0) * (item.price || 0)).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                            </tr>`;
        });
        detailsHTML += `</tbody></table>`;
    } else {
        detailsHTML += `<p>No hay ítems en esta factura.</p>`;
    }

    // Totales (Parecen estar funcionando en tu captura, pero revisemos la estructura)
    detailsHTML += `<div class="modal-totals-summary">`;
    if (invoiceData.totals) {
        detailsHTML += `<p><span>Subtotal:</span> <span>${(invoiceData.totals.subtotal || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span></p>`;
        if (invoiceData.totals.discountApplied > 0) {
            detailsHTML += `<p><span>Descuento:</span> <span>-${(invoiceData.totals.discountApplied || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span></p>`;
        }
        
        // Calcular Base Imponible solo si hay descuento o si taxableBase es explícitamente diferente del subtotal.
        const subtotalVal = invoiceData.totals.subtotal || 0;
        const discountVal = invoiceData.totals.discountApplied || 0;
        const taxableBaseVal = invoiceData.totals.taxableBase; // Puede ser undefined

        if (discountVal > 0 || (taxableBaseVal !== undefined && taxableBaseVal !== subtotalVal) ) {
             detailsHTML += `<p><span>Base Imponible:</span> <span>${(taxableBaseVal !== undefined ? taxableBaseVal : (subtotalVal - discountVal)).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span></p>`;
        }

        if (invoiceData.totals.iva > 0) {
            detailsHTML += `<p><span>IVA (19%):</span> <span>${(invoiceData.totals.iva || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span></p>`;
        }
        detailsHTML += `<p class="modal-grand-total"><span>TOTAL:</span> <span>${(invoiceData.totals.grandTotal || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span></p>`;
    }
    detailsHTML += `</div>`;

    if(modalInvoiceDetailsContent) modalInvoiceDetailsContent.innerHTML = detailsHTML;
    
    if (invoiceDetailModal) {
        console.log("Activando modal y clase modal-active en body.");
        invoiceDetailModal.classList.add('active');
        bodyElement.classList.add('modal-active');
    } else {
        console.error("invoiceDetailModal es null, no se puede activar.");
    }
}

function closeInvoiceDetailModal() {
    console.log("Intentando cerrar modal...");
    if (!invoiceDetailModal) {
        console.error("Elemento invoiceDetailModal no encontrado al intentar cerrar.");
        return; 
    }

    invoiceDetailModal.classList.remove('active');  // << Esto es correcto para ocultar el modal
    bodyElement.classList.remove('modal-active'); // << AÑADE ESTA LÍNEA para desbloquear scroll del body

    if (modalInvoiceDetailsContent) {
        setTimeout(() => { 
            if(modalInvoiceDetailsContent) {
                modalInvoiceDetailsContent.innerHTML = '<p>Cargando detalles de la factura...</p>'; 
            }
        }, 300); 
    }
    if (modalInvoiceTitle) {
        modalInvoiceTitle.textContent = 'Detalle de Factura';
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

// Esta función COMPLETA reemplaza la que puedas tener actualmente con el mismo nombre
function handleClientSelection(clientId, clientNameText, clientData = null) {
    if (selectedClientNameDisplay) {
        selectedClientNameDisplay.innerHTML = ''; // Limpiar contenido anterior del display

        // Añadir el nombre del cliente al display
        const nameSpan = document.createElement('span');
        nameSpan.classList.add('selected-client-name-text'); // Nueva clase para el texto del nombre
        nameSpan.textContent = clientNameText;
        selectedClientNameDisplay.appendChild(nameSpan);

        // Solo añadir píldoras al display si se ha seleccionado un cliente existente con datos
        if (clientId && clientData) { 
            const pillsContainer = document.createElement('span');
            pillsContainer.classList.add('pills-container');

            // Píldora 1: Estado General del Cliente
            let estadoGeneral = clientData.estadoGeneralCliente || "Activo"; // Valor por defecto si no existe
            let claseCssEstadoGeneral = "status-client-default"; 
            if (estadoGeneral === "Nuevo") claseCssEstadoGeneral = "status-client-nuevo";
            else if (estadoGeneral === "Activo" || estadoGeneral === "Al día") claseCssEstadoGeneral = "status-client-al-dia";
            else if (estadoGeneral === "Con Pendientes") claseCssEstadoGeneral = "status-client-con-pendientes";
            else if (estadoGeneral === "Moroso") claseCssEstadoGeneral = "status-client-moroso";
            else if (estadoGeneral === "Inactivo") claseCssEstadoGeneral = "status-client-inactivo";
            
            const pillGeneral = document.createElement('span');
            pillGeneral.classList.add('option-status-pill', claseCssEstadoGeneral);
            pillGeneral.textContent = estadoGeneral;
            pillsContainer.appendChild(pillGeneral);

            // Píldora 2: Estado de Última Factura del Cliente
            let estadoFacturaCliente = clientData.estadoUltimaFacturaCliente || "N/A";
            let textoPildoraFactura = "N/A";
            let claseCssPildoraFactura = "invoice-status-na"; 

            if (estadoFacturaCliente !== "N/A") {
                const statusKey = estadoFacturaCliente.toLowerCase().replace(/ /g, '_'); // Asegurar que la clave sea correcta para el objeto
                textoPildoraFactura = paymentStatusDetails[statusKey]?.text || estadoFacturaCliente;
                claseCssPildoraFactura = `invoice-status-${statusKey}`;
            }
            
            const pillFactura = document.createElement('span');
            pillFactura.classList.add('option-status-pill', claseCssPildoraFactura);
            pillFactura.textContent = textoPildoraFactura;
            pillsContainer.appendChild(pillFactura);
            
            selectedClientNameDisplay.appendChild(pillsContainer);
        }
    }

    // Esta es la sección que estaba duplicada. Se deja una sola vez al final.
    if (hiddenSelectedClientIdInput) hiddenSelectedClientIdInput.value = clientId;
    if (customClientOptions) customClientOptions.style.display = 'none'; // Cerrar el desplegable
    if (customClientSelect) customClientSelect.classList.remove('open'); // Quitar clase 'open'
    isEditingClient = false; 

    if (editClientBtn) editClientBtn.disabled = (clientId === ""); // Habilitar/deshabilitar botones
    if (deleteClientBtn) deleteClientBtn.disabled = (clientId === "");

    // Llenar o limpiar campos del formulario del cliente
    if (clientNameInput && clientPhoneInput && clientEmailInput) {
        if (clientId === "") { // Opción "-- Nuevo Cliente --" seleccionada
            clientNameInput.value = '';
            clientPhoneInput.value = '';
            clientEmailInput.value = '';
            clientNameInput.disabled = false;
            clientPhoneInput.disabled = false;
            clientEmailInput.disabled = false;
            if (clientNameInput) clientNameInput.focus();
        } else if (clientData) { // Un cliente existente fue seleccionado
            clientNameInput.value = clientData.name || '';
            clientPhoneInput.value = clientData.phone || '';
            clientEmailInput.value = clientData.email || '';
            clientNameInput.disabled = true; // Deshabilitar campos por defecto
            clientPhoneInput.disabled = true;
            clientEmailInput.disabled = true;
        }
    }
} // Esta es la llave de cierre correcta para la función handleClientSelection

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

                // --- Lógica para la Píldora 1: Estado General del Cliente ---
                let estadoGeneral = client.estadoGeneralCliente || "Activo"; // Valor por defecto si no existe
                let claseCssEstadoGeneral = "status-client-default"; 
                if (estadoGeneral === "Nuevo") claseCssEstadoGeneral = "status-client-nuevo";
                else if (estadoGeneral === "Activo" || estadoGeneral === "Al día") claseCssEstadoGeneral = "status-client-al-dia";
                else if (estadoGeneral === "Con Pendientes") claseCssEstadoGeneral = "status-client-con-pendientes";
                else if (estadoGeneral === "Moroso") claseCssEstadoGeneral = "status-client-moroso";
                else if (estadoGeneral === "Inactivo") claseCssEstadoGeneral = "status-client-inactivo";


                // --- Lógica para la Píldora 2: Estado de Última Factura del Cliente ---
                let estadoFacturaCliente = client.estadoUltimaFacturaCliente || "N/A";
                let textoPildoraFactura = "N/A";
                let claseCssPildoraFactura = "invoice-status-na"; 

                if (estadoFacturaCliente !== "N/A") {
                    const statusKey = estadoFacturaCliente.toLowerCase().replace(/ /g, '_');
                    textoPildoraFactura = paymentStatusDetails[statusKey]?.text || estadoFacturaCliente;
                    claseCssPildoraFactura = `invoice-status-${statusKey}`;
                }
                
                // --- Construir el HTML para la opción con AMBAS píldoras ---
                clientOption.innerHTML = `
                    <span class="option-client-name">${clientDisplayName}</span>
                    <span class="pills-container">
                        <span class="option-status-pill ${claseCssEstadoGeneral}">${estadoGeneral}</span>
                        <span class="option-status-pill ${claseCssPildoraFactura}">${textoPildoraFactura}</span>
                    </span>
                `;
                // --- Fin de la construcción del HTML ---

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
            estadoGeneralCliente: "Inactivo" 
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
        if (clientsSection) {
            clientsSection.style.display = 'block'; // Mostrar la sección principal de clientes
            clientsSection.classList.add('active-section');
            clientsSection.innerHTML = `
                <h2>Clientes</h2>
                <div class="client-list-subsection">
                    <h3>Clientes Activos</h3>
                    <div id="activeClientsListContainer" class="client-list">
                        <p>Cargando clientes activos...</p>
                    </div>
                </div>
                <div class="client-list-subsection">
                    <h3>Clientes Inactivos</h3>
                    <div id="deletedClientsListContainer" class="client-list">
                        <p>Cargando clientes inactivos...</p>
                    </div>
                </div>
            `;
        }
        if (navClients) navClients.classList.add('active-nav');

        // Llamar a las funciones para poblar ambas listas
        if (typeof displayActiveClients === 'function') await displayActiveClients();
        if (typeof displayDeletedClients === 'function') await displayDeletedClients();
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
            
                const viewDetailsBtn = itemElement.querySelector('.view-details-btn');
                if (viewDetailsBtn) {
                    // **NUEVO CONSOLE LOG**
                    console.log(`Botón 'Ver Detalles' ENCONTRADO para factura ID: ${invoiceId}. Botón:`, viewDetailsBtn);
                    viewDetailsBtn.addEventListener('click', () => {
                        // **NUEVO CONSOLE LOG**
                        console.log(`Clic detectado en 'Ver Detalles' para factura ID: ${invoiceId}. Datos de factura:`, invoice);
                        openInvoiceDetailModal(invoice, invoiceId); 
                    });
                } else {
                    // **NUEVO CONSOLE LOG**
                    console.error(`Botón 'Ver Detalles' NO FUE ENCONTRADO para factura ID: ${invoiceId}`);
                }
                currentInvoiceListContainer.appendChild(itemElement);
            });
        }
    } catch (error) {
        console.error("Error al cargar facturas: ", error);
        if (currentInvoiceListContainer) currentInvoiceListContainer.innerHTML = '<p>Error al cargar facturas.</p>';
    }
}

// === INICIO: NUEVO CÓDIGO - Funciones para la Sección Clientes ===

/**
 * Carga y muestra los clientes activos (isDeleted != true).
 */
async function displayActiveClients() {
    const activeClientsContainer = document.getElementById('activeClientsListContainer');
    if (!activeClientsContainer) {
        console.error("Contenedor #activeClientsListContainer no encontrado.");
        return;
    }
    const user = auth.currentUser;
    if (!user) {
        activeClientsContainer.innerHTML = '<p>Debes iniciar sesión para ver clientes.</p>';
        return;
    }

    activeClientsContainer.innerHTML = '<p>Cargando clientes activos...</p>';
    try {
        const q = query(
            collection(db, "clientes"),
            where("userId", "==", user.uid),
            where("isDeleted", "!=", true),
            orderBy("name", "asc")
        );
        const querySnapshot = await getDocs(q);
        activeClientsContainer.innerHTML = ''; // Limpiar

        if (querySnapshot.empty) {
            activeClientsContainer.innerHTML = '<p>No tienes clientes activos.</p>';
        } else {
            querySnapshot.forEach((docSnap) => {
                const client = docSnap.data();
                const clientId = docSnap.id;
                const clientElement = document.createElement('div');
                clientElement.classList.add('client-list-item'); // Reusaremos un estilo similar a invoice-list-item
                clientElement.setAttribute('data-client-id', clientId);

                // Píldoras de estado (similar a como lo hicimos para el desplegable)
                let estadoGeneral = client.estadoGeneralCliente || "Activo";
                let claseCssEstadoGeneral = "status-client-default";
                if (estadoGeneral === "Nuevo") claseCssEstadoGeneral = "status-client-nuevo";
                else if (estadoGeneral === "Activo" || estadoGeneral === "Al día") claseCssEstadoGeneral = "status-client-al-dia";
                else if (estadoGeneral === "Con Pendientes") claseCssEstadoGeneral = "status-client-con-pendientes";
                else if (estadoGeneral === "Moroso") claseCssEstadoGeneral = "status-client-moroso";

                let estadoFactura = client.estadoUltimaFacturaCliente || "N/A";
                let claseCssEstadoFactura = `invoice-status-${estadoFactura.toLowerCase().replace(/ /g, '_')}`;
                if (estadoFactura === "N/A") claseCssEstadoFactura = "invoice-status-na";
                let textoPildoraFactura = paymentStatusDetails[estadoFactura.toLowerCase().replace(/ /g, '_')]?.text || estadoFactura;
                 if(estadoFactura === "N/A" && !paymentStatusDetails[estadoFactura.toLowerCase().replace(/ /g, '_')]) {
                    textoPildoraFactura = "N/A";
                }

                clientElement.innerHTML = `
                    <div class="client-info">
                        <strong class="client-name">${client.name}</strong>
                        <span class="client-contact">${client.email || ''} ${client.email && client.phone ? '|' : ''} ${client.phone || ''}</span>
                    </div>
                    <div class="client-pills">
                        <span class="option-status-pill ${claseCssEstadoGeneral}">${estadoGeneral}</span>
                        <span class="option-status-pill ${claseCssEstadoFactura}">${textoPildoraFactura}</span>
                    </div>
                    <div class="client-actions-list">
                        <button type="button" class="btn btn-sm btn-warning edit-client-list-btn">Editar</button>
                        <button type="button" class="btn btn-sm btn-danger delete-client-list-btn">Eliminar</button>
                    </div>
                `;
                // Placeholder para botones de editar/eliminar en esta lista
                clientElement.querySelector('.edit-client-list-btn').addEventListener('click', () => {
                    alert(`Funcionalidad "Editar" para cliente ${client.name} (ID: ${clientId}) pendiente desde esta lista.`);
                    // Aquí podríamos navegar a la sección de crear factura y cargar este cliente para edición.
                });
                clientElement.querySelector('.delete-client-list-btn').addEventListener('click', async () => {
                    if (confirm(`¿Seguro que deseas marcar como inactivo a "${client.name}"?`)) {
                        showLoading(true);
                        await softDeleteClient(clientId); // Reutilizamos la función de borrado suave
                        await displayActiveClients();    // Recargar lista de activos
                        await displayDeletedClients();   // Recargar lista de inactivos
                        await loadClientsIntoDropdown(); // Actualizar el desplegable del formulario
                        showLoading(false);
                    }
                });
                activeClientsContainer.appendChild(clientElement);
            });
        }
    } catch (error) {
        console.error("Error al cargar clientes activos:", error);
        activeClientsContainer.innerHTML = '<p>Error al cargar clientes activos.</p>';
    }
}

/**
 * Carga y muestra los clientes inactivos/eliminados (isDeleted == true).
 */
async function displayDeletedClients() {
    const deletedClientsContainer = document.getElementById('deletedClientsListContainer');
    if (!deletedClientsContainer) {
        console.error("Contenedor #deletedClientsListContainer no encontrado.");
        return;
    }
    const user = auth.currentUser;
    if (!user) {
        deletedClientsContainer.innerHTML = '<p>Debes iniciar sesión para ver clientes.</p>';
        return;
    }

    deletedClientsContainer.innerHTML = '<p>Cargando clientes inactivos...</p>';
    try {
        const q = query(
            collection(db, "clientes"),
            where("userId", "==", user.uid),
            where("isDeleted", "==", true), // Solo clientes marcados como eliminados
            orderBy("deletedAt", "desc") // Mostrar los más recientemente eliminados primero
        );
        const querySnapshot = await getDocs(q);
        deletedClientsContainer.innerHTML = ''; // Limpiar

        if (querySnapshot.empty) {
            deletedClientsContainer.innerHTML = '<p>No tienes clientes inactivos.</p>';
        } else {
            querySnapshot.forEach((docSnap) => {
                const client = docSnap.data();
                const clientId = docSnap.id;
                const clientElement = document.createElement('div');
                clientElement.classList.add('client-list-item', 'client-inactive'); // Clase adicional
                clientElement.setAttribute('data-client-id', clientId);
                
                clientElement.innerHTML = `
                    <div class="client-info">
                        <strong class="client-name">${client.name}</strong>
                        <span class="client-contact">${client.email || ''} ${client.email && client.phone ? '|' : ''} ${client.phone || ''}</span>
                        <span class="client-deleted-date">Eliminado: ${client.deletedAt ? new Date(client.deletedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div class="client-actions-list">
                        <button type="button" class="btn btn-sm btn-success recover-client-list-btn">Recuperar</button>
                        <button type="button" class="btn btn-sm btn-outline-danger permanent-delete-client-btn">Eliminar Perm.</button>
                    </div>
                `;
                clientElement.querySelector('.recover-client-list-btn').addEventListener('click', async () => {
                    if (confirm(`¿Seguro que deseas recuperar a "${client.name}"?`)) {
                        showLoading(true);
                        await recoverClient(clientId); // Nueva función para recuperar
                        await displayActiveClients();   // Recargar lista de activos
                        await displayDeletedClients();  // Recargar lista de inactivos
                        await loadClientsIntoDropdown(); // Actualizar el desplegable del formulario
                        showLoading(false);
                    }
                });
                const permanentDeleteBtn = clientElement.querySelector('.permanent-delete-client-btn');
                if (permanentDeleteBtn) {
                    permanentDeleteBtn.addEventListener('click', async () => {
                        // La función permanentlyDeleteClient ya tiene doble confirmación
                        showLoading(true);
                        const success = await permanentlyDeleteClient(clientId); // Asumiendo que ya tienes esta función
                        showLoading(false);
                        if (success) {
                            // Solo necesitamos recargar la lista de clientes eliminados, ya que el activo no debería cambiar
                            // y el desplegable tampoco, pues ya no estaba.
                            await displayDeletedClients(); 
                        }
                    });
                }
                deletedClientsContainer.appendChild(clientElement);
            });
        }
    } catch (error) {
        console.error("Error al cargar clientes inactivos:", error);
        deletedClientsContainer.innerHTML = '<p>Error al cargar clientes inactivos.</p>';
    }
}

/**
 * Recupera un cliente marcado como eliminado (isDeleted: true -> false).
 * @param {string} clientId - El ID del cliente a recuperar.
 */
async function recoverClient(clientId) {
    const user = auth.currentUser;
    if (!user || !clientId) {
        alert("Acción no permitida.");
        return false;
    }
    const clientRef = doc(db, "clientes", clientId);
    try {
        await updateDoc(clientRef, {
            isDeleted: false,
            // Opcional: limpiar el campo deletedAt o poner un campo recoveredAt
            // deletedAt: null, // Esto eliminaría el campo
            estadoGeneralCliente: "Activo" // Cambiar su estado general a Activo
        });
        alert("Cliente recuperado exitosamente.");
        return true;
    } catch (error) {
        console.error("Error al recuperar cliente:", error);
        alert("Error al recuperar el cliente.");
        return false;
    }
}
// === FIN: NUEVO CÓDIGO ===

async function permanentlyDeleteClient(clientId) {
    const user = auth.currentUser;
    if (!user || !clientId) {
        alert("Acción no permitida.");
        return false;
    }
    // ¡¡DOBLE CONFIRMACIÓN!! Esto es muy importante.
    if (!confirm("¿Estás ABSOLUTAMENTE SEGURO de que deseas eliminar permanentemente a este cliente? Esta acción NO SE PUEDE DESHACER.")) {
        return false;
    }
    if (!confirm("ÚLTIMA ADVERTENCIA: Eliminar permanentemente al cliente borrará su registro de la base de datos. ¿Continuar?")) {
        return false;
    }

    const clientRef = doc(db, "clientes", clientId);
    try {
        await deleteDoc(clientRef); // ¡OJO! ESTO ES deleteDoc, no updateDoc
        alert("Cliente eliminado permanentemente de la base de datos.");
        return true;
    } catch (error) {
        console.error("Error al eliminar permanentemente al cliente:", error);
        alert("Error al eliminar permanentemente el cliente.");
        return false;
    }
}

if (closeInvoiceDetailModalBtn) {
    closeInvoiceDetailModalBtn.addEventListener('click', closeInvoiceDetailModal);
}

if (invoiceDetailModal) {
    // Cerrar el modal si se hace clic en el overlay (fondo)
    invoiceDetailModal.addEventListener('click', (event) => {
        if (event.target === invoiceDetailModal) { // Si el clic fue directamente en el overlay
            closeInvoiceDetailModal();
        }
    });
}

// Opcional: Cerrar el modal con la tecla Escape
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && invoiceDetailModal && invoiceDetailModal.classList.contains('active')) {
        closeInvoiceDetailModal();
    }
});

// Placeholder para el botón de imprimir/descargar en el modal
if (printInvoiceFromModalBtn) {
    printInvoiceFromModalBtn.addEventListener('click', () => {
        alert("Funcionalidad de Imprimir/Descargar PDF desde el modal está pendiente.");
    });
}

// --- Lógica de Autenticación y Estado ---
if (loginButton) { 
    loginButton.addEventListener('click', () => {
        console.log("Paso 1: Clic en loginButton detectado.");
        showLoading(true);
        signInWithPopup(auth, googleProvider)
            .then((result) => { /* onAuthStateChanged lo maneja */ 
                console.log("Paso 2: signInWithPopup completado exitosamente (then). Usuario:", result.user.displayName);
            })
            .catch((error) => {
                console.error("Paso 2E: Error en signInWithPopup (catch):", error);
                let msg = "Error al iniciar sesión.";
                if (error.code === 'auth/popup-closed-by-user') msg = "Ventana de login cerrada.";
                alert(msg);
            })
            .finally(() => { 
                console.log("Paso 3: Bloque finally de signInWithPopup.");
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
