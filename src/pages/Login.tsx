import React, { useState } from 'react';
import '../App.scss';
import fondoLogin from '../assets/login-bg.jpg'; // asegúrate de que esta ruta es correcta

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login con:', usuario, contrasena);
  };

  return (
    <div
      className="registro-container"
      style={{
        backgroundImage: `url(${fondoLogin})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <form className="registro-form" onSubmit={handleSubmit}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Iniciar Sesión</h2>

        <input
          type="text"
          className="form-input"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />

        <input
          type="password"
          className="form-input"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />

        <button type="submit" className="form-button">Entrar</button>

        <div className="form-get">
          ¿No tienes cuenta? <a href="/registro">Regístrate</a>
        </div>
      </form>
    </div>
  );
};

export default Login;



