"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export function ApproveButtonClient({
  userId,
  clientName,
  approved,
  label,
}: {
  userId: string;
  clientName: string;
  approved: boolean;
  label: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, approved }),
    });

    if (res.ok) {
      toast.success(
        approved
          ? `${clientName || "Cliente"} aprobado`
          : `Acceso revocado para ${clientName || "cliente"}`
      );
      router.refresh();
    } else {
      toast.error("Error al actualizar");
    }
    setLoading(false);
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      size="sm"
      variant={approved ? "default" : "outline"}
      className="w-full"
    >
      {loading ? (
        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
      ) : approved ? (
        <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
      ) : (
        <XCircle className="mr-2 h-3.5 w-3.5" />
      )}
      {label}
    </Button>
  );
}
