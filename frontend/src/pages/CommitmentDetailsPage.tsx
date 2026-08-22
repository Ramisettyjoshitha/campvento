import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  getCommitmentById,
  updateCommitment,
  updateCommitmentStatus,
} from '../lib/sponsorshipCommitments';
import type { SponsorshipCommitment } from '../lib/sponsorshipCommitments';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  HelpCircle,
  Save,
  Check,
  X,
} from 'lucide-react';

export const CommitmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { role } = useAuth();
  const isOrganizer = role === 'ORGANIZER' || location.pathname.startsWith('/organizer/');

  const [commitment, setCommitment] = useState<SponsorshipCommitment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit state (organizer only)
  const [editing, setEditing] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Status transition state (organizer only)
  const [statusAction, setStatusAction] = useState<'COMPLETED' | 'CANCELLED' | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const res = await getCommitmentById(id);
    if (res.error || !res.data) {
      setError(res.error || 'Commitment not found.');
    } else {
      setCommitment(res.data);
      setEditAmount(String(res.data.agreed_amount));
      setEditStart(res.data.commitment_start_date || '');
      setEditEnd(res.data.commitment_end_date || '');
      setEditNotes(res.data.notes || '');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setSaveError(null);
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount < 0) {
      setSaveError('Agreed amount must be a non-negative number.');
      setSaving(false);
      return;
    }
    const res = await updateCommitment(id, {
      agreed_amount: amount,
      commitment_start_date: editStart || null,
      commitment_end_date: editEnd || null,
      notes: editNotes.trim() || null,
    });
    setSaving(false);
    if (res.error) {
      setSaveError(res.error);
    } else {
      setCommitment(res.data);
      setEditing(false);
      setSuccessMessage('Commitment updated successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleStatusTransition = async () => {
    if (!id || !statusAction) return;
    setTransitioning(true);
    const res = await updateCommitmentStatus(id, statusAction);
    setTransitioning(false);
    if (res.error) {
      setError(res.error);
    } else {
      setCommitment(res.data);
      setSuccessMessage(statusAction === 'COMPLETED' ? 'Commitment marked as completed.' : 'Commitment cancelled.');
      setTimeout(() => setSuccessMessage(null), 4000);
    }
    setStatusAction(null);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <Clock className="w-3.5 h-3.5 animate-pulse" /> ACTIVE
        </span>
      );
      case 'COMPLETED': return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED
        </span>
      );
      case 'CANCELLED': return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
          <XCircle className="w-3.5 h-3.5" /> CANCELLED
        </span>
      );
      default: return null;
    }
  };

  const backPath = isOrganizer ? '/organizer/commitments' : '/sponsor/commitments';

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-xs">Loading commitment details...</p>
        </div>
      </div>
    );
  }

  if (error || !commitment) {
    return (
      <div className="flex-1 max-w-2xl mx-auto px-6 py-12 w-full">
        <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Commitment Not Found</h2>
          <p className="text-xs text-rose-300">{error || 'This commitment could not be loaded.'}</p>
          <Link to={backPath} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Commitments
          </Link>
        </div>
      </div>
    );
  }

  const pkg = commitment.sponsorship_packages;
  const evt = commitment.events;
  const isActive = commitment.status === 'ACTIVE';

  return (
    <div className="flex-1 max-w-3xl mx-auto px-6 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${isOrganizer ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-blue-500/20 text-blue-300 border-blue-500/40'}`}>
              {isOrganizer ? 'ORGANIZER' : 'SPONSOR'} VIEW
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Commitment Details</h1>
          <p className="text-xs text-slate-400 mt-1">{evt?.event_name || 'Campus Event'}</p>
        </div>
        <div className="flex items-center gap-3">
          {renderStatusBadge(commitment.status)}
          <Link to={backPath} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
        </div>
      </div>

      {/* Toasts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <p className="text-xs font-medium">{successMessage}</p>
        </div>
      )}

      {/* Event & Package Summary (immutable) */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Event & Package</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block mb-1">Event</span>
            <span className="text-white font-semibold">{evt?.event_name || '—'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block mb-1">Category</span>
            <span className="text-slate-200">{evt?.category || '—'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block mb-1">Event Date</span>
            <span className="text-slate-200">{evt?.event_date ? formatDate(evt.event_date) : 'TBA'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block mb-1">Package Tier</span>
            <span className="text-white font-semibold">{pkg?.package_name || '—'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block mb-1">Package List Price</span>
            <span className="text-slate-300 font-medium">${pkg?.price?.toLocaleString() ?? '0'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block mb-1">Created</span>
            <span className="text-slate-300">{formatDate(commitment.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Commitment Terms */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Commitment Terms
          </h2>
          {isOrganizer && isActive && !editing && (
            <button
              type="button"
              onClick={() => { setEditing(true); setSaveError(null); }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors"
            >
              Edit Terms
            </button>
          )}
        </div>

        {saveError && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {saveError}
          </div>
        )}

        {/* Agreed Amount */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 block">Agreed Sponsorship Amount</label>
          {editing ? (
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
              <input
                type="number" min="0" step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
              />
            </div>
          ) : (
            <p className="text-2xl font-black text-emerald-400">${Number(commitment.agreed_amount).toLocaleString()}</p>
          )}
        </div>

        {/* Dates */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">
              <Calendar className="w-3.5 h-3.5 inline-block mr-1" />Start Date
            </label>
            {editing ? (
              <input type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
              />
            ) : (
              <p className="text-sm text-slate-200 font-medium">{formatDate(commitment.commitment_start_date)}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">
              <Calendar className="w-3.5 h-3.5 inline-block mr-1" />End Date
            </label>
            {editing ? (
              <input type="date" value={editEnd} min={editStart || undefined} onChange={(e) => setEditEnd(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
              />
            ) : (
              <p className="text-sm text-slate-200 font-medium">{formatDate(commitment.commitment_end_date)}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 block">Notes</label>
          {editing ? (
            <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
              rows={3} maxLength={1000}
              placeholder="Any additional terms or notes..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-colors resize-none placeholder:text-slate-600"
            />
          ) : (
            <p className="text-sm text-slate-300 leading-relaxed">{commitment.notes || <span className="text-slate-500 italic">No notes provided.</span>}</p>
          )}
        </div>

        {/* Edit actions */}
        {editing && (
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button type="button" onClick={() => { setEditing(false); setSaveError(null); setEditAmount(String(commitment.agreed_amount)); setEditStart(commitment.commitment_start_date || ''); setEditEnd(commitment.commitment_end_date || ''); setEditNotes(commitment.notes || ''); }} disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/30 disabled:opacity-50">
              {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Saving...</span></> : <><Save className="w-3.5 h-3.5" /><span>Save Changes</span></>}
            </button>
          </div>
        )}

        {/* Sponsor read-only note */}
        {!isOrganizer && (
          <p className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-800">
            Commitment terms are managed by the organizer. Contact them through your request if you have questions.
          </p>
        )}
      </div>

      {/* Status Transition (organizer + ACTIVE only) */}
      {isOrganizer && isActive && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Status Management</h2>
          <p className="text-xs text-slate-400">
            ACTIVE commitments can be marked as completed or cancelled. These transitions are permanent.
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setStatusAction('CANCELLED')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors">
              <X className="w-3.5 h-3.5" /> Cancel Commitment
            </button>
            <button type="button" onClick={() => setStatusAction('COMPLETED')}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 transition-all">
              <Check className="w-3.5 h-3.5" /> Mark Completed
            </button>
          </div>
        </div>
      )}

      {/* Last updated */}
      <p className="text-[11px] text-slate-600 text-center">
        Last updated: {formatDate(commitment.updated_at)}
      </p>

      {/* Status Transition Confirmation */}
      {statusAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${statusAction === 'COMPLETED' ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400' : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'}`}>
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {statusAction === 'COMPLETED' ? 'Mark Commitment Completed?' : 'Cancel Commitment?'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">This action is permanent and cannot be reversed.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => setStatusAction(null)} disabled={transitioning}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
                Go Back
              </button>
              <button type="button" onClick={handleStatusTransition} disabled={transitioning}
                className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-md disabled:opacity-50 ${statusAction === 'COMPLETED' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'}`}>
                {transitioning ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Updating...</span></> :
                  statusAction === 'COMPLETED' ? <><Check className="w-3.5 h-3.5" /><span>Confirm Completion</span></> :
                  <><X className="w-3.5 h-3.5" /><span>Confirm Cancellation</span></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitmentDetailsPage;

