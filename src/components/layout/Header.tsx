import React from 'react';
import { PlusCircle, PhoneCall, Info, Megaphone, Users, Bell, TrendingUp } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

interface HeaderProps {
  onListBusinessClick: () => void;
  onAboutClick: () => void;
  onNoticeboardClick: () => void;
  onEmergencyClick: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onListBusinessClick,
  onAboutClick,
  onNoticeboardClick,
  onEmergencyClick,
  onOpenNotifications,
  unreadNotificationsCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#630303]/95 text-white backdrop-blur-md border-b border-[#4A0202] shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-3">
        {/* Brand Logo & Domain */}
        <div
          className="flex items-center cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <BrandLogo size="md" showText={true} theme="dark" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs lg:text-sm font-sans font-semibold text-stone-200">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-3 py-2 rounded-xl hover:text-white hover:bg-[#4D0202] transition"
          >
            All Businesses
          </button>
          <button
            onClick={onNoticeboardClick}
            className="px-3 py-2 rounded-xl hover:text-white hover:bg-[#4D0202] transition flex items-center gap-1.5 text-emerald-300"
          >
            <Users className="w-4 h-4" />
            <span>Community</span>
          </button>
          <button
            onClick={onEmergencyClick}
            className="px-3 py-2 rounded-xl hover:text-white hover:bg-[#4D0202] transition flex items-center gap-1.5 text-sky-300"
          >
            <PhoneCall className="w-4 h-4" />
            Emergency
          </button>
          <button
            onClick={onAboutClick}
            className="px-3 py-2 rounded-xl hover:text-white hover:bg-[#4D0202] transition flex items-center gap-1.5 text-stone-300"
          >
            <Info className="w-4 h-4" />
            About KWEST
          </button>
          <button
            onClick={onListBusinessClick}
            className="px-3 py-2 rounded-xl hover:text-white hover:bg-[#4D0202] text-emerald-300 hover:text-emerald-200 transition flex items-center gap-1.5 font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ List Business</span>
          </button>
        </nav>

        {/* Header Action / Notification Area */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          {onOpenNotifications && (
            <button
              id="header-notification-btn"
              onClick={onOpenNotifications}
              className="p-2.5 rounded-xl bg-[#4D0202] hover:bg-[#3D0101] text-stone-200 hover:text-white transition relative active:scale-95 border border-[#630303]"
              title="View community notices & power alerts"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#25D366] text-slate-950 font-black text-[10px] flex items-center justify-center shadow-xs animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

