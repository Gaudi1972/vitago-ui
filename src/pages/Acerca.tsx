import React from 'react';
import HeaderMobile from '../Components/HeaderMobile';
import TabsMenu from '../Components/TabsMenu';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Acerca: React.FC = () => {
  const fechaActualFormateada = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const isMobile = window.innerWidth <= 768;

  return (
    <div className="dashboard-container">
      {isMobile && (
        <>
          <HeaderMobile fechaTexto={fechaActualFormateada} />
          <TabsMenu />
        </>
      )}

      <main className="dashboard-main">
        <h1>ℹ️ Acerca de Vitago</h1>
        <p>Esta aplicación fue creada para ayudarte a gestionar tu nutrición, actividad física y salud de forma integral.</p>
        <p>Estamos trabajando para traerte nuevas funcionalidades muy pronto.</p>
      </main>
    </div>
  );
};

export default Acerca;
