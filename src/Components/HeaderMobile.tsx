// src/Components/HeaderMobile.tsx

import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo-vitagoBlanco.png';

interface HeaderMobileProps {
  fechaTexto: string;
}

const HeaderMobile: React.FC<HeaderMobileProps> = ({ fechaTexto }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="mobile-header">
      <div className="mobile-logo">
        <img src={logo} alt="VitaGo Logo" />
      </div>
      <div className="mobile-info">
        <div>{fechaTexto}</div>
        <div onClick={handleLogout}>
          Bienvenido, {user?.email} ▼
        </div>
      </div>
    </div>
  );
};

export default HeaderMobile;
