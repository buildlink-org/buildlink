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
  education_level text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT
    profiles.id,
    profiles.full_name,
    profiles.title,
    profiles.profession,
    profiles.organization,
    profiles.avatar,
    profiles.user_type,
    profiles.created_at,
    profiles.education_level
  FROM public.profiles AS profiles
  WHERE profiles.id = user_id_param
    AND profiles.profile_visibility = 'public'
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
  education_level text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT
    profiles.id,
    profiles.full_name,
    profiles.title,
    profiles.profession,
    profiles.organization,
    profiles.avatar,
    profiles.user_type,
    profiles.bio,
    profiles.skills,
    profiles.created_at,
    profiles.education_level
  FROM public.profiles AS profiles
  WHERE profiles.id = user_id_param
    AND (
      profiles.profile_visibility = 'public'
      OR EXISTS (
        SELECT 1
        FROM public.connections AS connections
        WHERE connections.status = 'accepted'
          AND (
            (connections.user_id = auth.uid() AND connections.connected_user_id = user_id_param)
            OR (connections.connected_user_id = auth.uid() AND connections.user_id = user_id_param)
          )
      )
    )
    AND auth.uid() IS NOT NULL;
$function$;

GRANT EXECUTE ON FUNCTION public.get_public_profile_info(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_connected_profile_info(uuid) TO authenticated;

NOTIFY pgrst, 'reload schema';
