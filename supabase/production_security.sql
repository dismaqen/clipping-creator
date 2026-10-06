-- Production security patch for Clipping Creator
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "profiles own read" on public.profiles;
create policy "profiles own read" on public.profiles for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "campaigns public active read" on public.campaigns;
create policy "campaigns public active read" on public.campaigns for select
using (active = true or public.is_admin());
create policy "admins manage campaigns" on public.campaigns for all
using (public.is_admin()) with check (public.is_admin());

create policy "admins manage submissions" on public.submissions for all
using (public.is_admin()) with check (public.is_admin());
create policy "admins read payouts" on public.payouts for select
using (public.is_admin());
create policy "admins update payouts" on public.payouts for update
using (public.is_admin()) with check (public.is_admin());
create policy "admins read ledger" on public.reward_ledger for select
using (public.is_admin());
create policy "admins manage snapshots" on public.view_snapshots for all
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "creator insert payouts" on public.payouts;

create or replace function public.mark_payout_paid(p_payout_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  update public.payouts
  set status = 'paid', paid_at = now()
  where id = p_payout_id and status = 'pending';
  if not found then raise exception 'payout not found or already processed'; end if;
end;
$$;
revoke all on function public.mark_payout_paid(uuid) from public;
grant execute on function public.mark_payout_paid(uuid) to authenticated;

-- Safe first-admin bootstrap: only works while the project has no admin.
create or replace function public.bootstrap_first_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'login required'; end if;
  if exists(select 1 from public.profiles where role='admin') then
    return false;
  end if;
  update public.profiles set role='admin' where id=auth.uid();
  return found;
end;
$$;
revoke all on function public.bootstrap_first_admin() from public;
grant execute on function public.bootstrap_first_admin() to authenticated;
