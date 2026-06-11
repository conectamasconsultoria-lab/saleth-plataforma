"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, BookOpen } from "lucide-react";
import type { CoachPrompt } from "@/lib/supabase/types";

type Props = { prompts: CoachPrompt[] };

export function PromptsClientView({ prompts }: Props) {
  function copyPrompt(text: string, title: string) {
    navigator.clipboard.writeText(text);
    toast.success(`"${title}" copiado al portapapeles`);
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p className="font-medium">Aún no hay prompts disponibles</p>
        <p className="text-sm mt-1">Tu coach los irá agregando próximamente</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Estos prompts fueron creados por tu coach. Copiálos y usálos en ChatGPT o Claude para potenciar tu contenido.
      </p>
      <div className="space-y-4">
        {prompts.map((prompt, index) => (
          <Card key={prompt.id} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <CardTitle className="text-base">{prompt.title}</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyPrompt(prompt.prompt_text, prompt.title)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {prompt.explanation && (
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">📌 Cómo usar este prompt</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{prompt.explanation}</p>
                </div>
              )}
              <div className="rounded-lg bg-muted p-4 relative group">
                <p className="text-sm font-mono whitespace-pre-wrap">{prompt.prompt_text}</p>
                <button
                  onClick={() => copyPrompt(prompt.prompt_text, prompt.title)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-background border"
                  title="Copiar"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
