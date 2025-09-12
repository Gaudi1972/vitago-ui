import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import ActivityList from '../Components/ActivityList';
import ActivityFormModern from '../Components/ActivityFormModern';

import '../assets/Styles/Actividad.scss';
import '../assets/Styles/ResumenNutricional.scss';
import '../assets/Styles/CarruselComun.scss'; // 🔹 Aseguramos que cargue estilos comunes

const Actividad = () => {
  const { ultimaActualizacion } = useAuth();
  const navigate = useNavigate();
  
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [refrescar, setRefrescar] = useState(false);
  const [mensajeGlobal, setMensajeGlobal] = useState('');

  const fechaFormateada = fechaSeleccionada.toISOString().split('T')[0];

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
    setRefrescar(prev => !prev);
  }, [ultimaActualizacion]);

  useEffect(() => {
    if (mensajeGlobal) {
      const timeout = setTimeout(() => setMensajeGlobal(''), 3000);
      return () => clearTimeout(timeout);
    }
  }, [mensajeGlobal]);

  return (
    <div className="dashboard-container">
      {/* 🔹 Unificado: usamos dashboard-main en lugar de actividad-contenido */}
      <main className="dashboard-main">
        {mensajeGlobal && (
          <div className="mensaje-global">{mensajeGlobal}</div>
        )}

        <h3 className="titulo-carrusel">❤️ Selecciona una actividad</h3>

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
