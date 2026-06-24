"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  ArrowLeft,
  User,
  Home,
  Plane,
  Heart,
  ChevronRight,
  BookOpen,
  Bookmark,
  Dumbbell,
  Brain,
  ShoppingBag,
  Film,
  Target,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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

type NicheMeta = {
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
};

const NICHE_META: Record<string, NicheMeta> = {
  "Marca personal": { icon: User, gradient: "from-blue-500 to-blue-600", iconColor: "text-blue-600" },
  "Asesores inmobiliarios": { icon: Home, gradient: "from-emerald-500 to-emerald-600", iconColor: "text-emerald-600" },
  "Agencias de viajes": { icon: Plane, gradient: "from-sky-500 to-sky-600", iconColor: "text-sky-600" },
  "Nutricionistas y fitness": { icon: Dumbbell, gradient: "from-orange-500 to-orange-600", iconColor: "text-orange-600" },
  "Psicólogos y coaches": { icon: Brain, gradient: "from-purple-500 to-purple-600", iconColor: "text-purple-600" },
  "Negocios físicos": { icon: ShoppingBag, gradient: "from-rose-500 to-rose-600", iconColor: "text-rose-600" },
  "Agencias de marketing / Filmmakers": { icon: Film, gradient: "from-indigo-500 to-indigo-600", iconColor: "text-indigo-600" },
  "Coach": { icon: Target, gradient: "from-amber-500 to-amber-600", iconColor: "text-amber-600" },
};

