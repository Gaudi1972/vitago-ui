// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss';
import WelcomeScreen from './pages/WelcomeScreen';
import RegistroUsuario from './pages/RegistroUsuario';
import Login from './pages/Login';
import RecuperarContraseña from './pages/RecuperarContraseña';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './pages/PrivateRoute';
import Actividad from './pages/Actividad';
import Nutricion from './pages/Nutricion';
import Informes from './pages/Informes';
import Alimentos from './pages/Alimentos'; // ✅ NUEVO
import Acerca from './pages/Acerca';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/registro" element={<RegistroUsuario />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar" element={<RecuperarContraseña />} />
        <Route path="/actividad" element={<Actividad />} />
        <Route path="/nutricion" element={<Nutricion />} />
        <Route path="/informes" element={<Informes />} />
        <Route path="/acerca" element={<Acerca />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/alimentos"
          element={
            <PrivateRoute>
              <Alimentos />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
