import React from 'react';
import { Tag, Clock, Gift } from 'lucide-react';

interface SpecialOffer {
  title: string;
  description: string;
  validUntil?: string;
  badgeText?: string;
}

interface BusinessOfferProps {
  offer: SpecialOffer;
}

export const BusinessOffer: React.FC<BusinessOfferProps> = ({ offer }) => {
  if (!offer || !offer.title) return null;

  return (
    <div id="business-special-offer-card" className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 rounded-2xl p-5 border border-amber-300/80 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-600" />
          <span className="text-xs uppercase font-bold tracking-wider text-amber-800">
            {offer.badgeText || 'Special Resident Offer'}
          </span>
        </div>
        {offer.validUntil && (
          <div className="flex items-center gap-1 text-xs text-amber-700 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Valid till {offer.validUntil}</span>
          </div>
        )}
      </div>

      <h4 className="text-lg font-bold text-amber-950 mb-1 flex items-center gap-2">
        <Tag className="w-4 h-4 text-amber-600" />
        {offer.title}
      </h4>
      <p className="text-amber-900/90 text-sm leading-relaxed">
        {offer.description}
      </p>
    </div>
  );
};
