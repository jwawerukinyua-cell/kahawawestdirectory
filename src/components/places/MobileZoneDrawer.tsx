import React from 'react';
import { X, MapPin, Check } from 'lucide-react';

interface MobileZoneDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedZone: string;
  onSelectZone: (zone: string) => void;
  zoneCounts?: Record<string, number>;
}

const ZONES_LIST: { name: string; description: string }[] = [
  { name: 'All Zones', description: 'Browse all businesses across Kahawa West' },
  { name: 'Congo', description: 'Busiest commercial hub, main stage, markets & electronics' },
  { name: 'Roundabout', description: 'Central intersection, Super Metro, mini-marts & chemists' },
  { name: 'Jacaranda Estate', description: 'Residential apartments, quiet lanes, groceries & daycare' },
  { name: 'Jubilee Estate', description: 'Gated residential courts, modern maisonettes & family stores' },
  { name: 'Northern Bypass', description: 'Highway corridor, bypass lounges, hardware & distribution' },
  { name: 'Kware / Quarry', description: 'Quarry artisan area, fabrication, stone works & local shops' },
  { name: 'Bima Road', description: 'Hardware stores, auto garages, bakeries & lounges' },
  { name: 'Soweto', description: 'Local kibandas, artisan fundis, welding & fresh produce' },
  { name: 'Kamae', description: 'Timber yards, construction materials & residential zones' },
  { name: 'Station / Railway', description: 'Railway line access, bodaboda hub & cyber cafes' },
  { name: 'Mahiga', description: 'Modern apartment blocks, car wash bays & clinics' },
  { name: 'Kamiti Road', description: 'Main arterial highway, petrol stations & Sacco offices' },
  { name: 'Kiamumbi Border', description: 'Serene outskirts, agrovet supplies & family dining' },
];

export const MobileZoneDrawer: React.FC<MobileZoneDrawerProps> = ({
  isOpen,
  onClose,
  selectedZone,
  onSelectZone,
  zoneCounts = {},
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet Content */}
      <div className="relative w-full max-w-lg bg-[#3B0202] text-white rounded-t-3xl sm:rounded-3xl border border-[#630303] shadow-2xl max-h-[85vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-200">
        {/* Handle for drag indicator on mobile */}
        <div className="w-12 h-1.5 bg-[#630303] rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#4D0202]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-900/60 text-emerald-300 flex items-center justify-center border border-emerald-600/40">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Select Estate Zone</h3>
              <p className="text-xs text-stone-300">Filter businesses by neighborhood</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#4D0202] text-stone-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zones List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-[#4D0202]">
          {ZONES_LIST.map((zone) => {
            const isSelected =
              (zone.name === 'All Zones' && selectedZone === 'all') || selectedZone === zone.name;
            const count =
              zone.name === 'All Zones'
                ? Object.values(zoneCounts).reduce((a: number, b: number) => a + b, 0)
                : zoneCounts[zone.name] || 0;

            return (
              <button
                key={zone.name}
                type="button"
                onClick={() => {
                  onSelectZone(zone.name === 'All Zones' ? 'all' : zone.name);
                  onClose();
                }}
                className={`w-full pt-3 pb-3 px-3 rounded-2xl text-left flex items-center justify-between transition ${
                  isSelected
                    ? 'bg-emerald-950/60 border border-emerald-600/40 text-emerald-200'
                    : 'hover:bg-[#4D0202] text-stone-200'
                }`}
              >
                <div className="pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-white">{zone.name}</span>
                    {count > 0 && (
                      <span className="text-[11px] px-2 py-0.2 rounded-full bg-[#630303] text-stone-200">
                        {count} {count === 1 ? 'place' : 'places'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-300 mt-0.5">{zone.description}</p>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
