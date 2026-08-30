import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Building,
  User,
  Phone,
  Mail,
  Briefcase,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  MapPin,
  Clock,
  Plus,
  Trash2,
  CreditCard,
  Globe,
  Loader2,
  ArrowRight,
  Upload,
  UploadCloud,
  Tag,
  KeyRound,
  UserCheck,
} from 'lucide-react';
import { Business, BusinessClaim, EstateZone, OperationType } from '../../types';
import { saveBusinessClaim, saveCustomizedBusiness, generateBusinessSlug } from '../../lib/supabase';
import { registerMerchantAccount } from '../../lib/merchantAuth';
import { Button } from '../ui/Button';

interface ClaimBusinessModalProps {
  business: Business;
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess: (updatedBusiness: Business, claim: BusinessClaim) => void;
}

export const ClaimBusinessModal: React.FC<ClaimBusinessModalProps> = ({
  business,
  isOpen,
  onClose,
  onClaimSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'claimant' | 'customize'>('claimant');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMode, setSuccessMode] = useState(false);

  // Claimant form state (Matches Supabase 'claims' table: business_id, full_name, phone_number, email, business_role, status, created_at)
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(business.phone || '');
  const [email, setEmail] = useState(business.email || '');
  const [businessRole, setBusinessRole] = useState<'Owner' | 'Manager' | 'Authorized Representative' | 'Partner' | 'Agent / Listing on Behalf of Owner'>('Owner');
  const [isListingOnBehalf, setIsListingOnBehalf] = useState(false);
  const [ownerFullName, setOwnerFullName] = useState('');
  const [ownerPhoneNumber, setOwnerPhoneNumber] = useState('');
  const [merchantPin, setMerchantPin] = useState('1234');
  const [notes, setNotes] = useState('');

  // Business customization state (5 Photos, contacts, Lipa na M-Pesa, etc.)
  const [customName, setCustomName] = useState(business.name);
  const [customTagline, setCustomTagline] = useState(business.tagline);
  const [customOperationType, setCustomOperationType] = useState<OperationType>(business.operationType || 'physical_shop');
  const [customPhone, setCustomPhone] = useState(business.phone);
  const [customWhatsapp, setCustomWhatsapp] = useState(business.whatsapp);
  const [customEmail, setCustomEmail] = useState(business.email || '');
  const [customZone, setCustomZone] = useState<EstateZone>(business.zone);
  const [customLandmark, setCustomLandmark] = useState(business.landmark);
  const [customDescription, setCustomDescription] = useState(business.description);
  const [servicesList, setServicesList] = useState<string[]>(business.services || []);
  const [newServiceInput, setNewServiceInput] = useState('');

  // 5 Photos array
  const [photos, setPhotos] = useState<string[]>(
    business.galleryImages && business.galleryImages.length >= 5
      ? business.galleryImages.slice(0, 5)
      : [
          business.heroImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
        ]
  );

  // M-Pesa state
  const [mpesaType, setMpesaType] = useState<'Till' | 'Paybill' | 'Pochi la Biashara' | 'Send Money'>(
    business.mpesa?.type || 'Till'
  );
  const [mpesaNumber, setMpesaNumber] = useState(business.mpesa?.number || '');
  const [mpesaAccountName, setMpesaAccountName] = useState(business.mpesa?.accountName || '');
  const [mpesaAccNumber, setMpesaAccNumber] = useState(business.mpesa?.accountNumber || '');

  // Social Links & Website
  const [website, setWebsite] = useState(business.socialLinks?.website || '');
  const [facebook, setFacebook] = useState(business.socialLinks?.facebook || '');
  const [instagram, setInstagram] = useState(business.socialLinks?.instagram || '');
  const [tiktok, setTiktok] = useState(business.socialLinks?.tiktok || '');

  // Special Offer
  const [offerTitle, setOfferTitle] = useState(business.specialOffer?.title || '');
  const [offerDescription, setOfferDescription] = useState(business.specialOffer?.description || '');

  if (!isOpen) return null;

  const handleAddService = () => {
    if (newServiceInput.trim()) {
      setServicesList([...servicesList, newServiceInput.trim()]);
      setNewServiceInput('');
    }
  };

  const handleRemoveService = (idx: number) => {
    setServicesList(servicesList.filter((_, i) => i !== idx));
  };

  const handlePhotoChange = (index: number, url: string) => {
    const updated = [...photos];
    updated[index] = url;
    setPhotos(updated);
  };

  const compressAndReadFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDeviceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const updatedPhotos = [...photos];
      const maxToLoad = Math.min(files.length, 5);

      for (let i = 0; i < maxToLoad; i++) {
        const dataUrl = await compressAndReadFile(files[i]);
        updatedPhotos[i] = dataUrl;
      }
      setPhotos(updatedPhotos);
    } catch (err) {
      console.error('Error reading files:', err);
      alert('Could not process selected image files.');
    }
  };

  const handleSingleSlotUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const dataUrl = await compressAndReadFile(files[0]);
      handlePhotoChange(index, dataUrl);
    } catch (err) {
      console.error('Error reading file for slot:', err);
      alert('Could not process selected image file.');
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber || !email) {
      alert('Please fill in your name, contact phone number, and email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Prepare Claim record matching Supabase schema
      const effectiveRole = isListingOnBehalf ? 'Listing on Behalf of Owner' : businessRole;
      const claimRecord: BusinessClaim = {
        business_id: business.id,
        business_name: customName || business.name,
        full_name: fullName,
        phone_number: phoneNumber,
        email: email,
        business_role: effectiveRole,
        status: 'verified', // Instant verification for active editing & live preview
        notes: isListingOnBehalf
          ? `[On Behalf of Owner: ${ownerFullName} (${ownerPhoneNumber})] ${notes}`
          : notes,
        created_at: new Date().toISOString(),
      };

      // 2. Register Merchant Account PIN & Device Session
      registerMerchantAccount({
        businessId: business.id,
        businessName: customName || business.name,
        pin: merchantPin || '1234',
        phone: phoneNumber,
        applicantName: fullName,
        role: effectiveRole,
        isListingOnBehalf,
        ownerName: isListingOnBehalf ? ownerFullName : undefined,
        ownerPhone: isListingOnBehalf ? ownerPhoneNumber : undefined,
      });

      // 3. Prepare Updated Business Record
      const newSlug = customName ? generateBusinessSlug(customName) : business.slug;
      const updatedBusinessRecord: Business = {
        ...business,
        slug: newSlug,
        name: customName,
        tagline: customTagline,
        operationType: customOperationType,
        phone: customPhone,
        whatsapp: customWhatsapp.replace(/[^0-9]/g, ''),
        email: customEmail,
        zone: customZone,
        landmark: customLandmark,
        description: customDescription,
        services: servicesList,
        isVerified: true,
        isClaimed: true,
        claimedBy: isListingOnBehalf
          ? `${fullName} (On Behalf of ${ownerFullName || 'Owner'})`
          : `${fullName} (${businessRole})`,
        claimedAt: new Date().toISOString().split('T')[0],
        heroImage: photos[0] || business.heroImage,
        galleryImages: photos,
        mpesa: mpesaNumber
          ? {
              type: mpesaType,
              number: mpesaNumber,
              accountName: mpesaAccountName || (customName || business.name || '').toUpperCase(),
              accountNumber: mpesaAccNumber || undefined,
            }
          : undefined,
        socialLinks: {
          website: website ? (website.startsWith('http') ? website : `https://${website}`) : undefined,
          facebook: facebook || undefined,
          instagram: instagram || undefined,
          tiktok: tiktok || undefined,
        },
        specialOffer: offerTitle
          ? {
              title: offerTitle,
              description: offerDescription,
              badgeText: 'Resident Deal',
            }
          : undefined,
        updatedAt: new Date().toISOString(),
      };

      // 3. Persist to Supabase and local storage
      await saveBusinessClaim(claimRecord);
      await saveCustomizedBusiness(updatedBusinessRecord);

      setSuccessMode(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onClaimSuccess(updatedBusinessRecord, claimRecord);
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert('An error occurred while saving your claim. Please try again.');
    }
  };

  const zones: EstateZone[] = [
    'Congo',
    'Roundabout',
    'Jacaranda Estate',
    'Jubilee Estate',
    'Northern Bypass',
    'Kware / Quarry',
    'Bima Road',
    'Soweto',
    'Kamae',
    'Station / Railway',
    'Mahiga',
    'Kamiti Road',
    'Kiamumbi Border',
  ];

  return (
    <div
      id="claim-business-modal"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#630303] text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-rose-200 block truncate">
                Claim & Edit Business Listing
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white truncate">
                Claim {business.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-[#4D0202] hover:bg-[#3B0202] text-stone-200 hover:text-white transition shrink-0 ml-2"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector (Equal 2 Columns, No Horizontal Scroll / Overflow) */}
        <div className="grid grid-cols-2 border-b border-stone-200 bg-stone-50 px-2 sm:px-6 pt-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('claimant')}
            className={`pb-2.5 pt-1 px-2 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center justify-center gap-1.5 sm:gap-2 text-center truncate ${
              activeTab === 'claimant'
                ? 'border-[#630303] text-[#630303] bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">1. Claimant Info</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customize')}
            className={`pb-2.5 pt-1 px-2 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center justify-center gap-1.5 sm:gap-2 text-center truncate ${
              activeTab === 'customize'
                ? 'border-[#630303] text-[#630303] bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">2. Photos & Details</span>
          </button>
        </div>

        {/* Form Body */}
        {successMode ? (
          <div className="p-6 sm:p-12 text-center my-auto min-w-0">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Claim & Updates Saved!</h3>
            <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto mb-4">
              Your claim record has been recorded and <strong>{customName}</strong> is now verified with your customized contacts, 5 photos, and Lipa na M-Pesa details.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> Live on KWEST Directory
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitClaim} className="overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-5 flex-1 min-w-0 max-w-full">
            {activeTab === 'claimant' ? (
              <div className="space-y-4 min-w-0">
                <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs sm:text-sm leading-relaxed">
                  <span className="font-bold block mb-1">Verify your relationship to this business:</span>
                  Fill in your details below. Once submitted, your claim record is recorded and you gain verified management control over this listing.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 min-w-0">
                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. John Mwangi Kinyua"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Your Business Role *
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <select
                        value={businessRole}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setBusinessRole(val);
                          if (val === 'Agent / Listing on Behalf of Owner') {
                            setIsListingOnBehalf(true);
                          }
                        }}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm bg-white"
                      >
                        <option value="Owner">Owner / Proprietor</option>
                        <option value="Manager">General Manager</option>
                        <option value="Authorized Representative">Authorized Representative</option>
                        <option value="Partner">Business Partner</option>
                        <option value="Agent / Listing on Behalf of Owner">Agent / Listing on Behalf of Owner</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Listing on Behalf of Owner Toggle & Fields */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 min-w-0">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isListingOnBehalf}
                      onChange={(e) => setIsListingOnBehalf(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 shrink-0"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      I am claiming / managing this listing on behalf of the business owner
                    </span>
                  </label>

                  {isListingOnBehalf && (
                    <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn min-w-0">
                      <div className="min-w-0">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Owner's Full Name *
                        </label>
                        <input
                          type="text"
                          required={isListingOnBehalf}
                          value={ownerFullName}
                          onChange={(e) => setOwnerFullName(e.target.value)}
                          placeholder="e.g. Mama Mary Wanjiku"
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div className="min-w-0">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Owner's Phone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required={isListingOnBehalf}
                          value={ownerPhoneNumber}
                          onChange={(e) => setOwnerPhoneNumber(e.target.value)}
                          placeholder="0712 345 678"
                          className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 min-w-0">
                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Verification Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+2547..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Official Contact Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="owner@gmail.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* 4-Digit Security PIN Setup */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-900 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                    <label className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Create 4-Digit Merchant Security PIN *
                    </label>
                  </div>
                  <p className="text-[11px] text-amber-800 mb-2.5">
                    Use this 4-digit code to securely log in from any phone or device to update contact info, photos, and manage deals.
                  </p>
                  <div className="max-w-xs">
                    <input
                      type="password"
                      maxLength={6}
                      required
                      value={merchantPin}
                      onChange={(e) => setMerchantPin(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full p-2.5 rounded-xl border border-amber-300 bg-white font-mono text-center tracking-[0.3em] text-lg font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Verification Notes / M-Pesa Till Ownership Proof (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Registered owner of Till 584920, shop located opposite Congo Stage Shell."
                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('customize')}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 active:scale-[0.99] shadow-sm"
                  >
                    <span>Proceed to Customize 5 Photos & Contacts</span>
                    <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 min-w-0">
                {/* 5 Photos Section */}
                <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5 pb-3 border-b border-slate-200 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-emerald-600 shrink-0" />
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          5 Business Photos (Hero + Gallery)
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Upload directly from your smartphone camera or gallery. Photo #1 is the primary cover image.
                      </p>
                    </div>

                    <label className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs cursor-pointer transition shadow-sm shrink-0">
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload All from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleDeviceFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Responsive photo cards: 2 columns on mobile, 5 on desktop */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 min-w-0">
                    {photos.map((photoUrl, idx) => {
                      const displayPhoto =
                        photoUrl && photoUrl.trim() !== ''
                          ? photoUrl
                          : 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
                      return (
                        <div
                          key={idx}
                          className={`space-y-1.5 bg-white p-2 rounded-xl border border-slate-200 shadow-xs min-w-0 flex flex-col ${
                            idx === 0 ? 'col-span-2 sm:col-span-1' : 'col-span-1'
                          }`}
                        >
                          <div className="relative h-24 sm:h-24 rounded-lg overflow-hidden border border-slate-300 bg-slate-100 group w-full">
                            <img
                              src={displayPhoto}
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${idx === 0 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-black/70 text-white'}`}>
                              {idx === 0 ? '★ Primary' : `#${idx + 1}`}
                            </span>

                            <label className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 cursor-pointer transition-opacity duration-200">
                              <Upload className="w-4 h-4" />
                              <span className="text-[10px] font-bold">Replace</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSingleSlotUpload(idx, e)}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <label className="block w-full text-center py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] cursor-pointer transition border border-slate-300">
                            <span>Choose File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSingleSlotUpload(idx, e)}
                              className="hidden"
                            />
                          </label>

                          <input
                            type="text"
                            value={photoUrl.startsWith('data:') ? '[Device Photo Loaded]' : photoUrl}
                            onChange={(e) => {
                              if (!e.target.value.includes('[Device Photo Loaded]')) {
                                handlePhotoChange(idx, e.target.value);
                              }
                            }}
                            placeholder="Image URL"
                            className="w-full p-1 text-[10px] font-mono text-slate-600 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate"
                            title={photoUrl.startsWith('data:') ? 'Image uploaded from device' : photoUrl}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Core Business Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 min-w-0">
                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Business Display Name
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Operating Model / Setup
                    </label>
                    <select
                      value={customOperationType}
                      onChange={(e) => setCustomOperationType(e.target.value as OperationType)}
                      className="w-full p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm font-semibold text-emerald-950"
                    >
                      <option value="physical_shop">🏢 Physical Store / Commercial Shop / Office</option>
                      <option value="home_based">🏠 Home-Based (Operates from Home / Residential Base)</option>
                      <option value="mobile_service">🚗 Mobile Service (Moves from Place to Place / Doorstep)</option>
                      <option value="freelancer">💻 Freelancer / Independent Professional</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 min-w-0">
                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {customOperationType === 'physical_shop' 
                        ? 'Estate Zone in Kahawa West' 
                        : 'Residential Base Zone in Kahawa West'}
                    </label>
                    <select
                      value={customZone}
                      onChange={(e) => setCustomZone(e.target.value as EstateZone)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm bg-white"
                    >
                      {zones.map((z) => (
                        <option key={z} value={z}>
                          {z}
                        </option>
                      ))}
                    </select>
                    {customOperationType !== 'physical_shop' && (
                      <p className="text-[11px] text-emerald-700 font-medium mt-1">
                        💡 Freelancers & home-based providers: select your home/base estate zone.
                      </p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Tagline / One-line Slogan
                    </label>
                    <input
                      type="text"
                      value={customTagline}
                      onChange={(e) => setCustomTagline(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* Lipa na M-Pesa Integration */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4 text-emerald-700 shrink-0" />
                    <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">Lipa na M-Pesa Payment Details</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
                    <div className="min-w-0">
                      <label className="block text-[11px] font-bold text-emerald-900 mb-1">M-Pesa Type</label>
                      <select
                        value={mpesaType}
                        onChange={(e) => setMpesaType(e.target.value as any)}
                        className="w-full p-2 rounded-lg border border-emerald-300 bg-white text-xs font-semibold focus:outline-none"
                      >
                        <option value="Till">Buy Goods (Till Number)</option>
                        <option value="Paybill">Paybill</option>
                        <option value="Pochi la Biashara">Pochi la Biashara</option>
                        <option value="Send Money">Send Money (Phone)</option>
                      </select>
                    </div>

                    <div className="min-w-0">
                      <label className="block text-[11px] font-bold text-emerald-900 mb-1">Till / Paybill Number</label>
                      <input
                        type="text"
                        value={mpesaNumber}
                        onChange={(e) => setMpesaNumber(e.target.value)}
                        placeholder="e.g. 584920"
                        className="w-full p-2 rounded-lg border border-emerald-300 bg-white text-xs font-mono font-bold focus:outline-none"
                      />
                    </div>

                    <div className="min-w-0">
                      <label className="block text-[11px] font-bold text-emerald-900 mb-1">Registered Account Name</label>
                      <input
                        type="text"
                        value={mpesaAccountName}
                        onChange={(e) => setMpesaAccountName(e.target.value)}
                        placeholder="e.g. MAMA NJERI GRILL"
                        className="w-full p-2 rounded-lg border border-emerald-300 bg-white text-xs uppercase focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* WhatsApp & Landmark */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 min-w-0">
                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Direct WhatsApp Number (e.g. 2547...)
                    </label>
                    <input
                      type="text"
                      value={customWhatsapp}
                      onChange={(e) => setCustomWhatsapp(e.target.value)}
                      placeholder="254712345678"
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm font-mono"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Exact Landmark / Building Spot
                    </label>
                    <input
                      type="text"
                      value={customLandmark}
                      onChange={(e) => setCustomLandmark(e.target.value)}
                      placeholder="e.g. Opposite Congo Shell, 1st Floor Shop 4"
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="min-w-0">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Detailed Business Description
                  </label>
                  <textarea
                    rows={3}
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs sm:text-sm"
                  />
                </div>

                {/* Services List Tagging */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 min-w-0">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-0.5">
                      Services & Key Specialties
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Add services, specialties, and perks your business provides.
                    </p>
                  </div>

                  <div className="flex gap-2 min-w-0">
                    <input
                      type="text"
                      value={newServiceInput}
                      onChange={(e) => setNewServiceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddService();
                        }
                      }}
                      placeholder="Type service & click Add"
                      className="flex-1 min-w-0 p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddService}
                      className="px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Quick Suggested Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px] min-w-0">
                    <span className="text-slate-400 font-medium">Suggestions:</span>
                    {['Free Estate Delivery', 'M-Pesa Accepted', 'Walk-ins Welcome', 'Open Late', 'Custom Orders', 'Bulk Discounts'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          if (!servicesList.includes(s)) {
                            setServicesList([...servicesList, s]);
                          }
                        }}
                        className="px-2 py-0.5 rounded-md bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 text-[10px] transition"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>

                  {servicesList.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {servicesList.map((svc, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-200"
                        >
                          <span className="truncate max-w-[200px]">{svc}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveService(sIdx)}
                            className="text-emerald-700 hover:text-rose-600 p-0.5 rounded-full hover:bg-rose-50 transition shrink-0"
                            title="Remove service"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No custom services added yet.</p>
                  )}
                </div>

                {/* Website & Social Links */}
                <div className="space-y-2.5 min-w-0">
                  <div className="min-w-0">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      🌐 Official Website / Landing Page (Optional)
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="e.g. https://yourbusiness.co.ke or mybrand.com"
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 min-w-0">
                    <div className="min-w-0">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        🎵 TikTok (@handle or link)
                      </label>
                      <input
                        type="text"
                        value={tiktok}
                        onChange={(e) => setTiktok(e.target.value)}
                        placeholder="@username"
                        className="w-full p-2 text-xs rounded-lg border border-slate-300 font-medium"
                      />
                    </div>
                    <div className="min-w-0">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        📸 Instagram (@handle or link)
                      </label>
                      <input
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="@username"
                        className="w-full p-2 text-xs rounded-lg border border-slate-300 font-medium"
                      />
                    </div>
                    <div className="min-w-0">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        📘 Facebook Page URL
                      </label>
                      <input
                        type="text"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        placeholder="facebook.com/page"
                        className="w-full p-2 text-xs rounded-lg border border-slate-300 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Special Resident Offer / Promotion (Optional) */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/70 border border-amber-200/90 space-y-2.5 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Tag className="w-4 h-4 text-amber-700 shrink-0" />
                      <label className="text-xs font-bold text-amber-950 uppercase tracking-wider truncate">
                        Special Resident Offer / Promotion (Optional)
                      </label>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 border border-amber-300 shrink-0">
                      Spotlight Deal
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    Pre-draft an exclusive discount or resident deal for your listing:
                  </p>
                  <div className="space-y-2 min-w-0">
                    <input
                      type="text"
                      value={offerTitle}
                      onChange={(e) => setOfferTitle(e.target.value)}
                      placeholder="Offer title: e.g. 10% Off Weekend Car Wash"
                      className="w-full p-2 text-xs rounded-lg border border-amber-300 bg-white font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={offerDescription}
                      onChange={(e) => setOfferDescription(e.target.value)}
                      placeholder="Offer details: e.g. Mention KWEST Directory when ordering."
                      className="w-full p-2 text-xs rounded-lg border border-amber-300 bg-white font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions Footer: Responsive stacking on mobile, side-by-side on desktop */}
            <div className="pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 min-w-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition text-center border border-slate-200 sm:border-transparent cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto min-w-0">
                {activeTab === 'customize' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('claimant')}
                    className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition text-center cursor-pointer"
                  >
                    ← Back to Claimant Info
                  </button>
                )}

                <button
                  id="submit-claim-button"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>Saving Claim...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>Confirm Claim & Save Listing</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
