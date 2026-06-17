import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rutas públicas
  if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/pending")) {
    if (user && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return supabaseResponse;
  }

  // Rutas protegidas — redirigir a login si no hay sesión
  if (!user && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Ruta de onboarding
  if (!user && pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verificar aprobación para rutas protegidas (dashboard, onboarding)
  if (user && (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding"))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_approved")
      .eq("user_id", user.id)
      .single();

    // Coach siempre tiene acceso
    if (profile?.role === "coach") {
      return supabaseResponse;
    }

    // Clientes no aprobados van a /pending
    if (!profile?.is_approved) {
      return NextResponse.redirect(new URL("/pending", request.url));
    }

    // Rutas solo para coach
    if (pathname.startsWith("/dashboard/admin")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
