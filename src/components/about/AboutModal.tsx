import React, { useState } from 'react';
import { X, MapPin, ShieldCheck, Facebook, Instagram, Video, ExternalLink } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [aboutImgError, setAboutImgError] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      id="about-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 font-sans"
    >
      <div
        className="bg-[#FAF8F5] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#630303]/30 overflow-hidden my-auto max-h-[90vh] flex flex-col text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#4D0202] text-white p-5 sm:p-6 flex items-center justify-between flex-shrink-0 border-b border-[#630303]">
          <BrandLogo size="sm" showText={true} theme="dark" />
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#630303] text-stone-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* About photo */}
        {!aboutImgError && (
          <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-[#3B0202]">
            <picture>
              <source srcSet="/hero.webp" type="image/webp" />
              <img
                src="/hero.jpg"
                alt="Kahawa West Community"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                onError={() => setAboutImgError(true)}
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-transparent to-transparent" />
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-700 leading-relaxed flex-1">
          <div>
            <h4 className="font-display text-base font-bold text-[#630303] mb-1">Our Mission</h4>
            <p>
              <strong>KWEST (kahawawestdirectory.co.ke / Kahawa West Directory)</strong> is the official hyper-local digital bridge for one of Nairobi’s most vibrant and self-sufficient residential and commercial hubs. We empower residents to instantly find certified local fundis, 24/7 pharmacies, trusted clinics, nyama choma grills, organic produce, mobile freelancers, and verified local businesses.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-900/10 border border-emerald-700/30 text-emerald-950">
            <h5 className="font-display font-bold text-emerald-950 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              The KWEST Verified Seed & Claim Ecosystem
            </h5>
            <p className="text-xs leading-relaxed text-emerald-900">
              Through <strong>kahawawestdirectory</strong>, neighborhood businesses and local service providers across 10 zones in Kahawa West are pre-verified. Business owners and freelancers can search their listing, click <strong>"Claim this Business"</strong>, verify their identity, and upload their authentic storefront images, M-Pesa Tills, and operating hours.
            </p>
          </div>

          <div>
            <h4 className="font-display text-base font-bold text-[#630303] mb-2">
              Zones & Neighborhoods Covered on KWEST
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-stone-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Congo Stage Commercial Core</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Roundabout & Super Metro Hub</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Jacaranda Estate Courts 1-6</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Bima Road Light Industries</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Soweto Artisans & Fundis</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Mahiga Ridge & Kiamumbi Border</span>
              </div>
            </div>
          </div>

          {/* Official Social Media Channels */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-800 space-y-2">
            <h5 className="font-display font-bold text-[#630303] text-xs uppercase tracking-wider">
              Official KWEST Social Media Channels
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <a
                href="https://www.facebook.com/share/14nA4K6CTk3/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-1.5 p-2.5 rounded-xl bg-white border border-blue-200 hover:border-blue-400 text-blue-700 font-semibold text-xs transition shadow-xs"
              >
                <div className="flex items-center gap-1.5">
                  <Facebook className="w-4 h-4 text-blue-600" />
                  <span>Facebook</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="https://www.tiktok.com/@kwestdirectory"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-1.5 p-2.5 rounded-xl bg-white border border-slate-300 hover:border-slate-500 text-slate-900 font-semibold text-xs transition shadow-xs"
              >
                <div className="flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-rose-500" />
                  <span>TikTok</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="https://www.instagram.com/kahawawestdirectory?utm_source=qr&igsi=NXlsa21pc2R4MWRq"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-1.5 p-2.5 rounded-xl bg-white border border-pink-200 hover:border-pink-400 text-pink-700 font-semibold text-xs transition shadow-xs"
              >
                <div className="flex items-center gap-1.5">
                  <Instagram className="w-4 h-4 text-pink-600" />
                  <span>Instagram</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200 text-xs text-stone-500 flex flex-wrap items-center justify-between gap-2">
            <span>Official Domain: <strong>kahawawestdirectory.co.ke</strong></span>
            <span>Platform Alias: <strong>kahawawestdirectory</strong></span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#630303] hover:bg-[#4E0202] text-white text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
