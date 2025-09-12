import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  obtenerRegistrosPorFecha,
  eliminarAlimento,
  editarAlimento
} from '../Services/nutricionService';
import '../assets/Styles/ResumenNutricional.scss';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  fecha: string;
  claveActualizacion?: number;
  modoResumen?: boolean;
  onRefrescar?: () => void;
}

const iconosMomento: Record<string, string> = {
  'Desayuno': '🍳',
  'Comida': '🍽️',
  'Cena': '🌙',
  'Refrigerio (al despertar)': '🌅',
  'Refrigerio (tarde)': '☕',
};

const ordenMomentos = [
  'Refrigerio (al despertar)',
  'Desayuno',
  'Comida',
  'Refrigerio (tarde)',
  'Cena'
];

const ResumenNutricional: React.FC<Props> = ({
  fecha,
  claveActualizacion,
  modoResumen = false,
  onRefrescar
}) => {
  const { user, ultimaActualizacion, refrescarDatos } = useAuth();
  const [datos, setDatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [alimentoEditando, setAlimentoEditando] = useState<{
    momento: string;
    index: number;
    alimento: any;
  } | null>(null);
  const [nuevoGramos, setNuevoGramos] = useState<number>(0);

  const [alimentoAEliminar, setAlimentoAEliminar] = useState<{
    momento: string;
    index: number;
    nombre: string;
  } | null>(null);

  const cargarDatos = async () => {
    if (!user) return;
    setLoading(true);
    const registros = await obtenerRegistrosPorFecha(user.uid, fecha);
    setDatos(registros);
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, [user, fecha, claveActualizacion, ultimaActualizacion]); // 🔹 ahora escucha cambios globales

  const manejarEditar = (momento: string, index: number, alimento: any) => {
    setAlimentoEditando({ momento, index, alimento });
    setNuevoGramos(alimento.gramos);
    setMostrarModal(true);
  };

  const guardarEdicion = async () => {
    if (!user || !alimentoEditando) return;

    const { momento, index, alimento } = alimentoEditando;

    const nuevoAlimento = {
      ...alimento,
      gramos: nuevoGramos,
      calorias: alimento.calorias * (nuevoGramos / alimento.gramos)
    };

    await editarAlimento(user.uid, fecha, momento, index, nuevoAlimento);
    setMostrarModal(false);
    setAlimentoEditando(null);

    await cargarDatos();
    refrescarDatos(); // 🔹 notifica a toda la app
    onRefrescar?.();
  };

  const confirmarEliminar = async () => {
    if (!user || !alimentoAEliminar) return;

    try {
      await eliminarAlimento(user.uid, fecha, alimentoAEliminar.momento, alimentoAEliminar.index);
      setAlimentoAEliminar(null);

      await cargarDatos();
      refrescarDatos(); // 🔹 notifica a toda la app
      onRefrescar?.();
    } catch (error) {
      console.error('Error al eliminar alimento:', error);
    }
  };

  const registrosConContenido = datos
    .filter(reg => reg.alimentos && reg.alimentos.length > 0)
    .sort((a, b) => ordenMomentos.indexOf(a.momento) - ordenMomentos.indexOf(b.momento));

  const totalKcal = registrosConContenido.reduce((acc, reg) => acc + (reg.kcalTotal || 0), 0);

  if (loading) return <p className="resumen-loading">Cargando nutrición...</p>;
  if (registrosConContenido.length === 0) return <p className="resumen-vacio">No hay registros nutricionales para esta fecha.</p>;

  return (
    <div className="resumen-nutricional-dashboard plano">
      {registrosConContenido.map((reg, i) => (
        <div key={i} className="bloque-momento">
          <div className="resumen-linea">
            <span className="momento-nombre">
              {iconosMomento[reg.momento] || '🍴'} {reg.momento}
            </span>
            <span className="momento-kcal">{Math.round(reg.kcalTotal)} kcal</span>
          </div>

          {!modoResumen && reg.alimentos && (
            <ul className="detalle-alimentos">
              {reg.alimentos.map((a: any, j: number) => (
                <li key={j} className="alimento-linea">
                  <span className="alimento-nombre">
                    {a.nombre}
                    <span className="alimento-gramos"> {Math.round(a.gramos)} g</span>
                  </span>

                  <span className="alimento-kcal">{Math.round(a.calorias)} kcal</span>

                  <div className="acciones-alimento">
                    <button onClick={() => manejarEditar(reg.momento, j, a)} title="Editar">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => setAlimentoAEliminar({ momento: reg.momento, index: j, nombre: a.nombre })} title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <div className="total-kcal">
        Total kcal ingeridas: <strong>{Math.round(totalKcal)} kcal</strong>
      </div>

      {!modoResumen && mostrarModal && alimentoEditando && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h4>Editar gramos</h4>
            <p><strong>{alimentoEditando.alimento.nombre}</strong></p>
            <input
              type="number"
              value={nuevoGramos}
              onChange={(e) => setNuevoGramos(parseInt(e.target.value) || 0)}
              placeholder="Nuevo valor en gramos"
            />
            <button onClick={guardarEdicion}>Guardar</button>
            <button onClick={() => setMostrarModal(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {!modoResumen && alimentoAEliminar && (
        <div className="modal-overlay" onClick={() => setAlimentoAEliminar(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p>¿Eliminar <strong>{alimentoAEliminar.nombre}</strong>?</p>
            <button onClick={confirmarEliminar}>Sí, eliminar</button>
            <button onClick={() => setAlimentoAEliminar(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumenNutricional;




