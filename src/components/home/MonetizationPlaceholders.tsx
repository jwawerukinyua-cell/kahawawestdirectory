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
  BarChart2,
  Activity,
  Timer,
  Users,
  Eye,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { Business, BusinessAdCampaign, CollectiveMember } from '../../types';
import { getLiveActiveAdsFromStorage, getAdTimeRemaining } from '../../lib/adExpiryUtils';
import { ListingImage } from '../ui/ListingImage';
import { formatKenyanPhoneForTel, formatPhoneForDisplay, getWhatsAppChatUrl } from '../../lib/phoneUtils';
import {
  getAdCampaignAnalytics,
  recordAdImpression,
  recordAdDwellTime,
  recordAdClick,
  AdCampaignAnalytics,
} from '../../lib/tracking';

const DEFAULT_KARURA_MEMBERS: CollectiveMember[] = [
  {
    id: 'member-1',
    name: 'Purity Mugambi',
    role: 'Collective Member & Listing Contact',
    phone: '+254703272467',
    whatsapp: '+254703272467',
    specialty: 'Deep Home Cleaning, Kitchen & Window Scrubbing',
    photoUrl: '',
    isRepresentative: true,
  },
  {
    id: 'member-2',
    name: 'Susan (Wa Shantel) Nafula',
    role: 'Collective Member',
    phone: '0143 469509',
    whatsapp: '254143469509',
    specialty: 'Mama Fua Hand Laundry, Duvets & Curtain Washing',
    photoUrl: '/karura-gallery-0.jpg',
    isRepresentative: false,
  },
  {
    id: 'member-3',
    name: 'Rachel Makena',
    role: 'Collective Member',
    phone: '0714 318077',
    whatsapp: '254714318077',
    specialty: 'Home Scrubbing, Move-in & Move-out House Prep',
    photoUrl: '/karura-gallery-1.jpg',
    isRepresentative: false,
  },
  {
    id: 'member-4',
    name: 'Agnes Kamau',
    role: 'Collective Member',
    phone: '0719 819632',
    whatsapp: '254719819632',
    specialty: 'Tile Scrubbing, Floor Buffing & Balcony Washing',
    photoUrl: '',
    isRepresentative: false,
  },
  {
    id: 'member-5',
    name: 'Ann Muthama',
    role: 'Collective Member',
    phone: '0790 385663',
    whatsapp: '254790385663',
    specialty: 'Compound Weeding, Yard Sweeping & Domestic Garment Care',
    photoUrl: '',
    isRepresentative: false,
  },
];

interface MonetizationPlaceholdersProps {
  businessesWithOffers: Business[];
  allBusinesses?: Business[];
  onViewBusiness: (biz: Business) => void;
  onClaimListing: () => void;
  onOpenAdEnquiry: () => void;
}

