# supabase/

Reference copy of the backend, exported 2026-11-11 after the laptop recovery.

- `functions/`: edge function source (cache-covers, build-next-reads, reset-owner-password, sync-sarasavi). Recovered copies; not byte-compared with the deployed versions. All use `verify_jwt: true`.
- `schema.sql`: reconstructed tables, RLS policies, owner-signup trigger, storage policies and cron job. Reference only, not a verbatim dump or a tested restore.

Deploy a function: `supabase functions deploy <name> --project-ref qafobqzwtqixgowwptcg`.
Owner emails live in `public.admins` (not exported).
