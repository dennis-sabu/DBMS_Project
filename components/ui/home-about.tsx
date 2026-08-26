"use client";

import Image from "next/image";
import { motion } from "motion/react";
import {
  FaArrowRight,
  FaGraduationCap,
  FaShieldHalved,
  FaStar,
} from "react-icons/fa6";
import {
  Reveal,
  Stagger,
  StaggerItem,
} from "@/components/ui/motion-presets";

const POINTS = [
  {
    icon: FaGraduationCap,
    title: "Built for our college",
    body: "Designed specifically for students across our campus departments and courses.",
  },
  {
    icon: FaStar,
    title: "Administrator verified",
    body: "Every uploaded note is reviewed and approved by an administrator before appearing publicly.",
  },
  {
    icon: FaShieldHalved,
    title: "Organized academic hub",
    body: "Easily search by Academic Year, Course, Department, Semester, and Subject.",
  },
] as const;

export function HomeAbout() {
  return (
    <section
      id="about"
      className="relative isolate w-full overflow-hidden bg-amber-200 font-sans text-slate-950 antialiased"
    >
      {/* Pastel blobs — match hero-9's palette family */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div
          initial={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", duration: 1.1, bounce: 0 }}
          className="absolute inset-0 will-change-transform"
        >
          <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-orange-300/55 blur-[120px]" />
          <div className="absolute -bottom-32 -right-24 h-[460px] w-[460px] rounded-full bg-yellow-200/65 blur-[140px]" />
          <div className="absolute right-1/3 top-1/4 h-[280px] w-[280px] rounded-full bg-rose-300/40 blur-[120px]" />
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col px-6 py-24 md:px-9 md:py-32 lg:px-[58px]">
        {/* Heading */}
        <Stagger className="mx-auto flex max-w-[820px] flex-col items-center text-center">
          <StaggerItem>
            <span className="inline-flex min-h-7 items-center gap-2 rounded-full bg-white/40 px-4 text-xs font-semibold leading-none text-slate-800 shadow-[0_1px_1px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-md">
              About NotesHub
            </span>
          </StaggerItem>

          <StaggerItem>
            <h2 className="mt-5 max-w-[760px] text-[clamp(2.4rem,5.4vw,4.25rem)] leading-[0.95] font-medium tracking-[-0.05em] text-balance text-slate-950">
              A clean, well-lighted place for your{" "}
              <span className="italic font-normal">notes.</span>
            </h2>
          </StaggerItem>

          <StaggerItem>
            <p className="mt-5 max-w-[560px] text-[clamp(0.95rem,1.45vw,1.12rem)] leading-[1.4] text-pretty text-slate-700">
              We built NotesHub because the best study materials from our college
              should be organized, accessible, and verified for every student.
            </p>
          </StaggerItem>
        </Stagger>

        {/* Glass card row */}
        <Stagger className="mt-14 grid gap-4 md:grid-cols-2">
          {/* Big image card */}
          <StaggerItem>
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="group relative overflow-hidden rounded-[28px] bg-white/30 p-2 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_18px_50px_rgba(255,255,255,0.34),inset_0_1px_0_rgba(255,255,255,0.55)] outline-1 outline-white/45 backdrop-blur-md"
            >
              <div className="relative h-[420px] w-full overflow-hidden rounded-[22px]">
                <Image
                  src="https://images.unsplash.com/photo-1488998427799-e3362cec87c3?auto=format&fit=crop&w=1200&q=80"
                  alt="A cozy student study desk with notebook, coffee and plants"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-white/85 px-4 py-2.5 shadow-md backdrop-blur-md">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Approved Note
                    </div>
                    <div className="text-sm font-medium text-slate-900">
                      Database Management Systems · Semester 4
                    </div>
                  </div>
                  <div className="flex -space-x-1.5">
                    <span className="grid size-7 place-items-center rounded-full bg-blue-500 text-[10px] font-semibold text-white ring-2 ring-white">
                      M
                    </span>
                    <span className="grid size-7 place-items-center rounded-full bg-violet-500 text-[10px] font-semibold text-white ring-2 ring-white">
                      A
                    </span>
                    <span className="grid size-7 place-items-center rounded-full bg-pink-500 text-[10px] font-semibold text-white ring-2 ring-white">
                      O
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </StaggerItem>

          {/* Points card */}
          <StaggerItem>
            <ul className="flex h-full flex-col gap-3 rounded-[28px] bg-white/30 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_18px_50px_rgba(255,255,255,0.34),inset_0_1px_0_rgba(255,255,255,0.55)] outline-1 outline-white/45 backdrop-blur-md">
              {POINTS.map((p) => {
                const Icon = p.icon;
                return (
                  <motion.li
                    key={p.title}
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 380, damping: 22 }}
                    className="group flex items-start gap-4 rounded-2xl bg-white/60 p-5 transition-colors hover:bg-white/85"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-950 text-white shadow-[0_8px_20px_-6px_rgba(15,23,42,0.35)]">
                      <Icon className="size-4" />
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold leading-tight text-slate-900">
                        {p.title}
                      </div>
                      <div className="mt-1 text-sm leading-snug text-slate-600">
                        {p.body}
                      </div>
                    </div>
                    <FaArrowRight className="mt-1 size-3 shrink-0 text-slate-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-slate-900" />
                  </motion.li>
                );
              })}

              <motion.li
                whileTap={{ scale: 0.96 }}
                className="mt-auto"
              >
                <a
                  href="/browse"
                  className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(15,23,42,0.45)] transition-[background-color,transform] duration-200 ease-out hover:bg-slate-800"
                >
                  Browse Approved Notes
                  <FaArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
              </motion.li>
            </ul>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
