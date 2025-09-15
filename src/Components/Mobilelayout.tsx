// src/layout/MobileLayout.tsx
import React from 'react';
import HeaderMobile from '../Components/HeaderMobile';
import TabsMenu from '../Components/TabsMenu';
import '../assets/Styles/MobileLayout.scss'; // 👈 crea un SCSS para estilos globales del layout

const MobileLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = window.innerWidth <= 768;

  return (
    <div className="mobile-layout">
      {isMobile && (
        <>
          <HeaderMobile />
          <TabsMenu />
        </>
      )}
      <div className="mobile-content">
        {children}
      </div>
    </div>
  );
};

export default MobileLayout;
