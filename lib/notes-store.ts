"use client";

/**
 * notes-store.ts — Supabase-backed state store for NotesHub.
 *
 * Replaces the previous localStorage implementation.
 * All data is fetched from and written to Supabase.
 * Auth is handled by Supabase Auth (email+password).
 *
 * The hook re-exports the same surface API so all existing
 * page components keep working with minimal changes.
 */

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────────────────────
// Public types (kept compatible with the original store API)
// ─────────────────────────────────────────────────────────────────────────────

export type NoteStatus = "Pending" | "Approved" | "Rejected";

export interface AcademicNote {
  id: string;
  title: string;
  description: string;
  academicYear: string;   // camelCase for UI compatibility
  course: string;
  department: string;
  semester: string;
  subject: string;
  uploaderId: string;
  uploaderName: string;
  uploadDate: string;
  downloadCount: number;
  rating: number;
  status: NoteStatus;
  rejectionReason?: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileUrl?: string;
  isDeleted?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  academicYear: string;
  course: string;
  role: "user" | "admin";
  status?: "Active" | "Suspended";
  joinDate?: string;
}

export interface SiteSettings {
  announcementBanner: string;
  heroTitle: string;
  heroDescription: string;
  uploadsEnabled: boolean;
  collegeName: string;
}

export interface ActivityLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  type: "note" | "user" | "academic" | "settings";
}

// ─────────────────────────────────────────────────────────────────────────────
// Static lists (maintained client-side; can be promoted to DB later)
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_ACADEMIC_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const INITIAL_COURSES = ["B.Tech", "B.Sc", "B.CA", "M.Tech", "M.Sc"];
const INITIAL_DEPARTMENTS = [
  "Artificial Intelligence and Data Science",
  "Basic Sciences & Humanities",
  "Civil Engineering",
  "Computer Science & Engineering",
  "Electrical & Electronics Engineering",
  "Electronics and Communication Engineering",
  "Electronics and Computer Engineering",
  "Electronics and Instrumentation Engineering",
  "Information Technology",
  "Mechanical Engineering",
];
const INITIAL_SEMESTERS = [
  "Semester 1", "Semester 2", "Semester 3", "Semester 4",
  "Semester 5", "Semester 6", "Semester 7", "Semester 8",
];
const INITIAL_SUBJECTS = [
  "Applied Mathematics II", "Database Management Systems",
  "Data Structures & Algorithms", "Digital Logic Design",
  "Linear Algebra", "Operating Systems", "Computer Networks",
  "Software Engineering", "Object Oriented Programming",
];

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcementBanner: "Over 12k notes shared this week",
  heroTitle: "The best notes from\nthe smartest minds on campus.",
  heroDescription:
    "Upload, share, and discover top-quality study materials\nfrom students across your university.",
  uploadsEnabled: true,
  collegeName: "NotesHub College",
};

