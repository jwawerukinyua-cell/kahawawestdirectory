import { BusinessAdCampaign, AdCampaignStatus } from '../types';

/**
 * Converts package duration strings to total days
 */
export function getDurationInDays(duration: '7_days' | '15_days' | '30_days' | string): number {
  switch (duration) {
    case '7_days':
      return 7;
    case '15_days':
      return 15;
    case '30_days':
      return 30;
    default:
      if (duration && duration.includes('15')) return 15;
      if (duration && duration.includes('30')) return 30;
      return 7;
  }
}

/**
 * Calculates the exact ISO string when a campaign expires based on start date and package duration
 */
export function calculateAdExpiresAt(
  startIsoDate: string,
  duration: '7_days' | '15_days' | '30_days' | string
): string {
  const start = new Date(startIsoDate);
  const days = getDurationInDays(duration);
  const expiryTimestamp = start.getTime() + days * 24 * 60 * 60 * 1000;
  return new Date(expiryTimestamp).toISOString();
}

export interface AdTimeRemainingInfo {
  isExpired: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  totalHoursRemaining: number;
  label: string;
  badgeColorClass: string;
  progressPercent: number;
  startDate: Date;
  expiresDate: Date;
  formattedExpiry: string;
}

/**
 * Calculates remaining time, progress %, and human-readable labels for any campaign
 */
export function getAdTimeRemaining(campaign: BusinessAdCampaign): AdTimeRemainingInfo {
  const startDate = campaign.approvedAt ? new Date(campaign.approvedAt) : new Date(campaign.createdAt);
  const durationDays = getDurationInDays(campaign.packageDuration);

  const expiresDate = campaign.expiresAt
    ? new Date(campaign.expiresAt)
    : new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const now = Date.now();
  const totalDurationMs = Math.max(1, expiresDate.getTime() - startDate.getTime());
  const elapsedMs = now - startDate.getTime();
  const remainingMs = expiresDate.getTime() - now;

  const isExpired = remainingMs <= 0;
  const totalHoursRemaining = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));
  const daysRemaining = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60 * 24)));
  const hoursRemaining = Math.max(0, Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

  const progressPercent = isExpired
    ? 100
    : Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));

  const formattedExpiry = expiresDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let label = '';
  let badgeColorClass = '';

  if (isExpired) {
    label = 'Campaign Expired (Defaulted to Own this space)';
    badgeColorClass = 'bg-stone-800 text-stone-400 border-stone-700';
  } else if (daysRemaining > 2) {
    label = `${daysRemaining} days left`;
    badgeColorClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  } else if (daysRemaining >= 1) {
    label = `1 day left (${hoursRemaining}h)`;
    badgeColorClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  } else if (totalHoursRemaining > 0) {
    label = `${totalHoursRemaining}h remaining (Expiring Today)`;
    badgeColorClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
  } else {
    label = 'Ending in <1 hour';
    badgeColorClass = 'bg-rose-600 text-white border-rose-400 animate-pulse';
  }

  return {
    isExpired,
    daysRemaining,
    hoursRemaining,
    totalHoursRemaining,
    label,
    badgeColorClass,
    progressPercent,
    startDate,
    expiresDate,
    formattedExpiry,
  };
}

/**
 * Strictly checks whether an ad campaign is currently approved, active, and within its paid date range
 */
export function isCampaignLiveAndActive(campaign: BusinessAdCampaign): boolean {
  if (campaign.status !== 'active') return false;
  const { isExpired } = getAdTimeRemaining(campaign);
  return !isExpired;
}

/**
 * Checks all campaigns in a list, automatically updating expired active campaigns to 'expired' status
 */
export function syncAndCleanExpiredCampaigns(campaigns: BusinessAdCampaign[]): {
  updatedList: BusinessAdCampaign[];
  hasChanges: boolean;
} {
  let hasChanges = false;

  const updatedList = campaigns.map((campaign) => {
    // If it's active but its duration has elapsed, mark as expired
    if (campaign.status === 'active') {
      const { isExpired, expiresDate } = getAdTimeRemaining(campaign);
      if (isExpired) {
        hasChanges = true;
        return {
          ...campaign,
          status: 'expired' as AdCampaignStatus,
          expiresAt: expiresDate.toISOString(),
        };
      }
    }
    return campaign;
  });

  return { updatedList, hasChanges };
}

export const WESTSTATE_VALLEY_BILLBOARD_CAMPAIGN: BusinessAdCampaign = {
  id: 'kwest-ad-weststate-vacancy-billboard',
  businessId: 'kw-biz-weststate-valley-guesthouse',
  businessName: 'WestState Valley Guest House',
  format: 'homepage-billboard',
  headline: '14-Day Staff Relief Vacancy: Lady (Age 25–30) Needed for Guest House & Front Desk',
  description: 'WestState Valley Guest House (Behind Mahiga Primary School, Kware/Quarry-100 Metres from PCEA) is looking for an energetic, respectful lady aged 25–30 to sit in for 14 days while a staff member is on leave. Key duties: prepping & cleaning guest rooms, receiving and welcoming guests, and general front desk assistance. Immediate start. Call 0717 580 016 and speak directly to Wanjiru for interview and direction.',
  ctaText: 'Call Wanjiru: 0717 580 016',
  badgeText: 'URGENT 14-DAY VACANCY • IMMEDIATE START',
  targetZone: 'Behind Mahiga Primary School, Kware/Quarry-100 Metres from PCEA',
  imageUrl: '/weststate-hero.jpg',
  requestCustomDesign: true,
  packageDuration: '15_days',
  placementPriceKsh: 4500,
  creativeFeeKsh: 500,
  totalPriceKsh: 5000,
  status: 'active',
  createdAt: '2026-11-01T08:00:00.000Z',
  approvedAt: '2026-11-01T08:00:00.000Z',
  expiresAt: calculateAdExpiresAt('2026-11-01T08:00:00.000Z', '15_days'),
  editorNotes: '14-Day Staff Relief Vacancy for WestState Valley Guest House. Direct hiring contact: Wanjiru at 0717 580 016.',
};

