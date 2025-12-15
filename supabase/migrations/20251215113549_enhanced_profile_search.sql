-- Enhanced profile search function with filters and public profile support
CREATE OR REPLACE FUNCTION public.search_profiles_enhanced(
  search_term text,
  account_type_filter text DEFAULT NULL,
  experience_level_filter text DEFAULT NULL,
  skills_filter text[] DEFAULT NULL,
  current_user_id uuid DEFAULT auth.uid()
)
RETURNS TABLE(
  id uuid,
  full_name text,
  title text,
  profession text,
  organization text,
  avatar text,
  user_type text,
  skills text[],
  bio text,
  connection_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  search_pattern text;
BEGIN
  -- Build search pattern
  search_pattern := '%' || LOWER(TRIM(search_term)) || '%';

  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.title,
    p.profession,
    p.organization,
    p.avatar,
    p.user_type,
    COALESCE(p.skills, ARRAY[]::text[]) as skills,
    p.bio,
    CASE
      WHEN p.id = current_user_id THEN 'self'
      WHEN EXISTS (
        SELECT 1 FROM connections c
        WHERE c.status = 'accepted'
        AND (
          (c.user_id = current_user_id AND c.connected_user_id = p.id)
          OR (c.connected_user_id = current_user_id AND c.user_id = p.id)
        )
      ) THEN 'connected'
      WHEN EXISTS (
        SELECT 1 FROM connections c
        WHERE c.status = 'pending'
        AND (
          (c.user_id = current_user_id AND c.connected_user_id = p.id)
          OR (c.connected_user_id = current_user_id AND c.user_id = p.id)
        )
      ) THEN 'pending'
      ELSE 'not_connected'
    END as connection_status
  FROM profiles p
  WHERE 
    current_user_id IS NOT NULL
    AND p.id != current_user_id
    AND (
      -- Public profiles OR connected profiles
      p.profile_visibility = 'public'
      OR EXISTS (
        SELECT 1 FROM connections c
        WHERE c.status = 'accepted'
        AND (
          (c.user_id = current_user_id AND c.connected_user_id = p.id)
          OR (c.connected_user_id = current_user_id AND c.user_id = p.id)
        )
      )
    )
    -- Search matching
    AND (
      LOWER(p.full_name) LIKE search_pattern
      OR LOWER(p.profession) LIKE search_pattern
      OR LOWER(p.title) LIKE search_pattern
      OR LOWER(p.organization) LIKE search_pattern
      OR EXISTS (
        SELECT 1 FROM unnest(COALESCE(p.skills, ARRAY[]::text[])) as skill
        WHERE LOWER(skill) LIKE search_pattern
      )
    )
    -- Account type filter
    AND (account_type_filter IS NULL OR p.user_type = account_type_filter)
    -- Skills filter
    AND (
      skills_filter IS NULL 
      OR skills_filter = ARRAY[]::text[]
      OR EXISTS (
        SELECT 1 FROM unnest(COALESCE(p.skills, ARRAY[]::text[])) as skill
        WHERE skill = ANY(skills_filter)
      )
    )
  ORDER BY
    -- Priority: exact name match, then starts with, then contains
    CASE 
      WHEN LOWER(p.full_name) = LOWER(TRIM(search_term)) THEN 1
      WHEN LOWER(p.full_name) LIKE LOWER(TRIM(search_term)) || '%' THEN 2
      ELSE 3
    END,
    p.full_name
  LIMIT 50;
END;
$$;