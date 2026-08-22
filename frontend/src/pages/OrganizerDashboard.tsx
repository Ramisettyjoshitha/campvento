import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrganizerProfile } from '../lib/organizerProfile';
import type { OrganizerProfile } from '../lib/organizerProfile';
import { getMyEvents } from '../lib/events';
import type { EventItem } from '../lib/events';
import { getMyPackages } from '../lib/sponsorshipPackages';
import type { SponsorshipPackage } from '../lib/sponsorshipPackages';
import {
  GraduationCap,
  ShieldCheck,
  LogOut,
  User,
  Building2,
  ArrowRight,
  Clock,
  Calendar,
  CalendarPlus,
  Layers,
  CheckCircle2,
  FileEdit,
  ExternalLink,
  Package,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const OrganizerDashboard: React.FC = () => {
  const { user, fullName, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [packages, setPackages] = useState<SponsorshipPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      // Load profile
      const { data: profileData } = await getOrganizerProfile(user.id);
      if (profileData) {
        setProfile(profileData);
      }

      // Load events
      setLoadingEvents(true);
      const { data: eventList } = await getMyEvents();
      if (eventList) {
        setEvents(eventList);
      }
      setLoadingEvents(false);

      // Load sponsorship packages
      setLoadingPackages(true);
      const { data: pkgList } = await getMyPackages();
      if (pkgList) {
        setPackages(pkgList);
      }
      setLoadingPackages(false);
    };

    loadData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Event statistics
  const totalEvents = events.length;
  const draftEvents = events.filter((e) => e.status === 'DRAFT').length;
  const publishedEvents = events.filter((e) => e.status === 'PUBLISHED').length;
  const completedEvents = events.filter((e) => e.status === 'COMPLETED').length;

  // Sponsorship package statistics
  const totalPackages = packages.length;
  const activePackages = packages.filter((p) => p.status === 'ACTIVE').length;
  const inactivePackages = packages.filter((p) => p.status === 'INACTIVE').length;

  return (
    <div className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {role} PORTAL
                </span>
                {profile?.verification_status === 'VERIFIED' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    VERIFIED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    PENDING VERIFICATION
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Organizer Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Welcome back, {fullName || user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/organizer/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors border border-slate-700/60"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Edit Profile</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* EVENT MANAGEMENT SECTION (STEP 4.2) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Event Management</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Step 4.2
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Create and manage upcoming campus events, track publication statuses, and view timelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/organizer/events"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors border border-slate-700/60"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>My Events</span>
            </Link>
            <Link
              to="/organizer/events/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-lg shadow-emerald-600/20"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Create Event</span>
            </Link>
          </div>
        </div>

        {/* 4 Event Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total Events */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Total Events</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {loadingEvents ? '—' : totalEvents}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">All registered campus events</p>
          </div>

          {/* Draft Events */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Draft Events</span>
              <FileEdit className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400">
              {loadingEvents ? '—' : draftEvents}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">In progress & unpublished</p>
          </div>

          {/* Published Events */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Published Events</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              {loadingEvents ? '—' : publishedEvents}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Active for sponsorship</p>
          </div>

          {/* Completed Events */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Completed</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {loadingEvents ? '—' : completedEvents}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Concluded events</p>
          </div>
        </div>

        {/* Quick Events Snippet */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {events.length === 0
              ? 'No campus events created yet.'
              : `You have ${events.length} event(s) in your organizer portfolio.`}
          </span>
          <Link
            to="/organizer/events"
            className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
          >
            <span>View All in My Events</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* SPONSORSHIP PACKAGES SECTION (STEP 4.3) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Sponsorship Packages</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/30">
                Step 4.3
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Manage sponsorship tiers and pricing for your campus events.
            </p>
          </div>

          <Link
            to="/organizer/events"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors shadow-lg shadow-violet-600/20"
          >
            <Package className="w-4 h-4" />
            <span>Manage Sponsorship Packages</span>
          </Link>
        </div>

        {/* Package Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Total Packages</span>
              <Package className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {loadingPackages ? '—' : totalPackages}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">All sponsorship tiers</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Active Packages</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              {loadingPackages ? '—' : activePackages}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Open to sponsors</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Inactive Packages</span>
              <Layers className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-slate-400">
              {loadingPackages ? '—' : inactivePackages}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Hidden from sponsors</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
          {packages.length === 0
            ? 'No sponsorship packages created yet. Go to My Events → Manage Packages.'
            : `${packages.length} package(s) defined across your events.`}
        </div>
      </div>

      {/* Main Grid: Profile & Auth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Summary Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Organizer Profile</span>
              </h2>
              <span className="text-xs text-slate-400">Step 4.1</span>
            </div>

            {profile ? (
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Organization</span>
                  <span className="font-semibold text-white">
                    {profile.organization_name || 'Not configured'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">College / University</span>
                  <span className="text-slate-200">{profile.college_name || 'Not configured'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Contact Email</span>
                  <span className="text-slate-200">{profile.contact_email}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Verification</span>
                  <span className="text-amber-400 font-medium">{profile.verification_status}</span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-xs text-slate-400">
                <p>You haven&apos;t completed your organizer profile yet.</p>
                <p className="mt-1 text-slate-500">
                  Add your college and club information to connect with potential sponsors.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <Link
              to="/organizer/profile"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs border border-slate-700/50 transition-colors"
            >
              <span>{profile ? 'Manage Profile Details' : 'Complete Your Profile'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Authentication Session Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Authentication Session</span>
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">User ID</span>
                <span className="text-slate-200 font-mono">{user?.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Auth Email</span>
                <span className="text-slate-200 font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Assigned Role</span>
                <span className="text-emerald-400 font-bold">{role}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Row Level Security</span>
                <span className="text-emerald-400 font-medium">Active (auth.uid = organizer_id)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            Step 4.2: Event creation & organizer event management active.
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
