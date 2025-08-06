import React, { useState } from 'react';
import '../assets/Styles/EvaluacionNutricional.scss';
import { useAuth } from '../auth/AuthContext';

interface NutrienteData {
  nutriente: string;
  ingerido: number;
  recomendado: number;
}

interface EvaluacionResultado {
  nutriente: string;
  ingerido: number;
  recomendado: number;
  desviacionPorcentual: string;
  estado: 'correcto' | 'exceso' | 'defecto';
  color: 'green' | 'amber' | 'red';
  unidad: string;
}

// 🔸 Tus comentarios por separado:
const comentariosProteinas: Record<
  string,
  Record<'green' | 'amber' | 'red', Record<'+' | '-', string>>
> = {
  Bajar: {
    green: {
      '+': "Tu ingesta proteica está dentro del rango ideal. Esto ayuda a preservar músculo mientras reduces grasa.",
      '-': "Tu ingesta proteica está en el rango correcto para evitar pérdida muscular durante el déficit calórico.",
    },
    amber: {
      '+': "Estás ligeramente por encima de lo recomendado. Puede ser útil si haces ejercicio intenso, pero vigila el balance general.",
      '-': "Estás algo por debajo de lo ideal. Podrías perder masa muscular si esto se mantiene.",
    },
    red: {
      '+': "Estás muy por encima del valor recomendado. Esto puede dificultar el déficit calórico necesario para perder grasa.",
      '-': "Estás muy por debajo. Riesgo de pérdida muscular y fatiga general.",
    },
  },
  Subir: {
    green: {
      '+': "Ingesta proteica óptima para crecimiento muscular. Buen trabajo.",
      '-': "Buena cantidad de proteínas para desarrollar masa muscular.",
    },
    amber: {
      '+': "Algo por encima. Puede ser útil si entrenas fuerte, pero sin excesos.",
      '-': "Estás por debajo. Esto puede ralentizar tu progreso muscular.",
    },
    red: {
      '+': "Muy por encima. El exceso no genera más músculo y puede forzar al sistema renal.",
      '-': "Muy por debajo. Difícil progresar sin suficiente proteína.",
    },
  },
  Mantener: {
    green: {
      '+': "Estás dentro del rango ideal para mantener tu masa muscular.",
      '-': "Buen equilibrio proteico para mantener tu composición corporal.",
    },
    amber: {
      '+': "Estás algo por encima. Asegúrate de que no desplaces otros nutrientes.",
      '-': "Estás algo por debajo. Podrías perder músculo con el tiempo.",
    },
    red: {
      '+': "Muy por encima. Puede ser innecesario si no entrenas regularmente.",
      '-': "Muy por debajo. Riesgo de pérdida muscular si se mantiene.",
    },
  },
  Recomposicion: {
    green: {
      '+': "Ingesta adecuada para recomposición: sostenés músculo mientras pierdes grasa.",
      '-': "Buen equilibrio. Mantendrás masa mientras reduces grasa.",
    },
    amber: {
      '+': "Algo por encima. Puede ser útil, pero no debe desplazar otros nutrientes clave.",
      '-': "Estás algo por debajo. Esto afecta la recomposición corporal.",
    },
    red: {
      '+': "Muy por encima. Puede romper el equilibrio nutricional necesario.",
      '-': "Muy por debajo. Afecta negativamente tus resultados de recomposición.",
    },
  },
  Rendimiento: {
    green: {
      '+': "Buen rango proteico para apoyar rendimiento y recuperación.",
      '-': "Ingesta equilibrada para soportar tu nivel de actividad.",
    },
    amber: {
      '+': "Ligeramente por encima. Bien si haces fuerza, pero no descuides hidratos.",
      '-': "Algo por debajo. Puedes tener problemas para recuperarte.",
    },
    red: {
      '+': "Demasiada proteína. Puede desplazar nutrientes clave como hidratos.",
      '-': "Muy poca proteína. Afecta recuperación, fuerza y rendimiento.",
    },
  },
};

const comentariosHidratos: Record<
  string,
  Record<'green' | 'amber' | 'red', Record<'+' | '-', string>>
