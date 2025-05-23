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

// const analytics = getAnalytics(app); // Descomenta si quieres usar Firebase Analytics

// --- Selección de Elementos del DOM ---
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const loadingOverlay = document.getElementById('loadingOverlay');
const loginContainer = document.querySelector('.login-container');
const mainContent = document.getElementById('mainContent');

// --- Función para Mostrar/Ocultar Pantalla de Carga ---
const showLoading = (show) => {
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
};

// --- Lógica de Inicio de Sesión con Google ---
if (loginButton) {
    loginButton.addEventListener('click', () => {
        showLoading(true); // Mostrar pantalla de carga
        signInWithPopup(auth, googleProvider)
            .then((result) => {
                // El inicio de sesión fue exitoso.
                // onAuthStateChanged se encargará de actualizar la UI.
                console.log("Usuario autenticado con Google:", result.user);
                // No es necesario ocultar la carga aquí, onAuthStateChanged lo hará.
            })
            .catch((error) => {
                // Manejo de errores durante el inicio de sesión.
                console.error("Error durante el inicio de sesión con Google:", error);
                // Personaliza los mensajes de error según el código de error si lo deseas
                let errorMessage = "Ocurrió un error al intentar iniciar sesión.";
                if (error.code === 'auth/popup-closed-by-user') {
                    errorMessage = "La ventana de inicio de sesión fue cerrada antes de completar.";
                } else if (error.code === 'auth/cancelled-popup-request') {
                    errorMessage = "Se canceló la solicitud de inicio de sesión.";
                }
                // Aquí podrías mostrar el errorMessage en la UI si lo deseas
                alert(errorMessage);
            })
            .finally(() => {
                // Ocultar la carga solo si onAuthStateChanged no lo ha hecho ya (por si hay un error antes de que se dispare)
                // En la mayoría de los casos, onAuthStateChanged es más rápido
                // Pero si signInWithPopup falla muy pronto, onAuthStateChanged podría no dispararse con un usuario.
                if (!auth.currentUser) {
                    showLoading(false);
                }
            });
    });
}

// --- Lógica para Cerrar Sesión ---
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        showLoading(true); // Mostrar carga durante el proceso de cierre de sesión
        signOut(auth)
            .then(() => {
                // El cierre de sesión fue exitoso.
                // onAuthStateChanged se encargará de actualizar la UI.
                console.log("Usuario cerró sesión exitosamente.");
            })
            .catch((error) => {
                console.error("Error al cerrar sesión:", error);
                alert("Ocurrió un error al cerrar la sesión.");
            })
            .finally(() => {
                // onAuthStateChanged se encargará de ocultar la carga
                // y mostrar la pantalla de login.
            });
    });
}

// --- Observador del Estado de Autenticación ---
onAuthStateChanged(auth, (user) => {
    showLoading(false); // Ocultar la pantalla de carga siempre que cambie el estado de auth
    if (user) {
        // El usuario está autenticado (ha iniciado sesión)
        console.log("Usuario está conectado:", user.uid, user.displayName);
        if (loginContainer) loginContainer.style.display = 'none';
        if (mainContent) mainContent.style.display = 'flex'; // O 'block' según tu CSS

        // Aquí podrías, por ejemplo, mostrar el nombre del usuario:
        // const welcomeMessage = mainContent.querySelector('h1');
        // if (welcomeMessage && user.displayName) {
        //     welcomeMessage.textContent = `¡Bienvenido, ${user.displayName}!`;
        // }

    } else {
        // El usuario no está autenticado (ha cerrado sesión o nunca inició)
        console.log("No hay usuario conectado.");
        if (loginContainer) loginContainer.style.display = 'flex'; // O 'block'
        if (mainContent) mainContent.style.display = 'none';
    }
});

// --- Inicialización de la UI al cargar la página ---
// (Opcional: podrías mostrar la carga inicialmente si hay una comprobación de auth pendiente)
// showLoading(true); // Descomenta si quieres mostrar la carga al inicio mientras Firebase comprueba el estado.
// onAuthStateChanged se ejecutará automáticamente al cargar y ocultará la carga.
