import React, { useState } from 'react';
import {
  Palette,
  Mail,
  Ruler,
  FileImage,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Maximize2,
  CheckCircle2,
  Megaphone,
  ArrowRight,
  ShieldCheck,
  Tag,
  Eye,
  MessageCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { Business } from '../../types';
import { ListingImage } from '../ui/ListingImage';

interface BusinessAdSuiteProps {
  business: Business;
  onAdEnquiryClick?: () => void;
  onPromoteShopClick?: () => void;
}

export const BusinessAdSuite: React.FC<BusinessAdSuiteProps> = ({
  business,
  onAdEnquiryClick,
  onPromoteShopClick,
}) => {
  const [showBannerSpecs, setShowBannerSpecs] = useState(false);
  const [activePreviewFormat, setActivePreviewFormat] = useState<'billboard' | 'resident_deal' | 'category_pin'>('billboard');

  // Only show when the business is claimed
  if (!business.isClaimed) {
    return null;
  }

  const handleWhatsAppEnquiry = () => {
    const text = encodeURIComponent(
      `Hello KWEST Ads Team, I am the verified owner of *${business.name}* in Kahawa West (${business.zone}). I would like to book a Prime Ad Billboard / Promo slot and enquire about custom HD Ad Graphics & Copywriting.`
    );
    window.open(`https://wa.me/254712345678?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  // Generate tailored placeholder copy for the business
  const isFurniture = business.category === 'hardware-construction' || business.name.toLowerCase().includes('furniture') || business.subCategory?.toLowerCase().includes('furniture') || business.subCategory?.toLowerCase().includes('carpentry');
  
  const billboardHeadline = isFurniture
    ? `${business.name} — Handcrafted Solid Mahogany & Sofa Sets`
    : `${business.name} — Premium Quality in ${business.zone}`;

  const billboardDescription = isFurniture
    ? `Custom modern living room sets, wardrobes, dining tables & TV stands made in Kahawa West. Quality hardwood, bespoke designs & free estate delivery!`
    : business.tagline || `Top-rated services & verified products for Kahawa West residents. Fast turnaround and guaranteed satisfaction.`;

  const residentOfferHeadline = isFurniture
    ? `Kahawa West Resident Promo: 15% OFF Custom TV Stands & Beds`
    : `Resident Discount: Special Promo for ${business.zone} Residents`;

  return (
    <div
      id="verified-merchant-ad-suite"
      className="relative overflow-hidden rounded-2xl bg-[#00000f] text-white p-5 sm:p-6 border-2 border-amber-400/80 shadow-xl font-sans"
    >
      {/* Luxury Ambient Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-8 w-48 h-48 bg-[#630303]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header Badges & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-950" />
              <span>Verified Merchant Ad Suite</span>
            </span>
            <span className="text-xs font-bold text-amber-300">
              Promote {business.name} on KWEST
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="promote-shop-suite-btn"
              onClick={onPromoteShopClick || onAdEnquiryClick || handleWhatsAppEnquiry}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-stone-950 font-black text-xs transition shadow-md cursor-pointer"
              title="Create your ad campaign and choose your format"
            >
              <Megaphone className="w-3.5 h-3.5 text-stone-950" />
              <span>Promote Shop</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed">
          As the verified owner of <strong className="text-white">{business.name}</strong>, you can launch targeted ad campaigns, get pinned at the top of directory searches, and convert estate residents into loyal customers.
        </p>

        {/* Tailored Complete Ad Placeholders & Previews */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-amber-200">
                Complete Ad Placeholders for {business.name}:
              </span>
            </div>
            {/* Format toggle pills */}
            <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-lg text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setActivePreviewFormat('billboard')}
                className={`px-2 py-0.5 rounded-md transition ${activePreviewFormat === 'billboard' ? 'bg-amber-400 text-stone-950' : 'text-stone-300 hover:text-white'}`}
              >
                Top Billboard (1200×400)
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewFormat('resident_deal')}
                className={`px-2 py-0.5 rounded-md transition ${activePreviewFormat === 'resident_deal' ? 'bg-amber-400 text-stone-950' : 'text-stone-300 hover:text-white'}`}
              >
                Resident Deal Card
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewFormat('category_pin')}
                className={`px-2 py-0.5 rounded-md transition ${activePreviewFormat === 'category_pin' ? 'bg-amber-400 text-stone-950' : 'text-stone-300 hover:text-white'}`}
              >
                #1 Category Pin
              </button>
            </div>
          </div>

          {/* Placeholder 1: Top Billboard Mockup */}
          {activePreviewFormat === 'billboard' && (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#240101] via-[#3B0202] to-[#1a0101] p-4 sm:p-5 text-white border-2 border-amber-400/70 shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-full opacity-25 pointer-events-none">
                <ListingImage
                  src={business.heroImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'}
                  business={business}
                  imageType="ad"
                  className="w-full h-full object-cover filter blur-xs"
                />
              </div>
              <div className="relative z-10 space-y-2.5 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-amber-400 text-stone-950 shadow-xs">
                    🌟 Prime Billboard Sponsor
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40">
                    ✓ Verified Local Merchant
                  </span>
                  <span className="text-[10px] text-stone-300">
                    📍 {business.zone}
                  </span>
                </div>

                <h4 className="font-display font-black text-base sm:text-lg text-white tracking-tight leading-tight">
                  {billboardHeadline}
                </h4>

                <p className="text-xs text-stone-200 leading-relaxed">
                  {billboardDescription}
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={onPromoteShopClick || handleWhatsAppEnquiry}
                    className="px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp for Instant Quote</span>
                  </button>
                  <span className="text-[11px] text-amber-300 font-mono">
                    Estimated Reach: 3,500+ Weekly Views
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder 2: Resident Deal Card */}
          {activePreviewFormat === 'resident_deal' && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/70 via-stone-900 to-rose-950/70 border-2 border-amber-400/70 text-stone-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500 text-white animate-pulse">
                  🔥 Kahawa West Resident Special
                </span>
                <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Active for Estate Residents
                </span>
              </div>
              <h4 className="font-bold text-sm sm:text-base text-white">{residentOfferHeadline}</h4>
              <p className="text-xs text-stone-300">
                Claim this exclusive discount with {business.name} at {business.landmark || business.zone}. Mention &quot;KWEST Directory&quot; on WhatsApp to redeem instantly!
              </p>
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPromoteShopClick || handleWhatsAppEnquiry}
                  className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Claim Resident Deal</span>
                </button>
              </div>
            </div>
          )}

          {/* Placeholder 3: #1 Category Pin */}
          {activePreviewFormat === 'category_pin' && (
            <div className="p-4 rounded-xl bg-stone-900 border-2 border-amber-400 text-stone-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-stone-950">
                  🥇 #1 Pinned Result in {business.category}
                </span>
                <span className="text-xs text-stone-300 font-medium">{business.zone}</span>
              </div>
              <h4 className="font-bold text-sm sm:text-base text-white">{business.name}</h4>
              <p className="text-xs text-stone-300">{business.tagline || billboardDescription}</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onPromoteShopClick || handleWhatsAppEnquiry}
                  className="px-3.5 py-1.5 rounded-lg bg-[#25D366] text-slate-950 font-bold text-xs flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3" /> WhatsApp
                </button>
                <span className="text-xs text-stone-400">Guaranteed top ranking over non-promoted shops</span>
              </div>
            </div>
          )}
        </div>

        {/* Creative Services & Direct Contact Banner Pill */}
        <div className="p-3 rounded-xl bg-white/5 border border-amber-400/30 text-xs text-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs">
              <strong>Need Custom Graphics &amp; Copy?</strong> Our in-house designers write compelling copy &amp; create HD 1200×400 banners for your business.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold text-amber-300 flex-shrink-0">
            <a
              href={`mailto:ads@kahawawestdirectory.co.ke?subject=Ad%20Enquiry%20for%20${encodeURIComponent(business.name)}`}
              className="hover:underline flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>ads@kahawawestdirectory.co.ke</span>
            </a>
          </div>
        </div>

        {/* Quick Specs Pill Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/10 text-amber-200 border border-white/15">
            <Ruler className="w-3 h-3 text-amber-400" />
            <span>Specs: 1200 × 400 px (3:1) • 31.8 × 10.6 cm</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/10 text-stone-300 border border-white/15">
            <FileImage className="w-3 h-3 text-emerald-400" />
            <span>PNG / WebP • Max 1.5MB</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/10 text-sky-300 border border-white/15">
            <ExternalLink className="w-3 h-3 text-sky-400" />
            <span>Click Action: WhatsApp/Call or Website</span>
          </span>
          <button
            type="button"
            onClick={() => setShowBannerSpecs(!showBannerSpecs)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>{showBannerSpecs ? 'Hide Ad Specs' : 'View Full Creative Dimensions'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showBannerSpecs ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Detailed Creative Dimensions Drawer */}
        {showBannerSpecs && (
          <div className="mt-3 pt-3.5 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-black/60 p-3.5 rounded-xl backdrop-blur-md animate-in fade-in duration-200 border border-white/10">
            <div className="space-y-1">
              <div className="text-amber-300 font-bold flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5" />
                <span>Recommended Resolution</span>
              </div>
              <p className="text-stone-300 text-[11px] leading-relaxed">
                <strong>Desktop:</strong> 1200 × 400 px (3:1)<br />
                <strong>Mobile:</strong> 800 × 400 px (2:1)
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-amber-300 font-bold flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Physical Print / CM Eqv</span>
              </div>
              <p className="text-stone-300 text-[11px] leading-relaxed">
                <strong>96 DPI (Web):</strong> 31.75 cm × 10.58 cm<br />
                <strong>300 DPI (HD):</strong> 10.16 cm × 3.38 cm
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-amber-300 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Text &amp; Copy Limits</span>
              </div>
              <p className="text-stone-300 text-[11px] leading-relaxed">
                <strong>Headline:</strong> Max 45 characters<br />
                <strong>Description:</strong> Max 110 characters<br />
                <strong>CTA Button:</strong> Max 18 characters
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-amber-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Asset Requirements</span>
              </div>
              <p className="text-stone-300 text-[11px] leading-relaxed">
                <strong>Formats:</strong> JPG, PNG, WebP<br />
                <strong>Max File Size:</strong> 1.5 MB (sRGB)<br />
                <strong>Click Action:</strong> WhatsApp/Call or Website
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