> = {
  Bajar: {
    green: {
      '+': "Tu ingesta de hidratos está dentro del margen recomendado para una pérdida de peso saludable. Esto te permite tener energía sin frenar el progreso.",
      '-': "Estás dentro del margen óptimo. Este nivel de hidratos ayuda a mantener energía sin comprometer el déficit calórico.",
    },
    amber: {
      '+': "Estás algo por encima del rango recomendado. Podría ralentizar tu pérdida de grasa si no mantienes un balance calórico adecuado.",
      '-': "Estás algo por debajo del rango. Puedes sentir fatiga o hambre si esta situación se prolonga.",
    },
    red: {
      '+': "Estás muy por encima de lo recomendado. Esto puede dificultar alcanzar un déficit calórico, especialmente si los hidratos provienen de azúcares simples.",
      '-': "Ingesta muy baja de hidratos. Puedes experimentar fatiga, malestar y rendimiento reducido.",
    },
  },
  Subir: {
    green: {
      '+': "Buena cantidad de hidratos. Te aporta energía para entrenar y apoyar la ganancia muscular.",
      '-': "Estás en el rango correcto para favorecer el entrenamiento y la recuperación.",
    },
    amber: {
      '+': "Estás algo por encima. Vigila que no desplace proteínas o grasas saludables.",
      '-': "Estás algo por debajo. Esto podría afectar tu rendimiento si entrenas intensamente.",
    },
    red: {
      '+': "Estás muy por encima. Puede aumentar el almacenamiento de grasa si no hay suficiente estímulo físico.",
      '-': "Muy por debajo. Falta energía para entrenar y recuperarte adecuadamente.",
    },
  },
  Mantener: {
    green: {
      '+': "Tus hidratos están en el rango adecuado para mantener tu energía y composición corporal.",
      '-': "Ingesta equilibrada para mantener peso y rendimiento estable.",
    },
    amber: {
      '+': "Estás algo por encima. Puedes sentirte con energía, pero vigila si aparece ganancia de peso.",
      '-': "Estás algo por debajo. Puede afectar tu vitalidad o causar ansiedad por comida.",
    },
    red: {
      '+': "Muy por encima del rango. Esto puede generar ganancia de peso si no ajustas otros nutrientes.",
      '-': "Ingesta muy baja. Riesgo de cansancio, irritabilidad y menor rendimiento.",
    },
  },
  Recomposicion: {
    green: {
      '+': "Estás en un buen punto. Esta cantidad te da energía sin obstaculizar la quema de grasa.",
      '-': "Rango ideal para permitir entrenamiento y mejora corporal progresiva.",
    },
    amber: {
      '+': "Un poco por encima. Puede ser útil si entrenas fuerte, pero vigila el balance global.",
      '-': "Estás algo por debajo. Podrías tener menor rendimiento en entrenamientos exigentes.",
    },
    red: {
      '+': "Exceso importante. Puede frenar la pérdida de grasa en recomposición corporal.",
      '-': "Déficit fuerte. Riesgo de malestar y pérdida de rendimiento.",
    },
  },
  Rendimiento: {
    green: {
      '+': "Excelente. Te aporta energía sostenida para rendir y recuperarte.",
      '-': "Buen nivel para mantener fuerza, resistencia y claridad mental.",
    },
    amber: {
      '+': "Estás algo por encima. Puede ser útil en días de alta carga, pero ajústalo al contexto.",
      '-': "Estás algo por debajo. Puedes notar menor rendimiento o fatiga temprana.",
    },
    red: {
      '+': "Demasiado alto. Puede causar digestión lenta o sensación de pesadez.",
      '-': "Muy bajo. Afecta directamente tu rendimiento y recuperación.",
    },
  },
};

const comentariosGrasas: Record<
  string,
  Record<'green' | 'amber' | 'red', Record<'+' | '-', string>>
> = {
  Bajar: {
    green: {
      '+': "Tu ingesta de grasas está en un rango adecuado. Esto permite mantener funciones hormonales y energía sin frenar tu objetivo de pérdida de peso.",
      '-': "Buen control lipídico. Reduces calorías manteniendo salud metabólica.",
    },
    amber: {
      '+': "Estás algo por encima. Vigila que no te aleje del déficit calórico necesario para perder grasa.",
      '-': "Estás algo por debajo. Esto puede afectar funciones hormonales si se mantiene.",
    },
    red: {
      '+': "Ingesta muy alta de grasas. Puede frenar la pérdida de grasa corporal.",
      '-': "Ingesta muy baja. Riesgo de fatiga, desregulación hormonal y baja saciedad.",
    },
  },
  Subir: {
    green: {
      '+': "Buen aporte graso para apoyar funciones hormonales mientras ganas masa.",
      '-': "Aporte lipídico adecuado para permitir una ganancia limpia.",
    },
    amber: {
      '+': "Estás algo por encima. Aumenta el riesgo de ganar grasa junto con músculo.",
      '-': "Estás algo por debajo. Puede afectar tus niveles hormonales.",
    },
    red: {
      '+': "Demasiada grasa. Puedes estar almacenando más grasa corporal de la deseada.",
      '-': "Grasas demasiado bajas. Posibles consecuencias hormonales y menor energía.",
    },
  },
  Mantener: {
    green: {
      '+': "Ingesta grasa estable. Ayuda a mantener energía y composición corporal.",
      '-': "Buen equilibrio para sostener tu peso y salud.",
    },
    amber: {
      '+': "Estás algo por encima. Vigila si aumenta tu peso o sensación de pesadez.",
      '-': "Estás algo por debajo. Puede impactar tu vitalidad y saciedad.",
    },
    red: {
      '+': "Muy por encima del rango. Puede conducir a ganancia de grasa innecesaria.",
      '-': "Ingesta muy baja. Riesgo de alteración hormonal y malestar.",
    },
  },
  Recomposicion: {
    green: {
      '+': "Buen equilibrio de grasas. Apoya tu transformación corporal.",
      '-': "Reducción controlada. Mantienes energía y salud.",
    },
    amber: {
      '+': "Un poco alto. Puede frenar la recomposición si no hay control calórico.",
      '-': "Algo bajo. Cuida que no afecte tu metabolismo.",
    },
    red: {
      '+': "Exceso marcado. Podrías acumular grasa fácilmente.",
      '-': "Déficit graso fuerte. Afecta salud hormonal y rendimiento.",
    },
  },
  Rendimiento: {
    green: {
      '+': "Grasa bien gestionada. Buena fuente de energía para rendimiento sostenido.",
      '-': "Buen nivel. No compromete energía ni recuperación.",
    },
    amber: {
      '+': "Algo alto. Útil en deportes de resistencia, pero no debe desplazar otros nutrientes.",
      '-': "Algo bajo. Riesgo de fatiga en esfuerzos prolongados.",
    },
    red: {
      '+': "Muy alto. Puede causar pesadez y digestión lenta.",
      '-': "Muy bajo. Puede afectar energía, saciedad y balance hormonal.",
    },
  },
};

