import '../assets/Styles/ActivityFormModern.scss';
import React, { useState, useRef, useEffect } from 'react';
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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale';

import { guardarActividad } from '../Firebase/firestoreService';
import { getAuth } from 'firebase/auth';
import '../assets/Styles/CarruselComun.scss';
import { useAuth } from '../auth/AuthContext';

interface Props {
  fecha: string;
  onFechaChange: (nuevaFecha: string) => void;
  onActividadGuardada: () => void;
}

const activityOptions = [
  { value: 'correr', label: 'Correr', icon: <IconActivity size={24} /> },
  { value: 'caminata', label: 'Caminata', icon: <IconWalk size={24} /> },
  { value: 'bici_btt', label: 'Bicicleta BTT', icon: <IconBikeOff size={24} /> },
  { value: 'bici_carretera', label: 'Bicicleta carretera', icon: <IconBike size={24} /> },
  { value: 'fuerza', label: 'Fuerza', icon: <IconWeight size={24} /> },
  { value: 'trail_running', label: 'Trail Running', icon: <IconMountain size={24} /> },
  { value: 'trekking', label: 'Trekking', icon: <IconMap size={24} /> },
  { value: 'pasos_diarios', label: 'Pasos diarios', icon: <IconShoe size={24} /> },
];

const MET_VALUES: Record<string, number> = {
  correr: 9,
  caminata: 3.5,
  bici_btt: 8,
  bici_carretera: 7.5,
  fuerza: 6,
  trail_running: 9.5,
  trekking: 7,
};

const ActivityFormModern: React.FC<Props> = ({ fecha, onFechaChange, onActividadGuardada }) => {
  const { perfil, refrescarDatos } = useAuth();
  const [actividad, setActividad] = useState<string | null>(null);

  const botonesRef = useRef<(HTMLDivElement | null)[]>([]);

  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [duracion, setDuracion] = useState('');
  const [ppm, setPPM] = useState('');
  const [ritmo, setRitmo] = useState('');
  const [pasos, setPasos] = useState('');
  const [calorias, setCalorias] = useState('');
  const [usarCaloriasManuales, setUsarCaloriasManuales] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const fechaTexto = new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    const btn = botonesRef.current[0];
    btn?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, []);

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
          kcal = ((-55.0969 + (0.6309 * ppmValor) + (0.1988 * pesoKg) + (0.2017 * edad)) / 4.184) * duracionMin;
        } else {
          kcal = ((-20.4022 + (0.4472 * ppmValor) - (0.1263 * pesoKg) + (0.074 * edad)) / 4.184) * duracionMin;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('No autenticado');
      if (!actividad) throw new Error('No se ha seleccionado ninguna actividad');

      await guardarActividad(user.uid, {
        tipo: actividad,
        duracion: parseInt(duracion),
        ppm: parseInt(ppm),
        ritmo,
        calorias: parseInt(calorias),
        fecha,
      });

      setMensaje('✅ Actividad registrada');
      onActividadGuardada?.();
      refrescarDatos();

      setActividad(null);
      setDuracion('');
      setPPM('');
      setRitmo('');
      setPasos('');
      setCalorias('');
      setUsarCaloriasManuales(false);

      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('❌ Error al guardar');
      console.error(error);
    }
  };

  return (
    <form className="actividad-form-modern" onSubmit={handleSubmit}>
      <div className="carousel-comidas">
        {activityOptions.map((opt, i) => (
          <div
            key={opt.value}
            ref={(el) => { botonesRef.current[i] = el; }}
            className={`card-comida ${actividad === opt.value ? 'activo' : ''}`}
            onClick={() => setActividad(opt.value)}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </div>
        ))}
      </div>

      <div className="selector-fecha">
        <div className="label-fecha" onClick={() => setMostrarCalendario(true)}>
          📅 {fechaTexto}
          <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>▼</span>
        </div>
      </div>

      {mostrarCalendario && (
        <div className="modal-overlay" onClick={() => setMostrarCalendario(false)}>
          <div className="modal-calendario" onClick={(e) => e.stopPropagation()}>
            <DatePicker
              selected={new Date(fecha)}
              onChange={(date: Date | null) => {
                if (!date) return;
                const nuevaFecha = date.toISOString().split('T')[0];
                onFechaChange(nuevaFecha);
                setMostrarCalendario(false);
              }}
              inline
              locale={es}
            />
          </div>
        </div>
      )}

      {actividad && (
        <div className="card-actividad">{/* 🔹 Nuevo wrapper tipo tarjeta */}
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
                  <input
                    type="number"
                    value={calorias}
                    readOnly
                  />
                </div>
              </>
            )}

            <button className="guardar-btn" type="submit">
              Guardar actividad
            </button>
          </section>
        </div>
      )}
    </form>
  );
};

export default ActivityFormModern;

