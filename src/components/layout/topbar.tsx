"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";

type Props = {
  user: { name: string; role: string };
};

export function TopBar({ user }: Props) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-white px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-full flex items-center justify-center" style={{background: "linear-gradient(135deg, #1A6FFF, #00C8FF)"}}>
          <User className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-medium text-foreground">{user.name}</span>
        <Badge
          variant="outline"
          className="text-xs border-blue-200 text-blue-700 bg-blue-50"
        >
          {user.role === "coach" ? "Coach" : "Cliente"}
        </Badge>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Salir
      </Button>
    </header>
  );
}
