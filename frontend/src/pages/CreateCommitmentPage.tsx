import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  createCommitmentFromRequest,
  checkExistingCommitment,
} from '../lib/sponsorshipCommitments';
import { supabase } from '../lib/supabase';
import type { SponsorshipRequest } from '../lib/sponsorshipRequests';
import {
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Calendar,
  DollarSign,
  ArrowLeft,
  Building2,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

export const CreateCommitmentPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<SponsorshipRequest | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [existingCommitmentId, setExistingCommitmentId] = useState<string | null>(null);

  // Form state
  const [agreedAmount, setAgreedAmount] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) return;
    const load = async () => {
      setLoadingRequest(true);
      setRequestError(null);

      // Load the request with joined data
      const { data: req, error: reqErr } = await supabase
        .from('sponsorship_requests')
        .select(`
          id, sponsor_id, organizer_id, event_id, package_id,
          message, status, created_at,
          events (id, event_name, category, event_date, venue, status),
          sponsorship_packages (id, package_name, price, benefits, status)
        `)
        .eq('id', requestId)
        .single();

      if (reqErr || !req) {
        setRequestError('Sponsorship request not found or you are not authorized.');
        setLoadingRequest(false);
        return;
      }

      setRequest(req as unknown as SponsorshipRequest);

      // Pre-fill agreed amount from package price
      const price = (req as any).sponsorship_packages?.price;
      if (price !== undefined) {
        setAgreedAmount(String(price));
      }

      // Check if commitment already exists
      const { commitment } = await checkExistingCommitment(requestId);
      if (commitment) {
        setExistingCommitmentId(commitment.id);
      }

      setLoadingRequest(false);
    };
    load();
  }, [requestId]);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return d;
    }
  };

  const handleSubmit = async () => {
    if (!requestId) return;
    setSubmitting(true);
    setSubmitError(null);

    const amount = parseFloat(agreedAmount);
    if (isNaN(amount) || amount < 0) {
      setSubmitError('Please enter a valid non-negative agreed amount.');
      setSubmitting(false);
      return;
    }

    const res = await createCommitmentFromRequest(requestId, {
      agreed_amount: amount,
      commitment_start_date: startDate || null,
      commitment_end_date: endDate || null,
      notes: notes.trim() || null,
    });

    setSubmitting(false);
    if (res.error) {
      setSubmitError(res.error);
      setShowConfirm(false);
    } else {
      navigate('/organizer/commitments');
    }
  };

  if (loadingRequest) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-xs">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (requestError) {
    return (
      <div className="flex-1 max-w-2xl mx-auto px-6 py-12 w-full">
        <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Request Not Found</h2>
          <p className="text-xs text-rose-300">{requestError}</p>
          <Link
            to="/organizer/requests"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Requests
          </Link>
        </div>
      </div>
    );
  }

  if (!request) return null;

  if (request.status !== 'ACCEPTED') {
    return (
      <div className="flex-1 max-w-2xl mx-auto px-6 py-12 w-full">
        <div className="p-8 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Cannot Create Commitment</h2>
          <p className="text-sm text-amber-300">
            This sponsorship request cannot be converted into a commitment.
          </p>
          <p className="text-xs text-slate-400">
            Only <strong className="text-emerald-400">ACCEPTED</strong> requests may become
            commitments. Current status:{' '}
            <span className="font-bold text-amber-400">{request.status}</span>
          </p>
          <Link
            to="/organizer/requests"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Requests
          </Link>
        </div>
      </div>
    );
  }

  if (existingCommitmentId) {
    return (
      <div className="flex-1 max-w-2xl mx-auto px-6 py-12 w-full">
        <div className="p-8 rounded-3xl bg-blue-500/10 border border-blue-500/30 text-center space-y-4">
          <CheckCircle2 className="w-10 h-10 text-blue-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Commitment Already Exists</h2>
          <p className="text-xs text-slate-400">
            A commitment has already been created for this request.
          </p>
          <Link
            to={`/organizer/commitments/${existingCommitmentId}`}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all"
          >
            <span>View Commitment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const pkg = (request as any).sponsorship_packages;
  const evt = (request as any).events;

  return (
    <div className="flex-1 max-w-3xl mx-auto px-6 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              STEP 8
            </span>
            <span className="text-xs text-slate-400">Organizer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create Sponsorship Commitment
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Converting an accepted interest request into a structured commitment.
          </p>
        </div>
        <Link
          to="/organizer/requests"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Requests
        </Link>
      </div>

      {/* Request Summary */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/20 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>Accepted Request Details</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block mb-1">Event</span>
            <span className="text-white font-semibold">{evt?.event_name || '—'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block mb-1">Category</span>
            <span className="text-slate-200 font-medium">{evt?.category || '—'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block mb-1">Event Date</span>
            <span className="text-slate-200 font-medium">
              {evt?.event_date ? formatDate(evt.event_date) : 'TBA'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block mb-1">Package Tier</span>
            <span className="text-white font-semibold">{pkg?.package_name || '—'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block mb-1">Package List Price</span>
            <span className="text-emerald-400 font-bold">
              ${pkg?.price?.toLocaleString() ?? '0'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block mb-1">Sponsor Partner</span>
            <span className="text-slate-200 font-medium flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Verified Sponsor</span>
            </span>
          </div>
        </div>

        {request.message && (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Sponsor's Note:
            </span>
            <p className="text-slate-300 italic leading-relaxed">&ldquo;{request.message}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Commitment Form */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          Commitment Terms
        </h2>

        {submitError && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-xs">{submitError}</p>
          </div>
        )}

        {/* Agreed Amount */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Agreed Sponsorship Amount *
          </label>
          <p className="text-[11px] text-slate-500">
            Package list price: ${pkg?.price?.toLocaleString() ?? '0'}. You may negotiate a
            different amount.
          </p>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
            <input
              type="number"
              min="0"
              step="0.01"
              value={agreedAmount}
              onChange={(e) => setAgreedAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Commitment Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Commitment End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Commitment Notes <span className="text-slate-500">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Any additional notes or terms for this commitment..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-colors resize-none placeholder:text-slate-600"
          />
          <p className="text-[10px] text-slate-600 text-right">{notes.length}/1000</p>
        </div>

        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={!agreedAmount || parseFloat(agreedAmount) < 0}
          className="w-full py-3 rounded-2xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-emerald-600/30 transition-all"
        >
          Create Commitment
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Create Sponsorship Commitment?</h3>
                <p className="text-xs text-slate-400 mt-0.5">This will formalize the sponsorship agreement</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Event:</span>
                <span className="font-semibold text-white truncate max-w-[200px]">{evt?.event_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Package:</span>
                <span className="font-semibold text-emerald-400">{pkg?.package_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Agreed Amount:</span>
                <span className="font-bold text-emerald-400">
                  ${parseFloat(agreedAmount || '0').toLocaleString()}
                </span>
              </div>
              {startDate && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Start Date:</span>
                  <span className="text-white">{formatDate(startDate)}</span>
                </div>
              )}
              {endDate && (
                <div className="flex justify-between">
                  <span className="text-slate-400">End Date:</span>
                  <span className="text-white">{formatDate(endDate)}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Once created, this commitment will be visible to the sponsor in their commitments
              dashboard. The agreed amount and dates can be updated later.
            </p>

            {submitError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {submitError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/30 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Creation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCommitmentPage;

