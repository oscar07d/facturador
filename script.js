// Importaciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
    getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut
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
    orderBy
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

// --- Selección de Elementos del DOM (Login y UI Principal) ---
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const loadingOverlay = document.getElementById('loadingOverlay');
const loginContainer = document.querySelector('.login-container');
const mainContent = document.getElementById('mainContent');

// --- Selección de Elementos del DOM (Interfaz de Facturación) ---
const navCreateInvoice = document.getElementById('navCreateInvoice');
const navViewInvoices = document.getElementById('navViewInvoices');
const navClients = document.getElementById('navClients');
const createInvoiceSection = document.getElementById('createInvoiceSection');
const viewInvoicesSection = document.getElementById('viewInvoicesSection');
const clientsSection = document.getElementById('clientsSection');
const appPageTitle = document.getElementById('appPageTitle');
const invoiceForm = document.getElementById('invoiceForm');
const selectClient = document.getElementById('selectClient');
// === INICIO: NUEVO CÓDIGO - Selectores para campos de datos del cliente ===
const clientNameInput = document.getElementById('clientName');
const clientPhoneInput = document.getElementById('clientPhone');
const clientEmailInput = document.getElementById('clientEmail');
// === FIN: NUEVO CÓDIGO ===
const invoiceDateInput = document.getElementById('invoiceDate');
const invoiceNumberText = document.getElementById('invoiceNumberText');

// Ítems del formulario
const itemDescription = document.getElementById('itemDescription');
const itemIsStreamingCheckbox = document.getElementById('itemIsStreaming');
const itemQuantityInput = document.getElementById('itemQuantity');
const itemPrice = document.getElementById('itemPrice');
const itemApplyIVA = document.getElementById('itemApplyIVA');
const addItemBtn = document.getElementById('addItemBtn');
const invoiceItemsContainer = document.getElementById('invoiceItemsContainer');

// Campos de perfil de streaming (NUEVO)
const streamingProfileFieldsDiv = document.getElementById('streamingProfileFields');
const itemProfileNameInput = document.getElementById('itemProfileName');
const itemProfilePinInput = document.getElementById('itemProfilePin');

// Estado de pago
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

// Botones de acción del formulario
const saveInvoiceBtn = document.getElementById('saveInvoiceBtn'); // Este es el botón submit del form
const generateInvoiceFileBtn = document.getElementById('generateInvoiceFileBtn');

