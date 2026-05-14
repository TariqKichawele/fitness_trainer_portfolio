-- Atomic admin update: profile fields + app role in one transaction (RPC).

create or replace function public.upsert_profile_and_role(
  p_user_id uuid,
  p_display_name text,
  p_phone_number text,
  p_address_line_1 text,
  p_address_line_2 text,
  p_post_code text,
  p_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (select public.is_admin()) then
    raise exception 'not authorized';
  end if;

  if p_role is null or p_role not in ('user', 'client') then
    raise exception 'invalid role';
  end if;

  if exists (
    select 1
    from public.user_roles ur
    where ur.user_id = p_user_id
      and ur.role = 'admin'
  ) then
    raise exception 'cannot edit admin';
  end if;

  update public.profiles
  set
    display_name = p_display_name,
    phone_number = p_phone_number,
    address_line_1 = p_address_line_1,
    address_line_2 = p_address_line_2,
    post_code = p_post_code
  where id = p_user_id;

  if not found then
    raise exception 'profile not found';
  end if;

  update public.user_roles
  set role = p_role
  where user_id = p_user_id;

  if not found then
    raise exception 'user role not found';
  end if;
end;
$$;

revoke all on function public.upsert_profile_and_role(uuid, text, text, text, text, text, text) from public;
grant execute on function public.upsert_profile_and_role(uuid, text, text, text, text, text, text) to authenticated;
