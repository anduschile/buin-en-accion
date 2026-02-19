-- Enable public access for natales_evidence bucket
-- This allows getPublicUrl() to work correctly without signed URLs

-- 1. Ensure the bucket exists (idempotent insert)
INSERT INTO storage.buckets (id, name, public)
VALUES ('natales_evidence', 'natales_evidence', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- 2. Ensure public access policy exists for SELECT (download)
-- Even if public=true, sometimes RLS on objects requires a policy.
-- For a public bucket, RLS is usually bypassed for reads, but let's be safe.

create policy "Public Access to Evidence"
on storage.objects for select
to public
using ( bucket_id = 'natales_evidence' );
