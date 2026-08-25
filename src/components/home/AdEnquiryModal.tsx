import React, { useState } from 'react';
import { X, Megaphone, Sparkles, CheckCircle2, ShieldCheck, Phone, Mail, MessageSquare, Tag, Award, TrendingUp } from 'lucide-react';
import { Button } from '../ui/Button';

interface AdEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdEnquiryModal: React.FC<AdEnquiryModalProps> = ({ isOpen, onClose }) => {
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [adType, setAdType] = useState<'homepage-banner' | 'resident-deal' | 'category-top' | 'editorial-spotlight'>('homepage-banner');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !phone) {
      alert('Please provide your business name and phone number.');
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      // open WhatsApp prefilled enquiry or show success
    }, 500);
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Hello KWEST Directory Team! I would like to enquire about advertising space for "${businessName || 'my business'}". Preferred slot: ${adType}. Phone: ${phone || 'N/A'}`
    );
    window.open(`https://wa.me/254700000000?text=${text}`, '_blank');
  };

  return (
    <div
      id="ad-enquiry-modal"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#630303] text-white p-5 sm:p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-rose-200">
                Monetization & Advertising Guide
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Advertise on KWEST Directory
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Enquiry Received!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thank you for your interest in advertising on KWEST Directory. Our team will review your booking and reach out to you via WhatsApp / Call to confirm campaign dates and creative materials.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button variant="primary" onClick={handleWhatsAppDirect}>
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  Chat on WhatsApp Directly
                </Button>
                <Button variant="secondary" onClick={() => { setSubmitted(false); onClose(); }}>
                  Close Window
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* How Monetization Works Guidance */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  How Monetization & Ad Slots Will Work
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Once all directory businesses are live and verified, local merchants and brands can activate premium placements to reach Kahawa West residents actively searching for goods and services:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      Homepage Main Billboard
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Prime hero spotlight right below the search bar. High CTR for major campaigns and offers.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-rose-600" />
                      Special Resident Promo Boost
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Highlight your discount deal in the Resident Offers carousel and get a special badge on your card.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      Category Top-Rank
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Sticky pinned placement at the #1 spot when residents filter by your category (e.g. Chemists, Dining).
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      Editorial Spotlight Feature
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Full-length feature story covering your founder journey in the Community Spotlight magazine.
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking / Enquiry Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Pre-Book Your Ad Slot (Coming Soon)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Business Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Jacaranda Grill & Butchery"
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Person / Title
                    </label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. John Kamau (Owner)"
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number (WhatsApp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0712 345 678"
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Placement Slot
                    </label>
                    <select
                      value={adType}
                      onChange={(e) => setAdType(e.target.value as any)}
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="homepage-banner">Homepage Main Billboard</option>
                      <option value="resident-deal">Special Resident Offer Spotlight</option>
                      <option value="category-top">Category Top-Rank Sticky Placement</option>
                      <option value="editorial-spotlight">Community Spotlight Editorial Article</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Campaign Goals / Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tell us what promotion, discount, or launch you'd like to feature..."
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-500">
                    No payment is required today. We will confirm dates prior to site launch.
                  </p>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button type="button" variant="secondary" onClick={onClose} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="w-full sm:w-auto bg-[#630303] hover:bg-[#450505] text-white">
                      Submit Pre-Booking
                    </Button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
