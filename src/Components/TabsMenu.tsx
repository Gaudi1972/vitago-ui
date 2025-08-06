import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TabsMenu.scss';

// ✅ Lista de pestañas
const tabs = [
  { path: '/acerca', label: 'ℹ️ Acerca' },
  { path: '/dashboard', label: '🏠 Dashboard' },
  { path: '/informes', label: '📊 Informes' },
  { path: '/actividad', label: '🏃 Actividad' },
  { path: '/nutricion', label: '🍎 Nutrición' },
  { path: '/alimentos', label: '🍽️ Alimentos' }
];

const TabsMenu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // 🔁 Centra el botón activo al cargar/cambiar de ruta
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeButton = container.querySelector('.tab-button.active') as HTMLElement;
    if (!activeButton) return;

    container.style.scrollSnapType = 'none';
    activeButton.scrollIntoView({ behavior: 'smooth', inline: 'center' });

    setTimeout(() => {
      container.style.scrollSnapType = 'x mandatory';
    }, 400);
  }, [location.pathname]);

  // 🧠 Detectar el botón más centrado tras scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScrollStop = () => {
      const buttons = Array.from(container.querySelectorAll('.tab-button')) as HTMLButtonElement[];

      const centerX = container.scrollLeft + container.offsetWidth / 2;
      let closestBtn: HTMLButtonElement | null = null;
      let closestDistance = Infinity;

      for (const btn of buttons) {
        const rect = btn.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const distance = Math.abs(btnCenterX - window.innerWidth / 2);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestBtn = btn;
        }
      }

      buttons.forEach(btn => btn.classList.remove('centered'));

      // ❗ Solo agregar 'centered' si NO es el botón activo
      if (closestBtn && !closestBtn.classList.contains('active')) {
        closestBtn.classList.add('centered');
      }
    };

    let timeout: NodeJS.Timeout;
    const onScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleScrollStop, 100);
    };

    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="tabs" ref={containerRef}>
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            className={`tab-button ${isActive ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};

export default TabsMenu;







