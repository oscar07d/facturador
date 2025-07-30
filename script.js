// Importaciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithCredential,
    signInWithPopup,
    onAuthStateChanged,
    signOut,
    updateProfile, // <-- Faltaba esta
    updateEmail, // <-- Faltaba esta
    EmailAuthProvider, // <-- Faltaba esta
    reauthenticateWithCredential // <-- Faltaba esta
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
    deleteDoc,
    writeBatch
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

import { 
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-storage.js";

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
const storage = getStorage(app);

document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splashScreen');
    if (splashScreen) {
        // Ocultar la pantalla de carga después de 5 segundos
        setTimeout(() => {
            splashScreen.classList.add('hidden');
        }, 2000); // 2000 milisegundos = 2 segundos
    }
});

const allSections = [
  'homeSection',
  'createInvoiceSection',
  'viewInvoicesSection',
  'clientsSection',
  'profileSection'
];

function showSection(sectionId) {
  allSections.forEach(id => {
    document.getElementById(id).style.display =
      (id === sectionId) ? 'block' : 'none';
  });
}

// --- Selección de Elementos del DOM ---
const bodyElement = document.body;

const navHome = document.getElementById('navHome');
const homeSection = document.getElementById('homeSection');
const profileSection = document.getElementById('profileSection');
const navProfile = document.getElementById('navProfile');

const profilePhotoBtn = document.getElementById('profilePhotoBtn');
const editPhotoModal = document.getElementById('editPhotoModal');
const closeEditPhotoModalBtn = document.getElementById('closeEditPhotoModalBtn');
const cancelEditPhotoBtn = document.getElementById('cancelEditPhotoBtn');
const photoPreview = document.getElementById('photoPreview');
const photoUploadInput = document.getElementById('photoUploadInput');
const selectPhotoBtn = document.getElementById('selectPhotoBtn');
const savePhotoBtn = document.getElementById('savePhotoBtn');

const profileEmailBtn = document.getElementById('profileEmailBtn');
const editEmailModal = document.getElementById('editEmailModal');
const closeEditEmailModalBtn = document.getElementById('closeEditEmailModalBtn');
const cancelEditEmailBtn = document.getElementById('cancelEditEmailBtn');
const saveEmailBtn = document.getElementById('saveEmailBtn');
const profileEmailInput = document.getElementById('profileEmailInput');
const profilePasswordInput = document.getElementById('profilePasswordInput');

let selectedPhotoFile = null; // Variable global para la foto

const invoiceDetailModal = document.getElementById('invoiceDetailModal');
const modalInvoiceTitle = document.getElementById('modalInvoiceTitle');
const modalInvoiceDetailsContent = document.getElementById('modalInvoiceDetailsContent');
const closeInvoiceDetailModalBtn = document.getElementById('closeInvoiceDetailModalBtn');
const originalInvoiceExportTemplate = document.getElementById('invoice-export-template');
console.log("Desde script.js - originalInvoiceExportTemplate:", originalInvoiceExportTemplate);
window.myTemplate = originalInvoiceExportTemplate;
console.log("Elemento del Modal Principal:", invoiceDetailModal);
console.log("Botón de Cierre del Modal:", closeInvoiceDetailModalBtn);

const printInvoiceFromModalBtn = document.getElementById('printInvoiceFromModalBtn');

const modalShareBtn = document.getElementById('modalShareBtn');
const modalWhatsAppBtn = document.getElementById('modalWhatsAppBtn');
const modalImageBtn = document.getElementById('modalImageBtn');
console.log("modalShareBtn:", modalShareBtn);
console.log("modalWhatsAppBtn:", modalWhatsAppBtn);
console.log("modalImageBtn:", modalImageBtn);

const modalEmailBtn = document.getElementById('modalEmailBtn');
const modalPdfBtn = document.getElementById('modalPdfBtn');

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

const showNewClientFormBtn = document.getElementById('showNewClientFormBtn');
const newClientFormContainer = document.getElementById('newClientFormContainer');
const newClientForm = document.getElementById('newClientForm');
const cancelNewClientBtn = document.getElementById('cancelNewClientBtn');

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
const updateClientBtn = document.getElementById('updateClientBtn');

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

const templateSelectionModal = document.getElementById('templateSelectionModal');
const closeTemplateSelectionModalBtn = document.getElementById('closeTemplateSelectionModalBtn');
const cancelTemplateSelectionBtn = document.getElementById('cancelTemplateSelectionBtn');
const proceedWithTemplateSelectionBtn = document.getElementById('proceedWithTemplateSelectionBtn');
const isReminderCheckbox = document.getElementById('isReminderCheckbox');
const imageFormatSelectionDiv = document.getElementById('imageFormatSelection'); // Para mostrar/ocultar
const imageFormatSelect = document.getElementById('imageFormatSelect'); // Para leer el formato

const chartTimeRange = document.getElementById('chartTimeRange');
const yearFilter = document.getElementById('yearFilter');
const selectYear = document.getElementById('selectYear');
const monthFilter = document.getElementById('monthFilter');
const selectMonth = document.getElementById('selectMonth');
const dayFilter = document.getElementById('dayFilter');
const selectDay = document.getElementById('selectDay');

const weekFilter = document.getElementById('weekFilter');
const selectWeek = document.getElementById('selectWeek');

const paymentUpdateModal = document.getElementById('paymentUpdateModal');
const paymentUpdateModalTitle = document.getElementById('paymentUpdateModalTitle');
const paymentUpdateInvoiceNumber = document.getElementById('paymentUpdateInvoiceNumber');
const nextDueDateInput = document.getElementById('nextDueDateInput');
const closePaymentUpdateModalBtn = document.getElementById('closePaymentUpdateModalBtn');
const cancelSubscriptionBtn = document.getElementById('cancelSubscriptionBtn');
const confirmAndSetNextBtn = document.getElementById('confirmAndSetNextBtn');
const closeUpdateModalBtn = document.getElementById('closeUpdateModalBtn');

console.log("templateSelectionModal al cargar:", templateSelectionModal);
console.log("isReminderCheckbox al cargar:", isReminderCheckbox);
console.log("proceedWithTemplateSelectionBtn al cargar:", proceedWithTemplateSelectionBtn);

const saveInvoiceBtn = document.getElementById('saveInvoiceBtn');
const invoiceSearchInput = document.getElementById('invoiceSearchInput');
const statusFilterSelect = document.getElementById('statusFilterSelect');
const invoiceSearchBtn = document.getElementById('invoiceSearchBtn');

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
let isGeneratingPdf = false;
let currentActionForTemplateSelection = null;
let currentInvoiceDataForModalActions = null;
let currentInvoiceIdForModalActions = null;


async function saveNewClient(name, phone, email) {
    const user = auth.currentUser;
    if (!user) {
        alert("Debes iniciar sesión para guardar un cliente.");
        return false;
    }

    // Comprobar si un cliente con el mismo teléfono ya existe
    const q = query(collection(db, "clientes"), where("userId", "==", user.uid), where("phone", "==", phone));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        alert("Ya existe un cliente con este número de celular.");
        return false;
    }

    const newClientData = { 
        userId: user.uid,
        name: name, 
        phone: phone, 
        email: email, 
        createdAt: serverTimestamp(), 
        isDeleted: false, 
        estadoGeneralCliente: "Nuevo", 
        estadoUltimaFacturaCliente: "N/A"
    };

    try {
        await addDoc(collection(db, "clientes"), newClientData);
        alert("¡Cliente guardado con éxito!");
        return true;
    } catch (error) {
        console.error("Error al guardar nuevo cliente:", error);
        alert("Hubo un error al guardar el cliente.");
        return false;
    }
}

// Variable global para guardar la instancia de la gráfica
let revenueChartInstance = null;

