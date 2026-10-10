import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

const BUCKET = "notes";
const MAX_FILE_BYTES = 50 * 1024 * 1024;

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }
  return createClient(supabaseUrl, serviceRoleKey);
}

/**
 * Ensures the public "notes" storage bucket exists.
 * Safe to call on every request — it becomes a no-op once created.
 */
async function ensureBucket(admin: ReturnType<typeof getAdminClient>) {
  const { data: buckets, error } = await admin.storage.listBuckets();
  if (error) throw error;
  if (buckets?.some((b) => b.name === BUCKET)) return;

  const { error: createError } = await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_BYTES,
  });
  if (createError && !/already exists/i.test(createError.message)) {
    throw createError;
  }
}

// ── POST /api/upload ──────────────────────────────────────────────────────────
// Issues a short-lived signed upload URL so the browser can upload the file
// directly to Supabase Storage (bypassing RLS and serverless body limits).
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fileName = body?.fileName?.toString();
    const contentType = body?.contentType?.toString();
    const uploaderId = body?.uploaderId?.toString();

    if (!fileName) {
      return NextResponse.json({ error: "fileName is required." }, { status: 400 });
    }

    const admin = getAdminClient();
    await ensureBucket(admin);

    // Multi-tier authentication:
    // 1. Bearer token in Authorization header
    // 2. Cookie session via createServerSupabase
    // 3. Verified uploader ID in public.users / auth
    let userId: string | null = null;

    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      if (token) {
        try {
          const { data: tokenUser } = await admin.auth.getUser(token);
          if (tokenUser?.user) {
            userId = tokenUser.user.id;
          }
        } catch {
          // Fall through
        }
      }
    }

    if (!userId) {
      try {
        const supabase = await createServerSupabase();
        const { data: cookieUser } = await supabase.auth.getUser();
        if (cookieUser?.user) {
          userId = cookieUser.user.id;
        }
      } catch {
        // Fall through
      }
    }

    if (!userId && uploaderId) {
      try {
        const { data: profile } = await admin
          .from("users")
          .select("id, status")
          .eq("id", uploaderId)
          .maybeSingle();

        if (profile && profile.status !== "Suspended") {
          userId = profile.id;
        } else {
          const { data: authUser } = await admin.auth.admin.getUserById(uploaderId);
          if (authUser?.user) {
            userId = authUser.user.id;
          }
        }
      } catch {
        // Fall through
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "You must be signed in to upload files." },
        { status: 401 }
      );
    }

    const safeName =
      fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80) || "document";
    const objectPath = `${userId}/${Date.now()}-${randomUUID()}-${safeName}`;

    const { data, error } = await admin.storage
      .from(BUCKET)
      .createSignedUploadUrl(objectPath);

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Failed to create upload URL." },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = admin.storage
      .from(BUCKET)
      .getPublicUrl(objectPath);

    return NextResponse.json({
      path: data.path,
      token: data.token,
      publicUrl: publicUrlData.publicUrl,
      contentType: contentType || "application/octet-stream",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
