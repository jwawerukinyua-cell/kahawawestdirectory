import React, { useState, useId } from 'react';
import {
  X,
  Megaphone,
  Sparkles,
  Palette,
  CheckCircle2,
  Phone,
  MessageCircle,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Tag,
  Upload,
  Eye,
  CreditCard,
  Building,
  Check,
  HelpCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Business, EstateZone } from '../../types';

export type AdFormatType = 'billboard' | 'resident_deal' | 'category_pin' | 'whatsapp_broadcast';

export interface BusinessAdCampaign {
  id: string;
  businessId: string;
  businessName: string;
  format: AdFormatType;
  headline: string;
  description: string;
  ctaText: string;
  badgeText: string;
  targetZone: string;
  imageUrl: string;
  requestCustomDesign: boolean;
  packageDuration: '7_days' | '15_days' | '30_days';
  placementPriceKsh: number;
  creativeFeeKsh: number;
  totalPriceKsh: number;
  status: 'active' | 'in_review' | 'scheduled';
  createdAt: string;
}

interface PromoteShopModalProps {
  business: Business;
  isOpen: boolean;
  onClose: () => void;
  onAdCreated?: (ad: BusinessAdCampaign) => void;
}

const AD_FORMATS: {
  id: AdFormatType;
  title: string;
  subtitle: string;
  reach: string;
  badge: string;
  iconName: string;
  bgGradient: string;
}[] = [
  {
    id: 'billboard',
    title: 'Top Homepage Billboard (1200 × 400)',
    subtitle: 'Exclusive hero spotlight seen at the very top of Kahawa West directory & searches',
    reach: '3,500+ weekly impressions',
    badge: 'Maximum Reach',
    iconName: 'Sparkles',
    bgGradient: 'from-amber-500/20 via-[#4D0202]/40 to-black',
  },
  {
    id: 'resident_deal',
    title: 'Special Resident Offer & Hot Deal',
    subtitle: 'Featured in the Deals showcase with custom discount pill & 1-click WhatsApp checkout',
    reach: '2,800+ shopping residents',
    badge: 'Highest Conversion',
    iconName: 'Tag',
    bgGradient: 'from-rose-500/20 via-[#4D0202]/40 to-black',
  },
  {
    id: 'category_pin',
    title: 'Category #1 Sponsored Pin',
    subtitle: `Guaranteed #1 pinned position in ${'category'} searches with gold verified border`,
    reach: '1,800+ high-intent buyers',
    badge: 'Targeted Niche',
    iconName: 'Layers',
    bgGradient: 'from-sky-500/20 via-[#4D0202]/40 to-black',
  },
  {
    id: 'whatsapp_broadcast',
    title: 'Estate WhatsApp Alert & Noticeboard',
    subtitle: 'Broadcast to 1,500+ Kahawa West estate WhatsApp subscribers & Community alerts ticker',
    reach: '1,500+ direct mobile alerts',
    badge: 'Direct Mobile',
    iconName: 'Megaphone',
    bgGradient: 'from-emerald-500/20 via-[#4D0202]/40 to-black',
  },
];

const PACKAGES = [
  {
    id: '7_days' as const,
    name: '7-Day Flash Boost',
    duration: '7 Days',
    price: 700,
    dailyRate: 'KSh 100/day',
    desc: 'Ideal for weekend promos, testing the directory build, clearance offers & rapid local reach',
    isPopular: false,
  },
  {
    id: '15_days' as const,
    name: '15-Day Growth Sprint',
    duration: '15 Days (2 Weeks)',
    price: 1350,
    dailyRate: 'KSh 90/day',
    desc: 'Mid-term continuous exposure across peak estate buying cycles with targeted resident engagement',
    isPopular: true,
  },
  {
    id: '30_days' as const,
    name: '30-Day Prime Leader',
    duration: '30 Days (Full Month)',
    price: 2500,
    dailyRate: 'KSh 83/day',
    desc: 'Maximum monthly dominance, top directory priority ranking & persistent neighborhood brand trust',
    isPopular: false,
  },
];

