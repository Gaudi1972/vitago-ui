// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomeScreen from './pages/WelcomeScreen';
import RegistroUsuario from './pages/RegistroUsuario';
import Login from './pages/Login';
import { AuthProvider } from "./auth/AuthContext";
import backgroundImage from '../assets/Registro-bg.jpeg'



function App() {
  return (
    <AuthProvider> {/* 👈 aquí envolvemos todo */}
      <Router>
        <Routes>
          <Route path="/" element={<RegistroUsuario />} />
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/registro" element={<RegistroUsuario />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

