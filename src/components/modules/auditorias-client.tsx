"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Loader2, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type PlanPago = { monto: string; ticket: string };
type Costo = { concepto: string; monto: string; tipo_moneda: string; tipo: string };

type Oferta = {
  id: number;
  nombre_paquete: string;
  duracion: string;
  oferta_promesa: string;
  pilares: string;
  metodologia: string;
  slogan: string;
  garantia: string;
  entregables: string;
  estrategia: string;
  planes_pago: { tres_pagos: PlanPago; dos_pagos: PlanPago; un_pago: PlanPago };
  costos: Costo[];
};

type Vision = {
  tipo_servicio: string;
  modalidad_trabajo: string;
  modalidad_cobro: string;
  cash_mes1: string; cash_monto1: string;
  cash_mes2: string; cash_monto2: string;
  cash_mes3: string; cash_monto3: string;
  ticket_actual: string; ticket_promedio: string;
  meses_experiencia: string; anios_experiencia: string;
  clientes_atendidos: string; clientes_actuales: string;
  foco_negocio: string;
  oferta_base: Omit<Oferta, "id">;
};

type Promesas = {
  promesa_1: string; promesa_2: string; promesa_3: string;
  promesa_4: string; promesa_5: string;
};

type Avatar = {
  categoria: string; nicho: string; genero: string;
  edad: string; intereses_claves: string;
  dolor_1: string; dolor_2: string; dolor_3: string;
  q_mercado: string; q_tipo_negocios: string; q_tipo_valor: string;
  q_facturacion: string; q_personalidad: string;
  q_diferencia: string; q_objecion: string; q_conversion: string;
};

type Adquisicion = {
  instagram: string; linkedin: string; youtube: string;
  tiktok: string; landing: string;
  canal_actual: string; llamadas_mensuales: string;
  oferta_validada: string; ticket_1000: string;
  presupuesto_ads: string; ganancia_suficiente: string;
  cliente_contactable: string; nivel_consciencia: string;
  mercado_saturacion: string; urgencia: string;
  audiencia_social: string; angulo_ganador: string;
  tasa_cierre: string; mejor_canal: string;
};

type Clasificador = {
  cliente_nombre: string; cliente_nicho: string;
  presupuesto: string; nivel_compromiso: string;
  tiene_oferta: string; tiene_audiencia: string;
  urgencia: string; experiencia_previa: string;
  notas: string; resultado: string;
};

type AuditoriaData = {
  ofertas: Oferta[];
  vision: Vision;
  promesas: Promesas;
  avatar: Avatar;
  adquisicion: Adquisicion;
  clasificador: Clasificador;
};

type Props = { initialData: AuditoriaData | null };

// ─── Defaults ─────────────────────────────────────────────────────────────────

function defaultOferta(id: number): Oferta {
  return {
    id, nombre_paquete: "", duracion: "", oferta_promesa: "", pilares: "",
    metodologia: "", slogan: "", garantia: "", entregables: "", estrategia: "",
    planes_pago: {
      tres_pagos: { monto: "", ticket: "" },
      dos_pagos: { monto: "", ticket: "" },
      un_pago: { monto: "", ticket: "" },
    },
    costos: [{ concepto: "", monto: "", tipo_moneda: "", tipo: "" }, { concepto: "", monto: "", tipo_moneda: "", tipo: "" }, { concepto: "", monto: "", tipo_moneda: "", tipo: "" }, { concepto: "", monto: "", tipo_moneda: "", tipo: "" }],
  };
}

function defaultOfertaBase(): Omit<Oferta, "id"> {
  return {
    nombre_paquete: "", duracion: "", oferta_promesa: "", pilares: "",
    metodologia: "", slogan: "", garantia: "", entregables: "", estrategia: "",
    planes_pago: { tres_pagos: { monto: "", ticket: "" }, dos_pagos: { monto: "", ticket: "" }, un_pago: { monto: "", ticket: "" } },
    costos: [{ concepto: "", monto: "", tipo_moneda: "", tipo: "" }, { concepto: "", monto: "", tipo_moneda: "", tipo: "" }],
  };
}

function defaultData(): AuditoriaData {
  return {
    ofertas: [defaultOferta(1)],
    vision: {
      tipo_servicio: "", modalidad_trabajo: "", modalidad_cobro: "",
      cash_mes1: "Mes 1", cash_monto1: "", cash_mes2: "Mes 2", cash_monto2: "",
      cash_mes3: "Mes 3", cash_monto3: "",
      ticket_actual: "", ticket_promedio: "",
      meses_experiencia: "", anios_experiencia: "",
      clientes_atendidos: "", clientes_actuales: "", foco_negocio: "",
      oferta_base: defaultOfertaBase(),
    },
    promesas: { promesa_1: "", promesa_2: "", promesa_3: "", promesa_4: "", promesa_5: "" },
    avatar: {
      categoria: "", nicho: "", genero: "", edad: "", intereses_claves: "",
      dolor_1: "", dolor_2: "", dolor_3: "",
      q_mercado: "", q_tipo_negocios: "", q_tipo_valor: "",
      q_facturacion: "", q_personalidad: "", q_diferencia: "", q_objecion: "", q_conversion: "",
    },
    adquisicion: {
      instagram: "", linkedin: "", youtube: "", tiktok: "", landing: "",
      canal_actual: "", llamadas_mensuales: "",
      oferta_validada: "", ticket_1000: "", presupuesto_ads: "", ganancia_suficiente: "",
      cliente_contactable: "", nivel_consciencia: "", mercado_saturacion: "", urgencia: "",
      audiencia_social: "", angulo_ganador: "", tasa_cierre: "", mejor_canal: "",
    },
    clasificador: {
      cliente_nombre: "", cliente_nicho: "", presupuesto: "", nivel_compromiso: "",
      tiene_oferta: "", tiene_audiencia: "", urgencia: "", experiencia_previa: "",
      notas: "", resultado: "",
    },
  };
}

