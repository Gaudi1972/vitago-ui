// src/context/FechaContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { Range } from 'react-date-range';

type Rango = 'hoy' | 'ayer' | 'semana' | '7dias' | 'personalizado';

interface FechaContextProps {
  rangoSeleccionado: Rango;
  setRangoSeleccionado: (r: Rango) => void;
  rangoFechas: Range[];
  setRangoFechas: (r: Range[]) => void;
}

const FechaContext = createContext<FechaContextProps | undefined>(undefined);

export const FechaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rangoSeleccionado, setRangoSeleccionado] = useState<Rango>('hoy');
  const [rangoFechas, setRangoFechas] = useState<Range[]>([
    { startDate: new Date(), endDate: new Date(), key: 'selection' }
  ]);

  return (
    <FechaContext.Provider value={{ rangoSeleccionado, setRangoSeleccionado, rangoFechas, setRangoFechas }}>
      {children}
    </FechaContext.Provider>
  );
};

export const useFecha = () => {
  const ctx = useContext(FechaContext);
  if (!ctx) throw new Error('useFecha debe usarse dentro de FechaProvider');
  return ctx;
};
