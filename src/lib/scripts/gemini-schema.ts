// Salida estructurada forzada vía responseSchema de Gemini (equivalente al
// tool-use forzado que usaba Claude en tool-schema.ts), para que el guión
// llegue siempre en JSON con las mismas 4 partes, sin parseo de texto libre.
export const GUION_JSON_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "Título descriptivo del guión" },
    hook: { type: "string", description: "El gancho inicial (primeros 3 segundos, debe generar curiosidad inmediata)" },
    development: { type: "string", description: "El desarrollo completo del contenido siguiendo la estructura paso a paso" },
    cta: { type: "string", description: "La llamada a la acción final" },
    resumen_cambio: { type: "string", description: "Resumen breve de qué se modificó respecto a la versión anterior (solo se usa en ediciones)" },
  },
  required: ["title", "hook", "development", "cta"],
};

export type EntregarGuionInput = {
  title: string;
  hook: string;
  development: string;
  cta: string;
  resumen_cambio?: string;
};

export function parseGuionResponse(text: string | undefined): EntregarGuionInput {
  if (!text) {
    throw new Error("El modelo no devolvió el guión en el formato esperado");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("El modelo no devolvió el guión en el formato esperado");
  }
  const data = parsed as Partial<EntregarGuionInput>;
  if (!data.title || !data.hook || !data.development || !data.cta) {
    throw new Error("El modelo no devolvió el guión en el formato esperado");
  }
  return data as EntregarGuionInput;
}
