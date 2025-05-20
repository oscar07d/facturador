// Archivo: script.js (Completo v2.3.4 - Con Logueo de Acciones de Factura)

// Importar jsPDF si usas CDNs en HTML (ya lo teníamos globalmente accesible)
// const { jsPDF } = window.jspdf; // No es necesario si ya está en el scope global desde el CDN

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM cargado. Iniciando script de facturación (Colombia v2.3.4 - Logueo de Acciones)...");

    // =================================================================================
    // 0. ESTADO GLOBAL, CONSTANTES Y FORMATTERS
    // =================================================================================
    
    const apiUrl = 'https://script.google.com/macros/s/AKfycbwZ6Jn3E2yBQMD0BYCFariKCzxMAzZzwMsjiNT2D4KiUfAOvFis7w8Y0_mNj90K_atPvQ/exec'; // ¡¡¡REEMPLAZAR ESTA URL!!!
    let items = [];
    let clientsData = [];
    let productsData = [];
    let selectedClient = null;
    let currentGeneratedInvoiceData = null; // Para exportar/compartir la última factura generada/buscada

    const copFormatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 2 });
    const numberFormatter = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

    // === NUEVO: Selectores para la pantalla de carga ===
    const initialLoaderScreen = document.getElementById('initial-loader-screen');
    const mainInvoiceGeneratorDiv = document.querySelector('.invoice-generator'); 
    // === FIN NUEVO ===

    // =================================================================================
    // Separador Visual para el Parser de la Plataforma
    // =================================================================================

    // =================================================================================
    // 1. SELECTORES DOM
    // =================================================================================
    
    // Cabecera y Negocio
    const logoUploadInput = document.getElementById('logo-upload');
    const logoUploadButtonLabel = document.getElementById('logo-upload-button-label');
    const selectedLogoFilenameSpan = document.getElementById('selected-logo-filename');
    const logoPreview = document.getElementById('logo-preview');
    const businessDetailsTextarea = document.getElementById('business-details');
    const invoiceDateDisplay = document.getElementById('invoice-date-display');
    const invoiceNumberDisplay = document.getElementById('invoice-number-display');
    const invoiceCodeDisplay = document.getElementById('invoice-code-display');

    // Clientes
    const selectClient = document.getElementById('select-client');
    const clientActionsContainer = document.getElementById('client-actions-container');
    const deleteClientBtn = document.getElementById('delete-client-btn');
    const recoverClientBtn = document.getElementById('recover-client-btn');
    const clientPaymentStatusArea = document.getElementById('client-payment-status-area');
    const paymentStatusDisplay = document.getElementById('payment-status-display');
    const newClientFormContainer = document.getElementById('new-client-form-container');
    const newClientNameInput = document.getElementById('new-client-name');
    const newClientEmailInput = document.getElementById('new-client-email');
    const newClientAddressInput = document.getElementById('new-client-address');
    const newClientPhoneInput = document.getElementById('new-client-phone');
    const newClientPaymentStatusSelect = document.getElementById('new-client-payment-status');
    const editClientFormContainer = document.getElementById('edit-client-form-container');
    const editingClientNameSpan = document.getElementById('editing-client-name');
    const editClientNameInput = document.getElementById('edit-client-name');
    const editClientEmailInput = document.getElementById('edit-client-email');
    const editClientAddressInput = document.getElementById('edit-client-address');
    const editClientPhoneInput = document.getElementById('edit-client-phone');
    const editClientPaymentStatusSelect = document.getElementById('edit-client-payment-status');
    const saveClientChangesBtn = document.getElementById('save-client-changes-btn');

    // Ítems de Factura
    const itemDescriptionInput = document.getElementById('item-description');
    const productDatalist = document.getElementById('product-list');
    const itemQuantityInput = document.getElementById('item-quantity');
    const itemPriceInput = document.getElementById('item-price');
    const applyItemTaxCheckbox = document.getElementById('apply-item-tax-checkbox');
    const addItemBtn = document.getElementById('add-item-btn');
    const invoiceItemsTbody = document.getElementById('invoice-items-tbody');

    // Totales e IVA
    const applyInvoiceTaxCheckbox = document.getElementById('apply-invoice-tax-checkbox');
    const subtotalDisplay = document.getElementById('subtotal-display');
    const taxPercentageGroup = document.getElementById('tax-percentage-group');
    const taxPercentageInput = document.getElementById('tax-percentage');
    const taxAmountGroup = document.getElementById('tax-amount-group');
    const taxAmountDisplay = document.getElementById('tax-amount-display');
    const totalDisplay = document.getElementById('total-display');

    // Acciones Principales y Búsqueda
    const generateInvoiceBtn = document.getElementById('generate-invoice-btn');
    const searchInvoiceCodeInput = document.getElementById('search-invoice-code');
    const searchInvoiceBtn = document.getElementById('search-invoice-btn');
    const searchResultsDiv = document.getElementById('search-results-div');
    const searchResultsContent = document.getElementById('search-results-content');

    // Exportar y Compartir
    const shareWhatsappBtn = document.getElementById('share-whatsapp-btn');
    const shareEmailBtn = document.getElementById('share-email-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const exportPngBtn = document.getElementById('export-png-btn');

    // Global
    const statusMessageDiv = document.getElementById('status-message-div');

    // Selectores para Plantilla de Exportación
    const exportLogoImg = document.getElementById('export-logo-img');
    const exportBusinessName = document.getElementById('export-business-name');
    const exportBusinessExtraDetails = document.getElementById('export-business-extra-details');
    const exportInvoiceNumber = document.getElementById('export-invoice-number');
    const exportInvoiceCode = document.getElementById('export-invoice-code');
    const exportInvoiceDate = document.getElementById('export-invoice-date');
    const exportClientName = document.getElementById('export-client-name');
    const exportClientEmail = document.getElementById('export-client-email');
    const exportClientAddress = document.getElementById('export-client-address');
    const exportClientPhone = document.getElementById('export-client-phone');
    const exportItemsTbody = document.getElementById('export-items-tbody');
    const exportSubtotal = document.getElementById('export-subtotal');
    const exportTaxPercentage = document.getElementById('export-tax-percentage');
    const exportTaxAmount = document.getElementById('export-tax-amount');
    const exportTotal = document.getElementById('export-total');
    const exportTaxLine = document.getElementById('export-tax-line');

    // =================================================================================
    // Separador Visual para el Parser de la Plataforma
    // =================================================================================

    // =================================================================================
    // 2. FUNCIONES DE UTILIDAD GENERAL
    // =================================================================================
    
    function showStatusMessage(message, type = 'info', duration = 4000) {
        statusMessageDiv.textContent = message;
        statusMessageDiv.className = 'status-message'; // Reset classes
        statusMessageDiv.classList.add(`status-${type}`);
        statusMessageDiv.classList.remove('hidden');
        if (statusMessageDiv.timerId) clearTimeout(statusMessageDiv.timerId);
        statusMessageDiv.timerId = setTimeout(() => statusMessageDiv.classList.add('hidden'), duration);
    }

    async function apiCall(action, method = 'GET', bodyData = null, queryParams = {}) {
        // La verificación de apiUrl está comentada, asumiendo que ya está bien configurada.
        // if (apiUrl.startsWith('TU_URL_DE_APPS_SCRIPT_AQUI')) {
        //     showStatusMessage('Error Crítico: La URL del API no está configurada.', 'error', 10000);
        //     throw new Error('API URL no configurada.');
        // }
    
        const url = new URL(apiUrl);
        url.searchParams.append('action', action);
    
        if (method === 'GET' && bodyData) {
            Object.keys(bodyData).forEach(key => url.searchParams.append(key, bodyData[key]));
        }
        for (const key in queryParams) {
            url.searchParams.append(key, queryParams[key]);
        }
    
        const fetchOptions = {
            method,
            headers: { 'Accept': 'application/json' }
        };
    
        if (method === 'POST' && bodyData) {
            fetchOptions.body = JSON.stringify(bodyData);
        }
    
        // Lista de botones que pueden invocar apiCall y deberían mostrar un loader.
        // ¡Asegúrate de que solo estén aquí los botones que REALMENTE hacen una llamada a la API!
        // He quitado addItemBtn asumiendo que su acción es local.
        // Si las funciones de exportar/compartir llaman a apiCall (por ejemplo, para loguear), deben estar aquí.
        const btnListToManageLoading = [
            generateInvoiceBtn, 
            searchInvoiceBtn, 
            saveClientChangesBtn, 
            deleteClientBtn, 
            recoverClientBtn,
            exportPdfBtn, // Si llama a apiCall para loguear
            exportPngBtn  // Si llama a apiCall para loguear
        ];
        
        // Determinar qué botón (si alguno de la lista) disparó esta llamada.
        // Esta es una forma simplificada; si múltiples botones pueden estar activos
        // en paralelo por diferentes acciones, esta lógica necesitaría ser más robusta.
        // Por ahora, intentaremos con el elemento activo.
        let triggeredButtonElement = null;
        if (document.activeElement && btnListToManageLoading.includes(document.activeElement)) {
            triggeredButtonElement = document.activeElement;
        }
    
        // Poner el botón que disparó la acción (si se identificó) en estado de carga.
        // Si no se pudo identificar, podríamos aplicar a todos los de la lista, o a uno por defecto (ej. generateInvoiceBtn).
        // Para mayor precisión, la Opción 2 (manejo en event listeners) es mejor, pero esto es una mejora.
        
        if (triggeredButtonElement) {
            triggeredButtonElement.disabled = true;
            triggeredButtonElement.classList.add('loading');
        } else {
            // Fallback: aplicar a todos los botones de la lista si no se puede identificar el específico.
            // Esto es menos ideal porque todos los botones mostrarían loader.
            btnListToManageLoading.forEach(btn => {
                if (btn) {
                    btn.disabled = true;
                    btn.classList.add('loading');
                }
            });
        }
    
    
        try {
            console.log(`API Call: ${method} ${url.toString()}`, bodyData ? `Payload: ${JSON.stringify(bodyData)}` : "");
            const response = await fetch(url.toString(), fetchOptions);
            const responseText = await response.text();
            console.log("API Raw Response Text:", responseText);
    
            if (!response.ok) {
                let errorMsg = `Error de Red/Servidor: ${response.status} - ${response.statusText}`;
                try {
                    const errorJson = JSON.parse(responseText);
                    errorMsg = errorJson.message || errorJson.error || errorMsg;
                } catch (e) { /* No hacer nada si no es JSON */ }
                throw new Error(errorMsg);
            }
            
            const data = JSON.parse(responseText);
            console.log("API Parsed Response Data:", data);
    
            if (data.status === 'success') {
                return data.data;
            } else {
                throw new Error(data.message || 'Error desconocido en la respuesta de la API.');
            }
        } catch (error) {
            console.error(`Error en apiCall (acción: ${action}):`, error);
            showStatusMessage(error.message, 'error', 6000);
            throw error; // Re-lanzar para que el llamador pueda manejarlo si es necesario
        } finally {
            // Restaurar el botón que disparó la acción (o todos los de la lista si se usó el fallback)
            if (triggeredButtonElement) {
                triggeredButtonElement.disabled = false;
                triggeredButtonElement.classList.remove('loading');
            } else {
                btnListToManageLoading.forEach(btn => {
                    if (btn) {
                        btn.disabled = false; // Aquí asumimos que todos se habilitan de nuevo.
                                             // Se podría guardar su estado original de 'disabled' si fuera más complejo.
                        btn.classList.remove('loading');
                    }
                });
            }
        }
    }

    function setInitialInvoiceDate() {
        const today = new Date();
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        invoiceDateDisplay.textContent = today.toLocaleDateString('es-CO', options);
    }

    // =================================================================================
    // Separador Visual para el Parser de la Plataforma
    // =================================================================================

    // =================================================================================
    // 3. GESTIÓN DE LOGO Y DETALLES DEL NEGOCIO
    // =================================================================================
    
    function setupFileUploaderLogic() {
        if (logoUploadInput && selectedLogoFilenameSpan && logoUploadButtonLabel) {
            logoUploadButtonLabel.innerHTML = 'Seleccionar archivo...'; 

            logoUploadInput.addEventListener('change', function(event) {
                const file = event.target.files[0];
                if (file) {
                    selectedLogoFilenameSpan.textContent = file.name;
                    logoUploadButtonLabel.innerHTML = `Cambiar: ${file.name.substring(0,15)}${file.name.length > 15 ? '...' : ''}`; 
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        logoPreview.src = e.target.result;
                        localStorage.setItem('businessLogoOscar07D_CO', e.target.result);
                        showStatusMessage('Logo cargado y guardado localmente.', 'success', 2000);
                    }
                    reader.readAsDataURL(file);
                } else {
                    selectedLogoFilenameSpan.textContent = 'Ningún archivo seleccionado';
                    logoUploadButtonLabel.innerHTML = 'Seleccionar archivo...';
                }
            });
            document.getElementById('logo-upload-wrapper').addEventListener('click', () => logoUploadInput.click());
            document.getElementById('logo-upload-wrapper').addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); logoUploadInput.click(); }
            });
        }
    }

    function setupBusinessInfoListeners() {
        businessDetailsTextarea.addEventListener('input', () => {
            localStorage.setItem('businessDetailsOscar07D_CO', businessDetailsTextarea.value);
        });
    }
    
    function loadFromLocalStorage() {
        const savedLogo = localStorage.getItem('businessLogoOscar07D_CO');
        if (savedLogo) logoPreview.src = savedLogo; else logoPreview.alt = "Sin logo";
        businessDetailsTextarea.value = localStorage.getItem('businessDetailsOscar07D_CO') || '';
    }

    // =================================================================================
    // Separador Visual para el Parser de la Plataforma
    // =================================================================================

    // =================================================================================
    // 4. GESTIÓN DE CLIENTES
    // =================================================================================
    
    async function loadClients() {
        try {
            showStatusMessage('Cargando clientes...', 'info', 20000);
            clientsData = await apiCall('getClients') || []; 
            populateClientDropdown();
            showStatusMessage('Lista de clientes actualizada.', 'success');
        } catch (error) { clientsData = []; populateClientDropdown(); }
    }

    function populateClientDropdown() {
        const previousValue = selectClient.value;
        selectClient.innerHTML = '<option value="">-- Nuevo Cliente --</option>';
        clientsData.sort((a, b) => a.name.localeCompare(b.name)).forEach(client => {
            const option = document.createElement('option');
            option.value = client.id; // Asumiendo que el backend devuelve 'id'
            option.textContent = `${client.Nombre}${client.Eliminado ? ' (Eliminado)' : ''}`; // Usar 'Nombre' del backend
            option.dataset.clientObject = JSON.stringify(client);
            selectClient.appendChild(option);
        });
        selectClient.value = clientsData.find(c => c.id === previousValue) ? previousValue : "";
        if (!selectClient.value) handleClientSelection();
    }

    function handleClientSelection() {
        const selectedOption = selectClient.options[selectClient.selectedIndex];
        if (selectClient.value && selectedOption.dataset.clientObject) {
            selectedClient = JSON.parse(selectedOption.dataset.clientObject);
            newClientFormContainer.classList.add('hidden');
            editClientFormContainer.classList.remove('hidden');
            editingClientNameSpan.textContent = selectedClient.Nombre; // Usar Nombre del backend
            populateEditClientForm();
            updateClientPaymentStatusDisplay();
            updateClientActionButtonsVisibility();
            clientActionsContainer.classList.remove('hidden');
            clientPaymentStatusArea.classList.remove('hidden');
        } else {
            selectedClient = null;
            newClientFormContainer.classList.remove('hidden');
            editClientFormContainer.classList.add('hidden');
            clientActionsContainer.classList.add('hidden');
            clientPaymentStatusArea.classList.add('hidden');
        }
    }

    function populateEditClientForm() {
        if (!selectedClient) return;
        editClientNameInput.value = selectedClient.Nombre || ''; // Usar Nombre
        editClientEmailInput.value = selectedClient.Email || '';
        editClientAddressInput.value = selectedClient.Direccion || '';
        editClientPhoneInput.value = selectedClient.Telefono || '';
        editClientPaymentStatusSelect.value = selectedClient.Estado_Pago_Cliente || 'Pendiente';
    }

    function updateClientPaymentStatusDisplay() {
        if (selectedClient) {
            paymentStatusDisplay.textContent = `${selectedClient.Estado_Pago_Cliente || 'N/D'}${selectedClient.Eliminado ? ' - ELIMINADO' : ''}`;
            paymentStatusDisplay.style.color = selectedClient.Eliminado ? 'var(--danger-color)' : 'var(--text-color-primary)';
        }
    }

    function updateClientActionButtonsVisibility() {
        if (!selectedClient) { deleteClientBtn.classList.add('hidden'); recoverClientBtn.classList.add('hidden'); return; }
        deleteClientBtn.classList.toggle('hidden', !!selectedClient.Eliminado);
        recoverClientBtn.classList.toggle('hidden', !selectedClient.Eliminado);
    }

    async function confirmAndExecuteClientAction(actionType, confirmMessage, successMessage, clientPayload = null) {
        if ((actionType === 'deleteClient' || actionType === 'recoverClient') && !selectedClient) {
            showStatusMessage('Ningún cliente seleccionado.', 'warning'); return;
        }
        if (actionType !== 'saveClientChanges' && confirmMessage && !confirm(confirmMessage)) return;
        
        const payload = clientPayload || { clientId: selectedClient.id }; // Asume que 'id' existe en selectedClient
                                                                            // o usa selectedClient.ID_Cliente si esa es la clave correcta
        
        try {
            await apiCall(actionType, 'POST', payload);
            showStatusMessage(successMessage, 'success');
            await loadClients(); 
            const reselectId = (actionType === 'saveClientChanges' && clientPayload?.clientData) ? clientPayload.clientData.id : "";
            selectClient.value = reselectId; 
            handleClientSelection();
        } catch (error) { /* Error ya manejado en apiCall */ }
    }

    // =================================================================================
    // Separador Visual para el Parser de la Plataforma
    // =================================================================================

    // =================================================================================
    // 5. GESTIÓN DE PRODUCTOS (DATALIST)
    // =================================================================================
    
    async function loadProducts() {
        try {
            showStatusMessage('Cargando productos...', 'info', 10000);
            productsData = await apiCall('getProducts') || []; // apiCall devuelve data.data
            populateProductDatalist();
            showStatusMessage('Lista de productos para sugerencias cargada.', 'success');
        } catch (error) { productsData = []; populateProductDatalist(); }
    }

    function populateProductDatalist() {
        productDatalist.innerHTML = ''; 
        productsData.forEach(product => {
            const option = document.createElement('option');
            option.value = product.description; // Asumiendo que 'description' y 'price' vienen del backend
            option.dataset.price = product.price; 
            productDatalist.appendChild(option);
        });
    }

    function handleProductAutofill() {
        const matchingProduct = productsData.find(p => p.description.toLowerCase() === itemDescriptionInput.value.toLowerCase());
        if (matchingProduct && typeof matchingProduct.price !== 'undefined') {
            itemPriceInput.value = parseFloat(matchingProduct.price);
        }
    }

    // =================================================================================
    // Separador Visual para el Parser de la Plataforma
    // =================================================================================

    // =================================================================================
    // 6. GESTIÓN DE ÍTEMS DE FACTURA
    // =================================================================================
    
    function addItemToInvoice() {
        const description = itemDescriptionInput.value.trim();
        const quantity = parseFloat(itemQuantityInput.value);
        const price = parseFloat(itemPriceInput.value);
        const applyItemTax = applyItemTaxCheckbox.checked;

        if (!description) { showStatusMessage('Descripción del ítem requerida.', 'warning'); itemDescriptionInput.focus(); return; }
        if (isNaN(quantity) || quantity <= 0) { showStatusMessage('Cantidad inválida (>0).', 'warning'); itemQuantityInput.focus(); return; }
        if (isNaN(price) || price < 0) { showStatusMessage('Precio inválido (>=0).', 'warning'); itemPriceInput.focus(); return; }
        
        items.push({ description, quantity, price, applyItemTax });
        renderItems(); 
        updateTotals(); 
        clearItemInputFields(); 
        itemDescriptionInput.focus();
    }

    function renderItems() {
        invoiceItemsTbody.innerHTML = '';
        if (items.length === 0) {
            invoiceItemsTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">No hay ítems en esta factura.</td></tr>'; return;
        }
        items.forEach((item, index) => {
            const row = invoiceItemsTbody.insertRow();
            row.insertCell().textContent = item.description;
            const qtyCell = row.insertCell(); qtyCell.textContent = numberFormatter.format(item.quantity); qtyCell.classList.add('text-right');
            const priceCell = row.insertCell(); priceCell.textContent = copFormatter.format(item.price); priceCell.classList.add('text-right');
            const importeCell = row.insertCell(); importeCell.textContent = copFormatter.format(item.quantity * item.price); importeCell.classList.add('text-right');
            const deleteBtn = Object.assign(document.createElement('button'), { 
                textContent: 'Eliminar', classList: 'btn btn-danger btn-small', title: `Eliminar ${item.description}`,
                onclick: () => { items.splice(index, 1); renderItems(); updateTotals(); }
            });
            const cell = row.insertCell();
            cell.appendChild(deleteBtn);
            cell.classList.add('text-right');
        });
    }
    
    function clearItemInputFields(){ 
        itemDescriptionInput.value = ''; 
        itemQuantityInput.value = '1'; 
        itemPriceInput.value = ''; 
        applyItemTaxCheckbox.checked = true;
    }

    // =================================================================================
    // Separador Visual para el Parser de la Plataforma
    // =================================================================================

    // =================================================================================
    // 7. CÁLCULO DE TOTALES E IVA
    // =================================================================================
    
    function toggleTaxFieldsVisibility(show) {
        taxPercentageGroup.classList.toggle('hidden', !show);
        taxAmountGroup.classList.toggle('hidden', !show);
    }

    function updateTotals() {
        const applyInvoiceTax = applyInvoiceTaxCheckbox.checked;
        toggleTaxFieldsVisibility(applyInvoiceTax);

        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        let taxAmount = 0;
        let total = subtotal;

        if (applyInvoiceTax) {
            const taxRate = parseFloat(taxPercentageInput.value) / 100 || 0;
            const taxableBase = items.reduce((sum, item) => {
                if (item.applyItemTax) { return sum + (item.quantity * item.price); }
                return sum;
            }, 0);
            taxAmount = taxableBase * taxRate;
            total = subtotal + taxAmount;
        }

        subtotalDisplay.value = copFormatter.format(subtotal);
        taxAmountDisplay.value = copFormatter.format(taxAmount);
        totalDisplay.value = copFormatter.format(total);
    }

    // =================================================================================
    // Separador Visual para el Parser de la Plataforma
    // =================================================================================

    // =================================================================================
    // 8. GENERACIÓN Y GUARDADO DE FACTURA
    // =================================================================================
    
    function gatherCurrentInvoiceFullData(invoiceNumber, invoiceCode, invoiceDateStr) {
        let clientDetails = {};
        if (selectedClient) {
            // Usar las claves del objeto cliente como vienen del backend o de la selección
            clientDetails = { 
                name: selectedClient.Nombre, email: selectedClient.Email, 
                address: selectedClient.Direccion, phone: selectedClient.Telefono 
            };
        } else {
            clientDetails = { 
                name: newClientNameInput.value.trim(), email: newClientEmailInput.value.trim(), 
                address: newClientAddressInput.value.trim(), phone: newClientPhoneInput.value.trim() 
            };
        }
        const subtotalVal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const applyTaxGlobal = applyInvoiceTaxCheckbox.checked;
        let taxAmountVal = 0;
        if(applyTaxGlobal){
            const taxRate = parseFloat(taxPercentageInput.value) / 100 || 0;
            const taxableBase = items.reduce((sum, item) => item.applyItemTax ? sum + (item.quantity * item.price) : sum, 0);
            taxAmountVal = taxableBase * taxRate;
        }
        const totalVal = subtotalVal + taxAmountVal;

        return {
            invoiceNumber: invoiceNumber || invoiceNumberDisplay.textContent,
            invoiceCode: invoiceCode || invoiceCodeDisplay.textContent,
            invoiceDate: invoiceDateStr || invoiceDateDisplay.textContent,
            business: {
                name: businessDetailsTextarea.value.split('\n')[0] || "Mi Negocio",
                details: businessDetailsTextarea.value,
                logo: localStorage.getItem('businessLogoOscar07D_CO') || null
            },
            client: clientDetails,
            items: items.map(it => ({...it})), 
            subtotal: subtotalVal,
            taxPercentage: applyTaxGlobal ? parseFloat(taxPercentageInput.value) : 0,
            taxAmount: taxAmountVal,
            total: totalVal,
            applyInvoiceTax: applyTaxGlobal
        };
    }

    async function generateAndSaveInvoice() {
        if (items.length === 0) { showStatusMessage('La factura debe tener al menos un ítem.', 'warning'); return; }
        let clientInfoForInvoice = null, newClientPayload = null;
        if (selectedClient) {
            clientInfoForInvoice = { 
                id: selectedClient.id || selectedClient.ID_Cliente, // Ser flexible con la clave del ID
                name: selectedClient.Nombre, email: selectedClient.Email, 
                address: selectedClient.Direccion, phone: selectedClient.Telefono 
            };
        } else {
            const newName = newClientNameInput.value.trim();
            if (!newName) { showStatusMessage('Seleccione un cliente o ingrese datos de nuevo cliente (nombre mínimo).', 'warning'); newClientNameInput.focus(); return; }
            newClientPayload = { 
                name: newName, email: newClientEmailInput.value.trim(), 
                address: newClientAddressInput.value.trim(), phone: newClientPhoneInput.value.trim(), 
                paymentStatus: newClientPaymentStatusSelect.value 
            };
            clientInfoForInvoice = { ...newClientPayload }; 
        }
        
        const fullInvoiceDataForState = gatherCurrentInvoiceFullData(null, null, null);
        
        const invoiceDataForAPI = {
            clientDetails: clientInfoForInvoice, // Incluye ID si es existente
            items: fullInvoiceDataForState.items,
            subtotal: fullInvoiceDataForState.subtotal,
            taxPercentage: fullInvoiceDataForState.taxPercentage,
            taxAmount: fullInvoiceDataForState.taxAmount,
            total: fullInvoiceDataForState.total,
            applyInvoiceTax: fullInvoiceDataForState.applyInvoiceTax,
            generatedAt: new Date().toISOString() 
        };
        const apiPayload = { invoiceData: invoiceDataForAPI, newClientData: newClientPayload };
        if (selectedClient && !newClientPayload) {
            // Asegurar que el ID correcto se usa si el cliente ya existe y se seleccionó
             apiPayload.invoiceData.clientId = selectedClient.id || selectedClient.ID_Cliente;
        }


        try {
            showStatusMessage('Guardando factura...', 'info', 20000);
            const result = await apiCall('saveInvoice', 'POST', apiPayload);
            invoiceNumberDisplay.textContent = result.invoiceNumber || 'N/A';
            invoiceCodeDisplay.textContent = result.invoiceCode || 'N/A'; 
            const invDateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
            const formattedDate = result.invoiceDate ? new Date(result.invoiceDate).toLocaleDateString('es-CO', invDateOptions) : '--/--/----';
            invoiceDateDisplay.textContent = formattedDate;
            currentGeneratedInvoiceData = gatherCurrentInvoiceFullData(result.invoiceNumber, result.invoiceCode, formattedDate);
            showStatusMessage(`Factura ${result.invoiceCode || ''} (Nº ${result.invoiceNumber || ''}) guardada. Puede exportarla/compartirla.`, 'success', 8000);
            if (newClientPayload && result.newClientId) { await loadClients(); }
        } catch (error) { showStatusMessage(`Error al guardar factura: ${error.message}`, 'error', 8000); }
    }

    // =================================================================================
    // Separador Visual para el Parser de la Plataforma
    // =================================================================================

    // =================================================================================
    // 9. BÚSQUEDA DE FACTURAS Y RESETEO DE FORMULARIO
    // =================================================================================
    
    async function searchInvoice() {
        const code = searchInvoiceCodeInput.value.trim();
        if (!code) { showStatusMessage('Ingrese código para buscar.', 'warning'); return; }
        searchResultsContent.textContent = 'Buscando...'; searchResultsDiv.classList.remove('hidden');
        try {
            const foundInvoice = await apiCall('findInvoice', 'GET', { code } );
            if (foundInvoice && Object.keys(foundInvoice).length > 0) {
                searchResultsContent.textContent = JSON.stringify(foundInvoice, null, 2);
                // Asegurar que las claves de la factura encontrada se mapeen correctamente a la estructura de currentGeneratedInvoiceData
                currentGeneratedInvoiceData = {
                    invoiceNumber: foundInvoice.Numero_Factura, // Ajustar clave si es necesario
                    invoiceCode: foundInvoice.ID_Factura_Unico, // Ajustar clave
                    invoiceDate: new Date(foundInvoice.Fecha_Factura).toLocaleDateString('es-CO', {day:'2-digit', month:'2-digit', year:'numeric'}),
                    business: { name: localStorage.getItem('businessDetailsOscar07D_CO')?.split('\n')[0] || "Mi Negocio", details: localStorage.getItem('businessDetailsOscar07D_CO') || '', logo: localStorage.getItem('businessLogoOscar07D_CO') || null },
                    client: foundInvoice.clientDetails || { // Backend podría devolver clientDetails ya formateado
                        name: foundInvoice.Nombre_Cliente, 
                        // ... obtener otros datos del cliente si se guardan en 'Facturas' o buscar por ID_Cliente
                    },
                    items: foundInvoice.items.map(it => ({...it, applyItemTax: it.Aplica_IVA_Item !== undefined ? it.Aplica_IVA_Item : true})), 
                    subtotal: parseFloat(foundInvoice.Subtotal) || 0,
                    taxPercentage: foundInvoice.Aplica_IVA_Global ? (parseFloat(foundInvoice.Porcentaje_IVA) || 0) : 0,
                    taxAmount: foundInvoice.Aplica_IVA_Global ? (parseFloat(foundInvoice.Monto_IVA) || 0) : 0,
                    total: parseFloat(foundInvoice.Total_Factura) || 0,
                    applyInvoiceTax: foundInvoice.Aplica_IVA_Global !== undefined ? foundInvoice.Aplica_IVA_Global : true
                };
                applyInvoiceTaxCheckbox.checked = currentGeneratedInvoiceData.applyInvoiceTax;
                taxPercentageInput.value = currentGeneratedInvoiceData.taxPercentage;
                // Opcional: cargar cliente e ítems en el formulario principal.
                // Si se hace, llamar a updateTotals() después.
                showStatusMessage('Factura encontrada. Puede exportarla/compartirla.', 'success');
            } else {
                searchResultsContent.textContent = 'Factura no encontrada.';
                currentGeneratedInvoiceData = null;
                showStatusMessage('No se encontró factura.', 'info');
            }
        } catch (error) { searchResultsContent.textContent = `Error al buscar: ${error.message}`; currentGeneratedInvoiceData = null;}
    }

    function resetEntireForm() {
        items = []; renderItems();
        [newClientNameInput, newClientEmailInput, newClientAddressInput, newClientPhoneInput].forEach(input => input.value = '');
        newClientPaymentStatusSelect.value = 'Pendiente';
        selectClient.value = ''; handleClientSelection();
        clearItemInputFields();
        applyInvoiceTaxCheckbox.checked = true; 
        taxPercentageInput.value = '19'; 
        updateTotals(); 
        invoiceNumberDisplay.textContent = "----"; 
        invoiceCodeDisplay.textContent = "----"; 
        setInitialInvoiceDate();
        searchInvoiceCodeInput.value = ''; searchResultsDiv.classList.add('hidden'); searchResultsContent.textContent = '';
        if (logoUploadInput) logoUploadInput.value = ""; 
        if (selectedLogoFilenameSpan) selectedLogoFilenameSpan.textContent = 'Ningún archivo seleccionado';
        if (logoUploadButtonLabel) logoUploadButtonLabel.innerHTML = 'Seleccionar archivo...';
        currentGeneratedInvoiceData = null;
        itemDescriptionInput.focus();
        showStatusMessage('Formulario listo para nueva factura.', 'info');
    }

    // =================================================================================
    // Separador Visual para el Parser de la Plataforma
    // =================================================================================

    // =================================================================================
    // 10. EXPORTACIÓN Y COMPARTIR
    // =================================================================================
    
    function populateExportTemplate(invoiceData) {
        if (!invoiceData) {
            showStatusMessage("No hay datos de factura para exportar. Genere o busque una primero.", "warning");
            return false;
        }
        exportLogoImg.src = invoiceData.business.logo || "";
        exportLogoImg.style.display = invoiceData.business.logo ? "block" : "none";
        exportBusinessName.textContent = invoiceData.business.name || "N/A";
        exportBusinessExtraDetails.textContent = invoiceData.business.details || "N/A";
        exportInvoiceNumber.textContent = invoiceData.invoiceNumber || "N/A";
        exportInvoiceCode.textContent = invoiceData.invoiceCode || "N/A";
        exportInvoiceDate.textContent = invoiceData.invoiceDate || "N/A";
        exportClientName.textContent = invoiceData.client.name || "N/A";
        exportClientEmail.textContent = invoiceData.client.email || "N/A";
        exportClientAddress.textContent = invoiceData.client.address || "N/A";
        exportClientPhone.textContent = invoiceData.client.phone || "N/A";
        exportItemsTbody.innerHTML = "";
        invoiceData.items.forEach(item => {
            const row = exportItemsTbody.insertRow();
            row.insertCell().textContent = item.description;
            const qtyCell = row.insertCell(); qtyCell.textContent = numberFormatter.format(item.quantity); qtyCell.classList.add('number');
            const priceCell = row.insertCell(); priceCell.textContent = copFormatter.format(item.price); priceCell.classList.add('number');
            const itemTotal = item.quantity * item.price;
            const importeCell = row.insertCell(); importeCell.textContent = copFormatter.format(itemTotal); importeCell.classList.add('number');
            
            let itemTaxAmount = 0;
            if(invoiceData.applyInvoiceTax && item.applyItemTax){
                itemTaxAmount = itemTotal * (invoiceData.taxPercentage / 100);
            }
            const itemTaxCell = row.insertCell(); itemTaxCell.textContent = copFormatter.format(itemTaxAmount); itemTaxCell.classList.add('number');
        });
        exportSubtotal.textContent = copFormatter.format(invoiceData.subtotal);
        exportTaxLine.classList.toggle('hidden', !invoiceData.applyInvoiceTax);
        if(invoiceData.applyInvoiceTax) {
            exportTaxPercentage.textContent = numberFormatter.format(invoiceData.taxPercentage);
            exportTaxAmount.textContent = copFormatter.format(invoiceData.taxAmount);
        }
        exportTotal.textContent = copFormatter.format(invoiceData.total);
        return true;
    }

    async function exportInvoice(format = 'pdf') {
        if (!currentGeneratedInvoiceData) { showStatusMessage('Primero genere o busque una factura para exportar.', 'warning'); return; }
        if (!populateExportTemplate(currentGeneratedInvoiceData)) return;
        
        const invoiceElement = document.getElementById('invoice-to-export');
        showStatusMessage(`Preparando ${format.toUpperCase()}...`, 'info', 10000);
        
        try {
            const canvas = await html2canvas(invoiceElement, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const filename = `Factura_${currentGeneratedInvoiceData.invoiceNumber || currentGeneratedInvoiceData.invoiceCode || 'TEMP'}.${format}`;
            
            if (format === 'png') {
                const link = document.createElement('a'); link.download = filename; link.href = imgData; link.click();
                showStatusMessage('PNG descargado.', 'success');
            } else if (format === 'pdf') {
                const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: [canvas.width, canvas.height] });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(filename);
                showStatusMessage('PDF descargado.', 'success');
            }

            // Loguear la acción después de la exportación exitosa
            if (currentGeneratedInvoiceData && currentGeneratedInvoiceData.invoiceCode) {
                try {
                    await apiCall('logInvoiceAction', 'POST', {
                        invoiceId: currentGeneratedInvoiceData.invoiceCode,
                        actionType: `EXPORTADA_${format.toUpperCase()}`,
                        details: `Archivo: ${filename}`
                    });
                    console.log(`Acción de exportación ${format.toUpperCase()} logueada para factura ${currentGeneratedInvoiceData.invoiceCode}`);
                } catch (logError) {
                    console.warn("No se pudo loguear la acción de exportación en el backend:", logError);
                }
            }

        } catch(error) { 
            console.error("Error al generar archivo:", error); 
            showStatusMessage(`Error al generar ${format.toUpperCase()}: ${error.message}`, 'error'); 
        }
    }

    async function shareViaWhatsApp() { // Marcada como async por el apiCall
        if (!currentGeneratedInvoiceData) { showStatusMessage('Genere o busque una factura para compartirla.', 'warning'); return; }
        const inv = currentGeneratedInvoiceData;
        let message = `Hola ${inv.client.name || 'Cliente'},\n\n`;
        message += `Resumen de su factura:\n`;
        message += `Nº: ${inv.invoiceNumber || inv.invoiceCode}\n`;
        message += `Fecha: ${inv.invoiceDate}\n`;
        if(inv.applyInvoiceTax) message += `Subtotal: ${copFormatter.format(inv.subtotal)}\nIVA (${inv.taxPercentage}%): ${copFormatter.format(inv.taxAmount)}\n`;
        message += `TOTAL: ${copFormatter.format(inv.total)}\n\n`;
        message += `Detalles:\n`;
        inv.items.forEach(item => {
            let itemDesc = `- ${item.description} (Cant: ${numberFormatter.format(item.quantity)}, P.Unit: ${copFormatter.format(item.price)})`;
            if(inv.applyInvoiceTax && item.applyItemTax) itemDesc += " +IVA";
            message += itemDesc + "\n";
        });
        message += `\nGracias,\n${inv.business.name || 'Su Comercio'}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        showStatusMessage('Abriendo WhatsApp... (Adjunte manualmente la factura si es necesario)', 'info');

        // Loguear la acción
        if (currentGeneratedInvoiceData && currentGeneratedInvoiceData.invoiceCode) {
            try {
                await apiCall('logInvoiceAction', 'POST', {
                    invoiceId: currentGeneratedInvoiceData.invoiceCode,
                    actionType: 'COMPARTIDA_WHATSAPP',
                    details: 'Intento de compartir por WhatsApp.'
                });
            } catch (logError) {
                console.warn("No se pudo loguear la acción de WhatsApp en el backend:", logError);
            }
        }
    }

    async function shareViaEmail() { // Marcada como async por el apiCall
        if (!currentGeneratedInvoiceData) { showStatusMessage('Genere o busque una factura para compartirla.', 'warning'); return; }
        const inv = currentGeneratedInvoiceData;
        const subject = `Factura Nº ${inv.invoiceNumber || inv.invoiceCode} de ${inv.business.name || 'Su Comercio'}`;
        let body = `Estimado/a ${inv.client.name || 'Cliente'},\n\n`;
        body += `Adjuntamos detalles de su factura:\n`;
        body += `- Nº: ${inv.invoiceNumber || inv.invoiceCode}\n`;
        body += `- Fecha: ${inv.invoiceDate}\n\n`;
        inv.items.forEach(item => {
            body += `  * ${item.description}: ${numberFormatter.format(item.quantity)} x ${copFormatter.format(item.price)} = ${copFormatter.format(item.quantity * item.price)}`;
            if(inv.applyInvoiceTax && item.applyItemTax) body += " (+IVA)";
            body+= "\n";
        });
        body += `\nSubtotal: ${copFormatter.format(inv.subtotal)}\n`;
        if(inv.applyInvoiceTax){ body += `IVA (${inv.taxPercentage}%): ${copFormatter.format(inv.taxAmount)}\n`;}
        body += `TOTAL A PAGAR: ${copFormatter.format(inv.total)}\n\n`;
        body += `Por favor, exporte la factura (PDF/PNG) desde el sistema y adjúntela si lo desea.\n\n`;
        body += `Atentamente,\n${inv.business.name || 'El equipo'}`;
        const mailtoUrl = `mailto:${inv.client.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
        showStatusMessage('Abriendo cliente de correo... (Adjunte manualmente la factura si es necesario)', 'info');

        // Loguear la acción
        if (currentGeneratedInvoiceData && currentGeneratedInvoiceData.invoiceCode) {
            try {
                await apiCall('logInvoiceAction', 'POST', {
                    invoiceId: currentGeneratedInvoiceData.invoiceCode,
                    actionType: 'COMPARTIDA_EMAIL',
                    details: 'Intento de compartir por correo electrónico.'
                });
            } catch (logError) {
                console.warn("No se pudo loguear la acción de correo en el backend:", logError);
            }
        }
    }

    // =================================================================================
    // Separador Visual para el Parser de la Plataforma
    // =================================================================================

    // =================================================================================
    // 11. INICIALIZACIÓN DE EVENTOS Y DE LA APLICACIÓN
    // =================================================================================
    // =================================================================================
    // FUNCIÓN PARA CARGAR DATOS INICIALES DEL SERVIDOR
    // =================================================================================
    async function loadInitialDataFromServer() {
        console.log("loadInitialDataFromServer: Iniciando carga de datos del servidor...");
        try {
            // Usar Promise.all para que se ejecuten en paralelo si es posible
            await Promise.all([
                loadClients(),
                loadProducts()
            ]);
            console.log("loadInitialDataFromServer: Clientes y productos cargados.");
            return true; // Indicar que la carga (o el intento) finalizó
        } catch (error) {
            console.error("loadInitialDataFromServer: Error durante la carga inicial de datos.", error);
            showStatusMessage("Error al cargar datos iniciales del servidor. Funcionalidad limitada.", "error", 7000);
            return false; // Indicar que hubo un problema
        }
    }
        
    function initializeApp() {
        console.log("initializeApp - Inicio");
    
        // Configuración síncrona básica
        setInitialInvoiceDate();
        loadFromLocalStorage();
        setupEventListeners(); // Listeners deben estar listos
    
        // Llamada para cargar datos iniciales y luego mostrar la app
        loadInitialDataFromServer().then((success) => {
            console.log("initializeApp: Carga inicial de datos completada (intento hecho, éxito relativo:", success, ")");
            
            // Ocultar pantalla de carga
            if (initialLoaderScreen) {
                initialLoaderScreen.classList.add('hidden-loader');
            }
            // Mostrar contenido principal
            if (mainInvoiceGeneratorDiv) {
                mainInvoiceGeneratorDiv.style.display = 'block'; // O el display que use tu layout principal
            }
            
            // Renderizar UI después de que la pantalla de carga se oculte
            renderItems();
            updateTotals();
            showStatusMessage('Sistema de Facturación listo.', 'info', 3000);
    
        }).catch(error => {
            // Este catch es para errores muy inesperados en la promesa de loadInitialDataFromServer
            console.error("initializeApp: Fallo CRÍTICO no manejado en carga de datos.", error);
            if (initialLoaderScreen) initialLoaderScreen.classList.add('hidden-loader');
            if (mainInvoiceGeneratorDiv) mainInvoiceGeneratorDiv.style.display = 'block';
            renderItems(); 
            updateTotals();
            showStatusMessage('Error crítico al iniciar. Intente recargar.', 'error', 10000);
        });
    
        // Configuración de UI que no depende de la carga de datos puede ir aquí
        taxPercentageInput.value = '19'; 
        applyInvoiceTaxCheckbox.checked = true; 
        toggleTaxFieldsVisibility(true); 
        console.log("initializeApp - Fin de configuración síncrona inmediata");
    }
        
    // Iniciar la aplicación (esta línea ya debería estar al final de tu script dentro del DOMContentLoaded)
    initializeApp();

}); // Fin de DOMContentLoaded