// --- Variables Globales para la Lógica de Facturación ---
const paymentStatusDetails = { /* ... (Objeto paymentStatusDetails completo) ... */ 
    pending: { description: "La factura ha sido emitida y enviada al cliente, pero aún no se ha recibido el pago. El plazo de vencimiento todavía no ha llegado.", action: "Monitoreo regular, envío de recordatorios amigables antes de la fecha de vencimiento." },
    paid: { description: "El cliente ha realizado el pago completo de la factura y este ha sido confirmado.", action: "Agradecimiento al cliente, actualización de registros." },
    overdue: { description: "La fecha de vencimiento de la factura ha pasado y el pago no se ha recibido.", action: "Inicio del proceso de cobranza (recordatorios más insistentes, llamadas, aplicación de posibles intereses de mora según políticas). Se puede subclasificar por antigüedad de la mora (ej. Vencido 1-30 días, Vencido 31-60 días, etc.)." },
    in_process: { description: "El cliente ha informado que ha realizado el pago, o el pago está siendo procesado por el banco o la pasarela de pagos, pero aún no se refleja como confirmado.", action: "Seguimiento para confirmar la recepción efectiva del pago." },
    partial_payment: { description: "El cliente ha realizado un abono, pero no ha cubierto el total de la factura.", action: "Contactar al cliente para aclarar la situación y acordar el pago del saldo restante. Registrar el monto pagado y el pendiente." },
    disputed: { description: "El cliente ha manifestado una inconformidad con la factura o el servicio y, por lo tanto, ha retenido el pago total o parcial.", action: "Investigación interna de la disputa, comunicación con el cliente para resolver el problema." },
    cancelled: { description: "La factura ha sido anulada, ya sea por un error, por la cancelación del servicio/producto, o por un acuerdo con el cliente.", action: "Asegurarse de que el cliente esté informado y que los registros contables reflejen la anulación." },
    uncollectible: { description: "Después de múltiples intentos de cobro, se considera que la deuda no será recuperada.", action: "Se procede según las políticas de la empresa para dar de baja la cuenta por cobrar, lo cual puede tener implicaciones contables y fiscales." }
};
let currentInvoiceItems = [];
let loadedClients = [];
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
    if (itemIsStreamingCheckbox && itemQuantityInput && streamingProfileFieldsDiv) {
        const isStreaming = itemIsStreamingCheckbox.checked;
        itemQuantityInput.disabled = isStreaming;
        if (isStreaming) {
            itemQuantityInput.value = 1;
            streamingProfileFieldsDiv.style.display = 'block'; // Mostrar campos de perfil
        } else {
            streamingProfileFieldsDiv.style.display = 'none'; // Ocultar campos de perfil
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
    return String(number).padStart(3, '0'); // Mantiene al menos 3 dígitos, pero crecerá si es necesario (ej: 1000)
}

async function getCurrentLastInvoiceNumericValue(userId) {
    if (!userId) { console.warn("ID de usuario no proporcionado para obtener último número."); return 0; }
    const counterRef = doc(db, "user_counters", userId);
    try {
        const counterDoc = await getDoc(counterRef);
        return (counterDoc.exists() && counterDoc.data().lastInvoiceNumber !== undefined) ? counterDoc.data().lastInvoiceNumber : 0;
    } catch (error) { console.error("Error al leer último número de factura:", error); return 0; }
}

async function getNextInvoiceNumber(userId) {
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

// === INICIO: NUEVO CÓDIGO - Función para cargar clientes en el desplegable ===
/**
 * Carga los clientes del usuario actual desde Firestore y los puebla en el select.
 */
async function loadClientsIntoDropdown() {
    if (!selectClient) return; // Salir si el elemento select no existe

    const user = auth.currentUser;
    if (!user) {
        // Si no hay usuario, limpiar opciones excepto la primera y salir
        selectClient.innerHTML = '<option value="">-- Nuevo Cliente --</option>';
        loadedClients = [];
        return;
    }

    try {
        // Crear una consulta para obtener los clientes del usuario actual, ordenados por nombre
        const q = query(
            collection(db, "clientes"), 
            where("userId", "==", user.uid),
            orderBy("name", "asc") // Ordenar alfabéticamente por nombre
        );

        const querySnapshot = await getDocs(q);

        // Limpiar opciones existentes (excepto la primera de "-- Nuevo Cliente --")
        selectClient.innerHTML = '<option value="">-- Nuevo Cliente --</option>';
        loadedClients = [];

        if (querySnapshot.empty) {
            console.log("No se encontraron clientes para este usuario.");
        } else {
            querySnapshot.forEach((doc) => {
                const client = doc.data();
                const option = document.createElement('option');
                option.value = doc.id; // Guardamos el ID del documento del cliente
                option.textContent = client.name; // Mostramos el nombre del cliente
                selectClient.appendChild(option);

                // === INICIO: NUEVO CÓDIGO - Guardar datos del cliente en el array ===
                loadedClients.push({ id: doc.id, ...client });
                // === FIN: NUEVO CÓDIGO ===
            });
            console.log("Clientes cargados en el desplegable.");
        }
    } catch (error) {
        console.error("Error al cargar clientes en el desplegable: ", error);
        selectClient.innerHTML = '<option value="">-- Nuevo Cliente --</option><option value="" disabled>Error al cargar clientes</option>';
        loadedClients = [];
    }
}
// === FIN: NUEVO CÓDIGO ===

function renderItems() {
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

function handleDiscountChange() {
    if (discountTypeSelect && discountValueInput) {
        discountValueInput.disabled = (discountTypeSelect.value === 'none');
        if (discountTypeSelect.value === 'none') discountValueInput.value = '';
    }
    if (typeof recalculateTotals === 'function') recalculateTotals();
}

async function handleNavigation(sectionToShowId) {
    const sections = [createInvoiceSection, viewInvoicesSection, clientsSection];
    const navLinks = [navCreateInvoice, navViewInvoices, navClients];
    let targetTitle = "Sistema de Facturación"; // Título por defecto

    // 1. Ocultar todas las secciones y desactivar todos los links de navegación primero
    sections.forEach(section => {
        if (section) {
            section.style.display = 'none';
            section.classList.remove('active-section'); // Asegurarse de quitar la clase activa
        }
    });
    navLinks.forEach(link => {
        if (link) {
            link.classList.remove('active-nav');
        }
    });

    // 2. Lógica específica y mostrar la sección correcta
    if (sectionToShowId === 'createInvoiceSection') {
        targetTitle = "Crear Nueva Factura";
        if (createInvoiceSection) {
            createInvoiceSection.style.display = 'block';
            createInvoiceSection.classList.add('active-section');
        }
        if (navCreateInvoice) navCreateInvoice.classList.add('active-nav');

        // Llamadas a funciones específicas para la sección "Crear Factura"
        if (typeof setDefaultInvoiceDate === 'function') setDefaultInvoiceDate();
        if (typeof updateQuantityBasedOnStreaming === 'function') updateQuantityBasedOnStreaming();
        if (typeof handleDiscountChange === 'function') handleDiscountChange();
        if (typeof renderItems === 'function') renderItems(); 
        if (typeof displayNextPotentialInvoiceNumber === 'function') {
            await displayNextPotentialInvoiceNumber(); 
        }
        if (typeof loadClientsIntoDropdown === 'function') { // <--- AQUÍ ESTÁ LA LLAMADA CORRECTA
            await loadClientsIntoDropdown();
        }

    } else if (sectionToShowId === 'viewInvoicesSection') {
        targetTitle = "Mis Facturas";
        if (viewInvoicesSection) {
            viewInvoicesSection.style.display = 'block';
            viewInvoicesSection.classList.add('active-section');
        }
        if (navViewInvoices) navViewInvoices.classList.add('active-nav');
        
        if (viewInvoicesSection && viewInvoicesSection.innerHTML.trim() === '') { 
            viewInvoicesSection.innerHTML = `<h2>Mis Facturas</h2><p>Listado de facturas aparecerá aquí. Funcionalidad en desarrollo.</p><div id="invoiceListContainer"></div>`;
        }

    } else if (sectionToShowId === 'clientsSection') {
        targetTitle = "Clientes";
        if (clientsSection) {
            clientsSection.style.display = 'block';
            clientsSection.classList.add('active-section');
        }
        if (navClients) navClients.classList.add('active-nav');

        if (clientsSection && clientsSection.innerHTML.trim() === '') { 
            clientsSection.innerHTML = `<h2>Clientes</h2><p>Listado de clientes aparecerá aquí. Funcionalidad en desarrollo.</p><div id="clientListContainer"></div>`;
        }
    }

    // 3. Actualizar el título de la página de la aplicación
    if (appPageTitle) appPageTitle.textContent = targetTitle;
}
// --- Lógica de Autenticación y Estado ---
if (loginButton) {
    loginButton.addEventListener('click', () => {
        showLoading(true);
        signInWithPopup(auth, googleProvider)
            .then((result) => console.log("Usuario autenticado:", result.user.displayName))
            .catch((error) => {
                console.error("Error en login:", error);
                let msg = "Error al iniciar sesión.";
                if (error.code === 'auth/popup-closed-by-user') msg = "Ventana de login cerrada.";
                alert(msg);
            })
            .finally(() => { if (!auth.currentUser) showLoading(false); });
    });
}

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        showLoading(true);
        signOut(auth).catch((error) => console.error("Error al cerrar sesión:", error));
    });
}

