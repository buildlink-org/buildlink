-- ============================================================================
-- Harden profile creation against duplicate / repeated trigger firing
-- ----------------------------------------------------------------------------
-- Problem:
--   * public.handle_new_user() (which INSERTs the profiles row for a new
--     auth user) was NOT idempotent - it had no ON CONFLICT guard.
--   * The trigger that invokes it (on_auth_user_created) is NOT versioned in
--     migrations, so the live DB may hold a dashboard-created or even a
--     duplicate trigger. Firing twice would either create duplicates (in
--     tables without the PK) or make signup fail (PK violation).
-- Fix:
--   * Re-create handle_new_user() with ON CONFLICT (id) DO NOTHING so ANY
--     number of firings produce exactly one profile row (same pattern used
--     by the versioned handle_new_user_privacy_settings() trigger).
--   * Normalize a single canonical on_auth_user_created trigger.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'user_type', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$function$;

-- Guarantee exactly one canonical profile-creating trigger on auth.users.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Diagnostics you can run in the Supabase SQL editor to inspect live state:
-- ----------------------------------------------------------------------------
-- 1) See every trigger attached to auth.users (look for duplicates):
--      SELECT tgname, pg_get_triggerdef(oid)
--      FROM pg_trigger
--      WHERE tgrelid = 'auth.users'::regclass;
--
-- 2) See if any profile id has more than one row:
--      SELECT id, count(*) FROM public.profiles GROUP BY id HAVING count(*) > 1;
-- ============================================================================