const comentariosSaturadas: Record<
  string,
  Record<'green' | 'amber' | 'red', Record<'+' | '-', string>>
> = {
  Bajar: {
    green: {
      '+': "Tu ingesta de grasas saturadas está dentro del rango recomendado. Esto es esencial para proteger tu salud cardiovascular mientras reduces peso.",
      '-': "Buen control de saturadas. Evitas su exceso sin comprometer tu alimentación.",
    },
    amber: {
      '+': "Estás algo por encima del rango. Podría dificultar la pérdida de grasa y afectar tu salud a largo plazo.",
      '-': "Estás algo por debajo. No es preocupante, pero asegúrate de tener un balance general adecuado.",
    },
    red: {
      '+': "Ingesta muy alta de saturadas. Riesgo elevado de efectos negativos en tu salud cardíaca.",
      '-': "Ingesta muy baja. No suele ser un problema, pero revisa que tu dieta esté equilibrada.",
    },
  },
  Subir: {
    green: {
      '+': "Estás en el rango aceptable. Las grasas saturadas deben mantenerse bajo control incluso en fase de volumen.",
      '-': "Control correcto de saturadas. Esto favorece una ganancia limpia y saludable.",
    },
    amber: {
      '+': "Estás algo por encima. Riesgo de ganar grasa corporal poco saludable.",
      '-': "Estás algo por debajo. Está bien si el resto de grasas están equilibradas.",
    },
    red: {
      '+': "Exceso preocupante de saturadas. Puede perjudicar tu salud metabólica.",
      '-': "Muy bajo en saturadas. Esto es positivo, pero revisa el balance general de grasas.",
    },
  },
  Mantener: {
    green: {
      '+': "Ingesta bajo control. Ideal para preservar la salud cardiovascular.",
      '-': "Buena gestión de saturadas. Ayuda a mantener tu bienestar a largo plazo.",
    },
    amber: {
      '+': "Estás algo por encima. Vigila fuentes como embutidos, bollería o fritos.",
      '-': "Estás algo por debajo. No es negativo, pero asegúrate de cubrir tus grasas saludables.",
    },
    red: {
      '+': "Demasiada grasa saturada. Esto puede elevar el colesterol y el riesgo cardiovascular.",
      '-': "Ingesta muy baja. No suele representar un problema.",
    },
  },
  Recomposicion: {
    green: {
      '+': "Ingesta controlada. Esto favorece la recomposición corporal sin riesgos para tu salud.",
      '-': "Buena gestión de grasas saturadas. Beneficia tu objetivo.",
    },
    amber: {
      '+': "Estás algo por encima. Puedes comprometer tus resultados si se mantiene.",
      '-': "Estás algo por debajo. En general, no es preocupante.",
    },
    red: {
      '+': "Exceso importante. Podría perjudicar tu salud y composición corporal.",
      '-': "Nivel muy bajo. Mantenerlo así no representa riesgos.",
    },
  },
  Rendimiento: {
    green: {
      '+': "Buen equilibrio. Mantienes energía sin exceder grasas poco saludables.",
      '-': "Buena gestión lipídica. Apoya tu rendimiento sin riesgos.",
    },
    amber: {
      '+': "Estás algo por encima. Podría afectar tu recuperación si se mantiene.",
      '-': "Estás algo por debajo. No suele tener impacto negativo.",
    },
    red: {
      '+': "Exceso severo. Puede comprometer salud y eficiencia metabólica.",
      '-': "Muy bajo en saturadas. Recomendable mantenerlo así.",
    },
  },
};

const comentariosAzucares: Record<
  string,
  Record<'green' | 'amber' | 'red', Record<'+' | '-', string>>
