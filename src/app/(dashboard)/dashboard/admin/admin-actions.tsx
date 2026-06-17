"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Copy, Ticket, Trash2 } from "lucide-react";

interface InvitationCode {
  id: string;
  code: string;
  is_active: boolean;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  used_profile: { full_name: string } | null;
}

export function AdminActions() {
  const [codes, setCodes] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function fetchCodes() {
    setLoading(true);
    const res = await fetch("/api/admin/codes");
    const data = await res.json();
    setCodes(data.codes ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchCodes();
  }, []);

  async function generateCode() {
    setGenerating(true);
    const res = await fetch("/api/admin/codes", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      toast.success(`Código generado: ${data.code.code}`);
      fetchCodes();
    } else {
      toast.error("Error al generar código");
    }
    setGenerating(false);
  }

  async function deactivateCode(codeId: string) {
    const res = await fetch("/api/admin/codes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codeId }),
    });
    if (res.ok) {
      toast.success("Código desactivado");
      fetchCodes();
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado al portapapeles");
  }

  const activeCodes = codes.filter((c) => c.is_active && !c.used_by);
  const usedCodes = codes.filter((c) => c.used_by);
  const inactiveCodes = codes.filter((c) => !c.is_active && !c.used_by);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Clientes</h1>
          <p className="text-muted-foreground mt-1">Códigos de invitación y aprobación</p>
        </div>
        <Button onClick={generateCode} disabled={generating}>
          {generating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Generar código
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Códigos de invitación
          </CardTitle>
          <CardDescription>
            {activeCodes.length} disponible{activeCodes.length !== 1 ? "s" : ""} · {usedCodes.length} usado{usedCodes.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : codes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay códigos. Generá uno para invitar clientes.
            </p>
          ) : (
            <div className="space-y-2">
              {activeCodes.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <code className="font-mono text-sm font-bold tracking-wider">{c.code}</code>
                    <Badge variant="default" className="text-xs">Disponible</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => copyCode(c.code)} title="Copiar">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deactivateCode(c.id)} title="Desactivar">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {usedCodes.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-dashed p-3 opacity-60">
                  <div className="flex items-center gap-3">
                    <code className="font-mono text-sm tracking-wider">{c.code}</code>
                    <Badge variant="secondary" className="text-xs">
                      Usado por {c.used_profile?.full_name || "cliente"}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {c.used_at ? new Date(c.used_at).toLocaleDateString("es-AR") : ""}
                  </span>
                </div>
              ))}
              {inactiveCodes.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-dashed p-3 opacity-40">
                  <div className="flex items-center gap-3">
                    <code className="font-mono text-sm tracking-wider line-through">{c.code}</code>
                    <Badge variant="outline" className="text-xs">Desactivado</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