export const KARURA_COLLECTIVE_SHOWCASE_CAMPAIGN: BusinessAdCampaign = {
  id: 'kwest-ad-karura-collective-showcase',
  businessId: 'kw-biz-09',
  businessName: "Karura Women's Cleaning Collective",
  format: 'category-grid',
  headline: 'Honest Hands, Spotless Homes: Meet Your Trusted Kahawa West "Mama Fua" & Cleaning Collective',
  description: 'No agency cuts or hidden middlemen. Five hardworking mothers assemble every morning under the Fig Tree on Karura Road, providing thorough "Mama Fua" hand laundry, duvets, balconies, and deep home scrubbing with genuine motherly care. Call or WhatsApp any of the five ladies directly — 100% of your payment goes straight to her family.',
  ctaText: 'Call Any of the 5 Ladies',
  badgeText: 'ESTATE SPOTLIGHT • 5 VETTED RESIDENTS',
  targetZone: 'Karura Estate (Fig Tree)',
  imageUrl: '/karura-women-under-tree.jpg',
  requestCustomDesign: true,
  packageDuration: '30_days',
  placementPriceKsh: 2500,
  creativeFeeKsh: 500,
  totalPriceKsh: 3000,
  status: 'active',
  createdAt: '2026-10-25T05:05:00.000Z',
  approvedAt: '2026-10-25T05:05:00.000Z',
  expiresAt: calculateAdExpiresAt('2026-10-25T05:05:00.000Z', '30_days'),
  editorNotes: 'Community Spotlight Showcase for Karura Women Collective. Direct calls to all 5 ladies enabled.',
};

export const KARURA_COLLECTIVE_BILLBOARD_CAMPAIGN: BusinessAdCampaign = KARURA_COLLECTIVE_SHOWCASE_CAMPAIGN;

/**
 * Loads all campaigns from localStorage, synchronizes expiry states, and returns live active ads
 */
export function getLiveActiveAdsFromStorage(): BusinessAdCampaign[] {
  try {
    const raw = localStorage.getItem('kwest_business_ads');
    let parsed: BusinessAdCampaign[] = [];
    if (raw) {
      try {
        const val = JSON.parse(raw);
        if (Array.isArray(val)) parsed = val;
      } catch {}
    }

    const nowIso = new Date().toISOString();

    // 1. Ensure WestState Valley 14-Day Vacancy is the premier active billboard
    const weststateIndex = parsed.findIndex(
      (c) => c.businessId === 'kw-biz-weststate-valley-guesthouse' || c.id === 'kwest-ad-weststate-vacancy-billboard'
    );
    if (weststateIndex < 0) {
      const activeWeststate = {
        ...WESTSTATE_VALLEY_BILLBOARD_CAMPAIGN,
        createdAt: nowIso,
        approvedAt: nowIso,
        expiresAt: calculateAdExpiresAt(nowIso, '15_days'),
      };
      parsed.unshift(activeWeststate);
    } else {
      parsed[weststateIndex] = {
        ...parsed[weststateIndex],
        ...WESTSTATE_VALLEY_BILLBOARD_CAMPAIGN,
        status: 'active',
      };
    }

    // 2. Ensure Karura Collective campaign is maintained as the featured community showcase
    const karuraIndex = parsed.findIndex(
      (c) => c.businessId === 'kw-biz-09' || c.id === 'kwest-ad-karura-collective-showcase' || c.id === 'kwest-ad-karura-collective-billboard-1'
    );
    if (karuraIndex < 0) {
      parsed.push({
        ...KARURA_COLLECTIVE_SHOWCASE_CAMPAIGN,
        createdAt: nowIso,
        approvedAt: nowIso,
        expiresAt: calculateAdExpiresAt(nowIso, '30_days'),
      });
    } else {
      parsed[karuraIndex] = {
        ...parsed[karuraIndex],
        ...KARURA_COLLECTIVE_SHOWCASE_CAMPAIGN,
        status: 'active',
      };
    }

    localStorage.setItem('kwest_business_ads', JSON.stringify(parsed));

    const { updatedList, hasChanges } = syncAndCleanExpiredCampaigns(parsed);
    if (hasChanges) {
      localStorage.setItem('kwest_business_ads', JSON.stringify(updatedList));
    }

    const liveList = updatedList.filter(isCampaignLiveAndActive);
    return liveList.length > 0 ? liveList : [WESTSTATE_VALLEY_BILLBOARD_CAMPAIGN, KARURA_COLLECTIVE_SHOWCASE_CAMPAIGN];
  } catch (err) {
    console.error('Error loading live ads from storage:', err);
    return [WESTSTATE_VALLEY_BILLBOARD_CAMPAIGN, KARURA_COLLECTIVE_SHOWCASE_CAMPAIGN];
  }
}
