import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  MessageCircle,
  Facebook,
  Instagram,
  Video,
  Phone,
  ChevronDown,
} from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

interface FooterProps {
  onLegalClick: (tab: 'guidelines' | 'community' | 'privacy' | 'terms') => void;
  onAboutClick: () => void;
  onListBusinessClick: () => void;
  onInstallClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onLegalClick,
  onAboutClick,
  onListBusinessClick,
  onInstallClick,
}) => {
  const [openSections, setOpenSections] = useState({
    merchants: true,
    legal: true,
    contact: true,
  });

  const toggleSection = (key: 'merchants' | 'legal' | 'contact') => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <footer id="footer-section" className="bg-[#450202] text-stone-200 pt-12 pb-24 md:pb-12 border-t border-[#630303] text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand & Bio */}
          <div className="space-y-3 lg:pr-4">
            <BrandLogo size="md" showText={true} theme="dark" />
            <p className="text-stone-300 leading-relaxed text-xs pt-2">
              The verified hyper-local merchant directory and community portal connecting residents, fundis, clinics, and businesses across Kahawa West, Nairobi.
            </p>
          </div>

          {/* Column 2: Merchants & Community */}
          <div className="border-t md:border-t-0 border-[#630303]/60 pt-4 md:pt-0">
            <button
              id="footer-merchants-toggle-btn"
              type="button"
              onClick={() => toggleSection('merchants')}
              className="w-full flex items-center justify-between text-left font-display font-black text-white uppercase tracking-wider text-xs mb-3 text-emerald-300 group py-1"
              aria-expanded={openSections.merchants}
            >
              <span>MERCHANTS & COMMUNITY</span>
              <ChevronDown
                className={`w-4 h-4 text-emerald-300/80 transition-transform duration-200 group-hover:text-emerald-200 ${
                  openSections.merchants ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSections.merchants && (
              <ul className="space-y-2.5 text-xs animate-in fade-in duration-200">
                <li>
                  <button
                    id="footer-about-btn"
                    onClick={onAboutClick}
                    className="hover:text-emerald-300 transition text-left"
                  >
                    About Kahawa West Directory
                  </button>
                </li>
                <li>
                  <button
                    id="footer-list-business-btn"
                    onClick={onListBusinessClick}
                    className="hover:text-emerald-300 transition text-left"
                  >
                    List Your Business on KWEST
                  </button>
                </li>
                <li>
                  <button
                    id="footer-guidelines-btn"
                    onClick={() => onLegalClick('guidelines')}
                    className="hover:text-emerald-300 transition text-left"
                  >
                    Business Listing Guidelines
                  </button>
                </li>
                {onInstallClick && (
                  <li>
                    <button
                      id="footer-install-app-btn"
                      onClick={onInstallClick}
                      className="text-amber-300 hover:text-amber-200 font-bold transition text-left flex items-center gap-1.5"
                    >
                      <span>📲 Install App to Home Screen</span>
                    </button>
                  </li>
                )}
                <li>
                  <button
                    id="footer-community-standards-btn"
                    onClick={() => onLegalClick('community')}
                    className="hover:text-emerald-300 transition text-left"
                  >
                    Community Standards
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Column 3: Legal & Terms */}
          <div className="border-t md:border-t-0 border-[#630303]/60 pt-4 md:pt-0">
            <button
              id="footer-legal-toggle-btn"
              type="button"
              onClick={() => toggleSection('legal')}
              className="w-full flex items-center justify-between text-left font-display font-black text-white uppercase tracking-wider text-xs mb-3 text-emerald-300 group py-1"
              aria-expanded={openSections.legal}
            >
              <span>LEGAL & TERMS</span>
              <ChevronDown
                className={`w-4 h-4 text-emerald-300/80 transition-transform duration-200 group-hover:text-emerald-200 ${
                  openSections.legal ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSections.legal && (
              <ul className="space-y-2.5 text-xs animate-in fade-in duration-200">
                <li>
                  <button
                    id="footer-terms-btn"
                    onClick={() => onLegalClick('terms')}
                    className="hover:text-sky-300 transition text-left"
                  >
                    KWEST Terms & Disclaimer
                  </button>
                </li>
                <li>
                  <button
                    id="footer-privacy-btn"
                    onClick={() => onLegalClick('privacy')}
                    className="hover:text-sky-300 transition text-left"
                  >
                    kahawawestdirectory Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    id="footer-odpc-btn"
                    onClick={() => onLegalClick('guidelines')}
                    className="hover:text-sky-300 transition text-left"
                  >
                    Listing Guidelines & ODPC Compliance
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Column 4: Contact & Support */}
          <div className="border-t md:border-t-0 border-[#630303]/60 pt-4 md:pt-0">
            <button
              id="footer-contact-toggle-btn"
              type="button"
              onClick={() => toggleSection('contact')}
              className="w-full flex items-center justify-between text-left font-display font-black text-white uppercase tracking-wider text-xs mb-3 text-emerald-300 group py-1"
              aria-expanded={openSections.contact}
            >
              <span>CONTACT & SUPPORT</span>
              <ChevronDown
                className={`w-4 h-4 text-emerald-300/80 transition-transform duration-200 group-hover:text-emerald-200 ${
                  openSections.contact ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSections.contact && (
              <div className="text-stone-300 space-y-3 animate-in fade-in duration-200">
                {/* Phone contact */}
                <a
                  id="footer-phone-link"
                  href="tel:0764405842"
                  className="flex items-center gap-2 text-xs hover:text-emerald-300 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="font-semibold tracking-wide">0764 405 842</span>
                </a>

                {/* Email contact */}
                <a
                  id="footer-email-link"
                  href="mailto:support@kahawawestdirectory.co.ke"
                  className="flex items-center gap-2 text-xs hover:text-sky-300 transition truncate"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-300 flex-shrink-0" />
                  <span className="truncate">support@kahawawestdirectory.co.ke</span>
                </a>

                {/* WhatsApp button */}
                <div>
                  <a
                    id="footer-whatsapp-btn"
                    href="https://wa.me/254764405842?text=Hello%20KWEST%20Team%2C%20I%20have%20an%20inquiry%20regarding%20Kahawa%20West%20Directory"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition border border-emerald-500/40 shadow-xs"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp: 0764 405 842</span>
                  </a>
                </div>

                {/* Social Channels */}
                <div className="pt-2 border-t border-[#630303]/70">
                  <span className="text-[11px] text-stone-400 font-semibold block mb-2">
                    Follow KWEST Directory Socials:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      id="footer-facebook-link"
                      href="https://www.facebook.com/share/14nA4K6CTk3/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-blue-600/30 text-stone-200 hover:text-white transition border border-white/10 text-xs"
                      title="Follow KWEST on Facebook"
                      aria-label="Facebook Page"
                    >
                      <Facebook className="w-3.5 h-3.5 text-blue-400" />
                      <span>Facebook</span>
                    </a>

                    <a
                      id="footer-tiktok-link"
                      href="https://www.tiktok.com/@kwestdirectory"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-slate-700/50 text-stone-200 hover:text-white transition border border-white/10 text-xs"
                      title="Follow @kwestdirectory on TikTok"
                      aria-label="TikTok Account"
                    >
                      <Video className="w-3.5 h-3.5 text-rose-400" />
                      <span>TikTok</span>
                    </a>

                    <a
                      id="footer-instagram-link"
                      href="https://www.instagram.com/kwestdirectory?utm_source=qr&igsi=NXlsa21pc2R4MWRq"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-pink-600/30 text-stone-200 hover:text-white transition border border-white/10 text-xs"
                      title="Follow @kwestdirectory on Instagram"
                      aria-label="Instagram Profile"
                    >
                      <Instagram className="w-3.5 h-3.5 text-pink-400" />
                      <span>Instagram</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
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
