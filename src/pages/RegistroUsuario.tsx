import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../firebaseConfig'
import { doc, setDoc } from 'firebase/firestore'
import 'react-datepicker/dist/react-datepicker.css'
import Select from 'react-select'
import backgroundImage from '../assets/Registro-bg.jpg';


const customStyles = {
  control: (base: any) => ({
    ...base,
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(6px)',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.4)',
    fontSize: 14,
    fontFamily: 'inherit',
    height: 44, // un poco más alto
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10
  }),
  indicatorsContainer: (base: any) => ({
    ...base,
    height: '100%',
    alignItems: 'center',
    display: 'flex'
  }),
  dropdownIndicator: (base: any) => ({
    ...base,
    padding: 4,
    color: '#fff'
  }),
  placeholder: (base: any) => ({
    ...base,
    color: '#fff'
  }),
  menu: (base: any) => ({
    ...base,
    zIndex: 9999,
    fontSize: 13
  })
}




const opcionesAltura = Array.from({ length: 81 }, (_, i) => {
  const cm = 140 + i
  return { value: `${cm}`, label: `${cm} cm` }
})

const opcionesPeso = Array.from({ length: 101 }, (_, i) => {
  const kg = 40 + i
  return { value: `${kg}`, label: `${kg} kg` }
})

const opcionesActividad = [
  { value: 'Sedentario', label: 'Sedentario - Trabajo de oficina, poca actividad diaria' },
  { value: 'Ligero', label: 'Ligero - Caminatas ocasionales, tareas domésticas suaves' },
  { value: 'Moderado', label: 'Moderado - Persona activa, camina bastante o tiene trabajo de pie' },
  { value: 'Intenso', label: 'Intenso - Trabajo físico, movimiento constante durante el día' },
  { value: 'Atleta', label: 'Atleta - Alta exigencia física diaria o entrenamiento profesional' }
]


const opcionesObjetivo = [
  { value: 'Mantener', label: 'Mantener peso' },
  { value: 'Bajar', label: 'Bajar grasa' },
  { value: 'Subir', label: 'Subir masa muscular' },
  { value: 'Recomposicion', label: 'Recomposición corporal' },
  { value: 'Rendimiento', label: 'Mejorar rendimiento' }
]

