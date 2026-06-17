"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Loader2, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Questionnaire } from "@/lib/supabase/types";
import { ARCHETYPES } from "@/lib/archetypes";
import type { ArchetypeName } from "@/lib/archetypes";

type Props = {
  initialQuestionnaire: Questionnaire | null;
  profile: { full_name: string; role: string } | null;
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
  const supabase = createClient();

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
