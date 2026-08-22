import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getPackageById,
  updateSponsorshipPackage,
} from '../lib/sponsorshipPackages';
import type { SponsorshipPackageStatus } from '../lib/sponsorshipPackages';
import {
  Package,
  Tag,
  DollarSign,
  Users,
  FileText,
  Star,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Save,
} from 'lucide-react';

export const EditSponsorshipPackagePage: React.FC = () => {
  const { eventId, packageId } = useParams<{ eventId: string; packageId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editable fields only
  const [packageName, setPackageName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('0');
  const [benefits, setBenefits] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string>('1');
  const [status, setStatus] = useState<SponsorshipPackageStatus>('ACTIVE');

  useEffect(() => {
    const fetchPkg = async () => {
      if (!packageId) return;
      setLoading(true);
      const { data, error: fetchErr } = await getPackageById(packageId);
      if (fetchErr) {
        setError(fetchErr);
      } else if (data) {
        setPackageName(data.package_name);
        setDescription(data.description ?? '');
        setPrice(String(data.price));
        setBenefits(data.benefits ?? '');
        setAvailableSlots(String(data.available_slots));
        setStatus(data.status);
      }
      setLoading(false);
    };
    fetchPkg();
  }, [packageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!packageName.trim()) {
      setError('Package name is required.');
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Price must be zero or a positive number.');
      return;
    }
    const parsedSlots = parseInt(availableSlots, 10);
    if (isNaN(parsedSlots) || parsedSlots < 0) {
      setError('Available slots must be zero or a positive integer.');
      return;
    }

    if (!packageId) return;
    setSaving(true);
    try {
      const { data, error: updateErr } = await updateSponsorshipPackage(packageId, {
        package_name: packageName.trim(),
        description: description.trim() || undefined,
        price: parsedPrice,
        benefits: benefits.trim() || undefined,
        available_slots: parsedSlots,
        status,
      });

      if (updateErr) {
        setError(updateErr);
      } else if (data) {
        setSuccess('Package updated successfully!');
        setTimeout(() => {
          navigate(`/organizer/events/${eventId}/packages`);
        }, 600);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update package.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
        <p className="text-sm text-slate-400">Loading package details...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
      {/* Breadcrumb */}
      <Link
        to={`/organizer/events/${eventId}/packages`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Sponsorship Packages</span>
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-r from-violet-950/40 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl mb-8 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
          <Package className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Edit Sponsorship Package</h1>
          <p className="text-xs text-slate-400 mt-1">
            Update package details, pricing, available slots, and status.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Package Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Package Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  required
                  placeholder="e.g. Gold Sponsor"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Price ($) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
              </div>
            </div>

            {/* Available Slots */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Available Slots <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="number"
                  min={0}
                  value={availableSlots}
                  onChange={(e) => setAvailableSlots(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
              </div>
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Package Status
              </label>
              <div className="flex items-center gap-3">
                {(['ACTIVE', 'INACTIVE'] as SponsorshipPackageStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      status === s
                        ? s === 'ACTIVE'
                          ? 'bg-emerald-600/20 border-emerald-500/60 text-emerald-300'
                          : 'bg-slate-700/40 border-slate-600 text-slate-300'
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Package Description
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this tier include?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Benefits */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Sponsor Benefits
              </label>
              <div className="relative">
                <Star className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <textarea
                  rows={3}
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="e.g. Banner placement, social posts, booth space..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
            <Link
              to={`/organizer/events/${eventId}/packages`}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSponsorshipPackagePage;
