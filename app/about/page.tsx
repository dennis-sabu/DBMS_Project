"use client";

import { motion } from "motion/react";
import { FaArrowRight } from "react-icons/fa6";
import { Navbar } from "@/components/ui/navbar";
import {
  Reveal,
  Stagger,
  StaggerItem,
} from "@/components/ui/motion-presets";
import { SectionBg } from "@/components/ui/section-bg";

const VALUES = [
  {
    title: "Built for our college",
    body: "Created specifically for students across all departments and semesters in our college.",
  },
  {
    title: "Administrator Reviewed",
    body: "Every uploaded note is reviewed and approved by an administrator before public release.",
  },
  {
    title: "Structured Learning",
    body: "Notes are indexed by Academic Year, Course, Department, Semester, and Subject.",
  },
];

const STATS = [
  { value: "100%", label: "admin reviewed" },
  { value: "5+", label: "departments covered" },
  { value: "4.9★", label: "average note rating" },
  { value: "0", label: "ads, ever" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-slate-950 antialiased">
      <Navbar />

      <section className="relative isolate overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-white pt-32 pb-20">
        <SectionBg />

        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              About NotesHub
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-3 max-w-3xl text-balance text-5xl font-medium leading-[0.95] tracking-[-0.05em] text-slate-950 md:text-6xl">
              A clean, well-lighted place for your{" "}
              <span className="italic font-normal">notes.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-xl text-pretty text-slate-700">
              NotesHub is a college-specific platform for students to find, share,
              and organize academic notes across all departments and courses.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative bg-white py-16">
        <div className="mx-auto w-full max-w-[1280px] px-6">
          <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <StaggerItem key={s.label}>
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className="rounded-3xl border border-white/70 bg-white/65 p-6 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.18)] backdrop-blur-2xl transition-all hover:bg-white"
                >
                  <div className="text-4xl font-medium tracking-[-0.04em] text-slate-950">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {s.label}
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>

          <Stagger className="mt-10 grid gap-4 md:grid-cols-3">
            {VALUES.map((v) => (
              <StaggerItem key={v.title}>
                <div className="flex h-full flex-col gap-2 rounded-3xl border border-white/70 bg-white/65 p-6 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.18)] backdrop-blur-2xl">
                  <h3 className="text-lg font-semibold text-slate-950">
                    {v.title}
                  </h3>
                  <p className="text-sm leading-snug text-slate-600">
                    {v.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.2} className="mt-12">
            <motion.a
              href="/signup"
              whileTap={{ scale: 0.96 }}
              className="group inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-[0_10px_30px_-10px_rgba(15,23,42,0.5)] transition-colors hover:bg-slate-800"
            >
              Join NotesHub
              <FaArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </motion.a>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
