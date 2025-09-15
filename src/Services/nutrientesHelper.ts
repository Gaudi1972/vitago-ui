// Diccionario de umbrales basado en Reglamento UE 1924/2006 + recomendaciones OMS/EFSA
interface EvaluacionNutriente {
  valor: number;
  estado: "verde" | "ambar" | "rojo" | "gris";
  comentario: string;
  unidad: string;
}

export function evaluarAporteNutricional(alimento: any) {
  const resultados: Record<string, EvaluacionNutriente> = {};

  // ⚡ Calorías (basado en semáforo UK, comentarios granulares)
  const kcal = alimento["Calorías por 100g"] || alimento["Calorias por 100g"] || 0;
  let comentarioCal = "";

  if (kcal < 40) {
    comentarioCal = "Muy bajo en calorías.";
  } else if (kcal < 100) {
    comentarioCal = "Bajo en calorías.";
  } else if (kcal <= 250) {
    comentarioCal = "Alto en calorías.";
  } else if (kcal <= 400) {
    comentarioCal = "Muy alto en calorías.";
  } else {
    comentarioCal = "Extremadamente alto en calorías.";
  }

  resultados["Calorías"] = {
    valor: kcal,
    estado: kcal < 40 ? "verde" : kcal < 100 ? "ambar" : "rojo",
    comentario: comentarioCal,
    unidad: "kcal",
  };

  // ⚡ Proteínas
  const prot = alimento["Proteínas (g)"] || alimento["Proteinas (g)"] || 0;
  resultados["Proteínas"] = {
    valor: prot,
    estado: prot >= 10 ? "verde" : prot >= 5 ? "ambar" : "gris",
    comentario:
      prot >= 10
        ? "Alto en proteínas, buena fuente."
        : prot >= 5
        ? "Fuente moderada de proteínas."
        : "Aporte irrelevante (≈ 0)",
    unidad: "g",
  };

  // ⚡ Hidratos de carbono (informativo, sin semáforo)
  const hidratos = alimento["Hidratos de carbono (g)"] || alimento["Carbohidratos (g)"];
  if (hidratos !== undefined) {
    resultados["Hidratos de carbono"] = {
      valor: hidratos,
      estado: "gris", // siempre gris: neutro
      comentario:
        "Dato informativo: incluye tanto almidones como azúcares. La calidad depende del aporte de fibra y del contenido de azúcares.",
      unidad: "g",
    };
  }

  // ⚡ Fibra
  const fibra = alimento["Fibra (g)"] || 0;
  resultados["Fibra"] = {
    valor: fibra,
    estado: fibra >= 6 ? "verde" : fibra >= 3 ? "ambar" : "gris",
    comentario:
      fibra >= 6
        ? "Alto contenido en fibra."
        : fibra >= 3
        ? "Fuente de fibra."
        : "Aporte irrelevante (≈ 0)",
    unidad: "g",
  };

  // ⚡ Grasas totales
  const grasas = alimento["Grasas (g)"] || 0;
  resultados["Grasas"] = {
    valor: grasas,
    estado: grasas <= 3 ? "verde" : grasas <= 17 ? "ambar" : "rojo",
    comentario:
      grasas <= 3
        ? "Bajo en grasas."
        : grasas <= 17
        ? "Contenido moderado en grasas."
        : "Alto contenido en grasas.",
    unidad: "g",
  };

  // ⚡ Grasas saturadas
  const sat = alimento["Grasa saturada (g)"] || alimento["Grasas saturadas (g)"] || 0;
  resultados["Grasas saturadas"] = {
    valor: sat,
    estado: sat <= 1.5 ? "verde" : sat <= 5 ? "ambar" : "rojo",
    comentario:
      sat <= 1.5
        ? "Bajo en grasas saturadas."
        : sat <= 5
        ? "Moderado en grasas saturadas."
        : "Alto en grasas saturadas.",
    unidad: "g",
  };

  // ⚡ Azúcares
  const azucares = alimento["Azúcares (g)"] || alimento["Azucares (g)"] || 0;
  resultados["Azúcares"] = {
    valor: azucares,
    estado: azucares <= 5 ? "verde" : azucares <= 15 ? "ambar" : "rojo",
    comentario:
      azucares <= 5
        ? "Bajo en azúcares."
        : azucares <= 15
        ? "Contenido moderado en azúcares."
        : "Alto contenido en azúcares.",
    unidad: "g",
  };

  // ⚡ Sodio
  const sodio = alimento["Sodio (mg)"] || 0;
  resultados["Sodio"] = {
    valor: sodio,
    estado: sodio <= 120 ? "verde" : sodio <= 600 ? "ambar" : "rojo",
    comentario:
      sodio <= 120
        ? "Bajo en sodio (sal)."
        : sodio <= 600
        ? "Contenido moderado en sodio."
        : "Alto en sodio.",
    unidad: "mg",
  };

  // ⚡ Calcio
  const calcio = alimento["Calcio (mg)"] || 0;
  resultados["Calcio"] = {
    valor: calcio,
    estado: calcio >= 120 ? "verde" : "gris",
    comentario:
      calcio >= 120
        ? "Fuente adecuada de calcio."
        : "Aporte irrelevante (≈ 0)",
    unidad: "mg",
  };

  // ⚡ Hierro
  const hierro = alimento["Hierro (mg)"] || 0;
  resultados["Hierro"] = {
    valor: hierro,
    estado: hierro >= 2.1 ? "verde" : "gris",
    comentario:
      hierro >= 2.1
        ? "Fuente adecuada de hierro."
        : "Aporte irrelevante (≈ 0)",
    unidad: "mg",
  };

  // ⚡ Potasio
  const potasio = alimento["Potasio (mg)"] || 0;
  resultados["Potasio"] = {
    valor: potasio,
    estado: potasio >= 300 ? "verde" : "gris",
    comentario:
      potasio >= 300
        ? "Fuente adecuada de potasio."
        : "Aporte irrelevante (≈ 0)",
    unidad: "mg",
  };

  return resultados;
}




