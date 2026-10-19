"use client";

import { motion, AnimatePresence } from "motion/react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  FaCloudArrowUp,
  FaFile,
  FaFilePdf,
  FaFileWord,
  FaFilePowerpoint,
  FaFileImage,
  FaXmark,
  FaArrowRight,
  FaCheck,
  FaCircleExclamation,
  FaLock,
} from "react-icons/fa6";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useNotesStore } from "@/lib/notes-store";
import { createClient } from "@/lib/supabase/client";
import { CustomSelect } from "@/components/ui/custom-select";
import {
  ALL_DEPARTMENTS,
  ALL_COURSES,
  ALL_SEMESTERS,
  FILTER_CONFIG,
  getSemestersForProgram,
  getSubjectsForProgramSemester,
  getLevelForProgram,
  getProgramsForLevel,
} from "@/lib/filter-config";

/**
 * Uploads a file straight to Supabase Storage using a signed upload URL
 * issued by /api/upload. Avoids routing the file bytes through the server.
 */
async function uploadNoteFile(
  file: File,
  uploaderId?: string,
  token?: string
): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const metaRes = await fetch("/api/upload", {
    method: "POST",
    headers,
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      uploaderId,
    }),
  });
  const meta = await metaRes.json();
  if (!metaRes.ok) {
    throw new Error(meta.error || "Could not prepare the upload.");
  }

  const supabase = createClient();
  const { error } = await supabase.storage
    .from("notes")
    .uploadToSignedUrl(meta.path, meta.token, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) throw error;
  return meta.publicUrl as string;
}

