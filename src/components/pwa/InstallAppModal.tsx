import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle2, Share, PlusSquare, ArrowUpRight, Sparkles } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if already installed / standalone
    const isAppStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isAppStandalone);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div
      id="install-app-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="install-app-modal-container"
        className="bg-[#2D0202] text-white w-full max-w-md rounded-2xl border border-emerald-500/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#4A0202] to-[#630303] px-5 py-4 flex items-center justify-between border-b border-emerald-500/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="font-display font-bold text-sm text-white tracking-wide uppercase">
              Install KWEST App
            </span>
          </div>
          <button
            id="install-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-stone-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* App Icon / Logo Showcase */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative group">
              {/* Glowing ring around logo */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-300" />
              
              <div className="relative w-24 h-24 rounded-2xl bg-[#4A0202] border-2 border-emerald-400/80 shadow-xl overflow-hidden flex items-center justify-center p-1.5">
                <img
                  src="/kwest-icon.png"
                  alt="Kahawa West Directory Logo"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/kwest-logo.png';
                  }}
                />
              </div>

              {/* Verified badge pill */}
              <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md border border-emerald-400 whitespace-nowrap">
                Official KWEST Logo
              </span>
            </div>

            <div className="pt-2">
              <h3 className="text-xl font-bold font-display text-white tracking-tight">
                Kahawa West Directory
              </h3>
              <p className="text-xs text-stone-300 mt-1 max-w-xs leading-relaxed">
                Save directly to your phone’s Home Screen for fast 1-tap access to 50+ verified businesses, fundis, and emergency services.
              </p>
            </div>
          </div>

          {/* Home Screen Preview Badge */}
          <div className="bg-black/40 rounded-xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A0202] border border-emerald-500/50 p-1 flex-shrink-0 flex items-center justify-center">
              <img
                src="/kwest-icon.png"
                alt="KWEST Home Screen Icon"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="text-xs font-bold text-emerald-300 truncate">KWEST App Icon</div>
              <div className="text-[11px] text-stone-400">Displays on Home Screen & App Drawer</div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>

          {/* Action / Instructions according to Platform */}
          {installSuccess ? (
            <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-200 p-4 rounded-xl text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
              <p className="text-sm font-bold">KWEST is installed!</p>
              <p className="text-xs text-stone-300">The Kwest logo is now on your Home Screen.</p>
            </div>
          ) : isStandalone ? (
            <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-xl text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
              <p className="text-xs font-bold text-emerald-200">Already Running as Installed App</p>
              <p className="text-[11px] text-stone-400">You are accessing Kahawa West Directory with the official Kwest logo.</p>
            </div>
          ) : deferredPrompt ? (
            <div className="space-y-3">
              <button
                id="install-native-prompt-btn"
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Download className="w-4 h-4" />
                <span>Add KWEST to Home Screen</span>
              </button>
              <p className="text-[11px] text-center text-stone-400">
                1-click install • Instant offline directory loading
              </p>
            </div>
          ) : isIOS ? (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>How to Install on iPhone / iPad (Safari)</span>
              </div>
              <ol className="space-y-2.5 text-xs text-stone-300">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-sky-300 mx-1" /> at the bottom or top of Safari.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Scroll down and select <strong>'Add to Home Screen'</strong> <PlusSquare className="w-3.5 h-3.5 inline text-emerald-300 mx-1" />.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Tap <strong>'Add'</strong> in the top right. The <strong>KWEST Logo</strong> will appear on your home screen!
                  </span>
                </li>
              </ol>
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2.5">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>Installation Instructions (Android / Chrome / Desktop)</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Tap the browser menu <strong className="text-white">(⋮ 3 dots)</strong> at the top right and select <strong className="text-emerald-300">'Install app'</strong> or <strong className="text-emerald-300">'Add to Home Screen'</strong>.
              </p>
              <div className="text-[11px] text-stone-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>The Kwest logo will be used automatically as the icon.</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Cancel & Close */}
        <div className="px-6 py-4 bg-black/40 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
          <span className="text-stone-400 text-[11px]">Official PWA • No App Store needed</span>
          <div className="flex items-center gap-2">
            <button
              id="install-modal-cancel-btn"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white font-semibold transition active:scale-95"
            >
              Cancel / Not Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