async function loadDashboardData() {
    showLoading(true);
    const user = auth.currentUser;
    if (!user) {
        showLoading(false);
        return;
    }

    try {
        const invoicesQuery = query(collection(db, "facturas"), where("userId", "==", user.uid));
        const clientsQuery = query(collection(db, "clientes"), where("userId", "==", user.uid));
        
        const [invoicesSnapshot, clientsSnapshot] = await Promise.all([
            getDocs(invoicesQuery),
            getDocs(clientsQuery)
        ]);

        const allInvoicesData = [];
        invoicesSnapshot.forEach(doc => {
            allInvoicesData.push(doc.data());
        });

        // --- 1. Procesar datos para las tarjetas de métricas y lista de ítems ---
        let totalRevenue = 0, totalDiscounts = 0;
        const itemCounts = {};

        allInvoicesData.forEach(invoice => {
            if (invoice.paymentStatus !== 'cancelled') {
                totalRevenue += invoice.totals?.grandTotal || 0;
                totalDiscounts += invoice.totals?.discountApplied || 0;
                invoice.items?.forEach(item => {
                    const itemName = item.description?.trim();
                    if(itemName) {
                       const normalizedName = normalizeItemName(itemName);
                       itemCounts[normalizedName] = (itemCounts[normalizedName] || 0) + item.quantity;
                    }
                });
            }
        });
        
        const activeClients = clientsSnapshot.docs.filter(doc => !doc.data().isDeleted).length;
        document.getElementById('dashboardTotalRevenue').textContent = totalRevenue.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
        document.getElementById('dashboardTotalDiscounts').textContent = totalDiscounts.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
        document.getElementById('dashboardActiveClients').textContent = activeClients;
        document.getElementById('dashboardInactiveClients').textContent = clientsSnapshot.docs.length - activeClients;

        const sortedItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const topItemsList = document.getElementById('dashboardTopItems');
        topItemsList.innerHTML = '';
        if (sortedItems.length > 0) {
            sortedItems.forEach(([name, count]) => {
                const li = document.createElement('li');
                const logoSrc = getIconForItem(name);
                let logoHtml = logoSrc ? `<img src="${logoSrc}" alt="${name}" class="item-logo">` : '<div class="item-logo-placeholder"></div>';
                const displayName = name.charAt(0).toUpperCase() + name.slice(1);
                li.innerHTML = `<div class="item-name-container">${logoHtml}<span>${displayName}</span></div><span class="pill-count">${count}</span>`;
                topItemsList.appendChild(li);
            });
        } else {
            topItemsList.innerHTML = '<li>No hay datos de ítems vendidos.</li>';
        }

        // --- 2. Lógica de filtrado para la gráfica ---
        const timeRange = chartTimeRange.value;
        const selectedYear = parseInt(selectYear.value);
        const selectedMonth = parseInt(selectMonth.value);
        const selectedDay = selectDay.value;
        const flatpickrInstance = document.querySelector("#selectWeek")?._flatpickr;
        
        let filteredInvoicesForChart = [];
        const now = new Date();
        
        switch (timeRange) {
            case 'year':
                filteredInvoicesForChart = allInvoicesData.filter(inv => inv.invoiceDate && new Date(inv.invoiceDate + 'T00:00:00').getFullYear() === selectedYear);
                break;
            case 'month':
                filteredInvoicesForChart = allInvoicesData.filter(inv => inv.invoiceDate && new Date(inv.invoiceDate + 'T00:00:00').getFullYear() === selectedYear && new Date(inv.invoiceDate + 'T00:00:00').getMonth() === selectedMonth);
                break;
            case 'week':
                if (flatpickrInstance?.selectedDates.length > 0) {
                    const selectedDate = flatpickrInstance.selectedDates[0];
                    const weekNumber = getWeekNumber(selectedDate);
                    const year = selectedDate.getFullYear();
                    const weekDates = getWeekDates(weekNumber, year);
                    filteredInvoicesForChart = allInvoicesData.filter(inv => inv.invoiceDate && new Date(inv.invoiceDate) >= weekDates.start && new Date(inv.invoiceDate) <= weekDates.end);
                }
                break;
            case 'day':
                filteredInvoicesForChart = allInvoicesData.filter(inv => inv.invoiceDate === selectedDay);
                break;
            default: // last12months
                const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
                filteredInvoicesForChart = allInvoicesData.filter(inv => inv.invoiceDate && new Date(inv.invoiceDate) >= twelveMonthsAgo);
                break;
        }

        // --- 3. Preparar y dibujar la gráfica con los datos filtrados ---
        const chartDataPoints = {};
        let chartType = 'line';
        let titleSuffix = "de los Últimos 12 Meses";
        
        if (timeRange === 'last12months' || timeRange === 'year') {
            chartType = 'line';
            const yearForLabels = (timeRange === 'year') ? selectedYear : now.getFullYear();
            for (let i = 0; i < 12; i++) {
                const monthDate = new Date(yearForLabels, i, 2);
                const monthKey = monthDate.toISOString().substring(0, 7);
                chartDataPoints[monthKey] = 0;
            }
            filteredInvoicesForChart.forEach(inv => {
                if (inv.paymentStatus !== 'cancelled' && inv.invoiceDate) {
                    const monthKey = inv.invoiceDate.substring(0, 7);
                    if (chartDataPoints.hasOwnProperty(monthKey)) {
                        chartDataPoints[monthKey] += inv.totals?.grandTotal || 0;
                    }
                }
            });
            titleSuffix = (timeRange === 'year') ? `del Año ${selectedYear}` : "de los Últimos 12 Meses";
        } else {
            chartType = 'bar';
            filteredInvoicesForChart.forEach(inv => {
                if (inv.paymentStatus !== 'cancelled' && inv.invoiceDate) {
                    const dateKey = inv.invoiceDate;
                    chartDataPoints[dateKey] = (chartDataPoints[dateKey] || 0) + (inv.totals?.grandTotal || 0);
                }
            });
            if (timeRange === 'month') titleSuffix = `de ${selectMonth.options[selectMonth.selectedIndex].text} de ${selectedYear}`;
            if (timeRange === 'week' && flatpickrInstance) titleSuffix = `de la ${flatpickrInstance.input.value}`;
            if (timeRange === 'day') titleSuffix = `del ${new Date(selectedDay + 'T00:00:00').toLocaleDateString('es-CO', {dateStyle: 'long'})}`;
        }
        
        const sortedKeys = Object.keys(chartDataPoints).sort((a, b) => new Date(a) - new Date(b));
        const chartLabels = sortedKeys.map(key => {
            const date = new Date(key + 'T12:00:00Z');
            if (timeRange === 'year' || timeRange === 'last12months') {
                return date.toLocaleString('es-CO', { month: 'short' });
            }
            return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
        });
        const chartDataset = sortedKeys.map(key => chartDataPoints[key]);
        
        document.querySelector('.chart-container h4').textContent = `Ingresos ${titleSuffix}`;
        
        const ctx = document.getElementById('monthlyRevenueChart').getContext('2d');
        if (revenueChartInstance) {
            revenueChartInstance.destroy();
        }
        
        revenueChartInstance = new Chart(ctx, {
            type: chartType,
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Ingresos',
                    data: chartDataset,
                    borderColor: 'rgba(0, 123, 255, 1)',
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    fill: chartType === 'line',
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

    } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
    } finally {
        showLoading(false);
    }
}

// --- Funciones Auxiliares y de UI ---
const showLoading = (show) => {
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
};

/**
 * Normaliza el nombre de un ítem para agrupar productos similares.
 * Convierte a minúsculas y quita texto entre paréntesis.
 * @param {string} description - La descripción completa del ítem.
 * @returns {string} - El nombre normalizado.
 */
function normalizeItemName(description) {
    if (!description) return '';
    return description
        .toLowerCase() // Convertir a minúsculas
        .split('(')[0]   // Tomar solo la parte antes del primer '('
        .trim();         // Quitar espacios extra al inicio o final
}

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
    // Esta función ahora solo se encarga de recolectar los datos.
    // La validación se hará en el listener del formulario.

    recalculateTotals();

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
            email: clientEmailInput.value.trim(), // Se guarda aunque esté vacío
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

/**
 * Devuelve la ruta del icono de un producto basándose en su nombre.
 * @param {string} itemName - El nombre del ítem/producto.
 * @returns {string|null} - La ruta a la imagen del logo o null si no hay coincidencia.
 */
function getIconForItem(itemName) {
    const name = itemName.toLowerCase(); // Convertimos a minúsculas para una comparación más fácil

    if (name.includes('prime video')) {
        return 'img/logos/prime_video.png'; // Asegúrate de que el nombre del archivo coincida
    }
    if (name.includes('max') || name.includes('hbo')) {
        return 'img/logos/HBO Max.png';
    }
    if (name.includes('netflix')) {
        return 'img/logos/netflix.png';
    }
    if (name.includes('disney')) {
        return 'img/logos/disney_plus.png';
    }
    if (name.includes('spotify')) {
        return 'img/logos/spotify.png';
    }
    // ——————————————————————
    // 1. Cocina
    if (
        name.includes('cocina') || name.includes('olla') || name.includes('cazuela') || name.includes('cazo') ||
        name.includes('sartén') || name.includes('wok') || name.includes('paellera') || name.includes('perol') ||
        name.includes('cuchara') || name.includes('cucharón') || name.includes('cucharilla') || name.includes('cuchara de palo') ||
        name.includes('tenedor') || name.includes('tenedor de mesa') || name.includes('tenedor de postre') ||
        name.includes('cuchillo') || name.includes('cuchillo chef') || name.includes('cuchillo pan') || name.includes('pelador') ||
        name.includes('pelador zebra') || name.includes('pelador juliana') || name.includes('rallador') || name.includes('mortero') ||
        name.includes('mano de mortero') || name.includes('espátula') || name.includes('raspador') || name.includes('turner') ||
        name.includes('batidor') || name.includes('whisk') || name.includes('varilla batidora') ||
        name.includes('tabla') || name.includes('tabla picar') || name.includes('tabla cortar') || name.includes('tabla sushi') ||
        name.includes('recipiente') || name.includes('tazón') || name.includes('bol') || name.includes('cuenco') ||
        name.includes('jarra') || name.includes('medidor') || name.includes('vaso medidor') || name.includes('taza medidora') ||
        name.includes('embudo') || name.includes('cono filtrante') || name.includes('colador') || name.includes('cedazo') ||
        name.includes('tamiz') || name.includes('molde') || name.includes('molde pastel') || name.includes('molde pan') ||
        name.includes('molde muffins') || name.includes('rodillo') || name.includes('amasador') || name.includes('reposa pasta') ||
        name.includes('horno') || name.includes('microondas') || name.includes('tostadora') || name.includes('sandwichera') ||
        name.includes('freidora') || name.includes('freidora aire') || name.includes('air fryer') || name.includes('cafetera') ||
        name.includes('prensa francesa') || name.includes('espresso') || name.includes('cafetera moka') ||
        name.includes('licuadora') || name.includes('procesador') || name.includes('batidora inmersión') ||
        name.includes('minipimer') || name.includes('trapo cocina') || name.includes('limpión') ||
        name.includes('paño cocina') || name.includes('bayeta cocina') || name.includes('bayeta grasa') ||
        name.includes('esponja cocina') || name.includes('estropajo cocina') || name.includes('esponjilla') ||
        name.includes('moldes repostería') || name.includes('piedra pizza') || name.includes('piedra horno')
    ) {
        return 'img/logos/cocina.png'; // Cocina
    }
    
    // ——————————————————————
    // 2. Aseo del hogar
    if (
        name.includes('aseo hogar') || name.includes('limpieza') || name.includes('desinfección') || name.includes('higienización') ||
        name.includes('escoba') || name.includes('broom') || name.includes('recogedor') || name.includes('dustpan') ||
        name.includes('mopa') || name.includes('trapero') || name.includes('fregona') || name.includes('mop') ||
        name.includes('cubeta') || name.includes('balde') || name.includes('cubo escurridor') || name.includes('bucket') ||
        name.includes('plumero') || name.includes('feather duster') || name.includes('cepillo piso') || name.includes('floor brush') ||
        name.includes('cepillo esquinas') || name.includes('corner brush') || name.includes('paño') || name.includes('bayeta') ||
        name.includes('trapo') || name.includes('trapo multiuso') || name.includes('esponja') || name.includes('estropajo') ||
        name.includes('esponja multiuso') || name.includes('spray') || name.includes('pulverizador') || name.includes('atomizador') ||
        name.includes('detergente') || name.includes('jabón líquido') || name.includes('jabón polvo') || name.includes('lejía') ||
        name.includes('cloro') || name.includes('bleach') || name.includes('desinfectante') || name.includes('antiséptico') ||
        name.includes('limpiavidrios') || name.includes('glass cleaner') || name.includes('aspiradora') || name.includes('vacuum') ||
        name.includes('vaporizador') || name.includes('steam mop') || name.includes('escurridor') || name.includes('fregadero')
    ) {
        return 'img/logos/aseo_hogar.png'; // Aseo del hogar
    }
    
    // ——————————————————————
    // 3. Aseo personal
    if (
        name.includes('aseo personal') || name.includes('higiene personal') || name.includes('cuidado personal') ||
        name.includes('jabón') || name.includes('gel baño') || name.includes('gel ducha') || name.includes('jabón corporal') ||
        name.includes('shampoo') || name.includes('acondicionador') || name.includes('tónico capilar') ||
        name.includes('cotonete') || name.includes('hisopo') || name.includes('algodón') ||
        name.includes('cepillo dientes') || name.includes('pasta dental') || name.includes('hilo dental') || name.includes('enjuague bucal') ||
        name.includes('rasuradora') || name.includes('afeitadora') || name.includes('maquinilla') || name.includes('crema afeitar') ||
        name.includes('toalla facial') || name.includes('toalla mano') || name.includes('toalla baño') ||
        name.includes('esponja facial') || name.includes('lufa') || name.includes('esponja corporal') ||
        name.includes('desodorante') || name.includes('antitranspirante') || name.includes('spray axilas') ||
        name.includes('crema hidratante') || name.includes('loción corporal') || name.includes('aceite corporal') ||
        name.includes('cepillo cabello') || name.includes('peine') || name.includes('secador pelo') || name.includes('planchita')
    ) {
        return 'img/logos/aseo_personal.png'; // Aseo personal
    }
    
    // ——————————————————————
    // 4. Frutas
    if (
        name.includes('fruta') || name.includes('frutas') || name.includes('frutería') ||
        name.includes('manzana') || name.includes('pera') || name.includes('plátano') || name.includes('banana') ||
        name.includes('fresa') || name.includes('kiwi') || name.includes('durazno') || name.includes('melocotón') ||
        name.includes('nectarina') || name.includes('uva') || name.includes('cereza') || name.includes('piña') ||
        name.includes('mango') || name.includes('papaya') || name.includes('maracuyá') || name.includes('naranja') ||
        name.includes('mandarina') || name.includes('limón') || name.includes('lima') || name.includes('pomelo') ||
        name.includes('toronja') || name.includes('arándano') || name.includes('frambuesa')
    ) {
        return 'img/logos/alimento_frutas.png'; // Frutas
    }
    
    // ——————————————————————
    // 5. Verduras
    if (
        name.includes('verdura') || name.includes('verduras') || name.includes('hortaliza') || name.includes('legumbre') ||
        name.includes('zanahoria') || name.includes('tomate') || name.includes('lechuga') || name.includes('espinaca') ||
        name.includes('col') || name.includes('repollo') || name.includes('acelga') || name.includes('pimiento') ||
        name.includes('pepino') || name.includes('berenjena') || name.includes('calabaza') || name.includes('brócoli') ||
        name.includes('coliflor') || name.includes('ajo') || name.includes('cebolla') || name.includes('espárrago') ||
        name.includes('alcachofa') || name.includes('rábano') || name.includes('okra') || name.includes('apio')
    ) {
        return 'img/logos/alimento_verduras.png'; // Verduras
    }
    
    // ——————————————————————
    // 6. Carnes y proteínas
    if (
        name.includes('carne') || name.includes('carnes') || name.includes('proteína') || name.includes('proteínas') ||
        name.includes('pollo') || name.includes('cerdo') || name.includes('res') || name.includes('cordero') ||
        name.includes('jamón') || name.includes('tocino') || name.includes('salchicha') || name.includes('embutido') ||
        name.includes('chorizo') || name.includes('pescado') || name.includes('atún') || name.includes('salmón') ||
        name.includes('merluza') || name.includes('bacalao') || name.includes('marisco') || name.includes('camarón') ||
        name.includes('langosta') || name.includes('mejillón') || name.includes('ostra') || name.includes('huevo') ||
        name.includes('huevos') || name.includes('pavo') || name.includes('anchoa')
    ) {
        return 'img/logos/alimento_carnes.png'; // Carnes y proteínas
    }
    
    // ——————————————————————
    // 7. Lácteos
    if (
        name.includes('lácteo') || name.includes('lacteos') || name.includes('leche') || name.includes('yogur') ||
        name.includes('queso') || name.includes('mantequilla') || name.includes('nata') || name.includes('crema agria') ||
        name.includes('suero') || name.includes('kefir') || name.includes('requesón')
    ) {
        return 'img/logos/alimento_lacteos.png'; // Lácteos
    }
    
    // ——————————————————————
    // 8. Panadería y cereales
    if (
        name.includes('pan') || name.includes('bollo') || name.includes('baguette') || name.includes('croissant') ||
        name.includes('rosquilla') || name.includes('donut') || name.includes('cereal') || name.includes('harina') ||
        name.includes('avena') || name.includes('granola') || name.includes('pan integral') || name.includes('arroz') ||
        name.includes('pasta') || name.includes('fideos') || name.includes('espagueti') || name.includes('macarrones')
    ) {
        return 'img/logos/alimento_panaderia.png'; // Panadería y cereales
    }
    
    // ——————————————————————
    // 9. Bebidas
    if (
        name.includes('bebida') || name.includes('bebidas') || name.includes('jugo') || name.includes('batido') ||
        name.includes('licuado') || name.includes('té') || name.includes('café') || name.includes('gaseosa') ||
        name.includes('refresco') || name.includes('soda') || name.includes('agua') || name.includes('infusión') ||
        name.includes('smoothie') || name.includes('shake')
    ) {
        return 'img/logos/bebidas.png'; // Bebidas
    }
    
    // ——————————————————————
    // 10. Electrodomésticos
    if (
        name.includes('electrodoméstico') || name.includes('electrodomesticos') || name.includes('microondas') ||
        name.includes('horno') || name.includes('refrigerador') || name.includes('nevera') || name.includes('congelador') ||
        name.includes('lavadora') || name.includes('secadora') || name.includes('lavavajillas') || name.includes('cafetera') ||
        name.includes('tostadora') || name.includes('licuadora') || name.includes('procesador') || name.includes('batidora') ||
        name.includes('sandwichera') || name.includes('freidora') || name.includes('aspiradora') ||
        name.includes('humidificador') || name.includes('ventilador') || name.includes('aire acondicionado') ||
        name.includes('calefactor') || name.includes('plancha')
    ) {
        return 'img/logos/electrodomesticos.png'; // Electrodomésticos
    }
    
    // ——————————————————————
    // 11. Muebles – Sala
    if (
        name.includes('sala') || name.includes('mueble sala') || name.includes('sofá') || name.includes('sofa') ||
        name.includes('sillón') || name.includes('sillon') || name.includes('mesa centro') || name.includes('mesita') ||
        name.includes('estantería') || name.includes('librero') || name.includes('alfombra') || name.includes('lampara pie') ||
        name.includes('lampara') || name.includes('apoyapiés') || name.includes('otoman')
    ) {
        return 'img/logos/mueble_sala.png'; // Muebles - Sala
    }
    
    // ——————————————————————
    // 12. Muebles – Comedor
    if (
        name.includes('comedor') || name.includes('mueble comedor') || name.includes('mesa comedor') ||
        name.includes('silla comedor') || name.includes('aparador') || name.includes('buffet') ||
        name.includes('vajilla') || name.includes('mantel') || name.includes('servilleta') || name.includes('copas')
    ) {
        return 'img/logos/mueble_comedor.png'; // Muebles - Comedor
    }
    
    // ——————————————————————
    // 13. Muebles – Dormitorio
    if (
        name.includes('dormitorio') || name.includes('mueble dormitorio') || name.includes('cama') ||
        name.includes('somier') || name.includes('colchón') || name.includes('armario') ||
        name.includes('closet') || name.includes('ropero') || name.includes('tocador') ||
        name.includes('cojín') || name.includes('cobija') || name.includes('edredón') ||
        name.includes('colcha') || name.includes('mesita noche')
    ) {
        return 'img/logos/mueble_dormitorio.png'; // Muebles - Dormitorio
    }
    
    // ——————————————————————
    // 14. Oficina en casa
    if (
        name.includes('oficina') || name.includes('home office') || name.includes('escritorio') ||
        name.includes('silla ergonómica') || name.includes('silla oficina') || name.includes('librero oficina') ||
        name.includes('archivador') || name.includes('monitor') || name.includes('teclado') ||
        name.includes('ratón') || name.includes('mouse') || name.includes('impresora')
    ) {
        return 'img/logos/oficina.png'; // Oficina en casa
    }
    
    // ——————————————————————
    // 15. Jardín / Terraza
    if (
        name.includes('jardín') || name.includes('jardin') || name.includes('terraza') || name.includes('patio') ||
        name.includes('exterior') || name.includes('balcón') || name.includes('maceta') || name.includes('regadera') ||
        name.includes('semillas') || name.includes('abono') || name.includes('césped') || name.includes('césped sintético') ||
        name.includes('tijeras poda') || name.includes('tijeras de poda') || name.includes('poda') ||
        name.includes('pesticidas') || name.includes('herbicida') || name.includes('fungicida') ||
        name.includes('cerca madera') || name.includes('valla madera') || name.includes('hamaca') ||
        name.includes('tumbona') || name.includes('mesa exterior') || name.includes('silla exterior')
    ) {
        return 'img/logos/jardin.png'; // Jardín / Terraza
    }
    
    // ——————————————————————
    // 16. Snacks y golosinas
    if (
        name.includes('snack') || name.includes('snacks') || name.includes('aperitivo') || name.includes('tapa') ||
        name.includes('golosina') || name.includes('galleta') || name.includes('papas fritas') || name.includes('chips') ||
        name.includes('chocolate') || name.includes('frutos secos') || name.includes('nuts') || name.includes('pistacho')
    ) {
        return 'img/logos/snacks.png'; // Snacks y golosinas
    }
    
    // ——————————————————————
    // 17. Mascotas
    if (
        name.includes('mascota') || name.includes('perro') || name.includes('gato') || name.includes('felino') ||
        name.includes('canino') || name.includes('alimento perro') || name.includes('alimento gato') ||
        name.includes('comida perro') || name.includes('comida gato') || name.includes('juguete mascota') ||
        name.includes('collar') || name.includes('correa') || name.includes('cama mascota') ||
        name.includes('bebedero') || name.includes('comedero')
    ) {
        return 'img/logos/mascotas.png'; // Mascotas
    }
    
    // ——————————————————————
    // 18. Bebés
    if (
        name.includes('bebé') || name.includes('bebe') || name.includes('pañal') || name.includes('pañales') ||
        name.includes('biberón') || name.includes('fórmula') || name.includes('chupete') || name.includes('tetina') ||
        name.includes('cochecito') || name.includes('cuna') || name.includes('moisés') || name.includes('pañalera')
    ) {
        return 'img/logos/bebes.png'; // Bebés
    }
    
    // ——————————————————————
    // 19. Bebidas alcohólicas
    if (
        name.includes('vino') || name.includes('cerveza') || name.includes('licor') || name.includes('coctel') ||
        name.includes('cocktail') || name.includes('whisky') || name.includes('vodka') || name.includes('ron') ||
        name.includes('ginebra') || name.includes('tequila') || name.includes('champán') || name.includes('moscato')
    ) {
        return 'img/logos/bebidas_alcoholicas.png'; // Bebidas alcohólicas
    }
    
    // ——————————————————————
    // 20. Tecnología y domótica
    if (
        name.includes('tecnología') || name.includes('domótica') || name.includes('smartphone') ||
        name.includes('tablet') || name.includes('laptop') || name.includes('ordenador') ||
        name.includes('router') || name.includes('altavoz') || name.includes('televisor') ||
        name.includes('tv') || name.includes('consola') || name.includes('videojuego') ||
        name.includes('smartwatch') || name.includes('dron')
    ) {
        return 'img/logos/tecnologia.png'; // Tecnología y domótica
    }
    
    // ——————————————————————
    // 21. Textiles y costura
    if (
        name.includes('textil') || name.includes('costura') || name.includes('tela') || name.includes('sábana') ||
        name.includes('sabana') || name.includes('toalla') || name.includes('cortina') || name.includes('hilo') ||
        name.includes('aguja') || name.includes('botón') || name.includes('botones') || name.includes('tijeras costura') ||
        name.includes('tijera costura') || name.includes('manta') || name.includes('colcha') || name.includes('edredón') ||
        name.includes('cojín') || name.includes('alfombra tela')
    ) {
        return 'img/logos/textiles_costura.png'; // Textiles y costura
    }
    
    // ——————————————————————
    // 22. Medicamentos e implementos médicos
    if (
        name.includes('medicamento') || name.includes('medicina') || name.includes('pastilla') || name.includes('jarabe') ||
        name.includes('antibiótico') || name.includes('analgésico') || name.includes('jeringa') || name.includes('inyección') ||
        name.includes('termómetro') || name.includes('tensiómetro') || name.includes('glucometro') ||
        name.includes('venda') || name.includes('esparadrapo') || name.includes('gasas') || name.includes('curita') ||
        name.includes('ferula') || name.includes('muleta') || name.includes('andadera') || name.includes('silla ruedas') ||
        name.includes('oxímetro') || name.includes('estetoscopio') || name.includes('bata médica') ||
        name.includes('guantes médicos') || name.includes('mascarilla') || name.includes('tapabocas')
    ) {
        return 'img/logos/medicamentos.png'; // Medicamentos e implementos médicos
    }
    
    // ——————————————————————
    // 23. Viajes y transporte
    if (
        name.includes('viaje') || name.includes('viajes') || name.includes('transporte') || name.includes('transporte público') ||
        name.includes('autobús') || name.includes('bus') || name.includes('metro') || name.includes('tren') ||
        name.includes('avión') || name.includes('barco') || name.includes('crucero') || name.includes('taxi') ||
        name.includes('bicicleta') || name.includes('coche') || name.includes('auto') || name.includes('automóvil') ||
        name.includes('maleta') || name.includes('equipaje') || name.includes('maletas') || name.includes('boleto') ||
        name.includes('ticket') || name.includes('pasaje') || name.includes('ferrocarril')
    ) {
        return 'img/logos/viajes_transporte.png'; // Viajes y transporte
    }
    // ...puedes añadir más 'if' para otros servicios aquí...

    return null; // Devuelve null si no se encuentra un logo conocido
}

function generateRandomAlphanumericCode(length = 7) { // Longitud por defecto de 7 caracteres
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let resultCode = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        resultCode += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return resultCode;
}

function populateExportTemplate(invoiceData) {
    if (!originalInvoiceExportTemplate || !invoiceData) { // Verifica que originalInvoiceExportTemplate exista
        console.error("Plantilla de exportación (#invoice-export-template) o datos de factura no disponibles.");
        return false;
    }

    const template = originalInvoiceExportTemplate; // Usamos la plantilla original del DOM

    // --- Poblar Logo ---
    const logoPlaceholderEl = template.querySelector("#export-logo-placeholder");
    if (logoPlaceholderEl) {
        if (invoiceData.emitter?.name) {
            logoPlaceholderEl.textContent = `Logo de ${invoiceData.emitter.name.substring(0,15)}`;
        } else {
            logoPlaceholderEl.textContent = "Logo Aquí";
        }
    }

    // --- Poblar Estado de Pago ---
    const paymentStatusEl = template.querySelector("#export-payment-status");
    if (paymentStatusEl) {
        const statusKey = invoiceData.paymentStatus || 'pending';
        // Asegúrate que paymentStatusDetails esté definido globalmente y accesible aquí
        const statusDetail = paymentStatusDetails[statusKey]; 
        paymentStatusEl.textContent = statusDetail ? statusDetail.text.toUpperCase() : statusKey.replace(/_/g, ' ').toUpperCase();
        paymentStatusEl.className = `payment-status-badge export-status-${statusKey.toLowerCase()}`;
    }

    // --- Poblar Datos del Emisor (Tu Comercio) ---
    const emitterNameEl = template.querySelector("#export-emitter-name");
    // El H3 para el nombre del comercio:
    if (emitterNameEl) {
        emitterNameEl.textContent = invoiceData.emitter?.name || "OSCAR 07D Studios"; // Nombre de tu estudio
        console.log("Emitter Name en PDF:", emitterNameEl.textContent); // DEBUG
    }

    // NIT/ID
    const emitterIdLineEl = template.querySelector("#export-emitter-id-line");
    const emitterIdEl = template.querySelector("#export-emitter-id");
    if (invoiceData.emitter?.id && emitterIdEl) {
        emitterIdEl.textContent = invoiceData.emitter.id;
        if (emitterIdLineEl) emitterIdLineEl.style.display = 'block'; // O 'flex' si es un contenedor flex
        console.log("Emitter ID en PDF:", invoiceData.emitter.id); // DEBUG
    } else if (emitterIdLineEl) {
        emitterIdLineEl.style.display = 'none';
        console.log("Emitter ID Line ocultada para PDF"); // DEBUG
    }

    // Dirección
    const emitterAddressLineEl = template.querySelector("#export-emitter-address-line");
    const emitterAddressEl = template.querySelector("#export-emitter-address");
    if (invoiceData.emitter?.address && emitterAddressEl) {
        emitterAddressEl.textContent = invoiceData.emitter.address;
        if (emitterAddressLineEl) emitterAddressLineEl.style.display = 'block';
        console.log("Emitter Address en PDF:", invoiceData.emitter.address); // DEBUG
    } else if (emitterAddressLineEl) {
        emitterAddressLineEl.style.display = 'none';
        console.log("Emitter Address Line ocultada para PDF"); // DEBUG
    }

    // Teléfono
    const emitterPhoneLineEl = template.querySelector("#export-emitter-phone-line");
    const emitterPhoneEl = template.querySelector("#export-emitter-phone");
    if (invoiceData.emitter?.phone && emitterPhoneEl) {
        emitterPhoneEl.textContent = invoiceData.emitter.phone;
        if (emitterPhoneLineEl) emitterPhoneLineEl.style.display = 'block';
        console.log("Emitter Phone en PDF:", invoiceData.emitter.phone); // DEBUG
    } else if (emitterPhoneLineEl) {
        emitterPhoneLineEl.style.display = 'none';
        console.log("Emitter Phone Line ocultada para PDF"); // DEBUG
    }

    // Email
    const emitterEmailLineEl = template.querySelector("#export-emitter-email-line");
    const emitterEmailEl = template.querySelector("#export-emitter-email");
    if (invoiceData.emitter?.email && emitterEmailEl) {
        emitterEmailEl.textContent = invoiceData.emitter.email;
        if (emitterEmailLineEl) emitterEmailLineEl.style.display = 'block';
        console.log("Emitter Email en PDF:", invoiceData.emitter.email); // DEBUG
    } else if (emitterEmailLineEl) {
        emitterEmailLineEl.style.display = 'none';
        console.log("Emitter Email Line ocultada para PDF"); // DEBUG
    }

    // --- Fecha de Generación del Archivo ---
    const imageGenDateLineEl = template.querySelector("#export-image-generation-date-line");
    const imageGenDateEl = template.querySelector("#export-image-generation-date");
    if (imageGenDateEl && invoiceData.generatedAt) { // Verifica que generatedAt exista en invoiceData
         imageGenDateEl.textContent = new Date(invoiceData.generatedAt).toLocaleString('es-CO', { day:'2-digit', month: 'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    } else if (imageGenDateEl) {
        imageGenDateEl.textContent = new Date().toLocaleString('es-CO', { day:'2-digit', month: 'short', year:'numeric', hour:'2-digit', minute:'2-digit' }); // Fallback a fecha actual
    }

    if (imageGenDateLineEl && imageGenDateLineEl.firstChild) {
         imageGenDateLineEl.firstChild.textContent = "Archivo Generado: ";
    }

    // --- Poblar Datos del Cliente ---
    const clientNameEl = template.querySelector("#export-client-name");
    if (clientNameEl) clientNameEl.innerHTML = `<strong>${invoiceData.client?.name || 'N/A'}</strong>`;

    const clientEmailLineEl = template.querySelector("#export-client-email-line");
    const clientEmailEl = template.querySelector("#export-client-email");
    if (invoiceData.client?.email) {
        if (clientEmailEl) clientEmailEl.textContent = invoiceData.client.email;
        if (clientEmailLineEl) clientEmailLineEl.style.display = 'block';
    } else if (clientEmailLineEl) {
        clientEmailLineEl.style.display = 'none';
    }
    const clientPhoneEl = template.querySelector("#export-client-phone");
    if (clientPhoneEl) clientPhoneEl.textContent = invoiceData.client?.phone || 'N/A';

    // --- Poblar Detalles de la Factura (Número, Fecha de Emisión de Factura) ---
    const invNumEl = template.querySelector("#export-invoice-sequential-number");
    if (invNumEl) invNumEl.textContent = invoiceData.invoiceNumberFormatted || 'N/A';

    const invDateEl = template.querySelector("#export-invoice-date");
    if (invDateEl) invDateEl.textContent = invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate + 'T00:00:00').toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric'}) : 'N/A';

    // Fecha de Pago (recurrente)
    const dueDateLineEl = template.querySelector("#export-due-date-line");
    const dueDateEl = template.querySelector("#export-due-date");
    if (invoiceData.serviceStartDate) {
        if(dueDateEl) dueDateEl.textContent = new Date(invoiceData.serviceStartDate + 'T00:00:00').toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric'});
        if(dueDateLineEl) dueDateLineEl.style.display = 'block';
    } else if (dueDateLineEl) {
        dueDateLineEl.style.display = 'none';
    }

    // Código Alfanumérico de Consulta
    const uniqueCodeEl = template.querySelector("#export-unique-alphanumeric-code");
    if (uniqueCodeEl) {
        // DEBUG: Verifica qué hay en invoiceData.uniqueQueryCode
        console.log("Código de consulta para PDF:", invoiceData.uniqueQueryCode); 

        if (invoiceData.uniqueQueryCode) {
            uniqueCodeEl.textContent = invoiceData.uniqueQueryCode;
        } else {
            uniqueCodeEl.textContent = "N/D"; // O "---" si no hay código
        }
    }

    if (uniqueCodeEl) {
        uniqueCodeEl.textContent = invoiceData.uniqueQueryCode || "N/D"; // Muestra el código o N/D si no existe
    }

    // --- Poblar Ítems de la Factura ---
    const itemsTableBody = template.querySelector("#export-invoice-items-body");
    const headerProfileEl = template.querySelector("#export-header-profile");
    const headerPinEl = template.querySelector("#export-header-pin");

    if (itemsTableBody) itemsTableBody.innerHTML = ''; 

    let hasStreamingItemsWithDetails = false;
    if (invoiceData.items && Array.isArray(invoiceData.items)) {
        invoiceData.items.forEach(item => {
            if (item.isStreaming && (item.profileName || item.profilePin)) {
                hasStreamingItemsWithDetails = true;
            }
            const row = itemsTableBody.insertRow();

            const cellDesc = row.insertCell();
            let descContent = item.description || 'N/A';
            if (item.isStreaming && item.profileName) {
                descContent += `<small class="item-profile-details-export">Perfil: ${item.profileName}${item.profilePin ? ` (PIN: ${item.profilePin})` : ''}</small>`;
            }
            cellDesc.innerHTML = descContent;
            cellDesc.style.padding = '10px'; cellDesc.style.borderBottom = '1px solid #eee'; cellDesc.style.verticalAlign = 'top';

            const cellProfile = row.insertCell();
            cellProfile.textContent = item.isStreaming ? (item.profileName || '-') : '-';
            cellProfile.style.padding = '10px'; cellProfile.style.borderBottom = '1px solid #eee'; cellProfile.style.verticalAlign = 'top';

            const cellPin = row.insertCell();
            cellPin.textContent = item.isStreaming ? (item.profilePin || '-') : '-';
            cellPin.style.padding = '10px'; cellPin.style.borderBottom = '1px solid #eee'; cellPin.style.verticalAlign = 'top';

            const cellQty = row.insertCell();
            cellQty.textContent = item.quantity || 0;
            cellQty.classList.add('text-right');
            cellQty.style.padding = '10px'; cellQty.style.borderBottom = '1px solid #eee'; cellQty.style.verticalAlign = 'top';

            const cellPrice = row.insertCell();
            cellPrice.textContent = (item.price || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
            cellPrice.classList.add('text-right');
            cellPrice.style.padding = '10px'; cellPrice.style.borderBottom = '1px solid #eee'; cellPrice.style.verticalAlign = 'top';

            const cellTotal = row.insertCell();
            cellTotal.textContent = ((item.quantity || 0) * (item.price || 0)).toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
            cellTotal.classList.add('text-right');
            cellTotal.style.padding = '10px'; cellTotal.style.borderBottom = '1px solid #eee'; cellTotal.style.verticalAlign = 'top';
        });
    }

    if (headerProfileEl) headerProfileEl.style.display = hasStreamingItemsWithDetails ? 'table-cell' : 'none';
    if (headerPinEl) headerPinEl.style.display = hasStreamingItemsWithDetails ? 'table-cell' : 'none';

    if (itemsTableBody) {
        Array.from(itemsTableBody.rows).forEach(row => {
            if(row.cells[1]) row.cells[1].style.display = hasStreamingItemsWithDetails ? 'table-cell' : 'none'; // Celda Perfil
            if(row.cells[2]) row.cells[2].style.display = hasStreamingItemsWithDetails ? 'table-cell' : 'none'; // Celda PIN
        });
    }

    // --- Poblar Totales ---
    const formatCOPExport = (value) => (typeof value === 'number' ? value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'COP 0.00');

    const subtotalEl = template.querySelector("#export-subtotal");
    if (subtotalEl) subtotalEl.textContent = formatCOPExport(invoiceData.totals?.subtotal);

    const ivaLineEl = template.querySelector("#export-iva-line");
    const ivaEl = template.querySelector("#export-iva");
    if (invoiceData.totals?.iva > 0) {
        if(ivaEl) ivaEl.textContent = formatCOPExport(invoiceData.totals.iva);
        if(ivaLineEl) ivaLineEl.style.display = 'flex';
    } else if (ivaLineEl) {
        ivaLineEl.style.display = 'none';
    }

    const discountLineEl = template.querySelector("#export-discount-line");
    const discountEl = template.querySelector("#export-discount");
    if (invoiceData.totals?.discountApplied > 0) {
        if(discountEl) discountEl.textContent = `- ${formatCOPExport(invoiceData.totals.discountApplied)}`;
        if(discountLineEl) discountLineEl.style.display = 'flex';
    } else if (discountLineEl) {
        discountLineEl.style.display = 'none';
    }

    const grandTotalEl = template.querySelector("#export-grand-total");
    if (grandTotalEl) grandTotalEl.textContent = formatCOPExport(invoiceData.totals?.grandTotal);

    return true;
}

function populateWhatsappImageTemplate(invoiceData) {
    const template = document.getElementById('whatsapp-image-export-template');
    if (!template || !invoiceData) {
        console.error("Plantilla WhatsApp (#whatsapp-image-export-template) o datos de factura no disponibles para poblar.");
        return false;
    }
    // console.log("Poblando plantilla WhatsApp con datos:", invoiceData);

    // --- Poblar Encabezado ---
    const logoImgWA = template.querySelector("#wa-logo-image");
    
    if (logoImgWA) { // logoImgWA es template.querySelector("#wa-logo-image")
        logoImgWA.src = "img/Isologo_img.png"; 
    }

    const emitterNameWA = template.querySelector("#wa-emitter-name");
    if (emitterNameWA) emitterNameWA.textContent = invoiceData.emitter?.name || "OSCAR 07D Studios";

    const emitterIdWA = template.querySelector("#wa-emitter-id");
    if (emitterIdWA) {
        if (invoiceData.emitter?.id) {
            emitterIdWA.textContent = `NIT/ID: ${invoiceData.emitter.id}`;
            emitterIdWA.style.display = ''; // Asegurar que sea visible si tiene dato
        } else {
            emitterIdWA.style.display = 'none'; // Ocultar si no hay dato
        }
    }

    const emitterPhoneWA = template.querySelector("#wa-emitter-phone");
    if (emitterPhoneWA) {
        if (invoiceData.emitter?.phone) {
            emitterPhoneWA.textContent = `Cel: ${invoiceData.emitter.phone}`;
            emitterPhoneWA.style.display = '';
        } else {
            emitterPhoneWA.style.display = 'none';
        }
    }

    // Estado de Pago (Píldora)
    const paymentStatusPillWA = template.querySelector("#wa-payment-status");
    if(paymentStatusPillWA) {
        const statusKey = invoiceData.paymentStatus || 'pending';
        const statusDetail = paymentStatusDetails[statusKey]; // paymentStatusDetails debe estar accesible
        paymentStatusPillWA.textContent = statusDetail ? statusDetail.text.toUpperCase() : statusKey.replace(/_/g, ' ').toUpperCase();
        paymentStatusPillWA.className = 'wa-status-pill'; 
        paymentStatusPillWA.classList.add(`wa-status-${statusKey.toLowerCase()}`);
    }

    // N° de referencia
    const invoiceRefWA = template.querySelector("#wa-invoice-ref-number");
    if (invoiceRefWA) invoiceRefWA.textContent = `N° ${invoiceData.invoiceNumberFormatted || 'N/A'}`;

    // Fecha de creación de la factura
    const creationDateWA = template.querySelector("#wa-invoice-creation-date");
    if (creationDateWA) {
        const dateToDisplay = invoiceData.createdAt?.toDate ? invoiceData.createdAt.toDate() : (invoiceData.generatedAt ? new Date(invoiceData.generatedAt) : null);
        if (dateToDisplay) {
            creationDateWA.textContent = `Emitida: ${dateToDisplay.toLocaleString('es-CO', { day:'numeric', month: 'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}`;
        } else {
            creationDateWA.textContent = 'Emitida: N/A';
        }
    }

    // --- Poblar Datos del Cliente ---
    const clientNamePWA = template.querySelector("#wa-client-name"); // Este apunta al <p>
    if (clientNamePWA) clientNamePWA.innerHTML = `<strong>Cliente:</strong> ${invoiceData.client?.name || 'N/A'}`;

    const clientPhonePWA = template.querySelector("#wa-client-phone"); // Este apunta al <p>
    if (clientPhonePWA) clientPhonePWA.innerHTML = `<strong>Celular:</strong> ${invoiceData.client?.phone || 'N/A'}`;

    const clientEmailPWA = template.querySelector("#wa-client-email"); // Este apunta al <p>
    if (clientEmailPWA) {
        if (invoiceData.client?.email) {
            clientEmailPWA.innerHTML = `<strong>Correo:</strong> ${invoiceData.client.email}`;
            clientEmailPWA.style.display = 'block';
        } else {
            clientEmailPWA.style.display = 'none';
        }
    }

    // --- Poblar Ítems de la Factura ---
    const itemsTableBodyWA = template.querySelector("#wa-invoice-items-body");
    const headerProfileWA = template.querySelector("#wa-header-profile");
    const headerPinWA = template.querySelector("#wa-header-pin");

    if (itemsTableBodyWA) {
        itemsTableBodyWA.innerHTML = ''; 
        let hasStreamingDetailsWA = false;
        if (invoiceData.items && invoiceData.items.length > 0) {
            invoiceData.items.forEach(item => {
                if(item.isStreaming && (item.profileName || item.profilePin)) {
                    hasStreamingDetailsWA = true;
                }
                const row = itemsTableBodyWA.insertRow();

                const cellDesc = row.insertCell();
                let descContent = item.description || 'N/A';
                if (item.isStreaming && item.profileName) {
                    descContent += `<small class="wa-item-profile-details">P: ${item.profileName}${item.profilePin ? ` (PIN: ${item.profilePin})` : ''}</small>`;
                }
                cellDesc.innerHTML = descContent;

                const cellProfile = row.insertCell();
                cellProfile.textContent = item.isStreaming ? (item.profileName || 'N/A') : 'N/A';

                const cellPin = row.insertCell();
                cellPin.textContent = item.isStreaming ? (item.profilePin || 'N/A') : 'N/A';

                const cellQty = row.insertCell();
                cellQty.textContent = item.quantity || 0;
                cellQty.classList.add('text-right');

                const cellPU = row.insertCell();
                cellPU.textContent = (item.price || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
                cellPU.classList.add('text-right');

                const cellTotal = row.insertCell();
                cellTotal.textContent = ((item.quantity || 0) * (item.price || 0)).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
                cellTotal.classList.add('text-right');
            });
        }
        if (headerProfileWA) headerProfileWA.style.display = hasStreamingDetailsWA ? 'table-cell' : 'none';
        if (headerPinWA) headerPinWA.style.display = hasStreamingDetailsWA ? 'table-cell' : 'none';
        if (itemsTableBodyWA) { // Re-iterar para ocultar celdas si es necesario
            Array.from(itemsTableBodyWA.rows).forEach(row => {
                if(row.cells[1]) row.cells[1].style.display = hasStreamingDetailsWA ? 'table-cell' : 'none';
                if(row.cells[2]) row.cells[2].style.display = hasStreamingDetailsWA ? 'table-cell' : 'none';
            });
        }
    }

    // --- Poblar Total a Pagar ---
    const totalAmountWA = template.querySelector("#wa-grand-total-amount");
    if (totalAmountWA) totalAmountWA.textContent = (invoiceData.totals?.grandTotal || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });

    // --- Poblar Pie de Página ---
    const dueDateLineWA = template.querySelector("#wa-due-date-line");
    const dueDateWA = template.querySelector("#wa-due-date");
    if (invoiceData.serviceStartDate && dueDateWA) {
        dueDateWA.textContent = new Date(invoiceData.serviceStartDate + 'T00:00:00').toLocaleDateString('es-CO', {day: 'numeric', month: 'long', year: 'numeric'});
        if(dueDateLineWA) dueDateLineWA.style.display = 'block'; // O el display que tenga el <p>
    } else if (dueDateLineWA) {
        dueDateLineWA.style.display = 'none';
    }

    const uniqueCodeLineWA = template.querySelector("#wa-unique-code-line");
    const uniqueCodeWA = template.querySelector("#wa-unique-code");
    if (invoiceData.uniqueQueryCode && uniqueCodeWA) {
        uniqueCodeWA.textContent = invoiceData.uniqueQueryCode;
        if(uniqueCodeLineWA) uniqueCodeLineWA.style.display = 'block'; // O el display que tenga el <p>
    } else if (uniqueCodeLineWA) {
         uniqueCodeLineWA.style.display = 'none';
    }

    return true;
}

// ====> AQUÍ PUEDES PEGAR LA FUNCIÓN populateReminderImageTemplate COMPLETA <====
function populateReminderImageTemplate(invoiceData, reminderStatus) {
    const template = document.getElementById('payment-reminder-export-template');
    if (!template || !invoiceData) {
        console.error("Plantilla Recordatorio (#payment-reminder-export-template) o datos de factura no disponibles para poblar.");
        return false;
    }
    // console.log("Poblando plantilla Recordatorio con datos:", invoiceData, "y estado:", reminderStatus);

    template.className = 'reminder-container'; 
    if (reminderStatus === 'pending') {
        template.classList.add('status-pending');
    } else if (reminderStatus === 'overdue') {
        template.classList.add('status-overdue');
    } else {
        template.classList.add('status-pending'); // Fallback
    }

    const logoImgRem = template.querySelector("#reminder-logo-image");
    if (logoImgRem) {
        logoImgRem.src = "img/Isologo_img.png";
    }

    const emitterNameRem = template.querySelector("#reminder-emitter-name");
    if (emitterNameRem) emitterNameRem.textContent = invoiceData.emitter?.name || "OSCAR 07D Studios";

    // Píldora de estado en el recordatorio
    const paymentStatusPillRem = template.querySelector("#reminder-payment-status-pill");
    if(paymentStatusPillRem) {
        const statusKey = reminderStatus || invoiceData.paymentStatus || 'pending';
        const statusDetail = paymentStatusDetails[statusKey];
        paymentStatusPillRem.textContent = statusDetail ? statusDetail.text.toUpperCase() : statusKey.replace(/_/g, ' ').toUpperCase();
        paymentStatusPillRem.className = 'status-pill'; // Clase base
        if (statusKey === 'pending') {
            paymentStatusPillRem.classList.add('status-pending'); 
        } else if (statusKey === 'overdue') {
            paymentStatusPillRem.classList.add('status-overdue');
        } else {
            paymentStatusPillRem.classList.add('status-default'); // Asumiendo que tienes .status-pill.status-default
        }
    }

    const titleElRem = template.querySelector("#reminder-main-title");
    const messageElRem = template.querySelector("#reminder-message-content");
    if (titleElRem && messageElRem) {
        if (reminderStatus === 'pending') {
            titleElRem.textContent = "RECORDATORIO DE PAGO";
            messageElRem.textContent = `Te escribimos para recordarte amablemente que el pago de tu factura está programado para la siguiente fecha. ¡Evita contratiempos!`;
        } else if (reminderStatus === 'overdue') {
            titleElRem.textContent = "AVISO: FACTURA VENCIDA";
            messageElRem.textContent = `Hemos notado que el pago de tu factura ha vencido. Te agradecemos si puedes realizarlo a la brevedad para continuar disfrutando de nuestros servicios.`;
        } else { // Un mensaje por defecto si el status no es ni pending ni overdue
            titleElRem.textContent = "INFORMACIÓN DE PAGO";
            messageElRem.textContent = `Detalles de tu factura a continuación.`;
        }
    }

    const clientNameRem = template.querySelector("#reminder-client-name");
    if (clientNameRem) {
        const fullName = invoiceData.client?.name || 'Cliente';
        const firstName = fullName.split(' ')[0]; // Divide el nombre por espacios y toma la primera palabra
        clientNameRem.textContent = firstName;
    }

    const invNumRem = template.querySelector("#reminder-invoice-number");
    if(invNumRem) invNumRem.textContent = invoiceData.invoiceNumberFormatted || 'N/A';

    const dueDateRem = template.querySelector("#reminder-due-date");
    if(dueDateRem) {
        const dateToUse = invoiceData.serviceStartDate || invoiceData.invoiceDate; // Usa serviceStartDate o invoiceDate
        dueDateRem.textContent = dateToUse ? new Date(dateToUse + 'T00:00:00').toLocaleDateString('es-CO', {day: 'numeric', month: 'long', year: 'numeric'}) : 'N/A';
    }

    const amountDueRem = template.querySelector("#reminder-amount-due");
    if(amountDueRem) {
        amountDueRem.textContent = (invoiceData.totals?.grandTotal || 0).toLocaleString('es-CO', { 
            style: 'currency', 
            currency: 'COP', 
            minimumFractionDigits: 0, // <-- Asegura que no haya decimales
            maximumFractionDigits: 0  // <-- Asegura que no haya decimales
        });
    }

    const paymentDetailsEl = template.querySelector("#reminder-payment-method-details");
    if(paymentDetailsEl) { // Ejemplo de cómo podrías hacerlo más dinámico si tuvieras los datos en el objeto invoiceData.emitter o similar
        const nequiAccount = invoiceData.emitter?.nequiAccount || "3023935392"; // Ejemplo
        const nequiName = invoiceData.emitter?.nequiName || "OS*** ROL***";   // Ejemplo
        paymentDetailsEl.innerHTML = `Nequi: <strong>${nequiAccount}</strong> (${nequiName})`;
    }

    const contactInfoRem = template.querySelector("#reminder-contact-info");
    if(contactInfoRem && invoiceData.emitter?.email) {
        contactInfoRem.innerHTML = `Dudas: ${invoiceData.emitter.email}`;
    } else if (contactInfoRem) {
        contactInfoRem.innerHTML = `Dudas: info@oscar07dstudios.com`; // Fallback
    }

    return true;
}

// ====> AQUÍ PUEDES PEGAR LA FUNCIÓN isCodeUniqueForUser <====
async function isCodeUniqueForUser(code, userId) {
    console.log(`[isCodeUniqueForUser] Verificando código: ${code} para userId: ${userId}`);
    if (!userId || !code) {
        console.error("UserID o Código no proporcionado para la verificación de unicidad.");
        return false; // No se puede verificar, asume que no es único para ser seguro
    }
    try {
        const facturasRef = collection(db, "facturas");
        // Buscamos si alguna factura del MISMO usuario ya tiene este código
        const q = query(facturasRef,
                        where("userId", "==", userId),
                        where("uniqueQueryCode", "==", code));

        const querySnapshot = await getDocs(q);
        console.log(`[isCodeUniqueForUser] Consulta para código ${code} encontró ${querySnapshot.size} documentos.`);
        return querySnapshot.empty; // Devuelve true si no se encontraron documentos (el código es único)
    } catch (error) {
        console.error("Error al verificar la unicidad del código:", error);
        return false; // En caso de error, asume que no es único para evitar duplicados
    }
}

async function getTrulyUniqueCode(userId, codeLength = 7, maxRetries = 10) {
    console.log("[getTrulyUniqueCode] Iniciando para userId:", userId);
    if (!userId) {
        console.error("UserID no proporcionado para generar código único.");
        return null;
    }
    let attempts = 0;
    while (attempts < maxRetries) {
        const newCode = generateRandomAlphanumericCode(codeLength);
        console.log(`[getTrulyUniqueCode] Intento ${attempts + 1}: Código generado = ${newCode}`);
        // Asegúrate que las importaciones de Firestore (collection, query, where, getDocs) estén al inicio de tu script.js
        const unique = await isCodeUniqueForUser(newCode, userId); // Llama a la función que acabas de pegar
        console.log(`[getTrulyUniqueCode] Código ${newCode} es único para ${userId}? ${unique}`);

        if (unique) {
            console.log("[getTrulyUniqueCode] Código único encontrado:", newCode);
            return newCode; 
        }
        attempts++;
        console.log(`Intento ${attempts}: Código ${newCode} ya existe, generando uno nuevo.`);
    }
    console.error(`No se pudo generar un código único después de ${maxRetries} intentos.`);
    alert("Error crítico: No se pudo generar un código de consulta único para la factura. Por favor, intenta guardar de nuevo.");
    return null; 
}

async function generateInvoiceImage(templateId, invoiceData, imageFormat = 'png', reminderStatus = null) {
    let populatedCorrectly = false;
    if (templateId === 'whatsapp-image-export-template') {
        populatedCorrectly = populateWhatsappImageTemplate(invoiceData);
    } else if (templateId === 'payment-reminder-export-template') {
        populatedCorrectly = populateReminderImageTemplate(invoiceData, reminderStatus);
    } else {
        console.error("generateInvoiceImage: ID de plantilla no reconocido:", templateId);
        alert("Error: Tipo de plantilla de imagen no válido.");
        return null;
    }

    if (!populatedCorrectly) {
        alert("Error al preparar los datos para generar la imagen.");
        return null;
    }

    const elementToCapture = document.getElementById(templateId);
    if (!elementToCapture) {
        alert(`Error: No se encontró la plantilla con ID "${templateId}" para generar la imagen.`);
        return null;
    }

    showLoading(true);

    // Guardar estilos originales y preparar para captura
    const originalStyles = {
        display: elementToCapture.style.display,
        position: elementToCapture.style.position,
        left: elementToCapture.style.left,
        top: elementToCapture.style.top,
        transform: elementToCapture.style.transform,
        backgroundColor: elementToCapture.style.backgroundColor,
        // Añade aquí cualquier otra propiedad CSS que modifiques temporalmente
    };

    elementToCapture.style.position = 'fixed';
    elementToCapture.style.left = '-9999px'; // Mover completamente fuera del área visible
    elementToCapture.style.top = '0px';      // O 'auto' si es necesario
    elementToCapture.style.transform = 'none'; // Limpiar transformaciones
    elementToCapture.style.backgroundColor = '#FFFFFF'; // Fondo blanco para la captura
    elementToCapture.style.display = 'block'; // Esencial para que tenga dimensiones

    // Forzar un reflujo del navegador para asegurar que los estilos se apliquen
    if (elementToCapture.offsetHeight) { /* Acceder a offsetHeight fuerza el reflujo */ }

    await new Promise(resolve => setTimeout(resolve, 350)); // Pequeña demora para renderizado

    try {
        const canvas = await html2canvas(elementToCapture, {
            scale: 2, // Buena calidad para imágenes de chat/web. Puedes aumentarla (ej. 2.5 o 3) si necesitas más resolución.
            useCORS: true,
            logging: false, // Cambiar a true para depurar problemas de html2canvas
            allowTaint: true,
            backgroundColor: '#FFFFFF', // Asegura fondo blanco explícito para el canvas
            width: elementToCapture.scrollWidth,   // Usar el ancho renderizado
            height: elementToCapture.scrollHeight, // Usar el alto renderizado
            windowWidth: elementToCapture.scrollWidth,
            windowHeight: elementToCapture.scrollHeight,
            x: 0,
            y: 0,
            onclone: (documentCloned) => {
                // Puedes añadir aquí manipulaciones específicas al clon si es necesario
                // Por ejemplo, forzar la carga de imágenes si html2canvas tiene problemas
                const imgs = documentCloned.querySelectorAll('img');
                imgs.forEach(img => {
                    if (img.src && !img.complete) {
                        // console.warn(`Imagen no completamente cargada en clon: ${img.src}`);
                        // Intentar forzar recarga o usar un placeholder, aunque es complejo aquí.
                    }
                });
            }
        });

        // Restaurar estilos de la plantilla original inmediatamente después de la captura
        elementToCapture.style.display = originalStyles.display || 'none';
        elementToCapture.style.position = originalStyles.position;
        elementToCapture.style.left = originalStyles.left;
        elementToCapture.style.top = originalStyles.top;
        elementToCapture.style.transform = originalStyles.transform;
        elementToCapture.style.backgroundColor = originalStyles.backgroundColor;

        // Devolver el blob para la API Web Share o para descarga
        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Fallo al convertir canvas a Blob.'));
                }
            }, `image/${imageFormat}`, 0.92); // 0.92 es una buena calidad para JPG, para PNG no afecta tanto.
        });

    } catch (error) {
        console.error(`Error detallado al generar la imagen desde ${templateId}:`, error);
        alert("Hubo un error al generar la imagen. Por favor, revisa la consola para más detalles técnicos.");

        // Asegurar que se restauren los estilos en caso de error también
        elementToCapture.style.display = originalStyles.display || 'none';
        elementToCapture.style.position = originalStyles.position;
        // ... restaurar otros originalStyles ...
        return null;
    } finally {
        showLoading(false);
    }
}

