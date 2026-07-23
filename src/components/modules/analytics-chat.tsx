"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { AnalyticsChat } from "@/lib/supabase/types";

export function AnalyticsChat() {
  const [chats, setChats] = useState<AnalyticsChat[]>([]);
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadHistory() {
      try {
        const res = await fetch("/api/analytics/chat");
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
  }, []);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setInput("");
    setChats((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, user_id: "", role: "user", message: trimmed, created_at: new Date().toISOString() },
    ]);
    try {
      const res = await fetch("/api/analytics/chat", {
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
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Chat de análisis con IA
        </CardTitle>
        <CardDescription>
          Pregúntale sobre toda tu actividad: guiones, videos virales de referencia y análisis de métricas guardados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loadingHistory ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {chats.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Pregúntale cosas como &quot;¿qué videos funcionaron mejor?&quot; o &quot;¿cómo puedo mejorar mi
                contenido con base en estos resultados?&quot;.
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
            placeholder="Pregúntale algo sobre tu actividad y resultados..."
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
      </CardContent>
    </Card>
  );
}
