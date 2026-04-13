-- RPCs for public reads and analytics (security definer where RLS would block anon).

create or replace function public.increment_view_count (sale_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.sales
  set view_count = view_count + 1
  where id = sale_id
    and status = 'published';
end;
$$;

comment on function public.increment_view_count (uuid) is 'Bump view_count for a published sale (anon-safe).';

grant execute on function public.increment_view_count (uuid) to anon, authenticated;

create or replace function public.get_public_operator (operator_id uuid)
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
  where o.id = operator_id
    and exists (
      select 1
      from public.sales s
      where s.operator_id = o.id
        and s.status = 'published'
    );
$$;

comment on function public.get_public_operator (uuid) is 'Single operator row without email/phone, only if they have a published sale.';

grant execute on function public.get_public_operator (uuid) to anon, authenticated;
