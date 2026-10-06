-- Clipping Creator: full marketplace campaign schema
alter table public.campaigns
  add column if not exists category text,
  add column if not exists language text default 'Indonesia',
  add column if not exists cpm_tiktok bigint,
  add column if not exists cpm_instagram bigint,
  add column if not exists cpm_youtube bigint,
  add column if not exists min_views bigint default 0,
  add column if not exists max_paid_views bigint,
  add column if not exists initial_cpm bigint,
  add column if not exists required_hashtags text,
  add column if not exists required_tags text,
  add column if not exists content_duration_min integer,
  add column if not exists content_duration_max integer,
  add column if not exists content_format text,
  add column if not exists hook_script text,
  add column if not exists objective text,
  add column if not exists do_rules text,
  add column if not exists dont_rules text,
  add column if not exists source_assets text,
  add column if not exists start_at timestamptz,
  add column if not exists end_at timestamptz,
  add column if not exists status text default 'draft',
  add column if not exists review_note text,
  add column if not exists total_views bigint default 0,
  add column if not exists total_spend bigint default 0;

create table if not exists public.campaign_members (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  status text default 'joined',
  unique(campaign_id, creator_id)
);
alter table public.campaign_members enable row level security;
drop policy if exists "members own read" on public.campaign_members;
create policy "members own read" on public.campaign_members for select using (auth.uid()=creator_id);
drop policy if exists "members own insert" on public.campaign_members;
create policy "members own insert" on public.campaign_members for insert with check (auth.uid()=creator_id);

create index if not exists campaigns_active_idx on public.campaigns(active,status,created_at desc);
create index if not exists submissions_campaign_idx on public.submissions(campaign_id,status,created_at desc);
create index if not exists snapshots_submission_idx on public.view_snapshots(submission_id,checked_at desc);
create index if not exists members_creator_idx on public.campaign_members(creator_id,campaign_id);

-- Make campaign-owner reads/writes possible without weakening creator/public access.
drop policy if exists "owner campaigns read" on public.campaigns;
create policy "owner campaigns read" on public.campaigns for select using (auth.uid()=owner_id or active=true or public.is_admin());
drop policy if exists "owner campaigns insert" on public.campaigns;
create policy "owner campaigns insert" on public.campaigns for insert with check (auth.uid()=owner_id);
drop policy if exists "owner campaigns update" on public.campaigns;
create policy "owner campaigns update" on public.campaigns for update using (auth.uid()=owner_id or public.is_admin()) with check (auth.uid()=owner_id or public.is_admin());

-- Owner analytics can read submissions belonging to their campaigns.
drop policy if exists "owner campaign submissions read" on public.submissions;
create policy "owner campaign submissions read" on public.submissions for select using (
  auth.uid()=creator_id
  or exists (select 1 from public.campaigns c where c.id=submissions.campaign_id and c.owner_id=auth.uid())
  or public.is_admin()
);

-- Helper for dashboard metrics.
create or replace function public.get_owner_campaign_stats(p_campaign_id uuid)
returns table (
  total_submissions bigint,
  approved_submissions bigint,
  pending_submissions bigint,
  rejected_submissions bigint,
  total_views bigint,
  approved_views bigint,
  total_rewards bigint,
  creators bigint
)
language sql
security definer
set search_path=public
as $$
  select
    count(*)::bigint,
    count(*) filter (where s.status='approved')::bigint,
    count(*) filter (where s.status='pending')::bigint,
    count(*) filter (where s.status='rejected')::bigint,
    coalesce(sum(coalesce(s.approved_views,0)),0)::bigint,
    coalesce(sum(case when s.status='approved' then coalesce(s.approved_views,0) else 0 end),0)::bigint,
    coalesce(sum(coalesce(s.reward_amount,0)),0)::bigint,
    count(distinct s.creator_id)::bigint
  from public.submissions s
  join public.campaigns c on c.id=s.campaign_id
  where s.campaign_id=p_campaign_id and (c.owner_id=auth.uid() or public.is_admin());
$$;
