import React from 'react';
import '../assets/Styles/BalanceCalorico.scss';

interface Props {
  ingerido: number;
  quemado: number;
  get: number;
  objetivo: string; // 👈 añadimos esto
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
      <h3 className="titulo-tarjeta">🔥 Balance calórico</h3>
      <ul>
        <li><strong>Ingerido:</strong> {ingerido.toFixed(1)} kcal</li>
        <li><strong>Quemado:</strong> {quemado.toFixed(1)} kcal</li>
        <li><strong>GET:</strong> {get.toFixed(1)} kcal</li>
        <li><strong>Total Gastado:</strong> {totalGastado.toFixed(1)} kcal</li>
        <li>
            <strong>Balance:</strong>{' '}
            <span className={`balance-text-${colorClase}`}>
                {balance > 0 ? '+' : ''}
                {balance.toFixed(1)} kcal
            </span>
            </li>
        <li><strong>Estado:</strong> {estado}</li>
      </ul>
    </div>
  );
};

export default BalanceCalorico;
