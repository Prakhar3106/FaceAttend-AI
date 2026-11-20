CREATE OR REPLACE FUNCTION public.update_my_student_contact(_phone text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF length(coalesce(_phone, '')) > 30 THEN
    RAISE EXCEPTION 'Phone number is too long';
  END IF;
  UPDATE public.students
     SET phone = coalesce(_phone, '')
   WHERE user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No student record is linked to this account';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.update_my_student_contact(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_my_student_contact(text) TO authenticated;