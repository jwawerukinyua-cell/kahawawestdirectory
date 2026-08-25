import React, { useState } from 'react';
import { Sparkles, Megaphone, Tag, ArrowRight, ShieldCheck, CheckCircle2, Phone, Mail, Clock } from 'lucide-react';
import { Business } from '../../types';

interface MonetizationPlaceholdersProps {
  businessesWithOffers: Business[];
  onViewBusiness: (biz: Business) => void;
  onClaimListing: () => void;
  onOpenAdEnquiry: () => void;
}

export const MonetizationPlaceholders: React.FC<MonetizationPlaceholdersProps> = ({
  businessesWithOffers,
  onViewBusiness,
  onClaimListing,
  onOpenAdEnquiry,
}) => {
  return (
    <div className="space-y-8 my-8">
      {/* 1. Main Homepage Promo / Ad Banner Placeholder (Monetization Slot #1) */}
      <div
        id="homepage-main-promo-banner"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#260101] via-[#450505] to-[#630303] text-white p-5 sm:p-7 border border-[#630303]/60 shadow-xl"
      >
        {/* Background glow and decorative watermark */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-400 text-stone-950 shadow-sm animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                Coming Soon • Prime Ad Slot
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-200">
                <Megaphone className="w-3.5 h-3.5" />
                Homepage Billboard & Sponsor Spotlight
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Promote Your Brand Across Kahawa West
            </h3>

            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-sans">
              This high-visibility homepage billboard will be available for local businesses, estates, schools, medical centers, and brands once the directory goes live. Drive foot-traffic and direct WhatsApp orders from over 10,000+ monthly estate visits.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2.5 w-full md:w-auto flex-shrink-0">
            <button
              onClick={onOpenAdEnquiry}
              className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-amber-950/20"
            >
              <span>Reserve Ad Space</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClaimListing}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm border border-white/20 flex items-center justify-center gap-1.5 transition backdrop-blur-sm"
            >
              <span>Claim & Edit Your Listing</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Special Resident Offers & Hot Deals Showcase (Monetization Slot #2) */}
      <div
        id="resident-offers-showcase"
        className="rounded-2xl bg-amber-50/80 border border-amber-200/90 p-5 sm:p-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-500 text-white">
                <Tag className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-black text-amber-950 tracking-tight">
                Resident Special Offers & Promotions
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-200 text-amber-900 border border-amber-300">
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-amber-800 font-medium">
              Exclusive deals, resident discounts, and limited-time vouchers provided by verified Kahawa West merchants.
            </p>
          </div>

          <button
            onClick={onClaimListing}
            className="text-xs font-bold text-[#630303] hover:text-[#450505] flex items-center gap-1 hover:underline self-start sm:self-auto"
          >
            <span>Have a business? Post a resident offer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Offers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Sample or Real business with offer */}
          {businessesWithOffers.length > 0 ? (
            businessesWithOffers.slice(0, 3).map((biz) => (
              <div
                key={biz.id}
                onClick={() => onViewBusiness(biz)}
                className="group bg-white rounded-xl p-4 border border-amber-200 hover:border-amber-400 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                      {biz.specialOffer?.badgeText || 'Special Offer'}
                    </span>
                    <span className="text-[11px] font-bold text-stone-500">{biz.zone}</span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm group-hover:text-[#630303] transition line-clamp-1">
                    {biz.name}
                  </h4>
                  <p className="text-xs font-semibold text-amber-900 mt-1">
                    {biz.specialOffer?.title}
                  </p>
                  <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">
                    {biz.specialOffer?.description || biz.tagline}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs text-[#630303] font-bold">
                  <span>View Offer Details</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))
          ) : (
            <>
              {/* Placeholder 1 */}
              <div className="bg-white/90 rounded-xl p-4 border border-dashed border-amber-300 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900">
                      Sample Discount
                    </span>
                    <span className="text-[10px] font-medium text-stone-400">Jacaranda & Roundabout</span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-xs">Weekend Car Wash & Vacuum</h4>
                  <p className="text-[11px] text-amber-900 font-semibold mt-1">10% Off for Estate Residents</p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Present your directory mention or WhatsApp booking for an instant Ksh 100 discount.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] text-amber-800 font-semibold">
                  <span>Spotlight Slot Available</span>
                  <Sparkles className="w-3 h-3 text-amber-600" />
                </div>
              </div>

              {/* Placeholder 2 */}
              <div className="bg-white/90 rounded-xl p-4 border border-dashed border-amber-300 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900">
                      Free Delivery
                    </span>
                    <span className="text-[10px] font-medium text-stone-400">Congo & Station</span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-xs">Fresh Farm Produce & Groceries</h4>
                  <p className="text-[11px] text-emerald-900 font-semibold mt-1">Free Doorstep Delivery on Orders over 1K</p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Delivered directly to Jacaranda, Jubilee & Mahiga within 30 minutes of ordering.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                  <span>Spotlight Slot Available</span>
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                </div>
              </div>

              {/* Placeholder 3 */}
              <div className="bg-white/90 rounded-xl p-4 border border-dashed border-amber-300 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-900">
                      Special Combo
                    </span>
                    <span className="text-[10px] font-medium text-stone-400">Bima Road & Northern Bypass</span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-xs">Nyama Choma & Ugali Family Platter</h4>
                  <p className="text-[11px] text-rose-900 font-semibold mt-1">Ksh 1,200 with Free Kachumbari</p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Book table or takeaway via direct WhatsApp line with instant till confirmation.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] text-rose-800 font-semibold">
                  <span>Spotlight Slot Available</span>
                  <Sparkles className="w-3 h-3 text-rose-600" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
