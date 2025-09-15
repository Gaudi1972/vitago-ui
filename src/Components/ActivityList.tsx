// src/Components/ActivityList.tsx
import React, { useEffect, useState } from 'react';
import {
  leerActividadesPorFecha,
  ActividadFisica
} from '../Firebase/firestoreService';
import { useAuth } from '../auth/AuthContext';
import { Pencil, Trash2 } from 'lucide-react';
import {
  IconActivity,
  IconWalk,
  IconBike,
  IconBikeOff,
  IconWeight,
  IconMountain,
  IconMap,
  IconShoe,
} from '@tabler/icons-react';
import { formatNumber } from '../utils/formatNumber';

interface Props {
  fechaInicio: string;
  fechaFin: string;
  mostrarTitulo?: boolean;
  mensajeVacio?: string;
  refrescar?: boolean;
  modoResumen?: boolean;
  onRefrescar?: (mensajeOpcional?: string) => void;
  onCambio?: () => void;
  onEditarActividad?: (actividad: ActividadFisica) => void;   // 👈 nuevo
  onEliminarActividad?: (actividad: ActividadFisica) => void; // 👈 nuevo
}

const iconosActividad: { [key: string]: React.ReactNode } = {
  correr: <IconActivity size={18} />,
  caminata: <IconWalk size={18} />,
  bici_btt: <IconBikeOff size={18} />,
  bici_carretera: <IconBike size={18} />,
  fuerza: <IconWeight size={18} />,
  trail_running: <IconMountain size={18} />,
  trekking: <IconMap size={18} />,
  pasos_diarios: <IconShoe size={18} />,
};

const ActivityList: React.FC<Props> = ({
  fechaInicio,
  fechaFin,
  mostrarTitulo = true,
  mensajeVacio = 'No hay actividades registradas para este periodo.',
  refrescar,
  modoResumen = false,
  onRefrescar,
  onCambio,
  onEditarActividad,
  onEliminarActividad
}) => {
  const { user } = useAuth();
  const [actividades, setActividades] = useState<ActividadFisica[]>([]);
  const [cargando, setCargando] = useState(true);

  // 🔹 Genera todas las fechas entre inicio y fin
  const generarFechas = (inicio: string, fin: string): string[] => {
    const fechas: string[] = [];
    let d = new Date(inicio);
    const finDate = new Date(fin);
    while (d <= finDate) {
      fechas.push(d.toISOString().split('T')[0]);
      d.setDate(d.getDate() + 1);
    }
    return fechas;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setCargando(true);

      const fechas = generarFechas(fechaInicio, fechaFin);
      let todas: ActividadFisica[] = [];

      for (const f of fechas) {
        const data = await leerActividadesPorFecha(user.uid, f);
        todas = todas.concat(data);
      }

      setActividades(todas);
      setCargando(false);
    };
    fetchData();
  }, [user, fechaInicio, fechaFin, refrescar]);

  // 🔹 Agrupar actividades por tipo y sumar kcal
  const actividadesAgrupadas = actividades.reduce((acc, act) => {
    const tipo = act.tipo;
    if (!acc[tipo]) {
      acc[tipo] = { ...act, calorias: 0 };
    }
    acc[tipo].calorias = (acc[tipo].calorias || 0) + (act.calorias || 0);
    return acc;
  }, {} as Record<string, ActividadFisica>);

  const listaAgrupada = Object.values(actividadesAgrupadas);

  const totalKcal = actividades.reduce((acc, a) => acc + (a.calorias || 0), 0);

  if (!user) return null;

  return (
    <div>
      {cargando ? (
        <p>Cargando actividades...</p>
      ) : actividades.length === 0 ? (
        <p>{mensajeVacio}</p>
      ) : modoResumen ? (
        // 🔹 RESUMEN AGRUPADO
        <div className="resumen-nutricional-dashboard plano">
          {listaAgrupada.map((act, i) => (
            <div key={i} className="activity-line">
              <span className="activity-name">
                {iconosActividad[act.tipo] || <IconActivity size={18} />} {act.tipo.replace(/_/g, ' ')}
              </span>
              <span className="activity-kcal">
                {formatNumber(act.calorias || 0)} kcal
              </span>
            </div>
          ))}
          <div className="total-kcal">
            <div className="label">Total kcal gastadas en el periodo</div>
            <div className="value"><strong>{formatNumber(totalKcal)} kcal</strong></div>
          </div>
        </div>
      ) : (
        // 🔹 DETALLE COMPLETO (sin agrupar)
        <div className="resumen-nutricional-dashboard actividad-modulo">
          {actividades.map((act, i) => (
            <div key={i} className="resumen-linea">
              <div className="resumen-header">
                <div className="resumen-nombre">
                  {iconosActividad[act.tipo] || <IconActivity size={18} />} {act.tipo.replace(/_/g, ' ')}
                  <div className="acciones">
                    <button
                      onClick={() => onEditarActividad?.(act)} // 👈 pasamos la actividad al padre
                      className="btn-editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onEliminarActividad?.(act)} // 👈 idem para eliminar
                      className="btn-eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <span className="resumen-kcal">
                  {formatNumber(act.calorias || 0)} kcal
                </span>
              </div>

              <div className="resumen-detalle">
                {act.tipo === 'pasos_diarios' ? (
                  <p className="resumen-param">
                    Total pasos:{' '}
                    {formatNumber((act.calorias || 0) / 0.04)}
                  </p>
                ) : (
                  <>
                    {act.duracion && (
                      <p className="resumen-param">Minutos: {act.duracion}</p>
                    )}
                    {act.ppm && (
                      <p className="resumen-param">PPM: {act.ppm}</p>
                    )}
                    {act.ritmo && <p className="resumen-param">Ritmo: {act.ritmo}</p>}
                  </>
                )}
              </div>
            </div>
          ))}

          <div className="total-kcal">
            Total kcal gastadas en el periodo:{' '}
            <strong>{formatNumber(totalKcal)} kcal</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityList;






