-- KasirKU: tabel data per toko + pengaman (RLS). Jalankan sekali di SQL Editor Supabase.
create table if not exists public.toko_data (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.toko_data enable row level security;
create policy "pilih data sendiri" on public.toko_data for select to authenticated using ((select auth.uid()) = user_id);
create policy "tambah data sendiri" on public.toko_data for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "ubah data sendiri" on public.toko_data for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "hapus data sendiri" on public.toko_data for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.toko_data from anon;
grant select, insert, update, delete on public.toko_data to authenticated;
