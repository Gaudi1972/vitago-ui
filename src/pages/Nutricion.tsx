import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo-vitagoBlanco.png';
import RegistroModernForm from '../Components/RegistroModernForm';
import ResumenNutricional from '../Components/ResumenNutricional';
import DatePicker from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import '../assets/Styles/RegistroFormModern.scss';
import TabsMenu from '../Components/TabsMenu';

const Nutricion = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;

  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [momentoSeleccionado, setMomentoSeleccionado] = useState<string>('Desayuno');
  const [refrescar, setRefrescar] = useState(false);
  const [formularioActivo, setFormularioActivo] = useState(false); // ✅ Nuevo estado

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

  return (
    <div className="dashboard-container">
      {/* ✅ Cabecera */}
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

      {/* ✅ Navegación inferior */}
      {isMobile && <TabsMenu />}

      <main className="nutricion-contenido">
        <h3 className="titulo-carrusel">
          ⏰ Selecciona el momento del día
        </h3>

        {/* ✅ Carrusel moderno horizontal */}
        <div className="carousel-comidas">
          {momentos.map((m) => (
            <div
              key={m.id}
              className={`card-comida ${m.id === momentoSeleccionado ? 'activo' : ''}`}
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

        {/* ✅ Selector de fecha */}
        <div className="selector-fecha">
          <div
            className="label-fecha"
            onClick={() => setMostrarCalendario(true)}
          >
            📅 {fechaTexto}
            <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>▼</span>
          </div>
        </div>

        {/* ✅ Modal con DatePicker */}
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
                onChange={(date: Date) => {
                  setFechaSeleccionada(date);
                  setMostrarCalendario(false);
                }}
                inline
                locale={es}
              />
            </div>
          </div>
        )}

        {/* ✅ Título del momento actual */}
        <h4 className="titulo-momento">{momentoSeleccionado}</h4>

        {/* ✅ Solo mostrar formulario tras interacción */}
        {formularioActivo && (
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


