const TABS = ["Oferta nueva", "Visión base", "Promesas", "Avatar", "Adquisición", "Clasificador de Clientes"];

// ─── UI helpers ───────────────────────────────────────────────────────────────

function Row({ label, children, span }: { label: string; children: React.ReactNode; span?: boolean }) {
  return (
    <div className={cn("grid border-b border-white/10 min-h-[44px]", span ? "grid-cols-1" : "grid-cols-[300px_1fr]")}>
      <div className="px-4 py-3 text-sm text-white/90 font-medium border-r border-white/10 flex items-start pt-3 leading-snug">{label}</div>
      <div className="px-3 py-2 flex items-center">{children}</div>
    </div>
  );
}

function SectionHeader({ title, color = "#C25B3F" }: { title: string; color?: string }) {
  return (
    <div className="py-2.5 px-4 text-center text-xs font-bold tracking-widest uppercase text-white" style={{ background: color }}>
      {title}
    </div>
  );
}

function SubHeader({ title }: { title: string }) {
  return (
    <div className="py-2 px-4 text-center text-xs font-semibold text-white/70" style={{ background: "rgba(255,255,255,0.06)" }}>
      {title}
    </div>
  );
}

const cellInput = "w-full bg-transparent text-white text-sm placeholder-white/40 focus:outline-none py-1";
const cellSelect = "w-full bg-transparent text-white text-sm focus:outline-none py-1 cursor-pointer appearance-none";

function AuditInput({ value, onChange, placeholder, multiline }: { value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }) {
  if (multiline) return <textarea className={cn(cellInput, "resize-none h-20")} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />;
  return <input className={cellInput} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />;
}

function AuditSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select className={cellSelect} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Selecciona una opción</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function YesNoSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select className={cellSelect} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Selecciona</option>
      <option value="Sí">Sí</option>
      <option value="No">No</option>
      <option value="En proceso">En proceso</option>
    </select>
  );
}

// ─── Componente Oferta (reutilizable) ─────────────────────────────────────────

