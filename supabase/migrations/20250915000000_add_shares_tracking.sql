-- Add shares_count column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;

-- Create post_shares table for tracking shares
CREATE TABLE IF NOT EXISTS public.post_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'internal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for post_shares
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

-- Anyone can view shares (aggregated counts only)
CREATE POLICY "Anyone can view shares" 
  ON public.post_shares 
  FOR SELECT 
  USING (true);

-- Authenticated users can create shares
CREATE POLICY "Authenticated users can create shares" 
  ON public.post_shares 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own shares
CREATE POLICY "Users can delete their own shares" 
  ON public.post_shares 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update post shares count
CREATE OR REPLACE FUNCTION update_post_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts 
    SET shares_count = shares_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts 
    SET shares_count = GREATEST(0, shares_count - 1)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for shares count
CREATE TRIGGER trigger_update_shares_count
  AFTER INSERT OR DELETE ON post_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_post_shares_count();

-- Backfill shares_count for existing posts (set to 0 if null)
UPDATE posts SET shares_count = 0 WHERE shares_count IS NULL;