onAuthStateChanged(auth, (user) => {
    showLoading(false);
    if (user) {
        if (loginContainer) loginContainer.style.display = 'none';
        if (mainContent) mainContent.style.display = 'flex'; // O 'block'
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

// === INICIO: NUEVO CÓDIGO - Listener para el desplegable de clientes ===
if (selectClient) {
    selectClient.addEventListener('change', () => {
        const selectedClientId = selectClient.value;

        if (clientNameInput && clientPhoneInput && clientEmailInput) { // Verificar que los inputs existan
            if (selectedClientId === "") {
                // Opción "-- Nuevo Cliente --" seleccionada
                clientNameInput.value = '';
                clientPhoneInput.value = '';
                clientEmailInput.value = '';
                clientNameInput.disabled = false;
                clientPhoneInput.disabled = false;
                clientEmailInput.disabled = false;
                clientNameInput.focus(); // Poner foco en el nombre para el nuevo cliente
            } else {
                // Buscar el cliente seleccionado en nuestro array 'loadedClients'
                const selectedClient = loadedClients.find(client => client.id === selectedClientId);
                if (selectedClient) {
                    clientNameInput.value = selectedClient.name || '';
                    clientPhoneInput.value = selectedClient.phone || '';
                    clientEmailInput.value = selectedClient.email || '';
                    
                    // Opcional: Deshabilitar campos cuando se selecciona un cliente existente
                    // para evitar edición accidental aquí. La edición se haría con el botón "Editar Cliente".
                    // clientNameInput.disabled = true;
                    // clientPhoneInput.disabled = true;
                    // clientEmailInput.disabled = true;
                }
            }
        }
    });
}
// === FIN: NUEVO CÓDIGO ===

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
        updateQuantityBasedOnStreaming(); // Llama para ocultar campos de perfil y resetear cantidad
        itemDescription.focus();
    });
}

