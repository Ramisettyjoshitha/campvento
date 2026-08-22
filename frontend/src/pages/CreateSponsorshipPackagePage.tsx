import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getMyEvents } from '../lib/events';
import type { EventItem } from '../lib/events';
import { createSponsorshipPackage } from '../lib/sponsorshipPackages';
import type { SponsorshipPackageStatus } from '../lib/sponsorshipPackages';
import {
  Package,
  Calendar,
  Tag,
  DollarSign,
  Users,
  FileText,
  Star,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';

export const CreateSponsorshipPackagePage: React.FC = () => {
  const { eventId: routeEventId } = useParams<{ eventId?: string }>();
  const navigate = useNavigate();

  // Form state
  const [selectedEventId, setSelectedEventId] = useState<string>(routeEventId ?? '');
  const [packageName, setPackageName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('0');
  const [benefits, setBenefits] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string>('1');
  const [status, setStatus] = useState<SponsorshipPackageStatus>('ACTIVE');

  // Loading / UI state
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load organizer's events for the Event selector
  useEffect(() => {
    const load = async () => {
      setLoadingEvents(true);
      const { data } = await getMyEvents();
      setEvents(data ?? []);
      setLoadingEvents(false);
    };
    load();
  }, []);

  // Pre-select event if coming from a specific event's packages page
  useEffect(() => {
    if (routeEventId) {
      setSelectedEventId(routeEventId);
    }
  }, [routeEventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Client-side validation
    if (!selectedEventId) {
      setError('Please select an event for this sponsorship package.');
      return;
    }
    if (!packageName.trim()) {
      setError('Package name is required.');
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Price must be zero or a positive number.');
      return;
    }
    const parsedSlots = parseInt(availableSlots, 10);
    if (isNaN(parsedSlots) || parsedSlots < 0) {
      setError('Available slots must be zero or a positive integer.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error: createErr } = await createSponsorshipPackage({
        event_id: selectedEventId,
        package_name: packageName.trim(),
        description: description.trim() || undefined,
        price: parsedPrice,
        benefits: benefits.trim() || undefined,
        available_slots: parsedSlots,
        status,
      });

      if (createErr) {
        setError(createErr);
      } else if (data) {
        setSuccess('Sponsorship package created successfully!');
        setTimeout(() => {
          navigate(`/organizer/events/${selectedEventId}/packages`);
        }, 600);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create package.');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelHref = routeEventId
    ? `/organizer/events/${routeEventId}/packages`
    : '/organizer/events';

  return (
    <div className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
      {/* Breadcrumb */}
      <Link
        to={cancelHref}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Sponsorship Packages</span>
      </Link>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-950/40 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl mb-8 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
          <Package className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">
              SPONSORSHIP PACKAGES
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Create Sponsorship Package
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Define a sponsorship tier for your event and set benefits and pricing.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Event Selector */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Campus Event <span className="text-rose-400">*</span>
              </label>
              {loadingEvents ? (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-2.5">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                  Loading your events...
                </div>
              ) : events.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  You have no events yet.{' '}
                  <Link to="/organizer/events/new" className="underline font-semibold">
                    Create an event first.
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors cursor-pointer"
                  >
                    <option value="" className="bg-slate-900 text-slate-400">
                      — Select an event —
                    </option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id} className="bg-slate-900 text-white">
                        {ev.event_name} ({ev.event_date})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Package Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Package Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  required
                  placeholder="e.g. Gold Sponsor, Title Sponsor"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Price ($) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
              </div>
            </div>

            {/* Available Slots */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Available Slots <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="number"
                  min={0}
                  value={availableSlots}
                  onChange={(e) => setAvailableSlots(e.target.value)}
                  required
                  placeholder="1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
              </div>
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Package Status
              </label>
              <div className="flex items-center gap-3">
                {(['ACTIVE', 'INACTIVE'] as SponsorshipPackageStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      status === s
                        ? s === 'ACTIVE'
                          ? 'bg-emerald-600/20 border-emerald-500/60 text-emerald-300 shadow-md'
                          : 'bg-slate-700/40 border-slate-600 text-slate-300'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <span className="text-xs text-slate-500 ml-1">
                  {status === 'ACTIVE'
                    ? 'Package will be visible to potential sponsors.'
                    : 'Package is hidden from sponsors.'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Package Description
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this sponsorship tier includes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Benefits */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Sponsor Benefits
              </label>
              <div className="relative">
                <Star className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <textarea
                  rows={3}
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="e.g. Logo on banner, Stage mentions, Social media shoutouts, Booth space..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
            <Link
              to={cancelHref}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || events.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Package</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSponsorshipPackagePage;
