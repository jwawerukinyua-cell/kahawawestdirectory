import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Database,
  Copy,
  Check,
  Star,
  FileText,
  Clock,
  ArrowRight,
  Filter,
  Layers,
  MessageSquare,
  Lock,
  Unlock,
  Key,
  ShieldAlert,
  Settings,
  Megaphone,
  PlusCircle,
  Building,
  TrendingUp,
  Download,
  Search,
  ExternalLink,
  Share2,
  CreditCard,
  Target,
  Palette,
  CheckSquare,
  RefreshCw,
  HelpCircle,
  Send,
  FastForward,
  RotateCcw,
  History,
} from 'lucide-react';
import { CommunityStory, CommunityUpdate, BusinessClaim, Business, UpdateType, BusinessAdCampaign, AdCampaignStatus } from '../../../types';
import {
  calculateAdExpiresAt,
  getAdTimeRemaining,
  isCampaignLiveAndActive,
  syncAndCleanExpiredCampaigns,
  getDurationInDays,
} from '../../../lib/adExpiryUtils';
import {
  getAllBusinessAnalytics,
  getBusinessStats,
  calculateLeadScore,
  exportAnalyticsCSV,
  BusinessAnalytics,
} from '../../../lib/tracking';
import {
  getModeratorEmergencyPhone,
  setModeratorEmergencyPhone,
  getWhatsAppChatUrl,
  generateEmergencyWhatsAppAlertCard,
  formatPhoneForDisplay,
  formatKenyanPhoneForWhatsApp,
} from '../../../lib/phoneUtils';
import { Button } from '../../ui/Button';
import { StoryMarkdownRenderer } from './StoryMarkdownRenderer';
import { copyToClipboard } from '../../../lib/clipboard';

interface EditorialReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  stories: CommunityStory[];
  updates?: CommunityUpdate[];
  claims?: BusinessClaim[];
  businesses?: Business[];
  onApproveStory: (storyId: string, featured?: boolean) => void;
  onRejectStory: (storyId: string, reason: string) => void;
  onDeleteStory: (storyId: string) => void;
  onUpdateStoryContent?: (updatedStory: CommunityStory) => void;
  onApproveUpdate?: (updateId: string) => void;
  onRejectUpdate?: (updateId: string, reason: string) => void;
  onDeleteUpdate?: (updateId: string) => void;
  onSaveUpdate?: (update: CommunityUpdate) => void;
  onApproveClaim?: (businessId: string) => void;
  onRejectClaim?: (businessId: string, reason?: string) => void;
  onDeleteClaim?: (businessId: string) => void;
  onEditBusiness?: (business: Business) => void;
  onOpenSubmitModal: () => void;
  onOpenSubmitUpdateModal?: () => void;
}

// Master default strong passphrases
const DEFAULT_MASTER_PASSPHRASES = [
  'Kwest@Spotlight#2026!',
  'UkWeli#Kahawa2026*',
  'KahawaWest@Admin99!',
];

