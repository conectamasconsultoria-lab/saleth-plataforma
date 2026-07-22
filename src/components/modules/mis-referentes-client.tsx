"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Loader2,
  TrendingUp,
  Sparkles,
  Copy,
  Check,
  Eye,
  Heart,
  Zap,
  User,
  Save,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ReferentAccount = {
  id: string;
  username: string;
  platform: string;
  created_at: string;
  style_analysis?: string | null;
  style_analysis_generated_at?: string | null;
};

type TikTokVideo = {
  video_id: string;
  url: string;
  title: string;
  views: number;
  likes: number;
  thumbnail_url: string | null;
};

type GeneratedScript = {
  id: string;
  title: string;
  hook: string;
  development: string;
  cta: string;
  inspiration?: string;
  created_at?: string;
};

type Props = {
  initialAccounts: ReferentAccount[];
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function ScriptCard({ script, defaultExpanded = false }: { script: GeneratedScript; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  function copyField(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  function copyAll() {
    const full = `HOOK:\n${script.hook}\n\nDESARROLLO:\n${script.development}\n\nCTA:\n${script.cta}`;
    navigator.clipboard.writeText(full);
    setCopiedField("all");
    setTimeout(() => setCopiedField(null), 2000);
  }

  const displayTitle = script.title.replace(/^Inspirado en @\w+:\s*/, "").replace(/^Adaptado de @\w+:\s*/, "");

  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden transition-all duration-200 hover:shadow-md" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #1A6FFF15, #00C8FF10)" }}>
          <FileText className="h-4 w-4" style={{ color: "#1A6FFF" }} strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{displayTitle}</p>
          {!expanded && <p className="text-xs text-gray-400 truncate mt-0.5">{script.hook}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); copyAll(); }}
            className="flex items-center gap-1 text-xs font-medium transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
            style={{ color: copiedField === "all" ? "#059669" : "#6B7280" }}
          >
            {copiedField === "all" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copiedField === "all" ? "Copiado" : "Copiar"}
          </button>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {script.inspiration && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: "linear-gradient(135deg, #1A6FFF08, #00C8FF05)", border: "1px solid #1A6FFF15" }}>
              <Zap className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" strokeWidth={1.8} />
              <p className="text-gray-600 leading-relaxed"><span className="font-semibold text-blue-600">Inspiración:</span> {script.inspiration}</p>
            </div>
          )}

          {[
            { key: "hook", label: "Hook", color: "#FF6B35", bg: "#FFF3ED", border: "#FFDCC8" },
            { key: "development", label: "Desarrollo", color: "#1A6FFF", bg: "#EFF6FF", border: "#DBEAFE" },
            { key: "cta", label: "CTA", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
          ].map(({ key, label, color, bg, border }) => (
            <div key={key} className="rounded-xl p-3 space-y-1.5" style={{ background: bg, border: `1px solid ${border}` }}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{label}</p>
                <button
                  onClick={() => copyField(script[key as keyof GeneratedScript] as string, key)}
                  className="flex items-center gap-1 text-[10px] font-medium transition-colors"
                  style={{ color: copiedField === key ? "#059669" : "#9CA3AF" }}
                >
                  {copiedField === key ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                {script[key as keyof GeneratedScript] as string}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MisReferentesClient({ initialAccounts }: Props) {
  const [accounts, setAccounts] = useState<ReferentAccount[]>(initialAccounts);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(
    initialAccounts.length > 0 ? initialAccounts[0].id : null
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [addingAccount, setAddingAccount] = useState(false);

  const [videoCache, setVideoCache] = useState<Record<string, TikTokVideo[]>>({});
  const [loadingVideos, setLoadingVideos] = useState<string | null>(null);

  const [scriptCache, setScriptCache] = useState<Record<string, GeneratedScript[]>>({});
  const [generatingScripts, setGeneratingScripts] = useState<string | null>(null);

  const [adaptingVideoId, setAdaptingVideoId] = useState<string | null>(null);
  const [savingAdapted, setSavingAdapted] = useState(false);
  const [topicPromptVideoId, setTopicPromptVideoId] = useState<string | null>(null);
  const [topicDraft, setTopicDraft] = useState("");
  const [analyzingStyle, setAnalyzingStyle] = useState<string | null>(null);

  const fetchedRef = useRef<Set<string>>(new Set());
  const supabase = createClient();

  const activeAccount = accounts.find((a) => a.id === activeAccountId) ?? null;
  const activeVideos = activeAccountId ? (videoCache[activeAccountId] || []) : [];
  const activeScripts = activeAccountId ? (scriptCache[activeAccountId] || []) : [];
  const isLoadingVideos = loadingVideos === activeAccountId;
  const isGeneratingScripts = generatingScripts === activeAccountId;

  const fetchVideos = useCallback(async (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    if (!account || videoCache[accountId]) return videoCache[accountId] || [];

    setLoadingVideos(accountId);
    try {
      const res = await fetch("/api/referentes/cuenta", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: account.username }),
      });
      const data = await res.json();
      const videos: TikTokVideo[] = data.videos || [];
      setVideoCache((prev) => ({ ...prev, [accountId]: videos }));
      if (videos.length === 0) {
        toast.info("No se encontraron videos — verificá el usuario o el plan de API");
      }
      return videos;
    } catch {
      toast.error("Error al obtener videos de TikTok");
      setVideoCache((prev) => ({ ...prev, [accountId]: [] }));
      return [];
    } finally {
      setLoadingVideos(null);
    }
  }, [accounts, videoCache]);

  const generateScripts = useCallback(async (accountId: string, username: string, videoTitles: string[]) => {
    if (videoTitles.length === 0) return;
    setGeneratingScripts(accountId);
    try {
      const res = await fetch("/api/referentes/generar-guiones", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, videoTitles }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Error");
      setScriptCache((prev) => ({
        ...prev,
        [accountId]: [...(prev[accountId] || []), ...(data.scripts || [])],
      }));
      toast.success(`${data.scripts?.length || 0} guiones generados`);
    } catch {
      toast.error("Error al generar guiones");
    } finally {
      setGeneratingScripts(null);
    }
  }, []);

  useEffect(() => {
    if (activeAccountId && !videoCache[activeAccountId] && !loadingVideos && !fetchedRef.current.has(activeAccountId)) {
      fetchedRef.current.add(activeAccountId);
      fetchVideos(activeAccountId);
    }
  }, [activeAccountId, videoCache, loadingVideos, fetchVideos]);

  async function handleAddAccount() {
    const username = newUsername.trim().replace(/^@/, "");
    if (!username) { toast.error("Ingresá un @usuario de TikTok"); return; }

    setAddingAccount(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("user_referent_accounts")
        .insert({ user_id: user!.id, username, platform: "tiktok" })
        .select()
        .single();
      if (error) {
        if (error.code === "23505") { toast.error("Ya tenés esta cuenta agregada"); return; }
        throw error;
      }

      const newAccounts = [data, ...accounts];
      setAccounts(newAccounts);
      setNewUsername("");
      setShowAddForm(false);
      setActiveAccountId(data.id);
      toast.success(`@${username} agregado como referente`);

      fetchedRef.current.add(data.id);
      const videos = await fetchVideosForNew(data.id, username);
      if (videos.length > 0) {
        await generateScripts(data.id, username, videos.map((v: TikTokVideo) => v.title));
      }
    } catch {
      toast.error("Error al agregar la cuenta");
    } finally {
      setAddingAccount(false);
    }
  }

  async function fetchVideosForNew(accountId: string, username: string): Promise<TikTokVideo[]> {
    setLoadingVideos(accountId);
    try {
      const res = await fetch("/api/referentes/cuenta", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      const videos: TikTokVideo[] = data.videos || [];
      setVideoCache((prev) => ({ ...prev, [accountId]: videos }));
      return videos;
    } catch {
      toast.error("Error al obtener videos");
      setVideoCache((prev) => ({ ...prev, [accountId]: [] }));
      return [];
    } finally {
      setLoadingVideos(null);
    }
  }

  async function handleDeleteAccount(accountId: string) {
    const { error } = await supabase.from("user_referent_accounts").delete().eq("id", accountId);
    if (error) { toast.error("Error al eliminar"); return; }
    const newAccounts = accounts.filter((a) => a.id !== accountId);
    setAccounts(newAccounts);
    setVideoCache((prev) => { const next = { ...prev }; delete next[accountId]; return next; });
    setScriptCache((prev) => { const next = { ...prev }; delete next[accountId]; return next; });
    if (activeAccountId === accountId) {
      setActiveAccountId(newAccounts.length > 0 ? newAccounts[0].id : null);
    }
    toast.success("Referente eliminado");
  }

  async function handleAdaptVideo(video: TikTokVideo, topic?: string) {
    if (!activeAccount) return;
    setTopicPromptVideoId(null);
    setTopicDraft("");
    setAdaptingVideoId(video.video_id);
    try {
      const res = await fetch("/api/referentes/adaptar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tiktokUrl: video.url, videoTitle: video.title, topic: topic || undefined }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Error");

      setSavingAdapted(true);
      const { data: { user } } = await supabase.auth.getUser();
      const { data: saved, error } = await supabase.from("scripts").insert({
        user_id: user!.id,
        title: `Adaptado de @${activeAccount.username}: ${video.title?.slice(0, 60) || "Video viral"}`,
        hook: data.hook,
        development: data.development,
        cta: data.cta,
      }).select().single();

      if (!error && saved) {
        const newScript: GeneratedScript = {
          ...saved,
          inspiration: data.insight,
        };
        setScriptCache((prev) => ({
          ...prev,
          [activeAccountId!]: [newScript, ...(prev[activeAccountId!] || [])],
        }));
        toast.success("Video adaptado y guión guardado");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al adaptar";
      toast.error(msg);
    } finally {
      setAdaptingVideoId(null);
      setSavingAdapted(false);
    }
  }

  async function handleGenerateMore() {
    if (!activeAccount || activeVideos.length === 0) return;
    await generateScripts(
      activeAccount.id,
      activeAccount.username,
      activeVideos.map((v) => v.title)
    );
  }

  async function handleAnalyzeStyle() {
    if (!activeAccount || activeVideos.length === 0) return;
    setAnalyzingStyle(activeAccount.id);
    try {
      const res = await fetch("/api/referentes/analizar-estilo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          accountId: activeAccount.id,
          username: activeAccount.username,
          videos: activeVideos.map((v) => ({
            title: v.title,
            views: v.views,
            likes: v.likes,
            thumbnail_url: v.thumbnail_url,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Error");

      setAccounts((prev) =>
        prev.map((a) =>
          a.id === activeAccount.id
            ? { ...a, style_analysis: data.analysis, style_analysis_generated_at: data.generatedAt }
            : a
        )
      );
      toast.success("Análisis de estilo listo");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al analizar el estilo");
    } finally {
      setAnalyzingStyle(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {accounts.map((account) => (
          <button
            key={account.id}
            onClick={() => { setActiveAccountId(account.id); setShowAddForm(false); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex-shrink-0 group relative",
              activeAccountId === account.id
                ? "text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 bg-white border border-gray-100 hover:shadow-sm"
            )}
            style={activeAccountId === account.id ? {
              background: "linear-gradient(135deg, #1A6FFF, #00C8FF)",
              boxShadow: "0 4px 12px rgba(26,111,255,0.3)",
            } : { boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <span className={cn(
              "text-[10px] font-black px-1.5 py-0.5 rounded",
              activeAccountId === account.id ? "bg-white/20 text-white" : "bg-black text-white"
            )}>Tk</span>
            <span>@{account.username}</span>
            {activeAccountId === account.id && (
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteAccount(account.id); }}
                className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </button>
        ))}

        <button
          onClick={() => setShowAddForm((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0",
            showAddForm
              ? "text-white"
              : "text-gray-400 hover:text-gray-600 border border-dashed border-gray-200 hover:border-gray-300"
          )}
          style={showAddForm ? {
            background: "linear-gradient(135deg, #1A6FFF, #00C8FF)",
            boxShadow: "0 4px 12px rgba(26,111,255,0.3)",
          } : {}}
        >
          <Plus className="h-4 w-4" />
          Agregar
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <Card className="border-blue-200/50" style={{ boxShadow: "0 4px 16px rgba(26,111,255,0.08)" }}>
          <CardContent className="pt-5 pb-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">Agregar cuenta de TikTok como referente</p>
            <p className="text-xs text-gray-400 mb-3">El sistema va a obtener sus videos virales y generar guiones inspirados en su estilo</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <Input
                  className="pl-7"
                  placeholder="mateomaffia, garyvee, alexhormozi..."
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddAccount()}
                  disabled={addingAccount}
                />
              </div>
              <Button
                onClick={handleAddAccount}
                disabled={addingAccount || !newUsername.trim()}
                className="gap-1.5 text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}
              >
                {addingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Agregar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state - no accounts */}
      {accounts.length === 0 && !showAddForm && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #1A6FFF15, #00C8FF10)" }}>
            <User className="h-7 w-7" style={{ color: "#1A6FFF" }} strokeWidth={1.5} />
          </div>
          <p className="text-gray-600 font-semibold">Aún no tenés referentes</p>
          <p className="text-gray-400 text-sm mt-1 max-w-xs">
            Agregá cuentas de TikTok que admirás — el sistema obtiene sus videos virales y genera guiones inspirados en su estilo
          </p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="mt-4 gap-1.5 text-white"
            style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}
          >
            <Plus className="h-4 w-4" /> Agregar mi primer referente
          </Button>
        </div>
      )}

      {/* Tab content */}
      {activeAccount && !showAddForm && (
        <div className="space-y-6">
          {/* Account header */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "#010101" }}>
              <span className="text-white font-black text-sm">Tk</span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">@{activeAccount.username}</h2>
              <p className="text-xs text-muted-foreground">
                {activeVideos.length > 0 ? `${activeVideos.length} videos` : ""}
                {activeVideos.length > 0 && activeScripts.length > 0 ? " · " : ""}
                {activeScripts.length > 0 ? `${activeScripts.length} guiones generados` : ""}
              </p>
            </div>
          </div>

          {/* Análisis de estilo / marca personal */}
          {(activeVideos.length > 0 || activeAccount.style_analysis) && (
            <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-gray-400" />
                  Por qué funciona @{activeAccount.username}
                </h3>
                {activeVideos.length > 0 && (
                  <button
                    onClick={handleAnalyzeStyle}
                    disabled={analyzingStyle === activeAccount.id}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  >
                    {analyzingStyle === activeAccount.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    {activeAccount.style_analysis ? "Regenerar" : "Analizar estilo"}
                  </button>
                )}
              </div>

              {analyzingStyle === activeAccount.id ? (
                <p className="text-xs text-gray-400">Analizando formato, comunicación y elementos visuales...</p>
              ) : activeAccount.style_analysis ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{activeAccount.style_analysis}</p>
              ) : (
                <p className="text-xs text-gray-400">
                  Analizá qué hace que el contenido de @{activeAccount.username} funcione: formato, comunicación, elementos visuales, y cómo aplicarlo a tu marca.
                </p>
              )}
            </div>
          )}

          {/* Loading videos */}
          {isLoadingVideos && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin mb-3" style={{ color: "#1A6FFF" }} />
              <p className="text-gray-600 font-medium">Obteniendo videos de @{activeAccount.username}...</p>
              <p className="text-gray-400 text-sm mt-1">Esto puede tardar unos segundos</p>
            </div>
          )}

          {/* Videos section */}
          {!isLoadingVideos && activeVideos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  Videos virales
                </h3>
                <button
                  onClick={() => {
                    setVideoCache((prev) => { const next = { ...prev }; delete next[activeAccount.id]; return next; });
                    fetchedRef.current.delete(activeAccount.id);
                    fetchVideos(activeAccount.id);
                  }}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" /> Actualizar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeVideos.map((video) => (
                  <div key={video.video_id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200" style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                    <div className="h-24 flex items-center justify-center relative" style={{ background: "linear-gradient(135deg, #0B1D3E, #1A6FFF20)" }}>
                      <TrendingUp className="h-6 w-6 opacity-20 text-white" />
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
                      {topicPromptVideoId === video.video_id ? (
                        <div className="space-y-1.5">
                          <Textarea
                            autoFocus
                            value={topicDraft}
                            onChange={(e) => setTopicDraft(e.target.value)}
                            placeholder="¿Sobre qué tema adaptamos este video? (opcional)"
                            rows={2}
                            className="text-[11px]"
                          />
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => handleAdaptVideo(video, topicDraft)}
                              disabled={adaptingVideoId === video.video_id}
                              className="flex-1 gap-1.5 text-white text-[11px] h-8"
                              style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              Adaptar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setTopicPromptVideoId(null); setTopicDraft(""); }}
                              className="text-[11px] h-8"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => { setTopicPromptVideoId(video.video_id); setTopicDraft(""); }}
                          disabled={adaptingVideoId === video.video_id}
                          className="w-full gap-1.5 text-white text-[11px] h-8"
                          style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)", boxShadow: "0 3px 10px rgba(26,111,255,0.25)" }}
                        >
                          {adaptingVideoId === video.video_id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                          {adaptingVideoId === video.video_id ? "Adaptando..." : "Adaptar a mi nicho"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No videos found */}
          {!isLoadingVideos && videoCache[activeAccount.id] && activeVideos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center bg-white rounded-xl border border-gray-100">
              <TrendingUp className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-gray-500 text-sm font-medium">No se encontraron videos</p>
              <p className="text-gray-400 text-xs mt-1">Verificá que el usuario existe en TikTok</p>
            </div>
          )}

          {/* Generating scripts loading */}
          {isGeneratingScripts && (
            <div className="flex items-center gap-3 px-4 py-4 rounded-xl" style={{ background: "linear-gradient(135deg, #1A6FFF08, #00C8FF05)", border: "1px solid #1A6FFF15" }}>
              <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}>
                <Sparkles className="h-5 w-5 text-white animate-pulse" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Generando guiones inspirados en @{activeAccount.username}...</p>
                <p className="text-xs text-gray-400 mt-0.5">Analizando patrones de contenido y adaptando a tu nicho</p>
              </div>
              <Loader2 className="h-5 w-5 animate-spin ml-auto flex-shrink-0" style={{ color: "#1A6FFF" }} />
            </div>
          )}

          {/* Scripts section */}
          {activeScripts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  Guiones generados
                  <span className="text-xs font-normal text-gray-400">({activeScripts.length})</span>
                </h3>
              </div>
              <div className="space-y-2">
                {activeScripts.map((script, i) => (
                  <ScriptCard key={script.id || i} script={script} defaultExpanded={i === 0 && activeScripts.length <= 3} />
                ))}
              </div>
            </div>
          )}

          {/* Generate more button */}
          {!isLoadingVideos && !isGeneratingScripts && activeVideos.length > 0 && (
            <div className="flex justify-center pt-2">
              <Button
                onClick={handleGenerateMore}
                variant="outline"
                className="gap-2 text-sm rounded-xl px-6"
              >
                <Sparkles className="h-4 w-4" style={{ color: "#1A6FFF" }} />
                Generar más guiones inspirados en @{activeAccount.username}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Adapting overlay */}
      {adaptingVideoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
            <div className="h-16 w-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}>
              <Sparkles className="h-8 w-8 text-white animate-pulse" strokeWidth={1.8} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Adaptando guión</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Transcribiendo el video y creando un guión adaptado a tu nicho y marca personal...
            </p>
            <p className="text-gray-400 text-xs mt-3">Esto puede tardar 1-2 minutos</p>
            <div className="mt-4 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#1A6FFF" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
