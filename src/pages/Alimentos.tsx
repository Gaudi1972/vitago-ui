import React, { useMemo, useRef, useState, useEffect } from 'react';
import alimentosData from '../data/alimentos.json';
import '../assets/Styles/RegistroFormModern.scss';
import '../assets/Styles/CarruselComun.scss';
import '../assets/Styles/Alimentos.scss'; // ✅ Nuevo SCSS para modal
import { evaluarAporteNutricional } from '../Services/nutrientesHelper'; // ✅ Helper nutricional

type Alimento = {
  [key: string]: any;
  ['Nombre del alimento']: string;
  ['Grupo alimenticio']: string;
};

const collator = new Intl.Collator('es', { sensitivity: 'base' });

const Alimentos: React.FC = () => {
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const carruselRef = useRef<HTMLDivElement>(null);

  // ✅ Estado para modal
  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState<Alimento | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const abrirDetalleAlimento = (alimento: Alimento) => {
    setAlimentoSeleccionado(alimento);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setAlimentoSeleccionado(null);
    setMostrarModal(false);
  };

  // Lista de grupos alimenticios ordenados + botón "Todos"
  const grupos = useMemo(() => {
    const set = new Set<string>();
    (alimentosData as Alimento[]).forEach(a => {
      if (a['Grupo alimenticio']) set.add(a['Grupo alimenticio'].trim());
    });
    return ['Todos', ...Array.from(set).sort((a, b) => collator.compare(a, b))];
  }, []);

  // Scroll al primer botón
  useEffect(() => {
    carruselRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  }, []);

  // Lista filtrada y ordenada
  const alimentosFiltrados = useMemo(() => {
    let lista = (alimentosData as Alimento[])
      .filter(
        a =>
          grupoSeleccionado === null ||
          grupoSeleccionado === 'Todos' ||
          a['Grupo alimenticio']?.trim() === grupoSeleccionado
      )
      .sort((a, b) =>
        collator.compare(a['Nombre del alimento'], b['Nombre del alimento'])
      );

    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter(a =>
        a['Nombre del alimento'].toLowerCase().includes(q)
      );
    }
    return lista;
  }, [grupoSeleccionado, busqueda]);

  return (
    <div className="dashboard-container alimentos-page">
      <main className="dashboard-main">
        <h3 className="titulo-carrusel">🍽️ Base de Datos de Alimentos</h3>

        {/* ✅ Carrusel estilo Nutrición */}
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

        {/* ✅ Buscador */}
        {grupoSeleccionado && grupoSeleccionado !== 'Todos' && (
          <>
            <h4 className="titulo-momento">{grupoSeleccionado}</h4>
            <div className="input-icon-wrapper">
              <input
                type="text"
                placeholder="🔎 Buscar alimento…"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
          </>
        )}

        {/* ✅ Lista de alimentos filtrada */}
        <ul className="lista-alimentos">
          {alimentosFiltrados.map((a, idx) => (
            <li
              key={`${a['Nombre del alimento']}-${idx}`}
              onClick={() => abrirDetalleAlimento(a)} // 👈 click abre modal
              style={{ cursor: 'pointer' }}
            >
              <span className="indice">{idx + 1}.</span>
              <span className="nombre">{a['Nombre del alimento']}</span>
            </li>
          ))}
          {grupoSeleccionado && alimentosFiltrados.length === 0 && (
            <li className="vacio">
              No hay alimentos que coincidan con la búsqueda.
            </li>
          )}
        </ul>
      </main>

      {/* ✅ Modal de detalle nutricional estilo semáforo */}
      {mostrarModal && alimentoSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={cerrarModal}>✖</button>

            <h3>{alimentoSeleccionado['Nombre del alimento']}</h3>

            {/* ✅ Calorías destacadas arriba con semáforo */}
            {(() => {
              const calorias = alimentoSeleccionado["Calorías por 100g"] || 0;
              let estado: "verde" | "ambar" | "rojo" | "gris" = "gris";
              if (calorias > 0 && calorias <= 40) estado = "verde";
              else if (calorias <= 100) estado = "ambar";
              else if (calorias > 100) estado = "rojo";

              return (
                <div className={`calorias-box calorias-${estado}`}>
                  🔥 {calorias} kcal por 100 g
                </div>
              );
            })()}

            <ul>
              {Object.entries(evaluarAporteNutricional(alimentoSeleccionado)).map(
                ([nutriente, data]: any) => {
                  let icon = "⚪";
                  if (data.estado === "verde") icon = "🟢";
                  if (data.estado === "ambar") icon = "🟡";
                  if (data.estado === "rojo") icon = "🔴";
                  if (data.estado === "gris") icon = "⚪";

                  return (
                    <li
                      key={nutriente}
                      className={`nutriente-card estado-${data.estado}`}
                    >
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Alimentos;


