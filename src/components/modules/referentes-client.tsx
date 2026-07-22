"use client";

import { useMemo, useState } from "react";
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
  Search,
  Eye,
  Save,
  X,
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

type ReferenceVideo = {
  id: string;
  coach_id: string;
  url: string;
  title: string;
  niche: string;
  description?: string;
  created_at: string;
};

type ReferenceNiche = {
  id: string;
  coach_id: string;
  name: string;
  created_at: string;
};

type SearchResult = {
  video_id: string;
  url: string;
  title: string;
  views: number;
  likes: number;
  thumbnail_url: string | null;
  hashtags: string[];
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

const DEFAULT_NICHE_META: NicheMeta = { icon: User, gradient: "from-gray-400 to-gray-500", iconColor: "text-gray-600" };

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function getPlatform(url: string): { label: string; className: string } {
  if (url.includes("tiktok.com")) return { label: "TikTok", className: "bg-black text-white border-0" };
  if (url.includes("instagram.com")) return { label: "Instagram", className: "bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0" };
  if (url.includes("youtube.com") || url.includes("youtu.be")) return { label: "YouTube", className: "bg-red-600 text-white border-0" };
  return { label: "Web", className: "bg-gray-100 text-gray-600 border-0" };
}

// ─── Componente principal ─────────────────────────────────────────────────────

type Props = {
  initialPersonalVideos: PersonalVideo[];
  initialLibraryVideos: ReferenceVideo[];
  initialNiches: ReferenceNiche[];
  isCoach: boolean;
};

export function ReferentesClient({ initialPersonalVideos, initialLibraryVideos, initialNiches, isCoach }: Props) {
  const [view, setView] = useState<"biblioteca" | "mis-videos" | "buscar">("biblioteca");
  const [activeNiche, setActiveNiche] = useState<string | null>(null);
  const [personalVideos, setPersonalVideos] = useState<PersonalVideo[]>(initialPersonalVideos);
  const [libraryVideos, setLibraryVideos] = useState<ReferenceVideo[]>(initialLibraryVideos);
  const [niches, setNiches] = useState<ReferenceNiche[]>(initialNiches);
  const [addingPersonal, setAddingPersonal] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({ url: "", title: "", description: "" });
  const supabase = createClient();

  // ── Crear rubro ─────────────────────────────────────────────────────────
  const [creatingNiche, setCreatingNiche] = useState(false);
  const [newNicheDraft, setNewNicheDraft] = useState("");
  const [savingNiche, setSavingNiche] = useState(false);

  // ── Añadir video dentro de un rubro ─────────────────────────────────────
  const [addingVideoToNiche, setAddingVideoToNiche] = useState(false);
  const [nicheVideoForm, setNicheVideoForm] = useState({ url: "", title: "" });
  const [savingNicheVideo, setSavingNicheVideo] = useState(false);

  // ── Buscar ──────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [savingResultId, setSavingResultId] = useState<string | null>(null);
  const [nicheDraft, setNicheDraft] = useState("");
  const [savingToLibrary, setSavingToLibrary] = useState(false);

  const nicheGroups = useMemo(() => {
    const map = new Map<string, ReferenceVideo[]>();
    for (const v of libraryVideos) {
      const key = v.niche || "Sin categoría";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    }
    return map;
  }, [libraryVideos]);
  // Un rubro puede existir sin tener todavía ningún video (creado con "Crear rubro"),
  // así que la lista es la unión de los rubros creados + los niches que ya tienen videos.
  const nicheList = useMemo(() => {
    const names = new Set<string>([...niches.map((n) => n.name), ...nicheGroups.keys()]);
    return Array.from(names);
  }, [niches, nicheGroups]);

  async function handleSearch() {
    if (!searchQuery.trim()) { toast.error("Ingresá una palabra clave o nicho"); return; }
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch("/api/referentes/buscar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Error al buscar");
      setSearchResults(data.videos || []);
      if (!data.videos?.length) toast.info("No se encontraron videos para esa búsqueda");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al buscar videos");
    } finally {
      setSearching(false);
    }
  }

  async function handleSaveToLibrary(result: SearchResult) {
    const niche = nicheDraft.trim();
    if (!niche) { toast.error("Elegí o escribí un nicho"); return; }
    setSavingToLibrary(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("reference_videos")
        .insert({ coach_id: user!.id, url: result.url, title: result.title, niche })
        .select()
        .single();
      if (error) throw error;
      setLibraryVideos((prev) => [data, ...prev]);
      setSavingResultId(null);
      setNicheDraft("");
      toast.success("Guardado en la biblioteca");
    } catch {
      toast.error("Error al guardar en la biblioteca");
    } finally {
      setSavingToLibrary(false);
    }
  }

  async function handleDeleteLibraryVideo(id: string) {
    const { error } = await supabase.from("reference_videos").delete().eq("id", id);
    if (error) { toast.error("Error al eliminar"); return; }
    setLibraryVideos((prev) => prev.filter((v) => v.id !== id));
    toast.success("Eliminado de la biblioteca");
  }

  async function handleCreateNiche() {
    const name = newNicheDraft.trim();
    if (!name) { toast.error("Escribí un nombre para el rubro"); return; }
    if (nicheList.some((n) => n.toLowerCase() === name.toLowerCase())) {
      toast.error("Ya existe un rubro con ese nombre");
      return;
    }
    setSavingNiche(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("reference_niches")
        .insert({ coach_id: user!.id, name })
        .select()
        .single();
      if (error) throw error;
      setNiches((prev) => [data, ...prev]);
      setNewNicheDraft("");
      setCreatingNiche(false);
      toast.success("Rubro creado");
    } catch {
      toast.error("Error al crear el rubro");
    } finally {
      setSavingNiche(false);
    }
  }

  async function handleAddVideoToNiche() {
    if (!activeNiche) return;
    if (!nicheVideoForm.url.trim() || !nicheVideoForm.title.trim()) {
      toast.error("URL y título son obligatorios");
      return;
    }
    setSavingNicheVideo(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("reference_videos")
        .insert({ coach_id: user!.id, url: nicheVideoForm.url.trim(), title: nicheVideoForm.title.trim(), niche: activeNiche })
        .select()
        .single();
      if (error) throw error;
      setLibraryVideos((prev) => [data, ...prev]);
      setNicheVideoForm({ url: "", title: "" });
      setAddingVideoToNiche(false);
      toast.success("Video agregado al rubro");
    } catch {
      toast.error("Error al agregar el video");
    } finally {
      setSavingNicheVideo(false);
    }
  }

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

  const tabBar = (
    <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 w-fit" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      {tabBtn("biblioteca", "Biblioteca del Coach", BookOpen)}
      {tabBtn("buscar", "Buscar", Search)}
      {tabBtn("mis-videos", "Mis Videos", Bookmark)}
    </div>
  );

  // ── Vista: Buscar ─────────────────────────────────────────────────────────
  if (view === "buscar") {
    return (
      <div className="space-y-5">
        {tabBar}

        <div className="flex gap-2">
          <Input
            placeholder="Ej: agencia de viajes, asesores inmobiliarios, coach de negocios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            onClick={handleSearch}
            disabled={searching}
            className="gap-1.5 text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Buscar
          </Button>
        </div>

        {searching && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin mb-3" style={{ color: "#1A6FFF" }} />
            <p className="text-gray-600 font-medium">Buscando videos virales...</p>
          </div>
        )}

        {!searching && searchResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {searchResults.map((video) => (
              <div key={video.video_id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200" style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                <div className="h-24 flex items-center justify-center relative" style={{ background: "linear-gradient(135deg, #0B1D3E, #1A6FFF20)" }}>
                  <Badge className="absolute top-2 left-2 text-[9px] px-2 py-0.5 font-semibold bg-black text-white border-0">TikTok</Badge>
                  {video.views > 500_000 && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ background: "linear-gradient(135deg, #FF6B35, #FF8C00)" }}>
                      VIRAL
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">{video.title}</p>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatNumber(video.views)}</span>
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {formatNumber(video.likes)}</span>
                  </div>

                  <a href={video.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8">
                      <ExternalLink className="h-3 w-3" /> Ver video
                    </Button>
                  </a>

                  {isCoach && (
                    savingResultId === video.video_id ? (
                      <div className="space-y-1.5">
                        <Input
                          autoFocus
                          list="niche-suggestions"
                          placeholder="Nicho (ej: Agencias de viajes)"
                          value={nicheDraft}
                          onChange={(e) => setNicheDraft(e.target.value)}
                          className="text-xs h-8"
                        />
                        <datalist id="niche-suggestions">
                          {nicheList.map((n) => <option key={n} value={n} />)}
                        </datalist>
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => handleSaveToLibrary(video)}
                            disabled={savingToLibrary}
                            className="flex-1 gap-1.5 text-white text-[11px] h-8"
                            style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}
                          >
                            {savingToLibrary ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            Guardar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setSavingResultId(null); setNicheDraft(""); }} className="text-[11px] h-8">
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setSavingResultId(video.video_id); setNicheDraft(""); }}
                        className="w-full text-xs gap-1.5 h-8"
                      >
                        <Bookmark className="h-3 w-3" /> Guardar en biblioteca
                      </Button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!searching && searchResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#EFF6FF" }}>
              <Search className="h-6 w-6" style={{ color: "#1A6FFF" }} strokeWidth={1.5} />
            </div>
            <p className="text-gray-500 font-medium">Buscá videos virales por nicho o palabra clave</p>
            <p className="text-gray-400 text-sm mt-1 max-w-xs">Ej: &quot;agencia de viajes&quot;, &quot;asesores inmobiliarios&quot;, &quot;coach de negocios&quot;...</p>
          </div>
        )}
      </div>
    );
  }

  // ── Vista: Nicho activo (Biblioteca) ────────────────────────────────────
  if (view === "biblioteca" && activeNiche) {
    const meta = NICHE_META[activeNiche] || DEFAULT_NICHE_META;
    const videos = nicheGroups.get(activeNiche) || [];
    const Icon = meta.icon;
    const tiktokCount = videos.filter((v) => v.url.includes("tiktok")).length;
    const igCount = videos.filter((v) => v.url.includes("instagram")).length;

    return (
      <div className="space-y-5">
        {tabBar}

        <button onClick={() => setActiveNiche(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver a nichos
        </button>

        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center flex-shrink-0`}>
            <Icon className="h-6 w-6 text-white" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{activeNiche}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">{videos.length} videos referentes</span>
              {tiktokCount > 0 && <span className="text-[10px] font-semibold bg-black text-white px-2 py-0.5 rounded-full">TikTok {tiktokCount}</span>}
              {igCount > 0 && <span className="text-[10px] font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full">Instagram {igCount}</span>}
            </div>
          </div>
          {isCoach && (
            <Button
              size="sm"
              onClick={() => setAddingVideoToNiche((v) => !v)}
              className="gap-1.5 text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}
            >
              <Plus className="h-4 w-4" /> Añadir video
            </Button>
          )}
        </div>

        {isCoach && addingVideoToNiche && (
          <Card className="border-blue-200">
            <CardContent className="pt-5 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm">URL del video *</Label>
                <Input placeholder="https://tiktok.com/... o https://instagram.com/..." value={nicheVideoForm.url} onChange={(e) => setNicheVideoForm((f) => ({ ...f, url: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Título *</Label>
                <Input placeholder="Ej: Hook de apertura fuerte" value={nicheVideoForm.title} onChange={(e) => setNicheVideoForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setAddingVideoToNiche(false)}>Cancelar</Button>
                <Button size="sm" onClick={handleAddVideoToNiche} disabled={savingNicheVideo} className="gap-1.5 text-white" style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}>
                  {savingNicheVideo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Agregar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {videos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <p className="text-gray-500 font-medium">Este rubro todavía no tiene videos</p>
            {isCoach && <p className="text-gray-400 text-sm mt-1">Usá &quot;Añadir video&quot; arriba, o guardá resultados desde la pestaña &quot;Buscar&quot;</p>}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {videos.map((video) => {
            const platform = getPlatform(video.url);
            return (
              <Card key={video.id} className="flex flex-col group hover:shadow-md transition-all border border-gray-100 bg-white">
                <CardContent className="p-4 flex flex-col gap-3 h-full">
                  <div className="flex items-center justify-between">
                    <Badge className={`text-[10px] px-2 py-0.5 font-semibold ${platform.className}`}>{platform.label}</Badge>
                    {isCoach && (
                      <button onClick={() => handleDeleteLibraryVideo(video.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 flex items-center justify-center py-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center opacity-20`}>
                      <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
                    </div>
                  </div>
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
      </div>
    );
  }

  // ── Vista: Mis Videos ─────────────────────────────────────────────────────
  if (view === "mis-videos") {
    return (
      <div className="space-y-5">
        {tabBar}

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

  // ── Vista principal: Nichos (Biblioteca) ─────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {tabBar}
        {isCoach && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setCreatingNiche((v) => !v); setNewNicheDraft(""); }}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" /> Crear rubro
          </Button>
        )}
      </div>

      {isCoach && creatingNiche && (
        <Card className="border-blue-200">
          <CardContent className="pt-5 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Nombre del rubro *</Label>
              <Input
                autoFocus
                placeholder="Ej: Abogados, Dentistas, E-commerce..."
                value={newNicheDraft}
                onChange={(e) => setNewNicheDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateNiche()}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setCreatingNiche(false)}>Cancelar</Button>
              <Button size="sm" onClick={handleCreateNiche} disabled={savingNiche} className="gap-1.5 text-white" style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}>
                {savingNiche ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Crear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {nicheList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#EFF6FF" }}>
            <BookOpen className="h-6 w-6" style={{ color: "#1A6FFF" }} strokeWidth={1.5} />
          </div>
          <p className="text-gray-500 font-medium">La biblioteca todavía está vacía</p>
          <p className="text-gray-400 text-sm mt-1 max-w-xs">
            {isCoach
              ? "Buscá videos en la pestaña \"Buscar\" y guardalos acá para que todos tus clientes los vean."
              : "Tu coach todavía no agregó videos referentes."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {nicheList.map((niche) => {
            const videos = nicheGroups.get(niche) || [];
            const meta = NICHE_META[niche] || DEFAULT_NICHE_META;
            const Icon = meta.icon;
            const tiktokCount = videos.filter((v) => v.url.includes("tiktok")).length;
            const igCount = videos.filter((v) => v.url.includes("instagram")).length;

            return (
              <Card
                key={niche}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden group"
                onClick={() => setActiveNiche(niche)}
              >
                <div className={`h-1.5 w-full bg-gradient-to-r ${meta.gradient}`} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
                    </div>
                    <span className="text-2xl font-bold text-gray-300 group-hover:text-gray-400 transition-colors">{videos.length}</span>
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
      )}
    </div>
  );
}
