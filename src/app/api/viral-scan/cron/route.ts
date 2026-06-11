import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cron job diario — escanea videos virales para todos los nichos activos
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Obtener todos los nichos únicos de los cuestionarios
  const { data: questionnaires } = await supabase
    .from("questionnaires")
    .select("niche")
    .not("niche", "is", null);

  const niches = [...new Set((questionnaires || []).map((q) => q.niche).filter(Boolean))];

  let totalNew = 0;

  for (const niche of niches.slice(0, 5)) { // máx 5 nichos por cron
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/viral-scan/auto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
        body: JSON.stringify({ niche }),
      });
      const data = await res.json();
      totalNew += data.count || 0;
    } catch (e) {
      console.error(`Error escaneando nicho "${niche}":`, e);
    }
  }

  return NextResponse.json({ success: true, totalNew, nichesScanned: niches.length });
}
