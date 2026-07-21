"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Script, ScriptEdit } from "@/lib/supabase/types";

type Props = {
  scriptId: string;
  onScriptUpdated: (script: Script) => void;
};

const QUICK_SUGGESTIONS = [
  "Hazlo más corto",
  "Dale un tono más profesional",
  "Hazlo más persuasivo",
  "Agrega un mejor gancho",
  "Cambia el llamado a la acción",
];

export function ScriptEditChat({ scriptId, onScriptUpdated }: Props) {
  const [edits, setEdits] = useState<ScriptEdit[]>([]);
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadHistory() {
      try {
        const res = await fetch(`/api/scripts/${scriptId}/edit`);
        const data = await res.json();
        if (!cancelled && res.ok) setEdits(data.edits ?? []);
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    }
    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [scriptId]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setInput("");
    setEdits((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        script_id: scriptId,
        user_id: "",
        role: "user",
        message: trimmed,
        created_at: new Date().toISOString(),
      },
    ]);
    try {
      const res = await fetch(`/api/scripts/${scriptId}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEdits((prev) => [...prev, data.edit]);
      onScriptUpdated(data.script);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al editar el guión");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-3 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <MessageSquare className="h-4 w-4" />
        Editar con IA
      </div>

      {loadingHistory ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {edits.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Pedile ajustes al guión: &quot;hazlo más corto&quot;, &quot;más persuasivo&quot;, &quot;cambia el CTA&quot;...
            </p>
          )}
          {edits.map((edit) => (
            <div
              key={edit.id}
              className={cn(
                "text-sm rounded-lg px-3 py-2 max-w-[85%]",
                edit.role === "user" ? "bg-primary/10 ml-auto" : "bg-muted mr-auto"
              )}
            >
              {edit.message}
            </div>
          ))}
          {sending && (
            <div className="bg-muted mr-auto rounded-lg px-3 py-2 text-sm flex items-center gap-2 max-w-[85%]">
              <Loader2 className="h-3 w-3 animate-spin" /> Editando...
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {QUICK_SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => sendMessage(s)}
            disabled={sending}
            className="text-xs px-2 py-1 rounded-full border border-border hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ej: hazlo más emocional y que dure menos de 30 segundos"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
        />
        <Button size="sm" onClick={() => sendMessage(input)} disabled={sending || !input.trim()}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
