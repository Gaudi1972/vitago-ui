import React, { useState, useEffect } from 'react';
import alimentosDataJson from '../data/alimentos.json';
import '../assets/Styles/RegistroFormModern.scss';
import { toast } from 'react-toastify';
import { guardarRegistroNutricional } from '../Services/nutricionService';
import { useAuth } from '../auth/AuthContext';

interface Alimento {
  [key: string]: any;
  "Nombre del alimento": string;
  "Calorías por 100g"?: number;
  "Proteínas (g)"?: number;
  "Grasas (g)"?: number;
  "Hidratos de carbono (g)"?: number;
  "Carbohidratos (g)"?: number;
  "Fibra (g)"?: number;
  "Calcio (mg)"?: number;
  "Sodio (mg)"?: number;
  "Potasio (mg)"?: number;
  "Hierro (mg)"?: number;
  "Azúcares (g)"?: number;
  "Grasas saturadas (g)"?: number;
  "Grasa saturada (g)"?: number;
  "Unidad habitual"?: string;
  "gramos por unidad"?: number;
  "Grupo alimenticio"?: string;
}

const alimentosData: Alimento[] = alimentosDataJson as Alimento[];

interface Props {
  momento: string;
  fecha: string; // formato YYYY-MM-DD
  onGuardado: () => void;
  onCancel?: () => void;
}

