import React, { useState, useEffect } from 'react';
import { Eye, MessageSquare, Phone, Share2, TrendingUp, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';
import { Business } from '../../types';
import { getBusinessStats, calculateLeadScore, BusinessAnalytics } from '../../lib/tracking';

interface BusinessEngagementStatsProps {
  business: Business;
  onClaimClick?: () => void;
  onAdEnquiryClick?: () => void;
}

export const BusinessEngagementStats: React.FC<BusinessEngagementStatsProps> = ({
  business,
  onClaimClick,
  onAdEnquiryClick,
}) => {
  const [stats, setStats] = useState<BusinessAnalytics>(() => getBusinessStats(business.id));
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Refresh stats when updated
    const handleUpdate = (e: any) => {
      if (e.detail?.businessId === business.id) {
        setStats(e.detail.stats);
      }
    };
    window.addEventListener('kwest_analytics_updated', handleUpdate);
    return () => window.removeEventListener('kwest_analytics_updated', handleUpdate);
  }, [business.id]);

  const leadScore = calculateLeadScore(stats, business.isClaimed);

  return (
    <div className="bg-gradient-to-br from-stone-900 via-[#260505] to-stone-950 rounded-2xl p-4 sm:p-5 text-white border border-[#630303]/60 shadow-lg font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-white/10 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-display font-bold text-white flex items-center gap-1.5">
              <span>Directory Reach & Engagement</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                Live Stats
              </span>
            </h4>
            <p className="text-[11px] text-stone-400">
              Verified resident interactions from Kahawa West
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-stone-400 relative">
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className="flex items-center gap-1 text-stone-400 hover:text-stone-200 transition"
            title="How stats are tracked"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">About data</span>
          </button>
          {showTooltip && (
            <div className="absolute right-0 top-6 z-20 w-64 p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-[11px] text-stone-300 shadow-2xl animate-in fade-in duration-150">
              Real-time counter tracks customer profile views, WhatsApp chat inquiries, telephone clicks, and directory shares.
            </div>
          )}
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
        {/* Views */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Profile Views</span>
            <Eye className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <span className="text-lg sm:text-xl font-display font-black text-white">{stats.views.toLocaleString()}</span>
        </div>

        {/* WhatsApp Inquiries */}
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-300 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider">WhatsApp Chats</span>
            <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
          </div>
          <span className="text-lg sm:text-xl font-display font-black text-emerald-200">{stats.whatsappClicks.toLocaleString()}</span>
        </div>

        {/* Calls */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Phone Calls</span>
            <Phone className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-lg sm:text-xl font-display font-black text-white">{stats.phoneCalls.toLocaleString()}</span>
        </div>

        {/* Shares */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Shares</span>
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="text-lg sm:text-xl font-display font-black text-white">{stats.shares.toLocaleString()}</span>
        </div>
      </div>

      {/* Owner Call to Action / Pitch Banner */}
      <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-xs text-stone-300 flex-1">
          <span className="font-bold text-white block mb-0.5">
            {business.isClaimed ? '🌟 Verified Claimed Merchant' : '🏢 Are you the owner of this business?'}
          </span>
          <span className="text-[11px] text-stone-400">
            {business.isClaimed
              ? `High engagement: ${(stats.whatsappClicks + stats.phoneCalls)} customers have contacted you directly from KWEST.`
              : 'Claim this listing to manage your contacts, verify M-Pesa details, and activate Prime Ad slots.'}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
          {!business.isClaimed && onClaimClick && (
            <button
              onClick={onClaimClick}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#630303] hover:bg-[#7D0404] text-white text-xs font-bold transition border border-rose-500/30 active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Claim Listing</span>
            </button>
          )}

          {onAdEnquiryClick && (
            <button
              onClick={onAdEnquiryClick}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition border border-amber-500/40 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Promote Shop</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
