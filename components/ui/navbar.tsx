"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ArrowRight, LogOut, User } from "lucide-react";
import LogoIcon from "@/assets/logo-icon";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Auth state — read directly from Supabase so it's always accurate
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
      if (user) fetchName(supabase, user);
      setReady(true);
    });

    // Listen for login / logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          await fetchName(supabase, u);
        } else {
          setUserName("");
        }
        setReady(true);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function fetchName(supabase: any, user: SupabaseUser) {
    try {
      const { data } = await supabase
        .from("users")
        .select("name")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.name) {
        setUserName(data.name);
        return;
      }
    } catch {
      // Fall through to fallback
    }
    const fallback =
      (user.user_metadata?.name as string | undefined) ||
      user.email?.split("@")[0] ||
      "Student";
    setUserName(fallback);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUserName("");
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isAdmin =
    user?.email === "dennissabu444@gmail.com" ||
    user?.app_metadata?.role === "admin";

  const navLinks = user
    ? [
        { label: "Home", href: "/" },
        { label: "Browse Notes", href: "/browse" },
        ...(isAdmin ? [{ label: "Admin Console", href: "/admin" }] : []),
        { label: "Upload Notes", href: "/upload" },
        { label: "My Notes", href: "/my-notes" },
        { label: "Bookmarks", href: "/bookmarks" },
        { label: "Profile", href: "/profile" },
      ]
    : [
        { label: "Home", href: "/" },
        { label: "Browse Notes", href: "/browse" },
        { label: "About", href: "/about" },
      ];

  return (
    <header className="fixed inset-x-0 top-4 z-50 mx-auto flex w-[96%] max-w-6xl items-center justify-between px-3 py-2">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "flex w-full items-center justify-between rounded-full border px-4 py-2.5 transition-all duration-300",
          scrolled
            ? "border-slate-200/80 bg-white/90 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.15)] backdrop-blur-2xl"
            : "border-white/50 bg-white/75 shadow-[0_8px_30px_-10px_rgba(15,23,42,0.12)] backdrop-blur-xl"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 pl-2">
          <LogoIcon className="size-7 text-slate-900" />
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-slate-900">
            NotesHub
          </span>
        </Link>

        {/* Center links */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:bg-slate-900/5 hover:text-slate-950",
                pathname === l.href ? "text-slate-950 font-semibold" : "text-slate-600"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right CTAs */}
        <div className="hidden items-center gap-2 md:flex">
          {ready && user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-xs transition-colors hover:bg-white"
              >
                <span className="grid size-6 place-items-center rounded-full bg-slate-950 text-[11px] text-white">
                  <User className="size-3" />
                </span>
                <span className="max-w-[120px] truncate">
                  {userName || user.email?.split("@")[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="grid size-9 place-items-center rounded-full text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : ready && !user ? (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white/60"
              >
                Login
              </Link>
              <motion.div whileTap={{ scale: 0.96 }}>
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-[0_6px_20px_-8px_rgba(15,23,42,0.4)] transition-colors hover:bg-slate-800"
                >
                  Create Account
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </>
          ) : (
            // Loading skeleton — prevents layout shift
            <div className="h-8 w-32 animate-pulse rounded-full bg-slate-200/60" />
          )}
        </div>

        {/* Mobile trigger */}
        <button
          onClick={() => setOpen((s) => !s)}
          aria-label="Toggle menu"
          className="grid size-9 place-items-center rounded-full text-slate-900 transition-colors hover:bg-white/70 md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </motion.div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 top-full mt-2 rounded-3xl border border-white/60 bg-white/85 p-3 shadow-[0_24px_60px_-12px_rgba(15,23,42,0.2)] backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-medium hover:bg-slate-900/5",
                    pathname === l.href ? "text-slate-950 font-semibold" : "text-slate-800"
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-slate-900/10 p-2">
                {user ? (
                  <button
                    onClick={async () => {
                      setOpen(false);
                      await handleLogout();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600"
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="rounded-full px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-900/5"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setOpen(false)}
                      className="rounded-full bg-slate-950 px-4 py-2.5 text-center text-sm font-medium text-white"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