function OfertaForm({ oferta, onChange, title }: {
  oferta: Omit<Oferta, "id">;
  onChange: (updated: Omit<Oferta, "id">) => void;
  title: string;
}) {
  const set = (key: keyof typeof oferta, val: unknown) => onChange({ ...oferta, [key]: val });
  const setPlan = (plan: keyof typeof oferta.planes_pago, key: keyof PlanPago, val: string) =>
    set("planes_pago", { ...oferta.planes_pago, [plan]: { ...oferta.planes_pago[plan], [key]: val } });
  const setCosto = (i: number, key: keyof Costo, val: string) => {
    const updated = [...oferta.costos];
    updated[i] = { ...updated[i], [key]: val };
    set("costos", updated);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      <div className="px-4 py-3 text-lg font-bold text-white" style={{ background: "rgba(255,255,255,0.05)" }}>{title}</div>
      <div style={{ background: "rgba(255,255,255,0.03)" }}>
        <Row label="(Nombre del paquete) / [Nombre del negocio]:">
          <AuditInput value={oferta.nombre_paquete} onChange={(v) => set("nombre_paquete", v)} />
        </Row>
        <Row label="Duración">
          <AuditInput value={oferta.duracion} onChange={(v) => set("duracion", v)} placeholder="Ej: 3 meses, 8 semanas..." />
        </Row>
        <Row label="Oferta / Promesa">
          <AuditInput value={oferta.oferta_promesa} onChange={(v) => set("oferta_promesa", v)} placeholder="La promesa central de esta oferta" />
        </Row>
        <Row label="Pilares de la oferta (¿Cuáles son los entregables más importantes de tu negocio que hacen que tu cliente tenga resultados?)">
          <AuditInput value={oferta.pilares} onChange={(v) => set("pilares", v)} multiline />
        </Row>
        <Row label="Metodología">
          <AuditInput value={oferta.metodologia} onChange={(v) => set("metodologia", v)} />
        </Row>
        <Row label="Slogan">
          <AuditInput value={oferta.slogan} onChange={(v) => set("slogan", v)} />
        </Row>
        <Row label="Garantía">
          <AuditInput value={oferta.garantia} onChange={(v) => set("garantia", v)} />
        </Row>
        <Row label="Entregables (Todos los tangibles — videos, fotos, sesiones, etc)">
          <AuditInput value={oferta.entregables} onChange={(v) => set("entregables", v)} multiline />
        </Row>
        <Row label="Estrategia">
          <AuditInput value={oferta.estrategia} onChange={(v) => set("estrategia", v)} multiline />
        </Row>
      </div>

      {/* Planes de pago */}
      <div className="mt-4 px-4 pb-1 text-base font-semibold text-white">Planes de pago</div>
      <div className="mx-4 rounded-xl overflow-hidden border border-white/10 mb-4">
        <div className="grid grid-cols-3 text-xs font-semibold text-white/70 px-3 py-2 border-b border-white/10">
          <span>Tiempo y cantidad de pagos</span>
          <span>Monto de cuota</span>
          <span>Ticket</span>
        </div>
        {([["tres_pagos", "Tres pagos (3)"], ["dos_pagos", "Dos pagos (2)"], ["un_pago", "Un pago (1)"]] as [keyof typeof oferta.planes_pago, string][]).map(([key, label]) => (
          <div key={key} className="grid grid-cols-3 border-b border-white/10 last:border-0">
            <div className="px-3 py-2.5 text-sm text-white/70 border-r border-white/10">{label}</div>
            <div className="px-3 py-2 border-r border-white/10"><input className={cellInput} value={oferta.planes_pago[key].monto} onChange={(e) => setPlan(key, "monto", e.target.value)} placeholder="$" /></div>
            <div className="px-3 py-2"><input className={cellInput} value={oferta.planes_pago[key].ticket} onChange={(e) => setPlan(key, "ticket", e.target.value)} placeholder="$" /></div>
          </div>
        ))}
      </div>

      {/* Costos */}
      <div className="px-4 pb-1 text-base font-semibold text-white">Costos</div>
      <div className="mx-4 rounded-xl overflow-hidden border border-white/10 mb-4">
        <div className="grid grid-cols-4 text-xs font-semibold text-white/70 px-3 py-2 border-b border-white/10">
          <span>Concepto</span><span>Monto</span><span>Tipo de moneda</span><span>Tipo</span>
        </div>
        {oferta.costos.map((c, i) => (
          <div key={i} className="grid grid-cols-4 border-b border-white/10 last:border-0">
            <div className="px-3 py-2 border-r border-white/10"><input className={cellInput} value={c.concepto} onChange={(e) => setCosto(i, "concepto", e.target.value)} /></div>
            <div className="px-3 py-2 border-r border-white/10"><input className={cellInput} value={c.monto} onChange={(e) => setCosto(i, "monto", e.target.value)} placeholder="$" /></div>
            <div className="px-3 py-2 border-r border-white/10">
              <select className={cellSelect} value={c.tipo_moneda} onChange={(e) => setCosto(i, "tipo_moneda", e.target.value)}>
                <option value="">Selecciona</option>
                <option>USD</option><option>ARS</option><option>MXN</option><option>COP</option><option>EUR</option>
              </select>
            </div>
            <div className="px-3 py-2">
              <select className={cellSelect} value={c.tipo} onChange={(e) => setCosto(i, "tipo", e.target.value)}>
                <option value="">Selecciona</option>
                <option>Fijo</option><option>Variable</option><option>Herramienta</option><option>Publicidad</option>
              </select>
            </div>
          </div>
        ))}
        <button
          className="w-full py-2 text-xs text-white/40 hover:text-white/70 transition-colors flex items-center justify-center gap-1"
          onClick={() => set("costos", [...oferta.costos, { concepto: "", monto: "", tipo_moneda: "", tipo: "" }])}
        >
          <Plus className="h-3 w-3" /> Agregar fila
        </button>
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────

export function AuditoriasClient({ initialData }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<AuditoriaData>(initialData ?? defaultData());
  const [activeOfertaIdx, setActiveOfertaIdx] = useState(0);

  const supabase = createClient();

  async function handleSave() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("auditorias").upsert({
        user_id: user!.id,
        ofertas: data.ofertas,
        vision: data.vision,
        promesas: data.promesas,
        avatar: data.avatar,
        adquisicion: data.adquisicion,
        clasificador: data.clasificador,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (error) throw error;
      toast.success("Auditoría guardada");
    } catch { toast.error("Error al guardar"); } finally { setSaving(false); }
  }

  function setVision(key: keyof Vision, val: unknown) {
    setData((d) => ({ ...d, vision: { ...d.vision, [key]: val } }));
  }
  function setPromesas(key: keyof Promesas, val: string) {
    setData((d) => ({ ...d, promesas: { ...d.promesas, [key]: val } }));
  }
  function setAvatar(key: keyof Avatar, val: string) {
    setData((d) => ({ ...d, avatar: { ...d.avatar, [key]: val } }));
  }
  function setAdq(key: keyof Adquisicion, val: string) {
    setData((d) => ({ ...d, adquisicion: { ...d.adquisicion, [key]: val } }));
  }
  function setClasificador(key: keyof Clasificador, val: string) {
    setData((d) => ({ ...d, clasificador: { ...d.clasificador, [key]: val } }));
  }

  function addOferta() {
    const newId = (data.ofertas[data.ofertas.length - 1]?.id ?? 0) + 1;
    const updated = [...data.ofertas, defaultOferta(newId)];
    setData((d) => ({ ...d, ofertas: updated }));
    setActiveOfertaIdx(updated.length - 1);
  }

  function deleteOferta(idx: number) {
    if (data.ofertas.length <= 1) { toast.error("Necesitás al menos una oferta"); return; }
    const updated = data.ofertas.filter((_, i) => i !== idx);
    setData((d) => ({ ...d, ofertas: updated }));
    setActiveOfertaIdx(Math.min(idx, updated.length - 1));
  }

  // Cálculo de resultado en Adquisición
  const checklistKeys: (keyof Adquisicion)[] = ["oferta_validada", "ticket_1000", "presupuesto_ads", "ganancia_suficiente", "cliente_contactable", "nivel_consciencia", "mercado_saturacion", "urgencia", "audiencia_social", "angulo_ganador", "tasa_cierre", "mejor_canal"];
  const answered = checklistKeys.filter((k) => data.adquisicion[k] !== "").length;
  const allAnswered = answered === checklistKeys.length;
  const siCount = checklistKeys.filter((k) => data.adquisicion[k] === "Sí").length;
  const resultado = siCount >= 9 ? "✅ Listo para publicidad paga y outreach orgánico" : siCount >= 6 ? "⚡ Listo para outreach orgánico — trabajar la oferta antes de pagar ads" : "🔧 Necesitás validar tu oferta y audiencia primero";

  const darkContainer = { background: "linear-gradient(180deg, #0B1D3E 0%, #071428 100%)" };

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-white rounded-2xl p-1.5 border border-gray-100 w-fit" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
              activeTab === i ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
            style={activeTab === i ? { background: "linear-gradient(135deg, #1A6FFF, #00C8FF)", boxShadow: "0 4px 12px rgba(26,111,255,0.3)" } : {}}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── TAB 0: Oferta Nueva ─────────────────────────────────────────────── */}
      {activeTab === 0 && (
        <div className="space-y-4">
          {/* Selector de ofertas */}
          <div className="flex items-center gap-2 flex-wrap">
            {data.ofertas.map((o, i) => (
              <div key={o.id} className="flex items-center gap-1">
                <button
                  onClick={() => setActiveOfertaIdx(i)}
                  className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-all", activeOfertaIdx === i ? "text-white" : "text-white/70 hover:text-white")}
                  style={activeOfertaIdx === i ? { background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" } : { background: "rgba(255,255,255,0.07)" }}
                >
                  Oferta {i + 1}
                </button>
                {data.ofertas.length > 1 && (
                  <button onClick={() => deleteOferta(i)} className="text-white/50 hover:text-red-400 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addOferta}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.2)" }}
            >
              <Plus className="h-3.5 w-3.5" /> Nueva oferta
            </button>
          </div>

          <div style={darkContainer} className="rounded-2xl overflow-hidden border border-white/10 p-4">
            <OfertaForm
              title={`OFERTA ${activeOfertaIdx + 1}`}
              oferta={data.ofertas[activeOfertaIdx]}
              onChange={(updated) => {
                const ofertas = [...data.ofertas];
                ofertas[activeOfertaIdx] = { ...updated, id: data.ofertas[activeOfertaIdx].id };
                setData((d) => ({ ...d, ofertas }));
              }}
            />
          </div>
        </div>
      )}

      {/* ─── TAB 1: Visión Base ──────────────────────────────────────────────── */}
      {activeTab === 1 && (
        <div style={darkContainer} className="rounded-2xl overflow-hidden border border-white/10">
          <Row label="🔷 Tipo de servicio">
            <AuditSelect value={data.vision.tipo_servicio} onChange={(v) => setVision("tipo_servicio", v)}
              options={["Consultoría", "Mentoría", "Coaching", "Agencia", "Freelance", "Curso online", "Comunidad / Membresía"]} />
          </Row>
          <Row label="🔷 Modalidad de Trabajo">
            <AuditSelect value={data.vision.modalidad_trabajo} onChange={(v) => setVision("modalidad_trabajo", v)}
              options={["Online", "Presencial", "Híbrido"]} />
          </Row>
          <Row label="🔷 Modalidad de Cobro">
            <AuditSelect value={data.vision.modalidad_cobro} onChange={(v) => setVision("modalidad_cobro", v)}
              options={["Mensual recurrente", "Por proyecto / paquete", "Por sesión", "Anual", "Comisión por resultados"]} />
          </Row>
          <Row label="🔷 Cash Collected (últimos 3 meses)">
            <div className="w-full space-y-1.5">
              {([["cash_mes1", "cash_monto1"], ["cash_mes2", "cash_monto2"], ["cash_mes3", "cash_monto3"]] as [keyof Vision, keyof Vision][]).map(([mesKey, montoKey], i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <input className={cn(cellInput, "border-b border-white/10 pb-1")} value={data.vision[mesKey] as string} onChange={(e) => setVision(mesKey, e.target.value)} placeholder={`Mes ${i + 1}`} />
                  <input className={cn(cellInput, "border-b border-white/10 pb-1")} value={data.vision[montoKey] as string} onChange={(e) => setVision(montoKey, e.target.value)} placeholder="Monto $" />
                </div>
              ))}
            </div>
          </Row>
          <Row label="🔷 Ticket actual — Ticket promedio">
            <div className="grid grid-cols-2 gap-3 w-full">
              <input className={cellInput} value={data.vision.ticket_actual} onChange={(e) => setVision("ticket_actual", e.target.value)} placeholder="Ticket actual $" />
              <input className={cellInput} value={data.vision.ticket_promedio} onChange={(e) => setVision("ticket_promedio", e.target.value)} placeholder="Ticket promedio $" />
            </div>
          </Row>
          <Row label="🔷 Meses — Años de Experiencia">
            <div className="grid grid-cols-2 gap-3 w-full">
              <input className={cellInput} value={data.vision.meses_experiencia} onChange={(e) => setVision("meses_experiencia", e.target.value)} placeholder="Meses en el negocio" />
              <input className={cellInput} value={data.vision.anios_experiencia} onChange={(e) => setVision("anios_experiencia", e.target.value)} placeholder="Años de experiencia" />
            </div>
          </Row>
          <Row label="🔷 Clientes atendidos — Clientes actuales">
            <div className="grid grid-cols-2 gap-3 w-full">
              <input className={cellInput} value={data.vision.clientes_atendidos} onChange={(e) => setVision("clientes_atendidos", e.target.value)} placeholder="Total histórico" />
              <input className={cellInput} value={data.vision.clientes_actuales} onChange={(e) => setVision("clientes_actuales", e.target.value)} placeholder="Activos ahora" />
            </div>
          </Row>
          <Row label="🔷 Foco principal del Negocio">
            <AuditInput value={data.vision.foco_negocio} onChange={(v) => setVision("foco_negocio", v)} multiline />
          </Row>

          <div className="p-4">
            <p className="text-lg font-bold text-white mb-4">Oferta Base independiente</p>
            <OfertaForm
              title="Oferta Base"
              oferta={data.vision.oferta_base}
              onChange={(updated) => setVision("oferta_base", updated)}
            />
          </div>
        </div>
      )}

      {/* ─── TAB 2: Promesas ─────────────────────────────────────────────────── */}
      {activeTab === 2 && (
        <div style={darkContainer} className="rounded-2xl overflow-hidden border border-white/10">
          <div className="p-5 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Estructura base para cada promesa</h2>
            </div>

            {/* Fórmulas de referencia */}
            {[
              { label: "Fórmula 1 — Clásica y brutal", text: "Ayudo a [cliente ideal] que [problema actual] a [transformación concreta] en [plazo estimado], con [diferenciador o sistema único]." },
              { label: "Fórmula 2 — Versión emocional", text: "Trabajo con [cliente ideal] que hoy [dolor emocional fuerte] y les ayudo a lograr [meta deseada / vida deseada] gracias a [tu sistema / enfoque / experiencia]." },
              { label: "Fórmula 3 — Versión aspiracional", text: "Si eres [cliente ideal] y quieres [meta aspiracional concreta], te ayudo a lograrlo con [diferenciador fuerte / metodología / enfoque único]." },
              { label: "Fórmula 4 — Versión polarizante", text: "Trabajo con [cliente ideal específico] que están cansados de [problema común] y que quieren por fin [transformación concreta] a través de [tu enfoque o método]." },
              { label: "Fórmula 5 — Versión de autoridad", text: "He ayudado a [tipo de clientes] a pasar de [situación actual caótica] a [resultado concreto] en [plazo]. Si quieres dejar de [problema], y construir [meta deseada], este es tu lugar." },
            ].map((f, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-white/10">
                <div className="grid grid-cols-[220px_1fr]">
                  <div className="px-4 py-3 text-sm font-semibold text-white/80 border-r border-white/10 flex items-start">{f.label}</div>
                  <div className="px-4 py-3 text-sm text-white/80 italic leading-relaxed">{f.text}</div>
                </div>
              </div>
            ))}

            {/* Instrucciones */}
            <div className="rounded-xl border border-blue-500/30 p-4 space-y-1" style={{ background: "rgba(26,111,255,0.08)" }}>
              <p className="text-sm font-bold text-white mb-2">Instrucciones para la actividad</p>
              {["Escribe tus 5 versiones en base a estas fórmulas.", "No busques la promesa perfecta, busca explorar diferentes ángulos.", "No uses palabras genéricas como contenido premium, más clientes o resultados increíbles.", "Sé específico. Usa números, emociones reales y problemas concretos.", "Cuando termines, elige la promesa que sientas más potente y la que mejor conecte con el cliente que quieres atraer."].map((instr, i) => (
                <p key={i} className="text-xs text-white/80">{i + 1}. {instr}</p>
              ))}
            </div>

            {/* Tus 5 promesas */}
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Tus 5 promesas</h3>
              <p className="text-xs text-white/70 mb-4">Escribe una versión por cada fórmula. No intentes sonar perfecto; busca claridad, especificidad y conexión con el cliente correcto.</p>
              <div className="rounded-xl overflow-hidden border border-white/10">
                {(["promesa_1", "promesa_2", "promesa_3", "promesa_4", "promesa_5"] as (keyof Promesas)[]).map((key, i) => (
                  <div key={key} className="grid grid-cols-[180px_1fr] border-b border-white/10 last:border-0">
                    <div className="px-4 py-3 text-sm font-semibold text-white/70 border-r border-white/10 flex items-start pt-4">Promesa {i + 1}</div>
                    <div className="p-3"><textarea className={cn(cellInput, "resize-none h-24")} value={data.promesas[key]} onChange={(e) => setPromesas(key, e.target.value)} placeholder="Escribe aquí tu promesa..." /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: Avatar ───────────────────────────────────────────────────── */}
      {activeTab === 3 && (
        <div style={darkContainer} className="rounded-2xl overflow-hidden border border-white/10">
          <div className="px-5 pt-5 pb-3">
            <p className="text-xs text-white/70 leading-relaxed">Completa esta sección pensando en una persona o negocio real. Mientras más específicas sean tus respuestas, más fácil será crear contenido, propuestas y mensajes que conecten con el cliente correcto.</p>
          </div>

          <div className="px-5 pb-2 text-lg font-bold text-white">Datos base del avatar</div>
          <div className="mx-5 mb-5 rounded-xl overflow-hidden border border-white/10">
            {[
              { label: "Categoría", key: "categoria" as keyof Avatar },
              { label: "Nicho", key: "nicho" as keyof Avatar },
              { label: "Género", key: "genero" as keyof Avatar },
              { label: "Edad", key: "edad" as keyof Avatar },
              { label: "Intereses claves", key: "intereses_claves" as keyof Avatar },
            ].map(({ label, key }) => (
              <div key={key} className="grid grid-cols-[180px_1fr] border-b border-white/10 last:border-0">
                <div className="px-4 py-3 text-sm text-white/70 font-medium border-r border-white/10">{label}</div>
                <div className="px-3 py-2"><input className={cellInput} value={data.avatar[key]} onChange={(e) => setAvatar(key, e.target.value)} /></div>
              </div>
            ))}
          </div>

          <div className="px-5 pb-2 text-sm font-semibold text-white/80">Principales dolores (máximo 3, los más relevantes)</div>
          <div className="mx-5 mb-5 space-y-2">
            {(["dolor_1", "dolor_2", "dolor_3"] as (keyof Avatar)[]).map((key, i) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-white/70 text-sm w-4">{i + 1}.</span>
                <input className={cn(cellInput, "border-b border-white/20 pb-1 flex-1")} value={data.avatar[key]} onChange={(e) => setAvatar(key, e.target.value)} placeholder={`Dolor ${i + 1}`} />
              </div>
            ))}
          </div>

          <div className="px-5 pb-2 text-lg font-bold text-white">1. Perfil del cliente ideal</div>
          <div className="px-5 pb-2 text-xs text-white/70">Aquí añadimos la profundización. Primero define con claridad a quién quieres atraer y a quién no. Esto te ayudará a enfocar todo tu negocio.</div>
          <div className="mx-5 mb-5 rounded-xl overflow-hidden border border-white/10">
            {[
              { label: "1. ¿En qué mercado quiero especializarme?", key: "q_mercado" as keyof Avatar, placeholder: "Ejemplo: moda, gastronomía, fitness, marcas personales, artistas o ecommerce." },
              { label: "2. ¿Qué tipo de negocios o personas dentro de ese mercado serían mi cliente ideal?", key: "q_tipo_negocios" as keyof Avatar, placeholder: "Ejemplo: marcas premium de ropa, restaurantes top, entrenadores de alto nivel o marcas personales que venden programas caros." },
              { label: "3. ¿Qué tipo de valor, servicio, experiencia o transformación buscan a través de mi contenido?", key: "q_tipo_valor" as keyof Avatar, placeholder: "Ejemplo: posicionarse como premium, vender con mayor margen, transmitir exclusividad o aumentar confianza" },
              { label: "4. ¿Qué nivel de facturación mínimo debería tener ese cliente para que trabajar con él sea rentable?", key: "q_facturacion" as keyof Avatar, placeholder: "Ejemplo: mínimo 10K mensuales, que ya haya invertido en marketing o que valore contenido premium." },
              { label: "5. ¿Con qué tipo de personalidad o valores quiero que se alineen mis clientes?", key: "q_personalidad" as keyof Avatar, placeholder: "Ejemplo: compromiso, respeto, visión de largo plazo, mentalidad de crecimiento y apertura a procesos." },
              { label: "6. ¿Qué me diferencia de otros que trabajan con el mismo tipo de cliente?", key: "q_diferencia" as keyof Avatar, placeholder: "Tu diferencial específico" },
              { label: "7. ¿Cuál es la principal objeción que tiene tu cliente para no contratar tus servicios?", key: "q_objecion" as keyof Avatar, placeholder: "Ej: el precio, no confía en los resultados, ya lo intentó antes..." },
              { label: "8. ¿Por qué canal o momento es más fácil para tu cliente decidir contratarte?", key: "q_conversion" as keyof Avatar, placeholder: "Ej: después de ver testimonios, en una llamada, viendo contenido educativo..." },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="grid grid-cols-[300px_1fr] border-b border-white/10 last:border-0">
                <div className="px-4 py-3 text-sm text-white/70 leading-snug border-r border-white/10">{label}</div>
                <div className="px-3 py-2"><textarea className={cn(cellInput, "resize-none h-16")} value={data.avatar[key]} onChange={(e) => setAvatar(key, e.target.value)} placeholder={placeholder} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: Adquisición ──────────────────────────────────────────────── */}
      {activeTab === 4 && (
        <div style={darkContainer} className="rounded-2xl overflow-hidden border border-white/10">
          {/* Fuentes de tráfico */}
          <div className="px-5 pt-5 pb-2 text-lg font-bold text-white">Fuentes de tráfico</div>
          <div className="mx-5 mb-5 rounded-xl overflow-hidden border border-white/10">
            {(["instagram", "linkedin", "youtube", "tiktok", "landing"] as (keyof Adquisicion)[]).map((key) => (
              <div key={key} className="grid grid-cols-[180px_1fr] border-b border-white/10 last:border-0">
                <div className="px-4 py-3 text-sm text-white/70 font-medium border-r border-white/10 capitalize">
                  {key === "landing" ? "Landing page" : key.charAt(0).toUpperCase() + key.slice(1)}
                </div>
                <div className="px-3 py-2"><input className={cellInput} value={data.adquisicion[key]} onChange={(e) => setAdq(key, e.target.value)} placeholder="https://" /></div>
              </div>
            ))}
          </div>

          {/* Diagnóstico inicial */}
          <SectionHeader title="DIAGNÓSTICO INICIAL" />
          <div className="mx-5 mb-5 mt-3 rounded-xl overflow-hidden border border-white/10">
            <div className="grid grid-cols-[1fr_200px] border-b border-white/10">
              <div className="px-4 py-3 text-sm text-white/70 border-r border-white/10">¿Qué canal usas actualmente para conseguir clientes?</div>
              <div className="px-3 py-2">
                <select className={cellSelect} value={data.adquisicion.canal_actual} onChange={(e) => setAdq("canal_actual", e.target.value)}>
                  <option value="">Selecciona</option>
                  {["Instagram orgánico", "TikTok orgánico", "LinkedIn", "Referidos / boca en boca", "Publicidad paga", "YouTube", "Email marketing", "WhatsApp / DMs", "Eventos presenciales"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_200px]">
              <div className="px-4 py-3 text-sm text-white/70 border-r border-white/10">¿Cuántas llamadas estás agendando mensualmente?</div>
              <div className="px-3 py-2">
                <select className={cellSelect} value={data.adquisicion.llamadas_mensuales} onChange={(e) => setAdq("llamadas_mensuales", e.target.value)}>
                  <option value="">Selecciona</option>
                  {["0-2", "3-5", "6-10", "11-20", "Más de 20"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <SectionHeader title="CHECKLIST DE SELECCIÓN DE CANAL" />
          <div className="mx-5 mt-3 mb-5 rounded-xl overflow-hidden border border-white/10">
            <SubHeader title="Economía de la Oferta" />
            {[
              { label: "¿Cuentas con una oferta validada? (mínimo 5 clientes pagaron tu paquete y al menos 1 caso de éxito documentado).", key: "oferta_validada" },
              { label: "¿El ticket de tu oferta supera los 1000 USD?", key: "ticket_1000" },
              { label: "¿Cuentas con al menos 200 USD mensuales para invertir en anuncios?", key: "presupuesto_ads" },
              { label: "¿Tus clientes te dejan suficiente ganancia como para que valga la pena invertir más en conseguirlos?", key: "ganancia_suficiente" },
            ].map(({ label, key }) => (
              <div key={key} className="grid grid-cols-[1fr_200px] border-b border-white/10">
                <div className="px-4 py-3 text-sm text-white/70 border-r border-white/10 leading-snug">{label}</div>
                <div className="px-3 py-2"><YesNoSelect value={data.adquisicion[key as keyof Adquisicion]} onChange={(v) => setAdq(key as keyof Adquisicion, v)} /></div>
              </div>
            ))}

            <SubHeader title="Mercado" />
            {[
              { label: "¿Tu cliente ideal se puede encontrar y contactar con facilidad y en volumen? (IG DMs, llamadas en frío, WhatsApp)", key: "cliente_contactable" },
              { label: "¿Qué nivel de consciencia tiene el prospecto medio de tu nicho sobre el problema que resuelves?", key: "nivel_consciencia" },
              { label: "¿Qué tan saturado está tu mercado con publicidad pagada y oferta?", key: "mercado_saturacion" },
              { label: "¿Qué tan alta es la urgencia por resolver el problema para tu nicho?", key: "urgencia" },
            ].map(({ label, key }) => (
              <div key={key} className="grid grid-cols-[1fr_200px] border-b border-white/10">
                <div className="px-4 py-3 text-sm text-white/70 border-r border-white/10 leading-snug">{label}</div>
                <div className="px-3 py-2"><YesNoSelect value={data.adquisicion[key as keyof Adquisicion]} onChange={(v) => setAdq(key as keyof Adquisicion, v)} /></div>
              </div>
            ))}

            <SubHeader title="Autoridad & Contenido" />
            {[
              { label: "¿Cuentas con una audiencia en redes sociales? (Al menos 1000 seguidores REALES y relacionados al nicho y al menos 1% de engagement)", key: "audiencia_social" },
              { label: "¿Consideras haber encontrado un ángulo ganador en tu marca personal?", key: "angulo_ganador" },
            ].map(({ label, key }) => (
              <div key={key} className="grid grid-cols-[1fr_200px] border-b border-white/10">
                <div className="px-4 py-3 text-sm text-white/70 border-r border-white/10 leading-snug">{label}</div>
                <div className="px-3 py-2"><YesNoSelect value={data.adquisicion[key as keyof Adquisicion]} onChange={(v) => setAdq(key as keyof Adquisicion, v)} /></div>
              </div>
            ))}

            <SubHeader title="Experiencia y Habilidad Actual" />
            <div className="grid grid-cols-[1fr_200px] border-b border-white/10">
              <div className="px-4 py-3 text-sm text-white/70 border-r border-white/10">¿Tu tasa de cierre supera el 20% de las reuniones que tomás?</div>
              <div className="px-3 py-2"><YesNoSelect value={data.adquisicion.tasa_cierre} onChange={(v) => setAdq("tasa_cierre", v)} /></div>
            </div>
            <div className="grid grid-cols-[1fr_200px]">
              <div className="px-4 py-3 text-sm text-white/70 border-r border-white/10">Seleccioná el canal de adquisición con el que has obtenido mejores resultados hasta el momento</div>
              <div className="px-3 py-2">
                <select className={cellSelect} value={data.adquisicion.mejor_canal} onChange={(e) => setAdq("mejor_canal", e.target.value)}>
                  <option value="">Selecciona</option>
                  {["Instagram orgánico", "TikTok orgánico", "LinkedIn", "Referidos", "Publicidad paga", "YouTube", "Email", "WhatsApp outreach"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Evaluación Final */}
          <SectionHeader title="EVALUACIÓN FINAL" color="#1A3A6B" />
          <div className="mx-5 mt-3 mb-5">
            <div className="rounded-xl overflow-hidden border border-white/10">
              <div className="grid grid-cols-[1fr_200px] border-b border-white/10">
                <div className="px-4 py-3 text-sm text-white/70 border-r border-white/10">Revelar resultado (solo si todas las respuestas fueron respondidas)</div>
                <div className="px-3 py-2 flex items-center">
                  <span className={cn("text-xs font-medium", allAnswered ? "text-green-400" : "text-white/50")}>
                    {allAnswered ? "Ver resultado ↓" : `${answered}/${checklistKeys.length} respondidas`}
                  </span>
                </div>
              </div>
              {allAnswered && (
                <div className="px-4 py-4 text-sm font-semibold text-white" style={{ background: "rgba(26,111,255,0.12)", borderTop: "1px solid rgba(26,111,255,0.3)" }}>
                  {resultado}
                  <p className="text-xs text-white/70 font-normal mt-1">Puntaje: {siCount}/12 respuestas positivas</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: Clasificador de Clientes ─────────────────────────────────── */}
      {activeTab === 5 && (
        <div style={darkContainer} className="rounded-2xl overflow-hidden border border-white/10">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-xl font-bold text-white mb-1">Clasificador de Clientes</h2>
            <p className="text-xs text-white/70">Evaluá a un prospecto antes de aceptarlo como cliente. Completá cada criterio para ver si encaja con tu perfil de cliente ideal.</p>
          </div>
          <div className="mx-5 mb-5 rounded-xl overflow-hidden border border-white/10">
            {[
              { label: "Nombre / Negocio del prospecto", key: "cliente_nombre" as keyof Clasificador, type: "text" },
              { label: "Nicho / Industria", key: "cliente_nicho" as keyof Clasificador, type: "text" },
              { label: "Presupuesto declarado", key: "presupuesto" as keyof Clasificador, type: "text", placeholder: "$ mensual o por proyecto" },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="grid grid-cols-[240px_1fr] border-b border-white/10">
                <div className="px-4 py-3 text-sm text-white/70 border-r border-white/10">{label}</div>
                <div className="px-3 py-2"><input className={cellInput} value={data.clasificador[key]} onChange={(e) => setClasificador(key, e.target.value)} placeholder={placeholder} /></div>
              </div>
            ))}
            {[
              { label: "Nivel de compromiso percibido", key: "nivel_compromiso" as keyof Clasificador, options: ["Selecciona", "Alto — quiere empezar ya", "Medio — tiene dudas pero interés real", "Bajo — solo está explorando"] },
              { label: "¿Tiene oferta/producto definido?", key: "tiene_oferta" as keyof Clasificador, options: ["Selecciona", "Sí, validada", "Sí, pero sin validar", "No"] },
              { label: "¿Tiene audiencia o base de contactos?", key: "tiene_audiencia" as keyof Clasificador, options: ["Selecciona", "Sí, relevante", "Pequeña pero activa", "No"] },
              { label: "Urgencia para resolver el problema", key: "urgencia" as keyof Clasificador, options: ["Selecciona", "Alta — ya probó otras cosas", "Media — tiene tiempo", "Baja — es aspiracional"] },
              { label: "¿Ha invertido en servicios similares antes?", key: "experiencia_previa" as keyof Clasificador, options: ["Selecciona", "Sí, tuvo buenos resultados", "Sí, tuvo malas experiencias", "No, es su primera vez"] },
            ].map(({ label, key, options }) => (
              <div key={key} className="grid grid-cols-[240px_1fr] border-b border-white/10">
                <div className="px-4 py-3 text-sm text-white/70 border-r border-white/10 leading-snug">{label}</div>
                <div className="px-3 py-2">
                  <select className={cellSelect} value={data.clasificador[key]} onChange={(e) => setClasificador(key, e.target.value)}>
                    {options.map((o) => <option key={o} value={o === "Selecciona" ? "" : o}>{o}</option>)}
                  </select>
                </div>
              </div>
            ))}
            <div className="grid grid-cols-[240px_1fr] border-b border-white/10">
              <div className="px-4 py-3 text-sm text-white/70 border-r border-white/10">Notas adicionales</div>
              <div className="px-3 py-2"><AuditInput value={data.clasificador.notas} onChange={(v) => setClasificador("notas", v)} multiline /></div>
            </div>
            <div className="grid grid-cols-[240px_1fr]">
              <div className="px-4 py-3 text-sm text-white/70 border-r border-white/10 font-semibold">Decisión final</div>
              <div className="px-3 py-2">
                <select className={cellSelect} value={data.clasificador.resultado} onChange={(e) => setClasificador("resultado", e.target.value)}>
                  <option value="">Selecciona</option>
                  <option value="✅ Aceptar — cliente ideal">✅ Aceptar — cliente ideal</option>
                  <option value="⚡ Aceptar con condiciones">⚡ Aceptar con condiciones</option>
                  <option value="❌ No aceptar — no encaja">❌ No aceptar — no encaja</option>
                  <option value="⏳ En evaluación">⏳ En evaluación</option>
                </select>
              </div>
            </div>
          </div>
          {data.clasificador.resultado && (
            <div className="mx-5 mb-5 px-4 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: "rgba(26,111,255,0.15)", border: "1px solid rgba(26,111,255,0.3)" }}>
              {data.clasificador.resultado}
              {data.clasificador.cliente_nombre && <span className="font-normal text-white/80 ml-2">— {data.clasificador.cliente_nombre}</span>}
            </div>
          )}
        </div>
      )}

      {/* Botón guardar */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 text-white font-semibold px-6 h-11 rounded-xl"
          style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)", boxShadow: "0 4px 14px rgba(26,111,255,0.35)" }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Guardando..." : "Guardar auditoría"}
        </Button>
      </div>
    </div>
  );
}
