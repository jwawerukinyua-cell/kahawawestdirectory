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
} from 'lucide-react';
import { Business, BusinessClaim, EstateZone } from '../../types';
import { saveBusinessClaim, saveCustomizedBusiness } from '../../lib/supabase';
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
  const [businessRole, setBusinessRole] = useState<'Owner' | 'Manager' | 'Authorized Representative' | 'Partner'>('Owner');
  const [notes, setNotes] = useState('');

  // Business customization state (5 Photos, contacts, Lipa na M-Pesa, etc.)
  const [customName, setCustomName] = useState(business.name);
  const [customTagline, setCustomTagline] = useState(business.tagline);
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

  // Social Links
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

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber || !email) {
      alert('Please fill in your name, contact phone number, and email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Prepare Claim record matching Supabase schema
      const claimRecord: BusinessClaim = {
        business_id: business.id,
        business_name: customName || business.name,
        full_name: fullName,
        phone_number: phoneNumber,
        email: email,
        business_role: businessRole,
        status: 'verified', // Instant verification for active editing & live preview
        notes: notes,
        created_at: new Date().toISOString(),
      };

      // 2. Prepare Updated Business Record
      const updatedBusinessRecord: Business = {
        ...business,
        name: customName,
        tagline: customTagline,
        phone: customPhone,
        whatsapp: customWhatsapp.replace(/[^0-9]/g, ''),
        email: customEmail,
        zone: customZone,
        landmark: customLandmark,
        description: customDescription,
        services: servicesList,
        isClaimed: true,
        claimedBy: `${fullName} (${businessRole})`,
        claimedAt: new Date().toISOString().split('T')[0],
        heroImage: photos[0] || business.heroImage,
        galleryImages: photos,
        mpesa: mpesaNumber
          ? {
              type: mpesaType,
              number: mpesaNumber,
              accountName: mpesaAccountName || customName.toUpperCase(),
              accountNumber: mpesaAccNumber || undefined,
            }
          : undefined,
        socialLinks: {
          website: website || undefined,
          facebook: facebook || undefined,
          instagram: instagram || undefined,
          tiktok: tiktok || undefined,
        },
        specialOffer: offerTitle
          ? {
              title: offerTitle,
              description: offerDescription,
              badgeText: 'Owner Special',
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
    'Congo Stage',
    'Roundabout',
    'Jacaranda Estate',
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
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
                kwestdirectory.co.ke • Claim & Edit Listing
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Claim {business.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 flex-shrink-0">
          <button
            onClick={() => setActiveTab('claimant')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'claimant'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            1. Claimant Identity (Supabase Claims)
          </button>
          <button
            onClick={() => setActiveTab('customize')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'customize'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            2. Customize Details & 5 Photos
          </button>
        </div>

        {/* Form Body */}
        {successMode ? (
          <div className="p-8 sm:p-12 text-center my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Claim & Updates Saved!</h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto mb-4">
              Your claim record has been recorded and <strong>{customName}</strong> is now verified with your customized contacts, 5 photos, and Lipa na M-Pesa details.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> Live on kwestdirectory.co.ke
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitClaim} className="overflow-y-auto p-6 space-y-6 flex-1">
            {activeTab === 'claimant' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs sm:text-sm">
                  <span className="font-bold block mb-1">Verify your relationship to this business:</span>
                  Fill in your details below. Once submitted, your claim record is inserted directly into the <strong>claims</strong> database table and you gain management control.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. John Mwangi Kinyua"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Your Business Role *
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <select
                        value={businessRole}
                        onChange={(e) => setBusinessRole(e.target.value as any)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm bg-white"
                      >
                        <option value="Owner">Owner / Proprietor</option>
                        <option value="Manager">General Manager</option>
                        <option value="Authorized Representative">Authorized Representative</option>
                        <option value="Partner">Business Partner</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Verification Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+2547..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Official Contact Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="owner@gmail.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Verification Notes / M-Pesa Till Ownership Proof (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Registered owner of Till 584920, shop located opposite Congo Stage Shell."
                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('customize')}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Customize 5 Photos & Contacts</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 5 Photos Section */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-bold text-slate-900 text-sm">
                        5 Business Photos (Primary Hero + 4 Gallery Images)
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-500">Only Photo #1 appears on cards</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {photos.map((photoUrl, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="relative h-20 rounded-lg overflow-hidden border border-slate-300 bg-slate-200 group">
                          <img
                            src={photoUrl}
                            alt={`Photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white">
                            {idx === 0 ? 'Primary' : `#${idx + 1}`}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={photoUrl}
                          onChange={(e) => handlePhotoChange(idx, e.target.value)}
                          placeholder={`Image URL ${idx + 1}`}
                          className="w-full p-1.5 text-[11px] font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Core Business Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Business Display Name
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Estate Zone in Kahawa West
                    </label>
                    <select
                      value={customZone}
                      onChange={(e) => setCustomZone(e.target.value as EstateZone)}
                      className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm bg-white"
                    >
                      {zones.map((z) => (
                        <option key={z} value={z}>
                          {z}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tagline / One-line Slogan
                  </label>
                  <input
                    type="text"
                    value={customTagline}
                    onChange={(e) => setCustomTagline(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                  />
                </div>

                {/* Lipa na M-Pesa Integration */}
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <h4 className="font-bold text-emerald-950 text-sm">Lipa na M-Pesa Payment Details</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
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

                    <div>
                      <label className="block text-[11px] font-bold text-emerald-900 mb-1">Till / Paybill Number</label>
                      <input
                        type="text"
                        value={mpesaNumber}
                        onChange={(e) => setMpesaNumber(e.target.value)}
                        placeholder="e.g. 584920"
                        className="w-full p-2 rounded-lg border border-emerald-300 bg-white text-xs font-mono font-bold focus:outline-none"
                      />
                    </div>

                    <div>
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

                {/* WhatsApp & Call */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Direct WhatsApp Number (No spaces)
                    </label>
                    <input
                      type="text"
                      value={customWhatsapp}
                      onChange={(e) => setCustomWhatsapp(e.target.value)}
                      placeholder="254712345678"
                      className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Exact Landmark / Building Spot
                    </label>
                    <input
                      type="text"
                      value={customLandmark}
                      onChange={(e) => setCustomLandmark(e.target.value)}
                      placeholder="e.g. Opposite Congo Shell, 1st Floor Shop 4"
                      className="w-full p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Detailed Business Description
                  </label>
                  <textarea
                    rows={3}
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                  />
                </div>

                {/* Services List Tagging */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Services Offered
                  </label>
                  <div className="flex gap-2 mb-2">
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
                      placeholder="Type a service (e.g. Free Estate Delivery) & press Add"
                      className="flex-1 p-2 rounded-xl border border-slate-300 text-xs"
                    />
                    <Button type="button" size="sm" variant="secondary" onClick={handleAddService}>
                      <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {servicesList.map((svc, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                      >
                        {svc}
                        <button
                          type="button"
                          onClick={() => handleRemoveService(sIdx)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Website URL</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://..."
                      className="w-full p-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Facebook Page URL</label>
                    <input
                      type="text"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full p-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Instagram Handle / URL</label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="https://instagram.com/..."
                      className="w-full p-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                {/* Resident Promo Offer */}
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                    Special Resident Offer / Promotion (Optional)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={offerTitle}
                      onChange={(e) => setOfferTitle(e.target.value)}
                      placeholder="Offer title: e.g. 10% Off Weekend Car Wash"
                      className="w-full p-2 text-xs rounded-lg border border-amber-300 bg-white"
                    />
                    <input
                      type="text"
                      value={offerDescription}
                      onChange={(e) => setOfferDescription(e.target.value)}
                      placeholder="Offer details: e.g. Mention KWEST Directory to claim your 10% discount on Saturdays."
                      className="w-full p-2 text-xs rounded-lg border border-amber-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {activeTab === 'customize' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('claimant')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                  >
                    Back to Claimant Info
                  </button>
                )}

                <Button
                  id="submit-claim-button"
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Saving Claim to Supabase...' : 'Confirm Claim & Save Listing'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
