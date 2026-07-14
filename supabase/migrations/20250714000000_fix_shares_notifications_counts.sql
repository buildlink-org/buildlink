-- ============================================================
-- Comprehensive fix for shares, notifications, and counts
-- Fixes:
--   1) post_shares upsert 400 (missing UNIQUE constraint)
--   2) create_notification 404 (overloaded/duplicate functions)
--   3) notifications_type_check violation ('share' not allowed)
--   4) get_notification_for_user missing
--   5) EXECUTE permissions on create_notification
--   6) post_shares UPDATE policy for upsert
--   7) Backfill shares_count from actual post_shares
--   8) PostgREST schema cache reload
-- Idempotent: safe to run multiple times.
-- ============================================================

-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -------------------------------------------------------
-- 1. notifications.link column (used by create_notification)
-- -------------------------------------------------------
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS link text;

-- -------------------------------------------------------
-- 2. posts.shares_count column
-- -------------------------------------------------------
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS shares_count integer DEFAULT 0;

UPDATE public.posts
SET shares_count = 0
WHERE shares_count IS NULL;

-- -------------------------------------------------------
-- 3. post_shares table (create if missing)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.post_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform text NOT NULL DEFAULT 'internal',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

-- RLS policies (drop first to avoid duplicate errors)
DROP POLICY IF EXISTS "Anyone can view shares" ON public.post_shares;
CREATE POLICY "Anyone can view shares"
  ON public.post_shares
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create shares" ON public.post_shares;
CREATE POLICY "Authenticated users can create shares"
  ON public.post_shares
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own shares" ON public.post_shares;
CREATE POLICY "Users can update their own shares"
  ON public.post_shares
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own shares" ON public.post_shares;
CREATE POLICY "Users can delete their own shares"
  ON public.post_shares
  FOR DELETE
  USING (auth.uid() = user_id);

-- -------------------------------------------------------
-- 4. UNIQUE constraint on (post_id, user_id) for upsert
--    This is the fix for the 400 Bad Request error (42P10).
-- -------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS post_shares_post_id_user_id_key
ON public.post_shares (post_id, user_id);

-- -------------------------------------------------------
-- 5. notifications type CHECK constraint
--    Include 'share' and all other valid notification types.
--    Drop the old constraint first (if it exists) and recreate.
-- -------------------------------------------------------
DO $$
BEGIN
  -- Check if the constraint exists and drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'notifications_type_check'
    AND table_name = 'notifications'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.notifications DROP CONSTRAINT notifications_type_check;
  END IF;
END $$;

-- Recreate with all valid types
ALTER TABLE public.notifications
ADD CONSTRAINT notifications_type_check
CHECK (type IN (
  'like',
  'comment',
  'share',
  'post_share',
  'repost',
  'follow',
  'connection',
  'connection_request',
  'connection_accepted',
  'message',
  'mentorship',
  'mentorship_request',
  'mentorship_accepted',
  'rating',
  'general',
  'system',
  'booking',
  'booking_confirmed',
  'booking_cancelled'
));

-- -------------------------------------------------------
-- 6. create_notification function
--    DROP ALL existing versions first to avoid overloads,
--    then create a single clean version.
-- -------------------------------------------------------

-- Drop by signature variations (covers all possible overloads)
DROP FUNCTION IF EXISTS public.create_notification(uuid, text, text, uuid, text);
DROP FUNCTION IF EXISTS public.create_notification(uuid, text, text, uuid);
DROP FUNCTION IF EXISTS public.create_notification(uuid, text, text);
DROP FUNCTION IF EXISTS public.create_notification(text, text, text, text, text);
DROP FUNCTION IF EXISTS public.create_notification(text, text, text, text);

-- Create the single, canonical version
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_content text,
  p_from_user_id uuid DEFAULT NULL,
  p_link text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, type, content, from_user_id, link)
  VALUES (p_user_id, p_type, p_content, p_from_user_id, p_link)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Grant EXECUTE to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.create_notification(uuid, text, text, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification(uuid, text, text, uuid, text) TO anon;

-- -------------------------------------------------------
-- 7. get_notification_for_user function
--    Used by notificationService.ts. Create if missing.
-- -------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_notification_for_user(uuid);
DROP FUNCTION IF EXISTS public.get_notification_for_user(text);

CREATE OR REPLACE FUNCTION public.get_notification_for_user(input_user_id uuid)
RETURNS TABLE(
  id uuid,
  type text,
  category text,
  priority text,
  content text,
  read boolean,
  created_at timestamptz,
  from_user_id uuid,
  link text,
  full_name text,
  avatar text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    n.id,
    n.type,
    n.category,
    n.priority,
    n.content,
    n.read,
    n.created_at,
    n.from_user_id,
    n.link,
    p.full_name,
    p.avatar
  FROM public.notifications n
  LEFT JOIN public.profiles p ON p.id = n.from_user_id
  WHERE n.user_id = input_user_id
  ORDER BY n.created_at DESC
  LIMIT 50;
$$;

GRANT EXECUTE ON FUNCTION public.get_notification_for_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_notification_for_user(uuid) TO anon;

-- -------------------------------------------------------
-- 8. Trigger to maintain posts.shares_count
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

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET shares_count = GREATEST(0, shares_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_shares_count ON public.post_shares;

CREATE TRIGGER trigger_update_shares_count
  AFTER INSERT OR DELETE ON public.post_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_shares_count();

-- -------------------------------------------------------
-- 9. Backfill shares_count from actual post_shares data
-- -------------------------------------------------------
UPDATE public.posts p
SET shares_count = COALESCE(
  (SELECT COUNT(*) FROM public.post_shares ps WHERE ps.post_id = p.id),
  0
)
WHERE p.shares_count IS NULL OR p.shares_count = 0;

-- -------------------------------------------------------
-- 10. Notify PostgREST to reload schema cache
--     This ensures the new function signatures and constraints
--     are immediately available via the API.
-- -------------------------------------------------------
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- Done. This migration fixes:
--   ✅ post_shares upsert (unique constraint added)
--   ✅ create_notification RPC (single clean function, no overloads)
--   ✅ notifications type check ('share' now allowed)
--   ✅ get_notification_for_user (created with proper signature)
--   ✅ EXECUTE permissions granted
--   ✅ post_shares UPDATE policy (for upsert)
--   ✅ shares_count backfilled and trigger maintained
--   ✅ PostgREST schema cache reloaded
-- ============================================================