import React, { useState } from 'react';
import { X, Share2, ArrowLeft, Check, MessageSquare } from 'lucide-react';
import { Business } from '../../types';
import { BusinessHero } from './BusinessHero';
import { BusinessGallery } from './BusinessGallery';
import { BusinessAbout } from './BusinessAbout';
import { BusinessOffer } from './BusinessOffer';
import { BusinessOpeningHours } from './BusinessOpeningHours';
import { BusinessContact } from './BusinessContact';
import { BusinessCommunityFeedback } from './BusinessCommunityFeedback';

interface BusinessDetailModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimClick: (business: Business) => void;
  onLeaveFeedbackClick: (business: Business) => void;
}

export const BusinessDetailModal: React.FC<BusinessDetailModalProps> = ({
  business,
  isOpen,
  onClose,
  onClaimClick,
  onLeaveFeedbackClick,
}) => {
  const [showToast, setShowToast] = useState<string | null>(null);

  if (!isOpen || !business) return null;

  const handleShare = async () => {
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
          // Open WhatsApp web / app with prefilled text
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        }
      }
    } else {
      // Fallback: Copy link and give option for WhatsApp
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
          {/* 1. Hero Summary Component */}
          <BusinessHero
            business={business}
            onClaimClick={() => onClaimClick(business)}
            onFeedbackClick={() => onLeaveFeedbackClick(business)}
            onShareClick={handleShare}
          />

          {/* 2. Full 5-Photo Gallery Component */}
          <BusinessGallery
            images={business.galleryImages || (business as any).images || [business.heroImage]}
            businessName={business.name}
          />

          {/* 3. Special Resident Discount / Offer */}
          {business.specialOffer && (
            <BusinessOffer offer={business.specialOffer} />
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
              <BusinessContact business={business} />

              {/* Opening Hours & Status */}
              <BusinessOpeningHours hours={business.openingHours} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
