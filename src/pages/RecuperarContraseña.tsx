// src/pages/RecuperarContraseña.tsx
import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import fondoLogin from '../assets/login-bg.jpg';


const RecuperarContraseña: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      await sendPasswordResetEmail(auth, correo);
      setMensaje('Hemos enviado un enlace de recuperación a tu correo.');
      setCorreo('');
    } catch (err: any) {
      setError('Ha ocurrido un error. Verifica el correo e inténtalo de nuevo.');
      console.error(err);
    }
  };

  return (
    <div
      className="registro-container"
      style={{
        backgroundImage: `url("/assets/login-bg.jpg")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Arial',
      }}
    >
      <form
        className="registro-form"
        onSubmit={handleSubmit}
        style={{
          backdropFilter: 'blur(8px)',
          background: 'rgba(255,255,255,0.15)',
          padding: 20,
          borderRadius: 12,
          width: 360,
          fontSize: 13,
          color: '#fff'
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Recuperar Contraseña</h2>

        <input
          type="email"
          placeholder="Introduce tu correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '1rem',
            borderRadius: 4,
            border: '1px solid #ccc'
          }}
        />

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#ff7f00',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Enviar enlace
        </button>

        {mensaje && (
          <div style={{ color: '#4CAF50', marginTop: '1rem', fontSize: 12 }}>{mensaje}</div>
        )}
        {error && (
          <div style={{ color: 'red', marginTop: '1rem', fontSize: 12 }}>{error}</div>
        )}
      </form>
    </div>
  );
};

export default RecuperarContraseña;

