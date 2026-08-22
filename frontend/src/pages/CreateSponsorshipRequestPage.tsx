import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  createSponsorshipRequest,
  checkExistingPendingRequest,
} from '../lib/sponsorshipRequests';
import type { DiscoverablePackage, DiscoverableEvent } from '../lib/sponsorDiscovery';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Send,
  HelpCircle,
} from 'lucide-react';

interface LocationState {
  matchScore?: number;
  matchQuality?: string;
  strengths?: string[];
  weaknesses?: string[];
}

export const CreateSponsorshipRequestPage: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [pkg, setPkg] = useState<DiscoverablePackage | null>(null);
  const [event, setEvent] = useState<DiscoverableEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [hasPending, setHasPending] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      if (!packageId) {
        setError('No package ID specified.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Fetch package details
        const { data: pkgData, error: pkgErr } = await supabase
          .from('sponsorship_packages')
          .select('*')
          .eq('id', packageId)
          .single();

        if (pkgErr || !pkgData) {
          setError('Sponsorship package not found or no longer available.');
          setLoading(false);
          return;
        }

        setPkg(pkgData as DiscoverablePackage);

        // 2. Fetch parent event details
        const { data: eventData, error: eventErr } = await supabase
          .from('events')
          .select('*')
          .eq('id', pkgData.event_id)
          .single();

        if (eventErr || !eventData) {
          setError('Associated campus event could not be found.');
          setLoading(false);
          return;
        }

        setEvent(eventData as DiscoverableEvent);

        // 3. Check if user already has a pending request
        const pendingCheck = await checkExistingPendingRequest(packageId);
        if (pendingCheck.hasPending) {
          setHasPending(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load package details.');
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [packageId]);

  const handleSubmit = async () => {
    if (!packageId) return;

    setShowConfirmModal(false);
    setSubmitting(true);
    setError(null);

    const res = await createSponsorshipRequest({
      package_id: packageId,
      message: message.trim(),
    });

    if (res.error) {
      setError(res.error);
      if (res.error.includes('already have a pending request')) {
        setHasPending(true);
      }
      setSubmitting(false);
      return;
    }

    setSuccessMessage('Your sponsorship interest was successfully submitted to the event organizer!');
    setTimeout(() => {
      navigate('/sponsor/requests');
    }, 1200);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'TBA';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-sm">Loading sponsorship opportunity details...</p>
      </div>
    );
  }

  if (error && !pkg) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full space-y-6">
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <h2 className="font-bold text-sm">Unable to Load Opportunity</h2>
          </div>
          <p className="text-xs">{error}</p>
        </div>
        <Link
          to="/sponsor/discover"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto px-6 py-10 w-full space-y-8">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
          <Send className="w-3.5 h-3.5" />
          SPONSORSHIP INTEREST REQUEST
        </span>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* Duplicate Pending Notice */}
      {hasPending && (
        <div className="p-5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-xs">Existing Request Pending</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            You already have an active pending interest request for this sponsorship package. You can track its status or cancel it from your requests dashboard.
          </p>
          <div className="pt-2">
            <Link
              to="/sponsor/requests"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition-colors"
            >
              <span>View My Requests</span>
            </Link>
          </div>
        </div>
      )}

      {/* AI Match Context (if present) */}
      {state?.matchScore !== undefined && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-blue-950/40 border border-indigo-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Match Intelligence</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              {state.matchScore}% Match ({state.matchQuality || 'Compatible'})
            </span>
          </div>

          {state.strengths && state.strengths.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-medium">Why this is a strong match:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {state.strengths.slice(0, 2).map((st, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-[11px]">{st}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Opportunity Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header: Event & Package Title */}
        <div className="border-b border-slate-800 pb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
              {event?.category || 'CAMPUS EVENT'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {pkg?.package_name || 'PACKAGE TIER'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {event?.event_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {event?.description || 'Campus student-led event opportunity'}
          </p>
        </div>

        {/* Quick Facts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Event Date</span>
            </div>
            <span className="text-white font-semibold block">{formatDate(event?.event_date)}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Location</span>
            </div>
            <span className="text-white font-semibold block truncate">
              {event?.venue || 'Campus Venue'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Reach</span>
            </div>
            <span className="text-white font-semibold block">
              {event?.expected_attendees
                ? `${event.expected_attendees.toLocaleString()} attendees`
                : 'Campus-wide'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tier Price</span>
            </div>
            <span className="text-emerald-400 font-bold text-sm block">
              ${pkg?.price.toLocaleString() || '0'}
            </span>
          </div>
        </div>

        {/* Package Deliverables & Description */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-4">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
              Package Overview
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {pkg?.description || 'Standard event sponsorship benefits package.'}
            </p>
          </div>

          {pkg?.benefits && (
            <div className="pt-3 border-t border-slate-900">
              <span className="text-[11px] uppercase font-bold text-slate-400 block mb-2">
                Included Deliverables:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {pkg.benefits.split('\n').map((b, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-[11px]">{b.replace(/^[-*•]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Optional Sponsor Message Form */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-slate-200">
            Custom Note to Organizer <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={hasPending || submitting}
            rows={4}
            placeholder="Introduce your brand objectives, suggest specific booth activations, or request custom branding terms..."
            className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50 resize-none"
          />
          <p className="text-[11px] text-slate-500">
            Expressing interest sends your request directly to the event organizer. No payments or contracts are executed during this step.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
          <Link
            to="/sponsor/discover"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </Link>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={hasPending || submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Express Interest</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-scale-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Express Sponsorship Interest</h3>
                <p className="text-xs text-slate-400 mt-0.5">Confirm submission to organizer</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Event:</span>
                <span className="font-semibold text-white truncate max-w-[200px]">
                  {event?.event_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Package:</span>
                <span className="font-semibold text-emerald-400">
                  {pkg?.package_name} (${pkg?.price.toLocaleString()})
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to express interest in this sponsorship package? The event organizer will be able to review your brand interest and decide whether to accept.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm Expression</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSponsorshipRequestPage;
