"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FaArrowRight,
  FaLock,
  FaCircleExclamation,
  FaXmark,
  FaKey,
} from "react-icons/fa6";
import { Navbar } from "@/components/ui/navbar";
import { Reveal } from "@/components/ui/motion-presets";
import { SectionBg } from "@/components/ui/section-bg";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("email not confirmed")) {
        setErrorMsg(
          "Your email has not been confirmed yet. Please check your inbox for the verification link."
        );
      } else if (msg.includes("invalid login credentials") || msg.includes("invalid")) {
        setErrorMsg("Incorrect email or password. Please try again.");
      } else {
        setErrorMsg(error.message);
      }
      return;
    }

    // Check role to decide where to redirect
    const isAdminUser =
      email.trim() === "dennissabu444@gmail.com" ||
      data.user.email === "dennissabu444@gmail.com";

    let userRole = isAdminUser ? "admin" : "user";
    if (!isAdminUser) {
      try {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();
        if (profile?.role) userRole = profile.role;
      } catch {
        // Default to user role if profile read is restricted
      }
    }

    // If there's a ?next= param, respect it; otherwise role-based redirect
    const next = searchParams.get("next");
    if (next) {
      router.push(next);
    } else if (userRole === "admin") {
      router.push("/admin");
    } else {
      router.push("/browse");
    }
    router.refresh();
  }

  async function handleForgotPassword() {
    if (!forgotEmail.includes("@")) {
      setErrorMsg("Please enter a valid email.");
      return;
    }
    setForgotLoading(true);
    await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    setForgotLoading(false);
    setForgotSent(true);
  }

  return (
    <Reveal>
      <div className="rounded-[28px] border border-white/70 bg-white/65 p-8 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_24px_60px_-12px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-2xl">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-slate-950 text-white shadow-[0_8px_24px_-8px_rgba(15,23,42,0.45)]">
          <FaLock className="size-4" />
        </div>

        <h1 className="mt-5 text-center text-3xl font-medium leading-[1.05] tracking-[-0.04em] text-slate-950">
          Welcome back.
        </h1>
        <p className="mt-2 text-center text-sm text-pretty text-slate-600">
          Sign in to access NotesHub academic study materials.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              <FaCircleExclamation className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Email address
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@college.edu"
              autoComplete="email"
              required
              className="mt-1.5 block w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900/30 focus:ring-2 focus:ring-slate-900/10"
            />
          </label>

          <label className="block">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Password
              </span>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 hover:underline underline-offset-2"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="mt-1.5 block w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900/30 focus:ring-2 focus:ring-slate-900/10"
            />
          </label>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.96 }}
            className="group mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-[0_10px_30px_-10px_rgba(15,23,42,0.5)] transition-colors hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="size-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <FaArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-slate-900 underline-offset-2 hover:underline"
          >
            Create one
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
              onClick={() => {
                setShowForgotModal(false);
                setForgotSent(false);
              }}
            />
            <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <FaKey className="size-4 text-amber-500" />
                  Reset Password
                </div>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  className="text-slate-400 hover:text-slate-900"
                >
                  <FaXmark className="size-4" />
                </button>
              </div>

              {forgotSent ? (
                <div className="py-6 text-center">
                  <p className="text-xs leading-relaxed text-emerald-700">
                    A password reset link has been sent to{" "}
                    <strong>{forgotEmail}</strong>. Check your inbox.
                  </p>
                  <button
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotSent(false);
                    }}
                    className="mt-4 rounded-full bg-slate-950 px-5 py-2 text-xs font-semibold text-white"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <p className="text-xs text-slate-600">
                    Enter your college email and we&apos;ll send a reset link.
                  </p>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="block w-full rounded-2xl border border-slate-200 p-3 text-xs font-medium text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleForgotPassword}
                      disabled={forgotLoading}
                      className="rounded-full bg-slate-950 px-5 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      {forgotLoading ? "Sending…" : "Send Reset Link"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </Reveal>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-slate-950 antialiased">
      <Navbar />
      <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-200 via-emerald-100 to-white py-24">
        <SectionBg />
        <div className="relative z-10 mx-auto w-full max-w-md px-6">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
