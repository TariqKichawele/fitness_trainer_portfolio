-- Seed session catalog, scheduled occurrences, sample clients (profiles + roles),
-- and bookings when auth users exist. Safe to re-run: fixed PKs use ON CONFLICT.
-- Bookings require real auth.users (FK). If no users yet, session data still inserts.

begin;

-- ---------------------------------------------------------------------------
-- Session types (catalog / "categories")
-- ---------------------------------------------------------------------------
insert into public.session_types (
  id,
  slug,
  title,
  description,
  category,
  default_duration_min,
  default_max_slots,
  default_price_cents,
  default_location,
  is_active
)
values
  (
    'a1000000-0000-4000-8000-000000000001'::uuid,
    'strength-foundation',
    'Strength Foundation',
    'Compound lifts and progressive overload.',
    'Strength',
    60,
    12,
    2500,
    'Main studio',
    true
  ),
  (
    'a1000000-0000-4000-8000-000000000002'::uuid,
    'mobility-reset',
    'Mobility Reset',
    'Joint prep and recovery flows.',
    'Mobility',
    45,
    10,
    2000,
    'Studio B',
    true
  ),
  (
    'a1000000-0000-4000-8000-000000000003'::uuid,
    'hiit-beach',
    'HIIT Beach',
    'Outdoor intervals and engine work.',
    'Conditioning',
    50,
    16,
    2200,
    'Beach',
    false
  )
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  default_duration_min = excluded.default_duration_min,
  default_max_slots = excluded.default_max_slots,
  default_price_cents = excluded.default_price_cents,
  default_location = excluded.default_location,
  is_active = excluded.is_active,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Session occurrences (scheduled blocks; starts in the future for public reads)
-- ---------------------------------------------------------------------------
insert into public.session_occurrences (
  id,
  session_type_id,
  title_override,
  starts_at,
  ends_at,
  max_slots,
  price_cents,
  location,
  status
)
select
  'b2000000-0000-4000-8000-000000000001'::uuid,
  t.id,
  null,
  (now() + interval '2 days')::timestamptz,
  (now() + interval '2 days' + interval '60 minutes')::timestamptz,
  12,
  2500,
  'Main studio',
  'scheduled'
from public.session_types t
where t.slug = 'strength-foundation'
on conflict (id) do nothing;

insert into public.session_occurrences (
  id,
  session_type_id,
  title_override,
  starts_at,
  ends_at,
  max_slots,
  price_cents,
  location,
  status
)
select
  'b2000000-0000-4000-8000-000000000002'::uuid,
  t.id,
  'Strength — morning block',
  (now() + interval '4 days')::timestamptz,
  (now() + interval '4 days' + interval '60 minutes')::timestamptz,
  10,
  2500,
  'Main studio',
  'scheduled'
from public.session_types t
where t.slug = 'strength-foundation'
on conflict (id) do nothing;

insert into public.session_occurrences (
  id,
  session_type_id,
  title_override,
  starts_at,
  ends_at,
  max_slots,
  price_cents,
  location,
  status
)
select
  'b2000000-0000-4000-8000-000000000003'::uuid,
  t.id,
  null,
  (now() + interval '3 days')::timestamptz,
  (now() + interval '3 days' + interval '45 minutes')::timestamptz,
  10,
  2000,
  'Studio B',
  'scheduled'
from public.session_types t
where t.slug = 'mobility-reset'
on conflict (id) do nothing;

insert into public.session_occurrences (
  id,
  session_type_id,
  title_override,
  starts_at,
  ends_at,
  max_slots,
  price_cents,
  location,
  status
)
select
  'b2000000-0000-4000-8000-000000000004'::uuid,
  t.id,
  null,
  (now() + interval '5 days')::timestamptz,
  (now() + interval '5 days' + interval '50 minutes')::timestamptz,
  16,
  2200,
  'Beach',
  'scheduled'
from public.session_types t
where t.slug = 'hiit-beach'
on conflict (id) do nothing;

