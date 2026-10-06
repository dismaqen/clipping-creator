-- Brand funding and payout rejection hardening
create or replace function public.admin_reject_payout(p_payout_id uuid,p_note text default null)
returns void language plpgsql security definer set search_path=public as $$
declare p payouts%rowtype;
begin
 if not public.is_admin() then raise exception 'admin only'; end if;
 select * into p from payouts where id=p_payout_id for update;
 if not found or p.status<>'pending' then raise exception 'payout not found or already processed'; end if;
 update payouts set status='rejected' where id=p.id;
 update profiles set balance=coalesce(balance,0)+p.amount where id=p.creator_id;
end; $$;
revoke all on function public.admin_reject_payout(uuid,text) from public;
grant execute on function public.admin_reject_payout(uuid,text) to authenticated;

create or replace function public.get_owner_wallet()
returns table(balance bigint)
language sql security definer set search_path=public as $$
 select coalesce(cw.balance,0)::bigint from campaign_wallets cw where cw.owner_id=auth.uid();
$$;
revoke all on function public.get_owner_wallet() from public;
grant execute on function public.get_owner_wallet() to authenticated;
