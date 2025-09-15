// src/Components/ResumenNutricional.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../auth/AuthContext';
import {
  obtenerRegistrosPorFecha,
  eliminarAlimento,
  editarAlimento
} from '../Services/nutricionService';
import '../assets/Styles/ResumenNutricional.scss';
import { Pencil, Trash2 } from 'lucide-react';
import { formatNumber } from '../utils/formatNumber';

interface Props {
  fechaInicio: string;
  fechaFin: string;
  claveActualizacion?: number;
  modoResumen?: boolean;
  onRefrescar?: () => void;
  onTotalesPeriodo?: (totales: Record<string, number>) => void;
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
  fechaInicio,
  fechaFin,
  claveActualizacion,
  modoResumen = false,
  onRefrescar,
  onTotalesPeriodo
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
  const [modoCantidad, setModoCantidad] = useState<"gramos" | "unidad">("gramos");

  const [alimentoAEliminar, setAlimentoAEliminar] = useState<{
    momento: string;
    index: number;
    nombre: string;
  } | null>(null);

  // 🔹 Generar fechas entre inicio y fin
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

  const cargarDatos = async () => {
    if (!user) return;
    setLoading(true);

    const fechas = generarFechas(fechaInicio, fechaFin);

    const acumulados: Record<
      string,
      { alimentos: any[]; kcalTotal: number; nutrientes: Record<string, number> }
    > = {};

    const totalesPeriodo: Record<string, number> = {
      proteinas: 0,
      hidratos: 0,
      grasas: 0,
      saturadas: 0,
      azucares: 0,
      fibra: 0,
      hierro: 0,
      calcio: 0,
      sodio: 0,
      potasio: 0,
    };

    for (const f of fechas) {
      const registros = await obtenerRegistrosPorFecha(user.uid, f);

      registros.forEach(reg => {
        if (!acumulados[reg.momento]) {
          acumulados[reg.momento] = {
            alimentos: [],
            kcalTotal: 0,
            nutrientes: {
              proteinas: 0,
              hidratos: 0,
              grasas: 0,
              saturadas: 0,
              azucares: 0,
              fibra: 0,
              hierro: 0,
              calcio: 0,
              sodio: 0,
              potasio: 0,
            }
          };
        }

        acumulados[reg.momento].kcalTotal += reg.kcalTotal || 0;

        if (reg.alimentos && reg.alimentos.length > 0) {
          acumulados[reg.momento].alimentos.push(...reg.alimentos);

          reg.alimentos.forEach((al: any) => {
            if (al.nutrientes) {
              Object.keys(totalesPeriodo).forEach(k => {
                const clave = k as keyof typeof totalesPeriodo;
                acumulados[reg.momento].nutrientes[clave] += al.nutrientes[clave] || 0;
              });
            }
          });
        }
      });
    }

    Object.values(acumulados).forEach(m => {
      Object.keys(totalesPeriodo).forEach(k => {
        const clave = k as keyof typeof totalesPeriodo;
        totalesPeriodo[clave] += m.nutrientes[clave];
      });
    });

    const datosAgrupados = Object.keys(acumulados).map(momento => ({
      momento,
      alimentos: acumulados[momento].alimentos,
      kcalTotal: acumulados[momento].kcalTotal,
      nutrientes: acumulados[momento].nutrientes,
    }));

    datosAgrupados.sort(
      (a, b) => ordenMomentos.indexOf(a.momento) - ordenMomentos.indexOf(b.momento)
    );

    setDatos(datosAgrupados);
    setLoading(false);

    if (onTotalesPeriodo) {
      onTotalesPeriodo(totalesPeriodo);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [user, fechaInicio, fechaFin, claveActualizacion, ultimaActualizacion]);

  const manejarEditar = (momento: string, index: number, alimento: any) => {
    setAlimentoEditando({ momento, index, alimento });
    setNuevoGramos(alimento.gramos);
    setModoCantidad("gramos");
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

    await editarAlimento(user.uid, fechaInicio, momento, index, nuevoAlimento);

    setMostrarModal(false);
    setAlimentoEditando(null);

    await cargarDatos();
    refrescarDatos();
    onRefrescar?.();
  };

  const confirmarEliminar = async () => {
    if (!user || !alimentoAEliminar) return;

    try {
      await eliminarAlimento(user.uid, fechaInicio, alimentoAEliminar.momento, alimentoAEliminar.index);
      setAlimentoAEliminar(null);

      await cargarDatos();
      refrescarDatos();
      onRefrescar?.();
    } catch (error) {
      console.error('Error al eliminar alimento:', error);
    }
  };

  useEffect(() => {
    const abierto = !!alimentoAEliminar || (mostrarModal && alimentoEditando);
    if (abierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mostrarModal, alimentoEditando, alimentoAEliminar]);

  const totalKcal = datos.reduce((acc, reg) => acc + (reg.kcalTotal || 0), 0);

  if (loading) return <p className="resumen-loading">Cargando nutrición...</p>;
  if (datos.length === 0)
    return <p className="resumen-vacio">No hay registros nutricionales para este periodo.</p>;

  return (
    <div className="resumen-nutricional-dashboard plano">
      {datos.map((reg, i) => (
        <div key={i} className="bloque-momento">
          <div className="resumen-linea">
            <span className="momento-nombre">
              {iconosMomento[reg.momento] || '🍴'} {reg.momento}
            </span>
            <span className="momento-kcal">
              {formatNumber(reg.kcalTotal || 0)} kcal
            </span>
          </div>

          {!modoResumen && reg.alimentos && (
            <ul className="detalle-alimentos">
              {reg.alimentos.map((a: any, j: number) => (
                <li key={j} className="alimento-linea">
                  <span className="alimento-nombre">
                    {a.nombre}
                    <span className="alimento-gramos">
                      {' '}{formatNumber(a.gramos || 0)} g
                    </span>
                  </span>

                  <span className="alimento-kcal">
                    {formatNumber(a.calorias || 0)} kcal
                  </span>

                  <div className="acciones-alimento">
                    <button onClick={() => manejarEditar(reg.momento, j, a)} title="Editar">
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setAlimentoAEliminar({ momento: reg.momento, index: j, nombre: a.nombre })
                      }
                      title="Eliminar"
                    >
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
        <div className="label">Total kcal ingeridas en el periodo</div>
        <div className="value"><strong>{formatNumber(totalKcal)} kcal</strong></div>
      </div>

      {/* Modal de edición */}
      {!modoResumen && mostrarModal && alimentoEditando &&
        ReactDOM.createPortal(
          <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h4>Editar cantidad</h4>
              <p><strong>{alimentoEditando.alimento.nombre}</strong></p>

              {/* Botones de modo */}
              <div className="modo-selector">
                <button
                  className={modoCantidad === "gramos" ? "activo" : ""}
                  onClick={() => setModoCantidad("gramos")}
                >
                  Gramos
                </button>
                {alimentoEditando.alimento["Unidad habitual"] && alimentoEditando.alimento["gramos por unidad"] && (
                  <button
                    className={modoCantidad === "unidad" ? "activo" : ""}
                    onClick={() => setModoCantidad("unidad")}
                  >
                    {alimentoEditando.alimento["Unidad habitual"]}
                  </button>
                )}
              </div>

              {/* Texto + input dinámico */}
              {modoCantidad === "gramos" ? (
                <>
                  <p>¿Cuántos gramos de {alimentoEditando.alimento.nombre} has consumido?</p>
                  <input
                    type="number"
                    value={nuevoGramos}
                    onChange={(e) => setNuevoGramos(parseInt(e.target.value) || 0)}
                    placeholder="Ej: 100"
                  />
                </>
              ) : (
                <>
                  <p>
                    ¿Cuántas {alimentoEditando.alimento["Unidad habitual"]} de {alimentoEditando.alimento.nombre} has consumido?
                  </p>
                  <input
                    type="number"
                    onChange={(e) => {
                      const unidades = parseInt(e.target.value) || 0;
                      const gramosPorUnidad = alimentoEditando.alimento["gramos por unidad"];
                      setNuevoGramos(unidades * gramosPorUnidad);
                    }}
                    placeholder="Ej: 2"
                  />
                  <small>(1 {alimentoEditando.alimento["Unidad habitual"]} = {alimentoEditando.alimento["gramos por unidad"]} g)</small>
                </>
              )}

              <div className="acciones-modal">
                <button onClick={guardarEdicion}>Guardar</button>
                <button onClick={() => setMostrarModal(false)}>Cancelar</button>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      {/* Modal de eliminación */}
      {!modoResumen && alimentoAEliminar &&
        ReactDOM.createPortal(
          <div className="modal-overlay" onClick={() => setAlimentoAEliminar(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <p>¿Eliminar <strong>{alimentoAEliminar.nombre}</strong>?</p>
              <div className="acciones-modal">
                <button onClick={confirmarEliminar}>Sí, eliminar</button>
                <button onClick={() => setAlimentoAEliminar(null)}>Cancelar</button>
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </div>
  );
};

export default ResumenNutricional;









