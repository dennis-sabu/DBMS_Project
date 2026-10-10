-- ============================================================
-- NotesHub — Fix: Infinite Recursion on public.users & Install Trigger
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- 1. Helper function with SECURITY DEFINER to safely check admin status without recursion
create or replace function public.is_admin()

returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 2. Drop the recursive policy
drop policy if exists "users_select" on public.users;
drop policy if exists "users_admin_update" on public.users;

-- 3. Create non-recursive policies for public.users
create policy "users_select" on public.users
  for select to authenticated
  using (
    (select auth.uid()) = id or public.is_admin()
  );

create policy "users_admin_update" on public.users
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4. Auto-create public.users row on auth sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email, department, academic_year, course, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'department', 'Computer Science & Engineering'),
    coalesce(new.raw_user_meta_data->>'academic_year', '1st Year'),
    coalesce(new.raw_user_meta_data->>'course', 'B.Tech'),
    'user',
    'Active'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