export const MonetizationPlaceholders: React.FC<MonetizationPlaceholdersProps> = ({
  businessesWithOffers,
  allBusinesses = [],
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

  const campaignId = activeBillboard?.id || 'ad-karura-collective-001';
  const [adStats, setAdStats] = useState<AdCampaignAnalytics>(() => getAdCampaignAnalytics(campaignId));
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeShareTab, setActiveShareTab] = useState<'full' | 'short' | 'facebook'>('full');

  const getAdShareLink = () => {
  return 'https://www.kahawawestdirectory.co.ke';
};

  const getFullPostText = () => {
    const link = getAdShareLink();
    return `✨ *SUPPORT OUR LOCAL MAMA FUA HEROES OF KAHAWA WEST* ✨

When you walk along Karura Road, just by the junction of Church Avenue under the big Fig Tree, you will find 5 hardworking, vetted women who have been the quiet backbone of our homes across Jacaranda, Congo, Soweto, Mahiga, Kamae, and Bima.

Rather than giving cuts to exploitative agencies or middlemen, they have formed the *Karura Women's Cleaning Collective* — 100% of whatever you pay goes directly into their hands to feed and educate their families. 💙

Whether you need a trusted Mama Fua for thorough hand laundry, duvets, blankets, or move-in/move-out floor scrubbing — here are their direct lines. Call or WhatsApp any of them directly:

1️⃣ *Purity Mugambi* (Coordinator): 0703 272 467
• Deep Home Cleaning, Kitchen & Window Scrubbing

2️⃣ *Susan (Wa Shantel) Nafula*: 0143 469 509
• Mama Fua Hand Laundry, Duvets & Curtain Washing

3️⃣ *Rachel Makena*: 0714 318 077
• Home Scrubbing, Move-in & Move-out House Prep

4️⃣ *Agnes Kamau*: 0719 819 632
• Tile Scrubbing, Floor Buffing & Balcony Washing

5️⃣ *Ann Muthama*: 0790 385 663
• Compound Weeding, Yard Sweeping & Garment Care

📍 *Location:* Under the Fig Tree, Church Ave & Karura Rd (Opp. Green Cottage School)
⭐ *Zero agency commissions • Verified Kahawa West Residents*

🔗 *View their collective profile & photos on Kahawa West Directory:*
${link}

_Please forward to your estate and church groups to support these women!_ 🙏`;
  };

  const getShortPostText = () => {
    const link = getAdShareLink();
    return `🧺 *Need a trusted Mama Fua in Kahawa West?*
5 vetted local women under the Karura Rd Fig Tree are available for hand laundry, duvets & deep house cleaning. Zero agency cuts!

📞 *Direct Lines:*
• Purity (Coord): 0703 272 467
• Susan Nafula: 0143 469 509
• Rachel Makena: 0714 318 077
• Agnes Kamau: 0719 819 632
• Ann Muthama: 0790 385 663

🔗 See full details on Kahawa West Directory:
${link}`;
  };

  const getFacebookPostText = () => {
    const link = getAdShareLink();
    return `👋 Kahawa West Neighbours,

If you are in Jacaranda, Congo, Soweto, Mahiga, Bima or Kamae and looking for reliable, honest domestic support, please support the Karura Women's Cleaning Collective!

Under the Fig Tree at the junction of Church Avenue and Karura Road (opposite Green Cottage School), 5 vetted local women have assembled as an equal collective. They do thorough Mama Fua hand laundry, duvets, curtain washing, and deep house move-in cleaning.

Because there is NO middleman agency, 100% of what you pay supports their households and children directly.

Direct contacts:
• Purity Mugambi: 0703 272 467
• Susan (Wa Shantel) Nafula: 0143 469 509
• Rachel Makena: 0714 318 077
• Agnes Kamau: 0719 819 632
• Ann Muthama: 0790 385 663

View full details & photos on the directory:
${link}`;
  };

  // Track impressions, dwell time (seconds stay on ad), and listen for stats updates
  useEffect(() => {
    if (!activeBillboard) return;

    // 1. Record impression once per component mount session
    recordAdImpression(activeBillboard.id, activeBillboard.businessId);
    setAdStats(getAdCampaignAnalytics(activeBillboard.id));

    // 2. Track stay duration (dwell time) using page visibility & timer
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

    // Periodically log dwell time every 10 seconds while active on page
    const dwellInterval = setInterval(flushDwellTime, 10000);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        flushDwellTime();
      }
    };

    const handleAnalyticsUpdate = (e: Event) => {
      const detail = (e as CustomEvent<AdCampaignAnalytics>).detail;
      if (detail && detail.campaignId === activeBillboard.id) {
        setAdStats({ ...detail });
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

  const matchedBusiness =
    allBusinesses.find((b) => b.id === activeBillboard?.businessId) ||
    allBusinesses.find((b) => b.name === activeBillboard?.businessName) ||
    (activeBillboard?.businessId === 'kw-biz-09' ? allBusinesses.find((b) => b.id === 'kw-biz-09') : undefined);

  const isCollectiveAd = Boolean(
    matchedBusiness?.isCollective ||
    (matchedBusiness?.collectiveMembers && matchedBusiness.collectiveMembers.length > 0) ||
    activeBillboard?.businessId === 'kw-biz-09'
  );

  const rawMembers = matchedBusiness?.collectiveMembers;
  const collectiveMembers: CollectiveMember[] =
    rawMembers && rawMembers.length > 0 ? rawMembers : (isCollectiveAd ? DEFAULT_KARURA_MEMBERS : []);

  const renderBillboardContent = (isModal = false) => {
    if (activeBillboard) {
      return (
        <div
          id={isModal ? 'mobile-modal-promo-banner' : 'homepage-main-promo-banner'}
          className="relative overflow-hidden rounded-3xl bg-[#00000f] text-white p-5 sm:p-7 md:p-8 border-2 border-amber-400/80 shadow-2xl animate-in fade-in duration-300"
        >
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-[#630303]/30 rounded-full blur-3xl pointer-events-none" />

          {/* Top Row: Billboard Imagery, Headlines & Core Action */}
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-2">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {activeBillboard.imageUrl && (
                <div className="relative shrink-0 w-full sm:w-56 h-40 rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-lg group">
                  <ListingImage
                    src={activeBillboard.imageUrl}
                    alt={`${activeBillboard.headline} - Featured Partner on Kahawa West Directory`}
                    business={{ name: activeBillboard.businessName }}
                    imageType="ad"
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold text-amber-200 bg-black/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    Karura Rd Fig Tree
                  </span>
                </div>
              )}
              <div className="space-y-2.5 max-w-2xl">
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
                  <button
                    type="button"
                    onClick={() => setIsStatsModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 hover:bg-amber-400/35 text-amber-300 border border-amber-400/50 transition cursor-pointer active:scale-95 shadow-xs"
                    title="View live ad visitor stay duration & click tracking"
                  >
                    <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Live Stats: {adStats?.impressions ?? 0} views • {adStats?.avgDwellSeconds ?? 0}s stay • {adStats?.totalClicks ?? 0} clicks</span>
                  </button>
                  <span className="text-xs text-stone-300">📍 {activeBillboard.targetZone}</span>
                </div>

                <div>
                  <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wide block mb-0.5">
                    {activeBillboard.businessName}
                  </span>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                    {activeBillboard.headline}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-sans">
                  {activeBillboard.description}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons on Desktop / Top Area */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0 self-stretch lg:self-center">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/40 cursor-pointer"
                title="Share Karura Women's Collective details"
              >
                <Share2 className="w-4 h-4 text-emerald-200" />
                <span>Share</span>
              </button>

              {matchedBusiness && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeBillboard) {
                      recordAdClick(activeBillboard.id, 'profile');
                    }
                    if (isModal) setIsMobileBillboardModalOpen(false);
                    onViewBusiness(matchedBusiness);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-950/40 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>View Full Profile</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (isModal) setIsMobileBillboardModalOpen(false);
                  onOpenAdEnquiry();
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm border border-white/25 flex items-center justify-center gap-1.5 transition backdrop-blur-sm cursor-pointer"
              >
                <Megaphone className="w-4 h-4 text-amber-300" />
                <span>Reserve Billboard Space</span>
              </button>
            </div>
          </div>

          {/* Special Feature for Karura Collective: Call Any of the 5 Ladies Directly */}
          {isCollectiveAd && collectiveMembers.length > 0 && (
            <div className="relative z-10 mt-6 pt-5 border-t border-amber-400/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <Phone className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider">
                      Direct Lines: Tap to Call or WhatsApp Any of the 5 Ladies
                    </h4>
                    <p className="text-[11px] text-stone-300">
                      Zero agency commissions • 100% of your payment goes directly to each lady and her family
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>5 Vetted Karura Residents</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/50 text-emerald-300 text-[11px] font-bold transition active:scale-95 cursor-pointer"
                    title="Share details"
                  >
                    <Share2 className="w-3 h-3 text-emerald-400" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Grid of the 5 Ladies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {collectiveMembers.map((member, index) => {
                  const telHref = formatKenyanPhoneForTel(member.phone);
                  const waHref = getWhatsAppChatUrl(
                    member.whatsapp || member.phone,
                    `Hello ${member.name}, I saw the Karura Women's Collective Billboard Ad on the Kahawa West Directory. I would like to book cleaning / laundry services.`
                  );

                  const initials = member.name
                    .replace(/[()]/g, ' ')
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);

                  const avatarColors = [
                    'from-rose-500 to-amber-500 text-white',
                    'from-emerald-500 to-teal-600 text-white',
                    'from-blue-500 to-indigo-600 text-white',
                    'from-purple-500 to-pink-600 text-white',
                    'from-amber-500 to-orange-600 text-white',
                  ];
                  const colorClass = avatarColors[index % avatarColors.length];

                  return (
                    <div
                      key={member.id || `billboard-member-${index}`}
                      className="bg-stone-900/90 rounded-2xl p-3 border border-stone-700/80 hover:border-amber-400/80 transition flex flex-col justify-between shadow-lg"
                    >
                      <div>
                        {/* Member Header */}
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="relative shrink-0">
                            {member.photoUrl && member.photoUrl.trim() !== '' ? (
                              <img
                                src={member.photoUrl}
                                alt={`Photo of ${member.name}`}
                                className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-sm"
                              />
                            ) : (
                              <div
                                className={`w-11 h-11 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center font-extrabold text-xs shadow-sm border border-white/40`}
                              >
                                {initials}
                              </div>
                            )}
                            <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-amber-400 text-stone-950 text-[9px] font-black flex items-center justify-center">
                              #{index + 1}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-white text-xs truncate leading-snug">
                              {member.name}
                            </h5>
                            <span className="text-[10px] text-amber-300/90 font-medium block truncate">
                              {member.isRepresentative ? 'Coordinator' : 'Collective Member'}
                            </span>
                          </div>
                        </div>

                        {/* Specialty Snippet */}
                        {member.specialty && (
                          <div className="text-[11px] text-stone-300 leading-snug mb-2 bg-stone-950/60 p-2 rounded-xl border border-stone-800 line-clamp-2">
                            {member.specialty}
                          </div>
                        )}

                        {/* Complete Mobile & Direct Contact Information */}
                        <div className="mb-2.5 px-2 py-1 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-between gap-1 text-[11px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="font-mono font-bold text-amber-300 tracking-wide select-all text-xs">
                              {formatPhoneForDisplay(member.phone)}
                            </span>
                          </div>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 shrink-0">
                            Direct Line
                          </span>
                        </div>
                      </div>

                      {/* Direct Call & WhatsApp Action Buttons */}
                      <div className="pt-2 border-t border-stone-800 flex items-center gap-1.5">
                        <a
                          href={telHref}
                          onClick={() => {
                            if (activeBillboard) {
                              recordAdClick(activeBillboard.id, 'call', member.name);
                            }
                          }}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 text-[11px] font-black flex items-center justify-center gap-1 transition shadow-xs"
                          title={`Direct call to ${member.name}: ${formatPhoneForDisplay(member.phone)}`}
                        >
                          <Phone className="w-3 h-3 fill-stone-950 shrink-0" />
                          <span className="font-mono font-black">Call {formatPhoneForDisplay(member.phone)}</span>
                        </a>

                        {member.whatsapp && (
                          <a
                            href={waHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              if (activeBillboard) {
                                recordAdClick(activeBillboard.id, 'whatsapp', member.name);
                              }
                            }}
                            className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white transition flex items-center justify-center shadow-xs"
                            title={`WhatsApp chat with ${member.name}: ${formatPhoneForDisplay(member.phone)}`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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

  const renderStatsModal = () => {
    const stats = adStats || getAdCampaignAnalytics(activeBillboard?.id || 'ad-karura-collective-001');
    const impressions = Math.max(1, stats.impressions);
    const ctr = ((stats.totalClicks / impressions) * 100).toFixed(1);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
        onClick={() => setIsStatsModalOpen(false)}
      >
        <div
          className="bg-stone-950 text-white w-full max-w-2xl rounded-3xl border-2 border-amber-400/80 shadow-2xl p-5 sm:p-6 space-y-6 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40">
                <BarChart2 className="w-6 h-6 text-amber-400" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Ad Performance &amp; Visitor Stay Tracker
                  </h3>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold uppercase">
                    Live Tracking Active
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  7-Day Test Campaign: Karura Women&apos;s Cleaning Collective Billboard
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsStatsModalOpen(false)}
              className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-900/90 rounded-2xl p-3.5 border border-stone-800">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Impressions</span>
                <Eye className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">{stats.impressions}</div>
              <div className="text-[10px] text-stone-400 mt-0.5">Ad feed views</div>
            </div>

            <div className="bg-stone-900/90 rounded-2xl p-3.5 border border-stone-800">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Avg Stay</span>
                <Timer className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">{stats.avgDwellSeconds}s</div>
              <div className="text-[10px] text-stone-400 mt-0.5">Time on ad (dwell)</div>
            </div>

            <div className="bg-stone-900/90 rounded-2xl p-3.5 border border-stone-800">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Inquiries</span>
                <Phone className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white">{stats.totalClicks}</div>
              <div className="text-[10px] text-stone-400 mt-0.5">Calls &amp; WhatsApps</div>
            </div>

            <div className="bg-stone-900/90 rounded-2xl p-3.5 border border-stone-800">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">CTR</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300">{ctr}%</div>
              <div className="text-[10px] text-stone-400 mt-0.5">Click-through rate</div>
            </div>
          </div>

          {/* Breakdown per Collective Member */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>Inquiries Breakdown by Mama Fua Member</span>
              </h4>
              <span className="text-[11px] text-stone-400">
                {stats.callsCount} Phone Calls • {stats.whatsappCount} WhatsApp Chats
              </span>
            </div>

            <div className="space-y-2 bg-stone-900/70 p-3.5 rounded-2xl border border-stone-800 divide-y divide-stone-800/60 max-h-60 overflow-y-auto">
              {collectiveMembers.map((member) => {
                const memberData = stats.memberClicks[member.name] || { calls: 0, whatsapp: 0 };
                return (
                  <div key={member.name} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white truncate">{member.name}</div>
                        <div className="text-[10px] text-stone-400 truncate">
                          <span className="font-mono text-amber-300 font-semibold">{formatPhoneForDisplay(member.phone)}</span> • {member.specialty}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
                        📞 {memberData.calls} calls
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                        💬 {memberData.whatsapp} WA
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Technical Tracking Architecture Box */}
          <div className="bg-stone-900/40 p-4 rounded-2xl border border-stone-800 text-xs text-stone-300 space-y-1.5">
            <div className="font-bold text-stone-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>How We Track Clicks &amp; Stay Duration on the Ad</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-stone-400 text-[11px] pl-1">
              <li><strong className="text-stone-300">Impressions:</strong> Logged automatically when the ad enters the visitor&apos;s viewport/feed.</li>
              <li><strong className="text-stone-300">Stay Duration (Dwell Time):</strong> Active seconds tracked via Page Lifecycle &amp; Visibility API every 10s and on exit.</li>
              <li><strong className="text-stone-300">Direct Action Clicks:</strong> Tracked on each member&apos;s Call, WhatsApp, and Collective profile buttons.</li>
              <li><strong className="text-stone-300">Storage &amp; Events:</strong> Synchronized across device storage and Google Analytics (gtag ad events).</li>
            </ul>
          </div>

          {/* Footer action */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsStatsModalOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs transition cursor-pointer"
            >
              Done Viewing Stats
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderShareModal = () => {
    const link = getAdShareLink();
    let currentText = getFullPostText();
    if (activeShareTab === 'short') currentText = getShortPostText();
    if (activeShareTab === 'facebook') currentText = getFacebookPostText();

    const handleCopy = async (text: string, type: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedType(type);
        setTimeout(() => setCopiedType(null), 2500);
      } catch {}
    };

    const handleWhatsAppShare = () => {
      if (activeBillboard) {
        recordAdClick(activeBillboard.id, 'profile');
      }
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(currentText)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    };

    const handleNativeShare = async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Karura Women's Cleaning Collective - Mama Fua Direct Numbers",
            text: currentText,
            url: link,
          });
          if (activeBillboard) {
            recordAdClick(activeBillboard.id, 'profile');
          }
        } catch {}
      } else {
        handleCopy(currentText, 'post');
      }
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
        onClick={() => setIsShareModalOpen(false)}
      >
        <div
          className="bg-stone-950 text-white w-full max-w-2xl rounded-3xl border-2 border-emerald-500/80 shadow-2xl p-5 sm:p-6 space-y-5 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Share2 className="w-6 h-6 text-emerald-400" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Share with Estate Groups &amp; Friends
                  </h3>
                  <span className="text-[10px] bg-emerald-500 text-stone-950 px-2 py-0.5 rounded-full font-black uppercase">
                    Ready to Send
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Pre-formatted message with verified direct mobile numbers for all 5 Mama Fua ladies
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Share Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-stone-950" />
              <span>Share to WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopy(currentText, 'post')}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
            >
              {copiedType === 'post' ? (
                <>
                  <Check className="w-4 h-4 text-stone-950" />
                  <span>Message Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Message</span>
                </>
              )}
            </button>
          </div>

          {/* Deep Link Quick Row */}
          <div className="p-3 bg-stone-900 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="min-w-0 w-full sm:w-auto flex-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Website Link:
              </span>
              <p className="text-xs font-mono text-emerald-400 truncate select-all">
                {link}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => handleCopy(link, 'link')}
                className="flex-1 sm:flex-none py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedType === 'link' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-400" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Share using device menu"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">More</span>
                </button>
              )}
            </div>
          </div>

          {/* Post Variation Tabs */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 border-b border-stone-800 pb-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveShareTab('full')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  activeShareTab === 'full'
                    ? 'bg-emerald-500 text-stone-950 font-black'
                    : 'bg-stone-900 text-stone-300 hover:text-white'
                }`}
              >
                Estate WhatsApp Groups
              </button>
              <button
                type="button"
                onClick={() => setActiveShareTab('short')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  activeShareTab === 'short'
                    ? 'bg-emerald-500 text-stone-950 font-black'
                    : 'bg-stone-900 text-stone-300 hover:text-white'
                }`}
              >
                Quick Status
              </button>
              <button
                type="button"
                onClick={() => setActiveShareTab('facebook')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  activeShareTab === 'facebook'
                    ? 'bg-emerald-500 text-stone-950 font-black'
                    : 'bg-stone-900 text-stone-300 hover:text-white'
                }`}
              >
                Facebook &amp; Forum
              </button>
            </div>

            {/* Post Preview Card */}
            <div className="relative">
              <textarea
                readOnly
                value={currentText}
                rows={9}
                className="w-full p-3.5 rounded-2xl bg-stone-900 border border-stone-800 text-stone-200 text-xs font-sans leading-relaxed focus:outline-none focus:border-emerald-500 select-all resize-none shadow-inner"
              />
              <button
                type="button"
                onClick={() => handleCopy(currentText, 'post')}
                className="absolute top-3 right-3 py-1 px-2.5 rounded-lg bg-stone-800/90 hover:bg-stone-700 text-stone-200 text-[11px] font-bold flex items-center gap-1 border border-stone-700 backdrop-blur-xs cursor-pointer"
              >
                {copiedType === 'post' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-stone-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer guidance */}
          <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-800">
            <span>✨ Includes all 5 verified Mama Fua mobile numbers</span>
            <button
              type="button"
              onClick={() => setIsShareModalOpen(false)}
              className="text-stone-300 hover:text-white font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="my-4 sm:my-8 space-y-4">
      {/* Prime #1 Homepage Billboard displayed directly on Mobile, Tablet & Desktop */}
      {renderBillboardContent()}

      {/* Kahawa West Special Offers & Promotions intentionally hidden per user request */}

      {/* Real-time Ad Performance & Visitor Stay Tracker Modal */}
      {isStatsModalOpen && renderStatsModal()}

      {/* Share Ad to Groups Modal */}
      {isShareModalOpen && renderShareModal()}
    </div>
  );
};
