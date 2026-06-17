"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  Palette,
  CalendarDays,
  BookOpen,
  Package,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  LayoutTemplate,
  MessageSquare,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Pilar = { id: number; nombre: string; descripcion: string; posts_semana: number };
type Resource = { id: number; titulo: string; descripcion: string; url: string; categoria: string };

type BrandElements = {
  mision: string; vision: string; proposito: string; promesa: string; diferencial: string;
  tono_voz: string; valores: string; keywords: string;
  cliente_ideal: string; dolores_cliente: string; deseos_cliente: string; por_que_eligen: string;
};
type ContentPlanner = {
  pillars: Pilar[];
  semana_tipo: Record<string, string>;
  formatos: string[];
  frecuencia_semanal: number;
  tema_mensual: string;
};
type StoryPlanner = {
  historia_origen: string;
  transformacion_cliente: string; antes: string; despues: string;
  secuencia_stories: string[];
  hooks: string[];
};

type CommunicationFramework = {
  principios: string;
  fortalezas: string;
  debilidades: string;
  enemigo: string;
  piedras: string;
};

type IdentityFramework = {
  posicionamiento: string;
  pilares_personaje: string;
  rasgos: string;
  estilo_comunicacion: string;
  estetica_visual: string;
  musica: string;
  inspiraciones: string;
  lenguaje_propio: string;
};

type AvatarContentFramework = {
  a_quien_le_hablas: string;
  que_busca: string;
  ideales_esencia: string;
  de_quien_me_apalanco: string;
  pensamiento: string;
  ref_atraccion: string;
  ref_nutricion: string;
  ref_contenido_corto: string;
  ref_ia: string;
  cta_atraccion: string;
  cta_nutricion: string;
  videos_corporal: string;
  videos_visual: string;
  videos_musical: string;
  videos_verbal: string;
  videos_edicion: string;
};

type StrategyData = {
  brand_elements: BrandElements;
  content_planner: ContentPlanner;
  story_planner: StoryPlanner;
  resources: Resource[];
  communication_framework: CommunicationFramework;
  identity_framework: IdentityFramework;
  avatar_content_framework: AvatarContentFramework;
};