// Optional creative graphic design and persuasive copywriting service fee
export const AD_CREATION_FEE_KSH = 500;

export const PromoteShopModal: React.FC<PromoteShopModalProps> = ({
  business,
  isOpen,
  onClose,
  onAdCreated,
}) => {
  const uploadInputId = useId();
  const [selectedFormat, setSelectedFormat] = useState<AdFormatType>('billboard');
  const [headline, setHeadline] = useState(() => {
    return `${business.name} — Premium Quality in ${business.zone}`;
  });
  const [description, setDescription] = useState(() => {
    return business.tagline || business.description?.slice(0, 110) || `Top-rated services and products for Kahawa West residents. Fast turnaround and guaranteed satisfaction.`;
  });
  const [ctaText, setCtaText] = useState('WhatsApp for Instant Quote');
  const [badgeText, setBadgeText] = useState(() => {
    if (business.category === 'hardware-construction') return 'Solid Hardwood & Custom Designs';
    if (business.category === 'restaurants-cafes') return 'Fresh Everyday • Free Delivery';
    return 'Kahawa West Resident Special';
  });
  const [targetZone, setTargetZone] = useState<string>('All Kahawa West');
  const [selectedPackage, setSelectedPackage] = useState<'7_days' | '15_days' | '30_days'>('15_days');
  const [requestCustomDesign, setRequestCustomDesign] = useState(false);
  const [adImage, setAdImage] = useState<string>(() => {
    return business.heroImage || (business.galleryImages && business.galleryImages[0]) || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80';
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'builder' | 'preview'>('builder');

  if (!isOpen) return null;

  const currentPkg = PACKAGES.find((p) => p.id === selectedPackage) || PACKAGES[1];
  const creativeFee = requestCustomDesign ? AD_CREATION_FEE_KSH : 0;
  const totalAmountKsh = currentPkg.price + creativeFee;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAdImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLaunchCampaign = () => {
    const newAd: BusinessAdCampaign = {
      id: `kwest-ad-${Date.now()}`,
      businessId: business.id,
      businessName: business.name,
      format: selectedFormat,
      headline: headline.trim(),
      description: description.trim(),
      ctaText: ctaText.trim(),
      badgeText: badgeText.trim(),
      targetZone,
      imageUrl: adImage,
      requestCustomDesign,
      packageDuration: selectedPackage,
      placementPriceKsh: currentPkg.price,
      creativeFeeKsh: creativeFee,
      totalPriceKsh: totalAmountKsh,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // Save to local storage for merchant tracking
    try {
      const existing: BusinessAdCampaign[] = JSON.parse(localStorage.getItem('kwest_business_ads') || '[]');
      existing.unshift(newAd);
      localStorage.setItem('kwest_business_ads', JSON.stringify(existing));
    } catch (e) {
      console.error(e);
    }

    onAdCreated?.(newAd);

    // Format WhatsApp prefill message for instant activation
    const formatName = AD_FORMATS.find((f) => f.id === selectedFormat)?.title || selectedFormat;
    const waText = encodeURIComponent(
      `*🚀 KWEST AD CAMPAIGN BOOKING (KWEST MEDIA)*\n\n` +
      `*Business:* ${business.name} (${business.zone})\n` +
      `*Ad Format:* ${formatName}\n` +
      `*Campaign Duration:* ${currentPkg.name} (${currentPkg.duration}) — KSh ${currentPkg.price}\n` +
      `*Ad Creation & Copywriting Service:* ${requestCustomDesign ? `YES (+KSh ${AD_CREATION_FEE_KSH})` : 'NO (Merchant provides graphics)'}\n` +
      `*TOTAL AMOUNT PAYABLE (Upfront):* KSh ${totalAmountKsh.toLocaleString()}\n\n` +
      `*💳 Payment Details:* Paybill: 247247 | Acc No: 537409 | Acc Name: Ukweli Products\n\n` +
      `*Headline:* "${headline.trim()}"\n` +
      `*Description:* "${description.trim()}"\n` +
      `*Badge:* "${badgeText.trim()}"\n` +
      `*CTA Action:* ${ctaText}\n` +
      `*Target Estate Zone:* ${targetZone}\n\n` +
      `I understand that all ads are payable upfront. Please verify my payment and activate the campaign.`
    );

    setIsSuccess(true);

    setTimeout(() => {
      window.open(`https://wa.me/254764405842?text=${waText}`, '_blank', 'noopener,noreferrer');
    }, 1200);
  };

  return (
    <div
      id="promote-shop-modal"
      className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200 font-sans"
    >
      <div
        className="bg-[#140202] text-stone-100 w-full max-w-4xl rounded-3xl shadow-2xl border border-amber-500/40 overflow-hidden my-auto max-h-[96vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#3D0202] px-5 sm:px-6 py-4 flex items-center justify-between border-b border-amber-500/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center shadow-md flex-shrink-0">
              <Megaphone className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-bold text-base sm:text-lg text-white">
                  Promote {business.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-stone-950">
                  Verified Ad Suite
                </span>
              </div>
              <p className="text-xs text-rose-200/90">
                Put your shop in front of thousands of Kahawa West residents searching for local services
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#520303] hover:bg-[#690404] text-stone-200 hover:text-white transition active:scale-95 flex-shrink-0 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {isSuccess ? (
            <div className="py-10 text-center space-y-4 max-w-md mx-auto animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Ad Campaign Submitted!</h3>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                Opening WhatsApp now with your ad copy and creative specs to finalize your live directory placement with the KWEST desk.
              </p>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2.5 text-xs">
                <div className="flex justify-between text-stone-300">
                  <span>Merchant:</span>
                  <strong className="text-white">{business.name}</strong>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Campaign Package:</span>
                  <strong className="text-amber-300">{currentPkg.name} ({currentPkg.duration})</strong>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Directory Placement:</span>
                  <span className="text-stone-200 font-mono">KSh {currentPkg.price.toLocaleString()}</span>
                </div>
                {requestCustomDesign && (
                  <div className="flex justify-between text-amber-300">
                    <span>Ad Creation &amp; Copywriting:</span>
                    <span className="font-mono">+KSh {AD_CREATION_FEE_KSH.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                  <span className="font-bold text-white text-xs">Total Amount (Upfront):</span>
                  <strong className="text-emerald-400 font-mono text-base">KSh {totalAmountKsh.toLocaleString()}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-[11px] text-emerald-200 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lipa na M-Pesa (KWEST MEDIA)</span>
                  </div>
                  <p><strong>PAYBILL:</strong> 247247 • <strong>ACCOUNT NO:</strong> 537409</p>
                  <p><strong>ACCOUNT NAME:</strong> Ukweli Products</p>
                </div>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tab Switcher (Mobile Friendly) */}
              <div className="flex sm:hidden p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-bold mb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('builder')}
                  className={`flex-1 py-2 rounded-lg transition ${activeTab === 'builder' ? 'bg-amber-400 text-stone-950' : 'text-stone-300'}`}
                >
                  1. Customize Ad Copy
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex-1 py-2 rounded-lg transition ${activeTab === 'preview' ? 'bg-amber-400 text-stone-950' : 'text-stone-300'}`}
                >
                  2. Live Preview &amp; Pricing
                </button>
              </div>

              {/* 1. Select Ad Placement Format */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Step 1: Choose Your Ad Placement</span>
                  </h4>
                  <span className="text-[11px] text-stone-400">Select where your ad appears</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AD_FORMATS.map((fmt) => {
                    const isSelected = selectedFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setSelectedFormat(fmt.id)}
                        className={`p-3.5 rounded-2xl border text-left transition relative cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r ' + fmt.bgGradient + ' border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                            : 'bg-white/5 border-white/10 hover:border-white/20 text-stone-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="font-bold text-white text-xs sm:text-sm">
                            {fmt.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap ${
                              isSelected
                                ? 'bg-amber-400 text-stone-950'
                                : 'bg-white/10 text-stone-300'
                            }`}
                          >
                            {fmt.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-300 leading-relaxed mb-2">
                          {fmt.subtitle}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                          <Eye className="w-3 h-3" />
                          <span>Estimated Reach: {fmt.reach}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Grid Layout: Builder Form & Live Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                {/* Left Column: Customization Controls */}
                <div className={`lg:col-span-6 space-y-4 ${activeTab === 'preview' ? 'hidden sm:block' : 'block'}`}>
                  <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    <span>Step 2: Customize Ad Copy &amp; Assets</span>
                  </h4>

                  {/* Headline Input */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <label className="font-bold text-stone-200">Ad Headline</label>
                      <span className="text-stone-400">{headline.length}/45 characters</span>
                    </div>
                    <input
                      type="text"
                      maxLength={45}
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Ukweli Furniture Crafts — Solid Hardwood Beds"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white font-medium text-xs outline-hidden"
                    />
                  </div>

                  {/* Value Proposition / Description */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <label className="font-bold text-stone-200">Ad Description / Offer</label>
                      <span className="text-stone-400">{description.length}/120 characters</span>
                    </div>
                    <textarea
                      rows={2}
                      maxLength={120}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Custom-made modern furniture in Kahawa West. Quality hardwood with free doorstep delivery!"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white font-medium text-xs outline-hidden resize-none"
                    />
                  </div>

                  {/* Badge Text & CTA selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-stone-200 text-[11px]">Promo Badge Text</label>
                      <input
                        type="text"
                        value={badgeText}
                        onChange={(e) => setBadgeText(e.target.value)}
                        placeholder="e.g. 20% OFF This Month"
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-200 text-[11px]">Call to Action (CTA)</label>
                      <select
                        value={ctaText}
                        onChange={(e) => setCtaText(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs outline-hidden cursor-pointer"
                      >
                        <option value="WhatsApp for Instant Quote">WhatsApp for Instant Quote</option>
                        <option value="Order via WhatsApp">Order via WhatsApp</option>
                        <option value="Call Workshop Now">Call Workshop Now</option>
                        <option value="Claim Resident Deal">Claim Resident Deal</option>
                        <option value={`Visit Us in ${business.zone}`}>Visit Us in {business.zone}</option>
                      </select>
                    </div>
                  </div>

                  {/* Target Zone */}
                  <div className="space-y-1">
                    <label className="font-bold text-stone-200 text-[11px]">Target Audience Zone</label>
                    <select
                      value={targetZone}
                      onChange={(e) => setTargetZone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs outline-hidden cursor-pointer"
                    >
                      <option value="All Kahawa West">All Kahawa West (Maximum Estate Reach)</option>
                      <option value="Roundabout & Kamiti Road">Roundabout &amp; Kamiti Road</option>
                      <option value="Jacaranda & Kamae">Jacaranda &amp; Kamae</option>
                      <option value="Congo & Northern Bypass">Congo &amp; Northern Bypass</option>
                      <option value="Kware & Bima Road">Kware &amp; Bima Road</option>
                    </select>
                  </div>

                  {/* Banner Image / Creative Services */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-stone-200 text-xs flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ad Graphic Image</span>
                      </label>
                      <label
                        htmlFor={uploadInputId}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold text-amber-300 cursor-pointer transition"
                      >
                        Upload Custom File
                      </label>
                      <input
                        id={uploadInputId}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Custom KWEST Creative Design & Copywriting Add-on */}
                    <div
                      onClick={() => setRequestCustomDesign(!requestCustomDesign)}
                      className={`p-3 rounded-xl border transition flex items-start gap-2.5 cursor-pointer ${
                        requestCustomDesign
                          ? 'bg-amber-400/15 border-amber-400/60 text-amber-200'
                          : 'bg-black/40 border-white/10 text-stone-400 hover:border-white/20'
                      }`}
                    >
                      <div className="pt-0.5">
                        <input
                          type="checkbox"
                          checked={requestCustomDesign}
                          onChange={(e) => setRequestCustomDesign(e.target.checked)}
                          className="rounded text-amber-400 focus:ring-0 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-white block font-bold">
                            Create Ad For Me (HD Graphics &amp; Copywriting)
                          </strong>
                          <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-mono font-bold text-[10px] whitespace-nowrap border border-amber-400/30">
                            +KSh {AD_CREATION_FEE_KSH} (Separate Fee)
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-300 leading-relaxed">
                          Don&apos;t have ready artwork? Our KWEST creative team will professionally craft persuasive promotional copy and design a high-converting HD banner graphic for your shop.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Interactive Mockup & Pricing Packages */}
                <div className={`lg:col-span-6 space-y-4 ${activeTab === 'builder' ? 'hidden sm:block' : 'block'}`}>
                  <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Step 3: Live Ad Preview on KWEST</span>
                  </h4>

                  {/* Mockup Container */}
                  <div className="p-3.5 rounded-2xl bg-black/80 border-2 border-amber-400/60 shadow-2xl space-y-3 font-sans">
                    <div className="flex items-center justify-between text-[10px] text-stone-400 pb-1 border-b border-white/10">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Live Directory Simulation • {(selectedFormat || 'billboard').replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-amber-300 font-bold">Target: {targetZone}</span>
                    </div>

                    {/* Format 1: Billboard Simulation */}
                    {selectedFormat === 'billboard' && (
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#240101] via-[#3B0202] to-[#1F0101] p-4 text-white border border-amber-400/40">
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-30 pointer-events-none">
                          <img src={adImage} alt="Ad background" className="w-full h-full object-cover blur-xs" />
                        </div>
                        <div className="relative z-10 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-amber-400 text-stone-950">
                              {badgeText || 'Prime Partner'}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Verified Local Fundi
                            </span>
                          </div>

                          <h5 className="font-display font-black text-sm sm:text-base text-white tracking-tight leading-tight">
                            {headline || business.name}
                          </h5>

                          <p className="text-[11px] text-stone-200 leading-relaxed line-clamp-2">
                            {description}
                          </p>

                          <div className="pt-1 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              className="px-3 py-1.5 rounded-lg bg-[#25D366] text-slate-950 font-black text-[11px] flex items-center gap-1.5 shadow-sm"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>{ctaText}</span>
                            </button>
                            <span className="text-[10px] text-stone-400 font-mono">
                              KWEST Exclusive
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Format 2: Resident Deal Simulation */}
                    {selectedFormat === 'resident_deal' && (
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/60 to-rose-950/60 border border-amber-400/60 text-stone-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500 text-white animate-pulse">
                            {badgeText || 'Special Deal'}
                          </span>
                          <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Active Campaign
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-white">{headline}</h5>
                        <p className="text-[11px] text-stone-300">{description}</p>
                        <button
                          type="button"
                          className="w-full py-1.5 rounded-lg bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5"
                        >
                          <Tag className="w-3.5 h-3.5" />
                          <span>{ctaText}</span>
                        </button>
                      </div>
                    )}

                    {/* Format 3: Category Pin Simulation */}
                    {selectedFormat === 'category_pin' && (
                      <div className="p-3.5 rounded-xl bg-stone-900 border-2 border-amber-400 text-stone-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400 text-stone-950">
                            #1 Sponsored in {business.category}
                          </span>
                          <span className="text-[10px] text-stone-400">{business.zone}</span>
                        </div>
                        <h5 className="font-bold text-sm text-white">{headline}</h5>
                        <p className="text-[11px] text-stone-300">{description}</p>
                        <div className="flex gap-2 pt-1">
                          <button type="button" className="flex-1 py-1.5 rounded-lg bg-[#25D366] text-slate-950 font-bold text-xs flex items-center justify-center gap-1">
                            <MessageCircle className="w-3 h-3" /> WhatsApp
                          </button>
                          <button type="button" className="px-3 py-1.5 rounded-lg bg-stone-800 text-white font-bold text-xs">
                            View Shop
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Format 4: WhatsApp Broadcast Simulation */}
                    {selectedFormat === 'whatsapp_broadcast' && (
                      <div className="p-3.5 rounded-xl bg-[#0b2416] border border-[#25D366]/40 text-stone-100 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Broadcast to 1,500+ Kahawa West WhatsApp Members</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#113a23] text-stone-200 text-xs space-y-1 font-mono">
                          <div className="font-bold text-emerald-300">📢 *ESTATE SPOTLIGHT: {headline}*</div>
                          <p className="text-[11px]">{description}</p>
                          <div className="text-[10px] text-amber-300">👉 WhatsApp: {business.whatsapp || business.phone}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 4: Choose Package Duration */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-amber-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Step 4: Campaign Duration</span>
                      </h4>
                      <span className="text-[10px] text-amber-200 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/30">
                        Payable Upfront
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {PACKAGES.map((pkg) => {
                        const isSelected = selectedPackage === pkg.id;
                        return (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => setSelectedPackage(pkg.id)}
                            className={`p-2.5 rounded-xl border text-center transition cursor-pointer relative ${
                              isSelected
                                ? 'bg-amber-400/20 border-amber-400 text-white shadow-md'
                                : 'bg-white/5 border-white/10 hover:border-white/20 text-stone-300'
                            }`}
                          >
                            {pkg.isPopular && (
                              <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 whitespace-nowrap">
                                Popular
                              </span>
                            )}
                            <div className="text-[11px] font-bold">{pkg.name}</div>
                            <div className="text-sm font-black text-amber-300 font-mono my-0.5">
                              KSh {pkg.price.toLocaleString()}
                            </div>
                            <div className="text-[9px] text-stone-400">{pkg.dailyRate}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pricing Breakdown & Lipa na M-Pesa Info Box */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-emerald-500/40 text-stone-300 text-xs space-y-2.5">
                    {/* Itemized Calculation */}
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between items-center text-stone-300">
                        <span>Directory Placement ({currentPkg.duration}):</span>
                        <span className="font-mono text-white">KSh {currentPkg.price.toLocaleString()}</span>
                      </div>
                      {requestCustomDesign ? (
                        <div className="flex justify-between items-center text-amber-300">
                          <span>Ad Creative &amp; Copywriting Fee:</span>
                          <span className="font-mono font-bold">+KSh {AD_CREATION_FEE_KSH.toLocaleString()}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-stone-400 text-[10px]">
                          <span>Ad Creative &amp; Copywriting:</span>
                          <span>Own Artwork Provided (KSh 0)</span>
                        </div>
                      )}
                      <div className="pt-1.5 border-t border-white/10 flex justify-between items-center">
                        <span className="font-bold text-white text-xs">Total Amount Due (Upfront):</span>
                        <span className="font-mono font-bold text-base text-emerald-400">
                          KSh {totalAmountKsh.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Official Paybill Instructions */}
                    <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/50 text-[11px] text-emerald-100 space-y-1 font-sans">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Lipa na M-Pesa (KWEST MEDIA)</span>
                        </span>
                        <span className="text-[9px] font-black uppercase bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-400/40">
                          All Ads Paid Upfront
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] pt-0.5">
                        <p><strong>PAYBILL:</strong> <span className="font-mono text-amber-300 font-bold">247247</span></p>
                        <p><strong>ACC NO:</strong> <span className="font-mono text-amber-300 font-bold">537409</span></p>
                      </div>
                      <p className="text-[10px] text-stone-300"><strong>ACC NAME:</strong> Ukweli Products</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        {!isSuccess && (
          <div className="bg-[#240101] px-5 sm:px-6 py-3.5 border-t border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
            <div className="text-xs text-stone-300">
              Selected: <strong className="text-amber-300">{currentPkg.name}</strong>
              {requestCustomDesign && <span className="text-amber-200"> + Creative Ad Design</span>} •{' '}
              <span className="text-emerald-400 font-bold font-mono text-sm">
                Total KSh {totalAmountKsh.toLocaleString()} (Upfront)
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition flex-1 sm:flex-initial cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLaunchCampaign}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-stone-950 font-black text-xs transition shadow-lg flex items-center justify-center gap-2 flex-1 sm:flex-initial cursor-pointer"
              >
                <Megaphone className="w-3.5 h-3.5 text-stone-950" />
                <span>Book &amp; Pay KSh {totalAmountKsh.toLocaleString()} Upfront</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-950" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
