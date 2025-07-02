// RegistroUsuario.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../firebaseConfig'
import { doc, setDoc } from 'firebase/firestore'
import backgroundImage from '../assets/Registro-bg.jpg'

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
    nacimiento: { dia: '', mes: '', anio: '' },
    sexo: '',
    altura: '',
    peso: '',
    actividad: '',
    objetivo: '',
    get: 0
  })

  const actividadFactores: Record<string, number> = {
    Sedentario: 1.2,
    Ligero: 1.375,
    Moderado: 1.55,
    Intenso: 1.725,
    Atleta: 1.9
  }

  const calcularGET = () => {
    const edad = new Date().getFullYear() - parseInt(form.nacimiento.anio)
    const altura = parseFloat(form.altura)
    const peso = parseFloat(form.peso)
    const sexo = form.sexo
    const factor = actividadFactores[form.actividad] || 1.2

    let tmb = 10 * peso + 6.25 * altura - 5 * edad + (sexo === 'M' ? 5 : -161)
    return Math.round(tmb * factor)
  }

  useEffect(() => {
    const camposCompletos =
      form.nacimiento.dia &&
      form.nacimiento.mes &&
      form.nacimiento.anio &&
      form.sexo &&
      form.altura &&
      form.peso &&
      form.actividad &&
      !isNaN(Number(form.altura)) &&
      !isNaN(Number(form.peso)) &&
      !isNaN(Number(form.nacimiento.anio))

    if (camposCompletos) {
      const getCalculado = calcularGET()
      setForm((prev) => ({ ...prev, get: getCalculado }))
    }
  }, [
    form.nacimiento.dia,
    form.nacimiento.mes,
    form.nacimiento.anio,
    form.sexo,
    form.altura,
    form.peso,
    form.actividad
  ])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name.startsWith('nacimiento.')) {
      const campo = name.split('.')[1]
      setForm({ ...form, nacimiento: { ...form.nacimiento, [campo]: value } })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (paso === 1) {
      if (form.password !== form.confirmarPassword) {
        return alert('Las contraseñas no coinciden')
      }
      setPaso(2)
    } else {
      const usuarioCompleto = { ...form }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, form.correo, form.password)
        const user = userCredential.user

        const { password, confirmarPassword, ...datosGuardados } = usuarioCompleto
        await setDoc(doc(db, 'usuarios', user.uid), { ...datosGuardados })

        navigate('/login')
      } catch (error: any) {
        console.error('Error al registrar usuario:', error)
        alert(error.message || 'Error al registrar. Intenta de nuevo.')
      }
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
        alignItems: 'center'
      }}
    >
      <form onSubmit={handleSubmit} className="registro-form" style={{ backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,0.2)', padding: 20, borderRadius: 10 }}>
        <h2 className="form-title">
          {paso === 1 ? 'Crear cuenta' : 'Datos físicos y objetivo'}
        </h2>

        {paso === 1 ? (
          <>
            <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required className="form-input" />
            <input name="apellidos" placeholder="Apellidos" value={form.apellidos} onChange={handleChange} required className="form-input" />
            <input name="usuario" placeholder="Usuario" value={form.usuario} onChange={handleChange} required className="form-input" />
            <input name="correo" type="email" placeholder="Correo electrónico" value={form.correo} onChange={handleChange} required className="form-input" />
            <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required className="form-input" />
            <input name="confirmarPassword" type="password" placeholder="Confirmar contraseña" value={form.confirmarPassword} onChange={handleChange} required className="form-input" />
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Fecha de nacimiento:</label>
              <div className="fecha-nacimiento">
                <input name="nacimiento.dia" placeholder="Día" value={form.nacimiento.dia} onChange={handleChange} required className="form-input fecha-input" />
                <input name="nacimiento.mes" placeholder="Mes" value={form.nacimiento.mes} onChange={handleChange} required className="form-input fecha-input" />
                <input name="nacimiento.anio" placeholder="Año" value={form.nacimiento.anio} onChange={handleChange} required className="form-input fecha-input" />
              </div>
            </div>

            <div className="form-radio-group">
              <label><input type="radio" name="sexo" value="M" checked={form.sexo === 'M'} onChange={handleChange} /> Hombre</label>
              <label><input type="radio" name="sexo" value="F" checked={form.sexo === 'F'} onChange={handleChange} /> Mujer</label>
            </div>

            <input name="altura" placeholder="Altura (cm)" value={form.altura} onChange={handleChange} required className="form-input" />
            <input name="peso" placeholder="Peso (kg)" value={form.peso} onChange={handleChange} required className="form-input" />

            <select name="actividad" value={form.actividad} onChange={handleChange} required className="form-input">
              <option value="">Estilo de vida</option>
              <option value="Sedentario">Sedentario – Trabajo sentado, poco movimiento.</option>
              <option value="Ligero">Ligero – Caminatas cortas, tareas suaves.</option>
              <option value="Moderado">Moderado – Movimiento frecuente, recados.</option>
              <option value="Intenso">Intenso – Trabajo activo, mucha movilidad.</option>
              <option value="Atleta">Atleta – Estilo de vida muy activo.</option>
            </select>

            <select name="objetivo" value={form.objetivo} onChange={handleChange} required className="form-input">
              <option value="">Objetivo</option>
              <option value="Mantener">Mantener peso</option>
              <option value="Bajar">Bajar grasa corporal</option>
              <option value="Subir">Subir masa muscular</option>
              <option value="Recomposicion">Recomposición corporal</option>
              <option value="Rendimiento">Mejorar rendimiento deportivo</option>
            </select>

            <div className="form-get">
              GET estimado: {form.get > 0 ? `${form.get} kcal/día` : 'Completa tus datos para ver el GET estimado'}
            </div>
          </>
        )}

        <button type="submit" className="form-button">
          {paso === 1 ? 'Siguiente' : 'Finalizar registro'}
        </button>
      </form>
    </div>
  )
}

export default RegistroUsuario





