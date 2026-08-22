import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldX, ArrowRight, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const { user, role, getDashboardPath } = useAuth();

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Background glowing alert */}
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center relative z-10 bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6">
          <ShieldX className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          You do not have the required permissions to access this page. Your account is assigned the{' '}
          <strong className="text-indigo-400 font-semibold">{role || 'GUEST'}</strong> role.
        </p>

        <div className="flex flex-col gap-3">
          {user ? (
            <Link
              to={getDashboardPath(role)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/25"
            >
              <span>Return to {role} Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              <span>Sign In with Authorized Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
