"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FaArrowRight,
  FaLock,
  FaCircleExclamation,
  FaShieldHalved,
  FaGraduationCap,
  FaXmark,
  FaKey,
} from "react-icons/fa6";
import { Navbar } from "@/components/ui/navbar";
import { Reveal } from "@/components/ui/motion-presets";
import { SectionBg } from "@/components/ui/section-bg";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotesStore } from "@/lib/notes-store";

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, loginAsAdmin, loginAsStudent } = useNotesStore();

  const [email, setEmail] = useState("alex.k@college.edu");
  const [password, setPassword] = useState("password123");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

    setTimeout(() => {
      const loggedUser = loginUser(email);
      setLoading(false);

      if (loggedUser.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/browse");
      }
    }, 600);
  }

  function handleDemoStudent() {
    loginAsStudent();
    router.push("/browse");
  }

  function handleDemoAdmin() {
    loginAsAdmin();
    router.push("/admin");
  }

  return (
    <main className="min-h-screen bg-white font-sans text-slate-950 antialiased">
      <Navbar />

      <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-200 via-emerald-100 to-white py-24">
        <SectionBg />

        <div className="relative z-10 mx-auto w-full max-w-md px-6">
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

              {/* Demo Quick Logins for Testing */}
              <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                  onClick={handleDemoStudent}
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white/80 py-2.5 text-xs font-semibold text-slate-800 transition-all hover:bg-white hover:shadow-xs"
                >
                  <FaGraduationCap className="size-3.5 text-blue-600" /> Student Demo
                </button>
                <button
                  onClick={handleDemoAdmin}
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-amber-200 bg-amber-50/80 py-2.5 text-xs font-semibold text-amber-900 transition-all hover:bg-amber-100"
                >
                  <FaShieldHalved className="size-3.5 text-amber-600" /> Admin Demo
                </button>
              </div>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[10px] uppercase font-bold text-slate-400">or sign in with credentials</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                    <FaCircleExclamation className="size-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    College email
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="mt-1.5 block w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500 focus:border-slate-900/30 focus:ring-2 focus:ring-slate-900/10"
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
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1.5 block w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500 focus:border-slate-900/30 focus:ring-2 focus:ring-slate-900/10"
                  />
                </label>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.96 }}
                  className="group mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-[0_10px_30px_-10px_rgba(15,23,42,0.5)] transition-colors hover:bg-slate-800 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="size-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Authenticating…
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
          </Reveal>
        </div>
      </section>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowForgotModal(false)} />
            <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <FaKey className="size-4 text-amber-500" /> Reset Password
                </div>
                <button onClick={() => setShowForgotModal(false)} className="text-slate-400 hover:text-slate-900">
                  <FaXmark className="size-4" />
                </button>
              </div>

              {forgotSent ? (
                <div className="py-6 text-center">
                  <p className="text-xs font-semibold text-emerald-700">
                    Password reset link has been sent to <strong>{forgotEmail}</strong>.
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
                    Enter your college email address and we will send you a password reset code.
                  </p>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="block w-full rounded-2xl border border-slate-200 p-3 text-xs font-medium text-slate-900 outline-none"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowForgotModal(false)}
                      className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (forgotEmail.includes("@")) {
                          setForgotSent(true);
                        } else {
                          alert("Please enter a valid email.");
                        }
                      }}
                      className="rounded-full bg-slate-950 px-5 py-2 text-xs font-semibold text-white"
                    >
                      Send Reset Link
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
