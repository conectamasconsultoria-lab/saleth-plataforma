"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Edit3, Save, X, Eye, EyeOff } from "lucide-react";
import type { CoachPrompt } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";

type Props = { initialPrompts: CoachPrompt[] };

export function PromptsCoachView({ initialPrompts }: Props) {
  const [prompts, setPrompts] = useState<CoachPrompt[]>(initialPrompts);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", prompt_text: "", explanation: "" });

  const supabase = createClient();

  async function handleCreate() {
    if (!form.title || !form.prompt_text) {
      toast.error("Completá el título y el prompt");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("coach_prompts")
        .insert({
          coach_id: user!.id,
          title: form.title,
          prompt_text: form.prompt_text,
          explanation: form.explanation,
          display_order: prompts.length,
          visible_to_clients: true,
        })
        .select()
        .single();
      if (error) throw error;
      setPrompts((prev) => [...prev, data]);
      setForm({ title: "", prompt_text: "", explanation: "" });
      setCreating(false);
      toast.success("Prompt creado");
    } catch (e) {
      toast.error("Error al crear prompt");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("coach_prompts").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar");
      return;
    }
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Prompt eliminado");
  }

  async function handleToggleVisibility(prompt: CoachPrompt) {
    const { error } = await supabase
      .from("coach_prompts")
      .update({ visible_to_clients: !prompt.visible_to_clients })
      .eq("id", prompt.id);
    if (error) { toast.error("Error"); return; }
    setPrompts((prev) => prev.map((p) => p.id === prompt.id ? { ...p, visible_to_clients: !p.visible_to_clients } : p));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{prompts.length} prompt{prompts.length !== 1 ? "s" : ""}</p>
        <Button onClick={() => setCreating(true)} disabled={creating}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo prompt
        </Button>
      </div>

      {/* Formulario de creación */}
      {creating && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Nuevo prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Ej: Prompt para generar gancho de video"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Prompt</Label>
              <Textarea
                placeholder="El texto del prompt que el cliente va a copiar y pegar..."
                value={form.prompt_text}
                onChange={(e) => setForm((f) => ({ ...f, prompt_text: e.target.value }))}
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label>Explicación (opcional)</Label>
              <Textarea
                placeholder="Cómo usar este prompt, en qué contexto, qué resultados esperar..."
                value={form.explanation}
                onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar
              </Button>
              <Button variant="outline" onClick={() => setCreating(false)}>
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de prompts */}
      {prompts.length === 0 && !creating ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aún no creaste ningún prompt</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prompts.map((prompt) => (
            <Card key={prompt.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{prompt.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleVisibility(prompt)}
                      title={prompt.visible_to_clients ? "Visible para clientes" : "Oculto para clientes"}
                    >
                      {prompt.visible_to_clients ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(prompt.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-mono whitespace-pre-wrap">{prompt.prompt_text}</p>
                </div>
                {prompt.explanation && (
                  <p className="text-xs text-muted-foreground">{prompt.explanation}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {prompt.visible_to_clients ? "✅ Visible para clientes" : "🔒 Solo tú lo ves"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
