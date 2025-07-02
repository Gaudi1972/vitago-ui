import React, { useState } from 'react'
import '../App.scss'
import logo from '../assets/logo-vitago.png'
import background from '../assets/background-vitalidad.jpg'
import useIsMobile from '../hooks/useIsMobile' // 👈 nuevo
import { useNavigate } from 'react-router-dom'


const WelcomeScreen: React.FC = () => {
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const [activeTooltip, setActiveTooltip] = useState<number | null>(null)

  const handleTooltipToggle = (index: number) => {
    if (!isMobile) return
    setActiveTooltip(prev => (prev === index ? null : index))
  }

  const tooltips = [
    {
      label: 'Nutrición',
      anchor: '#nutricion',
      text: 'Lleva un control inteligente de tu dieta con el análisis nutricional de cada alimento que consumes',
    },
    {
      label: 'Actividades',
      anchor: '#actividades',
      text: 'Registra tus actividades, duración, calorías y pulsaciones. Controla tus zonas de entrenamiento y asegúrate de que cada esfuerzo cuente hacia tu objetivo.',
    },
    {
      label: 'Informes',
      anchor: '#informes',
      text: 'Haz un seguimiento de tus logros con informes claros y descubre cómo te acercas a tus objetivos.',
    },
  ]

  return (
    <div className="welcome-container" style={{ backgroundImage: `url(${background})` }}>
      <header className="header">
        <img src={logo} alt="VitaGo Logo" className="logo" />

        <nav className={`menu-secundario ${isMobile ? 'mobile' : 'desktop'}`}>
          {tooltips.map((item, index) => (
            <div
              key={index}
              className={`tooltip ${isMobile && activeTooltip === index ? 'show-tooltip' : ''}`}
              onClick={() => handleTooltipToggle(index)}
            >
              <a href={item.anchor}>{item.label}</a>
              <span className="tooltip-text">{item.text}</span>
            </div>
          ))}
        </nav>

        <nav className="nav-menu">
          <a href="#inicio">Inicio</a>
          <a href="#servicios">Servicios</a>
          <a href="#contacto">Contacto</a>
        </nav>
      </header>

      <main className="main-content">
        <div className="welcome-box">
          <h1 className="title">Bienvenid@ a VitaGo</h1>
          <p className="subtitle">Control de nutrición, deporte, descanso y motivación</p>
          <div className="button-group">
            <button className="btn blue" onClick={() => navigate('/login')}>Iniciar sesión</button>
            <button className="btn green" onClick={() => navigate('/registro')}>Registrarme</button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default WelcomeScreen




