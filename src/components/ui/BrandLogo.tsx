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
      {/* Brand Icon / Logo */}
      <div
        className="relative rounded-2xl flex items-center justify-center overflow-hidden border border-emerald-500/40 shadow-md flex-shrink-0 bg-[#4A0202]"
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
              setImgError(true);
            }}
          />
        ) : (
          <img
            src="/kwest-logo.png"
            alt="Kahawa West Directory"
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Brand Text: Prominent 'Kahawa West' and 'Official Kahawa West Business Directory' */}
      {showText && (
        <div className="flex flex-col justify-center leading-tight">
          <span
            className={`font-display font-black tracking-tight transition text-lg sm:text-xl md:text-2xl ${
              theme === 'dark' ? 'text-white' : 'text-[#630303]'
            }`}
          >
            Kahawa West
          </span>
          <span className="hidden lg:block text-[11px] sm:text-xs font-sans text-rose-200/90 font-medium tracking-tight">
            Official Kahawa West Business Directory
          </span>
        </div>
      )}
    </div>
  );
};
