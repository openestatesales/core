-- Developer portal: one row per auth user who registers (GitHub OAuth).
-- PK = auth.users.id. Inserts/updates are done via register_developer() from the
-- developer app callback so partial upserts never wipe app_name / tier.

create table public.developers (
  id uuid primary key references auth.users (id) on delete cascade,
  app_name text,
  github_username text,
  tier text not null default 'free' check (tier in ('free', 'pro', 'enterprise')),
  created_at timestamptz not null default now()
);

comment on table public.developers is 'Developer portal profiles; id matches auth.users.';
comment on column public.developers.app_name is 'Display name for the developer app/integration (optional).';
comment on column public.developers.github_username is 'GitHub login from OAuth user_metadata when available.';
comment on column public.developers.tier is 'Billing / access tier.';

create index developers_github_username_lower_idx on public.developers (lower(github_username));

alter table public.developers enable row level security;

create policy "developers_select_own"
  on public.developers for select
  to authenticated
  using (auth.uid() = id);

create policy "developers_insert_own"
  on public.developers for insert
  to authenticated
  with check (auth.uid() = id);

create policy "developers_update_own"
  on public.developers for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Called after OAuth exchange; merges github_username without clobbering app_name or tier.
create or replace function public.register_developer (p_github_username text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  gh  text;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  gh := nullif(trim(coalesce(p_github_username, '')), '');

  insert into public.developers (id, github_username)
  values (uid, gh)
  on conflict (id) do update
  set github_username = coalesce(excluded.github_username, public.developers.github_username);
end;
$$;

comment on function public.register_developer (text) is 'Upsert developer row for the current user (OAuth callback).';

revoke all on function public.register_developer (text) from public;
grant execute on function public.register_developer (text) to authenticated;
