"use client";

import { motion } from "motion/react";
import { Navbar } from "@/components/ui/navbar";
import { UploadNoteForm } from "@/components/ui/upload-note-form";
import {
  Reveal,
  Stagger,
  StaggerItem,
} from "@/components/ui/motion-presets";
import { SectionBg } from "@/components/ui/section-bg";
import {
  FaCircleCheck,
  FaShieldHalved,
  FaFolderTree,
} from "react-icons/fa6";

const SIDE_CARDS = [
  {
    icon: FaShieldHalved,
    title: "Administrator Approval Workflow",
    body: "Every uploaded note enters Pending status and is reviewed by a NotesHub Administrator before being published.",
  },
  {
    icon: FaFolderTree,
    title: "Academic Structure",
    body: "Ensure your note includes the correct Academic Year, Course, Department, Semester, and Subject.",
  },
  {
    icon: FaCircleCheck,
    title: "Student Recognition",
    body: "Once approved, your note will be credited to your profile and available to students across our college.",
  },
];

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-950 antialiased">
      <Navbar />

      <section className="relative isolate overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-slate-50 pt-32 pb-20">
        <SectionBg />

        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Upload Notes
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-3 max-w-3xl text-balance text-5xl font-medium leading-[0.95] tracking-[-0.05em] text-slate-950 md:text-6xl">
              Share your study material{" "}
              <span className="italic font-normal">with our college.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-xl text-pretty text-slate-700">
              Upload PDFs or documents. Your submission will be reviewed by an
              administrator before appearing in public browse and search results.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <UploadNoteForm />
            </div>

            <aside className="lg:col-span-4">
              <Stagger className="space-y-4">
                {SIDE_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <StaggerItem key={card.title}>
                      <motion.div
                        whileHover={{ y: -2 }}
                        transition={{ type: "spring", stiffness: 320, damping: 22 }}
                        className="rounded-3xl border border-white/70 bg-white/65 p-6 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.18)] backdrop-blur-2xl transition-all hover:bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 place-items-center rounded-2xl bg-slate-950 text-white shadow-sm">
                            <Icon className="size-4" />
                          </span>
                          <h3 className="text-sm font-semibold leading-snug text-slate-950">
                            {card.title}
                          </h3>
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-slate-600">
                          {card.body}
                        </p>
                      </motion.div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
