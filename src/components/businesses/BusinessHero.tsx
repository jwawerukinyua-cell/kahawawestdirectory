import React from 'react';
import { MapPin, Star, Phone, MessageSquare, ShieldCheck, Share2, Tag, Edit3, Megaphone, Lock } from 'lucide-react';
import { Business } from '../../types';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { Button } from '../ui/Button';

interface BusinessHeroProps {
  business: Business;
  isMerchantUnlocked?: boolean;
  onClaimClick: () => void;
  onFeedbackClick: () => void;
  onShareClick: () => void;
  onEditClick?: () => void;
  onPromoteShopClick?: () => void;
  onMerchantUnlockClick?: () => void;
}

export const BusinessHero: React.FC<BusinessHeroProps> = ({
  business,
  isMerchantUnlocked = false,
  onClaimClick,
  onFeedbackClick,
  onShareClick,
  onEditClick,
  onPromoteShopClick,
  onMerchantUnlockClick,
}) => {
  const whatsappUrl = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
    `Hello ${business.name}, I found your business on KWEST Directory and would like to inquire about your services.`
  )}`;

  const heroImageUrl =
    business.heroImage && business.heroImage.trim() !== ''
      ? business.heroImage
      : 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';

  return (
    <div id="business-hero-section" className="relative bg-[#3B0202] text-white rounded-2xl overflow-hidden shadow-xl mb-6 border border-[#630303] font-sans">
      {/* Background Cover Overlay */}
      <div className="absolute inset-0 opacity-25">
        <img
          src={heroImageUrl}
          alt={business.name}
          className="w-full h-full object-cover filter blur-md scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#240101] via-[#3B0202]/90 to-transparent" />
      </div>

      <div className="relative z-10 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/40">
              <MapPin className="w-3.5 h-3.5" />
              {business.zone}
            </span>
            {business.subCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#4D0202] text-stone-200 border border-[#630303]">
                <Tag className="w-3 h-3" />
                {business.subCategory}
              </span>
            )}
            {business.operationType && business.operationType !== 'physical_shop' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-600/40">
                {business.operationType === 'home_based' && '🏠 Home-Based'}
                {business.operationType === 'mobile_service' && '🚗 Mobile Service'}
                {business.operationType === 'freelancer' && '💻 Freelancer'}
              </span>
            )}
            <VerifiedBadge type={business.isClaimed ? 'claimed' : business.isVerified ? 'verified' : 'unclaimed'} />
          </div>

          <div className="flex items-center gap-2">
            <button
              id="share-listing-btn"
              onClick={onShareClick}
              className="p-2 rounded-xl bg-[#4D0202] hover:bg-[#630303] text-stone-200 hover:text-white border border-[#630303] transition"
              title="Share listing"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {business.isClaimed ? (
              isMerchantUnlocked ? (
                <div className="flex items-center gap-2">
                  {onPromoteShopClick && (
                    <button
                      id="hero-promote-shop-btn"
                      onClick={onPromoteShopClick}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 transition shadow-sm active:scale-95 cursor-pointer"
                      title="Launch custom ad campaign or billboard slot"
                    >
                      <Megaphone className="w-3.5 h-3.5 text-stone-950" />
                      <span>Promote Shop</span>
                    </button>
                  )}
                  {onEditClick && (
                    <button
                      id="hero-edit-business-btn"
                      onClick={onEditClick}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white transition shadow-sm border border-stone-600 cursor-pointer"
                      title="Update hours, photos, Lipa na M-Pesa, contacts"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Update Info</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  id="hero-merchant-pin-btn"
                  onClick={onMerchantUnlockClick}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition shadow-sm active:scale-95 cursor-pointer"
                  title="Enter 4-Digit PIN to manage your listing and ads"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Merchant Login</span>
                </button>
              )
            ) : (
              <button
                id="hero-claim-business-btn"
                onClick={onClaimClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#630303] hover:bg-[#7D0404] text-white transition shadow-sm border border-rose-400/30 cursor-pointer"
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
        <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-stone-300 pb-4 mb-5 border-t sm:border-t-0 sm:border-b border-[#630303]/40">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center text-amber-400">
              <Star className={`w-4 h-4 ${business.rating > 0 ? 'fill-amber-400 text-amber-400' : 'text-stone-400'}`} />
              <span className="ml-1 font-bold text-white text-sm">
                {business.rating > 0 ? business.rating.toFixed(1) : '0.0'}
              </span>
            </div>
            <span className="text-stone-400">
              ({(business.reviewCount ?? 0)} {(business.reviewCount ?? 0) === 1 ? 'review' : 'reviews'})
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
              <span className="text-rose-300 font-medium text-xs">
                Managed by {business.claimedBy}
              </span>
            </>
          )}
        </div>

        {/* Direct Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <a
            id="hero-whatsapp-btn"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-600 text-white shadow-md transition active:scale-95 border border-emerald-500/40"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          <a
            id="hero-call-btn"
            href={`tel:${business.phone}`}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#630303] hover:bg-[#7D0404] text-white shadow-md transition active:scale-95 border border-rose-400/40"
          >
            <Phone className="w-4 h-4" />
            <span>Call {business.phone}</span>
          </a>

          <button
            id="hero-share-action-btn"
            onClick={onShareClick}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#4D0202] hover:bg-[#630303] text-stone-200 hover:text-white shadow-md transition active:scale-95 border border-[#7D0404]"
          >
            <Share2 className="w-4 h-4 text-amber-400" />
            <span>Share</span>
          </button>

          <Button
            id="hero-review-btn"
            variant="outline"
            size="md"
            onClick={onFeedbackClick}
            className="border-stone-300 bg-stone-100 text-black hover:bg-white font-bold shadow-sm"
          >
            Leave Review
          </Button>
        </div>
      </div>
    </div>
  );
};
