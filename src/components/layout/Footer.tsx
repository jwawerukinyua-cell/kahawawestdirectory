import React from 'react';
import { MapPin, ShieldCheck, Mail, Phone } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

interface FooterProps {
  onLegalClick: (tab: 'guidelines' | 'community' | 'privacy' | 'terms') => void;
  onAboutClick: () => void;
  onListBusinessClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onLegalClick,
  onAboutClick,
  onListBusinessClick,
}) => {
  return (
    <footer className="bg-[#1C0E08] text-stone-300 pt-12 pb-24 md:pb-12 border-t border-[#381E15] text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand & Domain */}
          <div className="space-y-3 md:col-span-1">
            <BrandLogo size="md" showText={true} theme="dark" />
            <p className="text-stone-400 leading-relaxed text-xs pt-2">
              The verified hyper-local merchant directory and community portal connecting residents, fundis, clinics, and businesses across Kahawa West, Nairobi.
            </p>
          </div>

          {/* Column 2: Estate Zones */}
          <div>
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-xs mb-3 text-emerald-400">
              Estate Zones Covered
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-300">
              <li>Congo Stage & Commercial Center</li>
              <li>Kahawa West Roundabout & Terminal</li>
              <li>Jacaranda Estate & Courts 1-6</li>
              <li>Bima Road & Light Industries</li>
              <li>Soweto & Kamae Neighborhoods</li>
              <li>Station Road / Old Railway Siding</li>
              <li>Mahiga Ridge & Kiamumbi Border</li>
            </ul>
          </div>

          {/* Column 3: Merchants & Directory */}
          <div>
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-xs mb-3 text-emerald-400">
              Merchants & Community
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={onListBusinessClick} className="hover:text-emerald-300 transition text-left">
                  List Your Business on KWEST
                </button>
              </li>
              <li>
                <button onClick={onAboutClick} className="hover:text-emerald-300 transition text-left">
                  About Kahawa West Project
                </button>
              </li>
              <li>
                <button onClick={() => onLegalClick('guidelines')} className="hover:text-emerald-300 transition text-left">
                  Business Listing Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => onLegalClick('community')} className="hover:text-emerald-300 transition text-left">
                  Community Standards
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Contact */}
          <div>
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-xs mb-3 text-emerald-400">
              Legal & Support
            </h4>
            <ul className="space-y-1.5 text-xs mb-4">
              <li>
                <button onClick={() => onLegalClick('terms')} className="hover:text-sky-300 transition text-left">
                  Terms of Use
                </button>
              </li>
              <li>
                <button onClick={() => onLegalClick('privacy')} className="hover:text-sky-300 transition text-left">
                  Privacy Policy
                </button>
              </li>
            </ul>
            <div className="text-stone-300 space-y-1">
              <p className="flex items-center gap-1.5 text-xs">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>info@kwestdirectory.co.ke</span>
              </p>
              <p className="flex items-center gap-1.5 text-xs">
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                <span>+254 700 000 000</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#381E15] flex flex-wrap items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} kwestdirectory.co.ke. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onLegalClick('privacy')} className="hover:text-white transition">Privacy</button>
            <button onClick={() => onLegalClick('terms')} className="hover:text-white transition">Terms</button>
            <button onClick={onAboutClick} className="hover:text-white transition">About</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
