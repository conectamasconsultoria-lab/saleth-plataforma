import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type Formula =
  | "errores"
  | "secreto"
  | "pasos"
  | "mitos"
  | "metodo"
  | "antes_despues"
  | "lista_valor";

function buildPrompt(
  topic: string,
  slideCount: number,
  formula: Formula,
  niche: string,
  tone: string,
  audience: string,
  archetype: string
): string {
  const context = `
PERFIL DEL CREADOR:
- Nicho: ${niche}
- Tono de comunicación: ${tone}
- Cliente ideal: ${audience}
- Arquetipo de marca: ${archetype}
`.trim();

  const contentSlides = slideCount - 2; // portada + CTA = 2 slides fijos

  const formulaInstructions: Record<Formula, string> = {
    errores: `
Fórmula: "Los ${contentSlides} errores que cometen [audiencia] al [tema]"

PORTADA (slide 1):
- Título ultra directo que duela: "Los ${contentSlides} errores que te están costando [resultado]"
- Subtítulo que genere urgencia o identificación inmediata
- El lector debe pensar: "¿Lo estaré cometiendo yo?"

SLIDES DE CONTENIDO (slides 2 a ${slideCount - 1}):
- Cada slide = 1 error
- Formato por slide:
  * TÍTULO: El nombre del error (que duela, que se reconozca)
  * CONTENIDO: Por qué ocurre (1 línea) + cómo se ve en la práctica (1 ejemplo real) + cómo corregirlo (1 acción concreta)

SLIDE FINAL (CTA):
- Remate poderoso: "¿Cuál de estos errores estás cometiendo?"
- CTA claro: guardar, comentar o compartir con quien necesite verlo
`,
    secreto: `
Fórmula: "La verdad que nadie te dice sobre [tema]"

PORTADA (slide 1):
- Título con tensión: algo que la gente sospecha pero nadie confirma
- Ejemplo: "Lo que ningún [experto/colega] te va a confesar sobre [tema]"
- Debe generar curiosidad y sensación de acceso a información exclusiva

SLIDES DE CONTENIDO (slides 2 a ${slideCount - 1}):
- Cada slide revela una verdad incómoda o contraintuitiva
- Formato: TÍTULO impactante + REVELACIÓN con contexto + por qué importa saber esto
- Alterna entre verdades que incomodan y verdades que liberan

SLIDE FINAL (CTA):
- Cierre empoderador: "Ahora que sabés esto, ¿qué vas a cambiar?"
- CTA de comunidad: "Guardalo para cuando lo necesites"
`,
    pasos: `
Fórmula: "Cómo [lograr resultado] en ${contentSlides} pasos"

PORTADA (slide 1):
- Promesa de resultado específico y alcanzable
- Ejemplo: "Cómo [resultado] en ${contentSlides} pasos (sin [objeción común])"
- Debe sonar posible y accionable

SLIDES DE CONTENIDO (slides 2 a ${slideCount - 1}):
- Cada slide = 1 paso en orden lógico
- Formato: NÚMERO + ACCIÓN CLARA (imperativo) + descripción práctica de cómo ejecutarlo + 1 tip o trampa a evitar
- Los pasos deben conectarse: el final de uno prepara el siguiente

SLIDE FINAL (CTA):
- "¿En qué paso estás vos?"
- Invitación a comentar o guardar como guía de referencia
`,
    mitos: `
Fórmula: "N mitos sobre [tema] que necesitás dejar de creer"

PORTADA (slide 1):
- Hook de ruptura de creencia: "Todo lo que te dijeron sobre [tema] está mal"
- O versión suave: "Los ${contentSlides} mitos sobre [tema] que te están frenando"

SLIDES DE CONTENIDO (slides 2 a ${slideCount - 1}):
- Cada slide = 1 mito destruido
- Formato:
  * MITO: La creencia falsa (en cursiva o entre comillas)
  * REALIDAD: La verdad (contundente, sin vueltas)
  * POR QUÉ IMPORTA: Qué cambia cuando lo entendés bien

SLIDE FINAL (CTA):
- "¿Con cuál mito te identificaste más?"
- Invitación a comentar + guardar
`,
    metodo: `
Fórmula: "El método exacto que uso para [resultado]"

PORTADA (slide 1):
- Promesa de método probado con resultado específico
- Ejemplo: "El método exacto que uso para [lograr X] (y que también aplico con mis clientes)"
- Credibilidad + resultado + exclusividad

SLIDES DE CONTENIDO (slides 2 a ${slideCount - 1}):
- Presenta el método como sistema con nombre propio si es posible
- Slide 2: Visión general del método (qué es, cuándo funciona)
- Slides 3+: Cada componente/fase del método con detalle práctico
- Incluye ejemplos reales o mini casos de uso

SLIDE FINAL (CTA):
- "¿Querés aplicar este método?" + próximo paso claro
- Puede ser: agendar, seguir, DM, guardar
`,
    antes_despues: `
Fórmula: "Antes y después: cómo cambió mi [algo] al [hacer X]"

PORTADA (slide 1):
- Contraste poderoso y específico
- Ejemplo: "Hace 1 año vs hoy: lo que cambió cuando empecé a [hacer X]"
- Debe generar identificación con el "antes" y aspiración con el "después"

SLIDES DE CONTENIDO (slides 2 a ${slideCount - 1}):
- Alterna revelaciones del "antes" y el "después"
- Cada slide = 1 dimensión del cambio (mentalidad, resultados, rutina, ingresos, etc.)
- Formato: ANTES: [situación/creencia/resultado] → DESPUÉS: [nueva situación/creencia/resultado]
- Incluye el insight que causó el cambio

SLIDE FINAL (CTA):
- "¿En qué parte del camino estás vos?"
- Invitación a compartir dónde están en su proceso
`,
    lista_valor: `
Fórmula: "N cosas que aprendí sobre [tema] que me cambiaron todo"

PORTADA (slide 1):
- Hook de acumulación de valor: "Las ${contentSlides} cosas sobre [tema] que nadie me enseñó pero ojalá me hubieran dicho antes"
- Genera expectativa de valor comprimido y aprendizaje acelerado

SLIDES DE CONTENIDO (slides 2 a ${slideCount - 1}):
- Cada slide = 1 aprendizaje valioso
- Formato: NÚMERO + APRENDIZAJE (corto, memorable) + Desarrollo breve (1-2 oraciones que expliquen y ejemplifiquen)
- Los mejores deben ser contraintuitivos o no obvios
- Ordenalos de menor a mayor impacto (guarda el mejor para el final)

SLIDE FINAL (CTA):
- "¿Con cuál te quedás?" o "¿Cuál de estos ya sabías?"
- Guardar + comentar
`,
  };

  return `Sos un experto en crear carruseles virales para Instagram y LinkedIn que generan cientos de guardados y compartidos.

${context}

TEMA DEL CARRUSEL: "${topic}"
CANTIDAD DE SLIDES: ${slideCount}

${formulaInstructions[formula]}

REGLAS GENERALES DE VIRALIDAD:
1. Portada: debe detener el scroll. El título es lo único que importa — si no engancha, no pasan.
2. Cada slide debe poder leerse en 5-8 segundos.
3. Usá el tono definido en el perfil: ${tone}
4. Escribí en español, de manera directa y sin rodeos.
5. Los títulos de cada slide son cortos y en mayúsculas (máx 8 palabras).
6. El contenido de cada slide: máximo 3-4 líneas. Claro, denso en valor, sin relleno.
7. Usá • para bullet points cuando sea necesario.
8. El CTA final debe pedir UNA sola acción, no tres.
9. Resaltado: en el título Y en el contenido de cada slide, envolvé entre 1 y 3 palabras o frases cortas (máx 3 palabras cada una) con doble asterisco, ej: "**este resultado**". Elegí lo de mayor impacto: números, resultados concretos o palabras con carga emocional. Nunca envuelvas la oración completa ni más de 3 fragmentos por slide — el resaltado pierde fuerza si se abusa.

Respondé ÚNICAMENTE con este JSON (sin markdown, sin texto extra):
{
  "topic": "${topic}",
  "formula": "${formula}",
  "slides": [
    {
      "slide_number": 1,
      "title": "Título con **una frase clave** resaltada",
      "content": "Contenido con **el dato o resultado** más importante resaltado"
    }
  ]
}

Generá exactamente ${slideCount} slides.`;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { topic, slideCount = 7, formula = "lista_valor" } = await req.json();
  if (!topic) return NextResponse.json({ error: "Falta el tema" }, { status: 400 });

  const { data: questionnaire } = await supabase
    .from("questionnaires")
    .select("niche, brand_blueprint, personality_archetype")
    .eq("user_id", user.id)
    .single();

  if (!questionnaire)
    return NextResponse.json({ error: "Completá tu perfil primero" }, { status: 400 });

  const bp = (questionnaire.brand_blueprint ?? {}) as Record<string, string>;

  const prompt = buildPrompt(
    topic,
    slideCount,
    formula as Formula,
    questionnaire.niche ?? "",
    bp.tone ?? "",
    bp.target_audience ?? "",
    questionnaire.personality_archetype ?? ""
  );

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Respuesta inesperada");

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No se pudo parsear el carrusel");

    const carouselData = JSON.parse(jsonMatch[0]);

    const { data: carousel, error } = await supabase
      .from("carousels")
      .insert({
        user_id: user.id,
        topic,
        formula,
        slides: carouselData.slides,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ carousel });
  } catch (e) {
    console.error("Error generando carrusel:", e);
    return NextResponse.json({ error: "Error al generar el carrusel" }, { status: 500 });
  }
}
