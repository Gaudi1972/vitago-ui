// src/Components/TabsMenu.tsx
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TabsMenu.scss';
import useIsMobile from '../hooks/useIsMobile';

const tabs = [
  { path: '/acerca', label: 'ℹ️ Acerca' },
  { path: '/dashboard', label: '🏠 Resumen' },
  { path: '/informes', label: '📊 Informes' },
  { path: '/actividad', label: '🏃 Actividad' },
  { path: '/nutricion', label: '🍎 Nutrición' },
  { path: '/alimentos', label: '🍽️ Alimentos' },
];

const TabsMenu: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // 👉 Centrar el botón activo cada vez que cambia la ruta
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeBtn = container.querySelector(`[data-path="${location.pathname}"]`) as HTMLButtonElement;
    if (activeBtn) {
      const btnOffset = activeBtn.offsetLeft;
      const btnWidth = activeBtn.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollTo = btnOffset - containerWidth / 2 + btnWidth / 2;

      container.scrollTo({
        left: scrollTo,
        behavior: 'smooth',
      });
    }
  }, [location.pathname]);

  if (!isMobile) return null;

  return (
    <nav className="tabs" ref={containerRef}>
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;

        return (
          <button
            key={tab.path}
            className={`tab-button ${isActive ? 'active' : ''}`}
            data-path={tab.path}
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











