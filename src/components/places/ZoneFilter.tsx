import React from 'react';
import { MapPin } from 'lucide-react';
import { EstateZone } from '../../types';
import { HorizontalScrollContainer } from '../ui/HorizontalScrollContainer';

interface ZoneFilterProps {
  selectedZone: string;
  onSelectZone: (zone: string) => void;
  zoneCounts?: Record<string, number>;
}

export const ZONES: { id: string; name: string }[] = [
  { id: 'all', name: 'All Kahawa West' },
  { id: 'Congo', name: 'Congo' },
  { id: 'Roundabout', name: 'Roundabout' },
  { id: 'Jacaranda Estate', name: 'Jacaranda' },
  { id: 'Jubilee Estate', name: 'Jubilee Estate' },
  { id: 'Northern Bypass', name: 'Northern Bypass' },
  { id: 'Kware / Quarry', name: 'Kware / Quarry' },
  { id: 'Bima Road', name: 'Bima Road' },
  { id: 'Soweto', name: 'Soweto' },
  { id: 'Kamae', name: 'Kamae' },
  { id: 'Station / Railway', name: 'Station / Railway' },
  { id: 'Mahiga', name: 'Mahiga' },
  { id: 'Kamiti Road', name: 'Kamiti Road' },
  { id: 'Kiamumbi Border', name: 'Kiamumbi Border' },
];

export const ZoneFilter: React.FC<ZoneFilterProps> = ({
  selectedZone,
  onSelectZone,
  zoneCounts = {},
}) => {
  return (
    <HorizontalScrollContainer
      id="zone-filter-scroll"
      className="mt-1 font-sans"
      step={240}
      leftPrefix={
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 flex-shrink-0 mr-1 select-none">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Zones:
        </span>
      }
    >
      {ZONES.map((z) => {
        const isSelected = selectedZone === z.id;
        const count = z.id === 'all' ? undefined : zoneCounts[z.id];

        return (
          <button
            key={z.id}
            onClick={() => onSelectZone(z.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{z.name}</span>
            {count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </HorizontalScrollContainer>
  );
};
