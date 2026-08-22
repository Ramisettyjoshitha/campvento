import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ShieldCheck, LogOut, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { user, fullName, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/30 rounded-2xl p-8 shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {role} PORTAL
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                  RESTRICTED ACCESS
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Admin Control Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Administrator: {fullName || user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Session Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Authentication Session</span>
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Admin ID</span>
              <span className="text-slate-200 font-mono">{user?.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Email</span>
              <span className="text-slate-200 font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Full Name</span>
              <span className="text-slate-200 font-medium">{fullName || 'Not provided'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Assigned Role</span>
              <span className="text-purple-400 font-bold">{role}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Session Status</span>
              <span className="text-purple-400 font-semibold">Active (Admin Privileges)</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Step 3.4A Security Verification
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              This dashboard verifies that the <strong className="text-purple-400">ADMIN</strong> role authorization is locked down. Admin accounts cannot be self-registered via public forms and require controlled administrative assignment.
            </p>
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Public registration is restricted strictly to ORGANIZER and SPONSOR roles.</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            Platform governance and analytics controls will be linked in subsequent phases.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
