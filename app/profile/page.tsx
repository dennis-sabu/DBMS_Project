"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FaUser,
  FaEnvelope,
  FaGraduationCap,
  FaBuildingColumns,
  FaLayerGroup,
  FaArrowRight,
  FaPenToSquare,
  FaBookmark,
  FaCalendarDays,
  FaShieldHalved,
  FaXmark,
} from "react-icons/fa6";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { SectionBg } from "@/components/ui/section-bg";
import { useNotesStore } from "@/lib/notes-store";

export default function ProfilePage() {
  const router = useRouter();
  const {
    currentUser,
    myNotes,
    bookmarks,
    logout,
    updateUserProfile,
    academicYears,
    coursesList,
    departmentsList,
    isLoaded,
  } = useNotesStore();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editCourse, setEditCourse] = useState("");
  const [editYear, setEditYear] = useState("");

  if (!isLoaded) return null;

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-slate-50 font-sans text-slate-950 antialiased">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center px-6 pt-32">
          <div className="rounded-3xl border border-white/70 bg-white/70 p-10 text-center shadow-lg backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-slate-950">Sign in to view your profile</h2>
            <p className="mt-2 text-sm text-slate-600">Authentication is required to manage your profile and view stats.</p>
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

  const approvedCount = myNotes.filter((n) => n.status === "Approved").length;
  const pendingCount = myNotes.filter((n) => n.status === "Pending").length;
  const rejectedCount = myNotes.filter((n) => n.status === "Rejected").length;

  function openEditModal() {
    if (!currentUser) return;
    setEditName(currentUser.name);
    setEditDept(currentUser.department);
    setEditCourse(currentUser.course);
    setEditYear(currentUser.academicYear);
    setShowEditModal(true);
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;

    updateUserProfile(currentUser.id, {
      name: editName,
      department: editDept,
      course: editCourse,
      academicYear: editYear,
    });

    setShowEditModal(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-950 antialiased">
      <Navbar />

      <section className="relative isolate overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-slate-50 pt-32 pb-12">
        <SectionBg />
        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Student Profile
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                  currentUser.role === "admin" ? "bg-amber-500 text-slate-950" : "bg-slate-950 text-white"
                }`}>
                  {currentUser.role === "admin" ? "Administrator" : "Verified Student"}
                </span>
              </div>
              <h1 className="mt-2 text-4xl font-medium tracking-tight text-slate-950 md:text-5xl">
                {currentUser.name}
              </h1>
              <p className="mt-1 text-sm text-slate-700">{currentUser.email}</p>
            </div>

            <button
              onClick={openEditModal}
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-5 py-2.5 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur-xl transition-all hover:bg-white"
            >
              <FaPenToSquare className="size-3.5 text-slate-700" /> Edit Profile
            </button>
          </div>
        </div>
      </section>

      <section className="relative bg-slate-50 py-10">
        <div className="mx-auto w-full max-w-5xl px-6">
          {/* User Stats Breakdown Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <motion.div whileHover={{ y: -2 }} className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-sm">
              <div className="text-2xl font-bold text-slate-950">{myNotes.length}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase text-slate-500">Total Uploads</div>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-sm">
              <div className="text-2xl font-bold text-amber-500">{pendingCount}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase text-slate-500">Pending Review</div>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-sm">
              <div className="text-2xl font-bold text-emerald-600">{approvedCount}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase text-slate-500">Approved Notes</div>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-sm">
              <div className="text-2xl font-bold text-rose-600">{rejectedCount}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase text-slate-500">Rejected Notes</div>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-sm">
              <div className="text-2xl font-bold text-violet-600">{bookmarks.length}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase text-slate-500">Bookmarks</div>
            </motion.div>
          </div>

          {/* Academic Details Card */}
          <div className="mt-8 rounded-3xl border border-white/70 bg-white/80 p-8 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-950">Academic Information</h3>
              <button
                onClick={openEditModal}
                className="text-xs font-semibold text-slate-700 underline-offset-2 hover:underline"
              >
                Change Details
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3.5 rounded-2xl bg-slate-50 p-4">
                <FaBuildingColumns className="size-5 text-slate-400" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Department</span>
                  <span className="text-sm font-semibold text-slate-900">{currentUser.department}</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl bg-slate-50 p-4">
                <FaGraduationCap className="size-5 text-slate-400" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Course</span>
                  <span className="text-sm font-semibold text-slate-900">{currentUser.course}</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl bg-slate-50 p-4">
                <FaLayerGroup className="size-5 text-slate-400" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Academic Year</span>
                  <span className="text-sm font-semibold text-slate-900">{currentUser.academicYear}</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl bg-slate-50 p-4">
                <FaEnvelope className="size-5 text-slate-400" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">College Email</span>
                  <span className="text-sm font-semibold text-slate-900">{currentUser.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl bg-slate-50 p-4">
                <FaCalendarDays className="size-5 text-slate-400" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Member Since</span>
                  <span className="text-sm font-semibold text-slate-900">{currentUser.joinDate || "2025-01-10"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-2xl bg-slate-50 p-4">
                <FaShieldHalved className="size-5 text-slate-400" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Account Type</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {currentUser.role === "admin" ? "NotesHub Administrator" : "Student Member"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-3">
                <Link
                  href="/my-notes"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Manage My Uploads <FaArrowRight className="size-3" />
                </Link>

                <Link
                  href="/bookmarks"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <FaBookmark className="size-3 text-amber-500" /> Bookmarks ({bookmarks.length})
                </Link>
              </div>

              <button
                onClick={async () => {
                  await logout();
                  router.push("/");
                  router.refresh();
                }}
                className="rounded-full border border-rose-200 bg-rose-50 px-5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-950">Edit Student Profile</h3>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-950">
                  <FaXmark className="size-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="mt-4 space-y-4 text-xs text-slate-700">
                <div>
                  <label className="block font-semibold">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 block w-full rounded-2xl border border-slate-200 p-3 text-sm font-medium text-slate-900 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold">Department</label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="mt-1 block w-full rounded-2xl border border-slate-200 p-3 text-xs font-medium text-slate-900 outline-none"
                  >
                    {departmentsList.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold">Course</label>
                    <select
                      value={editCourse}
                      onChange={(e) => setEditCourse(e.target.value)}
                      className="mt-1 block w-full rounded-2xl border border-slate-200 p-3 text-xs font-medium text-slate-900 outline-none"
                    >
                      {coursesList.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold">Academic Year</label>
                    <select
                      value={editYear}
                      onChange={(e) => setEditYear(e.target.value)}
                      className="mt-1 block w-full rounded-2xl border border-slate-200 p-3 text-xs font-medium text-slate-900 outline-none"
                    >
                      {academicYears.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500">
                  Note: Email address and account roles are managed securely by administrators.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="rounded-full px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-slate-950 px-6 py-2.5 font-semibold text-white hover:bg-slate-800"
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
