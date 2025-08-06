import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo-vitagoBlanco.png';
import ActivityList from '../Components/ActivityList';
import ActivityFormModern from '../Components/ActivityFormModern';
import TabsMenu from '../Components/TabsMenu';

import '../assets/Styles/Actividad.scss';
import '../assets/Styles/ResumenNutricional.scss';

const Actividad = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;

  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [refrescar, setRefrescar] = useState(false);
  const [mensajeGlobal, setMensajeGlobal] = useState('');

  const fechaFormateada = fechaSeleccionada.toISOString().split('T')[0];
  const fechaTexto = fechaSeleccionada.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleActividadGuardada = () => {
    setRefrescar((prev) => !prev);
    setMensajeGlobal('✅ Actividad registrada correctamente');
  };

  const handleFechaChange = (nuevaFecha: string) => {
    const nueva = new Date(nuevaFecha);
    setFechaSeleccionada(nueva);
  };

  const handleRefrescarDesdeLista = (mensajeOpcional?: string) => {
    setRefrescar((prev) => !prev);
    if (mensajeOpcional) {
      setMensajeGlobal(mensajeOpcional);
    }
  };

  useEffect(() => {
    if (mensajeGlobal) {
      const timeout = setTimeout(() => setMensajeGlobal(''), 3000);
      return () => clearTimeout(timeout);
    }
  }, [mensajeGlobal]);

  return (
    <div className="dashboard-container">
      {/* Cabecera */}
      <div className="mobile-header">
        <div className="mobile-logo">
          <img src={logo} alt="VitaGo Logo" />
        </div>
        <div className="mobile-info">
          <div>{fechaTexto}</div>
          <div onClick={handleLogout}>
            Bienvenido, {user?.email} ▼
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMobile && <TabsMenu />}

      {/* Contenido */}
      <main className="actividad-contenido">
        {mensajeGlobal && (
          <div className="mensaje-global">{mensajeGlobal}</div>
        )}

        <ActivityFormModern
          fecha={fechaFormateada}
          onFechaChange={handleFechaChange}
          onActividadGuardada={handleActividadGuardada}
        />

        <ActivityList
          fecha={fechaFormateada}
          mostrarTitulo={true}
          mensajeVacio="No hay actividades registradas para esta fecha."
          refrescar={refrescar}
          onRefrescar={(msg) => handleRefrescarDesdeLista(msg || '✅ Cambios actualizados')}
        />
      </main>
    </div>
  );
};

export default Actividad;










