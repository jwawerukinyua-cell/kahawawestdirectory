import React, { useState, useEffect } from 'react';
import { Download, X, CheckCircle2, Share, PlusSquare, Sparkles, MoreVertical, Copy, Check, ExternalLink } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    __kwestInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    typeof window !== 'undefined' ? window.__kwestInstallPrompt || null : null
  );
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Detect if already installed / running in standalone mode
    const isAppStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isAppStandalone);

    // Catch install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__kwestInstallPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleAppInstalled = () => {
      setInstallSuccess(true);
      setDeferredPrompt(null);
      window.__kwestInstallPrompt = null;
      setTimeout(() => {
        onClose();
      }, 1500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.__kwestInstallPrompt) {
      setDeferredPrompt(window.__kwestInstallPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onClose]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setIsInstalling(true);

    const activePrompt = deferredPrompt || window.__kwestInstallPrompt;

    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const { outcome } = await activePrompt.userChoice;
        if (outcome === 'accepted') {
          setInstallSuccess(true);
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } catch (err) {
        console.error('Installation prompt error:', err);
        setShowInstructions(true);
      } finally {
        setDeferredPrompt(null);
        window.__kwestInstallPrompt = null;
        setIsInstalling(false);
      }
      return;
    }

    // Fallback: If native prompt isn't fired (e.g. Chrome mobile, Safari, Samsung Internet, or iframe)
    setIsInstalling(false);
    setShowInstructions(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.origin || 'https://kahawawestdirectory.co.ke');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      id="install-app-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="install-app-modal-container"
        className="bg-[#180101] text-white w-full max-w-sm rounded-3xl border border-emerald-500/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>KWEST Web App</span>
          </div>
          <button
            id="install-modal-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Official Logo & App Identity */}
        <div className="px-6 pt-2 pb-3 text-center flex flex-col items-center">
          <div className="relative my-2">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-black border-2 border-amber-400/60 shadow-xl overflow-hidden flex items-center justify-center p-1">
              <picture>
                <source srcSet="/kwest-logo.webp" type="image/webp" />
                <img
                  src="/kwest-logo.png"
                  alt="Official KWEST Logo"
                  className="w-full h-full object-contain"
                  width="112"
                  height="112"
                  decoding="async"
                />
              </picture>
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-700 text-emerald-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/50 shadow-sm whitespace-nowrap">
              Official App
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold font-display text-white mt-3">
            Kahawa West Directory
          </h3>
          <p className="text-xs text-stone-300 mt-1 max-w-[240px] leading-relaxed">
            Install to your home screen for quick, 1-tap access to all verified local businesses & contacts.
          </p>
        </div>

        {/* Main Action Area */}
        <div className="px-6 pb-6 space-y-3">
          {installSuccess ? (
            <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-200 p-4 rounded-2xl text-center space-y-1 animate-in zoom-in-95">
              <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
              <p className="text-sm font-bold">KWEST Installed Successfully!</p>
              <p className="text-xs text-stone-300">Open it anytime directly from your phone's home screen.</p>
            </div>
          ) : isStandalone ? (
            <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-2xl text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
              <p className="text-xs font-bold text-emerald-200">App Already Installed</p>
              <p className="text-[11px] text-stone-400">You are browsing via the installed KWEST app.</p>
            </div>
          ) : showInstructions ? (
            <div className="bg-white/10 rounded-2xl p-3.5 border border-amber-400/30 text-left text-xs text-stone-200 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase tracking-wide">
                <span>How to Add to Home Screen:</span>
              </div>

              {isIOS ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 bg-black/40 p-2 rounded-xl border border-white/10">
                    <Share className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                    <span><strong>1.</strong> Tap the <strong>Share button</strong> in Safari (at bottom of screen).</span>
                  </div>
                  <div className="flex items-start gap-2 bg-black/40 p-2 rounded-xl border border-white/10">
                    <PlusSquare className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>2.</strong> Scroll down and select <strong>'Add to Home Screen'</strong>.</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 bg-black/40 p-2 rounded-xl border border-white/10">
                    <MoreVertical className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span><strong>1.</strong> Tap the <strong>three dots (⋮)</strong> menu in your browser's top-right corner.</span>
                  </div>
                  <div className="flex items-start gap-2 bg-black/40 p-2 rounded-xl border border-white/10">
                    <Download className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>2.</strong> Tap <strong>'Install app'</strong> or <strong>'Add to Home screen'</strong>.</span>
                  </div>
                </div>
              )}

              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-stone-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Web Link'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition active:scale-95"
                >
                  Got It
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Primary Direct Install Button */}
              <button
                id="install-this-app-btn"
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-emerald-950/70 flex items-center justify-center gap-2.5 transition duration-150 disabled:opacity-75 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isInstalling ? 'Opening Installer...' : 'Install This App'}</span>
              </button>

              {/* Cancel Button */}
              <button
                id="install-modal-cancel-btn"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-stone-400 hover:text-white text-xs font-medium transition active:scale-95"
              >
                Cancel / Not Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