const ACCEPTED = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
];
const MAX_SIZE_MB = 50;

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return FaFilePdf;
  if (ext === "doc" || ext === "docx") return FaFileWord;
  if (ext === "ppt" || ext === "pptx") return FaFilePowerpoint;
  if (["png", "jpg", "jpeg", "webp", "heic"].includes(ext ?? "")) return FaFileImage;
  return FaFile;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, hint, required, children }: FieldProps) {
  return (
    <div className="block">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </span>
        {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

const inputClass =
  "block w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 transition-colors focus:border-slate-900/30 focus:bg-white focus:ring-2 focus:ring-slate-900/10";

interface FormErrors {
  title?: string;
  description?: string;
  academicYear?: string;
  course?: string;
  department?: string;
  semester?: string;
  subject?: string;
  file?: string;
}

export function UploadNoteForm() {
  const {
    currentUser,
    addNote,
    academicYears,
  } = useNotesStore();

  // Controlled selectors — cascading: Course → Department → Semester → Subject
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Derive available departments (programs) for selected course level
  const departmentOptions = selectedCourse
    ? getProgramsForLevel(selectedCourse).map((p) => p.name)
    : ALL_DEPARTMENTS;

  // Derive available semesters for selected department (program)
  const semesterOptions = selectedDept
    ? getSemestersForProgram(selectedDept)
    : ALL_SEMESTERS;

  // Derive subjects from the static config — the single source of truth
  const subjectOptions = (selectedDept && selectedSemester)
    ? getSubjectsForProgramSemester(selectedDept, selectedSemester)
    : [];

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleFile(fileToAdd: File) {
    if (!ACCEPTED.includes(fileToAdd.type) && !fileToAdd.name.match(/\.(pdf|ppt|pptx|doc|docx|png|jpe?g|webp|heic)$/i)) {
      setErrors((e) => ({ ...e, file: "Unsupported file type." }));
      return;
    }
    if (fileToAdd.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrors((e) => ({ ...e, file: `File must be under ${MAX_SIZE_MB} MB.` }));
      return;
    }
    setErrors((e) => ({ ...e, file: undefined }));
    setFile(fileToAdd);
  }

  function onFileInput(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!currentUser) return;

    const form = new FormData(e.currentTarget);
    const nextErrors: FormErrors = {};

    const title = form.get("title")?.toString().trim() || "";
    const description = form.get("description")?.toString().trim() || "";
    const academicYear = selectedAcademicYear || form.get("academicYear")?.toString().trim() || "";
    const course = selectedCourse || form.get("course")?.toString().trim() || "";
    const department = selectedDept || form.get("department")?.toString().trim() || "";
    const semester = selectedSemester || form.get("semester")?.toString().trim() || "";
    const subject = selectedSubject || form.get("subject")?.toString().trim() || "";

    if (!title) nextErrors.title = "Add a title.";
    if (!description) nextErrors.description = "Provide a brief description.";
    if (!academicYear) nextErrors.academicYear = "Select academic year.";
    if (!course) nextErrors.course = "Select course.";
    if (!department) nextErrors.department = "Select department.";
    if (!semester) nextErrors.semester = "Select semester.";
    if (!subject) nextErrors.subject = "Select or enter subject.";
    if (!file) nextErrors.file = "Attach a PDF or document file.";

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);

    try {
      let fileUrl: string | undefined;
      if (file) {
        let token: string | undefined;
        try {
          const supabase = createClient();
          const { data: sessionData } = await supabase.auth.getSession();
          token = sessionData?.session?.access_token;
        } catch {
          // Token retrieval failed, will fall back to uploaderId verification
        }
        fileUrl = await uploadNoteFile(file, currentUser.id, token);
      }

      const savedNote = await addNote({
        title,
        description,
        academicYear,
        course,
        department,
        semester,
        subject,
        uploaderId: currentUser.id,
        uploaderName: currentUser.name,
        fileName: file ? file.name : "Document.pdf",
        fileSize: file ? formatSize(file.size) : "2.5 MB",
        fileType: file ? file.type : "PDF Document",
        fileUrl,
      });

      if (!savedNote) {
        throw new Error("Note could not be saved. Please try again.");
      }

      setSelectedAcademicYear("");
      setSelectedCourse("");
      setSelectedDept("");
      setSelectedSemester("");
      setSelectedSubject("");
      setFile(null);
      setSubmitted(true);

      // Notify other open components (e.g. admin page) that new notes are available
      window.dispatchEvent(new CustomEvent("notes-updated"));
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        file:
          err instanceof Error
            ? `Upload failed: ${err.message}`
            : "Upload failed. Please try again.",
      }));
    } finally {
      setSubmitting(false);
    }
  }

  /* Auth gate */
  if (!currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl border border-white/70 bg-white/65 p-10 text-center shadow-[0_18px_40px_-22px_rgba(15,23,42,0.18)] backdrop-blur-2xl"
      >
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-950 text-white shadow-[0_10px_30px_-10px_rgba(15,23,42,0.5)]">
          <FaLock className="size-5" />
        </div>
        <h2 className="mt-5 text-2xl font-medium tracking-[-0.04em] text-slate-950">
          Sign in to upload notes
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-pretty text-slate-600">
          Uploading notes requires an authenticated account.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-5 py-3 text-sm font-medium text-slate-900 backdrop-blur-xl transition-colors hover:bg-white"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(15,23,42,0.5)] transition-colors hover:bg-slate-800"
          >
            Create account
            <FaArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </motion.div>
    );
  }

  /* Success state */
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl border border-white/70 bg-white/65 p-10 text-center shadow-[0_18px_40px_-22px_rgba(15,23,42,0.18)] backdrop-blur-2xl"
      >
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-amber-500 text-white shadow-[0_10px_30px_-10px_rgba(245,158,11,0.5)]">
          <FaCheck className="size-6" />
        </div>
        <div className="mt-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800">
          Status: Pending Approval
        </div>
        <h2 className="mt-3 text-2xl font-medium tracking-[-0.04em] text-slate-950">
          Submitted for Administrator Review
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-pretty text-slate-600">
          Your note has been uploaded and is currently <strong>Pending</strong>.
          A NotesHub Administrator will review your note for approval. Once approved,
          it will be publicly visible to all students on campus.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/my-notes"
            className="inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Track in My Notes
          </Link>
          <button
            onClick={() => {
              setSubmitted(false);
              setFile(null);
              setSelectedAcademicYear("");
              setSelectedCourse("");
              setSelectedDept("");
              setSelectedSemester("");
              setSelectedSubject("");
            }}
            className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-5 py-3 text-sm font-medium text-slate-900 backdrop-blur-xl transition-colors hover:bg-white"
          >
            Upload another note
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl border border-white/70 bg-white/65 p-6 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.18)] backdrop-blur-2xl md:p-8"
    >
      <div className="space-y-5">
        {/* Title */}
        <Field label="Note Title" required hint="Specific & descriptive">
          <input
            id="title"
            name="title"
            type="text"
            placeholder='e.g. "Database Management Systems — ER Diagrams & SQL"'
            className={cn(inputClass, errors.title && "border-rose-300 focus:border-rose-400 focus:ring-rose-400/20")}
          />
          {errors.title && <FieldError msg={errors.title} />}
        </Field>

        {/* Academic Year & Course (Level) */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Academic Year" required>
            <CustomSelect
              id="academicYear"
              name="academicYear"
              value={selectedAcademicYear}
              onChange={(val) => {
                setSelectedAcademicYear(val);
                if (errors.academicYear) setErrors((e) => ({ ...e, academicYear: undefined }));
              }}
              options={academicYears}
              placeholder="Select Academic Year..."
              error={Boolean(errors.academicYear)}
            />
            {errors.academicYear && <FieldError msg={errors.academicYear} />}
          </Field>

          <Field label="Course" required>
            <CustomSelect
              id="course"
              name="course"
              value={selectedCourse}
              onChange={(val) => {
                setSelectedCourse(val);
                setSelectedDept("");
                setSelectedSemester("");
                setSelectedSubject("");
                if (errors.course) setErrors((e) => ({ ...e, course: undefined }));
              }}
              options={ALL_COURSES}
              placeholder="Select Course..."
              error={Boolean(errors.course)}
            />
            {errors.course && <FieldError msg={errors.course} />}
          </Field>
        </div>

        {/* Department (Program) & Semester */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Department" required>
            <CustomSelect
              id="department"
              name="department"
              value={selectedDept}
              onChange={(val) => {
                setSelectedDept(val);
                setSelectedSemester("");
                setSelectedSubject("");
                if (errors.department) setErrors((e) => ({ ...e, department: undefined }));
              }}
              options={departmentOptions}
              placeholder={!selectedCourse ? "Select Course first..." : "Select Department..."}
              disabled={!selectedCourse}
              disabledMessage="Select Course first..."
              searchable={true}
              searchPlaceholder="Search department..."
              error={Boolean(errors.department)}
            />
            {errors.department && <FieldError msg={errors.department} />}
          </Field>

          <Field label="Semester" required>
            <CustomSelect
              id="semester"
              name="semester"
              value={selectedSemester}
              onChange={(val) => {
                setSelectedSemester(val);
                setSelectedSubject("");
                if (errors.semester) setErrors((e) => ({ ...e, semester: undefined }));
              }}
              options={semesterOptions}
              placeholder={!selectedDept ? "Select Department first..." : "Select Semester..."}
              disabled={!selectedDept}
              disabledMessage="Select Department first..."
              error={Boolean(errors.semester)}
            />
            {errors.semester && <FieldError msg={errors.semester} />}
          </Field>
        </div>

        {/* Subject */}
        <Field label="Subject" required hint="Based on program & semester">
          <CustomSelect
            id="subject"
            name="subject"
            value={selectedSubject}
            onChange={(val) => {
              setSelectedSubject(val);
              if (errors.subject) setErrors((e) => ({ ...e, subject: undefined }));
            }}
            options={subjectOptions}
            placeholder={
              !selectedDept || !selectedSemester
                ? "Select Department & Semester first..."
                : subjectOptions.length === 0
                ? "No subjects found for this selection"
                : "Select Subject..."
            }
            disabled={!selectedDept || !selectedSemester || subjectOptions.length === 0}
            disabledMessage={
              !selectedDept || !selectedSemester
                ? "Select Department & Semester first..."
                : "No subjects found for this selection"
            }
            searchable={true}
            searchPlaceholder="Search subject name..."
            error={Boolean(errors.subject)}
          />
          {errors.subject && <FieldError msg={errors.subject} />}
        </Field>

        {/* Description */}
        <Field label="Description" required hint="Overview of topics covered">
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Describe what chapters, topics, or exam questions this document covers..."
            className={cn(inputClass, "resize-y", errors.description && "border-rose-300 focus:border-rose-400 focus:ring-rose-400/20")}
          />
          {errors.description && <FieldError msg={errors.description} />}
        </Field>

        {/* File Upload */}
        <Field label="File" required hint={`PDF or document file · max ${MAX_SIZE_MB} MB`}>
          <input
            ref={fileInputRef}
            id="file"
            name="file"
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.heic"
            onChange={onFileInput}
            className="sr-only"
          />
          {!file ? (
            <label
              htmlFor="file"
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-white/60 px-6 py-10 text-center transition-colors",
                dragOver
                  ? "border-slate-900 bg-white"
                  : "border-slate-300 hover:border-slate-400 hover:bg-white"
              )}
            >
              <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-[0_10px_30px_-10px_rgba(124,58,237,0.5)]">
                <FaCloudArrowUp className="size-5" />
              </div>
              <div className="mt-3 text-sm font-semibold text-slate-900">
                Drop your note file here
              </div>
              <div className="mt-1 text-xs text-slate-500">
                or <span className="font-semibold text-slate-900">browse</span> from your device
              </div>
            </label>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/85 p-4">
              {(() => {
                const Icon = fileIcon(file.name);
                return (
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white">
                    <Icon className="size-4" />
                  </span>
                );
              })()}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {file.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  {formatSize(file.size)} · Ready to submit for review
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-900/5 text-slate-600 transition-colors hover:bg-rose-500 hover:text-white"
                aria-label="Remove file"
              >
                <FaXmark className="size-3" />
              </button>
            </div>
          )}
          {errors.file && <FieldError msg={errors.file} />}
        </Field>

        {/* Submit */}
        <div className="flex flex-col-reverse items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={(event) => {
              setFile(null);
              (event.currentTarget as HTMLButtonElement).form?.reset();
              setErrors({});
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white/70 px-5 py-3 text-sm font-medium text-slate-900 backdrop-blur-xl transition-colors hover:bg-white"
          >
            Reset
          </button>
          <motion.button
            type="submit"
            disabled={submitting}
            whileTap={{ scale: 0.96 }}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white shadow-[0_10px_30px_-10px_rgba(15,23,42,0.5)] transition-colors hover:bg-slate-800 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span className="size-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Submitting for Review…
              </>
            ) : (
              <>
                Submit for Administrator Review
                <FaArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.form>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-rose-600"
      >
        <FaCircleExclamation className="size-3" />
        {msg}
      </motion.div>
    </AnimatePresence>
  );
}
