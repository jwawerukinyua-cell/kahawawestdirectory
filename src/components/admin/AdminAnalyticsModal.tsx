import React, { useState, useMemo } from 'react';
import {
  X,
  TrendingUp,
  Download,
  Eye,
  MessageSquare,
  Phone,
  Share2,
  Filter,
  Search,
  Sparkles,
  ExternalLink,
  Check,
  Copy,
  Building,
  MapPin,
  ShieldCheck,
  KeyRound,
  Lock,
  Unlock,
  UserCheck,
  Users,
} from 'lucide-react';
import { Business } from '../../types';
import {
  getAllBusinessAnalytics,
  getBusinessStats,
  calculateLeadScore,
  exportAnalyticsCSV,
  AdRecommendation,
} from '../../lib/tracking';
import { getAllMerchantRecords, grantMerchantSession, revokeMerchantSession, isMerchantSessionActive } from '../../lib/merchantAuth';
import { copyToClipboard } from '../../lib/clipboard';

interface AdminAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: Business[];
  onSelectBusiness?: (business: Business) => void;
}

export const AdminAnalyticsModal: React.FC<AdminAnalyticsModalProps> = ({
  isOpen,
  onClose,
  businesses,
  onSelectBusiness,
}) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'pins'>('leads');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unclaimed' | 'billboard' | 'deals'>('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [copiedPitchId, setCopiedPitchId] = useState<string | null>(null);
  const [copiedPinId, setCopiedPinId] = useState<string | null>(null);
  const [showPitchModalFor, setShowPitchModalFor] = useState<Business | null>(null);

  const allStats = useMemo(() => getAllBusinessAnalytics(), [isOpen]);
  const merchantRecords = useMemo(() => getAllMerchantRecords(), [isOpen, activeTab]);

  // Aggregate Total Metrics
  const aggregateMetrics = useMemo(() => {
    let totalViews = 0;
    let totalWhatsApp = 0;
    let totalCalls = 0;
    let totalShares = 0;

    businesses.forEach((b) => {
      const stats = allStats[b.id] || getBusinessStats(b.id);
      totalViews += stats.views;
      totalWhatsApp += stats.whatsappClicks;
      totalCalls += stats.phoneCalls;
      totalShares += stats.shares;
    });

    const totalLeads = totalWhatsApp + totalCalls;
    const conversionRate = totalViews > 0 ? Number(((totalLeads / totalViews) * 100).toFixed(1)) : 0;

    return {
      totalViews,
      totalWhatsApp,
      totalCalls,
      totalShares,
      totalLeads,
      conversionRate,
    };
  }, [businesses, allStats]);

  // Ranked List of Businesses with Lead Scores
  const rankedBusinesses = useMemo(() => {
    return businesses
      .map((b) => {
        const stats = allStats[b.id] || getBusinessStats(b.id);
        const lead = calculateLeadScore(stats, b.isClaimed);
        return {
          business: b,
          stats,
          lead,
        };
      })
      .filter(({ business, lead }) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = business.name.toLowerCase().includes(q);
          const matchZone = business.zone.toLowerCase().includes(q);
          const matchCategory = business.category.toLowerCase().includes(q);
          if (!matchName && !matchZone && !matchCategory) return false;
        }

        if (selectedZone !== 'all' && business.zone !== selectedZone) {
          return false;
        }

        if (selectedFilter === 'unclaimed' && business.isClaimed) return false;
        if (selectedFilter === 'billboard' && lead.recommendation !== 'Prime Billboard Candidate') return false;
        if (selectedFilter === 'deals' && lead.recommendation !== 'Spotlight Deals Candidate') return false;

        return true;
      })
      .sort((a, b) => b.lead.totalInteractions - a.lead.totalInteractions);
  }, [businesses, allStats, searchQuery, selectedFilter, selectedZone]);

  if (!isOpen) return null;

  // Handle CSV Download
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

  // Generate WhatsApp pitch copy for a business
  const getWhatsAppPitchCopy = (business: Business) => {
    const stats = allStats[business.id] || getBusinessStats(business.id);
    const lead = calculateLeadScore(stats, business.isClaimed);
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

  return (
    <div
      id="admin-analytics-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200 font-sans"
    >
      <div
        className="bg-[#FAF8F5] w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col border border-[#630303]/40 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#4D0202] text-white px-5 sm:px-7 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#630303] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
              {activeTab === 'leads' ? <TrendingUp className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg sm:text-xl text-white tracking-tight">
                  {activeTab === 'leads' ? 'KWEST Ad Sales & Business Intelligence' : 'KWEST Merchant PINs & Security Registry'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                  Editorial Desk
                </span>
              </div>
              <p className="text-xs text-rose-200/90">
                {activeTab === 'leads'
                  ? 'Track merchant performance & prospect high-intent businesses for paid ad placements'
                  : 'Manage 4-digit merchant PINs, claimed roles, and owner contacts for listed businesses'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch buttons */}
            <div className="bg-black/30 p-1 rounded-xl border border-white/10 flex items-center gap-1">
              <button
                onClick={() => setActiveTab('leads')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'leads'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Sales Leads</span>
              </button>
              <button
                onClick={() => setActiveTab('pins')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'pins'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Merchant PINs</span>
              </button>
            </div>

            {activeTab === 'leads' && (
              <button
                onClick={handleDownloadCSV}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-sm active:scale-95 border border-emerald-500/40"
                title="Download Full Leads CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#630303] hover:bg-[#7D0404] text-stone-200 hover:text-white transition active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'pins' ? (
            <div className="space-y-6">
              {/* Merchant PIN Overview Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-amber-600" />
                    <h4 className="text-sm font-bold text-amber-950">
                      Editorial Merchant Credentials & Authorization Registry
                    </h4>
                  </div>
                  <p className="text-xs text-amber-900/80 leading-relaxed max-w-3xl">
                    Every business listed or claimed in Kahawa West receives a 4-digit PIN for instant mobile merchant access. As Directory Admin, you can view all registered PINs, applicant contact information, and listings created on behalf of owners.
                  </p>
                </div>

                <div className="px-3.5 py-2 rounded-xl bg-amber-600 text-white text-xs font-mono font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Master Admin PIN: 9999</span>
                </div>
              </div>

              {/* Registered Merchant PINs Table */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <h5 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <span>Registered Merchant Accounts ({businesses.filter((b) => b.isClaimed).length} Claimed / Active)</span>
                  </h5>
                  <div className="text-xs text-stone-500">
                    Default Test PIN: <span className="font-mono font-bold text-slate-800">1234</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-stone-100/90 text-stone-700 border-b border-stone-200 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Business & Zone</th>
                        <th className="py-3 px-3">Applicant / Role</th>
                        <th className="py-3 px-3">Owner Contact (If on Behalf)</th>
                        <th className="py-3 px-3 text-center">4-Digit PIN</th>
                        <th className="py-3 px-3 text-center">Device Session</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {businesses
                        .filter((b) => b.isClaimed || merchantRecords[b.id] || b.name.toLowerCase().includes('ukweli'))
                        .map((b) => {
                          const record = merchantRecords[b.id];
                          const pin = record?.pin || (b.name.toLowerCase().includes('ukweli') ? '1234' : '1234');
                          const applicant = record?.applicantName || b.claimedBy?.split('(')[0]?.trim() || 'Proprietor';
                          const role = record?.role || b.claimedBy?.match(/\((.*?)\)/)?.[1] || 'Owner';
                          const isBehalf = record?.isListingOnBehalf || role.includes('Behalf') || b.claimedBy?.includes('Behalf');
                          const owner = record?.ownerName ? `${record.ownerName} (${record.ownerPhone || 'N/A'})` : isBehalf ? b.phone : 'Direct Owner';
                          const isUnlocked = isMerchantSessionActive(b.id, b.name);

                          return (
                            <tr key={b.id} className="hover:bg-amber-50/40 transition">
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900 text-xs sm:text-sm">{b.name}</div>
                                <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-stone-400" />
                                  <span>{b.zone}</span>
                                  <span>•</span>
                                  <span>{b.phone}</span>
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <div className="font-semibold text-slate-800">{applicant}</div>
                                <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700 mt-0.5">
                                  {role}
                                </span>
                              </td>

                              <td className="py-3 px-3">
                                {isBehalf ? (
                                  <div className="text-amber-800 font-semibold text-[11px] bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                                    <div className="font-bold">{record?.ownerName || 'Owner'}</div>
                                    <div className="text-[10px] font-mono">{record?.ownerPhone || b.phone}</div>
                                  </div>
                                ) : (
                                  <span className="text-stone-400 text-[11px]">Same as applicant</span>
                                )}
                              </td>

                              <td className="py-3 px-3 text-center">
                                <span className="font-mono text-sm font-black px-2.5 py-1 rounded-lg bg-stone-900 text-amber-300 tracking-wider">
                                  {pin}
                                </span>
                              </td>

                              <td className="py-3 px-3 text-center">
                                {isUnlocked ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                    <Unlock className="w-3 h-3 text-emerald-600" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-medium">
                                    <Lock className="w-3 h-3 text-stone-400" />
                                    Locked
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={async () => {
                                      await copyToClipboard(`Your KWEST Merchant PIN for ${b.name} is: ${pin}. Log in at kahawawestdirectory.co.ke`);
                                      setCopiedPinId(b.id);
                                      setTimeout(() => setCopiedPinId(null), 3000);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold transition"
                                    title="Copy PIN credentials to WhatsApp"
                                  >
                                    {copiedPinId === b.id ? 'Copied!' : 'Copy PIN'}
                                  </button>

                                  {isUnlocked ? (
                                    <button
                                      onClick={() => {
                                        revokeMerchantSession(b.id);
                                        window.location.reload();
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold transition"
                                    >
                                      Lock
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        grantMerchantSession(b.id);
                                        window.location.reload();
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition"
                                    >
                                      Unlock
                                    </button>
                                  )}

                                  {onSelectBusiness && (
                                    <button
                                      onClick={() => {
                                        onSelectBusiness(b);
                                        onClose();
                                      }}
                                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition"
                                      title="Open listing in directory"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <>
          {/* Top Aggregate KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total Views */}
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span className="font-semibold uppercase text-[10px]">Total Views</span>
                <Eye className="w-4 h-4 text-sky-600" />
              </div>
              <span className="text-xl font-display font-black text-slate-900">
                {aggregateMetrics.totalViews.toLocaleString()}
              </span>
            </div>

            {/* WhatsApp Chats */}
            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-800 text-xs mb-1">
                <span className="font-semibold uppercase text-[10px]">WhatsApp Chats</span>
                <MessageSquare className="w-4 h-4 text-[#25D366]" />
              </div>
              <span className="text-xl font-display font-black text-emerald-950">
                {aggregateMetrics.totalWhatsApp.toLocaleString()}
              </span>
            </div>

            {/* Calls */}
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span className="font-semibold uppercase text-[10px]">Phone Calls</span>
                <Phone className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-xl font-display font-black text-slate-900">
                {aggregateMetrics.totalCalls.toLocaleString()}
              </span>
            </div>

            {/* Shares */}
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span className="font-semibold uppercase text-[10px]">Shares</span>
                <Share2 className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-xl font-display font-black text-slate-900">
                {aggregateMetrics.totalShares.toLocaleString()}
              </span>
            </div>

            {/* Total Inquiries */}
            <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-800 text-xs mb-1">
                <span className="font-semibold uppercase text-[10px]">Direct Inquiries</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-xl font-display font-black text-amber-950">
                {aggregateMetrics.totalLeads.toLocaleString()}
              </span>
            </div>

            {/* Conversion % */}
            <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="font-semibold uppercase text-[10px]">Conversion</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xl font-display font-black text-emerald-300">
                {aggregateMetrics.conversionRate}%
              </span>
            </div>
          </div>

          {/* Ad Pitch Strategy Guide */}
          <div className="bg-stone-900 text-stone-200 rounded-2xl p-4 sm:p-5 border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-display font-bold text-white">
                  Monetization & Outreach Playbook
                </h4>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed max-w-3xl">
                Use this dashboard to approach high-intent merchants. When a shop receives 40+ views or 10+ WhatsApp inquiries, generate a pre-drafted pitch mentioning their live performance numbers to close paid Billboard Ads (KES 2,500/wk) or Hot Deals badges.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                🏆 Billboard Target (250+ Views)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-950 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                💎 Deals Target (High Chat %)
              </span>
            </div>
          </div>

          {/* Filters & Search Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search business name, category, or estate zone..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#630303] text-slate-800"
              />
            </div>

            {/* Quick Segment Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedFilter === 'all'
                    ? 'bg-[#630303] text-white shadow-2xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                All ({businesses.length})
              </button>
              <button
                onClick={() => setSelectedFilter('billboard')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedFilter === 'billboard'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                🏆 Billboard Prospects
              </button>
              <button
                onClick={() => setSelectedFilter('deals')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedFilter === 'deals'
                    ? 'bg-amber-700 text-white shadow-2xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                💎 Deals Prospects
              </button>
              <button
                onClick={() => setSelectedFilter('unclaimed')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedFilter === 'unclaimed'
                    ? 'bg-rose-800 text-white shadow-2xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                Unclaimed High-Traffic
              </button>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100/90 text-stone-700 border-b border-stone-200 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Business & Zone</th>
                    <th className="py-3 px-3 text-center">Views</th>
                    <th className="py-3 px-3 text-center">WhatsApp</th>
                    <th className="py-3 px-3 text-center">Calls</th>
                    <th className="py-3 px-3 text-center">Shares</th>
                    <th className="py-3 px-3 text-center">Conv. Rate</th>
                    <th className="py-3 px-4">Ad Pitch Recommendation</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {rankedBusinesses.map(({ business, stats, lead }, idx) => (
                    <tr
                      key={business.id}
                      className="hover:bg-stone-50/80 transition group"
                    >
                      {/* Business Name & Zone */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-stone-100 border border-stone-300 text-stone-600 font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                {business.name}
                              </span>
                              {business.isClaimed ? (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                  Claimed
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-stone-200 text-stone-700">
                                  Unclaimed
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-stone-500 text-[11px] mt-0.5">
                              <MapPin className="w-3 h-3 text-stone-400" />
                              <span>{business.zone}</span>
                              <span>•</span>
                              <span>{business.category}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Views */}
                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        {stats.views}
                      </td>

                      {/* WhatsApp */}
                      <td className="py-3 px-3 text-center font-bold text-emerald-700">
                        {stats.whatsappClicks}
                      </td>

                      {/* Calls */}
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {stats.phoneCalls}
                      </td>

                      {/* Shares */}
                      <td className="py-3 px-3 text-center font-bold text-purple-700">
                        {stats.shares}
                      </td>

                      {/* Conversion Rate */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900">
                          {lead.conversionRate}%
                        </span>
                      </td>

                      {/* Ad Pitch Recommendation */}
                      <td className="py-3 px-4">
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              lead.recommendation === 'Prime Billboard Candidate'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : lead.recommendation === 'Spotlight Deals Candidate'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : lead.recommendation === 'Unclaimed High-Traffic Target'
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {lead.recommendation}
                          </span>
                          <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                            {lead.rationale}
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy WhatsApp Pitch */}
                          <button
                            onClick={() => handleCopyPitch(business)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold transition active:scale-95"
                            title="Copy pre-drafted WhatsApp sales pitch"
                          >
                            {copiedPitchId === business.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Pitch</span>
                              </>
                            )}
                          </button>

                          {/* Direct WhatsApp Pitch */}
                          <button
                            onClick={() => handleOpenPitchWhatsApp(business)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 text-[11px] font-black transition active:scale-95 shadow-2xs"
                            title="Open WhatsApp chat with pre-filled pitch"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-slate-950" />
                            <span>Pitch</span>
                          </button>

                          {/* View in Directory */}
                          {onSelectBusiness && (
                            <button
                              onClick={() => {
                                onSelectBusiness(business);
                                onClose();
                              }}
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition"
                              title="View business details in directory"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  </div>
</div>
  );
};
