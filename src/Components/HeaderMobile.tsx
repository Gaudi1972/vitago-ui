// src/Components/HeaderMobile.tsx
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo-vitagoBlanco.png';
import '../assets/Styles/HeaderMobile.scss';

const HeaderMobile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const initials = useMemo(() => {
    const email = user?.email || '';
    const base = email.split('@')[0] || 'U';
    return base.slice(0, 2).toUpperCase();
  }, [user]);

  // Fecha "Hoy, 31 de agosto"
  const fechaFormateada = (() => {
    const hoy = new Date();
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    return `Hoy, ${hoy.toLocaleDateString('es-ES', opts)}`;
  })();

  // Coordenadas del menú (basadas en el header)
  const getMenuPosition = () => {
    const rect = headerRef.current?.getBoundingClientRect();
    const top = (rect?.bottom ?? 56) + 8 + window.scrollY; // 8px de separación
    const right = 8; // margen a la derecha
    return { top, right };
  };

  return (
    <div className="mobile-header" ref={headerRef}>
      <div className="mobile-logo">
        <img src={logo} alt="VitaGo Logo" />
      </div>

      <div className="mobile-info">
        <div className="fecha">{fechaFormateada}</div>
      </div>

      <div className="mobile-user">
        <button className="avatar-btn" onClick={() => setOpen(v => !v)} aria-haspopup="menu" aria-expanded={open}>
          {initials}
        </button>
      </div>

      {open && createPortal(
        <>
          {/* Backdrop para cerrar al tocar fuera */}
          <div className="m-backdrop" onClick={() => setOpen(false)} />

          {/* Menú fijo a la pantalla (no se corta) */}
          <div
            className="m-menu-fixed"
            role="menu"
            style={{ top: getMenuPosition().top, right: getMenuPosition().right }}
          >
            <div className="m-menu-header">
              <div className="m-avatar sm">{initials}</div>
              <div className="m-email">{user?.email}</div>
            </div>
            <button className="m-item" role="menuitem" onClick={() => { setOpen(false); navigate('/perfil'); }}>
              Perfil
            </button>
            <button className="m-item" role="menuitem" onClick={() => { setOpen(false); navigate('/ajustes'); }}>
              Ajustes
            </button>
            <div className="m-sep" />
            <button className="m-item danger" role="menuitem" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default HeaderMobile;

