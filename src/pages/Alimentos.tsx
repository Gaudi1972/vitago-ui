import React from 'react';
import HeaderMobile from '../Components/HeaderMobile';
import TabsMenu from '../Components/TabsMenu';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Alimentos: React.FC = () => {
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
        <h1>🍽️ Base de Datos de Alimentos</h1>
        <p>Esta sección estará disponible próximamente.</p>
      </main>
    </div>
  );
};

export default Alimentos;
