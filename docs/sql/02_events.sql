-- ==============================================================================
-- CAMPVENTO - STEP 4.2: Event Creation & Organizer Event Management Migration
-- ==============================================================================

-- 1. Create table: public.events
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    venue TEXT,
    expected_attendees INTEGER CHECK (expected_attendees >= 0),
    target_audience TEXT,
    event_budget NUMERIC CHECK (event_budget >= 0),
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 4. Policy: SELECT (Organizers can view only their own events)
DROP POLICY IF EXISTS "Organizers can view only their own events" ON public.events;
CREATE POLICY "Organizers can view only their own events"
    ON public.events
    FOR SELECT
    USING (auth.uid() = organizer_id);

-- 5. Policy: INSERT (Organizers can insert only their own events)
DROP POLICY IF EXISTS "Organizers can insert only their own events" ON public.events;
CREATE POLICY "Organizers can insert only their own events"
    ON public.events
    FOR INSERT
    WITH CHECK (auth.uid() = organizer_id);

-- 6. Policy: UPDATE (Organizers can update only their own events)
DROP POLICY IF EXISTS "Organizers can update only their own events" ON public.events;
CREATE POLICY "Organizers can update only their own events"
    ON public.events
    FOR UPDATE
    USING (auth.uid() = organizer_id)
    WITH CHECK (auth.uid() = organizer_id);

-- 7. Policy: DELETE (Organizers can delete only their own events)
DROP POLICY IF EXISTS "Organizers can delete only their own events" ON public.events;
CREATE POLICY "Organizers can delete only their own events"
    ON public.events
    FOR DELETE
    USING (auth.uid() = organizer_id);

-- 8. Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_events_updated_at ON public.events;
CREATE TRIGGER tr_update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_events_updated_at();