export const EditorialReviewModal: React.FC<EditorialReviewModalProps> = ({
  isOpen,
  onClose,
  stories,
  updates = [],
  claims = [],
  businesses = [],
  onApproveStory,
  onRejectStory,
  onDeleteStory,
  onUpdateStoryContent,
  onApproveUpdate,
  onRejectUpdate,
  onDeleteUpdate,
  onSaveUpdate,
  onApproveClaim,
  onRejectClaim,
  onDeleteClaim,
  onEditBusiness,
  onOpenSubmitModal,
  onOpenSubmitUpdateModal,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'stories' | 'updates' | 'claims' | 'ad_campaigns' | 'ad_sales' | 'supabase_guide'>('stories');
  const [storySubTab, setStorySubTab] = useState<'pending' | 'published'>('pending');
  const [updateSubTab, setUpdateSubTab] = useState<'pending' | 'published'>('pending');
  const [claimsSubTab, setClaimsSubTab] = useState<'pending_claims' | 'all_listings'>('pending_claims');
  const [adCampaignsSubTab, setAdCampaignsSubTab] = useState<'pending' | 'active' | 'changes_requested' | 'expired' | 'all'>('pending');
  const [directorySearchQuery, setDirectorySearchQuery] = useState('');
  const [directoryZoneFilter, setDirectoryZoneFilter] = useState('all');

  // Moderator Emergency WhatsApp Relay State
  const [moderatorPhone, setModeratorPhone] = useState<string>(() => getModeratorEmergencyPhone());
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState('');
  const [copiedAlertId, setCopiedAlertId] = useState<string | null>(null);

  const handleSaveModeratorPhone = () => {
    if (tempPhone.trim()) {
      setModeratorEmergencyPhone(tempPhone.trim());
      setModeratorPhone(getModeratorEmergencyPhone());
      showToast('Moderator emergency WhatsApp number updated!');
    }
    setIsEditingPhone(false);
  };

  const handleCopyUpdateAlertCard = async (up: CommunityUpdate) => {
    const cardText = generateEmergencyWhatsAppAlertCard(up);
    await copyToClipboard(cardText);
    setCopiedAlertId(up.id);
    showToast('WhatsApp emergency alert card copied to clipboard!');
    setTimeout(() => setCopiedAlertId(null), 3000);
  };

  // Ad Campaigns Queue & Moderation State
  const [adCampaigns, setAdCampaigns] = useState<BusinessAdCampaign[]>(() => {
    try {
      const saved = localStorage.getItem('kwest_business_ads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const { updatedList } = syncAndCleanExpiredCampaigns(parsed);
          return updatedList;
        }
      }
    } catch (e) {
      console.error(e);
    }
    // High quality seeded campaign samples for editorial testing
    const sampleApprovedAt = new Date(Date.now() - 86400000 * 2).toISOString();
    return [
      {
        id: 'kwest-ad-sample-1',
        businessId: 'mama-njeri-choma',
        businessName: "Mama Njeri Pork & Choma Grill",
        format: 'homepage-billboard',
        headline: "Weekend Nyama Choma Special: 20% Off Ribs Platter",
        description: "Order fresh slow-roasted mbuzi and kuku choma directly from Congo Stage. Fast hot delivery across all Kahawa West zones.",
        ctaText: "Order via WhatsApp",
        badgeText: "Weekend Special",
        targetZone: "Congo",
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
        requestCustomDesign: true,
        packageDuration: '15_days',
        placementPriceKsh: 1350,
        creativeFeeKsh: 500,
        totalPriceKsh: 1850,
        status: 'in_review',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'kwest-ad-sample-2',
        businessId: 'st-francis-chemist',
        businessName: "St. Francis Chemist & Clinic",
        format: 'resident-deal',
        headline: "Free Blood Pressure & Blood Sugar Screening",
        description: "Walk-in consultation available Monday to Saturday near Roundabout. Certified pharmacists and genuine prescription medicines.",
        ctaText: "Book Screening",
        badgeText: "Community Health",
        targetZone: "Roundabout",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
        requestCustomDesign: false,
        packageDuration: '7_days',
        placementPriceKsh: 700,
        creativeFeeKsh: 0,
        totalPriceKsh: 700,
        status: 'active',
        createdAt: sampleApprovedAt,
        approvedAt: sampleApprovedAt,
        expiresAt: calculateAdExpiresAt(sampleApprovedAt, '7_days'),
      },
    ];
  });

  const [campaignSearchQuery, setCampaignSearchQuery] = useState('');
  const [campaignZoneFilter, setCampaignZoneFilter] = useState('all');
  const [editingCampaign, setEditingCampaign] = useState<BusinessAdCampaign | null>(null);
  const [campaignForRejection, setCampaignForRejection] = useState<BusinessAdCampaign | null>(null);
  const [campaignRejectionPreset, setCampaignRejectionPreset] = useState('payment');
  const [campaignRejectionCustomNote, setCampaignRejectionCustomNote] = useState('');
  const [campaignActionToast, setCampaignActionToast] = useState<string | null>(null);

  // Sync adCampaigns to local storage
  const saveCampaignsToStorage = (updatedList: BusinessAdCampaign[]) => {
    setAdCampaigns(updatedList);
    try {
      localStorage.setItem('kwest_business_ads', JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  };

  // Automatically check expiry on modal open / render
  useEffect(() => {
    if (isOpen) {
      const { updatedList, hasChanges } = syncAndCleanExpiredCampaigns(adCampaigns);
      if (hasChanges) {
        saveCampaignsToStorage(updatedList);
      }
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setCampaignActionToast(msg);
    setTimeout(() => setCampaignActionToast(null), 3500);
  };

  // Campaign Moderation Handlers
  const handleApproveCampaign = (campaignId: string) => {
    const target = adCampaigns.find((c) => c.id === campaignId);
    const approvedAt = new Date().toISOString();
    const duration = target?.packageDuration || '7_days';
    const expiresAt = calculateAdExpiresAt(approvedAt, duration);
    const durationDays = getDurationInDays(duration);

    const updated = adCampaigns.map((c) =>
      c.id === campaignId
        ? {
            ...c,
            status: 'active' as AdCampaignStatus,
            approvedAt,
            expiresAt,
          }
        : c
    );
    saveCampaignsToStorage(updated);
    showToast(`Campaign approved & activated for ${durationDays} days!`);
  };

  // Renewal / Extension Handler (e.g. +7, +15, +30 days)
  const handleRenewCampaign = (campaignId: string, extensionDays: number = 7) => {
    const target = adCampaigns.find((c) => c.id === campaignId);
    if (!target) return;

    const approvedAt = new Date().toISOString();
    const durationStr = extensionDays === 30 ? '30_days' : extensionDays === 15 ? '15_days' : '7_days';
    const expiresAt = calculateAdExpiresAt(approvedAt, durationStr);

    const updated = adCampaigns.map((c) =>
      c.id === campaignId
        ? {
            ...c,
            status: 'active' as AdCampaignStatus,
            approvedAt,
            expiresAt,
            packageDuration: durationStr as any,
          }
        : c
    );
    saveCampaignsToStorage(updated);
    showToast(`Campaign renewed & extended +${extensionDays} days! Now live on directory.`);
  };

  // Fast-Forward Expiry (Simulation & Testing Tool)
  const handleFastForwardExpiry = (campaignId: string) => {
    const expiredTime = new Date(Date.now() - 60000).toISOString();
    const pastStartTime = new Date(Date.now() - 35 * 86400000).toISOString();

    const updated = adCampaigns.map((c) =>
      c.id === campaignId
        ? {
            ...c,
            status: 'expired' as AdCampaignStatus,
            approvedAt: pastStartTime,
            expiresAt: expiredTime,
          }
        : c
    );
    saveCampaignsToStorage(updated);
    showToast('Simulation: Campaign marked expired. Ad space immediately reverted to original "Own this space" placeholder!');
  };

  const handleRequestCampaignChanges = (campaignId: string, feedback: string) => {
    const target = adCampaigns.find((c) => c.id === campaignId);
    const updated = adCampaigns.map((c) =>
      c.id === campaignId
        ? {
            ...c,
            status: 'changes_requested' as AdCampaignStatus,
            feedbackReason: feedback,
          }
        : c
    );
    saveCampaignsToStorage(updated);
    setCampaignForRejection(null);
    setCampaignRejectionCustomNote('');
    showToast('Revision request sent & campaign marked for changes.');

    if (target) {
      const waText = encodeURIComponent(
        `*📢 KWEST EDITORIAL DESK — AD CAMPAIGN GUIDANCE*\n\n` +
        `*Business:* ${target.businessName}\n` +
        `*Ad Campaign:* "${target.headline}"\n\n` +
        `Hello! Our Editorial Team reviewed your ad submission on the Kahawa West Directory.\n\n` +
        `*Editorial Guidance / Action Required:*\n` +
        `${feedback}\n\n` +
        `*💳 Upfront Payment Reminder:* Paybill: 247247 | Acc No: 537409 (Ukweli Products)\n\n` +
        `Please reply to this message with your updated copy, graphic, or M-Pesa receipt so our desk can activate your campaign live!`
      );
      window.open(`https://wa.me/254764405842?text=${waText}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSaveEditedCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    const updated = adCampaigns.map((c) => (c.id === editingCampaign.id ? editingCampaign : c));
    saveCampaignsToStorage(updated);
    setEditingCampaign(null);
    showToast('Ad copy & design specifications updated!');
  };

  const handleDeleteCampaign = (campaignId: string) => {
    if (confirm('Are you sure you want to delete this ad campaign record?')) {
      const updated = adCampaigns.filter((c) => c.id !== campaignId);
      saveCampaignsToStorage(updated);
      showToast('Campaign record removed.');
    }
  };

  // Ad Sales & Intelligence state
  const [adSearchQuery, setAdSearchQuery] = useState('');
  const [adSelectedFilter, setAdSelectedFilter] = useState<'all' | 'unclaimed' | 'billboard' | 'deals'>('all');
  const [adSelectedZone, setAdSelectedZone] = useState('all');
  const [copiedPitchId, setCopiedPitchId] = useState<string | null>(null);

  // Fetch real-time analytics data for Editorial Desk
  const allStats = useMemo(() => {
    return getAllBusinessAnalytics();
  }, [isOpen, activeMainTab]);

  // Aggregate Metrics for KWEST platform
  const aggregateMetrics = useMemo(() => {
    let totalViews = 0;
    let totalWhatsApp = 0;
    let totalCalls = 0;
    let totalShares = 0;

    const statsList: BusinessAnalytics[] = Object.values(allStats);
    statsList.forEach((stat: BusinessAnalytics) => {
      totalViews += stat.views || 0;
      totalWhatsApp += stat.whatsappClicks || 0;
      totalCalls += stat.phoneCalls || 0;
      totalShares += stat.shares || 0;
    });

    const totalLeads = totalWhatsApp + totalCalls;
    const conversionRate = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : '0';

    return {
      totalViews,
      totalWhatsApp,
      totalCalls,
      totalShares,
      totalLeads,
      conversionRate,
    };
  }, [allStats]);

  // Ranked businesses by lead score
  const rankedBusinesses = useMemo(() => {
    return businesses
      .map((business) => {
        const stats = allStats[business.id] || getBusinessStats(business.id);
        const lead = calculateLeadScore(stats, business.isClaimed);
        return {
          business,
          stats,
          lead,
        };
      })
      .filter(({ business, lead }) => {
        if (adSelectedZone !== 'all' && business.zone !== adSelectedZone) return false;
        if (adSearchQuery.trim() !== '') {
          const q = adSearchQuery.toLowerCase();
          const matchName = business.name.toLowerCase().includes(q);
          const matchCat = business.category.toLowerCase().includes(q);
          const matchZone = business.zone.toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchZone) return false;
        }
        if (adSelectedFilter === 'unclaimed' && business.isClaimed) return false;
        if (adSelectedFilter === 'billboard' && lead.recommendation !== 'Prime Billboard Candidate') return false;
        if (adSelectedFilter === 'deals' && lead.recommendation !== 'Spotlight Deals Candidate') return false;
        return true;
      })
      .sort((a, b) => b.lead.totalInteractions - a.lead.totalInteractions);
  }, [businesses, allStats, adSearchQuery, adSelectedFilter, adSelectedZone]);

  // Filtered directory businesses for direct editing in Editorial Desk
  const filteredDirectoryBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      if (directoryZoneFilter !== 'all' && b.zone !== directoryZoneFilter) return false;
      if (directorySearchQuery.trim() !== '') {
        const q = directorySearchQuery.toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          (b.subCategory && b.subCategory.toLowerCase().includes(q)) ||
          b.zone.toLowerCase().includes(q) ||
          b.phone.includes(q)
        );
      }
      return true;
    });
  }, [businesses, directorySearchQuery, directoryZoneFilter]);

  const handleDownloadCSV = () => {
    const csvContent = exportAnalyticsCSV(businesses);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kwest_ad_sales_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWhatsAppPitchCopy = (business: Business) => {
    const stats = allStats[business.id] || getBusinessStats(business.id);
    const totalLeads = stats.whatsappClicks + stats.phoneCalls;

    return `Hello ${business.name} team,\n\nI am reaching out from *Kahawa West Directory (KWEST)* (kahawawestdirectory.co.ke).\n\nYour profile has generated *${stats.views} views* and *${totalLeads} direct customer inquiries* (${stats.whatsappClicks} WhatsApp chats, ${stats.phoneCalls} calls) from estate residents around ${business.zone}.\n\nSince your listing is already getting high organic reach, we would like to offer you an exclusive *Featured Homepage Billboard Ad* / *Resident Deal Spotlight* to scale your orders across all 10,000+ monthly estate visitors.\n\nWould you like me to send you the quick pricing rate card?`;
  };

  const handleCopyPitch = async (business: Business) => {
    const text = getWhatsAppPitchCopy(business);
    await copyToClipboard(text);
    setCopiedPitchId(business.id);
    setTimeout(() => setCopiedPitchId(null), 3000);
  };

  const handleOpenPitchWhatsApp = (business: Business) => {
    const text = getWhatsAppPitchCopy(business);
    const phone = business.whatsapp || business.phone;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const [previewStory, setPreviewStory] = useState<CommunityStory | null>(null);
  const [editingStory, setEditingStory] = useState<CommunityStory | null>(null);

  // Community Update editing & preview state
  const [previewUpdate, setPreviewUpdate] = useState<CommunityUpdate | null>(null);
  const [editingUpdate, setEditingUpdate] = useState<CommunityUpdate | null>(null);

  // Rejection & Feedback Modal State
  const [storyForRejection, setStoryForRejection] = useState<CommunityStory | null>(null);
  const [updateForRejection, setUpdateForRejection] = useState<CommunityUpdate | null>(null);
  const [rejectionPreset, setRejectionPreset] = useState<string>('photo');
  const [customRejectionFeedback, setCustomRejectionFeedback] = useState<string>('');

  // Enhanced Security State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('kwest_editorial_authenticated') === 'true';
  });
  const [enteredPassword, setEnteredPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState<number>(0);

  // Password Management Settings
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  const [copiedSql, setCopiedSql] = useState(false);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setLockoutTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTimeLeft]);

  const pendingStories = stories.filter((s) => s.status === 'pending_review');
  const publishedStories = stories.filter((s) => s.status === 'published' || !s.status);

  const pendingUpdates = updates.filter((u) => u.status === 'pending_review');
  const publishedUpdates = updates.filter((u) => u.status === 'published' || !u.status);

  // Ad Campaign Moderation Lists
  const pendingCampaigns = adCampaigns.filter((c) => c.status === 'in_review');
  const activeCampaigns = adCampaigns.filter((c) => isCampaignLiveAndActive(c));
  const changesCampaigns = adCampaigns.filter((c) => c.status === 'changes_requested' || c.status === 'rejected');
  const expiredCampaigns = adCampaigns.filter((c) => c.status === 'expired' || (c.status === 'active' && !isCampaignLiveAndActive(c)));

  const filteredCampaigns = useMemo(() => {
    return adCampaigns.filter((c) => {
      if (adCampaignsSubTab === 'pending' && c.status !== 'in_review') return false;
      if (adCampaignsSubTab === 'active' && !isCampaignLiveAndActive(c)) return false;
      if (adCampaignsSubTab === 'changes_requested' && c.status !== 'changes_requested' && c.status !== 'rejected') return false;
      if (adCampaignsSubTab === 'expired' && c.status !== 'expired' && isCampaignLiveAndActive(c)) return false;

      if (campaignZoneFilter !== 'all' && c.targetZone !== campaignZoneFilter) return false;

      if (campaignSearchQuery.trim() !== '') {
        const q = campaignSearchQuery.toLowerCase();
        return (
          c.businessName.toLowerCase().includes(q) ||
          c.headline.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.targetZone.toLowerCase().includes(q) ||
          c.format.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [adCampaigns, adCampaignsSubTab, campaignZoneFilter, campaignSearchQuery]);

  const handleCopySql = async () => {
    const sqlCode = `-- Kahawa West Directory: Unified Database Schema for Supabase

-- 1. COMMUNITY STORIES TABLE
CREATE TABLE IF NOT EXISTS public.community_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    category TEXT NOT NULL,
    zone TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url TEXT,
    image_caption TEXT,
    is_real_photo_confirmed BOOLEAN DEFAULT TRUE,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    author_email TEXT NOT NULL,
    author_phone TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    read_time_minutes INTEGER DEFAULT 3,
    featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'published', 'archived', 'rejected')),
    rejection_reason TEXT,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. COMMUNITY UPDATES TABLE (Alerts, Events, Business Openings, Community Drives)
CREATE TABLE IF NOT EXISTS public.community_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('alert', 'event', 'business', 'community', 'notice')),
    time_info TEXT NOT NULL,
    location TEXT NOT NULL,
    zone TEXT,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    author_phone TEXT,
    author_email TEXT,
    contact TEXT,
    badge TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'published', 'rejected')),
    rejection_reason TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BUSINESS CLAIMS TABLE
CREATE TABLE IF NOT EXISTS public.claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT NOT NULL,
    business_role TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.community_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES
CREATE POLICY "Public can view published stories" ON public.community_stories FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view published updates" ON public.community_updates FOR SELECT USING (status = 'published');

-- PUBLIC INSERT POLICIES (Submissions start as pending_review)
CREATE POLICY "Public can submit stories" ON public.community_stories FOR INSERT WITH CHECK (status = 'pending_review');
CREATE POLICY "Public can submit updates" ON public.community_updates FOR INSERT WITH CHECK (status = 'pending_review');
CREATE POLICY "Public can submit business claims" ON public.claims FOR INSERT WITH CHECK (status = 'pending');
`;
    await copyToClipboard(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimeLeft > 0) return;

    const trimmed = enteredPassword.trim();
    const storedCustomPass = localStorage.getItem('kwest_custom_editor_passphrase');

    const isValid =
      DEFAULT_MASTER_PASSPHRASES.includes(trimmed) ||
      (storedCustomPass && storedCustomPass === trimmed);

    if (isValid) {
      setIsUnlocked(true);
      sessionStorage.setItem('kwest_editorial_authenticated', 'true');
      setPasswordError(null);
      setFailedAttempts(0);
    } else {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= 3) {
        setLockoutTimeLeft(45);
        setPasswordError('Too many failed attempts. Editorial desk locked for 45 seconds.');
      } else {
        setPasswordError(`Incorrect passphrase. ${3 - nextAttempts} attempts remaining before temporary lockout.`);
      }
    }
  };

  const handleLockDesk = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('kwest_editorial_authenticated');
    setEnteredPassword('');
    setPasswordError(null);
  };

  const handleSaveCustomPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordError('New passphrase must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passphrases do not match.');
      return;
    }
    localStorage.setItem('kwest_custom_editor_passphrase', newPassword);
    setPasswordChangeSuccess(true);
    setNewPassword('');
    setConfirmNewPassword('');
    setTimeout(() => {
      setPasswordChangeSuccess(false);
      setIsChangePasswordOpen(false);
    }, 2000);
  };

  // Rejection Presets
  const rejectionReasons: Record<string, string> = {
    photo: 'The submitted image could not be verified as an authentic, real photograph from Kahawa West. We do not accept AI-generated or stock images.',
    political: 'The submission contains campaign slogans, political endorsements or partisan commentary, which violates our non-political community charter.',
    clarity: 'The submission needs additional factual details (dates, exact location in Kahawa West, or specific names) before publication.',
    commercial: 'Purely promotional flyers belong in the Business Directory listings rather than editorial spotlight articles.',
  };

  const handleConfirmStoryRejection = () => {
    if (!storyForRejection) return;
    const finalReason =
      rejectionPreset === 'custom'
        ? customRejectionFeedback.trim() || 'Did not meet editorial community guidelines.'
        : rejectionReasons[rejectionPreset];

    onRejectStory(storyForRejection.id, finalReason);
    setStoryForRejection(null);
    setCustomRejectionFeedback('');
  };

  const handleConfirmUpdateRejection = () => {
    if (!updateForRejection || !onRejectUpdate) return;
    const finalReason =
      rejectionPreset === 'custom'
        ? customRejectionFeedback.trim() || 'Could not verify update details.'
        : rejectionReasons[rejectionPreset];

    onRejectUpdate(updateForRejection.id, finalReason);
    setUpdateForRejection(null);
    setCustomRejectionFeedback('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 font-sans animate-in fade-in">
      <div className="bg-[#121417] text-white rounded-3xl max-w-6xl w-full border border-stone-800 shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* 1. Header Bar */}
        <div className="p-4 sm:p-6 bg-[#16191E] border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#630303]/40 border border-[#630303] flex items-center justify-center text-rose-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg sm:text-xl text-white">
                  Editorial Review Desk
                </h3>
                {isUnlocked ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 flex items-center gap-1">
                    <Unlock className="w-2.5 h-2.5" />
                    Unlocked
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-600/50 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Protected
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400">
                Review & moderate stories, community updates, and business claims
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked && (
              <>
                <button
                  onClick={() => setIsChangePasswordOpen(!isChangePasswordOpen)}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Passphrase</span>
                </button>
                <button
                  onClick={handleLockDesk}
                  className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Change Passphrase Tray */}
        {isUnlocked && isChangePasswordOpen && (
          <div className="p-4 bg-[#1A1E24] border-b border-stone-800 animate-in slide-in-from-top-2">
            <form onSubmit={handleSaveCustomPassword} className="max-w-md space-y-3">
              <h4 className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>Set Custom Editor Passphrase</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="password"
                  placeholder="New Passphrase (min 8 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[#121417] border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="password"
                  placeholder="Confirm New Passphrase"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="bg-[#121417] border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              {passwordChangeSuccess && (
                <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Passphrase updated securely!
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Save Passphrase
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-stone-400 text-xs hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2. Main Body Content: Lock Screen vs Unlocked Tabs */}
        {!isUnlocked ? (
          <div className="p-8 sm:p-12 text-center flex-1 flex flex-col items-center justify-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#630303]/30 border border-[#630303] flex items-center justify-center text-rose-300 mb-4 shadow-lg">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="font-display font-black text-2xl text-white mb-2">
              Editorial Access Required
            </h4>
            <p className="text-stone-400 text-xs sm:text-sm mb-6 leading-relaxed">
              Enter your editorial passphrase to moderate stories, approve community updates, and verify business claims.
            </p>

            <form onSubmit={handleUnlock} className="w-full space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={enteredPassword}
                  onChange={(e) => setEnteredPassword(e.target.value)}
                  disabled={lockoutTimeLeft > 0}
                  placeholder="Enter Editor Passphrase..."
                  className="w-full bg-[#181B20] border border-stone-700/80 rounded-2xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-stone-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {lockoutTimeLeft > 0 && (
                <div className="text-xs text-amber-400 font-bold">
                  Lockout active: {lockoutTimeLeft}s remaining
                </div>
              )}

              <button
                type="submit"
                disabled={lockoutTimeLeft > 0 || !enteredPassword}
                className="w-full py-3 rounded-2xl bg-[#630303] hover:bg-[#4E0202] disabled:opacity-50 text-white font-bold text-sm transition shadow-md flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Editorial Desk</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Navigation Tabs */}
            <div className="p-3 bg-[#16191E] border-b border-stone-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => setActiveMainTab('stories')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeMainTab === 'stories'
                    ? 'bg-[#630303] text-white shadow-sm'
                    : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>📰 Spotlight Stories</span>
                {pendingStories.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-black">
                    {pendingStories.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveMainTab('updates')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeMainTab === 'updates'
                    ? 'bg-[#630303] text-white shadow-sm'
                    : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>📢 Community Updates</span>
                {pendingUpdates.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-black">
                    {pendingUpdates.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveMainTab('claims')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeMainTab === 'claims'
                    ? 'bg-[#630303] text-white shadow-sm'
                    : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>🏢 Claims &amp; Directory</span>
                {claims.filter((c) => c.status === 'pending').length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-black">
                    {claims.filter((c) => c.status === 'pending').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveMainTab('ad_campaigns')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeMainTab === 'ad_campaigns'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-800 text-stone-300 hover:text-white'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-amber-300" />
                <span>📢 Ad Campaigns &amp; Approvals</span>
                {pendingCampaigns.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black animate-pulse">
                    {pendingCampaigns.length} review
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveMainTab('ad_sales')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeMainTab === 'ad_sales'
                    ? 'bg-amber-700/80 text-white shadow-sm'
                    : 'bg-stone-800 text-amber-300 hover:text-amber-100'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>📈 Ad Sales & Outreach</span>
              </button>

              <button
                onClick={() => setActiveMainTab('supabase_guide')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeMainTab === 'supabase_guide'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>🗄️ Supabase Schema & SQL</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* TAB 1: STORIES */}
              {activeMainTab === 'stories' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex p-1 rounded-xl bg-stone-900 border border-stone-800">
                      <button
                        onClick={() => setStorySubTab('pending')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          storySubTab === 'pending'
                            ? 'bg-[#630303] text-white'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        Pending Review ({pendingStories.length})
                      </button>
                      <button
                        onClick={() => setStorySubTab('published')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          storySubTab === 'published'
                            ? 'bg-[#630303] text-white'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        Live Published ({publishedStories.length})
                      </button>
                    </div>

                    <button
                      onClick={onOpenSubmitModal}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Write / Add Story</span>
                    </button>
                  </div>

                  {/* Stories list */}
                  {(storySubTab === 'pending' ? pendingStories : publishedStories).length === 0 ? (
                    <div className="py-16 text-center text-stone-400 text-sm">
                      No stories found in this section.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(storySubTab === 'pending' ? pendingStories : publishedStories).map((story) => (
                        <div
                          key={story.id}
                          className="bg-[#181B20] border border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#630303]/70 text-rose-200 border border-[#630303]">
                                {story.category}
                              </span>
                              <span className="text-xs text-stone-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-emerald-400" />
                                {story.zone}
                              </span>
                            </div>

                            <h4 className="font-display font-bold text-white text-base leading-snug mb-2">
                              {story.title}
                            </h4>

                            <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed mb-3">
                              {story.excerpt || story.content}
                            </p>

                            <div className="text-[11px] text-stone-400 space-y-1 bg-[#121417] p-2.5 rounded-xl border border-stone-800">
                              <div>Author: <strong className="text-stone-200">{story.authorName}</strong> ({story.authorRole})</div>
                              <div>Contact: {story.authorPhone} | {story.authorEmail}</div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setPreviewStory(story)}
                                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </button>
                              <button
                                onClick={() => setEditingStory(story)}
                                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                            </div>

                            {storySubTab === 'pending' ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() => setStoryForRejection(story)}
                                  className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-bold border border-red-800/60 transition"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => onApproveStory(story.id, false)}
                                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold transition"
                                >
                                  Approve & Publish
                                </button>
                                <button
                                  onClick={() => onApproveStory(story.id, true)}
                                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-black shadow-md flex items-center gap-1.5 transition"
                                >
                                  <Star className="w-3.5 h-3.5 fill-current" />
                                  <span>Approve & Feature This Week</span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                {story.featured ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1">
                                      <Star className="w-3.5 h-3.5 fill-current" />
                                      <span>★ Featured This Week</span>
                                    </span>
                                    <button
                                      onClick={() => onApproveStory(story.id, false)}
                                      className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white text-xs font-medium transition"
                                      title="Remove from featured spotlight"
                                    >
                                      Unfeature
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => onApproveStory(story.id, true)}
                                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 hover:border-amber-400 text-xs font-bold flex items-center gap-1.5 transition"
                                  >
                                    <Star className="w-3.5 h-3.5" />
                                    <span>Set as Featured This Week</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => onDeleteStory(story.id)}
                                  className="p-1.5 text-stone-500 hover:text-red-400 transition"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: UPDATES */}
              {activeMainTab === 'updates' && (
                <div className="space-y-6">
                  {/* MODERATOR EMERGENCY WHATSAPP RELAY BAR */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-stone-900 to-stone-900 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-900/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                            Emergency WhatsApp Dispatch Target
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
                            Active
                          </span>
                        </div>
                        {isEditingPhone ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="tel"
                              value={tempPhone}
                              onChange={(e) => setTempPhone(e.target.value)}
                              placeholder="e.g. 0764 405 842 or 2547..."
                              className="px-2.5 py-1 text-xs rounded-lg bg-stone-950 border border-stone-700 text-white focus:outline-none focus:border-emerald-500"
                            />
                            <button
                              onClick={handleSaveModeratorPhone}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setIsEditingPhone(false)}
                              className="px-2 py-1 rounded-lg bg-stone-800 text-stone-300 text-xs hover:text-white transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-stone-300 font-mono flex items-center gap-2 mt-0.5">
                            <span>Phone: <strong className="text-white font-sans">{formatPhoneForDisplay(moderatorPhone)}</strong></span>
                            <span className="text-stone-500">•</span>
                            <span className="text-[11px] text-stone-400 font-sans">Receives all emergency alert dispatch cards</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {!isEditingPhone && (
                      <button
                        onClick={() => {
                          setTempPhone(moderatorPhone);
                          setIsEditingPhone(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 transition shrink-0 self-start sm:self-center"
                      >
                        Change Number
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex p-1 rounded-xl bg-stone-900 border border-stone-800">
                      <button
                        onClick={() => setUpdateSubTab('pending')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          updateSubTab === 'pending'
                            ? 'bg-[#630303] text-white'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        Pending Visitor Updates ({pendingUpdates.length})
                      </button>
                      <button
                        onClick={() => setUpdateSubTab('published')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          updateSubTab === 'published'
                            ? 'bg-[#630303] text-white'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        Live Updates ({publishedUpdates.length})
                      </button>
                    </div>

                    {onOpenSubmitUpdateModal && (
                      <button
                        onClick={onOpenSubmitUpdateModal}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Post New Update</span>
                      </button>
                    )}
                  </div>

                  {(updateSubTab === 'pending' ? pendingUpdates : publishedUpdates).length === 0 ? (
                    <div className="py-16 text-center text-stone-400 text-sm">
                      No community updates found in this section.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(updateSubTab === 'pending' ? pendingUpdates : publishedUpdates).map((up) => (
                        <div
                          key={up.id}
                          className="bg-[#181B20] border border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-start justify-between gap-4"
                        >
                          <div className="flex items-start gap-3.5 flex-1 max-w-2xl">
                            {up.imageUrl && (
                              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-900 border border-stone-700 shrink-0">
                                <img
                                  src={up.imageUrl}
                                  alt={up.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-800 text-emerald-300 border border-stone-700">
                                  {up.type}
                                </span>
                                <span className="text-xs text-stone-400 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-rose-400" />
                                  {up.location || up.zone}
                                </span>
                                <span className="text-xs text-stone-500">•</span>
                                <span className="text-xs text-stone-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-sky-400" />
                                  {up.timeInfo || up.date}
                                </span>
                                {up.obNumber && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/60">
                                    OB: {up.obNumber}
                                  </span>
                                )}
                                {up.urgencyLevel && up.urgencyLevel !== 'standard' && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-700/60">
                                    {up.urgencyLevel === 'critical' ? '🚨 CRITICAL' : '⚡ HIGH PRIORITY'}
                                  </span>
                                )}
                              </div>

                              <h4 className="font-display font-bold text-white text-base">
                                {up.title}
                              </h4>

                              <p className="text-xs text-stone-300 leading-relaxed line-clamp-2">
                                {up.content}
                              </p>

                              {up.imageCaption && (
                                <p className="text-[11px] text-stone-400 italic">
                                  Photo Caption: {up.imageCaption}
                                </p>
                              )}

                              <div className="text-[11px] text-stone-400 pt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span>
                                  Submitter: <strong className="text-stone-200">{up.author}</strong> {up.authorRole && <span className="text-stone-400 font-medium">({up.authorRole})</span>}
                                </span>
                                {up.authorPhone && (
                                  <span className="text-stone-300">
                                    Tel: <strong className="text-emerald-400">{up.authorPhone}</strong>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap md:flex-col items-center md:items-end gap-2 shrink-0 md:self-center">
                            {/* Fast WhatsApp Submitter Contact */}
                            {up.authorPhone && (
                              <button
                                type="button"
                                onClick={() => {
                                  const text = `Hello ${up.author}, regarding your Kahawa West community notice "${up.title}": `;
                                  window.open(getWhatsAppChatUrl(up.authorPhone, text), '_blank', 'noopener,noreferrer');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 text-xs font-bold border border-emerald-700/60 transition flex items-center gap-1.5"
                                title="Chat with Submitter on WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </button>
                            )}

                            {/* Copy Pre-formatted Emergency Dispatch Card */}
                            <button
                              type="button"
                              onClick={() => handleCopyUpdateAlertCard(up)}
                              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700 transition flex items-center gap-1.5"
                              title="Copy Pre-Formatted Emergency WhatsApp Card"
                            >
                              {copiedAlertId === up.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-300">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                                  <span>Copy Alert Card</span>
                                </>
                              )}
                            </button>

                            {updateSubTab === 'pending' ? (
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => setUpdateForRejection(up)}
                                  className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-bold border border-red-800/60 transition"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => onApproveUpdate && onApproveUpdate(up.id)}
                                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                                >
                                  Approve Live
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => onDeleteUpdate && onDeleteUpdate(up.id)}
                                className="p-2 text-stone-500 hover:text-red-400 transition"
                                title="Delete Update"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CLAIMS & DIRECTORY */}
              {activeMainTab === 'claims' && (
                <div className="space-y-4">
                  {/* Subtabs for Claims vs Directory Listings */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
                    <div className="inline-flex p-1 rounded-xl bg-stone-900 border border-stone-800">
                      <button
                        onClick={() => setClaimsSubTab('pending_claims')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                          claimsSubTab === 'pending_claims'
                            ? 'bg-[#630303] text-white'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Claims Queue ({claims.length})</span>
                      </button>
                      <button
                        onClick={() => setClaimsSubTab('all_listings')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                          claimsSubTab === 'all_listings'
                            ? 'bg-[#630303] text-white'
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        <Building className="w-3.5 h-3.5" />
                        <span>All Directory Listings ({businesses.length})</span>
                      </button>
                    </div>

                    {claimsSubTab === 'all_listings' && (
                      <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            type="text"
                            placeholder="Search directory to edit..."
                            value={directorySearchQuery}
                            onChange={(e) => setDirectorySearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-rose-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {claimsSubTab === 'pending_claims' ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-display font-bold text-white text-base">
                            Business Claim Verification Queue
                          </h4>
                          <p className="text-xs text-stone-400">
                            Incoming claims submitted to the Supabase <code>claims</code> table by local merchants and authorized agents.
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#260101] text-rose-300 border border-rose-800">
                          Total: {claims.length} {claims.length === 1 ? 'Record' : 'Records'}
                        </span>
                      </div>

                      {claims.length === 0 ? (
                        <div className="py-12 text-center text-stone-400 text-sm bg-[#181B20] rounded-2xl border border-stone-800">
                          No business claims recorded yet. When a business owner or agent claims a listing, it will show up here.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {claims.map((claim, idx) => (
                            <div
                              key={claim.id || `${claim.business_id}-${idx}`}
                              className="bg-[#181B20] border border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h5 className="font-bold text-white text-base">
                                    {claim.business_name || claim.business_id}
                                  </h5>
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                      claim.status === 'verified'
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                        : claim.status === 'rejected'
                                        ? 'bg-rose-950 text-rose-300 border border-rose-700'
                                        : 'bg-amber-950 text-amber-300 border border-amber-700'
                                    }`}
                                  >
                                    {claim.status || 'Pending'}
                                  </span>
                                  <span className="text-[11px] text-stone-500 font-mono">
                                    ID: {claim.business_id}
                                  </span>
                                </div>

                                <p className="text-xs text-stone-300">
                                  Claimant: <strong className="text-white">{claim.full_name}</strong>{' '}
                                  <span className="text-stone-400">({claim.business_role || 'Owner'})</span>
                                </p>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400">
                                  <span>📞 Phone: <strong className="text-stone-200">{claim.phone_number}</strong></span>
                                  <span>✉️ Email: <strong className="text-stone-200">{claim.email}</strong></span>
                                  {claim.created_at && (
                                    <span>📅 Submitted: {new Date(claim.created_at).toLocaleDateString()}</span>
                                  )}
                                </div>

                                {claim.notes && (
                                  <div className="mt-2 p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 text-xs text-stone-300">
                                    <span className="font-semibold text-stone-400">Verification Notes: </span>
                                    {claim.notes}
                                  </div>
                                )}
                              </div>

                              {/* Moderation Actions */}
                              <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                                {claim.status !== 'verified' && onApproveClaim && (
                                  <button
                                    onClick={() => onApproveClaim(claim.business_id)}
                                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                                    title="Approve & mark business as verified"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Verify Claim</span>
                                  </button>
                                )}

                                {claim.status !== 'rejected' && onRejectClaim && (
                                  <button
                                    onClick={() => {
                                      const reason = prompt('Enter rejection reason (optional):') || 'Unverified ownership proof';
                                      onRejectClaim(claim.business_id, reason);
                                    }}
                                    className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-rose-900/60 text-stone-300 hover:text-rose-200 border border-stone-700 font-medium text-xs flex items-center gap-1.5 transition"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                  </button>
                                )}

                                {onDeleteClaim && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Remove claim record for "${claim.business_name || claim.business_id}"?`)) {
                                        onDeleteClaim(claim.business_id);
                                      }
                                    }}
                                    className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition"
                                    title="Delete claim record"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Directory Listings Manager with Direct Edit Button */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-display font-bold text-white text-base">
                            Directory Business Listings & Metadata Editor
                          </h4>
                          <p className="text-xs text-stone-400">
                            Edit details, operating hours, Lipa na M-Pesa till/paybill, and photo galleries directly for any listing.
                          </p>
                        </div>
                        <span className="text-xs text-stone-400">
                          Showing {filteredDirectoryBusinesses.length} of {businesses.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                        {filteredDirectoryBusinesses.map((b) => (
                          <div
                            key={b.id}
                            className="bg-[#181B20] border border-stone-800 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-stone-700 transition"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h5 className="font-bold text-white text-sm truncate">{b.name}</h5>
                                <div className="flex items-center gap-1 shrink-0">
                                  {b.isClaimed ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                                      Claimed
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 text-stone-400">
                                      Unclaimed
                                    </span>
                                  )}
                                  {b.isVerified && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                                      Verified
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-stone-400 truncate mb-2">{b.tagline || b.category}</p>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-stone-500">
                                <span>📍 {b.zone}</span>
                                <span>📞 {b.phone}</span>
                                {b.mpesa?.type && <span>💳 {b.mpesa.type}</span>}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between">
                              <span className="text-[11px] text-stone-500 font-mono">ID: {b.id}</span>
                              {onEditBusiness && (
                                <button
                                  onClick={() => onEditBusiness(b)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4D0202] hover:bg-[#630303] text-white text-xs font-bold transition shadow-xs border border-rose-800/40 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Edit Listing</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: AD CAMPAIGNS & EDITORIAL APPROVAL DESK */}
              {activeMainTab === 'ad_campaigns' && (
                <div className="space-y-6 max-w-5xl">
                  {/* Toast notification */}
                  {campaignActionToast && (
                    <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{campaignActionToast}</span>
                      </div>
                      <button onClick={() => setCampaignActionToast(null)} className="text-emerald-400 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Header & Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-black text-lg text-white">
                          Ad Campaigns &amp; Editorial Moderation Desk
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Quality &amp; Payment Gateway
                        </span>
                      </div>
                      <p className="text-xs text-stone-400">
                        Review merchant ads, optimize copy &amp; graphics, verify upfront Lipa na M-Pesa payments, and activate campaigns live.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const sampleAd: BusinessAdCampaign = {
                            id: `kwest-ad-${Date.now()}`,
                            businessId: 'quick-sample',
                            businessName: 'Kahawa West Fresh Grocers',
                            format: 'category-spotlight',
                            headline: 'Farm Fresh Organic Spinach & Tomatoes Direct Delivery',
                            description: 'Freshly harvested daily from Kiambu farms. Same-hour drop off at Jacaranda, Congo, and Kamiti estates.',
                            ctaText: 'Order Groceries',
                            badgeText: 'Farm Direct',
                            targetZone: 'Jacaranda',
                            imageUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&auto=format&fit=crop&q=80',
                            requestCustomDesign: true,
                            packageDuration: '15_days',
                            placementPriceKsh: 1350,
                            creativeFeeKsh: 1000,
                            totalPriceKsh: 2350,
                            status: 'in_review',
                            createdAt: new Date().toISOString(),
                          };
                          const updated = [sampleAd, ...adCampaigns];
                          saveCampaignsToStorage(updated);
                          showToast('Sample merchant ad added to review queue!');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition border border-stone-700 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Add Test Campaign</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-amber-950/30 p-3.5 rounded-2xl border border-amber-500/40 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
                        <span className="font-semibold uppercase text-[10px]">Awaiting Editorial Check</span>
                        <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                      </div>
                      <span className="text-2xl font-display font-black text-amber-300">
                        {pendingCampaigns.length}
                      </span>
                    </div>

                    <div className="bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-500/40 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
                        <span className="font-semibold uppercase text-[10px]">Active Live Ads</span>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-2xl font-display font-black text-emerald-300">
                        {activeCampaigns.length}
                      </span>
                    </div>

                    <div className="bg-rose-950/30 p-3.5 rounded-2xl border border-rose-500/40 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-rose-400 text-xs mb-1">
                        <span className="font-semibold uppercase text-[10px]">Expired / Reverted</span>
                        <RotateCcw className="w-4 h-4 text-rose-400" />
                      </div>
                      <span className="text-2xl font-display font-black text-rose-300">
                        {expiredCampaigns.length}
                      </span>
                    </div>

                    <div className="bg-[#181B20] p-3.5 rounded-2xl border border-stone-800 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                        <span className="font-semibold uppercase text-[10px]">Total Booking Value</span>
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-xl font-display font-black text-white font-mono">
                        KSh {adCampaigns.reduce((acc, c) => acc + (c.totalPriceKsh || 0), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Editorial Rule Notice Banner */}
                  <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-white">
                        Editorial Standard: Mandatory Verification &amp; Auto-Revert Rules
                      </p>
                      <p className="text-stone-300 leading-relaxed">
                        Every merchant ad is queued with status <code className="text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded">in_review</code>. Once approved, campaigns run for their exact booked package duration (<strong>7, 15, or 30 days</strong>). The system automatically tracks time and intelligently reverts any expired ad space back to the default <span className="text-amber-300 font-semibold">&quot;Own this space&quot;</span> placeholder.
                      </p>
                    </div>
                  </div>

                  {/* Sub Tabs & Filters */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-1.5 p-1 bg-[#121417] rounded-xl border border-stone-800 w-full sm:w-auto overflow-x-auto">
                      <button
                        onClick={() => setAdCampaignsSubTab('pending')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                          adCampaignsSubTab === 'pending'
                            ? 'bg-amber-500 text-stone-950 shadow-sm'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Review ({pendingCampaigns.length})</span>
                      </button>

                      <button
                        onClick={() => setAdCampaignsSubTab('active')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                          adCampaignsSubTab === 'active'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Live Active ({activeCampaigns.length})</span>
                      </button>

                      <button
                        onClick={() => setAdCampaignsSubTab('changes_requested')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                          adCampaignsSubTab === 'changes_requested'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Needs Guidance ({changesCampaigns.length})</span>
                      </button>

                      <button
                        onClick={() => setAdCampaignsSubTab('expired')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                          adCampaignsSubTab === 'expired'
                            ? 'bg-rose-700 text-white shadow-sm'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Expired / Ended ({expiredCampaigns.length})</span>
                      </button>

                      <button
                        onClick={() => setAdCampaignsSubTab('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                          adCampaignsSubTab === 'all'
                            ? 'bg-stone-700 text-white'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        All ({adCampaigns.length})
                      </button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-52">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-500" />
                        <input
                          type="text"
                          value={campaignSearchQuery}
                          onChange={(e) => setCampaignSearchQuery(e.target.value)}
                          placeholder="Search merchant or ad..."
                          className="w-full pl-8 pr-3 py-1.5 bg-[#121417] border border-stone-800 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <select
                        value={campaignZoneFilter}
                        onChange={(e) => setCampaignZoneFilter(e.target.value)}
                        className="bg-[#121417] border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
                      >
                        <option value="all">All Zones</option>
                        <option value="Congo">Congo</option>
                        <option value="Roundabout">Roundabout</option>
                        <option value="Kamiti">Kamiti Rd</option>
                        <option value="Jacaranda">Jacaranda</option>
                        <option value="Kiu Kenda">Kiu Kenda</option>
                        <option value="Soweto">Soweto</option>
                      </select>
                    </div>
                  </div>

                  {/* Campaigns List */}
                  {filteredCampaigns.length === 0 ? (
                    <div className="py-12 text-center bg-[#121417] rounded-2xl border border-stone-800 space-y-2">
                      <Target className="w-8 h-8 text-stone-600 mx-auto" />
                      <p className="text-sm font-bold text-stone-400">No campaigns found in this filter.</p>
                      <p className="text-xs text-stone-600">
                        When merchants create ads through the &apos;Promote Business&apos; modal, they will land here for verification.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredCampaigns.map((campaign) => {
                        const timeInfo = getAdTimeRemaining(campaign);
                        const isPending = campaign.status === 'in_review';
                        const isActive = isCampaignLiveAndActive(campaign);
                        const isExpired = campaign.status === 'expired' || (!isPending && timeInfo.isExpired);
                        const isChangesRequested = campaign.status === 'changes_requested';
                        const isRejected = campaign.status === 'rejected';

                        return (
                          <div
                            key={campaign.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              isPending
                                ? 'bg-[#181B20] border-amber-500/50 shadow-md shadow-amber-950/20'
                                : isActive
                                ? 'bg-[#14181E] border-emerald-500/30'
                                : isExpired
                                ? 'bg-[#181414] border-rose-900/40'
                                : 'bg-[#141619] border-stone-800'
                            }`}
                          >
                            <div className="flex flex-col lg:flex-row gap-4">
                              {/* Left / Top: Ad Info & Merchant Specs */}
                              <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-display font-black text-white text-base">
                                      {campaign.businessName}
                                    </h5>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-800 text-stone-300 border border-stone-700">
                                      📍 {campaign.targetZone}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-stone-800 text-amber-300 border border-stone-700">
                                      {campaign.format.replace('-', ' ')}
                                    </span>
                                  </div>

                                  {/* Status badge */}
                                  <div>
                                    {isPending && (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/50">
                                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                                        <span>Queued for Review</span>
                                      </span>
                                    )}
                                    {isActive && (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Live Active ({timeInfo.label})</span>
                                      </span>
                                    )}
                                    {isExpired && (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/50">
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Ended • Reverted to Own Space</span>
                                      </span>
                                    )}
                                    {isChangesRequested && (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/50">
                                        <HelpCircle className="w-3.5 h-3.5" />
                                        <span>Changes Requested</span>
                                      </span>
                                    )}
                                    {isRejected && (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/50">
                                        <XCircle className="w-3.5 h-3.5" />
                                        <span>Rejected</span>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Payment Breakdown and Duration status */}
                                <div className="p-3 rounded-xl bg-black/40 border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                                  <div>
                                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Package &amp; Duration</span>
                                    <strong className="text-white">
                                      {campaign.packageDuration.replace('_', ' ').toUpperCase()} (KSh {campaign.placementPriceKsh.toLocaleString()})
                                    </strong>
                                  </div>
                                  <div>
                                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Copywriting &amp; Design</span>
                                    {campaign.requestCustomDesign ? (
                                      <span className="text-amber-300 font-bold inline-flex items-center gap-1">
                                        <Palette className="w-3 h-3" />
                                        <span>Requested (+KSh {campaign.creativeFeeKsh.toLocaleString()})</span>
                                      </span>
                                    ) : (
                                      <span className="text-stone-300">Self-Provided Graphics</span>
                                    )}
                                  </div>
                                  <div>
                                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Upfront Lipa na M-Pesa</span>
                                    <strong className="text-emerald-400 font-mono text-sm">
                                      KSh {campaign.totalPriceKsh.toLocaleString()}
                                    </strong>
                                    <span className="text-[10px] text-stone-400 block">Acc: 537409 (Ukweli Products)</span>
                                  </div>
                                </div>

                                {/* Active Countdown & Auto-Revert Progress */}
                                {isActive && (
                                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Live Countdown: {timeInfo.label}</span>
                                      </div>
                                      <span className="text-[11px] text-stone-400">
                                        Auto-reverts to &quot;Own this space&quot; on: <strong className="text-stone-200">{timeInfo.formattedExpiry}</strong>
                                      </span>
                                    </div>
                                    <div className="w-full bg-stone-900 rounded-full h-1.5 overflow-hidden border border-emerald-500/20">
                                      <div
                                        className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(0, timeInfo.progressPercent))}%` }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Expired Notice */}
                                {isExpired && (
                                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2">
                                      <RotateCcw className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                      <div>
                                        <strong className="text-white block font-bold">Campaign Expired &amp; Defaulted to Original Space</strong>
                                        <span className="text-stone-400 text-[11px]">
                                          Ended on {timeInfo.formattedExpiry}. The billboard placeholder is currently showing &quot;Own this space&quot;.
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Previous Editorial Feedback if any */}
                                {campaign.feedbackReason && (
                                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-700/40 text-xs text-blue-200 flex items-start gap-2">
                                    <MessageSquare className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="text-white block text-[11px]">Editorial Desk Notes / Feedback:</strong>
                                      <span>{campaign.feedbackReason}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Ad Live Visual Card Preview */}
                                <div className="p-3 rounded-xl bg-stone-900 border border-stone-700 space-y-2">
                                  <div className="flex items-center justify-between text-[11px] text-stone-400 border-b border-stone-800 pb-1.5">
                                    <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                                      <Eye className="w-3 h-3" /> Visual Ad Layout Preview
                                    </span>
                                    <span>Target Zone: {campaign.targetZone}</span>
                                  </div>

                                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                                    {campaign.imageUrl && (
                                      <img
                                        src={campaign.imageUrl}
                                        alt={campaign.headline ? `${campaign.headline} - Sponsored campaign in Kahawa West` : 'Sponsored ad campaign'}
                                        title="Sponsored ad campaign photo"
                                        className="w-full sm:w-28 h-20 object-cover rounded-lg border border-stone-700 shrink-0"
                                        referrerPolicy="no-referrer"
                                      />
                                    )}
                                    <div className="flex-1 space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 font-black text-[10px] uppercase">
                                          {campaign.badgeText || 'Special'}
                                        </span>
                                        <h6 className="font-bold text-white text-xs sm:text-sm">
                                          {campaign.headline}
                                        </h6>
                                      </div>
                                      <p className="text-stone-300 text-xs line-clamp-2 leading-relaxed">
                                        {campaign.description}
                                      </p>
                                      <div className="pt-1">
                                        <span className="px-3 py-1 rounded-md bg-[#630303] text-white text-[11px] font-bold inline-flex items-center gap-1">
                                          <span>{campaign.ctaText || 'Contact Merchant'}</span>
                                          <ArrowRight className="w-3 h-3" />
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Right / Bottom: Editorial Action Controls */}
                              <div className="lg:w-64 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-stone-800 pt-3 lg:pt-0 lg:pl-4 space-y-2 shrink-0">
                                <div className="space-y-2">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                                    Editorial Actions
                                  </span>

                                  {/* Approve / Activate Button (if pending or changes) */}
                                  {!isActive && !isExpired && (
                                    <button
                                      type="button"
                                      onClick={() => handleApproveCampaign(campaign.id)}
                                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span>Approve &amp; Activate Live</span>
                                    </button>
                                  )}

                                  {/* Renewal Buttons (if expired or active) */}
                                  {isExpired ? (
                                    <div className="space-y-1.5">
                                      <span className="text-[10px] uppercase font-bold text-amber-400 block">
                                        Renew / Reactivate Slot:
                                      </span>
                                      <div className="grid grid-cols-3 gap-1">
                                        <button
                                          type="button"
                                          onClick={() => handleRenewCampaign(campaign.id, 7)}
                                          className="py-1.5 px-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg transition text-center"
                                        >
                                          +7 Days
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleRenewCampaign(campaign.id, 15)}
                                          className="py-1.5 px-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg transition text-center"
                                        >
                                          +15 Days
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleRenewCampaign(campaign.id, 30)}
                                          className="py-1.5 px-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg transition text-center"
                                        >
                                          +30 Days
                                        </button>
                                      </div>
                                    </div>
                                  ) : isActive ? (
                                    <div className="space-y-1.5">
                                      {/* Fast Forward Test Button (For testing automatic expiry & fallback) */}
                                      <button
                                        type="button"
                                        onClick={() => handleFastForwardExpiry(campaign.id)}
                                        title="Simulate ad campaign expiry to verify billboard fallback to 'Own this space'"
                                        className="w-full py-1.5 px-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition border border-amber-500/30 cursor-pointer"
                                      >
                                        <FastForward className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Test Expiry &amp; Auto-Fallback</span>
                                      </button>
                                    </div>
                                  ) : null}

                                  {/* Edit & Polish Button */}
                                  <button
                                    type="button"
                                    onClick={() => setEditingCampaign(campaign)}
                                    className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition border border-stone-700 cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Edit &amp; Improve Copy</span>
                                  </button>

                                  {/* WhatsApp Guidance / Renewal Pitch to Merchant */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const waText = isExpired
                                        ? encodeURIComponent(
                                            `*📢 KWEST EDITORIAL DESK — AD RENEWAL NOTICE*\n\n` +
                                            `*Business:* ${campaign.businessName} (${campaign.targetZone})\n` +
                                            `*Campaign:* "${campaign.headline}"\n\n` +
                                            `Hello! Your booked ad placement on the Kahawa West Directory has reached its scheduled duration (${campaign.packageDuration.replace('_', ' ')}) and has ended.\n\n` +
                                            `Would you like to renew your spot (7, 15, or 30 days) to keep getting customer leads from residents? Let us know so we can keep your banner active!`
                                          )
                                        : encodeURIComponent(
                                            `*📢 KWEST EDITORIAL DESK — MERCHANT AD COACHING*\n\n` +
                                            `*Business:* ${campaign.businessName} (${campaign.targetZone})\n` +
                                            `*Campaign:* "${campaign.headline}"\n\n` +
                                            `Hello! I am checking your ad copy for the Kahawa West Directory.\n\n` +
                                            `• *Format:* ${campaign.format}\n` +
                                            `• *Duration:* ${campaign.packageDuration}\n` +
                                            `• *Total Payable (Upfront):* KSh ${campaign.totalPriceKsh.toLocaleString()} (Paybill 247247, Acc 537409)\n\n` +
                                            `Do you have any updated photo artwork or specific WhatsApp promo number you'd like us to link? Let me know so we can finalize and activate your campaign!`
                                          );
                                      window.open(`https://wa.me/254764405842?text=${waText}`, '_blank', 'noopener,noreferrer');
                                    }}
                                    className={`w-full py-2 px-3 rounded-xl ${
                                      isExpired
                                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                                        : 'bg-[#25D366] hover:bg-[#1EBE5D] text-black'
                                    } font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer`}
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>{isExpired ? 'WhatsApp Renewal Pitch' : 'WhatsApp Guidance'}</span>
                                  </button>

                                  {/* Request Changes / Reject */}
                                  {!isChangesRequested && !isRejected && !isExpired && (
                                    <button
                                      type="button"
                                      onClick={() => setCampaignForRejection(campaign)}
                                      className="w-full py-2 px-3 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-red-800/60 cursor-pointer"
                                    >
                                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                                      <span>Request Revisions</span>
                                    </button>
                                  )}
                                </div>

                                <div className="pt-2 border-t border-stone-800 flex justify-between items-center text-[10px] text-stone-500">
                                  <span>ID: {campaign.id.slice(-8)}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCampaign(campaign.id)}
                                    className="text-stone-500 hover:text-red-400 transition cursor-pointer"
                                    title="Delete Campaign Record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: AD SALES & OUTREACH INTELLIGENCE (LOCKED FOR EDITOR ALONE) */}
              {activeMainTab === 'ad_sales' && (
                <div className="space-y-6 max-w-5xl">
                  {/* Header & Export Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-black text-lg text-white">
                          Ad Sales & Engagement Intelligence
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Editor Confidential
                        </span>
                      </div>
                      <p className="text-xs text-stone-400">
                        Merchant traffic metrics, high-intent lead scoring, and 1-click WhatsApp ad proposal pitches.
                      </p>
                    </div>

                    <button
                      onClick={handleDownloadCSV}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm cursor-pointer self-start sm:self-auto"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Leads CSV</span>
                    </button>
                  </div>

                  {/* Aggregate KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="bg-[#181B20] p-4 rounded-2xl border border-stone-800 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                        <span className="font-semibold uppercase text-[10px]">Total Views</span>
                        <Eye className="w-4 h-4 text-sky-400" />
                      </div>
                      <span className="text-2xl font-display font-black text-white">
                        {aggregateMetrics.totalViews.toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-800/60 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
                        <span className="font-semibold uppercase text-[10px]">WhatsApp Chats</span>
                        <MessageSquare className="w-4 h-4 text-[#25D366]" />
                      </div>
                      <span className="text-2xl font-display font-black text-emerald-300">
                        {aggregateMetrics.totalWhatsApp.toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-[#181B20] p-4 rounded-2xl border border-stone-800 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                        <span className="font-semibold uppercase text-[10px]">Phone Calls</span>
                        <Phone className="w-4 h-4 text-amber-400" />
                      </div>
                      <span className="text-2xl font-display font-black text-white">
                        {aggregateMetrics.totalCalls.toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-[#181B20] p-4 rounded-2xl border border-stone-800 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                        <span className="font-semibold uppercase text-[10px]">Shares</span>
                        <Share2 className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-2xl font-display font-black text-white">
                        {aggregateMetrics.totalShares.toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-[#181B20] p-4 rounded-2xl border border-stone-800 flex flex-col justify-between col-span-2 sm:col-span-1">
                      <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                        <span className="font-semibold uppercase text-[10px]">Lead Rate</span>
                        <Sparkles className="w-4 h-4 text-rose-400" />
                      </div>
                      <span className="text-2xl font-display font-black text-rose-300">
                        {aggregateMetrics.conversionRate}%
                      </span>
                    </div>
                  </div>

                  {/* Filter & Search Toolbar */}
                  <div className="bg-[#181B20] p-3 rounded-2xl border border-stone-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search lead candidate or zone..."
                        value={adSearchQuery}
                        onChange={(e) => setAdSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={adSelectedFilter}
                        onChange={(e) => setAdSelectedFilter(e.target.value as any)}
                        className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                      >
                        <option value="all">All Lead Types</option>
                        <option value="unclaimed">Unclaimed Prospects</option>
                        <option value="billboard">Prime Billboard Candidates</option>
                        <option value="deals">Spotlight Deals Candidates</option>
                      </select>

                      <select
                        value={adSelectedZone}
                        onChange={(e) => setAdSelectedZone(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                      >
                        <option value="all">All Estate Zones</option>
                        <option value="Kongo">Kongo</option>
                        <option value="Kamiti Road">Kamiti Road</option>
                        <option value="Cooperative">Cooperative</option>
                        <option value="Soweto">Soweto</option>
                        <option value="St. Joseph">St. Joseph</option>
                        <option value="Bima Road">Bima Road</option>
                        <option value="Kiwanja">Kiwanja</option>
                      </select>
                    </div>
                  </div>

                  {/* Ranked Lead Candidates */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-xs text-stone-400 uppercase tracking-wider">
                      Ranked Ad Sales Candidates ({rankedBusinesses.length})
                    </h5>

                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                      {rankedBusinesses.map(({ business, stats, lead }) => {
                        const totalDirectInquiries = stats.whatsappClicks + stats.phoneCalls;

                        return (
                          <div
                            key={business.id}
                            className="bg-[#181B20] border border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-stone-700 transition"
                          >
                            <div className="space-y-2 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h5 className="font-bold text-white text-base truncate">
                                  {business.name}
                                </h5>
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#260101] text-rose-300 border border-rose-900">
                                  {business.zone}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    (lead.leadScore ?? lead.score ?? 0) >= 50
                                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                      : (lead.leadScore ?? lead.score ?? 0) >= 20
                                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                      : 'bg-stone-800 text-stone-400'
                                  }`}
                                >
                                  Lead Score: {lead.leadScore ?? lead.score ?? 0} ({(lead.priority || 'standard').toUpperCase()})
                                </span>
                              </div>

                              <p className="text-xs text-stone-300">
                                <strong className="text-amber-400 font-semibold">Recommended Pitch: </strong>
                                {lead.recommendation} • {business.phone}
                              </p>

                              {/* Mini metrics ribbon */}
                              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                                  <strong className="text-white">{stats.views}</strong> views
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                                  <strong className="text-white">{stats.whatsappClicks}</strong> chats
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                                  <strong className="text-white">{stats.phoneCalls}</strong> calls
                                </span>
                                <span className="text-stone-500">
                                  Total Inquiries: <strong className="text-emerald-400">{totalDirectInquiries}</strong>
                                </span>
                              </div>
                            </div>

                            {/* Outreach Pitch Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleCopyPitch(business)}
                                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition border border-stone-700 cursor-pointer"
                                title="Copy tailored WhatsApp pitch script"
                              >
                                {copiedPitchId === business.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-400">Copied Script!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Copy Pitch</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleOpenPitchWhatsApp(business)}
                                className="px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-black font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
                                title="Open WhatsApp chat with pre-written pitch"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>WhatsApp Pitch</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SUPABASE GUIDE */}
              {activeMainTab === 'supabase_guide' && (
                <div className="space-y-4 max-w-4xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-white text-base">
                        Supabase Database Setup Script
                      </h4>
                      <p className="text-xs text-stone-400">
                        Copy & execute in your Supabase SQL editor for persistent multi-device storage.
                      </p>
                    </div>
                    <button
                      onClick={handleCopySql}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Schema'}</span>
                    </button>
                  </div>

                  <pre className="bg-[#0D0F12] text-emerald-300 p-4 rounded-2xl text-xs font-mono overflow-x-auto border border-stone-800 leading-relaxed max-h-96">
{`-- Kahawa West Directory: Production Supabase Schema
-- 1. Business Claims Table (Stores visitors claiming businesses)
CREATE TABLE IF NOT EXISTS public.claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    business_name TEXT,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT NOT NULL,
    business_role TEXT NOT NULL,
    national_id TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Customized / Claimed Businesses & Visitor Submissions
CREATE TABLE IF NOT EXISTS public.businesses (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    tagline TEXT,
    category TEXT NOT NULL,
    sub_category TEXT,
    zone TEXT NOT NULL,
    landmark TEXT,
    phone TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT,
    is_verified BOOLEAN DEFAULT true,
    is_claimed BOOLEAN DEFAULT false,
    claimed_by TEXT,
    claimed_at TEXT,
    rating NUMERIC(2,1) DEFAULT 0.0,
    review_count INT DEFAULT 0,
    price_level TEXT DEFAULT 'Moderate',
    hero_image TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    services JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    mpesa JSONB,
    social_links JSONB,
    special_offer JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. Community Spotlight Stories
CREATE TABLE IF NOT EXISTS public.community_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    category TEXT NOT NULL,
    zone TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    image_caption TEXT,
    is_real_photo_confirmed BOOLEAN DEFAULT true,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    author_email TEXT NOT NULL,
    author_phone TEXT NOT NULL,
    date TEXT NOT NULL,
    read_time_minutes INT DEFAULT 3,
    featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending_review', -- 'pending_review', 'published', 'rejected'
    rejection_reason TEXT,
    likes INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. Community Updates & Notices
CREATE TABLE IF NOT EXISTS public.community_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'alert', 'event', 'business', 'community'
    title TEXT NOT NULL,
    time_info TEXT NOT NULL,
    location TEXT NOT NULL,
    zone TEXT,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    author_phone TEXT,
    author_email TEXT,
    date TEXT,
    status TEXT DEFAULT 'pending_review', -- 'pending_review', 'published', 'rejected'
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 5. Verified Resident Reviews & Feedback
CREATE TABLE IF NOT EXISTS public.business_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id TEXT NOT NULL,
    reviewer_name TEXT NOT NULL,
    reviewer_phone TEXT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    verified_visit BOOLEAN DEFAULT true,
    visit_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS) & Public Policies
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on businesses" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Allow public insert on claims" ON public.claims FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read claims" ON public.claims FOR SELECT USING (true);
CREATE POLICY "Allow public read published stories" ON public.community_stories FOR SELECT USING (true);
CREATE POLICY "Allow public insert stories" ON public.community_stories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read published updates" ON public.community_updates FOR SELECT USING (true);
CREATE POLICY "Allow public insert updates" ON public.community_updates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert feedback" ON public.business_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read feedback" ON public.business_feedback FOR SELECT USING (true);`}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ad Campaign Revision / Guidance Request Dialog */}
      {campaignForRejection && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#181B20] text-white rounded-2xl max-w-lg w-full p-6 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-lg text-amber-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <span>Editorial Guidance &amp; Revision</span>
              </h4>
              <button
                onClick={() => setCampaignForRejection(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-300">
              Select feedback category to guide <strong>{campaignForRejection.businessName}</strong> on improving their ad or resolving payment before going live:
            </p>

            <select
              value={campaignRejectionPreset}
              onChange={(e) => setCampaignRejectionPreset(e.target.value)}
              className="w-full bg-[#121417] border border-stone-700 rounded-xl p-2.5 text-xs text-white"
            >
              <option value="payment">💳 M-Pesa Upfront Payment Pending Verification (Paybill 247247, Acc 537409)</option>
              <option value="photo">🖼️ Image Resolution / Format Needs Improvement</option>
              <option value="copy">✍️ Headline &amp; Copy Clarity (Need more compelling offer details)</option>
              <option value="terms">📋 Offer terms / Discount expiry date needs clarity</option>
              <option value="custom">✏️ Custom Editorial Note</option>
            </select>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-400 uppercase">
                Detailed Guidance for Merchant (will be prefilled to WhatsApp):
              </label>
              <textarea
                value={
                  campaignRejectionCustomNote ||
                  (campaignRejectionPreset === 'payment'
                    ? 'Please provide your M-Pesa transaction code or confirmation message for Paybill 247247 (Acc: 537409, Ukweli Products) so we can activate your live placement.'
                    : campaignRejectionPreset === 'photo'
                    ? 'Your ad artwork appears pixelated or unclear. Please share a clear 800x600 landscape photograph of your storefront, products, or flyer.'
                    : campaignRejectionPreset === 'copy'
                    ? 'We recommend clarifying the specific discount or resident offer in the headline to maximize customer inquiries.'
                    : campaignRejectionPreset === 'terms'
                    ? 'Please specify the exact dates or conditions for your promotional discount so customers are not confused.'
                    : '')
                }
                onChange={(e) => setCampaignRejectionCustomNote(e.target.value)}
                placeholder="Write specific suggestions or feedback for the merchant..."
                className="w-full bg-[#121417] border border-stone-700 rounded-xl p-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCampaignForRejection(null)}
                className="px-3.5 py-2 rounded-xl text-stone-400 text-xs hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const reasonText =
                    campaignRejectionCustomNote.trim() ||
                    (campaignRejectionPreset === 'payment'
                      ? 'Please provide your M-Pesa transaction code for Paybill 247247 (Acc: 537409).'
                      : campaignRejectionPreset === 'photo'
                      ? 'Please send a high-resolution photo for your ad banner.'
                      : 'Please review and update your ad copy specifications.');
                  handleRequestCampaignChanges(campaignForRejection.id, reasonText);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Guidance &amp; Request Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ad Campaign Edit / Polish Dialog */}
      {editingCampaign && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#181B20] text-white rounded-2xl max-w-xl w-full p-6 border border-stone-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="font-display font-bold text-base text-white">
                    Editorial Polish: {editingCampaign.businessName}
                  </h4>
                  <p className="text-xs text-stone-400">
                    Refine copy, fix typos, enhance conversion, or swap image URL.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingCampaign(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedCampaign} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-300 block">Ad Headline (Catchy hook)</label>
                <input
                  type="text"
                  value={editingCampaign.headline}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, headline: e.target.value })}
                  className="w-full bg-[#121417] border border-stone-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-300 block">Description / Value Proposition</label>
                <textarea
                  value={editingCampaign.description}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, description: e.target.value })}
                  className="w-full bg-[#121417] border border-stone-700 rounded-xl p-2.5 text-white leading-relaxed"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-300 block">Badge Text</label>
                  <input
                    type="text"
                    value={editingCampaign.badgeText || ''}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, badgeText: e.target.value })}
                    className="w-full bg-[#121417] border border-stone-700 rounded-xl p-2.5 text-white"
                    placeholder="e.g. 20% OFF, Limited Offer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-300 block">CTA Button Label</label>
                  <input
                    type="text"
                    value={editingCampaign.ctaText || ''}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, ctaText: e.target.value })}
                    className="w-full bg-[#121417] border border-stone-700 rounded-xl p-2.5 text-white"
                    placeholder="e.g. Order via WhatsApp"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-300 block">Target Estate Zone</label>
                  <select
                    value={editingCampaign.targetZone}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, targetZone: e.target.value })}
                    className="w-full bg-[#121417] border border-stone-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="All Kahawa West">All Kahawa West</option>
                    <option value="Congo">Congo</option>
                    <option value="Roundabout">Roundabout</option>
                    <option value="Kamiti">Kamiti Rd</option>
                    <option value="Jacaranda">Jacaranda</option>
                    <option value="Kiu Kenda">Kiu Kenda</option>
                    <option value="Soweto">Soweto</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-300 block">Status</label>
                  <select
                    value={editingCampaign.status}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, status: e.target.value as AdCampaignStatus })}
                    className="w-full bg-[#121417] border border-stone-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="in_review">In Review (Pending)</option>
                    <option value="active">Active Live</option>
                    <option value="changes_requested">Changes Requested</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-300 block">Image Artwork URL</label>
                <input
                  type="url"
                  value={editingCampaign.imageUrl || ''}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#121417] border border-stone-700 rounded-xl p-2.5 text-white text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingCampaign(null)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer"
                >
                  Save Ad Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Feedback Dialog */}
      {storyForRejection && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#181B20] text-white rounded-2xl max-w-md w-full p-6 border border-stone-800 space-y-4">
            <h4 className="font-display font-bold text-lg text-red-400">
              Reject Story Submission
            </h4>
            <p className="text-xs text-stone-300">
              Provide feedback for <strong>{storyForRejection.title}</strong>:
            </p>

            <select
              value={rejectionPreset}
              onChange={(e) => setRejectionPreset(e.target.value)}
              className="w-full bg-[#121417] border border-stone-700 rounded-xl p-2.5 text-xs text-white"
            >
              <option value="photo">Photo verification issue</option>
              <option value="political">Political / Non-community content</option>
              <option value="clarity">Needs clearer facts / location</option>
              <option value="commercial">Commercial advertisement</option>
              <option value="custom">Custom note</option>
            </select>

            {rejectionPreset === 'custom' && (
              <textarea
                value={customRejectionFeedback}
                onChange={(e) => setCustomRejectionFeedback(e.target.value)}
                placeholder="Explain why this story could not be approved..."
                className="w-full bg-[#121417] border border-stone-700 rounded-xl p-2.5 text-xs text-white"
                rows={3}
              />
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStoryForRejection(null)}
                className="px-3 py-1.5 rounded-xl text-stone-400 text-xs hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStoryRejection}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
