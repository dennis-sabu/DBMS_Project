"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  FaClock,
  FaCircleCheck,
  FaCircleXmark,
  FaTrash,
  FaPenToSquare,
  FaArrowRight,
} from "react-icons/fa6";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { SectionBg } from "@/components/ui/section-bg";
import { useNotesStore, AcademicNote } from "@/lib/notes-store";

export default function MyNotesPage() {
  const { currentUser, myNotes, deleteNote, updateNote, isLoaded } = useNotesStore();
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [editingNote, setEditingNote] = useState<AcademicNote | null>(null);

  if (!isLoaded) return null;

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-slate-50 font-sans text-slate-950 antialiased">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center px-6 pt-32">
          <div className="rounded-3xl border border-white/70 bg-white/70 p-10 text-center shadow-lg backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-slate-950">Sign in to view your notes</h2>
            <p className="mt-2 text-sm text-slate-600">You need to log in to access your upload status dashboard.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/login" className="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const pending = myNotes.filter((n) => n.status === "Pending");
  const approved = myNotes.filter((n) => n.status === "Approved");
  const rejected = myNotes.filter((n) => n.status === "Rejected");

  const filtered =
    activeTab === "pending"
      ? pending
      : activeTab === "approved"
      ? approved
      : activeTab === "rejected"
      ? rejected
      : myNotes;

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-950 antialiased">
      <Navbar />

      <section className="relative isolate overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-slate-50 pt-32 pb-12">
        <SectionBg />
        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            My Uploads
          </p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight text-slate-950 md:text-5xl">
            Track your note submissions.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-700">
            Monitor note approval status from NotesHub Administrators. View pending, approved, or rejected uploads.
          </p>

          {/* Tabs */}
          <div className="mt-8 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "border border-white/70 bg-white/60 text-slate-800 hover:bg-white"
              }`}
            >
              All Uploads ({myNotes.length})
            </button>

            <button
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                activeTab === "pending"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "border border-white/70 bg-white/60 text-slate-800 hover:bg-white"
              }`}
            >
              <FaClock className="size-3" />
              Pending ({pending.length})
            </button>

            <button
              onClick={() => setActiveTab("approved")}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                activeTab === "approved"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "border border-white/70 bg-white/60 text-slate-800 hover:bg-white"
              }`}
            >
              <FaCircleCheck className="size-3" />
              Approved ({approved.length})
            </button>

            <button
              onClick={() => setActiveTab("rejected")}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                activeTab === "rejected"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "border border-white/70 bg-white/60 text-slate-800 hover:bg-white"
              }`}
            >
              <FaCircleXmark className="size-3" />
              Rejected ({rejected.length})
            </button>

            <Link
              href="/upload"
              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Upload New Note <FaArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* List section */}
      <section className="relative bg-slate-50 py-10">
        <div className="mx-auto w-full max-w-[1280px] px-6">
          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-white/70 bg-white/65 p-12 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">No notes in this view</h3>
              <p className="mt-1 text-sm text-slate-600">You haven&apos;t uploaded any notes matching this status filter yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all hover:bg-white"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        {note.status === "Pending" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                            <FaClock className="size-3" /> Pending Administrator Review
                          </span>
                        )}
                        {note.status === "Approved" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                            <FaCircleCheck className="size-3" /> Approved & Published
                          </span>
                        )}
                        {note.status === "Rejected" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
                            <FaCircleXmark className="size-3" /> Rejected by Administrator
                          </span>
                        )}

                        <span className="text-xs font-medium text-slate-500">
                          Uploaded on {note.uploadDate}
                        </span>
                      </div>

                      <h3 className="mt-2 text-xl font-semibold text-slate-950">{note.title}</h3>
                      <p className="mt-1 text-xs text-slate-600">{note.description}</p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium">Subject: {note.subject}</span>
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium">Course: {note.course}</span>
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium">Dept: {note.department}</span>
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium">Sem: {note.semester}</span>
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium">Year: {note.academicYear}</span>
                      </div>

                      {/* Rejection Reason display */}
                      {note.status === "Rejected" && note.rejectionReason && (
                        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-rose-800">
                            Administrator Rejection Reason:
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-rose-950">
                            {note.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions for Pending Notes */}
                    {note.status === "Pending" && (
                      <div className="flex items-center gap-2 border-t border-slate-100 pt-3 md:border-t-0 md:pt-0">
                        <button
                          onClick={() => setEditingNote(note)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                        >
                          <FaPenToSquare className="size-3" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this pending upload?")) {
                              deleteNote(note.id);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                        >
                          <FaTrash className="size-3" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Edit Pending Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setEditingNote(null)} />
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900">Edit Pending Upload</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                updateNote(editingNote.id, {
                  title: form.get("title")?.toString(),
                  subject: form.get("subject")?.toString(),
                  description: form.get("description")?.toString(),
                });
                setEditingNote(null);
              }}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700">Note Title</label>
                <input
                  name="title"
                  defaultValue={editingNote.title}
                  className="mt-1 block w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Subject</label>
                <input
                  name="subject"
                  defaultValue={editingNote.subject}
                  className="mt-1 block w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingNote.description}
                  className="mt-1 block w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-slate-950 px-5 py-2 text-xs font-semibold text-white"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
