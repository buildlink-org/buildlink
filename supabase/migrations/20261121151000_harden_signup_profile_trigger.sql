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
    COALESCE(NULLIF(trim(new.raw_user_meta_data->>'full_name'), ''), 'New User'),
    COALESCE(NULLIF(trim(new.raw_user_meta_data->>'user_type'), ''), 'student'),
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
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = CASE
      WHEN NULLIF(trim(public.profiles.full_name), '') IS NULL OR public.profiles.full_name = 'New User'
        THEN EXCLUDED.full_name
      ELSE public.profiles.full_name
    END,
    user_type = COALESCE(NULLIF(trim(public.profiles.user_type), ''), EXCLUDED.user_type),
    profession = COALESCE(NULLIF(trim(public.profiles.profession), ''), EXCLUDED.profession),
    organization = COALESCE(NULLIF(trim(public.profiles.organization), ''), EXCLUDED.organization),
    education_level = COALESCE(NULLIF(trim(public.profiles.education_level), ''), EXCLUDED.education_level),
    skills = CASE
      WHEN COALESCE(cardinality(public.profiles.skills), 0) = 0
        AND COALESCE(cardinality(EXCLUDED.skills), 0) > 0
        THEN EXCLUDED.skills
      ELSE public.profiles.skills
    END,
    updated_at = now()
  WHERE
    ((NULLIF(trim(public.profiles.full_name), '') IS NULL OR public.profiles.full_name = 'New User')
      AND EXCLUDED.full_name <> 'New User')
    OR (NULLIF(trim(public.profiles.user_type), '') IS NULL AND EXCLUDED.user_type IS NOT NULL)
    OR (NULLIF(trim(public.profiles.profession), '') IS NULL AND EXCLUDED.profession IS NOT NULL)
    OR (NULLIF(trim(public.profiles.organization), '') IS NULL AND EXCLUDED.organization IS NOT NULL)
    OR (NULLIF(trim(public.profiles.education_level), '') IS NULL AND EXCLUDED.education_level IS NOT NULL)
    OR (COALESCE(cardinality(public.profiles.skills), 0) = 0 AND COALESCE(cardinality(EXCLUDED.skills), 0) > 0);

  RETURN new;
END;
$function$;
