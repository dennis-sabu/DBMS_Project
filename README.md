# NotesHub 📚

> A full-stack academic note-sharing platform built for campus communities. Students upload notes, administrators review and approve them, and the entire campus benefits.

![Next.js](https://img.shields.io/badge/Next.js-16.3.7-black?style=flat-square&logo=nextdotjs)
![Supabase](https://img.shields.io/badge/Supabase-2.x-3ECF8E?style=flat-square&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📤 **Note Upload** | Students upload study materials with department, semester, subject metadata |
| 🔍 **Browse & Search** | Filter notes by department, course, semester, and subject |
| ✅ **Admin Moderation** | Admin reviews pending notes before they go public |
| 📊 **My Notes Dashboard** | Track upload status — Pending, Approved, or Rejected |
| 🔖 **Bookmarks** | Save notes for quick access later |
| 👤 **Profile Management** | Update name, department, course, and academic year |
| 🛡️ **Admin Console** | Full platform control: moderation queue, user management, site settings, analytics |
| 📣 **Announcement Banner** | Admin-controlled top banner for campus announcements |
| 🌐 **RLS Security** | Row-Level Security on every table — data is isolated per user |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Database** | PostgreSQL via [Supabase](https://supabase.com/) |
| **Auth** | Supabase Auth (email + password) |
| **Styling** | Tailwind CSS v4 |
| **Animations** | [Motion](https://motion.dev/) (Framer Motion successor) |
| **Icons** | React Icons (Font Awesome 6) |
| **UI Primitives** | Base UI, Shadcn/ui |

---

## 📁 Project Structure

```
org_notes/
├── app/
│   ├── page.tsx              # Landing page (hero, features, CTA)
│   ├── about/                # About page
│   ├── browse/               # Public note browser with filters
│   ├── upload/               # Note upload form (auth required)
│   ├── my-notes/             # Student upload status dashboard
│   ├── bookmarks/            # Saved notes
│   ├── profile/              # User profile management
│   ├── admin/                # Admin console (password protected)
│   ├── login/                # Sign in page
│   ├── signup/               # Registration page
│   └── api/
│       ├── notes/            # Note CRUD + moderation (service-role)
│       └── auth/register/    # Registration bypass (no email rate-limit)
├── components/ui/
│   ├── navbar.tsx            # Responsive navigation bar
│   ├── upload-note-form.tsx  # Full upload form with dropdowns
│   ├── hero-9.tsx            # Homepage hero section
│   └── ...                   # Other UI components
├── lib/
│   ├── notes-store.ts        # Global React state + Supabase client hooks
│   └── supabase/             # Supabase client factory (browser + server)
├── proxy.ts                  # Next.js middleware (auth redirect)
└── .env                      # Environment variables (see setup)
```

---

## 🗄️ Database Schema

```sql
-- Users (mirrors auth.users)
public.users          id, name, email, department, academic_year, course, role, status, join_date

-- Notes
public.academic_notes id, title, description, academic_year, course, department,
                      semester, subject, uploader_id (FK→users), uploader_name,
                      status (Pending|Approved|Rejected), rejection_reason,
                      file_name, file_size, file_url, download_count, upload_date, is_deleted

-- Admin moderation log
public.moderation_reviews  id, note_id, admin_id, decision, reason, reviewed_at

-- Bookmarks
public.bookmarks      user_id, note_id, saved_at

-- Departments
public.departments    name

-- Site settings
public.site_settings  id, announcement_banner, hero_title, hero_description,
                      uploads_enabled, college_name
```

### Row-Level Security

| Table | Policy |
|---|---|
| `academic_notes` | Anyone reads `Approved` notes; auth users read own notes; admin reads all; API route (`service_role`) bypasses RLS for moderation |
| `users` | Users read/update their own row; admin reads all via `is_admin()` SECURITY DEFINER function |
| `bookmarks` | Users manage only their own bookmarks |
| `departments` | Public read; admin write |
| `site_settings` | Public read; admin update |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Supabase](https://supabase.com/) project (free tier works)
- npm or pnpm

### 1. Clone & Install

```bash
git clone https://github.com/your-username/noteshub.git
cd noteshub
npm install
```

### 2. Configure Environment Variables

Create a `.env` file at the project root:

```env
# Public — safe to expose in browser
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Server-only — NEVER expose to browser
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

> Get these from **Supabase Dashboard → Project Settings → API**.

### 3. Set Up the Database

Run the following SQL in your **Supabase SQL Editor**:

<details>
<summary>📋 Click to expand full schema SQL</summary>

```sql
-- Users table (synced from auth.users via trigger)
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  department text,
  academic_year text NOT NULL DEFAULT '1st Year',
  course text NOT NULL DEFAULT 'B.Tech',
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended')),
  join_date timestamptz NOT NULL DEFAULT now()
);

-- Academic notes table
CREATE TABLE public.academic_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  academic_year text NOT NULL,
  course text NOT NULL,
  department text NOT NULL,
  semester text NOT NULL,
  subject text NOT NULL,
  uploader_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  uploader_name text NOT NULL,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  rejection_reason text,
  file_name text NOT NULL DEFAULT 'Document.pdf',
  file_size text NOT NULL DEFAULT '1.0 MB',
  file_url text,
  download_count integer NOT NULL DEFAULT 0,
  upload_date timestamptz NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false
);

-- Admin moderation log
CREATE TABLE public.moderation_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES public.academic_notes(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES public.users(id),
  decision text NOT NULL CHECK (decision IN ('Approved', 'Rejected')),
  reason text,
  reviewed_at timestamptz NOT NULL DEFAULT now()
);

-- Bookmarks
CREATE TABLE public.bookmarks (
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  note_id uuid NOT NULL REFERENCES public.academic_notes(id) ON DELETE CASCADE,
  saved_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, note_id)
);

-- Departments
CREATE TABLE public.departments (
  name text PRIMARY KEY
);

-- Site settings (singleton row, id = 1)
CREATE TABLE public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  announcement_banner text NOT NULL DEFAULT '',
  hero_title text NOT NULL DEFAULT 'The best notes from the smartest minds on campus.',
  hero_description text NOT NULL DEFAULT 'Upload, share, and discover top-quality study materials.',
  uploads_enabled boolean NOT NULL DEFAULT true,
  college_name text NOT NULL DEFAULT 'NotesHub College'
);

