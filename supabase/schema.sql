-- Helli's Library: reconstructed schema, exported read-only from the live project
-- (qafobqzwtqixgowwptcg) on 2026-11-11 from information_schema / pg_policies / pg_proc.
-- Reference only: NOT a verbatim pg_dump and not tested by replaying on a fresh project.
-- Not captured: indexes, grants, next_reads.id identity/sequence setup, contents of public.admins.
-- Extensions in use: pg_cron, pg_net, pg_trgm, pgcrypto, uuid-ossp, supabase_vault.

create table public.admins (email text primary key);
create table public.settings (
  id integer primary key check (id = 1),
  display_name text not null default 'Helli',
  whatsapp text,
  currency text not null default 'LKR'
);
create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null, author text, isbn text, cover_url text, cover_src text,
  series text, series_no integer, series_total integer,
  status text not null default 'unread' check (status in ('unread','reading','read')),
  rating integer not null default 0 check (rating between 0 and 5),
  progress integer not null default 0 check (progress between 0 and 100),
  is_lent boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.lending (
  book_id uuid primary key references public.books(id) on delete cascade,
  borrower text not null,
  lent_on date not null default current_date
);
create table public.wishlist (
  id uuid primary key default gen_random_uuid(),
  title text not null, author text, isbn text, cover_url text, cover_src text,
  series text, series_no integer,
  created_at timestamptz not null default now()
);
create table public.sales (
  id uuid primary key default gen_random_uuid(),
  title text not null, author text, isbn text, cover_url text, cover_src text,
  price numeric, note text,
  condition text not null default 'good' check (condition in ('like new','good','worn')),
  status text not null default 'available' check (status in ('available','reserved','sold')),
  created_at timestamptz not null default now()
);
create table public.activity (
  id uuid primary key default gen_random_uuid(),
  text text not null, cover_url text,
  created_at timestamptz not null default now()
);
create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  text text not null check (length(trim(text)) between 1 and 280),
  granted boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.next_reads (
  id bigint primary key,  -- the live DB fills this automatically (identity/sequence); verify when replaying
  title text not null, author text, cover_url text,
  reason text not null,
  private boolean not null default false,
  rank integer not null default 0,
  created_at timestamptz not null default now()
);
create table public.job_runs (name text primary key, ran_at timestamptz not null);

alter table public.admins enable row level security;     -- no policies: read only via security definer functions / service role
alter table public.settings enable row level security;
alter table public.books enable row level security;
alter table public.lending enable row level security;
alter table public.wishlist enable row level security;
alter table public.sales enable row level security;
alter table public.activity enable row level security;
alter table public.wishes enable row level security;
alter table public.next_reads enable row level security;
alter table public.job_runs enable row level security;   -- no policies: edge functions only (service role)

create or replace function public.handle_owner_signup() returns trigger
language plpgsql security definer set search_path to '' as $$
begin
  if not exists (select 1 from public.admins a where lower(a.email) = lower(new.email)) then
    raise exception 'Only the library owner can create an account';
  end if;
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  return new;
end; $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path to '' as $$
  select exists (select 1 from public.admins a where lower(a.email) = lower(auth.jwt() ->> 'email'))
$$;

create trigger owner_signup_only before insert on auth.users
  for each row execute function public.handle_owner_signup();

-- Public read, owner write
create policy "public read books" on public.books for select to public using (true);
create policy "owner insert books" on public.books for insert to public with check (is_admin());
create policy "owner update books" on public.books for update to public using (is_admin()) with check (is_admin());
create policy "owner delete books" on public.books for delete to public using (is_admin());
create policy "public read sales" on public.sales for select to public using (true);
create policy "owner insert sales" on public.sales for insert to public with check (is_admin());
create policy "owner update sales" on public.sales for update to public using (is_admin()) with check (is_admin());
create policy "owner delete sales" on public.sales for delete to public using (is_admin());
create policy "public read settings" on public.settings for select to public using (true);
create policy "owner update settings" on public.settings for update to public using (is_admin()) with check (is_admin());
-- Owner only
create policy "owner all lending" on public.lending for all to public using (is_admin()) with check (is_admin());
create policy "owner all activity" on public.activity for all to public using (is_admin()) with check (is_admin());
create policy "owner all wishlist" on public.wishlist for all to public using (is_admin()) with check (is_admin());
create policy "owner all wishes" on public.wishes for all to authenticated using (is_admin()) with check (is_admin());
-- next_reads: everyone sees non-private picks, owners see all
create policy "public next reads" on public.next_reads for select to anon, authenticated using (not private);
create policy "owner next reads" on public.next_reads for select to authenticated using (is_admin());

-- Storage: public 'covers' bucket (5 MB limit; jpeg/png/webp)
-- insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
--   values ('covers','covers',true,5242880,'{image/jpeg,image/png,image/webp}');
create policy "owner upload covers" on storage.objects for insert to authenticated with check (bucket_id = 'covers' and is_admin());
create policy "owner update covers" on storage.objects for update to authenticated using (bucket_id = 'covers' and is_admin()) with check (bucket_id = 'covers' and is_admin());
create policy "owner delete covers" on storage.objects for delete to authenticated using (bucket_id = 'covers' and is_admin());

-- Daily rebuild of "Your next reads" (03:00 UTC). The live job uses the public anon key from config.js as the bearer token.
select cron.schedule('build-next-reads-daily', '0 3 * * *', $job$
  select net.http_post(
    url := 'https://qafobqzwtqixgowwptcg.supabase.co/functions/v1/build-next-reads',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer <ANON_KEY from config.js>"}'::jsonb,
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
$job$);
