import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSponsorMatches } from '../lib/matchingService';
import type {
  SponsorMatch,
  MatchSummaryStats,
} from '../lib/matchingService';
import type { MatchFactor } from '../lib/matchingEngine';
import { EVENT_CATEGORIES } from '../lib/events';
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Filter,
  RefreshCw,
  TrendingUp,
  Award,
  Zap,
  Loader2,
  Building2,
} from 'lucide-react';

export const SponsorMatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<SponsorMatch[]>([]);
  const [summary, setSummary] = useState<MatchSummaryStats>({
    totalOpportunities: 0,
    excellentMatches: 0,
    strongMatches: 0,
    goodMatches: 0,
    topScore: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  // Filters & Sorting state
  const [minScore, setMinScore] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [maxBudget, setMaxBudget] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'reach' | 'date'>('score');

  const fetchMatches = async () => {
    setLoading(true);
    setErrorMessage(null);

    const maxB = maxBudget ? Number(maxBudget) : undefined;

    const result = await getSponsorMatches({
      minScore: minScore > 0 ? minScore : undefined,
      category: selectedCategory,
      location: locationQuery || undefined,
      maxBudget: maxB,
      searchTerm: searchTerm || undefined,
      sortBy,
    });

    if (result.error) {
      setErrorMessage(result.error);
      setMatches([]);
    } else {
      setMatches(result.matches);
      setSummary(result.summary);
      if (result.matches.length > 0 && !expandedMatchId) {
        setExpandedMatchId(`${result.matches[0].eventId}-${result.matches[0].packageId}`);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, [minScore, selectedCategory, sortBy]);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMatches();
  };

  const handleResetFilters = () => {
    setMinScore(0);
    setSelectedCategory('ALL');
    setLocationQuery('');
    setMaxBudget('');
    setSearchTerm('');
    setSortBy('score');
    setTimeout(() => {
      fetchMatches();
    }, 0);
  };

  const toggleExpand = (id: string) => {
    setExpandedMatchId((prev) => (prev === id ? null : id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getQualityStyle = (quality: string) => {
    switch (quality) {
      case 'Excellent Match':
        return {
          bg: 'bg-emerald-500/15',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
          gauge: 'from-emerald-500 to-teal-400',
        };
      case 'Strong Match':
        return {
          bg: 'bg-blue-500/15',
          text: 'text-blue-400',
          border: 'border-blue-500/30',
          gauge: 'from-blue-500 to-cyan-400',
        };
      case 'Good Match':
        return {
          bg: 'bg-indigo-500/15',
          text: 'text-indigo-400',
          border: 'border-indigo-500/30',
          gauge: 'from-indigo-500 to-purple-400',
        };
      case 'Moderate Match':
        return {
          bg: 'bg-amber-500/15',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
          gauge: 'from-amber-500 to-yellow-400',
        };
      case 'Low Match':
      default:
        return {
          bg: 'bg-rose-500/15',
          text: 'text-rose-400',
          border: 'border-rose-500/30',
          gauge: 'from-rose-500 to-red-400',
        };
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/70 via-indigo-950/50 to-slate-900 border border-blue-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>EXPLAINABLE MATCHING ENGINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              AI-Powered Sponsor Matches
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Intelligent multi-factor scoring matching your brand profile, budget thresholds, audience demographics, and target categories against live campus events.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMatches}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Recalculate Matches</span>
            </button>
            <Link
              to="/sponsor/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Analyzed */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Opportunities
            </span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {loading ? '—' : summary.totalOpportunities}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Live tiers evaluated</p>
        </div>

        {/* Top Score */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Top Match Score
            </span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">
            {loading ? '—' : `${summary.topScore}%`}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Highest compatibility</p>
        </div>

        {/* Excellent Matches */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Excellent (90%+)
            </span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {loading ? '—' : summary.excellentMatches}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Prime recommendations</p>
        </div>

        {/* Strong Matches */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Strong (75–89%)
            </span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400">
            {loading ? '—' : summary.strongMatches}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">High alignment</p>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-400" />
            <span>Refine Recommendations</span>
          </div>

          <button
            onClick={handleResetFilters}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Reset Filters
          </button>
        </div>

        <form onSubmit={handleApplyFilter} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Minimum Match Score */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Minimum Match Score
              </label>
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value={0}>All Match Scores (0%+)</option>
                <option value={60}>Good Matches (60%+)</option>
                <option value={75}>Strong Matches (75%+)</option>
                <option value={90}>Excellent Matches Only (90%+)</option>
              </select>
            </div>

            {/* Event Category */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Event Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Categories</option>
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Sort Recommendations By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'price' | 'reach' | 'date')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="score">Highest Match Score (Default)</option>
                <option value="reach">Highest Expected Reach</option>
                <option value="price">Lowest Package Price</option>
                <option value="date">Upcoming Event Date</option>
              </select>
            </div>

            {/* Search Keyword */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Keyword / Venue
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search event name, venue..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Error State */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Link
            to="/sponsor/profile"
            className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-semibold text-xs border border-rose-500/30"
          >
            Complete Profile
          </Link>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <p className="text-sm font-medium">Running multi-factor matching algorithms...</p>
        </div>
      ) : matches.length === 0 ? (
        /* Empty State */
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-12 text-center max-w-xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Matching Opportunities Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            We couldn&apos;t find opportunities matching your selected filter criteria. Try lowering the minimum match threshold or updating your sponsor preferences.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              Reset Filters
            </button>
            <Link
              to="/sponsor/profile"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
            >
              Update Preferences
            </Link>
          </div>
        </div>
      ) : (
        /* Matches List */
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing <strong className="text-white">{matches.length}</strong> AI-ranked opportunity match{matches.length === 1 ? '' : 'es'}
            </span>
          </div>

          <div className="space-y-6">
            {matches.map((match) => {
              const uniqueKey = `${match.eventId}-${match.packageId}`;
              const isExpanded = expandedMatchId === uniqueKey;
              const qualityStyle = getQualityStyle(match.quality);

              return (
                <div
                  key={uniqueKey}
                  className="bg-slate-900/85 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 sm:p-8 transition-all shadow-xl backdrop-blur-xl"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Left: Event & Package Metadata */}
                    <div className="flex-1 space-y-4">
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          {match.event.category}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${qualityStyle.bg} ${qualityStyle.text} ${qualityStyle.border}`}
                        >
                          {match.quality}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                          Tier: {match.package.package_name}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {match.event.event_name}
                      </h2>

                      {/* Description */}
                      {match.event.description && (
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                          {match.event.description}
                        </p>
                      )}

                      {/* Meta Pills */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">
                            Event Date
                          </span>
                          <span className="text-slate-200 font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {new Date(match.event.event_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">
                            Venue / Scope
                          </span>
                          <span className="text-slate-200 font-medium flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {match.event.venue || 'Campus Venue TBD'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">
                            Expected Reach
                          </span>
                          <span className="text-slate-200 font-medium flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            {match.event.expected_attendees
                              ? `${match.event.expected_attendees.toLocaleString()} students`
                              : 'TBD'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">
                            Package Price
                          </span>
                          <span className="text-blue-400 font-bold">
                            {formatCurrency(match.package.price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Score Gauge & Quality */}
                    <div className="flex lg:flex-col items-center lg:items-center justify-between lg:justify-center gap-4 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 lg:w-56 shrink-0">
                      <div className="text-center">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                          Compatibility
                        </span>
                        <div className="text-4xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                          {match.score}%
                        </div>
                      </div>

                      <div className="text-right lg:text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${qualityStyle.bg} ${qualityStyle.text} ${qualityStyle.border}`}
                        >
                          {match.quality}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          6 weighted factors
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Match Reasons (Strengths & Cautions) */}
                  <div className="mt-6 pt-5 border-t border-slate-800/80">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>Why This Matches You</span>
                      </span>

                      <button
                        onClick={() => toggleExpand(uniqueKey)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <span>{isExpanded ? 'Hide Factor Breakdown' : 'View Factor Breakdown'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {match.strengths.slice(0, 3).map((st: string, idx: number) => (
                        <div
                          key={`st-${idx}`}
                          className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-emerald-300 flex items-start gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-snug">{st}</span>
                        </div>
                      ))}

                      {match.weaknesses.slice(0, 2).map((wk: string, idx: number) => (
                        <div
                          key={`wk-${idx}`}
                          className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-amber-300 flex items-start gap-2"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-snug">{wk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expandable Detailed 6-Factor Breakdown */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Multi-Factor Scoring Matrix (100% Normalized)
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {match.factors.map((f: MatchFactor, idx: number) => {
                          const factorRatio = f.score / 100;
                          return (
                            <div
                              key={idx}
                              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-200">
                                  {f.name}{' '}
                                  <span className="text-slate-500 font-normal">
                                    ({f.weight}% weight)
                                  </span>
                                </span>
                                <span className="font-bold text-white">{f.score}/100</span>
                              </div>

                              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-blue-500 h-full rounded-full transition-all"
                                  style={{ width: `${Math.round(factorRatio * 100)}%` }}
                                />
                              </div>

                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                {f.explanation}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {match.package.benefits && (
                        <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-2">
                            Included Package Deliverables:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                            {match.package.benefits.split('\n').map((benefit: string, bIdx: number) => (
                              <div key={bIdx} className="flex items-start gap-1.5 text-slate-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span className="text-[11px]">
                                  {benefit.replace(/^[-*•]\s*/, '')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorMatchesPage;
