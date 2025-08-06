import React, { useState, useEffect } from 'react';
import alimentosData from '../data/alimentos.json';
import '../assets/Styles/RegistroFormModern.scss';
import { toast } from 'react-toastify';
import { guardarRegistroNutricional } from '../Services/nutricionService';
import { useAuth } from '../auth/AuthContext';

interface Props {
  momento: string;
  fecha: string;
  onGuardado: () => void;
  onCancel?: () => void; // ✅ nuevo
}

const RegistroModernForm: React.FC<Props> = ({ momento, fecha, onGuardado, onCancel }) => {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [seleccionado, setSeleccionado] = useState<any | null>(null);
  const [gramos, setGramos] = useState<number>(0);

  const { user } = useAuth();

  useEffect(() => {
    if (busqueda.length > 1) {
      const filtrados = alimentosData.filter((a) =>
        a["Nombre del alimento"].toLowerCase().includes(busqueda.toLowerCase())
      );
      setResultados(filtrados.slice(0, 8));
    } else {
      setResultados([]);
    }
  }, [busqueda]);

  const manejarSeleccion = (alimento: any) => {
    setSeleccionado(alimento);
    setBusqueda('');
    setResultados([]);
    setGramos(alimento["gramos por unidad"] || 0);
  };

  const calcularValores = (alimento: any, gramos: number) => {
  const factor = gramos / 100;
  return {
    nombre: alimento["Nombre del alimento"],
    gramos,
    calorias: alimento["Calorías por 100g"] * factor,
    nutrientes: {
    proteinas: (alimento["Proteínas (g)"] || 0) * factor,
    grasas: (alimento["Grasas (g)"] || 0) * factor,
    hidratos: (alimento["Hidratos de carbono (g)"] || alimento["Carbohidratos (g)"] || 0) * factor,
    fibra: (alimento["Fibra (g)"] || 0) * factor,
    calcio: (alimento["Calcio (mg)"] || 0) * factor,
    sodio: (alimento["Sodio (mg)"] || 0) * factor,
    potasio: (alimento["Potasio (mg)"] || 0) * factor,
    hierro: (alimento["Hierro (mg)"] || 0) * factor,
    azucares: (alimento["Azúcares (g)"] || 0) * factor,
    grasasSaturadas: (alimento["Grasas saturadas (g)"] || alimento["Grasa saturada (g)"] || 0) * factor,

  }

  };
};


  const guardar = async () => {
    if (!seleccionado || gramos <= 0 || !user) return;

    const datos = calcularValores(seleccionado, gramos);

    try {
      await guardarRegistroNutricional(user.uid, fecha, momento, [datos], datos.calorias);
      toast.success(`${datos.nombre} añadido`);
      setSeleccionado(null);
      setGramos(0);
      onGuardado();       // ✅ Refrescar resumen
      onCancel?.();       // ✅ Desmontar el formulario
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
              // autoFocus eliminado
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
            <label htmlFor="gramos-input">
              ¿Cuántos gramos de <strong>{seleccionado["Nombre del alimento"]}</strong> has consumido?
            </label>
            <div className="input-gramos-acciones">
              <input
                id="gramos-input"
                type="number"
                value={gramos}
                onChange={(e) => setGramos(parseInt(e.target.value) || 0)}
                placeholder="Gramos"
                aria-label="Cantidad en gramos"
              />
              <button onClick={guardar}>Guardar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistroModernForm;









