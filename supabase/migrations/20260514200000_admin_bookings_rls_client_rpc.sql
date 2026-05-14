-- Admin: allow booking insert/delete for admins; list clients with auth email (RPC).

-- ---------------------------------------------------------------------------
-- Bookings: admin insert (any user_id) + delete
-- ---------------------------------------------------------------------------
create policy "bookings_insert_admin"
  on public.bookings for insert
  to authenticated
  with check (public.is_admin());

create policy "bookings_delete_own_or_admin"
  on public.bookings for delete
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- RPC: directory for admin UI (joins auth.users for email)
-- ---------------------------------------------------------------------------
create or replace function public.admin_list_clients()
returns table (
  user_id uuid,
  email text,
  display_name text,
  phone_number text,
  address_line_1 text,
  address_line_2 text,
  post_code text,
  status text,
  role text,
  granted_at timestamptz,
  auth_created_at timestamptz
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    u.id as user_id,
    u.email::text as email,
    p.display_name,
    p.phone_number,
    p.address_line_1,
    p.address_line_2,
    p.post_code,
    p.status,
    ur.role,
    ur.granted_at,
    u.created_at as auth_created_at
  from auth.users u
  join public.profiles p on p.id = u.id
  join public.user_roles ur on ur.user_id = u.id
  where (select public.is_admin());
$$;

revoke all on function public.admin_list_clients() from public;
grant execute on function public.admin_list_clients() to authenticated;
