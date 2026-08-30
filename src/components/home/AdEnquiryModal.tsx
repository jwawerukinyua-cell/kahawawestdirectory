import React, { useState } from 'react';
import {
  X,
  Megaphone,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Mail,
  MessageSquare,
  Tag,
  Award,
  TrendingUp,
  Ruler,
  Maximize2,
  FileImage,
  Type,
  Layers,
  Palette,
  ExternalLink,
  Flame,
  Target,
  CreditCard,
  Calendar,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface AdEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ENQUIRY_PACKAGES = [
  { id: '7_days', name: '7-Day Flash Boost', duration: '7 Days', price: 700, rate: 'KSh 100/day' },
  { id: '15_days', name: '15-Day Growth Sprint', duration: '15 Days', price: 1350, rate: 'KSh 90/day', isPopular: true },
  { id: '30_days', name: '30-Day Prime Leader', duration: '30 Days', price: 2500, rate: 'KSh 83/day' },
];

const CREATIVE_DESIGN_FEE_KSH = 500;

export const AdEnquiryModal: React.FC<AdEnquiryModalProps> = ({ isOpen, onClose }) => {
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<'7_days' | '15_days' | '30_days'>('15_days');
  const [adType, setAdType] = useState<'homepage-banner' | 'resident-deal' | 'category-top' | 'editorial-spotlight'>('homepage-banner');
  const [needCreativeServices, setNeedCreativeServices] = useState(false);
  const [clickAction, setClickAction] = useState<'whatsapp' | 'website' | 'call'>('whatsapp');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentPkg = ENQUIRY_PACKAGES.find((p) => p.id === selectedDuration) || ENQUIRY_PACKAGES[1];
  const creativeFee = needCreativeServices ? CREATIVE_DESIGN_FEE_KSH : 0;
  const totalPayableKsh = currentPkg.price + creativeFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !phone) {
      alert('Please provide your business name and phone number.');
      return;
    }
    setSubmitted(true);
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `*🚀 KWEST DIRECTORY AD CAMPAIGN BOOKING (KWEST MEDIA)*\n\n` +
      `*Business:* ${businessName || 'My Business'}\n` +
      `*Contact Person:* ${contactPerson || 'Owner'}\n` +
      `*Phone:* ${phone}\n` +
      `*Ad Placement Slot:* ${adType}\n` +
      `*Package Duration:* ${currentPkg.name} (${currentPkg.duration}) — KSh ${currentPkg.price}\n` +
      `*Ad Creation & Copywriting Add-on:* ${needCreativeServices ? `YES (+KSh ${CREATIVE_DESIGN_FEE_KSH})` : 'NO (Merchant provides graphics)'}\n` +
      `*TOTAL AMOUNT DUE (Upfront):* KSh ${totalPayableKsh.toLocaleString()}\n\n` +
      `*💳 Lipa na M-Pesa:* Paybill: 247247 | Acc: 537409 | Name: Ukweli Products\n\n` +
      `*CTA Action:* ${clickAction}\n` +
      `*Notes/Goals:* ${notes || 'Standard promotion'}\n\n` +
      `All ads are payable upfront. Please confirm availability and send M-Pesa receipt confirmation.`
    );
    window.open(`https://wa.me/254764405842?text=${text}`, '_blank');
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
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-md">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-rose-200">
                Monetization &amp; Advertising Guide
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Advertise on Kahawa West Directory
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Campaign Booking Received!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thank you for choosing to advertise on Kahawa West Directory. Please review your itemized package total below. All ads are activated upon upfront payment verification.
              </p>

              {/* Order Summary & Paybill Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left text-xs text-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Business:</span>
                  <strong>{businessName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Campaign Duration:</span>
                  <strong className="text-amber-800">{currentPkg.name} ({currentPkg.duration})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Placement Slot Fee:</span>
                  <span className="font-mono font-bold">KSh {currentPkg.price.toLocaleString()}</span>
                </div>
                {needCreativeServices && (
                  <div className="flex justify-between text-amber-700">
                    <span>Ad Creative &amp; Copywriting:</span>
                    <span className="font-mono font-bold">+KSh {CREATIVE_DESIGN_FEE_KSH.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-900">Total Due (Upfront):</span>
                  <strong className="text-emerald-700 font-mono text-base">KSh {totalPayableKsh.toLocaleString()}</strong>
                </div>

                {/* Lipa na M-Pesa */}
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1 mt-2">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <span>Lipa na M-Pesa (KWEST MEDIA)</span>
                  </div>
                  <p><strong>PAYBILL:</strong> <span className="font-mono font-bold text-emerald-900">247247</span></p>
                  <p><strong>ACCOUNT NO:</strong> <span className="font-mono font-bold text-emerald-900">537409</span></p>
                  <p><strong>ACCOUNT NAME:</strong> Ukweli Products</p>
                  <p className="text-[10px] text-emerald-800 font-medium pt-0.5">
                    * Note: All ad placements and creative services are payable upfront prior to activation.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button variant="primary" onClick={handleWhatsAppDirect} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  Send Booking via WhatsApp
                </Button>
                <Button variant="secondary" onClick={() => { setSubmitted(false); onClose(); }}>
                  Close Window
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Direct Contact Banner */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span>Direct Booking &amp; Creative Consultations</span>
                  </span>
                  <p className="text-amber-900 text-[11px]">
                    Questions or ready to lock in your campaign immediately? Reach our advertising desk:
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href="https://wa.me/254764405842?text=Hello%20KWEST%20Directory%20Ad%20Team"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href="mailto:ads@kahawawestdirectory.co.ke"
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Ad Desk</span>
                  </a>
                </div>
              </div>

              {/* How Monetization Works & Ad Dimensions Guidance */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-amber-500" />
                    <span>Monetization Placements &amp; Creative Specifications</span>
                  </h3>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                    2026 Creative Guidelines
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Lock in high-visibility placements with calibrated dimensions designed for maximum click-through rates and foot traffic:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Slot 1 */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-2xs">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        Homepage Main Billboard
                      </span>
                      <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        1200×400 px
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <p><strong>Physical Eqv:</strong> 31.75 × 10.58 cm (96 DPI)</p>
                      <p><strong>Aspect Ratio:</strong> 3:1 (Desktop) • 2:1 (Mobile 800×400 px)</p>
                      <p><strong>Click Action:</strong> WhatsApp/Call or Website</p>
                      <p><strong>File Specs:</strong> PNG/WebP • Max 1.5 MB • sRGB</p>
                    </div>
                  </div>

                  {/* Slot 2 */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-2xs">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-rose-600" />
                        Resident Special Deals Boost
                      </span>
                      <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        600×400 px
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <p><strong>Physical Eqv:</strong> 15.88 × 10.58 cm (96 DPI)</p>
                      <p><strong>Aspect Ratio:</strong> 3:2 Landscape or 1:1 Square (500×500 px)</p>
                      <p><strong>Click Action:</strong> Direct WhatsApp claim or Website</p>
                      <p><strong>File Specs:</strong> JPG/PNG • Max 800 KB • High Contrast</p>
                    </div>
                  </div>

                  {/* Slot 3 */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-2xs">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        Category Top-Rank Sticky
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        800×300 px
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <p><strong>Physical Eqv:</strong> 21.16 × 7.94 cm (96 DPI)</p>
                      <p><strong>Placement:</strong> Position #1 Sticky pin in category views</p>
                      <p><strong>File Specs:</strong> PNG Transparent Logo + Cover • Max 500 KB</p>
                    </div>
                  </div>

                  {/* Slot 4 */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-2xs">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        Spotlight Editorial Feature
                      </span>
                      <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        1600×900 px
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <p><strong>Physical Eqv:</strong> 42.33 × 23.81 cm (96 DPI HD Cover)</p>
                      <p><strong>Article Specs:</strong> 300–800 words founder story + up to 6 gallery photos</p>
                      <p><strong>File Specs:</strong> Max 3.0 MB Master Cover</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking / Enquiry Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Select Campaign Duration &amp; Book Ad
                  </h3>
                  <span className="text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                    All Ads Payable Upfront
                  </span>
                </div>

                {/* Campaign Duration Selector (7, 15, 30 Days) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Campaign Duration Package <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ENQUIRY_PACKAGES.map((pkg) => {
                      const isSelected = selectedDuration === pkg.id;
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setSelectedDuration(pkg.id as any)}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer relative ${
                            isSelected
                              ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          {pkg.isPopular && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase bg-amber-500 text-stone-950 whitespace-nowrap">
                              Popular
                            </span>
                          )}
                          <div className="text-[11px] font-bold">{pkg.name}</div>
                          <div className="text-sm font-black text-amber-700 font-mono my-0.5">
                            KSh {pkg.price.toLocaleString()}
                          </div>
                          <div className="text-[9px] text-slate-500">{pkg.rate}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

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
                      placeholder="e.g. Jacaranda Grill &amp; Butchery"
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
                      Phone Number (WhatsApp / Call) <span className="text-rose-500">*</span>
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
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="business@gmail.com"
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Placement Slot
                    </label>
                    <select
                      value={adType}
                      onChange={(e) => setAdType(e.target.value as any)}
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="homepage-banner">Homepage Main Billboard (1200×400)</option>
                      <option value="resident-deal">Special Resident Offer Spotlight (600×400)</option>
                      <option value="category-top">Category Top-Rank Sticky Placement</option>
                      <option value="editorial-spotlight">Community Spotlight Editorial Article</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Click Action
                    </label>
                    <select
                      value={clickAction}
                      onChange={(e) => setClickAction(e.target.value as any)}
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="whatsapp">💬 Direct WhatsApp Chat Order</option>
                      <option value="call">📞 Direct Phone Call Line</option>
                      <option value="website">🌐 Business Website / Web Page</option>
                    </select>
                  </div>
                </div>

                {/* Separate Ad Creation & Copywriting Option */}
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                    needCreativeServices
                      ? 'bg-amber-50 border-amber-400 text-amber-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                  onClick={() => setNeedCreativeServices(!needCreativeServices)}
                >
                  <input
                    type="checkbox"
                    checked={needCreativeServices}
                    onChange={(e) => setNeedCreativeServices(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <div className="text-xs space-y-0.5 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-amber-700" />
                        <span>Create Ad For Me (Custom HD Graphics &amp; Copywriting)</span>
                      </span>
                      <span className="font-mono font-bold text-amber-800 text-[11px] bg-amber-100 px-2 py-0.5 rounded border border-amber-300 whitespace-nowrap">
                        +KSh {CREATIVE_DESIGN_FEE_KSH} (Separate Fee)
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Our in-house design team will professionally craft persuasive promotional copy and design a high-converting HD banner tailored to your business.
                    </p>
                  </div>
                </div>

                {/* Itemized Calculation & Official Payment Account */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-700">
                    <span>Ad Placement Fee ({currentPkg.name}):</span>
                    <span className="font-mono font-bold text-slate-900">KSh {currentPkg.price.toLocaleString()}</span>
                  </div>
                  {needCreativeServices && (
                    <div className="flex justify-between items-center text-amber-800">
                      <span>Ad Creation &amp; Design Service:</span>
                      <span className="font-mono font-bold">+KSh {CREATIVE_DESIGN_FEE_KSH.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-900">Total Amount (Payable Upfront):</span>
                    <strong className="text-emerald-700 font-mono text-base">KSh {totalPayableKsh.toLocaleString()}</strong>
                  </div>

                  {/* Lipa na M-Pesa Receiving Account */}
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-[11px] text-emerald-950 space-y-0.5">
                    <div className="font-bold flex items-center justify-between text-emerald-900">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Lipa na M-Pesa Receiving Account (KWEST MEDIA)</span>
                      </span>
                      <span className="text-[9px] font-black uppercase bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded">
                        Payable Upfront
                      </span>
                    </div>
                    <p><strong>PAYBILL:</strong> <span className="font-mono font-bold">247247</span> • <strong>ACC NO:</strong> <span className="font-mono font-bold">537409</span></p>
                    <p><strong>ACC NAME:</strong> Ukweli Products</p>
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
                    placeholder="Tell us what promotion, discount, website link, or launch you'd like to feature..."
                    className="w-full p-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-500">
                    All ads are payable upfront to PAYBILL 247247, ACC 537409 (Ukweli Products).
                  </p>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button type="button" variant="secondary" onClick={onClose} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="w-full sm:w-auto bg-[#630303] hover:bg-[#450505] text-white">
                      Book &amp; Pay KSh {totalPayableKsh.toLocaleString()} Upfront
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

