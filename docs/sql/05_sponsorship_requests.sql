-- =============================================================================
-- CAMPVENTO — STEP 7: Sponsorship Interest & Request Flow Migration
-- Migration: 05_sponsorship_requests.sql
-- Description: Creates public.sponsorship_requests table, indexes, duplicate
--              pending protection, RLS policies, and state transition trigger.
-- =============================================================================

-- =============================================================================
-- 1. TABLE: public.sponsorship_requests
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.sponsorship_requests (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organizer_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id     UUID        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    package_id   UUID        NOT NULL REFERENCES public.sponsorship_packages(id) ON DELETE CASCADE,
    message      TEXT,
    status       TEXT        NOT NULL DEFAULT 'PENDING'
                             CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_sponsor_not_organizer CHECK (sponsor_id != organizer_id)
);

COMMENT ON TABLE public.sponsorship_requests IS
    'Sponsorship interest expressions submitted by verified/pending sponsors for campus event packages.';
COMMENT ON COLUMN public.sponsorship_requests.sponsor_id IS
    'Authenticated sponsor user ID (auth.uid()). Protected from client tampering.';
COMMENT ON COLUMN public.sponsorship_requests.organizer_id IS
    'Event organizer user ID. Derived from parent event ownership.';
COMMENT ON COLUMN public.sponsorship_requests.status IS
    'Request lifecycle status: PENDING -> ACCEPTED, REJECTED, or CANCELLED.';

-- =============================================================================
-- 2. INDEXES & DUPLICATE PENDING PREVENTION
-- =============================================================================

-- Partial unique index: A sponsor can have at most ONE pending request per package at a time.
-- Once a request is REJECTED or CANCELLED, a new request is permitted.
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_sponsor_package
    ON public.sponsorship_requests(sponsor_id, package_id)
    WHERE status = 'PENDING';

-- General lookup indexes
CREATE INDEX IF NOT EXISTS idx_sr_sponsor_id        ON public.sponsorship_requests(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sr_organizer_id      ON public.sponsorship_requests(organizer_id);
CREATE INDEX IF NOT EXISTS idx_sr_event_id          ON public.sponsorship_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_sr_package_id        ON public.sponsorship_requests(package_id);
CREATE INDEX IF NOT EXISTS idx_sr_status            ON public.sponsorship_requests(status);
CREATE INDEX IF NOT EXISTS idx_sr_organizer_status  ON public.sponsorship_requests(organizer_id, status);
CREATE INDEX IF NOT EXISTS idx_sr_sponsor_status    ON public.sponsorship_requests(sponsor_id, status);

-- =============================================================================
-- 3. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.sponsorship_requests ENABLE ROW LEVEL SECURITY;

-- SELECT Policies:
-- Sponsors can view only their own requests
DROP POLICY IF EXISTS "Sponsors can view their own requests" ON public.sponsorship_requests;
CREATE POLICY "Sponsors can view their own requests"
    ON public.sponsorship_requests
    FOR SELECT
    USING (auth.uid() = sponsor_id);

-- Organizers can view requests for their events
DROP POLICY IF EXISTS "Organizers can view requests for their events" ON public.sponsorship_requests;
CREATE POLICY "Organizers can view requests for their events"
    ON public.sponsorship_requests
    FOR SELECT
    USING (auth.uid() = organizer_id);

-- INSERT Policy:
-- Sponsors can create requests with PENDING status for active packages of published events owned by other users
DROP POLICY IF EXISTS "Sponsors can insert their own requests" ON public.sponsorship_requests;
CREATE POLICY "Sponsors can insert their own requests"
    ON public.sponsorship_requests
    FOR INSERT
    WITH CHECK (
        auth.uid() = sponsor_id
        AND status = 'PENDING'
        AND sponsor_id != organizer_id
        AND EXISTS (
            SELECT 1
            FROM public.sponsorship_packages sp
            JOIN public.events e ON e.id = sp.event_id
            WHERE sp.id = package_id
              AND sp.event_id = sponsorship_requests.event_id
              AND e.organizer_id = sponsorship_requests.organizer_id
              AND sp.status = 'ACTIVE'
              AND e.status = 'PUBLISHED'
        )
    );

-- UPDATE Policies:
-- Sponsors can only cancel their own PENDING requests (PENDING -> CANCELLED)
DROP POLICY IF EXISTS "Sponsors can cancel their own pending requests" ON public.sponsorship_requests;
CREATE POLICY "Sponsors can cancel their own pending requests"
    ON public.sponsorship_requests
    FOR UPDATE
    USING (
        auth.uid() = sponsor_id
        AND status = 'PENDING'
    )
    WITH CHECK (
        auth.uid() = sponsor_id
        AND status = 'CANCELLED'
    );

-- Organizers can accept or reject PENDING requests for their own events (PENDING -> ACCEPTED / REJECTED)
DROP POLICY IF EXISTS "Organizers can accept or reject requests for their events" ON public.sponsorship_requests;
CREATE POLICY "Organizers can accept or reject requests for their events"
    ON public.sponsorship_requests
    FOR UPDATE
    USING (
        auth.uid() = organizer_id
        AND status = 'PENDING'
    )
    WITH CHECK (
        auth.uid() = organizer_id
        AND status IN ('ACCEPTED', 'REJECTED')
    );

-- =============================================================================
-- 4. TRIGGERS: INTEGRITY & STATUS TRANSITION ENFORCEMENT
-- =============================================================================

CREATE OR REPLACE FUNCTION public.fn_protect_sponsorship_request_integrity()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent modification of immutable fields
    IF (OLD.sponsor_id IS DISTINCT FROM NEW.sponsor_id) THEN
        RAISE EXCEPTION 'sponsor_id is immutable';
    END IF;
    IF (OLD.organizer_id IS DISTINCT FROM NEW.organizer_id) THEN
        RAISE EXCEPTION 'organizer_id is immutable';
    END IF;
    IF (OLD.event_id IS DISTINCT FROM NEW.event_id) THEN
        RAISE EXCEPTION 'event_id is immutable';
    END IF;
    IF (OLD.package_id IS DISTINCT FROM NEW.package_id) THEN
        RAISE EXCEPTION 'package_id is immutable';
    END IF;
    IF (OLD.created_at IS DISTINCT FROM NEW.created_at) THEN
        RAISE EXCEPTION 'created_at is immutable';
    END IF;

    -- Enforce allowed status transitions:
    -- Only PENDING requests may transition to ACCEPTED, REJECTED, or CANCELLED
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        IF OLD.status != 'PENDING' THEN
            RAISE EXCEPTION 'Cannot modify status of a request in % state', OLD.status;
        END IF;
        IF NEW.status NOT IN ('ACCEPTED', 'REJECTED', 'CANCELLED') THEN
            RAISE EXCEPTION 'Invalid target status %', NEW.status;
        END IF;
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_sponsorship_request_integrity ON public.sponsorship_requests;
CREATE TRIGGER tr_protect_sponsorship_request_integrity
    BEFORE UPDATE ON public.sponsorship_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_protect_sponsorship_request_integrity();
