import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ASSETS } from '../../assets';
import {
  Building2,
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  Shield,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface InstituteSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** First-time registration of a new institute (cannot be dismissed). */
  required?: boolean;
}

export const InstituteSetupModal: React.FC<InstituteSetupModalProps> = ({ isOpen, onClose, required = false }) => {
  const { settings, updateSettings, registerInstitute, showToast, logout, currentUser } = useApp();

  const [instituteName, setInstituteName] = useState(settings.instituteName || '');
  const [instituteCode, setInstituteCode] = useState(settings.instituteCode || '');
  const [campusAddress, setCampusAddress] = useState(settings.campusAddress || '');
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(settings.contactPhone || '');
  const [hodName, setHodName] = useState(settings.hodName || '');
  const [isSaving, setIsSaving] = useState(false);

  // Uploaded media states (preview + the real file that will be stored)
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoUrl || null);
  const [logoBlob, setLogoBlob] = useState<Blob | null | undefined>(undefined);
  const [campusPhotoPreview, setCampusPhotoPreview] = useState<string | null>(settings.campusPhotoUrl || null);
  const [campusBlob, setCampusBlob] = useState<Blob | null | undefined>(undefined);

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const campusPhotoInputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    setInstituteName(settings.instituteName || '');
    setInstituteCode(settings.instituteCode || '');
    setCampusAddress(settings.campusAddress || '');
    setContactEmail(settings.contactEmail || '');
    setContactPhone(settings.contactPhone || '');
    setHodName(settings.hodName || '');
    setLogoPreview(settings.logoUrl || null);
    setCampusPhotoPreview(settings.campusPhotoUrl || null);
    setLogoBlob(undefined);
    setCampusBlob(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const readPreview = (file: Blob, set: (v: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => set(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Handle Logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file (PNG, JPG, SVG, WebP)', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast('Logo must be smaller than 10 MB', 'error');
        return;
      }
      setLogoBlob(file);
      readPreview(file, setLogoPreview);
    }
  };

  // Handle Campus Photograph upload
  const handleCampusPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file (JPG, PNG, WebP)', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast('Campus photograph must be smaller than 10 MB', 'error');
        return;
      }
      setCampusBlob(file);
      readPreview(file, setCampusPhotoPreview);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoBlob(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleRemoveCampusPhoto = () => {
    setCampusPhotoPreview(null);
    setCampusBlob(null);
    if (campusPhotoInputRef.current) campusPhotoInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!instituteName.trim()) {
      showToast('Please enter the real institute name', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (required) {
        if (!(logoBlob instanceof Blob)) {
          showToast('Please upload your official institute logo', 'error');
          return;
        }
        if (!(campusBlob instanceof Blob)) {
          showToast('Please upload a real campus photograph', 'error');
          return;
        }
        await registerInstitute({
          instituteName: instituteName.trim(),
          instituteCode: instituteCode.trim(),
          campusAddress: campusAddress.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
          hodName: hodName.trim() || 'Main Admin / HOD',
          logo: logoBlob,
          campusPhoto: campusBlob,
        });
        return;
      }

      const ok = await updateSettings(
        {
          instituteName: instituteName.trim(),
          instituteCode: instituteCode.trim(),
          campusAddress: campusAddress.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
          hodName: hodName.trim(),
        },
        {
          ...(logoBlob !== undefined ? { logo: logoBlob } : {}),
          ...(campusBlob !== undefined ? { campusPhoto: campusBlob } : {}),
        }
      );
      if (ok) onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#151C2B] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-[#101624] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Institute Registration & Official Setup
              </h3>
              <p className="text-[11px] text-slate-400">
                {required
                  ? `Welcome${currentUser?.name ? `, ${currentUser.name}` : ''}! Register your institute — you will become its Main Admin.`
                  : 'Configure authentic institution identity, upload real campus photography and official logo.'}
              </p>
            </div>
          </div>
          {!required && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(85vh-120px)] overflow-y-auto text-xs">
          {/* Institute Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-slate-300 font-semibold">
                Real Institute / University Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={instituteName}
                onChange={e => setInstituteName(e.target.value)}
                placeholder="e.g. Sunrise Institute of Technology"
                className="w-full px-3.5 py-2.5 bg-[#0D121F] text-white border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-semibold">Institute Code</label>
              <input
                type="text"
                value={instituteCode}
                onChange={e => setInstituteCode(e.target.value)}
                placeholder="e.g. SIT-01"
                className="w-full px-3.5 py-2.5 bg-[#0D121F] text-white border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Section: Real Institute Logo Upload */}
          <div className="p-4 bg-[#101624] border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-slate-200 font-bold">
                  Original Institute Logo {required && <span className="text-rose-400">*</span>}
                </label>
                <p className="text-[11px] text-slate-400">Upload your institute logo (PNG/SVG/JPG)</p>
              </div>
              {logoPreview && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Logo</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-700 bg-[#0D121F] flex items-center justify-center overflow-hidden shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="Institute Logo Preview" className="w-full h-full object-contain p-1" />
                ) : (
                  <Building2 className="w-6 h-6 text-slate-600" />
                )}
              </div>

              {/* Upload Action */}
              <div className="flex-1">
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                  id="institute-logo-upload"
                />
                <label
                  htmlFor="institute-logo-upload"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#1E273A] hover:bg-slate-700 text-slate-200 font-medium rounded-xl cursor-pointer border border-slate-700 transition-colors text-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span>{logoPreview ? 'Change Official Logo' : 'Upload Real Logo'}</span>
                </label>
                <span className="ml-3 text-[11px] text-slate-500">Square or circular emblem recommended</span>
              </div>
            </div>
          </div>

          {/* Section: Real Institute / Campus Photograph Upload */}
          <div className="p-4 bg-[#101624] border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-slate-200 font-bold">
                  Real Institute / Campus Photograph {required && <span className="text-rose-400">*</span>}
                </label>
                <p className="text-[11px] text-slate-400">
                  Upload an actual high-resolution campus photo or main entrance photograph
                </p>
              </div>
              <div className="flex items-center gap-2">
                {campusPhotoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveCampusPhoto}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Campus Photo Preview */}
            <div className="relative w-full h-36 rounded-xl border border-slate-700 overflow-hidden bg-[#0D121F] flex items-center justify-center">
              {campusPhotoPreview ? (
                <>
                  <img
                    src={campusPhotoPreview}
                    alt="Campus Photograph Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 text-[11px] text-white font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Real Institute Photograph Active</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 space-y-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <p className="text-slate-400 font-medium">No campus photograph uploaded</p>
                  <p className="text-[10px] text-slate-500">Only your real uploaded photograph will be displayed</p>
                </div>
              )}
            </div>

            <div>
              <input
                type="file"
                ref={campusPhotoInputRef}
                onChange={handleCampusPhotoUpload}
                accept="image/*"
                className="hidden"
                id="campus-photo-upload"
              />
              <label
                htmlFor="campus-photo-upload"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#1E273A] hover:bg-slate-700 text-slate-200 font-medium rounded-xl cursor-pointer border border-slate-700 transition-colors text-xs"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Real Campus Photograph</span>
              </label>
            </div>
          </div>

          {/* Address & Official Contact */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Real Campus Address</span>
              </label>
              <textarea
                rows={2}
                value={campusAddress}
                onChange={e => setCampusAddress(e.target.value)}
                placeholder="Full campus address"
                className="w-full px-3.5 py-2 bg-[#0D121F] text-white border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-xs resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>Official Contact Email</span>
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="office@yourinstitute.edu"
                  className="w-full px-3.5 py-2.5 bg-[#0D121F] text-white border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Official Contact Phone</span>
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="+91 512 258 0044"
                  className="w-full px-3.5 py-2.5 bg-[#0D121F] text-white border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Institutional Authority / Department Head Title</span>
              </label>
              <input
                type="text"
                value={hodName}
                onChange={e => setHodName(e.target.value)}
                placeholder="Department Head / Institutional Administrator"
                className="w-full px-3.5 py-2.5 bg-[#0D121F] text-white border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => (required ? void logout() : onClose())}
              className="px-4 py-2.5 text-slate-400 hover:text-white font-medium"
            >
              {required ? 'Sign Out' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{required ? 'Register Institute' : 'Save & Apply Institute Details'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
