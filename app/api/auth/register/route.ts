import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, department, course, academicYear } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Server configuration missing: SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // 1. Create user directly with email_confirm: true to bypass email rate limits
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email: email.trim(),
        password,
        email_confirm: true,
        user_metadata: {
          name: name.trim(),
          department: department || "",
          course: course || "B.Tech",
          academic_year: academicYear || "1st Year",
        },
      });

    if (authError) {
      const msg = authError.message.toLowerCase();
      if (
        msg.includes("already registered") ||
        msg.includes("unique") ||
        msg.includes("exists")
      ) {
        return NextResponse.json(
          { error: "This email is already registered. Please sign in instead." },
          { status: 400 }


        );
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;

    // 2. Ensure public.users has their profile record
    if (userId) {
      await adminClient.from("users").upsert({
        id: userId,
        name: name.trim(),
        email: email.trim(),
        department: department || "",
        academic_year: academicYear || "1st Year",
        course: course || "B.Tech",
        role: "user",
        status: "Active",
      });
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
