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
  BarChart3,
  Captions,
  BookOpen,
  Users,
  Settings,
  Target,
  Zap,
  ClipboardList,
  Calendar,
  FolderOpen,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Role = "coach" | "client";

type NavItem = { href: string; label: string; icon: LucideIcon };
type NavSection = { title: string; items: NavItem[] };

const clientSections: NavSection[] = [
  {
    title: "",
    items: [
      { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
    ],
  },
  {
    title: "Fundamentos",
    items: [
      { href: "/dashboard/estrategia", label: "Estrategia de Marca", icon: Target },
      { href: "/dashboard/auditorias", label: "Auditorías", icon: ClipboardList },
    ],
  },
  {
    title: "Planificar",
    items: [
      { href: "/dashboard/calendario", label: "Calendario", icon: Calendar },
      { href: "/dashboard/formatos", label: "Top Formatos", icon: Trophy },
    ],
  },
  {
    title: "Crear Contenido",
    items: [
      { href: "/dashboard/scripts", label: "Guiones", icon: FileText },
      { href: "/dashboard/viral-scanner", label: "Escáner Viral", icon: TrendingUp },
    ],
  },
  {
    title: "Herramientas",
    items: [
      { href: "/dashboard/metrics", label: "Métricas", icon: BarChart3 },
      { href: "/dashboard/transcriptions", label: "Transcripciones", icon: Captions },
      { href: "/dashboard/mis-referentes", label: "Referentes IA", icon: Zap },
      { href: "/dashboard/referentes", label: "Videos Referentes", icon: Video },
    ],
  },
  {
    title: "Aprender",
    items: [
      { href: "/dashboard/carousels", label: "Carruseles y Stories", icon: Layers },
      { href: "/dashboard/prompts", label: "Biblioteca de Prompts", icon: BookOpen },
      { href: "/dashboard/recursos", label: "Recursos", icon: FolderOpen },
    ],
  },
];

const coachSection: NavSection = {
  title: "Coach",
  items: [
    { href: "/dashboard/admin", label: "Gestión de Clientes", icon: Users },
  ],
};

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const sections = role === "coach" ? [...clientSections, coachSection] : clientSections;

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
        {sections.map((section) => (
          <div key={section.title || "home"}>
            {section.title && (
              <p className="px-3 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
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
          </div>
        ))}
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
