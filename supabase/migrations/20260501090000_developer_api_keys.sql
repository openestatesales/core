-- Developer API keys (personal access tokens) for calling OES APIs.
-- Keys belong to `public.developers` (developer portal users).
--
-- Security:
-- - Store only SHA-256 hash + prefix (never store the secret in plaintext).
-- - Return the secret only once from create_developer_api_key().
-- - RLS allows developers to manage only their own keys.

create extension if not exists pgcrypto;

create table if not exists public.developer_api_keys (
  id uuid primary key default gen_random_uuid(),
  developer_id uuid not null references public.developers (id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null,
  scopes text[] not null default array['sales:write']::text[],
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz,
  constraint developer_api_keys_prefix_len check (length(key_prefix) >= 6),
  constraint developer_api_keys_name_len check (length(trim(name)) >= 1)
);

comment on table public.developer_api_keys is 'Hashed API keys for developer portal users (PATs).';
comment on column public.developer_api_keys.key_prefix is 'First characters of secret (for identification).';
comment on column public.developer_api_keys.key_hash is 'SHA-256 hash (hex) of the full secret.';
comment on column public.developer_api_keys.scopes is 'Scope strings like sales:write.';

create index if not exists developer_api_keys_developer_id_idx
  on public.developer_api_keys (developer_id);

create unique index if not exists developer_api_keys_key_hash_unique
  on public.developer_api_keys (key_hash);

alter table public.developer_api_keys enable row level security;

create policy "developer_api_keys_select_own"
  on public.developer_api_keys for select
  to authenticated
  using ((select auth.uid()) = developer_id);

create policy "developer_api_keys_insert_own"
  on public.developer_api_keys for insert
  to authenticated
  with check ((select auth.uid()) = developer_id);

create policy "developer_api_keys_update_own"
  on public.developer_api_keys for update
  to authenticated
  using ((select auth.uid()) = developer_id)
  with check ((select auth.uid()) = developer_id);

-- Hash helper (kept in SQL for parity with the API service).
create or replace function public.hash_api_key (p_key text)
returns text
language sql
immutable
as $$
  select encode(digest(p_key, 'sha256'), 'hex');
$$;

comment on function public.hash_api_key (text) is 'Return sha256 hex hash of an API key secret.';

-- Create a new API key for the authenticated developer.
-- Returns the secret once; caller should store it securely.
create or replace function public.create_developer_api_key (
  p_name text,
  p_scopes text[] default array['sales:write']::text[]
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  key_secret text;
  prefix text;
  key_hash text;
  clean_name text;
  scopes text[];
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  clean_name := nullif(trim(coalesce(p_name, '')), '');
  if clean_name is null then
    raise exception 'name required';
  end if;

  scopes := coalesce(p_scopes, array['sales:write']::text[]);

  -- Ensure developer profile exists (created by oauth callback normally).
  if not exists (select 1 from public.developers d where d.id = uid) then
    raise exception 'developer profile missing';
  end if;

  -- Secret shape: oes_sk_live_<32 hex bytes>
  key_secret := 'oes_sk_live_' || encode(gen_random_bytes(32), 'hex');
  prefix := left(key_secret, 12);
  key_hash := public.hash_api_key(key_secret);

  insert into public.developer_api_keys (developer_id, name, key_prefix, key_hash, scopes)
  values (uid, clean_name, prefix, key_hash, scopes);

  return key_secret;
end;
$$;

comment on function public.create_developer_api_key (text, text[]) is
  'Create a developer API key for auth.uid(); returns secret once.';

revoke all on function public.create_developer_api_key (text, text[]) from public;
grant execute on function public.create_developer_api_key (text, text[]) to authenticated;

create or replace function public.revoke_developer_api_key (p_key_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  update public.developer_api_keys
  set revoked_at = now()
  where id = p_key_id
    and developer_id = uid
    and revoked_at is null;
end;
$$;

comment on function public.revoke_developer_api_key (uuid) is
  'Revoke one API key owned by auth.uid().';

revoke all on function public.revoke_developer_api_key (uuid) from public;
grant execute on function public.revoke_developer_api_key (uuid) to authenticated;