// Función auxiliar para descargar el blob como archivo (si no la tienes ya)
function downloadBlob(blob, filename) {
    if (!blob) {
        console.error("downloadBlob: No se proporcionó un blob válido.");
        return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none'; // No es necesario mostrar el enlace
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    // Limpieza
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

async function generateInvoicePDF(invoiceDataSource) {
    let invoiceDataToUse;

    // Determinar la fuente de los datos de la factura
    if (typeof invoiceDataSource === 'string' && invoiceDataSource === 'form') {
        invoiceDataToUse = collectInvoiceDataFromForm();
    } else if (typeof invoiceDataSource === 'object' && invoiceDataSource !== null) {
        invoiceDataToUse = invoiceDataSource; // Usar datos pasados (ej. desde el modal)
    } else {
        alert("Fuente de datos para PDF no válida o no proporcionada.");
        console.error("generateInvoicePDF: invoiceDataSource no es válido:", invoiceDataSource);
        return;
    }

    if (!invoiceDataToUse) {
        // Si invoiceDataToUse sigue siendo null o undefined (ej. collectInvoiceDataFromForm devolvió null)
        console.log("generateInvoicePDF: No se pudieron obtener los datos de la factura.");
        return;
    }

    // Asegurar que 'generatedAt' exista en invoiceDataToUse para la plantilla PDF
    if (!invoiceDataToUse.generatedAt) {
        if (invoiceDataToUse.createdAt && invoiceDataToUse.createdAt.toDate) {
            invoiceDataToUse.generatedAt = invoiceDataToUse.createdAt.toDate().toISOString();
        } else {
            invoiceDataToUse.generatedAt = new Date().toISOString();
        }
    }

    const invoiceElement = document.getElementById('invoice-export-template');
    if (!invoiceElement) { 
        alert("Error: Plantilla de factura (#invoice-export-template) no encontrada en el DOM.");
        return;
    }
    // Verifica 'originalInvoiceExportTemplate' si populateExportTemplate depende de ella globalmente
    if (typeof originalInvoiceExportTemplate === 'undefined' || !originalInvoiceExportTemplate) { 
        console.error("La variable global originalInvoiceExportTemplate (usada por populateExportTemplate) no está definida o es null.");
        alert("Error de configuración: Plantilla base (originalInvoiceExportTemplate) no encontrada para poblar los datos.");
        return;
    }

    if (!populateExportTemplate(invoiceDataToUse)) {
        alert("Error al preparar los datos de la factura para la exportación.");
        return;
    }

    showLoading(true);

    // Guardar los estilos originales del elemento de la plantilla para restaurarlos después
    const originalStyles = {
        display: invoiceElement.style.display,
        position: invoiceElement.style.position,
        left: invoiceElement.style.left,
        top: invoiceElement.style.top,
        zIndex: invoiceElement.style.zIndex,
        transform: invoiceElement.style.transform,
        backgroundColor: invoiceElement.style.backgroundColor
    };

    // Preparar la plantilla para la captura por html2canvas
    invoiceElement.style.position = 'fixed';
    invoiceElement.style.left = '-9999px'; // Mover completamente fuera del área visible
    invoiceElement.style.top = '0px';
    // invoiceElement.style.zIndex = '10001'; // No es tan necesario si está fuera de pantalla
    invoiceElement.style.backgroundColor = '#fff'; // Asegurar fondo blanco para la captura
    invoiceElement.style.display = 'block'; // Esencial para que tenga dimensiones
    invoiceElement.style.transform = 'none'; // Limpiar transformaciones que puedan interferir

    // Forzar un reflujo del navegador para asegurar que los estilos se apliquen
    if (invoiceElement.offsetHeight) { /* Acceder a offsetHeight fuerza el reflujo */ }

    // Pequeña demora para asegurar renderizado completo
    await new Promise(resolve => setTimeout(resolve, 450)); // Ligeramente aumentada la demora

    try {
        const canvas = await html2canvas(invoiceElement, {
            scale: 3, // Escala alta para intentar mejorar la calidad de la imagen capturada
            useCORS: true, // Necesario si la plantilla carga imágenes de otros dominios
            logging: true, // Habilita para ver logs detallados de html2canvas en la consola (útil para depurar)
            allowTaint: true, // Puede ayudar con algunos tipos de imágenes o SVGs

            // Definir explícitamente el área de captura basada en el tamaño renderizado del elemento
            width: invoiceElement.scrollWidth,
            height: invoiceElement.scrollHeight,
            windowWidth: invoiceElement.scrollWidth, // Darle a html2canvas un "viewport" del tamaño del elemento
            windowHeight: invoiceElement.scrollHeight,
            x: 0, // Capturar desde la esquina superior izquierda del elemento
            y: 0,

            onclone: (documentCloned) => {
                const logoContainerInClone = documentCloned.querySelector('.export-logo-container');
                const logoImgInClone = documentCloned.querySelector('#export-logo-image');

                if (logoContainerInClone && logoImgInClone) {
                    // Forzar dimensiones y estilos al contenedor del logo en el clon
                    // Estos valores DEBEN COINCIDIR con los que tienes en tu style.css
                    // para #invoice-export-template .export-logo-container
                    logoContainerInClone.style.width = '180px';  // Ejemplo, ajusta al valor de tu CSS
                    logoContainerInClone.style.height = '70px'; // Ejemplo, ajusta al valor de tu CSS
                    logoContainerInClone.style.display = 'flex';
                    logoContainerInClone.style.justifyContent = 'flex-start';
                    logoContainerInClone.style.alignItems = 'center';
                    logoContainerInClone.style.overflow = 'hidden';

                    // Forzar estilos a la imagen PNG en el clon para asegurar la proporción
                    logoImgInClone.style.display = 'block';
                    logoImgInClone.style.maxWidth = '100%';
                    logoImgInClone.style.maxHeight = '100%';
                    logoImgInClone.style.width = 'auto'; 
                    logoImgInClone.style.height = 'auto'; 
                    logoImgInClone.style.objectFit = 'contain'; // CRUCIAL para mantener la proporción del PNG
                    logoImgInClone.style.objectPosition = 'left center';
                    // console.log('Estilos del logo y contenedor aplicados en clon para html2canvas.');
                } else {
                    console.warn('Logo (#export-logo-image) o su contenedor (.export-logo-container) NO encontrado en el DOM clonado por html2canvas.');
                }
            }
        });

        // Restaurar estilos de la plantilla original inmediatamente después de la captura
        invoiceElement.style.display = originalStyles.display || 'none';
        invoiceElement.style.position = originalStyles.position;
        invoiceElement.style.left = originalStyles.left;
        invoiceElement.style.top = originalStyles.top;
        invoiceElement.style.zIndex = originalStyles.zIndex;
        invoiceElement.style.transform = originalStyles.transform;
        invoiceElement.style.backgroundColor = originalStyles.backgroundColor;

        const imgData = canvas.toDataURL('image/png', 1.0); // PNG de máxima calidad

        const { jsPDF } = window.jspdf; // Asumiendo que jsPDF está en el scope global desde el CDN
        const pdf = new jsPDF({
            orientation: 'p', 
            unit: 'mm',       
            format: 'a4'      
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 10; 
        const contentWidth = pdfWidth - (2 * margin);
        const contentHeight = pdfHeight - (2 * margin);

        const canvasImgWidth = canvas.width;
        const canvasImgHeight = canvas.height;
        const ratio = canvasImgWidth / canvasImgHeight;

        let newImgWidthInPdf = contentWidth;
        let newImgHeightInPdf = newImgWidthInPdf / ratio;

        if (newImgHeightInPdf > contentHeight) {
            newImgHeightInPdf = contentHeight;
            newImgWidthInPdf = newImgHeightInPdf * ratio;
        }

        const x = margin + (contentWidth - newImgWidthInPdf) / 2;
        const y = margin;

        pdf.addImage(imgData, 'PNG', x, y, newImgWidthInPdf, newImgHeightInPdf);
        pdf.save(`Factura-${invoiceDataToUse.invoiceNumberFormatted || 'NroFactura'}.pdf`);

    } catch (error) {
        console.error("Error detallado al generar el PDF:", error);
        alert("Hubo un error al generar el PDF. Por favor, revisa la consola para más detalles técnicos.");

        // Asegurar que se restauren los estilos en caso de error también
        invoiceElement.style.display = originalStyles.display || 'none';
        invoiceElement.style.position = originalStyles.position;
        invoiceElement.style.left = originalStyles.left;
        invoiceElement.style.top = originalStyles.top;
        invoiceElement.style.zIndex = originalStyles.zIndex;
        invoiceElement.style.transform = originalStyles.transform;
        invoiceElement.style.backgroundColor = originalStyles.backgroundColor;

    } finally {
        showLoading(false);
        setTimeout(() => {
            isGeneratingPdf = false;
        }, 1500); // Resetear la bandera después de 1.5 segundos
    }
}

// if (generateInvoiceFileBtn) {
//    console.log("Asignando evento a generateInvoiceFileBtn (botón del formulario)");
//    generateInvoiceFileBtn.addEventListener('click', () => generateInvoicePDF('form')); // Pasa 'form'
//} else {
//    console.error("Botón generateInvoiceFileBtn no encontrado en el DOM");
//}

// --- Funciones para Modal de Detalle de Factura ---
function openInvoiceDetailModal(invoiceData, invoiceId) {
    currentInvoiceDataForModalActions = invoiceData; // Guardar datos de la factura actual para los botones del modal
    currentInvoiceIdForModalActions = invoiceId;   // Guardar ID de la factura actual para los botones del modal
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

    if (invoiceData.uniqueQueryCode) {
        detailsHTML += `<p><strong>Código Consulta:</strong> ${invoiceData.uniqueQueryCode}</p>`;
    }

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

function openTemplateSelectionModal(actionType) {
    console.log("[openTemplateSelectionModal] Iniciando para acción:", actionType);
    currentActionForTemplateSelection = actionType;

    if (isReminderCheckbox) {
        isReminderCheckbox.checked = false;
    } else {
        console.error("[openTemplateSelectionModal] Checkbox 'isReminderCheckbox' NO encontrado.");
        // Podrías retornar aquí si este elemento es crucial y no se encuentra

    }



    if (imageFormatSelectionDiv) {


        if (actionType === 'image') {
            imageFormatSelectionDiv.style.display = 'block';

        } else {
            imageFormatSelectionDiv.style.display = 'none';

        }
    } else {
        console.error("[openTemplateSelectionModal] Div 'imageFormatSelectionDiv' NO encontrado.");
    }

    if (templateSelectionModal) {
        templateSelectionModal.classList.add('active');
        console.log("[openTemplateSelectionModal] Clase 'active' AÑADIDA a templateSelectionModal.");

        // Forzar estilos de depuración con JS también (temporal)
        templateSelectionModal.style.setProperty('display', 'flex', 'important');
        templateSelectionModal.style.setProperty('opacity', '1', 'important');
        templateSelectionModal.style.setProperty('visibility', 'visible', 'important');
        templateSelectionModal.style.setProperty('z-index', '1070', 'important'); // Coincidir con el CSS de depuración


        // Manejo de la clase modal-active en el body
        if (bodyElement && !bodyElement.classList.contains('modal-active')) {
            bodyElement.classList.add('modal-active');
            console.log("[openTemplateSelectionModal] Clase 'modal-active' AÑADIDA al body.");
        }
    } else {
        console.error("[openTemplateSelectionModal] Elemento 'templateSelectionModal' es null. No se puede mostrar.");
        alert("Error: No se pudo abrir el diálogo de selección de plantilla.");
    }
}

function closeTemplateSelectionModal() {
    console.log("[closeTemplateSelectionModal] Intentando cerrar modal de selección.");
    if (templateSelectionModal) {
        templateSelectionModal.classList.remove('active');
        // Quitar estilos de depuración forzados por JS
        templateSelectionModal.style.removeProperty('display');
        templateSelectionModal.style.removeProperty('opacity');
        templateSelectionModal.style.removeProperty('visibility');
        templateSelectionModal.style.removeProperty('z-index');

        console.log("[closeTemplateSelectionModal] Clase 'active' quitada de templateSelectionModal.");
    } else {
        console.error("[closeTemplateSelectionModal] templateSelectionModal es null.");
    }

    // Solo quitar 'modal-active' del body si el modal de DETALLES tampoco está activo

    if (bodyElement) {
        const mainDetailModalStillActive = invoiceDetailModal && invoiceDetailModal.classList.contains('active');
        if (!mainDetailModalStillActive) {


            bodyElement.classList.remove('modal-active');
            console.log("[closeTemplateSelectionModal] Clase 'modal-active' quitada del body porque el modal de detalles tampoco está activo.");
        } else {
            console.log("[closeTemplateSelectionModal] El modal de detalles aún está activo, no se quita 'modal-active' del body.");
        }
    }
}

function openPaymentUpdateModal(invoiceData, invoiceId) {
    // Guardamos los datos de la factura seleccionada para usarlos después
    currentInvoiceDataForModalActions = invoiceData;
    currentInvoiceIdForModalActions = invoiceId;

    if (!paymentUpdateModal) {
        console.error("El modal de actualización de pago no se encuentra en el HTML.");
        return;
    }

    // Rellenamos el modal con la información de la factura
    if (paymentUpdateInvoiceNumber) {
        paymentUpdateInvoiceNumber.textContent = invoiceData.invoiceNumberFormatted || 'N/A';
    }

    // Calculamos y establecemos la próxima fecha de vencimiento por defecto
    if (nextDueDateInput) {
        // Tomamos la fecha de servicio/vencimiento actual
        const currentDueDate = new Date(invoiceData.serviceStartDate + 'T00:00:00');
        // Le sumamos un mes
        currentDueDate.setMonth(currentDueDate.getMonth() + 1);
        // La ponemos en el input
        nextDueDateInput.value = currentDueDate.toISOString().split('T')[0];
    }
    
    // Mostramos el modal
    paymentUpdateModal.classList.add('active');
    if (bodyElement) bodyElement.classList.add('modal-active');
}

function closePaymentUpdateModal() {
    if (paymentUpdateModal) {
        paymentUpdateModal.classList.remove('active');
    }
    // Solo quitamos la clase del body si ningún otro modal está abierto
    const isAnotherModalActive = document.querySelector('.modal-overlay.active');
    if (bodyElement && !isAnotherModalActive) {
        bodyElement.classList.remove('modal-active');
    }
}

function openEditPhotoModal() {
    const user = auth.currentUser;
    if (user) {
        photoPreview.src = user.photoURL || 'img/user-photo-placeholder.svg';
        selectedPhotoFile = null;
        savePhotoBtn.disabled = true;
        photoUploadInput.value = null;
        if (editPhotoModal) editPhotoModal.classList.add('active');
        if (bodyElement) bodyElement.classList.add('modal-active');
    }
}
function closeEditPhotoModal() {
    if (editPhotoModal) editPhotoModal.classList.remove('active');
    if (bodyElement && !document.querySelector('.modal-overlay.active')) {
        bodyElement.classList.remove('modal-active');
    }
}
async function saveProfilePhoto() {
    if (!selectedPhotoFile) {
        alert("Primero selecciona una nueva imagen.");
        return;
    }
    const user = auth.currentUser;
    if (!user) return;

    showLoading(true);
    const filePath = `profile_photos/${user.uid}/${selectedPhotoFile.name}`;
    const storageRef = ref(storage, filePath);

    try {
        // 1. Subir la nueva foto a Storage
        const snapshot = await uploadBytes(storageRef, selectedPhotoFile);
        // 2. Obtener la URL de descarga
        const photoURL = await getDownloadURL(snapshot.ref);
        // 3. Actualizar el perfil del usuario en Auth
        await updateProfile(user, { photoURL: photoURL });

        // 4. Actualizar la vista en la sección "Mi Cuenta"
        const profileIcon = profilePhotoBtn.querySelector('img');
        if (profileIcon) profileIcon.src = photoURL;

        alert("Foto de perfil actualizada con éxito.");
        closeEditPhotoModal();

    } catch (error) {
        console.error("Error al subir la foto de perfil:", error);
        alert("Hubo un error al guardar tu foto.");
    } finally {
        showLoading(false);
    }
}

// --- Funciones para Editar Correo Electrónico ---
function openEditEmailModal() {
    const user = auth.currentUser;
    if (user) {
        profileEmailInput.value = user.email || '';
        profilePasswordInput.value = '';
        if (editEmailModal) editEmailModal.classList.add('active');
        if (bodyElement) bodyElement.classList.add('modal-active');
    }
}
function closeEditEmailModal() {
    if (editEmailModal) editEmailModal.classList.remove('active');
    if (bodyElement && !document.querySelector('.modal-overlay.active')) {
        bodyElement.classList.remove('modal-active');
    }
}
async function saveProfileEmail() {
    const newEmail = profileEmailInput.value.trim();
    const password = profilePasswordInput.value;
    const user = auth.currentUser;

    if (!newEmail || !password) {
        alert("Por favor, completa todos los campos.");
        return;
    }
    if (newEmail === user.email) {
        alert("El nuevo correo es el mismo que el actual.");
        return;
    }

    showLoading(true);
    try {
        // 1. Crear una credencial con el email y contraseña actuales para re-autenticar
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        
        // 2. Si la re-autenticación es exitosa, actualizar el email
        await updateEmail(user, newEmail);

        // 3. Actualizar la vista en la sección "Mi Cuenta"
        const emailDisplay = profileEmailBtn.querySelector('span');
        if (emailDisplay) emailDisplay.textContent = newEmail;

        alert("Correo electrónico actualizado con éxito.");
        closeEditEmailModal();

    } catch (error) {
        console.error("Error al actualizar el correo:", error);
        if (error.code === 'auth/wrong-password') {
            alert("La contraseña es incorrecta. Inténtalo de nuevo.");
        } else if (error.code === 'auth/email-already-in-use') {
            alert("Ese correo electrónico ya está en uso por otra cuenta.");
        } else {
            alert("Hubo un error al actualizar tu correo.");
        }
    } finally {
        showLoading(false);
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
    sessionStorage.setItem('lastSelectedClientId', clientId);
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

            if (customClientOptions) {
                customClientOptions.style.display = 'none'; // Oculta la lista de opciones
            }
            if (customClientSelect) {
                customClientSelect.classList.remove('open'); // Quita el estilo 'open' para que la flecha vuelva a la normalidad
            }
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

/**
 * Obtiene el número de la semana para una fecha dada.
 * @param {Date} d - La fecha.
 * @returns {number} - El número de la semana.
 */
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

function setupDashboardFilters() {
    // Poblar el selector de años
    if (selectYear) {
        const currentYear = new Date().getFullYear();
        selectYear.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            selectYear.add(new Option(currentYear - i, currentYear - i));
        }
    }
    // Establecer valores por defecto
    if (selectMonth) selectMonth.value = new Date().getMonth();
    if (selectDay) selectDay.value = new Date().toISOString().split('T')[0];

    // Inicializar Flatpickr para el selector de semana
    const weekSelector = document.getElementById('selectWeek');
    if (weekSelector) {
        flatpickr(weekSelector, {
            plugins: [ new weekSelect({}) ], // Activar el plugin de selección de semana
            weekNumbers: true,
            altInput: true,
            altFormat: "'Semana' W, Y", // Formato para el usuario
            onChange: function(selectedDates, dateStr, instance) {
                if (selectedDates.length > 0) {
                    // Llamar a loadDashboardData solo cuando se selecciona una fecha
                    loadDashboardData();
                }
            }
        });
    }

    // Listener para el filtro principal
    if (chartTimeRange) {
        chartTimeRange.addEventListener('change', () => {
            const value = chartTimeRange.value;
            // Mostrar u ocultar los filtros secundarios
            if(yearFilter) yearFilter.style.display = (value === 'year' || value === 'month' || value === 'week') ? 'flex' : 'none';
            if(monthFilter) monthFilter.style.display = (value === 'month') ? 'flex' : 'none';
            if(weekFilter) weekFilter.style.display = (value === 'week') ? 'flex' : 'none';
            if(dayFilter) dayFilter.style.display = (value === 'day') ? 'flex' : 'none';
            
            loadDashboardData();
        });
        // Disparar un 'change' al inicio para establecer la visibilidad correcta
        chartTimeRange.dispatchEvent(new Event('change'));
    }

    // Listeners para los filtros secundarios que también recargan la data
    if (selectYear) selectYear.addEventListener('change', loadDashboardData);
    if (selectMonth) selectMonth.addEventListener('change', loadDashboardData);
    if (selectDay) selectDay.addEventListener('change', loadDashboardData);
    // El listener para selectWeek es manejado por el 'onChange' de Flatpickr
}

/**
 * Devuelve el primer y último día de una semana y año específicos.
 * @param {number} w - El número de la semana.
 * @param {number} y - El año.
 * @returns {{start: Date, end: Date}}
 */
function getWeekDates(w, y) {
    const simple = new Date(y, 0, 1 + (w - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = new Date(simple);
    if (dow <= 4) {
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    ISOweekStart.setHours(0,0,0,0);
    const ISOweekEnd = new Date(ISOweekStart);
    ISOweekEnd.setDate(ISOweekEnd.getDate() + 6);
    ISOweekEnd.setHours(23,59,59,999);
    return { start: ISOweekStart, end: ISOweekEnd };
}

// Y al final del script, asegúrate de que se llame a esta función una vez
// (puede ser después de la sección de Event Listeners)
setupDashboardFilters();

async function loadClientsIntoDropdown() {
    if (!customClientOptions || !customClientSelectDisplay) { 
        console.error("Elementos del desplegable personalizado no encontrados."); 
        return; 
    }
    const user = auth.currentUser;

    // --- MEJORA 1: Recordar la última selección ---
    // Leemos si había un cliente guardado en la sesión del navegador
    const lastSelectedClientId = sessionStorage.getItem('lastSelectedClientId');

    customClientOptions.innerHTML = ''; 
    loadedClients = [];

    // Crear y añadir la opción "-- Nuevo Cliente --" (esto no cambia)
    const newClientOptionElement = document.createElement('div');
    newClientOptionElement.classList.add('custom-option', 'new-client-option');
    newClientOptionElement.setAttribute('data-value', '');
    newClientOptionElement.textContent = '-- Nuevo Cliente --';
    newClientOptionElement.addEventListener('click', (event) => {
        event.stopPropagation(); 
        handleClientSelection("", "-- Nuevo Cliente --");
    });
    customClientOptions.appendChild(newClientOptionElement);
    
    // Si no había nada guardado, se selecciona "-- Nuevo Cliente --" por defecto
    if (!lastSelectedClientId) {
        handleClientSelection("", "-- Nuevo Cliente --");
    }

    if (!user) {
        return; 
    }

    try {
        const q = query(collection(db, "clientes"), where("userId", "==", user.uid), where("isDeleted", "!=", true), orderBy("name", "asc"));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((docSnap) => {
            const client = docSnap.data();
            const clientId = docSnap.id;
            const clientOption = document.createElement('div');
            clientOption.classList.add('custom-option');
            clientOption.setAttribute('data-value', clientId);

            let estadoGeneral = client.estadoGeneralCliente || "Activo";
            let claseCssEstadoGeneral = `status-client-${estadoGeneral.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/gi, '')}`;
            
            // --- MEJORA 2: Se elimina la píldora de estado de pago ---
            clientOption.innerHTML = `
                <span class="option-client-name">${client.name}</span>
                <span class="pills-container">
                    <span class="option-status-pill ${claseCssEstadoGeneral}">${estadoGeneral}</span>
                </span>
            `;
            
            clientOption.addEventListener('click', (event) => {
                event.stopPropagation(); 
                handleClientSelection(clientId, client.name, client);
            });
            
            customClientOptions.appendChild(clientOption);
            loadedClients.push({ id: clientId, ...client });
        });

        // Si había un cliente guardado en la sesión, lo volvemos a seleccionar
        if (lastSelectedClientId) {
            const clientToReselect = loadedClients.find(c => c.id === lastSelectedClientId);
            if (clientToReselect) {
                handleClientSelection(clientToReselect.id, clientToReselect.name, clientToReselect);
            } else {
                // Si el cliente guardado ya no existe, volvemos a "-- Nuevo Cliente --"
                handleClientSelection("", "-- Nuevo Cliente --");
            }
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

/**
 * Navega a la sección del formulario y carga los datos de un cliente para editarlo.
 * @param {string} clientId - El ID del cliente a editar.
 */
async function loadClientForEditing(clientId) {
    if (!clientId) return;

    // 1. Navegar a la sección de creación de factura y esperar a que termine.
    //    Esto es importante para que el formulario se resetee primero.
    await handleNavigation('createInvoiceSection');

    // 2. Encontrar los datos completos del cliente en el array que ya tenemos cargado.
    const clientToEdit = loadedClients.find(client => client.id === clientId);

    if (clientToEdit) {
        // 3. Usar la función que ya tenemos para seleccionar y rellenar el formulario.
        handleClientSelection(clientId, clientToEdit.name, clientToEdit);

        // 4. Simular un clic en el botón "Editar Cliente" del formulario para desbloquear los campos.
        if (editClientBtn) {
            editClientBtn.click();
        }
    } else {
        alert("No se pudieron encontrar los datos del cliente para editar.");
    }
}

async function handleNavigation(sectionToShowId) {
    // Se declaran UNA SOLA VEZ aquí al principio
    const sections = [
      homeSection,
      createInvoiceSection,
      viewInvoicesSection,
      clientsSection,
      profileSection
    ];
    const navLinks = [
      navHome,
      navCreateInvoice,
      navViewInvoices,
      navClients,
      navProfile       // ← y también el link de Ajustes
    ];
    let targetTitle = "Sistema de Facturación";

    sections.forEach(section => { 
        if (section) section.style.display = 'none'; 
    });
    navLinks.forEach(link => { 
        if (link) link.classList.remove('active-nav'); 
    });

    const currentSection = sections.find(s => s && s.id === sectionToShowId);
    if (currentSection) currentSection.style.display = 'block';
    
    // Determinar qué enlace de navegación activar
    let currentNavLinkId = '';
    if (sectionToShowId === 'homeSection') {
        currentNavLinkId = 'navHome';
    } else if (sectionToShowId === 'createInvoiceSection') {
        currentNavLinkId = 'navCreateInvoice';
    } else if (sectionToShowId === 'viewInvoicesSection') {
        currentNavLinkId = 'navViewInvoices';
    } else if (sectionToShowId === 'clientsSection') {
        currentNavLinkId = 'navClients';
    }
    else if (sectionToShowId === 'profileSection') {
      targetTitle = "Ajustes de Plantillas";
      const profileSection = document.getElementById('profileSection');
      if (profileSection) profileSection.style.display = 'block';
    }
    const currentLink = navLinks.find(l => l && l.id === currentNavLinkId);
    if (currentLink) currentLink.classList.add('active-nav');

    // Lógica específica para cada sección
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
        if (typeof loadAndDisplayInvoices === 'function') await loadAndDisplayInvoices();
    } else if (sectionToShowId === 'clientsSection') {
        targetTitle = "Mis Clientes";
        if (clientsSection) {
            clientsSection.innerHTML = `
                <div class="section-header-actions">
                    <h2>Clientes</h2>
                    <button type="button" id="showNewClientFormBtn" class="btn btn-primary btn-icon">
                        <img src="img/Add_User_icon.svg" alt="Añadir" class="icon-svg">
                        <span>Añadir Nuevo Cliente</span>
                    </button>
                </div>
                <div id="newClientFormContainer" class="form-section" style="display: none;">
                    <form id="newClientForm">
                        <legend>Datos del Nuevo Cliente</legend>
                        <div class="form-grid two-columns">
                            <div class="form-group"><label for="newClientName">Nombres y Apellidos:</label><input type="text" id="newClientName"></div>
                            <div class="form-group"><label for="newClientPhone">Celular:</label><input type="tel" id="newClientPhone"></div>
                            <div class="form-group full-width"><label for="newClientEmail">Correo Electrónico (Opcional):</label><input type="email" id="newClientEmail"></div>
                        </div>
                        <div class="form-actions">
                            <button type="button" id="cancelNewClientBtn" class="btn btn-secondary">Cancelar</button>
                            <button type="submit" class="btn btn-success">Guardar Cliente</button>
                        </div>
                    </form>
                </div>
                <div class="client-list-subsection">
                    <h3>Clientes Activos</h3>
                    <div id="activeClientsListContainer" class="client-list"><p>Cargando...</p></div>
                </div>
                <div class="client-list-subsection">
                    <h3>Clientes Inactivos</h3>
                    <div id="deletedClientsListContainer" class="client-list"><p>Cargando...</p></div>
                </div>
            `;

            // Volvemos a asignar los listeners a los elementos que acabamos de crear
            document.getElementById('showNewClientFormBtn').addEventListener('click', () => {
                document.getElementById('newClientFormContainer').style.display = 'block';
                document.getElementById('showNewClientFormBtn').style.display = 'none';
            });
            document.getElementById('cancelNewClientBtn').addEventListener('click', () => {
                document.getElementById('newClientForm').reset();
                document.getElementById('newClientFormContainer').style.display = 'none';
                document.getElementById('showNewClientFormBtn').style.display = 'inline-flex';
            });
            document.getElementById('newClientForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('newClientName').value.trim();
                const phone = document.getElementById('newClientPhone').value.trim();
                const email = document.getElementById('newClientEmail').value.trim();
                if (!name && !phone && !email) {
                    alert("Debes rellenar al menos un campo para guardar el cliente.");
                    return;
                }
                showLoading(true);
                const success = await saveNewClient(name, phone, email);
                showLoading(false);
                if (success) {
                    document.getElementById('newClientForm').reset();
                    document.getElementById('newClientFormContainer').style.display = 'none';
                    document.getElementById('showNewClientFormBtn').style.display = 'inline-flex';
                    await displayActiveClients();
                    await displayDeletedClients();
                    await loadClientsIntoDropdown();
                }
            });
        }
        await displayActiveClients();
        await displayDeletedClients();
    } else if (sectionToShowId === 'homeSection') {
        targetTitle = "Inicio y Estadísticas";
        await loadDashboardData();
    }
    if (sectionToShowId === 'profileSection') {
      targetTitle = "Mi Cuenta";
      // Aquí dentro pon cualquier inicialización de esa sección.
      // Ejemplo: cargar logo guardado, listeners para subir logo/QR, etc.
    }
    
    if (appPageTitle) appPageTitle.textContent = targetTitle;
}

async function loadAndDisplayInvoices() {
    const invoiceListContainer = document.getElementById('invoiceListContainer');
    if (!invoiceListContainer) {
        console.error("Contenedor #invoiceListContainer no encontrado.");
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        invoiceListContainer.innerHTML = '<p>Debes iniciar sesión para ver tus facturas.</p>';
        return; 
    }

    // Obtener los valores actuales de los filtros de búsqueda
    const searchTerm = invoiceSearchInput ? invoiceSearchInput.value.toLowerCase() : '';
    const statusFilter = statusFilterSelect ? statusFilterSelect.value : 'all';

    showLoading(true);

    try {
        const q = query(collection(db, "facturas"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        // --- 1. LÓGICA DE ACTUALIZACIÓN SEMI-AUTOMÁTICA ---
        const batch = writeBatch(db);
        let updatesMade = false;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Comparar solo fechas, sin la hora

        const allInvoices = []; // Array para guardar todas las facturas, ya sea originales o actualizadas

        querySnapshot.forEach(docSnap => {
            let invoice = { id: docSnap.id, ...docSnap.data() };

            // Revisa si una factura pagada con fecha de servicio ya se venció
            if (invoice.paymentStatus === 'paid' && invoice.serviceStartDate) {
                const dueDate = new Date(invoice.serviceStartDate + 'T00:00:00');
                if (today > dueDate) {
                    // Actualiza el objeto local para que la UI se muestre bien al instante
                    invoice.paymentStatus = 'overdue'; 
                    // Añade la actualización a la base de datos al lote
                    const invoiceRef = doc(db, "facturas", invoice.id);
                    batch.update(invoiceRef, { paymentStatus: "overdue" });
                    updatesMade = true;
                }
            }
            allInvoices.push(invoice);
        });

        if (updatesMade) {
            await batch.commit(); // Envía todas las actualizaciones a Firestore a la vez
        }

        // --- 2. LÓGICA DE FILTRADO (SOBRE LA LISTA YA ACTUALIZADA) ---
        const filteredInvoices = allInvoices.filter(invoice => {
            const clientName = invoice.client?.name.toLowerCase() || '';
            const invoiceNumber = invoice.invoiceNumberFormatted?.toLowerCase() || '';
            const uniqueCode = invoice.uniqueQueryCode?.toLowerCase() || '';
            
            const matchesSearchTerm = searchTerm === '' || 
                                      clientName.includes(searchTerm) ||
                                      invoiceNumber.includes(searchTerm) ||
                                      uniqueCode.includes(searchTerm);

            const matchesStatus = statusFilter === 'all' || 
                                  invoice.paymentStatus === statusFilter;

            return matchesSearchTerm && matchesStatus;
        });

        // --- 3. RENDERIZADO DE LA LISTA FINAL ---
        invoiceListContainer.innerHTML = '';
        if (filteredInvoices.length === 0) {
            invoiceListContainer.innerHTML = querySnapshot.empty ? 
                '<p class="empty-list-message">No tienes facturas guardadas.</p>' :
                '<p class="empty-list-message">No se encontraron facturas que coincidan con tu búsqueda.</p>';
        } else {
            filteredInvoices.forEach((invoice) => {
                const invoiceId = invoice.id;

                // --- CORRECCIÓN AQUÍ: Definimos las variables ANTES de usarlas ---
                let statusClassName = invoice.paymentStatus || 'pending';
                let statusText = paymentStatusDetails[statusClassName]?.text || statusClassName.replace(/_/g, ' ');
                // --- FIN DE LA CORRECCIÓN ---

                const itemElement = document.createElement('div');
                // Añadimos la clase del tema para el borde de color que hicimos antes
                itemElement.classList.add('invoice-list-item', `status-theme-${statusClassName.toLowerCase()}`);
                itemElement.setAttribute('data-invoice-id', invoiceId);
                
                // Ahora el innerHTML puede usar las variables sin problemas
                itemElement.innerHTML = `
                    <div class="invoice-list-header">
                        <span class="invoice-list-number">${invoice.invoiceNumberFormatted || 'N/A'}</span>
                        <span class="status-badge status-${statusClassName.toLowerCase()}">${statusText}</span>
                    </div>
                    <div class="invoice-list-client">${invoice.client?.name || 'N/A'}</div>
                    ${invoice.uniqueQueryCode ? `<div class="invoice-list-query-code">Cód. Consulta: <strong>${invoice.uniqueQueryCode}</strong></div>` : ''}
                    <div class="invoice-list-details">
                        <span class="invoice-list-date">Fecha: ${invoice.invoiceDate ? new Date(invoice.invoiceDate + 'T00:00:00').toLocaleDateString('es-CO') : 'N/A'}</span>
                        <span class="invoice-list-total">${(invoice.totals?.grandTotal || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span>
                    </div>
                    <div class="invoice-list-actions">
                        ${(invoice.paymentStatus === 'pending' || invoice.paymentStatus === 'overdue') ?
                            `<button type="button" class="btn btn-sm btn-success confirm-payment-btn">Confirmar Pago</button>` :
                            ''
                        }
                        <button type="button" class="btn btn-sm btn-info view-details-btn">Ver Detalles</button>
                    </div>
                `;

                // Listeners para los botones de la tarjeta
                const confirmPaymentBtn = itemElement.querySelector('.confirm-payment-btn');
                if (confirmPaymentBtn) {
                    confirmPaymentBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openPaymentUpdateModal(invoice, invoiceId);
                    });
                }
                
                const viewDetailsBtn = itemElement.querySelector('.view-details-btn');
                if (viewDetailsBtn) {
                    viewDetailsBtn.addEventListener('click', () => {
                        openInvoiceDetailModal(invoice, invoiceId); 
                    });
                }
                invoiceListContainer.appendChild(itemElement);
            });
        }
    } catch (error) {
        console.error("Error al cargar y filtrar facturas:", error);
        invoiceListContainer.innerHTML = '<p class="error-message">Error al cargar las facturas.</p>';
    } finally {
        showLoading(false);
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
            
                // --- CORRECCIÓN AQUÍ: Definimos las variables ANTES de usarlas ---
                // 1. Píldora de Estado General del Cliente
                let estadoGeneral = client.estadoGeneralCliente || "Activo";
                let claseCssEstadoGeneral = "status-client-default";
                if (estadoGeneral === "Nuevo") claseCssEstadoGeneral = "status-client-nuevo";
                else if (estadoGeneral === "Activo" || estadoGeneral === "Al día") claseCssEstadoGeneral = "status-client-al-dia";
                else if (estadoGeneral === "Con Pendientes") claseCssEstadoGeneral = "status-client-con-pendientes";
                else if (estadoGeneral === "Moroso") claseCssEstadoGeneral = "status-client-moroso";
            
                // 2. Píldora de Estado de Última Factura
                let estadoFactura = client.estadoUltimaFacturaCliente || "N/A";
                let claseCssEstadoFactura = `invoice-status-${estadoFactura.toLowerCase().replace(/ /g, '_')}`;
                if (estadoFactura === "N/A") claseCssEstadoFactura = "invoice-status-na";
                let textoPildoraFactura = paymentStatusDetails[estadoFactura.toLowerCase().replace(/ /g, '_')]?.text || estadoFactura;
                if(estadoFactura === "N/A" && !paymentStatusDetails[estadoFactura.toLowerCase().replace(/ /g, '_')]) {
                    textoPildoraFactura = "N/A";
                }
                // --- FIN DE LA CORRECCIÓN ---
            
                const clientElement = document.createElement('div');
                clientElement.classList.add('client-list-item'); 
                clientElement.setAttribute('data-client-id', clientId);
            
                // Ahora el innerHTML puede usar las variables sin problemas
                clientElement.innerHTML = `
                    <div class="client-info">
                        <strong class="client-name">${client.name}</strong>
                        <span class="client-contact">${client.email || ''} ${client.email && client.phone ? '|' : ''} ${client.phone || ''}</span>
                    </div>
                    <div class="client-pills">
                        <span class="option-status-pill ${claseCssEstadoGeneral}">${estadoGeneral}</span>
                    </div>
                    <div class="client-actions-list">
                        <button type="button" class="btn btn-sm btn-warning edit-client-list-btn">Editar</button>
                        <button type="button" class="btn btn-sm btn-danger delete-client-list-btn">Eliminar</button>
                    </div>
                `;
            
                // Listeners para los botones de la tarjeta
                clientElement.querySelector('.edit-client-list-btn').addEventListener('click', () => {
                    loadClientForEditing(clientId);
                });
                clientElement.querySelector('.delete-client-list-btn').addEventListener('click', async () => {
                    if (confirm(`¿Seguro que deseas marcar como inactivo a "${client.name}"?`)) {
                        showLoading(true);
                        await softDeleteClient(clientId);
                        await displayActiveClients();
                        await displayDeletedClients();
                        await loadClientsIntoDropdown();
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

if (showNewClientFormBtn) {
    showNewClientFormBtn.addEventListener('click', () => {
        if (newClientFormContainer) {
            newClientFormContainer.style.display = 'block';
            showNewClientFormBtn.style.display = 'none';
        }
    });
}

if (cancelNewClientBtn) {
    cancelNewClientBtn.addEventListener('click', () => {
        if (newClientForm) newClientForm.reset();
        if (newClientFormContainer) newClientFormContainer.style.display = 'none';
        if (showNewClientFormBtn) showNewClientFormBtn.style.display = 'inline-flex';
    });
}

if (newClientForm) {
    newClientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('newClientName').value.trim();
        const phone = document.getElementById('newClientPhone').value.trim();
        const email = document.getElementById('newClientEmail').value.trim();

        if (!name && !phone && !email) {
            alert("Debes rellenar al menos un campo para guardar el cliente.");
            return;
        }

        showLoading(true);
        const success = await saveNewClient(name, phone, email);
        showLoading(false);

        if (success) {
            newClientForm.reset();
            if (newClientFormContainer) newClientFormContainer.style.display = 'none';
            if (showNewClientFormBtn) showNewClientFormBtn.style.display = 'inline-flex';
            // Refrescar las vistas
            await displayActiveClients();
            await displayDeletedClients();
            await loadClientsIntoDropdown();
        }
    });
}

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


// === INICIO: CÓDIGO CORREGIDO PARA LOS LISTENERS DE LOS BOTONES DEL MODAL ===

// 1. Definimos las funciones que manejarán los clics
const handleModalPdfClick = async () => {
    // 1. Primero, verifica la bandera. Si ya está en true, no hace nada y sale.
    if (isGeneratingPdf) {
        console.warn("PDF ya en proceso de generación. Se ha ignorado el segundo clic.");
        return; 
    }

    // 2. Si no, levanta la bandera para bloquear futuros clics y ejecuta la acción.
    isGeneratingPdf = true;

    if (currentInvoiceDataForModalActions) {
        try {
            // Llama a la función para generar el PDF
            await generateInvoicePDF(currentInvoiceDataForModalActions);
        } catch (error) {
            console.error("Error capturado durante la generación del PDF en el handler:", error);
        } finally {
            // 3. Después de 1.5 segundos, baja la bandera para permitir que el botón se use de nuevo.
            //    Esto da tiempo suficiente para que la descarga comience y evita clics accidentales.
            setTimeout(() => {
                isGeneratingPdf = false;
                // console.log("Bandera de generación de PDF reiniciada.");
            }, 1500); // 1.5 segundos
        }
    } else {
        alert("No hay datos de factura para generar el PDF.");
        isGeneratingPdf = false; // Si no hay datos, baja la bandera inmediatamente.
    }
};

const handleModalShareClick = () => {
    if (currentInvoiceDataForModalActions) {
        openTemplateSelectionModal('share');
    } else {
        alert("No hay datos de factura para compartir.");
    }
};

const handleModalWhatsAppClick = () => {
    if (currentInvoiceDataForModalActions) {
        openTemplateSelectionModal('whatsapp');
    } else {
        alert("No hay datos de factura para enviar a WhatsApp.");
    }
};

const handleModalImageClick = () => {
    if (currentInvoiceDataForModalActions) {
        openTemplateSelectionModal('image');
    } else {
        alert("No hay datos de factura para generar imagen.");
    }
};

const handleModalEmailClick = async () => {
    // Reutilizamos la bandera del PDF para evitar acciones dobles
    if (isGeneratingPdf) {
        console.warn("Acción de PDF ya en proceso. Se ha ignorado el clic en Email.");
        return; 
    }

    if (currentInvoiceDataForModalActions) {
        // 1. Informar al usuario del proceso
        alert("Se generará y descargará el PDF. Luego, se abrirá tu programa de correo para que puedas adjuntarlo y enviarlo.");
        
        // 2. Generar y descargar el PDF para que el usuario lo tenga listo
        await generateInvoicePDF(currentInvoiceDataForModalActions);
        
        // Pequeña pausa para que el usuario note la descarga
        await new Promise(resolve => setTimeout(resolve, 500));

        // 3. Preparar la información para el correo
        const clientEmail = currentInvoiceDataForModalActions.client?.email || '';
        const subject = `Factura N° ${currentInvoiceDataForModalActions.invoiceNumberFormatted || 'N/A'} de OSCAR 07D Studios`;
        
        const body = `Estimado/a ${currentInvoiceDataForModalActions.client?.name || 'Cliente'},\n\n` +
                   `Espero que te encuentres bien.\n\n` +
                   `Por favor, busca en tu carpeta de descargas el archivo PDF llamado "Factura-${currentInvoiceDataForModalActions.invoiceNumberFormatted || 'NroFactura'}.pdf" y adjúntalo a este correo antes de enviarlo.\n\n` +
                   `¡Gracias por tu confianza!\n\n` +
                   `Saludos cordiales,\nOSCAR 07D Studios`;
        
        // --- LÍNEA CORREGIDA ---
        // Se usan comillas invertidas (`) para crear una plantilla de texto
        // y la sintaxis ${variable} para insertar los valores correctamente.
        window.location.href = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    } else {
        alert("No hay datos de factura para enviar por email.");
    }
};

// 2. Se asignan los listeners a los botones de forma segura.

if (modalPdfBtn) { 
    modalPdfBtn.onclick = handleModalPdfClick; 
}
if (modalShareBtn) { 
    modalShareBtn.onclick = handleModalShareClick;
}
if (modalWhatsAppBtn) { 
    modalWhatsAppBtn.onclick = handleModalWhatsAppClick;
}
if (modalImageBtn) { 
    modalImageBtn.onclick = handleModalImageClick;
}
if (modalEmailBtn) { 
    modalEmailBtn.onclick = handleModalEmailClick;
}

// --- Event Listeners para el Modal de Selección de Plantilla (#templateSelectionModal) ---
if (closeTemplateSelectionModalBtn) {
    closeTemplateSelectionModalBtn.addEventListener('click', closeTemplateSelectionModal);
}
if (cancelTemplateSelectionBtn) {
    cancelTemplateSelectionBtn.addEventListener('click', closeTemplateSelectionModal);
}
if (proceedWithTemplateSelectionBtn) {
    proceedWithTemplateSelectionBtn.addEventListener('click', async () => {
        console.log("Botón 'Continuar' del modal de selección presionado.");
        console.log("currentActionForTemplateSelection:", currentActionForTemplateSelection); // Para saber qué botón original lo llamó
        console.log("currentInvoiceDataForModalActions:", currentInvoiceDataForModalActions); // Para ver los datos de la factura

        if (!currentInvoiceDataForModalActions) {
            alert("Error: No hay datos de factura seleccionados.");
            closeTemplateSelectionModal();
            return;
        }

        const useReminderTemplate = isReminderCheckbox.checked;
        console.log("Usar plantilla de recordatorio:", useReminderTemplate);

        let templateIdToUse;
        let reminderStatus = null;
        let baseFileName = `Factura_${currentInvoiceDataForModalActions.invoiceNumberFormatted?.replace(/[^a-zA-Z0-9]/g, '_') || 'INV'}`; // Nombre de archivo base

        if (useReminderTemplate) {
            templateIdToUse = 'payment-reminder-export-template';
            const paymentStatus = currentInvoiceDataForModalActions.paymentStatus;
            if (paymentStatus === 'pending' || paymentStatus === 'in_process') { reminderStatus = 'pending'; } 
            else if (paymentStatus === 'overdue') { reminderStatus = 'overdue'; } 
            else { 
                reminderStatus = 'pending'; 
                console.warn(`Estado de factura '${paymentStatus}' no ideal para recordatorio, usando '${reminderStatus}'.`);
            }
            baseFileName = `Recordatorio_${currentInvoiceDataForModalActions.invoiceNumberFormatted?.replace(/[^a-zA-Z0-9]/g, '_') || 'REM'}`;
            // console.log(`Acción: ${currentActionForTemplateSelection}, Usando Plantilla de Recordatorio (estado: ${reminderStatus})`);
        } else {
            templateIdToUse = 'whatsapp-image-export-template';
            // console.log(`Acción: ${currentActionForTemplateSelection}, Usando Plantilla de WhatsApp`);
        }
        console.log("Plantilla a usar (ID):", templateIdToUse, "Estado recordatorio (si aplica):", reminderStatus);

        const imageFormat = (currentActionForTemplateSelection === 'image') ? imageFormatSelect.value : 'png'; // PNG para compartir, configurable para descarga
        const fullFileName = `${baseFileName}.${imageFormat}`;
        console.log("Formato de imagen:", imageFormat, "Nombre de archivo:", fullFileName);

        closeTemplateSelectionModal(); // Cerrar el modal de selección antes de procesar

        console.log("Llamando a generateInvoiceImage...");
        const imageBlob = await generateInvoiceImage(templateIdToUse, currentInvoiceDataForModalActions, imageFormat, reminderStatus);

        console.log("Resultado de generateInvoiceImage (imageBlob):", imageBlob); // MUY IMPORTANTE VER ESTO

        if (!imageBlob) {
            console.error("generateInvoiceImage devolvió null o undefined. No se puede continuar.");
            // generateInvoiceImage ya muestra una alerta en caso de error,
            // pero podrías añadir un mensaje más específico aquí si quieres.
            // alert("No se pudo generar la imagen para la acción seleccionada.");
            return;
        }

        // Convertir el Blob a un File object para la Web Share API
        const imageFile = new File([imageBlob], fullFileName, { type: `image/${imageFormat}` });
        console.log("Archivo de imagen creado:", imageFile);

        if (currentActionForTemplateSelection === 'image') {
            console.log("Acción: Descargar imagen.");
            // Acción: Descargar la imagen
            downloadBlob(imageBlob, imageFile.name);
            console.log(`Imagen ${imageFile.name} debería haber sido descargada.`);
        } else if (currentActionForTemplateSelection === 'whatsapp' || currentActionForTemplateSelection === 'share') {
            console.log("Acción: Compartir (WhatsApp/General). Intentando navigator.share...");
            // Acción: Intentar compartir con Web Share API
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
                try {
                    await navigator.share({
                        files: [imageFile],
                        title: useReminderTemplate ? `Recordatorio ${currentInvoiceDataForModalActions.invoiceNumberFormatted}` : `Factura ${currentInvoiceDataForModalActions.invoiceNumberFormatted}`,
                        text: `Aquí está tu ${useReminderTemplate ? 'recordatorio de pago' : 'factura'} de OSCAR 07D Studios.`
                        // No se puede pre-seleccionar WhatsApp con navigator.share, el usuario elige.
                    });
                    console.log('Contenido compartido exitosamente vía Web Share API.');
                } catch (error) {
                    console.error('Error al usar Web Share API:', error);
                    // Fallback si el usuario cancela el share o hay un error
                    if (error.name !== 'AbortError') { // No mostrar alerta si solo canceló
                        alert('No se pudo compartir. Descargando imagen para que la compartas manualmente.');
                    }
                    downloadBlob(imageBlob, imageFile.name); // Descargar como fallback
                }
            } else {
                console.warn('navigator.share no disponible o no puede compartir archivos. Descargando como fallback.');
                // Fallback para navegadores que no soportan Web Share API con archivos
                alert('Tu navegador no soporta compartir archivos directamente. Descargando la imagen para que la puedas compartir manualmente.');
                downloadBlob(imageBlob, imageFile.name);
            }
        }
        // Limpiar la acción actual después de procesarla
        currentActionForTemplateSelection = null; 
    });
}

if (templateSelectionModal) {
    templateSelectionModal.addEventListener('click', (event) => {
        if (event.target === templateSelectionModal) {
            closeTemplateSelectionModal();
        }
    });
}
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && templateSelectionModal && templateSelectionModal.classList.contains('active')) {
        closeTemplateSelectionModal();
    }
});

// if (modalPdfBtn) {
//     modalPdfBtn.addEventListener('click', async () => {
//         if (currentInvoiceDataForModalActions) {
//             // La variable currentInvoiceDataForModalActions se llena cuando abres el modal
//             console.log("Generando PDF desde modal con datos:", currentInvoiceDataForModalActions); // Log para depurar
//             await generateInvoicePDF(currentInvoiceDataForModalActions); // Pasa el objeto de datos
//         } else {
//             alert("No hay datos de factura cargados en el modal para generar el PDF.");
//             console.error("currentInvoiceDataForModalActions es null o undefined al intentar generar PDF desde modal.");
//         }
//     });
// }

// Placeholder para el botón de imprimir/descargar en el modal ELIMINADO ya que se retiro del index.html
// if (printInvoiceFromModalBtn) {
//    printInvoiceFromModalBtn.addEventListener('click', () => {
//        alert("Funcionalidad de Imprimir/Descargar PDF desde el modal está pendiente.");
//    });
//}

// --- Lógica de Autenticación y Estado ---
if (loginButton) { 
    loginButton.addEventListener('click', async () => {
        console.log("Iniciando flujo de inicio de sesión nativo con Google...");
        showLoading(true);
        try {
            // 1. Inicializar el plugin de Google Auth una sola vez al inicio del flujo
            // El serverClientId se lee automáticamente del strings.xml
            await window.Capacitor.Plugins.GoogleAuth.initialize();

            // 2. Llama al plugin para que Android muestre la ventana de selección de cuentas
            const googleUser = await window.Capacitor.Plugins.GoogleAuth.signIn();

            // 3. Si el usuario elige una cuenta, obtenemos un "token" de Google
            if (googleUser && googleUser.authentication?.idToken) {
                console.log("Token de Google obtenido con éxito.");
                // 4. Creamos una credencial de Firebase usando ese token
                const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);

                // 5. Iniciamos sesión en Firebase con esa credencial
                await signInWithCredential(auth, credential);
                console.log("Inicio de sesión en Firebase exitoso.");
                // onAuthStateChanged se encargará del resto
            } else {
                throw new Error("No se pudo obtener el token de autenticación de Google.");
            }

        } catch (error) {
            console.error("Error en el inicio de sesión nativo con Google:", error);
            alert("Hubo un error al iniciar sesión. Por favor, intenta de nuevo.");
            showLoading(false);
        }
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

// En tu script.js, reemplaza tu onAuthStateChanged con esto:

onAuthStateChanged(auth, (user) => {
    showLoading(false);
    const navAccount = document.getElementById('navAccount');

    if (user) {
        // User is signed in, show the main app
        if(loginContainer) loginContainer.style.display = 'none';
        if(mainContent) mainContent.style.display  = 'flex';
        
        handleNavigation('homeSection'); // Go to the home screen by default

        if (navAccount) navAccount.style.display = 'list-item'; // Show the "Mi Cuenta" tab

        // =======================================================
        // ===> CORE FIX: ACTIVATE PROFILE BUTTONS HERE <===
        // =======================================================
        
        const profilePhotoBtn = document.getElementById('profilePhotoBtn');
        if (profilePhotoBtn) {
            profilePhotoBtn.addEventListener('click', openEditPhotoModal);
        }

        const profileNameBtn = document.getElementById('profileNameBtn');
        if (profileNameBtn) {
            profileNameBtn.addEventListener('click', openEditNameModal);
        }

        const profileEmailBtn = document.getElementById('profileEmailBtn');
        if (profileEmailBtn) {
            profileEmailBtn.addEventListener('click', openEditEmailModal);
        }
        // =======================================================

    } else {
        // User is signed out, show the login screen
        if(loginContainer) loginContainer.style.display = 'flex';
        if(mainContent) mainContent.style.display  = 'none';

        if (navAccount) navAccount.style.display = 'none'; // Hide the "Mi Cuenta" tab
    }
});

// 2) Handler de click en Ajustes
document.getElementById('navProfile').addEventListener('click', (e) => {
  e.preventDefault();
  handleNavigation('profileSection');
});

// --- Event Listeners para el Modal de Actualizar Pago ---
if (closePaymentUpdateModalBtn) {
    closePaymentUpdateModalBtn.addEventListener('click', closePaymentUpdateModal);
}
if (closeUpdateModalBtn) { // Botón "Cerrar" del footer
    closeUpdateModalBtn.addEventListener('click', closePaymentUpdateModal);
}
if (paymentUpdateModal) {
    paymentUpdateModal.addEventListener('click', (event) => {
        if (event.target === paymentUpdateModal) {
            closePaymentUpdateModal();
        }
    });
}
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && paymentUpdateModal?.classList.contains('active')) {
        closePaymentUpdateModal();
    }
});

// Listener para el botón "Marcar como Pagado"
if (confirmAndSetNextBtn) {
    confirmAndSetNextBtn.addEventListener('click', async () => {
        const newDueDate = nextDueDateInput.value;
        if (!newDueDate) {
            alert("Por favor, establece la próxima fecha de pago.");
            return;
        }
        if (!confirm("¿Confirmas que has recibido el pago y quieres actualizar la fecha de vencimiento?")) {
            return;
        }
        
        showLoading(true);
        const invoiceRef = doc(db, "facturas", currentInvoiceIdForModalActions);
        
        try {
            await updateDoc(invoiceRef, {
                paymentStatus: "paid",
                serviceStartDate: newDueDate
            });

            const clientId = currentInvoiceDataForModalActions.client?.id;
            
            if (clientId) {
                const clientRef = doc(db, "clientes", clientId);
                await updateDoc(clientRef, {
                    estadoUltimaFacturaCliente: "paid",
                    estadoGeneralCliente: "Al día" // Actualizamos también el estado general
                });
            } else {
                console.warn("No se encontró un ID de cliente en esta factura. El estado del cliente no se pudo actualizar. Esto es normal para facturas antiguas.");
            }

            alert("¡Factura actualizada con éxito!");
            closePaymentUpdateModal();

            // Refrescar ambas vistas para asegurar que los cambios se vean en todos lados
            await loadAndDisplayInvoices(); 
            await displayActiveClients();
            await displayDeletedClients();

        } catch (error) {
            console.error("Error al actualizar la factura o el cliente:", error);
            alert("Hubo un error al actualizar los datos.");
        } finally {
            showLoading(false);
        }
    });
}

// Listener para el botón "Cancelar Suscripción"
if (cancelSubscriptionBtn) {
    cancelSubscriptionBtn.addEventListener('click', async () => {
        if (!confirm("¿Estás seguro de que deseas cancelar la suscripción/pago recurrente para esta factura? El estado cambiará a 'Cancelado'.")) {
            return;
        }

        showLoading(true);
        const invoiceRef = doc(db, "facturas", currentInvoiceIdForModalActions);
        try {
            await updateDoc(invoiceRef, {
                paymentStatus: "cancelled"
                // Opcionalmente, también podrías poner serviceStartDate a null
                // serviceStartDate: null 
            });
            alert("La suscripción ha sido marcada como cancelada.");
            closePaymentUpdateModal();
            await loadAndDisplayInvoices(); // Refrescar la lista
        } catch (error) {
            console.error("Error al cancelar la suscripción:", error);
            alert("Hubo un error al cancelar la suscripción.");
        } finally {
            showLoading(false);
        }
    });
}

// Listeners para los controles de búsqueda de facturas

if (invoiceSearchInput) {
    invoiceSearchInput.addEventListener('input', () => {
        loadAndDisplayInvoices(); // Vuelve a cargar y filtrar la lista al escribir
    });
}
if (statusFilterSelect) {
    statusFilterSelect.addEventListener('change', () => {
        loadAndDisplayInvoices(); // Vuelve a cargar y filtrar la lista al cambiar el estado
    });
}

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

/* if (generateInvoiceFileBtn) {
    console.log("Botón 'generateInvoiceFileBtn' encontrado, asignando evento..."); // Para depuración
    generateInvoiceFileBtn.addEventListener('click', generateInvoicePDF);
} else {
    console.error("Botón 'generateInvoiceFileBtn' NO encontrado en el DOM."); // Para depuración
} */

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
        
        // Habilitar campos para edición
        if (clientNameInput) clientNameInput.disabled = false; 
        if (clientPhoneInput) clientPhoneInput.disabled = false; 
        if (clientEmailInput) clientEmailInput.disabled = false;
        if (clientNameInput) clientNameInput.focus();

        // Poner la app en modo "edición de cliente"
        isEditingClient = true; 

        // Ocultar el botón "Editar" y mostrar el de "Guardar Cambios"
        editClientBtn.style.display = 'none';
        if (updateClientBtn) updateClientBtn.style.display = 'inline-flex';

        alert("Ahora puedes editar los datos del cliente. Usa el botón 'Guardar Cambios' para finalizar.");
    });
}

if (updateClientBtn) {
    updateClientBtn.addEventListener('click', async () => {
        if (!isEditingClient || !hiddenSelectedClientIdInput || hiddenSelectedClientIdInput.value === "") {
            alert("No hay un cliente seleccionado para actualizar.");
            return;
        }

        const clientId = hiddenSelectedClientIdInput.value;
        const clientRef = doc(db, "clientes", clientId);

        const clientUpdates = {
            name: clientNameInput.value.trim(),
            phone: clientPhoneInput.value.trim(),
            email: clientEmailInput.value.trim(),
            updatedAt: serverTimestamp()
        };

        if (!clientUpdates.name || !clientUpdates.phone || !clientUpdates.email) {
            alert("Por favor, asegúrate de que todos los campos del cliente estén completos.");
            return;
        }
        
        showLoading(true);

        try {
            // Actualizar el documento en Firestore
            await updateDoc(clientRef, clientUpdates);
            
            // Actualizar la vista en la página
            isEditingClient = false;
            clientNameInput.disabled = true;
            clientPhoneInput.disabled = true;
            clientEmailInput.disabled = true;
            updateClientBtn.style.display = 'none'; // Ocultar "Guardar Cambios"
            editClientBtn.style.display = 'inline-flex'; // Mostrar "Editar" de nuevo

            // Refrescar el desplegable de clientes para que muestre los datos actualizados
            await loadClientsIntoDropdown();
            // Reseleccionar el cliente recién editado en el desplegable
            handleClientSelection(clientId, clientUpdates.name, { id: clientId, ...clientUpdates });

            alert("¡Datos del cliente actualizados con éxito!");

        } catch (error) {
            console.error("Error al actualizar cliente:", error);
            alert("Hubo un error al guardar los cambios.");
        } finally {
            showLoading(false);
        }
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
        if (!user) { alert("Debes iniciar sesión para guardar."); return; }
        
        let clientName = clientNameInput?.value.trim();
        let clientPhone = clientPhoneInput?.value.trim();
        let clientEmail = clientEmailInput?.value.trim();

        // --- VALIDACIÓN CORREGIDA (Correo opcional) ---
        if (!clientName || !clientPhone) { 
            alert("Por favor, completa al menos el nombre y el celular del cliente."); 
            return; 
        }
        if (currentInvoiceItems.length === 0) { alert("Por favor, agrega al menos un ítem a la factura."); return; }
        if (!invoiceDateInput.value) { alert("Por favor, selecciona una fecha para la factura."); return; }
        
        if (saveInvoiceBtn) saveInvoiceBtn.disabled = true;
        showLoading(true);

        const selectedClientId = hiddenSelectedClientIdInput.value;
        if (selectedClientId && isEditingClient) {
            const clientRef = doc(db, "clientes", selectedClientId);
            const clientUpdates = { name: clientName, phone: clientPhone, email: clientEmail, updatedAt: serverTimestamp() };
            try {
                await updateDoc(clientRef, clientUpdates);
                // ... (tu lógica para actualizar el cliente en el array local) ...
            } catch (error) {
                console.error("Error al actualizar cliente:", error);
                alert("Error al actualizar datos del cliente.");
            }
            isEditingClient = false; 
            if (clientNameInput) clientNameInput.disabled = true; 
            if (clientPhoneInput) clientPhoneInput.disabled = true;
            if (clientEmailInput) clientEmailInput.disabled = true;
        }

        recalculateTotals();

        const parseCurrencyString = (str) => {
            if (typeof str !== 'string') return 0;
            const cleanNumberStr = str.replace(/[^\d,]/g, '').replace(',', '.');
            return parseFloat(cleanNumberStr) || 0;
        };
        
        let actualNumericInvoiceNumber, formattedInvoiceNumberStr, uniqueQueryCode;
        
        try {
            actualNumericInvoiceNumber = await getNextInvoiceNumber(user.uid);
            formattedInvoiceNumberStr = formatInvoiceNumber(actualNumericInvoiceNumber);
            uniqueQueryCode = await getTrulyUniqueCode(user.uid);
            if (!uniqueQueryCode) throw new Error("No se pudo generar un código único.");
        } catch (error) { 
            alert("Error crítico al generar el número o código de la factura.");
            showLoading(false); 
            if (saveInvoiceBtn) saveInvoiceBtn.disabled = false;
            return; 
        }

        const invoiceToSave = {
            userId: user.uid,
            invoiceNumberFormatted: `FCT-${formattedInvoiceNumberStr}`,
            invoiceNumberNumeric: actualNumericInvoiceNumber,
            uniqueQueryCode: uniqueQueryCode,
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
                id: selectedClientId || null, // <-- ¡CORRECCIÓN CLAVE! Guarda el ID del cliente
                name: clientName, 
                phone: clientPhone, 
                email: clientEmail 
            }, 
            items: currentInvoiceItems,
            discount: { type: discountTypeSelect.value, value: (parseFloat(discountValueInput.value) || 0) },
            totals: {
                subtotal: parseCurrencyString(subtotalAmountSpan.textContent),
                discountApplied: parseCurrencyString(discountAmountAppliedSpan.textContent),
                taxableBase: parseCurrencyString(taxableBaseAmountSpan.textContent),
                iva: parseCurrencyString(ivaAmountSpan.textContent),
                grandTotal: parseCurrencyString(totalAmountSpan.textContent)
            },
            paymentStatus: paymentStatusSelect.value,
            createdAt: serverTimestamp()
        };

        try {
            await addDoc(collection(db, "facturas"), invoiceToSave);
            alert(`¡Factura FCT-${formattedInvoiceNumberStr} guardada exitosamente!`);

            if (!selectedClientId) { 
                const newClientData = { 
                    userId: user.uid, name: clientName, phone: clientPhone, email: clientEmail, 
                    createdAt: serverTimestamp(), isDeleted: false, 
                    estadoGeneralCliente: "Nuevo", 
                    estadoUltimaFacturaCliente: invoiceToSave.paymentStatus 
                };
                await addDoc(collection(db, "clientes"), newClientData);
            } else { 
                const clientRef = doc(db, "clientes", selectedClientId);
                await updateDoc(clientRef, {
                    estadoUltimaFacturaCliente: invoiceToSave.paymentStatus,
                    updatedAt: serverTimestamp() 
                });
            }
            
            invoiceForm.reset();
            currentInvoiceItems = []; 
            renderItems(); 
            setDefaultInvoiceDate(); 
            await loadClientsIntoDropdown(); 
            await displayNextPotentialInvoiceNumber();
            
        } catch (error) { 
            console.error("Error al guardar en Firestore:", error);
            alert(`Error durante el guardado: ${error.message}`);
        } finally { 
            if (saveInvoiceBtn) saveInvoiceBtn.disabled = false;
            showLoading(false);
        }
    });
}

if (invoiceSearchBtn) {
    invoiceSearchBtn.addEventListener('click', () => {
        // La función loadAndDisplayInvoices ya lee el valor del input,
        // así que solo necesitamos llamarla para que filtre.
        loadAndDisplayInvoices();
    });
}

if (navHome) navHome.addEventListener('click', (e) => { e.preventDefault(); handleNavigation('homeSection'); });

if (loginButton) {
    loginButton.addEventListener("click", async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            console.log("Usuario autenticado:", user);
            alert(`¡Bienvenido, ${user.displayName}!`);

            // Aquí puedes redirigir o cambiar la vista
            // Por ejemplo:
            // window.location.href = "dashboard.html";

        } catch (error) {
            console.error("Error durante el inicio de sesión con Google:", error.message);
            alert("Ocurrió un error al iniciar sesión. Revisa la consola.");
        }
    });
}

// Controlador de selección de bancos
const selectedBanks = new Set();
const allBanksCheckbox = document.querySelector('#bankSelectionGrid input[value="all"]');
const bankCards = document.querySelectorAll('.bank-card');

bankCards.forEach(card => {
  card.addEventListener('click', () => {
    const value = card.dataset.value;

    if (selectedBanks.has(value)) {
      selectedBanks.delete(value);
      card.classList.remove('selected');
    } else {
      selectedBanks.add(value);
      card.classList.add('selected');
    }

    // Si se selecciona uno manual, desactiva "Permitir todos"
    if (allBanksCheckbox.checked) {
      allBanksCheckbox.checked = false;
    }
  });
});

allBanksCheckbox.addEventListener('change', () => {
  if (allBanksCheckbox.checked) {
    selectedBanks.clear();
    bankCards.forEach(c => c.classList.remove('selected'));
  }
});

document.getElementById('btnSaveSettings').addEventListener('click', async () => {
  const linkDePago = document.getElementById('inputPdfLink').value.trim();

  // Capturar bancos seleccionados
  const allBanksCheckbox = document.querySelector('#bankSelectionGrid input[type="checkbox"][value="all"]');
  const selectedBankCards = document.querySelectorAll('#bankSelectionGrid .bank-card.selected');

  const selectedBanks = Array.from(selectedBankCards).map(card => card.dataset.value);
  const bancosSeleccionados = allBanksCheckbox.checked ? ['all'] : selectedBanks;

  // Previsualización (o puedes guardar en Firestore aquí)
  console.log("✅ Link de Pago ingresado:", linkDePago || 'Ninguno');
  console.log("✅ Bancos seleccionados:", bancosSeleccionados);

  // Aquí podrías guardar a Firestore si deseas:
  // await setDoc(doc(db, "user_profiles", auth.currentUser.uid), {
  //   paymentLink: linkDePago,
  //   acceptedBanks: bancosSeleccionados
  // }, { merge: true });

  alert("Ajustes guardados correctamente.");
});

// Funcionalidad: Previsualizar logo cargado
document.getElementById('inputUploadLogo').addEventListener('change', function (e) {
  const file = e.target.files[0];
  const preview = document.getElementById('previewLogo');

  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      preview.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Funcionalidad: Previsualizar QR cargado
document.getElementById('inputUploadQR').addEventListener('change', function (e) {
  const file = e.target.files[0];
  const preview = document.getElementById('previewQR');

  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      preview.src = event.target.result;
      preview.style.display = 'block'; // Mostrar solo si hay imagen
    };
    reader.readAsDataURL(file);
  }
});

const templateCheckboxes = document.querySelectorAll('.template-toggle');
const previewPdf = document.getElementById('pdfTemplatePreview');
const previewWhatsapp = document.getElementById('whatsappTemplatePreview');
const previewReminder = document.getElementById('reminderTemplatePreview');

function updateTemplatePreviews() {
  const selectedTemplates = Array
    .from(document.querySelectorAll('.template-toggle'))
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  const templates = [
    {
      value: 'pdf',
      originalId: 'invoice-export-template',
      previewId: 'pdfTemplatePreview',
      scale: 0.24
    },
    {
      value: 'whatsapp',
      originalId: 'whatsapp-image-export-template',
      previewId: 'whatsappTemplatePreview',
      scale: 0.32
    },
    {
      value: 'reminder',
      originalId: 'payment-reminder-export-template',
      previewId: 'reminderTemplatePreview',
      scale: 0.42
    }
  ];

  templates.forEach(({ value, originalId, previewId, scale }) => {
    const original  = document.getElementById(originalId);
    const container = document.getElementById(previewId);

    if (!container) return;
    container.innerHTML = '';

    if (selectedTemplates.includes(value) && original) {
      // 1) Mostrar momentáneamente la plantilla oculta
      original.style.display = 'block';

      // 2) Clonar y estilizar
      const clone = original.cloneNode(true);
      clone.style.display         = '';
      clone.style.transform       = `scale(${scale})`;
      clone.style.transformOrigin = 'top left';
      clone.style.border          = '1px solid #ccc';
      clone.style.padding         = '8px';
      clone.style.background      = '#fff';

      // 3) Insertar en su contenedor
      container.appendChild(clone);
      container.style.display = 'block';

      // 4) Volver a ocultar la plantilla original
      original.style.display = 'none';
    } else {
      container.style.display = 'none';
    }
  });
}

// Vuelve a enganchar el listener si fuera necesario:
document.querySelectorAll('.template-toggle')
        .forEach(cb => cb.addEventListener('change', updateTemplatePreviews));

// Llamada inicial
updateTemplatePreviews();
document.addEventListener("DOMContentLoaded", () => {
  updateTemplatePreviews();
});

// ===================== CONFIGURACIÓN GLOBAL OPCIONAL ===================== //

let userSettings = {
  logoUrl: '',
  qrUrl: '',
  linkPago: '',
  bancos: []
};

// ===================== CARGA DE AJUSTES DESDE FIRESTORE ===================== //

async function loadUserSettingsFromFirestore() {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const ref = doc(db, "user_profiles", userId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      userSettings.logoUrl = data.logoUrl || '';
      userSettings.qrUrl = data.qrUrl || '';
      userSettings.linkPago = data.linkPago || '';
      userSettings.bancos = data.bancos || [];
    }

    updateVisualSettingsPreview();
  } catch (error) {
    console.error("Error al cargar ajustes:", error);
  }
}

// ===================== FUNCIONES DE APOYO ===================== //

function applyOptionalLogo(doc, x, y, width, height) {
  if (userSettings.logoUrl) {
    try {
      doc.addImage(userSettings.logoUrl, 'PNG', x, y, width, height);
    } catch (e) {
      console.warn("⚠️ Logo no válido. Usando logo por defecto.");
      doc.addImage('img/default-logo.png', 'PNG', x, y, width, height);
    }
  } else {
    doc.addImage('img/default-logo.png', 'PNG', x, y, width, height);
  }
}

function applyOptionalQR(doc, x, y, width, height) {
  if (userSettings.qrUrl) {
    try {
      doc.addImage(userSettings.qrUrl, 'PNG', x, y, width, height);
    } catch (e) {
      console.warn("⚠️ QR no válido:", e.message);
    }
  }
}

function applyOptionalLinkAndBanks(doc, startX, startY) {
  let y = startY;

  if (userSettings.linkPago) {
    doc.setFontSize(10);
    doc.text("Link de pago:", startX, y);
    y += 6;
    doc.text(userSettings.linkPago, startX, y);
    y += 10;
  }

  if (userSettings.bancos && userSettings.bancos.length > 0) {
    const bancoLogos = {
      nequi: 'img/banks/nequi.svg',
      daviplata: 'img/banks/daviplata.svg',
      lulo: 'img/banks/lulo.svg',
      nu: 'img/banks/nu.svg',
      uala: 'img/banks/uala.svg',
      pibank: 'img/banks/pibank.svg',
      movii: 'img/banks/movii.svg',
      powwi: 'img/banks/powwi.svg',
      bancolombia: 'img/banks/bancolombia.svg',
      davivienda: 'img/banks/davivienda.svg',
      'caja-social': 'img/banks/caja-social.svg',
      falabella: 'img/banks/falabella.svg',
      bbva: 'img/banks/bbva.svg',
      itau: 'img/banks/itau.svg',
      'av-villas': 'img/banks/av-villas.svg',
      finandina: 'img/banks/finandina.svg',
      bogota: 'img/banks/bogota.svg'
    };

    userSettings.bancos.forEach((banco, index) => {
      const img = bancoLogos[banco];
      if (img) {
        try {
          doc.addImage(img, 'PNG', startX + (index * 28), y, 20, 20);
        } catch (e) {
          console.warn(`⚠️ No se cargó logo de banco '${banco}':`, e.message);
        }
      }
    });
  }
}

// --- LISTENERS PARA MODALES DE MI CUENTA ---

// Listeners para Editar Foto de Perfil
if (profilePhotoBtn) profilePhotoBtn.addEventListener('click', openEditPhotoModal);
if (closeEditPhotoModalBtn) closeEditPhotoModalBtn.addEventListener('click', closeEditPhotoModal);
if (cancelEditPhotoBtn) cancelEditPhotoBtn.addEventListener('click', closeEditPhotoModal);
if (selectPhotoBtn) selectPhotoBtn.addEventListener('click', () => photoUploadInput.click());
if (photoUploadInput) {
    photoUploadInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            selectedPhotoFile = file;
            photoPreview.src = URL.createObjectURL(file);
            savePhotoBtn.disabled = false;
        }
    });
}
if (savePhotoBtn) savePhotoBtn.addEventListener('click', saveProfilePhoto);

