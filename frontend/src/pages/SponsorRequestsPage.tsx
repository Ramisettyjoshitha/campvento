import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getMySponsorRequests,
  cancelSponsorshipRequest,
  calculateRequestSummary,
} from '../lib/sponsorshipRequests';
import type {
  SponsorshipRequest,
  SponsorshipRequestStatus,
  RequestSummaryStats,
} from '../lib/sponsorshipRequests';
import {
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Compass,
  Ban,
  HelpCircle,
} from 'lucide-react';

export const SponsorRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<SponsorshipRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    const res = await getMySponsorRequests();
    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setRequests(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCancelRequest = async () => {
    if (!cancelTargetId) return;

    setCancelling(true);
    const res = await cancelSponsorshipRequest(cancelTargetId);
    setCancelling(false);
    setCancelTargetId(null);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccessToast('Sponsorship request was successfully cancelled.');
      setTimeout(() => setSuccessToast(null), 4000);
      loadRequests();
    }
  };

  const summary: RequestSummaryStats = calculateRequestSummary(requests);

  const filteredRequests = requests.filter((r) => {
    if (selectedFilter === 'ALL') return true;
    return r.status === selectedFilter;
  });

  const renderStatusBadge = (status: SponsorshipRequestStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ACCEPTED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            REJECTED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            <Ban className="w-3.5 h-3.5" />
            CANCELLED
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            PENDING REVIEW
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
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

  return (
    <div className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              STEP 7
            </span>
            <span className="text-xs text-slate-400">Sponsorship Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Sponsorship Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track expressions of interest submitted to campus event organizers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadRequests}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-800"
            title="Refresh requests"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/sponsor/matches"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Matches</span>
          </Link>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-medium">{successToast}</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-1 text-slate-400 text-xs font-medium">
            <span>Total Requests</span>
            <Send className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{summary.total}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Submitted proposals</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-1 text-slate-400 text-xs font-medium">
            <span>Pending Review</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{summary.pending}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Awaiting organizer</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-1 text-slate-400 text-xs font-medium">
            <span>Accepted</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{summary.accepted}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Approved partnerships</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-1 text-slate-400 text-xs font-medium">
            <span>Rejected / Cancelled</span>
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">
            {summary.rejected + summary.cancelled}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Closed requests</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800/80">
        {[
          { key: 'ALL', label: 'All Requests', count: summary.total },
          { key: 'PENDING', label: 'Pending', count: summary.pending },
          { key: 'ACCEPTED', label: 'Accepted', count: summary.accepted },
          { key: 'REJECTED', label: 'Rejected', count: summary.rejected },
          { key: 'CANCELLED', label: 'Cancelled', count: summary.cancelled },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedFilter(tab.key)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === tab.key
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedFilter === tab.key
                  ? 'bg-indigo-700/80 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Request Cards Feed */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
          <p className="text-xs">Loading sponsorship requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No requests found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {selectedFilter === 'ALL'
                ? 'You have not submitted any expressions of interest yet. Explore verified campus events to get started.'
                : `No requests found with status ${selectedFilter}.`}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/sponsor/matches"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore AI Matches</span>
            </Link>
            <Link
              to="/sponsor/discover"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Discover Events</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-4"
            >
              {/* Card Header: Event Title & Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                      {req.events?.category || 'CAMPUS EVENT'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Submitted on {formatDate(req.created_at)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {req.events?.event_name || 'Campus Event'}
                  </h3>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  {renderStatusBadge(req.status)}
                </div>
              </div>

              {/* Package & Event Key Facts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Package Tier</span>
                  <span className="text-white font-semibold block">
                    {req.sponsorship_packages?.package_name || 'Standard Tier'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Tier Price</span>
                  <span className="text-emerald-400 font-bold block">
                    ${req.sponsorship_packages?.price.toLocaleString() || '0'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Event Date</span>
                  <span className="text-slate-200 font-medium block">
                    {req.events?.event_date ? formatDate(req.events.event_date) : 'TBA'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Venue</span>
                  <span className="text-slate-200 font-medium block truncate">
                    {req.events?.venue || 'Campus Venue'}
                  </span>
                </div>
              </div>

              {/* Sponsor Custom Message (if any) */}
              {req.message && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Your Note to Organizer:
                  </span>
                  <p className="text-slate-300 italic leading-relaxed">
                    &ldquo;{req.message}&rdquo;
                  </p>
                </div>
              )}

              {/* Action Footer for PENDING requests */}
              {req.status === 'PENDING' && (
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Awaiting event organizer review and decision.
                  </span>

                  <button
                    type="button"
                    onClick={() => setCancelTargetId(req.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancel Request</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-scale-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Cancel Sponsorship Request</h3>
                <p className="text-xs text-slate-400 mt-0.5">Confirm status transition</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to cancel this pending sponsorship interest request? The organizer will no longer be able to accept it. You can submit a new request later if you change your mind.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelTargetId(null)}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Keep Request
              </button>

              <button
                type="button"
                onClick={handleCancelRequest}
                disabled={cancelling}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-600/30 disabled:opacity-50"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <Ban className="w-3.5 h-3.5" />
                    <span>Confirm Cancellation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorRequestsPage;
