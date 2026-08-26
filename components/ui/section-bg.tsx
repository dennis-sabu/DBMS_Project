"use client";

import { motion } from "motion/react";

/**
 * Animated pastel blob backdrop, mounted behind any section so every
 * section shares the same soft, drifting background.
 */
export function SectionBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.div
        className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-blue-300/35 blur-[140px]"
        animate={{ x: [0, 60, -20, 0], y: [0, 30, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/4 -right-40 h-[480px] w-[480px] rounded-full bg-violet-300/35 blur-[140px]"
        animate={{ x: [0, -50, 30, 0], y: [0, 40, -30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 left-1/4 h-[500px] w-[500px] rounded-full bg-pink-200/30 blur-[140px]"
        animate={{ x: [0, 40, -40, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
