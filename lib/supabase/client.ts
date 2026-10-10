import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in Client Components ("use client").
 * Uses the publishable anon key — safe to expose to the browser.
 *
 * Usage:
 *   const supabase = createClient();
 *   const { data } = await supabase.from("academic_notes").select("*");
 */
export function createClient() {
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseKey) {
    throw new Error("Missing Supabase public key in environment variables");
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey
  );
}
