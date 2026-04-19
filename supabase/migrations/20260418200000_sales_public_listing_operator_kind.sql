-- Expose operator_kind on the public listing view for shopper UI (company vs individual).

drop view if exists public.sales_public_listing;

create or replace view public.sales_public_listing
with (security_invoker = false) as
select
  s.id,
  s.operator_id,
  s.title,
  s.region_slug,
  s.listing_slug,
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
  s.created_at,
  o.operator_kind
from public.sales s
inner join public.operators o on o.id = s.operator_id
where s.status = 'published';

comment on view public.sales_public_listing is
  'Published sales; includes operator_kind for listing badges.';

grant select on public.sales_public_listing to anon, authenticated;
