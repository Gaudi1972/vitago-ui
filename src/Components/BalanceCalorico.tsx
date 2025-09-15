// src/Components/BalanceCalorico.tsx
import React from 'react';
import '../assets/Styles/BalanceCalorico.scss';
import { formatNumber } from '../utils/formatNumber';

interface Props {
  ingerido: number;
  quemado: number;
  get: number;
  objetivo: string;
}

const BalanceCalorico: React.FC<Props> = ({ ingerido, quemado, get, objetivo }) => {
  const totalGastado = quemado + get;
  const balance = ingerido - totalGastado;

  let estado = '';
  if (balance > 0) estado = 'Superávit';
  else if (balance < 0) estado = 'Déficit';
  else estado = 'Equilibrado';

  const evaluarColorBalance = (
    balance: number,
    objetivo: string,
    totalGasto: number
  ): 'verde' | 'ambar' | 'rojo' => {
    const margenVerde = totalGasto * 0.05;
    const margenAmbar = totalGasto * 0.1;

    switch (objetivo) {
      case 'Bajar':
        if (balance <= -margenAmbar) return 'verde';
        if (balance <= -margenVerde) return 'ambar';
        return 'rojo';
      case 'Subir':
        if (balance >= margenAmbar) return 'verde';
        if (balance >= margenVerde) return 'ambar';
        return 'rojo';
      case 'Mantener':
      case 'Recomposicion':
        if (Math.abs(balance) <= margenVerde) return 'verde';
        if (Math.abs(balance) <= margenAmbar) return 'ambar';
        return 'rojo';
      case 'Rendimiento':
        if (balance >= 0 && balance <= margenAmbar) return 'verde';
        if (balance < 0 && Math.abs(balance) <= margenAmbar) return 'ambar';
        return 'rojo';
      default:
        return 'rojo';
    }
  };

  const colorClase = evaluarColorBalance(balance, objetivo, totalGastado);

  return (
    <div className="balance-calorico">
      <div className="linea">
        <span className="label">Ingerido:</span>
        <span className="valor">{formatNumber(ingerido)} kcal</span>
      </div>
      <div className="linea">
        <span className="label">Quemado:</span>
        <span className="valor">{formatNumber(quemado)} kcal</span>
      </div>
      <div className="linea">
        <span className="label">GET:</span>
        <span className="valor">{formatNumber(get)} kcal</span>
      </div>
      <div className="linea">
        <span className="label">Total Gastado:</span>
        <span className="valor">{formatNumber(totalGastado)} kcal</span>
      </div>
      <div className="linea">
        <span className="label">Balance:</span>
        <span className={`valor balance-text-${colorClase}`}>
          {balance > 0 ? '+' : ''}
          {formatNumber(balance)} kcal
        </span>
      </div>
      <div className="linea">
        <span className="label">Estado:</span>
        <span className="valor">{estado}</span>
      </div>
    </div>
  );
};

export default BalanceCalorico;




