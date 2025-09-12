// src/pages/Acerca.tsx
import React from 'react';
import useIsMobile from '../hooks/useIsMobile';

const Acerca: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <div className="dashboard-container">
      <main className="dashboard-main" style={{ padding: isMobile ? '1rem' : '2rem' }}>
        <h1>ℹ️ Acerca de VitaGo</h1>
        <p>
          VitaGo es una aplicación diseñada para ayudarte a gestionar tu nutrición, 
          actividad física y bienestar general de forma práctica y accesible.
        </p>

        <h2>📜 Aviso Legal</h2>
        <p>
          Esta aplicación tiene fines únicamente <strong>informativos y educativos</strong>. 
          No constituye asesoramiento médico, diagnóstico ni tratamiento. 
          Para cualquier decisión relacionada con tu salud consulta siempre a un 
          <strong>profesional sanitario titulado</strong>.
        </p>

        <h2>⚖️ Términos de Uso</h2>
        <ul>
          <li>El uso de la aplicación es bajo responsabilidad del usuario.</li>
          <li>Los desarrolladores no se hacen responsables de decisiones de salud basadas en la información mostrada.</li>
          <li>Se prohíbe utilizar la aplicación con fines fraudulentos o ilegales.</li>
        </ul>

        <h2>🔒 Privacidad</h2>
        <p>
          Los datos personales ingresados (como edad, peso, altura, actividad física) se utilizan 
          exclusivamente para el funcionamiento de la aplicación. No compartimos ni vendemos tu información.
        </p>
        <p>
          Puedes solicitar la eliminación de tus datos escribiendo a: 
          <a href="mailto:vitago.app@gmail.com"> vitago.app@gmail.com</a>.
        </p>
        <p>
          Consulta la versión completa de nuestra <a href="https://tusitio.com/politica-privacidad" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>.
        </p>

        <h2>📞 Contacto</h2>
        <p>
          Para consultas o soporte, contáctanos en 
          <a href="mailto:vitago.app@gmail.com"> vitago.app@gmail.com</a>.
        </p>
      </main>
    </div>
  );
};

export default Acerca;



