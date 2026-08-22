import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
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

            {/* Role-Protected Routes */}
            <Route
              path="/dashboard/organizer"
              element={
                <ProtectedRoute allowedRoles={['ORGANIZER']}>
                  <OrganizerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/sponsor"
              element={
                <ProtectedRoute allowedRoles={['SPONSOR']}>
                  <SponsorDashboard />
                </ProtectedRoute>
              }
            />

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