const RegistroUsuario: React.FC = () => {
    useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      @keyframes fadeInSlide {
        0% {
          opacity: 0;
          transform: translate(-50%, -40%);
        }
        100% {
          opacity: 1;
          transform: translate(-50%, -20%);
        }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

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
  const [mostrarPopup, setMostrarPopup] = useState(false)
  const [erroresPaso2, setErroresPaso2] = useState('')
  const [botonHabilitado, setBotonHabilitado] = useState(true)

  const esMovil = window.innerWidth <= 768

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

    if (camposCompletos && paso === 2) {
      const getCalculado = calcularGET()
      setForm((prev) => ({ ...prev, get: getCalculado }))
      setMostrarPopup(true)
      setBotonHabilitado(false)
      setTimeout(() => {
        setMostrarPopup(false)
        setBotonHabilitado(true)
      }, 6000)
    }
  }, [form.fechaNacimiento, form.sexo, form.altura, form.peso, form.actividad, paso])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    if (name === 'password' || name === 'confirmarPassword') {
      const nuevaPassword = name === 'password' ? value : form.password
      const nuevaConfirmar = name === 'confirmarPassword' ? value : form.confirmarPassword
      const nuevaValidacion = validarPassword(nuevaPassword)
      if (!nuevaValidacion && nuevaPassword === nuevaConfirmar) {
        setPasswordError('')
      }
    }
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

      if (!form.nombre || !form.apellidos || !form.usuario || !form.correo) {
        setPasswordError('Todos los campos son obligatorios')
        return
      }

      setPasswordError('')
      setPaso(2)
     
      return
    }

    const camposFaltantes = []
    if (!form.fechaNacimiento) camposFaltantes.push('Fecha de nacimiento')
    if (!form.sexo) camposFaltantes.push('Sexo')
    if (!form.altura) camposFaltantes.push('Altura')
    if (!form.peso) camposFaltantes.push('Peso')
    if (!form.actividad) camposFaltantes.push('Actividad')
    if (!form.objetivo) camposFaltantes.push('Objetivo')

    if (camposFaltantes.length > 0) {
      setErroresPaso2(`Faltan: ${camposFaltantes.join(', ')}`)
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
        alignItems: 'center',
        padding: 12
      }}
    >
      {mostrarPopup && (
  <div
    style={{
      position: 'fixed',
      top: '20%',
      left: '50%',
      transform: 'translate(-50%, -20%)',
      backgroundColor: '#fff',
      border: '2px solid #ff7f00',
      borderRadius: 12,
      padding: '24px 32px',
      zIndex: 9999,
      textAlign: 'center',
      boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
      animation: 'fadeInSlide 0.8s ease-out',
      maxWidth: 300,
      width: '80%'
    }}
  >
    <h3 style={{ marginBottom: 12, fontSize: 18, color: '#333' }}>
      Bienvenido a <strong style={{ color: '#ff7f00' }}>VitaGo</strong>, {form.nombre}
    </h3>
    <p style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>
      Tu <strong>GET</strong> (Gasto Energético Total) estimado es:
    </p>
    <p style={{ fontSize: 24, fontWeight: 'bold', color: '#ff7f00' }}>{form.get} kcal/día</p>
  </div>
)}


      <form
        onSubmit={handleSubmit}
        className="registro-form"
        style={{
          backdropFilter: 'blur(8px)',
          background: 'rgba(255,255,255,0.15)',
          padding: 10,
          borderRadius: 12,
          width: esMovil ? '90%' : 360,
          fontSize: 13,
          color: '#000'
        }}
      >
        <h2 style={{ marginBottom: 28, fontSize: 18, color: '#f5f5f5' }}>
          {paso === 1 ? 'Crear cuenta' : 'Datos físicos y objetivo'}
        </h2>

        {erroresPaso2 && (
          <div style={{ color: 'red', fontSize: 13, marginBottom: 8, textAlign: 'center' }}>
            {erroresPaso2}
          </div>
        )}

        {paso === 1 ? (
  <>
    <input
      type="text"
      name="nombre"
      placeholder="Nombre"
      value={form.nombre}
      onChange={handleChange}
      required
      style={{ marginBottom: 6, width: '100%' }}
    />
    <input
      type="text"
      name="apellidos"
      placeholder="Apellidos"
      value={form.apellidos}
      onChange={handleChange}
      required
      style={{ marginBottom: 6, width: '100%' }}
    />
    <input
      type="text"
      name="usuario"
      placeholder="Usuario"
      value={form.usuario}
      onChange={handleChange}
      required
      style={{ marginBottom: 6, width: '100%' }}
    />
    <input
      type="email"
      name="correo"
      placeholder="Correo electrónico"
      value={form.correo}
      onChange={handleChange}
      required
      style={{ marginBottom: 6, width: '100%' }}
    />
    <input
      type="password"
      name="password"
      placeholder="Contraseña"
      value={form.password}
      onChange={handleChange}
      required
      style={{ marginBottom: 6, width: '100%' }}
    />
    <input
      type="password"
      name="confirmarPassword"
      placeholder="Confirmar contraseña"
      value={form.confirmarPassword}
      onChange={handleChange}
      required
      style={{ marginBottom: 6, width: '100%' }}
    />
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        padding: '6px 10px',
        borderRadius: 6,
        fontSize: 11,
        marginBottom: 6,
        textAlign: 'left'
      }}
    >
      <span style={{ color: form.password.length >= 6 ? '#4CAF50' : '#ff4d4f', fontWeight: 'bold' }}>Mínimo 6 caracteres</span>{' '}
      <span style={{ color: /[A-Z]/.test(form.password) ? '#4CAF50' : '#ff4d4f', fontWeight: 'bold' }}>una mayúscula</span>{' '}
      <span style={{ color: /[0-9]/.test(form.password) ? '#4CAF50' : '#ff4d4f', fontWeight: 'bold' }}>un número</span>{' '}
      <span style={{ color: form.password === form.confirmarPassword && form.password !== '' ? '#4CAF50' : '#ff4d4f', fontWeight: 'bold' }}>y deben coincidir</span>
    </div>
  </>
) : (

          <>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  color: '#f5f5f5',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: 8
                }}
                htmlFor="fechaNacimiento"
                onClick={() => document.getElementById('fechaNacimiento')?.click()}
              >
                📅 Fecha de nacimiento:
                <span style={{ fontWeight: 'normal' }}>
                  {form.fechaNacimiento
                    ? form.fechaNacimiento.toLocaleDateString('es-ES')
                    : 'Seleccionar'}
                </span>
              </label>

              <input
                id="fechaNacimiento"
                type="date"
                value={form.fechaNacimiento ? form.fechaNacimiento.toISOString().split("T")[0] : ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    fechaNacimiento: e.target.value ? new Date(e.target.value) : null
                  }))
                }
                max={new Date().toISOString().split("T")[0]}
                style={{
                  visibility: 'hidden',
                  position: 'absolute',
                  pointerEvents: 'none',
                  height: 0,
                  width: 0
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 6 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f5f5f5' }}>
                <input type="radio" name="sexo" value="M" checked={form.sexo === 'M'} onChange={handleChange} /> Hombre
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f5f5f5' }}>
                <input type="radio" name="sexo" value="F" checked={form.sexo === 'F'} onChange={handleChange} /> Mujer
              </label>
            </div>

            <Select
              options={opcionesAltura}
              placeholder="Altura (cm)"
              value={opcionesAltura.find((o) => o.value === form.altura) || null}
              onChange={(selected) => setForm((prev) => ({ ...prev, altura: selected?.value || '' }))}
              styles={customStyles}
              isSearchable={false}
            />
            <div style={{ marginBottom: 6 }} />

            <Select
              options={opcionesPeso}
              placeholder="Peso (kg)"
              value={opcionesPeso.find((o) => o.value === form.peso) || null}
              onChange={(selected) => setForm((prev) => ({ ...prev, peso: selected?.value || '' }))}
              styles={customStyles}
              isSearchable={false}
            />
            <div style={{ marginBottom: 6 }} />

            <Select
              options={opcionesActividad}
              placeholder="Estilo de vida"
              value={opcionesActividad.find((o) => o.value === form.actividad) || null}
              onChange={(selected) => setForm((prev) => ({ ...prev, actividad: selected?.value || '' }))}
              styles={customStyles}
              isSearchable={false}
            />
            <div style={{ marginBottom: 6 }} />

            <Select
              options={opcionesObjetivo}
              placeholder="Objetivo"
              value={opcionesObjetivo.find((o) => o.value === form.objetivo) || null}
              onChange={(selected) => setForm((prev) => ({ ...prev, objetivo: selected?.value || '' }))}
              styles={customStyles}
              isSearchable={false}
            />

            <div style={{ marginBottom: 14 }} />

            <div style={{ fontSize: 13, marginBottom: 8, color: '#f5f5f5', textAlign: 'center' }}>
              GET estimado: {form.get > 0 ? `${form.get} kcal/día` : 'Completa los datos'}
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={paso === 2 && !botonHabilitado}
          style={{
            marginTop: 6,
            padding: '6px 12px',
            fontSize: 14,
            width: '100%',
            background: paso === 2 && !botonHabilitado ? '#ccc' : '#ff7f00',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: paso === 2 && !botonHabilitado ? 'not-allowed' : 'pointer'
          }}
        >
          {paso === 1 ? 'Siguiente' : 'Finalizar registro'}
        </button>
      </form>
    </div>
  )
}

export default RegistroUsuario
