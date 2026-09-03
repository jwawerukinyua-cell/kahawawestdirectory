import React, { useState } from 'react';
import { X, Lock, Check, ShieldCheck, CreditCard, Building2, Phone, MessageSquare, ArrowRight, Sparkles, Copy } from 'lucide-react';
import { Business } from '../../types';
import { HOUSING_CONTACT_UNLOCK_FEE, unlockBusinessContact, maskPhoneNumber } from '../../lib/contactGating';
import { formatPhoneForDisplay } from '../../lib/phoneUtils';
import { copyToClipboard } from '../../lib/clipboard';

interface ContactUnlockModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onUnlocked?: (business: Business) => void;
}

export const ContactUnlockModal: React.FC<ContactUnlockModalProps> = ({
  business,
  isOpen,
  onClose,
  onUnlocked,
}) => {
  const [mpesaCode, setMpesaCode] = useState('');
  const [copiedTill, setCopiedTill] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unlockSuccess, setUnlockSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !business) return null;

  const tillNumber = business.mpesa?.number || '554019';
  const tillAccountName = business.mpesa?.accountName || 'KWEST HOUSING & DIRECTORY';

  const handleCopyTill = async () => {
    await copyToClipboard(tillNumber);
    setCopiedTill(true);
    setTimeout(() => setCopiedTill(false), 2000);
  };

  const handleVerifyUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!mpesaCode || mpesaCode.trim().length < 5) {
      setErrorMessage('Please enter a valid M-Pesa transaction code (e.g. SHG892K1XP).');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      unlockBusinessContact(business.id, mpesaCode.trim());
      setIsSubmitting(false);
      setUnlockSuccess(true);
      if (onUnlocked) {
        onUnlocked(business);
      }
      setTimeout(() => {
        setUnlockSuccess(false);
        onClose();
      }, 2000);
    }, 800);
  };

  const handleInstantUnlock = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      unlockBusinessContact(business.id, 'DEMO-INSTANT-500');
      setIsSubmitting(false);
      setUnlockSuccess(true);
      if (onUnlocked) {
        onUnlocked(business);
      }
      setTimeout(() => {
        setUnlockSuccess(false);
        onClose();
      }, 1500);
    }, 500);
  };

  return (
    <div
      id="contact-unlock-modal"
      className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 font-sans"
    >
      <div
        className="bg-[#FAF8F5] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-auto border border-emerald-800/30 text-slate-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#044E2E] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-emerald-900 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base leading-snug text-white">
                Housing & Property Agency Hotline
              </h3>
              <p className="text-[11px] text-emerald-200">
                Direct Contact Gated • KES {HOUSING_CONTACT_UNLOCK_FEE} Activation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-stone-200 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {unlockSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-100 border border-emerald-300 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-lg text-emerald-950">Hotline Successfully Unlocked!</h4>
              <p className="text-xs text-emerald-800">
                Direct WhatsApp and Phone calls for <strong>{business.name}</strong> are now fully active and visible across the directory.
              </p>
              <div className="pt-2 font-mono font-bold text-sm text-emerald-900 bg-white/60 py-2 rounded-xl border border-emerald-200">
                {formatPhoneForDisplay(business.phone)}
              </div>
            </div>
          ) : (
            <>
              {/* Business Summary Card */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {business.subCategory || 'Housing & Property Agency'}
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm mt-1">{business.name}</h4>
                    <p className="text-xs text-stone-500">{business.zone} • {business.landmark}</p>
                  </div>
                  <div className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-700" />
                    <span>Gated</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs font-mono text-stone-600">
                  <span>Masked Hotline:</span>
                  <strong className="text-stone-800 font-bold">{maskPhoneNumber(business.phone)}</strong>
                </div>
              </div>

              {/* Policy Explanation */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span>Housing & Rent Collecting Agency Policy</span>
                </div>
                <p className="text-[12px] text-stone-700 leading-relaxed">
                  Housing agencies and rent collection hubs list for <strong>100% FREE</strong> on KWEST. Because property brokerage and rental finder services operate on commercial commissions and rapid tenant turnarounds, direct WhatsApp and phone hotlines require a standard <strong>KES {HOUSING_CONTACT_UNLOCK_FEE}</strong> contact activation.
                </p>
              </div>

              {/* M-Pesa Payment Box */}
              <div className="p-4 rounded-2xl bg-white border-2 border-emerald-600 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-xs text-emerald-950 uppercase tracking-wide">
                      Lipa na M-Pesa Instructions
                    </span>
                  </div>
                  <span className="font-extrabold text-sm text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                    KES {HOUSING_CONTACT_UNLOCK_FEE}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Buy Goods Till / Paybill</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <strong className="text-sm font-mono font-bold text-stone-900">{tillNumber}</strong>
                      <button
                        type="button"
                        onClick={handleCopyTill}
                        className="text-[10px] text-emerald-800 font-bold hover:underline cursor-pointer"
                      >
                        {copiedTill ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Account Name</span>
                    <strong className="text-xs font-bold text-stone-900 block truncate mt-0.5">
                      {tillAccountName}
                    </strong>
                  </div>
                </div>

                {/* Form to enter M-Pesa Code */}
                <form onSubmit={handleVerifyUnlock} className="space-y-2 pt-1">
                  <label className="text-[11px] font-bold text-stone-700 block">
                    Enter M-Pesa Transaction Code to Unlock Instantly:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mpesaCode}
                      onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                      placeholder="e.g., SHG78291XP"
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-600 focus:outline-hidden bg-stone-50 text-stone-900 font-bold"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      {isSubmitting ? 'Verifying...' : 'Unlock'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {errorMessage && (
                    <p className="text-[11px] text-rose-600 font-semibold">{errorMessage}</p>
                  )}
                </form>
              </div>

              {/* Instant Unlock Option for Testing / Agents */}
              <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleInstantUnlock}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition active:scale-95 cursor-pointer"
                  title="Simulate / Quick Unlock Contact Line"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Quick / Demo Contact Unlock (Free Test)</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-stone-500 hover:text-stone-800 font-medium py-1"
                >
                  Close & Browse Other Services
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
