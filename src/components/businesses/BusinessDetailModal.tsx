import React from 'react';
import { X, Share2, ArrowLeft } from 'lucide-react';
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
  if (!isOpen || !business) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${business.name} - Kahawa West Directory`,
        text: `Find ${business.name} located at ${business.landmark}, ${business.zone} on KWEST Directory.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Listing link copied to clipboard!');
    }
  };

  return (
    <div
      id="business-detail-modal"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200 font-sans"
    >
      <div
        className="bg-[#FAF8F5] w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col border border-[#4A2518]/30 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Navigation Bar in Soil Brown */}
        <div className="bg-[#22120C] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#381E15] flex-shrink-0">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-300 hover:text-white px-3 py-1.5 rounded-xl bg-[#341B12] hover:bg-[#442318] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </button>

          <div className="text-xs text-sky-400 font-mono hidden sm:block">
            kwestdirectory.co.ke/directory/{business.slug}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-[#341B12] hover:bg-[#442318] text-stone-300 hover:text-white transition"
              title="Share listing"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#341B12] hover:bg-[#442318] text-stone-300 hover:text-white transition"
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
            images={business.images}
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
                businessId={business.id}
                rating={business.rating}
                reviewCount={business.reviewCount}
                onLeaveFeedback={() => onLeaveFeedbackClick(business)}
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
