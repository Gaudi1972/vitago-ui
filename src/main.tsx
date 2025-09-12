import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </AuthProvider>
  </React.StrictMode>
);

// 📌 Registro del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado con éxito:', registration.scope);

        // Escuchar mensajes del SW
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'NEW_VERSION_READY') {
            console.log('📢 Nueva versión detectada. Actualizando automáticamente...');
            
            // 🔹 Mostrar notificación opcional
            toast.info('Actualizando a la última versión...', { autoClose: 2000 });

            // 🔹 Forzar activación del nuevo SW y recargar
            navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
            setTimeout(() => window.location.reload(), 1000);
          }
        });

        // Detectar instalación de nuevo SW
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('⬆️ Nueva versión lista. Actualizando...');
                navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
                setTimeout(() => window.location.reload(), 1000);
              }
            };
          }
        };
      })
      .catch((error) => {
        console.error('❌ Error al registrar el Service Worker:', error);
      });
  });
}
