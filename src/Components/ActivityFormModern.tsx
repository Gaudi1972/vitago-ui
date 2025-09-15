// src/Components/ActivityFormModern.tsx
import '../assets/Styles/ActivityFormModern.scss';
import React, { useState, useEffect } from 'react';
import { guardarActividad, editarActividad, ActividadFisica } from '../Firebase/firestoreService';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../auth/AuthContext';

interface Props {
  fecha: string; // formato YYYY-MM-DD
  onFechaChange: (nuevaFecha: string) => void;
  onActividadGuardada: () => void;
  onCancel?: () => void;
  onFormStateChange?: (activo: boolean) => void;
  actividadInicial?: ActividadFisica | null;
  actividadSeleccionada?: string | null; // 👈 nueva prop
}

const MET_VALUES: Record<string, number> = {
  correr: 9,
  caminata: 3.5,
  bici_btt: 8,
  bici_carretera: 7.5,
  fuerza: 6,
  trail_running: 9.5,
  trekking: 7,
};

const ActivityFormModern: React.FC<Props> = ({
  fecha,
  onActividadGuardada,
  onCancel,
  onFormStateChange,
  actividadInicial,
  actividadSeleccionada, // 👈 recibimos prop
}) => {
  const { perfil, refrescarDatos } = useAuth();
  const [actividad, setActividad] = useState<string | null>(null);
  const [duracion, setDuracion] = useState('');
  const [ppm, setPPM] = useState('');
  const [ritmo, setRitmo] = useState('');
  const [pasos, setPasos] = useState('');
  const [calorias, setCalorias] = useState('');
  const [usarCaloriasManuales, setUsarCaloriasManuales] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // 🔹 Precargar datos si estamos editando
  useEffect(() => {
    if (actividadInicial) {
      setActividad(actividadInicial.tipo);
      setDuracion(actividadInicial.duracion?.toString() || '');
      setPPM(actividadInicial.ppm?.toString() || '');
      setRitmo(actividadInicial.ritmo || '');
      setPasos(
        actividadInicial.tipo === 'pasos_diarios'
          ? ((actividadInicial.calorias || 0) / 0.04).toFixed(0)
          : ''
      );
      setCalorias(actividadInicial.calorias?.toString() || '');
      setUsarCaloriasManuales(true);
      onFormStateChange?.(true);
    }
  }, [actividadInicial, onFormStateChange]);

  // 🔹 Inicializar cuando viene del carrusel
  useEffect(() => {
    if (actividadSeleccionada) {
      setActividad(actividadSeleccionada);
      onFormStateChange?.(true);
    }
  }, [actividadSeleccionada, onFormStateChange]);

  useEffect(() => {
    if (actividad === 'pasos_diarios' && pasos) {
      const kcal = Math.round(parseInt(pasos) * 0.04);
      setCalorias(kcal.toString());
    }
  }, [actividad, pasos]);

  useEffect(() => {
    if (!actividad || actividad === 'pasos_diarios' || usarCaloriasManuales) return;

    const duracionMin = parseFloat(duracion);
    const pesoKg = parseFloat(perfil?.peso || '');
    const edad = perfil?.fechaNacimiento
      ? new Date().getFullYear() - new Date(perfil.fechaNacimiento).getFullYear()
      : 40;
    const sexo = perfil?.sexo || 'M';
    const ppmValor = parseFloat(ppm);
    const MET = MET_VALUES[actividad];

    let kcal = 0;
    if (!isNaN(duracionMin) && !isNaN(pesoKg)) {
      if (!isNaN(ppmValor) && perfil?.sexo && perfil?.fechaNacimiento) {
        if (sexo === 'M') {
          kcal =
            ((-55.0969 + 0.6309 * ppmValor + 0.1988 * pesoKg + 0.2017 * edad) / 4.184) *
            duracionMin;
        } else {
          kcal =
            ((-20.4022 + 0.4472 * ppmValor - 0.1263 * pesoKg + 0.074 * edad) / 4.184) *
            duracionMin;
        }
      } else if (MET) {
        const duracionHoras = duracionMin / 60;
        kcal = MET * pesoKg * duracionHoras;
      }
      setCalorias(Math.round(kcal).toString());
    } else {
      setCalorias('');
    }
  }, [actividad, duracion, ppm, perfil, usarCaloriasManuales]);

  const limpiarFormulario = () => {
    setActividad(null);
    setDuracion('');
    setPPM('');
    setRitmo('');
    setPasos('');
    setCalorias('');
    setUsarCaloriasManuales(false);
    onFormStateChange?.(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('No autenticado');
      if (!actividad) throw new Error('No se ha seleccionado ninguna actividad');

      if (actividadInicial && actividadInicial.id) {
        await editarActividad(user.uid, actividadInicial.id, {
          tipo: actividad,
          duracion: parseInt(duracion),
          ppm: parseInt(ppm),
          ritmo,
          calorias: parseInt(calorias),
          fecha,
        });
        setMensaje('✅ Actividad actualizada');
      } else {
        await guardarActividad(user.uid, {
          tipo: actividad,
          duracion: parseInt(duracion),
          ppm: parseInt(ppm),
          ritmo,
          calorias: parseInt(calorias),
          fecha,
        });
        setMensaje('✅ Actividad registrada');
      }

      onActividadGuardada?.();
      refrescarDatos();

      limpiarFormulario();
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('❌ Error al guardar');
      console.error(error);
    }
  };

  return (
    <form className="actividad-form-modern" onSubmit={handleSubmit}>
      {actividad && (
        <div className="card-actividad">
          <section className="formulario-actividad">
            {actividad !== 'pasos_diarios' && (
              <>
                <label>⏱️ Duración (min):</label>
                <div className="input-icon-wrapper">
                  <input
                    type="number"
                    placeholder="Ej: 45"
                    value={duracion}
                    onChange={(e) => setDuracion(e.target.value)}
                  />
                </div>

                <label>❤️ PPM:</label>
                <div className="input-icon-wrapper">
                  <input
                    type="number"
                    placeholder="Ej: 145"
                    value={ppm}
                    onChange={(e) => setPPM(e.target.value)}
                  />
                </div>

                <label>🏃 Ritmo:</label>
                <div className="input-icon-wrapper">
                  <input
                    type="text"
                    placeholder="Ej: 5:30"
                    value={ritmo}
                    onChange={(e) => setRitmo(e.target.value)}
                  />
                </div>

                <label>🔥 Calorías:</label>
                <div className="input-icon-wrapper">
                  <input
                    type="number"
                    placeholder={usarCaloriasManuales ? 'Ej: 500' : 'Calculando...'}
                    value={calorias}
                    onChange={(e) => setCalorias(e.target.value)}
                    readOnly={!usarCaloriasManuales}
                  />
                </div>

                <div className="manual-calorias">
                  <label>
                    <input
                      type="checkbox"
                      checked={usarCaloriasManuales}
                      onChange={(e) => setUsarCaloriasManuales(e.target.checked)}
                    />
                    Quiero introducir las calorías manualmente
                  </label>
                </div>
              </>
            )}

            {actividad === 'pasos_diarios' && (
              <>
                <label>👣 Pasos:</label>
                <div className="input-icon-wrapper">
                  <input
                    type="number"
                    placeholder="Ej: 8000"
                    value={pasos}
                    onChange={(e) => setPasos(e.target.value)}
                  />
                </div>

                <label>🔥 Calorías:</label>
                <div className="input-icon-wrapper">
                  <input type="number" value={calorias} readOnly />
                </div>
              </>
            )}

            <div className="acciones">
              <button className="guardar-btn" type="submit">
                {actividadInicial ? 'Actualizar' : 'Guardar'}
              </button>
              {onCancel && (
                <button
                  type="button"
                  className="cancelar-btn"
                  onClick={() => { limpiarFormulario(); onCancel(); }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </form>
  );
};

export default ActivityFormModern;






