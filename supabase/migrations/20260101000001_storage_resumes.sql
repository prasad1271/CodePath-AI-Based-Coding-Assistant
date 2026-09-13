-- ============================================================
-- CODEPATH SUPABASE STORAGE BUCKET: RESUMES
-- ============================================================

-- Create 'resumes' storage bucket if not already present
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- ------------------------------------------------------------
-- Storage Policies for 'resumes'
-- ------------------------------------------------------------

-- 1. Users can upload resumes into their own folder (user_id/filename)
CREATE POLICY "Users can upload own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Users can read/download their own resumes
CREATE POLICY "Users can read own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Users can update/overwrite their own resumes
CREATE POLICY "Users can update own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Users can delete their own resumes
CREATE POLICY "Users can delete own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
