// src/pages/Dashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../assets/Styles/Dashboard.scss';
import { useAuth } from '../auth/AuthContext';
import logo from '../assets/logo-vitagoBlanco.png';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import ActivityList from '../Components/ActivityList';
import ResumenNutricional from '../Components/ResumenNutricional';
import { leerActividadesPorFecha } from '../firebase/firestoreService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { obtenerRegistrosPorFecha } from '../Services/nutricionService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import HeaderMobile from '../Components/HeaderMobile';
import TabsMenu from '../Components/TabsMenu';
import FiltrosFecha from '../Components/FiltrosFecha'; // ✅ REUTILIZADO

type Rango = 'hoy' | 'ayer' | 'semana' | '7dias' | 'personalizado';

const etiquetasObjetivo: Record<string, string> = {
  Mantener: 'Mantener peso',
  Bajar: 'Bajar peso',
  Subir: 'Subir masa muscular',
  Recomposicion: 'Recomposición corporal',
  Rendimiento: 'Mejorar rendimiento'
};

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(() => sessionStorage.getItem('justLoggedIn') === 'true');
  const [rangoSeleccionado, setRangoSeleccionado] = useState<Rango>('hoy');
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [rangoFechas, setRangoFechas] = useState([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
  const [totalCalorias, setTotalCalorias] = useState(0);
  const [caloriasIngeridas, setCaloriasIngeridas] = useState(0);
  const [getUsuario, setGetUsuario] = useState(0);
  const [objetivoUsuario, setObjetivoUsuario] = useState('');
  const [refrescarDashboard, setRefrescarDashboard] = useState(false);
  const isMobile = window.innerWidth <= 768;
  const calendarioRef = useRef<HTMLDivElement | null>(null);

  const fechaActualFormateada = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });

  const aplicarPeriodoPersonalizado = () => {
    setMostrarCalendario(false);
    setRangoSeleccionado('personalizado');
  };

  // Cerrar calendario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarioRef.current && !calendarioRef.current.contains(event.target as Node)) {
        setMostrarCalendario(false);
      }
    };
    if (mostrarCalendario) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarCalendario]);

  const forzarRefresco = () => setRefrescarDashboard(prev => !prev);

  const calcularFechasAnalizadas = (): string[] => {
    let inicio = new Date();
    let fin = new Date();

    if (rangoSeleccionado === 'ayer') {
      inicio.setDate(inicio.getDate() - 1);
      fin = new Date(inicio);
    } else if (rangoSeleccionado === '7dias') {
      inicio.setDate(inicio.getDate() - 6);
    } else if (rangoSeleccionado === 'semana') {
      const diaSemana = inicio.getDay() === 0 ? 6 : inicio.getDay() - 1;
      inicio.setDate(inicio.getDate() - diaSemana);
    } else if (rangoSeleccionado === 'personalizado') {
      inicio = rangoFechas[0].startDate;
      fin = rangoFechas[0].endDate;
    }

    const fechas: string[] = [];
    const d = new Date(inicio);
    while (d <= fin) {
      fechas.push(d.toISOString().split('T')[0]);
      d.setDate(d.getDate() + 1);
    }
    return fechas;
  };

  const fechasAnalizadas = calcularFechasAnalizadas();

  useEffect(() => {
    if (showSplash) {
      const timeout = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.removeItem('justLoggedIn');
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [showSplash]);

  useEffect(() => {
    const fetchDatos = async () => {
      if (!user) return;
      let sumaActividad = 0;
      let sumaKcal = 0;

      for (const fecha of fechasAnalizadas) {
        const actividades = await leerActividadesPorFecha(user.uid, fecha);
        sumaActividad += actividades.reduce((acc, act) => acc + (act.calorias || 0), 0);
        const registros = await obtenerRegistrosPorFecha(user.uid, fecha);
        sumaKcal += registros.reduce((acc, reg) => acc + (reg.kcalTotal || 0), 0);
      }
      setTotalCalorias(sumaActividad);
      setCaloriasIngeridas(sumaKcal);
    };
    fetchDatos();
  }, [user, rangoSeleccionado, rangoFechas, refrescarDashboard]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      const docRef = doc(db, 'usuarios', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.get) setGetUsuario(data.get);
        if (data.objetivo) setObjetivoUsuario(data.objetivo);
      }
    };
    fetchUserData();
  }, [user]);

  const gastoTotal = getUsuario * fechasAnalizadas.length + totalCalorias;
  const balance = caloriasIngeridas - gastoTotal;

  const evaluarColorBalance = (
    balance: number,
    objetivo: string,
    totalGasto: number
  ): 'verde' | 'ambar' | 'rojo' => {
    const margenVerde = totalGasto * 0.05;
    const margenAmbar = totalGasto * 0.1;

    switch (objetivo) {
      case 'Bajar':
        return balance <= -margenAmbar ? 'verde' : balance <= -margenVerde ? 'ambar' : 'rojo';
      case 'Subir':
        return balance >= margenAmbar ? 'verde' : balance >= margenVerde ? 'ambar' : 'rojo';
      case 'Mantener':
      case 'Recomposicion':
        return Math.abs(balance) <= margenVerde ? 'verde' : Math.abs(balance) <= margenAmbar ? 'ambar' : 'rojo';
      case 'Rendimiento':
        if (balance >= 0 && balance <= margenAmbar) return 'verde';
        if (balance < 0 && Math.abs(balance) <= margenAmbar) return 'ambar';
        return 'rojo';
      default:
        return 'rojo';
    }
  };

  const balanceColorClass = evaluarColorBalance(balance, objetivoUsuario, gastoTotal);

  return (
    <div className="dashboard-container">
      {showSplash ? (
        <div className="splash-screen">
          <img src={logo} alt="Logo VitaGo" className="splash-logo" />
          <div className="splash-text">By Gaudi_fc</div>
        </div>
      ) : (
        <div>
          {!isMobile && (
            <aside className="sidebar">
              <div className="logo">
                <img src={logo} alt="VitaGo Logo" />
              </div>
              <nav>
                <Link to="/acerca" className="nav-item">ℹ️ Acerca de</Link> {/* ✅ NUEVO */}
                <Link to="/dashboard" className="nav-item">🏠 Dashboard</Link>
                <Link to="/actividad" className="nav-item">🏃 Actividad</Link>
                <Link to="/nutricion" className="nav-item">🍎 Nutrición</Link>
                <Link to="/informes" className="nav-item">📊 Informes</Link>
              </nav>
            </aside>

          )}

          {isMobile && (
            <>
              <HeaderMobile fechaTexto={fechaActualFormateada} />
              <TabsMenu />
            </>
          )}

          <main className="dashboard-main">
            {objetivoUsuario && (
              <div className="objetivo-banner fade-in delay-1">
                <div className="icono">🎯</div>
                <div className="texto">
                  <span className="etiqueta">Objetivo actual</span>
                  <span className="valor">{etiquetasObjetivo[objetivoUsuario] || objetivoUsuario}</span>
                </div>
              </div>
            )}

            <FiltrosFecha
              rangoSeleccionado={rangoSeleccionado}
              setRangoSeleccionado={setRangoSeleccionado}
              mostrarCalendario={mostrarCalendario}
              setMostrarCalendario={setMostrarCalendario}
            />

            {mostrarCalendario && (
              <div className="calendario-personalizado" ref={calendarioRef}>
                <DateRange
                  editableDateInputs
                  onChange={item => setRangoFechas([item.selection])}
                  moveRangeOnFirstSelection={false}
                  ranges={rangoFechas}
                  maxDate={new Date()}
                />
                <button className="btn-aceptar" onClick={aplicarPeriodoPersonalizado}>
                  ✅ Aceptar
                </button>
              </div>
            )}

            <section className="dashboard-cards">
              <div className="card resumen-actividades fade-in delay-1">
                <h2>Resumen de Actividades</h2>
                <div className="resumen-actividad-dashboard plano">
                  <ActivityList
                    fecha={fechasAnalizadas[0]}
                    mostrarTitulo={false}
                    mensajeVacio="No hay actividades físicas para esta fecha."
                    refrescar={refrescarDashboard}
                    modoResumen={true}
                    onRefrescar={forzarRefresco}
                  />
                </div>
              </div>

              <div className="card nutricion fade-in delay-2">
                <h2>Nutrición</h2>
                <ResumenNutricional
                  fecha={fechasAnalizadas[0]}
                  modoResumen={true}
                  claveActualizacion={refrescarDashboard ? Date.now() : 0}
                  onRefrescar={forzarRefresco}
                />
              </div>

              <div className="card resumen fade-in delay-3">
                <h2>Balance calórico</h2>
                <div className="resumen-linea">
                  <span className="momento-nombre">🍽️ Ingerido:</span>
                  <span className="momento-kcal">{Math.round(caloriasIngeridas)} kcal</span>
                </div>
                <div className="resumen-linea">
                  <span className="momento-nombre">🔥 Gastado:</span>
                  <span className="momento-kcal">{Math.round(gastoTotal)} kcal</span>
                </div>
                <div className="resumen-sublinea">(GET x días + Actividad)</div>
                <div className="resumen-linea balance-text">
                  <span className="momento-nombre balance-label">⚖️ Balance:</span>
                  <span className={`momento-kcal balance-valor balance-text-${balanceColorClass}`}>
                    {balance > 0 ? '+' : ''}
                    {Math.round(balance)} kcal
                  </span>
                </div>
              </div>
            </section>
          </main>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