// Listeners para Editar Correo Electrónico
if (profileEmailBtn) profileEmailBtn.addEventListener('click', openEditEmailModal);
if (closeEditEmailModalBtn) closeEditEmailModalBtn.addEventListener('click', closeEditEmailModal);
if (cancelEditEmailBtn) cancelEditEmailBtn.addEventListener('click', closeEditEmailModal);
if (saveEmailBtn) saveEmailBtn.addEventListener('click', saveProfileEmail);

function buildWhatsAppMessage(clientName) {
  let mensaje = `Hola ${clientName}, aquí te compartimos tu factura.`;
  if (userSettings.linkPago) {
    mensaje += ` Puedes pagar aquí: ${userSettings.linkPago}`;
  }
  return mensaje;
}

// ===================== MANEJO DE BOTONES DE AJUSTES ===================== //

document.getElementById('btnDeleteLogo')?.addEventListener('click', () => {
  userSettings.logoUrl = '';
  document.getElementById('previewLogo').src = 'img/default-logo.png';
  alert('Logo eliminado');
});

document.getElementById('btnDeleteQR')?.addEventListener('click', () => {
  userSettings.qrUrl = '';
  document.getElementById('previewQR').style.display = 'none';
  alert('QR eliminado');
});

function updateVisualSettingsPreview() {
  const previewLogo = document.getElementById('previewLogo');
  if (userSettings.logoUrl && previewLogo) {
    previewLogo.src = userSettings.logoUrl;
  }

  const previewQR = document.getElementById('previewQR');
  if (userSettings.qrUrl && previewQR) {
    previewQR.src = userSettings.qrUrl;
    previewQR.style.display = 'block';
  }
}

