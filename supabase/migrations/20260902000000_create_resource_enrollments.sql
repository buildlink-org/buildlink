-- Migration: Create resource_enrollments table for Hub enrollment tracking
CREATE TABLE IF NOT EXISTS resource_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES skill_resources(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_resource UNIQUE (user_id, resource_id)
);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON resource_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_resource_id ON resource_enrollments(resource_id);
ALTER TABLE resource_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own enrollments"
  ON resource_enrollments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own enrollments"
  ON resource_enrollments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own enrollments"
  ON resource_enrollments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users delete own enrollments"
  ON resource_enrollments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins view all enrollments"
  ON resource_enrollments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_enrollment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_enrollment_updated_at ON resource_enrollments;
CREATE TRIGGER trigger_enrollment_updated_at
  BEFORE UPDATE ON resource_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_enrollment_timestamp();
