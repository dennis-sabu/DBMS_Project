"use client";

import { motion } from "motion/react";
import { FaBookmark, FaDownload, FaTrash } from "react-icons/fa6";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { SectionBg } from "@/components/ui/section-bg";
import { useNotesStore } from "@/lib/notes-store";

export default function BookmarksPage() {
  const { approvedNotes, bookmarks, toggleBookmark, isLoaded } = useNotesStore();

  if (!isLoaded) return null;

  const bookmarkedNotes = approvedNotes.filter((n) => bookmarks.includes(n.id));

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-950 antialiased">
      <Navbar />

      <section className="relative isolate overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-slate-50 pt-32 pb-12">
        <SectionBg />
        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            Saved Notes
          </p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight text-slate-950 md:text-5xl">
            My Bookmarks.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-700">
            Quick access to administrator-approved notes you saved for easy revision.
          </p>
        </div>
      </section>

      <section className="relative bg-slate-50 py-10">
        <div className="mx-auto w-full max-w-[1280px] px-6">
          {bookmarkedNotes.length === 0 ? (
            <div className="rounded-3xl border border-white/70 bg-white/65 p-12 text-center shadow-sm">
              <FaBookmark className="mx-auto size-8 text-slate-400" />
              <h3 className="mt-3 text-lg font-semibold text-slate-900">No bookmarks saved yet</h3>
              <p className="mt-1 text-sm text-slate-600">
                Browse approved notes and click the bookmark icon to save notes here.
              </p>
              <div className="mt-6">
                <Link
                  href="/browse"
                  className="rounded-full bg-slate-950 px-6 py-2.5 text-xs font-semibold text-white"
                >
                  Browse Approved Notes
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {bookmarkedNotes.map((note) => (
                <motion.article
                  key={note.id}
                  whileHover={{ y: -3 }}
                  className="flex flex-col justify-between rounded-3xl border border-white/70 bg-white/75 p-6 shadow-sm backdrop-blur-xl transition-all hover:bg-white"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                        {note.subject}
                      </span>
                      <button
                        onClick={() => toggleBookmark(note.id)}
                        className="text-rose-500 hover:text-rose-700"
                        title="Remove Bookmark"
                      >
                        <FaTrash className="size-3.5" />
                      </button>
                    </div>

                    <h3 className="mt-3 text-lg font-semibold text-slate-950">{note.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">{note.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-600">
                      <span className="rounded-lg bg-slate-100 px-2 py-1">Course: {note.course}</span>
                      <span className="rounded-lg bg-slate-100 px-2 py-1">Sem: {note.semester}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-500">by {note.uploaderName}</span>
                    <button
                      onClick={() => alert(`Downloading ${note.fileName}`)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-1.5 text-xs font-semibold text-white"
                    >
                      <FaDownload className="size-3" /> Download
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
