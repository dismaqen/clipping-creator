-- Payment-safe campaign funding and submission tracking primitives
alter table public.submissions add column if not exists external_post_id text;
alter table public.submissions add column if not exists last_view_check timestamptz;
alter table public.submissions add column if not exists current_views bigint default 0;
alter table public.submissions add column if not exists review_note text;
create index if not exists submissions_post_url_idx on public.submissions(post_url);
create index if not exists submissions_status_idx on public.submissions(status);

create or replace function public.admin_mark_submission_rejected(p_submission_id uuid,p_note text default null)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_admin() then raise exception 'admin only'; end if;
 update public.submissions set status='rejected',reviewed_at=now(),review_note=p_note where id=p_submission_id and status='pending';
end; $$;

create or replace function public.admin_update_submission_views(p_submission_id uuid,p_views bigint)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_admin() then raise exception 'admin only'; end if;
 update public.submissions set current_views=greatest(0,p_views),last_view_check=now() where id=p_submission_id;
end; $$;

create or replace function public.admin_activate_campaign(p_campaign_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare c campaigns%rowtype; w bigint;
begin
 if not public.is_admin() then raise exception 'admin only'; end if;
 select * into c from campaigns where id=p_campaign_id for update;
 if not found then raise exception 'campaign not found'; end if;
 select balance into w from campaign_wallets where owner_id=c.owner_id;
 if coalesce(w,0)<coalesce(c.budget,0) then raise exception 'campaign wallet has insufficient funds'; end if;
 update campaigns set active=true,status='active',remaining_budget=coalesce(remaining_budget,budget) where id=c.id;
end; $$;

create or replace function public.admin_pause_campaign(p_campaign_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_admin() then raise exception 'admin only'; end if;
 update campaigns set active=false,status='paused' where id=p_campaign_id;
end; $$;
