import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  leftPrefix?: React.ReactNode;
  step?: number;
  showScrollbar?: boolean;
}

export const HorizontalScrollContainer: React.FC<HorizontalScrollContainerProps> = ({
  children,
  className = '',
  id,
  leftPrefix,
  step = 280,
  showScrollbar = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(maxScroll - el.scrollLeft > 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      checkScroll();
    });
    resizeObserver.observe(el);

    // Mouse wheel horizontal scroll handler
    const handleWheel = (e: WheelEvent) => {
      if (el.scrollWidth > el.clientWidth) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && e.deltaY !== 0) {
          e.preventDefault();
          el.scrollLeft += e.deltaY * 0.9;
          checkScroll();
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('scroll', checkScroll, { passive: true });

    window.addEventListener('resize', checkScroll);

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scrollByAmount = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: amount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 320);
    }
  };

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
    setHasMoved(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.3;
    if (Math.abs(walk) > 4) {
      setHasMoved(true);
    }
    el.scrollLeft = scrollLeftState - walk;
    checkScroll();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    setTimeout(() => {
      setHasMoved(false);
    }, 50);
  };

  return (
    <div className={`relative group/scroll flex items-center w-full ${className}`}>
      {leftPrefix && (
        <div className="flex-shrink-0 z-10 mr-1.5 flex items-center">
          {leftPrefix}
        </div>
      )}

      {/* Left Chevron Button */}
      <button
        type="button"
        onClick={() => scrollByAmount(-step)}
        aria-label="Scroll left"
        disabled={!canScrollLeft}
        className={`hidden sm:flex absolute left-0 z-20 w-8 h-8 -translate-x-1 items-center justify-center rounded-full bg-white/95 hover:bg-white text-stone-700 hover:text-stone-950 shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-stone-200 backdrop-blur-xs transition-all duration-200 cursor-pointer ${
          canScrollLeft
            ? 'opacity-100 scale-100 hover:scale-105 active:scale-95'
            : 'opacity-0 pointer-events-none scale-90'
        }`}
      >
        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
      </button>

      {/* Left gradient mask indicator when scrollable */}
      <div
        className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-stone-50/90 to-transparent z-10 transition-opacity duration-200 ${
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Main Scrollable Track */}
      <div
        id={id}
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onClickCapture={(e) => {
          if (hasMoved) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
        className={`flex items-center gap-2 overflow-x-auto w-full py-1 px-1 select-none scroll-smooth touch-pan-x cursor-grab active:cursor-grabbing ${
          showScrollbar
            ? 'scrollbar-thin scrollbar-thumb-stone-300 hover:scrollbar-thumb-stone-400 pb-2'
            : 'no-scrollbar'
        }`}
        style={{
          scrollbarWidth: showScrollbar ? 'thin' : 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>

      {/* Right gradient mask indicator when scrollable */}
      <div
        className={`pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-stone-50/90 to-transparent z-10 transition-opacity duration-200 ${
          canScrollRight ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Right Chevron Button */}
      <button
        type="button"
        onClick={() => scrollByAmount(step)}
        aria-label="Scroll right"
        disabled={!canScrollRight}
        className={`hidden sm:flex absolute right-0 z-20 w-8 h-8 translate-x-1 items-center justify-center rounded-full bg-white/95 hover:bg-white text-stone-700 hover:text-stone-950 shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-stone-200 backdrop-blur-xs transition-all duration-200 cursor-pointer ${
          canScrollRight
            ? 'opacity-100 scale-100 hover:scale-105 active:scale-95'
            : 'opacity-0 pointer-events-none scale-90'
        }`}
      >
        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
      </button>
    </div>
  );
};
