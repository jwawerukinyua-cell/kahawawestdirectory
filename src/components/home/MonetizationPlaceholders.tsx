import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Clock,
  TrendingUp,
  Flame,
  Target,
  MessageSquare,
  Sparkles,
  X,
  BarChart2,
  Activity,
  Timer,
  Users,
  Eye,
  Share2,
  Copy,
  Check,
  Briefcase,
  MapPin,
  Building2,
  UserCheck,
} from 'lucide-react';
import { Business, BusinessAdCampaign, CollectiveMember } from '../../types';
import {
  getLiveActiveAdsFromStorage,
  getAdTimeRemaining,
  WESTSTATE_VALLEY_BILLBOARD_CAMPAIGN,
  KARURA_COLLECTIVE_SHOWCASE_CAMPAIGN,
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

const DEFAULT_KARURA_MEMBERS: CollectiveMember[] = [
  {
    id: 'member-1',
    name: 'Purity Mugambi',
    role: 'Coordinator & Listing Contact',
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
  allBusinesses = [],
  onViewBusiness,
  onClaimListing,
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

  // 1. Primary Billboard: WestState Valley Guest House Vacancy Campaign
  const activeBillboard =
    approvedAds.find(
      (ad) =>
        ad.format === 'homepage-billboard' ||
        ad.businessId === 'kw-biz-weststate-valley-guesthouse' ||
        ad.id.includes('weststate')
    ) || WESTSTATE_VALLEY_BILLBOARD_CAMPAIGN;

  // 2. Secondary Community Spotlight: Karura Women's Cleaning Collective (in space of the 3 grid ads)
  const collectiveCampaign =
    approvedAds.find(
      (ad) =>
        ad.businessId === 'kw-biz-09' ||
        ad.id.includes('karura') ||
        ad.format === 'category-grid'
    ) || KARURA_COLLECTIVE_SHOWCASE_CAMPAIGN;

  // Modals state
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsCampaignTarget, setStatsCampaignTarget] = useState<'weststate' | 'karura'>('weststate');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareCampaignTarget, setShareCampaignTarget] = useState<'weststate' | 'karura'>('weststate');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeShareTab, setActiveShareTab] = useState<'full' | 'short' | 'facebook'>('full');

  // Tracking for Active Billboard (WestState)
  const [billboardStats, setBillboardStats] = useState<AdCampaignAnalytics>(() =>
    getAdCampaignAnalytics(activeBillboard.id)
  );

  // Tracking for Collective Showcase
  const [collectiveStats, setCollectiveStats] = useState<AdCampaignAnalytics>(() =>
    getAdCampaignAnalytics(collectiveCampaign.id)
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
      if (detail && detail.campaignId === collectiveCampaign.id) {
        setCollectiveStats({ ...detail });
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
  }, [activeBillboard.id, collectiveCampaign.id]);

  // Lookup matched businesses
  const matchedWestStateBiz =
    allBusinesses.find(
      (b) =>
        b.id === 'kw-biz-weststate-valley-guesthouse' ||
        b.slug === 'weststate-valley-guest-house'
    ) ||
    allBusinesses.find((b) => b.id === activeBillboard.businessId);

  const matchedCollectiveBiz =
    allBusinesses.find((b) => b.id === 'kw-biz-09' || b.name.includes('Karura')) ||
    allBusinesses.find((b) => b.id === collectiveCampaign.businessId);

  const rawMembers = matchedCollectiveBiz?.collectiveMembers;
  const collectiveMembers: CollectiveMember[] =
    rawMembers && rawMembers.length > 0 ? rawMembers : DEFAULT_KARURA_MEMBERS;

  const getAdShareLink = () => 'https://www.kahawawestdirectory.co.ke';

  // Share texts for WestState Valley Vacancy
  const getWestStateFullText = () => {
    const link = getAdShareLink();
    return `💼 *URGENT 14-DAY TEMPORARY JOB VACANCY — KAHAWA WEST* 💼

*WestState Valley Guest House* is looking for an energetic, trustworthy, and respectful lady aged 25–30 to sit in for 14 days while one of our regular staff members is taking a well-deserved break.

📋 *Role Responsibilities:*
• Prepping and cleaning guest rooms thoroughly
• Receiving, checking-in, and welcoming guests with warmth
• Basic front desk assistance and guest coordination

📍 *Location:* Behind Mahiga Primary School, Kware/Quarry-100 Metres from PCEA, Kahawa West
⏰ *Duration:* 14 Days (Immediate Temporary Cover)
📞 *How to Apply:* Call *0717 580 016* and speak directly to *Wanjiru* for interview and direction!

🔗 *View Guest House Details on Kahawa West Directory:*
${link}

_Please forward this to anyone you know in Kahawa West who is available for immediate temporary work!_ 🙏`;
  };

  const getWestStateShortText = () => {
    const link = getAdShareLink();
    return `💼 *JOB VACANCY: WestState Valley Guest House (Behind Mahiga Primary School, Kware/Quarry-100 Metres from PCEA)*
Looking for a lady aged 25–30 to sit in for 14 days (room cleaning, welcoming guests).
📞 Call *0717 580 016* and speak to *Wanjiru* for direction!
Details: ${link}`;
  };

  const getWestStateFacebookText = () => {
    const link = getAdShareLink();
    return `👋 Kahawa West Neighbours,

WestState Valley Guest House (located behind Mahiga Primary School, Kware/Quarry-100 Metres from PCEA) has an immediate vacancy for a temporary relief staff member for 14 days.

Requirements:
• Lady aged 25–30
• Duties: Prepping & cleaning guest rooms, receiving and welcoming guests, front desk assistance
• Period: 14 Days (Immediate cover)

Interested candidates should call 0717 580 016 and speak to Wanjiru for immediate interview and direction.

View on Kahawa West Directory:
${link}`;
  };

  // Share texts for Karura Collective
  const getKaruraFullText = () => {
    const link = getAdShareLink();
    return `✨ *SUPPORT OUR LOCAL MAMA FUA HEROES OF KAHAWA WEST* ✨

When you walk along Karura Road, just by the junction of Church Avenue under the big Fig Tree, you will find 5 hardworking, vetted women who have been the quiet backbone of our homes across Jacaranda, Congo, Soweto, Mahiga, Kamae, and Bima.

Rather than giving cuts to exploitative agencies or middlemen, they have formed the *Karura Women's Cleaning Collective* — 100% of whatever you pay goes directly into their hands to feed and educate their families. 💙

Direct lines to Call or WhatsApp any of them directly:
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

🔗 *View photos & profile:*
${link}`;
  };

  const getKaruraShortText = () => {
    const link = getAdShareLink();
    return `🧺 *Need a trusted Mama Fua in Kahawa West?*
5 vetted local women under the Karura Rd Fig Tree are available for hand laundry, duvets & deep house cleaning. Zero agency cuts!

📞 *Direct Lines:*
• Purity (Coord): 0703 272 467
• Susan Nafula: 0143 469 509
• Rachel Makena: 0714 318 077
• Agnes Kamau: 0719 819 632
• Ann Muthama: 0790 385 663

🔗 ${link}`;
  };

  const getKaruraFacebookText = () => {
    const link = getAdShareLink();
    return `👋 Kahawa West Neighbours,

Please support the Karura Women's Cleaning Collective under the Fig Tree at Church Avenue & Karura Road!
5 vetted local women available for thorough Mama Fua hand laundry, duvets, curtain washing, and deep house move-in cleaning. 100% direct pay to mothers.

Direct contacts:
• Purity Mugambi: 0703 272 467
• Susan (Wa Shantel) Nafula: 0143 469 509
• Rachel Makena: 0714 318 077
• Agnes Kamau: 0719 819 632
• Ann Muthama: 0790 385 663

View full details: ${link}`;
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  /**
   * Renders Prime #1 Homepage Billboard (WestState Valley Guest House 14-Day Vacancy)
   */
  const renderBillboardContent = () => {
    const timeInfo = getAdTimeRemaining(activeBillboard);
    const wanjiruPhone = '0717580016';
    const wanjiruDisplayPhone = '0717 580 016';
    const wanjiruTel = formatKenyanPhoneForTel(wanjiruPhone);
    const wanjiruWhatsApp = getWhatsAppChatUrl(
      wanjiruPhone,
      'Hello Wanjiru, I am calling/texting regarding the 14-day relief job vacancy at WestState Valley Guest House (behind Mahiga Primary School) that I saw on the Kahawa West Directory.'
    );

    return (
      <div
        id="homepage-main-promo-banner"
        className="relative overflow-hidden rounded-3xl bg-[#090b14] text-white p-5 sm:p-7 md:p-8 border-2 border-amber-400/90 shadow-2xl animate-in fade-in duration-300"
      >
        {/* Ambient backdrops */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 w-72 h-72 bg-[#630303]/35 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-2">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {activeBillboard.imageUrl && (
              <div className="relative shrink-0 w-full sm:w-60 h-44 rounded-2xl overflow-hidden border-2 border-amber-400/70 shadow-xl group">
                <ListingImage
                  src={activeBillboard.imageUrl}
                  alt={`${activeBillboard.headline} - WestState Valley Guest House`}
                  business={{ name: activeBillboard.businessName }}
                  imageType="ad"
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
                <span className="absolute bottom-2.5 left-2.5 text-[11px] font-bold text-amber-200 bg-black/85 px-2.5 py-1 rounded-lg backdrop-blur-xs border border-amber-400/40 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>Behind Mahiga Primary School • Kware/Quarry-100 Metres from PCEA</span>
                </span>
              </div>
            )}

            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-stone-950 shadow-md">
                  <Flame className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
                  <span>{activeBillboard.badgeText || 'URGENT 14-DAY VACANCY'}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Opportunity</span>
                </span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${timeInfo.badgeColorClass}`}>
                  <Clock className="w-3 h-3" />
                  <span>{timeInfo.label}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStatsCampaignTarget('weststate');
                    setIsStatsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 hover:bg-amber-400/35 text-amber-300 border border-amber-400/50 transition cursor-pointer active:scale-95 shadow-xs"
                  title="View live ad visitor stay duration & click tracking"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Live Stats: {billboardStats.impressions} views • {billboardStats.avgDwellSeconds}s stay • {billboardStats.totalClicks} clicks</span>
                </button>
              </div>

              <div>
                <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activeBillboard.businessName}</span>
                  <span className="text-stone-400 font-normal">• Behind Mahiga Primary School (Kware/Quarry-100 Metres from PCEA)</span>
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                  {activeBillboard.headline}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-sans">
                {activeBillboard.description}
              </p>

              {/* Vacancy Core Criteria Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="bg-stone-900/90 rounded-xl p-2 border border-stone-800 text-xs flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Role Duration</span>
                    <span className="font-bold text-white">14-Day Relief Cover</span>
                  </div>
                </div>

                <div className="bg-stone-900/90 rounded-xl p-2 border border-stone-800 text-xs flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Candidate</span>
                    <span className="font-bold text-white">Lady Aged 25–30 Yrs</span>
                  </div>
                </div>

                <div className="bg-stone-900/90 rounded-xl p-2 border border-stone-800 text-xs flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Location</span>
                    <span className="font-bold text-white truncate">Kware/Quarry-100m PCEA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Side Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0 self-stretch lg:self-center">
            {/* Primary Phone Action to Wanjiru */}
            <a
              href={wanjiruTel}
              onClick={() => {
                recordAdClick(activeBillboard.id, 'call', 'Wanjiru');
              }}
              className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-black text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-950/50 cursor-pointer"
              title="Call Wanjiru directly at 0717 580 016"
            >
              <Phone className="w-4 h-4 fill-stone-950 shrink-0" />
              <span>Call Wanjiru: {wanjiruDisplayPhone}</span>
            </a>

            {/* Direct WhatsApp Action to Wanjiru */}
            <a
              href={wanjiruWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                recordAdClick(activeBillboard.id, 'whatsapp', 'Wanjiru');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
              title="WhatsApp chat with Wanjiru regarding this role"
            >
              <MessageSquare className="w-4 h-4 fill-stone-950 shrink-0" />
              <span>WhatsApp Wanjiru</span>
            </a>

            {/* Share Vacancy to WhatsApp Groups */}
            <button
              type="button"
              onClick={() => {
                setShareCampaignTarget('weststate');
                setIsShareModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-white font-bold text-xs sm:text-sm border border-stone-700 flex items-center justify-center gap-2 transition cursor-pointer"
              title="Share job opening with estate groups"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Share Vacancy</span>
            </button>

            {matchedWestStateBiz && (
              <button
                type="button"
                onClick={() => {
                  recordAdClick(activeBillboard.id, 'profile');
                  onViewBusiness(matchedWestStateBiz);
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition border border-white/20 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>View Guest House Profile</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenAdEnquiry}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-stone-400 hover:text-stone-200 text-[11px] font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Megaphone className="w-3 h-3 text-amber-300" />
              <span>Reserve Billboard Space</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renders Karura Women's Cleaning Collective Community Showcase
   * Placed right in the space where the three grid ads were!
   */
  const renderCollectiveGridShowcase = () => {
    return (
      <div
        id="community-collective-showcase"
        className="relative overflow-hidden rounded-3xl bg-[#031d16] text-white p-5 sm:p-7 md:p-8 border-2 border-emerald-500/80 shadow-2xl animate-in fade-in duration-300"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Row */}
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 border-b border-emerald-500/30">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="relative shrink-0 w-full sm:w-48 h-32 rounded-2xl overflow-hidden border border-emerald-400/50 shadow-md group">
              <ListingImage
                src={collectiveCampaign.imageUrl || '/karura-women-under-tree.jpg'}
                alt="Karura Women's Cleaning Collective - Mama Fua under Fig Tree"
                business={{ name: collectiveCampaign.businessName }}
                imageType="ad"
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <span className="absolute bottom-2 left-2 text-[10px] font-bold text-emerald-200 bg-emerald-950/80 px-2 py-0.5 rounded-md backdrop-blur-xs border border-emerald-500/30">
                Karura Rd Fig Tree
              </span>
            </div>

            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-400 text-stone-950 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
                  <span>COMMUNITY SPOTLIGHT • 5 VETTED RESIDENTS</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Direct Pay to Mothers (Zero Cuts)</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStatsCampaignTarget('karura');
                    setIsStatsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400/20 hover:bg-emerald-400/35 text-emerald-300 border border-emerald-400/50 transition cursor-pointer active:scale-95 shadow-xs"
                  title="View live ad visitor stay duration & click tracking"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Live Stats: {collectiveStats.impressions} views • {collectiveStats.totalClicks} inquiries</span>
                </button>
              </div>

              <div>
                <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wide block mb-0.5">
                  {collectiveCampaign.businessName}
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight">
                  {collectiveCampaign.headline}
                </h3>
              </div>

              <p className="text-xs text-stone-200 leading-relaxed font-sans">
                {collectiveCampaign.description}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={() => {
                setShareCampaignTarget('karura');
                setIsShareModalOpen(true);
              }}
              className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/40 cursor-pointer"
              title="Share Karura Women's Collective details"
            >
              <Share2 className="w-4 h-4 text-emerald-200" />
              <span>Share Collective</span>
            </button>

            {matchedCollectiveBiz && (
              <button
                type="button"
                onClick={() => {
                  recordAdClick(collectiveCampaign.id, 'profile');
                  onViewBusiness(matchedCollectiveBiz);
                }}
                className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-200 font-bold text-xs sm:text-sm border border-emerald-500/40 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>View Collective Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 5 Mama Fua Ladies Grid (Direct Lines to Each Woman) */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Phone className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-emerald-300 uppercase tracking-wider">
                  Direct Lines: Tap to Call or WhatsApp Any of the 5 Ladies
                </h4>
                <p className="text-[11px] text-stone-300">
                  Zero agency commissions • 100% of your payment goes directly to each lady and her family
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-stone-300 bg-stone-900/80 px-2.5 py-1 rounded-full border border-stone-800">
              📍 Assembly: Under Karura Rd Fig Tree
            </span>
          </div>

          {/* Grid of the 5 Ladies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {collectiveMembers.map((member, index) => {
              const telHref = formatKenyanPhoneForTel(member.phone);
              const waHref = getWhatsAppChatUrl(
                member.whatsapp || member.phone,
                `Hello ${member.name}, I saw the Karura Women's Collective feature on Kahawa West Directory. I would like to book cleaning / laundry services.`
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
                  key={member.id || `collective-member-${index}`}
                  className="bg-stone-900/90 rounded-2xl p-3 border border-emerald-900/70 hover:border-emerald-400/80 transition flex flex-col justify-between shadow-lg group"
                >
                  <div>
                    {/* Member Header */}
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="relative shrink-0">
                        {member.photoUrl && member.photoUrl.trim() !== '' ? (
                          <img
                            src={member.photoUrl}
                            alt={`Photo of ${member.name}`}
                            className="w-11 h-11 rounded-full object-cover border-2 border-emerald-400 shadow-sm"
                          />
                        ) : (
                          <div
                            className={`w-11 h-11 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center font-extrabold text-xs shadow-sm border border-white/40`}
                          >
                            {initials}
                          </div>
                        )}
                        <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-emerald-400 text-stone-950 text-[9px] font-black flex items-center justify-center">
                          #{index + 1}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-white text-xs truncate leading-snug group-hover:text-emerald-300 transition">
                          {member.name}
                        </h5>
                        <span className="text-[10px] text-emerald-300/90 font-medium block truncate">
                          {member.isRepresentative ? 'Coordinator' : 'Collective Member'}
                        </span>
                      </div>
                    </div>

                    {/* Specialty */}
                    {member.specialty && (
                      <div className="text-[11px] text-stone-300 leading-snug mb-2 bg-stone-950/60 p-2 rounded-xl border border-stone-800 line-clamp-2">
                        {member.specialty}
                      </div>
                    )}

                    {/* Complete Phone Display */}
                    <div className="mb-2.5 px-2 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-1 text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="font-mono font-bold text-emerald-300 tracking-wide select-all text-xs">
                          {formatPhoneForDisplay(member.phone)}
                        </span>
                      </div>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 shrink-0">
                        Direct
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons: Direct Call & WhatsApp */}
                  <div className="pt-2 border-t border-stone-800 flex items-center gap-1.5">
                    <a
                      href={telHref}
                      onClick={() => {
                        recordAdClick(collectiveCampaign.id, 'call', member.name);
                      }}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-stone-950 text-[11px] font-black flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
                      title={`Direct call to ${member.name}: ${formatPhoneForDisplay(member.phone)}`}
                    >
                      <Phone className="w-3 h-3 fill-stone-950 shrink-0" />
                      <span className="font-mono font-black truncate">Call {formatPhoneForDisplay(member.phone)}</span>
                    </a>

                    {member.whatsapp && (
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          recordAdClick(collectiveCampaign.id, 'whatsapp', member.name);
                        }}
                        className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white transition flex items-center justify-center shadow-xs cursor-pointer"
                        title={`WhatsApp chat with ${member.name}`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Community Note */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-stone-400 text-xs">
            <span>
              💡 <strong>Resident Tip:</strong> All 5 mothers assemble every morning under the Karura Road Fig Tree near Green Cottage School. Book ahead for weekend laundry and duvets!
            </span>
            <button
              type="button"
              onClick={() => {
                setShareCampaignTarget('karura');
                setIsShareModalOpen(true);
              }}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Share2 className="w-3 h-3" />
              <span>Share Mama Fua Contacts</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Real-time Analytics Modal
   */
  const renderStatsModal = () => {
    const isWestState = statsCampaignTarget === 'weststate';
    const activeTargetCampaign = isWestState ? activeBillboard : collectiveCampaign;
    const stats = isWestState ? billboardStats : collectiveStats;
    const impressions = Math.max(1, stats.impressions);
    const ctr = ((stats.totalClicks / impressions) * 100).toFixed(1);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
        onClick={() => setIsStatsModalOpen(false)}
      >
        <div
          className="bg-stone-950 text-white w-full max-w-2xl rounded-3xl border-2 border-amber-400/80 shadow-2xl p-5 sm:p-6 space-y-5 my-auto"
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
                    Live Ad Visitor Stay &amp; Lead Tracker
                  </h3>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold uppercase">
                    Live Tracking Active
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Real-time analytics for Kahawa West Directory sponsor placements
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

          {/* Campaign Selector Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-stone-900 rounded-2xl border border-stone-800">
            <button
              type="button"
              onClick={() => setStatsCampaignTarget('weststate')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                statsCampaignTarget === 'weststate'
                  ? 'bg-amber-400 text-stone-950 font-black shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>WestState Valley Vacancy Billboard</span>
            </button>
            <button
              type="button"
              onClick={() => setStatsCampaignTarget('karura')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                statsCampaignTarget === 'karura'
                  ? 'bg-emerald-400 text-stone-950 font-black shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Karura Women&apos;s Collective</span>
            </button>
          </div>

          {/* Campaign summary */}
          <div className="bg-stone-900/60 p-3 rounded-2xl border border-stone-800 text-xs text-stone-300">
            <div className="font-bold text-white mb-0.5">{activeTargetCampaign.businessName}</div>
            <div className="text-[11px] text-stone-400 line-clamp-1">{activeTargetCampaign.headline}</div>
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
              <div className="text-[10px] text-stone-400 mt-0.5">Conversion rate</div>
            </div>
          </div>

          {/* Breakdown Per Contact / Person */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>
                  {isWestState
                    ? 'Inquiries for Wanjiru (Hiring Contact)'
                    : 'Inquiries Breakdown by Mama Fua Member'}
                </span>
              </h4>
              <span className="text-[11px] text-stone-400">
                {stats.callsCount} Calls • {stats.whatsappCount} WhatsApps
              </span>
            </div>

            <div className="space-y-2 bg-stone-900/70 p-3.5 rounded-2xl border border-stone-800 divide-y divide-stone-800/60 max-h-52 overflow-y-auto">
              {Object.keys(stats.memberClicks || {}).length > 0 ? (
                Object.entries(stats.memberClicks).map(([name, counts]) => (
                  <div key={name} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{name}</div>
                      <div className="text-[10px] text-stone-400">Verified Direct Line</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300">
                        <Phone className="w-3 h-3" />
                        <span>{counts.calls} calls</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                        <MessageSquare className="w-3 h-3" />
                        <span>{counts.whatsapp} WA</span>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-stone-400 text-center py-3">
                  Tracking initialized. Inquiries will log as users tap to call or message.
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-800">
            <span>Dwell time &amp; lead conversion tracking is active.</span>
            <button
              type="button"
              onClick={() => setIsStatsModalOpen(false)}
              className="text-stone-300 hover:text-white font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Share Modal (Dynamically formats based on shareCampaignTarget)
   */
  const renderShareModal = () => {
    const isWestState = shareCampaignTarget === 'weststate';

    const currentText = isWestState
      ? activeShareTab === 'full'
        ? getWestStateFullText()
        : activeShareTab === 'short'
        ? getWestStateShortText()
        : getWestStateFacebookText()
      : activeShareTab === 'full'
      ? getKaruraFullText()
      : activeShareTab === 'short'
      ? getKaruraShortText()
      : getKaruraFacebookText();

    const link = getAdShareLink();

    const handleWhatsAppShare = () => {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(currentText)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      recordAdClick(isWestState ? activeBillboard.id : collectiveCampaign.id, 'profile');
    };

    const handleNativeShare = async () => {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        try {
          await navigator.share({
            title: isWestState
              ? 'Urgent 14-Day Job Vacancy - WestState Valley Guest House'
              : "Karura Women's Cleaning Collective - Mama Fua Direct Numbers",
            text: currentText,
            url: link,
          });
          recordAdClick(isWestState ? activeBillboard.id : collectiveCampaign.id, 'profile');
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
                    {isWestState
                      ? 'Share 14-Day Job Vacancy with Estate Groups & Friends'
                      : 'Share Karura Collective with Estate Groups & Friends'}
                  </h3>
                  <span className="text-[10px] bg-emerald-500 text-stone-950 px-2 py-0.5 rounded-full font-black uppercase">
                    Ready to Send
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  {isWestState
                    ? 'Pre-formatted message with Wanjiru direct contact (0717 580 016) and location details'
                    : 'Pre-formatted message with verified direct mobile numbers for all 5 Mama Fua ladies'}
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

          {/* Website Link Quick Row */}
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

            {/* Post Preview Box */}
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

          {/* Footer Guidance */}
          <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-800">
            <span>
              {isWestState
                ? '✨ Includes Wanjiru direct line (0717 580 016) & location'
                : '✨ Includes all 5 verified Mama Fua mobile numbers'}
            </span>
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
    <div className="my-4 sm:my-8 space-y-6">
      {/* 1. Prime #1 Homepage Billboard: WestState Valley Guest House 14-Day Vacancy */}
      {renderBillboardContent()}

      {/* 2. Karura Women's Cleaning Collective Community Showcase (in place of the three grid ads) */}
      {renderCollectiveGridShowcase()}

      {/* Real-time Ad Performance & Visitor Stay Tracker Modal */}
      {isStatsModalOpen && renderStatsModal()}

      {/* Share Ad to Groups Modal */}
      {isShareModalOpen && renderShareModal()}
    </div>
  );
};
