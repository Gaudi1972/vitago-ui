import React, { useState } from "react";
import {
  startOfWeek,
  addDays,
  format,
  subWeeks,
  addWeeks
} from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  fecha: string; // formato "YYYY-MM-DD"
  onFechaChange: (nuevaFecha: string) => void;
  startOnMonday?: boolean;
}

const WeekStrip: React.FC<Props> = ({
  fecha,
  onFechaChange,
  startOnMonday = true,
}) => {
  const fechaActual = new Date(fecha);

  // Estado: inicio de la semana mostrada
  const [semanaInicio, setSemanaInicio] = useState<Date>(
    startOfWeek(fechaActual, { weekStartsOn: startOnMonday ? 1 : 0 })
  );

  const diasSemana = Array.from({ length: 7 }, (_, i) =>
    addDays(semanaInicio, i)
  );

  const cambiarSemana = (dir: "prev" | "next") => {
    setSemanaInicio((prev) =>
      dir === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  return (
    <div className="week-strip">
      <button
        type="button"
        className="arrow"
        onClick={() => cambiarSemana("prev")}
      >
        ◀
      </button>

      <div className="days">
        {diasSemana.map((dia) => {
          const fechaISO = format(dia, "yyyy-MM-dd");
          const esSeleccionado = fechaISO === fecha;

          return (
            <div
              key={fechaISO}
              className={`day ${esSeleccionado ? "selected" : ""}`}
              onClick={() => onFechaChange(fechaISO)}
            >
              <span className="dow">
                {format(dia, "EE", { locale: es }) /* lun., mar., mié. */}
              </span>
              <span className="num">{format(dia, "d")}</span>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="arrow"
        onClick={() => cambiarSemana("next")}
      >
        ▶
      </button>
    </div>
  );
};

export default WeekStrip;
