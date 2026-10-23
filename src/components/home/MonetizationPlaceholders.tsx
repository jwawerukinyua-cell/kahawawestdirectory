import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Calendar,
  X,
} from 'lucide-react';
import { Business, BusinessAdCampaign } from '../../types';
import { getLiveActiveAdsFromStorage, getAdTimeRemaining } from '../../lib/adExpiryUtils';
import { ListingImage } from '../ui/ListingImage';

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
  const [showDealsSpecs, setShowDealsSpecs] = useState(false);
  const [isMobileBillboardModalOpen, setIsMobileBillboardModalOpen] = useState(false);
  const [isMobileOffersModalOpen, setIsMobileOffersModalOpen] = useState(false);

  // Load only APPROVED and UNEXPIRED live ads (status === 'active' within 7, 15, or 30 day window)
  const [approvedAds, setApprovedAds] = useState<BusinessAdCampaign[]>(() => {
    return getLiveActiveAdsFromStorage();
  });

  useEffect(() => {
    const refreshLiveAds = () => {
      const live = getLiveActiveAdsFromStorage();
      setApprovedAds(live);
    };

    // Initial check
    refreshLiveAds();

    // Check periodically for automatic expiration so expired ads instantly revert to "Own this space"
    const interval = setInterval(refreshLiveAds, 15000);
    window.addEventListener('storage', refreshLiveAds);
    window.addEventListener('focus', refreshLiveAds);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', refreshLiveAds);
      window.removeEventListener('focus', refreshLiveAds);
    };
  }, []);

  const activeBillboard = approvedAds.find((ad) => ad.format === 'homepage-billboard' || ad.format === 'category-spotlight');

  const renderBillboardContent = (isModal = false) => {
    if (activeBillboard) {
      return (
        <div
          id={isModal ? 'mobile-modal-promo-banner' : 'homepage-main-promo-banner'}
          className="relative overflow-hidden rounded-3xl bg-[#00000f] text-white p-5 sm:p-8 border-2 border-amber-400/80 shadow-2xl animate-in fade-in duration-300"
        >
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-[#630303]/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {activeBillboard.imageUrl && (
                <ListingImage
                  src={activeBillboard.imageUrl}
                  alt={`${activeBillboard.headline} - Featured Partner on Kahawa West Directory`}
                  business={{ name: activeBillboard.businessName }}
                  imageType="ad"
                  className="w-full sm:w-48 h-32 object-cover rounded-2xl border-2 border-amber-400/50 shadow-md shrink-0"
                />
              )}
              <div className="space-y-2.5 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-stone-950 shadow-md">
                    <Sparkles className="w-3.5 h-3.5 fill-stone-950" />
                    <span>{activeBillboard.badgeText || 'FEATURED PARTNER'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Editorial Placement</span>
                  </span>
                  {(() => {
                    const timeInfo = getAdTimeRemaining(activeBillboard);
                    return (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${timeInfo.badgeColorClass}`}>
                        <Clock className="w-3 h-3" />
                        <span>{timeInfo.label}</span>
                      </span>
                    );
                  })()}
                  <span className="text-xs text-stone-400">📍 {activeBillboard.targetZone}</span>
                </div>

                <div>
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wide block">
                    {activeBillboard.businessName}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                    {activeBillboard.headline}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                  {activeBillboard.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2.5 w-full md:w-auto flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (isModal) setIsMobileBillboardModalOpen(false);
                  const waText = encodeURIComponent(
                    `Hello ${activeBillboard.businessName}, I saw your official featured ad on the Kahawa West Business Directory: "${activeBillboard.headline}". I would like to make an inquiry!`
                  );
                  window.open(`https://wa.me/254764405842?text=${waText}`, '_blank', 'noopener,noreferrer');
                }}
                className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-950/40 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-stone-950" />
                <span>{activeBillboard.ctaText || 'Connect on WhatsApp'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isModal) setIsMobileBillboardModalOpen(false);
                  onOpenAdEnquiry();
                }}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm border border-white/25 flex items-center justify-center gap-1.5 transition backdrop-blur-sm cursor-pointer"
              >
                <Megaphone className="w-4 h-4 text-amber-300" />
                <span>Promote Your Shop</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        id={isModal ? 'mobile-modal-promo-banner' : 'homepage-main-promo-banner'}
        className="relative overflow-hidden rounded-3xl bg-[#00000f] text-white p-5 sm:p-8 border-2 border-amber-400/70 shadow-2xl animate-in fade-in duration-300"
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
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2.5 w-full md:w-auto flex-shrink-0">
            <button
              onClick={() => {
                if (isModal) setIsMobileBillboardModalOpen(false);
                onOpenAdEnquiry();
              }}
              className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-950/40 cursor-pointer"
            >
              <Megaphone className="w-4 h-4 text-stone-950" />
              <span>Reserve Ad Space</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (isModal) setIsMobileBillboardModalOpen(false);
                onClaimListing();
              }}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm border border-white/25 flex items-center justify-center gap-1.5 transition backdrop-blur-sm cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Claim & List Business</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderOffersContent = (isModal = false) => (
    <div
      id={isModal ? 'mobile-modal-offers-showcase' : 'resident-offers-showcase'}
      className="rounded-2xl bg-amber-50/80 border border-amber-200/90 p-4 sm:p-6 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-3">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1 rounded-md bg-amber-500 text-white">
              <Tag className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-amber-950 tracking-tight">
              Kahawa West Special Offers & Promotions
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
            className="text-xs font-bold text-amber-900 hover:text-amber-950 px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300/80 border border-amber-300 transition flex items-center gap-1 cursor-pointer"
          >
            <Ruler className="w-3 h-3 text-amber-800" />
            <span>{showDealsSpecs ? 'Hide Specs' : 'Offer Card Specs (600×400px)'}</span>
          </button>
          <button
            onClick={() => {
              if (isModal) setIsMobileOffersModalOpen(false);
              onClaimListing();
            }}
            className="text-xs font-bold text-[#630303] hover:text-[#450505] flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Post Offer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Deals Specs Panel (Retained for ad creation guidance) */}
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
        {businessesWithOffers.length > 0 ? (
          businessesWithOffers.slice(0, 3).map((biz) => (
            <div
              key={biz.id}
              onClick={() => {
                if (isModal) setIsMobileOffersModalOpen(false);
                onViewBusiness(biz);
              }}
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
            {/* Guidance Placeholder 1 */}
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

            {/* Guidance Placeholder 2 */}
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

            {/* Guidance Placeholder 3 */}
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
  );

  return (
    <>
      {/* 1. Mobile Presentation: Two sleek, compact single-line buttons to prevent scroll fatigue */}
      <div className="md:hidden my-4 space-y-2.5">
        {/* Mobile Button 1: Prime #1 Homepage Billboard */}
        <button
          type="button"
          id="mobile-billboard-trigger"
          onClick={() => setIsMobileBillboardModalOpen(true)}
          className="w-full p-3 rounded-2xl bg-gradient-to-r from-[#00000f] via-[#1a0005] to-[#2e0108] text-white border border-amber-400/80 shadow-xs flex items-center justify-between gap-3 text-left transition active:scale-[0.98] cursor-pointer"
          aria-label="Prime #1 Homepage Billboard - View details"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
              <Flame className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Prime #1 Billboard
                </span>
                <span className="text-[9px] bg-amber-400 text-stone-950 px-1.5 py-0.2 rounded font-extrabold uppercase">
                  Own This Space
                </span>
              </div>
              <p className="text-xs font-bold text-white truncate mt-0.5">
                Put Your Business in Front of 10,000+ Residents
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-400 shrink-0">
            <span className="hidden xs:inline">Details</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        {/* Mobile Button 2: Special Offers & Promotions */}
        <button
          type="button"
          id="mobile-offers-trigger"
          onClick={() => setIsMobileOffersModalOpen(true)}
          className="w-full p-3 rounded-2xl bg-amber-50/90 border border-amber-300/90 shadow-xs flex items-center justify-between gap-3 text-left transition active:scale-[0.98] cursor-pointer"
          aria-label="Kahawa West Special Offers & Promotions - View deals"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-800 shrink-0">
              <Tag className="w-4.5 h-4.5 text-amber-800" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                  Special Offers & Deals
                </span>
                <span className="text-[9px] bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded font-extrabold uppercase border border-amber-300">
                  3 Available
                </span>
              </div>
              <p className="text-xs font-bold text-amber-950 truncate mt-0.5">
                Exclusive resident discounts, vouchers & weekend combos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#630303] shrink-0">
            <span className="hidden xs:inline">View Offers</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* 2. Desktop Presentation: Full layout expanded */}
      <div className="hidden md:block space-y-8 my-8">
        {renderBillboardContent()}
        {renderOffersContent()}
      </div>

      {/* 3. Mobile Billboard Modal */}
      {isMobileBillboardModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsMobileBillboardModalOpen(false)}
        >
          <div
            className="bg-[#00000f] text-white w-full sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border-t-2 sm:border-2 border-amber-400/80 shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-amber-400/30">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider">
                  Prime #1 Homepage Billboard
                </h3>
              </div>
              <button
                onClick={() => setIsMobileBillboardModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderBillboardContent(true)}
          </div>
        </div>
      )}

      {/* 4. Mobile Special Offers Modal */}
      {isMobileOffersModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsMobileOffersModalOpen(false)}
        >
          <div
            className="bg-[#FAF8F5] text-stone-900 w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border-t-2 sm:border-2 border-amber-300 shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-800" />
                <h3 className="text-sm font-black text-[#630303] uppercase tracking-wider">
                  Kahawa West Special Offers & Promotions
                </h3>
              </div>
              <button
                onClick={() => setIsMobileOffersModalOpen(false)}
                className="p-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderOffersContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
