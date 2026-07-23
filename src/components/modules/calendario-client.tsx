"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  Megaphone,
  Heart,
  ShoppingCart,
  Calendar,
  Clock,
  Edit3,
  X,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  FileText,
  Lightbulb,
  ClipboardList,
  Send,
  Zap,
  Flame,
  Rocket,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarPost } from "@/lib/supabase/types";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const CONTENT_TYPES = [
  { value: "atraccion", label: "Atracción", icon: Megaphone, color: "#8B5CF6", bg: "#F5F3FF", border: "#DDD6FE", badge: "bg-violet-100 text-violet-700" },
  { value: "nutricion", label: "Nutrición", icon: Heart, color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", badge: "bg-blue-100 text-blue-700" },
  { value: "venta", label: "Venta", icon: ShoppingCart, color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", badge: "bg-emerald-100 text-emerald-700" },
] as const;

const PLATFORMS = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "otro", label: "Otro" },
];

const STATUSES = [
  { value: "idea", label: "Idea", icon: Lightbulb, color: "text-gray-500", bg: "bg-gray-100" },
  { value: "planned", label: "Planificado", icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-100" },
  { value: "draft", label: "Borrador", icon: FileText, color: "text-amber-600", bg: "bg-amber-100" },
  { value: "published", label: "Publicado", icon: Send, color: "text-emerald-600", bg: "bg-emerald-100" },
];

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const days: { date: Date; key: string; isCurrentMonth: boolean }[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, key: formatDateKey(d), isCurrentMonth: false });
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push({ date: d, key: formatDateKey(d), isCurrentMonth: true });
  }

  while (days.length % 7 !== 0 || days.length < 35) {
    const nextDay = days.length - startOffset - lastDay.getDate() + 1;
    const d = new Date(year, month + 1, nextDay);
    days.push({ date: d, key: formatDateKey(d), isCurrentMonth: false });
  }

  return days;
}

function getContentTypeMeta(type: string) {
  return CONTENT_TYPES.find((t) => t.value === type) || CONTENT_TYPES[0];
}

function getStatusMeta(status: string) {
  return STATUSES.find((s) => s.value === status) || STATUSES[1];
}

// ─── Planes de publicación ────────────────────────────────────────────────────

type ContentType = CalendarPost["content_type"];

const PLANS = [
  {
    id: "basico" as const,
    label: "Básico",
    postsPerWeek: 3,
    icon: Zap,
    days: "Lunes · Miércoles · Viernes",
    description: "Ideal para empezar sin abrumarte. Crea el hábito de publicar con consistencia.",
    distribution: "2 Atracción · 1 Nutrición · Venta quincenal",
    color: "border-blue-200 hover:border-blue-400",
    activeColor: "border-blue-500 ring-2 ring-blue-500/20",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    id: "intermedio" as const,
    label: "Intermedio",
    postsPerWeek: 7,
    icon: Flame,
    days: "Todos los días",
    description: "Para acelerar resultados. 1 video diario aumenta tu alcance y construye autoridad.",
    distribution: "4 Atracción · 2 Nutrición · 1 Venta",
    color: "border-orange-200 hover:border-orange-400",
    activeColor: "border-orange-500 ring-2 ring-orange-500/20",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    id: "avanzado" as const,
    label: "Avanzado",
    postsPerWeek: 14,
    icon: Rocket,
    days: "2 videos por día",
    description: "Para dominar la atención del mercado y posicionarte agresivamente.",
    distribution: "8 Atracción · 4 Nutrición · 2 Venta",
    color: "border-red-200 hover:border-red-400",
    activeColor: "border-red-500 ring-2 ring-red-500/20",
    gradient: "from-red-500 to-red-600",
  },
];

function getPostsForDay(planId: string, dayOfWeek: number, weekNumber: number): ContentType[] {
  const isOddWeek = weekNumber % 2 === 1;

  switch (planId) {
    case "basico":
      // Mon=0, Wed=2, Fri=4
      if (dayOfWeek === 0) return ["atraccion"];
      if (dayOfWeek === 2) return isOddWeek ? ["atraccion"] : ["nutricion"];
      if (dayOfWeek === 4) return isOddWeek ? ["venta"] : ["atraccion"];
      return [];
    case "intermedio":
      // Every day: Mon-Sat mostly atracción+nutrición, Sun venta
      return [
        (["atraccion", "atraccion", "nutricion", "atraccion", "atraccion", "nutricion", "venta"] as ContentType[])[dayOfWeek],
      ];
    case "avanzado":
      // 2 per day
      return ([
        ["atraccion", "nutricion"],
        ["atraccion", "atraccion"],
        ["atraccion", "nutricion"],
        ["atraccion", "atraccion"],
        ["nutricion", "venta"],
        ["atraccion", "atraccion"],
        ["atraccion", "venta"],
      ] as ContentType[][])[dayOfWeek];
    default:
      return [];
  }
}

