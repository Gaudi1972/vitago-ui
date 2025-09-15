// src/pages/Perfil.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import '../assets/Styles/RegistroFormModern.scss';
import type { PerfilUsuario } from '../auth/AuthContext';
import backgroundImage from '../assets/Registro-bg.jpg';

// 🔹 Estilos de react-select compactos
const customStyles = {
  control: (base: any) => ({
    ...base,
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(6px)',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.4)',
    fontSize: 13,
    height: 40,
    minHeight: 40,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 8,
  }),
  singleValue: (base: any) => ({ ...base, color: '#fff' }),
  input: (base: any) => ({ ...base, color: '#fff' }),
  placeholder: (base: any) => ({ ...base, color: '#fff' }),
  option: (base: any, state: any) => ({
    ...base,
    color: state.isSelected ? '#fff' : '#000',
    backgroundColor: state.isSelected ? '#ff7f00' : '#fff',
  }),
  dropdownIndicator: (base: any) => ({ ...base, padding: 4, color: '#fff' }),
  menu: (base: any) => ({ ...base, zIndex: 9999, fontSize: 13 }),
};

const opcionesAltura = Array.from({ length: 81 }, (_, i) => {
  const cm = 140 + i;
  return { value: `${cm}`, label: `${cm} cm` };
});
const opcionesPeso = Array.from({ length: 101 }, (_, i) => {
  const kg = 40 + i;
  return { value: `${kg}`, label: `${kg} kg` };
});
const opcionesActividad = [
  { value: 'Sedentario', label: 'Sedentario - Trabajo de oficina, poca actividad diaria' },
  { value: 'Ligero', label: 'Ligero - Caminatas ocasionales, tareas domésticas suaves' },
  { value: 'Moderado', label: 'Moderado - Persona activa, camina bastante o tiene trabajo de pie' },
  { value: 'Intenso', label: 'Intenso - Trabajo físico, movimiento constante durante el día' },
  { value: 'Atleta', label: 'Atleta - Alta exigencia física diaria o entrenamiento profesional' },
];
const opcionesObjetivo = [
  { value: 'Mantener', label: 'Mantener peso' },
  { value: 'Bajar', label: 'Bajar grasa' },
  { value: 'Subir', label: 'Subir masa muscular' },
  { value: 'Recomposicion', label: 'Recomposición corporal' },
  { value: 'Rendimiento', label: 'Mejorar rendimiento' },
];

