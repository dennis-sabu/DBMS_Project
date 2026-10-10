import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

/**
 * Ensures the uploader exists in public.users.
 * If not, creates a minimal profile row so the FK constraint is satisfied.
 * This handles cases where the auth trigger failed or was skipped.
 */
async function ensureUserProfile(
  admin: ReturnType<typeof getAdminClient>,
  uploaderId: string,
  uploaderName: string,
  uploaderEmail?: string
) {
  const { data: existing } = await admin
    .from("users")
    .select("id")
    .eq("id", uploaderId)
    .maybeSingle();

  if (!existing) {
    // Look up the auth user to get real email / metadata
    const { data: authUser } = await admin.auth.admin.getUserById(uploaderId);
    const email = authUser?.user?.email || uploaderEmail || `${uploaderId}@unknown.local`;
    const name =
      authUser?.user?.user_metadata?.name ||
      uploaderName ||
      email.split("@")[0];
    const department =
      authUser?.user?.user_metadata?.department ||
      "Computer Science & Engineering";
    const academicYear = authUser?.user?.user_metadata?.academic_year || "1st Year";
    const course = authUser?.user?.user_metadata?.course || "B.Tech";

    await admin.from("users").upsert(
      {
        id: uploaderId,
        name,
        email,
        department,
        academic_year: academicYear,
        course,
        role: "user",
        status: "Active",
      },
      { onConflict: "id" }
    );
  }
}

// ── GET /api/notes ────────────────────────────────────────────────────────────
// Returns all non-deleted notes. Admins see all; public sees only Approved ones.
export async function GET(request: Request) {
  try {
    const admin = getAdminClient();
    const { searchParams } = new URL(request.url);
    const onlyApproved = searchParams.get("approved") === "true";

    let query = admin
      .from("academic_notes")
      .select("*")
      .eq("is_deleted", false)
      .order("upload_date", { ascending: false });

    if (onlyApproved) {
      query = query.eq("status", "Approved");
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notes: data || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── POST /api/notes ───────────────────────────────────────────────────────────
// Upload a new note. Status defaults to "Pending" for admin review.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      academicYear,
      course,
      department,
      semester,
      subject,
      uploaderId,
      uploaderName,
      uploaderEmail,
      fileName,
      fileSize,
      fileUrl,
    } = body;

    if (
      !title ||
      !academicYear ||
      !course ||
      !department ||
      !semester ||
      !subject ||
      !uploaderId
    ) {
      return NextResponse.json(
        { error: "All required note fields must be provided." },
        { status: 400 }
      );
    }

    const admin = getAdminClient();

    // Self-heal: ensure the uploader has a public.users profile (prevents FK violation)
    await ensureUserProfile(admin, uploaderId, uploaderName || "Student", uploaderEmail);

    const { data, error } = await admin
      .from("academic_notes")
      .insert({
        title: title.trim(),
        description: description?.trim() || "",
        academic_year: academicYear,
        course,
        department,
        semester,
        subject,
        uploader_id: uploaderId,
        uploader_name: uploaderName || "Student",
        file_name: fileName || "Document.pdf",
        file_size: fileSize || "1.0 MB",
        file_url: fileUrl || null,
        status: "Pending",
        is_deleted: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, note: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── PATCH /api/notes ──────────────────────────────────────────────────────────
// Moderate notes: Approve / Reject / Restore / soft-delete.
// Also handles general field updates (title, description, etc.)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, rejectionReason, adminId, isDeleted, title, description, subject } =
      body;

    if (!id) {
      return NextResponse.json({ error: "Note ID is required." }, { status: 400 });
    }

    const admin = getAdminClient();

    // Build the patch payload from whatever fields were provided
    const patch: Record<string, unknown> = {};
    if (status !== undefined) patch.status = status;
    if (rejectionReason !== undefined) patch.rejection_reason = rejectionReason;
    if (isDeleted !== undefined) patch.is_deleted = isDeleted;
    if (title !== undefined) patch.title = title.trim();
    if (description !== undefined) patch.description = description.trim();
    if (subject !== undefined) patch.subject = subject;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const { data: updatedNote, error: updateError } = await admin
      .from("academic_notes")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Record approval/rejection in moderation_reviews
    if (adminId && (status === "Approved" || status === "Rejected")) {
      await admin.from("moderation_reviews").insert({
        note_id: id,
        admin_id: adminId,
        decision: status,
        reason: rejectionReason || null,
      });
    }

    return NextResponse.json({ success: true, note: updatedNote });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── DELETE /api/notes?id=<uuid> ───────────────────────────────────────────────
// Hard-delete a note (admin only — use PATCH with isDeleted:true for soft delete)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Note ID is required." }, { status: 400 });
    }

    const admin = getAdminClient();
    const { error } = await admin.from("academic_notes").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