type Props = {
  initialStrategy: StrategyData | null;
  questionnaire: {
    niche?: string; offer?: string; content_style?: string;
    brand_blueprint?: { tone?: string; values?: string; target_audience?: string; content_pillars?: string };
    personality_archetype?: string;
  } | null;
  role: string;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

function defaultStrategy(q: Props["questionnaire"]): StrategyData {
  const bp = q?.brand_blueprint ?? {};
  return {
    brand_elements: {
      mision: "", vision: "", proposito: "", promesa: "", diferencial: "",
      tono_voz: bp.tone ?? "",
      valores: bp.values ?? "",
      keywords: "",
      cliente_ideal: bp.target_audience ?? "",
      dolores_cliente: "", deseos_cliente: "", por_que_eligen: "",
    },
    content_planner: {
      pillars: [
        { id: 1, nombre: bp.content_pillars?.split(",")[0]?.trim() ?? "", descripcion: "", posts_semana: 2 },
        { id: 2, nombre: "", descripcion: "", posts_semana: 1 },
        { id: 3, nombre: "", descripcion: "", posts_semana: 1 },
        { id: 4, nombre: "", descripcion: "", posts_semana: 1 },
        { id: 5, nombre: "", descripcion: "", posts_semana: 1 },
      ],
      semana_tipo: { Lunes: "", Martes: "", Miércoles: "", Jueves: "", Viernes: "", Sábado: "", Domingo: "" },
      formatos: ["Reels", "Carruseles"],
      frecuencia_semanal: 3,
      tema_mensual: "",
    },
    story_planner: {
      historia_origen: "",
      transformacion_cliente: "", antes: "", despues: "",
      secuencia_stories: ["", "", "", "", ""],
      hooks: [""],
    },
    resources: [],
    communication_framework: {
      principios: "",
      fortalezas: "",
      debilidades: "",
      enemigo: "",
      piedras: "",
    },
    identity_framework: {
      posicionamiento: "",
      pilares_personaje: "",
      rasgos: "",
      estilo_comunicacion: "",
      estetica_visual: "",
      musica: "",
      inspiraciones: "",
      lenguaje_propio: "",
    },
    avatar_content_framework: {
      a_quien_le_hablas: "",
      que_busca: "",
      ideales_esencia: "",
      de_quien_me_apalanco: "",
      pensamiento: "",
      ref_atraccion: "",
      ref_nutricion: "",
      ref_contenido_corto: "",
      ref_ia: "",
      cta_atraccion: "",
      cta_nutricion: "",
      videos_corporal: "",
      videos_visual: "",
      videos_musical: "",
      videos_verbal: "",
      videos_edicion: "",
    },
  };
}

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const FORMATOS_OPCIONES = ["Reels / TikToks", "Carruseles", "Posts estáticos", "Stories", "Newsletter", "Podcast", "Lives"];
const CATEGORIAS_RECURSOS = ["Herramienta", "Plantilla", "Lectura", "Video", "App", "Curso"];
const TABS = [
  { id: "marca", label: "Elementos de Marca", icon: Palette },
  { id: "marcos", label: "Marcos de Marca", icon: LayoutTemplate },
  { id: "contenido", label: "Planificador", icon: CalendarDays },
  { id: "historias", label: "Historias", icon: BookOpen },
  { id: "recursos", label: "Recursos", icon: Package },
];

// ─── Componente principal ──────────────────────────────────────────────────────

export function EstrategiaClient({ initialStrategy, questionnaire, role: _role }: Props) {
  const [activeTab, setActiveTab] = useState("marca");
  const [saving, setSaving] = useState(false);

  const def = defaultStrategy(questionnaire);
  const [data, setData] = useState<StrategyData>(() => {
    if (!initialStrategy) return def;
    return {
      ...def,
      ...initialStrategy,
      communication_framework: {
        ...def.communication_framework,
        ...(initialStrategy as StrategyData).communication_framework,
      },
      identity_framework: {
        ...def.identity_framework,
        ...(initialStrategy as StrategyData).identity_framework,
      },
      avatar_content_framework: {
        ...def.avatar_content_framework,
        ...(initialStrategy as StrategyData).avatar_content_framework,
      },
    };
  });

  const supabase = createClient();

  // ── Helpers de actualización ──────────────────────────────────────────────

  function setBrand(key: keyof BrandElements, val: string) {
    setData((d) => ({ ...d, brand_elements: { ...d.brand_elements, [key]: val } }));
  }
  function setPlanner(key: keyof ContentPlanner, val: ContentPlanner[keyof ContentPlanner]) {
    setData((d) => ({ ...d, content_planner: { ...d.content_planner, [key]: val } }));
  }
  function setStory(key: keyof StoryPlanner, val: StoryPlanner[keyof StoryPlanner]) {
    setData((d) => ({ ...d, story_planner: { ...d.story_planner, [key]: val } }));
  }
  function setComm(key: keyof CommunicationFramework, val: CommunicationFramework[keyof CommunicationFramework]) {
    setData((d) => ({ ...d, communication_framework: { ...d.communication_framework, [key]: val } }));
  }
  function setIdent(key: keyof IdentityFramework, val: IdentityFramework[keyof IdentityFramework]) {
    setData((d) => ({ ...d, identity_framework: { ...d.identity_framework, [key]: val } }));
  }
  function setAC(key: keyof AvatarContentFramework, val: string) {
    setData((d) => ({ ...d, avatar_content_framework: { ...d.avatar_content_framework, [key]: val } }));
  }

  // ── Guardar ──────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("brand_strategy").upsert({
        user_id: user!.id,
        brand_elements: data.brand_elements,
        content_planner: data.content_planner,
        story_planner: data.story_planner,
        resources: data.resources,
        communication_framework: data.communication_framework,
        identity_framework: data.identity_framework,
        avatar_content_framework: data.avatar_content_framework,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (error) throw error;
      toast.success("Estrategia guardada");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 w-fit" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                active ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}
              style={active ? { background: "linear-gradient(135deg, #1A6FFF, #00C8FF)", boxShadow: "0 4px 12px rgba(26,111,255,0.3)" } : {}}
            >
              <Icon className="h-4 w-4" strokeWidth={1.8} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB: Elementos de Marca ─────────────────────────────────────── */}
      {activeTab === "marca" && (
        <div className="space-y-5">
          {/* Arquetipo auto-fill banner */}
          {questionnaire?.personality_archetype && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
              style={{ background: "linear-gradient(135deg, #1A6FFF15, #00C8FF08)", border: "1px solid #1A6FFF25" }}>
              <Sparkles className="h-4 w-4 text-blue-500 flex-shrink-0" strokeWidth={1.8} />
              <span className="text-gray-700">
                Tu arquetipo de marca es <strong className="text-blue-700">{questionnaire.personality_archetype}</strong> — se usa automáticamente en toda la plataforma.
              </span>
            </div>
          )}

          {/* Identidad */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identidad de Marca</CardTitle>
              <CardDescription>El núcleo de quién sos y para qué existís</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Misión — ¿Para qué existís?" hint="El impacto que generás en las personas">
                <Textarea rows={3} placeholder="Ej: Existo para ayudar a coaches y emprendedores a construir una marca personal que les permita vivir de su conocimiento con libertad..." value={data.brand_elements.mision} onChange={(e) => setBrand("mision", e.target.value)} />
              </Field>
              <Field label="Visión — ¿Hacia dónde vas?" hint="Tu aspiración a largo plazo">
                <Textarea rows={2} placeholder="Ej: Ser la referente latinoamericana en marca personal para coaches..." value={data.brand_elements.vision} onChange={(e) => setBrand("vision", e.target.value)} />
              </Field>
              <Field label="Propósito de Marca — ¿Qué cambio generás en el mundo?" hint="Más profundo que la misión: tu 'por qué'">
                <Textarea rows={2} placeholder="Ej: Creo que cada persona tiene un conocimiento único que merece ser compartido..." value={data.brand_elements.proposito} onChange={(e) => setBrand("proposito", e.target.value)} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Promesa de Marca" hint="La transformación que garantizás">
                  <Input placeholder="Ej: En 90 días tenés una marca que vende sola" value={data.brand_elements.promesa} onChange={(e) => setBrand("promesa", e.target.value)} />
                </Field>
                <Field label="Tu Diferencial" hint="¿Qué hacés que nadie más hace igual?">
                  <Input placeholder="Ej: Combino psicología, estrategia y creatividad..." value={data.brand_elements.diferencial} onChange={(e) => setBrand("diferencial", e.target.value)} />
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Personalidad */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personalidad de Marca</CardTitle>
              <CardDescription>Cómo hablás, qué representás y quién sos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Tono de Voz" hint="3-5 adjetivos que describen cómo comunicás">
                  <Input placeholder="Ej: Directo, empático, motivacional, con humor" value={data.brand_elements.tono_voz} onChange={(e) => setBrand("tono_voz", e.target.value)} />
                </Field>
                <Field label="Valores de Marca" hint="3-5 valores que guían todo lo que hacés">
                  <Input placeholder="Ej: Autenticidad, resultados, libertad, comunidad" value={data.brand_elements.valores} onChange={(e) => setBrand("valores", e.target.value)} />
                </Field>
              </div>
              <Field label="Keywords de Marca" hint="8-10 palabras que te representan y usan tus clientes para describirte">
                <Input placeholder="Ej: transformación, estrategia, autenticidad, resultados, claridad, marca, confianza, comunidad" value={data.brand_elements.keywords} onChange={(e) => setBrand("keywords", e.target.value)} />
              </Field>
            </CardContent>
          </Card>

          {/* Audiencia */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tu Audiencia Ideal</CardTitle>
              <CardDescription>A quién le hablás y qué los mueve</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Perfil de tu Cliente Ideal" hint="Quién es, qué hace, dónde está en su vida">
                <Textarea rows={3} placeholder="Ej: Coach de negocios, 30-45 años, tiene clientes pero no escala. Trabaja muchas horas, siente que cobra poco, quiere libertad y reconocimiento..." value={data.brand_elements.cliente_ideal} onChange={(e) => setBrand("cliente_ideal", e.target.value)} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Sus Principales Dolores" hint="Frustraciones y miedos que lo quitan el sueño">
                  <Textarea rows={4} placeholder={"• No sabe cómo diferenciarse\n• Tiene miedo de mostrarse\n• No sabe qué contenido crear\n• Siente que su mensaje no llega"} value={data.brand_elements.dolores_cliente} onChange={(e) => setBrand("dolores_cliente", e.target.value)} />
                </Field>
                <Field label="Sus Principales Deseos" hint="Qué quiere lograr, sentir o tener">
                  <Textarea rows={4} placeholder={"• Ser reconocido/a como referente\n• Tener una marca que venda sola\n• Generar ingresos sin depender de nadie\n• Sentir que su trabajo tiene impacto"} value={data.brand_elements.deseos_cliente} onChange={(e) => setBrand("deseos_cliente", e.target.value)} />
                </Field>
              </div>
              <Field label="¿Por qué te eligen a vos?" hint="Tu ventaja percibida: qué ven en vos que no encuentran en otros">
                <Textarea rows={2} placeholder="Ej: Porque soy honesta, voy al grano, no vendo humo y mis estrategias son prácticas y reales..." value={data.brand_elements.por_que_eligen} onChange={(e) => setBrand("por_que_eligen", e.target.value)} />
              </Field>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── TAB: Marcos de Marca ─────────────────────────────────────────── */}
      {activeTab === "marcos" && (
        <div className="space-y-5">
          {/* Marco de Identidad */}
          <MarcoTable
            title="Marco de Identidad"
            icon={<UserCircle className="h-4 w-4 text-white" strokeWidth={1.8} />}
            rows={[
              {
                label: "POSICIONAMIENTO",
                placeholder: "Ej: Acompaño a personas con éxito material pero sin disfrute a entender por qué no se sienten plenas, identificar la raíz del problema y construir una vida con sentido real.",
                value: data.identity_framework.posicionamiento,
                onChange: (v) => setIdent("posicionamiento", v),
              },
              {
                label: "PILARES DE PERSONAJE",
                placeholder: "Ej: Experiencia real (no teoría): viví lo mismo que enseño\nAutenticidad: digo las cosas como son, sin caretas\nConciencia: invito a frenar y mirar hacia adentro antes de buscar soluciones externas\nPráctica: ofrezco herramientas concretas",
                value: data.identity_framework.pilares_personaje,
                onChange: (v) => setIdent("pilares_personaje", v),
              },
              {
                label: "RASGOS",
                placeholder: "Ej: Directo · Cercano · Humano · Reflexivo · Claro · Sin vueltas · No gurú · No vendedor agresivo · Con calle",
                value: data.identity_framework.rasgos,
                onChange: (v) => setIdent("rasgos", v),
              },
              {
                label: "ESTILO DE COMUNICACIÓN",
                placeholder: 'Ej: Lenguaje simple, como hablando con un amigo. Frases cortas, directas, con carga emocional. Primero conecto desde el comportamiento o la emoción, luego explico. Genero identificación → incomodidad → reflexión. Cierres simples tipo: "Pensalo."',
                value: data.identity_framework.estilo_comunicacion,
                onChange: (v) => setIdent("estilo_comunicacion", v),
              },
              {
                label: "ESTÉTICA VISUAL",
                placeholder: "Ej: Minimalista, limpia y sobria. Colores profundos con acentos cálidos. Paleta: Azul profundo · Celeste · Naranja atardecer. Foto real (no stock). Luz cálida, orgánica.",
                value: data.identity_framework.estetica_visual,
                onChange: (v) => setIdent("estetica_visual", v),
              },
              {
                label: "MÚSICA",
                placeholder: "Ej: Música relajada, moderna, introspectiva. Estilo lo-fi, instrumental o electrónica suave. Busca acompañar el mensaje, no distraer.",
                value: data.identity_framework.musica,
                onChange: (v) => setIdent("musica", v),
              },
              {
                label: "INSPIRACIONES / REFERENTES",
                placeholder: "Ej: Borja Vilaseca → claridad y frontalidad\nClaudio Naranjo → profundidad del Eneagrama\nEckhart Tolle → presencia y conciencia\nMáximo Tuero → honestidad brutal",
                value: data.identity_framework.inspiraciones,
                onChange: (v) => setIdent("inspiraciones", v),
              },
              {
                label: "LENGUAJE PROPIO",
                placeholder: `Frases clave:\n"Corrés todo el día… pero no sabés para qué"\n"Tenés todo… pero no lo disfrutás"\n"No es falta de tiempo… es falta de dirección"\n\nCierre característico: "Pensalo."`,
                value: data.identity_framework.lenguaje_propio,
                onChange: (v) => setIdent("lenguaje_propio", v),
              },
            ]}
          />

          {/* Avatar & Contenido */}
          <MarcoTableGrouped
            title="Avatar & Producción de Contenido"
            icon={<UserCircle className="h-4 w-4 text-white" strokeWidth={1.8} />}
            sections={[
              {
                type: "simple",
                label: "A quien le hablas",
                placeholder: "Ej: Dueños de negocio (Medianamente)",
                value: data.avatar_content_framework.a_quien_le_hablas,
                onChange: (v) => setAC("a_quien_le_hablas", v),
              },
              {
                type: "simple",
                label: "Que busca",
                placeholder: "Ej: Ganar más dinero, reconocimiento, demostrar que sí pudieron, querer una vida diferente, status, libertad, dejar huella.",
                value: data.avatar_content_framework.que_busca,
                onChange: (v) => setAC("que_busca", v),
              },
              {
                type: "simple",
                label: "Ideales (Esencia)",
                placeholder: 'Hambre: Desde chico intentando negocios.\nDolor: Miedo a fracasar. Miedo a volver a trabajar para alguien.\nIdentidad: "No importa cuántas veces falle, sigo."\nAspiración: Cambiar tu vida y la de tu familia.\nEvolución: No naciste seguro. Te construiste.',
                value: data.avatar_content_framework.ideales_esencia,
                onChange: (v) => setAC("ideales_esencia", v),
              },
              {
                type: "simple",
                label: "De quien me apalanco para hacer videos",
                placeholder: "Ej: Personas ambiciosas, inseguras pero hambrientas, gente que quiere más de la vida, personas que sienten presión, personas que quieren cambiar su realidad.",
                value: data.avatar_content_framework.de_quien_me_apalanco,
                onChange: (v) => setAC("de_quien_me_apalanco", v),
              },
              {
                type: "simple",
                label: "Pensamiento",
                placeholder: `"quiero crecer"\n"quiero dinero"\n"quiero respeto"\n"quiero salir adelante"\n"quiero demostrarme algo"\n"quiero dejar de sentirme pequeño"`,
                value: data.avatar_content_framework.pensamiento,
                onChange: (v) => setAC("pensamiento", v),
              },
              {
                type: "group",
                label: "Referentes",
                subRows: [
                  {
                    label: "Atraccion",
                    placeholder: "Ej: Julioiero (películas o datos virales de personas famosas, storytelling). Tino Mossu. Formato Corto. Video aspiracionales. Carruseles. Pantalla verde.",
                    value: data.avatar_content_framework.ref_atraccion,
                    onChange: (v) => setAC("ref_atraccion", v),
                  },
                  {
                    label: "Nutricion",
                    placeholder: "Ej: Ramirocubria (problemas). Mateo Maffia (mostrando cosas en la tablet). Meme + facto. Pantalla verde. Formato Pregunta de IG. Juanpi. venta.silenciosa.",
                    value: data.avatar_content_framework.ref_nutricion,
                    onChange: (v) => setAC("ref_nutricion", v),
                  },
                  {
                    label: "Contenido corto",
                    placeholder: "Ej: Maria Duran",
                    value: data.avatar_content_framework.ref_contenido_corto,
                    onChange: (v) => setAC("ref_contenido_corto", v),
                  },
                  {
                    label: "IA",
                    placeholder: "Ej: Contenido con IA",
                    value: data.avatar_content_framework.ref_ia,
                    onChange: (v) => setAC("ref_ia", v),
                  },
                ],
              },
              {
                type: "group",
                label: "CTA",
                subRows: [
                  {
                    label: "Atraccion / Aspiracional",
                    placeholder: "Ej: Sigueme si eres también una persona con ganas de crecer.",
                    value: data.avatar_content_framework.cta_atraccion,
                    onChange: (v) => setAC("cta_atraccion", v),
                  },
                  {
                    label: "Nutricion",
                    placeholder: "Ej: Dar recurso.",
                    value: data.avatar_content_framework.cta_nutricion,
                    onChange: (v) => setAC("cta_nutricion", v),
                  },
                ],
              },
              {
                type: "group",
                label: "Videos",
                subRows: [
                  {
                    label: "Estetica corporal",
                    placeholder: "Ej: Afeitado, peinado (con crema de peinar), sin lentes, camisas planchadas, polo camiseros, cejas depiladas, uñas cortadas y limpias.",
                    value: data.avatar_content_framework.videos_corporal,
                    onChange: (v) => setAC("videos_corporal", v),
                  },
                  {
                    label: "Estetica visual",
                    placeholder: "Ej: Limpio, iluminado, no exagerado. Colores neutros, colores fríos. Espacios de la casa: terraza, sala y estudio. Usar con prioridad OsmoPocket.",
                    value: data.avatar_content_framework.videos_visual,
                    onChange: (v) => setAC("videos_visual", v),
                  },
                  {
                    label: "Estetica musical",
                    placeholder: "Ej: Música de alta frecuencia, Mozart (cuando se hable de reflexiones). Música no pacharaca, sin letra. Sonidos bajos. Música rock, americana. acdc.",
                    value: data.avatar_content_framework.videos_musical,
                    onChange: (v) => setAC("videos_musical", v),
                  },
                  {
                    label: "Estetica verbal",
                    placeholder: "Ej: Ser yo al natural, no utilizar muchas lisuras, verte como especialista, no dar cringe. No moverse de un lado a otro. Palabras aprobadas: datazo y carajo.",
                    value: data.avatar_content_framework.videos_verbal,
                    onChange: (v) => setAC("videos_verbal", v),
                  },
                  {
                    label: "Estetica edicion",
                    placeholder: "Ej: No usar muchos colores, ser más limpios al editor. No cortes ni sonidos pacharacos. No poner el rostro artificial. Siempre fijarse en los colores del video.",
                    value: data.avatar_content_framework.videos_edicion,
                    onChange: (v) => setAC("videos_edicion", v),
                  },
                ],
              },
            ]}
          />

          {/* Marco de Comunicación */}
          <MarcoTable
            title="Marco de Comunicación"
            icon={<MessageSquare className="h-4 w-4 text-white" strokeWidth={1.8} />}
            rows={[
              {
                label: "Principios",
                placeholder: "Ej: Primero conectar, después explicar\nHablar desde la experiencia, no desde la teoría\nMostrar, no convencer\nIncomodar para generar conciencia\nSimplicidad: si no se entiende, no funciona",
                value: data.communication_framework.principios,
                onChange: (v) => setComm("principios", v),
              },
              {
                label: "Fortalezas",
                placeholder: "Ej: Alta identificación con el avatar\nMensajes simples pero profundos\nExperiencia real (no vende humo)\nTono humano y cercano\nCapacidad de generar reflexión rápida",
                value: data.communication_framework.fortalezas,
                onChange: (v) => setComm("fortalezas", v),
              },
              {
                label: "Debilidades",
                placeholder: 'Ej: Puede parecer poco "estructurado" para perfiles muy racionales\nFalta de explicación técnica puede generar dudas en algunos\nNo comunica de entrada el "cómo"',
                value: data.communication_framework.debilidades,
                onChange: (v) => setComm("debilidades", v),
              },
              {
                label: "Enemigo",
                placeholder: 'Ej: Coaches motivacionales genéricos (frases lindas, cero profundidad)\nCursos de "desarrollo personal" superficiales\nTerapias largas sin dirección clara ni resultados\nGurús que hablan desde teoría, no desde experiencia\nTodos tienen algo en común: evaden el problema real',
                value: data.communication_framework.enemigo,
                onChange: (v) => setComm("enemigo", v),
              },
              {
                label: "Piedras",
                placeholder: `"No es falta de ganas… es que no entendés qué te pasa"\n"No necesitás más motivación"\n"El problema no se soluciona pensando positivo"\n"No es falta de tiempo… es falta de dirección"\n\nMensaje central: Ellos entretienen o contienen, yo ayudo a transformar.`,
                value: data.communication_framework.piedras,
                onChange: (v) => setComm("piedras", v),
              },
            ]}
          />
        </div>
      )}

      {/* ─── TAB: Planificador de Contenido ────────────────────────────────── */}
      {activeTab === "contenido" && (
        <div className="space-y-5">
          {/* Pilares */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pilares de Contenido</CardTitle>
              <CardDescription>Los temas principales sobre los que girará todo tu contenido</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.content_planner.pillars.map((pilar, i) => (
                <div key={pilar.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}>
                      {i + 1}
                    </div>
                    <Input
                      placeholder={`Pilar ${i + 1} — Ej: Educación, Inspiración, Venta, Comunidad, Detrás de escena`}
                      value={pilar.nombre}
                      className="font-medium"
                      onChange={(e) => {
                        const updated = data.content_planner.pillars.map((p) =>
                          p.id === pilar.id ? { ...p, nombre: e.target.value } : p
                        );
                        setPlanner("pillars", updated);
                      }}
                    />
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Input
                        type="number" min={1} max={7}
                        value={pilar.posts_semana}
                        className="w-16 text-center"
                        onChange={(e) => {
                          const updated = data.content_planner.pillars.map((p) =>
                            p.id === pilar.id ? { ...p, posts_semana: Number(e.target.value) } : p
                          );
                          setPlanner("pillars", updated);
                        }}
                      />
                      <span className="text-xs text-gray-400 whitespace-nowrap">posts/sem</span>
                    </div>
                  </div>
                  <Textarea
                    rows={2}
                    placeholder="¿De qué trata este pilar? ¿Qué tipo de contenido incluye?"
                    value={pilar.descripcion}
                    onChange={(e) => {
                      const updated = data.content_planner.pillars.map((p) =>
                        p.id === pilar.id ? { ...p, descripcion: e.target.value } : p
                      );
                      setPlanner("pillars", updated);
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Semana tipo + formatos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Semana tipo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Semana Tipo</CardTitle>
                <CardDescription>Qué publicás cada día de la semana</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {DIAS.map((dia) => (
                  <div key={dia} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-500 w-16 flex-shrink-0">{dia}</span>
                    <Input
                      placeholder="Ej: Reel educativo, Carrusel de valor, Nada..."
                      value={data.content_planner.semana_tipo[dia] ?? ""}
                      onChange={(e) => setPlanner("semana_tipo", { ...data.content_planner.semana_tipo, [dia]: e.target.value })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Formatos y frecuencia */}
            <div className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Formatos que Usás</CardTitle>
                  <CardDescription>Seleccioná todos los que apliquen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {FORMATOS_OPCIONES.map((formato) => {
                      const sel = data.content_planner.formatos.includes(formato);
                      return (
                        <button
                          key={formato}
                          onClick={() => {
                            const updated = sel
                              ? data.content_planner.formatos.filter((f) => f !== formato)
                              : [...data.content_planner.formatos, formato];
                            setPlanner("formatos", updated);
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-sm font-medium border transition-all duration-150",
                            sel
                              ? "text-white border-transparent"
                              : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                          )}
                          style={sel ? { background: "linear-gradient(135deg, #1A6FFF, #00C8FF)", boxShadow: "0 2px 8px rgba(26,111,255,0.25)" } : {}}
                        >
                          {formato}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tema del Mes</CardTitle>
                  <CardDescription>El hilo conductor de este mes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Ej: Mes de la visibilidad, Lanzamiento de programa, Testimonios..."
                    value={data.content_planner.tema_mensual}
                    onChange={(e) => setPlanner("tema_mensual", e.target.value)}
                  />
                  <div className="flex items-center gap-3">
                    <Label className="text-sm text-gray-600 whitespace-nowrap">Meta semanal</Label>
                    <Input
                      type="number" min={1} max={21} className="w-20"
                      value={data.content_planner.frecuencia_semanal}
                      onChange={(e) => setPlanner("frecuencia_semanal", Number(e.target.value))}
                    />
                    <span className="text-sm text-gray-400">posts por semana</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: Planificar Historias ─────────────────────────────────────── */}
      {activeTab === "historias" && (
        <div className="space-y-5">
          {/* Historia de origen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tu Historia de Origen</CardTitle>
              <CardDescription>El relato de quién eras, qué pasó y quién te convertiste. Es la historia más poderosa de tu marca.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={8}
                placeholder={`Contá tu historia de origen. Podés seguir esta estructura:\n\n¿Dónde estabas antes? (situación inicial, dolores, limitaciones)\n¿Qué pasó? (el quiebre, el momento bisagra, la decisión)\n¿Qué descubriste o aprendiste? (la transformación, el insight)\n¿Dónde estás hoy? (resultado, misión, por qué hacés lo que hacés)\n¿A quién querés ayudar con lo que aprendiste?`}
                value={data.story_planner.historia_origen}
                onChange={(e) => setStory("historia_origen", e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Historia de transformación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historia de Transformación de Cliente</CardTitle>
              <CardDescription>El antes y después de alguien a quien ayudaste. La historia más convincente para vender.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="¿Quién es tu cliente?" hint="Perfil breve, sin nombre real si no querés">
                <Input placeholder="Ej: Coach de vida, 38 años, tenía clientes pero cobraba barato y no se diferenciaba..." value={data.story_planner.transformacion_cliente} onChange={(e) => setStory("transformacion_cliente", e.target.value)} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Antes — ¿Cómo llegó? ¿Qué problema tenía?" hint="">
                  <Textarea rows={4} placeholder="Ej: Estaba agotada, cobraba $300 por sesión, tenía miedo de subir precios, no sabía cómo diferenciarse..." value={data.story_planner.antes} onChange={(e) => setStory("antes", e.target.value)} />
                </Field>
                <Field label="Después — ¿Qué logró trabajando con vos?" hint="">
                  <Textarea rows={4} placeholder="Ej: Triplicó sus precios, rediseñó su oferta, lleva una lista de espera y trabaja solo 20hs semanales..." value={data.story_planner.despues} onChange={(e) => setStory("despues", e.target.value)} />
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Secuencia de Stories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Secuencia de 5 Stories</CardTitle>
              <CardDescription>Planificá un arco narrativo completo para tus Stories. Cada story lleva a la siguiente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.story_planner.secuencia_stories.map((story, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1"
                    style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}>
                    {i + 1}
                  </div>
                  <Textarea
                    rows={2}
                    placeholder={
                      i === 0 ? "Story 1 — Hook: ¿Qué te voy a contar hoy? (genera intriga)" :
                      i === 1 ? "Story 2 — Contexto: el problema o situación" :
                      i === 2 ? "Story 3 — Desarrollo: qué descubriste / qué hacer" :
                      i === 3 ? "Story 4 — Profundización: el detalle clave o giro" :
                      "Story 5 — CTA: ¿Qué querés que hagan? (guardar, responder, comprar)"
                    }
                    value={story}
                    onChange={(e) => {
                      const updated = [...data.story_planner.secuencia_stories];
                      updated[i] = e.target.value;
                      setStory("secuencia_stories", updated);
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Hooks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tus Hooks de Apertura Favoritos</CardTitle>
              <CardDescription>Las primeras palabras que usás en Stories y videos que enganchan a tu audiencia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.story_planner.hooks.map((hook, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder={`Hook ${i + 1} — Ej: "Algo que nadie te dijo sobre...", "Este error me costó $5k..."`}
                    value={hook}
                    onChange={(e) => {
                      const updated = [...data.story_planner.hooks];
                      updated[i] = e.target.value;
                      setStory("hooks", updated);
                    }}
                  />
                  {data.story_planner.hooks.length > 1 && (
                    <button
                      onClick={() => setStory("hooks", data.story_planner.hooks.filter((_, idx) => idx !== i))}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <Button
                variant="outline" size="sm"
                onClick={() => setStory("hooks", [...data.story_planner.hooks, ""])}
                className="mt-1 gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Agregar hook
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── TAB: Cápsula de Recursos ─────────────────────────────────────── */}
      {activeTab === "recursos" && (
        <div className="space-y-5">
          {/* Agregar recurso */}
          <AddResourceForm
            onAdd={(r) => setData((d) => ({ ...d, resources: [...d.resources, { ...r, id: Date.now() }] }))}
          />

          {/* Grid de recursos */}
          {data.resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#EFF6FF" }}>
                <Package className="h-6 w-6" style={{ color: "#1A6FFF" }} strokeWidth={1.5} />
              </div>
              <p className="text-gray-500 font-medium">Tu cápsula está vacía</p>
              <p className="text-gray-400 text-sm mt-1">Agregá herramientas, plantillas, lecturas y recursos útiles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIAS_RECURSOS.map((cat) => {
                const items = data.resources.filter((r) => r.categoria === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat} className="space-y-3">
                    <Badge variant="secondary" className="text-xs font-semibold">{cat}</Badge>
                    {items.map((r) => (
                      <div key={r.id} className="bg-white rounded-xl p-4 border border-gray-100 group hover:-translate-y-0.5 transition-all duration-200"
                        style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold text-sm text-gray-900 leading-tight">{r.titulo}</p>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            {r.url && (
                              <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => setData((d) => ({ ...d, resources: d.resources.filter((x) => x.id !== r.id) }))}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        {r.descripcion && <p className="text-xs text-gray-500 leading-relaxed">{r.descripcion}</p>}
                        {r.url && <p className="text-xs text-blue-500 mt-1.5 truncate">{r.url}</p>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Botón guardar flotante ──────────────────────────────────────────── */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 text-white font-semibold px-6 h-11 rounded-xl"
          style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)", boxShadow: "0 4px 14px rgba(26,111,255,0.35)" }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Guardando..." : "Guardar todo"}
        </Button>
      </div>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-gray-700">{label}</Label>
      {hint && <p className="text-xs text-gray-400 -mt-0.5">{hint}</p>}
      {children}
    </div>
  );
}

function DynamicList({
  label, hint, items, placeholder, onChange, addLabel,
}: {
  label: string;
  hint: string;
  items: string[];
  placeholder: (i: number) => string;
  onChange: (items: string[]) => void;
  addLabel: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-gray-700">{label}</Label>
      {hint && <p className="text-xs text-gray-400 -mt-0.5">{hint}</p>}
      <div className="space-y-2 mt-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              placeholder={placeholder(i)}
              value={item}
              onChange={(e) => {
                const updated = [...items];
                updated[i] = e.target.value;
                onChange(updated);
              }}
            />
            {items.length > 1 && (
              <button
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <Button
        variant="outline" size="sm"
        onClick={() => onChange([...items, ""])}
        className="mt-1 gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </Button>
    </div>
  );
}

type MarcoRow = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
};

type MarcoSection =
  | ({ type: "simple" } & MarcoRow)
  | { type: "group"; label: string; subRows: MarcoRow[] };

function MarcoTableGrouped({
  title,
  icon,
  sections,
}: {
  title: string;
  icon: React.ReactNode;
  sections: MarcoSection[];
}) {
  const [open, setOpen] = useState(true);
  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/10"
      style={{ background: "linear-gradient(180deg, #0B1D3E 0%, #071428 100%)" }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)", boxShadow: "0 4px 10px rgba(26,111,255,0.35)" }}
          >
            {icon}
          </div>
          <span className="text-base font-bold text-white">{title}</span>
        </div>
        <span className="text-white/40 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-white/10">
          <div
            className="grid grid-cols-[220px_1fr] border-b border-white/10"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <div className="px-5 py-2.5 text-xs font-bold text-white/60 uppercase tracking-widest border-r border-white/10">Elemento</div>
            <div className="px-5 py-2.5 text-xs font-bold text-white/60 uppercase tracking-widest">Descripción / Ejemplo</div>
          </div>

          {sections.map((section) => {
            if (section.type === "simple") {
              return (
                <div key={section.label} className="grid grid-cols-[220px_1fr] border-b border-white/10 last:border-0">
                  <div className="px-5 py-4 text-sm font-bold text-white border-r border-white/10 flex items-start leading-snug italic">
                    {section.label}
                  </div>
                  <div className="px-4 py-3">
                    <textarea
                      className="w-full bg-transparent text-white text-sm placeholder-white/30 focus:outline-none resize-none leading-relaxed border-0 outline-none ring-0 focus:ring-0 p-0"
                      rows={section.value ? Math.max(2, section.value.split("\n").length + 1) : 2}
                      placeholder={section.placeholder}
                      value={section.value}
                      onChange={(e) => section.onChange(e.target.value)}
                    />
                  </div>
                </div>
              );
            }

            // group
            return (
              <div key={section.label} className="border-b border-white/10 last:border-0">
                {section.subRows.map((sub, idx) => (
                  <div key={sub.label} className={cn("grid border-white/10", idx < section.subRows.length - 1 ? "border-b" : "")}>
                    <div className="grid grid-cols-[220px_1fr]">
                      {/* Left: group label (only on first sub-row, spans full group) */}
                      <div className="px-5 py-3 text-sm font-bold text-white border-r border-white/10 flex items-start leading-snug italic">
                        {idx === 0 ? section.label : ""}
                      </div>
                      {/* Right side: sub-label + textarea */}
                      <div className="grid grid-cols-[140px_1fr] border-l-0">
                        <div
                          className="px-4 py-3 text-xs font-semibold text-white/60 border-r border-white/10 flex items-start leading-snug"
                          style={{ background: "rgba(255,255,255,0.03)" }}
                        >
                          {sub.label}
                        </div>
                        <div className="px-4 py-3">
                          <textarea
                            className="w-full bg-transparent text-white text-sm placeholder-white/30 focus:outline-none resize-none leading-relaxed border-0 outline-none ring-0 focus:ring-0 p-0"
                            rows={sub.value ? Math.max(2, sub.value.split("\n").length + 1) : 2}
                            placeholder={sub.placeholder}
                            value={sub.value}
                            onChange={(e) => sub.onChange(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MarcoTable({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: React.ReactNode;
  rows: MarcoRow[];
}) {
  const [open, setOpen] = useState(true);
  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/10"
      style={{ background: "linear-gradient(180deg, #0B1D3E 0%, #071428 100%)" }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)", boxShadow: "0 4px 10px rgba(26,111,255,0.35)" }}
          >
            {icon}
          </div>
          <span className="text-base font-bold text-white">{title}</span>
        </div>
        {open
          ? <span className="text-white/40 text-xs">▲</span>
          : <span className="text-white/40 text-xs">▼</span>}
      </button>

      {open && (
        <div className="border-t border-white/10">
          {/* Column headers */}
          <div
            className="grid grid-cols-[220px_1fr] border-b border-white/10"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <div className="px-5 py-2.5 text-xs font-bold text-white/60 uppercase tracking-widest border-r border-white/10">
              Elemento
            </div>
            <div className="px-5 py-2.5 text-xs font-bold text-white/60 uppercase tracking-widest">
              Descripción / Ejemplo
            </div>
          </div>

          {/* Rows */}
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[220px_1fr] border-b border-white/10 last:border-0"
            >
              <div className="px-5 py-4 text-sm font-bold text-white border-r border-white/10 flex items-start pt-4 leading-snug">
                {row.label}
              </div>
              <div className="px-4 py-3">
                <textarea
                  className="w-full bg-transparent text-white text-sm placeholder-white/30 focus:outline-none resize-none leading-relaxed border-0 outline-none ring-0 focus:ring-0 p-0"
                  rows={row.value ? Math.max(3, row.value.split("\n").length + 1) : 3}
                  placeholder={row.placeholder}
                  value={row.value}
                  onChange={(e) => row.onChange(e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddResourceForm({ onAdd }: { onAdd: (r: Omit<Resource, "id">) => void }) {
  const [form, setForm] = useState({ titulo: "", descripcion: "", url: "", categoria: "Herramienta" });
  const [open, setOpen] = useState(false);

  function handleAdd() {
    if (!form.titulo.trim()) return toast.error("El título es obligatorio");
    onAdd(form);
    setForm({ titulo: "", descripcion: "", url: "", categoria: "Herramienta" });
    setOpen(false);
    toast.success("Recurso agregado");
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Cápsula de Recursos</CardTitle>
            <CardDescription>Links, herramientas, plantillas y materiales de referencia</CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setOpen((o) => !o)}
            className="gap-1.5 text-white"
            style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}
          >
            <Plus className="h-4 w-4" />
            Agregar
          </Button>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="border-t pt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Título *</Label>
              <Input placeholder="Ej: Canva, Notion, Mi plantilla de guiones..." value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Categoría</Label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={form.categoria}
                onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
              >
                {CATEGORIAS_RECURSOS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Descripción</Label>
            <Input placeholder="¿Para qué sirve? ¿Cómo se usa?" value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">URL (opcional)</Label>
            <Input placeholder="https://..." value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleAdd} className="text-white gap-1.5" style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}>
              <Plus className="h-3.5 w-3.5" /> Agregar recurso
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
