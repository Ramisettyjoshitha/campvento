import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventAnalytics } from '../lib/analytics';
import type { EventAnalytics } from '../lib/analytics';
import {
  MapPin,
  Users,
  Package,
  Inbox,
  CheckCircle2,
  Clock,
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Tag,
} from 'lucide-react';

export const EventAnalyticsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await getEventAnalytics(eventId);
    if (err) {
      setError(err);
    } else {
      setAnalytics(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [eventId]);

  return (
    <div className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/organizer/analytics"
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Organizer Analytics</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              EVENT DRILLDOWN
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {analytics ? analytics.event.event_name : 'Event Sponsorship Analytics'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Single-event sponsorship performance, package engagement, and committed value summary.
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
          {eventId && (
            <Link
              to={`/organizer/events/${eventId}/packages`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Manage Packages</span>
            </Link>
          )}
        </div>
      </div>

      {/* Disclaimers & Value Definition */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-200">Event-Scoped Analytics</span>
          <p className="leading-relaxed">
            Data reflects only sponsorship packages, requests, and commitments associated with this event.
            <strong className="text-emerald-400 ml-1">Committed Sponsorship Value</strong> is the sum of agreed terms from accepted commitments.
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h4 className="font-bold text-white text-base">Unable to load event analytics</h4>
          <p className="text-xs text-rose-300 max-w-md mx-auto">{error}</p>
          <div className="pt-2">
            <Link
              to="/organizer/analytics"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portfolio Analytics</span>
            </Link>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-xs">Computing event sponsorship metrics...</p>
        </div>
      ) : analytics && (
        <div className="space-y-8">
          {/* Event Context Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-400" />
                  {analytics.event.category}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    analytics.event.status === 'PUBLISHED'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : analytics.event.status === 'COMPLETED'
                      ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {analytics.event.status}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Event Date: <strong className="text-slate-200">{analytics.event.event_date}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 block mb-1">Venue / Location</span>
                <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{analytics.event.venue || 'Campus Venue'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 block mb-1">Expected Attendees</span>
                <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                  <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{analytics.event.expected_attendees ?? '—'} students</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-500 block mb-1">Sponsorship Tiers</span>
                <div className="flex items-center gap-1.5 font-semibold text-violet-400">
                  <Package className="w-3.5 h-3.5 shrink-0" />
                  <span>{analytics.totalPackages} total ({analytics.activePackages} active)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Packages */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Active Packages</span>
                <Package className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-2xl font-black text-violet-400">{analytics.activePackages}</div>
              <p className="text-[11px] text-slate-500">out of {analytics.totalPackages} total tiers</p>
            </div>

            {/* Total Requests */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Requests</span>
                <Inbox className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-blue-400">{analytics.requests.total}</div>
              <p className="text-[11px] text-slate-500">{analytics.requests.pending} awaiting review</p>
            </div>

            {/* Commitments */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Commitments</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">{analytics.commitments.total}</div>
              <p className="text-[11px] text-slate-500">{analytics.commitments.active} active • {analytics.commitments.completed} done</p>
            </div>

            {/* Committed Value */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-500/40 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold">
                <span>Committed Value</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">
                ${analytics.committedSponsorshipValue.toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-400/80">Agreed sponsorship terms</p>
            </div>
          </div>

          {/* Pipeline & Status Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pipeline (2 cols) */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Event Sponsorship Pipeline
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fulfillment progression from package creation to confirmed commitments
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">1. Packages</span>
                  <div className="text-xl font-black text-white">{analytics.pipeline.packages}</div>
                  <span className="text-[10px] text-slate-500">Tiers Configured</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">2. Inquiries</span>
                  <div className="text-xl font-black text-blue-400">{analytics.pipeline.requests}</div>
                  <span className="text-[10px] text-slate-500">Received</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">3. Accepted</span>
                  <div className="text-xl font-black text-emerald-400">{analytics.pipeline.acceptedRequests}</div>
                  <span className="text-[10px] text-slate-500">Agreed</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">4. Commitments</span>
                  <div className="text-xl font-black text-emerald-400">{analytics.pipeline.commitments}</div>
                  <span className="text-[10px] text-slate-500">Confirmed</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Conversion Rate</span>
                  <span className="font-semibold text-slate-300">
                    {analytics.pipeline.requests > 0
                      ? `${Math.round((analytics.pipeline.commitments / analytics.pipeline.requests) * 100)}% (Inquiries → Commitments)`
                      : '0% (No inquiries yet)'}
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
                  />
                  <div
                    className="bg-blue-500 h-full transition-all"
                    style={{
                      width: analytics.pipeline.requests > 0
                        ? `${Math.max(0, Math.round(((analytics.pipeline.acceptedRequests - analytics.pipeline.commitments) / analytics.pipeline.requests) * 100))}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Commitment Status Breakdown (1 col) */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Commitment Statuses
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Current lifecycle status of event agreements
                </p>

                <div className="space-y-3 mt-5">
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <span className="font-semibold text-slate-200">ACTIVE</span>
                    </div>
                    <span className="font-bold text-emerald-400 text-sm">{analytics.commitments.active}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                      <span className="font-semibold text-slate-200">COMPLETED</span>
                    </div>
                    <span className="font-bold text-blue-400 text-sm">{analytics.commitments.completed}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                      <span className="font-semibold text-slate-400">CANCELLED</span>
                    </div>
                    <span className="font-bold text-slate-400 text-sm">{analytics.commitments.cancelled}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Agreements:</span>
                <span className="font-black text-white text-sm">{analytics.commitments.total}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventAnalyticsPage;
