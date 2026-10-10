import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * proxy.ts — Supabase session refresh + route guard.
 *
 * @supabase/ssr stores auth tokens in cookies. This proxy intercepts every
 * request, refreshes the session if needed, and writes updated cookies back
 * to the response — keeping the user logged in across navigations.
 *
 * Protected routes redirect unauthenticated visitors to /login.
 * /admin additionally requires the "admin" role in public.users.
 */

const PROTECTED_ROUTES = ["/upload", "/my-notes", "/bookmarks", "/profile"];
const ADMIN_ROUTES = ["/admin"];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
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

  // IMPORTANT: do not add logic between createServerClient and getUser —
  // a subtle bug can randomly log users out.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Redirect unauthenticated users away from protected routes ────────────
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  if ((isProtected || isAdmin) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Admin route: check role from DB ──────────────────────────────────────
  if (isAdmin && user) {
    let isAdminUser = user.email === "dennissabu444@gmail.com";
    if (!isAdminUser) {
      try {
        const adminClient = process.env.SUPABASE_SERVICE_ROLE_KEY
          ? createServerClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY,
              { cookies: { getAll: () => [], setAll: () => {} } }
            )
          : supabase;

        const { data: profile } = await adminClient
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        isAdminUser = profile?.role === "admin";
      } catch {
        isAdminUser = false;
      }
    }

    if (!isAdminUser) {
      const browseUrl = request.nextUrl.clone();
      browseUrl.pathname = "/browse";
      return NextResponse.redirect(browseUrl);
    }
  }

  // ── Redirect logged-in users away from auth pages ─────────────────────────
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const browseUrl = request.nextUrl.clone();
    browseUrl.pathname = "/browse";
    return NextResponse.redirect(browseUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static  (static bundle files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - public assets (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
