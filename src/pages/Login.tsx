// src/pages/Login.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // ✅ Añadido Link
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import '../App.scss';
import { useAuth } from '../auth/AuthContext';
import fondoLogin from '../assets/login-bg.jpg';

const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, usuario, contrasena);
      sessionStorage.setItem('justLoggedIn', 'true');
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales incorrectas. Inténtalo de nuevo.');
    }
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
          type="email"
          className="form-input"
          placeholder="Correo electrónico"
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

        {error && <div className="password-error">{error}</div>}

        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
          <Link to="/recuperar" style={{ fontSize: 12, color: '#f5f5f5' }}>
            ¿Has olvidado tu contraseña?
          </Link>
        </div>

        <button type="submit" className="form-button">Entrar</button>

        <div className="form-get" style={{ color: '#f5f5f5', fontSize: 12 }}>
          ¿No tienes cuenta?{' '}
          <Link
            to="/registro"
            style={{
              color: '#f5f5f5',
              fontWeight: 'bold',
              textDecoration: 'underline'
            }}
          >
            Regístrate
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;



