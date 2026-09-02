import React, { useState, useEffect } from 'react';
import { X, Share2, ArrowLeft, Check, MessageSquare, Lock, Sparkles, Edit3, Megaphone, ShieldCheck, LogOut } from 'lucide-react';
import { Business } from '../../types';
import { trackBusinessInteraction } from '../../lib/tracking';
import { isMerchantSessionActive, revokeMerchantSession } from '../../lib/merchantAuth';
import { BusinessHero } from './BusinessHero';
import { BusinessGallery } from './BusinessGallery';
import { BusinessAbout } from './BusinessAbout';
import { BusinessOffer } from './BusinessOffer';
import { BusinessOpeningHours } from './BusinessOpeningHours';
import { BusinessContact } from './BusinessContact';
import { BusinessCommunityFeedback } from './BusinessCommunityFeedback';
import { BusinessEngagementStats } from './BusinessEngagementStats';
import { BusinessAdSuite } from './BusinessAdSuite';
import { PromoteShopModal } from './PromoteShopModal';
import { MerchantUnlockModal } from './MerchantUnlockModal';
import { ContactUnlockModal } from './ContactUnlockModal';

interface BusinessDetailModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimClick: (business: Business) => void;
  onLeaveFeedbackClick: (business: Business) => void;
  onAdEnquiryClick?: (business?: Business) => void;
  onEditClick?: (business: Business) => void;
  onPromoteShopClick?: (business: Business) => void;
}

