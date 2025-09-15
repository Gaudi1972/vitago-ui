import React, { useMemo, useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import alimentosData from '../data/alimentos.json';
import '../assets/Styles/RegistroFormModern.scss';
import '../assets/Styles/CarruselComun.scss';
import '../assets/Styles/Alimentos.scss';
import { evaluarAporteNutricional } from '../Services/nutrientesHelper';
import CustomSelect from '../Components/CustomSelect';

type Alimento = {
  [key: string]: any;
  ['Nombre del alimento']: string;
  ['Grupo alimenticio']: string;
};

const collator = new Intl.Collator('es', { sensitivity: 'base' });

const Alimentos: React.FC = () => {
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string>('Todos');
  const [busqueda, setBusqueda] = useState('');
  const carruselRef = useRef<HTMLDivElement>(null);

  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState<Alimento | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const [nutrienteOrden, setNutrienteOrden] = useState<string>('');
  const [ordenDesc, setOrdenDesc] = useState<boolean>(true);

  const abrirDetalleAlimento = (alimento: Alimento) => {
    setAlimentoSeleccionado(alimento);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setAlimentoSeleccionado(null);
    setMostrarModal(false);
  };

  // Bloquear scroll fondo
  useEffect(() => {
    if (mostrarModal) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [mostrarModal]);

  // Detectar altura real del header y setear variables CSS
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.dashboard-header');
    if (header) {
      const height = header.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${height}px`);
      document.documentElement.style.setProperty('--modal-offset', `20px`);
    }
  }, []);

  const grupos = useMemo(() => {
    const set = new Set<string>();
    (alimentosData as Alimento[]).forEach(a => {
      if (a['Grupo alimenticio']) set.add(a['Grupo alimenticio'].trim());
    });
    return ['Todos', ...Array.from(set).sort((a, b) => collator.compare(a, b))];
  }, []);

  useEffect(() => {
    carruselRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  }, []);

  const opcionesOrden = useMemo(
    () => [
      { label: "Nombre (A-Z)", value: "" },
      { label: "Calorías", value: "Calorías" },
      { label: "Proteínas", value: "Proteínas" },
      { label: "Fibra", value: "Fibra" },
      { label: "Grasas", value: "Grasas" },
      { label: "Grasas saturadas", value: "Grasas saturadas" },
      { label: "Azúcares", value: "Azúcares" },
      { label: "Sodio", value: "Sodio" },
      { label: "Calcio", value: "Calcio" },
      { label: "Hierro", value: "Hierro" },
      { label: "Potasio", value: "Potasio" },
    ],
    []
  );

  const sortStatus = useMemo(() => {
    const campo = nutrienteOrden ? nutrienteOrden : "Nombre";
    const direccion = ordenDesc ? "descendente" : "ascendente";
    return `Ordenando por ${campo} en sentido ${direccion}.`;
  }, [nutrienteOrden, ordenDesc]);

  const alimentosFiltrados = useMemo(() => {
    let lista = (alimentosData as Alimento[])
      .filter(a =>
        grupoSeleccionado === 'Todos' ||
        a['Grupo alimenticio']?.trim() === grupoSeleccionado
      );

    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter(a =>
        a['Nombre del alimento'].toLowerCase().includes(q)
      );
    }

    if (nutrienteOrden) {
      lista.sort((a, b) => {
        const evalA = evaluarAporteNutricional(a);
        const evalB = evaluarAporteNutricional(b);
        const valA = evalA[nutrienteOrden]?.valor ?? 0;
        const valB = evalB[nutrienteOrden]?.valor ?? 0;
        return ordenDesc ? valB - valA : valA - valB;
      });
    } else {
      lista.sort((a, b) =>
        collator.compare(a['Nombre del alimento'], b['Nombre del alimento'])
      );
    }

    return lista;
  }, [grupoSeleccionado, busqueda, nutrienteOrden, ordenDesc]);

  const modalContent = (
    <div className="modal-overlay" onClick={cerrarModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{alimentoSeleccionado?.['Nombre del alimento']}</h3>
          <button className="modal-close" onClick={cerrarModal}>✖</button>
        </div>
        <ul>
          {alimentoSeleccionado &&
            Object.entries(evaluarAporteNutricional(alimentoSeleccionado)).map(
              ([nutriente, data]: any) => {
                let icon = "⚪";
                if (data.estado === "verde") icon = "🟢";
                if (data.estado === "ambar") icon = "🟡";
                if (data.estado === "rojo") icon = "🔴";
                if (data.estado === "gris") icon = "⚪";

                return (
                  <li key={nutriente} className={`nutriente-card estado-${data.estado}`}>
                    <span className="nutriente-icon">{icon}</span>
                    <div className="nutriente-info">
                      <strong>{nutriente}:</strong>{" "}
                      {data.valor} {data.unidad || ''} por 100 g
                      <br />
                      <small>{data.comentario}</small>
                    </div>
                  </li>
                );
              }
            )}
        </ul>
        <p className="nota-informativa">
          ℹ️ La información nutricional mostrada tiene fines únicamente informativos. 
          Consulta la sección <strong>Acerca de</strong> para más detalles.
        </p>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container alimentos-page">
      <main className="dashboard-main">
        <h3 className="titulo-carrusel">🍽️ Base de Datos de Alimentos</h3>

        <div className="carousel-comidas" ref={carruselRef}>
          {grupos.map(g => (
            <div
              key={g}
              className={`card-comida ${grupoSeleccionado === g ? 'activo' : ''}`}
              onClick={() => setGrupoSeleccionado(g)}
            >
              <span>{g}</span>
            </div>
          ))}
        </div>

        <div className="ordenador-nutriente">
          <span className="ordenar-label">Ordenar por:</span>

          <div className="ordenar-controles">
            <CustomSelect
              value={nutrienteOrden}
              onChange={setNutrienteOrden}
              options={opcionesOrden}
            />

            <div className="orden-botones">
              <button
                type="button"
                className={`btn-orden asc ${!ordenDesc ? 'activo' : ''}`}
                onClick={() => setOrdenDesc(false)}
                aria-label="Ordenar ascendente"
                title="Ascendente"
              >
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M12 5 L6 15 H18 Z" />
                </svg>
              </button>
              <button
                type="button"
                className={`btn-orden desc ${ordenDesc ? 'activo' : ''}`}
                onClick={() => setOrdenDesc(true)}
                aria-label="Ordenar descendente"
                title="Descendente"
              >
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M12 19 L6 9 H18 Z" />
                </svg>
              </button>
            </div>
          </div>

          <span className="sr-only" aria-live="polite">{sortStatus}</span>

          <div className="input-icon-wrapper search-box">
            <svg className="search-icon" viewBox="0 0 24 24" width="20" height="20">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" />
            </svg>
            <input
              type="text"
              placeholder="Buscar alimento…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <ul className="lista-alimentos">
          {alimentosFiltrados.map((a, idx) => {
            const evalNut = evaluarAporteNutricional(a);
            return (
              <li key={`${a['Nombre del alimento']}-${idx}`} onClick={() => abrirDetalleAlimento(a)}>
                <div className="fila-alimento">
                  <div className="col-izq">
                    <span className="indice">{idx + 1}.</span>
                    <span className="texto">{a['Nombre del alimento']}</span>
                  </div>
                  {nutrienteOrden && evalNut[nutrienteOrden] && (
                    <div className="col-der">
                      ≈{evalNut[nutrienteOrden].valor} {evalNut[nutrienteOrden].unidad || ''} / 100 g
                    </div>
                  )}
                </div>
              </li>
            );
          })}
          {alimentosFiltrados.length === 0 && (
            <li className="vacio">No hay alimentos que coincidan con la búsqueda.</li>
          )}
        </ul>
      </main>

      {/* Modal en Portal */}
      {mostrarModal && alimentoSeleccionado &&
        ReactDOM.createPortal(modalContent, document.body)
      }
    </div>
  );
};

export default Alimentos;











