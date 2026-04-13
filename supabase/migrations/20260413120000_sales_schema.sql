-- Estate sale listings: operators, sales, photos.
-- operators.id must match auth.users.id when using Supabase Auth + RLS.

-- Uses gen_random_uuid() (no uuid-ossp). PostGIS: add when you need geography indexes or radius queries.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.operators (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  name          text not null,
  company_name  text,
  phone         text,
  slug          text not null,
  city          text,
  state         text,
  created_at    timestamptz not null default now(),
  constraint operators_email_lower unique (lower(trim(email))),
  constraint operators_slug_key unique (slug)
);

create index operators_slug_idx on public.operators (slug);

comment on table public.operators is 'Operator profile; PK = auth.users.id. Use list_public_operator_directory() for safe public reads (no email/phone).';

create table public.sales (
  id                  uuid primary key default gen_random_uuid(),
  operator_id         uuid not null references public.operators (id) on delete cascade,
  title               text not null,
  slug                text not null unique,
  description         text,
  city                text not null,
  state               text not null,
  zip                 text,
  lat_fuzzy           double precision,
  lng_fuzzy           double precision,
  address             text,
  lat                 double precision,
  lng                 double precision,
  address_reveal_at   timestamptz not null,
  start_date          date not null,
  end_date            date not null,
  preview_times       text,
  status              text not null default 'draft' check (status in ('draft', 'published', 'ended')),
  view_count          int not null default 0 check (view_count >= 0),
  created_at          timestamptz not null default now(),
  published_at        timestamptz,
  constraint sales_end_after_start check (end_date >= start_date)
);

create index sales_operator_id_idx on public.sales (operator_id);
create index sales_status_idx on public.sales (status);
create index sales_start_date_idx on public.sales (start_date);
create index sales_state_city_idx on public.sales (state, city);

comment on table public.sales is 'Sale rows may contain exact address; prefer sales_public_listing for discovery UIs.';
comment on column public.sales.lat_fuzzy is 'Approximate map pin before address reveal.';
comment on column public.sales.address_reveal_at is 'When exact address / lat / lng may be shown.';

create table public.sale_photos (
  id            uuid primary key default gen_random_uuid(),
  sale_id       uuid not null references public.sales (id) on delete cascade,
  storage_path  text not null,
  alt_text      text,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  constraint sale_photos_sort_nonnegative check (sort_order >= 0)
);

create index sale_photos_sale_id_idx on public.sale_photos (sale_id);

-- ---------------------------------------------------------------------------
-- Public reads (masking + no PII): security definer, fixed WHERE clauses
-- ---------------------------------------------------------------------------

create or replace function public.list_public_operator_directory ()
returns table (
  id uuid,
  name text,
  company_name text,
  slug text,
  city text,
  state text
)
language sql
stable
security definer
set search_path = public
as $$
  select o.id, o.name, o.company_name, o.slug, o.city, o.state
  from public.operators o
  where exists (
    select 1
    from public.sales s
    where s.operator_id = o.id
      and s.status = 'published'
  );
$$;

comment on function public.list_public_operator_directory is 'Safe directory rows (no email/phone).';

create or replace view public.sales_public_listing
with (security_invoker = false) as
select
  s.id,
  s.operator_id,
  s.title,
  s.slug,
  s.description,
  s.city,
  s.state,
  s.zip,
  s.lat_fuzzy,
  s.lng_fuzzy,
  case
    when s.address_reveal_at <= now() then s.address
  end as address,
  case
    when s.address_reveal_at <= now() then s.lat
  end as lat,
  case
    when s.address_reveal_at <= now() then s.lng
  end as lng,
  s.address_reveal_at,
  s.start_date,
  s.end_date,
  s.preview_times,
  s.status,
  s.view_count,
  s.published_at,
  s.created_at
from public.sales s
where s.status = 'published';

comment on view public.sales_public_listing is 'Published sales only; masks exact address until address_reveal_at. security_invoker=false so anon need not SELECT base table.';

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.operators enable row level security;
alter table public.sales enable row level security;
alter table public.sale_photos enable row level security;

-- Operators: only own row (no broad public SELECT — use list_public_operator_directory)
create policy "operators_select_own"
  on public.operators for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "operators_insert_own"
  on public.operators for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "operators_update_own"
  on public.operators for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Sales: operators manage own rows (draft / publish / ended)
create policy "sales_operator_all_own"
  on public.sales for all
  to authenticated
  using ((select auth.uid()) = operator_id)
  with check ((select auth.uid()) = operator_id);

-- Photos: published readable by anyone with access to sales_public_listing flow;
-- base table still needs a policy for PostgREST when joining from client — restrict to published parent
create policy "sale_photos_select_published"
  on public.sale_photos for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.sales s
      where s.id = sale_photos.sale_id
        and s.status = 'published'
    )
  );

create policy "sale_photos_operator_all_own"
  on public.sale_photos for all
  to authenticated
  using (
    exists (
      select 1
      from public.sales s
      where s.id = sale_photos.sale_id
        and s.operator_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.sales s
      where s.id = sale_photos.sale_id
        and s.operator_id = (select auth.uid())
    )
  );

-- Grants: discovery UIs use view + RPC (no direct anon SELECT on operators / sales base)
grant select on public.sales_public_listing to anon, authenticated;
grant execute on function public.list_public_operator_directory () to anon, authenticated;

revoke select on public.operators from anon;
revoke select on public.sales from anon;
