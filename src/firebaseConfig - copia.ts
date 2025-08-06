// firebaseConfig.ts
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore" // ← Añadido

const firebaseConfig = {
  apiKey: "AIzaSyDEVegohHvnEcxM2fplKC8jXgkmboAxENg",
  authDomain: "vitago-app.firebaseapp.com",
  projectId: "vitago-app",
  storageBucket: "vitago-app.appspot.com",
  messagingSenderId: "859841307272",
  appId: "1:859841307272:web:0f37d8192247258a00b53d"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Exportar auth y db para usar en toda la app
const auth = getAuth(app)
const db = getFirestore(app) // ← Añadido

export { auth, db }


