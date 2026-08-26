import React from 'react';
import { ShieldCheck, Mail, MessageCircle, Twitter, Facebook, Instagram, Share2 } from 'lucide-react';
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
    <footer className="bg-[#450202] text-stone-200 pt-12 pb-24 md:pb-12 border-t border-[#630303] text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Column 1: Brand & Bio */}
          <div className="space-y-3">
            <BrandLogo size="md" showText={true} theme="dark" />
            <p className="text-stone-300 leading-relaxed text-xs pt-2">
              The verified hyper-local merchant directory and community portal connecting residents, fundis, clinics, and businesses across Kahawa West, Nairobi.
            </p>
          </div>

          {/* Column 2: Merchants & Community */}
          <div>
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-xs mb-3 text-emerald-300">
              Merchants & Community
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onListBusinessClick} className="hover:text-emerald-300 transition text-left">
                  List Your Business on KWEST
                </button>
              </li>
              <li>
                <button onClick={onAboutClick} className="hover:text-emerald-300 transition text-left">
                  About Kahawa West Project Directory
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

          {/* Column 3: Legal, Support & Social Channels */}
          <div>
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-xs mb-3 text-emerald-300">
              Legal & Support
            </h4>
            <ul className="space-y-2 text-xs mb-4">
              <li>
                <button onClick={() => onLegalClick('terms')} className="hover:text-sky-300 transition text-left">
                  KWEST Terms & Disclaimer
                </button>
              </li>
              <li>
                <button onClick={() => onLegalClick('privacy')} className="hover:text-sky-300 transition text-left">
                  kahawawestdirectory Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onLegalClick('guidelines')} className="hover:text-sky-300 transition text-left">
                  Listing Guidelines & ODPC Compliance
                </button>
              </li>
            </ul>

            <div className="text-stone-300 space-y-2 pt-2 border-t border-[#630303]">
              <p className="flex items-center gap-1.5 text-xs">
                <Mail className="w-3.5 h-3.5 text-sky-300 flex-shrink-0" />
                <span className="truncate">support@kahawawestdirectory.co.ke</span>
              </p>

              {/* Social Channels & WhatsApp Support */}
              <div className="pt-2">
                <span className="text-[11px] text-stone-400 font-semibold block mb-2">Connect with KWEST:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* WhatsApp Support */}
                  <a
                    href="https://wa.me/254700000000?text=Hello%20KWEST%20Team%2C%20I%20have%20an%20inquiry%20regarding%20Kahawa%20West%20Directory"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-semibold transition border border-emerald-500/40"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Facebook Placeholder */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition border border-white/10"
                    title="Facebook Page"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                  </a>

                  {/* X / Twitter Placeholder */}
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition border border-white/10"
                    title="X (Twitter)"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                  </a>

                  {/* Instagram Placeholder */}
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition border border-white/10"
                    title="Instagram"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-[#630303]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-400 text-[11px]">
          <div>
            © {new Date().getFullYear()} KWEST (kahawawestdirectory.co.ke). Official Kahawa West Directory & Community Portal.
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Local Portal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
