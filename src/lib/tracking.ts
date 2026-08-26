// KWEST Internal Business Engagement Tracking & Lead Analytics

export interface BusinessAnalytics {
  businessId: string;
  views: number;
  whatsappClicks: number;
  phoneCalls: number;
  shares: number;
  lastInteractedAt: string;
}

export interface SearchHistoryItem {
  query: string;
  zone?: string;
  category?: string;
  timestamp: string;
}

const ANALYTICS_STORAGE_KEY = 'kwest_business_analytics_v2';
const SEARCH_HISTORY_STORAGE_KEY = 'kwest_search_history_v1';

// Seed realistic organic interaction baselines for high-traffic businesses in Kahawa West
const SEED_ANALYTICS: Record<string, Partial<BusinessAnalytics>> = {
  'biz-001': { views: 284, whatsappClicks: 76, phoneCalls: 42, shares: 31 }, // Stephen Maina Plumbing
  'biz-002': { views: 340, whatsappClicks: 92, phoneCalls: 58, shares: 44 }, // Kwest Nyama Choma Grill
  'biz-003': { views: 412, whatsappClicks: 118, phoneCalls: 64, shares: 52 }, // Jacaranda 24/7 Chemist
  'biz-004': { views: 215, whatsappClicks: 48, phoneCalls: 29, shares: 19 }, // Mama Njoroge Groceries
  'biz-005': { views: 198, whatsappClicks: 44, phoneCalls: 36, shares: 22 }, // Congo Clean Laundromat
  'biz-006': { views: 260, whatsappClicks: 65, phoneCalls: 38, shares: 28 }, // Bima Hardware Supplies
  'biz-007': { views: 175, whatsappClicks: 39, phoneCalls: 21, shares: 14 }, // Roundabout Gas Express
  'biz-008': { views: 310, whatsappClicks: 82, phoneCalls: 49, shares: 37 }, // Kahawa West Medical Center
  'biz-009': { views: 160, whatsappClicks: 34, phoneCalls: 18, shares: 12 }, // Soweto Fresh Milk Bar
  'biz-010': { views: 220, whatsappClicks: 56, phoneCalls: 31, shares: 25 }, // Kamae Auto Spares & Garage
};

// Retrieve all analytics from local storage or initialize seed baseline
export function getAllBusinessAnalytics(): Record<string, BusinessAnalytics> {
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading analytics:', e);
  }

  // Initialize with seed data
  const initial: Record<string, BusinessAnalytics> = {};
  Object.keys(SEED_ANALYTICS).forEach((id) => {
    const seed = SEED_ANALYTICS[id];
    initial[id] = {
      businessId: id,
      views: seed.views || 0,
      whatsappClicks: seed.whatsappClicks || 0,
      phoneCalls: seed.phoneCalls || 0,
      shares: seed.shares || 0,
      lastInteractedAt: new Date().toISOString(),
    };
  });

  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(initial));
  } catch (e) {
    console.error('Error saving initial analytics:', e);
  }

  return initial;
}

// Get stats for a single business
export function getBusinessStats(businessId: string): BusinessAnalytics {
  const all = getAllBusinessAnalytics();
  if (all[businessId]) {
    return all[businessId];
  }
  // Default fallback for any newly added business
  return {
    businessId,
    views: 12,
    whatsappClicks: 3,
    phoneCalls: 2,
    shares: 1,
    lastInteractedAt: new Date().toISOString(),
  };
}

// Track an event (view, whatsapp, phone, share)
export function trackBusinessInteraction(
  businessId: string,
  type: 'view' | 'whatsapp' | 'phone' | 'share'
): BusinessAnalytics {
  const all = getAllBusinessAnalytics();
  const current = all[businessId] || {
    businessId,
    views: 0,
    whatsappClicks: 0,
    phoneCalls: 0,
    shares: 0,
    lastInteractedAt: new Date().toISOString(),
  };

  if (type === 'view') current.views += 1;
  if (type === 'whatsapp') current.whatsappClicks += 1;
  if (type === 'phone') current.phoneCalls += 1;
  if (type === 'share') current.shares += 1;

  current.lastInteractedAt = new Date().toISOString();
  all[businessId] = current;

  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(all));
    // Dispatch a custom event so reactive components update instantly
    window.dispatchEvent(
      new CustomEvent('kwest_analytics_updated', {
        detail: { businessId, type, stats: current },
      })
    );
  } catch (e) {
    console.error('Error recording interaction:', e);
  }

  return current;
}

