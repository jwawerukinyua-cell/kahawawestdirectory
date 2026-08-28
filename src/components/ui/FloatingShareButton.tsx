import React, { useState, useEffect, useRef } from 'react';
import { Share2, Check, Copy, MessageCircle, Twitter, Facebook, X } from 'lucide-react';

export const FloatingShareButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const shareTitle = 'KWEST | Kahawa West Business Directory';
  const shareText =
    'Discover verified local businesses, fundis, emergency contacts & shops in Kahawa West on KWEST (kahawawestdirectory.co.ke) 🚀';

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://kahawawestdirectory.co.ke';
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNativeShareOrToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // If on mobile and not expanded, first expand and open
    if (!isExpanded) {
      setIsExpanded(true);
    }

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
      {/* Side-Docked Container attached to the left edge (or responsive) */}
      <div
        ref={containerRef}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex items-center font-sans select-none"
      >
        {/* Share Options Popup Menu */}
        {isOpen && (
          <div
            className="fixed left-3 sm:left-4 top-1/2 -translate-y-1/2 w-72 bg-[#1A0101] text-stone-100 rounded-2xl shadow-2xl border border-emerald-500/50 p-4 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl z-50"
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
                onClick={() => {
                  setIsOpen(false);
                  setIsExpanded(false);
                }}
                className="w-6 h-6 rounded-md hover:bg-emerald-900/60 text-stone-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-stone-300 mb-3 leading-relaxed">
              Help neighbors &amp; local businesses in Kahawa West discover this verified community directory!
            </p>

            <div className="space-y-2">
              {/* WhatsApp Option */}
              <button
                onClick={handleWhatsAppShare}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs transition shadow-sm active:scale-98 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-slate-950" />
                  Share on WhatsApp
                </span>
                <span className="text-[10px] bg-black/20 text-slate-950 px-1.5 py-0.5 rounded font-mono font-bold">
                  Groups
                </span>
              </button>

              {/* Copy Link Option */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-semibold border border-emerald-800/40 transition active:scale-98 cursor-pointer"
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
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1D9BF0]/20 hover:bg-[#1D9BF0]/30 text-[#1D9BF0] border border-[#1D9BF0]/40 text-xs font-semibold transition cursor-pointer"
                >
                  <Twitter className="w-3.5 h-3.5" />
                  <span>X / Tweet</span>
                </button>

                <button
                  onClick={handleFacebookShare}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-[#1877F2] border border-[#1877F2]/40 text-xs font-semibold transition cursor-pointer"
                >
                  <Facebook className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Side Attached Tab Button (Image 3 Style: sleek half-pill attached flush to the screen edge) */}
        <button
          id="kwest-floating-share-btn"
          onClick={handleNativeShareOrToggle}
          onMouseEnter={() => setIsExpanded(true)}
          className={`group relative flex items-center bg-gradient-to-r from-[#1F0101] via-[#3B0202] to-[#4D0202] text-emerald-300 hover:text-white border-y-2 border-r-2 border-l-0 border-emerald-500/90 hover:border-[#25D366] rounded-r-2xl shadow-[4px_0_20px_rgba(0,140,81,0.35)] hover:shadow-[6px_0_25px_rgba(37,211,102,0.6)] transition-all duration-300 cursor-pointer active:scale-95 ${
            isExpanded ? 'pl-3 pr-3.5 py-2.5' : 'pl-2.5 pr-2.5 py-3'
          }`}
          title="Share Kahawa West Directory (KWEST)"
        >
          {/* Subtle green glow on border */}
          <span className="absolute -inset-0.5 rounded-r-2xl bg-emerald-500/30 blur-xs group-hover:bg-[#25D366]/60 transition-all duration-300 pointer-events-none" />

          <div className="relative flex items-center gap-2">
            {/* Share Icon in circular emerald container */}
            <div className="w-7 h-7 rounded-full bg-emerald-600/30 border border-emerald-500/60 flex items-center justify-center text-emerald-300 group-hover:text-white group-hover:bg-emerald-600 transition-all duration-300">
              <Share2 className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300" />
            </div>

            {/* Label - Only shown when clicked / expanded */}
            {isExpanded && (
              <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-200">
                <span className="text-xs font-black tracking-wide uppercase text-stone-100 group-hover:text-white whitespace-nowrap">
                  SHARE KWEST
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 group-hover:bg-[#25D366] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 group-hover:bg-[#25D366] transition-colors duration-300"></span>
                </span>
              </div>
            )}
          </div>
        </button>
      </div>
    </>
  );
};
