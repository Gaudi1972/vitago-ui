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
  fecha: string;
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

  const manejarSeleccion = (alimento: Alimento) => {
    setSeleccionado(alimento);
    setBusqueda('');
    setResultados([]);
    if (alimento["Unidad habitual"] && alimento["gramos por unidad"]) {
      setModoUnidades(true);
      setUnidades(1);
      setGramos(alimento["gramos por unidad"] || 0);
    } else {
      setModoUnidades(false);
      setGramos(0);
    }
  };

  const handleFocusSelectAll = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
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
      setSeleccionado(null);
      setGramos(0);
      setUnidades(0);
      onGuardado();
      refrescarDatos();
      onCancel?.();
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar');
    }
  };

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
            {modoUnidades ? (
              <>
                <label htmlFor="unidades-input">
                  ¿Cuántas {seleccionado["Unidad habitual"]} de <strong>{seleccionado["Nombre del alimento"]}</strong> has consumido?
                  <br />
                  (1 {seleccionado["Unidad habitual"]} = {seleccionado["gramos por unidad"]} g)
                </label>
                <div className="input-gramos-acciones">
                  <input
                    id="unidades-input"
                    type="number"
                    step="0.1"
                    value={unidades}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setUnidades(val);
                      setGramos(val * (seleccionado["gramos por unidad"] || 0));
                    }}
                    onFocus={handleFocusSelectAll}
                    placeholder="Unidades"
                  />
                  <span>≈ {gramos} g</span>
                  <button
                    className="secundario"
                    onClick={() => setModoUnidades(false)}
                  >
                    Introducir en gramos
                  </button>
                  <button onClick={guardar}>Guardar</button>
                </div>
              </>
            ) : (
              <>
                <label htmlFor="gramos-input">
                  ¿Cuántos gramos de <strong>{seleccionado["Nombre del alimento"]}</strong> has consumido?
                </label>
                <div className="input-gramos-acciones">
                  <input
                    id="gramos-input"
                    type="number"
                    value={gramos}
                    onChange={(e) => setGramos(parseInt(e.target.value) || 0)}
                    onFocus={handleFocusSelectAll}
                    placeholder="Gramos"
                  />
                  {seleccionado["Unidad habitual"] && seleccionado["gramos por unidad"] && (
                    <button
                      className="secundario"
                      onClick={() => {
                        setModoUnidades(true);
                        setUnidades(gramos / (seleccionado["gramos por unidad"] || 1));
                      }}
                    >
                      Introducir en {seleccionado["Unidad habitual"]}
                    </button>
                  )}
                  <button onClick={guardar}>Guardar</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistroModernForm;
