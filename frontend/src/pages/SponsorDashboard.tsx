import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSponsorProfile } from '../lib/sponsorProfile';
import type { SponsorProfile } from '../lib/sponsorProfile';
import { getSponsorMatches } from '../lib/matchingService';
import type { MatchSummaryStats } from '../lib/matchingService';
import {
  getMySponsorRequests,
  calculateRequestSummary,
} from '../lib/sponsorshipRequests';
import type { RequestSummaryStats } from '../lib/sponsorshipRequests';
import {
  Building2,
  ShieldCheck,
  LogOut,
  Compass,
  Briefcase,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Edit3,
  ArrowRight,
  Loader2,
  Sparkles,
  Award,
  TrendingUp,
  Zap,
  Send,
  XCircle,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const SponsorDashboard: React.FC = () => {
  const { user, fullName, role, signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<SponsorProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [matchSummary, setMatchSummary] = useState<MatchSummaryStats | null>(null);
  const [requestSummary, setRequestSummary] = useState<RequestSummaryStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    cancelled: 0,
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      setLoading(true);

      // 1. Profile
      const { data } = await getSponsorProfile(user.id);
      if (data) {
        setProfile(data);
      }

      // 2. Match stats
      const matchRes = await getSponsorMatches();
      if (matchRes.summary) {
        setMatchSummary(matchRes.summary);
      }

      // 3. Sponsorship Request stats (Step 7)
      const reqRes = await getMySponsorRequests();
      if (reqRes.data) {
        setRequestSummary(calculateRequestSummary(reqRes.data));
      }

      setLoading(false);
    };

    loadDashboardData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Calculate profile completion percentage based on filled fields
  const calculateCompletion = (p: SponsorProfile | null): number => {
    if (!p) return 0;
    const fields = [
      p.company_name,
      p.contact_person,
      p.industry,
      p.company_description,
      p.website,
      p.contact_email,
      p.contact_phone,
      p.company_size,
      p.sponsorship_budget_max > 0 ? 'budget' : '',
      p.preferred_categories,
      p.preferred_audience,
      p.preferred_locations,
    ];
    const filledCount = fields.filter((val) => Boolean(val && val.trim())).length;
    return Math.round((filledCount / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion(profile);

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            VERIFIED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            REJECTED
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            PENDING VERIFICATION
          </span>
        );
    }
  };

  const formatBudget = (min: number = 0, max: number = 0) => {
    if (min === 0 && max === 0) return 'Not configured';
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/40 border border-blue-500/30 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  {role} PORTAL
                </span>
                {profile && renderStatusBadge(profile.verification_status)}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {profile?.company_name || 'Sponsor Dashboard'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Welcome back, {fullName || user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/sponsor/requests"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>My Requests</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* STEP 7: SPONSORSHIP REQUESTS SUMMARY CARD */}
      <div className="bg-gradient-to-r from-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                SPONSORSHIP REQUESTS
              </span>
              <span className="text-xs text-slate-400">Interest Flow</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Proposals & Partnership Interest
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Monitor active inquiries and organizer responses across all expressed opportunities.
            </p>
          </div>

          <Link
            to="/sponsor/requests"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all self-start sm:self-center"
          >
            <span>View Requests</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-1 text-slate-400 text-xs font-medium">
              <span>Total Requests</span>
              <Send className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {loading ? '—' : requestSummary.total}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Submitted expressions</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-1 text-slate-400 text-xs font-medium">
              <span>Pending Review</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">
              {loading ? '—' : requestSummary.pending}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Awaiting organizer</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-1 text-slate-400 text-xs font-medium">
              <span>Accepted</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {loading ? '—' : requestSummary.accepted}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Approved partnerships</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-1 text-slate-400 text-xs font-medium">
              <span>Rejected / Closed</span>
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400">
              {loading ? '—' : requestSummary.rejected + requestSummary.cancelled}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Closed inquiries</p>
          </div>
        </div>
      </div>

      {/* AI Match Intelligence Banner Card */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-blue-950/60 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 mb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI MATCH OPPORTUNITIES
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Live Scoring
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Campus Sponsorship Compatibility Intelligence
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Multi-factor explainable matching evaluates active campus events against your brand profile, budget ceilings, audience demographics, and target locations.
            </p>
          </div>

          <Link
            to="/sponsor/matches"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all self-start lg:self-center"
          >
            <span>View AI Matches</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Matching KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-1 text-slate-400 text-xs">
              <span>Total Opportunities</span>
              <Zap className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {loading ? '—' : matchSummary?.totalOpportunities ?? 0}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Live campus tiers</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-1 text-slate-400 text-xs">
              <span>Best Match Score</span>
              <Award className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-indigo-400">
              {loading ? '—' : `${matchSummary?.topScore ?? 0}%`}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Top compatibility</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-1 text-slate-400 text-xs">
              <span>Excellent Matches</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {loading ? '—' : matchSummary?.excellentMatches ?? 0}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">90%+ match quality</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-1 text-slate-400 text-xs">
              <span>Strong Matches</span>
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400">
              {loading ? '—' : matchSummary?.strongMatches ?? 0}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">75–89% match quality</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Profile Summary & Discovery Shortcut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sponsor Profile Summary Card */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" />
                <span>Sponsor Profile Summary</span>
              </h2>
              <Link
                to="/sponsor/profile"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{profile ? 'Edit Profile' : 'Complete Profile'}</span>
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10 text-slate-400">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin mr-2" />
                <span className="text-xs">Loading profile summary...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Profile Completion Bar */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-slate-400 font-medium">Profile Completion</span>
                    <span className="text-blue-400 font-bold">{completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Key Profile Attributes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-500 font-medium block mb-1">Company / Brand</span>
                    <span className="text-white font-bold text-sm">
                      {profile?.company_name || 'Not configured'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-500 font-medium block mb-1">Industry Sector</span>
                    <span className="text-slate-200 font-semibold text-sm">
                      {profile?.industry || 'General / Tech'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-500 font-medium block mb-1">Budget Allocation</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {formatBudget(profile?.sponsorship_budget_min, profile?.sponsorship_budget_max)}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                    <span className="text-slate-500 font-medium block mb-1">Verification Status</span>
                    <div className="mt-0.5">{renderStatusBadge(profile?.verification_status)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {completionPercentage < 100
                ? 'Fill out all profile fields to optimize AI matching quality.'
                : 'Your profile is fully configured for campus matchmaking.'}
            </span>
            <Link
              to="/sponsor/profile"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
            >
              {profile ? 'Manage Profile' : 'Complete Profile'}
            </Link>
          </div>
        </div>

        {/* Discover Opportunities Action Card */}
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Explore Campus Events
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Search and filter published university hackathons, technical symposiums, and cultural festivals with active sponsorship tiers.
            </p>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Published events verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Active tier pricing & benefits</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Filter by category & budget</span>
              </div>
            </div>
          </div>

          <Link
            to="/sponsor/discover"
            className="mt-8 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all"
          >
            <span>Browse Discovery Hub</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Session Details Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Active Authenticated Session</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block mb-1">User ID</span>
            <span className="text-slate-200 font-mono text-[11px] truncate block">{user?.id}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block mb-1">Account Email</span>
            <span className="text-slate-200 font-medium truncate block">{user?.email}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block mb-1">Authorized Role</span>
            <span className="text-blue-400 font-bold">{role}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block mb-1">Session Status</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active (Persisted)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorDashboard;
