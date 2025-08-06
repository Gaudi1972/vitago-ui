// Services/alimentosService.ts
import { obtenerRegistrosPorFecha } from './nutricionService';

/**
 * Devuelve un listado de alimentos que más contribuyen al exceso de un nutriente.
 * Solo se considera si hay exceso (desviación positiva y color rojo).
 */
export const obtenerAlimentosQueContribuyenAlExceso = async (
  uid: string,
  fechas: string[],
  nutriente: string
): Promise<{ nombre: string; valor: number }[]> => {
  const registrosTotales = [];

  for (const fecha of fechas) {
    const registros = await obtenerRegistrosPorFecha(uid, fecha);
    registros.forEach(r => registrosTotales.push(...(r.alimentos || [])));
  }

  // Sumar todos los alimentos que contengan ese nutriente
  const contribuciones = registrosTotales
    .map(al => ({
      nombre: al.nombre,
      valor: al.nutrientes?.[nutriente.toLowerCase()] || 0
    }))
    .filter(a => a.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  return contribuciones;
};
