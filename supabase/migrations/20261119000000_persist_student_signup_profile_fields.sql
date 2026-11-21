CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    user_type,
    profession,
    organization,
    education_level,
    skills
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'user_type', 'student'),
    NULLIF(trim(new.raw_user_meta_data->>'profession'), ''),
    NULLIF(trim(new.raw_user_meta_data->>'organization'), ''),
    NULLIF(trim(new.raw_user_meta_data->>'education_level'), ''),
    CASE
      WHEN jsonb_typeof(new.raw_user_meta_data->'skills') = 'array' THEN ARRAY(
        SELECT jsonb_array_elements_text(new.raw_user_meta_data->'skills')
      )
      ELSE ARRAY[]::text[]
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$function$;

UPDATE public.profiles AS profile
SET
  profession = COALESCE(NULLIF(trim(profile.profession), ''), NULLIF(trim(auth_user.raw_user_meta_data->>'profession'), '')),
  organization = COALESCE(NULLIF(trim(profile.organization), ''), NULLIF(trim(auth_user.raw_user_meta_data->>'organization'), '')),
  education_level = COALESCE(NULLIF(trim(profile.education_level), ''), NULLIF(trim(auth_user.raw_user_meta_data->>'education_level'), ''))
FROM auth.users AS auth_user
WHERE auth_user.id = profile.id
  AND (
    (NULLIF(trim(profile.profession), '') IS NULL AND NULLIF(trim(auth_user.raw_user_meta_data->>'profession'), '') IS NOT NULL)
    OR (NULLIF(trim(profile.organization), '') IS NULL AND NULLIF(trim(auth_user.raw_user_meta_data->>'organization'), '') IS NOT NULL)
    OR (NULLIF(trim(profile.education_level), '') IS NULL AND NULLIF(trim(auth_user.raw_user_meta_data->>'education_level'), '') IS NOT NULL)
  );
