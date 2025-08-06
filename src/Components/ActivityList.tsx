// src/Components/ActivityList.tsx
import React, { useEffect, useState } from 'react';
import {
  leerActividadesPorFecha,
  editarActividad,
  eliminarActividad,
  ActividadFisica
} from '../firebase/firestoreService';
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

interface Props {
  fecha: string;
  mostrarTitulo?: boolean;
  mensajeVacio?: string;
  refrescar?: boolean;
  modoResumen?: boolean;
  onRefrescar?: () => void;
  onCambio?: () => void;
}

const iconosActividad: { [key: string]: JSX.Element } = {
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
  fecha,
  mostrarTitulo = true,
  mensajeVacio = 'No hay actividades registradas para esta fecha.',
  refrescar,
  modoResumen = false,
  onRefrescar,
  onCambio
}) => {
  const { user } = useAuth();
  const [actividades, setActividades] = useState<ActividadFisica[]>([]);
  const [cargando, setCargando] = useState(true);

  const [indexEditando, setIndexEditando] = useState<number | null>(null);
  const [editDuracion, setEditDuracion] = useState('');
  const [editRitmo, setEditRitmo] = useState('');
  const [editCalorias, setEditCalorias] = useState('');
  const [editPasos, setEditPasos] = useState('');

  const [indexEliminando, setIndexEliminando] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setCargando(true);
      const data = await leerActividadesPorFecha(user.uid, fecha);
      setActividades(data);
      setCargando(false);
    };
    fetchData();
  }, [user, fecha, refrescar]);

  const abrirModalEdicion = (i: number) => {
    const act = actividades[i];
    setIndexEditando(i);
    setEditDuracion(act.duracion?.toString() || '');
    setEditRitmo(act.ritmo || '');
    setEditCalorias(act.calorias?.toString() || '');
    setEditPasos(
      act.tipo === 'pasos_diarios' && act.calorias
        ? Math.round(act.calorias / 0.04).toString()
        : ''
    );
  };

  const cerrarModal = () => {
    setIndexEditando(null);
    setEditDuracion('');
    setEditRitmo('');
    setEditCalorias('');
    setEditPasos('');
  };

  const guardarCambios = async () => {
    if (!user || indexEditando === null) return;
    const actual = actividades[indexEditando];

    const nuevosDatos: Partial<ActividadFisica> = {
      duracion: parseInt(editDuracion) || 0,
      ritmo: editRitmo,
      calorias:
        actual.tipo === 'pasos_diarios'
          ? Math.round(parseInt(editPasos || '0') * 0.04)
          : parseInt(editCalorias || '0'),
    };

    if (!actual.id) return;

    await editarActividad(user.uid, actual.id, nuevosDatos);
    cerrarModal();
    onRefrescar?.();
    onCambio?.();
  };

  const confirmarEliminacion = async () => {
    if (!user || indexEliminando === null) return;
    const actividad = actividades[indexEliminando];
    if (!actividad.id) return;

    await eliminarActividad(user.uid, actividad.id);
    setIndexEliminando(null);
    onRefrescar?.();
    onCambio?.();
  };

  if (!user) return null;

  const totalKcal = actividades.reduce((acc, a) => acc + (a.calorias || 0), 0);

  return (
    <div>
      {mostrarTitulo && (
        <h3 className="titulo-actividades-fecha">
          Actividades del {new Date(fecha).toLocaleDateString('es-ES')}
        </h3>
      )}

      {cargando ? (
        <p>Cargando actividades...</p>
      ) : actividades.length === 0 ? (
        <p>{mensajeVacio}</p>
      ) : modoResumen ? (
        <div className="resumen-nutricional-dashboard plano">
          {actividades.map((act, i) => (
            <div key={i} className="activity-line">
              <span className="activity-name">
                {iconosActividad[act.tipo] || <IconActivity size={18} />} {act.tipo.replace(/_/g, ' ')}
              </span>
              <span className="activity-kcal">{Math.round(act.calorias || 0)} kcal</span>
            </div>
          ))}
          <div className="total-kcal">
            Total kcal gastadas: <strong>{Math.round(totalKcal)} kcal</strong>
          </div>
        </div>
      ) : (
        <div className="activity-grid">
          {actividades.map((act, i) => (
            <div key={i} className="activity-card">
              <div className="activity-title">{act.tipo}</div>
              <div className="activity-line"><strong>{act.duracion}</strong> min</div>
              <div className="activity-line"><strong>{act.calorias}</strong> kcal</div>
              {act.ppm && <div className="activity-line">PPM: {act.ppm}</div>}
              {act.ritmo && <div className="activity-line">Ritmo: {act.ritmo}</div>}
              <div className="activity-actions">
                <button onClick={() => abrirModalEdicion(i)} className="btn-editar">
                  <Pencil size={16} />
                </button>
                <button onClick={() => setIndexEliminando(i)} className="btn-eliminar">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {indexEditando !== null && (
        <div className="modal-edicion">
          <div className="modal-contenido">
            <h3>Editar Actividad</h3>
            {actividades[indexEditando].tipo === 'pasos_diarios' ? (
              <>
                <label>👣 Pasos:</label>
                <input
                  type="number"
                  value={editPasos}
                  onChange={(e) => setEditPasos(e.target.value)}
                />
              </>
            ) : (
              <>
                <label>⏱️ Duración:</label>
                <input
                  type="number"
                  value={editDuracion}
                  onChange={(e) => setEditDuracion(e.target.value)}
                />
                <label>🏃 Ritmo:</label>
                <input
                  type="text"
                  value={editRitmo}
                  onChange={(e) => setEditRitmo(e.target.value)}
                />
                <label>🔥 Calorías:</label>
                <input
                  type="number"
                  value={editCalorias}
                  onChange={(e) => setEditCalorias(e.target.value)}
                />
              </>
            )}
            <div className="modal-botones">
              <button onClick={guardarCambios}>Guardar</button>
              <button onClick={cerrarModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {indexEliminando !== null && (
        <div className="modal-edicion">
          <div className="modal-contenido">
            <h3>Eliminar actividad</h3>
            <p>¿Deseas eliminar <strong>{actividades[indexEliminando].tipo}</strong>?</p>
            <div className="modal-botones">
              <button className="btn-confirmar" onClick={confirmarEliminacion}>Sí, eliminar</button>
              <button className="btn-cancelar" onClick={() => setIndexEliminando(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityList;
