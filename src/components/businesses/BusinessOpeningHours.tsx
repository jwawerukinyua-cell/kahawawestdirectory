import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { OpeningHours } from '../../types';

interface BusinessOpeningHoursProps {
  openingHours: OpeningHours;
}

export const BusinessOpeningHours: React.FC<BusinessOpeningHoursProps> = ({ openingHours }) => {
  const days: (keyof OpeningHours)[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  // Get current day name in lowercase
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[new Date().getDay()] as keyof OpeningHours;

  const todaySchedule = openingHours ? openingHours[todayName] : null;
  const is24Hours = todaySchedule?.open === '00:00' && todaySchedule?.close === '23:59';
  const isClosedToday = todaySchedule?.isClosed;

  return (
    <div id="business-hours-section" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-lg">Opening Hours</h3>
        </div>
        {is24Hours ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> 24/7 Open
          </span>
        ) : isClosedToday ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5" /> Closed Today
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Open Today ({todaySchedule?.open} - {todaySchedule?.close})
          </span>
        )}
      </div>

      <div className="divide-y divide-slate-100 text-sm">
        {days.map((day) => {
          const schedule = openingHours ? openingHours[day] : null;
          const isToday = day === todayName;
          const formattedDay = day.charAt(0).toUpperCase() + day.slice(1);

          return (
            <div
              key={day}
              className={`flex items-center justify-between py-2.5 px-2 rounded-lg transition ${
                isToday ? 'bg-emerald-50/80 font-bold text-emerald-950' : 'text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{formattedDay}</span>
                {isToday && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                    Today
                  </span>
                )}
              </div>

              <div>
                {!schedule || schedule.isClosed ? (
                  <span className="text-slate-400 font-medium">Closed</span>
                ) : schedule.open === '00:00' && schedule.close === '23:59' ? (
                  <span className="text-emerald-600 font-semibold">24 Hours</span>
                ) : (
                  <span className="font-medium text-slate-800">
                    {schedule.open} – {schedule.close}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
