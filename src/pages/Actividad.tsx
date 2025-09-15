// src/pages/Actividad.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import ActivityList from '../Components/ActivityList';
import ActivityFormModern from '../Components/ActivityFormModern';
import ReactDOM from 'react-dom';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale';

import '../assets/Styles/Actividad.scss';
import '../assets/Styles/ResumenNutricional.scss';
import '../assets/Styles/CarruselComun.scss';

const activityOptions = [
  { value: 'correr', label: 'Correr', icon: '🏃' },
  { value: 'caminata', label: 'Caminata', icon: '🚶' },
  { value: 'bici_btt', label: 'Bicicleta BTT', icon: '🚵' },
  { value: 'bici_carretera', label: 'Bicicleta carretera', icon: '🚴' },
  { value: 'fuerza', label: 'Fuerza', icon: '🏋️' },
  { value: 'trail_running', label: 'Trail Running', icon: '⛰️' },
  { value: 'trekking', label: 'Trekking', icon: '🥾' },
  { value: 'pasos_diarios', label: 'Pasos diarios', icon: '👣' },
];

const Actividad = () => {
  const { ultimaActualizacion } = useAuth();
  const navigate = useNavigate();

  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  const [refrescar, setRefrescar] = useState(false);
  const [mensajeGlobal, setMensajeGlobal] = useState('');
  const [formularioActivo, setFormularioActivo] = useState(false);
  const [actividadSeleccionada, setActividadSeleccionada] = useState<string | null>(null);
  const [actividadEnEdicion, setActividadEnEdicion] = useState<any | null>(null);

  const fechaFormateada = fechaSeleccionada.toISOString().split('T')[0];
  const fechaTexto = fechaSeleccionada.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleActividadGuardada = () => {
    setRefrescar((prev) => !prev);
    setMensajeGlobal(
      actividadEnEdicion ? '✅ Actividad actualizada correctamente' : '✅ Actividad registrada correctamente'
    );
    setFormularioActivo(false);
    setActividadSeleccionada(null);
    setActividadEnEdicion(null);
  };

  const handleFechaChange = (nuevaFecha: string) => {
    const nueva = new Date(nuevaFecha);
    setFechaSeleccionada(nueva);
  };

  const handleRefrescarDesdeLista = (mensajeOpcional?: string) => {
    setRefrescar((prev) => !prev);
    if (mensajeOpcional) setMensajeGlobal(mensajeOpcional);
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

  // 👇 Hook para añadir clase al body cuando se abre el teclado
  useEffect(() => {
    const handleFocus = () => document.body.classList.add("keyboard-open");
    const handleBlur = () => document.body.classList.remove("keyboard-open");

    window.addEventListener("focusin", handleFocus);
    window.addEventListener("focusout", handleBlur);

    return () => {
      window.removeEventListener("focusin", handleFocus);
      window.removeEventListener("focusout", handleBlur);
    };
  }, []);

  return (
    <div className="dashboard-container">
      <main className="dashboard-main">
        {mensajeGlobal && (
          <div className={`mensaje-global ${mensajeGlobal.startsWith('❌') ? 'error' : ''}`}>
            {mensajeGlobal}
          </div>
        )}

        <h3 className="titulo-carrusel">❤️ Selecciona una actividad</h3>

        {/* 🔹 Carrusel de actividades */}
        <div className="carousel-comidas">
          {activityOptions.map((opt) => (
            <div
              key={opt.value}
              className={`card-comida ${actividadSeleccionada === opt.value ? 'activo' : ''}`}
              onClick={() => {
                if (actividadSeleccionada === opt.value) {
                  setActividadSeleccionada(null);
                  setFormularioActivo(false);
                } else {
                  setActividadSeleccionada(opt.value);
                  setFormularioActivo(true);
                  setActividadEnEdicion(null); // 👈 limpiar edición previa
                }
              }}
            >
              <span style={{ fontSize: 24 }}>{opt.icon}</span>
              <span>{opt.label}</span>
            </div>
          ))}
        </div>

        {/* 🔹 Selector de fecha con overlay */}
        <div className="selector-fecha">
          <button
            type="button"
            className="label-fecha"
            onClick={() => setMostrarCalendario(true)}
            aria-expanded={mostrarCalendario}
            aria-controls="calendario-actividad-modal"
          >
            📅 {fechaTexto}
            <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>▼</span>
          </button>
        </div>

        {mostrarCalendario && (
          <div
            className="calendar-overlay"
            onClick={() => setMostrarCalendario(false)}
          >
            <div
              className="calendar-popup"
              id="calendario-actividad-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <DatePicker
                selected={fechaSeleccionada}
                onChange={(date: Date | null) => {
                  if (!date) return;
                  handleFechaChange(date.toISOString().split('T')[0]);
                  setMostrarCalendario(false);
                }}
                inline
                locale={es}
              />
            </div>
          </div>
        )}

        {/* 🔹 Formulario activo (nuevo registro) */}
        {formularioActivo && actividadSeleccionada && !actividadEnEdicion && (
          <ActivityFormModern
            fecha={fechaFormateada}
            onFechaChange={handleFechaChange}
            onActividadGuardada={handleActividadGuardada}
            onCancel={() => {
              setFormularioActivo(false);
              setActividadSeleccionada(null);
            }}
            actividadSeleccionada={actividadSeleccionada}  // 👈 PASAMOS LA PROP
          />
        )}

        {/* 🔹 Lista de actividades */}
        {!formularioActivo && (
          <ActivityList
            fechaInicio={fechaFormateada}
            fechaFin={fechaFormateada}
            mostrarTitulo={true}
            mensajeVacio="No hay actividades registradas para esta fecha."
            refrescar={refrescar}
            onRefrescar={(msg) =>
              handleRefrescarDesdeLista(msg || '✅ Cambios actualizados')
            }
            onEditarActividad={(actividad) => {
              setActividadEnEdicion(actividad);
            }}
          />
        )}

        {/* 🔹 Modal de edición con Portal */}
        {actividadEnEdicion &&
          ReactDOM.createPortal(
            <div
              className="modal-overlay"
              onClick={() => setActividadEnEdicion(null)}
            >
              <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
              >
                <h4 className="modal-title">Editar actividad</h4>

                <ActivityFormModern
                  fecha={fechaFormateada}
                  onFechaChange={handleFechaChange}
                  onActividadGuardada={handleActividadGuardada}
                  onCancel={() => setActividadEnEdicion(null)}
                  actividadInicial={actividadEnEdicion}
                />
              </div>
            </div>,
            document.body
          )
        }
      </main>
    </div>
  );
};

export default Actividad;







