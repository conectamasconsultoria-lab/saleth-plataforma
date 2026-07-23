// Fuente única de verdad para las estructuras narrativas de guiones.
// Cada entrada tiene el texto completo (fórmula + pasos + ejemplos) usado en el
// prompt de generación/edición, y una versión resumida (label/description/formula)
// usada en el selector de la UI. Antes esto vivía duplicado en el backend
// (src/app/api/scripts/generate/route.ts) y en el frontend (scripts-client.tsx).

export type ContentType = "atraccion" | "nutricion" | "ventas";
export type Stage = "attraction" | "nurturing" | "conversion";

export type StructureDefinition = {
  contentType: ContentType;
  subType: string;
  key: string;
  label: string;
  description: string;
  formula: string;
  fullText: string;
};

export const STAGE_MAP: Record<ContentType, Stage> = {
  atraccion: "attraction",
  nutricion: "nurturing",
  ventas: "conversion",
};

export const DEFAULT_STRUCTURE_KEY_BY_STAGE: Record<Stage, string> = {
  attraction: "atraccion-polemico",
  nurturing: "nutricion-valor",
  conversion: "ventas-directo",
};

export const STRUCTURES: StructureDefinition[] = [
  // ATRACCIÓN
  {
    contentType: "atraccion",
    subType: "polemico",
    key: "atraccion-polemico",
    label: "Casos Polémicos",
    description: "Usa un caso famoso o polémico para captar atención y conectar con tu nicho",
    formula: "Pregunta Universal → Caso Famoso → Open Loop → Valor → CTA",
    fullText: `ESTRUCTURA: ATRACCIÓN — CASOS POLÉMICOS
Fórmula: Pregunta Universal → Caso Famoso o Polémico → Pregunta de Nicho (Open Loop) → Valor → CTA

1. PREGUNTA UNIVERSAL (GANCHO): Empieza con una pregunta que genere interés en cualquier persona, incluso fuera del nicho.
   Ejemplos: "¿Por qué la mayoría de personas nunca gana más dinero?", "¿Por qué algunas personas lo pierden todo cuando parecen tenerlo todo?"

2. CONTEXTO (CASO FAMOSO O POLÉMICO): NO hables del nicho todavía. Usa una historia que ya tenga atención incorporada: un famoso, empresario, deportista, influencer, película, caso viral o noticia polémica.
   Ejemplo: "Cuando Mike Tyson tenía millones de dólares, nadie imaginaba que terminaría en bancarrota."

3. OPEN LOOP (PREGUNTA DE NICHO): Haz la transición. Conecta la historia con el problema del cliente ideal.
   Ejemplo: "Pero, ¿qué tiene que ver esto con que nadie compre tus servicios?"

4. VALOR: Responde la pregunta anterior. Problema → Error → Solución.
   Ejemplo: "La razón no fue la falta de talento. Fue que dejó de adaptarse. Y eso mismo pasa con muchos emprendedores..."

5. CTA CON RECURSO: "Comenta 'MARCA' y te envío la guía."

REGLA DE ROOM: El gancho debe ser de ROOM ALTO (temas universales: dinero, amor, salud, éxito, poder, polémica). NO empieces por el nicho. Empieza por algo que le importe a todo el mundo y después conecta con el nicho.`,
  },
  {
    contentType: "atraccion",
    subType: "deseos",
    key: "atraccion-deseos",
    label: "Deseos Humanos",
    description: "Conecta con deseos universales (dinero, estatus, atracción) y deriva a tu nicho",
    formula: "Gancho Universal → Contexto → Desarrollo → Moraleja → CTA",
    fullText: `ESTRUCTURA: ATRACCIÓN — DESEOS HUMANOS BÁSICOS
Metodología para crear contenido viral basado en deseos humanos, no en el producto.

1. GANCHO: Conecta con un deseo humano universal (salud, dinero, amor, desarrollo personal, estatus, atracción).
   Ejemplo: "Estos carros generan más atracción que muchos consejos de seducción."

2. CONTEXTO: Explica por qué el tema importa a nivel humano.
   Ejemplo: "No porque las personas se enamoren de un carro. Sino porque la imagen cambia la forma en que te perciben."

3. DESARROLLO: Conecta con ejemplos de famosos, empresarios, deportistas. Muestra por qué el comportamiento humano funciona así.
   Ejemplo: "Las personas juzgan en segundos y el estatus sigue importando más de lo que muchos quieren admitir."

4. MORALEJA: Revela la verdad detrás del comportamiento.
   Ejemplo: "La gente cree que compra un carro. Pero en realidad compra libertad, estatus y la sensación de que está avanzando."

5. CTA: Genera interacción. Ejemplo: "¿Cuál de estos crees que proyecta más éxito? Te leo en los comentarios."

PASO PREVIO: Identifica el sector principal del creador (Salud, Dinero, Amor, Desarrollo Personal, Espiritualidad) y busca las preguntas más populares que hace alguien que aún no sabe que lo necesita.`,
  },
  {
    contentType: "atraccion",
    subType: "storytelling",
    key: "atraccion-storytelling",
    label: "Storytelling",
    description: "Cuenta una historia personal o de un tercero con arco narrativo para captar atención",
    formula: "Gancho (tensión) → Contexto → Conflicto → Giro → Resolución → Moraleja → CTA",
    fullText: `ESTRUCTURA: ATRACCIÓN — STORYTELLING
Fórmula: Gancho (tensión) → Contexto → Conflicto → Giro/aprendizaje → Resolución → Moraleja/conexión con nicho → CTA

1. GANCHO (INICIO EN EL MOMENTO DE TENSIÓN): Arranca en medio de la acción o en el momento más tenso de la historia, no en el principio cronológico.
   Ejemplo: "Hace dos años estaba a punto de cerrar mi negocio con la cuenta en cero."

2. CONTEXTO (QUIÉN Y CÓMO EMPEZÓ): Dá el contexto mínimo necesario para entender la historia.
   Ejemplo: "Todo había empezado un año antes, cuando decidí dejar mi trabajo fijo para hacer esto a tiempo completo."

3. CONFLICTO / OBSTÁCULO: El problema central de la historia, lo que estuvo a punto de arruinarlo todo.
   Ejemplo: "Los primeros meses no vendía nada. Cada 'no' se sentía como una confirmación de que no iba a funcionar."

4. GIRO / APRENDIZAJE: El momento en que algo cambia — una decisión, una idea, un mentor, un error que se convierte en lección.
   Ejemplo: "Hasta que entendí que no era un problema de producto. Era que nadie confiaba en mí todavía."

5. RESOLUCIÓN: Cómo termina la historia (o dónde está hoy la persona).
   Ejemplo: "Hoy factura X y ayuda a otros a no cometer el mismo error."

6. MORALEJA / CONEXIÓN CON EL NICHO: Transforma la historia en una lección aplicable al espectador.
   Ejemplo: "Si te está pasando lo mismo, el problema no es tu producto. Es tu manera de generar confianza."

7. CTA: De interacción (etapa atracción). Ejemplo: "¿Te pasó algo parecido? Cuéntame en los comentarios."

REGLA: La historia va primero, la lección/nicho viene después. No arranques explicando el nicho — empieza con la escena. Puedes usar una historia propia o de un tercero (cliente, referente, caso conocido), siempre con arco: tensión → conflicto → giro → resolución.`,
  },

  // NUTRICIÓN
  {
    contentType: "nutricion",
    subType: "valor",
    key: "nutricion-valor",
    label: "Atracción + Valor",
    description: "Enseña algo valioso sin vender, genera autoridad y ofrece un recurso",
    formula: "Hook Resultado → Romper Creencia → Enseñar → Autoridad → Recurso → CTA",
    fullText: `ESTRUCTURA: NUTRICIÓN — GENERAR ATRACCIÓN + VALOR
Objetivo: Educar, generar confianza, posicionarte como experto y mover a la persona hacia una conversación sin vender directamente.

1. HOOK (RESULTADO DESEADO): Empieza hablando del resultado que la persona quiere conseguir.
   Ejemplo: "Te voy a enseñar cómo puedes ganar más dinero este 2026 sin trabajar más horas."

2. ROMPER UNA CREENCIA: Menciona algo que la mayoría piensa y demuestra por qué está equivocado.
   Ejemplo: "Muchos creen que para ganar más dinero necesitan trabajar más, pero la realidad es que necesitan mejorar cómo atraen clientes."

3. ENSEÑA EL "CÓMO" SIN ENTREGAR TODO: Aporta valor real, pero deja espacio para que quieran saber más.
   Ejemplo: "Lo primero es identificar cuál es el problema principal de tu cliente. Después crear contenido que hable de ese problema..."

4. DEMUESTRA AUTORIDAD: Haz que la persona piense "Esta persona sí sabe."
   Ejemplo: "Esto es exactamente lo que utilizan muchos negocios para generar clientes todos los días."

5. ENTREGA UN RECURSO: No des toda la estrategia. Da un recurso para continuar la conversación.
   Ejemplo: "Tengo una guía donde explico los 5 tipos de contenido que más clientes generan."

6. CTA DE BAJO COMPROMISO (RECURSO): "Escribe 'GUÍA' y te la envío."`,
  },
  {
    contentType: "nutricion",
    subType: "dolor-solucion",
    key: "nutricion-dolor-solucion",
    label: "Dolor + Solución + Valor",
    description: "Identifica el dolor, revela la causa real y entrega una solución accionable",
    formula: "Dolor → Amplifica → Causa Real → Solución → Posicionamiento → Recurso",
    fullText: `ESTRUCTURA: NUTRICIÓN — DOLOR + SOLUCIÓN + VALOR
Objetivo: Que la persona se identifique con un problema, captes su atención, le entregues una solución accionable y te posiciones como alguien que ya lo resolvió.

1. ABRIR CON EL DOLOR: Empieza describiendo algo que le sucede a tu cliente ideal. La idea es que diga "Eso me pasa a mí."
   Ejemplo: "Estos son los asesores inmobiliarios de hoy en día: todo el día ocupados, pero sin cerrar ventas."

2. AMPLIFICA EL PROBLEMA: Haz que el dolor se sienta más real.
   Ejemplo: "Trabajan desde temprano, responden mensajes, hacen visitas... pero al final del mes siguen con las mismas ventas."

3. REVELA LA VERDADERA CAUSA: Muestra que el problema no es el que ellos creen.
   Ejemplo: "No es porque el mercado esté malo. El verdadero problema es que nadie los ve como la mejor opción."

4. SOLUCIÓN (EL "QUÉ HACER"): Entrega el paso o principio concreto que resuelve la causa real. Tiene que sonar accionable, no abstracto — esto es lo que diferencia esta estructura de "solo dar valor".
   Ejemplo: "Lo que tienes que hacer es dejar de vender tu servicio y empezar a vender el resultado que genera. En vez de 'agenda una visita', habla de 'encuentra la casa de tus sueños sin perder fines de semana'."

5. POSICIONAMIENTO: Haz que te perciban como alguien que ya resolvió esto.
   Ejemplo: "Las personas no compran al que más publica. Compran al que más confianza les genera."

6. RECURSO O SIGUIENTE PASO: No entregues todo. Abre una conversación.
   Ejemplo: "Tengo una plantilla con los contenidos que más clientes generan. Comenta 'PLANTILLA' y te la envío."

REGLA: El paso 4 (SOLUCIÓN) tiene que ser una acción concreta que la persona podría aplicar hoy mismo, no una promesa vaga de "vas a mejorar".`,
  },
  {
    contentType: "nutricion",
    subType: "problema-consecuencia",
    key: "nutricion-problema-consecuencia",
    label: "Problema + Consecuencia",
    description: "Muestra las consecuencias a corto y largo plazo de no resolver el problema",
    formula: "Problema Concreto → Consecuencia Corto Plazo → Consecuencia Largo Plazo → Causa Real → Valor → Recurso",
    fullText: `ESTRUCTURA: NUTRICIÓN — PROBLEMA + CONSECUENCIA
Fórmula: Gancho (problema concreto) → Consecuencia corto plazo → Consecuencia largo plazo → Giro (causa real) → Valor → CTA de recurso

1. GANCHO (PROBLEMA CONCRETO): Nombra un problema específico y reconocible del cliente ideal, no una queja genérica.
   Ejemplo: "La mayoría de los emprendedores publica contenido todos los días... y aun así no vende."

2. CONSECUENCIA A CORTO PLAZO: Qué le pasa a la persona si el problema sigue igual, en su día a día inmediato.
   Ejemplo: "Sigue invirtiendo horas en contenido que nadie convierte, mientras la competencia sí está facturando."

3. CONSECUENCIA A LARGO PLAZO: Proyecta el problema hacia el futuro si nunca se resuelve.
   Ejemplo: "Si esto sigue así, en un año vas a tener las mismas redes sociales, pero con menos energía y menos plata."

4. GIRO (LA VERDADERA CAUSA): Revela que el problema tiene una causa puntual y resoluble — no es falta de esfuerzo ni de suerte.
   Ejemplo: "El problema no es que no publiques suficiente. Es que tu contenido no está conectado a una estrategia de ventas."

5. VALOR: Explica brevemente el principio o el primer paso para revertir la consecuencia.
   Ejemplo: "Antes de grabar cualquier video, tienes que saber en qué etapa del embudo está esa persona."

6. CTA DE RECURSO: "Comenta 'ESTRATEGIA' y te mando la guía para dejar de publicar a ciegas."

REGLA: La consecuencia tiene que sentirse específica y cercana, no genérica ("vas a perder dinero"). Usa escenas y tiempos concretos (esta semana, este mes, este año) en vez de afirmaciones abstractas.`,
  },
  {
    contentType: "nutricion",
    subType: "tips",
    key: "nutricion-tips",
    label: "Tips de Nicho",
    description: "Lista de tips prácticos y accionables específicos del nicho",
    formula: "Gancho (promesa de lista) → Intro → Tip 1 → Tip 2 → Tip 3 → Remate → Recurso",
    fullText: `ESTRUCTURA: NUTRICIÓN — TIPS DE NICHO
Fórmula: Gancho (promesa de lista) → Intro → Tip 1 → Tip 2 → Tip 3 → Remate → CTA de recurso

1. GANCHO (PROMESA DE LISTA): Anuncia cuántos tips y qué logran.
   Ejemplo: "3 tips para que tus clientes te paguen sin pedir descuento."

2. INTRO BREVE: Una línea de contexto de por qué estos tips importan o de dónde salen.
   Ejemplo: "Esto es lo que uso yo y mis clientes antes de cualquier negociación."

3. TIP 1 + POR QUÉ FUNCIONA: Acción concreta, no teoría.
   Ejemplo: "Tip 1: nunca menciones el precio antes de mostrar el resultado. Cuando hablas de precio primero, la persona compara; cuando hablas de resultado primero, la persona desea."

4. TIP 2 + POR QUÉ FUNCIONA.

5. TIP 3 + POR QUÉ FUNCIONA (puedes sumar tip 4 o 5 si la duración lo permite).

6. CIERRE / REMATE: Una frase que conecte los tips con el resultado final que le importa al cliente ideal.
   Ejemplo: "Aplica estos 3 y vas a notar que las negociaciones se acortan solas."

7. CTA DE RECURSO: "Comenta 'TIPS' y te mando la lista completa con ejemplos."

REGLA: Cada tip tiene que ser accionable HOY, no teoría abstracta. Usa verbos en imperativo ("deja de...", "empieza a...", "nunca..."). Si la duración es de 15 segundos, usa solo 2 tips en vez de forzar 3.`,
  },
  {
    contentType: "nutricion",
    subType: "valor-puro",
    key: "nutricion-valor-puro",
    label: "Valor",
    description: "100% aporte, sin frame de dolor ni objeción — solo enseñar algo útil",
    formula: "Gancho (resultado) → Contexto → Desarrollo paso a paso → Ejemplo → Autoridad → Recurso",
    fullText: `ESTRUCTURA: NUTRICIÓN — VALOR (PURO)
Fórmula: Gancho (resultado/curiosidad) → Contexto → Desarrollo paso a paso → Ejemplo → Cierre de autoridad → CTA de recurso

1. GANCHO (RESULTADO O CURIOSIDAD): Anuncia qué van a aprender o lograr.
   Ejemplo: "Así es como planifico el contenido de todo un mes en 20 minutos."

2. CONTEXTO BREVE: Por qué esto le sirve a cualquiera en el nicho.
   Ejemplo: "No importa si recién empiezas o ya tienes una comunidad grande, esto te ahorra horas cada semana."

3. DESARROLLO DEL VALOR (PASO A PASO): Enseña el proceso o idea central, con al menos 2-3 sub-pasos concretos.
   Ejemplo: "Primero defino los 4 pilares de contenido. Después asigno un pilar por semana. Por último grabo todo el mes en un solo día."

4. EJEMPLO O CASO: Aterriza la idea con un ejemplo real o hipotético.
   Ejemplo: "Por ejemplo: si tu pilar de esta semana es 'testimonios', ya sabes que los 7 videos van a salir de ahí, sin pensarlo dos veces."

5. CIERRE DE AUTORIDAD: Una frase que remate el valor entregado.
   Ejemplo: "Así es como dejas de improvisar contenido todos los días."

6. CTA DE RECURSO: "Escribe 'PLANNER' y te mando la plantilla que uso yo."

REGLA: No hay dolor ni objeción en esta estructura — es 100% aporte. El gancho vende la utilidad del contenido en sí mismo, no un problema a resolver.`,
  },

  // VENTAS
  {
    contentType: "ventas",
    subType: "directo",
    key: "ventas-directo",
    label: "Directo al Dolor",
    description: "Habla del dolor o deseo, agita el problema, presenta solución y elimina objeciones",
    formula: "Hook Dolor → Agita → Solución → Beneficios → Objeciones → CTA",
    fullText: `ESTRUCTURA: VENTAS — DIRECTO AL DOLOR O ANHELO
Objetivo: Generar deseo, eliminar objeciones y llevar a la acción.

1. HOOK (DOLOR O DESEO): Habla directamente de lo que quiere o sufre el cliente.
   Ejemplo: "¿Cansada de esconder tu sonrisa en las fotos?"

2. AGITA EL PROBLEMA: Haz que recuerde las consecuencias.
   Ejemplo: "Mientras sigas posponiéndolo, seguirás sintiéndote insegura y perdiendo oportunidades."

3. PRESENTA LA SOLUCIÓN: Introduce tu producto o servicio.
   Ejemplo: "Por eso creamos nuestro tratamiento diseñado para transformar tu sonrisa de forma natural."

4. BENEFICIOS Y TRANSFORMACIÓN: No hables de características. Habla del resultado.
   Ejemplo: "Sonrisa más blanca. Más confianza al hablar. Mayor seguridad."

5. ELIMINA OBJECIONES: Financiación, evaluación personalizada, procedimiento seguro, resultados naturales.

6. CTA: "Escríbenos 'SONRISA' y agenda tu valoración."`,
  },
  {
    contentType: "ventas",
    subType: "testimonio",
    key: "ventas-testimonio",
    label: "Con Testimonios",
    description: "Vende usando prueba social: muestra el antes y después de un cliente real",
    formula: "Resultado → Situación Inicial → Emoción → Solución → Transformación → CTA",
    fullText: `ESTRUCTURA: VENTAS — CON TESTIMONIOS O RESULTADOS
Objetivo: Vender utilizando prueba social.
Fórmula: RESULTADO FINAL → PROBLEMA INICIAL → FRUSTRACIÓN → SOLUCIÓN → TRANSFORMACIÓN → CTA

1. RESULTADO SOÑADO: Empieza mostrando el resultado.
   Ejemplo: "Así pasó de esconder su sonrisa a no dejar de sonreír en cada foto."

2. SITUACIÓN INICIAL: Describe cómo estaba antes.
   Ejemplo: "Hace unos meses evitaba sonreír porque sus dientes estaban desgastados."

3. PROBLEMA EMOCIONAL: Conecta con la emoción.
   Ejemplo: "Se sentía insegura, incómoda en las fotos y constantemente pensaba en ocultar su sonrisa."

4. DESCUBRIÓ LA SOLUCIÓN: Introduce tu servicio.
   Ejemplo: "Entonces decidió realizarse un diseño de sonrisa con nuestro equipo."

5. TRANSFORMACIÓN: Muestra el cambio.
   Ejemplo: "Hoy tiene una sonrisa armónica, natural y una confianza completamente diferente."

6. RESULTADO SOÑADO + SOCIAL PROOF: Haz que el prospecto se imagine igual.
   Ejemplo: "Y lo mejor es que ella no es un caso aislado. Cada semana ayudamos a más personas."

7. CTA: "Si tú también quieres un cambio así, envíanos un mensaje con la palabra 'CAMBIO'."`,
  },
  {
    contentType: "ventas",
    subType: "anhelo",
    key: "ventas-anhelo",
    label: "Anhelo",
    description: "Parte del deseo/aspiración del cliente ideal en vez del dolor",
    formula: "Hook Anhelo → Contraste → Puente (solución) → Beneficios de identidad → Objeciones → CTA",
    fullText: `ESTRUCTURA: VENTAS — ANHELO
Fórmula: Hook (anhelo) → Contraste con realidad actual → Puente (solución) → Beneficios de identidad → Objeciones → CTA

1. HOOK (ANHELO): Nombra directamente lo que el cliente ideal más desea, en presente, como si ya lo tuviera.
   Ejemplo: "Imagínate cerrar el mes sabiendo exactamente cuánto vas a facturar, sin depender de la suerte."

2. CONTRASTE CON LA REALIDAD ACTUAL: Muestra brevemente la distancia entre el anhelo y su situación hoy, sin quedarte ahí.
   Ejemplo: "Hoy quizás sientes que cada mes empiezas de cero."

3. PRESENTA EL PUENTE (SOLUCIÓN): Muestra tu producto/servicio como el camino directo al anhelo.
   Ejemplo: "Por eso armamos un sistema que te da clientes recurrentes, no solo ventas sueltas."

4. BENEFICIOS EN CLAVE DE IDENTIDAD: Habla de en quién se convierte la persona al lograrlo, no solo qué obtiene.
   Ejemplo: "No se trata solo de vender más. Se trata de ser la persona que tiene el negocio bajo control."

5. ELIMINA OBJECIONES: Anticipa la objeción principal y respondela brevemente.
   Ejemplo: "No hace falta que tengas un equipo grande para aplicar esto."

6. CTA: "Escribinos 'LISTO' y te contamos cómo aplica a tu caso."

REGLA DE ROOM: El anhelo tiene que sonar aspiracional y específico del nicho, no genérico ("ser exitoso"). Nombra el resultado exacto que esa persona visualiza para sí misma.`,
  },
];

export const STRUCTURES_BY_KEY: Record<string, StructureDefinition> = Object.fromEntries(
  STRUCTURES.map((s) => [s.key, s])
);

export function getStructureByKey(key?: string | null): StructureDefinition | null {
  if (!key) return null;
  return STRUCTURES_BY_KEY[key] ?? null;
}

export function getStructuresByContentType(contentType: ContentType): StructureDefinition[] {
  return STRUCTURES.filter((s) => s.contentType === contentType);
}

export function getDefaultStructureForStage(stage?: Stage | null): StructureDefinition | null {
  if (!stage) return null;
  return STRUCTURES_BY_KEY[DEFAULT_STRUCTURE_KEY_BY_STAGE[stage]] ?? null;
}
