"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Loader2, RefreshCw, Palette } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Questionnaire } from "@/lib/supabase/types";
import { ARCHETYPES } from "@/lib/archetypes";
import type { ArchetypeName } from "@/lib/archetypes";
import { BRAND_FONT_LIST, resolveBrandFont, type BrandFontId } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type Props = {
  initialQuestionnaire: Questionnaire | null;
  profile: {
    full_name: string;
    role: string;
    avatar_url?: string;
    brand_color?: string;
    brand_style?: "dark" | "light";
    brand_font?: string;
  } | null;
};

export function SettingsClient({ initialQuestionnaire, profile }: Props) {
  const bp = (initialQuestionnaire?.brand_blueprint ?? {}) as Record<string, string>;

  const [form, setForm] = useState({
    niche: initialQuestionnaire?.niche ?? "",
    offer: initialQuestionnaire?.offer ?? "",
    content_style: initialQuestionnaire?.content_style ?? "",
    tone: bp.tone ?? "",
    values: bp.values ?? "",
    target_audience: bp.target_audience ?? "",
    content_pillars: bp.content_pillars ?? "",
  });
  const [saving, setSaving] = useState(false);

  const [brandColor, setBrandColor] = useState(profile?.brand_color ?? "#1A6FFF");
  const [brandStyle, setBrandStyle] = useState<"dark" | "light">(profile?.brand_style ?? "dark");
  const [brandFont, setBrandFont] = useState<BrandFontId>((profile?.brand_font as BrandFontId) ?? "inter");
  const [savingBrand, setSavingBrand] = useState(false);

  const supabase = createClient();
  const activeFont = resolveBrandFont(brandFont);

  async function handleSaveBrand() {
    setSavingBrand(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("profiles")
        .update({ brand_color: brandColor, brand_style: brandStyle, brand_font: brandFont })
        .eq("user_id", user!.id);
      if (error) throw error;
      toast.success("Identidad visual actualizada");
    } catch {
      toast.error("Error al guardar la identidad visual");
    } finally {
      setSavingBrand(false);
    }
  }

  const archetypeName = initialQuestionnaire?.personality_archetype as ArchetypeName | undefined;
  const archetype = archetypeName ? ARCHETYPES[archetypeName] : null;

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("questionnaires").upsert({
        user_id: user!.id,
        niche: form.niche,
        offer: form.offer,
        content_style: form.content_style,
        brand_blueprint: {
          tone: form.tone,
          values: form.values,
          target_audience: form.target_audience,
          content_pillars: form.content_pillars,
        },
        completed_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success("Perfil actualizado");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Arquetipo */}
      {archetype ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: `${archetype.color}18`, border: `1px solid ${archetype.color}30` }}
              >
                {archetype.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-0.5"
                  style={{ color: archetype.color }}
                >
                  Tu arquetipo de marca personal
                </p>
                <p className="font-bold text-gray-900 text-lg leading-tight">{archetype.name}</p>
                <p className="text-sm text-gray-500 truncate">{archetype.tagline}</p>
              </div>
              <Link href="/personality">
                <Button variant="outline" size="sm" className="flex-shrink-0 gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Rehacer test
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900">Arquetipo de marca personal</p>
                <p className="text-sm text-gray-500 mt-0.5">Todavía no completaste el test de arquetipo</p>
              </div>
              <Link href="/personality">
                <Button size="sm" style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }} className="text-white">
                  Hacer el test
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Perfil de cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Nombre</Label>
            <p className="text-sm font-medium mt-1">{profile?.full_name}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Tipo de cuenta</Label>
            <p className="text-sm font-medium mt-1 capitalize">{profile?.role === "coach" ? "Coach" : "Cliente"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4" style={{ color: "#1A6FFF" }} strokeWidth={1.8} />
            Identidad visual de marca
          </CardTitle>
          <CardDescription>
            Define el color, estilo y tipografía de tu marca personal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Color de marca</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="h-9 w-11 rounded-md border border-input cursor-pointer bg-transparent p-0.5"
                />
                <Input
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="text-sm font-mono"
                  maxLength={7}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estilo</Label>
              <Select value={brandStyle} onValueChange={(v) => setBrandStyle(v as "dark" | "light")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="light">Claro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipografía de titulares</Label>
            <div className="grid grid-cols-2 gap-2">
              {BRAND_FONT_LIST.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setBrandFont(f.id)}
                  className={cn(
                    "text-left px-3 py-2.5 rounded-xl border transition-all duration-150",
                    brandFont === f.id
                      ? "border-transparent shadow-sm"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  )}
                  style={brandFont === f.id ? { background: `${brandColor}0d`, border: `1.5px solid ${brandColor}40` } : {}}
                >
                  <p
                    className="text-base leading-tight truncate"
                    style={{
                      fontFamily: f.family,
                      fontWeight: f.weight,
                      textTransform: f.uppercase ? "uppercase" : "none",
                      color: brandFont === f.id ? brandColor : "#1F2937",
                    }}
                  >
                    {f.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{f.vibe}</p>
                </button>
              ))}
            </div>
          </div>

          <div
            className="rounded-xl p-4 flex items-center gap-3"
            style={{
              background: brandStyle === "dark" ? "#0A0A0C" : "#FAFAF8",
              border: `1px solid ${brandStyle === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            }}
          >
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: brandColor }}
            >
              {(profile?.full_name || "TU")
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <p
                className="text-sm leading-tight"
                style={{
                  color: brandStyle === "dark" ? "#fff" : "#0F172A",
                  fontFamily: activeFont.family,
                  fontWeight: activeFont.weight,
                  textTransform: activeFont.uppercase ? "uppercase" : "none",
                }}
              >
                Así se va a ver tu marca
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: brandStyle === "dark" ? "rgba(255,255,255,0.5)" : "rgba(15,23,42,0.5)" }}
              >
                Vista previa del color, estilo y tipografía elegidos
              </p>
            </div>
          </div>

          <Button onClick={handleSaveBrand} disabled={savingBrand}>
            {savingBrand ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar identidad visual
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blueprint de marca personal</CardTitle>
          <CardDescription>
            Esta información se usa como contexto en todos los módulos de IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nicho / Industria</Label>
            <Input value={form.niche} onChange={(e) => update("niche", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Oferta principal</Label>
            <Textarea value={form.offer} onChange={(e) => update("offer", e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Estilo de contenido actual</Label>
            <Textarea value={form.content_style} onChange={(e) => update("content_style", e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tono de comunicación</Label>
              <Input value={form.tone} onChange={(e) => update("tone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Valores de marca</Label>
              <Input value={form.values} onChange={(e) => update("values", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Cliente ideal</Label>
              <Input value={form.target_audience} onChange={(e) => update("target_audience", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Pilares de contenido</Label>
              <Input value={form.content_pillars} onChange={(e) => update("content_pillars", e.target.value)} />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar cambios
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