> = {
  Bajar: {
    green: {
      '+': "Ingesta de azúcares dentro de un rango saludable. Esto facilita el control del apetito y la pérdida de grasa.",
      '-': "Excelente. Mantienes bajo el consumo de azúcares sin comprometer tu energía.",
    },
    amber: {
      '+': "Estás algo por encima. Puede dificultar el déficit calórico si se mantiene.",
      '-': "Algo por debajo. No representa un riesgo, pero revisa tu energía general.",
    },
    red: {
      '+': "Exceso importante de azúcares. Dificulta el control del peso y puede aumentar el riesgo de antojos y picos glucémicos.",
      '-': "Ingesta muy baja. Puede ser beneficiosa, siempre que haya buenos carbohidratos complejos.",
    },
  },
  Subir: {
    green: {
      '+': "Buen rango. Apoyas tu energía sin pasarte con azúcares simples.",
      '-': "Ingesta controlada. Buena base para una ganancia limpia.",
    },
    amber: {
      '+': "Algo elevado. Cuidado con fuentes de azúcar refinada innecesaria.",
      '-': "Algo bajo. Vigila si notas falta de energía durante el día.",
    },
    red: {
      '+': "Exceso de azúcar. Podrías ganar grasa de forma indeseada.",
      '-': "Muy bajo. Puede afectar tu rendimiento o recuperación si no se compensa con otros carbohidratos.",
    },
  },
  Mantener: {
    green: {
      '+': "Buena gestión de azúcares. Ayuda a estabilizar energía y evitar fluctuaciones.",
      '-': "Ingesta equilibrada. Favorece estabilidad metabólica.",
    },
    amber: {
      '+': "Estás algo por encima. Podrías notar más hambre o cambios de humor si es constante.",
      '-': "Estás algo por debajo. Bien, si tu dieta es rica en alimentos integrales.",
    },
    red: {
      '+': "Exceso significativo. Riesgo de acumulación de grasa y cansancio tras los picos.",
      '-': "Muy bajo. No es un problema si hay buena base de hidratos complejos.",
    },
  },
  Recomposicion: {
    green: {
      '+': "Equilibrio adecuado. Tienes energía sin comprometer la pérdida de grasa.",
      '-': "Control ideal de azúcares. Apoya una recomposición saludable.",
    },
    amber: {
      '+': "Algo por encima. Reduce el azúcar simple si buscas más definición.",
      '-': "Algo por debajo. Cuida tu energía si haces entrenamientos intensos.",
    },
    red: {
      '+': "Demasiado azúcar. Dificulta la mejora de tu composición corporal.",
      '-': "Muy bajo. Bien si estás compensando con hidratos complejos.",
    },
  },
  Rendimiento: {
    green: {
      '+': "Buen rango. Aporta energía sin sobrecargar el sistema.",
      '-': "Bien. Mantienes la glucosa estable sin déficit.",
    },
    amber: {
      '+': "Algo elevado. Puede ser útil antes o después del ejercicio, pero cuidado con el exceso diario.",
      '-': "Algo bajo. Puede afectar tu rendimiento en sesiones largas.",
    },
    red: {
      '+': "Exceso grave. Riesgo de fatiga post-ingesta y acumulación de grasa.",
      '-': "Muy bajo. Revisa tu energía si haces ejercicio intenso.",
    },
  },
};

const comentariosFibra: Record<
  string,
  Record<'green' | 'amber' | 'red', Record<'+' | '-', string>>
> = {
  Bajar: {
    green: {
      '+': "Excelente. Buena cantidad de fibra para controlar el apetito y mejorar la digestión mientras pierdes grasa.",
      '-': "Rango saludable. Tienes una ingesta suficiente para favorecer la saciedad sin excesos.",
    },
    amber: {
      '+': "Estás algo por encima. Podrías experimentar digestión lenta o gases si se mantiene.",
      '-': "Estás algo por debajo. Esto puede dificultar el control del hambre.",
    },
    red: {
      '+': "Exceso de fibra. Riesgo de malestar intestinal, hinchazón o baja absorción de nutrientes.",
      '-': "Déficit importante. Puede dificultar la digestión y el control de peso.",
    },
  },
  Subir: {
    green: {
      '+': "Ingesta adecuada. Ayuda a regular la digestión y controlar el apetito durante tu fase de ganancia.",
      '-': "Buen equilibrio. No comprometes la digestión ni la energía.",
    },
    amber: {
      '+': "Algo elevada. Vigila si notas gases o digestión pesada.",
      '-': "Estás algo por debajo. Puede afectar tu salud digestiva.",
    },
    red: {
      '+': "Fibra excesiva. Podría interferir en la absorción de calorías y nutrientes clave.",
      '-': "Muy baja. Riesgo de estreñimiento o falta de saciedad.",
    },
  },
  Mantener: {
    green: {
      '+': "Perfecto. Tienes un consumo adecuado de fibra para mantener la salud digestiva.",
      '-': "Buen nivel. Promueve la regularidad y bienestar intestinal.",
    },
    amber: {
      '+': "Estás algo por encima. Controla la sensación de pesadez si aparece.",
      '-': "Estás algo por debajo. Vigila si aparece estreñimiento o ansiedad por comida.",
    },
    red: {
      '+': "Exceso de fibra. Posibles molestias gastrointestinales.",
      '-': "Muy bajo. Afecta negativamente la salud digestiva y el metabolismo.",
    },
  },
  Recomposicion: {
    green: {
      '+': "Buen aporte de fibra. Ayuda a regular el apetito y mejorar composición corporal.",
      '-': "Ingesta equilibrada. Favorece recomposición sin molestias digestivas.",
    },
    amber: {
      '+': "Estás algo por encima. Bien si no hay molestias, pero vigila síntomas intestinales.",
      '-': "Estás algo por debajo. Puede dificultar el control de la alimentación.",
    },
    red: {
      '+': "Demasiada fibra. Puede afectar tu rendimiento y absorción de nutrientes.",
      '-': "Muy baja. Riesgo de hambre continua y salud digestiva deficiente.",
    },
  },
  Rendimiento: {
    green: {
      '+': "Perfecto. Buen soporte digestivo sin afectar la energía.",
      '-': "Bien. Nivel estable para mantener rendimiento y digestión.",
    },
    amber: {
      '+': "Algo por encima. Si sientes pesadez o hinchazón, reduce un poco.",
      '-': "Algo bajo. Vigila si se presentan problemas digestivos.",
    },
    red: {
      '+': "Exceso grave. Puede afectar tu comodidad al entrenar.",
      '-': "Muy bajo. Impacta negativamente en tu salud digestiva y recuperación.",
    },
  },
};

