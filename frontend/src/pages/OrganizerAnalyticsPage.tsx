import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrganizerAnalytics } from '../lib/analytics';
import type { OrganizerAnalytics } from '../lib/analytics';
import {
  BarChart3,
  Calendar,
  Package,
  Inbox,
  Clock,
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertCircle,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const OrganizerAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<OrganizerAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await getOrganizerAnalytics();
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

  return (
    <div className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              STEP 9 ANALYTICS
            </span>
            <span className="text-xs text-slate-400">Organizer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sponsorship ROI & Impact Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explainable sponsorship activity, pipeline health, and commitment performance across all your campus events.
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
            to="/organizer/events"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Manage Events</span>
          </Link>
        </div>
      </div>

      {/* Disclaimers & Value Definition */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-200">Verified Database Activity</span>
          <p className="leading-relaxed">
            All metrics reflect actual database records of campus events, sponsorship tiers, inquiries, and accepted agreements.
            <strong className="text-emerald-400 ml-1">Committed Sponsorship Value</strong> represents the sum of agreed amounts from confirmed commitments (online payment processing is not included).
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
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-xs">Computing portfolio analytics...</p>
        </div>
      ) : !analytics || analytics.totalEvents === 0 ? (
        /* Empty State */
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Sponsorship Activity Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Create your campus events and publish sponsorship tiers to start tracking pipeline conversions, inquiries, and committed sponsorship values.
          </p>
          <div className="pt-2">
            <Link
              to="/organizer/events/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-600/25"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Create Event</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Main Analytics Content */
        <div className="space-y-8">
          {/* SECTION 1: Overview Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {/* Total Events */}
            <div className="col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Events</span>
                <Calendar className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-white">{analytics.totalEvents}</div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="text-emerald-400 font-semibold">{analytics.publishedEvents} published</span>
                <span>•</span>
                <span>{analytics.completedEvents} completed</span>
              </div>
            </div>

            {/* Sponsorship Packages */}
            <div className="col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Sponsorship Packages</span>
                <Package className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-2xl font-black text-violet-400">{analytics.totalPackages}</div>
              <div className="text-[11px] text-slate-500">
                <span className="text-emerald-400 font-semibold">{analytics.activePackages} active</span> tiers for sponsors
              </div>
            </div>

            {/* Inquiries / Requests */}
            <div className="col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Requests & Inquiries</span>
                <Inbox className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-blue-400">{analytics.requests.total}</div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="text-amber-400 font-semibold">{analytics.requests.pending} pending</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{analytics.requests.accepted} accepted</span>
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
                {analytics.commitments.active} active • {analytics.commitments.completed} completed
              </div>
            </div>
          </div>

          {/* SECTION 2: Pipeline & Commitment Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sponsorship Pipeline (2 cols) */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Sponsorship Activity Pipeline
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Conversion progression from package creation to confirmed commitments
                  </p>
                </div>
              </div>

              {/* Pipeline Stage Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {/* Stage 1 */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">1. Packages</span>
                  <div className="text-xl font-black text-white">{analytics.pipeline.packages}</div>
                  <span className="text-[10px] text-slate-500">Available Tiers</span>
                </div>

                {/* Stage 2 */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">2. Inquiries</span>
                  <div className="text-xl font-black text-blue-400">{analytics.pipeline.requests}</div>
                  <span className="text-[10px] text-slate-500">Sponsor Requests</span>
                </div>

                {/* Stage 3 */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">3. Accepted</span>
                  <div className="text-xl font-black text-emerald-400">{analytics.pipeline.acceptedRequests}</div>
                  <span className="text-[10px] text-slate-500">Mutual Agreement</span>
                </div>

                {/* Stage 4 */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">4. Commitments</span>
                  <div className="text-xl font-black text-emerald-400">{analytics.pipeline.commitments}</div>
                  <span className="text-[10px] text-slate-500">Confirmed Terms</span>
                </div>
              </div>

              {/* Visual Pipeline Bar */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Pipeline Fulfillment</span>
                  <span className="font-semibold text-slate-300">
                    {analytics.pipeline.requests > 0
                      ? `${Math.round((analytics.pipeline.commitments / analytics.pipeline.requests) * 100)}% Conversion (Requests → Commitments)`
                      : '0% (No requests yet)'}
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 flex">
                  <div
                    className="bg-emerald-500 h-full transition-all"
                    style={{
                      width: analytics.pipeline.requests > 0
                        ? `${Math.min(100, Math.round((analytics.pipeline.commitments / analytics.pipeline.requests) * 100))}%`
                        : '0%',
                    }}
                    title="Commitments"
                  />
                  <div
                    className="bg-blue-500 h-full transition-all"
                    style={{
                      width: analytics.pipeline.requests > 0
                        ? `${Math.max(0, Math.round(((analytics.pipeline.acceptedRequests - analytics.pipeline.commitments) / analytics.pipeline.requests) * 100))}%`
                        : '0%',
                    }}
                    title="Accepted (Pending Commitment)"
                  />
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Confirmed Commitments</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Accepted Requests</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-700"></span> Pending / Total Inquiries</span>
                </div>
              </div>
            </div>

            {/* Commitment Status Distribution (1 col) */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Commitment Statuses
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Breakdown across active, fulfilled, and cancelled commitments
                </p>

                <div className="space-y-3 mt-5">
                  {/* ACTIVE */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <span className="font-semibold text-slate-200">ACTIVE</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400 text-sm">{analytics.commitments.active}</span>
                      <span className="text-slate-500 text-[11px]">in fulfillment</span>
                    </div>
                  </div>

                  {/* COMPLETED */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                      <span className="font-semibold text-slate-200">COMPLETED</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-400 text-sm">{analytics.commitments.completed}</span>
                      <span className="text-slate-500 text-[11px]">fulfilled</span>
                    </div>
                  </div>

                  {/* CANCELLED */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                      <span className="font-semibold text-slate-400">CANCELLED</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-400 text-sm">{analytics.commitments.cancelled}</span>
                      <span className="text-slate-500 text-[11px]">closed</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Agreements:</span>
                <span className="font-black text-white text-sm">{analytics.commitments.total}</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: Event Sponsorship Performance Table */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Event Sponsorship Performance
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Detailed breakdown of sponsorship packages, requests, and committed value per campus event
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider bg-slate-950/50">
                    <th className="py-3 px-4 rounded-l-xl">Event Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Packages</th>
                    <th className="py-3 px-3 text-center">Requests</th>
                    <th className="py-3 px-3 text-center">Accepted</th>
                    <th className="py-3 px-3 text-center">Active Commitments</th>
                    <th className="py-3 px-4 text-right font-semibold text-emerald-400">Committed Value</th>
                    <th className="py-3 px-4 rounded-r-xl text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {analytics.eventsPerformance.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">
                        <div className="flex flex-col">
                          <span className="truncate max-w-[200px]">{ev.event_name}</span>
                          <span className="text-[10px] text-slate-500 font-normal">{ev.event_date}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 border border-slate-700/60">
                          {ev.category}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            ev.status === 'PUBLISHED'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : ev.status === 'COMPLETED'
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {ev.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-300 font-medium">
                        {ev.totalPackages} <span className="text-[10px] text-slate-500">({ev.activePackages} active)</span>
                      </td>
                      <td className="py-3 px-3 text-center text-blue-400 font-semibold">
                        {ev.totalRequests}
                      </td>
                      <td className="py-3 px-3 text-center text-emerald-400 font-semibold">
                        {ev.acceptedRequests}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-200">
                        {ev.activeCommitments} <span className="text-[10px] text-slate-500">({ev.completedCommitments} done)</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400 text-sm">
                        ${ev.committedValue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          to={`/organizer/events/${ev.id}/analytics`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors"
                        >
                          <span>Event Analytics</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerAnalyticsPage;
