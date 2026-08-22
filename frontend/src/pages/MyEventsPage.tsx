import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyEvents, deleteEvent } from '../lib/events';
import type { EventItem, EventStatus } from '../lib/events';
import {
  CalendarPlus,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Tag,
  Edit3,
  Trash2,
  Clock,
  CheckCircle2,
  Package,
  AlertCircle,
  Loader2,
  Layers,
  Sparkles,
} from 'lucide-react';

export const MyEventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getMyEvents();
    if (fetchError) {
      setError(fetchError);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    const { success, error: deleteErr } = await deleteEvent(id);
    if (!success || deleteErr) {
      setError(deleteErr || 'Failed to delete event.');
    } else {
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setDeleteTargetId(null);
    }
    setDeleting(false);
  };

  const filteredEvents = events.filter((e) => {
    if (filterStatus === 'ALL') return true;
    return e.status === filterStatus;
  });

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            PUBLISHED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <CheckCircle2 className="w-3 h-3" />
            COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            CANCELLED
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            DRAFT
          </span>
        );
    }
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              CAMPUS EVENTS
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Campus Events</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your campus opportunities, dates, expected reach, and sponsorship readiness.
          </p>
        </div>

        <Link
          to="/organizer/events/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02]"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>Create Event</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {[
            { label: 'All Events', value: 'ALL', count: events.length },
            {
              label: 'Drafts',
              value: 'DRAFT',
              count: events.filter((e) => e.status === 'DRAFT').length,
            },
            {
              label: 'Published',
              value: 'PUBLISHED',
              count: events.filter((e) => e.status === 'PUBLISHED').length,
            },
            {
              label: 'Completed',
              value: 'COMPLETED',
              count: events.filter((e) => e.status === 'COMPLETED').length,
            },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === tab.value
                  ? 'bg-slate-800 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label} <span className="text-[11px] opacity-70 ml-1">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Showing {filteredEvents.length} of {events.length} events
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-300">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-400">Loading your events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-6 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            {filterStatus === 'ALL'
              ? 'No events yet. Create your first campus event.'
              : `No events in ${filterStatus} status.`}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            Add hackathons, technical fests, or cultural events to kickstart sponsorship discovery.
          </p>
          <Link
            to="/organizer/events/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 transition-all"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Create Event Now</span>
          </Link>
        </div>
      ) : (
        /* Event Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-xl group"
            >
              <div>
                {/* Top Row: Category & Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/50">
                    <Tag className="w-3 h-3 text-emerald-400" />
                    {event.category}
                  </span>
                  {getStatusBadge(event.status)}
                </div>

                {/* Event Title */}
                <h3 className="text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-emerald-300 transition-colors">
                  {event.event_name}
                </h3>

                {/* Description Snippet */}
                {event.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                    {event.description}
                  </p>
                )}

                {/* Meta details */}
                <div className="space-y-2 text-xs text-slate-300 my-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{event.event_date}</span>
                    {event.start_time && (
                      <span className="text-slate-500 text-[11px]">({event.start_time.slice(0, 5)})</span>
                    )}
                  </div>

                  {event.venue && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{event.expected_attendees ?? '—'} attendees</span>
                    </div>

                    {event.event_budget !== null && (
                      <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{event.event_budget.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    to={`/organizer/events/${event.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors border border-slate-700/50"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Event</span>
                  </Link>

                  <button
                    onClick={() => setDeleteTargetId(event.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Sponsorship Packages Button */}
                <Link
                  to={`/organizer/events/${event.id}/packages`}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600/15 hover:bg-violet-600/30 text-violet-300 hover:text-violet-200 transition-colors border border-violet-600/30"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Manage Sponsorship Packages</span>
                </Link>

                {/* Match Status Intelligence Button */}
                <Link
                  to={`/organizer/events/${event.id}/matches`}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 hover:text-indigo-200 transition-colors border border-indigo-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>View Sponsor Compatibility</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Delete this event?</h4>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to permanently delete this event? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                disabled={deleting}
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={() => handleDelete(deleteTargetId)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/25 transition-all disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEventsPage;