const comentariosHierro: Record<
  string,
  Record<'green' | 'amber' | 'red', Record<'+' | '-', string>>
> = {
  Bajar: {
    green: {
      '+': "Tienes una ingesta adecuada de hierro. Esto ayuda a mantener tus niveles de energía y a prevenir la fatiga durante el déficit calórico.",
      '-': "Buen nivel de hierro. Ayuda a prevenir anemia y te permite sostener el rendimiento mientras bajas de peso.",
    },
    amber: {
      '+': "Estás algo por encima. No suele ser problemático, pero evita suplementos sin control médico.",
      '-': "Estás algo por debajo. Vigila si notas fatiga, palidez o dificultad para concentrarte.",
    },
    red: {
      '+': "Ingesta muy alta. El exceso de hierro puede ser tóxico si se prolonga. Consulta con un profesional si tomas suplementos.",
      '-': "Déficit importante. Riesgo de anemia, fatiga crónica y menor rendimiento físico.",
    },
  },
  Subir: {
    green: {
      '+': "Ingesta adecuada. Favorece el transporte de oxígeno y tu capacidad para entrenar intensamente.",
      '-': "Buen nivel para apoyar tu metabolismo y rendimiento físico.",
    },
    amber: {
      '+': "Algo elevado. Precaución si consumes suplementos, no es necesario sobrepasar.",
      '-': "Estás algo bajo. Vigila si sientes agotamiento o falta de fuerza.",
    },
    red: {
      '+': "Demasiado hierro. Puede generar malestar digestivo o daño hepático a largo plazo.",
      '-': "Muy bajo. Puede comprometer tu progreso y recuperación muscular.",
    },
  },
  Mantener: {
    green: {
      '+': "Buen equilibrio. Apoya tu salud general y niveles de energía.",
      '-': "Nivel adecuado para mantener la función inmune y metabolismo estable.",
    },
    amber: {
      '+': "Estás algo por encima. Revisa tu fuente de hierro si usas suplementos.",
      '-': "Estás algo por debajo. Aumenta alimentos ricos en hierro como carnes, legumbres o vegetales verdes.",
    },
    red: {
      '+': "Exceso alto. Consulta con un profesional si es habitual.",
      '-': "Muy bajo. Riesgo de debilidad, mareos o dificultad para concentrarte.",
    },
  },
  Recomposicion: {
    green: {
      '+': "Buen nivel. El hierro favorece el rendimiento y recuperación muscular.",
      '-': "Nivel adecuado para apoyar tu recomposición corporal sin fatiga.",
    },
    amber: {
      '+': "Ligeramente elevado. Si no usas suplementos, probablemente sin riesgo.",
      '-': "Algo bajo. Puedes sentir menos energía en tus entrenamientos.",
    },
    red: {
      '+': "Muy por encima. Posible riesgo hepático a largo plazo si se mantiene.",
      '-': "Déficit importante. Dificulta la oxigenación muscular y el rendimiento.",
    },
  },
  Rendimiento: {
    green: {
      '+': "Excelente. Buen nivel para sostener entrenamientos intensos y recuperación.",
      '-': "Buen equilibrio de hierro. Favorece el rendimiento aeróbico y concentración.",
    },
    amber: {
      '+': "Algo alto. Si tomas suplementos, revisa la dosis con un profesional.",
      '-': "Algo bajo. Puedes notar una leve reducción de resistencia o fatiga temprana.",
    },
    red: {
      '+': "Exceso significativo. Riesgo de toxicidad si se mantiene. Precaución.",
      '-': "Muy bajo. Afecta directamente a tu rendimiento y recuperación.",
    },
  },
};

const comentariosCalcio: Record<
  string,
  Record<'green' | 'amber' | 'red', Record<'+' | '-', string>>
