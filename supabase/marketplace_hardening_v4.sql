-- Marketplace review + membership hardening
create or replace function public.join_campaign(p_campaign_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is null then raise exception 'login required'; end if;
 if not exists(select 1 from profiles where id=auth.uid() and role='creator') then raise exception 'creator only'; end if;
 if not exists(select 1 from campaigns where id=p_campaign_id and active=true and status='active') then raise exception 'campaign is not active'; end if;
 insert into campaign_members(campaign_id,creator_id) values(p_campaign_id,auth.uid()) on conflict do nothing;
end; $$;

create or replace function public.owner_review_submission(p_submission_id uuid,p_action text,p_note text default null)
returns void language plpgsql security definer set search_path=public as $$
declare s submissions%rowtype; c campaigns%rowtype;
begin
 if auth.uid() is null then raise exception 'login required'; end if;
 select * into s from submissions where id=p_submission_id for update;
 if not found then raise exception 'submission not found'; end if;
 select * into c from campaigns where id=s.campaign_id;
 if c.owner_id<>auth.uid() and not public.is_admin() then raise exception 'not allowed'; end if;
 if s.status<>'pending' then raise exception 'submission already reviewed'; end if;
 if lower(p_action)='reject' then
   update submissions set status='rejected',reviewed_at=now(),review_note=p_note where id=s.id;
 elsif lower(p_action)='approve' then
   update submissions set review_note=p_note where id=s.id;
   raise exception 'owner approval must be finalized by admin with validated views';
 else raise exception 'invalid action'; end if;
end; $$;
