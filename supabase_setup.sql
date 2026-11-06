-- ==============================================================================
-- E-CELL NKOCET CERTIFICATE MANAGEMENT SYSTEM
-- Official Database Setup Script for Supabase SQL Editor
-- ==============================================================================

-- 1. Create the Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    certificate_id TEXT UNIQUE NOT NULL,
    participant_name TEXT NOT NULL,
    certificate_type TEXT DEFAULT 'Participation' NOT NULL,
    event_name TEXT DEFAULT 'EUREKA! PITCHING COMPETITION 2026' NOT NULL,
    event_date DATE DEFAULT '2026-08-22' NOT NULL,
    institution TEXT DEFAULT 'N. K. Orchid College of Engineering & Technology, Solapur.' NOT NULL,
    issued_by TEXT DEFAULT 'E-Cell NKOCET' NOT NULL,
    verification_status TEXT DEFAULT 'valid' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Index on certificate_id for lightning-fast verification queries
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_id ON public.certificates (certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_created_at ON public.certificates (created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- 4. Set Up Policies:
-- Allow anyone (public) to SELECT certificates for verification
DROP POLICY IF EXISTS "Public certificates are viewable by everyone" ON public.certificates;
CREATE POLICY "Public certificates are viewable by everyone"
ON public.certificates FOR SELECT
USING ( true );

-- Allow insertion of new certificates
DROP POLICY IF EXISTS "Allow certificate creation" ON public.certificates;
CREATE POLICY "Allow certificate creation"
ON public.certificates FOR INSERT
WITH CHECK ( true );

-- Allow updates to certificates
DROP POLICY IF EXISTS "Allow certificate update" ON public.certificates;
CREATE POLICY "Allow certificate update"
ON public.certificates FOR UPDATE
USING ( true );

-- Allow deletion of certificates
DROP POLICY IF EXISTS "Allow certificate delete" ON public.certificates;
CREATE POLICY "Allow certificate delete"
ON public.certificates FOR DELETE
USING ( true );

-- 5. Enable Realtime Replication for instant live dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.certificates;

-- 6. Insert initial seed demo record (Eureka 2026)
INSERT INTO public.certificates (
    certificate_id,
    participant_name,
    certificate_type,
    event_name,
    event_date,
    institution,
    issued_by,
    verification_status
) VALUES (
    'EKNK26-EUR-A7X92K',
    'SUFIYAN SHAIKH',
    'Participation',
    'EUREKA! PITCHING COMPETITION 2026',
    '2026-08-22',
    'N. K. Orchid College of Engineering & Technology, Solapur.',
    'E-Cell NKOCET',
    'valid'
) ON CONFLICT (certificate_id) DO NOTHING;
