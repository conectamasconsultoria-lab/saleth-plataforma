"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Video,
  TrendingUp,
  FileText,
  Layers,
  Brain,
  BarChart3,
  Captions,
  BookOpen,
  Users,
  Settings,
  Target,
  Zap,
  ClipboardList,
} from "lucide-react";

type Role = "coach" | "client";

const clientNav = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/estrategia", label: "Estrategia de Marca", icon: Target },
  { href: "/dashboard/viral-scanner", label: "Escáner Viral", icon: TrendingUp },
  { href: "/dashboard/scripts", label: "Guiones", icon: FileText },
  { href: "/dashboard/carousels", label: "Carruseles", icon: Layers },
  { href: "/dashboard/awareness", label: "Nivel de Conciencia", icon: Brain },
  { href: "/dashboard/metrics", label: "Métricas", icon: BarChart3 },
  { href: "/dashboard/transcriptions", label: "Transcripciones", icon: Captions },
  { href: "/dashboard/prompts", label: "Biblioteca de Prompts", icon: BookOpen },
  { href: "/dashboard/referentes", label: "Videos Referentes", icon: Video },
  { href: "/dashboard/mis-referentes", label: "Referentes IA", icon: Zap },
  { href: "/dashboard/auditorias", label: "Auditorías", icon: ClipboardList },
];

const coachOnlyNav = [
  { href: "/dashboard/admin", label: "Gestión de Clientes", icon: Users },
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const nav = role === "coach" ? [...clientNav, ...coachOnlyNav] : clientNav;

  return (
    <aside
      className="hidden md:flex w-64 flex-col"
      style={{ background: "linear-gradient(180deg, #0B1D3E 0%, #0D2154 100%)" }}
    >
      {/* Logo */}
      <div className="flex h-20 items-center justify-center px-6 border-b border-white/10 gap-3">
        <div className="relative h-11 w-11 flex-shrink-0">
          <Image
            src="/logo.jpeg"
            alt="Conecta+"
            fill
            className="object-cover rounded-full ring-2 ring-white/20"
            priority
          />
        </div>
        <span className="text-white font-bold text-lg tracking-wide">Conecta+</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              {/* Contenedor del ícono con gradiente azul */}
              <div
                className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, #1A6FFF, #00C8FF)"
                    : "linear-gradient(135deg, rgba(26,111,255,0.25), rgba(0,200,255,0.15))",
                  boxShadow: isActive
                    ? "0 4px 12px rgba(26,111,255,0.4)"
                    : "none",
                }}
              >
                <Icon
                  className="h-[16px] w-[16px] text-white"
                  strokeWidth={1.8}
                />
              </div>
              <span className="tracking-wide text-[13px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-3 pb-4 border-t border-white/10 pt-3">
        {(() => {
          const isActive = pathname === "/dashboard/settings";
          return (
            <Link
              href="/dashboard/settings"
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <div
                className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, #1A6FFF, #00C8FF)"
                    : "linear-gradient(135deg, rgba(26,111,255,0.25), rgba(0,200,255,0.15))",
                  boxShadow: isActive ? "0 4px 12px rgba(26,111,255,0.4)" : "none",
                }}
              >
                <Settings className="h-[16px] w-[16px] text-white" strokeWidth={1.8} />
              </div>
              <span className="tracking-wide text-[13px]">Configuración</span>
            </Link>
          );
        })()}
      </div>
    </aside>
  );
}
