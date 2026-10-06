-- Reward, submission review and creator/brand analytics hardening
alter table public.submissions add column if not exists reviewed_at timestamptz;
alter table public.submissions add column if not exists review_note text;
alter table public.submissions add column if not exists current_views bigint default 0;
alter table public.campaigns add column if not exists remaining_budget bigint;
update public.campaigns set remaining_budget=coalesce(remaining_budget,budget) where remaining_budget is null;

create or replace function public.credit_submission_reward(p_submission_id uuid,p_approved_views bigint)
returns bigint language plpgsql security definer set search_path=public as $$
declare s submissions%rowtype; c campaigns%rowtype; reward bigint; cap bigint; available bigint;
begin
 select * into s from submissions where id=p_submission_id for update;
 if not found then raise exception 'submission not found'; end if;
 select * into c from campaigns where id=s.campaign_id for update;
 if not found then raise exception 'campaign not found'; end if;
 if not (public.is_admin() or exists(select 1 from profiles p where p.id=auth.uid() and p.role='admin')) then raise exception 'admin only'; end if;
 cap:=coalesce(c.max_paid_views,c.max_views_per_creator,1000000);
 p_approved_views:=greatest(0,least(p_approved_views,cap));
 reward:=floor(p_approved_views::numeric/1000)*coalesce(
   case when lower(s.platform) like '%tiktok%' then c.cpm_tiktok
        when lower(s.platform) like '%instagram%' then c.cpm_instagram
        when lower(s.platform) like '%youtube%' then c.cpm_youtube end,
   c.reward_per_1k,0);
 available:=coalesce(c.remaining_budget,c.budget,0);
 if reward>available then reward:=available; end if;
 update submissions set status='approved',approved_views=p_approved_views,current_views=p_approved_views,reward_amount=reward,reviewed_at=now(),last_view_check=now() where id=p_submission_id;
 delete from reward_ledger where submission_id=s.id and type='earning';
 if reward>0 then
   insert into reward_ledger(creator_id,submission_id,type,amount,description) values(s.creator_id,s.id,'earning',reward,'Approved campaign views');
   update profiles set balance=coalesce(balance,0)+reward where id=s.creator_id;
   update campaigns set remaining_budget=greatest(0,available-reward),total_spend=coalesce(total_spend,0)+reward,total_views=coalesce(total_views,0)+p_approved_views where id=c.id;
 end if;
 return reward;
end; $$;

create or replace function public.get_creator_stats()
returns table(total_submissions bigint,approved_submissions bigint,pending_submissions bigint,total_views bigint,total_rewards bigint)
language sql security definer set search_path=public as $$
 select count(*)::bigint,count(*) filter(where status='approved')::bigint,count(*) filter(where status='pending')::bigint,
 coalesce(sum(approved_views),0)::bigint,coalesce(sum(reward_amount),0)::bigint
 from submissions where creator_id=auth.uid();
$$;

create or replace function public.get_brand_stats()
returns table(campaigns bigint,active_campaigns bigint,total_submissions bigint,total_views bigint,total_spend bigint,creators bigint)
language sql security definer set search_path=public as $$
 select count(distinct c.id)::bigint,count(distinct c.id) filter(where c.active=true)::bigint,
 count(s.id)::bigint,coalesce(sum(s.approved_views),0)::bigint,coalesce(sum(s.reward_amount),0)::bigint,count(distinct s.creator_id)::bigint
 from campaigns c left join submissions s on s.campaign_id=c.id
 where c.owner_id=auth.uid();
$$;
