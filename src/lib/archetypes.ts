export type ArchetypeName =
  | "El Mago"
  | "El Rebelde"
  | "El Héroe"
  | "El Amante"
  | "El Creador"
  | "El Explorador"
  | "El Gobernante"
  | "El Sabio"
  | "El Bufón"
  | "El Inocente"
  | "El Cuidador"
  | "El Ciudadano";

export type Archetype = {
  name: ArchetypeName;
  emoji: string;
  color: string;
  bgColor: string;
  tagline: string;
  description: string;
  strengths: string[];
  contentStyle: string;
  referenceBrands: string[];
};

export const ARCHETYPES: Record<ArchetypeName, Archetype> = {
  "El Mago": {
    name: "El Mago",
    emoji: "✨",
    color: "#7C3AED",
    bgColor: "#F5F3FF",
    tagline: "Transformas realidades y creas lo que parecía imposible",
    description:
      "Tu marca transforma. Combinas visión, emoción y liderazgo disruptivo para crear experiencias que cambian personas. No solo inspiras — cambias realidades. Tu audiencia te sigue porque contigo todo parece posible.",
    strengths: [
      "Lanzamientos de alto impacto",
      "Narrativa transformacional",
      "Contenido que cambia paradigmas",
      "Campañas inspiracionales",
    ],
    contentStyle: "Visionario, intenso y emocionalmente poderoso",
    referenceBrands: ["Apple", "Disney", "Red Bull"],
  },
  "El Rebelde": {
    name: "El Rebelde",
    emoji: "🔥",
    color: "#DC2626",
    bgColor: "#FEF2F2",
    tagline: "Rompes reglas y muestras que existe otra manera",
    description:
      "Tu marca desafía. Eres disruptivo/a, apasionado/a y no tienes miedo de decir lo que los demás callan. Tu audiencia te sigue porque les das permiso de pensar diferente y cuestionar lo establecido.",
    strengths: [
      "Contenido controversia y de opinión",
      "Storytelling personal crudo",
      "Posicionamiento anticonvencional",
      "Videos de alto impacto emocional",
    ],
    contentStyle: "Directo, apasionado y sin filtros",
    referenceBrands: ["Harley Davidson", "Patagonia", "Banksy"],
  },
  "El Héroe": {
    name: "El Héroe",
    emoji: "🏆",
    color: "#B45309",
    bgColor: "#FFFBEB",
    tagline: "Superas obstáculos e inspiras a otros a hacer lo mismo",
    description:
      "Tu marca inspira a través de la acción. Muestras el camino con tu ejemplo y tu audiencia te sigue porque ven en ti la prueba de que es posible. Eres la persona que ya lo logró y ahora lleva a otros con ella.",
    strengths: [
      "Casos de éxito y resultados reales",
      "Storytelling de superación",
      "Contenido motivacional",
      "Testimonios y transformaciones",
    ],
    contentStyle: "Motivacional, directo y orientado a resultados",
    referenceBrands: ["Nike", "Under Armour", "Adidas"],
  },
  "El Amante": {
    name: "El Amante",
    emoji: "💜",
    color: "#BE185D",
    bgColor: "#FDF2F8",
    tagline: "Creas una conexión profunda a través de la pasión y la belleza",
    description:
      "Tu marca conecta desde el corazón. Tienes una intensidad y una sensibilidad que hacen que tu audiencia se sienta vista y especial. Tu contenido no se consume — se siente. Generas vínculos profundos y una comunidad fiel.",
    strengths: [
      "Contenido estético y emocional",
      "Comunidad íntima y muy fiel",
      "Storytelling sensorial y sensible",
      "Productos y servicios premium",
    ],
    contentStyle: "Íntimo, apasionado y emocionalmente intenso",
    referenceBrands: ["Chanel", "Lululemon", "Victoria's Secret"],
  },
  "El Creador": {
    name: "El Creador",
    emoji: "🎨",
    color: "#0891B2",
    bgColor: "#ECFEFF",
    tagline: "Innovas y creas experiencias únicas con tu sello propio",
    description:
      "Tu marca crea. Eres estratégico/a e innovador/a, y tu diferencial es la originalidad con intención. Combinas creatividad con estructura, y el resultado son piezas que la gente recuerda y quiere replicar.",
    strengths: [
      "Contenido visual de alto impacto",
      "Formatos innovadores y propios",
      "Proyectos creativos editoriales",
      "Tendencias que tú marcas",
    ],
    contentStyle: "Creativo, estructurado y visualmente distintivo",
    referenceBrands: ["Lego", "Adobe", "Dyson"],
  },
  "El Explorador": {
    name: "El Explorador",
    emoji: "🧭",
    color: "#059669",
    bgColor: "#ECFDF5",
    tagline: "Siempre buscas lo nuevo y llevas a tu audiencia a descubrirlo",
    description:
      "Tu marca explora. Eres curioso/a, independiente y siempre en búsqueda de perspectivas frescas. Tu audiencia te sigue porque contigo siempre hay algo nuevo por descubrir, explorar y experimentar.",
    strengths: [
      "Contenido de tendencias y novedades",
      "Reviews, análisis y experimentos",
      "Contenido detrás de escena",
      "Nichos de vanguardia",
    ],
    contentStyle: "Curioso, auténtico y siempre en movimiento",
    referenceBrands: ["National Geographic", "GoPro", "The North Face"],
  },
  "El Gobernante": {
    name: "El Gobernante",
    emoji: "👑",
    color: "#1D4ED8",
    bgColor: "#EFF6FF",
    tagline: "Lideras con autoridad, expertise y resultados probados",
    description:
      "Tu marca lidera. Proyectas autoridad y confianza desde el conocimiento y la trayectoria. Tu audiencia te sigue porque saben que lo que dices funciona — tienes el track record para probarlo.",
    strengths: [
      "Contenido de autoridad y expertise",
      "Estrategias y frameworks propios",
      "Posicionamiento premium",
      "Webinars y masterclasses",
    ],
    contentStyle: "Autorizado, estructurado y profesional",
    referenceBrands: ["McKinsey", "Harvard", "Rolex"],
  },
  "El Sabio": {
    name: "El Sabio",
    emoji: "🦉",
    color: "#7E22CE",
    bgColor: "#FAF5FF",
    tagline: "Compartes conocimiento profundo que transforma perspectivas",
    description:
      "Tu marca ilumina. Eres la fuente de referencia en tu industria — la persona a quien todos acuden cuando quieren entender algo de verdad. Tu contenido no solo informa: cambia la manera en que la gente piensa.",
    strengths: [
      "Contenido educativo de profundidad",
      "Frameworks y metodologías propias",
      "Newsletters y artículos de análisis",
      "Podcasts y entrevistas de fondo",
    ],
    contentStyle: "Profundo, analítico y transformador en ideas",
    referenceBrands: ["TED", "National Geographic", "Wikipedia"],
  },
  "El Bufón": {
    name: "El Bufón",
    emoji: "🎭",
    color: "#EA580C",
    bgColor: "#FFF7ED",
    tagline: "Haces que aprender y conectar sea divertido e irresistible",
    description:
      "Tu marca entretiene. Tienes la habilidad única de hacer que la gente aprenda sin darse cuenta, riéndose. Tu audiencia no solo te sigue — te espera. Creas comunidad a través del humor y la irreverencia.",
    strengths: [
      "Contenido viral y de entretenimiento",
      "Humor educativo y memorable",
      "Formatos creativos y dinámicos",
      "Alto engagement orgánico",
    ],
    contentStyle: "Divertido, irreverente y memorable",
    referenceBrands: ["Old Spice", "MrBeast", "Dollar Shave Club"],
  },
  "El Inocente": {
    name: "El Inocente",
    emoji: "🌟",
    color: "#D97706",
    bgColor: "#FFFBEB",
    tagline: "Muestras que la autenticidad pura es el mayor diferencial",
    description:
      "Tu marca es refrescante. En un mundo de poses y estrategias, tú apareces como eres — y eso es exactamente lo que tu audiencia necesita. Tu honestidad y tu visión positiva son tu mayor diferencial.",
    strengths: [
      "Contenido auténtico y sin filtros",
      "Storytelling personal genuino",
      "Conexión emocional directa",
      "Comunidades de alta lealtad",
    ],
    contentStyle: "Honesto, positivo y naturalmente auténtico",
    referenceBrands: ["Dove", "Aveeno", "Innocent Drinks"],
  },
  "El Cuidador": {
    name: "El Cuidador",
    emoji: "🌿",
    color: "#16A34A",
    bgColor: "#F0FDF4",
    tagline: "Nutrices el crecimiento de otros con empatía y dedicación genuina",
    description:
      "Tu marca sostiene. Tienes una capacidad única de hacer que tu audiencia se sienta vista, acompañada y protegida. Tu contenido no solo da información — da contención. Y eso crea vínculos para toda la vida.",
    strengths: [
      "Contenido de acompañamiento y soporte",
      "Comunidades cálidas y comprometidas",
      "Programas de transformación profunda",
      "Email marketing personal y cercano",
    ],
    contentStyle: "Empático, cálido y profundamente humano",
    referenceBrands: ["Johnson & Johnson", "Headspace", "BetterHelp"],
  },
  "El Ciudadano": {
    name: "El Ciudadano",
    emoji: "🤝",
    color: "#0369A1",
    bgColor: "#F0F9FF",
    tagline: "Conectas porque eres exactamente como tu audiencia: real y cercano",
    description:
      "Tu marca conecta. Eres relatable al 100% — tu audiencia te sigue porque se ve reflejada en ti. No construyes un pedestal, construyes una comunidad donde todos se sienten bienvenidos e incluidos.",
    strengths: [
      "Contenido relatable y cotidiano",
      "Comunidades grandes y diversas",
      "Formatos conversacionales",
      "Alianzas y colaboraciones",
    ],
    contentStyle: "Cercano, inclusivo y conversacional",
    referenceBrands: ["IKEA", "Reddit", "Mercado Libre"],
  },
};

