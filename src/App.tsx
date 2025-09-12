// src/App.tsx
import React, { useRef, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import './App.scss';

import WelcomeScreen from './pages/WelcomeScreen';
import RegistroUsuario from './pages/RegistroUsuario';
import Login from './pages/Login';
import RecuperarContraseña from './pages/RecuperarContraseña';

import Dashboard from './pages/Dashboard';
import Actividad from './pages/Actividad';
import Nutricion from './pages/Nutricion';
import Informes from './pages/Informes';
import Alimentos from './pages/Alimentos';
import Acerca from './pages/Acerca';
import TabsMenu from './Components/TabsMenu';
import PrivateRoute from './pages/PrivateRoute';
import MobileLayout from './Components/Mobilelayout'; // 👈 nuevo layout

// ✅ Rutas que participan en el scroll horizontal
const pages = [
  { path: '/acerca', component: <Acerca /> },
  { path: '/dashboard', component: <PrivateRoute><Dashboard /></PrivateRoute> },
  { path: '/informes', component: <Informes /> },
  { path: '/actividad', component: <Actividad /> },
  { path: '/nutricion', component: <Nutricion /> },
  { path: '/alimentos', component: <PrivateRoute><Alimentos /></PrivateRoute> },
];

// ✅ Componente que sincroniza scroll horizontal con la ruta actual
const ScrollRouter: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const paths = pages.map(p => p.path);

  const fechaTexto = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const index = paths.indexOf(location.pathname);
    if (index >= 0) {
      container.scrollTo({
        left: index * container.offsetWidth,
        behavior: 'smooth',
      });
    }
  }, [location.pathname]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const width = container.offsetWidth;
        const index = Math.round(scrollLeft / width);
        const newPath = paths[index];
        if (newPath && location.pathname !== newPath) {
          navigate(newPath);
        }
      }, 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [navigate, location.pathname]);

  return (
    <MobileLayout fechaTexto={fechaTexto}>
      <div className="scroll-container" ref={containerRef}>
        {pages.map((page) => (
          <div key={page.path} className="scroll-section">
            {page.component}
          </div>
        ))}
      </div>
    </MobileLayout>
  );
};

// ✅ App principal
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/registro" element={<RegistroUsuario />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar" element={<RecuperarContraseña />} />
        <Route path="*" element={<ScrollRouter />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;



