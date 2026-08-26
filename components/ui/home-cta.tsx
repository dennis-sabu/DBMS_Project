"use client";

import { motion } from "motion/react";
import {
  FaArrowRight,
  FaXTwitter,
  FaGithub,
  FaDiscord,
  FaRegStar,
} from "react-icons/fa6";
import {
  Stagger,
  StaggerItem,
} from "@/components/ui/motion-presets";

export function HomeCta() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-emerald-200 font-sans text-slate-950 antialiased">
      {/* Aurora blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div
          initial={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ type: "spring", duration: 1.1, bounce: 0 }}
          className="absolute inset-0 will-change-transform"
        >
          <div className="absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-emerald-300/55 blur-[120px]" />
          <div className="absolute -bottom-32 right-1/4 h-[460px] w-[460px] rounded-full bg-teal-300/55 blur-[140px]" />
          <div className="absolute left-0 top-1/2 h-[300px] w-[300px] rounded-full bg-lime-200/55 blur-[120px]" />
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col px-6 py-24 md:px-9 md:py-32 lg:px-[58px]">
        <Stagger className="mx-auto flex max-w-[860px] flex-col items-center text-center">
          <StaggerItem>
            <span className="inline-flex min-h-7 items-center gap-2 rounded-full bg-white/40 px-4 text-xs font-semibold leading-none text-slate-800 shadow-[0_1px_1px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-md">
              Join the hub
            </span>
          </StaggerItem>

          <StaggerItem>
            <h2 className="mt-5 max-w-[820px] text-[clamp(2.6rem,6.1vw,4.75rem)] leading-[0.95] font-medium tracking-[-0.055em] text-balance text-slate-950">
              Share your knowledge and help{" "}
              <span className="italic font-normal">everyone</span> learn
              together.
            </h2>
          </StaggerItem>

          <StaggerItem>
            <p className="mt-5 max-w-[520px] text-[clamp(0.95rem,1.45vw,1.12rem)] leading-[1.4] text-pretty text-slate-700">
              Drop your first note, claim a streak, and watch your reputation
              grow — it takes about 30 seconds.
            </p>
          </StaggerItem>

          {/* Glass form, matching hero-9's pill style exactly */}
          <StaggerItem className="w-full">
            <motion.form
              action="#"
              className="mx-auto mt-7 flex w-full max-w-md flex-col gap-1.5 rounded-[28px] bg-white/30 p-1.5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_18px_50px_rgba(255,255,255,0.34),inset_0_1px_0_rgba(255,255,255,0.55)] outline-1 outline-white/45 backdrop-blur-md min-[430px]:flex-row min-[430px]:rounded-full"
            >
              <label htmlFor="cta-email" className="sr-only">
                Email
              </label>
              <input
                id="cta-email"
                type="email"
                placeholder="you@university.edu"
                className="min-h-10 w-full min-w-0 flex-1 bg-transparent px-5 text-center text-sm font-medium text-slate-900 outline-none placeholder:text-slate-700/80 min-[430px]:text-left"
              />
              <motion.button
                type="submit"
                whileTap={{ scale: 0.96 }}
                className="group inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-slate-950 px-4 text-sm font-medium text-white shadow-[0_4px_14px_rgba(15,23,42,0.25)] transition-[background-color,box-shadow,transform] duration-200 ease-out hover:bg-slate-800 hover:shadow-[0_8px_22px_rgba(15,23,42,0.3)] min-[430px]:w-auto"
              >
                <span>Get Started</span>
                <FaArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
              </motion.button>
            </motion.form>
          </StaggerItem>

          {/* Trust row */}
          <StaggerItem>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-700">
              <span className="flex items-center gap-1.5">
                <FaRegStar className="size-3" /> Free to join
              </span>
              <span className="size-1 rounded-full bg-slate-400/60" />
              <span>No credit card</span>
              <span className="size-1 rounded-full bg-slate-400/60" />
              <span>Cancel anytime</span>
            </div>
          </StaggerItem>

          {/* Social row */}
          <StaggerItem>
            <div className="mt-6 flex items-center gap-3 text-xs text-slate-700">
              <span>or follow us</span>
              <div className="flex items-center gap-1.5">
                {[FaXTwitter, FaGithub, FaDiscord].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="grid size-8 place-items-center rounded-full bg-white/40 text-slate-800 shadow-[0_1px_1px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/85"
                  >
                    <Icon className="size-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