const REFERENTES: Record<string, string[]> = {
  "Marca personal": [
    "https://vt.tiktok.com/ZSQm5Teum/",
    "https://vt.tiktok.com/ZSQm59maX/",
    "https://vt.tiktok.com/ZSQm5HGub/",
    "https://vt.tiktok.com/ZSQmafVkn/",
    "https://vt.tiktok.com/ZSQma1d1F/",
    "https://vt.tiktok.com/ZSQmaS1Be/",
    "https://vt.tiktok.com/ZSQmaekLR/",
    "https://vt.tiktok.com/ZSQmaAcPw/",
    "https://vt.tiktok.com/ZSQmarSxj/",
    "https://vt.tiktok.com/ZSQmavcro/",
    "https://vt.tiktok.com/ZSQma7q7R/",
  ],
  "Asesores inmobiliarios": [
    "https://vt.tiktok.com/ZSQmaHQ3H/",
    "https://vt.tiktok.com/ZSQmaxRNF/",
    "https://vt.tiktok.com/ZSQmaaY5L/",
    "https://vt.tiktok.com/ZSQmm2V9L/",
    "https://vt.tiktok.com/ZSQmmJvxd/",
    "https://www.instagram.com/reel/DWxUNGQkS4N/?igsh=MWszdDhpbGhvZWx2aA==",
    "https://www.instagram.com/reel/DSJTPJ2Ebdr/?igsh=YjdjMHVhd3JueDlq",
    "https://www.instagram.com/reel/DYpzoyozKlE/?igsh=OGY5Nmo1d3Zrc2k5",
    "https://www.instagram.com/reel/DPo-wzsjviy/?igsh=NW52MG4yeDhod2lh",
    "https://www.instagram.com/reel/DK5LjC6RwiC/?igsh=M3JsdGpwdW4wOXRn",
    "https://vt.tiktok.com/ZSQmuPpcQ/",
    "https://vt.tiktok.com/ZSQmH19Xk/",
    "https://vt.tiktok.com/ZSQmuv8PW/",
    "https://www.instagram.com/reel/DZQ4doeRnL2/?igsh=ZnkwOGFqdGpmN3pq",
    "https://vt.tiktok.com/ZSQmHFtmD/",
    "https://vt.tiktok.com/ZSQmHQ16a/",
  ],
  "Agencias de viajes": [
    "https://vt.tiktok.com/ZSQm9LdgX/",
    "https://vt.tiktok.com/ZSQm9HWfA/",
    "https://vt.tiktok.com/ZSQm95QV5/",
    "https://vt.tiktok.com/ZSQm9BBmv/",
    "https://vt.tiktok.com/ZSQm9qFc2/",
    "https://vt.tiktok.com/ZSQm9Cco8/",
    "https://vt.tiktok.com/ZSQm9Kvu1/",
    "https://vt.tiktok.com/ZSQm9wEqy/",
  ],
  "Nutricionistas y fitness": [
    "https://vt.tiktok.com/ZSQmxVeCu/",
    "https://vt.tiktok.com/ZSQmxsN1d/",
    "https://vt.tiktok.com/ZSQmxpYVa/",
    "https://vt.tiktok.com/ZSQmQSvo1/",
    "https://vt.tiktok.com/ZSQmQANy5/",
    "https://vt.tiktok.com/ZSQmQAYDf/",
    "https://vt.tiktok.com/ZSQmQ1vWq/",
    "https://vt.tiktok.com/ZSQmQJ3jN/",
    "https://vt.tiktok.com/ZSQmQU2YV/",
    "https://www.instagram.com/reel/DZQrNdFPhdM/?igsh=MXZ4M3VwY2l2NnVtMw==",
    "https://www.instagram.com/reel/DZEBwEXttA7/?igsh=MXF0NzFoNm53OHZqcg==",
    "https://vt.tiktok.com/ZSQmCG6jw/",
  ],
  "Psicólogos y coaches": [
    "https://vt.tiktok.com/ZSQmCBXJD/",
    "https://vt.tiktok.com/ZSQmCBhUE/",
    "https://vt.tiktok.com/ZSQmCaeVR/",
    "https://vt.tiktok.com/ZSQmC9npG/",
    "https://vt.tiktok.com/ZSQmCy9Bu/",
    "https://vt.tiktok.com/ZSQmCg3MT/",
    "https://vt.tiktok.com/ZSQmCHuS1/",
    "https://vt.tiktok.com/ZSQmCGJR2/",
    "https://vt.tiktok.com/ZSQmXj4Lw/",
    "https://vt.tiktok.com/ZSQmXNgdr/",
  ],
  "Negocios físicos": [
    "https://vt.tiktok.com/ZSQmXNUhH/",
    "https://vt.tiktok.com/ZSQmXwKUB/",
    "https://vt.tiktok.com/ZSQm41TUQ/",
    "https://vt.tiktok.com/ZSQmXGo45/",
    "https://vt.tiktok.com/ZSQm4Nv7t/",
    "https://vt.tiktok.com/ZSQmXv88g/",
    "https://vt.tiktok.com/ZSQm4k3kw/",
    "https://vt.tiktok.com/ZSQm4uL3j/",
    "https://vt.tiktok.com/ZSQm4SrCA/",
    "https://vt.tiktok.com/ZSQm4DFDY/",
    "https://vt.tiktok.com/ZSQm4Aaou/",
    "https://vt.tiktok.com/ZSQm4XMcg/",
    "https://vt.tiktok.com/ZSQm43qv6/",
    "https://vt.tiktok.com/ZSQmV11XL/",
  ],
  "Agencias de marketing / Filmmakers": [
    "https://vt.tiktok.com/ZSQmquQVB/",
    "https://vt.tiktok.com/ZSQmq7U66/",
    "https://vt.tiktok.com/ZSQmq9FBp/",
    "https://vt.tiktok.com/ZSQmqc7BF/",
    "https://vt.tiktok.com/ZSQmqofqG/",
    "https://vt.tiktok.com/ZSQmqKoDT/",
    "https://vt.tiktok.com/ZSQmbYfKB/",
    "https://vt.tiktok.com/ZSQmbDjWg/",
    "https://vt.tiktok.com/ZSQmbmb2S/",
    "https://vt.tiktok.com/ZSQmbXpEM/",
  ],
  "Coach": [
    "https://vt.tiktok.com/ZSQmbVPHw/",
    "https://vt.tiktok.com/ZSQmbVPt3/",
    "https://vt.tiktok.com/ZSQmbD5JV/",
    "https://vt.tiktok.com/ZSQmbQxqy/",
    "https://vt.tiktok.com/ZSQmbxoxc/",
  ],
};

const NICHE_ORDER = Object.keys(REFERENTES);

function getPlatform(url: string): { label: string; className: string } {
  if (url.includes("tiktok.com")) return { label: "TikTok", className: "bg-black text-white border-0" };
  if (url.includes("instagram.com")) return { label: "Instagram", className: "bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0" };
  if (url.includes("youtube.com") || url.includes("youtu.be")) return { label: "YouTube", className: "bg-red-600 text-white border-0" };
  return { label: "Web", className: "bg-gray-100 text-gray-600 border-0" };
}

// ─── Componente principal ─────────────────────────────────────────────────────

type Props = {
  initialPersonalVideos: PersonalVideo[];
};

