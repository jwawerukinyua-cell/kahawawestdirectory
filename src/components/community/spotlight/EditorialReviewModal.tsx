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
} from 'lucide-react';
import { CommunityStory, CommunityUpdate, BusinessClaim, Business, UpdateType } from '../../../types';
import {
  getAllBusinessAnalytics,
  getBusinessStats,
  calculateLeadScore,
  exportAnalyticsCSV,
  BusinessAnalytics,
} from '../../../lib/tracking';
import { Button } from '../../ui/Button';
import { StoryMarkdownRenderer } from './StoryMarkdownRenderer';

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
  const [activeMainTab, setActiveMainTab] = useState<'stories' | 'updates' | 'claims' | 'ad_sales' | 'supabase_guide'>('stories');
  const [storySubTab, setStorySubTab] = useState<'pending' | 'published'>('pending');
  const [updateSubTab, setUpdateSubTab] = useState<'pending' | 'published'>('pending');
  const [claimsSubTab, setClaimsSubTab] = useState<'pending_claims' | 'all_listings'>('pending_claims');
  const [directorySearchQuery, setDirectorySearchQuery] = useState('');
  const [directoryZoneFilter, setDirectoryZoneFilter] = useState('all');

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

    return `Hello ${business.name} team,\n\nI am reaching out from *Kahawa West Directory (KWEST)* (kwestdirectory.co.ke).\n\nYour profile has generated *${stats.views} views* and *${totalLeads} direct customer inquiries* (${stats.whatsappClicks} WhatsApp chats, ${stats.phoneCalls} calls) from estate residents around ${business.zone}.\n\nSince your listing is already getting high organic reach, we would like to offer you an exclusive *Featured Homepage Billboard Ad* / *Resident Deal Spotlight* to scale your orders across all 10,000+ monthly estate visitors.\n\nWould you like me to send you the quick pricing rate card?`;
  };

  const handleCopyPitch = (business: Business) => {
    const text = getWhatsAppPitchCopy(business);
    navigator.clipboard.writeText(text);
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

  if (!isOpen) return null;

  const pendingStories = stories.filter((s) => s.status === 'pending_review');
  const publishedStories = stories.filter((s) => s.status === 'published' || !s.status);

  const pendingUpdates = updates.filter((u) => u.status === 'pending_review');
  const publishedUpdates = updates.filter((u) => u.status === 'published' || !u.status);

  const handleCopySql = () => {
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
    navigator.clipboard.writeText(sqlCode);
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
                <span>🏢 Claims & Directory</span>
                {claims.filter((c) => c.status === 'pending').length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-black">
                    {claims.filter((c) => c.status === 'pending').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveMainTab('ad_sales')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeMainTab === 'ad_sales'
                    ? 'bg-amber-600 text-white shadow-sm'
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
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setStoryForRejection(story)}
                                  className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-bold border border-red-800/60"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => onApproveStory(story.id, false)}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                                >
                                  Approve & Publish
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onApproveStory(story.id, !story.featured)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 ${
                                    story.featured
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                      : 'bg-stone-800 text-stone-300 hover:text-white'
                                  }`}
                                >
                                  <Star className="w-3.5 h-3.5" />
                                  <span>{story.featured ? 'Featured' : 'Feature'}</span>
                                </button>
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
                  <div className="flex items-center justify-between gap-3">
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
                          className="bg-[#181B20] border border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 max-w-2xl">
                            <div className="flex items-center gap-2">
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
                            </div>

                            <h4 className="font-display font-bold text-white text-base">
                              {up.title}
                            </h4>

                            <p className="text-xs text-stone-300 leading-relaxed">
                              {up.content}
                            </p>

                            <div className="text-[11px] text-stone-400 pt-1">
                              Submitted by: <strong className="text-stone-200">{up.author}</strong> {up.authorPhone && `(${up.authorPhone})`}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {updateSubTab === 'pending' ? (
                              <>
                                <button
                                  onClick={() => setUpdateForRejection(up)}
                                  className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-bold border border-red-800/60"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => onApproveUpdate && onApproveUpdate(up.id)}
                                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                                >
                                  Approve Live
                                </button>
                              </>
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
                                    lead.score >= 50
                                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                      : lead.score >= 20
                                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                      : 'bg-stone-800 text-stone-400'
                                  }`}
                                >
                                  Lead Score: {lead.score} ({lead.priority.toUpperCase()})
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
