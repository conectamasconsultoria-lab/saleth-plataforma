// Tool-use forzado para que Claude devuelva el guión en JSON estructurado,
// en vez de parsear texto libre con regex (frágil ante variaciones de formato).
export const ENTREGAR_GUION_TOOL = {
  name: "entregar_guion",
  description: "Entrega el guión final (o la revisión editada) en sus 4 partes.",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string", description: "Título descriptivo del guión" },
      hook: { type: "string", description: "El gancho inicial (primeros 3 segundos, debe generar curiosidad inmediata)" },
      development: { type: "string", description: "El desarrollo completo del contenido siguiendo la estructura paso a paso" },
      cta: { type: "string", description: "La llamada a la acción final" },
      resumen_cambio: { type: "string", description: "Resumen breve de qué se modificó respecto a la versión anterior (solo se usa en ediciones)" },
    },
    required: ["title", "hook", "development", "cta"],
  },
};

export type EntregarGuionInput = {
  title: string;
  hook: string;
  development: string;
  cta: string;
  resumen_cambio?: string;
};

export function extractToolInput(message: {
  content: Array<{ type: string; name?: string; input?: unknown }>;
}): EntregarGuionInput {
  const toolUse = message.content.find(
    (block) => block.type === "tool_use" && block.name === "entregar_guion"
  );
  if (!toolUse || !toolUse.input) {
    throw new Error("El modelo no devolvió el guión en el formato esperado");
  }
  return toolUse.input as EntregarGuionInput;
}
