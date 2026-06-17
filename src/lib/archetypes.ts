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
    tagline: "Transformás realidades y creás lo que parecía imposible",
    description:
      "Tu marca transforma. Combinás visión, emoción y liderazgo disruptivo para crear experiencias que cambian personas. No solo inspirás — cambiás realidades. Tu audiencia te sigue porque contigo todo parece posible.",
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
    tagline: "Rompés reglas y mostrás que existe otra manera",
    description:
      "Tu marca desafía. Sos disruptivo/a, apasionado/a y no tenés miedo de decir lo que los demás callan. Tu audiencia te sigue porque les das permiso de pensar diferente y cuestionar lo establecido.",
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
    tagline: "Superás obstáculos e inspirás a otros a hacer lo mismo",
    description:
      "Tu marca inspira a través de la acción. Mostrás el camino con tu ejemplo y tu audiencia te sigue porque ven en vos la prueba de que es posible. Sos la persona que ya lo logró y ahora lleva a otros con ella.",
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
    tagline: "Creás una conexión profunda a través de la pasión y la belleza",
    description:
      "Tu marca conecta desde el corazón. Tenés una intensidad y una sensibilidad que hacen que tu audiencia se sienta vista y especial. Tu contenido no se consume — se siente. Generás vínculos profundos y una comunidad fiel.",
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
    tagline: "Innovás y creás experiencias únicas con tu sello propio",
    description:
      "Tu marca crea. Sos estratégico/a e innovador/a, y tu diferencial es la originalidad con intención. Combinás creatividad con estructura, y el resultado son piezas que la gente recuerda y quiere replicar.",
    strengths: [
      "Contenido visual de alto impacto",
      "Formatos innovadores y propios",
      "Proyectos creativos editoriales",
      "Tendencias que vos marcás",
    ],
    contentStyle: "Creativo, estructurado y visualmente distintivo",
    referenceBrands: ["Lego", "Adobe", "Dyson"],
  },
  "El Explorador": {
    name: "El Explorador",
    emoji: "🧭",
    color: "#059669",
    bgColor: "#ECFDF5",
    tagline: "Siempre buscás lo nuevo y llevás a tu audiencia a descubrirlo",
    description:
      "Tu marca explora. Sos curioso/a, independiente y siempre en búsqueda de perspectivas frescas. Tu audiencia te sigue porque con vos siempre hay algo nuevo por descubrir, explorar y experimentar.",
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
    tagline: "Liderás con autoridad, expertise y resultados probados",
    description:
      "Tu marca lidera. Proyectás autoridad y confianza desde el conocimiento y la trayectoria. Tu audiencia te sigue porque saben que lo que decís funciona — tenés el track record para probarlo.",
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
    tagline: "Compartís conocimiento profundo que transforma perspectivas",
    description:
      "Tu marca ilumina. Sos la fuente de referencia en tu industria — la persona a quien todos acuden cuando quieren entender algo de verdad. Tu contenido no solo informa: cambia la manera en que la gente piensa.",
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
    tagline: "Hacés que aprender y conectar sea divertido e irresistible",
    description:
      "Tu marca entretiene. Tenés la habilidad única de hacer que la gente aprenda sin darse cuenta, riéndose. Tu audiencia no solo te sigue — te espera. Creás comunidad a través del humor y la irreverencia.",
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
    tagline: "Mostrás que la autenticidad pura es el mayor diferencial",
    description:
      "Tu marca es refrescante. En un mundo de poses y estrategias, vos aparecés como sos — y eso es exactamente lo que tu audiencia necesita. Tu honestidad y tu visión positiva son tu mayor diferencial.",
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
      "Tu marca sostiene. Tenés una capacidad única de hacer que tu audiencia se sienta vista, acompañada y protegida. Tu contenido no solo da información — da contención. Y eso crea vínculos para toda la vida.",
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
    tagline: "Conectás porque sos exactamente como tu audiencia: real y cercano",
    description:
      "Tu marca conecta. Sos relatable al 100% — tu audiencia te sigue porque se ve reflejada en vos. No construís un pedestal, construís una comunidad donde todos se sienten bienvenidos e incluidos.",
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
// Dimension M (Motivación): 1=Conexión, 5=Logro/Impacto
// Dimension E (Expresión): 1=Racional, 5=Emocional
// Dimension I (Innovación): 1=Clásico, 5=Disruptivo
// Dimension R (Rol): 1=Facilita, 5=Guía/Lidera

export type QuizQuestion = {
  id: number;
  dimension: "M" | "E" | "I" | "R";
  statement: string;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Motivación
  {
    id: 1,
    dimension: "M",
    statement:
      "Mi prioridad con mi marca personal es destacar, lograr resultados tangibles y ser reconocido/a en mi industria",
  },
  {
    id: 2,
    dimension: "M",
    statement:
      "Prefiero ser referente y líder en mi nicho más que simplemente pertenecer a una comunidad de pares",
  },
  {
    id: 3,
    dimension: "M",
    statement:
      "Me motiva más alcanzar logros individuales concretos que el crecimiento colectivo de mi comunidad",
  },
  // Expresión
  {
    id: 4,
    dimension: "E",
    statement:
      "En mis contenidos, priorizo conectar desde la emoción y la experiencia personal más que desde datos o análisis",
  },
  {
    id: 5,
    dimension: "E",
    statement:
      "Me importa más que mi audiencia me sienta cercano/a y humano/a que me perciba como una autoridad",
  },
  {
    id: 6,
    dimension: "E",
    statement:
      "Comparto mis vulnerabilidades, miedos y procesos internos con mi comunidad habitualmente",
  },
  // Innovación
  {
    id: 7,
    dimension: "I",
    statement:
      "Parte de mi identidad de marca es hacer las cosas de manera diferente a lo que se acostumbra en mi industria",
  },
  {
    id: 8,
    dimension: "I",
    statement:
      "Me genera incomodidad seguir las tendencias o hacer las cosas 'como siempre se hacen'",
  },
  {
    id: 9,
    dimension: "I",
    statement:
      "Prefiero arriesgarme con algo experimental y creativo que seguir un método probado y seguro",
  },
  // Rol
  {
    id: 10,
    dimension: "R",
    statement:
      "Me siento cómodo/a siendo reconocido/a como la figura de autoridad que señala el camino a seguir",
  },
  {
    id: 11,
    dimension: "R",
    statement:
      "En mis contenidos, tiendo a dar dirección clara y estructurada más que invitar a cada uno a encontrar su propio camino",
  },
  {
    id: 12,
    dimension: "R",
    statement:
      "Me resulta natural asumir el liderazgo y ser la voz principal en conversaciones de mi nicho",
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
    M: counts.M > 0 ? dims.M / counts.M : 3,
    E: counts.E > 0 ? dims.E / counts.E : 3,
    I: counts.I > 0 ? dims.I / counts.I : 3,
    R: counts.R > 0 ? dims.R / counts.R : 3,
  };

  const key =
    (scores.M >= 3 ? "H" : "L") +
    (scores.E >= 3 ? "H" : "L") +
    (scores.I >= 3 ? "H" : "L") +
    (scores.R >= 3 ? "H" : "L");

  return { archetype: ARCHETYPE_MAP[key], scores };
}