> = {
  Bajar: {
    green: {
      '+': "Ingesta óptima. Ayuda a mantener tu salud ósea incluso durante el déficit calórico.",
      '-': "Buen nivel. Es suficiente para cubrir tus necesidades sin excesos.",
    },
    amber: {
      '+': "Estás algo por encima. Si proviene de suplementos, revisa la dosis con un profesional.",
      '-': "Estás algo por debajo. Aumenta lácteos, vegetales verdes o bebidas enriquecidas.",
    },
    red: {
      '+': "Exceso alto. Riesgo de cálculos renales o interferencias con otros nutrientes.",
      '-': "Déficit importante. Riesgo de pérdida de masa ósea si se mantiene.",
    },
  },
  Subir: {
    green: {
      '+': "Buen nivel. Soporta el crecimiento muscular y la contracción adecuada durante el entrenamiento.",
      '-': "Ingesta suficiente para sostener metabolismo y salud ósea.",
    },
    amber: {
      '+': "Algo elevado. Revisa si tomas suplementos adicionales sin indicación.",
      '-': "Estás algo bajo. Aumenta fuentes como yogur, queso o vegetales verdes.",
    },
    red: {
      '+': "Muy por encima del rango. Posible riesgo renal si se mantiene.",
      '-': "Muy bajo. Puede comprometer la recuperación y la fortaleza ósea.",
    },
  },
  Mantener: {
    green: {
      '+': "Nivel adecuado. Apoya huesos fuertes y función muscular.",
      '-': "Buena ingesta para mantener equilibrio mineral.",
    },
    amber: {
      '+': "Algo por encima. Evita suplementos innecesarios si ya comes bien.",
      '-': "Estás algo por debajo. Revisa tu dieta para asegurar cobertura.",
    },
    red: {
      '+': "Exceso importante. Riesgo de toxicidad si se sostiene.",
      '-': "Déficit significativo. Puede aumentar riesgo de osteoporosis a largo plazo.",
    },
  },
  Recomposicion: {
    green: {
      '+': "Ingesta ideal. Ayuda a sostener huesos y contracción muscular mientras mejoras tu composición corporal.",
      '-': "Buen nivel de calcio. Apoya tu salud ósea sin excesos.",
    },
    amber: {
      '+': "Ligeramente alto. Solo relevante si estás suplementando.",
      '-': "Algo bajo. Aumenta alimentos ricos en calcio para evitar pérdida ósea.",
    },
    red: {
      '+': "Muy elevado. No aporta beneficios adicionales y puede generar molestias renales.",
      '-': "Muy bajo. Riesgo de debilidad ósea o calambres frecuentes.",
    },
  },
  Rendimiento: {
    green: {
      '+': "Óptimo. Mantiene tus músculos y sistema nervioso funcionando correctamente.",
      '-': "Nivel saludable para apoyar rendimiento sostenido.",
    },
    amber: {
      '+': "Estás algo por encima. Evita el uso prolongado de suplementos sin control.",
      '-': "Ligeramente bajo. Puede afectar la contracción muscular y aumentar riesgo de calambres.",
    },
    red: {
      '+': "Exceso elevado. Riesgo potencial para la salud renal.",
      '-': "Muy bajo. Afecta rendimiento físico, concentración y salud ósea.",
    },
  },
};

const comentariosSodio: Record<
  string,
  Record<'green' | 'amber' | 'red', Record<'+' | '-', string>>
> = {
  Bajar: {
    green: {
      '+': "Tu nivel de sodio está en rango adecuado. Es clave para evitar retención de líquidos durante la pérdida de peso.",
      '-': "Ingesta equilibrada. Te ayuda a mantener el balance hídrico sin excesos.",
    },
    amber: {
      '+': "Estás algo por encima. Revisa si estás consumiendo alimentos procesados o muy salados.",
      '-': "Estás algo bajo. Si sudas mucho o haces ejercicio, asegúrate de reponer electrolitos.",
    },
    red: {
      '+': "Ingesta muy alta. Riesgo de retención, hinchazón y presión arterial elevada.",
      '-': "Muy bajo. Posible deshidratación o desequilibrio si haces mucho ejercicio.",
    },
  },
  Subir: {
    green: {
      '+': "Nivel saludable. Soporta la hidratación adecuada durante el entrenamiento.",
      '-': "Ingesta suficiente para mantener equilibrio electrolítico.",
    },
    amber: {
      '+': "Estás algo elevado. Modera el consumo de sal añadida.",
      '-': "Estás algo por debajo. Considera aumentar ligeramente si sudas mucho.",
    },
    red: {
      '+': "Muy alto. Riesgo de sobrecarga cardiovascular o fatiga.",
      '-': "Muy bajo. Puede generar mareos, calambres o debilidad en el entrenamiento.",
    },
  },
  Mantener: {
    green: {
      '+': "Buen nivel. Apoya el balance hídrico y la presión arterial normal.",
      '-': "Ingesta adecuada para mantener el equilibrio electrolítico.",
    },
    amber: {
      '+': "Estás algo por encima. Revisa el consumo de snacks salados o embutidos.",
      '-': "Estás algo bajo. No suele ser grave, pero atención si sientes mareos.",
    },
    red: {
      '+': "Exceso importante. Riesgo de hipertensión o retención si se mantiene.",
      '-': "Déficit importante. Consulta si notas síntomas persistentes.",
    },
  },
  Recomposicion: {
    green: {
      '+': "Buen rango. Te ayuda a evitar hinchazón y mantener el equilibrio de líquidos.",
      '-': "Nivel correcto para sostener el metabolismo sin interferencias.",
    },
    amber: {
      '+': "Algo alto. Vigila si aparece retención o peso fluctuante.",
      '-': "Algo bajo. Asegura una hidratación completa, sobre todo si entrenas.",
    },
    red: {
      '+': "Muy alto. Puede dificultar la definición y generar presión elevada.",
      '-': "Muy bajo. Riesgo de deshidratación o calambres musculares.",
    },
  },
  Rendimiento: {
    green: {
      '+': "Óptimo. Apoya el rendimiento y recuperación post-ejercicio.",
      '-': "Buen nivel de sodio para sostener tu esfuerzo físico.",
    },
    amber: {
      '+': "Algo por encima. Si no haces actividad intensa, modera la sal.",
      '-': "Algo bajo. Revisa tu hidratación y repones electrolitos tras entrenar.",
    },
    red: {
      '+': "Exceso elevado. Puede impactar tu salud cardiovascular a largo plazo.",
      '-': "Muy bajo. Desbalance hídrico que afecta el rendimiento.",
    },
  },
};

