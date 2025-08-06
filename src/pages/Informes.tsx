// src/pages/Informes.tsx

import React, { useState, useEffect, useRef } from 'react';
import HeaderMobile from '../Components/HeaderMobile';
import TabsMenu from '../Components/TabsMenu';
import EvaluacionNutricional from '../Components/EvaluacionNutricional2';
import BalanceCalorico from '../Components/BalanceCalorico';
import { DateRange, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { calcularRecomendacionesNutricionales } from '../Services/RecomendacionService';
import { obtenerRegistrosPorFecha } from '../Services/nutricionService';
import { leerActividadesPorFecha } from '../firebase/firestoreService';
import { useAuth } from '../auth/AuthContext';
import FiltrosFecha from '../Components/FiltrosFecha';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

type Rango = 'hoy' | 'ayer' | 'semana' | '7dias' | 'personalizado';

const etiquetasObjetivo: Record<string, string> = {
  Mantener: 'Mantener peso',
  Bajar: 'Bajar peso',
  Subir: 'Subir masa muscular',
  Recomposicion: 'Recomposición corporal',
  Rendimiento: 'Mejorar rendimiento',
};

const Informes = () => {
  const { user } = useAuth();
  const [fechaSeleccionada] = useState(new Date());
  const [rangoSeleccionado, setRangoSeleccionado] = useState<Rango>('hoy');
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [rangoFechas, setRangoFechas] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  const [datosNutrientes, setDatosNutrientes] = useState<any[]>([]);
  const [calorias, setCalorias] = useState({ ingerido: 0, quemado: 0, get: 0 });
  const [fechasAnalizadas, setFechasAnalizadas] = useState<string[]>([]);
  const [alimentosPeriodo, setAlimentosPeriodo] = useState<any[]>([]);
  const [objetivoUsuario, setObjetivoUsuario] = useState('');
  const calendarioRef = useRef<HTMLDivElement | null>(null);

  const fechaTexto = fechaSeleccionada.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const isMobile = window.innerWidth <= 768;

  const aplicarPeriodoPersonalizado = () => {
    setMostrarCalendario(false);
    setRangoSeleccionado('personalizado');
  };

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

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      const docRef = doc(db, 'usuarios', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.objetivo) setObjetivoUsuario(data.objetivo);
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!user) return;

      let fechaInicio = new Date();
      let fechaFin = new Date();

      if (rangoSeleccionado === 'ayer') {
        fechaInicio.setDate(fechaInicio.getDate() - 1);
        fechaFin = new Date(fechaInicio);
      } else if (rangoSeleccionado === '7dias') {
        fechaInicio.setDate(fechaInicio.getDate() - 6);
      } else if (rangoSeleccionado === 'semana') {
        const diaSemana = fechaInicio.getDay() === 0 ? 6 : fechaInicio.getDay() - 1;
        fechaInicio.setDate(fechaInicio.getDate() - diaSemana);
      } else if (rangoSeleccionado === 'personalizado') {
        fechaInicio = rangoFechas[0].startDate;
        fechaFin = rangoFechas[0].endDate;
      }

      const fechas: string[] = [];
      const fechaIter = new Date(fechaInicio);
      while (fechaIter <= fechaFin) {
        fechas.push(fechaIter.toISOString().split('T')[0]);
        fechaIter.setDate(fechaIter.getDate() + 1);
      }

      setFechasAnalizadas(fechas);

      let totales: Record<string, number> = {};
      let totalCalorias = 0;
      let totalGET = 0;
      let totalQuemado = 0;
      let diasConRegistros = 0;
      const alimentosAcumulados: any[] = [];

      const normalizarClave = (clave: string): string => {
        const map: Record<string, string> = {
          'hidratos de carbono': 'hidratos',
          'carbohidratos': 'hidratos',
          'grasas saturadas': 'grasasSaturadas',
          'saturadas': 'grasasSaturadas',
          'azúcares': 'azucares',
        };
        return map[clave.toLowerCase()] || clave.toLowerCase();
      };

      for (const fecha of fechas) {
        const registros = await obtenerRegistrosPorFecha(user.uid, fecha);
        const alimentos = registros.flatMap(r => r.alimentos || []);
        if (alimentos.length === 0) continue;
        diasConRegistros++;

        alimentosAcumulados.push(...alimentos);

        alimentos.forEach(al => {
          Object.entries(al.nutrientes || {}).forEach(([clave, valor]) => {
            const key = normalizarClave(clave);
            const numero = Number(valor);
            if (!isNaN(numero)) {
              totales[key] = (totales[key] || 0) + numero;
            }
          });
        });

        totalCalorias += alimentos.reduce((s, a) => s + a.calorias, 0);

        const recomendado = await calcularRecomendacionesNutricionales(user.uid, fecha);
        totalGET += recomendado.get;

        const actividades = await leerActividadesPorFecha(user.uid, fecha);
        totalQuemado += actividades.reduce((s, act) => s + (act.calorias || 0), 0);
      }

      const promedio = await calcularRecomendacionesNutricionales(
        user.uid,
        new Date().toISOString().split('T')[0]
      );

      setDatosNutrientes([
        { nutriente: 'Proteínas',     ingerido: totales.proteinas || 0, recomendado: promedio.proteinas * diasConRegistros },
        { nutriente: 'Hidratos.C',    ingerido: totales.hidratos || 0, recomendado: promedio.hidratos * diasConRegistros },
        { nutriente: 'Grasas',        ingerido: totales.grasas || 0, recomendado: promedio.grasas * diasConRegistros },
        { nutriente: 'G. Saturadas',  ingerido: totales.grasassaturadas || 0, recomendado: promedio.grasasSaturadas * diasConRegistros },
        { nutriente: 'Azúcares',      ingerido: totales.azucares || 0, recomendado: promedio.azucares * diasConRegistros },
        { nutriente: 'Fibra',         ingerido: totales.fibra || 0, recomendado: promedio.fibra * diasConRegistros },
        { nutriente: 'Hierro',        ingerido: totales.hierro || 0, recomendado: promedio.hierro * diasConRegistros },
        { nutriente: 'Calcio',        ingerido: totales.calcio || 0, recomendado: promedio.calcio * diasConRegistros },
        { nutriente: 'Sodio',         ingerido: totales.sodio || 0, recomendado: promedio.sodio * diasConRegistros },
        { nutriente: 'Potasio',       ingerido: totales.potasio || 0, recomendado: promedio.potasio * diasConRegistros },
      ]);

      setAlimentosPeriodo(alimentosAcumulados);

      setCalorias({
        ingerido: totalCalorias,
        quemado: totalQuemado,
        get: totalGET,
      });
    };

    cargarDatos();
  }, [user, rangoSeleccionado, rangoFechas]);

  return (
    <div className="dashboard-container">
      <HeaderMobile fechaTexto={fechaTexto} />
      {isMobile && <TabsMenu />}

      <main className="informes-contenido" style={{ padding: '1rem' }}>
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
              editableDateInputs={true}
              onChange={(item: RangeKeyDict) => setRangoFechas([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={rangoFechas}
              maxDate={new Date()}
            />
            <button className="btn-aceptar" onClick={aplicarPeriodoPersonalizado}>
              ✅ Aceptar
            </button>
          </div>
        )}

        <div className="tarjeta-con-titulo">
          <BalanceCalorico
            ingerido={calorias.ingerido}
            quemado={calorias.quemado}
            get={calorias.get}
          />
        </div>

        <div className="tarjeta-con-titulo">
          <EvaluacionNutricional
            datos={datosNutrientes}
            fechasAnalizadas={fechasAnalizadas}
            alimentosPeriodo={alimentosPeriodo}
          />
        </div>
      </main>
    </div>
  );
};

export default Informes;

