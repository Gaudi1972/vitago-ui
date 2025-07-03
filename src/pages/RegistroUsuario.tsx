import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../firebaseConfig'
import { doc, setDoc } from 'firebase/firestore'
import backgroundImage from '../assets/Registro-bg.jpg'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const RegistroUsuario: React.FC = () => {
  const [paso, setPaso] = useState(1)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    usuario: '',
    correo: '',
    password: '',
    confirmarPassword: '',
    fechaNacimiento: null as Date | null,
    sexo: '',
    altura: '',
    peso: '',
    actividad: '',
    objetivo: '',
    get: 0
  })

  const [passwordError, setPasswordError] = useState('')

  const validarPassword = (password: string) => {
    if (password.length < 6) return 'Debe tener al menos 6 caracteres.'
    if (!/[A-Z]/.test(password)) return 'Debe incluir una mayúscula.'
    if (!/[a-z]/.test(password)) return 'Debe incluir una minúscula.'
    if (!/[0-9]/.test(password)) return 'Debe incluir un número.'
    return ''
  }

  const actividadFactores: Record<string, number> = {
    Sedentario: 1.2,
    Ligero: 1.375,
    Moderado: 1.55,
    Intenso: 1.725,
    Atleta: 1.9
  }

  const calcularGET = () => {
    if (!form.fechaNacimiento) return 0
    const hoy = new Date()
    const edad = hoy.getFullYear() - form.fechaNacimiento.getFullYear()
    const altura = parseFloat(form.altura)
    const peso = parseFloat(form.peso)
    const factor = actividadFactores[form.actividad] || 1.2
    const tmb = 10 * peso + 6.25 * altura - 5 * edad + (form.sexo === 'M' ? 5 : -161)
    return Math.round(tmb * factor)
  }

  useEffect(() => {
    const camposCompletos =
      form.fechaNacimiento &&
      form.sexo &&
      form.altura &&
      form.peso &&
      form.actividad &&
      !isNaN(Number(form.altura)) &&
      !isNaN(Number(form.peso))

    if (camposCompletos) {
      const getCalculado = calcularGET()
      setForm((prev) => ({ ...prev, get: getCalculado }))
    }
  }, [form.fechaNacimiento, form.sexo, form.altura, form.peso, form.actividad])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (paso === 1) {
      const error = validarPassword(form.password)
      if (error) {
        setPasswordError(error)
        return
      }

      if (form.password !== form.confirmarPassword) {
        setPasswordError('Las contraseñas no coinciden')
        return
      }

      setPasswordError('')
      setPaso(2)
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.correo, form.password)
      const user = userCredential.user
      const { password, confirmarPassword, ...datosGuardados } = form
      await setDoc(doc(db, 'usuarios', user.uid), datosGuardados)
      navigate('/login')
    } catch (error: any) {
      console.error('Error al registrar usuario:', error)
      alert(error.message || 'Error al registrar. Intenta de nuevo.')
    }
  }

  const esMovil = window.innerWidth <= 768

  return (
    <div
      className="registro-container"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="registro-form"
        style={{
          backdropFilter: 'blur(10px)',
          background: 'rgba(255,255,255,0.2)',
          padding: 20,
          borderRadius: 10,
          width: esMovil ? '90%' : 400
        }}
      >
        <h2 className="form-title" style={{ marginBottom: 15 }}>
          {paso === 1 ? 'Crear cuenta' : 'Datos físicos y objetivo'}
        </h2>

        {paso === 1 ? (
          <>
            <div style={{ marginBottom: 10 }}>
              <label>Nombre:</label>
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Apellidos:</label>
              <input type="text" name="apellidos" value={form.apellidos} onChange={handleChange} required />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Usuario:</label>
              <input type="text" name="usuario" value={form.usuario} onChange={handleChange} required />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Correo electrónico:</label>
              <input type="email" name="correo" value={form.correo} onChange={handleChange} required />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Contraseña:</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Confirmar contraseña:</label>
              <input type="password" name="confirmarPassword" value={form.confirmarPassword} onChange={handleChange} required />
            </div>

            {passwordError && (
              <div style={{ color: 'red', marginBottom: 10 }}>{passwordError}</div>
            )}
          </>
        ) : (
          <>
            <div style={{ marginBottom: 10 }}>
              <label>Fecha de nacimiento:</label>
              {esMovil ? (
                <input
                  type="date"
                  name="fechaNacimiento"
                  onChange={(e) => setForm({ ...form, fechaNacimiento: new Date(e.target.value) })}
                  required
                />
              ) : (
                <DatePicker
                  selected={form.fechaNacimiento}
                  onChange={(date: Date) => setForm({ ...form, fechaNacimiento: date })}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Selecciona tu fecha de nacimiento"
                  className="form-input"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              )}
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>
                <input type="radio" name="sexo" value="M" checked={form.sexo === 'M'} onChange={handleChange} /> Hombre
              </label>
              <label style={{ marginLeft: 10 }}>
                <input type="radio" name="sexo" value="F" checked={form.sexo === 'F'} onChange={handleChange} /> Mujer
              </label>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Altura:</label>
              <select name="altura" value={form.altura} onChange={handleChange} required>
                <option value="">Selecciona tu altura</option>
                {Array.from({ length: 81 }, (_, i) => 140 + i).map((cm) => (
                  <option key={cm} value={cm}>{cm} cm</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Peso:</label>
              <select name="peso" value={form.peso} onChange={handleChange} required>
                <option value="">Selecciona tu peso</option>
                {Array.from({ length: 101 }, (_, i) => 40 + i).map((kg) => (
                  <option key={kg} value={kg}>{kg} kg</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 10 }}>
              <select name="actividad" value={form.actividad} onChange={handleChange} required>
                <option value="">Estilo de vida</option>
                <option value="Sedentario">Sedentario – Trabajo sentado</option>
                <option value="Ligero">Ligero – Caminatas cortas</option>
                <option value="Moderado">Moderado – Movimiento frecuente</option>
                <option value="Intenso">Intenso – Trabajo activo</option>
                <option value="Atleta">Atleta – Muy activo</option>
              </select>
            </div>

            <div style={{ marginBottom: 10 }}>
              <select name="objetivo" value={form.objetivo} onChange={handleChange} required>
                <option value="">Objetivo</option>
                <option value="Mantener">Mantener peso</option>
                <option value="Bajar">Bajar grasa</option>
                <option value="Subir">Subir masa muscular</option>
                <option value="Recomposicion">Recomposición corporal</option>
                <option value="Rendimiento">Mejorar rendimiento</option>
              </select>
            </div>

            <div style={{ marginBottom: 10 }}>
              GET estimado: {form.get > 0 ? `${form.get} kcal/día` : 'Completa los datos para calcular GET'}
            </div>
          </>
        )}

        <button type="submit" className="form-button" style={{ marginTop: 10 }}>
          {paso === 1 ? 'Siguiente' : 'Finalizar registro'}
        </button>
      </form>
    </div>
  )
}

export default RegistroUsuario



