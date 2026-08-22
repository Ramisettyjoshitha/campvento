import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getMySponsorCommitments,
  calculateCommitmentSummary,
} from '../lib/sponsorshipCommitments';
import type { SponsorshipCommitment, CommitmentSummaryStats } from '../lib/sponsorshipCommitments';
import {
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Calendar,
  ExternalLink,
  Inbox,
  Clock,
} from 'lucide-react';

type FilterKey = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export const SponsorCommitmentsPage: React.FC = () => {
  const [commitments, setCommitments] = useState<SponsorshipCommitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>('ALL');

  const load = async () => {
    setLoading(true);
    setError(null);
    const res = await getMySponsorCommitments();
    if (res.error) setError(res.error);
    else setCommitments(res.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const summary: CommitmentSummaryStats = calculateCommitmentSummary(commitments);
  const filtered = commitments.filter((c) => filter === 'ALL' || c.status === filter);

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <Clock className="w-3 h-3 animate-pulse" /> ACTIVE
        </span>
      );
      case 'COMPLETED': return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
          <CheckCircle2 className="w-3 h-3" /> COMPLETED
        </span>
      );
      case 'CANCELLED': return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
          <XCircle className="w-3 h-3" /> CANCELLED
        </span>
      );
      default: return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
              STEP 8
            </span>
            <span className="text-xs text-slate-400">Sponsor Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Commitments
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            View your confirmed sponsorship commitments. Contact organizers via the requests dashboard.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/sponsor/requests"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all"
          >
            <FileText className="w-4 h-4" />
            My Requests
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: summary.total, color: 'text-white', icon: <Inbox className="w-3.5 h-3.5 text-blue-400" /> },
          { label: 'Active', value: summary.active, color: 'text-emerald-400', icon: <Clock className="w-3.5 h-3.5 text-emerald-400" /> },
          { label: 'Completed', value: summary.completed, color: 'text-blue-400', icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> },
          { label: 'Cancelled', value: summary.cancelled, color: 'text-slate-400', icon: <XCircle className="w-3.5 h-3.5 text-slate-400" /> },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-1 text-slate-400 text-xs font-medium">
              <span>{s.label}</span>
              {s.icon}
            </div>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800/80">
        {(['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as FilterKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter === key
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {key === 'ALL' ? 'All' : key.charAt(0) + key.slice(1).toLowerCase()}
            <span className={`px-1.5 rounded-full text-[10px] ${filter === key ? 'bg-blue-700/80 text-white' : 'bg-slate-800 text-slate-400'}`}>
              {key === 'ALL' ? summary.total : key === 'ACTIVE' ? summary.active : key === 'COMPLETED' ? summary.completed : summary.cancelled}
            </span>
          </button>
        ))}
      </div>

      {/* Commitment Cards */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
          <p className="text-xs">Loading your commitments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No commitments yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filter === 'ALL'
              ? 'When an organizer accepts your request and creates a commitment, it will appear here.'
              : `No ${filter.toLowerCase()} commitments.`}
          </p>
          <Link
            to="/sponsor/requests"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            View My Requests
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                      {c.events?.category || 'CAMPUS EVENT'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Committed {formatDate(c.created_at)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{c.events?.event_name || 'Campus Event'}</h3>
                </div>
                <div className="self-start sm:self-center">{renderStatusBadge(c.status)}</div>
              </div>

              {/* Key Facts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block mb-1">Package Tier</span>
                  <span className="text-white font-semibold">{c.sponsorship_packages?.package_name || '—'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block mb-1">Package Price</span>
                  <span className="text-slate-300 font-medium">${c.sponsorship_packages?.price?.toLocaleString() ?? '0'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block mb-1">Agreed Amount</span>
                  <span className="text-emerald-400 font-bold">${Number(c.agreed_amount).toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-500 block mb-1">Event Date</span>
                  <span className="text-slate-200 font-medium">
                    {c.events?.event_date ? formatDate(c.events.event_date) : 'TBA'}
                  </span>
                </div>
              </div>

              {/* Dates */}
              {(c.commitment_start_date || c.commitment_end_date) && (
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>
                    Commitment period: {formatDate(c.commitment_start_date)} — {formatDate(c.commitment_end_date)}
                  </span>
                </div>
              )}

              {/* Notes */}
              {c.notes && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Organizer Notes:</span>
                  <p className="text-slate-300 leading-relaxed">{c.notes}</p>
                </div>
              )}

              {/* Read-only notice + View link */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500 italic">
                  Sponsors can view commitments but cannot modify them.
                </span>
                <Link
                  to={`/sponsor/commitments/${c.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SponsorCommitmentsPage;

