import React from 'react';
import { 
  X, 
  PhoneCall, 
  ShieldAlert, 
  HeartPulse, 
  Flame, 
  Droplet, 
  Zap, 
  MapPin, 
  Clock 
} from 'lucide-react';
import { EMERGENCY_CONTACTS } from '../data/mockData';
import { formatKenyanPhoneForTel } from '../lib/phoneUtils';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const getEmergencyIcon = (category: string) => {
    if (category.includes('Police') || category.includes('Security')) {
      return <ShieldAlert className="w-5 h-5 text-red-600" />;
    }
    if (category.includes('Hospital') || category.includes('Ambulance')) {
      return <HeartPulse className="w-5 h-5 text-rose-600" />;
    }
    if (category.includes('Fire')) {
      return <Flame className="w-5 h-5 text-orange-600" />;
    }
    if (category.includes('Water')) {
      return <Droplet className="w-5 h-5 text-blue-600" />;
    }
    return <Zap className="w-5 h-5 text-amber-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div 
        id="emergency-modal-dialog"
        className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-red-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-800 to-stone-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-red-700 flex items-center justify-center font-bold shadow-md">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold">Kahawa West Emergency Hotlines</h3>
              <p className="text-xs text-red-100">Police, Ambulance, Fire & Utility breakdown responders</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-red-900/60 hover:bg-red-900 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">In immediate life danger or serious crime?</p>
              <p>Dial <span className="font-bold">999</span> or <span className="font-bold">112</span> for National Police Control, or contact the local station below.</p>
            </div>
          </div>

          {EMERGENCY_CONTACTS.map((item, index) => (
            <div
              key={index}
              className="bg-stone-50 border border-stone-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-red-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-2xs shrink-0">
                  {getEmergencyIcon(item.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm sm:text-base text-stone-900">{item.name}</h4>
                    <span className="bg-stone-200 text-stone-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      {item.available}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 font-medium">{item.category}</p>
                  <p className="text-xs text-stone-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>{item.location}</span>
                  </p>
                </div>
              </div>

              {/* Call Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <a
                  href={`tel:${formatKenyanPhoneForTel(item.phone)}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call: {item.phone}</span>
                </a>
                {item.altPhone && (
                  <a
                    href={`tel:${formatKenyanPhoneForTel(item.altPhone)}`}
                    className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold text-xs rounded-xl transition-colors"
                    title="Alternative line"
                  >
                    Alt: {item.altPhone}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 flex items-center justify-between text-xs text-stone-500">
          <span>Official emergency contacts for Kahawa West & Kasarani</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
