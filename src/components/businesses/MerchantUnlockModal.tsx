import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, CheckCircle2, AlertCircle, X, MessageSquare, Sparkles, UserCheck } from 'lucide-react';
import { Business } from '../../types';
import { verifyMerchantPin, registerMerchantAccount } from '../../lib/merchantAuth';
import { Button } from '../ui/Button';

interface MerchantUnlockModalProps {
  business: Business;
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}

export const MerchantUnlockModal: React.FC<MerchantUnlockModalProps> = ({
  business,
  isOpen,
  onClose,
  onUnlocked,
}) => {
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.trim().length < 4) {
      setError('Please enter your 4-digit merchant security PIN.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    setTimeout(() => {
      const result = verifyMerchantPin(business.id, pin, business.name, phone);
      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsVerifying(false);
          onUnlocked();
          onClose();
        }, 1000);
      } else {
        setIsVerifying(false);
        setError(result.message || 'Incorrect PIN. Try again or contact KWEST Editorial.');
      }
    }, 400);
  };

  const handleAdminBypass = () => {
    setPin('1234');
  };

  const isUkweliTest =
    business.id.includes('furniture') ||
    business.name.toLowerCase().includes('ukweli') ||
    business.name.toLowerCase().includes('furniture');

  return (
    <div
      id="merchant-unlock-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="merchant-unlock-card"
        className="w-full max-w-md bg-stone-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-stone-100 relative animate-scaleUp"
      >
        {/* Close Button */}
        <button
          id="close-merchant-unlock-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-b from-stone-800/80 to-stone-900 border-b border-stone-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Merchant Mode</span>
              <h3 className="text-base font-bold text-white leading-snug">Owner & Manager Verification</h3>
            </div>
          </div>
          <p className="text-xs text-stone-400">
            Enter the 4-Digit Security PIN you created when listing or claiming{' '}
            <span className="text-stone-200 font-semibold">{business.name}</span> to unlock your live stats, update information, and manage ad campaigns.
          </p>
        </div>

        {/* Body Form */}
        <form onSubmit={handlePinSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Access verified! Unlocking merchant dashboard...</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              4-Digit Security PIN <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="merchant-pin-input"
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="• • • •"
                className="w-full bg-stone-950 border border-stone-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl pl-10 pr-4 py-3 text-center text-xl tracking-[0.3em] font-mono text-white placeholder-stone-600 outline-none transition"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-between mt-1.5 text-[11px] text-stone-400">
              <span>M-Pesa style 4-digit code</span>
              {isUkweliTest && (
                <button
                  type="button"
                  onClick={handleAdminBypass}
                  className="text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
                >
                  Use test PIN: 1234
                </button>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button
              id="submit-merchant-pin-btn"
              type="submit"
              variant="primary"
              className="w-full justify-center py-2.5 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 border-0"
              disabled={isVerifying || isSuccess}
            >
              {isVerifying ? 'Verifying PIN...' : isSuccess ? 'Unlocked ✓' : 'Unlock Merchant Dashboard'}
            </Button>
          </div>

          {/* Help Footer */}
          <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant device session saved</span>
            </div>
            <a
              href={`https://wa.me/254712345678?text=${encodeURIComponent(
                `Hello KWEST Admin, I need a PIN reset/assistance for my listed business: ${business.name} (ID: ${business.id})`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline flex items-center gap-1 font-medium"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Forgot PIN?</span>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};
