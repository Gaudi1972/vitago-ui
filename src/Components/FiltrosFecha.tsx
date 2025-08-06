import React from 'react';

type Rango = 'hoy' | 'ayer' | 'semana' | '7dias' | 'personalizado';

interface Props {
  rangoSeleccionado: Rango;
  setRangoSeleccionado: (r: Rango) => void;
  mostrarCalendario: boolean;
  setMostrarCalendario: (v: boolean) => void;
}

const FiltrosFecha: React.FC<Props> = ({
  rangoSeleccionado,
  setRangoSeleccionado,
  setMostrarCalendario,
}) => {
  const botones: { id: Rango; label: string }[] = [
    { id: 'hoy', label: '📆 Hoy' },
    { id: 'ayer', label: '📅 Ayer' },
    { id: 'semana', label: '📊 Semana' },
    { id: '7dias', label: '🔁 7 días' },
    { id: 'personalizado', label: '📅 Rango' },
  ];

  const handleSeleccion = (id: Rango) => {
    setRangoSeleccionado(id);
    setMostrarCalendario(id === 'personalizado');
  };

  return (
    <div className="filtros-periodo-scroll">
      {botones.map(btn => (
        <button
          key={btn.id}
          className={rangoSeleccionado === btn.id ? 'activo' : ''}
          onClick={() => handleSeleccion(btn.id)}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
};

export default FiltrosFecha;




