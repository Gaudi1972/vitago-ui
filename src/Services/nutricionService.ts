import { db } from '../firebaseConfig';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteField
} from 'firebase/firestore';

/**
 * ✅ GUARDAR un nuevo alimento en Firestore agrupado por día y momento
 * Estructura: usuarios/{uid}/registros/{fecha} → { Desayuno: {...}, Comida: {...} }
 */
export const guardarRegistroNutricional = async (
  uid: string,
  fecha: string,
  momento: string,
  nuevosAlimentos: any[],
  nuevasKcal: number
) => {
  try {
    const ref = doc(db, 'usuarios', uid, 'registros', fecha); // documento único por fecha
    const snap = await getDoc(ref);

    let datos = {};
    if (snap.exists()) datos = snap.data();

    // Recuperar alimentos ya existentes para ese momento
    const momentoActual = datos[momento] || { alimentos: [], kcalTotal: 0 };

    // Agregar los nuevos alimentos al array existente
    const alimentosActualizados = [...momentoActual.alimentos, ...nuevosAlimentos];

    // Recalcular el total de kcal del momento
    const kcalTotalActualizada = alimentosActualizados.reduce(
      (sum, a) => sum + a.calorias,
      0
    );

    // Guardar de forma consolidada, sin sobreescribir otros momentos
    await setDoc(ref, {
      [momento]: {
        alimentos: alimentosActualizados,
        kcalTotal: kcalTotalActualizada
      }
    }, { merge: true }); // ✅ importantísimo para no borrar otros momentos
  } catch (error: any) {
    console.error("🔥 Error guardando registro nutricional:", error.message || error);
    throw error;
  }
};

/**
 * ✅ OBTENER todos los registros de un día, agrupados por momento
 */
export const obtenerRegistrosPorFecha = async (uid: string, fecha: string) => {
  const ref = doc(db, 'usuarios', uid, 'registros', fecha);
  const snap = await getDoc(ref);

  if (!snap.exists()) return [];

  const data = snap.data();

  const registrosUnicos: {
    momento: string;
    alimentos: any[];
    kcalTotal: number;
  }[] = [];

  // Recorremos todos los momentos (Desayuno, Comida, etc.)
  for (const momento in data) {
    const datosMomento = data[momento];
    if (datosMomento?.alimentos?.length > 0) {
      registrosUnicos.push({
        momento,
        alimentos: datosMomento.alimentos,
        kcalTotal: datosMomento.kcalTotal || 0
      });
    }
  }

  return registrosUnicos;
};

/**
 * ✅ ELIMINAR alimento de un momento por índice
 * Si es el último alimento, se elimina el bloque del momento completo
 */
export const eliminarAlimento = async (uid: string, fecha: string, momento: string, index: number) => {
  const ref = doc(db, 'usuarios', uid, 'registros', fecha);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const momentoActual = data[momento];

  if (!momentoActual || !momentoActual.alimentos) return;

  const nuevosAlimentos = [...momentoActual.alimentos];
  nuevosAlimentos.splice(index, 1);

  if (nuevosAlimentos.length === 0) {
    // 🔥 No quedan alimentos → eliminamos ese momento del documento
    await updateDoc(ref, {
      [momento]: deleteField()
    });
  } else {
    const kcalTotal = nuevosAlimentos.reduce((sum, a) => sum + a.calorias, 0);
    await updateDoc(ref, {
      [momento]: {
        alimentos: nuevosAlimentos,
        kcalTotal
      }
    });
  }
};

/**
 * ✅ EDITAR un alimento dentro del array del momento, por índice
 */
export const editarAlimento = async (
  uid: string,
  fecha: string,
  momento: string,
  index: number,
  nuevo: { nombre: string; gramos: number; calorias: number }
) => {
  const ref = doc(db, 'usuarios', uid, 'registros', fecha);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data();
  const momentoActual = data[momento];

  if (!momentoActual || !momentoActual.alimentos) return;

  const nuevosAlimentos = [...momentoActual.alimentos];
  nuevosAlimentos[index] = nuevo;

  const kcalTotal = nuevosAlimentos.reduce((sum, a) => sum + a.calorias, 0);

  await updateDoc(ref, {
    [momento]: {
      alimentos: nuevosAlimentos,
      kcalTotal
    }
  });
};