insert into public.session_occurrences (
  id,
  session_type_id,
  title_override,
  starts_at,
  ends_at,
  max_slots,
  price_cents,
  location,
  status
)
select
  'b2000000-0000-4000-8000-000000000005'::uuid,
  t.id,
  'Mobility — evening',
  (now() + interval '8 days')::timestamptz,
  (now() + interval '8 days' + interval '45 minutes')::timestamptz,
  8,
  2000,
  'Studio B',
  'scheduled'
from public.session_types t
where t.slug = 'mobility-reset'
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Promote sample users to client + enrich profiles (never change admin role)
-- ---------------------------------------------------------------------------
with ranked as (
  select
    u.id,
    row_number() over (order by u.created_at) as rn
  from auth.users u
  join public.user_roles ur on ur.user_id = u.id
  where ur.role = 'user'
)
update public.user_roles ur
set role = 'client'
from ranked r
where ur.user_id = r.id
  and r.rn between 1 and 3;

with ranked as (
  select
    u.id,
    row_number() over (order by u.created_at) as rn
  from auth.users u
  join public.user_roles ur on ur.user_id = u.id
  where ur.role <> 'admin'
)
update public.profiles p
set
  display_name = coalesce(nullif(trim(p.display_name), ''), seed.name),
  phone_number = coalesce(nullif(trim(p.phone_number), ''), seed.phone),
  address_line_1 = coalesce(nullif(trim(p.address_line_1), ''), seed.addr1),
  post_code = coalesce(nullif(trim(p.post_code), ''), seed.post)
from ranked r
join (
  values
    (1, 'Jordan Lee', '+1 555 0101', '12 Market Street', '94103'),
    (2, 'Sam Rivera', '+1 555 0102', '400 Oak Ave', '94110'),
    (3, 'Taylor Kim', '+1 555 0103', '9 Bay Road', '94117')
) as seed(rn, name, phone, addr1, post)
  on seed.rn = r.rn
where p.id = r.id
  and r.rn between 1 and 3;

-- ---------------------------------------------------------------------------
-- Bookings (only when enough users + occurrences exist; one row per pair)
-- ---------------------------------------------------------------------------
do $$
declare
  u1 uuid;
  u2 uuid;
  u3 uuid;
begin
  select id into u1
  from auth.users
  order by created_at asc
  limit 1 offset 0;

  select id into u2
  from auth.users
  order by created_at asc
  limit 1 offset 1;

  select id into u3
  from auth.users
  order by created_at asc
  limit 1 offset 2;

  if u1 is not null then
    insert into public.bookings (
      id,
      user_id,
      session_occurrence_id,
      status,
      payment_status
    )
    values
      (
        'c3000000-0000-4000-8000-000000000001'::uuid,
        u1,
        'b2000000-0000-4000-8000-000000000001'::uuid,
        'confirmed',
        'paid_on_site'
      ),
      (
        'c3000000-0000-4000-8000-000000000002'::uuid,
        u1,
        'b2000000-0000-4000-8000-000000000003'::uuid,
        'pending',
        'unpaid'
      )
    on conflict (id) do nothing;
  end if;

  if u2 is not null then
    insert into public.bookings (
      id,
      user_id,
      session_occurrence_id,
      status,
      payment_status
    )
    values
      (
        'c3000000-0000-4000-8000-000000000003'::uuid,
        u2,
        'b2000000-0000-4000-8000-000000000002'::uuid,
        'confirmed',
        'waived'
      ),
      (
        'c3000000-0000-4000-8000-000000000004'::uuid,
        u2,
        'b2000000-0000-4000-8000-000000000004'::uuid,
        'cancelled_by_client',
        null
      )
    on conflict (id) do nothing;
  end if;

  if u3 is not null then
    insert into public.bookings (
      id,
      user_id,
      session_occurrence_id,
      status,
      payment_status
    )
    values
      (
        'c3000000-0000-4000-8000-000000000005'::uuid,
        u3,
        'b2000000-0000-4000-8000-000000000005'::uuid,
        'attended',
        'paid_on_site'
      )
    on conflict (id) do nothing;
  end if;
end $$;

commit;
