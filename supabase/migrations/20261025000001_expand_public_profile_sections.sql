DROP FUNCTION IF EXISTS public.get_public_profile_info(uuid);
CREATE FUNCTION public.get_public_profile_info(user_id_param uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  title text,
  profession text,
  organization text,
  avatar text,
  user_type text,
  created_at timestamptz,
  bio text,
  skills text[],
  education jsonb,
  experiences jsonb,
  certifications jsonb,
  portfolio jsonb,
  featured jsonb,
  products jsonb,
  milestones jsonb,
  locations text[],
  languages jsonb,
  social_links jsonb,
  education_level text,
  profile_completion_score integer,
  verification_level text,
  verification_badges jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT
    p.id, p.full_name, p.title, p.profession, p.organization, p.avatar,
    p.user_type, p.created_at, p.bio, p.skills, p.education, p.experiences,
    p.certifications, p.portfolio, p.featured, p.products, p.milestones,
    p.locations, p.languages, p.social_links, p.education_level,
    p.profile_completion_score, p.verification_level, p.verification_badges
  FROM public.profiles AS p
  WHERE p.id = user_id_param
    AND p.profile_visibility = 'public'
    AND auth.uid() IS NOT NULL;
$function$;

DROP FUNCTION IF EXISTS public.get_connected_profile_info(uuid);
CREATE FUNCTION public.get_connected_profile_info(user_id_param uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  title text,
  profession text,
  organization text,
  avatar text,
  user_type text,
  bio text,
  skills text[],
  created_at timestamptz,
  education jsonb,
  experiences jsonb,
  certifications jsonb,
  portfolio jsonb,
  featured jsonb,
  products jsonb,
  milestones jsonb,
  locations text[],
  languages jsonb,
  social_links jsonb,
  education_level text,
  profile_completion_score integer,
  verification_level text,
  verification_badges jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT
    p.id, p.full_name, p.title, p.profession, p.organization, p.avatar,
    p.user_type, p.bio, p.skills, p.created_at, p.education, p.experiences,
    p.certifications, p.portfolio, p.featured, p.products, p.milestones,
    p.locations, p.languages, p.social_links, p.education_level,
    p.profile_completion_score, p.verification_level, p.verification_badges
  FROM public.profiles AS p
  WHERE p.id = user_id_param
    AND auth.uid() IS NOT NULL
    AND (
      p.profile_visibility = 'public'
      OR EXISTS (
        SELECT 1
        FROM public.connections AS c
        WHERE c.status = 'accepted'
          AND (
            (c.user_id = auth.uid() AND c.connected_user_id = user_id_param)
            OR (c.connected_user_id = auth.uid() AND c.user_id = user_id_param)
          )
      )
    );
$function$;

GRANT EXECUTE ON FUNCTION public.get_public_profile_info(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_connected_profile_info(uuid) TO authenticated;