INSERT INTO public.site_settings DEFAULT VALUES;

-- Trigger: auto-create public.users profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, department, academic_year, course, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'department', 'Computer Science & Engineering'),
    COALESCE(NEW.raw_user_meta_data->>'academic_year', '1st Year'),
    COALESCE(NEW.raw_user_meta_data->>'course', 'B.Tech'),
    'user',
    'Active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Admin check helper (SECURITY DEFINER prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
$$;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "users_read_own" ON public.users FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id);
CREATE POLICY "users_read_admin" ON public.users FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "users_insert_own" ON public.users FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY "users_admin_all" ON public.users FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Notes policies
CREATE POLICY "notes_read_approved" ON public.academic_notes FOR SELECT TO PUBLIC USING (status = 'Approved' AND is_deleted = false);
CREATE POLICY "notes_read_own" ON public.academic_notes FOR SELECT TO authenticated USING ((SELECT auth.uid()) = uploader_id);
CREATE POLICY "notes_read_admin" ON public.academic_notes FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "notes_insert_auth" ON public.academic_notes FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = uploader_id AND status = 'Pending');
CREATE POLICY "notes_update_own_pending" ON public.academic_notes FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = uploader_id AND status = 'Pending' AND is_deleted = false) WITH CHECK ((SELECT auth.uid()) = uploader_id AND status = 'Pending');
CREATE POLICY "notes_update_admin" ON public.academic_notes FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "notes_delete_admin" ON public.academic_notes FOR DELETE TO authenticated USING (is_admin());

-- Bookmarks policies
CREATE POLICY "bookmarks_own" ON public.bookmarks FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- Departments policies
CREATE POLICY "departments_read_all" ON public.departments FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "departments_write_admin" ON public.departments FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Site settings policies
CREATE POLICY "settings_read_all" ON public.site_settings FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "settings_update_admin" ON public.site_settings FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Moderation reviews policies
CREATE POLICY "reviews_all_admin" ON public.moderation_reviews FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "reviews_read_own_note" ON public.moderation_reviews FOR SELECT TO authenticated
  USING (note_id IN (SELECT id FROM public.academic_notes WHERE uploader_id = (SELECT auth.uid())));

