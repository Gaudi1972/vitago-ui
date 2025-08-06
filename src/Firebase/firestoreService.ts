// src/firebase/firestoreService.ts
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface ActividadFisica {
  id?: string; // 🔹 Necesario para edición y borrado
  tipo: string;
  duracion: number; // en minutos
  calorias: number;
  ppm: number;
  ritmo: string; // ej. "5:30"
  fecha: string; // formato YYYY-MM-DD
}

// Guardar actividad física
export const guardarActividad = async (uid: string, actividad: ActividadFisica) => {
  try {
    await addDoc(collection(db, `usuarios/${uid}/actividades`), {
      ...actividad,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('❌ Error al guardar actividad:', error);
    throw error;
  }
};

// Leer actividades de una fecha concreta
export const leerActividadesPorFecha = async (uid: string, fecha: string): Promise<ActividadFisica[]> => {
  try {
    const ref = collection(db, `usuarios/${uid}/actividades`);
    const q = query(ref, where("fecha", "==", fecha));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(docSnap => ({
      id: docSnap.id, // ✅ Añadimos el id del documento
      ...docSnap.data()
    })) as ActividadFisica[];
  } catch (error) {
    console.error('❌ Error al leer actividades:', error);
    return [];
  }
};

// Editar una actividad existente
export const editarActividad = async (uid: string, actividadId: string, nuevosDatos: Partial<ActividadFisica>) => {
  try {
    const docRef = doc(db, `usuarios/${uid}/actividades/${actividadId}`);
    await updateDoc(docRef, {
      ...nuevosDatos,
      timestamp: Timestamp.now(), // opcional: actualizar timestamp
    });
  } catch (error) {
    console.error('❌ Error al editar actividad:', error);
    throw error;
  }
};

// Eliminar una actividad
export const eliminarActividad = async (uid: string, actividadId: string) => {
  try {
    const docRef = doc(db, `usuarios/${uid}/actividades/${actividadId}`);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('❌ Error al eliminar actividad:', error);
    throw error;
  }
};

