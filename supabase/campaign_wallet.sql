-- Campaign wallet & top-up architecture
do $$ begin create type public.topup_status as enum ('pending','paid','rejected','expired'); exception when duplicate_object then null; end $$;
create table if not exists public.campaign_wallets (id uuid primary key default gen_random_uuid(),owner_id uuid not null references public.profiles(id) on delete cascade,balance bigint not null default 0 check(balance>=0),created_at timestamptz default now(),unique(owner_id));
create table if not exists public.campaign_topups (id uuid primary key default gen_random_uuid(),owner_id uuid not null references public.profiles(id) on delete cascade,amount bigint not null check(amount>0),method text not null,status public.topup_status not null default 'pending',external_reference text,created_at timestamptz default now(),paid_at timestamptz);
alter table public.campaign_wallets enable row level security;
alter table public.campaign_topups enable row level security;
drop policy if exists "owner wallet read" on public.campaign_wallets;
create policy "owner wallet read" on public.campaign_wallets for select using(auth.uid()=owner_id or public.is_admin());
drop policy if exists "owner topup read" on public.campaign_topups;
create policy "owner topup read" on public.campaign_topups for select using(auth.uid()=owner_id or public.is_admin());
drop policy if exists "owner topup create" on public.campaign_topups;
create policy "owner topup create" on public.campaign_topups for insert with check(auth.uid()=owner_id);
create or replace function public.create_campaign_topup(p_amount bigint,p_method text) returns uuid language plpgsql security definer set search_path=public as $$
declare x uuid;
begin
 if auth.uid() is null then raise exception 'login required'; end if;
 if p_amount <= 0 then raise exception 'invalid amount'; end if;
 if not exists(select 1 from profiles where id=auth.uid() and role in ('campaign_owner','admin')) then raise exception 'campaign owner required'; end if;
 insert into campaign_wallets(owner_id) values(auth.uid()) on conflict(owner_id) do nothing;
 insert into campaign_topups(owner_id,amount,method) values(auth.uid(),p_amount,p_method) returning id into x;
 return x;
end; $$;
create or replace function public.admin_mark_topup_paid(p_topup_id uuid,p_external_reference text default null) returns void language plpgsql security definer set search_path=public as $$
declare t campaign_topups%rowtype;
begin
 if not public.is_admin() then raise exception 'admin only'; end if;
 select * into t from campaign_topups where campaign_topups.id=p_topup_id for update;
 if not found then raise exception 'topup not found'; end if;
 if t.status='paid' then return; end if;
 if t.status<>'pending' then raise exception 'topup is not pending'; end if;
 update campaign_topups set status='paid',external_reference=coalesce(p_external_reference,external_reference),paid_at=now() where campaign_topups.id=p_topup_id;
 insert into campaign_wallets(owner_id,balance) values(t.owner_id,t.amount) on conflict(owner_id) do update set balance=campaign_wallets.balance+t.amount;
end; $$;
