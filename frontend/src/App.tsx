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
import { SponsorDashboard } from './pages/SponsorDashboard';
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

            {/* Sponsor Role-Protected Routes */}
            <Route
              path="/dashboard/sponsor"
              element={
                <ProtectedRoute allowedRoles={['SPONSOR']}>
                  <SponsorDashboard />
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
