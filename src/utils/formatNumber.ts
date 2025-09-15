// src/utils/formatNumber.ts
export const formatNumber = (valor: any): string => {
  if (valor === null || valor === undefined) return "";

  // Normalizamos a string y limpiamos espacios
  const limpio = String(valor).replace(/[^\d.-]/g, "").trim();
  const num = Number(limpio);

  if (isNaN(num)) {
    return String(valor); // devolvemos tal cual si no es número válido
  }

  return num.toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};



