/**
 * queries.ts — Centralized Supabase query helpers for NotesHub.
 *
 * Rules:
 *  - Functions starting with "get"  → read-only SELECT queries
 *  - Functions starting with "add"  → INSERT
 *  - Functions starting with "update" → UPDATE
 *  - Functions starting with "remove" → soft or hard DELETE
 *
 * Server-side functions accept a `supabase` client passed in from the caller
 * (Server Component / Server Action) so they stay framework-agnostic.
 * Client-side helpers create their own browser client internally.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────────────────────
// Types (mirror WEBSITE_DOCUMENTATION.md data models)
// ─────────────────────────────────────────────────────────────────────────────

export type NoteStatus = "Pending" | "Approved" | "Rejected";

export interface AcademicNote {
  id: string;
  title: string;
  description: string;
  academic_year: string;
  course: string;
  department: string;
  semester: string;
  subject: string;
  uploader_id: string;
  uploader_name: string;
  status: NoteStatus;
  rejection_reason?: string | null;
  file_name: string;
  file_size: string;
  file_url?: string | null;
  download_count: number;
  upload_date: string;
  is_deleted: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  academic_year: string;
  course: string;
  role: "user" | "admin";
  status: "Active" | "Suspended";
  join_date: string;
}

export interface ModerationReview {
  id: string;
  note_id: string;
  admin_id: string;
  decision: "Approved" | "Rejected";
  reason?: string | null;
  reviewed_at: string;
}

export interface Bookmark {
  user_id: string;
  note_id: string;
  saved_at: string;
  academic_notes?: AcademicNote; // joined
}

export interface Department {
  name: string;
}

export interface SiteSettings {
  id: number;
  announcement_banner: string;
  hero_title: string;
  hero_description: string;
  uploads_enabled: boolean;
  college_name: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTES — Public / Browse
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all approved, non-deleted notes for the /browse page. */
export async function getApprovedNotes(
  supabase: SupabaseClient,
  filters?: {
    search?: string;
    department?: string;
    course?: string;
    semester?: string;
    academic_year?: string;
    subject?: string;
    sort?: "newest" | "most_downloaded";
  }
) {
  let query = supabase
    .from("academic_notes")
    .select("*")
    .eq("status", "Approved")
    .eq("is_deleted", false);

  if (filters?.department) query = query.eq("department", filters.department);
  if (filters?.course) query = query.eq("course", filters.course);
  if (filters?.semester) query = query.eq("semester", filters.semester);
  if (filters?.academic_year) query = query.eq("academic_year", filters.academic_year);
  if (filters?.subject) query = query.ilike("subject", `%${filters.subject}%`);
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`
    );
  }

  if (filters?.sort === "most_downloaded") {
    query = query.order("download_count", { ascending: false });
  } else {
    query = query.order("upload_date", { ascending: false });
  }

  return query;
}

/** Fetch a single note by ID (any status — used in admin & my-notes). */
export async function getNoteById(supabase: SupabaseClient, id: string) {
  return supabase.from("academic_notes").select("*").eq("id", id).single();
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTES — My Notes (user's own uploads)
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all notes belonging to the current user (for /my-notes). */
export async function getMyNotes(supabase: SupabaseClient, userId: string) {
  return supabase
    .from("academic_notes")
    .select("*")
    .eq("uploader_id", userId)
    .eq("is_deleted", false)
    .order("upload_date", { ascending: false });
}

/** Insert a new note (status = Pending automatically via DB default). */
export async function addNote(
  supabase: SupabaseClient,
  note: Omit<
    AcademicNote,
    "id" | "status" | "download_count" | "upload_date" | "is_deleted" | "rejection_reason"
  >
) {
  return supabase.from("academic_notes").insert(note).select().single();
}

/** Update metadata of a pending note (uploader can only edit their own pending notes). */
export async function updateMyNote(
  supabase: SupabaseClient,
  id: string,
  userId: string,
  changes: Partial<
    Pick<AcademicNote, "title" | "description" | "academic_year" | "course" | "department" | "semester" | "subject">
  >
) {
  return supabase
    .from("academic_notes")
    .update(changes)
    .eq("id", id)
    .eq("uploader_id", userId)
    .eq("status", "Pending")
    .select()
    .single();
}

/** Soft-delete a pending note (uploader action). */
export async function removeMyNote(
  supabase: SupabaseClient,
  id: string,
  userId: string
) {
  return supabase
    .from("academic_notes")
    .update({ is_deleted: true })
    .eq("id", id)
    .eq("uploader_id", userId)
    .eq("status", "Pending");
}

/** Increment download_count by 1 when a user downloads a file. */
export async function incrementDownload(supabase: SupabaseClient, id: string) {
  return supabase.rpc("increment_download_count", { note_id: id });
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTES — Admin Moderation
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch ALL notes (any status, including soft-deleted) for the admin queue. */
export async function getAllNotesAdmin(supabase: SupabaseClient) {
  return supabase
    .from("academic_notes")
    .select("*")
    .order("upload_date", { ascending: false });
}

/** Approve a note and log the moderation review. */
export async function approveNote(
  supabase: SupabaseClient,
  noteId: string,
  adminId: string
) {
  const [noteResult] = await Promise.all([
    supabase
      .from("academic_notes")
      .update({ status: "Approved", rejection_reason: null })
      .eq("id", noteId)
      .select()
      .single(),
  ]);

  // Insert moderation log
  await supabase.from("moderation_reviews").insert({
    note_id: noteId,
    admin_id: adminId,
    decision: "Approved",
  });

  return noteResult;
}

/** Reject a note with a custom reason and log the review. */
export async function rejectNote(
  supabase: SupabaseClient,
  noteId: string,
  adminId: string,
  reason: string
) {
  const noteResult = await supabase
    .from("academic_notes")
    .update({ status: "Rejected", rejection_reason: reason })
    .eq("id", noteId)
    .select()
    .single();

  await supabase.from("moderation_reviews").insert({
    note_id: noteId,
    admin_id: adminId,
    decision: "Rejected",
    reason,
  });

  return noteResult;
}

/** Batch approve all currently pending notes. */
export async function batchApprovePending(
  supabase: SupabaseClient,
  adminId: string
) {
  const { data: pending } = await supabase
    .from("academic_notes")
    .select("id")
    .eq("status", "Pending")
    .eq("is_deleted", false);

  if (!pending || pending.length === 0) return { data: [], error: null };

  const ids = pending.map((n) => n.id);

  const result = await supabase
    .from("academic_notes")
    .update({ status: "Approved" })
    .in("id", ids)
    .select();

  // Bulk moderation log
  const logs = ids.map((id) => ({
    note_id: id,
    admin_id: adminId,
    decision: "Approved",
  }));
  await supabase.from("moderation_reviews").insert(logs);

  return result;
}

/** Admin hard-delete (permanent). */
export async function hardDeleteNote(supabase: SupabaseClient, id: string) {
  return supabase.from("academic_notes").delete().eq("id", id);
}

/** Admin restore a soft-deleted note (sets is_deleted = false, status back to Pending). */
export async function restoreNote(supabase: SupabaseClient, id: string) {
  return supabase
    .from("academic_notes")
    .update({ is_deleted: false, status: "Pending" })
    .eq("id", id);
}

/** Admin inline metadata edit (any field, any status). */
export async function adminUpdateNote(
  supabase: SupabaseClient,
  id: string,
  changes: Partial<AcademicNote>
) {
  return supabase
    .from("academic_notes")
    .update(changes)
    .eq("id", id)
    .select()
    .single();
}

// ─────────────────────────────────────────────────────────────────────────────
// USERS — Profile & Directory
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch the profile row for the currently logged-in user. */
export async function getMyProfile(supabase: SupabaseClient, userId: string) {
  return supabase.from("users").select("*").eq("id", userId).maybeSingle();
}

/** Upsert a user profile row (called after signup to store extra fields). */
export async function upsertProfile(
  supabase: SupabaseClient,
  profile: Omit<UserProfile, "join_date" | "status">
) {
  return supabase.from("users").upsert(profile).select().single();
}

/** Admin: Fetch all users for the user directory panel. */
export async function getAllUsers(supabase: SupabaseClient) {
  return supabase
    .from("users")
    .select("*, academic_notes(count)")
    .order("join_date", { ascending: false });
}

/** Admin: Suspend or activate a user account. */
export async function setUserStatus(
  supabase: SupabaseClient,
  userId: string,
  status: "Active" | "Suspended"
) {
  return supabase.from("users").update({ status }).eq("id", userId);
}

/** Admin: Grant or revoke admin role for a user. */
export async function setUserRole(
  supabase: SupabaseClient,
  userId: string,
  role: "user" | "admin"
) {
  return supabase.from("users").update({ role }).eq("id", userId);
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOKMARKS
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all bookmarks for a user, joined with note data. */
export async function getMyBookmarks(supabase: SupabaseClient, userId: string) {
  return supabase
    .from("bookmarks")
    .select("*, academic_notes(*)")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });
}

/** Add a bookmark. */
export async function addBookmark(
  supabase: SupabaseClient,
  userId: string,
  noteId: string
) {
  return supabase.from("bookmarks").insert({ user_id: userId, note_id: noteId });
}

/** Remove a bookmark. */
export async function removeBookmark(
  supabase: SupabaseClient,
  userId: string,
  noteId: string
) {
  return supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("note_id", noteId);
}

/** Check if a specific note is bookmarked by a user. */
export async function isBookmarked(
  supabase: SupabaseClient,
  userId: string,
  noteId: string
) {
  const { data } = await supabase
    .from("bookmarks")
    .select("note_id")
    .eq("user_id", userId)
    .eq("note_id", noteId)
    .maybeSingle();
  return !!data;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEPARTMENTS
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all departments (used in filters, upload form, admin panel). */
export async function getDepartments(supabase: SupabaseClient) {
  return supabase.from("departments").select("name").order("name");
}

/** Admin: Add a new department. */
export async function addDepartment(supabase: SupabaseClient, name: string) {
  return supabase.from("departments").insert({ name });
}

/** Admin: Remove a department. */
export async function removeDepartment(supabase: SupabaseClient, name: string) {
  return supabase.from("departments").delete().eq("name", name);
}

// ─────────────────────────────────────────────────────────────────────────────
// SITE SETTINGS (admin-only row, single row table)
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch the global site settings row. */
export async function getSiteSettings(supabase: SupabaseClient) {
  return supabase.from("site_settings").select("*").eq("id", 1).single();
}

/** Admin: Update site settings. */
export async function updateSiteSettings(
  supabase: SupabaseClient,
  changes: Partial<
    Pick<
      SiteSettings,
      | "announcement_banner"
      | "hero_title"
      | "hero_description"
      | "uploads_enabled"
      | "college_name"
    >
  >
) {
  return supabase
    .from("site_settings")
    .update(changes)
    .eq("id", 1)
    .select()
    .single();
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS (admin dashboard)
// ─────────────────────────────────────────────────────────────────────────────

/** Count of notes grouped by status (for the analytics panel). */
export async function getNoteStatusCounts(supabase: SupabaseClient) {
  return supabase.rpc("get_note_status_counts");
}

/** Total downloads across all approved notes. */
export async function getTotalDownloads(supabase: SupabaseClient) {
  return supabase
    .from("academic_notes")
    .select("download_count.sum()")
    .eq("status", "Approved")
    .eq("is_deleted", false)
    .single();
}

/** Notes count per department (for analytics). */
export async function getNotesByDepartment(supabase: SupabaseClient) {
  return supabase.rpc("get_notes_by_department");
}