const comentariosPotasio: Record<
  string,
  Record<'green' | 'amber' | 'red', Record<'+' | '-', string>>
> = {
  Bajar: {
    green: {
      '+': "Ingesta adecuada. Te ayuda a mantener equilibrio hídrico y evitar la retención causada por el sodio.",
      '-': "Nivel correcto. Soporta la función muscular y nerviosa durante tu pérdida de peso.",
    },
    amber: {
      '+': "Estás algo elevado. Revisa si tomas suplementos sin necesidad.",
      '-': "Estás algo por debajo. Aumenta frutas como plátano o aguacate.",
    },
    red: {
      '+': "Nivel muy alto. Si no tienes indicación médica, evita suplementos excesivos.",
      '-': "Muy bajo. Riesgo de fatiga, calambres y alteraciones cardíacas.",
    },
  },
  Subir: {
    green: {
      '+': "Buen aporte de potasio. Mejora la contracción muscular y recuperación.",
      '-': "Nivel saludable para apoyar tu entrenamiento y evitar calambres.",
    },
    amber: {
      '+': "Algo elevado. Puede ser útil si entrenas fuerte, pero sin abusos.",
      '-': "Algo bajo. Aumenta frutas y verduras para mejorar tu recuperación.",
    },
    red: {
      '+': "Muy alto. Puede causar molestias si se combina con suplementos innecesarios.",
      '-': "Muy bajo. Riesgo de fatiga, mareos o debilidad muscular.",
    },
  },
  Mantener: {
    green: {
      '+': "Ingesta óptima. Contribuye al buen funcionamiento del corazón y músculos.",
      '-': "Buen nivel de potasio para mantener tu equilibrio general.",
    },
    amber: {
      '+': "Estás algo por encima. Cuidado con suplementos o bebidas deportivas.",
      '-': "Estás algo bajo. Aumenta alimentos frescos como kiwi, plátano o espinacas.",
    },
    red: {
      '+': "Exceso elevado. Consulta si tienes problemas renales o cardíacos.",
      '-': "Déficit importante. Puede afectar tus nervios y musculatura.",
    },
  },
  Recomposicion: {
    green: {
      '+': "Nivel ideal. Soporta el metabolismo activo y la contracción muscular.",
      '-': "Buen equilibrio. Ayuda a evitar retención y mejora el entorno metabólico.",
    },
    amber: {
      '+': "Ligeramente alto. Si estás suplementando, revisa la dosis.",
      '-': "Algo bajo. Aumenta frutas y hortalizas para mejorar la recomposición.",
    },
    red: {
      '+': "Muy alto. Evita el exceso si no tienes indicación profesional.",
      '-': "Muy bajo. Puede reducir tu rendimiento y dificultar tus resultados.",
    },
  },
  Rendimiento: {
    green: {
      '+': "Buen nivel. Apoya la contracción muscular y previene calambres.",
      '-': "Nivel correcto para sostener la intensidad de tus entrenamientos.",
    },
    amber: {
      '+': "Algo alto. Puede ser útil si entrenas con mucha sudoración.",
      '-': "Algo bajo. Revisa tu hidratación y dieta si notas calambres.",
    },
    red: {
      '+': "Exceso importante. Puede generar desequilibrios si no está controlado.",
      '-': "Muy bajo. Afecta directamente fuerza, energía y recuperación.",
    },
  },
};

