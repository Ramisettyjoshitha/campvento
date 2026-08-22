import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getOrganizerRequests,
  updateRequestStatus,
  calculateRequestSummary,
} from '../lib/sponsorshipRequests';
import type {
  SponsorshipRequest,
  SponsorshipRequestStatus,
  RequestSummaryStats,
} from '../lib/sponsorshipRequests';
import { checkExistingCommitment } from '../lib/sponsorshipCommitments';
import {
  Inbox,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Building2,
  Ban,
  HelpCircle,
  Check,
  X,
  FileText,
  ArrowRight,
} from 'lucide-react';

export const OrganizerRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<SponsorshipRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [actionTarget, setActionTarget] = useState<{
    id: string;
    action: 'ACCEPTED' | 'REJECTED';
    eventName?: string;
    packageName?: string;
  } | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);
  // Map of requestId -> commitmentId for ACCEPTED requests
  const [commitmentMap, setCommitmentMap] = useState<Record<string, string>>({});
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    const res = await getOrganizerRequests();
    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setRequests(res.data);
      // For each ACCEPTED request, check if a commitment exists
      const accepted = res.data.filter((r) => r.status === 'ACCEPTED');
      const map: Record<string, string> = {};
      await Promise.all(
        accepted.map(async (r) => {
          const { commitment } = await checkExistingCommitment(r.id);
          if (commitment) map[r.id] = commitment.id;
        })
      );
      setCommitmentMap(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleUpdateStatus = async () => {
    if (!actionTarget) return;

    setUpdating(true);
    const res = await updateRequestStatus(actionTarget.id, actionTarget.action);
    setUpdating(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccessToast(
        actionTarget.action === 'ACCEPTED'
          ? 'Sponsorship request accepted successfully!'
          : 'Sponsorship request rejected.'
      );
      setTimeout(() => setSuccessToast(null), 4000);
      loadRequests();
    }
    setActionTarget(null);
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
            CANCELLED BY SPONSOR
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            ACTION REQUIRED
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              STEP 7
            </span>
            <span className="text-xs text-slate-400">Organizer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Incoming Sponsorship Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review and respond to sponsorship interest expressions submitted for your campus events.
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
            to="/organizer/events"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>My Events</span>
          </Link>
        </div>
      </div>

      {/* Success Toast */}
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
            <span>Total Inquiries</span>
            <Inbox className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{summary.total}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">All received requests</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-1 text-slate-400 text-xs font-medium">
            <span>Needs Action</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{summary.pending}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Pending your review</p>
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
          <p className="text-[10px] text-slate-500 mt-0.5">Closed inquiries</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800/80">
        {[
          { key: 'ALL', label: 'All Inquiries', count: summary.total },
          { key: 'PENDING', label: 'Needs Action', count: summary.pending },
          { key: 'ACCEPTED', label: 'Accepted', count: summary.accepted },
          { key: 'REJECTED', label: 'Rejected', count: summary.rejected },
          { key: 'CANCELLED', label: 'Cancelled', count: summary.cancelled },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedFilter(tab.key)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === tab.key
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedFilter === tab.key
                  ? 'bg-emerald-700/80 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Requests Feed */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
          <p className="text-xs">Loading incoming inquiries...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No requests found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {selectedFilter === 'ALL'
                ? 'No sponsorship interest requests have been submitted yet. Keep your events published and packages active to attract sponsors.'
                : `No requests found with status ${selectedFilter}.`}
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/organizer/events"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Manage Campus Events</span>
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
              {/* Header: Event & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {req.events?.category || 'CAMPUS EVENT'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Received on {formatDate(req.created_at)}
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
                  <span className="text-slate-500 block mb-1">Target Package Tier</span>
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
                  <span className="text-slate-500 block mb-1">Sponsor Partner</span>
                  <span className="text-slate-200 font-semibold block flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Verified Sponsor</span>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Status</span>
                  <span className="text-slate-300 font-medium block">
                    {req.status}
                  </span>
                </div>
              </div>

              {/* Sponsor Note */}
              {req.message ? (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Sponsor Note:
                  </span>
                  <p className="text-slate-300 italic leading-relaxed">
                    &ldquo;{req.message}&rdquo;
                  </p>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 italic">
                  No additional custom note attached to this request.
                </div>
              )}

              {/* Action Footer for PENDING requests */}
              {req.status === 'PENDING' && (
                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Review sponsorship expression and respond:
                  </span>

                  <div className="flex items-center gap-2.5 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() =>
                        setActionTarget({
                          id: req.id,
                          action: 'REJECTED',
                          eventName: req.events?.event_name,
                          packageName: req.sponsorship_packages?.package_name,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActionTarget({
                          id: req.id,
                          action: 'ACCEPTED',
                          eventName: req.events?.event_name,
                          packageName: req.sponsorship_packages?.package_name,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Interest</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 8: Commitment actions for ACCEPTED requests */}
              {req.status === 'ACCEPTED' && (
                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-emerald-400/80 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Request accepted — manage sponsorship commitment:
                  </span>
                  {commitmentMap[req.id] ? (
                    <Link
                      to={`/organizer/commitments/${commitmentMap[req.id]}`}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Commitment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      to={`/organizer/requests/${req.id}/commitment`}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Create Commitment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Decision Confirmation Modal */}
      {actionTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-scale-in">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  actionTarget.action === 'ACCEPTED'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                }`}
              >
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {actionTarget.action === 'ACCEPTED'
                    ? 'Accept Sponsorship Request'
                    : 'Reject Sponsorship Request'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Confirm status transition</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Event:</span>
                <span className="font-semibold text-white truncate max-w-[200px]">
                  {actionTarget.eventName || 'Campus Event'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Package:</span>
                <span className="font-semibold text-emerald-400">
                  {actionTarget.packageName || 'Sponsorship Package'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {actionTarget.action === 'ACCEPTED'
                ? 'Are you sure you want to ACCEPT this sponsorship interest? The sponsor will be notified of your acceptance in their requests dashboard.'
                : 'Are you sure you want to REJECT this sponsorship request? The sponsor will see this status in their dashboard.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActionTarget(null)}
                disabled={updating}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={updating}
                className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-md disabled:opacity-50 ${
                  actionTarget.action === 'ACCEPTED'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                }`}
              >
                {updating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : actionTarget.action === 'ACCEPTED' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Acceptance</span>
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Confirm Rejection</span>
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

export default OrganizerRequestsPage;
