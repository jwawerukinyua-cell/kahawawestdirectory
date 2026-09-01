import React, { useState, useEffect } from 'react';
import {
  Download,
  X,
  CheckCircle2,
  Share,
  PlusSquare,
  Sparkles,
  Smartphone,
  Copy,
  Check,
  MoreVertical,
  ExternalLink,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { generateBrandAltText } from '../../lib/seoAltUtils';

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
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [highlightStep, setHighlightStep] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    const isInApp = /fban|fbav|instagram|whatsapp|telegram|line|crios|gsa|wv/.test(userAgent);

    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);
    setIsInAppBrowser(isInApp);

    // Detect if already installed / running in standalone mode
    const isAppStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isAppStandalone);

    // Catch install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__kwestInstallPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handlePromptReady = () => {
      if (window.__kwestInstallPrompt) {
        setDeferredPrompt(window.__kwestInstallPrompt);
      }
    };

    const handleAppInstalled = () => {
      setInstallSuccess(true);
      setDeferredPrompt(null);
      window.__kwestInstallPrompt = null;
      setTimeout(() => {
        onClose();
      }, 1800);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('kwest_prompt_ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.__kwestInstallPrompt) {
      setDeferredPrompt(window.__kwestInstallPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('kwest_prompt_ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onClose]);

  if (!isOpen) return null;

  const hasNativePrompt = Boolean(deferredPrompt || (typeof window !== 'undefined' && window.__kwestInstallPrompt));

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
          }, 1800);
        }
      } catch (err) {
        console.error('Installation prompt error:', err);
      } finally {
        setDeferredPrompt(null);
        window.__kwestInstallPrompt = null;
        setIsInstalling(false);
      }
      return;
    }

    // If native prompt is not active, highlight instructions for user device
    setIsInstalling(false);
    setHighlightStep(true);
    setTimeout(() => setHighlightStep(false), 3000);
  };

  const handleCopyLink = () => {
    const url = window.location.origin || 'https://kahawawestdirectory.co.ke';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    } else {
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div
      id="install-app-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="install-app-modal-container"
        className="bg-[#160202] text-white w-full max-w-sm rounded-3xl border-2 border-amber-500/40 shadow-2xl shadow-black overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Official Web App</span>
          </div>
          <button
            id="install-modal-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-center">
          {/* Official App Logo */}
          <div className="flex flex-col items-center">
            <div className="relative my-1">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black border-2 border-amber-400 shadow-xl overflow-hidden flex items-center justify-center p-1.5">
                <picture>
                  <source srcSet="/kwest-logo.webp" type="image/webp" />
                  <img
                    src="/kwest-logo.png"
                    alt={generateBrandAltText('pwa-icon')}
                    title="Kahawa West Directory App Icon"
                    className="w-full h-full object-contain"
                    width="96"
                    height="96"
                    decoding="async"
                  />
                </picture>
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-emerald-100 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-400 shadow-md whitespace-nowrap">
                Official Logo
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black font-display text-white mt-2.5 tracking-tight">
              Kahawa West Directory
            </h3>
            <p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed max-w-[260px]">
              Fast, 1-tap home screen access with offline support &amp; emergency numbers.
            </p>
          </div>

          {/* Status / Instructions Area */}
          {installSuccess ? (
            <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-200 p-4 rounded-2xl text-center space-y-1.5 animate-in zoom-in-95">
              <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-400" />
              <p className="text-sm font-bold text-white">App Installed Successfully!</p>
              <p className="text-xs text-emerald-200">The KWEST icon is now on your home screen.</p>
            </div>
          ) : isStandalone ? (
            <div className="bg-emerald-950/70 border border-emerald-500/50 p-4 rounded-2xl text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
              <p className="text-xs font-bold text-emerald-200">App Active on Home Screen</p>
              <p className="text-[11px] text-stone-400">You are browsing via the installed KWEST app.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Native Prompt Available -> 1-Click Install Button */}
              {hasNativePrompt ? (
                <div className="space-y-2">
                  <button
                    id="install-this-app-btn"
                    onClick={handleInstallClick}
                    disabled={isInstalling}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:brightness-110 active:scale-[0.98] text-white font-black text-sm shadow-xl shadow-emerald-950/80 flex items-center justify-center gap-2 transition duration-150 disabled:opacity-75 cursor-pointer border border-emerald-400/40"
                  >
                    <Download className="w-5 h-5 text-emerald-100 animate-bounce" />
                    <span>{isInstalling ? 'Opening Installer...' : '⚡ 1-Click Install to Home Screen'}</span>
                  </button>
                  <p className="text-[10px] text-emerald-400 font-semibold">
                    ✓ Browser ready — Tap above to install immediately
                  </p>
                </div>
              ) : (
                /* Fallback Guidance Tailored for the Device / Browser */
                <div className="space-y-2.5 text-left">
                  {isInAppBrowser && (
                    <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-[11px] text-amber-200 flex items-start gap-2">
                      <ExternalLink className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        You are currently in an <strong>in-app browser</strong> (e.g. WhatsApp). Open in standard <strong>Chrome or Safari</strong> to install to your home screen.
                      </span>
                    </div>
                  )}

                  {isIOS ? (
                    <div className={`p-3 rounded-2xl bg-white/10 border transition-all ${highlightStep ? 'border-amber-400 ring-2 ring-amber-400/60 bg-amber-950/40' : 'border-white/10'}`}>
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-2">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>How to install on iPhone / iPad (Safari):</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-stone-200">
                        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 border border-white/5">
                          <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center text-[10px]">1</span>
                          <span className="flex-1">Tap the <strong>Share button [⎋]</strong> in Safari (bottom bar).</span>
                          <Share className="w-4 h-4 text-sky-400" />
                        </div>
                        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 border border-white/5">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-[10px]">2</span>
                          <span className="flex-1">Tap <strong>'Add to Home Screen'</strong>.</span>
                          <PlusSquare className="w-4 h-4 text-emerald-400" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-3 rounded-2xl bg-white/10 border transition-all ${highlightStep ? 'border-amber-400 ring-2 ring-amber-400/60 bg-amber-950/40' : 'border-white/10'}`}>
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-2">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>How to install on Android (Chrome / Edge / Samsung):</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-stone-200">
                        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 border border-white/5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px]">1</span>
                          <span className="flex-1">Tap the <strong>three dots (⋮)</strong> at top-right of your browser.</span>
                          <MoreVertical className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 border border-white/5">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-[10px]">2</span>
                          <span className="flex-1">Tap <strong>'Install app'</strong> or <strong>'Add to Home screen'</strong>.</span>
                          <Download className="w-4 h-4 text-emerald-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1-Tap Link Copy */}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer border border-amber-400/40"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Website Link Copied!' : 'Copy Link to Open in Chrome / Safari'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-black/30 flex items-center justify-between text-xs text-stone-400 shrink-0">
          <span className="text-[10px]">KWEST Directory PWA</span>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-300 hover:text-white font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