// Track user search queries to power context-aware PWA updates
export function trackSearchQuery(query: string, zone?: string, category?: string) {
  if (!query && !zone && !category) return;
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    const history: SearchHistoryItem[] = raw ? JSON.parse(raw) : [];

    const newItem: SearchHistoryItem = {
      query: (query || '').trim(),
      zone: zone !== 'all' ? zone : undefined,
      category: category !== 'all' ? category : undefined,
      timestamp: new Date().toISOString(),
    };

    // Filter duplicates and keep top 10
    const filtered = history.filter(
      (h) =>
        h.query.toLowerCase() !== newItem.query.toLowerCase() ||
        h.zone !== newItem.zone ||
        h.category !== newItem.category
    );

    const updated = [newItem, ...filtered].slice(0, 10);
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving search history:', e);
  }
}

// Get recent searches
export function getRecentSearches(): SearchHistoryItem[] {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Ad Placement Lead Scorer
export type AdRecommendation =
  | 'Prime Billboard Candidate'
  | 'Spotlight Deals Candidate'
  | 'Unclaimed High-Traffic Target'
  | 'Emerging Local Vendor';

export interface BusinessLeadScore {
  businessId: string;
  totalInteractions: number;
  conversionRate: number; // (whatsapp + phone) / views
  leadScore: number; // 0 to 100 scale
  recommendation: AdRecommendation;
  rationale: string;
}

export function calculateLeadScore(
  stats: BusinessAnalytics,
  isClaimed: boolean
): BusinessLeadScore {
  const views = stats.views || 1;
  const directLeads = stats.whatsappClicks + stats.phoneCalls;
  const total = views + stats.whatsappClicks * 2 + stats.phoneCalls * 2 + stats.shares * 1.5;
  const conversionRate = Number(((directLeads / views) * 100).toFixed(1));

  let recommendation: AdRecommendation = 'Emerging Local Vendor';
  let rationale = 'Good candidate for local directory listing verification.';

  if (!isClaimed && (views > 100 || directLeads > 20)) {
    recommendation = 'Unclaimed High-Traffic Target';
    rationale = `Receiving high organic traffic (${views} views, ${directLeads} inquiries). Reach out to claim and upsell.`;
  } else if (views >= 250 && directLeads >= 50) {
    recommendation = 'Prime Billboard Candidate';
    rationale = `Top-tier traffic hub with high brand resonance across Kahawa West. Ideal for Homepage Banner Ad.`;
  } else if (conversionRate >= 20 || directLeads >= 30) {
    recommendation = 'Spotlight Deals Candidate';
    rationale = `Exceptional conversion rate (${conversionRate}%). Best candidate to pitch the Resident Discount Deal badge.`;
  }

  // Normalized score 0-100
  const leadScore = Math.min(100, Math.round(total / 8 + conversionRate));

  return {
    businessId: stats.businessId,
    totalInteractions: views + directLeads + stats.shares,
    conversionRate,
    leadScore,
    recommendation,
    rationale,
  };
}

// Export Analytics to CSV format for Ad sales outreach
export function exportAnalyticsCSV(
  businesses: Array<{ id: string; name: string; zone: string; phone: string; whatsapp: string; isClaimed: boolean }>
): string {
  const allStats = getAllBusinessAnalytics();

  const headers = [
    'Business ID',
    'Business Name',
    'Zone',
    'Phone',
    'WhatsApp',
    'Claimed Status',
    'Views',
    'WhatsApp Inquiries',
    'Phone Calls',
    'Shares',
    'Total Leads',
    'Conversion %',
    'Ad Recommendation',
    'Sales Rationale',
  ];

  const rows = businesses.map((b) => {
    const stats = allStats[b.id] || getBusinessStats(b.id);
    const score = calculateLeadScore(stats, b.isClaimed);
    const totalLeads = stats.whatsappClicks + stats.phoneCalls;

    return [
      `"${b.id}"`,
      `"${b.name.replace(/"/g, '""')}"`,
      `"${b.zone}"`,
      `"${b.phone}"`,
      `"${b.whatsapp}"`,
      `"${b.isClaimed ? 'Claimed' : 'Unclaimed'}"`,
      stats.views,
      stats.whatsappClicks,
      stats.phoneCalls,
      stats.shares,
      totalLeads,
      `${score.conversionRate}%`,
      `"${score.recommendation}"`,
      `"${score.rationale.replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
