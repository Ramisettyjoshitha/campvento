-- =============================================================================
-- CAMPVENTO — STEP 5: Sponsor Profile & Sponsor Discovery Foundation
-- Migration: 04_sponsor_profiles.sql
-- Description: Creates public.sponsor_profiles with security constraints,
--              RLS policies, updated_at trigger, verification_status protection,
--              and additional non-invasive discovery SELECT policies.
-- =============================================================================

-- =============================================================================
-- 1. TABLE: public.sponsor_profiles
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.sponsor_profiles (
    id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name           TEXT        NOT NULL,
    contact_person         TEXT        NOT NULL,
    industry               TEXT,
    company_description    TEXT,
    website                TEXT,
    contact_email          TEXT,
    contact_phone          TEXT,
    company_size           TEXT,
    sponsorship_budget_min NUMERIC     DEFAULT 0 CHECK (sponsorship_budget_min >= 0),
    sponsorship_budget_max NUMERIC     DEFAULT 0,
    preferred_categories   TEXT,
    preferred_audience     TEXT,
    preferred_locations    TEXT,
    verification_status    TEXT        NOT NULL DEFAULT 'PENDING'
                                       CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_sponsor_budget_range CHECK (sponsorship_budget_max >= sponsorship_budget_min)
);

COMMENT ON TABLE public.sponsor_profiles IS
    'Sponsor company profiles, preferences, and verified status in Campvento.';
COMMENT ON COLUMN public.sponsor_profiles.user_id IS
    'Tied directly to auth.users(id). Never trusted from arbitrary client input.';
COMMENT ON COLUMN public.sponsor_profiles.verification_status IS
    'Managed exclusively by administrators. Self-elevation is prevented via trigger.';

-- =============================================================================
-- 2. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_user_id ON public.sponsor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_profiles_verification_status ON public.sponsor_profiles(verification_status);

-- =============================================================================
-- 3. ROW LEVEL SECURITY ON SPONSOR PROFILES
-- =============================================================================

ALTER TABLE public.sponsor_profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: A sponsor can view ONLY their own profile
DROP POLICY IF EXISTS "Sponsors can view their own profile" ON public.sponsor_profiles;
CREATE POLICY "Sponsors can view their own profile"
    ON public.sponsor_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT: A sponsor can insert ONLY their own profile with PENDING status
DROP POLICY IF EXISTS "Sponsors can insert their own profile" ON public.sponsor_profiles;
CREATE POLICY "Sponsors can insert their own profile"
    ON public.sponsor_profiles
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND verification_status = 'PENDING'
    );

-- UPDATE: A sponsor can update ONLY their own profile
DROP POLICY IF EXISTS "Sponsors can update their own profile" ON public.sponsor_profiles;
CREATE POLICY "Sponsors can update their own profile"
    ON public.sponsor_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 4. TRIGGERS: VERIFICATION STATUS PROTECTION & UPDATED_AT
-- =============================================================================

CREATE OR REPLACE FUNCTION public.protect_sponsor_verification_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Retain existing verification status if attempted to change by client
    IF (OLD.verification_status IS DISTINCT FROM NEW.verification_status) THEN
        NEW.verification_status := OLD.verification_status;
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_sponsor_verification_status ON public.sponsor_profiles;
CREATE TRIGGER tr_protect_sponsor_verification_status
    BEFORE UPDATE ON public.sponsor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_sponsor_verification_status();

-- =============================================================================
-- 5. SPONSOR DISCOVERY ACCESS (NON-INVASIVE SELECT POLICIES)
-- =============================================================================
-- Note: Does NOT modify, replace, or delete existing organizer ownership policies.
-- Adds narrowly-scoped SELECT permissions for authenticated users to view
-- PUBLISHED events and ACTIVE sponsorship packages belonging to PUBLISHED events.

-- Additional SELECT policy on public.events for discovery
DROP POLICY IF EXISTS "Discovery: Authenticated users can view published events" ON public.events;
CREATE POLICY "Discovery: Authenticated users can view published events"
    ON public.events
    FOR SELECT
    TO authenticated
    USING (status = 'PUBLISHED');

-- Additional SELECT policy on public.sponsorship_packages for discovery
DROP POLICY IF EXISTS "Discovery: Authenticated users can view active packages for published events" ON public.sponsorship_packages;
CREATE POLICY "Discovery: Authenticated users can view active packages for published events"
    ON public.sponsorship_packages
    FOR SELECT
    TO authenticated
    USING (
        status = 'ACTIVE'
        AND EXISTS (
            SELECT 1
            FROM public.events e
            WHERE e.id = event_id
              AND e.status = 'PUBLISHED'
        )
    );
