import React from 'react';
import { PlusCircle, PhoneCall, Info, Megaphone } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

interface HeaderProps {
  onListBusinessClick: () => void;
  onAboutClick: () => void;
  onNoticeboardClick: () => void;
  onEmergencyClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onListBusinessClick,
  onAboutClick,
  onNoticeboardClick,
  onEmergencyClick,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#1D0C06]/95 text-white backdrop-blur-md border-b border-[#3D1A0E] shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-3">
        {/* Brand Logo & Domain */}
        <div
          className="flex items-center cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <BrandLogo size="md" showText={true} theme="dark" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 text-xs lg:text-sm font-sans font-semibold text-stone-200">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-[#34160C] transition"
          >
            All Businesses
          </button>
          <button
            onClick={onNoticeboardClick}
            className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-[#34160C] transition flex items-center gap-1.5 text-emerald-400"
          >
            <Megaphone className="w-4 h-4" />
            Community Spotlight
          </button>
          <button
            onClick={onEmergencyClick}
            className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-[#34160C] transition flex items-center gap-1.5 text-sky-400"
          >
            <PhoneCall className="w-4 h-4" />
            Emergency Contacts
          </button>
          <button
            onClick={onAboutClick}
            className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-[#34160C] transition flex items-center gap-1.5 text-stone-300"
          >
            <Info className="w-4 h-4" />
            About KWEST
          </button>
        </nav>

        {/* Header Action Button: Coffee Green CTA */}
        <div className="flex items-center gap-2">
          <button
            id="header-list-business-btn"
            onClick={onListBusinessClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-sans font-bold text-xs sm:text-sm shadow-md shadow-emerald-950/50 active:scale-95 transition border border-emerald-500/40"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">List Business</span>
            <span className="sm:hidden">List</span>
          </button>
        </div>
      </div>
    </header>
  );
};

