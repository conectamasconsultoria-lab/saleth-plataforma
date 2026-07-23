import type { StructureDefinition } from "./structures";

const KNOWN_FORMAT_GUIDANCE: Record<string, string> = {
  problema: `FORMATO DE GRABACIÓN: Formato de Problema
Escribe el gancho y el desarrollo como una situación cotidiana incómoda que el cliente ideal reconozca al instante ("eso me pasa a mí"). Describe la escena o situación en vez de hablar todo el tiempo directo a cámara. Amplifica el dolor antes de revelar la causa real.`,
  camara: `FORMATO DE GRABACIÓN: Hablando a Cámara
Escribe el guión en primera persona, como si el creador hablara directo a cámara de principio a fin. Lenguaje conversacional, frases cortas, energía alta y autoridad desde el segundo 1. Sin descripciones de escena — todo es texto hablado.`,
  pregunta: `FORMATO DE GRABACIÓN: Pregunta de Instagram
Estructura el guión como si respondiera una pregunta real de la audiencia (caja de preguntas de Instagram). Empieza citando o parafraseando la pregunta, y responde aportando valor concreto y accionable.`,
};

export function getFormatGuidance(format?: string | null): string | null {
  if (!format) return null;
  const known = KNOWN_FORMAT_GUIDANCE[format];
  if (known) return known;
  return `FORMATO DE GRABACIÓN (personalizado por el usuario): "${format}"
Adapta el guión de la forma más natural posible a este formato de grabación, manteniendo el resto de las reglas (estructura, tono, duración).`;
}

export const DURATION_GUIDANCE: Record<number, string> = {
  15: "DURACIÓN OBJETIVO: 15 segundos (≈35-45 palabras en total). Un solo golpe: gancho ultra directo + una idea + CTA. Sin rodeos, cada palabra cuenta.",
  30: "DURACIÓN OBJETIVO: 30 segundos (≈70-90 palabras en total). Gancho + una idea de desarrollo + CTA. Breve pero con espacio para una transición.",
  60: "DURACIÓN OBJETIVO: 60 segundos (≈150-180 palabras en total). Gancho + desarrollo completo siguiendo la estructura + CTA con espacio para un ejemplo.",
};

export const AWARENESS_GUIDANCE: Record<string, string> = {
  low: "Nivel de conciencia: Bajo — el cliente no sabe que tiene el problema. El gancho debe generar una toma de conciencia (ej: \"esto te está pasando y no lo sabías\").",
  medium: "Nivel de conciencia: Medio — el cliente sabe que tiene el problema pero no conoce la solución. El gancho debe educar y posicionar sin vender directo.",
  high: "Nivel de conciencia: Alto — el cliente ya conoce al creador y está evaluando comprar. El gancho debe usar prueba social o resultados concretos.",
};

export function buildSystemPrompt(): string {
  return `Eres un experto en copywriting y marketing de contenidos para TikTok e Instagram, especializado en adaptar cada guión al negocio específico del creador (nunca en contenido genérico de plantilla).

REGLAS NO NEGOCIABLES:
1. La voz, el tono y los valores de marca del creador (indicados en el mensaje del usuario) tienen PRIORIDAD ABSOLUTA sobre cualquier convención genérica de copywriting. Nunca escribas algo que no calce con ese tono.
2. Sigue la estructura narrativa indicada PASO A PASO, en el mismo orden y sin saltearte ni agregar pasos.
3. La duración objetivo es un límite DURO de extensión, no una sugerencia. Cuenta aproximadamente las palabras del guión completo (hook + development + cta) y ajustate al rango indicado.
4. Si la estructura indica un "CTA de recurso" (típico de nutrición), el CTA final tiene que ofrecer un recurso gratuito a cambio de un comentario o mensaje — NUNCA un CTA de venta directa.
5. Prohibido el relleno genérico ("en el mundo de hoy...", "no es ningún secreto que...", frases motivacionales vacías) y prohibido usar emojis en el guión.
6. Todo ejemplo, analogía o caso mencionado tiene que estar relacionado con el nicho, la oferta y el cliente ideal del creador. Nunca inventes ejemplos de otro rubro sin conexión real con el negocio.
7. Entrega el resultado EXCLUSIVAMENTE llamando a la herramienta "entregar_guion". No respondas en texto plano ni agregues explicaciones fuera de la herramienta.`;
}