export function ReferentesClient({ initialPersonalVideos }: Props) {
  const [view, setView] = useState<"biblioteca" | "mis-videos">("biblioteca");
  const [activeNiche, setActiveNiche] = useState<string | null>(null);
  const [personalVideos, setPersonalVideos] = useState<PersonalVideo[]>(initialPersonalVideos);
  const [addingPersonal, setAddingPersonal] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({ url: "", title: "", description: "" });
  const supabase = createClient();

  // ── CRUD Mis Videos ─────────────────────────────────────────────────────
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

  // ── Tab buttons ─────────────────────────────────────────────────────────
  const tabBtn = (v: typeof view, label: string, Icon: React.ElementType) => (
    <button
      onClick={() => { setView(v); setActiveNiche(null); }}
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

  // ── Vista: Nicho activo ──────────────────────────────────────────────────
  if (view === "biblioteca" && activeNiche) {
    const meta = NICHE_META[activeNiche];
    const links = REFERENTES[activeNiche] || [];
    const Icon = meta?.icon || User;
    const tiktokCount = links.filter((u) => u.includes("tiktok")).length;
    const igCount = links.filter((u) => u.includes("instagram")).length;

    return (
      <div className="space-y-5">
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 w-fit" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          {tabBtn("biblioteca", "Biblioteca del Coach", BookOpen)}
          {tabBtn("mis-videos", "Mis Videos", Bookmark)}
        </div>

        <button onClick={() => setActiveNiche(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver a nichos
        </button>

        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${meta?.gradient || "from-gray-400 to-gray-500"} flex items-center justify-center flex-shrink-0`}>
            <Icon className="h-6 w-6 text-white" strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{activeNiche}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">{links.length} videos referentes</span>
              {tiktokCount > 0 && <span className="text-[10px] font-semibold bg-black text-white px-2 py-0.5 rounded-full">TikTok {tiktokCount}</span>}
              {igCount > 0 && <span className="text-[10px] font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full">Instagram {igCount}</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {links.map((url, i) => {
            const platform = getPlatform(url);
            return (
              <Card key={i} className="flex flex-col group hover:shadow-md transition-all border border-gray-100 bg-white">
                <CardContent className="p-4 flex flex-col gap-3 h-full">
                  <div className="flex items-center justify-between">
                    <Badge className={`text-[10px] px-2 py-0.5 font-semibold ${platform.className}`}>{platform.label}</Badge>
                    <span className="text-xs text-gray-300 font-medium">#{i + 1}</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center py-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${meta?.gradient || "from-gray-400 to-gray-500"} flex items-center justify-center opacity-20`}>
                      <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
                    </div>
                  </div>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8">
                      <ExternalLink className="h-3 w-3" /> Ver video
                    </Button>
                  </a>
                </CardContent>
              </Card>
            );
          })}
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
          <p className="text-sm text-gray-500">Tu colección personal de videos que te inspiran o querés guardar como referencia</p>
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
            {personalVideos.map((video) => {
              const platform = getPlatform(video.url);
              return (
                <Card key={video.id} className="flex flex-col group hover:shadow-md transition-all border border-gray-100 bg-white">
                  <CardContent className="p-4 flex flex-col gap-3 h-full">
                    <div className="flex items-center justify-between">
                      <Badge className={`text-[10px] px-2 py-0.5 font-semibold ${platform.className}`}>{platform.label}</Badge>
                      <button onClick={() => handleDeletePersonal(video.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
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
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Vista principal: Nichos ─────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 w-fit" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        {tabBtn("biblioteca", "Biblioteca del Coach", BookOpen)}
        {tabBtn("mis-videos", "Mis Videos", Bookmark)}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {NICHE_ORDER.map((niche) => {
          const links = REFERENTES[niche];
          const meta = NICHE_META[niche];
          const Icon = meta?.icon || User;
          const tiktokCount = links.filter((u) => u.includes("tiktok")).length;
          const igCount = links.filter((u) => u.includes("instagram")).length;

          return (
            <Card
              key={niche}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden group"
              onClick={() => setActiveNiche(niche)}
            >
              <div className={`h-1.5 w-full bg-gradient-to-r ${meta?.gradient || "from-gray-400 to-gray-500"}`} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${meta?.gradient || "from-gray-400 to-gray-500"} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
                  </div>
                  <span className="text-2xl font-bold text-gray-300 group-hover:text-gray-400 transition-colors">{links.length}</span>
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Nicho</p>
                <h3 className="font-bold text-gray-900 text-sm leading-snug mb-3">{niche}</h3>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tiktokCount > 0 && <span className="text-[10px] font-semibold bg-black text-white px-2 py-0.5 rounded-full">TikTok · {tiktokCount}</span>}
                  {igCount > 0 && <span className="text-[10px] font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full">Instagram · {igCount}</span>}
                </div>
                <div className="flex items-center justify-between text-sm text-[#1A6FFF] font-medium">
                  <span>Ver referentes</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