const CONTENT_LABELS: Record<ContentType, string> = {
  atraccion: "Contenido de atracción",
  nutricion: "Contenido de nutrición",
  venta: "Contenido de venta",
};

type Props = {
  initialPosts: CalendarPost[];
};

type FormState = {
  title: string;
  content_type: CalendarPost["content_type"];
  platform: string;
  time: string;
  status: CalendarPost["status"];
  notes: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  content_type: "atraccion",
  platform: "tiktok",
  time: "",
  status: "planned",
  notes: "",
};

export function CalendarioClient({ initialPosts }: Props) {
  const today = new Date();
  const todayKey = formatDateKey(today);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [posts, setPosts] = useState<CalendarPost[]>(initialPosts);
  const [selectedDate, setSelectedDate] = useState<string | null>(todayKey);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<CalendarPost | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState<string | null>(null);

  const supabase = createClient();
  const fetchedMonths = useRef<Set<string>>(new Set([`${today.getFullYear()}-${today.getMonth()}`]));

  const fetchPostsForMonth = useCallback(async (year: number, month: number) => {
    const monthKey = `${year}-${month}`;
    if (fetchedMonths.current.has(monthKey)) return;
    fetchedMonths.current.add(monthKey);

    setLoadingMonth(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const pad = (n: number) => String(n).padStart(2, "0");
      const lastDay = new Date(year, month + 1, 0).getDate();
      const from = `${year}-${pad(month + 1)}-01`;
      const to = `${year}-${pad(month + 1)}-${pad(lastDay)}`;

      const { data } = await supabase
        .from("calendar_posts")
        .select("*")
        .eq("user_id", user!.id)
        .gte("date", from)
        .lte("date", to)
        .order("date", { ascending: true })
        .order("display_order", { ascending: true });

      if (data && data.length > 0) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newPosts = data.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
      }
    } catch {
      // silently fail, user can retry by navigating again
      fetchedMonths.current.delete(monthKey);
    } finally {
      setLoadingMonth(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchPostsForMonth(currentYear, currentMonth);
  }, [currentYear, currentMonth, fetchPostsForMonth]);

  const calendarDays = useMemo(
    () => getCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const postsByDate = useMemo(() => {
    const map: Record<string, CalendarPost[]> = {};
    posts.forEach((p) => {
      if (!map[p.date]) map[p.date] = [];
      map[p.date].push(p);
    });
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => {
        if (a.display_order !== b.display_order) return a.display_order - b.display_order;
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time) return -1;
        if (b.time) return 1;
        return 0;
      })
    );
    return map;
  }, [posts]);

  const selectedPosts = selectedDate ? (postsByDate[selectedDate] || []) : [];

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  }

  function goToToday() {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(todayKey);
  }

  function openAddForm() {
    setEditingPost(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEditForm(post: CalendarPost) {
    setEditingPost(post);
    setForm({
      title: post.title,
      content_type: post.content_type,
      platform: post.platform,
      time: post.time || "",
      status: post.status,
      notes: post.notes || "",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingPost(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!form.title.trim()) { toast.error("El título es obligatorio"); return; }
    if (!selectedDate) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (editingPost) {
        const { data, error } = await supabase
          .from("calendar_posts")
          .update({
            title: form.title.trim(),
            content_type: form.content_type,
            platform: form.platform,
            time: form.time || null,
            status: form.status,
            notes: form.notes.trim() || null,
          })
          .eq("id", editingPost.id)
          .select()
          .single();
        if (error) throw error;
        setPosts((prev) => prev.map((p) => (p.id === editingPost.id ? data : p)));
        toast.success("Publicación actualizada");
      } else {
        const maxOrder = selectedPosts.reduce((max, p) => Math.max(max, p.display_order), -1);
        const { data, error } = await supabase
          .from("calendar_posts")
          .insert({
            user_id: user!.id,
            date: selectedDate,
            title: form.title.trim(),
            content_type: form.content_type,
            platform: form.platform,
            time: form.time || null,
            status: form.status,
            notes: form.notes.trim() || null,
            display_order: maxOrder + 1,
          })
          .select()
          .single();
        if (error) throw error;
        setPosts((prev) => [...prev, data]);
        toast.success("Publicación agregada");
      }
      closeForm();
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(postId: string) {
    const { error } = await supabase.from("calendar_posts").delete().eq("id", postId);
    if (error) { toast.error("Error al eliminar"); return; }
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    toast.success("Publicación eliminada");
  }

  async function handleReorder(postId: string, direction: "up" | "down") {
    const dayPosts = [...selectedPosts];
    const idx = dayPosts.findIndex((p) => p.id === postId);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= dayPosts.length) return;

    [dayPosts[idx], dayPosts[swapIdx]] = [dayPosts[swapIdx], dayPosts[idx]];

    const updates = dayPosts.map((p, i) => ({ id: p.id, display_order: i }));
    const updatedPosts = posts.map((p) => {
      const u = updates.find((up) => up.id === p.id);
      return u ? { ...p, display_order: u.display_order } : p;
    });
    setPosts(updatedPosts);

    for (const u of updates) {
      await supabase.from("calendar_posts").update({ display_order: u.display_order }).eq("id", u.id);
    }
  }

  async function handleStatusToggle(post: CalendarPost) {
    const order: CalendarPost["status"][] = ["idea", "planned", "draft", "published"];
    const currentIdx = order.indexOf(post.status);
    const nextStatus = order[(currentIdx + 1) % order.length];

    const { error } = await supabase.from("calendar_posts").update({ status: nextStatus }).eq("id", post.id);
    if (error) { toast.error("Error al actualizar estado"); return; }
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, status: nextStatus } : p)));
  }

  async function handleApplyPlan(planId: string) {
    setGeneratingPlan(planId);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast.error("Sesión expirada — recarga la página");
        return;
      }

      const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
      const pad = (n: number) => String(n).padStart(2, "0");

      let weekCounter = 0;
      let lastWeekDay = -1;

      const newPosts: {
        user_id: string;
        date: string;
        title: string;
        content_type: ContentType;
        platform: string;
        status: string;
        display_order: number;
      }[] = [];

      for (let day = 1; day <= lastDay; day++) {
        const d = new Date(currentYear, currentMonth, day);
        let dow = d.getDay() - 1;
        if (dow < 0) dow = 6;

        if (dow === 0 && lastWeekDay === 6) weekCounter++;
        lastWeekDay = dow;

        const dateKey = `${currentYear}-${pad(currentMonth + 1)}-${pad(day)}`;

        if (postsByDate[dateKey]?.length) continue;

        const types = getPostsForDay(planId, dow, weekCounter);
        types.forEach((ct, i) => {
          newPosts.push({
            user_id: user.id,
            date: dateKey,
            title: CONTENT_LABELS[ct],
            content_type: ct,
            platform: "tiktok",
            status: "idea",
            display_order: i,
          });
        });
      }

      if (newPosts.length === 0) {
        toast.info("Todos los días del mes ya tienen publicaciones");
        return;
      }

      // Insert in batches of 20 to avoid potential limits
      const allInserted: CalendarPost[] = [];
      for (let i = 0; i < newPosts.length; i += 20) {
        const batch = newPosts.slice(i, i + 20);
        const { data, error } = await supabase
          .from("calendar_posts")
          .insert(batch)
          .select();

        if (error) {
          console.error("Supabase insert error:", error);
          throw new Error(error.message);
        }
        if (data) allInserted.push(...data);
      }

      setPosts((prev) => [...prev, ...allInserted]);
      toast.success(`${allInserted.length} publicaciones sugeridas agregadas`);
      setShowPlans(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      toast.error(`Error al generar el plan: ${msg}`);
    } finally {
      setGeneratingPlan(null);
    }
  }

  function formatSelectedDate(dateStr: string) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    return `${dayNames[date.getDay()].charAt(0).toUpperCase() + dayNames[date.getDay()].slice(1)} ${d} de ${MONTHS[m - 1]}`;
  }

  // ── Stats for current month ─────────────────────────────────────────────
  const monthPosts = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    return posts.filter((p) => p.date.startsWith(prefix));
  }, [posts, currentYear, currentMonth]);

  const stats = useMemo(() => ({
    total: monthPosts.length,
    atraccion: monthPosts.filter((p) => p.content_type === "atraccion").length,
    nutricion: monthPosts.filter((p) => p.content_type === "nutricion").length,
    venta: monthPosts.filter((p) => p.content_type === "venta").length,
    published: monthPosts.filter((p) => p.status === "published").length,
  }), [monthPosts]);

  return (
    <div className="space-y-5">
      {/* Month navigation + stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <button onClick={prevMonth} className="h-9 w-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={goToToday} className="px-4 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg transition-colors min-w-[160px] text-center">
              {MONTHS[currentMonth]} {currentYear}
            </button>
            <button onClick={nextMonth} className="h-9 w-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Monthly stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 font-medium">{stats.total} posts</span>
          <div className="flex items-center gap-1.5">
            {CONTENT_TYPES.map((ct) => {
              const count = stats[ct.value as keyof typeof stats] as number;
              if (count === 0) return null;
              return (
                <span key={ct.value} className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", ct.badge)}>
                  {ct.label} {count}
                </span>
              );
            })}
          </div>
          {stats.published > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {stats.published} publicados
            </span>
          )}
        </div>
      </div>

      {/* Plan selector */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPlans((v) => !v)}
          className={cn("gap-1.5 rounded-xl text-xs transition-all", showPlans && "ring-2 ring-blue-500/20 border-blue-400")}
        >
          <Wand2 className="h-3.5 w-3.5" style={{ color: "#1A6FFF" }} />
          Sugerir plan de publicación
        </Button>
        {showPlans && (
          <span className="text-[11px] text-gray-400">Elige tu ritmo y el calendario se llena automáticamente</span>
        )}
      </div>

      {showPlans && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isGenerating = generatingPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={cn(
                  "rounded-2xl border-2 bg-white p-4 transition-all duration-200",
                  plan.color,
                )}
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                    <Icon className="h-4 w-4 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{plan.label}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{plan.postsPerWeek} videos/semana</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-2">{plan.description}</p>
                <p className="text-[10px] text-gray-400 mb-1">{plan.days}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {plan.distribution.split(" · ").map((d) => {
                    const isA = d.includes("Atracción");
                    const isN = d.includes("Nutrición");
                    return (
                      <span
                        key={d}
                        className={cn(
                          "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                          isA ? "bg-violet-100 text-violet-700" : isN ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                        )}
                      >
                        {d}
                      </span>
                    );
                  })}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleApplyPlan(plan.id)}
                  disabled={!!generatingPlan}
                  className="w-full gap-1.5 text-white text-xs h-8"
                  style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}
                >
                  {isGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Calendar className="h-3.5 w-3.5" />
                  )}
                  {isGenerating ? "Generando..." : `Aplicar a ${MONTHS[currentMonth]}`}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar grid */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {WEEKDAYS.map((day) => (
                <div key={day} className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {calendarDays.map(({ key, date, isCurrentMonth }) => {
                const dayPosts = postsByDate[key] || [];
                const isToday = key === todayKey;
                const isSelected = key === selectedDate;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(key)}
                    className={cn(
                      "relative h-20 sm:h-24 p-1.5 border-b border-r border-gray-50 text-left transition-all duration-150 hover:bg-blue-50/30",
                      !isCurrentMonth && "opacity-30",
                      isSelected && "ring-2 ring-inset ring-blue-500/40 bg-blue-50/50",
                    )}
                  >
                    <span className={cn(
                      "text-xs font-medium inline-flex items-center justify-center h-6 w-6 rounded-full",
                      isToday ? "text-white font-bold" : "text-gray-600",
                    )}
                      style={isToday ? { background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" } : {}}
                    >
                      {date.getDate()}
                    </span>

                    {/* Post indicators */}
                    {dayPosts.length > 0 && (
                      <div className="mt-0.5 flex flex-col gap-0.5">
                        {dayPosts.slice(0, 3).map((post) => {
                          const meta = getContentTypeMeta(post.content_type);
                          return (
                            <div
                              key={post.id}
                              className="h-1.5 rounded-full"
                              style={{ background: meta.color }}
                              title={post.title}
                            />
                          );
                        })}
                        {dayPosts.length > 3 && (
                          <span className="text-[9px] text-gray-400 font-medium leading-none">+{dayPosts.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 px-1">
            {CONTENT_TYPES.map((ct) => (
              <div key={ct.value} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: ct.color }} />
                <span className="text-[11px] text-gray-400">{ct.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="lg:col-span-1">
          {selectedDate ? (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              {/* Day header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{formatSelectedDate(selectedDate)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {selectedPosts.length === 0 ? "Sin publicaciones" : `${selectedPosts.length} publicaci${selectedPosts.length === 1 ? "ón" : "ones"}`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={openAddForm}
                    className="gap-1 text-white text-xs h-8"
                    style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}
                  >
                    <Plus className="h-3.5 w-3.5" /> Agregar
                  </Button>
                </div>
              </div>

              {/* Add/Edit form */}
              {showForm && (
                <div className="p-4 border-b border-gray-100 space-y-3" style={{ background: "#FAFBFF" }}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-600">{editingPost ? "Editar publicación" : "Nueva publicación"}</p>
                    <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Título *</Label>
                    <Input
                      placeholder="¿De qué trata esta publicación?"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Tipo</Label>
                      <Select value={form.content_type} onValueChange={(v) => setForm((f) => ({ ...f, content_type: v as typeof f.content_type }))}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CONTENT_TYPES.map((ct) => (
                            <SelectItem key={ct.value} value={ct.value}>
                              <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full" style={{ background: ct.color }} />
                                {ct.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Plataforma</Label>
                      <Select value={form.platform} onValueChange={(v) => setForm((f) => ({ ...f, platform: v }))}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PLATFORMS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Hora (opcional)</Label>
                      <Input
                        type="time"
                        value={form.time}
                        onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Estado</Label>
                      <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as typeof f.status }))}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Notas (opcional)</Label>
                    <Input
                      placeholder="Ideas, guión a usar, referencia..."
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" onClick={handleSave} disabled={saving} className="flex-1 gap-1 text-white text-xs h-8" style={{ background: "linear-gradient(135deg, #1A6FFF, #00C8FF)" }}>
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      {editingPost ? "Actualizar" : "Guardar"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={closeForm} className="text-xs h-8">Cancelar</Button>
                  </div>
                </div>
              )}

              {/* Posts list */}
              <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
                {selectedPosts.length === 0 && !showForm ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-3" style={{ background: "#EFF6FF" }}>
                      <Calendar className="h-5 w-5" style={{ color: "#1A6FFF" }} strokeWidth={1.5} />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Sin publicaciones</p>
                    <p className="text-gray-400 text-xs mt-1">Agrega tu primera publicación para este día</p>
                  </div>
                ) : (
                  selectedPosts.map((post, idx) => {
                    const typeMeta = getContentTypeMeta(post.content_type);
                    const statusMeta = getStatusMeta(post.status);
                    const StatusIcon = statusMeta.icon;
                    const platform = PLATFORMS.find((p) => p.value === post.platform);

                    return (
                      <div key={post.id} className="p-3 group hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-start gap-2.5">
                          {/* Color stripe */}
                          <div className="w-1 h-full min-h-[40px] rounded-full flex-shrink-0 mt-0.5" style={{ background: typeMeta.color }} />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <p className="text-sm font-medium text-gray-900 leading-snug">{post.title}</p>
                              {/* Actions */}
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                {idx > 0 && (
                                  <button onClick={() => handleReorder(post.id, "up")} className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                                    <ArrowUp className="h-3 w-3" />
                                  </button>
                                )}
                                {idx < selectedPosts.length - 1 && (
                                  <button onClick={() => handleReorder(post.id, "down")} className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                                    <ArrowDown className="h-3 w-3" />
                                  </button>
                                )}
                                <button onClick={() => openEditForm(post)} className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                                  <Edit3 className="h-3 w-3" />
                                </button>
                                <button onClick={() => handleDelete(post.id)} className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-red-600 hover:bg-red-50">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 font-semibold border-0", typeMeta.badge)}>
                                {typeMeta.label}
                              </Badge>
                              {post.time && (
                                <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                  <Clock className="h-3 w-3" /> {post.time}
                                </span>
                              )}
                              {platform && (
                                <span className="text-[10px] text-gray-400">{platform.label}</span>
                              )}
                              <button
                                onClick={() => handleStatusToggle(post)}
                                className={cn("text-[10px] font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded-full transition-colors", statusMeta.bg, statusMeta.color)}
                                title="Clic para cambiar estado"
                              >
                                <StatusIcon className="h-3 w-3" /> {statusMeta.label}
                              </button>
                            </div>

                            {post.notes && (
                              <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">{post.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <Calendar className="h-8 w-8 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 text-sm font-medium">Selecciona un día</p>
              <p className="text-gray-400 text-xs mt-1">Haz clic en un día del calendario para ver o agregar publicaciones</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
