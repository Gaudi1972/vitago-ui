import React, { useEffect, useState } from 'react';
import {
  leerActividadesPorFecha,
  editarActividad,
  eliminarActividad,
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

interface Props {
  fecha: string;
  mostrarTitulo?: boolean;
  mensajeVacio?: string;
  refrescar?: boolean;
  modoResumen?: boolean;
  onRefrescar?: (mensajeOpcional?: string) => void;
  onCambio?: () => void;
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
  const [editPPM, setEditPPM] = useState('');   // 👈 nuevo estado

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
    setEditPPM(act.ppm?.toString() || '');  // 👈 inicializar PPM
  };

  const cerrarModal = () => {
    setIndexEditando(null);
    setEditDuracion('');
    setEditRitmo('');
    setEditCalorias('');
    setEditPasos('');
    setEditPPM('');
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
      ppm: parseInt(editPPM) || 0,   // 👈 guardar PPM
    };

    if (!actual.id) return;

    await editarActividad(user.uid, actual.id, nuevosDatos);
    cerrarModal();
    onRefrescar?.('✅ Actividad actualizada');
    onCambio?.();
  };

  const confirmarEliminacion = async () => {
    if (!user || indexEliminando === null) return;
    const actividad = actividades[indexEliminando];
    if (!actividad.id) return;

    await eliminarActividad(user.uid, actividad.id);
    setIndexEliminando(null);
    onRefrescar?.('✅ Actividad eliminada');
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
        // 🔹 RESUMEN PARA DASHBOARD
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
        // 🔹 DETALLE COMPLETO
        <div className="resumen-nutricional-dashboard actividad-modulo">
          {actividades.map((act, i) => (
            <div key={i} className="resumen-linea">
              {/* Cabecera: actividad + acciones + kcal */}
              <div className="resumen-header">
                <div className="resumen-nombre">
                  {iconosActividad[act.tipo] || <IconActivity size={18} />} {act.tipo.replace(/_/g, ' ')}
                  <div className="acciones">
                    <button onClick={() => abrirModalEdicion(i)} className="btn-editar">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => setIndexEliminando(i)} className="btn-eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <span className="resumen-kcal">{Math.round(act.calorias || 0)} kcal</span>
              </div>

              {/* Parámetros debajo */}
              <div className="resumen-detalle">
                {act.tipo === 'pasos_diarios' ? (
                  <p className="resumen-param">
                    Total pasos: {Math.round(act.calorias ? act.calorias / 0.04 : 0)}
                  </p>
                ) : (
                  <>
                    {act.duracion && <p className="resumen-param">Minutos: {act.duracion}</p>}
                    {act.ppm && <p className="resumen-param">PPM: {act.ppm}</p>}
                    {act.ritmo && <p className="resumen-param">Ritmo: {act.ritmo}</p>}
                  </>
                )}
              </div>
            </div>
          ))}

          <div className="total-kcal">
            Total kcal gastadas: <strong>{Math.round(totalKcal)} kcal</strong>
          </div>
        </div>
      )}

      {/* Modal edición */}
      {indexEditando !== null && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Editar actividad</h3>
            <p>{actividades[indexEditando].tipo.replace(/_/g, ' ')}</p>

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
                <label>⏱️ Duración (min):</label>
                <input
                  type="number"
                  value={editDuracion}
                  onChange={(e) => setEditDuracion(e.target.value)}
                />

                <label>❤️ PPM:</label>
                <input
                  type="number"
                  value={editPPM}
                  onChange={(e) => setEditPPM(e.target.value)}
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
              <button className="btn-guardar" onClick={guardarCambios}>Guardar</button>
              <button className="btn-cancelar" onClick={cerrarModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminación */}
      {indexEliminando !== null && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>¿Eliminar {actividades[indexEliminando].tipo.replace(/_/g, ' ')}?</h3>
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


