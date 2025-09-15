// src/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// 🔹 Exportamos la interfaz para poder usarla en otros ficheros (ej. Perfil.tsx)
export interface PerfilUsuario {
  sexo: 'M' | 'F';
  peso: string;
  altura: string;
  fechaNacimiento: string;
  actividad: 'Sedentario' | 'Ligero' | 'Moderado' | 'Intenso' | 'Atleta';
  objetivo: 'Bajar' | 'Subir' | 'Mantener' | 'Recomposicion' | 'Rendimiento';
  get: number;
}

interface AuthContextType {
  user: User | null;
  perfil: PerfilUsuario | null;
  logout: () => Promise<void>;
  ultimaActualizacion: number;
  refrescarDatos: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  perfil: null,
  logout: async () => {},
  ultimaActualizacion: Date.now(),
  refrescarDatos: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(Date.now());

  // 🔹 Función para cargar o refrescar datos de Firestore
  const cargarPerfil = async (uid: string) => {
    try {
      const docRef = doc(db, "usuarios", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();

        // 🔹 Valores por defecto si faltan
        const updates: any = {};
        if (!data.altura) updates.altura = "170";
        if (!data.actividad) updates.actividad = "Moderado";
        if (!data.objetivo) updates.objetivo = "Mantener";
        if (!data.get) updates.get = 2000;

        if (Object.keys(updates).length > 0) {
          await updateDoc(docRef, updates);
        }

        setPerfil({
          sexo: data.sexo,
          peso: data.peso,
          altura: data.altura || "170",
          fechaNacimiento: data.fechaNacimiento?.toDate?.()
            ? data.fechaNacimiento.toDate().toISOString()
            : data.fechaNacimiento,
          actividad: data.actividad || "Moderado",
          objetivo: data.objetivo || "Mantener",
          get: data.get || 2000,
        });
        setUltimaActualizacion(Date.now());
      } else {
        setPerfil(null);
      }
    } catch (error) {
      console.error("Error cargando perfil:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await cargarPerfil(user.uid);
      } else {
        setPerfil(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // 🔹 Refrescar datos de perfil desde cualquier parte
  const refrescarDatos = async () => {
    if (user) {
      await cargarPerfil(user.uid);
    }
  };

  return (
    <AuthContext.Provider value={{ user, perfil, logout, ultimaActualizacion, refrescarDatos }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;






