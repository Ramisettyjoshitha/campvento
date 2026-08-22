import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  getPackagesForEvent,
  deleteSponsorshipPackage,
} from '../lib/sponsorshipPackages';
import type { SponsorshipPackage } from '../lib/sponsorshipPackages';
import { getEventById } from '../lib/events';
import type { EventItem } from '../lib/events';
import {
  Package,
  PlusCircle,
  Edit3,
  Trash2,
  DollarSign,
  Users,
  Star,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const SponsorshipPackagesPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();

  const [packages, setPackages] = useState<SponsorshipPackage[]>([]);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);

    const [pkgResult, eventResult] = await Promise.all([
      getPackagesForEvent(eventId),
      getEventById(eventId),
    ]);

    if (pkgResult.error) setError(pkgResult.error);
    else setPackages(pkgResult.data ?? []);

    if (eventResult.data) setEvent(eventResult.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    const { success, error: deleteErr } = await deleteSponsorshipPackage(id);
    if (!success) {
      setError(deleteErr ?? 'Failed to delete package.');
    } else {
      setPackages((prev) => prev.filter((p) => p.id !== id));
      setDeleteTargetId(null);
    }
    setDeleting(false);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ACTIVE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-600/30 text-slate-400 border border-slate-600/40">
        INACTIVE
      </span>
    );
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
      {/* Breadcrumb */}
      <Link
        to="/organizer/events"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to My Events</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">
              SPONSORSHIP PACKAGES
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {event ? `${event.event_name}` : 'Sponsorship Packages'}
          </h1>
          {event && (
            <p className="text-xs text-slate-400 mt-1">
              {event.event_date} · {event.category}
            </p>
          )}
        </div>

        <Link
          to={`/organizer/events/${eventId}/packages/new`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/25 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Package</span>
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
          <p className="text-sm text-slate-400">Loading sponsorship packages...</p>
        </div>
      ) : packages.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16 px-6 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            No sponsorship packages yet. Create your first sponsorship opportunity.
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            Define tiers like Gold, Silver, or Title Sponsor to attract sponsors for your event.
          </p>
          <Link
            to={`/organizer/events/${eventId}/packages/new`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Package</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-xl group"
            >
              <div>
                {/* Top: Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  {getStatusBadge(pkg.status)}
                  {pkg.available_slots === 0 && (
                    <span className="text-[11px] text-rose-400 font-medium">Sold Out</span>
                  )}
                </div>

                {/* Package Name */}
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                  {pkg.package_name}
                </h3>

                {/* Description */}
                {pkg.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{pkg.description}</p>
                )}

                {/* Meta */}
                <div className="space-y-2 text-xs my-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <DollarSign className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-white font-semibold text-sm">
                        ${pkg.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{pkg.available_slots} slot{pkg.available_slots !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {pkg.benefits && (
                    <div className="flex items-start gap-1.5 text-slate-400 pt-2">
                      <Star className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <p className="line-clamp-2 text-slate-300">{pkg.benefits}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <Link
                  to={`/organizer/events/${eventId}/packages/${pkg.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors border border-slate-700/50"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Link>

                <button
                  onClick={() => setDeleteTargetId(pkg.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Package"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Delete this package?</h4>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to permanently delete this sponsorship package? This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                disabled={deleting}
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={() => handleDelete(deleteTargetId)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/25 transition-all disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorshipPackagesPage;
