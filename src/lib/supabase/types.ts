export type UserRole = "coach" | "client";

export type Profile = {
  id: string;
  user_id: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string;
  brand_color?: string;
  brand_style?: "dark" | "light";
  brand_font?: string;
  coach_id?: string; // solo para clientes
  created_at: string;
};

export type Questionnaire = {
  id: string;
  user_id: string;
  niche: string;
  offer: string;
  content_style: string;
  brand_blueprint: {
    tone: string;
    values: string;
    target_audience: string;
    content_pillars: string;
  };
  personality_archetype?: string | null;
  personality_scores?: {
    M: number;
    E: number;
    I: number;
    R: number;
  } | null;
  completed_at: string;
};

export type ViralVideo = {
  id: string;
  tiktok_url: string;
  title: string;
  hashtags: string[];
  niche: string;
  views: number;
  thumbnail_url?: string;
  transcript?: string;
  scanned_at: string;
  source: "auto" | "manual";
  added_by?: string;
};

export type Script = {
  id: string;
  user_id: string;
  viral_video_id?: string;
  title: string;
  hook: string;
  development: string;
  cta: string;
  awareness_level?: "high" | "medium" | "low";
  stage?: "attraction" | "conversion" | "nurturing";
  format?: string;
  duration?: 15 | 30 | 60;
  target_niche?: string;
  structure_key?: string;
  created_at: string;
};

export type ScriptEdit = {
  id: string;
  script_id: string;
  user_id: string;
  role: "user" | "assistant";
  message: string;
  resulting_title?: string;
  resulting_hook?: string;
  resulting_development?: string;
  resulting_cta?: string;
  created_at: string;
};

export type MetricsUpload = {
  id: string;
  user_id: string;
  storage_path: string;
  platform: string;
  insights: string;
  created_at: string;
};

export type MetricChat = {
  id: string;
  upload_id: string;
  user_id: string;
  role: "user" | "assistant";
  message: string;
  created_at: string;
};

export type Transcription = {
  id: string;
  user_id: string;
  video_url?: string;
  source_url?: string;
  source_platform?: "tiktok" | "instagram" | "file" | "link";
  transcript: string;
  created_at: string;
};

export type CoachPrompt = {
  id: string;
  coach_id: string;
  title: string;
  prompt_text: string;
  explanation: string;
  display_order: number;
  visible_to_clients: boolean;
  created_at: string;
  updated_at: string;
};

export type ReferenceVideo = {
  id: string;
  coach_id: string;
  url: string;
  title: string;
  niche: string;
  description?: string;
  created_at: string;
};

export type CalendarPost = {
  id: string;
  user_id: string;
  date: string;
  time: string | null;
  title: string;
  content_type: "atraccion" | "nutricion" | "venta";
  platform: string;
  status: "idea" | "planned" | "draft" | "published";
  notes: string | null;
  script_id: string | null;
  display_order: number;
  created_at: string;
};
