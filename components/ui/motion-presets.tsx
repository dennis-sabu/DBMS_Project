"use client";

import { motion, type Variants } from "motion/react";
import { type ReactNode } from "react";

/**
 * Motion language — identical timing/easing to watermelon hero-9 so every
 * section blends with the hero when it scrolls into view.
 */

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", duration: 0.72, bounce: 0 },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0, scale: 1.04, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", duration: 1.1, bounce: 0 },
  },
};

export const stagger = (delay = 0.2, between = 0.1): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: delay, staggerChildren: between },
  },
});

/* ── Reveal: single-item scroll-triggered fade-up ─────────────── */

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, y = 18, className }: RevealProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y, filter: "blur(8px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { type: "spring", duration: 0.72, bounce: 0 },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.72, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Stagger / StaggerItem: container + children variants ────── */

interface StaggerProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function Stagger({ children, delay = 0.2, className }: StaggerProps) {
  return (
    <motion.div
      variants={stagger(delay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}
