// Login.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const userCredential = await signInWithEmailAndPassword(auth, usuario, password)
      const user = userCredential.user

      // Buscar datos del usuario en Firestore
      const docRef = doc(db, 'usuarios', user.uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const datosUsuario = docSnap.data()
        console.log("Datos del usuario:", datosUsuario)
        localStorage.setItem('usuarioActivo', JSON.stringify(datosUsuario))
        alert('Login exitoso')
        navigate('/welcome')
      } else {
        alert('Usuario autenticado pero no tiene datos en Firestore')
      }
    } catch (error: any) {
      console.error(error)
      alert('Usuario o contraseña incorrectos')
    }
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="form-title">Iniciar Sesión</h2>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
          className="form-input"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="form-input"
        />
        <button type="submit" className="form-button">Entrar</button>
      </form>
    </div>
  )
}

export default Login