if (invoiceForm) {
    invoiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) { alert("Debes iniciar sesión."); return; }
        if (currentInvoiceItems.length === 0) { alert("Agrega al menos un ítem."); return; }

        const clientName = document.getElementById('clientName')?.value.trim();
        const clientPhone = document.getElementById('clientPhone')?.value.trim();
        const clientEmail = document.getElementById('clientEmail')?.value.trim();
        if (!clientName || !clientPhone || !clientEmail) { alert("Completa los datos del cliente."); return; }
        
        if (typeof recalculateTotals === 'function') recalculateTotals();

        let actualNumericInvoiceNumber;
        let formattedInvoiceNumberStr;
        try {
            if (saveInvoiceBtn) saveInvoiceBtn.disabled = true;
            if (generateInvoiceFileBtn) generateInvoiceFileBtn.disabled = true;
            showLoading(true);
            actualNumericInvoiceNumber = await getNextInvoiceNumber(user.uid);
            formattedInvoiceNumberStr = formatInvoiceNumber(actualNumericInvoiceNumber);
        } catch (error) {
            alert("Error al generar número de factura. No se puede guardar.");
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
            alert(`¡Factura FCT-${formattedInvoiceNumberStr} guardada exitosamente! ID: ${docRef.id}`);
            // === INICIO: NUEVO CÓDIGO - Guardar nuevo cliente si es necesario ===
            if (selectClient && selectClient.value === "") { // Si la opción era "-- Nuevo Cliente --"
                const newClientData = {
                    userId: user.uid, // Asociar cliente al usuario actual
                    name: clientName,   // Usar la constante clientName definida antes
                    phone: clientPhone, // Usar la constante clientPhone
                    email: clientEmail, // Usar la constante clientEmail
                    createdAt: serverTimestamp()
                };
                try {
                    const clientDocRef = await addDoc(collection(db, "clientes"), newClientData);
                    console.log("Nuevo cliente guardado con ID: ", clientDocRef.id);
                    // === INICIO: NUEVO CÓDIGO - Recargar clientes en el desplegable ===
                    if (typeof loadClientsIntoDropdown === 'function') {
                        await loadClientsIntoDropdown();
                    }
                    // === FIN: NUEVO CÓDIGO ===
                    // No es necesario alertar al usuario por esto, es una acción secundaria
                } catch (clientError) {
                    console.error("Error al guardar el nuevo cliente: ", clientError);
                    // Podrías considerar notificar al usuario de este error si es crítico
                }
            }
            // === FIN: NUEVO CÓDIGO ===
            invoiceForm.reset();
            currentInvoiceItems = [];
            nextItemId = 0;

            // === INICIO: AQUÍ VA EL CÓDIGO DEL PUNTO E ===
            // Asegurar limpieza y habilitación de campos de cliente
            if (clientNameInput) {
                clientNameInput.value = '';
                clientNameInput.disabled = false;
            }
            if (clientPhoneInput) {
                clientPhoneInput.value = '';
                clientPhoneInput.disabled = false;
            }
            if (clientEmailInput) {
                clientEmailInput.value = '';
                clientEmailInput.disabled = false;
            }
            if(selectClient) { // Resetear el select a "-- Nuevo Cliente --"
                selectClient.value = "";
            }
            // === FIN: CÓDIGO DEL PUNTO E ===
            
            renderItems();
            setDefaultInvoiceDate();
            updateQuantityBasedOnStreaming();
            handleDiscountChange();
            await displayNextPotentialInvoiceNumber();
        } catch (error) {
            console.error("Error al guardar factura en Firestore: ", error);
            alert(`Error al guardar: ${error.message}`);
        } finally {
            if (saveInvoiceBtn) saveInvoiceBtn.disabled = false;
            if (generateInvoiceFileBtn) generateInvoiceFileBtn.disabled = false;
            showLoading(false);
        }
    });
}

if (generateInvoiceFileBtn) {
    generateInvoiceFileBtn.addEventListener('click', () => {
        alert("Funcionalidad 'Generar Factura (Archivo)' pendiente.");
    });
}
