import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventById } from '../lib/events';
import type { EventItem } from '../lib/events';
import { getPackagesForEvent } from '../lib/sponsorshipPackages';
import type { SponsorshipPackage } from '../lib/sponsorshipPackages';
import {
  Sparkles,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Tag,
  ShieldCheck,
  Package,
  Layers,
  CheckCircle2,
  Lock,
  Loader2,
} from 'lucide-react';

export const EventSponsorMatchesPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [packages, setPackages] = useState<SponsorshipPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) return;
      setLoading(true);
      setError(null);

      const { data: eventData, error: eventError } = await getEventById(eventId);
      if (eventError || !eventData) {
        setError(eventError || 'Event not found.');
        setLoading(false);
        return;
      }

      setEvent(eventData);

      // Load event packages
      const { data: pkgData } = await getPackagesForEvent(eventId);
      if (pkgData) {
        setPackages(pkgData);
      }
      setLoading(false);
    };

    loadEventData();
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-slate-300">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">Evaluating event intelligence...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-2">Event Not Found</h2>
          <p className="text-xs text-slate-400 mb-6">{error || 'Unable to locate event record.'}</p>
          <Link
            to="/organizer/events"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
          >
            Back to My Events
          </Link>
        </div>
      </div>
    );
  }

  const activePackages = packages.filter((p) => p.status === 'ACTIVE');

  return (
    <div className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full space-y-8">
      {/* Back Link */}
      <Link
        to="/organizer/events"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to My Events</span>
      </Link>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/40 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                EVENT SPONSOR MATCHING
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                {event.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {event.event_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Sponsor compatibility parameters and campus discoverability metrics.
            </p>
          </div>

          <Link
            to={`/organizer/events/${event.id}/packages`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Package className="w-4 h-4" />
            <span>Manage Packages ({packages.length})</span>
          </Link>
        </div>
      </div>

      {/* Event Details Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Active Event Parameters</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block mb-1">Event Category</span>
            <span className="text-white font-bold flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              {event.category}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block mb-1">Event Date</span>
            <span className="text-slate-200 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {event.event_date}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block mb-1">Expected Reach</span>
            <span className="text-slate-200 font-semibold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {event.expected_attendees ? `${event.expected_attendees.toLocaleString()} students` : 'TBD'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block mb-1">Venue / Campus</span>
            <span className="text-slate-200 font-semibold flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {event.venue || 'Campus Venue TBD'}
            </span>
          </div>
        </div>

        {event.target_audience && (
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-xs">
            <span className="text-slate-500 block mb-1 font-semibold">Target Audience Profile:</span>
            <span className="text-slate-300">{event.target_audience}</span>
          </div>
        )}
      </div>

      {/* Sponsor Compatibility Readiness & Privacy Card */}
      <div className="bg-gradient-to-b from-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sponsor Discovery & Matching Intelligence</span>
          </h3>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {event.status === 'PUBLISHED' ? 'Active in Discovery Hub' : 'Draft Mode (Hidden)'}
          </span>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2.5 text-xs font-bold text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Multi-Factor Matching Criteria Configured</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              When published, this event is actively evaluated by the CAMPVENTO Explainable Matching Engine for sponsors searching in the <strong className="text-slate-200">{event.category}</strong> domain with alignment in budget, geographic scope, and reach.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-300">
              <Lock className="w-4 h-4 text-blue-400" />
              <span>Privacy & Consented Inbound Matching</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              In accordance with platform security and privacy boundaries, sponsor profile contact information remains strictly protected under Row Level Security. Sponsors receive deterministic compatibility recommendations for your event in their <strong className="text-blue-400">AI Matches Hub</strong>.
            </p>
          </div>
        </div>

        {/* Active Sponsorship Packages Summary */}
        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-400" />
            <span>Active Sponsorship Tiers ({activePackages.length})</span>
          </h4>

          {activePackages.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-400 text-center">
              No active sponsorship packages found for this event.{' '}
              <Link
                to={`/organizer/events/${event.id}/packages/new`}
                className="text-emerald-400 hover:text-emerald-300 font-semibold ml-1"
              >
                Create a package tier
              </Link>{' '}
              to enable full compatibility scoring.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {activePackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-white text-xs">{pkg.package_name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {pkg.available_slots} slots
                      </span>
                    </div>
                    <div className="text-base font-extrabold text-emerald-400 mb-2">
                      ${pkg.price.toLocaleString()}
                    </div>
                    {pkg.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-2">{pkg.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventSponsorMatchesPage;
