"use client";

import Image from "next/image";
import { motion } from "motion/react";
import {
  FaArrowRight,
  FaDownload,
  FaFolderTree,
  FaMagnifyingGlass,
  FaUpload,
  FaShieldHalved,
} from "react-icons/fa6";
import {
  Stagger,
  StaggerItem,
} from "@/components/ui/motion-presets";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: FaUpload,
    label: "Upload & Review",
    title: "Upload notes for admin review",
    body: "Submit your handwritten scans or PDFs with course & department info. Once reviewed by an administrator, your notes become available to everyone.",
    cta: "Upload Notes",
    href: "/upload",
    image:
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "A hand uploading a stack of notes",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    icon: FaMagnifyingGlass,
    label: "Search & Filter",
    title: "Find by Course, Department & Semester",
    body: "Quickly filter by Academic Year, Course, Department, Semester, and Subject.",
    cta: "Browse Notes",
    href: "/browse",
    image:
      "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?auto=format&fit=crop&w=900&q=80",
    imageAlt: "A magnifying glass over handwritten notes",
    span: "",
  },
  {
    icon: FaDownload,
    label: "Download",
    title: "Instant access to approved notes",
    body: "Get high-quality study guides and lecture summaries approved for your courses.",
    cta: "Explore",
    href: "/browse",
    image:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=80",
    imageAlt: "A stack of textbooks and notebooks",
    span: "",
  },
  {
    icon: FaFolderTree,
    label: "Organize",
    title: "Track your upload status",
    body: "View your Pending, Approved, and Rejected notes in your My Notes dashboard.",
    cta: "My Uploads",
    href: "/my-notes",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Neatly organized notebooks and stationery",
    span: "",
  },
  {
    icon: FaShieldHalved,
    label: "Quality",
    title: "Administrator Approval",
    body: "Only administrator-approved notes appear in public browse and search results.",
    cta: "Learn More",
    href: "/about",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Students collaborating around a table",
    span: "",
  },
] as const;

export function HomeFeatures() {
  return (
    <section
      id="features"
      className="relative isolate w-full overflow-hidden bg-violet-300 font-sans text-slate-950 antialiased"
    >
      {/* Aurora blobs (match hero-9 aurora style) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div
          initial={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ type: "spring", duration: 1.1, bounce: 0 }}
          className="absolute inset-0 will-change-transform"
        >
          <div className="absolute -left-32 top-1/4 h-[420px] w-[420px] rounded-full bg-purple-400/55 blur-[120px]" />
          <div className="absolute -right-24 bottom-0 h-[440px] w-[440px] rounded-full bg-fuchsia-300/55 blur-[140px]" />
          <div className="absolute left-1/3 top-0 h-[300px] w-[300px] rounded-full bg-indigo-300/55 blur-[120px]" />
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col px-6 py-24 md:px-9 md:py-32 lg:px-[58px]">
        {/* Heading */}
        <Stagger className="mx-auto flex max-w-[820px] flex-col items-center text-center">
          <StaggerItem>
            <span className="inline-flex min-h-7 items-center gap-2 rounded-full bg-white/40 px-4 text-xs font-semibold leading-none text-slate-800 shadow-[0_1px_1px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-md">
              Features
            </span>
          </StaggerItem>

          <StaggerItem>
            <h2 className="mt-5 max-w-[760px] text-[clamp(2.4rem,5.4vw,4.25rem)] leading-[0.95] font-medium tracking-[-0.05em] text-balance text-slate-950">
              Everything you need for{" "}
              <span className="italic font-normal">our college courses.</span>
            </h2>
          </StaggerItem>

          <StaggerItem>
            <p className="mt-5 max-w-[520px] text-[clamp(0.95rem,1.45vw,1.12rem)] leading-[1.4] text-pretty text-slate-700">
              Structured academic notes categorized by Department, Course, Semester, and Subject.
            </p>
          </StaggerItem>
        </Stagger>

        {/* Bento grid */}
        <Stagger className="mt-14 grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-3 md:grid-cols-4 md:grid-rows-[1fr_1fr]">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <StaggerItem
                key={f.label}
                className={cn("h-full", f.span)}
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className={cn(
                    "group relative flex h-full flex-col overflow-hidden rounded-[24px] bg-white/30 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_18px_50px_rgba(255,255,255,0.34),inset_0_1px_0_rgba(255,255,255,0.55)] outline-1 outline-white/45 backdrop-blur-md transition-shadow hover:shadow-[0_24px_60px_-12px_rgba(15,23,42,0.18)]"
                  )}
                >
                  {/* Image */}
                  <div
                    className={cn(
                      "relative w-full overflow-hidden",
                      f.span ? "h-64 md:h-[55%]" : "h-32 md:h-36"
                    )}
                  >
                    <Image
                      src={f.image}
                      alt={f.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-full bg-slate-950 text-white">
                        <Icon className="size-3.5" />
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                        {f.label}
                      </span>
                    </div>

                    <h3
                      className={cn(
                        "font-semibold leading-snug text-slate-950",
                        f.span ? "text-2xl" : "text-lg"
                      )}
                    >
                      {f.title}
                    </h3>
                    <p className="text-sm leading-snug text-slate-600">
                      {f.body}
                    </p>

                    <motion.a
                      href={f.href}
                      whileTap={{ scale: 0.96 }}
                      className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-slate-900 transition-colors group-hover:text-slate-700"
                    >
                      {f.cta}
                      <FaArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </motion.a>
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
