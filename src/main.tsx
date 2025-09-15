import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 📌 Importar el helper del plugin PWA
import { registerSW } from 'virtual:pwa-register';

// Registro del Service Worker automático de vite-plugin-pwa
registerSW({
  onNeedRefresh() {
    console.log('📢 Nueva versión disponible. Refrescando...');
    toast.info('Actualizando a la última versión...', { autoClose: 2000 });
    setTimeout(() => window.location.reload(), 1000);
  },
  onOfflineReady() {
    console.log('📡 App lista para funcionar offline');
    toast.success('App lista para usar sin conexión');
  },
});

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