// ===================== INICIALIZACIÓN DESPUÉS DE AUTENTICACIÓN ===================== //

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadUserSettingsFromFirestore();
  }
});

document.getElementById('btnUploadLogo').addEventListener('click', () => {
  document.getElementById('inputUploadLogo').click();
});

document.getElementById('inputUploadLogo').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      document.getElementById('previewLogo').src = evt.target.result;
      document.getElementById('previewLogo').style.display = 'block';
      userSettings.logoUrl = evt.target.result;
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById('btnDeleteLogo').addEventListener('click', () => {
  document.getElementById('previewLogo').src = 'img/default-logo.png';
  userSettings.logoUrl = '';
});

document.getElementById('btnUploadQR').addEventListener('click', () => {
  document.getElementById('inputUploadQR').click();
});

document.getElementById('inputUploadQR').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      document.getElementById('previewQR').src = evt.target.result;
      document.getElementById('previewQR').style.display = 'block';
      userSettings.qrUrl = evt.target.result;
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById('btnDeleteQR').addEventListener('click', () => {
  document.getElementById('previewQR').src = '';
  document.getElementById('previewQR').style.display = 'none';
  userSettings.qrUrl = '';
});

// --- LISTENERS PARA LA SECCIÓN MI CUENTA ---

if (profilePhotoBtn) {
    profilePhotoBtn.addEventListener('click', openEditPhotoModal);
}

if (profileNameBtn) {
    profileNameBtn.addEventListener('click', openEditNameModal);
}

if (profileEmailBtn) {
    profileEmailBtn.addEventListener('click', openEditEmailModal);
}

// if (generateInvoiceFileBtn) { 
//    generateInvoiceFileBtn.addEventListener('click', () => {
//        alert("Funcionalidad 'Generar Factura (Archivo)' pendiente.");
//    });
//}
