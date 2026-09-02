import React, { useState, useEffect } from 'react';
import { MapPin, Star, Phone, MessageSquare, ShieldCheck, ChevronRight, CreditCard, Tag, Lock, Building2 } from 'lucide-react';
import { Business } from '../../types';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { ListingImage } from '../ui/ListingImage';
import { trackBusinessInteraction } from '../../lib/tracking';
import { formatKenyanPhoneForTel, getWhatsAppChatUrl } from '../../lib/phoneUtils';
import { isBusinessContactGated, HOUSING_CONTACT_UNLOCK_FEE, maskPhoneNumber } from '../../lib/contactGating';

interface BusinessCardProps {
  business: Business;
  onViewDetails: (business: Business) => void;
  onClaim: (business: Business) => void;
  onUnlockContact?: (business: Business) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  onViewDetails,
  onClaim,
  onUnlockContact,
}) => {
  const [isGated, setIsGated] = useState(() => isBusinessContactGated(business));

  // Listen for unlock events so card updates live
  useEffect(() => {
    const checkGating = () => {
      setIsGated(isBusinessContactGated(business));
    };
    checkGating();
    window.addEventListener('kwest_contact_unlock_changed', checkGating);
    window.addEventListener('storage', checkGating);
    return () => {
      window.removeEventListener('kwest_contact_unlock_changed', checkGating);
      window.removeEventListener('storage', checkGating);
    };
  }, [business]);

  const whatsappUrl = getWhatsAppChatUrl(
    business.whatsapp || business.phone,
    `Hello ${business.name}, I saw your listing on KWEST Directory and would like to make an inquiry.`
  );

  const phoneTelUri = formatKenyanPhoneForTel(business.phone);

  const handleWhatsApp = (e: React.MouseEvent) => {
    if (isGated) {
      e.preventDefault();
      trackBusinessInteraction(business.id, 'view');
      if (onUnlockContact) {
        onUnlockContact(business);
      } else {
        onViewDetails(business);
      }
      return;
    }
    trackBusinessInteraction(business.id, 'whatsapp');
  };

  const handlePhone = (e: React.MouseEvent) => {
    if (isGated) {
      e.preventDefault();
      trackBusinessInteraction(business.id, 'view');
      if (onUnlockContact) {
        onUnlockContact(business);
      } else {
        onViewDetails(business);
      }
      return;
    }
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
        <ListingImage
          src={heroImageUrl}
          business={business}
          imageType="cover"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
          width="400"
          height="192"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 right-3 flex items-center justify-end pointer-events-none gap-1.5">
          {isGated && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 shadow-sm border border-amber-300">
              <Lock className="w-3 h-3" />
              Contacts Gated
            </span>
          )}
          <VerifiedBadge type={business.isClaimed ? 'claimed' : business.isVerified ? 'verified' : 'unclaimed'} size="sm" />
        </div>

        {/* M-Pesa Banner or Housing Policy Badge */}
        {business.mpesa && !isGated && (
          <div className="absolute bottom-2 left-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-700/95 text-white backdrop-blur-xs shadow-2xs">
              <CreditCard className="w-3 h-3" />
              M-Pesa {business.mpesa.type}: {business.mpesa.number}
            </span>
          </div>
        )}

        {isGated && (
          <div className="absolute bottom-2 left-3">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#044E2E]/95 text-emerald-200 backdrop-blur-xs border border-emerald-500/30 shadow-2xs">
              <Building2 className="w-3 h-3 text-emerald-400" />
              Housing Agent • KES {HOUSING_CONTACT_UNLOCK_FEE} to Reveal
            </span>
          </div>
        )}

        {/* Special Offer Pill if present */}
        {business.specialOffer && !isGated && (
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
            {isGated ? (
              <>
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold transition active:scale-95 border border-amber-200 cursor-pointer shadow-2xs"
                  title="Direct contact gated. Tap to view unlock options (KES 500)"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span className="truncate">WhatsApp (Gated)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePhone}
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition active:scale-95 border border-stone-300 cursor-pointer shadow-2xs"
                  title="Direct contact gated. Tap to reveal phone line (KES 500)"
                >
                  <Lock className="w-3.5 h-3.5 text-stone-600" />
                  <span className="truncate">Call (Gated)</span>
                </button>
              </>
            ) : (
              <>
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
                  href={`tel:${phoneTelUri}`}
                  onClick={handlePhone}
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 text-xs font-semibold transition active:scale-95 border border-sky-200"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-700" />
                  Call
                </a>
              </>
            )}
          </div>

          {/* View Full Details Button */}
          <div className="flex items-center gap-2">
            <button
              id={`view-details-${business.id}`}
              onClick={handleDetails}
              className="flex-1 py-2 px-3 rounded-xl bg-[#00000f] hover:bg-[#7D0404] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>VIEW FULL DETAILS</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {!business.isClaimed && (
              <button
                id={`claim-btn-${business.id}`}
                onClick={() => onClaim(business)}
                title="Claim this business"
                className="py-2 px-3 rounded-xl bg-[#630303]/10 hover:bg-[#630303]/20 text-[#630303] border border-[#630303]/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
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
