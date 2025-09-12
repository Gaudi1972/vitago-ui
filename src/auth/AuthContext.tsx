// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

interface PerfilUsuario {
  sexo: 'M' | 'F';
  peso: string;
  fechaNacimiento: string;
  objetivo?: 'Bajar' | 'Subir' | 'Mantener' | 'Recomposicion' | 'Rendimiento';
}

interface AuthContextType {
  user: User | null;
  perfil: PerfilUsuario | null;
  logout: () => Promise<void>;
  ultimaActualizacion: number;           // 🔹 nuevo
  refrescarDatos: () => void;            // 🔹 nuevo
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  perfil: null,
  logout: async () => {},
  ultimaActualizacion: Date.now(),
  refrescarDatos: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(Date.now()); // 🔹 nuevo

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'usuarios', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPerfil({
            sexo: data.sexo,
            peso: data.peso,
            fechaNacimiento: data.fechaNacimiento?.toDate?.()
              ? data.fechaNacimiento.toDate().toISOString()
              : data.fechaNacimiento,
            objetivo: data.objetivo
          });
        } else {
          setPerfil(null);
        }
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

  const refrescarDatos = () => setUltimaActualizacion(Date.now()); // 🔹 nuevo

  return (
    <AuthContext.Provider value={{ user, perfil, logout, ultimaActualizacion, refrescarDatos }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;



