-- sale_photos_select_published referenced public.sales inside EXISTS. Anon (and
-- shoppers logged in as non-operators) cannot read public.sales — revoked + RLS —
-- so the EXISTS was always false and no listing photos were visible except when
-- the viewer was the sale's operator. Use sales_public_listing (security_invoker
-- = false) so published parent is visible the same way as the rest of discovery.

drop policy if exists "sale_photos_select_published" on public.sale_photos;

create policy "sale_photos_select_published"
  on public.sale_photos for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.sales_public_listing v
      where v.id = sale_photos.sale_id
    )
  );

comment on policy "sale_photos_select_published" on public.sale_photos is
  'Photos for published listings only; join uses sales_public_listing so anon/shoppers do not need SELECT on public.sales.';
