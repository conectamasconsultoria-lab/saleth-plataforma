"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ArrowLeft,
  Eye,
  Heart,
  Zap,
  ChevronRight,
  User,
  Save,
} from "lucide-react";

type ReferentAccount = {
  id: string;
  username: string;
  platform: string;
  created_at: string;
};

type TikTokVideo = {
  video_id: string;
  url: string;
  title: string;
  views: number;
  likes: number;
  thumbnail_url: string | null;
};

type AdaptedScript = {
  transcript: string;
  hook: string;
  development: string;
  cta: string;
  insight: string;
};

type Props = {
  initialAccounts: ReferentAccount[];
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export function MisReferentesClient({ initialAccounts }: Props) {
  const [accounts, setAccounts] = useState<ReferentAccount[]>(initialAccounts);
  const [newUsername, setNewUsername] = useState("");
  const [addingAccount, setAddingAccount] = useState(false);

  // Vista de cuenta activa con sus videos
  const [activeAccount, setActiveAccount] = useState<ReferentAccount | null>(null);
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  // Vista de video con script adaptado
  const [activeVideo, setActiveVideo] = useState<TikTokVideo | null>(null);
  const [adapting, setAdapting] = useState(false);
  const [adapted, setAdapted] = useState<AdaptedScript | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [savingScript, setSavingScript] = useState(false);

  const supabase = createClient();

  // ── Gestión de cuentas ────────────────────────────────────────────────────

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
      setAccounts((prev) => [data, ...prev]);
      setNewUsername("");
      toast.success(`@${username} agregado como referente`);
    } catch {
      toast.error("Error al agregar la cuenta");
    } finally {
      setAddingAccount(false);
    }
  }

  async function handleDeleteAccount(id: string) {
    const { error } = await supabase.from("user_referent_accounts").delete().eq("id", id);
    if (error) { toast.error("Error al eliminar"); return; }
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    toast.success("Cuenta eliminada");
  }

  // ── Obtener videos de una cuenta ─────────────────────────────────────────

  async function handleLoadVideos(account: ReferentAccount) {
    setActiveAccount(account);
    setVideos([]);
    setActiveVideo(null);
    setAdapted(null);
    setLoadingVideos(true);
    try {
      const res = await fetch("/api/referentes/cuenta", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: account.username }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Error");
      setVideos(data.videos || []);
      if ((data.videos || []).length === 0) {
        toast.info("No se encontraron videos — verificá el usuario o el plan de API");
      }
    } catch {
      toast.error("Error al obtener videos de TikTok");
    } finally {
      setLoadingVideos(false);
    }
  }

  // ── Adaptar video ─────────────────────────────────────────────────────────

  async function handleAdapt(video: TikTokVideo) {
    setActiveVideo(video);
    setAdapted(null);
    setAdapting(true);
    try {
      const res = await fetch("/api/referentes/adaptar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tiktokUrl: video.url, videoTitle: video.title }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Error");
      setAdapted(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al adaptar";
      toast.error(msg);
      setActiveVideo(null);
    } finally {
      setAdapting(false);
    }
  }

  async function handleSaveScript() {
    if (!adapted) return;
    setSavingScript(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("scripts").insert({
        user_id: user!.id,
        title: `Adaptado de @${activeAccount?.username}: ${activeVideo?.title?.slice(0, 60) || "Video viral"}`,
        hook: adapted.hook,
        development: adapted.development,
        cta: adapted.cta,
      });
      if (error) throw error;
      toast.success("Guión guardado en tu biblioteca");
    } catch {
      toast.error("Error al guardar el guión");
    } finally {
      setSavingScript(false);
    }
  }

  function copyField(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  // ── Vista: Script adaptado ─────────────────────────────────────────────────
  if (activeVideo && adapted) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => { setActiveVideo(null); setAdapted(null); }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a videos de @{activeAccount?.username}
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-white" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}>
            <Sparkles className="h-5 w-5 text-white" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm line-clamp-2">{activeVideo.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Video de @{activeAccount?.username} · {formatNumber(activeVideo.views)} vistas</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={handleSaveScript}
              disabled={savingScript}
              className="gap-1.5 text-white text-xs"
              style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}
            >
              {savingScript ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Guardar guión
            </Button>
          </div>
        </div>

        {/* Insight de adaptación */}
        {adapted.insight && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: "linear-gradient(135deg, #1A6FFF12, #00C8FF08)", border: "1px solid #1A6FFF20" }}>
            <Zap className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" strokeWidth={1.8} />
            <p className="text-gray-700 text-xs leading-relaxed"><strong className="text-blue-700">Mecánica adaptada:</strong> {adapted.insight}</p>
          </div>
        )}

        {/* Script sections */}
        {[
          { key: "hook", label: "Hook — Primeros 3 segundos", color: "#FF6B35", bg: "#FFF3ED", border: "#FFDCC8" },
          { key: "development", label: "Desarrollo", color: "#1A6FFF", bg: "#EFF6FF", border: "#DBEAFE" },
          { key: "cta", label: "CTA — Llamada a la acción", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
        ].map(({ key, label, color, bg, border }) => (
          <div key={key} className="rounded-2xl p-4 space-y-2" style={{ background: bg, border: `1px solid ${border}` }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color }}>{label}</p>
              <button
                onClick={() => copyField(adapted[key as keyof AdaptedScript] as string, key)}
                className="flex items-center gap-1 text-xs font-medium transition-colors"
                style={{ color: copiedField === key ? "#059669" : "#6B7280" }}
              >
                {copiedField === key ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedField === key ? "Copiado" : "Copiar"}
              </button>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
              {adapted[key as keyof AdaptedScript] as string}
            </p>
          </div>
        ))}

        {/* Transcripción original */}
        {adapted.transcript && (
          <details className="rounded-xl border border-gray-100 overflow-hidden">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50/60 hover:bg-gray-50 transition-colors select-none">
              Ver transcripción original del video
            </summary>
            <div className="px-4 py-3 text-xs text-gray-500 leading-relaxed">
              {adapted.transcript}
            </div>
          </details>
        )}
      </div>
    );
  }

  // ── Vista: Videos de una cuenta ────────────────────────────────────────────
  if (activeAccount) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => { setActiveAccount(null); setVideos([]); }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a mis referentes
        </button>

        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #010101, #333)" }}>
            <span className="text-white font-black text-sm">Tk</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">@{activeAccount.username}</h2>
            <p className="text-sm text-muted-foreground">Videos más virales de la cuenta</p>
          </div>
        </div>

        {loadingVideos ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin mb-3" style={{ color: "#1A6FFF" }} />
            <p className="text-gray-600 font-medium">Obteniendo videos de TikTok...</p>
            <p className="text-gray-400 text-sm mt-1">Esto puede tardar unos segundos</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100">
            <TrendingUp className="h-10 w-10 mb-3 opacity-20" />
            <p className="text-gray-500 font-medium">No se encontraron videos</p>
            <p className="text-gray-400 text-sm mt-1">Verificá que el usuario existe en TikTok o revisá tu plan de API</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div key={video.video_id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 group"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                {/* Thumbnail placeholder */}
                <div className="h-32 flex items-center justify-center relative"
                  style={{ background: "linear-gradient(135deg, #0B1D3E, #1A6FFF20)" }}>
                  <TrendingUp className="h-8 w-8 opacity-20 text-white" />
                  {video.views > 500_000 && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #FF6B35, #FF8C00)" }}>
                      VIRAL 🔥
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">{video.title}</p>

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatNumber(video.views)}</span>
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {formatNumber(video.likes)}</span>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleAdapt(video)}
                    className="w-full gap-1.5 text-white text-xs h-9"
                    style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)", boxShadow: "0 3px 10px rgba(26,111,255,0.3)" }}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Transcribir y adaptar a mi nicho
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Adaptando modal overlay */}
        {adapting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
              <div className="h-16 w-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}>
                <Sparkles className="h-8 w-8 text-white animate-pulse" strokeWidth={1.8} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Adaptando tu guión</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Transcribiendo el video y adaptando el guión a tu nicho y marca personal...
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

  // ── Vista principal: lista de cuentas ──────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Agregar cuenta */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <p className="text-sm font-semibold text-gray-700 mb-1">Agregar cuenta de TikTok como referente</p>
          <p className="text-xs text-gray-400 mb-3">El sistema va a obtener sus videos más virales para que puedas adaptarlos a tu nicho</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
              <Input
                className="pl-7"
                placeholder="mateomaffia, garyvee, alexhormozi..."
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddAccount()}
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

      {/* Lista de cuentas */}
      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, #1A6FFF15, #00C8FF10)" }}>
            <User className="h-7 w-7" style={{ color: "#1A6FFF" }} strokeWidth={1.5} />
          </div>
          <p className="text-gray-600 font-semibold">Aún no tenés referentes agregados</p>
          <p className="text-gray-400 text-sm mt-1 max-w-xs">
            Agregá cuentas de TikTok que admirás — el sistema va a obtener sus videos virales y los va a adaptar a tu nicho con IA
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
              onClick={() => handleLoadVideos(account)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ background: "#010101" }}>
                  <span className="text-white font-black text-xs">Tk</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteAccount(account.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                TikTok
              </p>
              <h3 className="font-bold text-gray-900 text-lg">@{account.username}</h3>

              <div className="flex items-center justify-between mt-4 text-sm text-[#1A6FFF] font-medium">
                <span>Ver videos virales</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
