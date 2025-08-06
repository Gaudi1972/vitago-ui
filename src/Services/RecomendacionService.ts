// src/services/recomendacionService.ts
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { leerActividadesPorFecha } from '../firebase/firestoreService';

// Recomendaciones por kg según objetivo y ejercicio (solo para proteínas de momento)
const proteinasPorKg: Record<string, { sinEjercicio: number; conEjercicio: number }> = {
  Mantener:     { sinEjercicio: 1.4, conEjercicio: 1.6 },
  Bajar:        { sinEjercicio: 1.6, conEjercicio: 2.0 },
  Subir:        { sinEjercicio: 1.8, conEjercicio: 2.2 },
  Recomposicion:{ sinEjercicio: 1.8, conEjercicio: 2.3 },
  Rendimiento:  { sinEjercicio: 2.0, conEjercicio: 2.5 },
};

// Otros nutrientes: valores fijos de OMS (pueden ajustarse si tú quieres)
const nutrientesFijos = {
  fibra: 25,
  hierro: 12,
  calcio: 900,
  sodio: 2000,
  potasio: 3500,
};

// Obtener si ha hecho ejercicio (basado en calorías > 100)
const haHechoEjercicio = (actividades: any[]) => {
  return actividades.some(a => a.calorias > 100);
};

export const calcularRecomendacionesNutricionales = async (uid: string, fecha: string) => {
  const fechaStr = fecha; // Ya debería venir en YYYY-MM-DD

  const usuarioRef = doc(db, 'usuarios', uid);
  const usuarioSnap = await getDoc(usuarioRef);
  if (!usuarioSnap.exists()) throw new Error('Usuario no encontrado');

  const userData = usuarioSnap.data();
  const peso = parseFloat(userData.peso); // kg
  const objetivo = userData.objetivo || 'Mantener';
  const get = userData.get || 2000;

  // Leer si ha hecho ejercicio hoy
  const actividades = await leerActividadesPorFecha(uid, fechaStr);
  const conEjercicio = haHechoEjercicio(actividades);

  // Proteínas por kg según objetivo y ejercicio
  const proteinaPorKg = proteinasPorKg[objetivo]?.[conEjercicio ? 'conEjercicio' : 'sinEjercicio'] || 1.5;
  const proteinas = Math.round(peso * proteinaPorKg);

  // Hidratos y grasas: usamos % del GET
  const hidratos = Math.round((0.5 * get) / 4); // 4 kcal por g
  const grasas = Math.round((0.3 * get) / 9);   // 9 kcal por g
  const grasasSaturadas = Math.round((0.1 * get) / 9); // max 10% saturadas
  const azucares = Math.round((0.1 * get) / 4); // max 10% en azúcares simples

  return {
    proteinas,
    hidratos,
    grasas,
    grasasSaturadas,
    azucares,
    fibra: nutrientesFijos.fibra,
    hierro: nutrientesFijos.hierro,
    calcio: nutrientesFijos.calcio,
    sodio: nutrientesFijos.sodio,
    potasio: nutrientesFijos.potasio,
    get
  };
};
