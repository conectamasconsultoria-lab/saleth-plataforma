"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { MetricChat } from "@/lib/supabase/types";

type Props = { uploadId: string };

export function MetricsChat({ uploadId }: Props) {
  const [chats, setChats] = useState<MetricChat[]>([]);
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadHistory() {
      try {
        const res = await fetch(`/api/metrics/${uploadId}/chat`);
        const data = await res.json();
        if (!cancelled && res.ok) setChats(data.chats ?? []);
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    }
    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [uploadId]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setInput("");
    setChats((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, upload_id: uploadId, user_id: "", role: "user", message: trimmed, created_at: new Date().toISOString() },
    ]);
    try {
      const res = await fetch(`/api/metrics/${uploadId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChats((prev) => [...prev, data.chat]);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al preguntar");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-3 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <MessageSquare className="h-4 w-4" />
        Pregúntale a este análisis
      </div>

      {loadingHistory ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {chats.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Pregúntale cosas como &quot;¿por qué bajó el alcance?&quot; o &quot;qué publicación funcionó mejor&quot;.
            </p>
          )}
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "text-sm rounded-lg px-3 py-2 max-w-[85%] whitespace-pre-wrap",
                chat.role === "user" ? "bg-primary/10 ml-auto" : "bg-muted mr-auto"
              )}
            >
              {chat.message}
            </div>
          ))}
          {sending && (
            <div className="bg-muted mr-auto rounded-lg px-3 py-2 text-sm flex items-center gap-2 max-w-[85%]">
              <Loader2 className="h-3 w-3 animate-spin" /> Pensando...
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregúntale algo sobre este análisis..."
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
