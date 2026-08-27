import React, { useState } from 'react';
import {
  Megaphone,
  Tag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  Clock,
  Ruler,
  FileImage,
  Type,
  Maximize2,
  ChevronDown,
  Info,
  TrendingUp,
  Flame,
  Palette,
  Target,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { Business } from '../../types';

interface MonetizationPlaceholdersProps {
  businessesWithOffers: Business[];
  onViewBusiness: (biz: Business) => void;
  onClaimListing: () => void;
  onOpenAdEnquiry: () => void;
}

export const MonetizationPlaceholders: React.FC<MonetizationPlaceholdersProps> = ({
  businessesWithOffers,
  onViewBusiness,
  onClaimListing,
  onOpenAdEnquiry,
}) => {
  const [showBannerSpecs, setShowBannerSpecs] = useState(false);
  const [showDealsSpecs, setShowDealsSpecs] = useState(false);

  return (
    <div className="space-y-8 my-8">
      {/* 1. Main Homepage Billboard Slot (Monetization Slot #1) - Styled with luxury #00000f background */}
      <div
        id="homepage-main-promo-banner"
        className="relative overflow-hidden rounded-3xl bg-[#00000f] text-white p-6 sm:p-8 border-2 border-amber-400/70 shadow-2xl"
      >
        {/* Subtle Luxury Ambient Accents */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-[#630303]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-md">
                <Flame className="w-3.5 h-3.5 text-stone-950 fill-stone-950" />
                <span>COMING SOON • OWN THIS SPACE</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300">
                <Target className="w-3.5 h-3.5" />
                <span>Prime #1 Homepage Billboard</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Put Your Business in Front of 10,000+ Kahawa West Residents Every Day
            </h3>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
              Claim exclusive top-of-page visibility before your competitors do. Instant brand authority, maximum estate recognition, and direct WhatsApp / phone orders or website clicks from every resident searching for local services.
            </p>

            {/* Creative Services & Direct Contact Banner Pill */}
            <div className="p-3 rounded-xl bg-white/5 border border-amber-400/30 text-xs text-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="font-semibold text-[11px] sm:text-xs">
                  <strong>Need Ad Graphics & Copy?</strong> We write persuasive copy & design custom HD banners for your business.
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold text-amber-300 flex-shrink-0">
                <a
                  href="mailto:ads@kahawawestdirectory.co.ke"
                  className="hover:underline flex items-center gap-1"
                >
                  <Mail className="w-3 h-3 text-amber-400" />
                  <span>ads@kahawawestdirectory.co.ke</span>
                </a>
              </div>
            </div>

            {/* Quick Specs Pill Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/10 text-amber-200 border border-white/15">
                <Ruler className="w-3 h-3 text-amber-400" />
                <span>Specs: 1200 × 400 px (3:1) • 31.8 × 10.6 cm</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/10 text-stone-300 border border-white/15">
                <FileImage className="w-3 h-3 text-emerald-400" />
                <span>PNG / WebP • Max 1.5MB</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/10 text-sky-300 border border-white/15">
                <ExternalLink className="w-3 h-3 text-sky-400" />
                <span>Click Action: WhatsApp/Call or Website</span>
              </span>
              <button
                type="button"
                onClick={() => setShowBannerSpecs(!showBannerSpecs)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 transition active:scale-95"
              >
                <Info className="w-3 h-3 text-amber-300" />
                <span>{showBannerSpecs ? 'Hide Ad Specs' : 'View Full Creative Dimensions'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showBannerSpecs ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2.5 w-full md:w-auto flex-shrink-0">
            <button
              onClick={onOpenAdEnquiry}
              className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-950/40 cursor-pointer"
            >
              <Megaphone className="w-4 h-4 text-stone-950" />
              <span>Reserve Ad Space</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClaimListing}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm border border-white/25 flex items-center justify-center gap-1.5 transition backdrop-blur-sm cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Claim & List Business</span>
            </button>
          </div>
        </div>

        {/* Detailed Creative Dimensions Drawer for Billboard */}
        {showBannerSpecs && (
          <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-black/60 p-4 rounded-2xl backdrop-blur-md animate-in fade-in duration-200 border border-white/10">
            <div className="space-y-1">
              <div className="text-amber-300 font-bold flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5" />
                <span>Recommended Resolution</span>
              </div>
              <p className="text-stone-300 text-[11px] leading-relaxed">
                <strong>Desktop:</strong> 1200 × 400 px (3:1)<br />
                <strong>Mobile:</strong> 800 × 400 px (2:1)
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-amber-300 font-bold flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Physical Print / CM Eqv</span>
              </div>
              <p className="text-stone-300 text-[11px] leading-relaxed">
                <strong>96 DPI (Web):</strong> 31.75 cm × 10.58 cm<br />
                <strong>300 DPI (HD):</strong> 10.16 cm × 3.38 cm
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-amber-300 font-bold flex items-center gap-1">
                <Type className="w-3.5 h-3.5" />
                <span>Text & Copy Limits</span>
              </div>
              <p className="text-stone-300 text-[11px] leading-relaxed">
                <strong>Headline:</strong> Max 45 characters<br />
                <strong>Description:</strong> Max 110 characters<br />
                <strong>CTA Button:</strong> Max 18 characters
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-amber-300 font-bold flex items-center gap-1">
                <FileImage className="w-3.5 h-3.5" />
                <span>Asset Requirements</span>
              </div>
              <p className="text-stone-300 text-[11px] leading-relaxed">
                <strong>Formats:</strong> JPG, PNG, WebP<br />
                <strong>Max File Size:</strong> 1.5 MB (sRGB)<br />
                <strong>Click Action:</strong> Direct WhatsApp/Call or Website
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Special Resident Offers & Hot Deals Showcase (Monetization Slot #2) */}
      <div
        id="resident-offers-showcase"
        className="rounded-2xl bg-amber-50/80 border border-amber-200/90 p-5 sm:p-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-3">
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1 rounded-md bg-amber-500 text-white">
                <Tag className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-black text-amber-950 tracking-tight">
                Resident Special Offers & Promotions
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-200 text-amber-900 border border-amber-300">
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-amber-800 font-medium">
              Exclusive deals, resident discounts, and limited-time vouchers provided by verified Kahawa West merchants.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowDealsSpecs(!showDealsSpecs)}
              className="text-xs font-bold text-amber-900 hover:text-amber-950 px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300/80 border border-amber-300 transition flex items-center gap-1"
            >
              <Ruler className="w-3 h-3 text-amber-800" />
              <span>{showDealsSpecs ? 'Hide Specs' : 'Offer Card Specs (600×400px)'}</span>
            </button>
            <button
              onClick={onClaimListing}
              className="text-xs font-bold text-[#630303] hover:text-[#450505] flex items-center gap-1 hover:underline"
            >
              <span>Post Offer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Deals Specs Panel */}
        {showDealsSpecs && (
          <div className="p-3.5 rounded-xl bg-amber-100/90 border border-amber-300 text-xs text-amber-950 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
            <div>
              <span className="font-bold block text-amber-900">Card Graphic Size:</span>
              <span className="text-[11px] text-amber-800">600 × 400 px (3:2) • 15.88 × 10.58 cm (96 DPI) • Max 800 KB</span>
            </div>
            <div>
              <span className="font-bold block text-amber-900">Text Limits:</span>
              <span className="text-[11px] text-amber-800">Deal Title ≤ 35 chars • Promo Badge ≤ 14 chars • Details ≤ 120 chars</span>
            </div>
            <div>
              <span className="font-bold block text-amber-900">Redemption Flow:</span>
              <span className="text-[11px] text-amber-800">Direct WhatsApp/Call claim, Website or Lipa Na M-Pesa till discount on arrival</span>
            </div>
          </div>
        )}

        {/* Offers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Sample or Real business with offer */}
          {businessesWithOffers.length > 0 ? (
            businessesWithOffers.slice(0, 3).map((biz) => (
              <div
                key={biz.id}
                onClick={() => onViewBusiness(biz)}
                className="group bg-white rounded-xl p-4 border border-amber-200 hover:border-amber-400 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                      {biz.specialOffer?.badgeText || 'Special Offer'}
                    </span>
                    <span className="text-[11px] font-bold text-stone-500">{biz.zone}</span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm group-hover:text-[#630303] transition line-clamp-1">
                    {biz.name}
                  </h4>
                  <p className="text-xs font-semibold text-amber-900 mt-1">
                    {biz.specialOffer?.title}
                  </p>
                  <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">
                    {biz.specialOffer?.description || biz.tagline}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs text-[#630303] font-bold">
                  <span>View Offer Details</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))
          ) : (
            <>
              {/* Placeholder 1 */}
              <div className="bg-white/90 rounded-xl p-4 border border-dashed border-amber-300 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900">
                      Sample Discount
                    </span>
                    <span className="text-[10px] font-medium text-stone-400">Jacaranda & Roundabout</span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-xs">Weekend Car Wash & Vacuum</h4>
                  <p className="text-[11px] text-amber-900 font-semibold mt-1">10% Off for Estate Residents</p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Present your directory mention or WhatsApp booking for an instant Ksh 100 discount.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] text-amber-800 font-semibold">
                  <span>Spotlight Slot Available (600×400px)</span>
                  <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                </div>
              </div>

              {/* Placeholder 2 */}
              <div className="bg-white/90 rounded-xl p-4 border border-dashed border-amber-300 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900">
                      Free Delivery
                    </span>
                    <span className="text-[10px] font-medium text-stone-400">Congo & Station</span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-xs">Fresh Farm Produce & Groceries</h4>
                  <p className="text-[11px] text-emerald-900 font-semibold mt-1">Free Doorstep Delivery on Orders over 1K</p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Delivered directly to Jacaranda, Jubilee & Mahiga within 30 minutes of ordering.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                  <span>Spotlight Slot Available (600×400px)</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>

              {/* Placeholder 3 */}
              <div className="bg-white/90 rounded-xl p-4 border border-dashed border-amber-300 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-900">
                      Special Combo
                    </span>
                    <span className="text-[10px] font-medium text-stone-400">Bima Road & Northern Bypass</span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-xs">Nyama Choma & Ugali Family Platter</h4>
                  <p className="text-[11px] text-rose-900 font-semibold mt-1">Ksh 1,200 with Free Kachumbari</p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Book table or takeaway via direct WhatsApp line with instant till confirmation.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] text-rose-800 font-semibold">
                  <span>Spotlight Slot Available (600×400px)</span>
                  <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