// 12 preguntas × 4 dimensiones (3 preguntas cada una)
// Dimension M (Motivación): left=Conexión, right=Logro/Impacto
// Dimension E (Expresión): left=Racional, right=Emocional
// Dimension I (Innovación): left=Clásico, right=Disruptivo
// Dimension R (Rol): left=Facilita, right=Guía/Lidera
//
// Cada pregunta enfrenta dos afirmaciones igual de válidas/positivas (ninguna
// suena "mejor" que la otra) para no sesgar las respuestas hacia un solo polo
// — antes, casi todas las afirmaciones apuntaban al polo "aspiracional" (líder,
// disruptivo, con logros), por lo que casi cualquier usuario terminaba dando
// "Alto" en las 4 dimensiones y siempre caía en El Mago (HHHH).
export type QuizQuestion = {
  id: number;
  dimension: "M" | "E" | "I" | "R";
  left: string;
  right: string;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Motivación
  {
    id: 1,
    dimension: "M",
    left: "Mi prioridad es construir una comunidad cercana y genuina en torno a mi marca",
    right: "Mi prioridad es destacar, lograr resultados tangibles y ser reconocido/a en mi industria",
  },
  {
    id: 2,
    dimension: "M",
    left: "Prefiero sentirme parte de mi comunidad, entre pares, más que por encima como líder",
    right: "Prefiero ser el referente y líder visible de mi nicho, más que uno más del grupo",
  },
  {
    id: 3,
    dimension: "M",
    left: "Me motiva más el crecimiento colectivo de mi comunidad que mis logros individuales",
    right: "Me motivan más mis logros individuales concretos que el crecimiento colectivo de mi comunidad",
  },
  // Expresión
  {
    id: 4,
    dimension: "E",
    left: "En mis contenidos, priorizo datos, argumentos y análisis claros",
    right: "En mis contenidos, priorizo conectar desde la emoción y la experiencia personal",
  },
  {
    id: 5,
    dimension: "E",
    left: "Prefiero que mi audiencia me perciba como una autoridad sólida y confiable en el tema",
    right: "Prefiero que mi audiencia me sienta cercano/a y humano/a, más que una autoridad distante",
  },
  {
    id: 6,
    dimension: "E",
    left: "Suelo mantener mis procesos y vulnerabilidades en privado, mostrando resultados más que el camino",
    right: "Comparto abiertamente mis vulnerabilidades, miedos y procesos internos con mi comunidad",
  },
  // Innovación
  {
    id: 7,
    dimension: "I",
    left: "Prefiero seguir los métodos ya probados y confiables de mi industria",
    right: "Parte de mi identidad de marca es hacer las cosas de manera diferente a lo acostumbrado en mi industria",
  },
  {
    id: 8,
    dimension: "I",
    left: "Me siento cómodo/a siguiendo las tendencias establecidas de mi nicho",
    right: "Me genera incomodidad seguir las tendencias o hacer las cosas 'como siempre se hacen'",
  },
  {
    id: 9,
    dimension: "I",
    left: "Prefiero un método probado y seguro antes que arriesgarme con algo experimental",
    right: "Prefiero arriesgarme con algo experimental y creativo antes que seguir un método probado",
  },
  // Rol
  {
    id: 10,
    dimension: "R",
    left: "Prefiero acompañar y facilitar para que cada quien encuentre su propio camino",
    right: "Me siento cómodo/a siendo la figura de autoridad que señala el camino a seguir",
  },
  {
    id: 11,
    dimension: "R",
    left: "En mis contenidos, invito a cada persona a encontrar su propio camino más que darle una única dirección",
    right: "En mis contenidos, doy una dirección clara y estructurada más que invitar a cada quien a su propio camino",
  },
  {
    id: 12,
    dimension: "R",
    left: "Prefiero dar un paso al costado y que otros tomen protagonismo en las conversaciones de mi nicho",
    right: "Me resulta natural asumir el liderazgo y ser la voz principal en conversaciones de mi nicho",
  },
];

