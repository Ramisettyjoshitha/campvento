import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { OrganizerProfilePage } from './pages/OrganizerProfilePage';
import { CreateEventPage } from './pages/CreateEventPage';
import { MyEventsPage } from './pages/MyEventsPage';
import { EditEventPage } from './pages/EditEventPage';
import { SponsorshipPackagesPage } from './pages/SponsorshipPackagesPage';
import { CreateSponsorshipPackagePage } from './pages/CreateSponsorshipPackagePage';
import { EditSponsorshipPackagePage } from './pages/EditSponsorshipPackagePage';
import { EventSponsorMatchesPage } from './pages/EventSponsorMatchesPage';
import { OrganizerRequestsPage } from './pages/OrganizerRequestsPage';
import { SponsorDashboard } from './pages/SponsorDashboard';
import { SponsorProfilePage } from './pages/SponsorProfilePage';
import { SponsorDiscoveryPage } from './pages/SponsorDiscoveryPage';
import { SponsorMatchesPage } from './pages/SponsorMatchesPage';
import { CreateSponsorshipRequestPage } from './pages/CreateSponsorshipRequestPage';
import { SponsorRequestsPage } from './pages/SponsorRequestsPage';
import { CreateCommitmentPage } from './pages/CreateCommitmentPage';
import { OrganizerCommitmentsPage } from './pages/OrganizerCommitmentsPage';
import { SponsorCommitmentsPage } from './pages/SponsorCommitmentsPage';
import { CommitmentDetailsPage } from './pages/CommitmentDetailsPage';
import { OrganizerAnalyticsPage } from './pages/OrganizerAnalyticsPage';
import { SponsorAnalyticsPage } from './pages/SponsorAnalyticsPage';
import { EventAnalyticsPage } from './pages/EventAnalyticsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

/**
 * DashboardRedirector resolves the authenticated user's assigned role
 * and routes them directly to their dedicated dashboard.
 */
const DashboardRedirector: React.FC = () => {
  const { user, role, loading, getDashboardPath } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading dashboard...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath(role)} replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Dashboard Resolving Route */}
            <Route path="/dashboard" element={<DashboardRedirector />} />

            {/* Organizer Role-Protected Routes */}
            <Route
              path="/dashboard/organizer"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <OrganizerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/profile"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <OrganizerProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/organizer/profile"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <OrganizerProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Organizer Event Management Routes (Step 4.2) */}
            <Route
              path="/organizer/events"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <MyEventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/organizer/events"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <MyEventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/events/new"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <CreateEventPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/events/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <EditEventPage />
                </ProtectedRoute>
              }
            />

            {/* Organizer Sponsorship Package Routes (Step 4.3) */}
            <Route
              path="/organizer/events/:eventId/packages"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <SponsorshipPackagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/events/:eventId/packages/new"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <CreateSponsorshipPackagePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/events/:eventId/packages/:packageId/edit"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <EditSponsorshipPackagePage />
                </ProtectedRoute>
              }
            />

            {/* Organizer Event Sponsor Compatibility View (Step 6) */}
            <Route
              path="/organizer/events/:eventId/matches"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <EventSponsorMatchesPage />
                </ProtectedRoute>
              }
            />

            {/* Organizer Sponsorship Requests (Step 7) */}
            <Route
              path="/organizer/requests"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <OrganizerRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/organizer/requests"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <OrganizerRequestsPage />
                </ProtectedRoute>
              }
            />

            {/* Organizer Sponsorship Commitments (Step 8) */}
            <Route
              path="/organizer/requests/:requestId/commitment"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <CreateCommitmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/commitments"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <OrganizerCommitmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/organizer/commitments"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <OrganizerCommitmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/commitments/:id"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <CommitmentDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Organizer Analytics Routes (Step 9) */}
            <Route
              path="/organizer/analytics"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <OrganizerAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/organizer/analytics"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <OrganizerAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/events/:eventId/analytics"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <EventAnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* Sponsor Role-Protected Routes (Step 5, Step 6, Step 7) */}
            <Route
              path="/dashboard/sponsor"
              element={
                <ProtectedRoute allowedRoles={['SPONSOR']}>
                  <SponsorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sponsor/profile"
              element={
                <ProtectedRoute allowedRoles={['SPONSOR']}>
                  <SponsorProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/sponsor/profile"
              element={
                <ProtectedRoute allowedRoles={['SPONSOR']}>
                  <SponsorProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sponsor/discover"
              element={
                <ProtectedRoute allowedRoles={['SPONSOR']}>
                  <SponsorDiscoveryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/sponsor/discover"
              element={
                <ProtectedRoute allowedRoles={['SPONSOR']}>
                  <SponsorDiscoveryPage />
                </ProtectedRoute>
              }
            />

            {/* Sponsor AI Matches Hub (Step 6) */}
            <Route
              path="/sponsor/matches"
              element={
                <ProtectedRoute allowedRoles={['SPONSOR']}>
                  <SponsorMatchesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/sponsor/matches"
              element={
                <ProtectedRoute allowedRoles={['SPONSOR']}>
                  <SponsorMatchesPage />
                </ProtectedRoute>
              }
            />

            {/* Sponsor Request Routes (Step 7) */}
            <Route
              path="/sponsor/request/:packageId"
              element={
                <ProtectedRoute allowedRoles={['SPONSOR']}>
                  <CreateSponsorshipRequestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sponsor/requests"
              element={
                <ProtectedRoute allowedRoles={['SPONSOR']}>
                  <SponsorRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/sponsor/requests"
              element={
                <ProtectedRoute allowedRoles={['SPONSOR']}>
                  <SponsorRequestsPage />
                </ProtectedRoute>
              }
            />

            {/* Sponsor Commitments Routes (Step 8) */}
            <Route
              path="/sponsor/commitments"
              element={
                <ProtectedRoute allowedRoles={['SPONSOR']}>
                  <SponsorCommitmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/sponsor/commitments"
              element={
                <ProtectedRoute allowedRoles={['SPONSOR']}>
                  <SponsorCommitmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sponsor/commitments/:id"
              element={
                <ProtectedRoute allowedRoles={['SPONSOR']}>
                  <CommitmentDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Sponsor Analytics Routes (Step 9) */}
            <Route
              path="/sponsor/analytics"
              element={
                <ProtectedRoute allowedRoles={['SPONSOR']}>
                  <SponsorAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/sponsor/analytics"
              element={
                <ProtectedRoute allowedRoles={['SPONSOR']}>
                  <SponsorAnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Role-Protected Routes */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
