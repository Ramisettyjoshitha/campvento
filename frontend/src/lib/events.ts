import { supabase } from './supabase';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';

export const EVENT_CATEGORIES = [
  'Hackathon',
  'Technical Fest',
  'Cultural Fest',
  'Sports Tournament',
  'Workshop & Bootcamp',
  'Conference & Summit',
  'Networking Meetup',
  'Gaming & Esports',
  'Other',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number] | string;

export interface EventItem {
  id: string;
  organizer_id: string;
  event_name: string;
  description: string | null;
  category: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  expected_attendees: number | null;
  target_audience: string | null;
  event_budget: number | null;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateEventInput {
  event_name: string;
  description?: string;
  category: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  expected_attendees?: number | null;
  target_audience?: string;
  event_budget?: number | null;
  status?: EventStatus;
}

export interface UpdateEventInput {
  event_name?: string;
  description?: string;
  category?: string;
  event_date?: string;
  start_time?: string;
  end_time?: string;
  venue?: string;
  expected_attendees?: number | null;
  target_audience?: string;
  event_budget?: number | null;
  status?: EventStatus;
}

/**
 * Retrieves all events owned by the authenticated organizer.
 */
export const getMyEvents = async (): Promise<{
  data: EventItem[] | null;
  error: string | null;
}> => {
  try {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError || !sessionData?.session?.user) {
      return { data: null, error: 'User is not authenticated.' };
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: (data as EventItem[]) || [], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch events.',
    };
  }
};

/**
 * Retrieves a single event by its ID.
 */
export const getEventById = async (
  id: string
): Promise<{
  data: EventItem | null;
  error: string | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as EventItem, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch event.',
    };
  }
};

/**
 * Creates a new event for the authenticated organizer.
 * Organizer ID is taken directly from the authenticated session.
 */
export const createEvent = async (
  input: CreateEventInput
): Promise<{
  data: EventItem | null;
  error: string | null;
}> => {
  try {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError || !sessionData?.session?.user) {
      return { data: null, error: 'User is not authenticated.' };
    }

    const organizerId = sessionData.session.user.id;

    const payload = {
      organizer_id: organizerId,
      event_name: input.event_name.trim(),
      description: input.description?.trim() || null,
      category: input.category.trim(),
      event_date: input.event_date,
      start_time: input.start_time || null,
      end_time: input.end_time || null,
      venue: input.venue?.trim() || null,
      expected_attendees:
        input.expected_attendees !== undefined &&
        input.expected_attendees !== null &&
        input.expected_attendees >= 0
          ? Number(input.expected_attendees)
          : null,
      target_audience: input.target_audience?.trim() || null,
      event_budget:
        input.event_budget !== undefined &&
        input.event_budget !== null &&
        input.event_budget >= 0
          ? Number(input.event_budget)
          : null,
      status: input.status || 'DRAFT',
    };

    const { data, error } = await supabase
      .from('events')
      .insert([payload])
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as EventItem, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to create event.',
    };
  }
};

/**
 * Updates an existing event owned by the authenticated organizer.
 */
export const updateEvent = async (
  id: string,
  input: UpdateEventInput
): Promise<{
  data: EventItem | null;
  error: string | null;
}> => {
  try {
    const updatePayload: Record<string, unknown> = {};

    if (input.event_name !== undefined)
      updatePayload.event_name = input.event_name.trim();
    if (input.description !== undefined)
      updatePayload.description = input.description?.trim() || null;
    if (input.category !== undefined)
      updatePayload.category = input.category.trim();
    if (input.event_date !== undefined)
      updatePayload.event_date = input.event_date;
    if (input.start_time !== undefined)
      updatePayload.start_time = input.start_time || null;
    if (input.end_time !== undefined)
      updatePayload.end_time = input.end_time || null;
    if (input.venue !== undefined)
      updatePayload.venue = input.venue?.trim() || null;
    if (input.expected_attendees !== undefined) {
      updatePayload.expected_attendees =
        input.expected_attendees !== null && input.expected_attendees >= 0
          ? Number(input.expected_attendees)
          : null;
    }
    if (input.target_audience !== undefined)
      updatePayload.target_audience = input.target_audience?.trim() || null;
    if (input.event_budget !== undefined) {
      updatePayload.event_budget =
        input.event_budget !== null && input.event_budget >= 0
          ? Number(input.event_budget)
          : null;
    }
    if (input.status !== undefined) updatePayload.status = input.status;

    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('events')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as EventItem, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to update event.',
    };
  }
};

/**
 * Deletes an event owned by the authenticated organizer.
 */
export const deleteEvent = async (
  id: string
): Promise<{
  success: boolean;
  error: string | null;
}> => {
  try {
    const { error } = await supabase.from('events').delete().eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete event.',
    };
  }
};
