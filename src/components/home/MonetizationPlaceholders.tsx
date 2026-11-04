import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Clock,
  Sparkles,
  X,
  Activity,
  Share2,
  Copy,
  Check,
  MapPin,
  Building2,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { Business, BusinessAdCampaign } from '../../types';
import {
  getLiveActiveAdsFromStorage,
  getAdTimeRemaining,
} from '../../lib/adExpiryUtils';
import { ListingImage } from '../ui/ListingImage';
import { formatKenyanPhoneForTel, formatPhoneForDisplay, getWhatsAppChatUrl } from '../../lib/phoneUtils';
import {
  getAdCampaignAnalytics,
  recordAdImpression,
  recordAdDwellTime,
  recordAdClick,
  AdCampaignAnalytics,
} from '../../lib/tracking';

interface MonetizationPlaceholdersProps {
  businessesWithOffers: Business[];
  allBusinesses?: Business[];
  onViewBusiness: (biz: Business) => void;
  onClaimListing: () => void;
  onOpenAdEnquiry: () => void;
}

export const MonetizationPlaceholders: React.FC<MonetizationPlaceholdersProps> = ({
  allBusinesses = [],
  onViewBusiness,
  onOpenAdEnquiry,
}) => {
  // Load approved and live active ads from storage
  const [approvedAds, setApprovedAds] = useState<BusinessAdCampaign[]>(() => {
    return getLiveActiveAdsFromStorage();
  });

  useEffect(() => {
    const refreshLiveAds = () => {
      const live = getLiveActiveAdsFromStorage();
      setApprovedAds(live);
    };

    refreshLiveAds();
    const interval = setInterval(refreshLiveAds, 15000);
    window.addEventListener('storage', refreshLiveAds);
    window.addEventListener('focus', refreshLiveAds);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', refreshLiveAds);
      window.removeEventListener('focus', refreshLiveAds);
    };
  }, []);

  // Primary Billboard: Find any genuinely active paid billboard campaign
  const activeBillboard = approvedAds.find(
    (ad) =>
      ad.status === 'active' &&
      (ad.format === 'homepage-billboard' || ad.format === 'homepage-banner')
  );

  // Modals state for active billboard campaigns
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeShareTab, setActiveShareTab] = useState<'full' | 'short' | 'facebook'>('full');

  // Tracking for Active Billboard (when present)
  const [billboardStats, setBillboardStats] = useState<AdCampaignAnalytics | null>(() =>
    activeBillboard ? getAdCampaignAnalytics(activeBillboard.id) : null
  );

  useEffect(() => {
    if (!activeBillboard) return;

    recordAdImpression(activeBillboard.id, activeBillboard.businessId);
    setBillboardStats(getAdCampaignAnalytics(activeBillboard.id));

    const startTime = Date.now();
    let accumulatedSeconds = 0;

    const flushDwellTime = () => {
      const now = Date.now();
      const elapsed = Math.round((now - startTime) / 1000) - accumulatedSeconds;
      if (elapsed >= 1) {
        accumulatedSeconds += elapsed;
        recordAdDwellTime(activeBillboard.id, elapsed);
      }
    };

    const dwellInterval = setInterval(flushDwellTime, 10000);
    const handleVisibilityChange = () => {
      if (document.hidden) flushDwellTime();
    };

    const handleAnalyticsUpdate = (e: Event) => {
      const detail = (e as CustomEvent<AdCampaignAnalytics>).detail;
      if (detail && detail.campaignId === activeBillboard.id) {
        setBillboardStats({ ...detail });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('kwest_ad_analytics_updated', handleAnalyticsUpdate);
    window.addEventListener('beforeunload', flushDwellTime);

    return () => {
      clearInterval(dwellInterval);
      flushDwellTime();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('kwest_ad_analytics_updated', handleAnalyticsUpdate);
      window.removeEventListener('beforeunload', flushDwellTime);
    };
  }, [activeBillboard?.id]);

  // Lookup matched business for active billboard
  const matchedBiz = activeBillboard
    ? allBusinesses.find(
        (b) => b.id === activeBillboard.businessId || b.slug === activeBillboard.businessId
      )
    : null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  /**
   * -------------------------------------------------------------
   * DEFAULT BILLBOARD PLACEHOLDER (When No Paid Ad Is Currently Active)
   * -------------------------------------------------------------
   * Mobile: Compact 1x grid listing card (~160px tall, zero scroll fatigue).
   * Desktop: Full widescreen spacious executive banner.
   */
  const renderDefaultBillboard = () => {
    return (
      <div id="homepage-main-promo-banner" className="w-full">
        {/* MOBILE VIEW: Ultra-compact 1x listing card style */}
        <div
          onClick={onOpenAdEnquiry}
          className="block sm:hidden bg-gradient-to-r from-stone-950 via-[#140f0d] to-stone-900 rounded-2xl border-2 border-amber-400/80 shadow-md p-3.5 cursor-pointer active:scale-[0.99] transition font-sans"
        >
          <div className="flex items-start gap-3">
            {/* Left compact icon thumbnail */}
            <div className="w-14 h-14 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-inner mt-0.5">
              <Megaphone className="w-7 h-7 text-amber-400" />
            </div>

            {/* Right details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-amber-400 text-stone-950">
                  <Sparkles className="w-2.5 h-2.5 fill-stone-950" />
                  <span>PRIME BILLBOARD</span>
                </span>
                <span className="text-[9.5px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  Available Slot
                </span>
              </div>

              <h3 className="font-display font-black text-white text-xs sm:text-sm leading-snug line-clamp-1">
                Place Your Business at the Top of Kahawa West
              </h3>

              <p className="text-[11px] text-stone-300 line-clamp-2 mt-0.5 leading-snug">
                Seen by 5,000+ local residents weekly. Direct WhatsApp and call inquiries.
              </p>
            </div>
          </div>

          {/* Compact bottom action strip */}
          <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold text-amber-300">
              From KSh 100/day
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAdEnquiry();
              }}
              className="py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Megaphone className="w-3.5 h-3.5 fill-stone-950 shrink-0" />
              <span>Reserve Space</span>
            </button>
          </div>
        </div>

        {/* DESKTOP VIEW: Full-width executive spacious billboard */}
        <div className="hidden sm:block relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-950 via-[#18110e] to-stone-900 text-white p-7 md:p-8 border-2 border-amber-400/90 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 -mb-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex gap-5 items-start max-w-2xl">
              <div className="w-20 h-20 rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-xl">
                <Megaphone className="w-10 h-10 text-amber-400" />
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-stone-950 shadow-md">
                    <Sparkles className="w-3.5 h-3.5 fill-stone-950" />
                    <span>PREMIER HOMEPAGE BILLBOARD</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>High-Visibility Slot Available</span>
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
                  Put Your Business Front &amp; Center in Kahawa West
                </h3>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                  The #1 promotional position on kahawawestdirectory.co.ke. Reach thousands of verified estate shoppers, tenants, and families looking for products, rentals, and services daily.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-stone-300 pt-1">
                  <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>5,000+ Local Weekly Views</span>
                  </span>
                  <span>• Direct Calls &amp; WhatsApp Links</span>
                  <span>• Packages from KSh 700 / week</span>
                </div>
              </div>
            </div>

            {/* Desktop Action Box */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
              <button
                type="button"
                onClick={onOpenAdEnquiry}
                className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-black text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-950/50 cursor-pointer"
              >
                <Megaphone className="w-4 h-4 fill-stone-950 shrink-0" />
                <span>Reserve Billboard Space</span>
              </button>
              <a
                href="https://wa.me/254764405842?text=Hello%20Kahawa%20West%20Directory%2C%20I%20would%20like%20to%20inquire%20about%20booking%20the%20Premier%20Homepage%20Billboard%20ad%20space."
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 font-bold text-xs flex items-center justify-center gap-2 transition border border-stone-700 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Inquire on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * -------------------------------------------------------------
   * ACTIVE PAID BILLBOARD (When a Merchant Has Booked & Approved Billboard)
   * -------------------------------------------------------------
   * Mobile: Compact 1x grid listing card (~160px–180px tall, zero scroll fatigue).
   * Desktop: Full widescreen spacious executive banner.
   */
  const renderActiveBillboard = (ad: BusinessAdCampaign) => {
    const timeInfo = getAdTimeRemaining(ad);
    const displayPhone = ad.targetZone?.includes('07') ? 'Direct Contact' : 'Call Advertiser';
    const telHref = matchedBiz?.phone ? formatKenyanPhoneForTel(matchedBiz.phone) : undefined;
    const waHref = matchedBiz?.whatsapp || matchedBiz?.phone
      ? getWhatsAppChatUrl(
          matchedBiz.whatsapp || matchedBiz.phone,
          `Hello ${ad.businessName}, I saw your featured billboard on the Kahawa West Directory and would like to inquire.`
        )
      : undefined;

    return (
      <div id="homepage-main-promo-banner" className="w-full">
        {/* MOBILE VIEW: Ultra-compact 1x listing card style */}
        <div className="block sm:hidden bg-stone-950 rounded-2xl border-2 border-amber-400/90 shadow-md p-3 font-sans">
          <div className="flex items-start gap-3">
            {/* Left compact thumbnail */}
            {ad.imageUrl && (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-amber-400/60 shadow-xs">
                <ListingImage
                  src={ad.imageUrl}
                  alt={ad.headline}
                  business={{ name: ad.businessName }}
                  imageType="ad"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Right content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-400 text-stone-950">
                  <Sparkles className="w-2.5 h-2.5 fill-stone-950" />
                  <span>SPONSORED</span>
                </span>
                <span className="text-[9.5px] font-extrabold text-amber-300 truncate">
                  {ad.businessName}
                </span>
              </div>

              <h3 className="font-display font-bold text-white text-xs leading-snug line-clamp-1">
                {ad.headline}
              </h3>

              <p className="text-[10.5px] text-stone-300 line-clamp-1 mt-0.5">
                {ad.description}
              </p>
            </div>
          </div>

          {/* Compact bottom action row */}
          <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center gap-1.5">
            {telHref && (
              <a
                href={telHref}
                onClick={() => recordAdClick(ad.id, 'call')}
                className="flex-1 py-1.5 px-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 text-[11px] font-black flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                <Phone className="w-3 h-3 fill-stone-950 shrink-0" />
                <span>Call</span>
              </a>
            )}

            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordAdClick(ad.id, 'whatsapp')}
                className="flex-1 py-1.5 px-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-stone-950 text-[11px] font-black flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-3 h-3 fill-stone-950 shrink-0" />
                <span>WhatsApp</span>
              </a>
            )}

            {matchedBiz && (
              <button
                type="button"
                onClick={() => {
                  recordAdClick(ad.id, 'profile');
                  onViewBusiness(matchedBiz);
                }}
                className="py-1.5 px-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-bold border border-stone-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* DESKTOP VIEW: Full-width executive spacious billboard */}
        <div className="hidden sm:block relative overflow-hidden rounded-3xl bg-[#090b14] text-white p-6 sm:p-7 md:p-8 border-2 border-amber-400/90 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 -mb-10 w-72 h-72 bg-[#630303]/35 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-2">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {ad.imageUrl && (
                <div className="relative shrink-0 w-full sm:w-60 h-44 rounded-2xl overflow-hidden border-2 border-amber-400/70 shadow-xl group">
                  <ListingImage
                    src={ad.imageUrl}
                    alt={ad.headline}
                    business={{ name: ad.businessName }}
                    imageType="ad"
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                  {ad.targetZone && (
                    <span className="absolute bottom-2.5 left-2.5 text-[11px] font-bold text-amber-200 bg-black/85 px-2.5 py-1 rounded-lg backdrop-blur-xs border border-amber-400/40 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{ad.targetZone}</span>
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-stone-950 shadow-md">
                    <Sparkles className="w-3.5 h-3.5 fill-stone-950" />
                    <span>{ad.badgeText || 'FEATURED SPONSOR'}</span>
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${timeInfo.badgeColorClass}`}>
                    <Clock className="w-3 h-3" />
                    <span>{timeInfo.label}</span>
                  </span>
                  {billboardStats && (
                    <button
                      type="button"
                      onClick={() => setIsStatsModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 hover:bg-amber-400/35 text-amber-300 border border-amber-400/50 transition cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>Stats: {billboardStats.impressions} views • {billboardStats.totalClicks} clicks</span>
                    </button>
                  )}
                </div>

                <div>
                  <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{ad.businessName}</span>
                  </span>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                    {ad.headline}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-sans">
                  {ad.description}
                </p>
              </div>
            </div>

            {/* Desktop Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
              {telHref && (
                <a
                  href={telHref}
                  onClick={() => recordAdClick(ad.id, 'call')}
                  className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-black text-sm flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
                >
                  <Phone className="w-4 h-4 fill-stone-950 shrink-0" />
                  <span>{displayPhone}</span>
                </a>
              )}

              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => recordAdClick(ad.id, 'whatsapp')}
                  className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-stone-950 shrink-0" />
                  <span>WhatsApp Inquiry</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-white font-bold text-xs sm:text-sm border border-stone-700 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Share Ad</span>
              </button>

              {matchedBiz && (
                <button
                  type="button"
                  onClick={() => {
                    recordAdClick(ad.id, 'profile');
                    onViewBusiness(matchedBiz);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition border border-white/20 cursor-pointer"
                >
                  <span>View Full Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Real-time Analytics Modal (For Active Campaigns)
   */
  const renderStatsModal = () => {
    if (!activeBillboard || !billboardStats) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
        <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative space-y-4">
          <button
            type="button"
            onClick={() => setIsStatsModalOpen(false)}
            className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-full bg-stone-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-amber-400">
            <Activity className="w-5 h-5 animate-pulse" />
            <h4 className="font-display font-bold text-lg">Campaign Analytics</h4>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 text-center">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Views</span>
              <span className="text-xl font-black text-white">{billboardStats.impressions}</span>
            </div>
            <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 text-center">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Avg Stay</span>
              <span className="text-xl font-black text-amber-300">{billboardStats.avgDwellSeconds}s</span>
            </div>
            <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 text-center">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Clicks</span>
              <span className="text-xl font-black text-emerald-400">{billboardStats.totalClicks}</span>
            </div>
          </div>
          <p className="text-xs text-stone-400 text-center">
            Updated in real-time as local residents browse the directory.
          </p>
        </div>
      </div>
    );
  };

  /**
   * Share Ad Modal (For Active Campaigns)
   */
  const renderShareModal = () => {
    if (!activeBillboard) return null;
    const shareText = `🌟 *FEATURED ON KAHAWA WEST DIRECTORY* 🌟\n\n*${activeBillboard.businessName}*\n${activeBillboard.headline}\n\n${activeBillboard.description}\n\n🔗 View on directory: https://www.kahawawestdirectory.co.ke`;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
        <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative space-y-4">
          <button
            type="button"
            onClick={() => setIsShareModalOpen(false)}
            className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-full bg-stone-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-emerald-400">
            <Share2 className="w-5 h-5" />
            <h4 className="font-display font-bold text-lg">Share Advertisement</h4>
          </div>
          <textarea
            readOnly
            value={shareText}
            rows={6}
            className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 select-all resize-none"
          />
          <button
            type="button"
            onClick={() => handleCopy(shareText, 'share')}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            {copiedType === 'share' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedType === 'share' ? 'Copied to Clipboard!' : 'Copy to Share'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="my-3 sm:my-8">
      {/* Prime Homepage Billboard (Active Campaign or Default Placeholder) */}
      {activeBillboard ? renderActiveBillboard(activeBillboard) : renderDefaultBillboard()}

      {/* Campaign Analytics Modal */}
      {isStatsModalOpen && renderStatsModal()}

      {/* Campaign Share Modal */}
      {isShareModalOpen && renderShareModal()}
    </div>
  );
};