const RegistroModernForm: React.FC<Props> = ({ momento, fecha, onGuardado, onCancel }) => {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<Alimento[]>([]);
  const [seleccionado, setSeleccionado] = useState<Alimento | null>(null);

  const [gramos, setGramos] = useState<number>(0);
  const [unidades, setUnidades] = useState<number>(0);
  const [modoUnidades, setModoUnidades] = useState<boolean>(false);

  const { user, refrescarDatos } = useAuth();

  /* =====================
     Búsqueda
  ===================== */
  useEffect(() => {
    if (busqueda.length > 1) {
      const filtrados = alimentosData.filter(
        (a) =>
          typeof a["Nombre del alimento"] === "string" &&
          a["Nombre del alimento"].toLowerCase().includes(busqueda.toLowerCase())
      );
      setResultados(filtrados.slice(0, 8));
    } else {
      setResultados([]);
    }
  }, [busqueda]);

  /* =====================
     Selección alimento
  ===================== */
  const manejarSeleccion = (alimento: Alimento) => {
    setSeleccionado(alimento);
    setBusqueda('');
    setResultados([]);

    if (alimento["Unidad habitual"] && alimento["gramos por unidad"]) {
      // 👉 Por defecto arranca en modo unidades
      setModoUnidades(true);
      setUnidades(1);
      setGramos(alimento["gramos por unidad"] || 0);
    } else {
      // 👉 Si no tiene unidad, se queda en gramos
      setModoUnidades(false);
      setUnidades(0);
      setGramos(0);
    }
  };

  /* =====================
     Cancelar / Guardar
  ===================== */
  const cancelar = () => {
    setSeleccionado(null);
    setGramos(0);
    setUnidades(0);
    setModoUnidades(false);
    onCancel?.();
  };

  const guardar = async () => {
    if (!seleccionado || gramos <= 0 || !user) return;

    const factor = gramos / 100;

    const datos = {
      ...seleccionado,
      nombre: seleccionado["Nombre del alimento"],
      gramos,
      unidades: modoUnidades ? unidades : null,
      calorias: (seleccionado["Calorías por 100g"] || 0) * factor,
      nutrientes: {
        proteinas: (seleccionado["Proteínas (g)"] || 0) * factor,
        grasas: (seleccionado["Grasas (g)"] || 0) * factor,
        hidratos:
          (seleccionado["Hidratos de carbono (g)"] ||
            seleccionado["Carbohidratos (g)"] ||
            0) * factor,
        fibra: (seleccionado["Fibra (g)"] || 0) * factor,
        calcio: (seleccionado["Calcio (mg)"] || 0) * factor,
        sodio: (seleccionado["Sodio (mg)"] || 0) * factor,
        potasio: (seleccionado["Potasio (mg)"] || 0) * factor,
        hierro: (seleccionado["Hierro (mg)"] || 0) * factor,
        azucares: (seleccionado["Azúcares (g)"] || 0) * factor,
        grasasSaturadas:
          (seleccionado["Grasas saturadas (g)"] ||
            seleccionado["Grasa saturada (g)"] ||
            0) * factor,
      },
    };

    try {
      await guardarRegistroNutricional(user.uid, fecha, momento, [datos], datos.calorias);
      toast.success(`${datos["Nombre del alimento"]} añadido`);
      cancelar();
      onGuardado();
      refrescarDatos();
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar');
    }
  };

  /* =====================
     Render
  ===================== */
  return (
    <div className="registro-form-modern">
      <div className="contenedor-principal">
        {!seleccionado ? (
          <>
            <input
              type="text"
              placeholder="Buscar alimento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="registro-form-input"
              aria-label="Buscar alimento"
            />
            {resultados.length > 0 && (
              <ul className="resultados">
                {resultados.map((a, i) => (
                  <li key={i} onClick={() => manejarSeleccion(a)}>
                    {a["Nombre del alimento"]} ({a["Calorías por 100g"]} kcal / 100g)
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="seleccionado-info">
            {/* ===== Botones Gramos / Unidad ===== */}
            {seleccionado["Unidad habitual"] && seleccionado["gramos por unidad"] && (
              <div className="unit-toggle">
  <button
    type="button"
    className={`seg-btn ${modoUnidades ? 'active' : ''}`}
    onClick={() => setModoUnidades(true)}
  >
    {seleccionado["Unidad habitual"]}
  </button>
  <button
    type="button"
    className={`seg-btn ${!modoUnidades ? 'active' : ''}`}
    onClick={() => setModoUnidades(false)}
  >
    Gramos
  </button>
</div>

            )}

            {modoUnidades ? (
              <>
                <label htmlFor="unidades-input">
                  ¿Cuántas {seleccionado["Unidad habitual"]} de <strong>{seleccionado["Nombre del alimento"]}</strong> has consumido?
                  <br />
                  (1 {seleccionado["Unidad habitual"]} = {seleccionado["gramos por unidad"]} g)
                </label>

                <div className="stepper">
                  <button
                    type="button"
                    onClick={() => {
                      const val = Math.max(0, unidades - 1);
                      setUnidades(val);
                      setGramos(val * (seleccionado["gramos por unidad"] || 0));
                    }}
                  >-</button>

                  <input
                    id="unidades-input"
                    type="number"
                    className="stepper-input"
                    value={unidades}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setUnidades(val);
                      setGramos(val * (seleccionado["gramos por unidad"] || 0));
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const val = unidades + 1;
                      setUnidades(val);
                      setGramos(val * (seleccionado["gramos por unidad"] || 0));
                    }}
                  >+</button>
                </div>
              </>
            ) : (
              <>
                <label htmlFor="gramos-input">
                  ¿Cuántos gramos de <strong>{seleccionado["Nombre del alimento"]}</strong> has consumido?
                </label>

                <div className="stepper">
                  <button
                    type="button"
                    onClick={() => setGramos(Math.max(0, gramos - 5))}
                  >-</button>

                  <input
                    id="gramos-input"
                    type="number"
                    className="stepper-input"
                    value={gramos}
                    onChange={(e) => setGramos(parseInt(e.target.value) || 0)}
                  />

                  <button
                    type="button"
                    onClick={() => setGramos(gramos + 5)}
                  >+</button>
                </div>
              </>
            )}

            <div className="acciones">
              <button className="guardar-btn" onClick={guardar} type="button">
                Guardar
              </button>
              <button className="cancelar-btn" onClick={cancelar} type="button">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistroModernForm;








