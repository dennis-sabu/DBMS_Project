"use client";

import LogoIcon from "@/assets/logo-icon";

export function HomeFooter() {
  return (
    <footer className="relative z-10 border-t border-slate-900/10 bg-white px-6 py-10 font-sans text-sm text-slate-600 md:px-9 lg:px-[58px]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between gap-3 md:flex-row">
        <div className="flex items-center gap-2.5">
          <LogoIcon className="size-6 text-slate-900" />
          <span className="text-sm font-semibold tracking-[-0.02em] text-slate-900">
            NotesHub
          </span>
          <span className="ml-3 text-xs text-slate-500">
            © {new Date().getFullYear()} · Built by students, for students.
          </span>
        </div>

        <div className="flex items-center gap-5 text-xs text-slate-500">
          <a href="#" className="transition-colors hover:text-slate-900">
            Privacy
          </a>
          <a href="#" className="transition-colors hover:text-slate-900">
            Terms
          </a>
          <a href="#" className="transition-colors hover:text-slate-900">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
