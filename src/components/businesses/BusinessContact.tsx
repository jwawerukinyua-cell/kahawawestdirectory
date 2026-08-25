import React, { useState } from 'react';
import { Phone, MessageSquare, MapPin, Mail, Globe, Copy, Check, ExternalLink } from 'lucide-react';
import { Business } from '../../types';

interface BusinessContactProps {
  business: Business;
}

export const BusinessContact: React.FC<BusinessContactProps> = ({ business }) => {
  const [copiedMpesa, setCopiedMpesa] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopy = (text: string, type: 'mpesa' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'mpesa') {
      setCopiedMpesa(true);
      setTimeout(() => setCopiedMpesa(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const whatsappUrl = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
    `Hello ${business.name}, I am contacting you from KWEST Directory (kwestdirectory.co.ke).`
  )}`;

  return (
    <div id="business-contact-section" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mb-6">
      <h3 className="font-bold text-slate-900 text-lg mb-4">Contact & Location</h3>

      {/* Location Details */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 mb-4">
        <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-0.5">
            Estate Location ({business.zone})
          </h4>
          <p className="text-sm font-semibold text-slate-800">{business.landmark}</p>
          {business.addressDetails && (
            <p className="text-xs text-slate-500 mt-0.5">{business.addressDetails}</p>
          )}
        </div>
      </div>

      {/* Direct Phone & WhatsApp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Phone Call</span>
              <a href={`tel:${business.phone}`} className="text-sm font-bold text-slate-800 hover:text-emerald-600 transition">
                {business.phone}
              </a>
            </div>
          </div>
          <button
            onClick={() => handleCopy(business.phone, 'phone')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            title="Copy phone"
          >
            {copiedPhone ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-green-50/60 border border-green-200/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#25D366] text-white flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-green-700 font-medium block">WhatsApp Chat</span>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-green-950 hover:underline flex items-center gap-1"
              >
                Send Message <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Lipa na M-Pesa Details */}
      {business.mpesa && (
        <div id="mpesa-payment-box" className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white uppercase">
                Lipa na M-Pesa
              </span>
              <span className="text-xs font-bold text-emerald-900">{business.mpesa.type}</span>
            </div>
            <button
              onClick={() => handleCopy(business.mpesa?.number || '', 'mpesa')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs transition"
            >
              {copiedMpesa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedMpesa ? 'Copied!' : 'Copy Number'}
            </button>
          </div>

          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-emerald-950 tracking-wider">
              {business.mpesa.number}
            </span>
            {business.mpesa.accountNumber && (
              <span className="text-xs text-emerald-800 font-medium">
                (Acc: <span className="font-mono font-bold">{business.mpesa.accountNumber}</span>)
              </span>
            )}
          </div>
          {business.mpesa.accountName && (
            <p className="text-xs text-emerald-800 mt-1 font-medium">
              Account Name: <span className="font-bold">{business.mpesa.accountName}</span>
            </p>
          )}
        </div>
      )}

      {/* Email & Social Links */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {business.email && (
          <a
            href={`mailto:${business.email}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition"
          >
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            {business.email}
          </a>
        )}

        {business.socialLinks?.website && (
          <a
            href={business.socialLinks.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            Website
          </a>
        )}

        {business.socialLinks?.facebook && (
          <a
            href={business.socialLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-medium text-blue-700 transition"
          >
            Facebook Page
          </a>
        )}

        {business.socialLinks?.instagram && (
          <a
            href={business.socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-xs font-medium text-pink-700 transition"
          >
            Instagram
          </a>
        )}

        {business.socialLinks?.tiktok && (
          <a
            href={business.socialLinks.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium text-white transition"
          >
            TikTok
          </a>
        )}
      </div>
    </div>
  );
};
