"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FaShieldHalved,
  FaCheck,
  FaXmark,
  FaTrash,
  FaRotateLeft,
  FaPenToSquare,
  FaClock,
  FaCircleCheck,
  FaCircleXmark,
  FaEye,
  FaUsers,
  FaGear,
  FaChartPie,
  FaBuildingColumns,
  FaPlus,
  FaToggleOn,
  FaToggleOff,
  FaBullhorn,
  FaUserCheck,
  FaUserSlash,
  FaCheckDouble,
  FaDownload,
  FaBookOpen,
  FaListCheck,
  FaLock,
  FaUserShield,
} from "react-icons/fa6";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { SectionBg } from "@/components/ui/section-bg";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion-presets";
import { useNotesStore, AcademicNote } from "@/lib/notes-store";
import { NoteViewer } from "@/components/ui/note-viewer";

export default function AdminDashboardPage() {
  const {
    notes,
    pendingNotes,
    approvedNotes,
    rejectedNotes,
    usersList,
    academicYears,
    coursesList,
    departmentsList,
    semestersList,
    subjectsList,
    siteSettings,
    activityLogs,
    adminApproveNote,
    adminBatchApprovePending,
    adminRejectNote,
    adminRestoreNote,
    deleteNote,
    updateNote,
    updateSiteSettings,
    toggleUserStatus,
    toggleUserRole,
    addAcademicItem,
    deleteAcademicItem,
    loginAsAdmin,
    currentUser,
    isLoaded,
  } = useNotesStore();

  /* Active Dashboard Tab */
  const [activeAdminTab, setActiveAdminTab] = useState<"moderation" | "settings" | "academic" | "users" | "analytics" | "logs">("moderation");

  /* Moderation sub-filter */
  const [modSubTab, setModSubTab] = useState<"pending" | "approved" | "rejected" | "deleted">("pending");

  /* Modals */
  const [rejectingNoteId, setRejectingNoteId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState("");
  const [previewNote, setPreviewNote] = useState<AcademicNote | null>(null);
  const [editingNote, setEditingNote] = useState<AcademicNote | null>(null);

  /* Academic Management State */
  const [academicCat, setAcademicCat] = useState<"years" | "courses" | "departments" | "semesters" | "subjects">("subjects");
  const [newAcademicInput, setNewAcademicInput] = useState("");

  /* Admin Password Login State */
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminPassError, setAdminPassError] = useState("");
  const [adminPassLoading, setAdminPassLoading] = useState(false);

  const isAdmin =
    currentUser?.role === "admin" ||
    currentUser?.email === "dennissabu444@gmail.com";

  const handleAdminPasswordUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPassError("");

    if (adminPasswordInput.trim() !== "d21m1025") {
      setAdminPassError("Incorrect admin password. Please try again.");
      return;
    }

    setAdminPassLoading(true);
    try {
      await loginAsAdmin("d21m1025");
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  if (!isLoaded) return null;

  /* ACCESS CONTROL GUARD */
  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 font-sans text-slate-950 antialiased">
        <Navbar />

        <section className="relative isolate flex min-h-[80vh] items-center justify-center overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-slate-50 pt-32 pb-20">
          <SectionBg />

          <div className="relative z-10 mx-auto w-full max-w-md px-6 text-center">
            <Reveal>
              <div className="rounded-[28px] border border-white/70 bg-white/75 p-8 shadow-2xl backdrop-blur-2xl">
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-500 text-slate-950 shadow-md">
                  <FaLock className="size-6" />
                </div>

                <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
                  Administrator Console
                </h1>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Enter the administrator password to manage NotesHub moderation, users, and settings.
                </p>

                <form onSubmit={handleAdminPasswordUnlock} className="mt-6 space-y-3">
                  {adminPassError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-semibold text-rose-700">
                      {adminPassError}
                    </div>
                  )}

                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="Enter admin password (d21m1025)"
                    required
                    className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />

                  <button
                    type="submit"
                    disabled={adminPassLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-xs font-semibold text-white shadow-md transition-colors hover:bg-slate-800 disabled:opacity-60"
                  >
                    <FaUserShield className="size-3.5 text-amber-400" />
                    {adminPassLoading ? "Verifying…" : "Unlock Admin Console"}
                  </button>

                  <Link
                    href="/browse"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Return to Public Notes Hub
                  </Link>
                </form>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    );
  }

  const deletedNotes = notes.filter((n) => n.isDeleted);

  const displayedNotes =
    modSubTab === "pending"
      ? pendingNotes
      : modSubTab === "approved"
      ? approvedNotes
      : modSubTab === "rejected"
      ? rejectedNotes
      : deletedNotes;

  const totalDownloads = notes.reduce((acc, n) => acc + (n.downloadCount || 0), 0);

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-950 antialiased">
      <Navbar />

      {/* Header section — exact website style */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-slate-50 pt-32 pb-12">
        <SectionBg />

        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
                  <FaShieldHalved className="size-3.5 text-amber-400" />
                  Administrator Control Center
                </span>
                <h1 className="mt-3 text-4xl font-medium tracking-[-0.04em] text-slate-950 md:text-5xl">
                  Manage NotesHub Platform
                </h1>
                <p className="mt-2 text-sm text-slate-700">
                  Full site controls for content moderation, platform settings, academic structure, user directory, and activity logs.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-5 py-2.5 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur-xl transition-all hover:bg-white"
                >
                  <FaBookOpen className="size-3.5 text-slate-600" /> View Public Site
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Key Admin Overview Cards */}
          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
                  <FaClock className="size-4 text-amber-500" />
                </div>
                <div className="mt-2 text-3xl font-bold text-slate-950">{pendingNotes.length}</div>
                <div className="mt-1 text-[11px] font-medium text-slate-600">Awaiting administrator approval</div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Approved Notes</span>
                  <FaCircleCheck className="size-4 text-emerald-500" />
                </div>
                <div className="mt-2 text-3xl font-bold text-slate-950">{approvedNotes.length}</div>
                <div className="mt-1 text-[11px] font-medium text-slate-600">Publicly visible across campus</div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Registered Users</span>
                  <FaUsers className="size-4 text-blue-500" />
                </div>
                <div className="mt-2 text-3xl font-bold text-slate-950">{usersList.length}</div>
                <div className="mt-1 text-[11px] font-medium text-slate-600">Active student accounts</div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Downloads</span>
                  <FaDownload className="size-4 text-violet-500" />
                </div>
                <div className="mt-2 text-3xl font-bold text-slate-950">{totalDownloads.toLocaleString()}</div>
                <div className="mt-1 text-[11px] font-medium text-slate-600">Student resource accesses</div>
              </div>
            </StaggerItem>
          </Stagger>

          {/* Control Section Navigation Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 rounded-full border border-white/70 bg-white/60 p-1.5 shadow-sm backdrop-blur-xl">
            <button
              onClick={() => setActiveAdminTab("moderation")}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
                activeAdminTab === "moderation"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-700 hover:bg-white/80"
              }`}
            >
              <FaShieldHalved className="size-3.5" /> Note Moderation ({pendingNotes.length} pending)
            </button>

            <button
              onClick={() => setActiveAdminTab("settings")}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
                activeAdminTab === "settings"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-700 hover:bg-white/80"
              }`}
            >
              <FaGear className="size-3.5" /> Platform & Banner Settings
            </button>

            <button
              onClick={() => setActiveAdminTab("academic")}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
                activeAdminTab === "academic"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-700 hover:bg-white/80"
              }`}
            >
              <FaBuildingColumns className="size-3.5" /> Academic Structure
            </button>

            <button
              onClick={() => setActiveAdminTab("users")}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
                activeAdminTab === "users"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-700 hover:bg-white/80"
              }`}
            >
              <FaUsers className="size-3.5" /> User Directory
            </button>

            <button
              onClick={() => setActiveAdminTab("analytics")}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
                activeAdminTab === "analytics"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-700 hover:bg-white/80"
              }`}
            >
              <FaChartPie className="size-3.5" /> Analytics
            </button>

            <button
              onClick={() => setActiveAdminTab("logs")}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
                activeAdminTab === "logs"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-700 hover:bg-white/80"
              }`}
            >
              <FaListCheck className="size-3.5" /> Activity Audit Logs
            </button>
          </div>
        </div>
      </section>

      {/* Main Admin Tab Panels */}
      <section className="relative bg-slate-50 py-10">
        <div className="mx-auto w-full max-w-[1280px] px-6">
          {/* TAB 1: Note Moderation Queue */}
          {activeAdminTab === "moderation" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/75 p-6 shadow-sm backdrop-blur-xl">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Note Review & Approval Queue</h2>
                  <p className="mt-1 text-xs text-slate-600">
                    Review student uploads before they appear in public search and browse results.
                  </p>
                </div>

                {pendingNotes.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("Approve all pending notes at once?")) {
                        adminBatchApprovePending();
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
                  >
                    <FaCheckDouble className="size-3.5" /> Approve All Pending ({pendingNotes.length})
                  </button>
                )}
              </div>

              {/* Sub-tabs */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setModSubTab("pending")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    modSubTab === "pending"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "border border-white/70 bg-white/60 text-slate-800 hover:bg-white"
                  }`}
                >
                  Pending ({pendingNotes.length})
                </button>
                <button
                  onClick={() => setModSubTab("approved")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    modSubTab === "approved"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "border border-white/70 bg-white/60 text-slate-800 hover:bg-white"
                  }`}
                >
                  Approved ({approvedNotes.length})
                </button>
                <button
                  onClick={() => setModSubTab("rejected")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    modSubTab === "rejected"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "border border-white/70 bg-white/60 text-slate-800 hover:bg-white"
                  }`}
                >
                  Rejected ({rejectedNotes.length})
                </button>
                <button
                  onClick={() => setModSubTab("deleted")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    modSubTab === "deleted"
                      ? "bg-slate-800 text-white shadow-xs"
                      : "border border-white/70 bg-white/60 text-slate-800 hover:bg-white"
                  }`}
                >
                  Deleted ({deletedNotes.length})
                </button>
              </div>

              {/* Notes List */}
              {displayedNotes.length === 0 ? (
                <div className="rounded-3xl border border-white/70 bg-white/65 p-12 text-center shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900">No notes in the {modSubTab} queue</h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedNotes.map((note) => (
                    <motion.div
                      key={note.id}
                      layout
                      className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all hover:bg-white"
                    >
                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-full bg-slate-950 px-3 py-1 font-semibold uppercase tracking-wider text-white text-[10px]">
                              {note.subject}
                            </span>
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                              Course: {note.course}
                            </span>
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                              Dept: {note.department}
                            </span>
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                              Sem: {note.semester}
                            </span>
                            <span className="text-slate-500">Uploader: <strong>{note.uploaderName}</strong></span>
                          </div>

                          <h3 className="mt-3 text-lg font-bold text-slate-950">{note.title}</h3>
                          <p className="mt-1 text-xs text-slate-600">{note.description}</p>

                          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                            <span>File: <strong>{note.fileName}</strong> ({note.fileSize})</span>
                            <span>Upload Date: {note.uploadDate}</span>
                          </div>

                          {note.rejectionReason && (
                            <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                              <strong>Rejection Reason:</strong> {note.rejectionReason}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 lg:border-t-0 lg:pt-0">
                          <button
                            onClick={() => setPreviewNote(note)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 shadow-xs"
                            title="View and verify document"
                          >
                            <FaEye className="size-3 text-sky-600" /> View Document
                          </button>

                          <button
                            onClick={() => setEditingNote(note)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                          >
                            <FaPenToSquare className="size-3" /> Edit
                          </button>

                          {modSubTab !== "approved" && !note.isDeleted && (
                            <button
                              onClick={() => adminApproveNote(note.id)}
                              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                            >
                              <FaCheck className="size-3" /> Approve
                            </button>
                          )}

                          {modSubTab !== "rejected" && !note.isDeleted && (
                            <button
                              onClick={() => setRejectingNoteId(note.id)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                            >
                              <FaXmark className="size-3" /> Reject
                            </button>
                          )}

                          {note.isDeleted ? (
                            <button
                              onClick={() => adminRestoreNote(note.id)}
                              className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                            >
                              <FaRotateLeft className="size-3" /> Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (confirm("Delete this note?")) {
                                  deleteNote(note.id);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <FaTrash className="size-3" /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Platform & Banner Settings */}
          {activeAdminTab === "settings" && (
            <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-sm backdrop-blur-xl">
              <h2 className="text-xl font-bold text-slate-950">Platform Content & Banner Controls</h2>
              <p className="mt-1 text-xs text-slate-600">
                Update top website announcement banner, hero section text, and global note submission status.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  updateSiteSettings({
                    announcementBanner: form.get("banner")?.toString(),
                    collegeName: form.get("collegeName")?.toString(),
                  });
                  alert("Platform settings saved successfully!");
                }}
                className="mt-6 space-y-5 max-w-2xl"
              >
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <FaBullhorn className="size-4 text-amber-500" />
                    Top Announcement Banner Text
                  </label>
                  <input
                    name="banner"
                    defaultValue={siteSettings.announcementBanner}
                    className="mt-2 block w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none"
                  />
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Displayed at the top eyebrow pill on the homepage.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    College Platform Name
                  </label>
                  <input
                    name="collegeName"
                    defaultValue={siteSettings.collegeName}
                    className="mt-2 block w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none"
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Global Note Submissions</h4>
                      <p className="text-xs text-slate-600">
                        {siteSettings.uploadsEnabled
                          ? "Student note uploading is currently OPEN."
                          : "Student note uploading is PAUSED for maintenance."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateSiteSettings({ uploadsEnabled: !siteSettings.uploadsEnabled })}
                      className="text-2xl text-slate-900"
                    >
                      {siteSettings.uploadsEnabled ? (
                        <FaToggleOn className="size-9 text-emerald-600" />
                      ) : (
                        <FaToggleOff className="size-9 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="rounded-full bg-slate-950 px-6 py-3 text-xs font-semibold text-white shadow-md hover:bg-slate-800"
                  >
                    Save Platform Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Academic Management Panel (Item 14) */}
          {activeAdminTab === "academic" && (
            <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-sm backdrop-blur-xl">
              <h2 className="text-xl font-bold text-slate-950">Academic Structure Management</h2>
              <p className="mt-1 text-xs text-slate-600">
                Centralized management for Academic Years, Courses, Departments, Semesters, and Subjects.
              </p>

              {/* Sub Category Selector */}
              <div className="mt-6 flex flex-wrap gap-2">
                {(["subjects", "departments", "courses", "years", "semesters"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAcademicCat(cat)}
                    className={`capitalize rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                      academicCat === cat ? "bg-slate-950 text-white shadow-xs" : "border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Add Input */}
              <div className="mt-6 flex max-w-md gap-2">
                <input
                  type="text"
                  value={newAcademicInput}
                  onChange={(e) => setNewAcademicInput(e.target.value)}
                  placeholder={`Enter new ${academicCat.slice(0, -1)} name...`}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-900 outline-none"
                />
                <button
                  onClick={() => {
                    if (newAcademicInput.trim()) {
                      addAcademicItem(academicCat, newAcademicInput);
                      setNewAcademicInput("");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  <FaPlus className="size-3" /> Add {academicCat.slice(0, -1)}
                </button>
              </div>

              {/* Academic Items List */}
              <div className="mt-6 space-y-2 max-w-xl">
                {(
                  academicCat === "years"
                    ? academicYears
                    : academicCat === "courses"
                    ? coursesList
                    : academicCat === "departments"
                    ? departmentsList
                    : academicCat === "semesters"
                    ? semestersList
                    : subjectsList
                ).map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 text-xs shadow-2xs"
                  >
                    <span className="font-semibold text-slate-900">{item}</span>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${item}" from ${academicCat}?`)) {
                          deleteAcademicItem(academicCat, item);
                        }
                      }}
                      className="font-semibold text-rose-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: User Directory */}
          {activeAdminTab === "users" && (
            <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-sm backdrop-blur-xl">
              <h2 className="text-xl font-bold text-slate-950">Student User Management</h2>
              <p className="mt-1 text-xs text-slate-600">
                View registered student accounts, active status, upload counts, and admin roles.
              </p>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-4">Student Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Uploads</th>
                      <th className="p-4">Account Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {usersList.map((u) => {
                      const userUploads = notes.filter((n) => n.uploaderId === u.id).length;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-bold text-slate-950">{u.name}</td>
                          <td className="p-4">{u.email}</td>
                          <td className="p-4">{u.department}</td>
                          <td className="p-4">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              u.role === "admin" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 font-semibold">{userUploads} notes</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                              u.status === "Suspended" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {u.status === "Suspended" ? <FaUserSlash className="size-3" /> : <FaUserCheck className="size-3" />}
                              {u.status || "Active"}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => toggleUserStatus(u.id)}
                              className="text-xs font-semibold text-slate-700 hover:underline"
                            >
                              {u.status === "Suspended" ? "Activate" : "Suspend"}
                            </button>
                            <button
                              onClick={() => toggleUserRole(u.id)}
                              className="text-xs font-semibold text-slate-700 hover:underline"
                            >
                              {u.role === "admin" ? "Make Student" : "Make Admin"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: Analytics */}
          {activeAdminTab === "analytics" && (
            <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-sm backdrop-blur-xl">
              <h2 className="text-xl font-bold text-slate-950">Platform Health & Analytics</h2>
              <p className="mt-1 text-xs text-slate-600">
                Key metrics and distribution breakdown for NotesHub.
              </p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
                  <h3 className="text-sm font-bold text-slate-900">Note Status Distribution</h3>
                  <div className="mt-4 space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold">
                        <span>Approved Notes ({approvedNotes.length})</span>
                        <span>{Math.round((approvedNotes.length / (notes.length || 1)) * 100)}%</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${(approvedNotes.length / (notes.length || 1)) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold">
                        <span>Pending Notes ({pendingNotes.length})</span>
                        <span>{Math.round((pendingNotes.length / (notes.length || 1)) * 100)}%</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${(pendingNotes.length / (notes.length || 1)) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold">
                        <span>Rejected Notes ({rejectedNotes.length})</span>
                        <span>{Math.round((rejectedNotes.length / (notes.length || 1)) * 100)}%</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${(rejectedNotes.length / (notes.length || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
                  <h3 className="text-sm font-bold text-slate-900">Top Departments by Notes</h3>
                  <div className="mt-4 space-y-2 text-xs">
                    {departmentsList.map((dept) => {
                      const count = notes.filter((n) => n.department === dept).length;
                      return (
                        <div key={dept} className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-medium text-slate-700">{dept}</span>
                          <span className="font-bold text-slate-950">{count} notes</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Activity Audit Logs (Item 17) */}
          {activeAdminTab === "logs" && (
            <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-sm backdrop-blur-xl">
              <h2 className="text-xl font-bold text-slate-950">Activity Audit Feed</h2>
              <p className="mt-1 text-xs text-slate-600">
                Real-time record of all administrative and student actions across NotesHub.
              </p>

              <div className="mt-6 space-y-3">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 text-xs sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        log.type === "note"
                          ? "bg-blue-100 text-blue-800"
                          : log.type === "user"
                          ? "bg-purple-100 text-purple-800"
                          : log.type === "academic"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-800"
                      }`}>
                        {log.type}
                      </span>
                      <div>
                        <span className="font-bold text-slate-950">{log.actor}</span>{" "}
                        <span className="font-medium text-slate-600">{log.action}:</span>{" "}
                        <span className="font-semibold text-slate-900">{log.target}</span>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Reject Reason Modal */}
      <AnimatePresence>
        {rejectingNoteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setRejectingNoteId(null)} />
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-950">Provide Rejection Reason</h3>
              <p className="mt-1 text-xs text-slate-600">
                This reason will be visible to the uploader in their My Notes dashboard so they can correct their upload.
              </p>

              <textarea
                rows={4}
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                placeholder="e.g. Incomplete notes, unreadable handwritten scan, missing pages 4-8..."
                className="mt-4 block w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-900 outline-none focus:border-slate-900"
              />

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setRejectingNoteId(null)}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!rejectionReasonText.trim()) {
                      alert("Please provide a reason for rejection.");
                      return;
                    }
                    adminRejectNote(rejectingNoteId, rejectionReasonText);
                    setRejectingNoteId(null);
                    setRejectionReasonText("");
                  }}
                  className="rounded-full bg-rose-600 px-5 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Note Document Viewer Modal */}
      <NoteViewer
        note={{
          fileUrl: previewNote?.fileUrl,
          fileName: previewNote?.fileName || "Document.pdf",
          fileType: previewNote?.fileType || "PDF Document",
          title: previewNote?.title || "Note",
        }}
        isOpen={!!previewNote}
        onClose={() => setPreviewNote(null)}
        actions={
          previewNote && !previewNote.isDeleted ? (
            <div className="flex items-center gap-2">
              {previewNote.status !== "Approved" && (
                <button
                  onClick={() => {
                    adminApproveNote(previewNote.id);
                    setPreviewNote(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  <FaCheck className="size-3" /> Approve
                </button>
              )}
              {previewNote.status !== "Rejected" && (
                <button
                  onClick={() => {
                    const id = previewNote.id;
                    setPreviewNote(null);
                    setRejectingNoteId(id);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
                >
                  <FaXmark className="size-3" /> Reject
                </button>
              )}
            </div>
          ) : undefined
        }
      />

      {/* Admin Metadata Edit Modal */}
      <AnimatePresence>
        {editingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setEditingNote(null)} />
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-950">Administrator Note Metadata Edit</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  updateNote(editingNote.id, {
                    title: form.get("title")?.toString(),
                    subject: form.get("subject")?.toString(),
                    course: form.get("course")?.toString(),
                    department: form.get("department")?.toString(),
                    semester: form.get("semester")?.toString(),
                    academicYear: form.get("academicYear")?.toString(),
                  });
                  setEditingNote(null);
                }}
                className="mt-4 space-y-3 text-xs text-slate-700"
              >
                <div>
                  <label className="block font-semibold">Title</label>
                  <input
                    name="title"
                    defaultValue={editingNote.title}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold">Subject</label>
                    <input
                      name="subject"
                      defaultValue={editingNote.subject}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">Course</label>
                    <input
                      name="course"
                      defaultValue={editingNote.course}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold">Department</label>
                    <input
                      name="department"
                      defaultValue={editingNote.department}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">Semester</label>
                    <input
                      name="semester"
                      defaultValue={editingNote.semester}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold">Academic Year</label>
                  <input
                    name="academicYear"
                    defaultValue={editingNote.academicYear}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingNote(null)}
                    className="rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-slate-950 px-5 py-2 font-semibold text-white hover:bg-slate-800"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
