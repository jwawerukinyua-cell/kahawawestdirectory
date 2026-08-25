import React from 'react';
import { ThumbsUp, Star, Wrench, ThumbsDown } from 'lucide-react';

export type ExperienceRating = 'Better' | 'Good' | 'Improve' | 'Bad';

interface ExperienceSelectorProps {
  selected: ExperienceRating;
  onChange: (val: ExperienceRating) => void;
}

export const ExperienceSelector: React.FC<ExperienceSelectorProps> = ({ selected, onChange }) => {
  const options: {
    label: ExperienceRating;
    title: string;
    sub: string;
    icon: React.ReactNode;
    activeClass: string;
    borderHover: string;
  }[] = [
    {
      label: 'Better',
      title: 'Better',
      sub: '5★ Superb',
      icon: <Star className="w-5 h-5 fill-amber-400 text-amber-500" />,
      activeClass: 'border-amber-500 bg-amber-500/10 text-amber-900 shadow-sm ring-2 ring-amber-500/20',
      borderHover: 'hover:border-amber-400 hover:bg-amber-50',
    },
    {
      label: 'Good',
      title: 'Good',
      sub: '4★ Satisfied',
      icon: <ThumbsUp className="w-5 h-5 text-emerald-600" />,
      activeClass: 'border-emerald-600 bg-emerald-600/10 text-emerald-950 shadow-sm ring-2 ring-emerald-600/20',
      borderHover: 'hover:border-emerald-500 hover:bg-emerald-50',
    },
    {
      label: 'Improve',
      title: 'Improve',
      sub: '2★ Needs Work',
      icon: <Wrench className="w-5 h-5 text-orange-600" />,
      activeClass: 'border-orange-600 bg-orange-600/10 text-orange-950 shadow-sm ring-2 ring-orange-600/20',
      borderHover: 'hover:border-orange-500 hover:bg-orange-50',
    },
    {
      label: 'Bad',
      title: 'Bad',
      sub: '1★ Poor',
      icon: <ThumbsDown className="w-5 h-5 text-rose-600" />,
      activeClass: 'border-rose-600 bg-rose-600/10 text-rose-950 shadow-sm ring-2 ring-rose-600/20',
      borderHover: 'hover:border-rose-500 hover:bg-rose-50',
    },
  ];

  return (
    <div>
      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
        How was your experience with this business?
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {options.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => onChange(opt.label)}
            className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 active:scale-95 ${
              selected === opt.label
                ? `${opt.activeClass} font-bold`
                : `border-stone-200 text-stone-700 bg-white ${opt.borderHover}`
            }`}
          >
            <div className="p-1.5 rounded-xl bg-stone-100/80 mb-0.5">{opt.icon}</div>
            <span className="text-sm font-bold">{opt.title}</span>
            <span className="text-[10px] text-stone-500 font-medium">{opt.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

