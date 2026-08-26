import React, { useState } from 'react';
import { Share2, Check, Copy, MessageCircle, Twitter, Facebook, X, Sparkles } from 'lucide-react';

export const FloatingShareButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareTitle = 'KWEST | Kahawa West Business Directory';
  const shareText =
    'Discover verified local businesses, fundis, emergency contacts & shops in Kahawa West on KWEST (kahawawestdirectory.co.ke) 🚀';
  
  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://kwestdirectory.co.ke';
  };

  const handleNativeShareOrToggle = async () => {
    const url = getShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: url,
        });
        return;
      } catch (err) {
        // If user cancelled or not supported, fall back to opening the quick menu
        if ((err as Error).name !== 'AbortError') {
          setIsOpen(true);
        }
      }
    } else {
      setIsOpen((prev) => !prev);
    }
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleWhatsAppShare = () => {
    const url = getShareUrl();
    const message = encodeURIComponent(`${shareText}\n\nExplore or list your business: ${url}`);
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleTwitterShare = () => {
    const url = getShareUrl();
    const text = encodeURIComponent(shareText);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleFacebookShare = () => {
    const url = getShareUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Container */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2 font-sans">
        {/* Share Options Popup Menu */}
        {isOpen && (
          <div
            className="w-72 bg-[#1A0101] text-stone-100 rounded-2xl shadow-2xl border border-emerald-500/40 p-4 animate-in fade-in slide-in-from-bottom-3 duration-200 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/50 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-none">Share KWEST</h4>
                  <span className="text-[10px] text-emerald-400">kahawawestdirectory.co.ke</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-md hover:bg-emerald-900/60 text-stone-400 hover:text-white flex items-center justify-center transition"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-stone-300 mb-3 leading-relaxed">
              Help neighbors & local businesses in Kahawa West discover this verified community directory!
            </p>

            <div className="space-y-2">
              {/* WhatsApp Option */}
              <button
                onClick={handleWhatsAppShare}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs transition shadow-sm active:scale-98"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-slate-950" />
                  Share on WhatsApp
                </span>
                <span className="text-[10px] bg-black/20 text-slate-950 px-1.5 py-0.5 rounded font-mono font-bold">Groups</span>
              </button>

              {/* Copy Link Option */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-semibold border border-emerald-800/40 transition active:scale-98"
              >
                <span className="flex items-center gap-2">
                  {copied ? <Check className="w-4 h-4 text-[#25D366]" /> : <Copy className="w-4 h-4 text-stone-400" />}
                  <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Directory Link'}</span>
                </span>
                {copied && <span className="text-[10px] text-[#25D366] font-bold">Done!</span>}
              </button>

              {/* Social Channels Row */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleTwitterShare}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1D9BF0]/20 hover:bg-[#1D9BF0]/30 text-[#1D9BF0] border border-[#1D9BF0]/40 text-xs font-semibold transition"
                >
                  <Twitter className="w-3.5 h-3.5" />
                  <span>X / Tweet</span>
                </button>

                <button
                  onClick={handleFacebookShare}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-[#1877F2] border border-[#1877F2]/40 text-xs font-semibold transition"
                >
                  <Facebook className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Trigger Button */}
        <button
          id="kwest-floating-share-btn"
          onClick={handleNativeShareOrToggle}
          className="group relative flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-[#1F0101] via-[#3B0202] to-[#4D0202] text-emerald-300 hover:text-white border-2 border-emerald-500/90 hover:border-[#25D366] shadow-[0_8px_25px_rgba(0,140,81,0.35)] hover:shadow-[0_10px_32px_rgba(37,211,102,0.6)] transition-all duration-300 active:scale-95"
          title="Share Kahawa West Directory (KWEST)"
        >
          {/* Glowing ring effect: Our brand emerald green normally, transitions to WhatsApp green glow on hover */}
          <span className="absolute -inset-0.5 rounded-full bg-emerald-500/40 blur-xs group-hover:bg-[#25D366]/70 transition-all duration-300 pointer-events-none" />

          <div className="relative flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-emerald-400 group-hover:text-[#25D366] group-hover:rotate-12 transition-all duration-300" />
            <span className="text-xs font-black tracking-wide uppercase text-stone-100 group-hover:text-white transition-colors duration-200">
              Share KWEST
            </span>
          </div>

          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 group-hover:bg-[#25D366] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 group-hover:bg-[#25D366] transition-colors duration-300"></span>
          </span>
        </button>
      </div>
    </>
  );
};
