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

// ── POST /api/upload ──────────────────────────────────────────────────────────
// Issues a short-lived signed upload URL so the browser can upload the file
// directly to Supabase Storage (the bucket already exists — no need to check).
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

    // ── Authenticate the uploader ──────────────────────────────────────────
    // Priority: 1) Bearer token in Authorization header, 2) Cookie session,
    // 3) Verified uploaderId from the request body (fallback).
    let userId: string | null = null;

    // 1. Bearer token (fastest — already validated by Supabase Auth)
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      try {
        const { data } = await admin.auth.getUser(token);
        if (data?.user) userId = data.user.id;
      } catch {
        // fall through
      }
    }

    // 2. Cookie-based session (SSR)
    if (!userId) {
      try {
        const supabase = await createServerSupabase();
        const { data } = await supabase.auth.getUser();
        if (data?.user) userId = data.user.id;
      } catch {
        // fall through
      }
    }

    // 3. Fallback: trust the uploaderId sent from the client
    //    (only reached when cookies aren't set, e.g. first upload after signup)
    if (!userId && uploaderId) {
      try {
        const { data } = await admin.auth.admin.getUserById(uploaderId);
        if (data?.user) userId = data.user.id;
      } catch {
        // fall through
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "You must be signed in to upload files." },
        { status: 401 }
      );
    }

    // ── Build object path and create a signed upload URL ──────────────────
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
