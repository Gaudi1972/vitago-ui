// src/layout/MobileLayout.tsx
import React from 'react';
import HeaderMobile from '../Components/HeaderMobile';
import TabsMenu from '../Components/TabsMenu';

const MobileLayout: React.FC<{ fechaTexto: string; children: React.ReactNode }> = ({ fechaTexto, children }) => {
  const isMobile = window.innerWidth <= 768;

  return (
    <>
      {isMobile && (
        <>
          <HeaderMobile fechaTexto={fechaTexto} />
          <TabsMenu />
        </>
      )}
      {children}
    </>
  );
};

export default MobileLayout;
