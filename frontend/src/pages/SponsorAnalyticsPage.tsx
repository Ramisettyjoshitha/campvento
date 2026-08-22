import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSponsorAnalytics } from '../lib/analytics';
import type { SponsorAnalytics } from '../lib/analytics';
import {
  BarChart3,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertCircle,
  Building2,
  Calendar,
  Sparkles,
  Tag,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export const SponsorAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<SponsorAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await getSponsorAnalytics();
    if (err) {
      setError(err);
    } else {
      setAnalytics(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
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
    <div className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              STEP 9 ANALYTICS
            </span>
            <span className="text-xs text-slate-400">Sponsor Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sponsorship Impact & Activity
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Summary of your submitted partnership expressions, confirmed commitments, and category allocations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/sponsor/discover"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Discover Events</span>
          </Link>
        </div>
      </div>

      {/* Disclaimers & Value Definition */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-200">Authentic Sponsorship Records</span>
          <p className="leading-relaxed">
            Metrics are compiled from your actual expressions of interest and organizer-confirmed commitments.
            <strong className="text-emerald-400 ml-1">Committed Sponsorship Value</strong> reflects the agreed financial terms with organizers (online payment processing is not included).
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <div>
            <h4 className="font-semibold text-sm">Failed to load analytics</h4>
            <p className="text-xs text-rose-300 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs">Computing sponsorship analytics...</p>
        </div>
      ) : !analytics || (analytics.requests.total === 0 && analytics.commitments.total === 0) ? (
        /* Empty State */
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <Send className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Sponsorship Activity Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Discover campus events and submit expressions of interest to activate your sponsorship impact analytics.
          </p>
          <div className="pt-2">
            <Link
              to="/sponsor/discover"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/25"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Opportunities</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Main Analytics Content */
        <div className="space-y-8">
          {/* SECTION 1: Overview Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {/* Total Requests */}
            <div className="col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Expressions</span>
                <Send className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white">{analytics.requests.total}</div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="text-amber-400 font-semibold">{analytics.requests.pending} pending</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{analytics.requests.accepted} accepted</span>
              </div>
            </div>

            {/* Total Commitments */}
            <div className="col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Commitments</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">{analytics.commitments.total}</div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span>{analytics.commitments.active} active</span>
                <span>•</span>
                <span>{analytics.commitments.completed} completed</span>
              </div>
            </div>

            {/* Events Sponsored */}
            <div className="col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Events Sponsored</span>
                <Calendar className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-indigo-400">{analytics.eventsSponsored}</div>
              <div className="text-[11px] text-slate-500">
                Unique campus initiatives supported
              </div>
            </div>

            {/* Total Committed Sponsorship Value */}
            <div className="col-span-2 p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-500/40 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold">
                <span>Committed Value</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">
                ${analytics.committedSponsorshipValue.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-400/80">
                Agreed sponsorship allocations
              </div>
            </div>
          </div>

          {/* SECTION 2: Category Distribution & Request Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Distribution (2 cols) */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-400" />
                  Category Allocation
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Breakdown of confirmed sponsorship commitments grouped by event domain
                </p>
              </div>

              {analytics.categoryDistribution.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4">No category commitments recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {analytics.categoryDistribution.map((cat) => {
                    const totalVal = analytics.committedSponsorshipValue || 1;
                    const percent = Math.round((cat.committedValue / totalVal) * 100);
                    return (
                      <div key={cat.category} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200">{cat.category}</span>
                          <span className="text-slate-400">
                            <strong className="text-emerald-400">${cat.committedValue.toLocaleString()}</strong> ({cat.commitmentsCount} commitment{cat.commitmentsCount > 1 ? 's' : ''})
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Request Outcomes Breakdown (1 col) */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  Proposal Outcomes
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Status breakdown of all expressions submitted to organizers
                </p>

                <div className="space-y-3 mt-5">
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-medium text-slate-300">Pending Review</span>
                    </div>
                    <span className="font-bold text-amber-400 text-sm">{analytics.requests.pending}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-medium text-slate-300">Accepted</span>
                    </div>
                    <span className="font-bold text-emerald-400 text-sm">{analytics.requests.accepted}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span className="font-medium text-slate-300">Rejected / Cancelled</span>
                    </div>
                    <span className="font-bold text-rose-400 text-sm">{analytics.requests.rejected + analytics.requests.cancelled}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Expressions:</span>
                <span className="font-black text-white text-sm">{analytics.requests.total}</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: Sponsorship History Table */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  Sponsorship History
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete record of confirmed sponsorship commitments and terms
                </p>
              </div>
            </div>

            {analytics.history.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs italic bg-slate-950/50 rounded-2xl border border-slate-800/80">
                No sponsorship commitments have been finalized yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider bg-slate-950/50">
                      <th className="py-3 px-4 rounded-l-xl">Event</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Package Tier</th>
                      <th className="py-3 px-4 font-semibold text-emerald-400">Agreed Amount</th>
                      <th className="py-3 px-3">Commitment Status</th>
                      <th className="py-3 px-4 rounded-r-xl">Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {analytics.history.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">
                          <span className="truncate max-w-[200px] block">{item.eventName}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 border border-slate-700/60 text-slate-300">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-medium">
                          {item.packageName}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-400 text-sm">
                          ${item.agreedAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              item.status === 'ACTIVE'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : item.status === 'COMPLETED'
                                ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                : 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {item.startDate ? (
                            <span>
                              {formatDate(item.startDate)} — {formatDate(item.endDate)}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">Established on {formatDate(item.createdAt)}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorAnalyticsPage;
