-- Add category column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'general';

-- Create post_drafts table for "Create Later" feature
CREATE TABLE IF NOT EXISTS post_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  image_url TEXT,
  document_url TEXT,
  document_name TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_name TEXT,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_drafts_user_id ON post_drafts(user_id);

ALTER TABLE post_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own drafts"
  ON post_drafts FOR ALL TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all drafts"
  ON post_drafts FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- ============================================================
-- Safety net: ensure an INSERT policy exists on posts.
-- Some schema dumps of this project show no policies, and without an
-- INSERT policy, authenticated users would get a 403
-- ("new row violates row-level security policy") when creating posts.
-- Idempotent: only creates the policy if no INSERT policy exists.
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'posts'
      AND cmd = 'INSERT'
  ) THEN
    CREATE POLICY "Authenticated users can create posts"
      ON public.posts
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = author_id);
  END IF;
END $$;

-- Notify PostgREST to reload its schema cache so the new `category` column
-- and `post_drafts` table are immediately visible to the REST API.
NOTIFY pgrst, 'reload schema';
