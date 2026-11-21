INSERT INTO public.profiles (
  id,
  full_name,
  user_type,
  profession,
  organization,
  education_level,
  skills
)
SELECT
  auth_user.id,
  COALESCE(NULLIF(trim(auth_user.raw_user_meta_data->>'full_name'), ''), 'New User'),
  COALESCE(NULLIF(trim(auth_user.raw_user_meta_data->>'user_type'), ''), 'student'),
  NULLIF(trim(auth_user.raw_user_meta_data->>'profession'), ''),
  NULLIF(trim(auth_user.raw_user_meta_data->>'organization'), ''),
  NULLIF(trim(auth_user.raw_user_meta_data->>'education_level'), ''),
  CASE
    WHEN jsonb_typeof(auth_user.raw_user_meta_data->'skills') = 'array' THEN ARRAY(
      SELECT jsonb_array_elements_text(auth_user.raw_user_meta_data->'skills')
    )
    ELSE ARRAY[]::text[]
  END
FROM auth.users AS auth_user
LEFT JOIN public.profiles AS profile ON profile.id = auth_user.id
WHERE profile.id IS NULL
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles AS profile
SET
  full_name = CASE
    WHEN NULLIF(trim(profile.full_name), '') IS NULL OR profile.full_name = 'New User'
      THEN COALESCE(NULLIF(trim(auth_user.raw_user_meta_data->>'full_name'), ''), profile.full_name)
    ELSE profile.full_name
  END,
  user_type = COALESCE(NULLIF(trim(profile.user_type), ''), NULLIF(trim(auth_user.raw_user_meta_data->>'user_type'), '')),
  profession = COALESCE(NULLIF(trim(profile.profession), ''), NULLIF(trim(auth_user.raw_user_meta_data->>'profession'), '')),
  organization = COALESCE(NULLIF(trim(profile.organization), ''), NULLIF(trim(auth_user.raw_user_meta_data->>'organization'), '')),
  education_level = COALESCE(NULLIF(trim(profile.education_level), ''), NULLIF(trim(auth_user.raw_user_meta_data->>'education_level'), '')),
  skills = CASE
    WHEN COALESCE(cardinality(profile.skills), 0) = 0
      AND jsonb_typeof(auth_user.raw_user_meta_data->'skills') = 'array'
      THEN ARRAY(
        SELECT jsonb_array_elements_text(auth_user.raw_user_meta_data->'skills')
      )
    ELSE profile.skills
  END,
  updated_at = now()
FROM auth.users AS auth_user
WHERE auth_user.id = profile.id
  AND (
    (NULLIF(trim(profile.full_name), '') IS NULL OR profile.full_name = 'New User')
    OR (NULLIF(trim(profile.user_type), '') IS NULL AND NULLIF(trim(auth_user.raw_user_meta_data->>'user_type'), '') IS NOT NULL)
    OR (NULLIF(trim(profile.profession), '') IS NULL AND NULLIF(trim(auth_user.raw_user_meta_data->>'profession'), '') IS NOT NULL)
    OR (NULLIF(trim(profile.organization), '') IS NULL AND NULLIF(trim(auth_user.raw_user_meta_data->>'organization'), '') IS NOT NULL)
    OR (NULLIF(trim(profile.education_level), '') IS NULL AND NULLIF(trim(auth_user.raw_user_meta_data->>'education_level'), '') IS NOT NULL)
    OR (
      COALESCE(cardinality(profile.skills), 0) = 0
      AND CASE
        WHEN jsonb_typeof(auth_user.raw_user_meta_data->'skills') = 'array'
          THEN jsonb_array_length(auth_user.raw_user_meta_data->'skills') > 0
        ELSE false
      END
    )
  );
