-- In-app notifications for dashboard users

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  link_path text,
  read_at timestamptz,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create index notifications_user_unread_idx
  on public.notifications (user_id, created_at desc)
  where read_at is null;

alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.create_notification_for_user(
  p_user_id uuid,
  p_kind text,
  p_title text,
  p_body text default null,
  p_link_path text default null,
  p_metadata jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_user_id is distinct from auth.uid() and not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  insert into public.notifications (
    user_id,
    kind,
    title,
    body,
    link_path,
    metadata
  )
  values (
    p_user_id,
    p_kind,
    p_title,
    p_body,
    p_link_path,
    p_metadata
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.create_notification_for_user(uuid, text, text, text, text, jsonb) from public;
grant execute on function public.create_notification_for_user(uuid, text, text, text, text, jsonb) to authenticated;
