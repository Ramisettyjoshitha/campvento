-- =============================================================================
-- CAMPVENTO — STEP 8: Sponsorship Commitment Management Migration
-- Migration: 06_sponsorship_commitments.sql
-- Description: Creates public.sponsorship_commitments with:
--   - CHECK constraints (amount >= 0, valid statuses, date range)
--   - RLS: Sponsor SELECT-only, Organizer SELECT+INSERT+UPDATE (scoped)
--   - INSERT trigger: verifies request is ACCEPTED at the DB level
--   - UPDATE trigger: enforces immutable fields + status transitions +
--                     date range + amount validation at the DB level
--   - Indexes for dashboard queries
-- =============================================================================

-- =============================================================================
-- 1. TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.sponsorship_commitments (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Immutable relationship fields
    request_id              UUID        NOT NULL UNIQUE
                                        REFERENCES public.sponsorship_requests(id)
                                        ON DELETE RESTRICT,
    sponsor_id              UUID        NOT NULL
                                        REFERENCES auth.users(id)
                                        ON DELETE RESTRICT,
    organizer_id            UUID        NOT NULL
                                        REFERENCES auth.users(id)
                                        ON DELETE RESTRICT,
    event_id                UUID        NOT NULL
                                        REFERENCES public.events(id)
                                        ON DELETE RESTRICT,
    package_id              UUID        NOT NULL
                                        REFERENCES public.sponsorship_packages(id)
                                        ON DELETE RESTRICT,

    -- Mutable business fields
    agreed_amount           NUMERIC     NOT NULL
                                        CHECK (agreed_amount >= 0),
    commitment_start_date   DATE,
    commitment_end_date     DATE,
    notes                   TEXT,
    status                  TEXT        NOT NULL DEFAULT 'ACTIVE'
                                        CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),

    -- Audit
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_commitment_sponsor_not_organizer
        CHECK (sponsor_id != organizer_id),

    CONSTRAINT chk_commitment_date_range
        CHECK (
            commitment_start_date IS NULL
            OR commitment_end_date IS NULL
            OR commitment_start_date <= commitment_end_date
        )
);

COMMENT ON TABLE public.sponsorship_commitments IS
    'Structured commitments created by organizers from ACCEPTED sponsorship requests.';
COMMENT ON COLUMN public.sponsorship_commitments.request_id IS
    'References the ACCEPTED sponsorship_request. UNIQUE (one commitment per request). Immutable.';
COMMENT ON COLUMN public.sponsorship_commitments.agreed_amount IS
    'Negotiated sponsorship amount (>= 0). May differ from package list price.';
COMMENT ON COLUMN public.sponsorship_commitments.status IS
    'Lifecycle: ACTIVE -> COMPLETED or CANCELLED. DB trigger enforces transitions.';

