-- ==============================================================================
-- CAMPVENTO - STEP 4.1: Organizer Profile Migration
-- ==============================================================================

-- 1. Create table: organizer_profiles
CREATE TABLE IF NOT EXISTS public.organizer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    college_name TEXT,
    organization_name TEXT,
    description TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    verification_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT organizer_profiles_user_id_key UNIQUE (user_id)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.organizer_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policy: SELECT (Organizers can view ONLY their own profile)
DROP POLICY IF EXISTS "Organizers can view their own profile" ON public.organizer_profiles;
CREATE POLICY "Organizers can view their own profile"
    ON public.organizer_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- 4. Policy: INSERT (Organizers can insert their own profile with PENDING status)
DROP POLICY IF EXISTS "Organizers can insert their own profile" ON public.organizer_profiles;
CREATE POLICY "Organizers can insert their own profile"
    ON public.organizer_profiles
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND verification_status = 'PENDING'
    );

-- 5. Policy: UPDATE (Organizers can update their own profile)
DROP POLICY IF EXISTS "Organizers can update their own profile" ON public.organizer_profiles;
CREATE POLICY "Organizers can update their own profile"
    ON public.organizer_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. Trigger to prevent non-admin users from altering verification_status during updates
CREATE OR REPLACE FUNCTION public.protect_organizer_verification_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If the user is an organizer, retain existing verification status
    IF (OLD.verification_status IS DISTINCT FROM NEW.verification_status) THEN
        NEW.verification_status := OLD.verification_status;
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_organizer_verification_status ON public.organizer_profiles;
CREATE TRIGGER tr_protect_organizer_verification_status
    BEFORE UPDATE ON public.organizer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_organizer_verification_status();
