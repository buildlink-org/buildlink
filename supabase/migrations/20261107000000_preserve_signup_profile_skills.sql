CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type, skills)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'user_type', 'student'),
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
SET skills = ARRAY(
  SELECT jsonb_array_elements_text(auth_user.raw_user_meta_data->'skills')
)
FROM auth.users AS auth_user
WHERE auth_user.id = profile.id
  AND (profile.skills IS NULL OR cardinality(profile.skills) = 0)
  AND jsonb_typeof(auth_user.raw_user_meta_data->'skills') = 'array';
