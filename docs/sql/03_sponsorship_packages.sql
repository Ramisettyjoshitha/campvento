-- =============================================================================
-- CAMPVENTO — STEP 4.3: Sponsorship Packages
-- Migration: 03_sponsorship_packages.sql
-- Description: Creates the public.sponsorship_packages table with
--              constraints, indexes, RLS policies, and updated_at trigger.
-- =============================================================================

-- =============================================================================
-- TABLE: public.sponsorship_packages
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.sponsorship_packages (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id         UUID        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    organizer_id     UUID        NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
    package_name     TEXT        NOT NULL,
    description      TEXT,
    price            NUMERIC     NOT NULL DEFAULT 0 CHECK (price >= 0),
    benefits         TEXT,
    available_slots  INTEGER     NOT NULL DEFAULT 1 CHECK (available_slots >= 0),
    status           TEXT        NOT NULL DEFAULT 'ACTIVE'
                                 CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.sponsorship_packages IS
    'Sponsorship packages created by organizers for their campus events.';
COMMENT ON COLUMN public.sponsorship_packages.organizer_id IS
    'Must always equal the auth.uid() of the authenticated organizer. Never trusted from client payload.';
COMMENT ON COLUMN public.sponsorship_packages.event_id IS
    'The parent event; must be owned by the same organizer.';

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_sp_organizer_id ON public.sponsorship_packages(organizer_id);
CREATE INDEX IF NOT EXISTS idx_sp_event_id     ON public.sponsorship_packages(event_id);
CREATE INDEX IF NOT EXISTS idx_sp_status       ON public.sponsorship_packages(status);

-- Composite: fast lookup of packages for a given event belonging to an organizer
CREATE INDEX IF NOT EXISTS idx_sp_event_organizer
    ON public.sponsorship_packages(event_id, organizer_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.sponsorship_packages ENABLE ROW LEVEL SECURITY;

-- SELECT: organizers see only their own packages
CREATE POLICY "Organizers can select their own packages"
    ON public.sponsorship_packages
    FOR SELECT
    USING (auth.uid() = organizer_id);

-- INSERT: organizers can only insert packages for events they own
--   The WITH CHECK ensures both:
--   a) organizer_id column equals the authenticated user
--   b) the referenced event_id also belongs to the authenticated user
CREATE POLICY "Organizers can insert packages for their own events"
    ON public.sponsorship_packages
    FOR INSERT
    WITH CHECK (
        auth.uid() = organizer_id
        AND EXISTS (
            SELECT 1
            FROM public.events e
            WHERE e.id = event_id
              AND e.organizer_id = auth.uid()
        )
    );

-- UPDATE: organizers can only update their own packages
CREATE POLICY "Organizers can update their own packages"
    ON public.sponsorship_packages
    FOR UPDATE
    USING (auth.uid() = organizer_id)
    WITH CHECK (auth.uid() = organizer_id);

-- DELETE: organizers can only delete their own packages
CREATE POLICY "Organizers can delete their own packages"
    ON public.sponsorship_packages
    FOR DELETE
    USING (auth.uid() = organizer_id);

-- =============================================================================
-- TRIGGER: auto-update updated_at on row modification
-- =============================================================================

CREATE OR REPLACE FUNCTION public.fn_update_sponsorship_packages_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER tr_update_sponsorship_packages_updated_at
    BEFORE UPDATE ON public.sponsorship_packages
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_update_sponsorship_packages_updated_at();
