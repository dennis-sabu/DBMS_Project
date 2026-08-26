"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FaArrowRight,
  FaUserPlus,
  FaCircleExclamation,
  FaCheck,
} from "react-icons/fa6";
import { Navbar } from "@/components/ui/navbar";
import { Reveal } from "@/components/ui/motion-presets";
import { SectionBg } from "@/components/ui/section-bg";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotesStore } from "@/lib/notes-store";

export default function SignupPage() {
  const router = useRouter();
  const { signupUser, academicYears, coursesList, departmentsList } = useNotesStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [course, setCourse] = useState(coursesList[0] || "B.Tech");
  const [department, setDepartment] = useState(departmentsList[0] || "Computer Science & Engineering");
  const [academicYear, setAcademicYear] = useState(academicYears[0] || "1st Year");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-check.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      signupUser({
        name: name.trim(),
        email: email.trim(),
        department,
        course,
        academicYear,
      });

      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        router.push("/browse");
      }, 1000);
    }, 600);
  }

  return (
    <main className="min-h-screen bg-white font-sans text-slate-950 antialiased">
      <Navbar />

      <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-amber-200 via-amber-100 to-white py-24">
        <SectionBg />

        <div className="relative z-10 mx-auto w-full max-w-md px-6">
          <Reveal>
            <div className="rounded-[28px] border border-white/70 bg-white/65 p-8 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_24px_60px_-12px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-2xl">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-slate-950 text-white shadow-[0_8px_24px_-8px_rgba(15,23,42,0.45)]">
                <FaUserPlus className="size-4" />
              </div>

              <h1 className="mt-5 text-center text-3xl font-medium leading-[1.05] tracking-[-0.04em] text-slate-950">
                Join NotesHub.
              </h1>
              <p className="mt-2 text-center text-sm text-pretty text-slate-600">
                Create a student account to share, bookmark, and download notes for our college.
              </p>

              {success ? (
                <div className="mt-6 rounded-2xl bg-emerald-500/10 p-6 text-center text-emerald-800">
                  <FaCheck className="mx-auto size-8 text-emerald-600" />
                  <h3 className="mt-2 text-base font-bold">Registration Successful!</h3>
                  <p className="mt-1 text-xs text-emerald-700">Redirecting to NotesHub Browse...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-7 space-y-3">
                  {errorMsg && (
                    <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                      <FaCircleExclamation className="size-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Full name *
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maya Rivera"
                      className="mt-1.5 block w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500 focus:border-slate-900/30 focus:ring-2 focus:ring-slate-900/10"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Email Address *
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@college.edu"
                      className="mt-1.5 block w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500 focus:border-slate-900/30 focus:ring-2 focus:ring-slate-900/10"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Course
                      </span>
                      <select
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="mt-1.5 block w-full rounded-2xl border border-white/70 bg-white/80 px-3 py-3 text-xs font-medium text-slate-900 outline-none"
                      >
                        {coursesList.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Academic Year
                      </span>
                      <select
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="mt-1.5 block w-full rounded-2xl border border-white/70 bg-white/80 px-3 py-3 text-xs font-medium text-slate-900 outline-none"
                      >
                        {academicYears.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Department
                    </span>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="mt-1.5 block w-full rounded-2xl border border-white/70 bg-white/80 px-3 py-3 text-xs font-medium text-slate-900 outline-none"
                    >
                      {departmentsList.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Password *
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="mt-1.5 block w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500 focus:border-slate-900/30 focus:ring-2 focus:ring-slate-900/10"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Confirm Password *
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
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
                        Creating Student Account…
                      </>
                    ) : (
                      <>
                        Create Student Account
                        <FaArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </motion.button>
                </form>
              )}

              <div className="mt-6 text-center text-xs text-slate-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-slate-900 underline-offset-2 hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
