import React from 'react';
import { MapPin, Star, Phone, MessageSquare, ShieldCheck, Share2, Tag } from 'lucide-react';
import { Business } from '../../types';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { Button } from '../ui/Button';

interface BusinessHeroProps {
  business: Business;
  onClaimClick: () => void;
  onFeedbackClick: () => void;
  onShareClick: () => void;
}

export const BusinessHero: React.FC<BusinessHeroProps> = ({
  business,
  onClaimClick,
  onFeedbackClick,
  onShareClick,
}) => {
  const whatsappUrl = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
    `Hello ${business.name}, I found your business on KWEST Directory (kwestdirectory.co.ke) and would like to inquire about your services.`
  )}`;

  return (
    <div id="business-hero-section" className="relative bg-[#22120C] text-white rounded-2xl overflow-hidden shadow-xl mb-6 border border-[#4A2518] font-sans">
      {/* Background Cover Overlay */}
      <div className="absolute inset-0 opacity-25">
        <img
          src={business.heroImage}
          alt={business.name}
          className="w-full h-full object-cover filter blur-md scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F100A] via-[#22120C]/90 to-transparent" />
      </div>

      <div className="relative z-10 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/40">
              <MapPin className="w-3.5 h-3.5" />
              {business.zone}
            </span>
            {business.subCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#381E15] text-stone-200 border border-[#4A2518]">
                <Tag className="w-3 h-3" />
                {business.subCategory}
              </span>
            )}
            <VerifiedBadge type={business.isClaimed ? 'claimed' : business.isVerified ? 'verified' : 'unclaimed'} />
          </div>

          <div className="flex items-center gap-2">
            <button
              id="share-listing-btn"
              onClick={onShareClick}
              className="p-2 rounded-xl bg-[#341B12] hover:bg-[#442318] text-stone-200 hover:text-white border border-[#4A2518] transition"
              title="Share listing"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {!business.isClaimed && (
              <button
                id="hero-claim-business-btn"
                onClick={onClaimClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white transition shadow-sm border border-emerald-500/30"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Claim This Business
              </button>
            )}
          </div>
        </div>

        {/* Title & Tagline */}
        <h1 id="business-hero-title" className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">
          {business.name}
        </h1>
        <p className="text-stone-200 text-sm md:text-base max-w-3xl mb-4 leading-relaxed">
          {business.tagline}
        </p>

        {/* Quick Stats / Meta */}
        <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-stone-300 pb-4 mb-5 border-t sm:border-t-0 sm:border-b border-[#381E15]">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center text-amber-400">
              <Star className={`w-4 h-4 ${business.rating > 0 ? 'fill-amber-400 text-amber-400' : 'text-stone-400'}`} />
              <span className="ml-1 font-bold text-white text-sm">
                {business.rating > 0 ? business.rating.toFixed(1) : '0.0'}
              </span>
            </div>
            <span className="text-stone-400">
              ({business.reviewCount} {business.reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          <span className="text-stone-600">•</span>
          <div className="flex items-center gap-1.5 text-stone-300">
            <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{business.landmark}</span>
          </div>
          {business.isClaimed && business.claimedBy && (
            <>
              <span className="text-stone-600">•</span>
              <span className="text-emerald-400 font-medium text-xs">
                Managed by {business.claimedBy}
              </span>
            </>
          )}
        </div>

        {/* Direct Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <a
            id="hero-whatsapp-btn"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-600 text-white shadow-md transition active:scale-95 border border-emerald-500/40"
          >
            <MessageSquare className="w-4 h-4" />
            Chat on WhatsApp
          </a>

          <a
            id="hero-call-btn"
            href={`tel:${business.phone}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-sky-700 hover:bg-sky-600 text-white shadow-md transition active:scale-95 border border-sky-500/40"
          >
            <Phone className="w-4 h-4" />
            Call {business.phone}
          </a>

          <Button
            id="hero-review-btn"
            variant="outline"
            size="md"
            onClick={onFeedbackClick}
            className="border-[#4A2518] bg-[#2D1810] text-stone-200 hover:bg-[#3D2015] hover:text-white"
          >
            Leave a Review
          </Button>
        </div>
      </div>
    </div>
  );
};
