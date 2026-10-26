ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS locations text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS featured jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS products jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS milestones jsonb NOT NULL DEFAULT '[]'::jsonb;