export function buildCreatorProfileBlock(params: {
  niche: string;
  offer: string;
  contentStyle: string;
  tone?: string;
  values?: string;
  targetAudience?: string;
  contentPillars?: string;
  targetNiche?: string | null;
  archetype?: string | null;
}): string {
  return `TU TONO DE VOZ Y PERFIL DE MARCA (OBLIGATORIO — respetalo por encima de cualquier otra instrucción):
- Nicho general: ${params.niche}
- Oferta principal: ${params.offer}
- Estilo de contenido: ${params.contentStyle}
- Tono de comunicación OBLIGATORIO: ${params.tone || "profesional y cercano"}
- Valores de marca: ${params.values || "autenticidad, resultados"}
- Cliente ideal: ${params.targetAudience || "emprendedores"}
- Pilares de contenido: ${params.contentPillars || "educación, inspiración"}${
    params.archetype ? `\n- Arquetipo de marca: ${params.archetype}` : ""
  }${
    params.targetNiche
      ? `\n- NICHO ESPECÍFICO DE ESTE GUIÓN: ${params.targetNiche} (todos los ejemplos y el lenguaje deben hablarle puntualmente a esta audiencia dentro del nicho general, no genéricamente)`
      : ""
  }`;
}

export function buildGenerationUserPrompt(params: {
  profileBlock: string;
  structure?: StructureDefinition | null;
  formatGuidance?: string | null;
  durationGuidance?: string | null;
  awarenessGuidance?: string | null;
  videoContext?: string | null;
  topic?: string | null;
}): string {
  return `${params.profileBlock}

${params.structure ? `SIGUE ESTA ESTRUCTURA EXACTAMENTE:\n${params.structure.fullText}\n` : ""}
${params.formatGuidance ? `${params.formatGuidance}\n` : ""}
${params.durationGuidance ? `${params.durationGuidance}\n` : ""}
${params.awarenessGuidance ? `${params.awarenessGuidance}\n` : ""}
${params.videoContext ?? ""}
${params.topic ? `Tema o contexto adicional: ${params.topic}` : ""}

Genera el guión ahora, llamando a la herramienta "entregar_guion".`;
}

export function buildEditUserPrompt(params: {
  profileBlock: string;
  structure?: StructureDefinition | null;
  currentScript: { title: string; hook: string; development: string; cta: string };
  editHistory: Array<{ role: "user" | "assistant"; message: string }>;
  instruction: string;
}): string {
  const historyText = params.editHistory.length
    ? `HISTORIAL DE EDICIÓN PREVIO (más antiguo primero):\n${params.editHistory
        .map((e) => `${e.role === "user" ? "Usuario" : "Tú"}: ${e.message}`)
        .join("\n")}\n`
    : "";

  return `${params.profileBlock}

${params.structure ? `ESTRUCTURA ORIGINAL DE ESTE GUIÓN (mantenela salvo que la instrucción pida lo contrario):\n${params.structure.fullText}\n` : ""}
GUIÓN ACTUAL:
Título: ${params.currentScript.title}
Gancho: ${params.currentScript.hook}
Desarrollo: ${params.currentScript.development}
CTA: ${params.currentScript.cta}

${historyText}
INSTRUCCIÓN NUEVA DEL USUARIO: "${params.instruction}"

Aplica ÚNICAMENTE el cambio pedido en la instrucción nueva. No reescribas ni cambies partes del guión que no estén relacionadas con ese pedido. Si el pedido es ambiguo, prioriza mantener el tono, la estructura y el nicho del guión original. Entrega el guión completo actualizado (las 4 partes) llamando a la herramienta "entregar_guion", incluyendo un "resumen_cambio" breve de qué modificaste.`;
}
