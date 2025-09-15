import React, { useState, useEffect, useRef } from 'react';
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

  // 🔹 refrescar resumen cuando cambia ultimaActualizacion
  useEffect(() => {
    setRefrescar(prev => !prev);
  }, [ultimaActualizacion]);

  // 🔹 cerrar modal con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMostrarCalendario(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // 🔹 BLOQUEO DE SCROLL cuando el calendario está abierto
  const scrollYRef = useRef(0);
  useEffect(() => {
    if (mostrarCalendario) {
      // Guardamos la posición actual y fijamos el <body>
      scrollYRef.current = window.scrollY || window.pageYOffset;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restauramos el scroll y estilos del <body>
      const y = Math.abs(parseInt(document.body.style.top || '0', 10));
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (y) window.scrollTo(0, y);
    }

    // Cleanup por si el componente se desmonta con el modal abierto
    return () => {
      const y = Math.abs(parseInt(document.body.style.top || '0', 10));
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (y) window.scrollTo(0, y);
    };
  }, [mostrarCalendario]);

  return (
    <div className="dashboard-container">
      <main className="dashboard-main">
        <h3 className="titulo-carrusel">
          ⏰ Selecciona el momento del día
        </h3>

        {/* 🔹 Carrusel de momentos */}
        <div className="carousel-comidas">
          {momentos.map((m) => (
            <div
              key={m.id}
              className={`card-comida ${momentoSeleccionado === m.id ? 'activo' : ''}`}
              onClick={() => {
                if (momentoSeleccionado === m.id) {
                  // 🔹 Si ya estaba seleccionado → des-seleccionamos
                  setMomentoSeleccionado(null);
                  setFormularioActivo(false);
                } else {
                  // 🔹 Nueva selección → abrimos formulario
                  setMomentoSeleccionado(m.id);
                  setFormularioActivo(true);
                }
              }}
            >
              <span style={{ fontSize: 24 }}>{m.icono}</span>
              <span>{m.id}</span>
            </div>
          ))}
        </div>

        {/* 🔹 Botón del selector de fecha */}
        <div className="selector-fecha">
          <button
            type="button"
            className="label-fecha"
            onClick={() => setMostrarCalendario(true)}
            aria-expanded={mostrarCalendario}
            aria-controls="calendario-modal"
          >
            📅 {fechaTexto}
            <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>▼</span>
          </button>
        </div>

        {/* 🔹 Modal con overlay para el calendario */}
        {mostrarCalendario && (
          <div
            className="calendar-overlay"
            onClick={() => setMostrarCalendario(false)}
          >
            <div
              className="calendar-popup"
              id="calendario-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <DatePicker
                selected={fechaSeleccionada}
                onChange={(date: Date | null) => {
                  if (date) {
                    setFechaSeleccionada(date);
                    setMostrarCalendario(false); // cerrar al elegir
                  }
                }}
                inline
                locale={es}
              />
            </div>
          </div>
        )}

        {/* 🔹 Formulario activo */}
        {formularioActivo && momentoSeleccionado && (
          <RegistroModernForm
            momento={momentoSeleccionado}
            fecha={fechaFormateada}
            onGuardado={handleRegistroGuardado}
            onCancel={() => {
              setFormularioActivo(false);
              setMomentoSeleccionado(null);
            }}
          />
        )}

        {/* 🔹 Resumen nutricional (cuando no hay formulario) */}
        {!formularioActivo && (
          <ResumenNutricional
            fechaInicio={fechaFormateada}
            fechaFin={fechaFormateada}
            claveActualizacion={refrescar ? Date.now() : 0}
          />
        )}
      </main>
    </div>
  );
};

export default Nutricion;



