-- ============================================================
-- Fix: shares_count not incrementing on re-share (upsert)
--
-- Problem:
--   The post_shares table has a UNIQUE constraint on (post_id, user_id).
--   When a user shares a post they already shared, the upsert UPDATEs
--   the existing row instead of INSERTing a new one. The trigger
--   `trigger_update_shares_count` only fires on INSERT OR DELETE,
--   so the shares_count was NOT incremented on re-share.
--
--   UI showed optimistic +1, but DB value stayed the same, causing
--   the count to "reset" on refresh.
--
-- Fix:
--   1. Update the trigger function to also handle UPDATE events.
--      On UPDATE, increment shares_count (each share action counts).
--   2. Recreate the trigger to fire on INSERT OR UPDATE OR DELETE.
--   3. Backfill shares_count from actual post_shares row count to
--      correct any drift from the previous bug.
--
-- Idempotent: safe to run multiple times.
-- ============================================================

-- -------------------------------------------------------
-- 1. Update the trigger function to handle INSERT, UPDATE, DELETE
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_post_shares_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET shares_count = shares_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Each share action (including re-shares via upsert) counts as a share
    UPDATE public.posts
    SET shares_count = shares_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET shares_count = GREATEST(0, shares_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- -------------------------------------------------------
-- 2. Recreate the trigger to fire on INSERT OR UPDATE OR DELETE
-- -------------------------------------------------------
DROP TRIGGER IF EXISTS trigger_update_shares_count ON public.post_shares;

CREATE TRIGGER trigger_update_shares_count
  AFTER INSERT OR UPDATE OR DELETE ON public.post_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_shares_count();

-- -------------------------------------------------------
-- 3. Backfill shares_count from actual post_shares data
--    This corrects any drift from the previous bug where
--    re-shares didn't increment the count.
--    We use COUNT(*) of distinct (post_id, user_id) pairs since
--    each unique user-post pair should count as one share.
-- -------------------------------------------------------
UPDATE public.posts p
SET shares_count = COALESCE(
  (SELECT COUNT(*) FROM public.post_shares ps WHERE ps.post_id = p.id),
  0
);

-- -------------------------------------------------------
-- 4. Notify PostgREST to reload schema cache
-- -------------------------------------------------------
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- Done. This migration fixes:
--   ✅ shares_count now increments on re-share (upsert UPDATE)
--   ✅ Trigger fires on INSERT OR UPDATE OR DELETE
--   ✅ shares_count backfilled from actual post_shares data
--   ✅ PostgREST schema cache reloaded
-- ============================================================