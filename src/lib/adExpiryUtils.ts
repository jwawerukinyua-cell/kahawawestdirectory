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

/**
 * Loads all campaigns from localStorage, synchronizes expiry states, and returns only live active ads
 */
export function getLiveActiveAdsFromStorage(): BusinessAdCampaign[] {
  try {
    const raw = localStorage.getItem('kwest_business_ads');
    if (!raw) return [];

    const parsed: BusinessAdCampaign[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const { updatedList, hasChanges } = syncAndCleanExpiredCampaigns(parsed);
    if (hasChanges) {
      localStorage.setItem('kwest_business_ads', JSON.stringify(updatedList));
    }

    return updatedList.filter(isCampaignLiveAndActive);
  } catch (err) {
    console.error('Error loading live ads from storage:', err);
    return [];
  }
}
