"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FaMagnifyingGlass,
  FaDownload,
  FaBookmark,
  FaRegBookmark,
  FaXmark,
  FaCalendar,
  FaUser,
  FaGraduationCap,
  FaBookOpen,
  FaBuildingColumns,
  FaLayerGroup,
  FaFilePdf,
} from "react-icons/fa6";
import { Navbar } from "@/components/ui/navbar";
import {
  Reveal,
  Stagger,
  StaggerItem,
} from "@/components/ui/motion-presets";
import { SectionBg } from "@/components/ui/section-bg";
import { useNotesStore, AcademicNote } from "@/lib/notes-store";

export default function BrowsePage() {
  const {
    approvedNotes,
    bookmarks,
    toggleBookmark,
    academicYears,
    coursesList,
    departmentsList,
    semestersList,
    subjectsList,
    isLoaded,
  } = useNotesStore();

  /* State filters */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedSemester, setSelectedSemester] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [sortBy, setSortBy] = useState<"recent" | "downloads">("recent");

  /* Note detail modal */
  const [activeNote, setActiveNote] = useState<AcademicNote | null>(null);

  /* Extract unique combined options */
  const years = ["All", ...Array.from(new Set([...academicYears, ...approvedNotes.map((n) => n.academicYear)]))];
  const courses = ["All", ...Array.from(new Set([...coursesList, ...approvedNotes.map((n) => n.course)]))];
  const departments = ["All", ...Array.from(new Set([...departmentsList, ...approvedNotes.map((n) => n.department)]))];
  const semesters = ["All", ...Array.from(new Set([...semestersList, ...approvedNotes.map((n) => n.semester)]))];
  const subjects = ["All", ...Array.from(new Set([...subjectsList, ...approvedNotes.map((n) => n.subject)]))];

  /* Filter logic */
  const filteredNotes = approvedNotes.filter((n) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.subject.toLowerCase().includes(q) ||
      n.course.toLowerCase().includes(q) ||
      n.department.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q);

    const matchesYear = selectedYear === "All" || n.academicYear === selectedYear;
    const matchesCourse = selectedCourse === "All" || n.course === selectedCourse;
    const matchesDept = selectedDept === "All" || n.department === selectedDept;
    const matchesSem = selectedSemester === "All" || n.semester === selectedSemester;
    const matchesSub = selectedSubject === "All" || n.subject === selectedSubject;

    return matchesQuery && matchesYear && matchesCourse && matchesDept && matchesSem && matchesSub;
  });

  if (sortBy === "downloads") {
    filteredNotes.sort((a, b) => b.downloadCount - a.downloadCount);
  } else {
    filteredNotes.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-950 antialiased">
      <Navbar />

      {/* Header section */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-slate-50 pt-32 pb-16">
        <SectionBg />

        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Browse Notes
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-3 max-w-3xl text-balance text-5xl font-medium leading-[0.95] tracking-[-0.05em] text-slate-950 md:text-6xl">
              Search administrator-approved notes{" "}
              <span className="italic font-normal">for our college.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-xl text-pretty text-slate-700">
              Explore verified study materials categorized by Academic Year, Course, Department, Semester, and Subject.
            </p>
          </Reveal>

          {/* Search Bar */}
          <Reveal delay={0.18}>
            <div className="mt-8 flex w-full max-w-3xl items-center rounded-full border border-white/70 bg-white/70 p-1.5 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.15)] backdrop-blur-xl">
              <span className="pl-4 text-slate-500">
                <FaMagnifyingGlass className="size-4" />
              </span>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, subject, department, or course code..."
                className="w-full bg-transparent px-3 py-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="pr-3 text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  Clear
                </button>
              )}
            </div>
          </Reveal>

          {/* Filters Bar */}
          <Reveal delay={0.24} className="mt-6">
            <div className="grid gap-3 rounded-3xl border border-white/70 bg-white/60 p-4 shadow-sm backdrop-blur-md sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {/* Academic Year */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Academic Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 outline-none transition-colors hover:border-slate-300"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Course */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 outline-none transition-colors hover:border-slate-300"
                >
                  {courses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Department
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 outline-none transition-colors hover:border-slate-300"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Semester
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 outline-none transition-colors hover:border-slate-300"
                >
                  {semesters.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 outline-none transition-colors hover:border-slate-300"
                >
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "recent" | "downloads")}
                  className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 outline-none transition-colors hover:border-slate-300"
                >
                  <option value="recent">Most Recent</option>
                  <option value="downloads">Most Downloaded</option>
                </select>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Grid Section */}
      <section className="relative bg-slate-50 py-12">
        <div className="mx-auto w-full max-w-[1280px] px-6">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Showing {filteredNotes.length} Administrator-Approved {filteredNotes.length === 1 ? "Note" : "Notes"}
            </p>
            {(selectedYear !== "All" || selectedCourse !== "All" || selectedDept !== "All" || selectedSemester !== "All" || selectedSubject !== "All" || searchQuery) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedYear("All");
                  setSelectedCourse("All");
                  setSelectedDept("All");
                  setSelectedSemester("All");
                  setSelectedSubject("All");
                }}
                className="text-xs font-semibold text-slate-700 underline-offset-2 hover:underline"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {!isLoaded ? (
            <div className="py-20 text-center text-sm text-slate-500">Loading approved notes...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="rounded-3xl border border-white/70 bg-white/60 p-12 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">No approved notes found</h3>
              <p className="mt-1 text-sm text-slate-600">
                Try adjusting your search query or resetting your category filters.
              </p>
            </div>
          ) : (
            <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note) => {
                const isBookmarked = bookmarks.includes(note.id);
                return (
                  <StaggerItem key={note.id}>
                    <motion.article
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 320, damping: 22 }}
                      onClick={() => setActiveNote(note)}
                      className="group flex cursor-pointer flex-col justify-between rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-all hover:bg-white hover:shadow-[0_20px_48px_-16px_rgba(15,23,42,0.2)]"
                    >
                      <div>
                        {/* Tags */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex rounded-full bg-slate-950 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                            {note.subject}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(note.id);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-900"
                            title={isBookmarked ? "Remove Bookmark" : "Bookmark Note"}
                          >
                            {isBookmarked ? (
                              <FaBookmark className="size-4 text-amber-500" />
                            ) : (
                              <FaRegBookmark className="size-4" />
                            )}
                          </button>
                        </div>

                        {/* Title */}
                        <h3 className="mt-3 text-lg font-semibold leading-snug text-slate-950 group-hover:text-slate-800">
                          {note.title}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
                          {note.description}
                        </p>

                        {/* Metadata Pills */}
                        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                          <div className="rounded-xl bg-slate-100/80 px-2.5 py-1.5 font-medium">
                            <span className="text-slate-400">Course:</span> {note.course}
                          </div>
                          <div className="rounded-xl bg-slate-100/80 px-2.5 py-1.5 font-medium">
                            <span className="text-slate-400">Sem:</span> {note.semester}
                          </div>
                          <div className="rounded-xl bg-slate-100/80 px-2.5 py-1.5 font-medium col-span-2 truncate">
                            <span className="text-slate-400">Dept:</span> {note.department}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <FaUser className="size-3 text-slate-400" /> {note.uploaderName}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <FaDownload className="size-3 text-slate-400" /> {note.downloadCount}
                        </span>
                      </div>
                    </motion.article>
                  </StaggerItem>
                );
              })}
            </Stagger>
          )}
        </div>
      </section>

      {/* Note Detail Modal */}
      <AnimatePresence>
        {activeNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveNote(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/70 bg-white p-6 shadow-2xl md:p-8"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                    Administrator Approved
                  </span>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
                    {activeNote.title}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveNote(null)}
                  className="grid size-8 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  <FaXmark className="size-4" />
                </button>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {activeNote.description}
              </p>

              {/* Full Academic Structure Info */}
              <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <FaBookOpen className="size-4 text-slate-400" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Subject</span>
                    <span className="font-semibold">{activeNote.subject}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <FaGraduationCap className="size-4 text-slate-400" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Course</span>
                    <span className="font-semibold">{activeNote.course}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <FaBuildingColumns className="size-4 text-slate-400" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Department</span>
                    <span className="font-semibold">{activeNote.department}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <FaLayerGroup className="size-4 text-slate-400" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Semester & Year</span>
                    <span className="font-semibold">{activeNote.semester} ({activeNote.academicYear})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <FaUser className="size-4 text-slate-400" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Uploader</span>
                    <span className="font-semibold">{activeNote.uploaderName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <FaCalendar className="size-4 text-slate-400" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Upload Date</span>
                    <span className="font-semibold">{activeNote.uploadDate}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <FaFilePdf className="size-4 text-rose-500" />
                  <span>{activeNote.fileName} ({activeNote.fileSize})</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleBookmark(activeNote.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    {bookmarks.includes(activeNote.id) ? (
                      <>
                        <FaBookmark className="size-3.5 text-amber-500" />
                        Bookmarked
                      </>
                    ) : (
                      <>
                        <FaRegBookmark className="size-3.5" />
                        Bookmark Note
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => alert(`Downloading ${activeNote.fileName}`)}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-slate-800"
                  >
                    <FaDownload className="size-3.5" />
                    Download Note ({activeNote.downloadCount})
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