// ✅ Diccionario unificado de comentarios por nutriente
const comentariosPorNutriente: Record<
  string,
  Record<string, Record<'green' | 'amber' | 'red', Record<'+' | '-', string>>>
> = {
  'Proteínas': comentariosProteinas,
  'Hidratos.C': comentariosHidratos,
  'Grasas': comentariosGrasas,
  'G. Saturadas': comentariosSaturadas,
  'Azúcares': comentariosAzucares,
  'Fibra': comentariosFibra,
  'Hierro': comentariosHierro,
  'Calcio': comentariosCalcio,
  'Sodio': comentariosSodio,
  'Potasio': comentariosPotasio, 
};

// ✅ Función única para obtener el comentario
function generarComentario(
  nutriente: string,
  desviacion: number,
  color: 'green' | 'amber' | 'red',
  objetivo: string
): string {
  const signo = desviacion >= 0 ? '+' : '-';
  const mapa = comentariosPorNutriente[nutriente];
  if (!mapa) return 'Comentario no disponible para este nutriente.';
  const objetivoNormalizado = mapa[objetivo] ? objetivo : 'Mantener';
  return mapa[objetivoNormalizado]?.[color]?.[signo] || 'Comentario no disponible.';
}

const EvaluacionNutricional: React.FC<{ datos: NutrienteData[] }> = ({ datos }) => {
  const { perfil } = useAuth();
  const objetivo = perfil?.objetivo || 'Mantener';

  const [popupTexto, setPopupTexto] = useState('');
  const [popupNutriente, setPopupNutriente] = useState('');
  const [mostrarPopup, setMostrarPopup] = useState(false);

  const unidadMap: Record<string, string> = {
    'Proteínas': 'g',
    'Hidratos.C': 'g',
    'Grasas': 'g',
    'G. Saturadas': 'g',
    'Azúcares': 'g',
    'Fibra': 'g',
    'Hierro': 'mg',
    'Calcio': 'mg',
    'Sodio': 'mg',
    'Potasio': 'mg',
  };

  const evaluarNutriente = (
    nutriente: string,
    ingerido: number,
    recomendado: number
  ): EvaluacionResultado => {
    const unidad = unidadMap[nutriente] || 'g';
    if (recomendado === 0) {
      return {
        nutriente,
        ingerido: 0,
        recomendado: 0,
        desviacionPorcentual: 'N/A',
        estado: 'correcto',
        color: 'green',
        unidad,
      };
    }

    const porcentaje = (ingerido / recomendado) * 100;
    const desviacion = Math.round(porcentaje - 100);
    const absDesv = Math.abs(desviacion);
    let estado: 'correcto' | 'exceso' | 'defecto' = 'correcto';
    let color: 'green' | 'amber' | 'red' = 'green';

    if (desviacion < 0) {
      estado = 'defecto';
      color = absDesv <= 10 ? 'green' : absDesv <= 30 ? 'amber' : 'red';
    } else if (desviacion > 0) {
      estado = 'exceso';
      color = absDesv <= 10 ? 'green' : absDesv <= 30 ? 'amber' : 'red';
    }

    return {
      nutriente,
      ingerido: Math.round(ingerido),
      recomendado: Math.round(recomendado),
      desviacionPorcentual: `${desviacion >= 0 ? '+' : ''}${desviacion}%`,
      estado,
      color,
      unidad,
    };
  };

  const resultados = datos.map(d =>
    evaluarNutriente(d.nutriente, d.ingerido, d.recomendado)
  );

  // ✅ Handler unificado para todos los nutrientes con comentarios disponibles
  const handleClickComentario = (r: EvaluacionResultado) => {
    if (!comentariosPorNutriente[r.nutriente]) return;
    const valor = parseInt(r.desviacionPorcentual);
    const texto = generarComentario(r.nutriente, valor, r.color, objetivo);
    setPopupTexto(texto);
    setPopupNutriente(r.nutriente);
    setMostrarPopup(true);
  };

  return (
    <div className="evaluacion-nutricional">
      <h3 className="titulo-tarjeta">🍽️ Evaluación de nutrientes</h3>

      <table>
        <thead>
          <tr>
            <th>Nutr.</th>
            <th>Inger.</th>
            <th>Recom.</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {resultados.map((r, idx) => (
            <tr key={idx}>
              <td>{r.nutriente}</td>
              <td>{r.ingerido.toLocaleString('es-ES')} {r.unidad}</td>
              <td>{r.recomendado.toLocaleString('es-ES')} {r.unidad}</td>
              <td
                className={`porcentaje ${r.color}`}
                style={{ cursor: comentariosPorNutriente[r.nutriente] ? 'pointer' : 'default' }}
                onClick={() => handleClickComentario(r)}
              >
                {r.desviacionPorcentual}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarPopup && (
        <div className="popup-overlay" onClick={() => setMostrarPopup(false)}>
          <div className="popup-contenido" onClick={(e) => e.stopPropagation()}>
            <h4>💬 Comentario sobre {popupNutriente}</h4>
            <p>{popupTexto}</p>
            <button onClick={() => setMostrarPopup(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluacionNutricional;