// ─────────────────────────────────────────────────────────────────────────────
// Mapper: DB row (snake_case) → UI type (camelCase)
// ─────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapNote(row: any): AcademicNote {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    academicYear: row.academic_year,
    course: row.course,
    department: row.department,
    semester: row.semester,
    subject: row.subject,
    uploaderId: row.uploader_id,
    uploaderName: row.uploader_name,
    uploadDate: row.upload_date
      ? new Date(row.upload_date).toISOString().split("T")[0]
      : "",
    downloadCount: row.download_count ?? 0,
    rating: 5.0,
    status: row.status as NoteStatus,
    rejectionReason: row.rejection_reason ?? undefined,
    fileName: row.file_name,
    fileSize: row.file_size,
    fileType: row.file_url
      ? row.file_name?.split(".").pop()?.toUpperCase() + " Document"
      : "PDF Document",
    fileUrl: row.file_url ?? undefined,
    isDeleted: row.is_deleted ?? false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(row: any): UserProfile {
  const isAdmin = row.email === "dennissabu444@gmail.com" || row.role === "admin";
  return {
    id: row.id,
    name: row.name || (isAdmin ? "Dennis Sabu" : "Student"),
    email: row.email,
    department: row.department,
    academicYear: row.academic_year,
    course: row.course,
    role: isAdmin ? "admin" : "user",
    status: row.status as "Active" | "Suspended",
    joinDate: row.join_date,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSettings(row: any): SiteSettings {
  if (!row) return DEFAULT_SITE_SETTINGS;
  return {
    announcementBanner: row.announcement_banner ?? DEFAULT_SITE_SETTINGS.announcementBanner,
    heroTitle: row.hero_title ?? DEFAULT_SITE_SETTINGS.heroTitle,
    heroDescription: row.hero_description ?? DEFAULT_SITE_SETTINGS.heroDescription,
    uploadsEnabled: row.uploads_enabled ?? true,
    collegeName: row.college_name ?? DEFAULT_SITE_SETTINGS.collegeName,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main hook
// ─────────────────────────────────────────────────────────────────────────────

export function useNotesStore() {
  const supabase = createClient();

  const [notes, setNotes] = useState<AcademicNote[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [departmentsList, setDepartmentsList] = useState<string[]>(INITIAL_DEPARTMENTS);
  const [academicYears] = useState<string[]>(INITIAL_ACADEMIC_YEARS);
  const [coursesList] = useState<string[]>(INITIAL_COURSES);
  const [semestersList] = useState<string[]>(INITIAL_SEMESTERS);
  const [subjectsList] = useState<string[]>(INITIAL_SUBJECTS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [activityLogs] = useState<ActivityLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // ── Load auth session + data ──────────────────────────────────────────────
  const loadUserProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (data) {
        setCurrentUser(mapUser(data));
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && user.id === userId) {
          const isAdmin =
            user.email === "dennissabu444@gmail.com" ||
            user.app_metadata?.role === "admin" ||
            user.user_metadata?.role === "admin";

          setCurrentUser({
            id: user.id,
            name:
              (user.user_metadata?.name as string) ||
              user.email?.split("@")[0] ||
              (isAdmin ? "Dennis Sabu" : "Student"),
            email: user.email || "",
            department:
              (user.user_metadata?.department as string) ||
              "Computer Science & Engineering",
            academicYear:
              (user.user_metadata?.academic_year as string) || "4th Year",
            course: (user.user_metadata?.course as string) || "B.Tech",
            role: isAdmin ? "admin" : "user",
            status: "Active",
            joinDate: new Date().toISOString().split("T")[0],
          });
        }
      }
    },
    [supabase]
  );

  const loadNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/notes");
      if (res.ok) {
        const json = await res.json();
        if (json.notes) {
          setNotes(json.notes.map(mapNote));
          return;
        }
      }
    } catch {
      // Fall through to direct supabase
    }

    const { data } = await supabase
      .from("academic_notes")
      .select("*")
      .order("upload_date", { ascending: false });
    if (data) setNotes(data.map(mapNote));
  }, [supabase]);

  const loadDepartments = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("departments")
        .select("name")
        .order("name");
      if (data && data.length > 0) {
        setDepartmentsList(data.map((d) => d.name));
      }
    } catch {
      // Retain INITIAL_DEPARTMENTS fallback
    }
  }, [supabase]);

  const loadSiteSettings = useCallback(async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (data) setSiteSettings(mapSettings(data));
  }, [supabase]);

  const loadBookmarks = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("bookmarks")
        .select("note_id")
        .eq("user_id", userId);
      if (data) setBookmarks(data.map((b) => b.note_id));
    },
    [supabase]
  );

  const loadAllUsers = useCallback(async () => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .order("join_date", { ascending: false });
    if (data) setUsersList(data.map(mapUser));
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      // 1. Get current session
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setAuthUser(user);

      // 2. Load common data
      await Promise.all([loadNotes(), loadDepartments(), loadSiteSettings()]);

      // 3. Load user-specific data
      if (user) {
        await Promise.all([
          loadUserProfile(user.id),
          loadBookmarks(user.id),
          loadAllUsers(),
        ]);
      }

      if (mounted) setIsLoaded(true);
    }

    init();

    // 4. Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      const user = session?.user ?? null;
      setAuthUser(user);

      if (user) {
        await loadUserProfile(user.id);
        await loadBookmarks(user.id);
        await loadAllUsers();
      } else {
        setCurrentUser(null);
        setBookmarks([]);
        setUsersList([]);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived collections ───────────────────────────────────────────────────

  const approvedNotes = notes.filter((n) => n.status === "Approved" && !n.isDeleted);
  const pendingNotes = notes.filter((n) => n.status === "Pending" && !n.isDeleted);
  const rejectedNotes = notes.filter((n) => n.status === "Rejected" && !n.isDeleted);
  const myNotes = currentUser
    ? notes.filter((n) => n.uploaderId === currentUser.id && !n.isDeleted)
    : [];

  // ── Note actions ──────────────────────────────────────────────────────────

  const addNote = async (
    noteData: Omit<AcademicNote, "id" | "uploadDate" | "downloadCount" | "rating" | "status">
  ) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noteData.title,
          description: noteData.description,
          academicYear: noteData.academicYear,
          course: noteData.course,
          department: noteData.department,
          semester: noteData.semester,
          subject: noteData.subject,
          uploaderId: currentUser.id,
          uploaderName: currentUser.name,
          uploaderEmail: currentUser.email, // for profile self-healing
          fileName: noteData.fileName,
          fileSize: noteData.fileSize,
          fileUrl: noteData.fileUrl ?? null,
        }),
      });

      const json = await res.json();
      if (res.ok && json.note) {
        const mapped = mapNote(json.note);
        setNotes((prev) => [mapped, ...prev]);
        return mapped;
      } else if (json.error) {
        console.error("addNote API error:", json.error);
        return undefined;
      }
    } catch (e) {
      console.error("addNote network error:", e);
    }

    return undefined;
  };

  const updateNote = async (id: string, changes: Partial<AcademicNote>) => {
    if (!currentUser) return;
    try {
      // Build patch only with what actually changed
      const patch: Record<string, unknown> = { id };
      if (changes.title !== undefined) patch.title = changes.title;
      if (changes.description !== undefined) patch.description = changes.description;
      if (changes.subject !== undefined) patch.subject = changes.subject;
      if (changes.status !== undefined) patch.status = changes.status;
      if (changes.rejectionReason !== undefined) patch.rejectionReason = changes.rejectionReason;
      if (changes.isDeleted !== undefined) patch.isDeleted = changes.isDeleted;

      await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch {
      // silent
    }

    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...changes } : n))
    );
  };

  const deleteNote = async (id: string) => {
    // Soft delete: mark as deleted in DB
    await updateNote(id, { isDeleted: true });
  };

  const adminApproveNote = async (id: string) => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Approved", adminId: currentUser.id }),
      });
    } catch {
      // fallback
    }
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "Approved", rejectionReason: undefined } : n))
    );
  };

  const adminRejectNote = async (id: string, reason: string) => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: "Rejected",
          rejectionReason: reason,
          adminId: currentUser.id,
        }),
      });
    } catch {
      // fallback
    }
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "Rejected", rejectionReason: reason } : n))
    );
  };

  const adminBatchApprovePending = async () => {
    if (!currentUser || currentUser.role !== "admin") return;
    const ids = pendingNotes.map((n) => n.id);
    if (ids.length === 0) return;

    for (const id of ids) {
      try {
        await fetch("/api/notes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: "Approved", adminId: currentUser.id }),
        });
      } catch {
        // fallback
      }
    }

    setNotes((prev) =>
      prev.map((n) =>
        ids.includes(n.id) ? { ...n, status: "Approved" as NoteStatus } : n
      )
    );
  };

  const adminRestoreNote = async (id: string) => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isDeleted: false, status: "Pending" }),
      });
    } catch {
      // silent
    }
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isDeleted: false, status: "Pending" as NoteStatus } : n))
    );
  };

  // ── Bookmarks ─────────────────────────────────────────────────────────────

  const toggleBookmark = async (noteId: string) => {
    if (!authUser) return;
    const isBookmarked = bookmarks.includes(noteId);

    if (isBookmarked) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", authUser.id)
        .eq("note_id", noteId);
      setBookmarks((prev) => prev.filter((b) => b !== noteId));
    } else {
      await supabase
        .from("bookmarks")
        .insert({ user_id: authUser.id, note_id: noteId });
      setBookmarks((prev) => [...prev, noteId]);
    }
  };

  // ── User profile ──────────────────────────────────────────────────────────

  const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.department !== undefined) patch.department = updates.department;
    if (updates.course !== undefined) patch.course = updates.course;
    if (updates.academicYear !== undefined) patch.academic_year = updates.academicYear;

    const { error } = await supabase.from("users").update(patch).eq("id", userId);

    if (!error) {
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
      );
      if (currentUser && currentUser.id === userId) {
        setCurrentUser((prev) => (prev ? { ...prev, ...updates } : prev));
      }
    } else {
      console.error("updateUserProfile error:", error.message);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    const user = usersList.find((u) => u.id === userId);
    if (!user) return;
    const nextStatus = user.status === "Suspended" ? "Active" : "Suspended";
    await supabase.from("users").update({ status: nextStatus }).eq("id", userId);
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    );
  };

  const toggleUserRole = async (userId: string) => {
    const user = usersList.find((u) => u.id === userId);
    if (!user) return;
    const nextRole = user.role === "admin" ? "user" : "admin";
    await supabase.from("users").update({ role: nextRole }).eq("id", userId);
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u))
    );
  };

  // ── Academic structure (departments from DB; others kept static) ──────────

  const addAcademicItem = async (
    category: "years" | "courses" | "departments" | "semesters" | "subjects",
    item: string
  ) => {
    const val = item.trim();
    if (!val) return;

    if (category === "departments") {
      const { error } = await supabase.from("departments").insert({ name: val });
      if (!error) setDepartmentsList((prev) => [...prev, val].sort());
    }
    // Other categories are static in this build
  };

  const deleteAcademicItem = async (
    category: "years" | "courses" | "departments" | "semesters" | "subjects",
    item: string
  ) => {
    if (category === "departments") {
      const { error } = await supabase.from("departments").delete().eq("name", item);
      if (!error) setDepartmentsList((prev) => prev.filter((d) => d !== item));
    }
  };

  // ── Site settings ─────────────────────────────────────────────────────────

  const updateSiteSettings = async (partial: Partial<SiteSettings>) => {
    const patch: Record<string, unknown> = {};
    if (partial.announcementBanner !== undefined)
      patch.announcement_banner = partial.announcementBanner;
    if (partial.heroTitle !== undefined) patch.hero_title = partial.heroTitle;
    if (partial.heroDescription !== undefined)
      patch.hero_description = partial.heroDescription;
    if (partial.uploadsEnabled !== undefined)
      patch.uploads_enabled = partial.uploadsEnabled;
    if (partial.collegeName !== undefined) patch.college_name = partial.collegeName;

    const { error } = await supabase
      .from("site_settings")
      .update(patch)
      .eq("id", 1);

    if (!error) {
      setSiteSettings((prev) => ({ ...prev, ...partial }));
    } else {
      console.error("updateSiteSettings error:", error.message);
    }
  };

  // ── Auth ──────────────────────────────────────────────────────────────────

  /**
   * Sign up with email + password.
   * Extra profile fields (name, department, etc.) are passed as user_metadata
   * and picked up by the `handle_new_user` database trigger.
   */
  const signupUser = async (data: {
    name: string;
    email: string;
    password: string;
    department: string;
    course: string;
    academicYear: string;
  }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          department: data.department,
          course: data.course,
          academic_year: data.academicYear,
        },
      },
    });

    if (error) throw error;
    return authData.user;
  };

  /**
   * Sign in with email + password.
   * Returns the Supabase session user on success.
   */
  const loginUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  };

  /** Sign out current user. */
  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setAuthUser(null);
    setBookmarks([]);
  };

  const loginAsAdmin = async (passwordInput?: string) => {
    try {
      await loginUser("dennissabu444@gmail.com", passwordInput || "d21m1025");
    } catch (err) {
      console.warn("Admin sign in failed:", err);
      throw err;
    }
  };

  const loginAsStudent = async () => {
    try {
      await loginUser("alex.k@college.edu", "student123456");
    } catch {
      console.warn("Demo student account not found. Please create it in Supabase Auth.");
    }
  };

  return {
    isLoaded,
    notes,
    approvedNotes,
    pendingNotes,
    rejectedNotes,
    myNotes,
    currentUser,
    usersList,
    academicYears,
    coursesList,
    departmentsList,
    semestersList,
    subjectsList,
    siteSettings,
    activityLogs,
    bookmarks,
    addNote,
    updateNote,
    deleteNote,
    adminApproveNote,
    adminBatchApprovePending,
    adminRejectNote,
    adminRestoreNote,
    toggleBookmark,
    updateUserProfile,
    toggleUserStatus,
    toggleUserRole,
    addAcademicItem,
    deleteAcademicItem,
    updateSiteSettings,
    signupUser,
    loginUser,
    loginAsAdmin,
    loginAsStudent,
    logout,
  };
}
