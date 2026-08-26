import React from 'react';
import { MapPin, Star, Phone, MessageSquare, ShieldCheck, ChevronRight, CreditCard, Tag } from 'lucide-react';
import { Business } from '../../types';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { trackBusinessInteraction } from '../../lib/tracking';

interface BusinessCardProps {
  business: Business;
  onViewDetails: (business: Business) => void;
  onClaim: (business: Business) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  onViewDetails,
  onClaim,
}) => {
  const whatsappUrl = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
    `Hello ${business.name}, I saw your listing on KWEST Directory.`
  )}`;

  const handleWhatsApp = () => {
    trackBusinessInteraction(business.id, 'whatsapp');
  };

  const handlePhone = () => {
    trackBusinessInteraction(business.id, 'phone');
  };

  const handleDetails = () => {
    trackBusinessInteraction(business.id, 'view');
    onViewDetails(business);
  };

  const heroImageUrl =
    business.heroImage && business.heroImage.trim() !== ''
      ? business.heroImage
      : 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      id={`business-card-${business.id}`}
      className="group bg-white rounded-2xl border border-stone-200 hover:border-[#4A2518]/50 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden font-sans"
    >
      {/* Main Single Photo (Hero Image Only on Card) */}
      <div className="relative h-48 w-full bg-stone-100 overflow-hidden cursor-pointer" onClick={handleDetails}>
        <img
          src={heroImageUrl}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 right-3 flex items-center justify-end pointer-events-none">
          <VerifiedBadge type={business.isClaimed ? 'claimed' : business.isVerified ? 'verified' : 'unclaimed'} size="sm" />
        </div>

        {/* M-Pesa Banner if available */}
        {business.mpesa && (
          <div className="absolute bottom-2 left-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-700/95 text-white backdrop-blur-xs shadow-2xs">
              <CreditCard className="w-3 h-3" />
              M-Pesa {business.mpesa.type}: {business.mpesa.number}
            </span>
          </div>
        )}

        {/* Special Offer Pill if present */}
        {business.specialOffer && (
          <div className="absolute bottom-2 right-3">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md bg-[#7C2D12] text-white shadow-2xs">
              {business.specialOffer.badgeText || 'Special Offer'}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" />
                {business.subCategory || business.category}
              </span>
              {business.operationType && business.operationType !== 'physical_shop' && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  {business.operationType === 'home_based' && 'Home-Based'}
                  {business.operationType === 'mobile_service' && 'Mobile'}
                  {business.operationType === 'freelancer' && 'Freelancer'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs">
              <Star className={`w-3.5 h-3.5 ${(business.rating ?? 0) > 0 ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}`} />
              <span className="font-bold text-[#24140E]">{(business.rating ?? 0) > 0 ? business.rating.toFixed(1) : '0.0'}</span>
              <span className="text-stone-400">({business.reviewCount ?? 0})</span>
            </div>
          </div>

          {/* Business Name */}
          <h3
            onClick={handleDetails}
            className="font-display font-bold text-[#24140E] text-base sm:text-lg group-hover:text-emerald-800 transition cursor-pointer line-clamp-1 mb-1"
          >
            {business.name}
          </h3>

          {/* Tagline / Snippet */}
          <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed mb-3">
            {business.tagline || business.description}
          </p>

          {/* Landmark spot */}
          <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-4">
            <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
            <span className="truncate">{business.landmark}</span>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsApp}
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold transition active:scale-95 border border-emerald-200"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              WhatsApp
            </a>

            <a
              href={`tel:${business.phone}`}
              onClick={handlePhone}
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 text-xs font-semibold transition active:scale-95 border border-sky-200"
            >
              <Phone className="w-3.5 h-3.5 text-sky-700" />
              Call
            </a>
          </div>

          {/* View Full Details Button */}
          <div className="flex items-center gap-2">
            <button
              id={`view-details-${business.id}`}
              onClick={handleDetails}
              className="flex-1 py-2 px-3 rounded-xl bg-[#630303] hover:bg-[#7D0404] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>VIEW FULL DETAILS</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {!business.isClaimed && (
              <button
                id={`claim-btn-${business.id}`}
                onClick={() => onClaim(business)}
                title="Claim this business"
                className="py-2 px-3 rounded-xl bg-[#630303]/10 hover:bg-[#630303]/20 text-[#630303] border border-[#630303]/30 text-xs font-bold transition flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#630303]" />
                <span>Claim</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
