import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Sparkles, Wand2, Lightbulb } from "lucide-react";

const TIPS = [
  "El 80% del resultado depende de la portada — debe detener el scroll en menos de 1 segundo. Si el título no engancha, nadie pasa al resto.",
  "Una idea por slide (o por story). No satures: si necesitas explicar dos cosas, son dos slides, no una.",
  "Mantén consistencia visual: mismos colores y tipografía en todas las piezas. Puedes configurar tu identidad de marca en Ajustes → Identidad Visual.",
  "Textos cortos y legibles: máximo 3-4 líneas por slide, tipografía grande, alto contraste con el fondo.",
  "Termina siempre con un CTA claro y único (guardar, comentar una palabra clave, o compartir) — nunca pidas tres acciones a la vez.",
  "En Stories: usa stickers interactivos (encuestas, preguntas, cuenta regresiva) para generar interacción real, no solo views pasivas.",
  "En Stories: arma series conectadas (\"parte 1 de 3\") para generar el hábito de que te sigan viendo.",
];

const STRUCTURES = [
  {
    title: "Los errores que cometen tus clientes",
    formula: "Portada (los N errores) → 1 error por slide (por qué pasa + ejemplo + corrección) → \"¿cuál estás cometiendo tú?\"",
    when: "Ideal para generar identificación inmediata — el lector piensa \"eso me pasa a mí\" desde la portada.",
  },
  {
    title: "La verdad que nadie te dice",
    formula: "Portada con tensión/curiosidad → cada slide revela una verdad incómoda o contraintuitiva → cierre empoderador",
    when: "Ideal para posicionarte como alguien que dice lo que otros callan en tu industria.",
  },
  {
    title: "Cómo lograrlo en N pasos",
    formula: "Promesa de resultado específico → 1 paso accionable por slide, en orden lógico, con un tip cada uno → \"¿en qué paso estás tú?\"",
    when: "Ideal para contenido tipo tutorial o guía práctica.",
  },
  {
    title: "Mitos que hay que dejar de creer",
    formula: "Portada de ruptura de creencia → cada slide: MITO → REALIDAD → por qué importa → cierre invitando a comentar",
    when: "Ideal para posicionarte como experto que corrige información errónea instalada en tu nicho.",
  },
  {
    title: "Tu método paso a paso",
    formula: "Portada con promesa de un método propio y probado → presentas el sistema (con nombre si es posible), cada fase con ejemplos reales → CTA de acción concreta",
    when: "Ideal para mostrar autoridad con un sistema replicable, no solo consejos sueltos.",
  },
  {
    title: "Antes y después",
    formula: "Contraste poderoso en portada → cada slide alterna una dimensión del \"antes\" y el \"después\" (mentalidad, resultados, rutina) → \"¿en qué parte del camino estás tú?\"",
    when: "Ideal para storytelling de transformación, personal o de un cliente.",
  },
  {
    title: "Lista de aprendizajes",
    formula: "Portada de acumulación de valor → 1 aprendizaje corto y memorable por slide, de menor a mayor impacto → \"¿con cuál te quedas?\"",
    when: "Ideal para condensar mucho valor rápido, tipo \"todo lo que aprendí sobre X\".",
  },
];

const CANVA_PROMPTS = [
  {
    label: "Portada de carrusel",
    prompt: "Diseño de portada minimalista para carrusel de Instagram, fondo en [color de marca], tipografía bold y grande centrada, estilo editorial moderno, mucho espacio en blanco, sin elementos que distraigan, formato 4:5",
  },
  {
    label: "Fondo para slides de contenido",
    prompt: "Fondo abstracto suave en tonos [color de marca], textura sutil tipo grano de papel, minimalista, sin texto, ideal para superponer texto encima, formato cuadrado",
  },
  {
    label: "Ilustración conceptual",
    prompt: "Ilustración plana (flat design) que represente [concepto, ej: crecimiento, organización, claridad], paleta de colores [color de marca] y tonos neutros, estilo moderno y limpio, sin texto",
  },
  {
    label: "Fondo de story con encuesta",
    prompt: "Fondo vertical 9:16 para story de Instagram, con espacio libre arriba para sticker de encuesta, colores [color de marca], estilo minimalista y aspiracional",
  },
  {
    label: "Slide de cierre / CTA",
    prompt: "Diseño de slide final de carrusel con foco en un botón o flecha llamando a la acción, fondo en [color de marca] con alto contraste, estilo limpio, espacio para un texto de CTA corto",
  },
  {
    label: "Mockup de celular",
    prompt: "Mockup fotorrealista de un teléfono con pantalla en blanco, sobre fondo [color de marca o neutro], ángulo 3/4, iluminación suave de estudio, para insertar una captura de pantalla",
  },
];

export default function CarouselsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Carruseles y Stories</h1>
        <p className="text-muted-foreground mt-1">
          Guía práctica para crear carruseles y stories efectivos: principios, estructuras probadas y prompts para diseñar en Canva
        </p>
      </div>

      {/* Principios generales */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Cómo crear carruseles y stories efectivos
          </CardTitle>
          <CardDescription>Principios que aplican tanto a carruseles como a stories</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {TIPS.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Estructuras y ejemplos */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          Estructuras y ejemplos
        </h2>
        <div className="space-y-3">
          {STRUCTURES.map((s, i) => (
            <Card key={s.title}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-bold">#{i + 1}</Badge>
                  <CardTitle className="text-base">{s.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm font-mono text-primary/80 bg-primary/5 rounded px-3 py-2">{s.formula}</p>
                <p className="text-sm text-muted-foreground">{s.when}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Estudia referentes reales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Además de estas estructuras, es muy útil ver cómo las aplican creadores que ya dominan el formato — por ejemplo,
            revisa el feed de creadores como <strong>Ramiro Curi</strong> y <strong>Jan Bastarda</strong> para ver estas
            fórmulas funcionando en la práctica y adaptar lo que veas a tu propio estilo.
          </p>
        </CardContent>
      </Card>

      {/* Biblioteca de prompts para Canva */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          Biblioteca de prompts para Canva
        </h2>
        <p className="text-sm text-muted-foreground mb-3">
          Pega estos prompts en el generador de imágenes con IA de Canva (Magic Media / Texto a Imagen) y reemplaza lo que
          está entre corchetes por los datos de tu marca.
        </p>
        <div className="space-y-3">
          {CANVA_PROMPTS.map((p) => (
            <Card key={p.label}>
              <CardContent className="pt-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <p className="text-sm font-semibold">{p.label}</p>
                </div>
                <p className="text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2 font-mono">{p.prompt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