-- Seed departments
INSERT INTO public.departments (name) VALUES
  ('Artificial Intelligence and Data Science'),
  ('Basic Sciences & Humanities'),
  ('Civil Engineering'),
  ('Computer Science & Engineering'),
  ('Electrical & Electronics Engineering'),
  ('Electronics and Communication Engineering'),
  ('Electronics and Computer Engineering'),
  ('Electronics and Instrumentation Engineering'),
  ('Information Technology'),
  ('Mechanical Engineering');
```

</details>

### 4. Create Admin Account

In **Supabase Dashboard → Authentication → Users**, create your admin user. Then run:

```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your-admin@email.com';
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Authentication

### Student Sign Up / Login
- Navigate to `/signup` to register
- Navigate to `/login` to sign in
- Registration is instant — no email confirmation required (uses service role for bypass)

### Admin Access
- Navigate to `/admin`
- Enter admin password to unlock (or log in as the admin user directly)
- Admin can approve/reject notes, manage users, update site settings

---

## 📡 API Routes

All routes are server-side and use the **Supabase service role key** — they bypass RLS for trusted server operations.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notes` | Fetch all non-deleted notes |
| `GET` | `/api/notes?approved=true` | Fetch only approved notes |
| `POST` | `/api/notes` | Upload a new note (auto-creates user profile if missing) |
| `PATCH` | `/api/notes` | Approve / Reject / Soft-delete / Edit a note |
| `DELETE` | `/api/notes?id=<uuid>` | Hard-delete a note |
| `POST` | `/api/auth/register` | Register a new user (bypasses email rate limit) |

---

## 🛠️ Key Design Decisions

### Server-Side Note Operations
All note writes go through `/api/notes` using the **service role key** instead of the client-side Supabase SDK. This was necessary because:
- The `is_admin()` function inside RLS policies on `academic_notes` cross-references `public.users`, which can cause recursion if both tables have RLS active at the same time
- The service role key bypasses RLS entirely on the server, making moderation reliable and atomic

### `is_admin()` as SECURITY DEFINER
The admin check function uses `SECURITY DEFINER` so it runs with superuser privileges when invoked from within an RLS policy. Without this, calling `is_admin()` inside a `users` table policy would recursively trigger the `users` RLS policy.

### Self-Healing User Profiles
The `/api/notes` POST handler automatically upserts a `public.users` profile if the uploader's ID isn't found. This prevents foreign key violations for users who signed up before the trigger was deployed.

---

## 🚢 Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add the following **Environment Variables** in Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

> ⚠️ **Never** commit `.env` to git. The `SUPABASE_SERVICE_ROLE_KEY` gives full database access.

### Build Locally

```bash
npm run build
npm run start
```

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🧱 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server-only service role key (never expose to browser) |

---

## 🔒 Security Notes

- The `SUPABASE_SERVICE_ROLE_KEY` is **server-only** — it is never sent to the browser
- All API routes are server-side Next.js route handlers
- Row-Level Security is enabled on every table
- The `is_admin()` function is `SECURITY DEFINER` and `EXECUTE` is revoked from `PUBLIC` — only `authenticated` role can call it
- User passwords are hashed by Supabase Auth (bcrypt)

---

## 🗺️ Roadmap

- [ ] File storage via Supabase Storage (upload actual PDFs)
- [ ] Download tracking (increment `download_count` on access)
- [ ] Email notifications on note approval/rejection
- [ ] Note ratings and comments
- [ ] Department-level admin roles
- [ ] Dark mode toggle

---

## 📄 License

MIT © 2026 Dennis Sabu

---

## 🙏 Acknowledgements

- [Supabase](https://supabase.com/) — Database, Auth, and RLS
- [Next.js](https://nextjs.org/) — App framework
- [Motion](https://motion.dev/) — Animations
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling
- [React Icons](https://react-icons.github.io/react-icons/) — Icon library
