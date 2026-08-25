import React from 'react';
import { Info, CheckCircle, Award } from 'lucide-react';
import { Business } from '../../types';

interface BusinessAboutProps {
  business: Business;
}

export const BusinessAbout: React.FC<BusinessAboutProps> = ({ business }) => {
  return (
    <div id="business-about-section" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-emerald-600" />
        <h3 className="font-bold text-slate-900 text-lg">About this Business</h3>
      </div>

      <p className="text-slate-700 text-base leading-relaxed mb-6 whitespace-pre-line">
        {business.description}
      </p>

      {/* Services List */}
      {business.services && business.services.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-slate-900 text-sm mb-3 uppercase tracking-wider text-xs text-slate-500">
            Services & Specializations
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {business.services.map((svc, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{svc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Highlights & Features */}
      {business.features && business.features.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-900 text-sm mb-3 uppercase tracking-wider text-xs text-slate-500">
            Estate Highlights & Amenities
          </h4>
          <div className="flex flex-wrap gap-2">
            {business.features.map((feat, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-semibold"
              >
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                {feat}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
