-- List upcoming bookable occurrences with capacity and current user's active booking status.

create or replace function public.list_bookable_occurrences(p_horizon_days int default 28)
returns table (
  id uuid,
  session_type_id uuid,
  title text,
  category text,
  location text,
  starts_at timestamptz,
  ends_at timestamptz,
  max_slots integer,
  price_cents integer,
  spots_taken bigint,
  user_booking_status text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    o.id,
    o.session_type_id,
    coalesce(nullif(trim(o.title_override), ''), st.title, 'Session') as title,
    st.category,
    coalesce(nullif(trim(o.location), ''), st.default_location) as location,
    o.starts_at,
    o.ends_at,
    o.max_slots,
    o.price_cents,
    (
      select count(*)::bigint
      from public.bookings b
      where b.session_occurrence_id = o.id
        and b.status in ('pending', 'confirmed')
    ) as spots_taken,
    (
      select b.status
      from public.bookings b
      where b.session_occurrence_id = o.id
        and b.user_id = auth.uid()
        and b.status in ('pending', 'confirmed')
      limit 1
    ) as user_booking_status
  from public.session_occurrences o
  left join public.session_types st on st.id = o.session_type_id
  where o.status = 'scheduled'
    and o.starts_at > now()
    and o.starts_at < now() + make_interval(days => greatest(p_horizon_days, 1))
  order by o.starts_at asc;
$$;

revoke all on function public.list_bookable_occurrences(int) from public;
grant execute on function public.list_bookable_occurrences(int) to authenticated;