// Mapeo de 4 dimensiones binarias (H/L) a arquetipos
// Clave: M E I R donde H = score promedio >= 3, L = < 3
const ARCHETYPE_MAP: Record<string, ArchetypeName> = {
  HHHH: "El Mago",
  HHHL: "El Rebelde",
  HHLH: "El Héroe",
  HHLL: "El Amante",
  HLHH: "El Creador",
  HLHL: "El Explorador",
  HLLH: "El Gobernante",
  HLLL: "El Sabio",
  LHHH: "El Bufón",
  LHHL: "El Inocente",
  LHLH: "El Cuidador",
  LHLL: "El Ciudadano",
  LLHH: "El Explorador",
  LLHL: "El Inocente",
  LLLH: "El Sabio",
  LLLL: "El Ciudadano",
};

export type DimensionScores = {
  M: number;
  E: number;
  I: number;
  R: number;
};

export function calculateArchetype(answers: Record<number, number>): {
  archetype: ArchetypeName;
  scores: DimensionScores;
} {
  const dims: DimensionScores = { M: 0, E: 0, I: 0, R: 0 };
  const counts = { M: 0, E: 0, I: 0, R: 0 };

  for (const q of QUIZ_QUESTIONS) {
    const val = answers[q.id];
    if (val !== undefined) {
      dims[q.dimension] += val;
      counts[q.dimension]++;
    }
  }

  // Promedios
  const scores: DimensionScores = {
    M: counts.M > 0 ? dims.M / counts.M : 2.5,
    E: counts.E > 0 ? dims.E / counts.E : 2.5,
    I: counts.I > 0 ? dims.I / counts.I : 2.5,
    R: counts.R > 0 ? dims.R / counts.R : 2.5,
  };

  // Escala forzada 1-4 (sin punto medio neutral): el promedio de 3 preguntas
  // enteras nunca puede caer justo en 2.5, así que no hay empates estructurales
  // como sí los había con la escala 1-5 (donde un promedio de 3.0 exacto
  // siempre se clasificaba como "Alto", sesgando todo hacia El Mago).
  const key =
    (scores.M >= 2.5 ? "H" : "L") +
    (scores.E >= 2.5 ? "H" : "L") +
    (scores.I >= 2.5 ? "H" : "L") +
    (scores.R >= 2.5 ? "H" : "L");

  return { archetype: ARCHETYPE_MAP[key], scores };
}
