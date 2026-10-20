import React from 'react';
import { Users, Phone, MessageSquare, Camera, Sparkles, CheckCircle, ShieldCheck, Heart } from 'lucide-react';
import { Business, CollectiveMember } from '../../types';
import { formatKenyanPhoneForTel, getWhatsAppChatUrl, formatPhoneForDisplay } from '../../lib/phoneUtils';

interface CollectiveMembersSectionProps {
  business: Business;
  isMerchantUnlocked?: boolean;
  onEditClick?: () => void;
}

export const CollectiveMembersSection: React.FC<CollectiveMembersSectionProps> = ({
  business,
  isMerchantUnlocked = false,
  onEditClick,
}) => {
  if (!business.collectiveMembers || business.collectiveMembers.length === 0) {
    return null;
  }

  const members = business.collectiveMembers;

  return (
    <div
      id="collective-members-section"
      className="bg-white rounded-2xl p-5 sm:p-6 md:p-7 border border-emerald-500/30 shadow-md mb-6 relative overflow-hidden"
    >
      {/* Decorative background accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Users className="w-5 h-5" />
            </span>
            <h3 className="font-extrabold text-stone-900 text-lg sm:text-xl tracking-tight">
              The 5-Member Equal Women's Collective
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-stone-600">
            Equal partners based under the Fig Tree on Karura Road • Hire and contact any member directly
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>5 Vetted Ladies</span>
          </span>
          {isMerchantUnlocked && onEditClick && (
            <button
              onClick={onEditClick}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition cursor-pointer shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Update Mugshots & Contacts</span>
            </button>
          )}
        </div>
      </div>

      {/* Equal Collective Context Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/80 via-emerald-50/40 to-stone-50 border border-emerald-200/80 mb-6 text-xs sm:text-sm text-stone-700 leading-relaxed">
        <div className="flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-stone-900 mb-1">
              Community Equal Collective — No Middlemen or Agency Cuts
            </p>
            <p className="text-stone-600 text-xs sm:text-sm">
              The 5 hardworking women assemble together daily under the <strong>Fig Tree at the junction of Church Avenue & Karura Road</strong> (opposite Green Cottage School). Rather than an employer-employee hierarchy, every lady is an equal, independent member. <strong>Purity Mugambi</strong> coordinated the directory listing on behalf of all five, and residents are warmly invited to call or WhatsApp any member directly according to your specific chore or schedule.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of the 5 Members with Mugshots and Direct Contacts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member: CollectiveMember, index: number) => {
          const telHref = formatKenyanPhoneForTel(member.phone);
          const waHref = getWhatsAppChatUrl(
            member.whatsapp || member.phone,
            `Hello ${member.name}, I found your profile on the Kahawa West Directory (Karura Women's Cleaning Collective). I would like to book cleaning / laundry services.`
          );

          // Generate initials for avatar fallback
          const initials = member.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

          // Color accents for the 5 ladies
          const avatarColors = [
            'from-rose-500 to-amber-500 text-white',
            'from-emerald-500 to-teal-600 text-white',
            'from-blue-500 to-indigo-600 text-white',
            'from-purple-500 to-pink-600 text-white',
            'from-amber-500 to-orange-600 text-white',
          ];
          const colorClass = avatarColors[index % avatarColors.length];

          return (
            <div
              key={member.id || `member-${index}`}
              className="p-4 rounded-2xl bg-stone-50/90 border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition duration-200 flex flex-col justify-between shadow-xs group"
            >
              <div>
                {/* Member Top: Mugshot & Identity */}
                <div className="flex items-center gap-3 mb-3">
                  {/* Mugshot Image or High-Quality Placeholder */}
                  <div className="relative shrink-0">
                    {member.photoUrl && member.photoUrl.trim() !== '' ? (
                      <img
                        src={member.photoUrl}
                        alt={`Mugshot of ${member.name}`}
                        className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                      />
                    ) : (
                      <div
                        className={`w-14 h-14 rounded-full bg-gradient-to-br ${colorClass} flex flex-col items-center justify-center font-extrabold text-base shadow-sm border-2 border-white relative`}
                        title={`Mugshot placeholder for ${member.name}`}
                      >
                        <span>{initials}</span>
                        <div
                          className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-xs border border-stone-200 text-stone-500"
                          title="Photo placeholder"
                        >
                          <Camera className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    )}
                    <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-stone-900 text-sm sm:text-base leading-snug truncate">
                      {member.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-stone-200 text-stone-800 text-[10px] font-bold uppercase tracking-wider">
                        {member.isRepresentative ? 'Listing Coordinator & Member' : 'Collective Member'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Member Specialty */}
                {member.specialty && (
                  <div className="mb-4">
                    <div className="flex items-start gap-1.5 text-xs text-stone-700 bg-white p-2.5 rounded-xl border border-stone-200/70">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium leading-snug">{member.specialty}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Direct Call & WhatsApp */}
              <div className="pt-2 border-t border-stone-200/80 flex items-center gap-2">
                <a
                  href={telHref}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition active:scale-95 shadow-xs"
                  title={`Call ${member.name} directly`}
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call {formatPhoneForDisplay(member.phone)}</span>
                </a>

                {member.whatsapp && (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-95 shadow-xs flex items-center justify-center"
                    title={`WhatsApp chat with ${member.name}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Note */}
      <div className="mt-5 pt-3 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-500 gap-2">
        <div className="flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>Supporting local women entrepreneurs in Kahawa West</span>
        </div>
        <span>Meeting Point: Church Ave & Karura Rd Junction (Under the Fig Tree)</span>
      </div>
    </div>
  );
};
