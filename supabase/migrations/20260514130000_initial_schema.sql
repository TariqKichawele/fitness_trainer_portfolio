-- Fitness trainer portfolio: initial schema (Waves A–D)
-- Apply via Supabase CLI (`supabase db push`) or SQL Editor.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  phone_number text,
  address_line_1 text,
  address_line_2 text,
  post_code text,
  status text not null default 'active'
    check (status in ('active', 'rejected', 'banned')),
  ban_reason text,
  banned_at timestamptz,
  banned_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_status_idx on public.profiles (status);

-- ---------------------------------------------------------------------------
-- user_roles (one row per user for v1)
-- ---------------------------------------------------------------------------
create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user'
    check (role in ('user', 'client', 'admin')),
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users (id) on delete set null
);

create index user_roles_role_idx on public.user_roles (role);

-- ---------------------------------------------------------------------------
-- Helper: admin check (must run after user_roles exists — body references it)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to service_role;

-- ---------------------------------------------------------------------------
-- Session catalog & schedule
-- ---------------------------------------------------------------------------
create table public.session_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  category text,
  default_duration_min integer not null default 60 check (default_duration_min > 0),
  default_max_slots integer not null default 10 check (default_max_slots > 0),
  default_price_cents integer not null default 0 check (default_price_cents >= 0),
  default_location text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.session_occurrences (
  id uuid primary key default gen_random_uuid(),
  session_type_id uuid references public.session_types (id) on delete set null,
  title_override text,
  description_override text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  max_slots integer not null check (max_slots > 0),
  price_cents integer not null default 0 check (price_cents >= 0),
  location text,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'cancelled', 'completed')),
  cancel_reason text,
  cancelled_at timestamptz,
  cancelled_by uuid references auth.users (id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index session_occurrences_starts_at_idx on public.session_occurrences (starts_at);
create index session_occurrences_type_starts_idx
  on public.session_occurrences (session_type_id, starts_at);

-- ---------------------------------------------------------------------------
-- Availability
-- ---------------------------------------------------------------------------
create table public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  session_type_id uuid references public.session_types (id) on delete cascade,
  valid_from timestamptz not null,
  valid_to timestamptz,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  session_type_id uuid references public.session_types (id) on delete cascade,
  exception_date date not null,
  kind text not null check (kind in ('blackout', 'extra_hours')),
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Bookings
-- ---------------------------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_occurrence_id uuid not null references public.session_occurrences (id) on delete restrict,
  status text not null default 'pending'
    check (status in (
      'pending', 'confirmed', 'cancelled_by_client', 'cancelled_by_admin',
      'no_show', 'attended'
    )),
  payment_status text check (payment_status in ('unpaid', 'paid_on_site', 'waived')),
  payment_note text,
  cancel_reason text,
  cancelled_at timestamptz,
  cancelled_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index bookings_one_active_per_user_occurrence
  on public.bookings (user_id, session_occurrence_id)
  where status in ('pending', 'confirmed');

create index bookings_user_id_idx on public.bookings (user_id);
create index bookings_occurrence_idx on public.bookings (session_occurrence_id);

-- ---------------------------------------------------------------------------
-- History / audit (append-only; triggers can be added later)
-- ---------------------------------------------------------------------------
create table public.auth_login_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  event text not null check (event in ('login_success', 'login_failure', 'logout', 'token_refresh')),
  ip inet,
  user_agent text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table public.session_occurrence_history (
  id uuid primary key default gen_random_uuid(),
  occurrence_id uuid not null references public.session_occurrences (id) on delete cascade,
  changed_by uuid references auth.users (id) on delete set null,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create table public.booking_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references auth.users (id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

create table public.admin_action_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table public.role_change_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  from_role text,
  to_role text not null,
  actor_id uuid references auth.users (id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

create table public.profile_change_log (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  changed_by uuid references auth.users (id) on delete set null,
  field text not null,
  old_value text,
  new_value text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- New auth user → profile + default role
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      nullif(trim(split_part(coalesce(new.email, ''), '@', 1)), '')
    )
  );
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Profile updates: non-admins cannot change moderation fields
-- ---------------------------------------------------------------------------
create or replace function public.enforce_profile_privileged_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if new.id is distinct from auth.uid() then
    raise exception 'cannot modify another profile';
  end if;
  if new.status is distinct from old.status
     or new.ban_reason is distinct from old.ban_reason
     or new.banned_at is distinct from old.banned_at
     or new.banned_by is distinct from old.banned_by then
    raise exception 'only admins can change account status fields';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_enforce_privileged on public.profiles;
create trigger profiles_enforce_privileged
  before update on public.profiles
  for each row execute function public.enforce_profile_privileged_columns();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger session_types_set_updated_at
  before update on public.session_types
  for each row execute function public.set_updated_at();

create trigger session_occurrences_set_updated_at
  before update on public.session_occurrences
  for each row execute function public.set_updated_at();

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

create trigger availability_rules_set_updated_at
  before update on public.availability_rules
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.session_types enable row level security;
alter table public.session_occurrences enable row level security;
alter table public.availability_rules enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.bookings enable row level security;
alter table public.auth_login_history enable row level security;
alter table public.session_occurrence_history enable row level security;
alter table public.booking_history enable row level security;
alter table public.admin_action_log enable row level security;
alter table public.role_change_log enable row level security;
alter table public.profile_change_log enable row level security;

-- profiles
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- user_roles
create policy "user_roles_select_own_or_admin"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "user_roles_admin_write"
  on public.user_roles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- session_types: public read active; admin write
create policy "session_types_public_read_active"
  on public.session_types for select
  to anon, authenticated
  using (is_active = true);

create policy "session_types_admin_all"
  on public.session_types for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- session_occurrences: read scheduled future for anon/auth; admin all
create policy "session_occurrences_public_read"
  on public.session_occurrences for select
  to anon, authenticated
  using (
    status = 'scheduled'
    and starts_at > now()
  );

create policy "session_occurrences_admin_all"
  on public.session_occurrences for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- availability (admin-only for now)
create policy "availability_rules_admin_all"
  on public.availability_rules for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "availability_exceptions_admin_all"
  on public.availability_exceptions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- bookings: own rows; admin all (insert rules tightened in later phase)
create policy "bookings_select_own_or_admin"
  on public.bookings for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "bookings_insert_own"
  on public.bookings for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "bookings_update_own_or_admin"
  on public.bookings for update
  to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- history: admin read only (writes via service_role / triggers later)
create policy "auth_login_history_admin_select"
  on public.auth_login_history for select
  to authenticated
  using (public.is_admin());

create policy "session_occurrence_history_admin_select"
  on public.session_occurrence_history for select
  to authenticated
  using (public.is_admin());

create policy "booking_history_admin_select"
  on public.booking_history for select
  to authenticated
  using (public.is_admin());

create policy "admin_action_log_admin_select"
  on public.admin_action_log for select
  to authenticated
  using (public.is_admin());

create policy "role_change_log_admin_select"
  on public.role_change_log for select
  to authenticated
  using (public.is_admin());

create policy "profile_change_log_admin_select"
  on public.profile_change_log for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to postgres, service_role;

grant select on public.session_types to anon, authenticated;
grant select on public.session_occurrences to anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant select, insert, update, delete on public.bookings to authenticated;

-- Admin-managed tables: default deny for anon; authenticated relies on RLS
grant select, insert, update, delete on public.session_types to authenticated;
grant select, insert, update, delete on public.session_occurrences to authenticated;
grant select, insert, update, delete on public.availability_rules to authenticated;
grant select, insert, update, delete on public.availability_exceptions to authenticated;
grant select, insert, update, delete on public.user_roles to authenticated;

grant select on public.auth_login_history to authenticated;
grant select on public.session_occurrence_history to authenticated;
grant select on public.booking_history to authenticated;
grant select on public.admin_action_log to authenticated;
grant select on public.role_change_log to authenticated;
grant select on public.profile_change_log to authenticated;

alter default privileges in schema public grant all on tables to postgres, service_role;
