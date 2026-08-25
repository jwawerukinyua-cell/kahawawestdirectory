import React, { useState } from 'react';
import { X, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
        className="bg-[#FAF8F5] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#4A2518]/30 overflow-hidden my-auto max-h-[90vh] flex flex-col text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#22120C] text-white p-5 sm:p-6 flex items-center justify-between flex-shrink-0 border-b border-[#381E15]">
          <BrandLogo size="sm" showText={true} theme="dark" />
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#341B12] text-stone-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Optional About photo (/about.jpg) */}
        {!aboutImgError && (
          <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-[#24140E]">
            <img
              src="/about.jpg"
              alt="Kahawa West Community"
              className="w-full h-full object-cover"
              onError={() => setAboutImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-transparent to-transparent" />
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-700 leading-relaxed flex-1">
          <div>
            <h4 className="font-display text-base font-bold text-[#24140E] mb-1">Our Mission</h4>
            <p>
              <strong>Kahawa West Directory (KWEST)</strong> is the dedicated digital bridge for one of Nairobi’s most vibrant and self-sufficient residential and commercial hubs. We empower residents to instantly find certified local fundis, 24/7 pharmacies, trusted clinics, nyama choma grills, organic produce, and verified bedsitter/apartment vacancies.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-900/10 border border-emerald-700/30 text-emerald-950">
            <h5 className="font-display font-bold text-emerald-950 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              The Seed & Claim Architecture
            </h5>
            <p className="text-xs text-emerald-900 leading-relaxed">
              We seed the directory with 50+ rich, essential neighborhood businesses. Business owners and managers can easily locate their listing, click <strong>"Claim This Business"</strong>, and customize their 5 photos, Lipa na M-Pesa Tills, WhatsApp lines, operating hours, and special resident discounts in real time.
            </p>
          </div>

          <div>
            <h4 className="font-display text-base font-bold text-[#24140E] mb-2">Key Estate Features</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span><strong>Hyper-Local Zones:</strong> Congo Stage, Roundabout, Jacaranda Estate, Bima Road, Soweto, Kamae, Station/Railway, and Mahiga.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span><strong>5-Photo Business Galleries:</strong> Primary hero image on search cards, full 5-photo high-resolution gallery on details view.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span><strong>Direct WhatsApp & Call Buttons:</strong> Connect instantly with shop owners and fundis with a dash of sky-blue fast dialers.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span><strong>Verified Resident Reviews:</strong> Community feedback filtered by local residents to combat spam and ensure trust.</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-300 flex items-center justify-between text-xs text-stone-500">
            <span>Official Portal: kwestdirectory.co.ke</span>
            <span className="font-semibold text-[#24140E]">Built for Kahawa West Residents</span>
          </div>
        </div>

        <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#24140E] hover:bg-[#381E15] text-white font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