export const BusinessDetailModal: React.FC<BusinessDetailModalProps> = ({
  business,
  isOpen,
  onClose,
  onClaimClick,
  onLeaveFeedbackClick,
  onAdEnquiryClick,
  onEditClick,
  onPromoteShopClick,
}) => {
  const [showToast, setShowToast] = useState<string | null>(null);
  const [isPromoteShopModalOpen, setIsPromoteShopModalOpen] = useState(false);
  const [isMerchantUnlockModalOpen, setIsMerchantUnlockModalOpen] = useState(false);
  const [isContactUnlockModalOpen, setIsContactUnlockModalOpen] = useState(false);
  const [isMerchantUnlocked, setIsMerchantUnlocked] = useState(false);

  // Check merchant authentication status on open or business change
  useEffect(() => {
    if (isOpen && business?.id) {
      trackBusinessInteraction(business.id, 'view');
      const active = isMerchantSessionActive(business.id, business.name);
      setIsMerchantUnlocked(active);
    }
  }, [isOpen, business?.id, business?.name]);

  // Listen to session storage events
  useEffect(() => {
    const handleSessionChange = () => {
      if (business?.id) {
        setIsMerchantUnlocked(isMerchantSessionActive(business.id, business.name));
      }
    };

    window.addEventListener('kwest_merchant_session_changed', handleSessionChange);
    window.addEventListener('storage', handleSessionChange);
    return () => {
      window.removeEventListener('kwest_merchant_session_changed', handleSessionChange);
      window.removeEventListener('storage', handleSessionChange);
    };
  }, [business?.id, business?.name]);

  if (!isOpen || !business) return null;

  const handleOpenPromote = () => {
    if (onPromoteShopClick) {
      onPromoteShopClick(business);
    } else {
      setIsPromoteShopModalOpen(true);
    }
  };

  const handleLockMerchantMode = () => {
    revokeMerchantSession(business.id);
    setIsMerchantUnlocked(false);
    setShowToast('Merchant session locked. Returning to public visitor view.');
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleShare = async () => {
    trackBusinessInteraction(business.id, 'share');
    const shareUrl = `${window.location.origin}/#${business.slug}`;
    const shareTitle = `${business.name} | Kahawa West Directory`;
    const shareText = `Check out *${business.name}* in Kahawa West (${business.zone}, near ${business.landmark}). Contact: ${business.phone}\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Check out ${business.name} in Kahawa West (${business.zone}, near ${business.landmark}). Contact: ${business.phone}`,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setShowToast('Listing link & details copied to clipboard!');
        setTimeout(() => setShowToast(null), 3500);
      } catch {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      }
    }
  };

  return (
    <div
      id="business-detail-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200 font-sans"
    >
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-60 bg-emerald-700 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-500 flex items-center gap-2 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{showToast}</span>
        </div>
      )}

      <div
        className="bg-[#FAF8F5] w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col border border-[#630303]/30 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Navigation Bar */}
        <div className="bg-[#4D0202] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-[#630303] flex-shrink-0">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-200 hover:text-white px-3 py-1.5 rounded-xl bg-[#630303] hover:bg-[#7D0404] transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Back to Directory</span>
            <span className="xs:hidden">Back</span>
          </button>

          <div className="text-xs text-rose-200/90 font-medium hidden sm:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Kahawa West Directory • {business.zone}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#630303] hover:bg-[#7D0404] text-stone-200 hover:text-white transition active:scale-95 text-xs font-bold"
              title="Share listing via WhatsApp or other apps"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Share</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#630303] hover:bg-[#7D0404] text-stone-200 hover:text-white transition active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
          {/* Active Merchant Mode Banner */}
          {isMerchantUnlocked && (
            <div
              id="merchant-active-banner"
              className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-stone-900 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <div>
                  <span className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                    Merchant Mode Active
                  </span>
                  <span className="text-stone-700 ml-1.5 hidden sm:inline">
                    • Viewing as verified owner/manager of <strong className="text-stone-900">{business.name}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onEditClick && (
                  <button
                    id="merchant-bar-edit-btn"
                    onClick={() => onEditClick(business)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-xs border border-stone-700 transition active:scale-95 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Update Info</span>
                  </button>
                )}
                <button
                  id="merchant-bar-promote-btn"
                  onClick={handleOpenPromote}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Promote Shop</span>
                </button>
                <button
                  id="merchant-bar-lock-btn"
                  onClick={handleLockMerchantMode}
                  className="p-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 hover:text-stone-950 text-xs transition"
                  title="Lock merchant mode and return to visitor view"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 1. Hero Summary Component */}
          <BusinessHero
            business={business}
            isMerchantUnlocked={isMerchantUnlocked}
            onClaimClick={() => onClaimClick(business)}
            onFeedbackClick={() => onLeaveFeedbackClick(business)}
            onShareClick={handleShare}
            onEditClick={() => onEditClick?.(business)}
            onPromoteShopClick={handleOpenPromote}
            onMerchantUnlockClick={() => setIsMerchantUnlockModalOpen(true)}
            onUnlockContactClick={() => setIsContactUnlockModalOpen(true)}
          />

          {/* 2. Full 5-Photo Gallery Component */}
          <BusinessGallery
            images={
              (business.galleryImages && business.galleryImages.length > 0
                ? business.galleryImages
                : (business as any).images && (business as any).images.length > 0
                ? (business as any).images
                : [business.heroImage]
            ).filter((img: any): img is string => typeof img === 'string' && img.trim() !== '')
            }
            businessName={business.name}
          />

          {/* 3. Special Resident Discount / Offer */}
          {business.specialOffer && (
            <BusinessOffer offer={business.specialOffer} />
          )}

          {/* 3b. Live Directory Reach & Owner Engagement Analytics (Merchant & Owner Only) */}
          {isMerchantUnlocked && (
            <BusinessEngagementStats
              business={business}
              onClaimClick={() => onClaimClick(business)}
              onAdEnquiryClick={() => onAdEnquiryClick?.(business)}
            />
          )}

          {/* 3c. Verified Merchant Ad & Creative Suite (Merchant & Owner Only) */}
          {isMerchantUnlocked && (
            <BusinessAdSuite
              business={business}
              onAdEnquiryClick={() => onAdEnquiryClick?.(business)}
              onPromoteShopClick={handleOpenPromote}
            />
          )}

          {/* 4. Two Column Layout: Details & Contacts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* About & Services */}
              <BusinessAbout business={business} />

              {/* Verified Community Feedback */}
              <BusinessCommunityFeedback
                business={business}
                onLeaveReviewClick={() => onLeaveFeedbackClick(business)}
              />
            </div>

            <div className="space-y-6">
              {/* Direct Contacts & M-Pesa Till */}
              <BusinessContact
                business={business}
                onUnlockContactClick={() => setIsContactUnlockModalOpen(true)}
              />

              {/* Opening Hours & Status */}
              <BusinessOpeningHours openingHours={business.openingHours} />
            </div>
          </div>

          {/* Public Visitor Footer Callouts */}
          {!isMerchantUnlocked && (
            <div className="pt-4 border-t border-stone-200">
              {business.isClaimed ? (
                <div
                  id="merchant-unlock-callout"
                  className="p-4 rounded-2xl bg-stone-900 text-stone-200 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Business Owner / Manager Controls
                      </h4>
                      <p className="text-xs text-stone-400">
                        Are you the proprietor of {business.name}? Enter your 4-digit PIN to access private engagement stats, update photos/contacts, and run ads.
                      </p>
                    </div>
                  </div>
                  <button
                    id="trigger-merchant-unlock-btn"
                    onClick={() => setIsMerchantUnlockModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition cursor-pointer shrink-0 active:scale-95 shadow-xs"
                  >
                    Enter 4-Digit PIN
                  </button>
                </div>
              ) : (
                <div
                  id="unclaimed-business-callout"
                  className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-stone-900 to-stone-900 text-stone-200 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Own or Manage {business.name}?
                      </h4>
                      <p className="text-xs text-stone-300">
                        Claim this listing today to verify ownership, customize your 5 photos, display Lipa na M-Pesa, and create ad campaigns.
                      </p>
                    </div>
                  </div>
                  <button
                    id="footer-claim-btn"
                    onClick={() => onClaimClick(business)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shrink-0 active:scale-95 shadow-xs"
                  >
                    Claim Listing
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Promote Shop Ad Builder & Placement Modal */}
      {isPromoteShopModalOpen && (
        <PromoteShopModal
          business={business}
          isOpen={isPromoteShopModalOpen}
          onClose={() => setIsPromoteShopModalOpen(false)}
        />
      )}

      {/* Merchant 4-Digit PIN Unlock Modal */}
      {isMerchantUnlockModalOpen && (
        <MerchantUnlockModal
          business={business}
          isOpen={isMerchantUnlockModalOpen}
          onClose={() => setIsMerchantUnlockModalOpen(false)}
          onUnlocked={() => {
            setIsMerchantUnlocked(true);
            setShowToast('Merchant session unlocked! Welcome back.');
            setTimeout(() => setShowToast(null), 3000);
          }}
        />
      )}
      {/* Contact Unlock Modal for Housing & Rent Collecting Agents */}
      {isContactUnlockModalOpen && (
        <ContactUnlockModal
          business={business}
          isOpen={isContactUnlockModalOpen}
          onClose={() => setIsContactUnlockModalOpen(false)}
          onUnlocked={() => {
            setShowToast('Agent Hotline Unlocked! Direct contacts are now visible.');
            setTimeout(() => setShowToast(null), 3500);
          }}
        />
      )}
    </div>
  );
};

