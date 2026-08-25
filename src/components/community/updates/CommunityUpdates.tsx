import React from 'react';
import { Megaphone, Home, AlertTriangle, Award, MapPin, Calendar, Phone } from 'lucide-react';
import { CommunityUpdate } from '../../../types';

interface CommunityUpdatesProps {
  updates: CommunityUpdate[];
  onVacancyClick?: (update: CommunityUpdate) => void;
}

export const CommunityUpdates: React.FC<CommunityUpdatesProps> = ({ updates }) => {
  const getBadgeStyle = (type: CommunityUpdate['type']) => {
    switch (type) {
      case 'vacancy':
        return 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50';
      case 'alert':
      case 'notice':
        return 'bg-[#7C2D12]/40 text-stone-200 border-[#9A3412]/60';
      case 'spotlight':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-600/50';
      default:
        return 'bg-sky-950/50 text-sky-300 border-sky-600/40';
    }
  };

  const getIcon = (type: CommunityUpdate['type']) => {
    switch (type) {
      case 'vacancy':
        return <Home className="w-4 h-4 text-emerald-400" />;
      case 'alert':
      case 'notice':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'spotlight':
        return <Award className="w-4 h-4 text-emerald-400" />;
      default:
        return <Megaphone className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div id="community-updates-section" className="bg-[#22120C] text-white rounded-3xl p-5 md:p-8 shadow-xl border border-[#4A2518] font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-600/40 mb-2">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Kahawa West Noticeboard & Vacancies</span>
          </div>
          <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-white">
            Estate Updates & House Vacancies
          </h2>
        </div>
        <span className="text-xs text-stone-300">Live community notices</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {updates.map((up) => (
          <div
            key={up.id}
            className="bg-[#190C07] rounded-2xl p-4 sm:p-5 border border-[#3D1E14] hover:border-emerald-500/40 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getBadgeStyle(up.type)}`}>
                  {getIcon(up.type)}
                  {up.type === 'vacancy' ? 'House Vacancy' : up.type}
                </span>

                {up.zone && (
                  <span className="text-xs text-stone-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    {up.zone}
                  </span>
                )}
              </div>

              <h3 className="font-display font-bold text-white text-base mb-2 leading-snug">
                {up.title}
              </h3>

              <p className="text-stone-300 text-xs leading-relaxed mb-4">
                {up.content}
              </p>
            </div>

            <div className="pt-3 border-t border-[#381E15] flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1 text-stone-400">
                <Calendar className="w-3 h-3" />
                <span>{up.date}</span>
              </div>

              {up.contact && (
                <a
                  href={`tel:${up.contact}`}
                  className="inline-flex items-center gap-1 font-bold text-sky-400 hover:text-sky-300 bg-sky-950/40 px-2.5 py-1 rounded-lg border border-sky-600/30 active:scale-95 transition"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call {up.contact}</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
