import React, { useState } from 'react';
import {
  Megaphone,
  MapPin,
  Calendar,
  Phone,
  PlusCircle,
  X,
  Clock,
  ShieldCheck,
  ChevronRight,
  Filter,
  FileText,
  AlertOctagon,
  Image as ImageIcon,
  User,
  ShieldAlert,
} from 'lucide-react';
import { CommunityUpdate, UpdateType } from '../../../types';

interface CommunityUpdatesProps {
  updates: CommunityUpdate[];
  onPostUpdateClick?: () => void;
}

export const CommunityUpdates: React.FC<CommunityUpdatesProps> = ({
  updates,
  onPostUpdateClick,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedUpdateForDetail, setSelectedUpdateForDetail] = useState<CommunityUpdate | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);

  // Only published updates
  const publishedUpdates = updates.filter((u) => u.status === 'published' || !u.status);

  const filteredUpdates = publishedUpdates.filter((u) => {
    if (selectedType === 'all') return true;
    return u.type === selectedType;
  });

  const getDotColor = (type: UpdateType | string) => {
    switch (type) {
      case 'alert':
        return 'bg-amber-500';
      case 'event':
        return 'bg-blue-500';
      case 'business':
      case 'public_notice':
        return 'bg-emerald-400';
      case 'community':
        return 'bg-rose-400';
      default:
        return 'bg-stone-400';
    }
  };

  const getBadgeText = (type: UpdateType | string) => {
    switch (type) {
      case 'alert':
        return 'ALERT';
      case 'event':
        return 'EVENT';
      case 'business':
      case 'public_notice':
        return 'PUBLIC NOTICE';
      case 'community':
        return 'COMMUNITY';
      default:
        return 'NOTICE';
    }
  };

  const getBadgeTextColor = (type: UpdateType | string) => {
    switch (type) {
      case 'alert':
        return 'text-amber-400';
      case 'event':
        return 'text-blue-400';
      case 'business':
      case 'public_notice':
        return 'text-emerald-400';
      case 'community':
        return 'text-rose-400';
      default:
        return 'text-stone-300';
    }
  };

  return (
    <div id="community-updates-section" className="font-sans">
      {/* 1. Centered Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 px-4">
        {/* Top Green Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-600/40 mb-4 shadow-sm backdrop-blur-md">
          <Megaphone className="w-3.5 h-3.5" />
          <span className="tracking-wide uppercase font-bold text-[11px]">COMMUNITY UPDATES</span>
        </div>

        {/* Main Title */}
        <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-stone-900 mb-3 sm:mb-4 leading-tight">
          Stay Connected With what&apos;s Happening
        </h2>

        {/* Subtitle */}
        <p className="text-stone-600 text-xs sm:text-base leading-relaxed max-w-2xl mx-auto">
          Verified announcements, emergency alerts (such as missing persons & utility notices), sports, and neighborhood civic updates—moderated with strict accountability.
        </p>
      </div>

      {/* 2. Sleek Dark Container */}
      <div className="max-w-4xl mx-auto bg-[#101317] text-white rounded-3xl p-5 sm:p-8 border border-[#222831] shadow-2xl">
        <div className="space-y-3 divide-y divide-[#1D222A]">
          {filteredUpdates.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => setSelectedUpdateForDetail(item)}
              className="pt-4 first:pt-0 group cursor-pointer hover:bg-[#161B22]/80 p-3.5 -mx-3.5 rounded-2xl transition duration-150 flex flex-col sm:flex-row items-start gap-4"
            >
              {/* Photo Thumbnail if available */}
              {item.imageUrl ? (
                <div className="relative w-full sm:w-20 sm:h-20 h-36 rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 shrink-0 shadow-sm">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {item.urgencyLevel === 'critical' && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-red-600/90 text-white text-[9px] font-black uppercase tracking-wider">
                      Urgent
                    </span>
                  )}
                </div>
              ) : null}

              {/* Update Details */}
              <div className="flex-1 min-w-0 space-y-1.5 w-full">
                {/* Category Dot & Badge Label */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getDotColor(item.type)}`} />
                  <span className={`text-[11px] font-black uppercase tracking-wider ${getBadgeTextColor(item.type)}`}>
                    {getBadgeText(item.type)}
                  </span>

                  {item.obNumber && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-stone-800 text-stone-300 border border-stone-700">
                      OB REF: {item.obNumber.split(' ')[0] || item.obNumber}
                    </span>
                  )}

                  {item.authorRole && (
                    <span className="text-[10px] text-stone-400 flex items-center gap-1">
                      • {item.authorRole}
                    </span>
                  )}
                </div>

                {/* Title & Location Row */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
                  <h3 className="font-display font-bold text-white text-base sm:text-lg group-hover:text-emerald-300 transition leading-snug">
                    {item.title}
                  </h3>

                  <span className="inline-flex items-center gap-1 text-xs text-stone-400 group-hover:text-stone-200 shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{item.location || item.zone || 'Kahawa West'}</span>
                  </span>
                </div>

                {/* Snippet */}
                <p className="text-xs text-stone-300/90 line-clamp-1 leading-relaxed">
                  {item.content}
                </p>

                {/* Time / Schedule info & Author */}
                <div className="text-xs text-stone-400 pt-0.5 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-sky-400" />
                    {item.timeInfo || item.date}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
                    View Details <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Bottom CTA Button */}
        <div className="mt-8 pt-6 border-t border-[#222831] flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setShowAllModal(true)}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#0D6E44] hover:bg-[#0B5C39] text-white font-bold text-sm shadow-md transition active:scale-95 text-center"
          >
            Explore All Community Updates
          </button>

          {onPostUpdateClick && (
            <button
              onClick={onPostUpdateClick}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1C222B] hover:bg-[#252C37] text-stone-200 hover:text-white font-bold text-sm border border-[#2E3744] transition active:scale-95 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Post a Notice / Alert</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Single Update Detail Modal */}
      {selectedUpdateForDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-sans animate-in fade-in">
          <div className="bg-[#121417] text-white rounded-3xl max-w-lg w-full border border-stone-800 shadow-2xl overflow-hidden my-6">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[#181B20] border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`w-2.5 h-2.5 rounded-full ${getDotColor(selectedUpdateForDetail.type)}`} />
                <span className={`text-xs font-black uppercase tracking-wider ${getBadgeTextColor(selectedUpdateForDetail.type)}`}>
                  {getBadgeText(selectedUpdateForDetail.type)}
                </span>
                <span className="text-xs text-stone-500">•</span>
                <span className="text-xs text-stone-400">{selectedUpdateForDetail.zone || 'Kahawa West'}</span>

                {selectedUpdateForDetail.isAccountabilityConfirmed && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/50">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Submitter
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedUpdateForDetail(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <h3 className="font-display font-black text-xl text-white leading-snug">
                {selectedUpdateForDetail.title}
              </h3>

              {/* Photo Display if present */}
              {selectedUpdateForDetail.imageUrl && (
                <div className="space-y-1.5">
                  <div className="rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 max-h-72 w-full flex items-center justify-center">
                    <img
                      src={selectedUpdateForDetail.imageUrl}
                      alt={selectedUpdateForDetail.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-auto max-h-72 object-contain bg-black/40"
                    />
                  </div>
                  {selectedUpdateForDetail.imageCaption && (
                    <p className="text-[11px] text-stone-400 italic text-center">
                      Photo: {selectedUpdateForDetail.imageCaption}
                    </p>
                  )}
                </div>
              )}

              {/* Time, Location & OB Ref */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-[#1A1E24] p-3 rounded-2xl border border-stone-800">
                <div className="flex items-center gap-2 text-stone-300">
                  <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{selectedUpdateForDetail.timeInfo || selectedUpdateForDetail.date}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-300">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{selectedUpdateForDetail.location || selectedUpdateForDetail.zone}</span>
                </div>
                {selectedUpdateForDetail.obNumber && (
                  <div className="col-span-1 sm:col-span-2 flex items-center gap-2 text-amber-300 bg-amber-950/30 p-2 rounded-xl border border-amber-800/40">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>Police Occurrence Book (OB): <strong>{selectedUpdateForDetail.obNumber}</strong></span>
                  </div>
                )}
              </div>

              <div className="text-stone-200 text-sm leading-relaxed whitespace-pre-line bg-[#16191E] p-3.5 rounded-2xl border border-stone-800/80">
                {selectedUpdateForDetail.content}
              </div>

              {/* Author / Accountability Source */}
              <div className="pt-3 border-t border-stone-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-stone-500">Submitted by</span>
                    <strong className="text-stone-200">{selectedUpdateForDetail.author}</strong>
                    {selectedUpdateForDetail.authorRole && (
                      <span className="text-stone-400 text-[11px] block">({selectedUpdateForDetail.authorRole})</span>
                    )}
                  </div>

                  {selectedUpdateForDetail.contact && (
                    <a
                      href={`tel:${selectedUpdateForDetail.contact}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {selectedUpdateForDetail.contact}</span>
                    </a>
                  )}
                </div>

                <p className="text-[10px] text-stone-500 text-center pt-2">
                  🛡️ This update has been verified in accordance with Kahawa West community anti-spam and integrity standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. "Explore All Community Updates" Full Filterable Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-sans animate-in fade-in">
          <div className="bg-[#101317] text-white rounded-3xl max-w-2xl w-full border border-stone-800 shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-[#161B22] border-b border-stone-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-600/50 flex items-center justify-center text-emerald-400">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg sm:text-xl text-white">
                    All Community Updates & Alerts
                  </h3>
                  <p className="text-xs text-stone-400">
                    Live announcements, emergency notices, utilities, sports & civic notices
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="p-4 bg-[#12161C] border-b border-stone-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              {[
                { id: 'all', label: 'All Updates' },
                { id: 'alert', label: '🚨 Alerts & Emergencies' },
                { id: 'event', label: '🔵 Events' },
                { id: 'business', label: '🟢 Public Notices' },
                { id: 'community', label: '💖 Welfare' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedType(pill.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedType === pill.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-[#1D222A] text-stone-300 hover:bg-[#252C37]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Updates list */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
              {filteredUpdates.length === 0 ? (
                <div className="py-12 text-center text-stone-500 text-sm">
                  No updates found for this category.
                </div>
              ) : (
                filteredUpdates.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedUpdateForDetail(item);
                    }}
                    className="p-4 rounded-2xl bg-[#161B22] border border-stone-800/80 hover:border-emerald-500/40 transition cursor-pointer flex flex-col sm:flex-row items-start gap-3.5"
                  >
                    {item.imageUrl && (
                      <div className="w-full sm:w-20 sm:h-20 h-32 rounded-xl overflow-hidden bg-stone-900 border border-stone-800 shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5 min-w-0 w-full">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${getDotColor(item.type)}`} />
                          <span className={`text-[11px] font-black uppercase tracking-wider ${getBadgeTextColor(item.type)}`}>
                            {getBadgeText(item.type)}
                          </span>
                          {item.obNumber && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-stone-800 text-stone-300 border border-stone-700">
                              OB REF
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          {item.location || item.zone}
                        </span>
                      </div>

                      <h4 className="font-display font-bold text-white text-base">
                        {item.title}
                      </h4>

                      <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                        {item.content}
                      </p>

                      <div className="pt-2 flex items-center justify-between text-xs text-stone-400 border-t border-stone-800/60">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-stone-500" />
                          {item.timeInfo || item.date}
                        </span>
                        <span className="text-emerald-400 font-bold flex items-center gap-0.5 text-xs">
                          Read full notice <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Modal Actions */}
            <div className="p-4 bg-[#161B22] border-t border-stone-800 flex items-center justify-between shrink-0">
              {onPostUpdateClick ? (
                <button
                  onClick={() => {
                    setShowAllModal(false);
                    onPostUpdateClick();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Post an Update</span>
                </button>
              ) : <div />}

              <button
                onClick={() => setShowAllModal(false)}
                className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

