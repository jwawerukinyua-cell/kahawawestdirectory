import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { OpeningHours } from '../../types';
import { DEFAULT_OPENING_HOURS } from '../../data/defaultOpeningHours';

interface BusinessOpeningHoursProps {
  openingHours?: OpeningHours;
  hours?: OpeningHours;
}

export const BusinessOpeningHours: React.FC<BusinessOpeningHoursProps> = ({ openingHours, hours }) => {
  const effectiveHours = openingHours || hours || DEFAULT_OPENING_HOURS;
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

  const todaySchedule: any = effectiveHours ? effectiveHours[todayName] : null;
  const is24Hours =
    (todaySchedule?.open === '00:00' && todaySchedule?.close === '23:59') ||
    (todaySchedule?.open === '24 Hours') ||
    (typeof todaySchedule === 'string' && todaySchedule.toLowerCase().includes('24'));
  const isClosedToday = todaySchedule?.isClosed || (typeof todaySchedule === 'string' && todaySchedule.toLowerCase().includes('closed'));

  const hasHoursTimes = Boolean(todaySchedule?.open && todaySchedule?.close);

  return (
    <div id="business-hours-section" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mb-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <h3 className="font-bold text-slate-900 text-lg truncate">Opening Hours</h3>
        </div>
        {is24Hours ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap flex-shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> 24/7 Open
          </span>
        ) : isClosedToday ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 whitespace-nowrap flex-shrink-0">
            <XCircle className="w-3.5 h-3.5" /> Closed Today
          </span>
        ) : hasHoursTimes ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap flex-shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> Open Today ({todaySchedule?.open} – {todaySchedule?.close})
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap flex-shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> Open Today
          </span>
        )}
      </div>

      <div className="divide-y divide-slate-100 text-sm">
        {days.map((day) => {
          const schedule = effectiveHours ? effectiveHours[day] : null;
          const isToday = day === todayName;
          const formattedDay = day ? day.charAt(0).toUpperCase() + day.slice(1) : '';

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
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-600 text-white whitespace-nowrap">
                    Today
                  </span>
                )}
              </div>

              <div>
                {!schedule || (typeof schedule === 'object' && (schedule as any).isClosed) || (typeof schedule === 'string' && String(schedule).toLowerCase().includes('closed')) ? (
                  <span className="text-slate-400 font-medium">Closed</span>
                ) : (typeof schedule === 'string') ? (
                  <span className="font-medium text-slate-800">{String(schedule)}</span>
                ) : (schedule.open === '00:00' && schedule.close === '23:59') || schedule.open === '24 Hours' ? (
                  <span className="text-emerald-600 font-semibold">24 Hours</span>
                ) : schedule.open && schedule.close ? (
                  <span className="font-medium text-slate-800">
                    {schedule.open} – {schedule.close}
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium">Open</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
