import React, { useState } from 'react';
import { Phone, MessageSquare, MapPin, Mail, Globe, Copy, Check, ExternalLink, Lock, Building2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { Business } from '../../types';
import { trackBusinessInteraction } from '../../lib/tracking';
import { formatKenyanPhoneForTel, getWhatsAppChatUrl, formatPhoneForDisplay } from '../../lib/phoneUtils';
import { isBusinessContactGated, HOUSING_CONTACT_UNLOCK_FEE, maskPhoneNumber, unlockBusinessContact } from '../../lib/contactGating';

interface BusinessContactProps {
  business: Business;
  onUnlockContactClick?: () => void;
}

export const BusinessContact: React.FC<BusinessContactProps> = ({ business, onUnlockContactClick }) => {
  const isGated = isBusinessContactGated(business);
  const [copiedMpesa, setCopiedMpesa] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [mpesaCode, setMpesaCode] = useState('');
  const [unlockSuccess, setUnlockSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = (text: string, type: 'mpesa' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'mpesa') {
      setCopiedMpesa(true);
      setTimeout(() => setCopiedMpesa(false), 2000);
    } else {
      trackBusinessInteraction(business.id, 'phone');
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handlePhoneClick = () => {
    trackBusinessInteraction(business.id, 'phone');
  };

  const handleWhatsAppClick = () => {
    trackBusinessInteraction(business.id, 'whatsapp');
  };

  const handleDirectUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!mpesaCode || mpesaCode.trim().length < 5) {
      setErrorMessage('Please enter an M-Pesa transaction code.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      unlockBusinessContact(business.id, mpesaCode.trim());
      setIsSubmitting(false);
      setUnlockSuccess(true);
      setTimeout(() => setUnlockSuccess(false), 3000);
    }, 600);
  };

  const handleDemoUnlock = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      unlockBusinessContact(business.id, 'DEMO-500-QUICK');
      setIsSubmitting(false);
      setUnlockSuccess(true);
      setTimeout(() => setUnlockSuccess(false), 3000);
    }, 400);
  };

  const whatsappUrl = getWhatsAppChatUrl(
    business.whatsapp || business.phone,
    `Hello ${business.name}, I am contacting you from KWEST Directory.`
  );

  const phoneTelUri = formatKenyanPhoneForTel(business.phone);
  const displayPhone = formatPhoneForDisplay(business.phone);
  const maskedPhone = maskPhoneNumber(business.phone);

  return (
    <div id="business-contact-section" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 text-lg">Contact & Location</h3>
        {isGated && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            <Lock className="w-3 h-3 text-amber-700" />
            Contacts Gated (KES {HOUSING_CONTACT_UNLOCK_FEE})
          </span>
        )}
      </div>

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

      {/* If Gated, Show Housing Contact Unlock Gating Box */}
      {isGated ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/50 border-2 border-amber-300/80 mb-4 space-y-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center flex-shrink-0 shadow-xs font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                <span>Housing & Caretaker Agency Hotline Gated</span>
                <span className="text-xs font-mono font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  KES {HOUSING_CONTACT_UNLOCK_FEE}
                </span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Housing agencies list for <strong>100% FREE</strong> on KWEST. To prevent brokerage spam and maintain authentic property listings, direct WhatsApp & phone lines require a standard <strong>KES {HOUSING_CONTACT_UNLOCK_FEE}</strong> contact activation.
              </p>
            </div>
          </div>

          {/* Masked Hotline Display */}
          <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                Agent Hotline
              </span>
              <strong className="text-sm font-mono font-bold text-stone-800">{maskedPhone}</strong>
            </div>
            <button
              type="button"
              onClick={onUnlockContactClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 text-stone-900" />
              <span>Unlock Contacts</span>
            </button>
          </div>

          {/* Inline M-Pesa Unlock form */}
          <form onSubmit={handleDirectUnlock} className="p-3.5 rounded-xl bg-white border border-emerald-300 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-950">Pay KES 500 to Till {business.mpesa?.number || '554019'}</span>
              <span className="text-[11px] text-stone-500">KWEST Real Estate Activation</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={mpesaCode}
                onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                placeholder="Enter M-Pesa Ref (e.g. SHG78291)"
                className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono uppercase bg-stone-50 text-stone-900 font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying...' : 'Unlock'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {errorMessage && <p className="text-[11px] text-rose-600 font-bold">{errorMessage}</p>}
            {unlockSuccess && <p className="text-[11px] text-emerald-700 font-bold">Contact hotline unlocked successfully!</p>}

            <div className="pt-1 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={handleDemoUnlock}
                className="text-emerald-800 hover:text-emerald-950 font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Instant Demo Unlock (Test Mode)</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Unlocked Direct Phone & WhatsApp */
        <div className="flex flex-col gap-3 mb-4">
          {/* Phone Call Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">Phone Call</span>
                <a
                  href={`tel:${phoneTelUri}`}
                  onClick={handlePhoneClick}
                  className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition block truncate"
                >
                  {displayPhone || business.phone}
                </a>
              </div>
            </div>
            <button
              onClick={() => handleCopy(business.phone, 'phone')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition flex-shrink-0 active:scale-95 cursor-pointer"
              title="Copy phone number"
            >
              {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* WhatsApp Chat Card */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] text-emerald-800 font-semibold uppercase tracking-wider block">WhatsApp Chat</span>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsAppClick}
                  className="text-sm font-bold text-emerald-950 hover:underline flex items-center gap-1 truncate"
                >
                  <span>Send Message</span>
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-emerald-700" />
                </a>
              </div>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex-shrink-0 active:scale-95 shadow-2xs"
            >
              Chat
            </a>
          </div>

          {/* Official Website Card (if available) */}
          {business.socialLinks?.website && (
            <div className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200/80 flex items-center justify-between gap-3 min-w-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] text-sky-800 font-semibold uppercase tracking-wider block">Official Website</span>
                  <a
                    href={business.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-sky-950 hover:underline flex items-center gap-1 truncate"
                  >
                    <span className="truncate">{business.socialLinks.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-sky-700" />
                  </a>
                </div>
              </div>
              <a
                href={business.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition flex-shrink-0 active:scale-95 shadow-2xs"
              >
                Visit
              </a>
            </div>
          )}
        </div>
      )}

      {/* Lipa na M-Pesa Details (if not already displayed in gating) */}
      {business.mpesa && !isGated && (
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
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs transition cursor-pointer"
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
            <FacebookIcon className="w-3.5 h-3.5 text-blue-700" />
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

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

