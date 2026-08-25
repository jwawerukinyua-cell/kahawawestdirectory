import React, { useState } from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  theme = 'dark',
}) => {
  const [imgError, setImgError] = useState(false);

  const iconDimensions = {
    sm: { width: 40, height: 40 },
    md: { width: 50, height: 50 },
    lg: { width: 68, height: 68 },
    xl: { width: 90, height: 90 },
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon / Logo: loads /kwest-icon.png or /kwest-logo.png */}
      <div
        className="relative rounded-2xl flex items-center justify-center overflow-hidden border border-emerald-500/40 shadow-md flex-shrink-0 bg-[#1C0E07]"
        style={{
          width: `${iconDimensions.width}px`,
          height: `${iconDimensions.height}px`,
        }}
      >
        {!imgError ? (
          <img
            src="/kwest-icon.png"
            alt="Kahawa West Directory"
            className="w-full h-full object-cover"
            onError={() => {
              // Try kwest-logo.png or logo.png fallback
              setImgError(true);
            }}
          />
        ) : (
          <img
            src="/kwest-logo.png"
            alt="Kahawa West Directory"
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback to SVG if none loaded
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Brand Text: Prominent 'Kahawa West' and 'kwestdirectory.co.ke' */}
      {showText && (
        <div className="flex flex-col justify-center leading-tight">
          <span
            className={`font-display font-black tracking-tight transition text-lg sm:text-xl md:text-2xl ${
              theme === 'dark' ? 'text-white' : 'text-[#24140E]'
            }`}
          >
            Kahawa West
          </span>
          <span className="text-xs sm:text-[13px] font-sans text-sky-400 font-semibold tracking-tight">
            kwestdirectory.co.ke
          </span>
        </div>
      )}
    </div>
  );
};