-- =============================================================================
-- 2. INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_sc_sponsor_id       ON public.sponsorship_commitments(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sc_organizer_id     ON public.sponsorship_commitments(organizer_id);
CREATE INDEX IF NOT EXISTS idx_sc_event_id         ON public.sponsorship_commitments(event_id);
CREATE INDEX IF NOT EXISTS idx_sc_package_id       ON public.sponsorship_commitments(package_id);
CREATE INDEX IF NOT EXISTS idx_sc_status           ON public.sponsorship_commitments(status);
CREATE INDEX IF NOT EXISTS idx_sc_request_id       ON public.sponsorship_commitments(request_id);
CREATE INDEX IF NOT EXISTS idx_sc_organizer_status ON public.sponsorship_commitments(organizer_id, status);
CREATE INDEX IF NOT EXISTS idx_sc_sponsor_status   ON public.sponsorship_commitments(sponsor_id, status);

-- =============================================================================
-- 3. ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.sponsorship_commitments ENABLE ROW LEVEL SECURITY;

-- Sponsor: SELECT only their own commitments (NO INSERT / UPDATE / DELETE)
DROP POLICY IF EXISTS "Sponsors can view their own commitments" ON public.sponsorship_commitments;
CREATE POLICY "Sponsors can view their own commitments"
    ON public.sponsorship_commitments
    FOR SELECT
    USING (auth.uid() = sponsor_id);

-- Organizer: SELECT their own commitments
DROP POLICY IF EXISTS "Organizers can view their own commitments" ON public.sponsorship_commitments;
CREATE POLICY "Organizers can view their own commitments"
    ON public.sponsorship_commitments
    FOR SELECT
    USING (auth.uid() = organizer_id);

-- Organizer: INSERT — RLS layer verifies ownership + ACCEPTED status.
-- The INSERT trigger (fn_protect_commitment_insert) is the definitive
-- database-level check and fires even on direct PostgREST API calls.
DROP POLICY IF EXISTS "Organizers can create commitments for accepted requests" ON public.sponsorship_commitments;
CREATE POLICY "Organizers can create commitments for accepted requests"
    ON public.sponsorship_commitments
    FOR INSERT
    WITH CHECK (
        auth.uid() = organizer_id
        AND sponsor_id != organizer_id
        AND agreed_amount >= 0
        AND (
            commitment_start_date IS NULL
            OR commitment_end_date IS NULL
            OR commitment_start_date <= commitment_end_date
        )
        AND EXISTS (
            SELECT 1
            FROM public.sponsorship_requests sr
            JOIN public.sponsorship_packages sp ON sp.id = sr.package_id
            JOIN public.events e ON e.id = sr.event_id
            WHERE sr.id           = sponsorship_commitments.request_id
              AND sr.status       = 'ACCEPTED'
              AND sr.sponsor_id   = sponsorship_commitments.sponsor_id
              AND sr.organizer_id = auth.uid()
              AND sr.event_id     = sponsorship_commitments.event_id
              AND sr.package_id   = sponsorship_commitments.package_id
              AND e.organizer_id  = auth.uid()
              AND sp.event_id     = e.id
        )
    );

-- Organizer: UPDATE — only their own commitments.
-- The UPDATE trigger (fn_protect_commitment_update) enforces:
--   - immutable field protection
--   - status transition rules
--   - date range validation
--   - agreed_amount >= 0
-- at the PostgreSQL level regardless of how the request is made.
DROP POLICY IF EXISTS "Organizers can update their own commitments" ON public.sponsorship_commitments;
CREATE POLICY "Organizers can update their own commitments"
    ON public.sponsorship_commitments
    FOR UPDATE
    USING (auth.uid() = organizer_id)
    WITH CHECK (
        auth.uid() = organizer_id
        AND agreed_amount >= 0
        AND status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')
        AND (
            commitment_start_date IS NULL
            OR commitment_end_date IS NULL
            OR commitment_start_date <= commitment_end_date
        )
    );

-- No DELETE policies for either role.

-- =============================================================================
-- 4. TRIGGER: INSERT VALIDATION (database-level defense in depth)
--    Fires BEFORE INSERT. Verifies the referenced request is ACCEPTED and
--    that all relationship IDs are consistent with that request record.
--    Cannot be bypassed via direct PostgREST / Supabase API calls.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.fn_protect_commitment_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_req public.sponsorship_requests%ROWTYPE;
BEGIN
    -- Fetch the referenced request
    SELECT * INTO v_req
    FROM public.sponsorship_requests
    WHERE id = NEW.request_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sponsorship request % does not exist.', NEW.request_id;
    END IF;

    -- Request must be ACCEPTED
    IF v_req.status != 'ACCEPTED' THEN
        RAISE EXCEPTION
            'A commitment can only be created from an ACCEPTED request. '
            'Request % has status: %.',
            NEW.request_id, v_req.status;
    END IF;

    -- All relationship IDs must match the request record exactly
    IF v_req.sponsor_id != NEW.sponsor_id THEN
        RAISE EXCEPTION 'sponsor_id does not match the referenced request.';
    END IF;

    IF v_req.organizer_id != NEW.organizer_id THEN
        RAISE EXCEPTION 'organizer_id does not match the referenced request.';
    END IF;

    IF v_req.event_id != NEW.event_id THEN
        RAISE EXCEPTION 'event_id does not match the referenced request.';
    END IF;

    IF v_req.package_id != NEW.package_id THEN
        RAISE EXCEPTION 'package_id does not match the referenced request.';
    END IF;

    -- Business rule validations
    IF NEW.agreed_amount < 0 THEN
        RAISE EXCEPTION 'agreed_amount must be >= 0, received: %', NEW.agreed_amount;
    END IF;

    IF NEW.commitment_start_date IS NOT NULL
       AND NEW.commitment_end_date IS NOT NULL
       AND NEW.commitment_start_date > NEW.commitment_end_date
    THEN
        RAISE EXCEPTION
            'commitment_start_date (%) must be <= commitment_end_date (%).',
            NEW.commitment_start_date, NEW.commitment_end_date;
    END IF;

    -- New commitments must begin in ACTIVE state
    IF NEW.status != 'ACTIVE' THEN
        RAISE EXCEPTION
            'New commitments must be created with status ACTIVE. Received: %', NEW.status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_commitment_insert ON public.sponsorship_commitments;
CREATE TRIGGER tr_protect_commitment_insert
    BEFORE INSERT ON public.sponsorship_commitments
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_protect_commitment_insert();

-- =============================================================================
-- 5. TRIGGER: UPDATE VALIDATION (database-level security)
--    Fires BEFORE UPDATE. Enforces:
--      a) Immutable fields: request_id, sponsor_id, organizer_id,
--                           event_id, package_id, created_at
--      b) Status transitions: ACTIVE -> COMPLETED | CANCELLED only;
--                             COMPLETED and CANCELLED are terminal states
--      c) Business validations: agreed_amount >= 0, date range
--      d) Auto-sets updated_at = now()
--
--    This trigger fires regardless of whether the UPDATE comes from the
--    frontend service layer, direct Supabase PostgREST API, or psql.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.fn_protect_commitment_update()
RETURNS TRIGGER AS $$
BEGIN
    -- -------------------------------------------------------------------------
    -- a) IMMUTABLE FIELD PROTECTION
    --    These fields cannot change after creation under any circumstances.
    -- -------------------------------------------------------------------------
    IF OLD.request_id IS DISTINCT FROM NEW.request_id THEN
        RAISE EXCEPTION 'request_id is immutable after creation.';
    END IF;

    IF OLD.sponsor_id IS DISTINCT FROM NEW.sponsor_id THEN
        RAISE EXCEPTION 'sponsor_id is immutable after creation.';
    END IF;

    IF OLD.organizer_id IS DISTINCT FROM NEW.organizer_id THEN
        RAISE EXCEPTION 'organizer_id is immutable after creation.';
    END IF;

    IF OLD.event_id IS DISTINCT FROM NEW.event_id THEN
        RAISE EXCEPTION 'event_id is immutable after creation.';
    END IF;

    IF OLD.package_id IS DISTINCT FROM NEW.package_id THEN
        RAISE EXCEPTION 'package_id is immutable after creation.';
    END IF;

    IF OLD.created_at IS DISTINCT FROM NEW.created_at THEN
        RAISE EXCEPTION 'created_at is immutable after creation.';
    END IF;

    -- -------------------------------------------------------------------------
    -- b) STATUS TRANSITION ENFORCEMENT
    --    Only ACTIVE commitments may change status.
    --    Valid targets: COMPLETED or CANCELLED only.
    --    COMPLETED and CANCELLED are terminal — no further transitions.
    -- -------------------------------------------------------------------------
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        IF OLD.status != 'ACTIVE' THEN
            RAISE EXCEPTION
                'Status transition not allowed. Commitment is in terminal state: %. '
                'Only ACTIVE commitments can change status.',
                OLD.status;
        END IF;

        IF NEW.status NOT IN ('COMPLETED', 'CANCELLED') THEN
            RAISE EXCEPTION
                'Invalid status transition: ACTIVE -> %. '
                'Only ACTIVE -> COMPLETED or ACTIVE -> CANCELLED is allowed.',
                NEW.status;
        END IF;
    END IF;

    -- -------------------------------------------------------------------------
    -- c) BUSINESS VALIDATIONS
    -- -------------------------------------------------------------------------
    IF NEW.agreed_amount < 0 THEN
        RAISE EXCEPTION 'agreed_amount must be >= 0. Received: %', NEW.agreed_amount;
    END IF;

    IF NEW.commitment_start_date IS NOT NULL
       AND NEW.commitment_end_date IS NOT NULL
       AND NEW.commitment_start_date > NEW.commitment_end_date
    THEN
        RAISE EXCEPTION
            'commitment_start_date (%) must be <= commitment_end_date (%).',
            NEW.commitment_start_date, NEW.commitment_end_date;
    END IF;

    -- -------------------------------------------------------------------------
    -- d) AUTO-MAINTAIN updated_at
    -- -------------------------------------------------------------------------
    NEW.updated_at := now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_commitment_update ON public.sponsorship_commitments;
CREATE TRIGGER tr_protect_commitment_update
    BEFORE UPDATE ON public.sponsorship_commitments
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_protect_commitment_update();
