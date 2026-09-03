import React from 'react';
import { Search, MapPin, PlusCircle, Users, PhoneCall } from 'lucide-react';

interface MobileBottomNavProps {
  onSearchClick: () => void;
  onZonesClick: () => void;
  onListBusinessClick: () => void;
  onNoticeboardClick: () => void;
  onEmergencyClick: () => void;
  activeSection?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onSearchClick,
  onZonesClick,
  onListBusinessClick,
  onNoticeboardClick,
  onEmergencyClick,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#4A0202]/95 backdrop-blur-lg border-t border-[#630303] px-2 py-1.5 safe-area-pb shadow-2xl">
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
        {/* 1. All Businesses / Search */}
        <button
          id="mobile-nav-explore"
          onClick={onSearchClick}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-stone-200 hover:text-emerald-300 active:scale-95 transition"
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[8.5px] font-bold uppercase tracking-wider">ALL SHOPS</span>
        </button>

        {/* 2. Estates & Zones */}
        <button
          id="mobile-nav-zones"
          onClick={onZonesClick}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-stone-200 hover:text-emerald-300 active:scale-95 transition"
        >
          <MapPin className="w-5 h-5 mb-0.5 text-emerald-300" />
          <span className="text-[9px] font-bold uppercase tracking-wider">ESTATES</span>
        </button>

        {/* 3. List Business (Center Prominent Button in Coffee Green) */}
        <button
          id="mobile-nav-list-business"
          onClick={onListBusinessClick}
          className="flex flex-col items-center justify-center -mt-3.5"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-950/60 border-2 border-[#4A0202] active:scale-90 transition">
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[8.5px] font-extrabold text-emerald-300 uppercase tracking-wider mt-0.5 whitespace-nowrap">LIST YOUR BIZ</span>
        </button>

        {/* 4. Community Hub */}
        <button
          id="mobile-nav-noticeboard"
          onClick={onNoticeboardClick}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-stone-200 hover:text-sky-300 active:scale-95 transition"
        >
          <Users className="w-5 h-5 mb-0.5 text-sky-300" />
          <span className="text-[9px] font-bold uppercase tracking-wider">COMMUNITY</span>
        </button>

        {/* 5. Emergency */}
        <button
          id="mobile-nav-emergency"
          onClick={onEmergencyClick}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-stone-200 hover:text-red-300 active:scale-95 transition"
        >
          <PhoneCall className="w-5 h-5 mb-0.5 text-rose-400" />
          <span className="text-[9px] font-bold uppercase tracking-wider">HOTLINES</span>
        </button>
      </div>
    </div>
  );
};
