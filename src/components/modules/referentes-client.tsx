"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  ExternalLink,
  Video,
  Loader2,
  ArrowLeft,
  User,
  Home,
  Plane,
  Heart,
  Brain,
  ShoppingBag,
  Film,
  Target,
  Folder,
  ChevronRight,
  BookOpen,
  Bookmark,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ReferenceVideo } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type PersonalVideo = {
  id: string;
  user_id: string;
  url: string;
  title: string;
  description?: string;
  created_at: string;
};

const NICHES = [
  "Marca personal",
  "Asesores inmobiliarios",
  "Agencias de viajes",
  "Nutricionistas y fitness",
  "Psicólogos y coaches",
  "Negocios físicos",
  "Agencias de marketing / Filmmakers",
  "Coach",
];

type NicheMeta = {
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  badgeColor: string;
};

const NICHE_META: Record<string, NicheMeta> = {
  "Marca personal": { icon: User, gradient: "from-blue-500 to-blue-600", iconColor: "text-blue-600", badgeColor: "bg-blue-50 text-blue-700 border-blue-100" },
  "Asesores inmobiliarios": { icon: Home, gradient: "from-emerald-500 to-emerald-600", iconColor: "text-emerald-600", badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  "Agencias de viajes": { icon: Plane, gradient: "from-sky-500 to-sky-600", iconColor: "text-sky-600", badgeColor: "bg-sky-50 text-sky-700 border-sky-100" },
  "Nutricionistas y fitness": { icon: Heart, gradient: "from-orange-500 to-orange-600", iconColor: "text-orange-600", badgeColor: "bg-orange-50 text-orange-700 border-orange-100" },
  "Psicólogos y coaches": { icon: Brain, gradient: "from-purple-500 to-purple-600", iconColor: "text-purple-600", badgeColor: "bg-purple-50 text-purple-700 border-purple-100" },
  "Negocios físicos": { icon: ShoppingBag, gradient: "from-rose-500 to-rose-600", iconColor: "text-rose-600", badgeColor: "bg-rose-50 text-rose-700 border-rose-100" },
  "Agencias de marketing / Filmmakers": { icon: Film, gradient: "from-indigo-500 to-indigo-600", iconColor: "text-indigo-600", badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  "Coach": { icon: Target, gradient: "from-amber-500 to-amber-600", iconColor: "text-amber-600", badgeColor: "bg-amber-50 text-amber-700 border-amber-100" },
};

const DEFAULT_META: NicheMeta = {
  icon: Folder,
  gradient: "from-gray-400 to-gray-500",
  iconColor: "text-gray-500",
  badgeColor: "bg-gray-50 text-gray-600 border-gray-100",
};

function getPlatform(url: string): { label: string; className: string } {
  if (url.includes("tiktok.com")) return { label: "TikTok", className: "bg-black text-white border-0" };
  if (url.includes("instagram.com")) return { label: "Instagram", className: "bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0" };
  if (url.includes("youtube.com") || url.includes("youtu.be")) return { label: "YouTube", className: "bg-red-600 text-white border-0" };
  return { label: "Web", className: "bg-gray-100 text-gray-600 border-0" };
}

function VideoCard({ video, isCoach, onDelete }: { video: ReferenceVideo; isCoach: boolean; onDelete: (id: string) => void }) {
  const platform = getPlatform(video.url);
  return (
    <Card className="flex flex-col group hover:shadow-md transition-all border border-gray-100 bg-white">
      <CardContent className="p-4 flex flex-col gap-3 h-full">
        <div className="flex items-center justify-between">
          <Badge className={`text-[10px] px-2 py-0.5 font-semibold ${platform.className}`}>{platform.label}</Badge>
          {isCoach && (
            <button onClick={() => onDelete(video.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-sm font-medium line-clamp-3 flex-1 leading-snug text-gray-800">{video.title}</p>
        {video.description && <p className="text-xs text-muted-foreground line-clamp-2">{video.description}</p>}
        <a href={video.url} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8">
            <ExternalLink className="h-3 w-3" /> Ver video
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}

function PersonalVideoCard({ video, onDelete }: { video: PersonalVideo; onDelete: (id: string) => void }) {
  const platform = getPlatform(video.url);
  return (
    <Card className="flex flex-col group hover:shadow-md transition-all border border-gray-100 bg-white">
      <CardContent className="p-4 flex flex-col gap-3 h-full">
        <div className="flex items-center justify-between">
          <Badge className={`text-[10px] px-2 py-0.5 font-semibold ${platform.className}`}>{platform.label}</Badge>
          <button onClick={() => onDelete(video.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-sm font-medium line-clamp-3 flex-1 leading-snug text-gray-800">{video.title}</p>
        {video.description && <p className="text-xs text-muted-foreground line-clamp-2">{video.description}</p>}
        <a href={video.url} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8">
            <ExternalLink className="h-3 w-3" /> Ver video
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}

type Props = { initialVideos: ReferenceVideo[]; initialPersonalVideos: PersonalVideo[]; isCoach: boolean };

export function ReferentesClient({ initialVideos, initialPersonalVideos, isCoach }: Props) {
  const [view, setView] = useState<"biblioteca" | "mis-videos">("biblioteca");
  const [videos, setVideos] = useState<ReferenceVideo[]>(initialVideos);
  const [personalVideos, setPersonalVideos] = useState<PersonalVideo[]>(initialPersonalVideos);
  const [adding, setAdding] = useState(false);
  const [addingPersonal, setAddingPersonal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [activeNiche, setActiveNiche] = useState<string | null>(null);
  const [form, setForm] = useState({ url: "", title: "", niche: "", description: "" });
  const [personalForm, setPersonalForm] = useState({ url: "", title: "", description: "" });
  const supabase = createClient();

  // ── Biblioteca: agrupación por nicho ─────────────────────────────────────
  const nicheOrder = useMemo(() => {
    const counts: Record<string, number> = {};
    videos.forEach((v) => { const k = v.niche || "Sin nicho"; counts[k] = (counts[k] || 0) + 1; });
    return Object.keys(counts).sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
  }, [videos]);

  const groupedByNiche = useMemo(() => {
    const groups: Record<string, ReferenceVideo[]> = {};
    videos.forEach((v) => { const key = v.niche || "Sin nicho"; if (!groups[key]) groups[key] = []; groups[key].push(v); });
    return groups;
  }, [videos]);

  const activeVideos = activeNiche ? (groupedByNiche[activeNiche] || []) : [];
  const activeMeta = activeNiche ? (NICHE_META[activeNiche] || DEFAULT_META) : null;

  // ── CRUD Biblioteca (coach) ──────────────────────────────────────────────
  async function handleAdd() {
    if (!form.url || !form.title) { toast.error("URL y título son obligatorios"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("reference_videos")
        .insert({ coach_id: user!.id, url: form.url, title: form.title, niche: form.niche || activeNiche || null, description: form.description || null })
        .select().single();
      if (error) throw error;
      setVideos((prev) => [data, ...prev]);
      setForm({ url: "", title: "", niche: "", description: "" });
      setAdding(false);
      toast.success("Video agregado");
    } catch { toast.error("Error al agregar"); } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("reference_videos").delete().eq("id", id);
    if (error) { toast.error("Error al eliminar"); return; }
    setVideos((prev) => prev.filter((v) => v.id !== id));
    toast.success("Video eliminado");
  }

  // ── CRUD Mis Videos (alumno) ─────────────────────────────────────────────
  async function handleAddPersonal() {
    if (!personalForm.url || !personalForm.title) { toast.error("URL y título son obligatorios"); return; }
    setSavingPersonal(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("personal_videos")
        .insert({ user_id: user!.id, url: personalForm.url, title: personalForm.title, description: personalForm.description || null })
        .select().single();
      if (error) throw error;
      setPersonalVideos((prev) => [data, ...prev]);
      setPersonalForm({ url: "", title: "", description: "" });
      setAddingPersonal(false);
      toast.success("Video guardado en tu colección");
    } catch { toast.error("Error al guardar"); } finally { setSavingPersonal(false); }
  }

  async function handleDeletePersonal(id: string) {
    const { error } = await supabase.from("personal_videos").delete().eq("id", id);
    if (error) { toast.error("Error al eliminar"); return; }
    setPersonalVideos((prev) => prev.filter((v) => v.id !== id));
    toast.success("Video eliminado");
  }

  // ── Tabs de vista ─────────────────────────────────────────────────────────
  const tabBtn = (v: typeof view, label: string, Icon: React.ElementType) => (
    <button
      onClick={() => { setView(v); setActiveNiche(null); setAdding(false); setAddingPersonal(false); }}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
        view === v ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
      )}
      style={view === v ? { background: "linear-gradient(135deg, #1A6FFF, #00C8FF)", boxShadow: "0 4px 12px rgba(26,111,255,0.3)" } : {}}
    >
      <Icon className="h-4 w-4" strokeWidth={1.8} />
      <span>{label}</span>
    </button>
  );

  // ── Vista: nicho activo de la Biblioteca ──────────────────────────────────
  if (view === "biblioteca" && activeNiche && activeMeta) {
    const Icon = activeMeta.icon;
    const tiktokCount = activeVideos.filter((v) => v.url.includes("tiktok")).length;
    const igCount = activeVideos.filter((v) => v.url.includes("instagram")).length;

    return (
      <div className="space-y-5">
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 w-fit" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          {tabBtn("biblioteca", "Biblioteca del Coach", BookOpen)}
          {tabBtn("mis-videos", "Mis Videos", Bookmark)}
        </div>

        <button onClick={() => setActiveNiche(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver a módulos
        </button>

        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${activeMeta.gradient} flex items-center justify-center flex-shrink-0`}>
            <Icon className="h-6 w-6 text-white" strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{activeNiche}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">{activeVideos.length} videos</span>
              {tiktokCount > 0 && <span className="text-[10px] font-semibold bg-black text-white px-2 py-0.5 rounded-full">TikTok {tiktokCount}</span>}
              {igCount > 0 && <span className="text-[10px] font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full">Instagram {igCount}</span>}
            </div>
          </div>
          {isCoach && (
            <div className="ml-auto">
              <Button size="sm" onClick={() => { if (!adding) setForm((f) => ({ ...f, niche: activeNiche ?? f.niche })); setAdding((v) => !v); }}>
                <Plus className="h-4 w-4 mr-1.5" /> Agregar video
              </Button>
            </div>
          )}
        </div>

        {adding && isCoach && <AddVideoForm form={form} setForm={setForm} onSave={handleAdd} onCancel={() => setAdding(false)} saving={saving} showNiche />}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {activeVideos.map((video) => <VideoCard key={video.id} video={video} isCoach={isCoach} onDelete={handleDelete} />)}
        </div>
      </div>
    );
  }

  // ── Vista: Mis Videos ─────────────────────────────────────────────────────
  if (view === "mis-videos") {
    return (
      <div className="space-y-5">
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 w-fit" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          {tabBtn("biblioteca", "Biblioteca del Coach", BookOpen)}
          {tabBtn("mis-videos", "Mis Videos", Bookmark)}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Tu colección personal de videos que te inspiran o querés guardar como referencia</p>
          </div>
          <Button size="sm" onClick={() => setAddingPersonal((v) => !v)}
            className="gap-1.5 text-white" style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}>
            <Plus className="h-4 w-4" /> Guardar video
          </Button>
        </div>

        {addingPersonal && (
          <Card className="border-blue-200">
            <CardContent className="pt-5 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm">URL del video *</Label>
                <Input placeholder="https://tiktok.com/... o https://instagram.com/..." value={personalForm.url} onChange={(e) => setPersonalForm((f) => ({ ...f, url: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Título / ¿Por qué lo guardás? *</Label>
                <Input placeholder="Ej: Gran hook de apertura, Estructura de storytelling..." value={personalForm.title} onChange={(e) => setPersonalForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Notas (opcional)</Label>
                <Input placeholder="Qué aprendiste, qué te gustó, qué querés replicar..." value={personalForm.description} onChange={(e) => setPersonalForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setAddingPersonal(false)}>Cancelar</Button>
                <Button size="sm" onClick={handleAddPersonal} disabled={savingPersonal} className="gap-1.5 text-white" style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}>
                  {savingPersonal ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bookmark className="h-3.5 w-3.5" />}
                  Guardar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {personalVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#EFF6FF" }}>
              <Bookmark className="h-6 w-6" style={{ color: "#1A6FFF" }} strokeWidth={1.5} />
            </div>
            <p className="text-gray-500 font-medium">Tu colección está vacía</p>
            <p className="text-gray-400 text-sm mt-1">Guardá videos que te inspiren para tener tu propia biblioteca de referencia</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {personalVideos.map((video) => <PersonalVideoCard key={video.id} video={video} onDelete={handleDeletePersonal} />)}
          </div>
        )}
      </div>
    );
  }

  // ── Vista principal: Biblioteca (grilla de módulos) ───────────────────────
  return (
    <div className="space-y-5">
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 w-fit" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        {tabBtn("biblioteca", "Biblioteca del Coach", BookOpen)}
        {tabBtn("mis-videos", "Mis Videos", Bookmark)}
      </div>

      {isCoach && (
        <div className="flex justify-end">
          <Button onClick={() => setAdding((v) => !v)}>
            <Plus className="h-4 w-4 mr-2" /> Agregar referente
          </Button>
        </div>
      )}

      {adding && isCoach && <AddVideoForm form={form} setForm={setForm} onSave={handleAdd} onCancel={() => setAdding(false)} saving={saving} showNiche />}

      {videos.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Video className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Aún no hay videos referentes</p>
          {isCoach && <p className="text-sm mt-1">Agregá el primero con el botón de arriba</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {nicheOrder.map((niche) => {
            const nicheVideos = groupedByNiche[niche] || [];
            const meta = NICHE_META[niche] || DEFAULT_META;
            const Icon = meta.icon;
            const tiktokCount = nicheVideos.filter((v) => v.url.includes("tiktok")).length;
            const igCount = nicheVideos.filter((v) => v.url.includes("instagram")).length;

            return (
              <Card key={niche} className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden group" onClick={() => setActiveNiche(niche)}>
                <div className={`h-1.5 w-full bg-gradient-to-r ${meta.gradient}`} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
                    </div>
                    <span className="text-2xl font-bold text-gray-300 group-hover:text-gray-400 transition-colors">{nicheVideos.length}</span>
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Módulo</p>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug mb-3">{niche}</h3>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tiktokCount > 0 && <span className="text-[10px] font-semibold bg-black text-white px-2 py-0.5 rounded-full">TikTok · {tiktokCount}</span>}
                    {igCount > 0 && <span className="text-[10px] font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full">Instagram · {igCount}</span>}
                  </div>
                  <div className="flex items-center justify-between text-sm text-[#1A6FFF] font-medium">
                    <span>Ver módulo</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Sub-componente: form agregar video ───────────────────────────────────────

function AddVideoForm({
  form, setForm, onSave, onCancel, saving, showNiche,
}: {
  form: { url: string; title: string; niche: string; description: string };
  setForm: React.Dispatch<React.SetStateAction<{ url: string; title: string; niche: string; description: string }>>;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  showNiche: boolean;
}) {
  return (
    <Card className="border-primary/30">
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label>URL del video</Label>
            <Input placeholder="https://..." value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Título</Label>
            <Input placeholder="Nombre descriptivo" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          {showNiche && (
            <div className="space-y-2">
              <Label>Nicho</Label>
              <Select value={form.niche} onValueChange={(v) => setForm((f) => ({ ...f, niche: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar nicho..." /></SelectTrigger>
                <SelectContent>{NICHES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2 col-span-2">
            <Label>Por qué es referente (opcional)</Label>
            <Input placeholder="Qué hace bien, qué técnica usa..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={onSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Guardar
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        </div>
      </CardContent>
    </Card>
  );
}
