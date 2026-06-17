import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const STRUCTURES: Record<string, string> = {
  "atraccion-polemico": `ESTRUCTURA: ATRACCIÓN — CASOS POLÉMICOS
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

  "atraccion-deseos": `ESTRUCTURA: ATRACCIÓN — DESEOS HUMANOS BÁSICOS
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

  "nutricion-valor": `ESTRUCTURA: NUTRICIÓN — GENERAR ATRACCIÓN + VALOR
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

6. CTA DE BAJO COMPROMISO: "Escribe 'GUÍA' y te la envío."`,

  "nutricion-dolor": `ESTRUCTURA: NUTRICIÓN — DOLOR + ATRACCIÓN + VALOR
Objetivo: Que la persona se identifique con un problema, captes su atención, aportes valor y te posiciones como alguien que entiende su situación.

1. ABRIR CON EL DOLOR: Empieza describiendo algo que le sucede a tu cliente ideal. La idea es que diga "Eso me pasa a mí."
   Ejemplo: "Estos son los asesores inmobiliarios de hoy en día: todo el día ocupados, pero sin cerrar ventas."

2. AMPLIFICA EL PROBLEMA: Haz que el dolor se sienta más real.
   Ejemplo: "Trabajan desde temprano, responden mensajes, hacen visitas... pero al final del mes siguen con las mismas ventas."

3. REVELA LA VERDADERA CAUSA: Muestra que el problema no es el que ellos creen.
   Ejemplo: "No es porque el mercado esté malo. El verdadero problema es que nadie los ve como la mejor opción."

4. ENTREGA VALOR: Explica una solución o principio que los acerque al resultado.
   Ejemplo: "Por eso necesitas crear contenido que responda las dudas de tus clientes antes de que te escriban."

5. POSICIONAMIENTO: Haz que te perciban como experto.
   Ejemplo: "Las personas no compran al que más publica. Compran al que más confianza les genera."

6. RECURSO O SIGUIENTE PASO: No entregues todo. Abre una conversación.
   Ejemplo: "Tengo una plantilla con los contenidos que más clientes generan. Comenta 'PLANTILLA' y te la envío."`,

  "ventas-directo": `ESTRUCTURA: VENTAS — DIRECTO AL DOLOR O ANHELO
Objetivo: Generar deseo, eliminar objeciones y llevar a la acción.

1. HOOK (DOLOR O DESEO): Habla directamente de lo que quiere o sufre el cliente.
   Ejemplo: "¿Cansada de esconder tu sonrisa en las fotos?"

2. AGITA EL PROBLEMA: Haz que recuerde las consecuencias.
   Ejemplo: "Mientras sigas posponiéndolo, seguirás sintiéndote insegura y perdiendo oportunidades."

3. PRESENTA LA SOLUCIÓN: Introduce tu producto o servicio.
   Ejemplo: "Por eso creamos nuestro tratamiento diseñado para transformar tu sonrisa de forma natural."

4. BENEFICIOS Y TRANSFORMACIÓN: No hables de características. Habla del resultado.
   Ejemplo: "✅ Sonrisa más blanca. ✅ Más confianza al hablar. ✅ Mayor seguridad."

5. ELIMINA OBJECIONES: Financiación, evaluación personalizada, procedimiento seguro, resultados naturales.

6. CTA: "Escríbenos 'SONRISA' y agenda tu valoración."`,

  "ventas-testimonio": `ESTRUCTURA: VENTAS — CON TESTIMONIOS O RESULTADOS
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

7. CTA: "Si tú también quieres un cambio así, envíanos un mensaje con la palabra 'CAMBIO'."`
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { viralVideoId, topic, awarenessLevel, stage, contentType, subType } = await req.json();

  const { data: questionnaire } = await supabase
    .from("questionnaires")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!questionnaire) {
    return NextResponse.json({ error: "Completá tu perfil primero" }, { status: 400 });
  }

  let videoContext = "";
  if (viralVideoId) {
    const { data: video } = await supabase
      .from("viral_videos")
      .select("title, transcript, hashtags")
      .eq("id", viralVideoId)
      .single();
    if (video) {
      videoContext = `
Video viral de referencia:
- Título: ${video.title}
- Hashtags: ${video.hashtags?.join(", ")}
- Transcripción: ${video.transcript || "No disponible"}`;
    }
  }

  const brandBlueprint = questionnaire.brand_blueprint as Record<string, string>;
  const structureKey = contentType && subType ? `${contentType}-${subType}` : null;
  const structure = structureKey ? STRUCTURES[structureKey] : null;

  const stageMap: Record<string, string> = {
    attraction: "atraccion-polemico",
    nurturing: "nutricion-valor",
    conversion: "ventas-directo",
  };

  const effectiveStructure = structure || (stage ? STRUCTURES[stageMap[stage]] : null);

  const prompt = `Sos un experto en marketing de contenidos y copywriting para redes sociales, especialmente TikTok e Instagram.

PERFIL DEL CREADOR:
- Nicho: ${questionnaire.niche}
- Oferta principal: ${questionnaire.offer}
- Estilo de contenido: ${questionnaire.content_style}
- Tono de comunicación: ${brandBlueprint?.tone || "profesional y cercano"}
- Valores de marca: ${brandBlueprint?.values || "autenticidad, resultados"}
- Cliente ideal: ${brandBlueprint?.target_audience || "emprendedores"}
- Pilares de contenido: ${brandBlueprint?.content_pillars || "educación, inspiración"}

${effectiveStructure ? `SIGUE ESTA ESTRUCTURA EXACTAMENTE:\n${effectiveStructure}` : ""}

${videoContext}
${topic ? `Tema o contexto adicional: ${topic}` : ""}
${awarenessLevel ? `Nivel de conciencia: ${awarenessLevel === "high" ? "Alto" : awarenessLevel === "medium" ? "Medio" : "Bajo"}` : ""}

INSTRUCCIONES:
- Genera un guión completo para un video corto (60-90 segundos)
- Adapta TODO al nicho y oferta del creador
- El gancho debe ser IRRESISTIBLE y de ROOM ALTO (temas universales que le importan a todos)
- El CTA debe incluir una palabra clave específica para comentar
- Usa lenguaje natural, como si estuviera hablando a cámara
- NO uses emojis en el guión

Respondé en formato JSON:
{
  "title": "Título descriptivo del guión",
  "hook": "El gancho inicial (primeros 3 segundos, debe generar curiosidad inmediata)",
  "development": "El desarrollo completo del contenido siguiendo la estructura paso a paso",
  "cta": "La llamada a la acción final con palabra clave para comentar"
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Respuesta inesperada");

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No se pudo parsear el guión");

    const scriptData = JSON.parse(jsonMatch[0]);

    const effectiveStage = stage || (contentType === "atraccion" ? "attraction" : contentType === "nutricion" ? "nurturing" : contentType === "ventas" ? "conversion" : null);

    const { data: script, error } = await supabase
      .from("scripts")
      .insert({
        user_id: user.id,
        viral_video_id: viralVideoId ?? null,
        title: scriptData.title,
        hook: scriptData.hook,
        development: scriptData.development,
        cta: scriptData.cta,
        awareness_level: awarenessLevel ?? null,
        stage: effectiveStage,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ scriptId: script.id, script });
  } catch (e) {
    console.error("Error generando guión:", e);
    return NextResponse.json({ error: "Error al generar el guión" }, { status: 500 });
  }
}
