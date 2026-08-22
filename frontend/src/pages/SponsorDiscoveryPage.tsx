import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDiscoverableOpportunities } from '../lib/sponsorDiscovery';
import type { DiscoverableEvent } from '../lib/sponsorDiscovery';
import { EVENT_CATEGORIES } from '../lib/events';
import {
  Compass,
  Calendar,
  MapPin,
  Users,
  Search,
  Filter,
  DollarSign,
  Tag,
  Clock,
  Layers,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
  ArrowRight,
} from 'lucide-react';

export const SponsorDiscoveryPage: React.FC = () => {
  const [events, setEvents] = useState<DiscoverableEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Non-AI Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [venueFilter, setVenueFilter] = useState<string>('');
  const [minBudget, setMinBudget] = useState<string>('');
  const [maxBudget, setMaxBudget] = useState<string>('');

  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const fetchOpportunities = async () => {
    setLoading(true);
    setErrorMessage(null);

    const minB = minBudget ? Number(minBudget) : undefined;
    const maxB = maxBudget ? Number(maxBudget) : undefined;

    const { data, error } = await getDiscoverableOpportunities({
      category: selectedCategory,
      date: selectedDate || undefined,
      venue: venueFilter || undefined,
      minBudget: minB,
      maxBudget: maxB,
      searchTerm: searchTerm || undefined,
    });

    if (error) {
      setErrorMessage(error);
    } else {
      setEvents(data || []);
      // If there are results and none expanded, auto expand first one
      if (data && data.length > 0 && !expandedEventId) {
        setExpandedEventId(data[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOpportunities();
  }, [selectedCategory, selectedDate]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOpportunities();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedDate('');
    setVenueFilter('');
    setMinBudget('');
    setMaxBudget('');
    // Trigger immediate reload with cleared filters
    setTimeout(() => {
      fetchOpportunities();
    }, 0);
  };

  const toggleExpand = (id: string) => {
    setExpandedEventId((prev) => (prev === id ? null : id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/40 border border-blue-500/20 rounded-3xl p-8 shadow-2xl mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
              <Compass className="w-3.5 h-3.5" />
              <span>SPONSOR DISCOVERY HUB</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Discover Campus Sponsorship Opportunities
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Browse published university hackathons, technical symposiums, and cultural festivals seeking brand partners and sponsors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOpportunities}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Opportunities</span>
            </button>
            <Link
              to="/sponsor/profile"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all"
            >
              <span>My Sponsor Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Control Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-400" />
            <span>Non-AI Discovery Filters</span>
          </div>
          {(searchTerm ||
            selectedCategory !== 'ALL' ||
            selectedDate ||
            venueFilter ||
            minBudget ||
            maxBudget) && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        <form onSubmit={handleApplyFilters} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Keyword */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Keyword / Search
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Event name, theme, topic..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Event Category
              </label>
              <div className="relative">
                <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Event Categories</option>
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Venue / Location */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Location / Venue
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={venueFilter}
                  onChange={(e) => setVenueFilter(e.target.value)}
                  placeholder="Campus, city, virtual..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Earliest Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                On or After Date
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Secondary Row: Budget Ranges & Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-44">
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    placeholder="Min Price ($)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <span className="text-slate-600 text-xs">to</span>
              <div className="w-full sm:w-44">
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    placeholder="Max Price ($)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-md shadow-blue-600/25"
            >
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <p className="text-sm font-medium">Scanning published campus opportunities...</p>
        </div>
      ) : events.length === 0 ? (
        /* Empty State */
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-12 text-center max-w-xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-4">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            No Published Opportunities Found
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            There are currently no published events matching your selected filters. Try broadening your filter criteria or check back soon as campus organizers publish new event opportunities.
          </p>
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      ) : (
        /* Event Opportunities Grid / Feed */
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing <strong className="text-white">{events.length}</strong> published campus event{events.length === 1 ? '' : 's'}</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {events.map((event) => {
              const isExpanded = expandedEventId === event.id;
              const packageCount = event.sponsorship_packages?.length || 0;

              return (
                <div
                  key={event.id}
                  className="bg-slate-900/85 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 sm:p-8 transition-all shadow-xl backdrop-blur-xl"
                >
                  {/* Top Bar: Category & Date */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        {event.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        PUBLISHED
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(event.event_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {(event.start_time || event.end_time) && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {event.start_time?.slice(0, 5) || ''}
                          {event.end_time ? ` - ${event.end_time.slice(0, 5)}` : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {event.event_name}
                  </h2>
                  {event.description && (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                      {event.description}
                    </p>
                  )}

                  {/* Event Meta Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-6 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-0.5">
                        Venue / Campus
                      </span>
                      <span className="text-slate-200 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {event.venue || 'Campus Venue TBD'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-0.5">
                        Expected Attendees
                      </span>
                      <span className="text-slate-200 font-medium flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        {event.expected_attendees ? `${event.expected_attendees.toLocaleString()} students` : 'TBD'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-0.5">
                        Target Audience
                      </span>
                      <span className="text-slate-200 font-medium">
                        {event.target_audience || 'University Students'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-0.5">
                        Active Packages
                      </span>
                      <span className="text-blue-400 font-bold">
                        {packageCount} Tier{packageCount === 1 ? '' : 's'} Available
                      </span>
                    </div>
                  </div>

                  {/* Packages Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-400" />
                        <span>Sponsorship Packages ({packageCount})</span>
                      </h3>
                      {packageCount > 0 && (
                        <button
                          onClick={() => toggleExpand(event.id)}
                          className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {isExpanded ? 'Hide Package Details' : 'View Package Details'}
                        </button>
                      )}
                    </div>

                    {packageCount === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-500">
                        No active sponsorship packages published for this event yet.
                      </div>
                    ) : isExpanded ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                        {event.sponsorship_packages?.map((pkg) => (
                          <div
                            key={pkg.id}
                            className="bg-slate-950/80 border border-slate-800 hover:border-blue-500/40 rounded-xl p-5 flex flex-col justify-between transition-colors shadow-md"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-bold text-white text-sm">
                                  {pkg.package_name}
                                </h4>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 whitespace-nowrap">
                                  {pkg.available_slots} slots left
                                </span>
                              </div>

                              <div className="text-lg font-extrabold text-blue-400 mb-3">
                                {formatCurrency(pkg.price)}
                              </div>

                              {pkg.description && (
                                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                                  {pkg.description}
                                </p>
                              )}

                              {pkg.benefits && (
                                <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-900 pt-3">
                                  <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">
                                    Deliverables & Perks:
                                  </span>
                                  {pkg.benefits.split('\n').map((benefit, idx) => (
                                    <div key={idx} className="flex items-start gap-1.5">
                                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                      <span className="text-slate-300 text-[11px]">
                                        {benefit.replace(/^[-*•]\s*/, '')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="mt-5 pt-3 border-t border-slate-900/80 text-[11px] text-slate-500 text-center">
                              Active Tier • Eligible for Discovery
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorDiscoveryPage;
