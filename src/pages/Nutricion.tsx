import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import RegistroModernForm from '../Components/RegistroModernForm';
import ResumenNutricional from '../Components/ResumenNutricional';
import DatePicker from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import '../assets/Styles/RegistroFormModern.scss';

const Nutricion = () => {
  const { user, logout, ultimaActualizacion } = useAuth(); // 🔹 añadido ultimaActualizacion
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;

  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [momentoSeleccionado, setMomentoSeleccionado] = useState<string | null>(null);
  const [refrescar, setRefrescar] = useState(false);
  const [formularioActivo, setFormularioActivo] = useState(false);

  const fechaFormateada = fechaSeleccionada.toISOString().split('T')[0];
  const fechaTexto = fechaSeleccionada.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRegistroGuardado = () => {
    setRefrescar(prev => !prev);
    setMomentoSeleccionado(null);
    setFormularioActivo(false);
  };

  const momentos = [
    { id: 'Refrigerio (despertar)', icono: '🌅' },
    { id: 'Desayuno', icono: '🍳' },
    { id: 'Comida', icono: '🍽️' },
    { id: 'Refrigerio (tarde)', icono: '☕' },
    { id: 'Cena', icono: '🌙' },
  ];

  useEffect(() => {
    const cerrarEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMostrarCalendario(false);
    };
    document.addEventListener('keydown', cerrarEsc);
    return () => document.removeEventListener('keydown', cerrarEsc);
  }, []);

  // 🔹 cuando cambie ultimaActualizacion, refrescamos el resumen
  useEffect(() => {
    setRefrescar(prev => !prev);
  }, [ultimaActualizacion]);

  return (
    <div className="dashboard-container">
      {/* 🔹 Unificado: usamos dashboard-main en lugar de nutricion-contenido */}
      <main className="dashboard-main">
        <h3 className="titulo-carrusel">
          ⏰ Selecciona el momento del día
        </h3>

        <div className="carousel-comidas">
          {momentos.map((m) => (
            <div
              key={m.id}
              className={`card-comida ${momentoSeleccionado === m.id ? 'activo' : ''}`}
              onClick={() => {
                setMomentoSeleccionado(m.id);
                setFormularioActivo(true);
              }}
            >
              <span style={{ fontSize: 24 }}>{m.icono}</span>
              <span>{m.id}</span>
            </div>
          ))}
        </div>

        <div className="selector-fecha">
          <div
            className="label-fecha"
            onClick={() => setMostrarCalendario(true)}
          >
            📅 {fechaTexto}
            <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>▼</span>
          </div>
        </div>

        {mostrarCalendario && (
          <div
            className="modal-overlay"
            onClick={() => setMostrarCalendario(false)}
          >
            <div
              className="modal-calendario"
              onClick={(e) => e.stopPropagation()}
            >
              <DatePicker
                selected={fechaSeleccionada}
                onChange={(date: Date | null) => {
                  if (date) {
                    setFechaSeleccionada(date);
                    setMostrarCalendario(false);
                  }
                }}
                inline
                locale={es}
              />
            </div>
          </div>
        )}

        {momentoSeleccionado && (
          <h4 className="titulo-momento">{momentoSeleccionado}</h4>
        )}

        {formularioActivo && momentoSeleccionado && (
          <RegistroModernForm
            momento={momentoSeleccionado}
            fecha={fechaFormateada}
            onGuardado={handleRegistroGuardado}
          />
        )}

        <ResumenNutricional
          fecha={fechaFormateada}
          claveActualizacion={refrescar ? Date.now() : 0}
        />
      </main>
    </div>
  );
};

export default Nutricion;



