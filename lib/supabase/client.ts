import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in Client Components ("use client").
 * Uses the publishable anon key — safe to expose to the browser.
 *
 * During SSR / static prerendering (build time) the NEXT_PUBLIC_ env vars may
 * not be embedded yet. In that case we return null so that the server render
 * completes without crashing. The actual data-fetching only happens in the
 * browser where the vars are always available.
 *
 * Usage:
 *   const supabase = createClient();
 *   const { data } = await supabase.from("academic_notes").select("*");
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // During SSR / static prerendering the vars aren't embedded yet.
  // Return null so the server render doesn't crash; hooks will re-run
  // on the client where the real values are present.
  if (!supabaseUrl || !supabaseKey) {
    if (typeof window === "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return null as any;
    }
    throw new Error(
      "Missing Supabase environment variables. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "in your Vercel project settings."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
