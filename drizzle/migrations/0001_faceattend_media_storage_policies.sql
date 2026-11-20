
CREATE POLICY "Institute members view media" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'faceattend-media' AND (storage.foldername(name))[1] = public.current_institute_id()::text
);

CREATE POLICY "Institute staff upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'faceattend-media'
  AND (storage.foldername(name))[1] = public.current_institute_id()::text
  AND (
    public.is_institute_admin(public.current_institute_id())
    OR ((storage.foldername(name))[2] = 'students' AND public.is_institute_teacher(public.current_institute_id()))
    OR ((storage.foldername(name))[2] = 'profiles' AND (storage.foldername(name))[3] = auth.uid()::text)
  )
);

CREATE POLICY "Institute staff update media" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'faceattend-media'
  AND (storage.foldername(name))[1] = public.current_institute_id()::text
  AND (
    public.is_institute_admin(public.current_institute_id())
    OR ((storage.foldername(name))[2] = 'students' AND public.is_institute_teacher(public.current_institute_id()))
    OR ((storage.foldername(name))[2] = 'profiles' AND (storage.foldername(name))[3] = auth.uid()::text)
  )
);

CREATE POLICY "Institute staff delete media" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'faceattend-media'
  AND (storage.foldername(name))[1] = public.current_institute_id()::text
  AND (
    public.is_institute_admin(public.current_institute_id())
    OR ((storage.foldername(name))[2] = 'students' AND public.is_institute_teacher(public.current_institute_id()))
    OR ((storage.foldername(name))[2] = 'profiles' AND (storage.foldername(name))[3] = auth.uid()::text)
  )
);