const Perfil: React.FC = () => {
  const { user, perfil, refrescarDatos } = useAuth();
  const navigate = useNavigate();

  const [sexo, setSexo] = useState<PerfilUsuario['sexo']>(perfil?.sexo || 'M');
  const [peso, setPeso] = useState(perfil?.peso || '70');
  const [altura, setAltura] = useState(perfil?.altura || '170');
  const [fechaNacimiento, setFechaNacimiento] = useState(perfil?.fechaNacimiento || '');
  const [objetivo, setObjetivo] = useState<PerfilUsuario['objetivo']>(perfil?.objetivo || 'Mantener');
  const [actividad, setActividad] = useState<PerfilUsuario['actividad']>(perfil?.actividad || 'Moderado');
  const [getCalculado, setGetCalculado] = useState(perfil?.get || 0);
  const [showPopup, setShowPopup] = useState(false);

  // Estado de animación
  const [visible, setVisible] = useState(false);

  if (!user || !perfil) return <p>Cargando datos...</p>;

  useEffect(() => {
    if (perfil) {
      setSexo(perfil.sexo || 'M');
      setPeso(perfil.peso || '70');
      setAltura(perfil.altura || '170');
      setFechaNacimiento(perfil.fechaNacimiento || '');
      setObjetivo(perfil.objetivo || 'Mantener');
      setActividad(perfil.actividad || 'Moderado');
      setGetCalculado(perfil.get || 0);
    }
  }, [perfil]);

  useEffect(() => {
    setVisible(true); // fade-in al montar
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const calcularGET = (peso: number, altura: number, fechaNac: string, sexo: string, actividad: string) => {
    if (!fechaNac || !peso || !altura) return 0;
    const fechaNacDate = new Date(fechaNac);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacDate.getFullYear();
    const mes = hoy.getMonth() - fechaNacDate.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacDate.getDate())) {
      edad--;
    }
    const factorActividad: Record<string, number> = {
      Sedentario: 1.2, Ligero: 1.375, Moderado: 1.55, Intenso: 1.725, Atleta: 1.9,
    };
    const factor = factorActividad[actividad] || 1.2;
    const tmb = 10 * peso + 6.25 * altura - 5 * edad + (sexo === 'M' ? 5 : -161);
    return Math.round(tmb * factor);
  };

  useEffect(() => {
    const nuevoGET = calcularGET(Number(peso), Number(altura), fechaNacimiento, sexo, actividad);
    setGetCalculado(nuevoGET);
  }, [peso, altura, fechaNacimiento, sexo, actividad]);

  const handleGuardar = async () => {
    try {
      const nuevoGET = calcularGET(Number(peso), Number(altura), fechaNacimiento, sexo, actividad);
      const ref = doc(db, 'usuarios', user.uid);
      await updateDoc(ref, { sexo, peso, altura, fechaNacimiento, objetivo, actividad, get: nuevoGET });
      await refrescarDatos();
      setShowPopup(true);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert('❌ Error al actualizar perfil');
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => navigate(-1), 300); // esperar a que overlay + modal se desvanezcan
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
      }}
    >
      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          transition: 'opacity 0.3s ease',
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Tarjeta */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            padding: 16,
            borderRadius: 10,
            maxWidth: 340,
            width: '90%',
            color: '#fff',
            fontSize: 13,
            marginTop: '25vh', // ⬇️ más abajo
            transition: 'all 0.3s ease',
            transform: visible ? 'translateY(0)' : 'translateY(-20px)',
            opacity: visible ? 1 : 0,
          }}
        >
          <h2 style={{ marginBottom: 12, marginTop: 8, textAlign: 'center' }}>Mi Perfil</h2>

          {/* Sexo */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontWeight: 'bold', color: '#fff', display: 'block', marginBottom: 4 }}>
              Sexo:
            </label>
            <label style={{ marginRight: 8 }}>
              <input type="radio" value="M" checked={sexo === 'M'} onChange={() => setSexo('M')} /> Hombre
            </label>
            <label>
              <input type="radio" value="F" checked={sexo === 'F'} onChange={() => setSexo('F')} /> Mujer
            </label>
          </div>

          <hr style={{ border: '0.5px solid rgba(255,255,255,0.3)', margin: '10px 0' }} />

          {/* Fecha nacimiento */}
          <div style={{ marginBottom: 8 }}>
            <label
              style={{ fontWeight: 'bold', color: '#fff', display: 'block', marginBottom: 4, cursor: 'pointer' }}
              htmlFor="fechaNacimiento"
              onClick={() => document.getElementById('fechaNacimiento')?.click()}
            >
              📅 Fecha de nacimiento:{' '}
              <span style={{ fontWeight: 'normal' }}>
                {fechaNacimiento ? new Date(fechaNacimiento).toLocaleDateString('es-ES') : 'Seleccionar'}
              </span>
            </label>
            <input
              id="fechaNacimiento"
              type="date"
              value={fechaNacimiento ? fechaNacimiento.split('T')[0] : ''}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={{ visibility: 'hidden', position: 'absolute', height: 0, width: 0 }}
            />
          </div>

          <hr style={{ border: '0.5px solid rgba(255,255,255,0.3)', margin: '10px 0' }} />

          {/* Altura + Peso */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#fff', fontWeight: 'bold', marginBottom: 4, display: 'block' }}>
                Altura (cm):
              </label>
              <Select
                options={opcionesAltura}
                placeholder="Altura"
                value={opcionesAltura.find((o) => o.value === altura) || null}
                onChange={(selected) => setAltura(selected?.value || '170')}
                styles={customStyles}
                isSearchable={false}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#fff', fontWeight: 'bold', marginBottom: 4, display: 'block' }}>
                Peso (kg):
              </label>
              <Select
                options={opcionesPeso}
                placeholder="Peso"
                value={opcionesPeso.find((o) => o.value === peso) || null}
                onChange={(selected) => setPeso(selected?.value || '70')}
                styles={customStyles}
                isSearchable={false}
              />
            </div>
          </div>

          <hr style={{ border: '0.5px solid rgba(255,255,255,0.3)', margin: '10px 0' }} />

          {/* Actividad */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ color: '#fff', fontWeight: 'bold', marginBottom: 4, display: 'block' }}>
              Actividad:
            </label>
            <Select
              options={opcionesActividad}
              placeholder="Estilo de vida"
              value={opcionesActividad.find((o) => o.value === actividad) || null}
              onChange={(selected) => setActividad(selected?.value as PerfilUsuario['actividad'] || 'Moderado')}
              styles={customStyles}
              isSearchable={false}
            />
          </div>

          {/* Objetivo */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ color: '#fff', fontWeight: 'bold', marginBottom: 4, display: 'block' }}>
              Objetivo:
            </label>
            <Select
              options={opcionesObjetivo}
              placeholder="Objetivo"
              value={opcionesObjetivo.find((o) => o.value === objetivo) || null}
              onChange={(selected) => setObjetivo(selected?.value as PerfilUsuario['objetivo'] || 'Mantener')}
              styles={customStyles}
              isSearchable={false}
            />
          </div>

          {/* GET */}
          <p style={{ marginTop: 8, textAlign: 'center' }}>
            <strong>GET estimado:</strong>{' '}
            {getCalculado > 0 ? `${getCalculado} kcal/día` : 'Completa tus datos'}
          </p>

          <button
            onClick={handleGuardar}
            style={{
              marginTop: 12,
              padding: '8px 12px',
              background: '#ff7f00',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Guardar cambios
          </button>

          {/* Popup */}
          {showPopup && (
            <div className="popup-overlay">
              <div className="popup-contenido">
                <h3>✅ Perfil actualizado</h3>
                <p>Tu nuevo GET es <strong>{getCalculado} kcal/día</strong></p>
                <button className="boton-secundario" onClick={handleClose}>
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;










